import React from 'react';
import type { AIWeeklySummaryResponse } from '@/api/ai';
import styles from './AIWeeklySummaryCard.module.css';

/**
 * Accepts either a legacy plain string (stored in WeeklyReview.ai_summary)
 * or the full AIWeeklySummaryResponse object from a fresh POST /ai/weekly-summary.
 * This covers both the "just saved" case and the "loaded from DB" case.
 */
type Props =
  | { summary: string; full?: never }
  | { summary?: never; full: AIWeeklySummaryResponse };

function Section({ label, items }: { label: string; items: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div className={styles.section}>
      <span className={styles.sectionLabel}>{label}</span>
      <ul className={styles.list}>
        {items.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
    </div>
  );
}

export function AIWeeklySummaryCard({ summary, full }: Props) {
  return (
    <div className={styles.card} role="region" aria-label="AI-резюме недели">
      <div className={styles.header}>
        <span className={styles.badge}>🤖 AI-резюме</span>
      </div>

      {/* Main summary text — always present */}
      <div className={styles.summaryText}>
        {(full?.summary ?? summary ?? '').split('\n').filter(Boolean).map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>

      {/* Extended sections — only present in full AIWeeklySummaryResponse */}
      {full && (
        <>
          <Section
            label="Доминирующие паттерны"
            items={full.dominant_patterns}
          />
          <Section
            label="Признаки прогресса"
            items={full.progress_signs}
          />
          <Section
            label="Вопросы на следующую неделю"
            items={full.questions_for_next_week}
          />
        </>
      )}
    </div>
  );
}
