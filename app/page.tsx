import Link from "next/link";
import { GrantProgram } from "@/lib/db";

async function getPrograms(): Promise<GrantProgram[]> {
  const res = await fetch("http://localhost:3000/api/programs", {
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function ProgramListPage() {
  const programs = await getPrograms();

  return (
    <main
      style={{
        maxWidth: "800px",
        margin: "2rem auto",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1>German Public Funding Programs</h1>
      <p style={{ color: "#666" }}>
        Source: DSEE (Deutsche Stiftung für Engagement und Ehrenamt)
      </p>

      {programs.length === 0 ? (
        <p>
          No programs found. Run <code>npx tsx scripts/scrape.ts</code> first.
        </p>
      ) : (
        <div style={{ display: "grid", gap: "1rem", marginTop: "1.5rem" }}>
          {programs.map((program) => (
            <article
              key={program.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "1rem",
              }}
            >
              <h2 style={{ margin: "0 0 0.5rem 0" }}>
                <Link href={`/${program.id}`}>{program.name}</Link>
              </h2>
              <p style={{ margin: "0 0 1rem 0", color: "#444" }}>
                {program.short_description}
              </p>
              <div style={{ fontSize: "0.875rem", color: "#888" }}>
                <strong>Deadline:</strong> {program.deadline}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
