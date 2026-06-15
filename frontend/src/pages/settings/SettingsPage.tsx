import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { settingsApi } from '@/api/settings';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { logout } = useAuth();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.get().then(r => r.data),
  });

  const { register, handleSubmit, formState: { isDirty } } = useForm({
    values: {
      timezone: settings?.timezone ?? 'Europe/Moscow',
      theme: settings?.theme ?? 'system',
      ai_enabled: settings?.ai_enabled ?? true,
      reminder_morning_enabled: settings?.reminder_morning_enabled ?? false,
      reminder_evening_enabled: settings?.reminder_evening_enabled ?? false,
      reminder_morning_time: settings?.reminder_morning_time ?? '09:00',
      reminder_evening_time: settings?.reminder_evening_time ?? '21:00',
    },
  });

  const saveMutation = useMutation({
    mutationFn: (d: any) => settingsApi.update(d).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] }),
  });

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (isLoading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Настройки</h1>
      </div>

      <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} className="settings-form">

        <section className="settings-section">
          <h3>Отображение</h3>
          <div className="form-field">
            <label>Тема</label>
            <select {...register('theme')}>
              <option value="system">Системная</option>
              <option value="light">Светлая</option>
              <option value="dark">Тёмная</option>
            </select>
          </div>
          <div className="form-field">
            <label>Часовой пояс</label>
            <select {...register('timezone')}>
              <option value="Europe/Moscow">Москва (UTC+3)</option>
              <option value="Europe/Kaliningrad">Калининград (UTC+2)</option>
              <option value="Asia/Yekaterinburg">Екатеринбург (UTC+5)</option>
              <option value="Asia/Novosibirsk">Новосибирск (UTC+7)</option>
              <option value="Asia/Vladivostok">Владивосток (UTC+10)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </section>

        <section className="settings-section">
          <h3>AI-ассистент</h3>
          <div className="form-field form-field-toggle">
            <label>Включить AI-помощь</label>
            <input type="checkbox" {...register('ai_enabled')} />
          </div>
          <p className="settings-hint">AI помогает переосмыслить мысли и строит недельные резюме через OpenRouter</p>
        </section>

        <section className="settings-section">
          <h3>Напоминания</h3>
          <div className="form-field form-field-toggle">
            <label>Утреннее напоминание</label>
            <input type="checkbox" {...register('reminder_morning_enabled')} />
          </div>
          <div className="form-field">
            <label>Время утра</label>
            <input type="time" {...register('reminder_morning_time')} />
          </div>
          <div className="form-field form-field-toggle">
            <label>Вечернее напоминание</label>
            <input type="checkbox" {...register('reminder_evening_enabled')} />
          </div>
          <div className="form-field">
            <label>Время вечера</label>
            <input type="time" {...register('reminder_evening_time')} />
          </div>
        </section>

        <button
          type="submit"
          className="btn btn-primary btn-full"
          disabled={!isDirty || saveMutation.isPending}
        >
          {saveMutation.isPending ? 'Сохранение...' : 'Сохранить настройки'}
        </button>
      </form>

      <div className="settings-section settings-section-danger">
        <h3>Аккаунт</h3>
        <button className="btn btn-ghost btn-full text-error" onClick={handleLogout}>
          Выйти из аккаунта
        </button>
      </div>
    </div>
  );
}
