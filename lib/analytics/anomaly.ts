// Anomaly detection utilities for revenue and metrics
// Uses rolling z-score and IQR methods

export interface AnomalyPoint {
  date: string;
  value: number;
  expectedValue: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high';
  type: 'spike' | 'dip' | 'outlier';
  description: string;
}

export interface AnomalyResult {
  anomalies: AnomalyPoint[];
  totalAnomalies: number;
  period: string;
  method: string;
  threshold: number;
  insights: string[];
}

export class AnomalyDetector {
  private static instance: AnomalyDetector;

  static getInstance(): AnomalyDetector {
    if (!AnomalyDetector.instance) {
      AnomalyDetector.instance = new AnomalyDetector();
    }
    return AnomalyDetector.instance;
  }

  async detectAnomalies(
    data: Array<{ date: string; value: number }>,
    method: 'zscore' | 'iqr' = 'zscore',
    threshold: number = 2.0
  ): Promise<AnomalyResult> {
    if (data.length < 10) {
      throw new Error('Insufficient data for anomaly detection');
    }

    // Sort data by date
    const sortedData = data.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const values = sortedData.map(d => d.value);
    const dates = sortedData.map(d => d.date);

    let anomalies: AnomalyPoint[] = [];

    switch (method) {
      case 'zscore':
        anomalies = this.detectZScoreAnomalies(values, dates, threshold);
        break;
      case 'iqr':
        anomalies = this.detectIQRAnomalies(values, dates);
        break;
    }

    const insights = this.generateInsights(anomalies, data);

    return {
      anomalies,
      totalAnomalies: anomalies.length,
      period: this.calculatePeriod(data),
      method: method.toUpperCase(),
      threshold,
      insights
    };
  }

  private detectZScoreAnomalies(
    values: number[],
    dates: string[],
    threshold: number
  ): AnomalyPoint[] {
    const anomalies: AnomalyPoint[] = [];
    const windowSize = Math.min(14, Math.floor(values.length / 3)); // Rolling window

    for (let i = windowSize; i < values.length; i++) {
      const window = values.slice(i - windowSize, i);
      const currentValue = values[i];
      const currentDate = dates[i];

      // Calculate rolling statistics
      const mean = this.calculateMean(window);
      const stdDev = this.calculateStandardDeviation(window, mean);

      if (stdDev === 0) continue; // Skip if no variation

      // Calculate z-score
      const zScore = Math.abs((currentValue - mean) / stdDev);

      if (zScore > threshold) {
        const deviation = ((currentValue - mean) / mean) * 100;
        const severity = this.determineSeverity(zScore, threshold);
        const type = currentValue > mean ? 'spike' : 'dip';

        anomalies.push({
          date: currentDate,
          value: currentValue,
          expectedValue: mean,
          deviation: Math.round(deviation * 100) / 100,
          severity,
          type,
          description: this.generateAnomalyDescription(type, deviation, severity)
        });
      }
    }

    return anomalies;
  }

  private detectIQRAnomalies(values: number[], dates: string[]): AnomalyPoint[] {
    const anomalies: AnomalyPoint[] = [];
    const windowSize = Math.min(14, Math.floor(values.length / 3));

    for (let i = windowSize; i < values.length; i++) {
      const window = values.slice(i - windowSize, i);
      const currentValue = values[i];
      const currentDate = dates[i];

      // Calculate IQR
      const sortedWindow = [...window].sort((a, b) => a - b);
      const q1 = this.calculatePercentile(sortedWindow, 25);
      const q3 = this.calculatePercentile(sortedWindow, 75);
      const iqr = q3 - q1;

      // Define outlier bounds
      const lowerBound = q1 - 1.5 * iqr;
      const upperBound = q3 + 1.5 * iqr;

      if (currentValue < lowerBound || currentValue > upperBound) {
        const mean = this.calculateMean(window);
        const deviation = ((currentValue - mean) / mean) * 100;
        const severity = this.calculateIQRSeverity(currentValue, lowerBound, upperBound, q1, q3);
        const type = currentValue > upperBound ? 'spike' : 'dip';

        anomalies.push({
          date: currentDate,
          value: currentValue,
          expectedValue: mean,
          deviation: Math.round(deviation * 100) / 100,
          severity,
          type,
          description: this.generateAnomalyDescription(type, deviation, severity)
        });
      }
    }

    return anomalies;
  }

