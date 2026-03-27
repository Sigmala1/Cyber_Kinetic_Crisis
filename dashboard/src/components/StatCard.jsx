import React from 'react';

export default function StatCard({ title, value, icon, type = 'neutral', subtitle }) {
  let valueColor = 'var(--text-primary)';
  if (type === 'danger') valueColor = 'var(--danger)';
  if (type === 'warning') valueColor = 'var(--warning)';
  if (type === 'success') valueColor = 'var(--success)';

  return (
    <div className="glass-panel flex-col" style={{ padding: '20px', flex: 1 }}>
      <div className="flex items-center gap-2 text-muted" style={{ marginBottom: '16px' }}>
        {icon}
        <span style={{ fontWeight: 500 }}>{title}</span>
      </div>
      <div style={{ fontSize: '2.5rem', fontWeight: 700, color: valueColor, lineHeight: 1 }}>
        {value}
      </div>
      {subtitle && (
        <div className="text-muted" style={{ fontSize: '0.875rem', marginTop: '12px' }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}
