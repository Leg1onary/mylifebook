import React from 'react';

interface Props {
  alternativeThought: string;
  rationale?: string;
  onUse?: (text: string) => void;
  onDismiss?: () => void;
}

export function AIReframeCard({ alternativeThought, rationale, onUse, onDismiss }: Props) {
  return (
    <div className="ai-card" role="region" aria-label="Предложение AI">
      <div className="ai-card-header">
        <span className="ai-badge">🤖 AI</span>
        {onDismiss && (
          <button className="btn btn-ghost btn-xs" onClick={onDismiss} aria-label="Закрыть">✕</button>
        )}
      </div>
      <p className="ai-card-text">{alternativeThought}</p>
      {rationale && (
        <p className="ai-card-rationale text-muted text-sm">{rationale}</p>
      )}
      {onUse && (
        <button
          className="btn btn-ghost btn-xs mt-1"
          onClick={() => onUse(alternativeThought)}
        >
          Использовать этот вариант
        </button>
      )}
    </div>
  );
}