  private calculateMean(values: number[]): number {
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  private calculateStandardDeviation(values: number[], mean: number): number {
    const variance = values.reduce((sum, value) => 
      sum + Math.pow(value - mean, 2), 0
    ) / values.length;
    return Math.sqrt(variance);
  }

  private calculatePercentile(sortedValues: number[], percentile: number): number {
    const index = (percentile / 100) * (sortedValues.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;

    if (upper >= sortedValues.length) {
      return sortedValues[sortedValues.length - 1];
    }

    return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
  }

  private determineSeverity(zScore: number, threshold: number): 'low' | 'medium' | 'high' {
    if (zScore > threshold * 2) return 'high';
    if (zScore > threshold * 1.5) return 'medium';
    return 'low';
  }

  private calculateIQRSeverity(
    value: number, 
    lowerBound: number, 
    upperBound: number, 
    q1: number, 
    q3: number
  ): 'low' | 'medium' | 'high' {
    const iqr = q3 - q1;
    const distanceFromBounds = Math.min(
      Math.abs(value - lowerBound),
      Math.abs(value - upperBound)
    );

    if (distanceFromBounds > iqr) return 'high';
    if (distanceFromBounds > iqr * 0.5) return 'medium';
    return 'low';
  }

  private generateAnomalyDescription(
    type: 'spike' | 'dip' | 'outlier',
    deviation: number,
    severity: 'low' | 'medium' | 'high'
  ): string {
    const direction = type === 'spike' ? 'increased' : 'decreased';
    const magnitude = Math.abs(deviation);
    
    let description = `${type === 'spike' ? '📈 Spike' : '📉 Dip'} detected: `;
    description += `Value ${direction} by ${magnitude.toFixed(1)}% `;
    description += `(${severity} severity)`;

    return description;
  }

  private generateInsights(anomalies: AnomalyPoint[], data: Array<{ date: string; value: number }>): string[] {
    const insights: string[] = [];

    if (anomalies.length === 0) {
      insights.push('✅ No significant anomalies detected');
      return insights;
    }

    // Count by type
    const spikes = anomalies.filter(a => a.type === 'spike').length;
    const dips = anomalies.filter(a => a.type === 'dip').length;

    if (spikes > dips) {
      insights.push(`📈 More spikes than dips detected (${spikes} vs ${dips})`);
    } else if (dips > spikes) {
      insights.push(`📉 More dips than spikes detected (${dips} vs ${spikes})`);
    }

    // Severity distribution
    const highSeverity = anomalies.filter(a => a.severity === 'high').length;
    if (highSeverity > 0) {
      insights.push(`⚠️ ${highSeverity} high-severity anomalies require attention`);
    }

    // Recent anomalies
    const recentAnomalies = anomalies.slice(-3);
    if (recentAnomalies.length > 0) {
      const latest = recentAnomalies[recentAnomalies.length - 1];
      insights.push(`🔍 Latest anomaly: ${latest.description}`);
    }

    // Pattern analysis
    const anomalyRate = (anomalies.length / data.length) * 100;
    if (anomalyRate > 10) {
      insights.push(`⚠️ High anomaly rate: ${anomalyRate.toFixed(1)}% of data points`);
    } else if (anomalyRate < 2) {
      insights.push(`✅ Low anomaly rate: ${anomalyRate.toFixed(1)}% of data points`);
    }

    return insights;
  }

  private calculatePeriod(data: Array<{ date: string; value: number }>): string {
    if (data.length < 2) return 'Unknown';

    const firstDate = new Date(data[0].date);
    const lastDate = new Date(data[data.length - 1].date);
    const diffDays = Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 7) return '7 days';
    if (diffDays <= 30) return '30 days';
    if (diffDays <= 90) return '90 days';
    return `${diffDays} days`;
  }

  // Detect anomalies in specific metrics
  async detectRevenueAnomalies(
    data: Array<{ date: string; value: number }>,
    threshold: number = 2.0
  ): Promise<AnomalyResult> {
    return this.detectAnomalies(data, 'zscore', threshold);
  }

  async detectConversionAnomalies(
    data: Array<{ date: string; value: number }>
  ): Promise<AnomalyResult> {
    // Conversion rates are better detected with IQR due to their bounded nature
    return this.detectAnomalies(data, 'iqr');
  }

  // Get anomaly summary for dashboard
  getAnomalySummary(anomalies: AnomalyPoint[]): {
    total: number;
    spikes: number;
    dips: number;
    highSeverity: number;
    recentAnomalies: AnomalyPoint[];
  } {
    return {
      total: anomalies.length,
      spikes: anomalies.filter(a => a.type === 'spike').length,
      dips: anomalies.filter(a => a.type === 'dip').length,
      highSeverity: anomalies.filter(a => a.severity === 'high').length,
      recentAnomalies: anomalies.slice(-5) // Last 5 anomalies
    };
  }
}

// Export singleton instance
export const anomalyDetector = AnomalyDetector.getInstance();