<template>
  <div class="cost-trend-chart bg-[var(--theme-bg-primary)] rounded-lg p-4 border border-[var(--theme-border)]">
    <div class="flex justify-between items-center mb-3">
      <h2 class="text-lg font-semibold text-[var(--theme-text-primary)]">
        Cost Trends ({{ hours }}h)
      </h2>
      <div class="flex gap-2">
        <button
          v-for="h in [6, 12, 24]"
          :key="h"
          @click="hours = h; fetchTrends()"
          :class="[
            'px-2 py-1 text-xs rounded transition-all',
            hours === h
              ? 'bg-[var(--theme-accent)] text-white'
              : 'text-[var(--theme-text-secondary)] hover:bg-[var(--theme-bg-secondary)]'
          ]"
        >
          {{ h }}h
        </button>
      </div>
    </div>

    <!-- Chart Container -->
    <div class="chart-container h-48 relative">
      <!-- Loading State -->
      <div v-if="loading" class="absolute inset-0 flex items-center justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--theme-accent)]"></div>
      </div>

      <!-- No Data State -->
      <div v-else-if="trends.length === 0" class="absolute inset-0 flex items-center justify-center text-[var(--theme-text-secondary)]">
        <div class="text-center">
          <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          <p class="text-sm">No cost data available</p>
        </div>
      </div>

      <!-- SVG Chart -->
      <svg v-else class="w-full h-full" :viewBox="`0 0 ${chartWidth} ${chartHeight}`" preserveAspectRatio="none">
        <!-- Grid Lines -->
        <g class="grid-lines">
          <line
            v-for="i in 5"
            :key="`h-${i}`"
            :x1="padding"
            :y1="padding + (chartInnerHeight / 4) * (i - 1)"
            :x2="chartWidth - padding"
            :y2="padding + (chartInnerHeight / 4) * (i - 1)"
            stroke="var(--theme-border)"
            stroke-width="1"
            stroke-dasharray="4,4"
          />
        </g>

        <!-- Baseline Cost Area (light gray) -->
        <path
          :d="baselineAreaPath"
          fill="var(--theme-text-secondary)"
          fill-opacity="0.1"
        />

        <!-- Actual Cost Area (accent color) -->
        <path
          :d="actualAreaPath"
          fill="var(--theme-accent)"
          fill-opacity="0.2"
        />

        <!-- Baseline Cost Line -->
        <path
          :d="baselineLinePath"
          fill="none"
          stroke="var(--theme-text-secondary)"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <!-- Actual Cost Line -->
        <path
          :d="actualLinePath"
          fill="none"
          stroke="var(--theme-accent)"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <!-- Data Points -->
        <g class="data-points">
          <circle
            v-for="(point, idx) in chartPoints"
            :key="`actual-${idx}`"
            :cx="point.x"
            :cy="point.actualY"
            r="3"
            fill="var(--theme-accent)"
            class="cursor-pointer hover:r-4 transition-all"
            @mouseenter="showTooltip($event, point)"
            @mouseleave="hideTooltip"
          />
        </g>
      </svg>

      <!-- Tooltip -->
      <div
        v-if="tooltip.visible"
        class="absolute bg-[var(--theme-bg-primary)] border border-[var(--theme-border)] rounded-lg shadow-lg px-3 py-2 text-xs z-10 pointer-events-none"
        :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
      >
        <div class="font-medium text-[var(--theme-text-primary)]">{{ tooltip.time }}</div>
        <div class="text-[var(--theme-text-secondary)]">
          Actual: <span class="text-[var(--theme-accent)] font-medium">${{ tooltip.actual }}</span>
        </div>
        <div class="text-[var(--theme-text-secondary)]">
          Baseline: <span class="font-medium">${{ tooltip.baseline }}</span>
        </div>
        <div class="text-green-500 font-medium">
          Saved: ${{ tooltip.savings }}
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="flex justify-center gap-6 mt-3 text-xs text-[var(--theme-text-secondary)]">
      <div class="flex items-center gap-1">
        <div class="w-3 h-0.5 bg-[var(--theme-accent)]"></div>
        <span>Actual Cost</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-3 h-0.5 bg-[var(--theme-text-secondary)]"></div>
        <span>Baseline Cost</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 bg-green-500/20 border border-green-500 rounded-sm"></div>
        <span>Savings</span>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="grid grid-cols-3 gap-4 mt-4 pt-3 border-t border-[var(--theme-border)]">
      <div class="text-center">
        <div class="text-xs text-[var(--theme-text-secondary)]">Total Baseline</div>
        <div class="text-sm font-semibold text-[var(--theme-text-primary)]">${{ totalBaseline.toFixed(4) }}</div>
      </div>
      <div class="text-center">
        <div class="text-xs text-[var(--theme-text-secondary)]">Total Actual</div>
        <div class="text-sm font-semibold text-[var(--theme-accent)]">${{ totalActual.toFixed(4) }}</div>
      </div>
      <div class="text-center">
        <div class="text-xs text-[var(--theme-text-secondary)]">Total Saved</div>
        <div class="text-sm font-semibold text-green-500">${{ totalSavings.toFixed(4) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

// Types
interface TrendPoint {
  timestamp: number;
  actual_cost: number;
  baseline_cost: number;
  savings: number;
  transaction_count: number;
}

interface ChartPoint {
  x: number;
  actualY: number;
  baselineY: number;
  data: TrendPoint;
}

// State
const loading = ref(true);
const hours = ref(24);
const trends = ref<TrendPoint[]>([]);

// Tooltip state
const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  time: '',
  actual: '',
  baseline: '',
  savings: ''
});

