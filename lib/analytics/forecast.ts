// Lightweight forecasting utilities for revenue and metrics
// Uses simple decomposition (moving average + seasonal factor)

export interface ForecastPoint {
  date: string;
  value: number;
  lowerBound: number;
  upperBound: number;
  confidence: number;
}

export interface ForecastResult {
  data: ForecastPoint[];
  period: number;
  method: string;
  accuracy?: number;
  trend: 'up' | 'down' | 'stable';
  seasonality: number;
}

export class ForecastEngine {
  private static instance: ForecastEngine;

  static getInstance(): ForecastEngine {
    if (!ForecastEngine.instance) {
      ForecastEngine.instance = new ForecastEngine();
    }
    return ForecastEngine.instance;
  }

  async forecastRevenue(
    historicalData: Array<{ date: string; value: number }>,
    period: number = 30
  ): Promise<ForecastResult> {
    if (historicalData.length < 7) {
      throw new Error('Insufficient historical data for forecasting');
    }

    // Sort data by date
    const sortedData = historicalData.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Extract values and dates
    const values = sortedData.map(d => d.value);
    const dates = sortedData.map(d => new Date(d.date));

    // Calculate trend using linear regression
    const trend = this.calculateTrend(values);
    
    // Calculate seasonal component (weekly pattern)
    const seasonality = this.calculateSeasonality(values, 7);
    
    // Calculate moving average
    const movingAvg = this.calculateMovingAverage(values, 7);
    
    // Generate forecast
    const forecast = this.generateForecast(
      values,
      dates,
      trend,
      seasonality,
      movingAvg,
      period
    );

    // Calculate accuracy metrics
    const accuracy = this.calculateAccuracy(values, movingAvg);

    return {
      data: forecast,
      period,
      method: 'ETS-like (Exponential Smoothing)',
      accuracy,
      trend: this.determineTrend(trend),
      seasonality: this.calculateSeasonalityStrength(seasonality)
    };
  }

