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
    <main
      style={{
        maxWidth: "700px",
        margin: "2rem auto",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <Link href="/">&larr; Back to all grants</Link>

      <h1 style={{ marginTop: "1.5rem" }} className="text-red-500">
        {program.name}
      </h1>

      <div
        style={{
          background: "#f5f5f5",
          padding: "0.75rem 1rem",
          borderRadius: "6px",
          margin: "1rem 0",
        }}
      >
        <strong>Deadline / Application Period:</strong> {program.deadline}
      </div>

      <h3>Description</h3>
      <p style={{ lineHeight: "1.6" }}>{program.short_description}</p>

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
