import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";

export async function POST(req: NextRequest) {
  try {
    const { nickname, password } = await req.json();

    if (!nickname || !password) {
      return NextResponse.json({ error: "Apodo y contraseña son requeridos" }, { status: 400 });
    }

    if (nickname.length < 2 || nickname.length > 20) {
      return NextResponse.json({ error: "El apodo debe tener entre 2 y 20 caracteres" }, { status: 400 });
    }

    if (password.length < 4) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 4 caracteres" }, { status: 400 });
    }

    await dbConnect();

    const existing = await User.findOne({ nickname });
    if (existing) {
      return NextResponse.json({ error: "Este apodo ya está en uso" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ nickname, passwordHash });

    return NextResponse.json({
      message: "Registro exitoso. Espera la aprobación del administrador.",
      userId: user._id,
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
