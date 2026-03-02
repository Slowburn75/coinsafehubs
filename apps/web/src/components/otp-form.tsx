'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { AlertCircle, Loader2, Mail } from 'lucide-react'

const OTP_EXPIRY_SECONDS = 10 * 60

export function OTPForm({ ...props }: React.ComponentProps<typeof Card>) {
  const router = useRouter()
  const [otp, setOtp] = useState('')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(OTP_EXPIRY_SECONDS)

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('verificationEmail')
    const signupTime = sessionStorage.getItem('signupTime')

    if (!storedEmail) {
      router.replace('/signup')
      return
    }

    setEmail(storedEmail)

    if (signupTime) {
      const elapsed = Math.floor((Date.now() - Number.parseInt(signupTime, 10)) / 1000)
      const remaining = Math.max(OTP_EXPIRY_SECONDS - elapsed, 0)
      setTimeRemaining(remaining)

      if (remaining === 0) {
        setError('Verification code has expired. Please request a new one.')
      }
    }
  }, [router])

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

  useEffect(() => {
    if (resendCooldown <= 0) return

    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(prev - 1, 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [resendCooldown])

  const formattedTime = useMemo(() => {
    const mins = Math.floor(timeRemaining / 60)
    const secs = timeRemaining % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [timeRemaining])

  const maskEmail = (rawEmail: string) => {
    const [username, domain] = rawEmail.split('@')
    if (!username || !domain) return rawEmail
    if (username.length <= 2) return `${username[0] ?? ''}*@${domain}`

    const maskedUsername =
      username[0] + '*'.repeat(username.length - 2) + username[username.length - 1]

    return `${maskedUsername}@${domain}`
  }

  const handleSubmit = async (otpValue?: string) => {
    const codeToVerify = otpValue ?? otp

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
      const response = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp: codeToVerify,
        }),
      })

      const data = (await response.json()) as { message?: string; token?: string }

      if (response.ok) {
        setSuccess('Account verified successfully! Redirecting to login...')
        if (data.token) {
          sessionStorage.setItem('authToken', data.token)
        }

        sessionStorage.removeItem('verificationEmail')
        sessionStorage.removeItem('signupTime')

        setTimeout(() => {
          router.push('/login')
        }, 1200)
      } else {
        setError(data.message || 'Verification failed. Please try again.')
        setOtp('')
      }
    } catch {
      setError('Network error. Please check your connection and try again.')
      setOtp('')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpChange = (value: string) => {
    setOtp(value)
    setError('')

    if (value.length === 6 && !isLoading) {
      handleSubmit(value)
    }
  }

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return

    setIsResending(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/auth/otp/resend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = (await response.json()) as { message?: string }

      if (response.ok) {
        setSuccess(data.message || 'Verification code sent. Check your inbox.')
        setResendCooldown(60)
        setTimeRemaining(OTP_EXPIRY_SECONDS)
        sessionStorage.setItem('signupTime', Date.now().toString())
        setOtp('')
      } else {
        setError(data.message || 'Failed to resend code. Please try again.')
      }
    } catch {
      setError('Network error. Please check your connection and try again.')
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
                  id="otp"
                  maxLength={6}
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
                  <FieldDescription>Code expires in {formattedTime}</FieldDescription>
                ) : (
                  <FieldDescription className="flex items-center gap-1 text-red-500">
                    <AlertCircle size={14} />
                    Code has expired
                  </FieldDescription>
                )}
              </Field>

              {error && (
                <div
                  className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600"
                  role="alert"
                >
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div
                  className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700"
                  role="alert"
                >
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
                    className="font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:text-gray-400 disabled:no-underline"
                  >
                    {isResending
                      ? 'Sending...'
                      : resendCooldown > 0
                        ? `Resend (${resendCooldown}s)`
                        : 'Resend'}
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
