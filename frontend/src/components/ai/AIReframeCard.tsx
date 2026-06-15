import React from 'react';
import type { AIReframe } from '@/types';
import styles from './AIReframeCard.module.css';

interface Props {
  reframe: AIReframe;
  onUse?: (text: string) => void;
  onDismiss?: () => void;
}

export function AIReframeCard({ reframe, onUse, onDismiss }: Props) {
  return (
    <div className={styles.card} role='region' aria-label='Предложение AI'>
      <div className={styles.header}>
        <span className={styles.badge}>🤖 AI</span>
        {onDismiss && (
          <button
            className='btn btn-ghost btn-xs'
            onClick={onDismiss}
            aria-label='Закрыть'
          >
            ✕
          </button>
        )}
      </div>

      <p className={styles.text}>{reframe.alternative_thought}</p>

      {reframe.rationale && (
        <p className={styles.rationale}>{reframe.rationale}</p>
      )}

      {reframe.socratic_questions && reframe.socratic_questions.length > 0 && (
        <div className={styles.questions}>
          <p className={styles.questionsLabel}>Вопросы для размышления:</p>
          <ul className={styles.questionsList}>
            {reframe.socratic_questions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </div>
      )}

      {onUse && (
        <button
          className='btn btn-ghost btn-xs'
          style={{ marginTop: 'var(--space-2)' }}
          onClick={() => onUse(reframe.alternative_thought)}
        >
          Использовать этот вариант
        </button>
      )}
    </div>
  );
}

export default AIReframeCard;
