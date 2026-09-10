import Link from "next/link";
import { notFound } from "next/navigation";
import { GrantProgram } from "@/lib/db";
import { parseHTMLString } from "@/hooks/parse-html";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getProgram(id: string): Promise<GrantProgram | null> {
  const res = await fetch(`http://localhost:3000/api/programs/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function ProgramDetailPage({ params }: PageProps) {
  const { id } = await params;
  const program = await getProgram(id);

  if (!program) {
    notFound();
  }

  return (
    <main className="max-w-4xl mx-auto py-32 px-4 space-y-6">
      <Link href="/">&larr; Back to all grants</Link>

      <h1
        style={{ marginTop: "1.5rem" }}
        className="text-black font-bold text-3xl"
      >
        {program.name}
      </h1>

      {program.short_description !== "" ? (
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Description</h3>
          <p style={{ lineHeight: "1.6" }} className="text-pretty">
            {program.short_description}
          </p>
        </div>
      ) : (
        <div className="space-y-2 text-center">
          <h3 className="text-xl font-semibold">Keine Description Vorhanden</h3>
        </div>
      )}

      <div
        style={{
          background: "#f5f5f5",
          padding: "0.75rem 1rem",
          borderRadius: "6px",
          margin: "1rem 0",
        }}
      >
        {program.deadline.toLowerCase().includes("keine") ? (
          <strong>{program.deadline}</strong>
        ) : (
          <>
            <strong>Deadline / Application Period:</strong> {program.deadline}
          </>
        )}
      </div>

      <a
        href={program.link}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-block",
          marginTop: "1.5rem",
          background: "#0066cc",
          color: "#fff",
          padding: "0.75rem 1.25rem",
          borderRadius: "4px",
          textDecoration: "none",
        }}
      >
        View Original Source &rarr;
      </a>
    </main>
  );
}
