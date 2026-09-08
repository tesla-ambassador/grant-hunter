import { NextResponse } from "next/server";
import db, { GrantProgram } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: Request,
  { params }: RouteParams,
): Promise<NextResponse> {
  const { id } = await params;
  const program = db.prepare("SELECT * FROM programs WHERE id = ?").get(id) as
    | GrantProgram
    | undefined;

  if (!program) {
    return NextResponse.json({ error: "Program not found" }, { status: 404 });
  }

  return NextResponse.json(program);
}
