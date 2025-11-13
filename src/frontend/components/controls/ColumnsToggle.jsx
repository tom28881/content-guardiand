import React from 'react';
import PropTypes from 'prop-types';
import { Box, Inline, Button, Checkbox, Text } from '@forge/react';

// Simple UI for toggling column visibility in Detected Pages table.
// Expects controlled props: value (map key->bool) and onChange (setter for new map).
// Does not handle persistence; parent can handle it as needed.
const COLUMNS = [
  { key: 'title', label: 'Title' },
  { key: 'space', label: 'Space' },
  { key: 'owner', label: 'Owner' },
  { key: 'impact', label: 'Impact' },
  { key: 'updated', label: 'Last Updated' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Recommended Actions' },
];

const defaultState = () => COLUMNS.reduce((acc, c) => { acc[c.key] = true; return acc; }, {});

export default function ColumnsToggle({ value, onChange }) {
  const [open, setOpen] = React.useState(false);
  const state = React.useMemo(() => ({ ...defaultState(), ...(value || {}) }), [value]);

  const setKey = (key, checked) => {
    const next = { ...state, [key]: !!checked };
    onChange?.(next);
  };

  const selectAll = () => onChange?.(defaultState());
  const clearAll = () => onChange?.(COLUMNS.reduce((acc, c) => { acc[c.key] = false; return acc; }, {}));

  return (
    <Box paddingBlock="space.150">
      <Inline space="space.150" alignBlock="center">
        <Button onClick={() => setOpen((x) => !x)} appearance="subtle">Columns</Button>
        {open && (
          <Box padding="space.150" backgroundColor="color.background.neutral.subtle" xcss={{ borderRadius: '3px', border: '1px solid #DFE1E6' }}>
            <Inline space="space.200" shouldWrap>
              {COLUMNS.map((c) => (
                <Inline key={c.key} space="space.100" alignBlock="center">
                  <Checkbox
                    label=""
                    isChecked={!!state[c.key]}
                    onChange={(e) => setKey(c.key, e?.target?.checked)}
                  />
                  <Text>{c.label}</Text>
                </Inline>
              ))}
            </Inline>
            <Inline space="space.100" alignBlock="center" xcss={{ marginTop: '8px' }}>
              <Button appearance="link" onClick={selectAll}>Select all</Button>
              <Button appearance="link" onClick={clearAll}>Clear all</Button>
            </Inline>
          </Box>
        )}
      </Inline>
    </Box>
  );
}

ColumnsToggle.propTypes = {
  value: PropTypes.shape({
    title: PropTypes.bool,
    space: PropTypes.bool,
    owner: PropTypes.bool,
    impact: PropTypes.bool,
    updated: PropTypes.bool,
    status: PropTypes.bool,
    actions: PropTypes.bool,
  }),
  onChange: PropTypes.func,
};
