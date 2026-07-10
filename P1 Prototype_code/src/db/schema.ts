import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";

// Enums
export const meetingStatusEnum = pgEnum("meeting_status", [
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
]);

export const taskStatusEnum = pgEnum("task_status", [
  "pending",
  "in_progress",
  "completed",
  "blocked",
]);

export const taskPriorityEnum = pgEnum("task_priority", [
  "low",
  "medium",
  "high",
  "critical",
]);

export const updateTypeEnum = pgEnum("update_type", [
  "daily",
  "weekly",
  "blocker",
  "achievement",
]);

// Teams
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Members
export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("member"),
  teamId: integer("team_id").references(() => teams.id, {
    onDelete: "set null",
  }),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Meetings
export const meetings = pgTable("meetings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  agenda: text("agenda"),
  scheduledAt: timestamp("scheduled_at").notNull(),
  durationMinutes: integer("duration_minutes").notNull().default(60),
  location: text("location"),
  meetingLink: text("meeting_link"),
  status: meetingStatusEnum("status").notNull().default("scheduled"),
  teamId: integer("team_id").references(() => teams.id, { onDelete: "cascade" }),
  organizerId: integer("organizer_id").references(() => members.id, {
    onDelete: "set null",
  }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Meeting attendees (many-to-many)
export const meetingAttendees = pgTable("meeting_attendees", {
  id: serial("id").primaryKey(),
  meetingId: integer("meeting_id")
    .notNull()
    .references(() => meetings.id, { onDelete: "cascade" }),
  memberId: integer("member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  attended: boolean("attended").default(false),
});

// Tasks
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: taskStatusEnum("status").notNull().default("pending"),
  priority: taskPriorityEnum("priority").notNull().default("medium"),
  assigneeId: integer("assignee_id").references(() => members.id, {
    onDelete: "set null",
  }),
  teamId: integer("team_id").references(() => teams.id, { onDelete: "cascade" }),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Daily Task Updates
export const taskUpdates = pgTable("task_updates", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id")
    .notNull()
    .references(() => tasks.id, { onDelete: "cascade" }),
  memberId: integer("member_id").references(() => members.id, {
    onDelete: "set null",
  }),
  note: text("note").notNull(),
  previousStatus: taskStatusEnum("previous_status"),
  newStatus: taskStatusEnum("new_status"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Team Updates
export const teamUpdates = pgTable("team_updates", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: updateTypeEnum("type").notNull().default("daily"),
  memberId: integer("member_id").references(() => members.id, {
    onDelete: "set null",
  }),
  teamId: integer("team_id").references(() => teams.id, { onDelete: "cascade" }),
  isPinned: boolean("is_pinned").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Documents
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  originalName: text("original_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  storagePath: text("storage_path").notNull(),
  description: text("description"),
  uploadedById: integer("uploaded_by_id").references(() => members.id, {
    onDelete: "set null",
  }),
  teamId: integer("team_id").references(() => teams.id, { onDelete: "cascade" }),
  meetingId: integer("meeting_id").references(() => meetings.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
