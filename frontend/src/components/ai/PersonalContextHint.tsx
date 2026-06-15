import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { personalContextApi } from '@/api/personalContext';

export function PersonalContextHint() {
  const { data: context } = useQuery({
    queryKey: ['personal-context'],
    queryFn: personalContextApi.get,
    staleTime: 5 * 60 * 1000,
  });

  if (!context?.grounding_phrases?.length) return null;

  const phrase = context.grounding_phrases[
    Math.floor(Math.random() * context.grounding_phrases.length)
  ];

  return (
    <div className="context-hint">
      <span className="context-hint-icon">💬</span>
      <p className="context-hint-text">{phrase}</p>
    </div>
  );
}
