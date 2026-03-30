/**
 * ISO 27001:2022 — Control 5.12 (Classification of Information)
 * Security tier configuration shared across all dashboard components.
 */
export const TIER_CONFIG = {
  1: {
    label: 'Restricted',
    shortLabel: 'T1',
    color: '#ff2d55',
    bg: 'rgba(255, 45, 85, 0.12)',
    border: 'rgba(255, 45, 85, 0.4)',
    requires2FA: true,
    description: 'Highest sensitivity — unauthorized access causes severe harm',
  },
  2: {
    label: 'Confidential',
    shortLabel: 'T2',
    color: '#ff6a00',
    bg: 'rgba(255, 106, 0, 0.12)',
    border: 'rgba(255, 106, 0, 0.4)',
    requires2FA: true,
    description: 'High-value operational systems — significant disruption if compromised',
  },
  3: {
    label: 'Internal',
    shortLabel: 'T3',
    color: '#58a6ff',
    bg: 'rgba(88, 166, 255, 0.12)',
    border: 'rgba(88, 166, 255, 0.4)',
    requires2FA: false,
    description: 'Standard operational devices — limited impact if accessed externally',
  },
  4: {
    label: 'Public',
    shortLabel: 'T4',
    color: '#8b949e',
    bg: 'rgba(139, 148, 158, 0.12)',
    border: 'rgba(139, 148, 158, 0.4)',
    requires2FA: false,
    description: 'Low criticality endpoints — negligible security impact',
  },
};
