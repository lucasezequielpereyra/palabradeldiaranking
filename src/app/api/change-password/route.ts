import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { newPassword } = await req.json();

    if (!newPassword || newPassword.length < 4) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 4 caracteres" },
        { status: 400 }
      );
    }

    await dbConnect();
    const passwordHash = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(session.user.id, {
      passwordHash,
      mustChangePassword: false,
    });

    return NextResponse.json({ message: "Contraseña actualizada correctamente" });
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
