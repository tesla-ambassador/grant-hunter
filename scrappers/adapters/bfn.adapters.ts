import * as cheerio from "cheerio";
import { SiteAdapter, ScrapedProgram } from "../types";
import { scrapeSearchResults } from "@/hooks/scrape-paginated";

export const BfnAdapter: SiteAdapter = {
  siteName: "BFN",
  baseUrl: "https://www.bfn.de/",

  async getProgramLinks(): Promise<string[]> {
    // Search specifically for funding terms
    const searchResults = await scrapeSearchResults(
      this.baseUrl,
      "förderung",
      3,
    );
    return searchResults.map((item) => item.link);
  },

  async scrapeDetailPage(url: string): Promise<ScrapedProgram | null> {
    const res = await fetch(url);
    if (!res.ok) return null;

    const $ = cheerio.load(await res.text());

    const name = $(".s-node__corpus h1 span").first().text().trim();
    if (!name) return null;
    const description =
      $(".field--name-field-description").first().text().trim() ||
      $(".field--name-field-description").first().text().trim() ||
      $(".s-node__corpus div").first().text().trim();

    const fullPageText = $("main").text();
    const deadlineMatches = fullPageText.match(
      /Frist:|Bewerbungsfrist:|bis zum\s+(\d{2}\.\d{2}\.\d{4})/i,
    );
    const deadline = deadlineMatches
      ? deadlineMatches[0] || deadlineMatches[1]
      : "Keine deadline vorhanden";

    return {
      name,
      short_description: description.substring(0, 300),
      deadline,
      imageUrl: null,
      link: url,
    };
  },
};
