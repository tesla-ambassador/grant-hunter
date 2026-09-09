import * as cheerio from "cheerio";
import db from "../lib/db";
import crypto from "crypto";

const BASE_URL = "https://www.deutsche-stiftung-engagement-und-ehrenamt.de";
const LISTING_URL = `${BASE_URL}/foerderung/`;

// Helper to resolve relative paths to absolute URLs
function toAbsoluteUrl(urlPath: string | undefined): string | null {
  if (!urlPath) return null;
  if (urlPath.startsWith("http://") || urlPath.startsWith("https://")) {
    return urlPath;
  }
  return `${BASE_URL}${urlPath.startsWith("/") ? "" : "/"}${urlPath}`;
}

async function scrapeDSEE(): Promise<void> {
  console.log(`[1/3] Fetching index page: ${LISTING_URL}`);

  const mainRes = await fetch(LISTING_URL);
  if (!mainRes.ok) {
    throw new Error(`Failed to fetch listing page: ${mainRes.statusText}`);
  }

  const mainHtml = await mainRes.text();
  const $ = cheerio.load(mainHtml);

  // 1. Collect unique grant program links (ignoring messy listing-card titles/images)
  const programLinks = new Set<string>();

  $('a[href*="/foerderung/"]').each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;

    const fullUrl = toAbsoluteUrl(href);
    if (!fullUrl) return;

    // Filter out index self-references, anchor tags, and non-program pages
    const isMainIndex =
      fullUrl.replace(/\/$/, "") === LISTING_URL.replace(/\/$/, "");
    const isAnchor = fullUrl.includes("#");

    if (!isMainIndex && !isAnchor) {
      programLinks.add(fullUrl);
    }
  });

  console.log(
    `[2/3] Found ${programLinks.size} unique program detail links. Starting extraction...`,
  );

  // Prepare SQLite Upsert
  const insertStmt = db.prepare(`
    INSERT INTO programs (id, name, short_description, deadline, link, image_url)
    VALUES (@id, @name, @short_description, @deadline, @link, @imageUrl)
    ON CONFLICT(link) DO UPDATE SET
      name=excluded.name,
      short_description=excluded.short_description,
      deadline=excluded.deadline,
      image_url=excluded.image_url;
  `);

  // 2. Fetch each detail page and extract reliable data directly from page elements
  let savedCount = 0;

  for (const link of programLinks) {
    try {
      const detailRes = await fetch(link);
      if (!detailRes.ok) continue;

      const detailHtml = await detailRes.text();
      const $detail = cheerio.load(detailHtml);

      // Extract guaranteed clean Title from detail <h1>
      const name =
        $detail(".avia_textblock h1").first().text().trim() ||
        $detail(".avia_textblock h2").first().text().trim() ||
        $detail(".avia_textblock h3").first().text().trim() ||
        $detail.text().trim();

      // Extract primary body paragraph for description
      const description = $detail("main p, article p, .entry-content p")
        .first()
        .text()
        .trim();

      // Skip if page didn't contain a valid main title
      if (!name || !description) {
        console.warn(`[SKIP] No Header or description found on page: ${link}`);
        continue;
      }

      // Extract the deadline (I suck at regex)
      const fullPageText = $detail("main").text();
      const deadlineMatch = fullPageText.match(
        /Frist:|Bewerbungsfrist:|bis zum\s+(\d{2}\.\d{2}\.\d{4})/i,
      );
      const deadline = deadlineMatch
        ? deadlineMatch[1] || deadlineMatch[0]
        : "N/A";

      // Extract main hero or article image
      const rawImgSrc = $detail(".avia_image img").first().attr("src");

      const imageUrl = toAbsoluteUrl(rawImgSrc);

      // Generate deterministic ID based on URL
      const id = crypto.createHash("md5").update(link).digest("hex");

      // Save to SQLite
      insertStmt.run({
        id,
        name,
        short_description:
          description.length > 300
            ? `${description.substring(0, 300)}...`
            : description,
        deadline,
        link,
        imageUrl,
      });

      savedCount++;
      console.log(`[SAVED ${savedCount}/${programLinks.size}] ${name}`);
    } catch (err) {
      console.error(`[ERROR] Failed scraping detail link: ${link}`, err);
    }
  }

  console.log(
    `[3/3] Scrape completed. Successfully saved ${savedCount} programs to database.`,
  );
}

// Execute scraper
scrapeDSEE().catch((err) => {
  console.error("Fatal Scraper Error:", err);
  process.exit(1);
});
