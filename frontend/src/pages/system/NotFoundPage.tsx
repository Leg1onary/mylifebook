import React from 'react';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="system-page">
      <div className="empty-state">
        <div className="empty-state-icon" style={{ fontSize: '3rem' }}>🔍</div>
        <h2>Страница не найдена</h2>
        <p>Такой страницы не существует</p>
        <Link to="/today" className="btn btn-primary">На главную</Link>
      </div>
    </div>
  );
}
