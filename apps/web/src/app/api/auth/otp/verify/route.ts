import { NextResponse } from 'next/server'
import { z } from 'zod'

const VerifyOtpPayload = z.object({
  email: z.string().email(),
  otp: z.string().regex(/^\d{6}$/),
})

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = VerifyOtpPayload.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ message: 'Invalid request payload.' }, { status: 400 })
  }

  const verifyEndpoint = process.env.OTP_VERIFY_ENDPOINT

  if (!verifyEndpoint) {
    if (process.env.NODE_ENV !== 'production' && parsed.data.otp === '123456') {
      return NextResponse.json({ message: 'Verified (development mode).' }, { status: 200 })
    }

    return NextResponse.json(
      {
        message:
          'OTP verification service is not configured. Set OTP_VERIFY_ENDPOINT in Vercel environment variables.',
      },
      { status: 503 }
    )
  }

  try {
    const upstreamResponse = await fetch(verifyEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
      cache: 'no-store',
    })

    const data = await upstreamResponse.json().catch(() => null)

    return NextResponse.json(data ?? { message: 'OTP verification request completed.' }, {
      status: upstreamResponse.status,
    })
  } catch {
    return NextResponse.json(
      { message: 'Unable to reach OTP verification service. Please try again.' },
      { status: 502 }
    )
  }
}
