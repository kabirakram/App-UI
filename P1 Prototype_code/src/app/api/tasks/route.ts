import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tasks, members } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const allTasks = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        priority: tasks.priority,
        assigneeId: tasks.assigneeId,
        teamId: tasks.teamId,
        dueDate: tasks.dueDate,
        completedAt: tasks.completedAt,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
        assigneeName: members.name,
      })
      .from(tasks)
      .leftJoin(members, eq(tasks.assigneeId, members.id))
      .orderBy(desc(tasks.createdAt));
    return NextResponse.json(allTasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, status, priority, assigneeId, teamId, dueDate } = body;
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    const [task] = await db
      .insert(tasks)
      .values({
        title,
        description,
        status: status || "pending",
        priority: priority || "medium",
        assigneeId: assigneeId || null,
        teamId: teamId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
      })
      .returning();
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updateFields } = body;
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (updateFields.title) updateData.title = updateFields.title;
    if (updateFields.description !== undefined) updateData.description = updateFields.description;
    if (updateFields.status) {
      updateData.status = updateFields.status;
      if (updateFields.status === "completed") {
        updateData.completedAt = new Date();
      }
    }
    if (updateFields.priority) updateData.priority = updateFields.priority;
    if (updateFields.assigneeId !== undefined) updateData.assigneeId = updateFields.assigneeId || null;
    if (updateFields.teamId !== undefined) updateData.teamId = updateFields.teamId || null;
    if (updateFields.dueDate !== undefined) updateData.dueDate = updateFields.dueDate ? new Date(updateFields.dueDate) : null;

    const [updated] = await db.update(tasks).set(updateData).where(eq(tasks.id, id)).returning();
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    await db.delete(tasks).where(eq(tasks.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
