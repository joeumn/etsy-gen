import { NextRequest, NextResponse } from 'next/server';
import { scrapeGoogleTrends, scrapeBlogMentions } from '@/lib/scrapers/web-scraper';
import { scrapeSocialMedia } from '@/lib/scrapers/social-scraper';
import { logError } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const results = {
      webScraper: { success: false, message: 'Not tested' },
      socialScraper: { success: false, message: 'Not tested' }
    };

    // Test web scraper with sample keywords
    try {
      const testKeywords = ['test keyword', 'sample product'];
      const webResults = await Promise.all([
        scrapeGoogleTrends(testKeywords),
        scrapeBlogMentions(testKeywords)
      ]);

      const totalResults = webResults.flat().length;
      if (totalResults > 0) {
        results.webScraper = {
          success: true,
          message: `Successfully scraped ${totalResults} trends`
        };
      } else {
        results.webScraper = {
          success: false,
          message: 'No results returned'
        };
      }
    } catch (error) {
      logError(error, 'WebScraperTest');
      results.webScraper = {
        success: false,
        message: 'Web scraping test failed'
      };
    }

    // Test social scraper with sample queries
    try {
      const socialResults = await scrapeSocialMedia(['test query']);
      if (socialResults && socialResults.length > 0) {
        results.socialScraper = {
          success: true,
          message: `Successfully scraped ${socialResults.length} social posts`
        };
      } else {
        results.socialScraper = {
          success: false,
          message: 'No social media results returned'
        };
      }
    } catch (error) {
      logError(error, 'SocialScraperTest');
      results.socialScraper = {
        success: false,
        message: 'Social media scraping test failed'
      };
    }

    // Check if at least one scraper works
    const hasAnySuccess = Object.values(results).some(r => r.success);

    return NextResponse.json({
      success: hasAnySuccess,
      results,
      message: hasAnySuccess ? 'Scanner functionality tested' : 'Scanner tests failed'
    });

  } catch (error) {
    logError(error, 'ScannerTestEndpoint');
    return NextResponse.json(
      { error: 'Scanner test failed' },
      { status: 500 }
    );
  }
}
