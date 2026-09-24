import { GrantProgram } from "@/lib/db";
import ChromaticImageProductHeroDemo from "@/components/chromatic-image-product-hero-demo";
import { ProgramTable } from "@/components/program-table";

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
    <main className="min-h-screen bg-background">
      <ChromaticImageProductHeroDemo />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {programs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground">
              No programs found. Run <code>npx tsx scripts/scrape.ts</code>{" "}
              first.
            </p>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-6 mt-32">
            <h2>Programs List</h2>
            <ProgramTable programs={programs} />
          </div>
        )}
      </section>
    </main>
  );
}

// https://www.aktion-mensch.de/foerderung/foerderangebote
