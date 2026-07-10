import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { meetings, meetingAttendees, members } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const allMeetings = await db
      .select({
        id: meetings.id,
        title: meetings.title,
        description: meetings.description,
        agenda: meetings.agenda,
        scheduledAt: meetings.scheduledAt,
        durationMinutes: meetings.durationMinutes,
        location: meetings.location,
        meetingLink: meetings.meetingLink,
        status: meetings.status,
        teamId: meetings.teamId,
        organizerId: meetings.organizerId,
        notes: meetings.notes,
        createdAt: meetings.createdAt,
        organizerName: members.name,
      })
      .from(meetings)
      .leftJoin(members, eq(meetings.organizerId, members.id))
      .orderBy(desc(meetings.scheduledAt));
    return NextResponse.json(allMeetings);
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return NextResponse.json({ error: "Failed to fetch meetings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      description,
      agenda,
      scheduledAt,
      durationMinutes,
      location,
      meetingLink,
      teamId,
      organizerId,
      attendeeIds,
    } = body;

    if (!title || !scheduledAt) {
      return NextResponse.json({ error: "Title and scheduled time are required" }, { status: 400 });
    }

    const [meeting] = await db
      .insert(meetings)
      .values({
        title,
        description,
        agenda,
        scheduledAt: new Date(scheduledAt),
        durationMinutes: durationMinutes || 60,
        location,
        meetingLink,
        teamId: teamId || null,
        organizerId: organizerId || null,
        status: "scheduled",
      })
      .returning();

    if (attendeeIds && attendeeIds.length > 0) {
      await db.insert(meetingAttendees).values(
        attendeeIds.map((memberId: number) => ({
          meetingId: meeting.id,
          memberId,
        }))
      );
    }

    return NextResponse.json(meeting, { status: 201 });
  } catch (error) {
    console.error("Error creating meeting:", error);
    return NextResponse.json({ error: "Failed to create meeting" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, notes, ...rest } = body;
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (rest.title) updateData.title = rest.title;
    if (rest.description !== undefined) updateData.description = rest.description;
    if (rest.agenda !== undefined) updateData.agenda = rest.agenda;
    if (rest.scheduledAt) updateData.scheduledAt = new Date(rest.scheduledAt);
    if (rest.durationMinutes) updateData.durationMinutes = rest.durationMinutes;
    if (rest.location !== undefined) updateData.location = rest.location;
    if (rest.meetingLink !== undefined) updateData.meetingLink = rest.meetingLink;

    const [updated] = await db
      .update(meetings)
      .set(updateData)
      .where(eq(meetings.id, id))
      .returning();
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating meeting:", error);
    return NextResponse.json({ error: "Failed to update meeting" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    await db.delete(meetings).where(eq(meetings.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting meeting:", error);
    return NextResponse.json({ error: "Failed to delete meeting" }, { status: 500 });
  }
}
