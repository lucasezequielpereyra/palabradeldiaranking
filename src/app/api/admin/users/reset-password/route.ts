import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";

const DEFAULT_PASSWORD = "1234";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    await dbConnect();
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "userId requerido" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    const user = await User.findByIdAndUpdate(
      userId,
      { passwordHash, mustChangePassword: true },
      { new: true }
    ).select("-passwordHash");

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ message: "Contraseña reseteada correctamente" });
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