// Chart dimensions
const chartWidth = 400;
const chartHeight = 200;
const padding = 20;
const chartInnerWidth = chartWidth - padding * 2;
const chartInnerHeight = chartHeight - padding * 2;

// Auto-refresh
let refreshInterval: number | null = null;

// Computed values
const totalBaseline = computed(() => trends.value.reduce((sum, t) => sum + t.baseline_cost, 0));
const totalActual = computed(() => trends.value.reduce((sum, t) => sum + t.actual_cost, 0));
const totalSavings = computed(() => trends.value.reduce((sum, t) => sum + t.savings, 0));

const maxValue = computed(() => {
  if (trends.value.length === 0) return 1;
  const max = Math.max(...trends.value.map(t => Math.max(t.actual_cost, t.baseline_cost)));
  return max > 0 ? max * 1.1 : 1; // Add 10% padding
});

const chartPoints = computed<ChartPoint[]>(() => {
  if (trends.value.length === 0) return [];

  return trends.value.map((point, idx) => {
    const x = padding + (idx / (trends.value.length - 1 || 1)) * chartInnerWidth;
    const actualY = padding + chartInnerHeight - (point.actual_cost / maxValue.value) * chartInnerHeight;
    const baselineY = padding + chartInnerHeight - (point.baseline_cost / maxValue.value) * chartInnerHeight;

    return { x, actualY, baselineY, data: point };
  });
});

const actualLinePath = computed(() => {
  if (chartPoints.value.length === 0) return '';
  return chartPoints.value.map((p, i) =>
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.actualY}`
  ).join(' ');
});

const baselineLinePath = computed(() => {
  if (chartPoints.value.length === 0) return '';
  return chartPoints.value.map((p, i) =>
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.baselineY}`
  ).join(' ');
});

const actualAreaPath = computed(() => {
  if (chartPoints.value.length === 0) return '';
  const linePath = actualLinePath.value;
  const firstX = chartPoints.value[0].x;
  const lastX = chartPoints.value[chartPoints.value.length - 1].x;
  const bottomY = padding + chartInnerHeight;
  return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
});

const baselineAreaPath = computed(() => {
  if (chartPoints.value.length === 0) return '';
  const linePath = baselineLinePath.value;
  const firstX = chartPoints.value[0].x;
  const lastX = chartPoints.value[chartPoints.value.length - 1].x;
  const bottomY = padding + chartInnerHeight;
  return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
});

// Methods
async function fetchTrends() {
  try {
    loading.value = true;
    const response = await fetch(`http://localhost:4000/api/routing/trends?hours=${hours.value}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const result = await response.json();
    if (result.success) {
      trends.value = result.data;
    }
  } catch (err) {
    console.error('Error fetching trends:', err);
  } finally {
    loading.value = false;
  }
}

function showTooltip(event: MouseEvent, point: ChartPoint) {
  const rect = (event.target as SVGElement).closest('svg')?.getBoundingClientRect();
  if (!rect) return;

  const date = new Date(point.data.timestamp);
  tooltip.value = {
    visible: true,
    x: event.clientX - rect.left + 10,
    y: event.clientY - rect.top - 60,
    time: date.toLocaleTimeString(),
    actual: point.data.actual_cost.toFixed(4),
    baseline: point.data.baseline_cost.toFixed(4),
    savings: point.data.savings.toFixed(4)
  };
}

function hideTooltip() {
  tooltip.value.visible = false;
}

// Lifecycle
onMounted(async () => {
  await fetchTrends();

  // Auto-refresh every 30 seconds
  refreshInterval = window.setInterval(() => {
    fetchTrends();
  }, 30000);
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
</script>

<style scoped>
.chart-container {
  position: relative;
}

.data-points circle {
  transition: r 0.2s;
}

.data-points circle:hover {
  r: 5;
}
</style>
