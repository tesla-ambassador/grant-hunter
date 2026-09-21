import * as cheerio from "cheerio";
import { SiteAdapter, ScrapedProgram } from "../types";
import got from "got";

export const AktionMenschAdapter: SiteAdapter = {
  siteName: "AktionMensch",
  baseUrl: "https://www.aktion-mensch.de/",

  async getProgramLinks(): Promise<string[]> {
    const res = await got(`${this.baseUrl}/foerderung/foerderangebote`, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "accept-language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
      },
      timeout: { request: 10000 },
    });

    const $ = cheerio.load(res.body);

    const links = new Set<string>();
    $('a[href*="/foerderung/foerderangebote/"]').each((_, el) => {
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
    const res = await got(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "accept-language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
      },
      timeout: { request: 10000 },
    });
    if (!res.ok) return null;

    const $ = cheerio.load(res.body);
    const name = $("h1").first().text().trim();
    if (!name) return null;
    const description =
      $("main p").first().text().trim() || "Kein Bescriebung vorhanden";

    const deadline = $("p").eq(5).text().trim() || "Kein Deadline";

    return {
      name,
      short_description: description,
      deadline: deadline,
      imageUrl: "",
      link: url,
    };
  },
};
