<template>
  <div class="routing-dashboard h-full flex flex-col bg-[var(--theme-bg-secondary)] p-4 overflow-auto">
    <!-- Dashboard Header -->
    <div class="dashboard-header mb-6">
      <h1 class="text-2xl font-bold text-[var(--theme-text-primary)] mb-2">
        Intelligent Routing Analytics
      </h1>
      <p class="text-sm text-[var(--theme-text-secondary)]">
        Real-time cost savings and routing effectiveness metrics
      </p>
    </div>

    <!-- Hero Metrics Row -->
    <div class="hero-metrics grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <!-- Cost Savings Widget (Hero Metric) -->
      <div class="metric-card bg-[var(--theme-bg-primary)] rounded-lg p-4 border border-[var(--theme-border)]">
        <div class="metric-label text-xs font-medium text-[var(--theme-text-secondary)] uppercase mb-1">
          Total Savings Today
        </div>
        <div class="metric-value text-3xl font-bold text-green-500">
          {{ formatCurrency(summary.total_savings_usd) }}
        </div>
        <div class="metric-change text-sm text-[var(--theme-text-secondary)] mt-1">
          {{ formatPercentage(summary.savings_percentage) }} reduction
        </div>
      </div>

      <!-- Transaction Count -->
      <div class="metric-card bg-[var(--theme-bg-primary)] rounded-lg p-4 border border-[var(--theme-border)]">
        <div class="metric-label text-xs font-medium text-[var(--theme-text-secondary)] uppercase mb-1">
          Total Transactions
        </div>
        <div class="metric-value text-3xl font-bold text-[var(--theme-text-primary)]">
          {{ summary.total_transactions }}
        </div>
        <div class="metric-change text-sm text-[var(--theme-text-secondary)] mt-1">
          Last 100 decisions
        </div>
      </div>

      <!-- Cost Accuracy -->
      <div class="metric-card bg-[var(--theme-bg-primary)] rounded-lg p-4 border border-[var(--theme-border)]">
        <div class="metric-label text-xs font-medium text-[var(--theme-text-secondary)] uppercase mb-1">
          Cost Accuracy
        </div>
        <div class="metric-value text-3xl font-bold text-blue-500">
          {{ formatPercentage(summary.average_cost_accuracy * 100) }}
        </div>
        <div class="metric-change text-sm text-[var(--theme-text-secondary)] mt-1">
          Estimation accuracy
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="charts-row grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      <!-- Model Distribution Chart (Placeholder) -->
      <div class="chart-card bg-[var(--theme-bg-primary)] rounded-lg p-4 border border-[var(--theme-border)]">
        <h2 class="text-lg font-semibold text-[var(--theme-text-primary)] mb-3">
          Model Distribution
        </h2>
        <div class="chart-content flex items-center justify-center h-64 text-[var(--theme-text-secondary)]">
          <!-- Temporary: Showing percentages as bars -->
          <div class="w-full space-y-3">
            <div class="model-bar">
              <div class="flex justify-between mb-1">
                <span class="text-sm">Haiku (Fast)</span>
                <span class="text-sm font-medium">{{ formatPercentage(summary.haiku_percentage) }}</span>
              </div>
              <div class="w-full bg-[var(--theme-bg-secondary)] rounded-full h-2">
                <div
                  class="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  :style="{ width: summary.haiku_percentage + '%' }"
                ></div>
              </div>
            </div>
            <div class="model-bar">
              <div class="flex justify-between mb-1">
                <span class="text-sm">Sonnet (Standard)</span>
                <span class="text-sm font-medium">{{ formatPercentage(summary.sonnet_percentage) }}</span>
              </div>
              <div class="w-full bg-[var(--theme-bg-secondary)] rounded-full h-2">
                <div
                  class="bg-purple-500 h-2 rounded-full transition-all duration-500"
                  :style="{ width: summary.sonnet_percentage + '%' }"
                ></div>
              </div>
            </div>
            <div class="model-bar">
              <div class="flex justify-between mb-1">
                <span class="text-sm">Opus (Advanced)</span>
                <span class="text-sm font-medium">{{ formatPercentage(summary.opus_percentage) }}</span>
              </div>
              <div class="w-full bg-[var(--theme-bg-secondary)] rounded-full h-2">
                <div
                  class="bg-amber-500 h-2 rounded-full transition-all duration-500"
                  :style="{ width: summary.opus_percentage + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cost Trend Chart -->
      <CostTrendChart />
    </div>

    <!-- Recent Decisions Table -->
    <RoutingDecisionsTable />

    <!-- Loading State -->
    <div v-if="loading" class="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
      <div class="bg-[var(--theme-bg-primary)] rounded-lg p-6 shadow-lg">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--theme-accent)] mx-auto"></div>
        <p class="text-[var(--theme-text-secondary)] mt-4">Loading routing data...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg">
      <p class="font-medium">Error loading routing data</p>
      <p class="text-sm">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import CostTrendChart from './CostTrendChart.vue';
import RoutingDecisionsTable from './RoutingDecisionsTable.vue';

// Data interfaces
interface RoutingSummary {
  total_transactions: number;
  total_cost_usd: number;
  total_savings_usd: number;
  savings_percentage: number;
  haiku_percentage: number;
  sonnet_percentage: number;
  opus_percentage: number;
  average_cost_accuracy: number;
  recent_decisions: number;
}

// State
const loading = ref(true);
const error = ref<string | null>(null);
const summary = ref<RoutingSummary>({
  total_transactions: 0,
  total_cost_usd: 0,
  total_savings_usd: 0,
  savings_percentage: 0,
  haiku_percentage: 0,
  sonnet_percentage: 0,
  opus_percentage: 0,
  average_cost_accuracy: 0,
  recent_decisions: 0
});

// Auto-refresh timer
let refreshInterval: number | null = null;

// Fetch routing summary from API
async function fetchRoutingSummary() {
  try {
    loading.value = true;
    error.value = null;

    const response = await fetch('http://localhost:4000/api/routing/summary');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    if (result.success) {
      summary.value = result.data;
    } else {
      throw new Error('Failed to load routing summary');
    }
  } catch (err) {
    console.error('Error fetching routing summary:', err);
    error.value = err instanceof Error ? err.message : 'Unknown error';
  } finally {
    loading.value = false;
  }
}

// Format currency
function formatCurrency(value: number): string {
  return `$${value.toFixed(4)}`;
}

// Format percentage
function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

// Lifecycle
onMounted(async () => {
  await fetchRoutingSummary();

  // Auto-refresh every 10 seconds
  refreshInterval = window.setInterval(() => {
    fetchRoutingSummary();
  }, 10000);
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
</script>

<style scoped>
.routing-dashboard {
  scrollbar-width: thin;
  scrollbar-color: var(--theme-border) var(--theme-bg-secondary);
}

.routing-dashboard::-webkit-scrollbar {
  width: 8px;
}

.routing-dashboard::-webkit-scrollbar-track {
  background: var(--theme-bg-secondary);
}

.routing-dashboard::-webkit-scrollbar-thumb {
  background: var(--theme-border);
  border-radius: 4px;
}

.routing-dashboard::-webkit-scrollbar-thumb:hover {
  background: var(--theme-text-secondary);
}

.metric-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.chart-card {
  transition: transform 0.2s;
}

.chart-card:hover {
  transform: translateY(-1px);
}
</style>
