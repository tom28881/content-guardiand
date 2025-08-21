import React from 'react';
import { Box, Text } from '@forge/react';

function getScale(score) {
  const s = Number(score) || 0;
  if (s >= 80) return { key: 'critical', bg: '#FFEBE6', fg: '#BF2600' };
  if (s >= 50) return { key: 'high', bg: '#FFEDEB', fg: '#DE350B' };
  if (s >= 20) return { key: 'medium', bg: '#FFF0B3', fg: '#172B4D' };
  return { key: 'low', bg: '#E3FCEF', fg: '#006644' };
}

export default function ImpactBadge({ score }) {
  const scale = getScale(score);
  return (
    <Box
      testId={`impact-badge-${scale.key}`}
      style={{
        display: 'inline-block',
        backgroundColor: scale.bg,
        color: scale.fg,
        borderRadius: 4,
        padding: '2px 8px',
        lineHeight: '16px',
      }}
    >
      <Text>{Number(score) || 0}</Text>
    </Box>
  );
}
