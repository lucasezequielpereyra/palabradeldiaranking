import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await dbConnect();

    await User.findByIdAndUpdate(session.user.id, { acceptedNewMode: true });

    return NextResponse.json({ message: "Modo aceptado" });
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
