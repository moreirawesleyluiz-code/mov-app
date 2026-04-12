import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos. Verifique nome, e-mail e senha (mín. 8 caracteres)." },
        { status: 400 },
      );
    }
    const { name, email, password } = parsed.data;
    const normalized = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({
      where: { email: normalized },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Este e-mail já está cadastrado." },
        { status: 409 },
      );
    }
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalized,
        passwordHash,
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível criar a conta. Tente novamente." },
      { status: 500 },
    );
  }
}
