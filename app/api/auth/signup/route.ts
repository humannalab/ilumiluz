import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, validatePasswordStrength } from '@/lib/password'
import { logAudit } from '@/lib/audit'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const name = (body?.name as string | undefined)?.trim()
  const email = (body?.email as string | undefined)?.trim().toLowerCase()
  const password = body?.password as string | undefined

  if (!email || !password) {
    return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 })
  }

  const passError = validatePasswordStrength(password)
  if (passError) {
    return NextResponse.json({ error: passError }, { status: 422 })
  }

  const existing = await db.user.findUnique({ where: { email }, select: { id: true } })
  if (existing) {
    // Não revelamos se o email existe — mensagem genérica
    return NextResponse.json(
      { error: 'Não foi possível criar a conta. Verifique os dados ou tente entrar.' },
      { status: 409 }
    )
  }

  const passwordHash = await hashPassword(password)
  const user = await db.user.create({
    data: { name: name || null, email, passwordHash },
    select: { id: true, email: true },
  })

  const ipAddress =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    undefined
  const userAgent = req.headers.get('user-agent') ?? undefined

  await logAudit({
    action: 'auth.signup',
    userId: user.id,
    ipAddress,
    userAgent,
    metadata: { source: 'credentials' },
  })

  return NextResponse.json({ ok: true }, { status: 201 })
}
