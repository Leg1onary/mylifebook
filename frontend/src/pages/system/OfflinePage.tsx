import React from 'react';

export function OfflinePage() {
  return (
    <div className="system-page">
      <div className="empty-state">
        <div className="empty-state-icon" style={{ fontSize: '3rem' }}>📡</div>
        <h2>Нет соединения</h2>
        <p>Проверь интернет-соединение. Некоторые функции недоступны офлайн.</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Попробовать снова
        </button>
      </div>
    </div>
  );
}
