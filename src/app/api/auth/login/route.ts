import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { generateToken, comparePassword } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'Credenciais inválidas ou conta desativada' }, { status: 401 })
    }

    const isValidPassword = await comparePassword(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    })

    const token = generateToken({ id: user.id, email: user.email })
    const { password: _, ...userWithoutPassword } = user

    const cookieStore = await cookies();
    
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400,
      path: '/',
    });

    cookieStore.set('user_data', JSON.stringify(userWithoutPassword), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400,
      path: '/',
    });

    return NextResponse.json({ 
      message: 'Login realizado com sucesso', 
      user: userWithoutPassword 
    }, { status: 200 })

  } catch (error) {
    console.error('Erro no login:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}