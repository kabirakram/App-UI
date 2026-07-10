import { NextResponse } from "next/server";
import { db } from "@/db";
import { teams, members, meetings, tasks, teamUpdates, documents } from "@/db/schema";
import { count, eq } from "drizzle-orm";

export async function GET() {
  try {
    const [teamsCount] = await db.select({ count: count() }).from(teams);
    const [membersCount] = await db.select({ count: count() }).from(members);
    const [meetingsCount] = await db.select({ count: count() }).from(meetings);
    const [tasksCount] = await db.select({ count: count() }).from(tasks);
    const [completedTasksCount] = await db
      .select({ count: count() })
      .from(tasks)
      .where(eq(tasks.status, "completed"));
    const [updatesCount] = await db.select({ count: count() }).from(teamUpdates);
    const [documentsCount] = await db.select({ count: count() }).from(documents);
    const [scheduledMeetingsCount] = await db
      .select({ count: count() })
      .from(meetings)
      .where(eq(meetings.status, "scheduled"));

    return NextResponse.json({
      teams: teamsCount.count,
      members: membersCount.count,
      meetings: meetingsCount.count,
      scheduledMeetings: scheduledMeetingsCount.count,
      tasks: tasksCount.count,
      completedTasks: completedTasksCount.count,
      updates: updatesCount.count,
      documents: documentsCount.count,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
