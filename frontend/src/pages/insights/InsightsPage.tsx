import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, ResponsiveContainer,
} from 'recharts';
import { insightsApi, type InsightsPeriod } from '@/api/insights';
import { Page } from '@/components/layout/Page';
import styles from './InsightsPage.module.css';

const PERIODS: Array<{ label: string; period: InsightsPeriod }> = [
  { label: '7 дней', period: '7d' },
  { label: '30 дней', period: '30d' },
  { label: '90 дней', period: '90d' },
];

const TEAL     = '#01696f';
const TEAL_MID = '#4f98a3';
const ORANGE   = '#bb653b';
const RED      = '#a12c7b';
const PURPLE   = '#a86fdf';

export default function InsightsPage() {
  const [period, setPeriod] = useState<InsightsPeriod>('30d');

  const { data, isLoading } = useQuery({
    queryKey: ['insights', period],
    queryFn: () => insightsApi.get(period),
  });

  const moodTrend = (data?.mood_trend ?? []).map((item, i) => ({
    date: item.date,
    mood:       item.value,
    anxiety:    data?.anxiety_trend[i]?.value    ?? null,
    shame:      data?.shame_trend[i]?.value      ?? null,
    loneliness: data?.loneliness_trend[i]?.value ?? null,
  }));

  return (
    <Page>
      <div className={styles.header}>
        <h1>Аналитика</h1>
      </div>

      <div className={styles.periodSelector}>
        {PERIODS.map(p => (
          <button
            key={p.period}
            className={`${styles.periodBtn} ${period === p.period ? styles.periodBtnActive : ''}`}
            onClick={() => setPeriod(p.period)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className={`card ${styles.insightsCard}`}>
        <h3>Динамика настроения</h3>
        {isLoading ? (
          <div className={`skeleton ${styles.skeletonChart}`} />
        ) : moodTrend.length ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={moodTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={[1, 10]} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: 12 }} />
              <Line type="monotone" dataKey="mood" stroke={TEAL} strokeWidth={2} dot={false} name="Настроение" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className={styles.empty}>Недостаточно данных</p>
        )}
      </div>

      <div className={`card ${styles.insightsCard}`}>
        <h3>Тревога, стыд, одиночество</h3>
        {isLoading ? (
          <div className={`skeleton ${styles.skeletonChart}`} />
        ) : moodTrend.length ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={moodTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: 12 }} />
              <Line type="monotone" dataKey="anxiety"    stroke={ORANGE} strokeWidth={2} dot={false} name="Тревога" />
              <Line type="monotone" dataKey="shame"      stroke={RED}    strokeWidth={2} dot={false} name="Стыд" />
              <Line type="monotone" dataKey="loneliness" stroke={PURPLE} strokeWidth={2} dot={false} name="Одиночество" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className={styles.empty}>Недостаточно данных</p>
        )}
      </div>

      <div className={`card ${styles.insightsCard}`}>
        <h3>Триггеры по категориям</h3>
        {isLoading ? (
          <div className={`skeleton ${styles.skeletonChart}`} />
        ) : data?.trigger_categories?.length ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.trigger_categories} layout="vertical" margin={{ left: 20, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="category" tick={{ fontSize: 11 }} width={100} />
              <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: 12 }} />
              <Bar dataKey="count" fill={TEAL} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className={styles.empty}>Нет триггеров за период</p>
        )}
      </div>

      <div className={`card ${styles.insightsCard}`}>
        <h3>Старые законы</h3>
        {isLoading ? (
          <div className={`skeleton ${styles.skeletonChart}`} />
        ) : data?.old_laws_frequency?.length ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.old_laws_frequency} layout="vertical" margin={{ left: 20, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="law" tick={{ fontSize: 11 }} width={140} />
              <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: 12 }} />
              <Bar dataKey="count" fill={TEAL_MID} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className={styles.empty}>Нет данных по старым законам</p>
        )}
      </div>

      {data && (
        <div className={`card ${styles.insightsCard}`}>
          <h3>Сводка</h3>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}><span className={styles.statLabel}>Серия чекинов</span><span className={styles.statValue}>{data.checkins_streak}</span></div>
            <div className={styles.statItem}><span className={styles.statLabel}>Всего чекинов</span><span className={styles.statValue}>{data.checkins_total}</span></div>
            <div className={styles.statItem}><span className={styles.statLabel}>Триггеров</span><span className={styles.statValue}>{data.triggers_total}</span></div>
            <div className={styles.statItem}><span className={styles.statLabel}>Записей мышления</span><span className={styles.statValue}>{data.tr_total}</span></div>
            <div className={styles.statItem}><span className={styles.statLabel}>Завершено экспериментов</span><span className={styles.statValue}>{data.experiments_completed}</span></div>
            <div className={styles.statItem}><span className={styles.statLabel}>Активных экспериментов</span><span className={styles.statValue}>{data.experiments_active}</span></div>
          </div>
        </div>
      )}
    </Page>
  );
}
