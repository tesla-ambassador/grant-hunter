import Link from "next/link";
import { GrantProgram } from "@/lib/db";
import ChromaticImageProductHeroDemo from "@/components/chromatic-image-product-hero-demo";
import { GrantCard } from "@/components/other-comps";

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
    <main>
      <ChromaticImageProductHeroDemo />

      {programs.length === 0 ? (
        <p>
          No programs found. Run <code>npx tsx scripts/scrape.ts</code> first.
        </p>
      ) : (
        <div className="px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 bg-gray-100 md:px-12 lg:px-32">
          {programs.map((program) => (
            <GrantCard
              key={program.id}
              href={`/${program.id}`}
              deadline={program.deadline}
              name={program.name}
              desc={program.short_description}
            />
          ))}
        </div>
      )}
    </main>
  );
}
