import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { teamUpdates, members } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const allUpdates = await db
      .select({
        id: teamUpdates.id,
        title: teamUpdates.title,
        content: teamUpdates.content,
        type: teamUpdates.type,
        memberId: teamUpdates.memberId,
        teamId: teamUpdates.teamId,
        isPinned: teamUpdates.isPinned,
        createdAt: teamUpdates.createdAt,
        memberName: members.name,
      })
      .from(teamUpdates)
      .leftJoin(members, eq(teamUpdates.memberId, members.id))
      .orderBy(desc(teamUpdates.createdAt));
    return NextResponse.json(allUpdates);
  } catch (error) {
    console.error("Error fetching team updates:", error);
    return NextResponse.json({ error: "Failed to fetch team updates" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, content, type, memberId, teamId, isPinned } = body;
    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }
    const [update] = await db
      .insert(teamUpdates)
      .values({
        title,
        content,
        type: type || "daily",
        memberId: memberId || null,
        teamId: teamId || null,
        isPinned: isPinned || false,
      })
      .returning();
    return NextResponse.json(update, { status: 201 });
  } catch (error) {
    console.error("Error creating team update:", error);
    return NextResponse.json({ error: "Failed to create team update" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, isPinned } = body;
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    const [updated] = await db
      .update(teamUpdates)
      .set({ isPinned })
      .where(eq(teamUpdates.id, id))
      .returning();
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating team update:", error);
    return NextResponse.json({ error: "Failed to update team update" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    await db.delete(teamUpdates).where(eq(teamUpdates.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting team update:", error);
    return NextResponse.json({ error: "Failed to delete team update" }, { status: 500 });
  }
}
