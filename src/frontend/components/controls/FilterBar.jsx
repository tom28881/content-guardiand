import React from 'react';
import { Inline, Textfield, Button } from '@forge/react';

export default function FilterBar({
  search,
  setSearch,
  minImpact,
  setMinImpact,
  status,
  setStatus,
  flags,
  setFlags,
  onFilter,
}) {
  return (
    <Inline space="space.300">
      <Textfield
        name="search"
        placeholder="Search title/space"
        value={search}
        onChange={(e) => setSearch?.(e?.target?.value ?? '')}
      />
      <Textfield
        name="minImpact"
        placeholder="Min impact"
        value={String(minImpact)}
        onChange={(e) => setMinImpact?.(e?.target?.value ?? '0')}
      />
      <Inline space="space.100">
        {[
          { value: 'detected', label: 'Detected' },
          { value: 'whitelisted', label: 'Whitelisted' },
          { value: 'archived', label: 'Archived' },
          { value: 'tagged', label: 'Tagged' },
          { value: 'any', label: 'Any' },
        ].map((opt) => (
          <Button
            key={opt.value}
            appearance={status === opt.value ? 'primary' : 'default'}
            onClick={() => setStatus?.(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </Inline>
      <Inline space="space.100">
        {[
          { key: 'stale', label: 'Stale' },
          { key: 'inactive', label: 'Inactive' },
          { key: 'orphaned', label: 'Orphaned' },
          { key: 'incomplete', label: 'Incomplete' },
        ].map(({ key, label }) => (
          <Button
            key={key}
            appearance={flags?.[key] ? 'primary' : 'default'}
            onClick={() => setFlags?.({ ...(flags || {}), [key]: !flags?.[key] })}
          >
            {label}
          </Button>
        ))}
      </Inline>
      <Button onClick={() => onFilter?.()}>Filter</Button>
    </Inline>
  );
}
