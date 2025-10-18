import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { logError } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const { etsy, amazon, shopify } = await request.json();

    // For development, skip actual API tests and return success
    // This allows developers to test onboarding flow without configuring all API keys
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({
        success: true,
        results: {
          etsy: { success: true, message: 'Etsy check skipped in development mode' },
          amazon: { success: true, message: 'Amazon check skipped in development mode' },
          shopify: { success: true, message: 'Shopify check skipped in development mode' }
        },
        message: 'Marketplace connections check skipped in development mode'
      });
    }

    const results = {
      etsy: { success: false, message: 'Not configured' },
      amazon: { success: false, message: 'Not configured' },
      shopify: { success: false, message: 'Not configured' }
    };

    // Test Etsy API
    if (etsy?.apiKey) {
      try {
        const response = await axios.get(
          'https://openapi.etsy.com/v3/application/users/me',
          {
            headers: {
              'Authorization': `Bearer ${etsy.apiKey}`,
              'x-api-key': etsy.apiKey,
            },
            timeout: 5000
          }
        );

        if (response.status === 200) {
          results.etsy = { success: true, message: 'Connected successfully' };
        }
      } catch (error: any) {
        logError(error, 'EtsyAPITest');
        results.etsy = {
          success: false,
          message: error.response?.data?.error || 'Connection failed'
        };
      }
    }

    // Test Amazon API (simplified check)
    if (amazon?.accessKey && amazon?.secretKey) {
      try {
        // For now, just validate that keys are provided
        // Real Amazon MWS/SP-API integration would require more complex setup
        if (amazon.accessKey.length > 10 && amazon.secretKey.length > 10) {
          results.amazon = { success: true, message: 'Keys configured (full test requires additional setup)' };
        } else {
          results.amazon = { success: false, message: 'Invalid key format' };
        }
      } catch (error) {
        logError(error, 'AmazonAPITest');
        results.amazon = { success: false, message: 'Test failed' };
      }
    }

    // Test Shopify API
    if (shopify?.accessToken && shopify?.shopDomain) {
      try {
        const response = await axios.get(
          `https://${shopify.shopDomain}/admin/api/2023-10/shop.json`,
          {
            headers: {
              'X-Shopify-Access-Token': shopify.accessToken,
            },
            timeout: 5000
          }
        );

        if (response.status === 200) {
          results.shopify = { success: true, message: 'Connected successfully' };
        }
      } catch (error: any) {
        logError(error, 'ShopifyAPITest');
        results.shopify = {
          success: false,
          message: error.response?.data?.error || 'Connection failed'
        };
      }
    }

    // Check if at least one marketplace is configured
    const hasAnySuccess = Object.values(results).some(r => r.success);

    return NextResponse.json({
      success: hasAnySuccess,
      results,
      message: hasAnySuccess ? 'Marketplace connections tested' : 'No marketplaces configured'
    });

  } catch (error) {
    logError(error, 'MarketplaceTestEndpoint');
    return NextResponse.json(
      { error: 'Marketplace test failed' },
      { status: 500 }
    );
  }
}
