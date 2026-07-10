import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { taskUpdates, members, tasks } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get("taskId");

    let query = db
      .select({
        id: taskUpdates.id,
        taskId: taskUpdates.taskId,
        memberId: taskUpdates.memberId,
        note: taskUpdates.note,
        previousStatus: taskUpdates.previousStatus,
        newStatus: taskUpdates.newStatus,
        createdAt: taskUpdates.createdAt,
        memberName: members.name,
        taskTitle: tasks.title,
      })
      .from(taskUpdates)
      .leftJoin(members, eq(taskUpdates.memberId, members.id))
      .leftJoin(tasks, eq(taskUpdates.taskId, tasks.id))
      .orderBy(desc(taskUpdates.createdAt));

    if (taskId) {
      const results = await db
        .select({
          id: taskUpdates.id,
          taskId: taskUpdates.taskId,
          memberId: taskUpdates.memberId,
          note: taskUpdates.note,
          previousStatus: taskUpdates.previousStatus,
          newStatus: taskUpdates.newStatus,
          createdAt: taskUpdates.createdAt,
          memberName: members.name,
          taskTitle: tasks.title,
        })
        .from(taskUpdates)
        .leftJoin(members, eq(taskUpdates.memberId, members.id))
        .leftJoin(tasks, eq(taskUpdates.taskId, tasks.id))
        .where(eq(taskUpdates.taskId, parseInt(taskId)))
        .orderBy(desc(taskUpdates.createdAt));
      return NextResponse.json(results);
    }

    const results = await query;
    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching task updates:", error);
    return NextResponse.json({ error: "Failed to fetch task updates" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { taskId, memberId, note, previousStatus, newStatus } = body;
    if (!taskId || !note) {
      return NextResponse.json({ error: "Task ID and note are required" }, { status: 400 });
    }
    const [update] = await db
      .insert(taskUpdates)
      .values({
        taskId,
        memberId: memberId || null,
        note,
        previousStatus: previousStatus || null,
        newStatus: newStatus || null,
      })
      .returning();
    return NextResponse.json(update, { status: 201 });
  } catch (error) {
    console.error("Error creating task update:", error);
    return NextResponse.json({ error: "Failed to create task update" }, { status: 500 });
  }
}
