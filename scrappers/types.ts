export interface ScrapedProgram {
  name: string;
  short_description: string;
  link: string;
  deadline: string;
  imageUrl: string | null;
}

export interface SiteAdapter {
  siteName: string;
  baseUrl: string;
  getProgramLinks(): Promise<string[]>;
  scrapeDetailPage(url: string): Promise<ScrapedProgram | null>;
}
