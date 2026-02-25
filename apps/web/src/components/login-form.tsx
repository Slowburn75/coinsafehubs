'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { cn } from "@/lib/utils"
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
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react"
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoginSchema } from '@repo/types'
import { z } from 'zod'
import { orpc } from '@/lib/orpc'
import { useAuth } from '@/lib/AuthProvider'

type LoginFormValues = z.infer<typeof LoginSchema>

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const { refetch } = useAuth()
  const [errorMsg, setErrorMsg] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: '', password: '' }
  })

  const loginMutation = useMutation(orpc.auth.login.mutationOptions({
    onSuccess: async () => {
      await refetch()
      router.push('/dashboard')
    },
    onError: (error: any) => {
      setErrorMsg(error.message || 'Invalid email or password constraints')
    }
  }))

  const onSubmit = (data: LoginFormValues) => {
    setErrorMsg('')
    loginMutation.mutate(data)
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <fieldset disabled={loginMutation.isPending}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
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
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <a
                      href="/forgot-password"
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline text-primary"
                    >
                      Forgot your password?
                    </a>
                  </div>
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
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && (
                    <FieldDescription className="text-red-500">
                      {errors.password.message}
                    </FieldDescription>
                  )}
                </Field>

                {errorMsg && (
                  <div className="text-sm text-red-600 p-3 bg-red-50 rounded-md border border-red-200 flex items-start gap-2" role="alert">
                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <Field>
                  <Button type="submit" disabled={loginMutation.isPending} className="w-full">
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      'Login'
                    )}
                  </Button>
                  <Button variant="outline" type="button" disabled={loginMutation.isPending} className="w-full">
                    Login with Google
                  </Button>
                  <FieldDescription className="text-center">
                    Don&apos;t have an account?{' '}
                    <a href="/signup" className="text-primary hover:underline font-medium">
                      Sign up
                    </a>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </fieldset>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}