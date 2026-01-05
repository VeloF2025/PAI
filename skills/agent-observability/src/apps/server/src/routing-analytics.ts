/**
 * routing-analytics.ts
 *
 * Routing Analytics API Module
 * Provides REST API endpoints for routing dashboard
 *
 * Endpoints:
 * - GET /api/routing/summary - Current routing statistics
 * - GET /api/routing/savings - Savings reports (today/week/month)
 * - GET /api/routing/decisions - Recent routing decisions
 * - GET /api/routing/retries - Retry detections
 * - GET /api/routing/trends - Cost trends over time
 * - GET /api/routing/distribution - Model distribution stats
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import Database from 'bun:sqlite';

/**
 * Get storage paths for routing data
 */
function getStoragePaths() {
  const baseDir = process.env.PAI_DIR || process.env.HOME || process.cwd();
  const metricsDir = join(baseDir, '.claude', 'metrics');

  return {
    routingDecisions: join(metricsDir, 'routing-decisions.jsonl'),
    tokenTracking: join(metricsDir, 'token-tracking.jsonl'),
    metricsDb: join(metricsDir, 'routing-metrics.db'),
  };
}

/**
 * Load data from JSONL file
 */
function loadJSONL<T>(filePath: string, limit?: number): T[] {
  if (!existsSync(filePath)) {
    return [];
  }

  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.trim().split('\n').filter(line => line.trim());

    // Apply limit if specified
    const dataLines = limit ? lines.slice(-limit) : lines;

    return dataLines.map(line => JSON.parse(line) as T);
  } catch (error) {
    console.error(`Error loading JSONL from ${filePath}:`, error);
    return [];
  }
}

/**
 * Get current routing summary
 */
export function getRoutingSummary() {
  const paths = getStoragePaths();

  // Load recent tracking data (last 100 entries)
  const trackingData = loadJSONL<any>(paths.tokenTracking, 100);

  if (trackingData.length === 0) {
    return {
      success: true,
      data: {
        total_transactions: 0,
        total_cost_usd: 0,
        total_savings_usd: 0,
        savings_percentage: 0,
        haiku_percentage: 0,
        sonnet_percentage: 0,
        opus_percentage: 0,
        average_cost_accuracy: 0,
        recent_decisions: 0,
      }
    };
  }

  // Calculate statistics
  let totalCost = 0;
  let totalBaseline = 0;
  let totalSavings = 0;
  let haikuCount = 0;
  let sonnetCount = 0;
  let opusCount = 0;
  let totalCostAccuracy = 0;

  for (const data of trackingData) {
    totalCost += data.actual_cost_usd || 0;
    totalBaseline += data.baseline_cost_usd || 0;
    totalSavings += data.actual_savings_usd || 0;
    totalCostAccuracy += data.cost_accuracy || 0;

    if (data.selected_model.includes('haiku')) haikuCount++;
    else if (data.selected_model.includes('sonnet')) sonnetCount++;
    else if (data.selected_model.includes('opus')) opusCount++;
  }

  const totalTransactions = trackingData.length;
  const haikuPercentage = (haikuCount / totalTransactions) * 100;
  const sonnetPercentage = (sonnetCount / totalTransactions) * 100;
  const opusPercentage = (opusCount / totalTransactions) * 100;
  const savingsPercentage = totalBaseline > 0 ? (totalSavings / totalBaseline) * 100 : 0;
  const averageCostAccuracy = totalCostAccuracy / totalTransactions;

  return {
    success: true,
    data: {
      total_transactions: totalTransactions,
      total_cost_usd: totalCost,
      total_savings_usd: totalSavings,
      savings_percentage: savingsPercentage,
      haiku_percentage: haikuPercentage,
      sonnet_percentage: sonnetPercentage,
      opus_percentage: opusPercentage,
      average_cost_accuracy: averageCostAccuracy,
      recent_decisions: totalTransactions,
    }
  };
}

/**
 * Get savings reports
 */
export function getSavingsReports(period: 'today' | 'week' | 'month' = 'today') {
  const paths = getStoragePaths();

  if (!existsSync(paths.metricsDb)) {
    return {
      success: false,
      error: 'No savings data available yet',
    };
  }

  try {
    const db = new Database(paths.metricsDb, { readonly: true });

    // Query savings reports table
    const query = `
      SELECT * FROM savings_reports
      WHERE period = ?
      ORDER BY period_start DESC
      LIMIT 1
    `;

    const report = db.prepare(query).get(period);
    db.close();

    if (!report) {
      return {
        success: false,
        error: `No ${period} report available`,
      };
    }

    return {
      success: true,
      data: report,
    };
  } catch (error) {
    console.error('Error loading savings report:', error);
    return {
      success: false,
      error: 'Failed to load savings report',
    };
  }
}

/**
 * Get recent routing decisions
 */
export function getRecentDecisions(limit: number = 50) {
  const paths = getStoragePaths();
  const decisions = loadJSONL<any>(paths.routingDecisions, limit);

  return {
    success: true,
    data: decisions.reverse(), // Most recent first
  };
}

/**
 * Get retry detections
 */
