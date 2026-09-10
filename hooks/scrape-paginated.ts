import * as cheerio from "cheerio";

interface SearchResultItem {
  title: string;
  link: string;
  snippet?: string;
}

export async function scrapeSearchResults(
  baseUrl: string,
  searchQuery: string,
  maxPages = 5,
): Promise<SearchResultItem[]> {
  const results: SearchResultItem[] = [];
  const visitedLinks = new Set<string>();

  // Use URL object to cleanly manage query parameters
  const targetUrl = new URL("/suche", baseUrl);
  targetUrl.searchParams.set("k", searchQuery);

  let currentPage = 1;
  let hasNextPage = true;

  console.log(`[SEARCH START] Query: "${searchQuery}" on ${baseUrl}`);

  while (hasNextPage && currentPage <= maxPages) {
    // Handle pagination (adjust param name based on the target site, e.g. 'page', 'p', or 'offset')
    if (currentPage > 1) {
      targetUrl.searchParams.set("page", currentPage.toString());
    }

    console.log(`[FETCHING PAGE ${currentPage}] ${targetUrl.toString()}`);

    try {
      const res = await fetch(targetUrl.toString(), {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept-Language": "de-DE,de;q=0.9,en;q=0.8",
        },
      });

      if (!res.ok) {
        console.error(`Page ${currentPage} returned status ${res.status}`);
        break;
      }

      const html = await res.text();
      const $ = cheerio.load(html);

      // --- 1. TARGET RESULT CONTAINER ---
      // Common German CMS search result containers (BfN/Drupal/Typo3 use main article/search containers)
      const $resultCards = $(
        "main article, .search-result, .views-row, .result-list__item, .c-search-result",
      );

      let pageItemsFound = 0;

      $resultCards.each((_, el) => {
        const $card = $(el);
        const $link = $card.find("a[href]").first();
        const href = $link.attr("href");

        if (!href) return;

        // Resolve absolute URL
        const fullUrl = href.startsWith("http")
          ? href
          : new URL(href, baseUrl).toString();

        // Prevent duplicates
        if (visitedLinks.has(fullUrl)) return;

        const title = $card.find("h2, h3, .title, a").first().text().trim();
        const snippet = $card
          .find("p, .snippet, .teaser-text")
          .first()
          .text()
          .trim();

        if (title && fullUrl) {
          visitedLinks.add(fullUrl);
          results.push({
            title,
            link: fullUrl,
            snippet: snippet || undefined,
          });
          pageItemsFound++;
        }
      });

      console.log(
        `[PAGE ${currentPage}] Found ${pageItemsFound} result links.`,
      );

      // If no items were found on this page, stop paginating
      if (pageItemsFound === 0) {
        hasNextPage = false;
        break;
      }

      // --- 2. DETECT NEXT PAGE ---
      // Look for explicit "Next" / "Weiter" pagination links
      const $nextButton = $(
        'a[rel="next"], .pagination__item--next a, a:contains("Weiter")',
      );

      if ($nextButton.length > 0 && $nextButton.attr("href")) {
        const nextHref = $nextButton.attr("href")!;
        const nextUrl = new URL(nextHref, baseUrl);
        targetUrl.search = nextUrl.search; // Update query params for next iteration
        currentPage++;
      } else {
        // Fallback: If no explicit next link, increment page counter manually
        currentPage++;
      }

      // Short delay between pagination requests
      await new Promise((r) => setTimeout(r, 300));
    } catch (err) {
      console.error(`Error scraping search page ${currentPage}:`, err);
      break;
    }
  }

  console.log(
    `[SEARCH COMPLETE] Collected ${results.length} total filtered links.`,
  );
  return results;
}

// --- EXAMPLE USAGE ---
// Executing against BfN (Bundesamt für Naturschutz) search
scrapeSearchResults("https://www.bfn.de", "förderung", 3).then((items) => {
  console.log(JSON.stringify(items, null, 2));
});
