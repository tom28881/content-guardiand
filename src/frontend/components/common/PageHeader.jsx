import React from 'react';
import { Inline, Heading } from '@forge/react';

export default function PageHeader({ title, actions }) {
  return (
    <Inline space="space.300" alignBlock="center">
      <Heading level="h600">{title}</Heading>
      {actions}
    </Inline>
  );
}
