import { NextRequest, NextResponse } from 'next/server';
import { 
  generateSmartRecommendations, 
  predictUpcomingTrends,
  getPersonalizedInsights 
} from '@/lib/ai/recommendations';
import { handleAPIError } from '@/lib/errors';
import { logRequest, logError } from '@/lib/logger';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Get user ID from auth header
    const authHeader = request.headers.get('authorization');
    const userId = authHeader 
      ? Buffer.from(authHeader.replace('Bearer ', ''), 'base64').toString().split(':')[0] 
      : 'anonymous';

    // Apply rate limiting
    rateLimit(userId, 'free');

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';

    let result: any = {};

    switch (type) {
      case 'products':
        result.recommendations = await generateSmartRecommendations({
          recentProducts: [],
          performance: {},
          preferences: {},
        });
        break;
      
      case 'trends':
        result.trends = await predictUpcomingTrends();
        break;
      
      case 'insights':
        result.insights = await getPersonalizedInsights(userId);
        break;
      
      case 'all':
      default:
        const [recommendations, trends, insights] = await Promise.all([
          generateSmartRecommendations({
            recentProducts: [],
            performance: {},
            preferences: {},
          }),
          predictUpcomingTrends(),
          getPersonalizedInsights(userId),
        ]);
        
        result = {
          recommendations,
          trends,
          insights,
        };
        break;
    }

    logRequest('GET', '/api/recommendations', 200, Date.now() - startTime, userId, { type });

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logError(error, 'RecommendationsAPI', { path: '/api/recommendations' });
    const { response, statusCode } = handleAPIError(error, '/api/recommendations');
    logRequest('GET', '/api/recommendations', statusCode, Date.now() - startTime);
    return NextResponse.json(response, { status: statusCode });
  }
}

