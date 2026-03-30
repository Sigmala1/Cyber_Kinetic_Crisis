import React, { useState, useRef, useEffect } from 'react';
import { TIER_CONFIG } from '../tiers';
import SecurityTierBadge from './SecurityTierBadge';

const SVG_H      = 600;
const PAD_X      = 72;   // left padding for tier labels
const PAD_Y      = 70;
const NODE_W     = 168;
const NODE_H     = 54;
const NODE_RX    = 10;
const PANEL_W    = 295;

/** Measure container width reactively */
function useMeasuredWidth(ref) {
  const [width, setWidth] = useState(900);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return width;
}

/** Assign (cx, cy) to every device based on tier-stratified rows */
function buildLayout(devices, svgWidth) {
  const usableW  = svgWidth - PAD_X - 48;
  const rowGap   = (SVG_H - 2 * PAD_Y) / 4; // 4 gaps for 5 possible rows

  // Bucket devices
  const buckets = { 1: [], 2: [], 3: [], 4: [], shadow: [] };
  devices.forEach(d => {
    if (d.isShadow) buckets.shadow.push(d);
    else if (buckets[d.securityTier]) buckets[d.securityTier].push(d);
  });

  const pos = {};

  const placeRow = (list, rowIdx) => {
    const n   = list.length;
    if (!n) return;
    const cy  = PAD_Y + rowIdx * rowGap;
    const step = n > 1 ? usableW / (n - 1) : 0;
    list.forEach((dev, i) => {
      const cx = n === 1 ? PAD_X + usableW / 2 : PAD_X + i * step;
      pos[dev.id] = { cx, cy };
    });
  };

  placeRow(buckets[1], 0);
  placeRow(buckets[2], 1);
  placeRow(buckets[3], 2);
  placeRow(buckets[4], 3);
  placeRow(buckets.shadow, 4);
  return pos;
}

