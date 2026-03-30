import React from 'react';
import { Lock, ShieldOff } from 'lucide-react';
import { TIER_CONFIG } from '../tiers';

/**
 * ISO 27001 Security Tier Badge
 * Displays tier classification with 2FA compliance status per Control 8.5.
 *
 * Props:
 *   tier    — number 1–4
 *   has2FA  — boolean
 *   mini    — boolean (compact inline variant for component rows)
 */
export default function SecurityTierBadge({ tier, has2FA, mini = false }) {
  const config = TIER_CONFIG[tier] || TIER_CONFIG[4];
  const violation = config.requires2FA && !has2FA;

  if (mini) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        padding: '2px 8px', borderRadius: '20px',
        fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.3px',
        color: config.color,
        background: config.bg,
        border: `1px solid ${config.border}`,
        whiteSpace: 'nowrap',
      }}>
        {config.shortLabel} · {config.label}
        {violation && <ShieldOff size={10} style={{ color: '#ff7b72', marginLeft: '2px' }} />}
      </span>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
      {/* Main tier pill */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        padding: '5px 14px', borderRadius: '20px',
        fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.5px',
        color: config.color,
        background: config.bg,
        border: `1px solid ${config.border}`,
      }}>
        <span>{config.shortLabel} · {config.label}</span>
        {config.requires2FA && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '3px',
            fontSize: '0.65rem', fontWeight: 600, opacity: 0.85,
          }}>
            <Lock size={10} />
            2FA REQ
          </span>
        )}
      </div>

      {/* 2FA violation sub-badge */}
      {violation && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          padding: '3px 10px', borderRadius: '6px',
          fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.4px',
          color: '#ff7b72',
          background: 'rgba(248, 81, 73, 0.12)',
          border: '1px solid rgba(255, 123, 114, 0.35)',
        }}>
          <ShieldOff size={11} />
          2FA NOT CONFIGURED — ISO 27001 § 8.5 VIOLATION
        </div>
      )}
    </div>
  );
}
