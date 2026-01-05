/**
 * Apex Design System Constants
 * Copy this DESIGN object into any component that needs styling
 * Based on UI_DESIGN_SYSTEM.md - the authoritative source
 */

export const DESIGN = {
  // Primary brand colors
  primaryCyan: "#00E5CC",
  cyanBright: "#00FFE0",
  cyanMuted: "#00B8A3",
  accentPurple: "#8B5CF6",
  purpleLight: "#A78BFA",
  accentPink: "#EC4899",
  accentBlue: "#3B82F6",

  // Semantic colors
  successGreen: "#22C55E",
  warningYellow: "#F59E0B",
  errorRed: "#EF4444",
  infoBlue: "#3B82F6",

  // Backgrounds (from darkest to lightest)
  bgDeep: "#02030A",      // Page background
  bgBase: "#060812",      // Section background
  bgElevated: "#0A0D1A",  // Elevated surfaces
  bgCard: "#0F1225",      // Card backgrounds
  bgCardHover: "#151935", // Card hover state
  bgInput: "#0D1020",     // Input fields

  // Text colors
  textPrimary: "#FFFFFF",
  textSecondary: "#94A3B8",
  textMuted: "#64748B",
  textAccent: "#00E5CC",
  textLink: "#60A5FA",

  // Borders (rgba-based)
  borderSubtle: "rgba(255, 255, 255, 0.05)",
  borderDefault: "rgba(255, 255, 255, 0.08)",
  borderStrong: "rgba(255, 255, 255, 0.12)",
  borderAccent: "rgba(0, 229, 204, 0.3)",
  borderGlow: "rgba(0, 229, 204, 0.5)",
} as const;

// Backwards compatibility alias
export const DESIGN_COLORS = DESIGN;

/**
 * Opacity hex suffixes for semi-transparent colors
 * Usage: `${DESIGN.bgCard}B3` = 70% opacity
 */
export const OPACITY = {
  100: "FF",
  90: "E6",
  80: "CC",
  70: "B3", // Modal default
  60: "99",
  50: "80",
  40: "66",
  30: "4D",
  20: "33", // Borders, accents
  10: "1A",
  8: "15",  // Glow shadows
  5: "0D",
} as const;

/**
 * Common shadow patterns
 */
export const SHADOWS = {
  // Cyan glow for standard modals/primary elements
  cyanGlow: `0 0 40px ${DESIGN.primaryCyan}15, 0 25px 50px -12px rgba(0, 0, 0, 0.5)`,

  // Red glow for destructive actions
  redGlow: `0 0 40px ${DESIGN.errorRed}15, 0 25px 50px -12px rgba(0, 0, 0, 0.5)`,

  // Purple glow for accent elements
  purpleGlow: `0 0 40px ${DESIGN.accentPurple}15, 0 25px 50px -12px rgba(0, 0, 0, 0.5)`,

  // Subtle card shadow
  card: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",

  // Primary card glow
  primaryCard: `0 0 20px ${DESIGN.primaryCyan}15`,
} as const;

/**
 * AI Platform colors for monitoring badges
 */
export const AI_PLATFORMS = [
  { id: "chatgpt", name: "ChatGPT", color: "#10A37F" },
  { id: "claude", name: "Claude", color: "#D97757" },
  { id: "gemini", name: "Gemini", color: "#4285F4" },
  { id: "perplexity", name: "Perplexity", color: "#20B8CD" },
  { id: "grok", name: "Grok", color: "#FFFFFF" },
  { id: "deepseek", name: "DeepSeek", color: "#6366F1" },
  { id: "copilot", name: "Copilot", color: "#0078D4" },
] as const;