  private calculateTrend(values: number[]): number {
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = values;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  private calculateSeasonality(values: number[], period: number): number[] {
    const seasonality = new Array(period).fill(0);
    const counts = new Array(period).fill(0);

    for (let i = 0; i < values.length; i++) {
      const dayOfWeek = i % period;
      seasonality[dayOfWeek] += values[i];
      counts[dayOfWeek]++;
    }

    // Normalize
    for (let i = 0; i < period; i++) {
      if (counts[i] > 0) {
        seasonality[i] /= counts[i];
      }
    }

    // Calculate average
    const avg = seasonality.reduce((a, b) => a + b, 0) / period;

    // Convert to seasonal factors (ratio to average)
    return seasonality.map(s => s / avg);
  }

  private calculateMovingAverage(values: number[], window: number): number[] {
    const result: number[] = [];
    
    for (let i = 0; i < values.length; i++) {
      const start = Math.max(0, i - window + 1);
      const slice = values.slice(start, i + 1);
      const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
      result.push(avg);
    }

    return result;
  }

  private generateForecast(
    values: number[],
    dates: Date[],
    trend: number,
    seasonality: number[],
    movingAvg: number[],
    period: number
  ): ForecastPoint[] {
    const forecast: ForecastPoint[] = [];
    const lastValue = values[values.length - 1];
    const lastDate = dates[dates.length - 1];
    const lastMovingAvg = movingAvg[movingAvg.length - 1];

    for (let i = 1; i <= period; i++) {
      const forecastDate = new Date(lastDate);
      forecastDate.setDate(forecastDate.getDate() + i);
      
      // Calculate base forecast using trend and moving average
      const trendComponent = trend * i;
      const seasonalIndex = (dates.length + i - 1) % seasonality.length;
      const seasonalFactor = seasonality[seasonalIndex];
      
      // Exponential smoothing approach
      const alpha = 0.3; // Smoothing parameter
      const baseForecast = lastMovingAvg + trendComponent;
      const forecastValue = baseForecast * seasonalFactor;

      // Calculate confidence intervals
      const variance = this.calculateVariance(values);
      const standardError = Math.sqrt(variance / values.length);
      const confidenceInterval = 1.96 * standardError * Math.sqrt(i); // 95% confidence

      const lowerBound = Math.max(0, forecastValue - confidenceInterval);
      const upperBound = forecastValue + confidenceInterval;
      const confidence = Math.max(0, Math.min(1, 1 - (confidenceInterval / forecastValue)));

      forecast.push({
        date: forecastDate.toISOString().split('T')[0],
        value: Math.round(forecastValue * 100) / 100,
        lowerBound: Math.round(lowerBound * 100) / 100,
        upperBound: Math.round(upperBound * 100) / 100,
        confidence: Math.round(confidence * 100) / 100
      });
    }

    return forecast;
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length;
    return variance;
  }

  private calculateAccuracy(actual: number[], predicted: number[]): number {
    if (actual.length !== predicted.length) return 0;

    const mape = actual.reduce((sum, value, i) => {
      if (value === 0) return sum;
      return sum + Math.abs((value - predicted[i]) / value);
    }, 0) / actual.length;

    return Math.max(0, 1 - mape); // Convert MAPE to accuracy (0-1)
  }

  private determineTrend(trend: number): 'up' | 'down' | 'stable' {
    if (trend > 0.1) return 'up';
    if (trend < -0.1) return 'down';
    return 'stable';
  }

  private calculateSeasonalityStrength(seasonality: number[]): number {
    const mean = seasonality.reduce((a, b) => a + b, 0) / seasonality.length;
    const variance = seasonality.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / seasonality.length;
    return Math.sqrt(variance); // Standard deviation as seasonality strength
  }

  // Forecast other metrics (orders, conversion rate, etc.)
  async forecastMetric(
    historicalData: Array<{ date: string; value: number }>,
    metric: 'orders' | 'conversion_rate' | 'aov',
    period: number = 30
  ): Promise<ForecastResult> {
    // Apply different forecasting strategies based on metric type
    switch (metric) {
      case 'orders':
        return this.forecastRevenue(historicalData, period);
      
      case 'conversion_rate':
        // Conversion rates are typically more stable, use different parameters
        const result = await this.forecastRevenue(historicalData, period);
        return {
          ...result,
          method: 'Stable Rate Forecasting',
          data: result.data.map(point => ({
            ...point,
            value: Math.min(1, Math.max(0, point.value)), // Clamp between 0 and 1
            lowerBound: Math.min(1, Math.max(0, point.lowerBound)),
            upperBound: Math.min(1, Math.max(0, point.upperBound))
          }))
        };
      
      case 'aov':
        // AOV tends to be more stable with less seasonality
        return this.forecastRevenue(historicalData, period);
      
      default:
        return this.forecastRevenue(historicalData, period);
    }
  }

  // Get forecast insights
  getForecastInsights(forecast: ForecastResult): string[] {
    const insights: string[] = [];
    const { data, trend, seasonality, accuracy } = forecast;

    // Trend insights
    if (trend === 'up') {
      insights.push('📈 Revenue is trending upward');
    } else if (trend === 'down') {
      insights.push('📉 Revenue is trending downward');
    } else {
      insights.push('📊 Revenue trend is stable');
    }

    // Seasonality insights
    if (seasonality > 0.2) {
      insights.push('🔄 Strong seasonal patterns detected');
    } else if (seasonality > 0.1) {
      insights.push('📅 Moderate seasonal patterns detected');
    }

    // Accuracy insights
    if (accuracy && accuracy > 0.8) {
      insights.push('🎯 High forecast accuracy expected');
    } else if (accuracy && accuracy > 0.6) {
      insights.push('⚠️ Moderate forecast accuracy');
    } else {
      insights.push('❓ Low forecast accuracy - consider more data');
    }

    // Growth insights
    const firstValue = data[0]?.value || 0;
    const lastValue = data[data.length - 1]?.value || 0;
    const growth = ((lastValue - firstValue) / firstValue) * 100;

    if (growth > 10) {
      insights.push(`🚀 Projected ${growth.toFixed(1)}% growth over forecast period`);
    } else if (growth < -10) {
      insights.push(`⚠️ Projected ${Math.abs(growth).toFixed(1)}% decline over forecast period`);
    }

    return insights;
  }
}

// Export singleton instance
export const forecastEngine = ForecastEngine.getInstance();