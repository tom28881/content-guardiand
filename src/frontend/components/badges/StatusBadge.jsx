import React from 'react';
import { Box, Text } from '@forge/react';

const STATUS_STYLES = {
  detected: { bg: '#FFF0B3', fg: '#172B4D', label: 'Detected' }, // yellow
  whitelisted: { bg: '#E3FCEF', fg: '#006644', label: 'Whitelisted' }, // green
  tagged: { bg: '#EAE6FF', fg: '#403294', label: 'Tagged' }, // purple
  archived: { bg: '#FFEBE6', fg: '#BF2600', label: 'Archived' }, // red
};

export default function StatusBadge({ status }) {
  const key = String(status || 'detected').toLowerCase();
  const style = STATUS_STYLES[key] || STATUS_STYLES.detected;
  return (
    <Box
      testId={`status-badge-${key}`}
      style={{
        display: 'inline-block',
        backgroundColor: style.bg,
        color: style.fg,
        borderRadius: 4,
        padding: '2px 8px',
        lineHeight: '16px',
      }}
    >
      <Text>{style.label}</Text>
    </Box>
  );
}
