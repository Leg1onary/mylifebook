import React from 'react';
import type { AIReframe } from '@/types';
import styles from './AIReframeCard.module.css';

interface Props {
  reframe: AIReframe;
  /** Called when user clicks "Использовать" — receives alternative_thought text */
  onUse?: (text: string) => void;
  onDismiss?: () => void;
}

export function AIReframeCard({ reframe, onUse, onDismiss }: Props) {
  // Crisis path: AI was skipped, show hotline message only
  if (reframe.crisis) {
    return (
      <div className={styles.crisis} role="alert">
        <div className={styles.header}>
          <span className={styles.badge}>⚠️ Важно</span>
          {onDismiss && (
            <button
              className="btn btn-ghost btn-xs"
              onClick={onDismiss}
              aria-label="Закрыть"
            >✕</button>
          )}
        </div>
        <p className={styles.crisisText}>
          {reframe.message ?? 'Если тебе сейчас очень плохо — позвони на горячую линию: 8-800-2000-122 (бесплатно).'}
        </p>
      </div>
    );
  }

  return (
    <div className={styles.card} role="region" aria-label="Предложение AI">
      <div className={styles.header}>
        <span className={styles.badge}>🤖 AI</span>
        {onDismiss && (
          <button
            className="btn btn-ghost btn-xs"
            onClick={onDismiss}
            aria-label="Закрыть"
          >✕</button>
        )}
      </div>

      {/* Main reframe paragraph */}
      <p className={styles.text}>{reframe.reframe}</p>

      {/* Alternative thought — the concrete reworded belief */}
      {reframe.alternative_thought && (
        <div className={styles.alternativeWrap}>
          <span className={styles.sectionLabel}>Альтернативная мысль</span>
          <p className={styles.alternative}>{reframe.alternative_thought}</p>
        </div>
      )}

      {/* Old law spotted */}
      {reframe.old_law_spotted && (
        <div className={styles.lawSpotted}>
          <span className={styles.sectionLabel}>Старый закон</span>
          <p className={styles.lawText}>{reframe.old_law_spotted}</p>
        </div>
      )}

      {/* Cognitive distortions list */}
      {reframe.cognitive_distortions && reframe.cognitive_distortions.length > 0 && (
        <div className={styles.distortions}>
          <span className={styles.sectionLabel}>Когнитивные искажения</span>
          <ul className={styles.distortionsList}>
            {reframe.cognitive_distortions.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggested action */}
      {reframe.suggested_action && (
        <div className={styles.action}>
          <span className={styles.sectionLabel}>Предлагаемое действие</span>
          <p className={styles.actionText}>{reframe.suggested_action}</p>
        </div>
      )}

      {onUse && (
        <button
          className="btn btn-ghost btn-xs"
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
