import React from 'react';

// Mocking Forge UI components with simple HTML stubs
// Strip non-DOM props to avoid React warnings in tests

export const Inline = ({ children /* alignBlock, shouldWrap, space, ...rest */ }) => (
  <div>{children}</div>
);
export const Heading = ({ children /* level, ...rest */ }) => <h1>{children}</h1>;
export const Box = ({ children /* backgroundColor, xcss, padding, paddingBlock, ...rest */ }) => (
  <div>{children}</div>
);
export const Text = ({ children /* as, size, ...rest */ }) => <span>{children}</span>;
export const Link = ({ href, children, onClick /* openNewTab, ...rest */ }) => (
  <a href={href} onClick={onClick}>{children}</a>
);
export const Button = ({ children, onClick, isDisabled /* appearance, isLoading, ...rest */ }) => (
  <button onClick={onClick} disabled={!!isDisabled}>{children}</button>
);
export const Checkbox = ({ isChecked, onChange /* label, ...rest */ }) => (
  <input type="checkbox" checked={!!isChecked} onChange={onChange} />
);

// Basic DynamicTable stub
export const DynamicTable = ({ caption, head, rows, isLoading /* ...rest */ }) => (
  <div data-testid="dynamic-table">
    {caption && <div>{caption}</div>}
    {isLoading ? (
      <div>Loading...</div>
    ) : (
      <table>
        <thead>
          <tr>{(head?.cells || []).map((c) => <th key={c.key}>{c.content}</th>)}</tr>
        </thead>
        <tbody>
          {(rows || []).map((r) => (
            <tr key={r.key}>{(r.cells || []).map((c) => <td key={c.key}>{c.content}</td>)}</tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);

// Misc components used around the app
export const Spinner = () => <div>spinner</div>;
export const SectionMessage = ({ children /* ...rest */ }) => <div>{children}</div>;
export const Textfield = ({ value, onChange /* ...rest */ }) => (
  <input type="text" value={value} onChange={onChange} />
);
export const Tooltip = ({ children }) => <>{children}</>;

// Charts — render simple containers, ignore accessor props
export const PieChart = ({ /* labelAccessor, valueAccessor, colorAccessor, width, ...rest */ }) => <div>pie-chart</div>;
export const DonutChart = () => <div>donut-chart</div>;
export const BarChart = () => <div>bar-chart</div>;

// Modal primitives
export const ModalTransition = ({ children }) => <>{children}</>;
export const Modal = ({ children /* onClose, ...rest */ }) => <div>{children}</div>;
export const ModalHeader = ({ children }) => <div>{children}</div>;
export const ModalTitle = ({ children }) => <h2>{children}</h2>;
export const ModalBody = ({ children }) => <div>{children}</div>;
export const ModalFooter = ({ children }) => <div>{children}</div>;
export const Stack = ({ children /* ...rest */ }) => <div>{children}</div>;
export const TextArea = ({ value, onChange /* ...rest */ }) => <textarea value={value} onChange={onChange} />;

// Badges used in table — map testId to data-testid
export const Badge = ({ children, testId /* ...rest */ }) => <span data-testid={testId}>{children}</span>;
