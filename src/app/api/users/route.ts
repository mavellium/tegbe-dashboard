/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    // 1. ADICIONADO forcePasswordChange AQUI
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, isActive: true, companyId: true, company: true, forcePasswordChange: true, lastLogin: true, createdAt: true },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // 2. ADICIONADO forcePasswordChange NO CORPO
    const { name, email, password, role, companyId, isActive, forcePasswordChange } = await req.json();
    
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Nome, e-mail e senha são obrigatórios" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 400 });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "USER",
        companyId: companyId || null,
        isActive: isActive !== undefined ? isActive : true,
        forcePasswordChange: forcePasswordChange || false // <--- SALVA NO BANCO
      },
      select: { id: true, name: true, email: true, role: true, companyId: true }
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}