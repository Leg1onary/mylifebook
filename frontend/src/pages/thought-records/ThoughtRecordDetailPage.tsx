import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { thoughtRecordsApi } from '@/api/thoughtRecords';
import { COGNITIVE_DISTORTIONS } from '@/lib/constants';
import { formatDate } from '@/lib/dates';

export function ThoughtRecordDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: record, isLoading, error } = useQuery({
    queryKey: ['thought-record', id],
    queryFn: () => thoughtRecordsApi.getById(Number(id)),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => thoughtRecordsApi.delete(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thought-records'] });
      navigate('/today');
    },
  });

  if (isLoading) return <div className="page-loading"><div className="spinner" /></div>;
  if (error || !record) return (
    <div className="page-error">
      <p>Запись не найдена</p>
      <Link to="/today" className="btn btn-primary">На главную</Link>
    </div>
  );

  const FIELDS = [
    { label: 'Ситуация', value: record.situation_text },
    { label: 'Автоматическая мысль', value: record.automatic_thought_text },
    { label: 'Значение', value: record.meaning_text },
    { label: 'Страх', value: record.fear_text },
    { label: 'Старый закон', value: record.old_law_text },
    { label: 'Реакция тела', value: record.body_reaction_text },
    { label: 'Действие', value: record.action_taken_text },
    { label: 'Доказательства «за»', value: record.evidence_for_text },
    { label: 'Доказательства «против»', value: record.evidence_against_text },
    { label: 'Игнорируемые факты', value: record.ignored_facts_text },
    { label: 'Сбалансированная мысль', value: record.balanced_thought_text },
    { label: 'Новое действие', value: record.new_action_text },
  ];

  const distortionNames = (record.distortions ?? []).map(
    (code: string) => COGNITIVE_DISTORTIONS.find(d => d.code === code)?.name ?? code
  );

  return (
    <div className="detail-page">
      <div className="detail-header">
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-icon" aria-label="Назад">
          ←
        </button>
        <div>
          <h1>Запись мышления</h1>
          <time className="detail-date">{formatDate(record.created_at)}</time>
        </div>
        <button
          onClick={() => {
            if (confirm('Удалить эту запись?')) deleteMutation.mutate();
          }}
          className="btn btn-ghost btn-icon text-error"
          aria-label="Удалить"
        >
          🗑
        </button>
      </div>

      {(record.emotion_before_score || record.emotion_after_score) && (
        <div className="emotion-scores">
          <div className="score-item">
            <span className="score-label">До</span>
            <span className="score-value">{record.emotion_before_score}/10</span>
          </div>
          <div className="score-arrow">→</div>
          <div className="score-item">
            <span className="score-label">После</span>
            <span className="score-value">{record.emotion_after_score}/10</span>
          </div>
        </div>
      )}

      <div className="detail-fields">
        {FIELDS.map(({ label, value }) =>
          value ? (
            <div key={label} className="detail-field">
              <span className="detail-field-label">{label}</span>
              <p className="detail-field-value">{value}</p>
            </div>
          ) : null
        )}
      </div>

      {distortionNames.length > 0 && (
        <div className="detail-section">
          <h3>Когнитивные искажения</h3>
          <div className="distortions-list">
            {distortionNames.map(name => (
              <span key={name} className="tag">{name}</span>
            ))}
          </div>
        </div>
      )}

      {record.trigger_event_id && (
        <div className="detail-section">
          <Link to={`/triggers/${record.trigger_event_id}`} className="btn btn-ghost btn-sm">
            Связанный триггер →
          </Link>
        </div>
      )}
    </div>
  );
}
