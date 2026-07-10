export type Team = {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
};

export type Member = {
  id: number;
  name: string;
  email: string;
  role: string;
  teamId: number | null;
  avatar: string | null;
  createdAt: string;
};

export type MeetingStatus = "scheduled" | "in_progress" | "completed" | "cancelled";
export type TaskStatus = "pending" | "in_progress" | "completed" | "blocked";
export type TaskPriority = "low" | "medium" | "high" | "critical";
export type UpdateType = "daily" | "weekly" | "blocker" | "achievement";

export type Meeting = {
  id: number;
  title: string;
  description: string | null;
  agenda: string | null;
  scheduledAt: string;
  durationMinutes: number;
  location: string | null;
  meetingLink: string | null;
  status: MeetingStatus;
  teamId: number | null;
  organizerId: number | null;
  notes: string | null;
  createdAt: string;
  organizerName: string | null;
};

export type Task = {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: number | null;
  teamId: number | null;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  assigneeName: string | null;
};

export type TaskUpdate = {
  id: number;
  taskId: number;
  memberId: number | null;
  note: string;
  previousStatus: TaskStatus | null;
  newStatus: TaskStatus | null;
  createdAt: string;
  memberName: string | null;
  taskTitle: string | null;
};

export type TeamUpdate = {
  id: number;
  title: string;
  content: string;
  type: UpdateType;
  memberId: number | null;
  teamId: number | null;
  isPinned: boolean | null;
  createdAt: string;
  memberName: string | null;
};

export type Document = {
  id: number;
  name: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  storagePath: string;
  description: string | null;
  uploadedById: number | null;
  teamId: number | null;
  meetingId: number | null;
  createdAt: string;
  uploaderName: string | null;
};

export type Stats = {
  teams: number;
  members: number;
  meetings: number;
  scheduledMeetings: number;
  tasks: number;
  completedTasks: number;
  updates: number;
  documents: number;
};
