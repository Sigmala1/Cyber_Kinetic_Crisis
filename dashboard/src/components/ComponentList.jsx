import React, { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, XCircle, Activity, ShieldAlert, ShieldCheck } from 'lucide-react';

/**
 * Collapsible sub-component audit for a device card.
 * Each component shows its fulfillment of basic health obligations (Condition & Cyber State).
 */
export default function ComponentList({ components }) {
  const [expanded, setExpanded] = useState(false);

  if (!components || components.length === 0) return null;

  // Flatten component obligations to count unmet status
  const allCompObligations = components.flatMap(c => c.obligations || []);
  const unmetCount = allCompObligations.filter(o => o.status === 'unmet').length;

  return (
    <div style={{
      marginTop: '12px',
      borderTop: '1px solid var(--glass-border)',
      paddingTop: '12px',
    }}>
      {/* ── Toggle Header ── */}
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
          Component Accountability ({components.length})
        </span>
        {unmetCount > 0 && (
          <span style={{
            fontSize: '0.65rem', fontWeight: 700,
            color: '#ffab70',
            background: 'rgba(255,171,112,0.1)',
            border: '1px solid rgba(255,171,112,0.3)',
            padding: '1px 8px', borderRadius: '12px',
            display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            <Activity size={10} /> {unmetCount} Unmet {unmetCount === 1 ? 'Duty' : 'Duties'}
          </span>
        )}
      </button>

      {/* ── Expanded Audit Rows ── */}
      {expanded && (
        <div
          className="component-list-expand"
          style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}
        >
          {components.map((comp, i) => {
            const conditionOb = comp.obligations?.find(o => o.id === 'condition');
            const stateOb     = comp.obligations?.find(o => o.id === 'cyber-state');
            
            const isAllMet = !comp.obligations?.some(o => o.status === 'unmet');

            return (
              <div
                key={i}
                style={{
                  display: 'flex', flexDirection: 'column',
                  padding: '10px', borderRadius: '8px', gap: '4px',
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: isAllMet ? '1px solid transparent' : '1px solid rgba(255,171,112,0.2)',
                }}
              >
                <div className="flex justify-between items-center" style={{ marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {comp.name}
                  </span>
                  {isAllMet 
                    ? <CheckCircle2 size={12} style={{ color: '#3fb950' }} /> 
                    : <ShieldAlert size={12} style={{ color: '#ffab70' }} />
                  }
                </div>

                <div className="flex gap-4">
                  {/* Condition Mini-Audit */}
                  <div className="flex items-center gap-2" style={{ fontSize: '0.68rem' }}>
                    {conditionOb?.status === 'met' 
                      ? <ShieldCheck size={11} style={{ color: '#3fb950' }} /> 
                      : <XCircle size={11} style={{ color: '#ffab70' }} />
                    }
                    <span className="text-muted">Health:</span>
                    <span style={{ color: conditionOb?.status === 'met' ? 'var(--text-primary)' : '#ffab70' }}>
                      {comp.condition}
                    </span>
                  </div>

                  {/* Cyber State Mini-Audit */}
                  <div className="flex items-center gap-2" style={{ fontSize: '0.68rem' }}>
                    {stateOb?.status === 'met' 
                      ? <ShieldCheck size={11} style={{ color: '#3fb950' }} /> 
                      : <XCircle size={11} style={{ color: '#ffab70' }} />
                    }
                    <span className="text-muted">Telemetry:</span>
                    <span style={{ color: stateOb?.status === 'met' ? 'var(--text-primary)' : '#ffab70' }}>
                      {comp.cyberState}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
