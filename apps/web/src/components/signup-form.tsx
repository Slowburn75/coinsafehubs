'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
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
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { orpc } from '@/lib/orpc'

const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  passwordConfirm: z.string()
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Passwords don't match",
  path: ["passwordConfirm"],
})

type SignupFormValues = z.infer<typeof SignupSchema>

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const router = useRouter()
  const [errorMsg, setErrorMsg] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<SignupFormValues>({
    resolver: zodResolver(SignupSchema),
    defaultValues: { email: '', password: '', passwordConfirm: '' }
  })

  const passwordVal = watch('password')

  useEffect(() => {
    if (!passwordVal) {
      setPasswordStrength(0)
      return
    }
    let strength = 0
    if (passwordVal.length >= 8) strength++
    if (/[a-z]/.test(passwordVal)) strength++
    if (/[A-Z]/.test(passwordVal)) strength++
    if (/[0-9]/.test(passwordVal)) strength++
    if (/[!@#$%^&*(),.?":{}|<>]/.test(passwordVal)) strength++
    setPasswordStrength(strength)
  }, [passwordVal])

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-500'
    if (passwordStrength <= 3) return 'bg-yellow-500'
    if (passwordStrength <= 4) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return ''
    if (passwordStrength <= 2) return 'Weak'
    if (passwordStrength <= 3) return 'Fair'
    if (passwordStrength <= 4) return 'Good'
    return 'Strong'
  }

  const registerMutation = useMutation(orpc.auth.register.mutationOptions({
    onSuccess: async (_result, variables) => {
      sessionStorage.setItem('verificationEmail', variables.email)
      sessionStorage.setItem('signupTime', Date.now().toString())
      setSuccess('Account created! Verify your email to continue...')
      setTimeout(() => {
        router.push('/otp')
      }, 1000)
    },
    onError: (error: any) => {
      setErrorMsg(error.message || 'Signup failed. Please try again.')
    }
  }))

  const onSubmit = (data: SignupFormValues) => {
    setErrorMsg('')
    registerMutation.mutate({ email: data.email, password: data.password })
  }

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <fieldset disabled={registerMutation.isPending} className="space-y-4">
            <FieldGroup>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="matthew@gmail.com"
                  aria-invalid={!!errors.email}
                  {...register('email')}
                />
                {errors.email && (
                  <FieldDescription className="text-red-500">
                    {errors.email.message}
                  </FieldDescription>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    aria-invalid={!!errors.password}
                    className="pr-10"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordVal && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded ${i < passwordStrength ? getPasswordStrengthColor() : 'bg-gray-200'
                            }`}
                        />
                      ))}
                    </div>
                    <FieldDescription className={passwordStrength <= 2 ? 'text-red-500' : ''}>
                      Password strength: {getPasswordStrengthText()}
                    </FieldDescription>
                  </div>
                )}
                {errors.password && (
                  <FieldDescription className="text-red-500">
                    {errors.password.message}
                  </FieldDescription>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="passwordConfirm">Confirm Password</FieldLabel>
                <div className="relative">
                  <Input
                    id="passwordConfirm"
                    type={showPassword ? "text" : "password"}
                    aria-invalid={!!errors.passwordConfirm}
                    className="pr-10"
                    {...register('passwordConfirm')}
                  />
                </div>
                {errors.passwordConfirm && (
                  <FieldDescription className="text-red-500">
                    {errors.passwordConfirm.message as string}
                  </FieldDescription>
                )}
              </Field>

              {errorMsg && (
                <div className="text-sm text-red-600 p-3 bg-red-50 rounded-md border border-red-200" role="alert">
                  {errorMsg}
                </div>
              )}

              {success && (
                <div className="text-sm text-green-700 p-3 bg-green-50 rounded-md border border-green-200" role="alert">
                  {success}
                </div>
              )}

              <FieldGroup>
                <Field>
                  <Button type="submit" disabled={registerMutation.isPending} className="w-full">
                    {registerMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                  <Button variant="outline" type="button" disabled={registerMutation.isPending} className="w-full">
                    Sign up with Google
                  </Button>
                  <FieldDescription className="px-6 text-center">
                    Already have an account?{' '}
                    <a href="/login" className="text-primary hover:underline font-medium">
                      Sign in
                    </a>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </FieldGroup>
          </fieldset>
        </form>
      </CardContent>
    </Card>
  )
}