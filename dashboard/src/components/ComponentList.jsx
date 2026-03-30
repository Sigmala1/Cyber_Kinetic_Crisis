import React, { useState } from 'react';
import { ChevronDown, ChevronRight, ShieldCheck, ShieldAlert, ShieldOff } from 'lucide-react';
import SecurityTierBadge from './SecurityTierBadge';
import { TIER_CONFIG } from '../tiers';

/**
 * Collapsible sub-component inventory for a device card.
 * Each component shows its ISO 27001 tier, cyber state, and 2FA compliance.
 */
export default function ComponentList({ components }) {
  const [expanded, setExpanded] = useState(false);

  if (!components || components.length === 0) return null;

  const violationCount = components.filter(c => {
    const conf = TIER_CONFIG[c.securityTier];
    return conf && conf.requires2FA && !c.has2FA;
  }).length;

  return (
    <div style={{
      marginTop: '12px',
      borderTop: '1px solid var(--glass-border)',
      paddingTop: '12px',
    }}>
      {/* Toggle button */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          background: 'none', border: 'none', padding: '4px 0',
          color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600,
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
          width: '100%', justifyContent: 'space-between',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          Sub-Components ({components.length})
        </span>
        {violationCount > 0 && (
          <span style={{
            fontSize: '0.68rem', fontWeight: 700,
            color: '#ff7b72',
            background: 'rgba(248,81,73,0.12)',
            border: '1px solid rgba(255,123,114,0.3)',
            padding: '2px 8px', borderRadius: '12px',
            display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            <ShieldOff size={10} /> {violationCount} 2FA {violationCount === 1 ? 'Violation' : 'Violations'}
          </span>
        )}
      </button>

      {/* Expanded component rows */}
      {expanded && (
        <div
          className="component-list-expand"
          style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}
        >
          {components.map((comp, i) => {
            const tierConf = TIER_CONFIG[comp.securityTier] || TIER_CONFIG[4];
            const hasViolation = tierConf.requires2FA && !comp.has2FA;
            const isDanger = comp.cyberState === 'Compromised';
            const isWarning = comp.cyberState === 'Warning';

            return (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 12px', borderRadius: '8px', gap: '8px', flexWrap: 'wrap',
                  background: hasViolation
                    ? 'rgba(248, 81, 73, 0.07)'
                    : 'rgba(0, 0, 0, 0.2)',
                  border: hasViolation
                    ? '1px solid rgba(248, 81, 73, 0.22)'
                    : '1px solid transparent',
                  transition: 'background 0.2s ease',
                }}
              >
                {/* Component name */}
                <span style={{ fontSize: '0.8rem', fontWeight: 500, flex: 1, minWidth: '100px' }}>
                  {comp.name}
                </span>

                {/* Right side: tier badge + cyber state */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <SecurityTierBadge tier={comp.securityTier} has2FA={comp.has2FA} mini />

                  {/* Cyber state indicator */}
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '3px',
                    fontSize: '0.68rem', fontWeight: 700,
                    color: isDanger ? 'var(--danger)' : isWarning ? 'var(--warning)' : '#3fb950',
                  }}>
                    {isDanger
                      ? <ShieldAlert size={12} />
                      : isWarning
                      ? <ShieldOff size={12} />
                      : <ShieldCheck size={12} />
                    }
                    {comp.cyberState}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
