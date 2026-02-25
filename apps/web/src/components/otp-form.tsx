'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Loader2, Mail, AlertCircle } from "lucide-react"

export function OTPForm({ ...props }: React.ComponentProps<typeof Card>) {
  const router = useRouter()
  const [otp, setOtp] = useState('')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(600) // 10 minutes in seconds

  // Load email from session storage and check if expired
  useEffect(() => {
    const storedEmail = sessionStorage.getItem('verificationEmail')
    const signupTime = sessionStorage.getItem('signupTime')
    
    if (!storedEmail) {
      router.push('/signup')
      return
    }
    
    setEmail(storedEmail)

    // Calculate time remaining (10 minute expiry)
    if (signupTime) {
      const elapsed = Math.floor((Date.now() - parseInt(signupTime)) / 1000)
      const remaining = Math.max(600 - elapsed, 0)
      setTimeRemaining(remaining)
      
      if (remaining === 0) {
        setError('Verification code has expired. Please request a new one.')
      }
    }
  }, [router])

  // Countdown timer for OTP expiry
  useEffect(() => {
    if (timeRemaining <= 0) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setError('Verification code has expired. Please request a new one.')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining])

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return

    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(prev - 1, 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [resendCooldown])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const maskEmail = (email: string) => {
    const [username, domain] = email.split('@')
    if (!username || !domain) return email
    const maskedUsername = username[0] + '*'.repeat(username.length - 2) + username[username.length - 1]
    return `${maskedUsername}@${domain}`
  }

  const handleOtpChange = (value: string) => {
    setOtp(value)
    setError('')
    
    // Auto-submit when 6 digits are entered
    if (value.length === 6) {
      handleSubmit(value)
    }
  }

  const handleSubmit = async (otpValue?: string) => {
    const codeToVerify = otpValue || otp
    
    if (codeToVerify.length !== 6) {
      setError('Please enter a valid 6-digit code')
      return
    }

    if (timeRemaining <= 0) {
      setError('Verification code has expired. Please request a new one.')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      // TODO: Implement backend endpoint for email verification
      const response = await fetch(``, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          otp: parseInt(codeToVerify, 10)  // Convert to number
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setSuccess('Account verified successfully! Redirecting...')
        
        // Store auth token if provided
        if (data.token) {
          sessionStorage.setItem('authToken', data.token)
          // Or use: localStorage.setItem('authToken', data.token)
        }

        // Clear verification data
        sessionStorage.removeItem('verificationEmail')
        sessionStorage.removeItem('signupTime')
        
        // Redirect to dashboard or login
        setTimeout(() => {
          router.push('/dashboard') // or '/login' if they need to sign in
        }, 1500)
      } else {
        if (response.status === 400) {
          setError('Invalid verification code. Please try again.')
        } else if (response.status === 410) {
          setError('Verification code has expired. Please request a new one.')
        } else if (response.status === 404) {
          setError('Account not found. Please sign up again.')
        } else {
          setError(data.message || 'Verification failed. Please try again.')
        }
        setOtp('') // Clear OTP on error
      }
    } catch (error) {
      if (error instanceof TypeError) {
        setError('Network error. Please check your connection.')
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
      console.error('Verification error:', error)
      setOtp('')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return

    setIsResending(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setSuccess('Verification code sent! Check your email.')
        setResendCooldown(60) // 60 second cooldown
        setTimeRemaining(600) // Reset to 10 minutes
        sessionStorage.setItem('signupTime', Date.now().toString())
        setOtp('') // Clear current OTP
      } else {
        if (response.status === 429) {
          setError('Too many requests. Please wait before requesting again.')
          setResendCooldown(60)
        } else if (response.status === 404) {
          setError('Account not found. Please sign up again.')
        } else {
          setError(data.message || 'Failed to resend code. Please try again.')
        }
      }
    } catch (error) {
      if (error instanceof TypeError) {
        setError('Network error. Please check your connection.')
      } else {
        setError('Failed to resend code. Please try again.')
      }
      console.error('Resend error:', error)
    } finally {
      setIsResending(false)
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmit()
  }

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Enter verification code</CardTitle>
        <CardDescription>
          <div className="flex items-center gap-2">
            <Mail size={16} />
            <span>We sent a 6-digit code to {email && maskEmail(email)}</span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFormSubmit}>
          <fieldset disabled={isLoading || isResending}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="otp">Verification code</FieldLabel>
                <InputOTP 
                  maxLength={6} 
                  id="otp" 
                  value={otp}
                  onChange={handleOtpChange}
                  disabled={timeRemaining === 0}
                  required
                >
                  <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                
                {timeRemaining > 0 ? (
                  <FieldDescription>
                    Code expires in {formatTime(timeRemaining)}
                  </FieldDescription>
                ) : (
                  <FieldDescription className="text-red-500 flex items-center gap-1">
                    <AlertCircle size={14} />
                    Code has expired
                  </FieldDescription>
                )}
              </Field>

              {error && (
                <div className="text-sm text-red-600 p-3 bg-red-50 rounded-md border border-red-200 flex items-start gap-2" role="alert">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="text-sm text-green-700 p-3 bg-green-50 rounded-md border border-green-200" role="alert">
                  {success}
                </div>
              )}

              <FieldGroup>
                <Button 
                  type="submit" 
                  disabled={isLoading || otp.length !== 6 || timeRemaining === 0}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify'
                  )}
                </Button>
                
                <FieldDescription className="text-center">
                  Didn&apos;t receive the code?{' '}
                  <button 
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || isResending}
                    className="text-primary hover:underline font-medium disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
                  >
                    {isResending ? 'Sending...' : resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend'}
                  </button>
                </FieldDescription>

                <FieldDescription className="text-center text-xs">
                  <a href="/signup" className="text-gray-500 hover:text-gray-700 hover:underline">
                    Back to signup
                  </a>
                </FieldDescription>
              </FieldGroup>
            </FieldGroup>
          </fieldset>
        </form>
      </CardContent>
    </Card>
  )
}