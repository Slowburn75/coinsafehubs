import { NextResponse } from 'next/server'
import { z } from 'zod'

const ResendOtpPayload = z.object({
  email: z.string().email(),
})

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = ResendOtpPayload.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ message: 'Invalid request payload.' }, { status: 400 })
  }

  const resendEndpoint = process.env.OTP_RESEND_ENDPOINT

  if (!resendEndpoint) {
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json(
        { message: 'Verification code sent (development mode).' },
        { status: 200 }
      )
    }

    return NextResponse.json(
      {
        message:
          'OTP resend service is not configured. Set OTP_RESEND_ENDPOINT in Vercel environment variables.',
      },
      { status: 503 }
    )
  }

  try {
    const upstreamResponse = await fetch(resendEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
      cache: 'no-store',
    })

    const data = await upstreamResponse.json().catch(() => null)

    return NextResponse.json(data ?? { message: 'Verification code sent.' }, {
      status: upstreamResponse.status,
    })
  } catch {
    return NextResponse.json(
      { message: 'Unable to reach OTP service. Please try again.' },
      { status: 502 }
    )
  }
}
