import db from "@/lib/db";
import crypto from "crypto";
import { SiteAdapter, ScrapedProgram } from "@/scrappers/types";
import { DseeAdapter } from "@/scrappers/adapters/dsee.adapters";
import { BfnAdapter } from "@/scrappers/adapters/bfn.adapters";

const Adapters: SiteAdapter[] = [DseeAdapter, BfnAdapter];

export function saveProgram(program: ScrapedProgram) {
  const insertSmt = db.prepare(`
        INSERT INTO programs (id, name, short_description, deadline, link, image_url)
        VALUES (@id, @name, @short_description, @deadline, @link, @imageUrl)
        ON CONFLICT(link) DO UPDATE SET
        name=excluded.name,
        short_description=excluded.short_description,
        deadline=excluded.deadline,
        image_url=excluded.image_url;
        `);

  insertSmt.run({
    id: crypto.createHash("md5").update(program.link).digest("hex"),
    name: program.name,
    short_description: program.short_description,
    deadline: program.deadline,
    imageUrl: program.imageUrl,
    link: program.link,
  });
}

// Scrapte each individual site end to end
async function processSite(adapter: SiteAdapter) {
  console.log(`[START] Scraping ${adapter.siteName}...`);

  try {
    const links = await adapter.getProgramLinks();
    console.log(`[${adapter.siteName}] Found ${links.length} links.`);

    for (const link of links) {
      try {
        const data = await adapter.scrapeDetailPage(link);
        if (data) {
          saveProgram(data);
          console.log(`[SAVED] [${adapter.siteName}] ${data.name}`);
        }
      } catch (err) {
        console.error(
          `[ERROR] [${adapter.siteName}] Failed link: ${link}`,
          err,
        );
      }
    }
  } catch (err) {
    console.error(`[CRITICAL] Adapter ${adapter.siteName} failed`, err);
  }
}

// Run all adapters concurrently
async function runAll() {
  console.log("--- Starting Multi-Source Scraper Job ---");
  await Promise.allSettled(Adapters.map((adapter) => processSite(adapter)));
  console.log("----- All Scrapers Completed");
}

runAll();
