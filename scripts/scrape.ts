import * as cheerio from "cheerio";
import db, { GrantProgram } from "../lib/db";
import crypto from "crypto";

const BASE_URL = "https://www.deutsche-stiftung-engagement-und-ehrenamt.de";
const LIST_URL = `${BASE_URL}/foerderung/`;

interface RawProgram {
  name: string;
  link: string;
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
  });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return await res.text();
}

async function scrapeDSEE(): Promise<void> {
  console.log("Fetching main funding portal...");
  const mainHtml = await fetchHtml(LIST_URL);
  const $ = cheerio.load(mainHtml);

  const rawPrograms: RawProgram[] = [];

  // Parse card links from the list view
  $('a[href*="/foerderung/"]').each((_, el) => {
    const $el = $(el);
    const link = $el.attr("href");
    const name = $el.find("h2, h3").text().trim() || $el.text().trim();

    // Ignore root links or short non-program links
    if (link && link !== "/foerderung/" && name.length > 3) {
      const fullUrl = link.startsWith("http") ? link : `${BASE_URL}${link}`;
      rawPrograms.push({ name, link: fullUrl });
    }
  });

  // Deduplicate by URL
  const uniquePrograms = Array.from(
    new Map(rawPrograms.map((p) => [p.link, p])).values(),
  );
  console.log(
    `Found ${uniquePrograms.length} candidate programs. Scraping detail pages...`,
  );

  const insertStmt = db.prepare(`
    INSERT INTO programs (id, name, short_description, deadline, link, image_url)
    VALUES (@id, @name, @short_description, @deadline, @link, @imgUrl)
    ON CONFLICT(link) DO UPDATE SET
      name=excluded.name,
      short_description=excluded.short_description,
      deadline=excluded.deadline,
      image_url=excluded.image_url;
  `);

  for (const prog of uniquePrograms) {
    try {
      // Scrape detail page for deeper info
      const detailHtml = await fetchHtml(prog.link);
      const $detail = cheerio.load(detailHtml);

      const rawImgSrc = $detail("main img, .entry-content img, article img, .alignnone img")
        .first()
        .attr("src");

      let imgUrl = "";
      if (rawImgSrc) {
        imgUrl = rawImgSrc.startsWith("http")
          ? rawImgSrc
          : `${BASE_URL}${rawImgSrc.startsWith("/") ? "" : "/"}${rawImgSrc}`;
      }

      const description =
        $detail("main p, .entry-content p").first().text().trim() ||
        "No description found.";

      // Basic regex parsing for deadlines in text
      const fullPageText = $detail("main").text();
      const deadlineMatch = fullPageText.match(
        /Frist:|Bewerbungsfrist:|bis zum\s+(\d{2}\.\d{2}\.\d{4})/i,
      );
      const deadline = deadlineMatch
        ? deadlineMatch[1] || deadlineMatch[0]
        : "N/A";

      const programData: GrantProgram = {
        id: crypto.createHash("md5").update(prog.link).digest("hex"),
        name: prog.name,
        short_description: description.substring(0, 300) + "...",
        deadline: deadline,
        link: prog.link,
        imgUrl: imgUrl || undefined,
      };

      insertStmt.run(programData);
      console.log(`[SAVED] ${programData.name}`);
    } catch (err) {
      const error = err as Error;
      console.error(`Failed to scrape detail for ${prog.link}:`, error.message);
    }
  }

  console.log("Scraping complete!");
}

scrapeDSEE();
