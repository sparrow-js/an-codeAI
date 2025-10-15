import { CloneUrlToCodeState, CloneUrlToCodeUpdate } from "../types";
import FirecrawlApp, { type ScrapeResponse } from '@mendable/firecrawl-js';
import { uploadImageFromUrl } from "@/utils/uploadImageFromUrl";

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;

/**
 * 处理网页抓取的节点
 * @param state 当前状态
 * @returns 更新后的状态
 */
export async function firecrawl(
  state: CloneUrlToCodeState
): Promise<Partial<CloneUrlToCodeUpdate>> {
  console.log("firecrawl node running", state.url, FIRECRAWL_API_KEY);
  const url = state.url;
  try {

    state.dataStream.writeData({
      type: 'progress',
      label: 'summary',
      status: 'in-progress',
      order: 0,
      message: 'Crawling website',
    });

    const firecrawl = new FirecrawlApp({ apiKey: FIRECRAWL_API_KEY });
    const scrapeResult = await firecrawl.scrapeUrl(url, {
      formats: ['markdown', 'html', 'screenshot@fullPage'],
      "onlyMainContent": false,
      waitFor: 3000,
      timeout: 60000
    });
  
    if (!scrapeResult.success) {
      throw new Error(`Firecrawl scrape failed: ${scrapeResult.error || 'Unknown error'}`);
    }
  
    const { markdown, html, screenshot, metadata } = scrapeResult;
    let screenshotUrl = '';
    if (screenshot) {
      screenshotUrl = await uploadImageFromUrl(screenshot);
    }
  
    return {
      screenshotUrl: screenshotUrl,
      HtmlContext: html || '',
    }
  } catch (error) {
    console.error('Error in firecrawl node:', error);
    throw error;
  }
  
 
}
