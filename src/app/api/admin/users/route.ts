import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    await dbConnect();
    const users = await User.find({})
      .select("-passwordHash")
      .sort({ createdAt: -1 });

    return NextResponse.json(users);
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    await dbConnect();
    const { userId, isApproved, isAdmin } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "userId requerido" }, { status: 400 });
    }

    const update: Record<string, unknown> = {};
    if (typeof isApproved === "boolean") update.isApproved = isApproved;
    if (typeof isAdmin === "boolean") update.isAdmin = isAdmin;

    const user = await User.findByIdAndUpdate(userId, update, { new: true }).select("-passwordHash");
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
