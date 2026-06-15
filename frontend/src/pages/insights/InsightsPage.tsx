import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { insightsApi } from '@/api/insights';
import { Page } from '@/components/layout/Page';

const PERIODS = [
  { label: '7 дней', days: 7 },
  { label: '14 дней', days: 14 },
  { label: '30 дней', days: 30 },
];

// Цвета линий: primary, muted teal, warning, error, success
const TEAL     = '#01696f';
const TEAL_MID = '#4f98a3';
const ORANGE   = '#bb653b';
const RED      = '#a12c7b';
const PURPLE   = '#a86fdf';
const CHART_COLORS = [TEAL, TEAL_MID, ORANGE, '#6daa45', PURPLE];

export default function InsightsPage() {
  const [days, setDays] = useState(14);

  const { data: moodTrend, isLoading: loadingMood } = useQuery({
    queryKey: ['insights', 'mood-trend', days],
    queryFn: () => insightsApi.moodTrend(days).then(r => r.data),
  });

  const { data: triggerCats, isLoading: loadingTriggers } = useQuery({
    queryKey: ['insights', 'trigger-categories', days],
    queryFn: () => insightsApi.triggerCategories(days).then(r => r.data),
  });

  const { data: distortions, isLoading: loadingDist } = useQuery({
    queryKey: ['insights', 'distortions', days],
    queryFn: () => insightsApi.distortions(days).then(r => r.data),
  });

  const { data: scriptStats } = useQuery({
    queryKey: ['insights', 'script-stats', days],
    queryFn: () => insightsApi.scriptStats(days).then(r => r.data),
  });

  return (
    <Page>
      <div className="page-header">
        <h1>Аналитима</h1>
      </div>

      {/* Period selector */}
      <div className="period-selector">
        {PERIODS.map(p => (
          <button
            key={p.days}
            className={`period-btn ${days === p.days ? 'active' : ''}`}
            onClick={() => setDays(p.days)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Настроение + энергия (mood trend) */}
      <div className="card insights-card">
        <h3>Динамика настроения</h3>
        {loadingMood ? (
          <div className="skeleton skeleton-image" />
        ) : moodTrend?.length ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={moodTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={[1, 10]} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: 12,
                }}
              />
              <Line type="monotone" dataKey="mood"    stroke={TEAL}     strokeWidth={2} dot={false} name="Настроение" />
              <Line type="monotone" dataKey="energy"  stroke={TEAL_MID} strokeWidth={2} dot={false} name="Энергия" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-muted">Недостаточно данных</p>
        )}
      </div>

      {/* ТЗ п.20: anxiety + shame + loneliness trend */}
      <div className="card insights-card">
        <h3>Тревога, стыд, одиночество</h3>
        {loadingMood ? (
          <div className="skeleton skeleton-image" />
        ) : moodTrend?.length ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={moodTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: 12,
                }}
              />
              <Line type="monotone" dataKey="anxiety"    stroke={ORANGE}  strokeWidth={2} dot={false} name="Тревога" />
              <Line type="monotone" dataKey="shame"      stroke={RED}     strokeWidth={2} dot={false} name="Стыд" />
              <Line type="monotone" dataKey="loneliness" stroke={PURPLE}  strokeWidth={2} dot={false} name="Одиночество" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-muted">Недостаточно данных</p>
        )}
      </div>

      {/* Триггеры по категориям */}
      <div className="card insights-card">
        <h3>Триггеры по категориям</h3>
        {loadingTriggers ? (
          <div className="skeleton skeleton-image" />
        ) : triggerCats?.length ? (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={triggerCats} layout="vertical" margin={{ left: 20, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="category" tick={{ fontSize: 11 }} width={80} />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: 12,
                }}
              />
              <Bar dataKey="count" fill={TEAL} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-muted">Нет триггеров за период</p>
        )}
      </div>

      {/* Когнитивные искажения */}
      <div className="card insights-card">
        <h3>Когнитивные искажения</h3>
        {loadingDist ? (
          <div className="skeleton skeleton-image" />
        ) : distortions?.length ? (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={distortions} dataKey="count" nameKey="distortion" cx="50%" cy="50%" outerRadius={70}>
                {distortions.map((_: { count: number; distortion: string }, index: number) => (
                  <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Legend formatter={(value: string) => <span style={{ fontSize: 11 }}>{value}</span>} />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-muted">Нет данных об искажениях</p>
        )}
      </div>

      {/* Паттерны / scriptStats */}
      {scriptStats && Object.keys(scriptStats).length > 0 && (
        <div className="card insights-card">
          <h3>Паттерны</h3>
          <div className="stats-grid">
            {Object.entries(scriptStats as Record<string, unknown>).map(([key, val]) => (
              <div key={key} className="stat-item">
                <span className="stat-label">{key}</span>
                <span className="stat-value">{String(val)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Page>
  );
}