export function getRetryDetections(limit: number = 20) {
  const paths = getStoragePaths();

  if (!existsSync(paths.metricsDb)) {
    return {
      success: true,
      data: [],
    };
  }

  try {
    const db = new Database(paths.metricsDb, { readonly: true });

    const query = `
      SELECT * FROM retry_detections
      ORDER BY time_between_ms DESC
      LIMIT ?
    `;

    const retries = db.prepare(query).all(limit);
    db.close();

    return {
      success: true,
      data: retries,
    };
  } catch (error) {
    console.error('Error loading retry detections:', error);
    return {
      success: true,
      data: [],
    };
  }
}

/**
 * Get cost trends over time
 */
export function getCostTrends(hours: number = 24) {
  const paths = getStoragePaths();
  const trackingData = loadJSONL<any>(paths.tokenTracking);

  // Filter by time window
  const now = Date.now();
  const startTime = now - (hours * 60 * 60 * 1000);

  const recentData = trackingData.filter(
    data => data.timestamp >= startTime && data.timestamp <= now
  );

  // Group by hour
  const hourlyData: Record<number, { actual: number; baseline: number; savings: number; count: number }> = {};

  for (const data of recentData) {
    const hourKey = Math.floor(data.timestamp / (60 * 60 * 1000)) * (60 * 60 * 1000);

    if (!hourlyData[hourKey]) {
      hourlyData[hourKey] = { actual: 0, baseline: 0, savings: 0, count: 0 };
    }

    hourlyData[hourKey].actual += data.actual_cost_usd || 0;
    hourlyData[hourKey].baseline += data.baseline_cost_usd || 0;
    hourlyData[hourKey].savings += data.actual_savings_usd || 0;
    hourlyData[hourKey].count += 1;
  }

  // Convert to array format for charting
  const trends = Object.entries(hourlyData).map(([timestamp, data]) => ({
    timestamp: parseInt(timestamp),
    actual_cost: data.actual,
    baseline_cost: data.baseline,
    savings: data.savings,
    transaction_count: data.count,
  })).sort((a, b) => a.timestamp - b.timestamp);

  return {
    success: true,
    data: trends,
  };
}

/**
 * Get model distribution statistics
 */
export function getModelDistribution() {
  const paths = getStoragePaths();
  const trackingData = loadJSONL<any>(paths.tokenTracking);

  const distribution = {
    haiku: { count: 0, cost: 0, tokens: 0 },
    sonnet: { count: 0, cost: 0, tokens: 0 },
    opus: { count: 0, cost: 0, tokens: 0 },
  };

  for (const data of trackingData) {
    const model = data.selected_model.toLowerCase();
    const tokens = (data.actual_input_tokens || 0) + (data.actual_output_tokens || 0);

    if (model.includes('haiku')) {
      distribution.haiku.count++;
      distribution.haiku.cost += data.actual_cost_usd || 0;
      distribution.haiku.tokens += tokens;
    } else if (model.includes('sonnet')) {
      distribution.sonnet.count++;
      distribution.sonnet.cost += data.actual_cost_usd || 0;
      distribution.sonnet.tokens += tokens;
    } else if (model.includes('opus')) {
      distribution.opus.count++;
      distribution.opus.cost += data.actual_cost_usd || 0;
      distribution.opus.tokens += tokens;
    }
  }

  const total = distribution.haiku.count + distribution.sonnet.count + distribution.opus.count;

  return {
    success: true,
    data: {
      haiku: {
        ...distribution.haiku,
        percentage: total > 0 ? (distribution.haiku.count / total) * 100 : 0,
      },
      sonnet: {
        ...distribution.sonnet,
        percentage: total > 0 ? (distribution.sonnet.count / total) * 100 : 0,
      },
      opus: {
        ...distribution.opus,
        percentage: total > 0 ? (distribution.opus.count / total) * 100 : 0,
      },
      total_transactions: total,
    },
  };
}

/**
 * Get routing accuracy metrics
 */
export function getAccuracyMetrics() {
  const paths = getStoragePaths();
  const trackingData = loadJSONL<any>(paths.tokenTracking, 100);

  if (trackingData.length === 0) {
    return {
      success: true,
      data: {
        average_token_accuracy: 0,
        average_cost_accuracy: 0,
        average_savings_accuracy: 0,
        sample_size: 0,
      },
    };
  }

  let totalInputAccuracy = 0;
  let totalOutputAccuracy = 0;
  let totalCostAccuracy = 0;
  let totalSavingsAccuracy = 0;

  for (const data of trackingData) {
    totalInputAccuracy += data.input_token_accuracy || 0;
    totalOutputAccuracy += data.output_token_accuracy || 0;
    totalCostAccuracy += data.cost_accuracy || 0;
    totalSavingsAccuracy += data.savings_accuracy || 0;
  }

  const sampleSize = trackingData.length;

  return {
    success: true,
    data: {
      average_input_token_accuracy: totalInputAccuracy / sampleSize,
      average_output_token_accuracy: totalOutputAccuracy / sampleSize,
      average_cost_accuracy: totalCostAccuracy / sampleSize,
      average_savings_accuracy: totalSavingsAccuracy / sampleSize,
      sample_size: sampleSize,
    },
  };
}
