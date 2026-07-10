import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { members } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const allMembers = await db.select().from(members).orderBy(members.createdAt);
    return NextResponse.json(allMembers);
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, role, teamId } = body;
    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }
    const [member] = await db
      .insert(members)
      .values({ name, email, role: role || "member", teamId: teamId || null })
      .returning();
    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error("Error creating member:", error);
    return NextResponse.json({ error: "Failed to create member" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    await db.delete(members).where(eq(members.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting member:", error);
    return NextResponse.json({ error: "Failed to delete member" }, { status: 500 });
  }
}
