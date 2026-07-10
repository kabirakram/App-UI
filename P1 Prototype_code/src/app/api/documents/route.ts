import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { documents, members } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  try {
    const allDocuments = await db
      .select({
        id: documents.id,
        name: documents.name,
        originalName: documents.originalName,
        fileType: documents.fileType,
        fileSize: documents.fileSize,
        storagePath: documents.storagePath,
        description: documents.description,
        uploadedById: documents.uploadedById,
        teamId: documents.teamId,
        meetingId: documents.meetingId,
        createdAt: documents.createdAt,
        uploaderName: members.name,
      })
      .from(documents)
      .leftJoin(members, eq(documents.uploadedById, members.id))
      .orderBy(desc(documents.createdAt));
    return NextResponse.json(allDocuments);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const uploadedById = formData.get("uploadedById") as string;
    const teamId = formData.get("teamId") as string;
    const meetingId = formData.get("meetingId") as string;

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const ext = file.name.split(".").pop();
    const uniqueFilename = `${uuidv4()}.${ext}`;
    const filePath = path.join(uploadDir, uniqueFilename);
    await writeFile(filePath, buffer);

    const storagePath = `/uploads/${uniqueFilename}`;

    const [doc] = await db
      .insert(documents)
      .values({
        name: name || file.name,
        originalName: file.name,
        fileType: file.type || "application/octet-stream",
        fileSize: file.size,
        storagePath,
        description: description || null,
        uploadedById: uploadedById ? parseInt(uploadedById) : null,
        teamId: teamId ? parseInt(teamId) : null,
        meetingId: meetingId ? parseInt(meetingId) : null,
      })
      .returning();

    return NextResponse.json(doc, { status: 201 });
  } catch (error) {
    console.error("Error uploading document:", error);
    return NextResponse.json({ error: "Failed to upload document" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    await db.delete(documents).where(eq(documents.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}