export default function TopologyView({ devices }) {
  const containerRef = useRef(null);
  const svgWidth     = useMeasuredWidth(containerRef);
  const [selectedId, setSelectedId] = useState(null);
  const [hoveredId,  setHoveredId]  = useState(null);

  const pos    = buildLayout(devices, svgWidth);
  const selDev = selectedId ? devices.find(d => d.id === selectedId) : null;
  const hasShadow = devices.some(d => d.isShadow);
  const rowGap = (SVG_H - 2 * PAD_Y) / 4;

  // Build edges from dependencies
  const edges = [];
  devices.forEach(dev => {
    (dev.dependencies || []).forEach(depId => {
      if (pos[dev.id] && pos[depId]) edges.push({ from: dev.id, to: depId, dev });
    });
  });

  const focusId     = hoveredId || selectedId;
  const connected   = new Set();
  if (focusId) {
    connected.add(focusId);
    edges.forEach(e => {
      if (e.from === focusId || e.to === focusId) {
        connected.add(e.from);
        connected.add(e.to);
      }
    });
  }

  const edgeColor = (e) =>
    e.dev.cyberState === 'Compromised' ? '#f85149'
    : e.dev.cyberState === 'Warning'   ? '#d29922'
    : 'rgba(255,255,255,0.22)';

  // Detail panel position — prefer right side of node, flip left if near edge
  const panelPos = selDev && pos[selDev.id] ? (() => {
    const p    = pos[selDev.id];
    const left = p.cx + NODE_W / 2 + 14 > svgWidth - PANEL_W - 10
      ? p.cx - NODE_W / 2 - PANEL_W - 14
      : p.cx + NODE_W / 2 + 14;
    const top = Math.max(4, Math.min(p.cy - NODE_H / 2, SVG_H - 260));
    return { left, top };
  })() : null;

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <svg
        width={svgWidth}
        height={SVG_H}
        style={{ display: 'block', overflow: 'visible' }}
      >
        <defs>
          <marker id="arrow-tip" viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth={5} markerHeight={5} orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(255,255,255,0.35)" />
          </marker>
          {/* Glows for danger/shadow nodes */}
          <filter id="glow-red" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* ── Tier lane backgrounds ── */}
        {[1, 2, 3, 4].map((tier, i) => {
          const conf = TIER_CONFIG[tier];
          const cy   = PAD_Y + i * rowGap;
          return (
            <g key={tier}>
              <rect
                x={PAD_X - 16} y={cy - NODE_H / 2 - 12}
                width={svgWidth - PAD_X + 8} height={NODE_H + 24}
                rx={12} fill={conf.bg} opacity={0.35}
              />
              <text x={PAD_X - 22} y={cy + 5}
                textAnchor="end" fontSize={11} fontWeight={700}
                fill={conf.color} letterSpacing={0.5}>
                {conf.shortLabel}
              </text>
              <text x={PAD_X - 22} y={cy + 18}
                textAnchor="end" fontSize={8.5}
                fill={conf.color} opacity={0.65}>
                {conf.label}
              </text>
            </g>
          );
        })}

        {/* Shadow zone */}
        {hasShadow && (() => {
          const cy = PAD_Y + 4 * rowGap;
          return (
            <g>
              <rect
                x={PAD_X - 16} y={cy - NODE_H / 2 - 12}
                width={svgWidth - PAD_X + 8} height={NODE_H + 24}
                rx={12} fill="rgba(248,81,73,0.07)"
                stroke="rgba(248,81,73,0.25)" strokeDasharray="5,3" strokeWidth={1}
              />
              <text x={PAD_X - 22} y={cy + 3}
                textAnchor="end" fontSize={11} fontWeight={700}
                fill="#ff7b72">??</text>
              <text x={PAD_X - 22} y={cy + 16}
                textAnchor="end" fontSize={8.5} fill="#ff7b72" opacity={0.7}>
                Shadow
              </text>
            </g>
          );
        })()}

        {/* ── Edges (drawn first, behind nodes) ── */}
        {edges.map((e, i) => {
          const s   = pos[e.from];
          const t   = pos[e.to];
          if (!s || !t) return null;
          const x1  = s.cx, y1 = s.cy - NODE_H / 2;
          const x2  = t.cx, y2 = t.cy + NODE_H / 2;
          const lit = focusId && (e.from === focusId || e.to === focusId);
          const dim = focusId && !lit;
          return (
            <path
              key={i}
              d={`M ${x1} ${y1} C ${x1} ${y1 - 55}, ${x2} ${y2 + 55}, ${x2} ${y2}`}
              fill="none"
              stroke={edgeColor(e)}
              strokeWidth={lit ? 2.5 : 1.5}
              strokeDasharray={e.dev.isShadow ? '6,4' : 'none'}
              opacity={dim ? 0.1 : lit ? 1 : 0.45}
              markerEnd="url(#arrow-tip)"
              style={{ transition: 'opacity 0.2s, stroke-width 0.15s' }}
            />
          );
        })}

        {/* ── Device nodes ── */}
        {devices.map(dev => {
          const p = pos[dev.id];
          if (!p) return null;

          const conf    = dev.isShadow ? null : TIER_CONFIG[dev.securityTier];
          const baseCol = dev.isShadow ? '#ff7b72' : (conf?.color   || '#8b949e');
          const baseBg  = dev.isShadow ? 'rgba(248,81,73,0.12)' : (conf?.bg || 'rgba(0,0,0,0.3)');
          const isDanger  = dev.cyberState === 'Compromised';
          const isWarn    = dev.cyberState === 'Warning';
          const nodeCol   = isDanger ? '#f85149' : isWarn ? '#d29922' : baseCol;
          const isSelected = selectedId === dev.id;
          const isHovered  = hoveredId  === dev.id;
          const dimmed     = focusId && !connected.has(dev.id);
          const nx = p.cx - NODE_W / 2;
          const ny = p.cy - NODE_H / 2;

          return (
            <g
              key={dev.id}
              onClick={() => setSelectedId(prev => prev === dev.id ? null : dev.id)}
              onMouseEnter={() => setHoveredId(dev.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{ cursor: 'pointer' }}
              opacity={dimmed ? 0.18 : 1}
            >
              {/* Selection / hover ring */}
              {(isSelected || isHovered) && (
                <rect
                  x={nx - 5} y={ny - 5}
                  width={NODE_W + 10} height={NODE_H + 10}
                  rx={NODE_RX + 4} fill="none"
                  stroke={nodeCol} strokeWidth={2} opacity={0.7}
                />
              )}
              {/* Shadow pulse glow */}
              {(dev.isShadow || isDanger) && (
                <rect
                  x={nx} y={ny} width={NODE_W} height={NODE_H} rx={NODE_RX}
                  fill="none" stroke={nodeCol} strokeWidth={3}
                  opacity={0.35} filter="url(#glow-red)"
                  className="animate-alert"
                />
              )}
              {/* Main rect */}
              <rect
                x={nx} y={ny} width={NODE_W} height={NODE_H}
                rx={NODE_RX}
                fill={baseBg}
                stroke={nodeCol}
                strokeWidth={1.5}
                strokeDasharray={dev.isShadow ? '5,3' : 'none'}
              />
              {/* Top tier accent bar */}
              <rect x={nx} y={ny} width={NODE_W} height={4} rx={NODE_RX} fill={nodeCol} />

              {/* Device name */}
              <text x={p.cx} y={p.cy - 5}
                textAnchor="middle" fontSize={12} fontWeight={700}
                fill={isDanger ? '#ff7b72' : '#e6edf3'}>
                {dev.name.length > 19 ? dev.name.slice(0, 18) + '…' : dev.name}
              </text>

              {/* Sub-label */}
              <text x={p.cx} y={p.cy + 11}
                textAnchor="middle" fontSize={9.5} letterSpacing={0.3}
                fill={dev.isShadow ? '#ff7b72' : 'rgba(139,148,158,0.85)'}>
                {dev.isShadow ? '⚠ UNREGISTERED' : dev.id}
              </text>

              {/* Status dot */}
              <circle
                cx={nx + NODE_W - 11} cy={ny + 13} r={5}
                fill={isDanger ? '#f85149' : isWarn ? '#d29922' : '#238636'}
              />
            </g>
          );
        })}
      </svg>

      {/* ── Floating Node Detail Panel ── */}
      {selDev && panelPos && (
        <div
          className="glass-panel"
          style={{
            position: 'absolute',
            left: panelPos.left,
            top: panelPos.top,
            width: PANEL_W,
            padding: '16px',
            zIndex: 200,
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h4 style={{
                margin: 0, fontSize: '0.95rem',
                color: selDev.cyberState === 'Compromised' ? 'var(--danger)' : 'var(--text-primary)',
              }}>
                {selDev.name}
              </h4>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                {selDev.type} · {selDev.id}
              </span>
            </div>
            <button
              onClick={() => setSelectedId(null)}
              style={{
                background: 'none', border: 'none', padding: '2px 4px',
                color: 'var(--text-secondary)', cursor: 'pointer',
                fontSize: '18px', lineHeight: 1, flexShrink: 0,
              }}
            >×</button>
          </div>

          {/* Shadow alert or tier badge */}
          {selDev.isShadow ? (
            <div style={{
              fontSize: '0.72rem', fontWeight: 700,
              color: '#ff7b72', padding: '7px 10px',
              background: 'rgba(248,81,73,0.12)', borderRadius: '6px',
              marginBottom: '10px',
            }}>
              ⚠ UNREGISTERED — Not in asset inventory (ISO 27001 § 5.9)
            </div>
          ) : (
            <div style={{ marginBottom: '10px' }}>
              <SecurityTierBadge tier={selDev.securityTier} has2FA={selDev.has2FA} mini />
            </div>
          )}

          {/* Detail rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', fontSize: '0.78rem' }}>
            {[
              ['Cyber State', selDev.cyberState,
                selDev.cyberState === 'Compromised' ? 'var(--danger)'
                  : selDev.cyberState === 'Warning' ? 'var(--warning)' : '#3fb950'],
              ['IP Address',  selDev.ipAddress, null],
              ['Status',      `${selDev.isOnline ? 'Online' : 'Offline'} · ${selDev.isOn ? 'On' : 'Off'}`,
                selDev.isOnline ? '#3fb950' : 'var(--danger)'],
              ['Location',    `${selDev.location?.building}, ${selDev.location?.room}`, null],
              ['Open Ports',  selDev.openPorts?.length ? selDev.openPorts.join(', ') : 'None', null],
            ].map(([label, value, color]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                <span style={{ color: 'var(--text-secondary)', flexShrink: 0 }}>{label}:</span>
                <span style={{ fontWeight: 500, color: color || 'var(--text-primary)', textAlign: 'right' }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
