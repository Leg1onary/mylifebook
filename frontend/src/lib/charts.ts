import type { InsightsResponse } from '@/api/insights';

/** Map theme CSS variables to resolved hex for Recharts (Recharts can't read CSS vars) */
export const CHART_COLORS = {
  mood:       '#4f98a3',
  anxiety:    '#d4813a',
  shame:      '#a86fdf',
  loneliness: '#5591c7',
  anger:      '#d16374',
  energy:     '#6daa45',
  primary:    '#4f98a3',
  primaryMid: '#3d8490',
} as const;

/** Light-mode overrides — used when data-theme="light" is set */
export const CHART_COLORS_LIGHT = {
  mood:       '#01696f',
  anxiety:    '#964219',
  shame:      '#7a39bb',
  loneliness: '#006494',
  anger:      '#a12c7b',
  energy:     '#437a22',
  primary:    '#01696f',
  primaryMid: '#0c4e54',
} as const;

/** Returns chart tooltip styles consistent with the app theme */
export function tooltipStyle(): React.CSSProperties {
  return {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    fontSize: 12,
    color: 'var(--color-text)',
  };
}

/** Normalize InsightsResponse trend arrays by date so all series align */
export function alignTrends(data: InsightsResponse) {
  const dates = data.mood_trend.map(p => p.date);
  const byDate = (arr: Array<{ date: string; value: number }>) => {
    const map = Object.fromEntries(arr.map(p => [p.date, p.value]));
    return dates.map(d => ({ date: d, value: map[d] ?? null }));
  };
  return {
    dates,
    mood:       data.mood_trend,
    anxiety:    byDate(data.anxiety_trend),
    shame:      byDate(data.shame_trend),
    loneliness: byDate(data.loneliness_trend),
  };
}
