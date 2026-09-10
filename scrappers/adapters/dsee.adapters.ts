import * as cheerio from "cheerio";
import { SiteAdapter, ScrapedProgram } from "../types";

export const DseeAdapter: SiteAdapter = {
  siteName: "DSEE",
  baseUrl: "https://www.deutsche-stiftung-engagement-und-ehrenamt.de",

  async getProgramLinks(): Promise<string[]> {
    const res = await fetch(`${this.baseUrl}/foerderung`);
    const html = await res.text();
    const $ = cheerio.load(html);

    const links = new Set<string>();
    $('a[href*="/foerderung/"]').each((_, el) => {
      const href = $(el).attr("href");
      if (href && !href.includes("#") && href !== "/foerderung/") {
        const fullUrl = href.startsWith("http")
          ? href
          : `${this.baseUrl}${href.startsWith("/") ? "" : "/"}${href}`;
        links.add(fullUrl);
      }
    });
    return Array.from(links);
  },
  async scrapeDetailPage(url: string): Promise<ScrapedProgram | null> {
    const res = await fetch(url);
    if (!res.ok) return null;

    const $ = cheerio.load(await res.text());
    const name =
      $(".avia_textblock h1").first().text().trim() ||
      $(".avia_textblock h2").first().text().trim() ||
      $(".avia_textblock h3").first().text().trim() ||
      $.text().trim();

    if (!name) return null;
    const description =
      $("main p, article p").first().text().trim() ||
      "Keine Beschriebung vorhanden";

    // Searching for deadlines
    const fullPageText = $("main").text();
    const deadlineMatch = fullPageText.match(
      /Frist:|Bewerbungsfrist:|bis zum\s+(\d{2}\.\d{2}\.\d{4})/i,
    );
    const deadline = deadlineMatch
      ? deadlineMatch[0] || deadlineMatch[1]
      : "Keine Deadline vorhanden";

    // Searching for images (Still failing atm)
    const rawImg = $(".avia_image img").find().attr("src");
    const imgUrl = `${this.baseUrl}${rawImg}`;

    return {
      name,
      short_description: description.substring(0, 300),
      deadline: deadline,
      imageUrl: imgUrl,
      link: url,
    };
  },
};
