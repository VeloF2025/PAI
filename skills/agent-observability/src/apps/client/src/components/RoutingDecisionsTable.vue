<template>
  <div class="routing-decisions-table bg-[var(--theme-bg-primary)] rounded-lg p-4 border border-[var(--theme-border)]">
    <div class="flex justify-between items-center mb-3">
      <h2 class="text-lg font-semibold text-[var(--theme-text-primary)]">
        Recent Routing Decisions
      </h2>
      <div class="flex items-center gap-2">
        <select
          v-model="limit"
          @change="fetchDecisions"
          class="text-xs bg-[var(--theme-bg-secondary)] text-[var(--theme-text-primary)] border border-[var(--theme-border)] rounded px-2 py-1"
        >
          <option :value="10">10 entries</option>
          <option :value="25">25 entries</option>
          <option :value="50">50 entries</option>
        </select>
        <button
          @click="fetchDecisions"
          class="text-xs px-2 py-1 bg-[var(--theme-bg-secondary)] text-[var(--theme-text-secondary)] rounded hover:bg-[var(--theme-accent)] hover:text-white transition-all"
        >
          Refresh
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--theme-accent)]"></div>
    </div>

    <!-- No Data State -->
    <div v-else-if="decisions.length === 0" class="text-center py-8 text-[var(--theme-text-secondary)]">
      <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <p class="text-sm">No routing decisions recorded yet</p>
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-[var(--theme-border)] text-left text-xs text-[var(--theme-text-secondary)] uppercase">
            <th class="pb-2 pr-4">Time</th>
            <th class="pb-2 pr-4">Model</th>
            <th class="pb-2 pr-4">Complexity</th>
            <th class="pb-2 pr-4">Est. Cost</th>
            <th class="pb-2 pr-4">Confidence</th>
            <th class="pb-2">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(decision, idx) in decisions"
            :key="idx"
            class="border-b border-[var(--theme-border)]/50 hover:bg-[var(--theme-bg-secondary)] transition-colors"
          >
            <td class="py-2 pr-4 text-[var(--theme-text-secondary)]">
              {{ formatTime(decision.timestamp) }}
            </td>
            <td class="py-2 pr-4">
              <span :class="getModelClass(decision.selected_model)">
                {{ getModelLabel(decision.selected_model) }}
              </span>
            </td>
            <td class="py-2 pr-4">
              <span :class="getComplexityClass(decision.complexity_score)">
                {{ decision.complexity_score?.toFixed(2) || 'N/A' }}
              </span>
            </td>
            <td class="py-2 pr-4 text-[var(--theme-text-primary)]">
              ${{ decision.estimated_cost?.toFixed(5) || '0.00000' }}
            </td>
            <td class="py-2 pr-4">
              <div class="flex items-center gap-1">
                <div class="w-16 bg-[var(--theme-bg-secondary)] rounded-full h-1.5">
                  <div
                    class="h-1.5 rounded-full transition-all"
                    :class="getConfidenceClass(decision.confidence)"
                    :style="{ width: (decision.confidence * 100) + '%' }"
                  ></div>
                </div>
                <span class="text-xs text-[var(--theme-text-secondary)]">
                  {{ (decision.confidence * 100).toFixed(0) }}%
                </span>
              </div>
            </td>
            <td class="py-2">
              <span
                :class="[
                  'px-2 py-0.5 rounded-full text-xs',
                  decision.fallback_used
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-green-500/20 text-green-400'
                ]"
              >
                {{ decision.fallback_used ? 'Fallback' : 'Direct' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Stats Summary -->
    <div v-if="decisions.length > 0" class="flex justify-between items-center mt-3 pt-3 border-t border-[var(--theme-border)] text-xs text-[var(--theme-text-secondary)]">
      <span>Showing {{ decisions.length }} decisions</span>
      <div class="flex gap-4">
        <span>
          Haiku: <span class="text-blue-400 font-medium">{{ modelCounts.haiku }}</span>
        </span>
        <span>
          Sonnet: <span class="text-purple-400 font-medium">{{ modelCounts.sonnet }}</span>
        </span>
        <span>
          Opus: <span class="text-amber-400 font-medium">{{ modelCounts.opus }}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

// Types
interface RoutingDecision {
  timestamp: number;
  selected_model: string;
  complexity_score: number;
  estimated_cost: number;
  confidence: number;
  fallback_used: boolean;
  token_estimate: number;
  reasoning?: string;
}

// State
const loading = ref(true);
const limit = ref(25);
const decisions = ref<RoutingDecision[]>([]);

// Auto-refresh
let refreshInterval: number | null = null;

// Computed values
const modelCounts = computed(() => {
  const counts = { haiku: 0, sonnet: 0, opus: 0 };
  decisions.value.forEach(d => {
    if (d.selected_model.includes('haiku')) counts.haiku++;
    else if (d.selected_model.includes('sonnet')) counts.sonnet++;
    else if (d.selected_model.includes('opus')) counts.opus++;
  });
  return counts;
});

// Methods
async function fetchDecisions() {
  try {
    loading.value = true;
    const response = await fetch(`http://localhost:4000/api/routing/decisions?limit=${limit.value}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const result = await response.json();
    if (result.success) {
      decisions.value = result.data;
    }
  } catch (err) {
    console.error('Error fetching decisions:', err);
  } finally {
    loading.value = false;
  }
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString();
}

function getModelLabel(model: string): string {
  if (model.includes('haiku')) return 'Haiku';
  if (model.includes('sonnet')) return 'Sonnet';
  if (model.includes('opus')) return 'Opus';
  return model;
}

function getModelClass(model: string): string {
  const base = 'px-2 py-0.5 rounded text-xs font-medium';
  if (model.includes('haiku')) return `${base} bg-blue-500/20 text-blue-400`;
  if (model.includes('sonnet')) return `${base} bg-purple-500/20 text-purple-400`;
  if (model.includes('opus')) return `${base} bg-amber-500/20 text-amber-400`;
  return `${base} bg-gray-500/20 text-gray-400`;
}

function getComplexityClass(score: number): string {
  const base = 'text-xs font-medium';
  if (score < 0.3) return `${base} text-green-400`;
  if (score < 0.6) return `${base} text-yellow-400`;
  return `${base} text-red-400`;
}

function getConfidenceClass(confidence: number): string {
  if (confidence >= 0.8) return 'bg-green-500';
  if (confidence >= 0.6) return 'bg-yellow-500';
  return 'bg-red-500';
}

// Lifecycle
onMounted(async () => {
  await fetchDecisions();

  // Auto-refresh every 15 seconds
  refreshInterval = window.setInterval(() => {
    fetchDecisions();
  }, 15000);
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
</script>

<style scoped>
table {
  border-collapse: collapse;
}
</style>
