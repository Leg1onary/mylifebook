import React from 'react';

interface Props {
  summary: string;
}

export function AIWeeklySummaryCard({ summary }: Props) {
  return (
    <div className="ai-card ai-card-weekly">
      <div className="ai-card-header">
        <span className="ai-badge">🤖 AI-резюме</span>
      </div>
      <div className="ai-card-text ai-weekly-text">
        {summary.split('\n').filter(Boolean).map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
    </div>
  );
}
