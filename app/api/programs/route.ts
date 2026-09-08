import { NextResponse } from "next/server";
import db, { GrantProgram } from "@/lib/db";

export async function GET(): Promise<NextResponse> {
  const programs = db
    .prepare("SELECT * FROM programs ORDER BY scraped_at DESC")
    .all() as GrantProgram[];

  return NextResponse.json(programs);
}
