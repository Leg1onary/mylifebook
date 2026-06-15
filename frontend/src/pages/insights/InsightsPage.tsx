import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { insightsApi } from '@/api/insights';

const PERIODS = [
  { label: '7 дней', days: 7 },
  { label: '14 дней', days: 14 },
  { label: '30 дней', days: 30 },
];

const CHART_COLORS = ['#01696f', '#4f98a3', '#bb653b', '#6daa45', '#a86fdf'];

export function InsightsPage() {
  const [days, setDays] = useState(14);

  const { data: moodTrend, isLoading: loadingMood } = useQuery({
    queryKey: ['insights', 'mood-trend', days],
    queryFn: () => insightsApi.moodTrend(days),
  });

  const { data: triggerCats, isLoading: loadingTriggers } = useQuery({
    queryKey: ['insights', 'trigger-categories', days],
    queryFn: () => insightsApi.triggerCategories(days),
  });

  const { data: distortions, isLoading: loadingDist } = useQuery({
    queryKey: ['insights', 'distortions', days],
    queryFn: () => insightsApi.distortions(days),
  });

  const { data: scriptStats } = useQuery({
    queryKey: ['insights', 'script-stats', days],
    queryFn: () => insightsApi.scriptStats(days),
  });

  return (
    <div className="page">
      <div className="page-header">
        <h1>Аналитика</h1>
      </div>

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

      {/* Mood trend */}
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
              <Tooltip />
              <Line type="monotone" dataKey="mood" stroke="#01696f" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="energy" stroke="#4f98a3" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-muted">Недостаточно данных</p>
        )}
      </div>

      {/* Trigger categories */}
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
              <Tooltip />
              <Bar dataKey="count" fill="#01696f" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-muted">Нет триггеров за период</p>
        )}
      </div>

      {/* Cognitive distortions */}
      <div className="card insights-card">
        <h3>Когнитивные искажения</h3>
        {loadingDist ? (
          <div className="skeleton skeleton-image" />
        ) : distortions?.length ? (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={distortions} dataKey="count" nameKey="distortion" cx="50%" cy="50%" outerRadius={70}>
                {distortions.map((_: any, index: number) => (
                  <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Legend formatter={(value: string) => <span style={{ fontSize: 11 }}>{value}</span>} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-muted">Нет данных об искажениях</p>
        )}
      </div>

      {/* Script stats */}
      {scriptStats && (
        <div className="card insights-card">
          <h3>Паттерны</h3>
          <div className="stats-grid">
            {Object.entries(scriptStats).map(([key, val]) => (
              <div key={key} className="stat-item">
                <span className="stat-label">{key}</span>
                <span className="stat-value">{String(val)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
