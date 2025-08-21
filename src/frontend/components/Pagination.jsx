import React from 'react';
import { Inline, Button, Text } from '@forge/react';

export default function Pagination({ page, total, pageSize, onChange }) {
  const totalPages = Math.max(1, Math.ceil(Number(total || 0) / Number(pageSize || 1)));
  const canPrev = Number(page) > 1;
  const canNext = Number(page) < totalPages;
  return (
    <Inline space="space.200" alignBlock="center">
      <Button isDisabled={!canPrev} onClick={() => onChange?.(Math.max(1, Number(page) - 1))}>Prev</Button>
      <Text>Page {page} / {totalPages}</Text>
      <Button isDisabled={!canNext} onClick={() => onChange?.(Math.min(totalPages, Number(page) + 1))}>Next</Button>
    </Inline>
  );
}
