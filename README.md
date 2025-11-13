**Confluence Content Guardian (Forge UI Kit)**

**Deployment to Environment**
- `forge deploy`

**Installation to Confluence site**
- `forge install --site your-site.atlassian.net --product confluence --environment development`

**For permission update**
- `forge install --upgrade`

**Local development**
```bash
forge tunnel
```

**Project structure**
```
├── manifest.yml             # App configuration
├── package.json             # Dependencies (pinned versions)
├── src/
│   ├── frontend/
│   │   ├── index.jsx        # Main UI entrypoint
│   │   ├── pages/           # Dashboard, DetectedPages, BulkReview, AuditLog, Settings
│   │   ├── components/      # DetectedTable, FilterBar, ActionBar, modals
│   │   ├── hooks/           # useExportDetected, useDetectedPages
│   │   └── utils/           # download, friendlyError
│   └── backend/
│       ├── index.js         # Resolver registration (modular) + scheduled trigger (scan) export
│       ├── storage.js       # Storage abstraction
│       ├── resolvers/       # settings.js, scan.js, detected.js, audit.js, bulk.js, dashboard.js, maintenance.js, debug.js
│       ├── services/        # scan.js, confluence.js, aggregations.js, scheduler.js
│       └── utils/           # format.js (CSV/HTML escapers)
└── docs/                    # Documentation appendix
```

**Key Features**

**Filtering and search**
- Status: detected, whitelisted, archived, tagged
- Flags: stale, inactive, orphaned, incomplete
- Impact score: 0-100
- Text search in title and space key

**Bulk actions**
- Dry-run preview before execution
- Archiving pages (move to archive)
- Add to whitelist
- Tag pages
- Audit log of all actions

**Data export**
- CSV format for analysis
- Excel HTML format
- Export all or selected items
- UI Kit-safe modal with preview

**Code style and lint/format**

Basic ESLint and Prettier configuration included:
- **ESLint**: JS/JSX rules (Node & browser), imports and React
- **Prettier**: unified code style formatting

Scripts:
```bash
npm run lint         # run ESLint on src/ and tests/
npm run lint:fix     # automatically fixes fixable errors
npm run format       # run Prettier --write on the repository
npm run format:check # checks formatting without writing
```

**Notes**
- App uses Forge Storage API for data persistence
- Rate limiting is implemented for Confluence API calls
- Lock mechanism prevents parallel scans (10 min timeout)
- Scheduled trigger respects Settings configuration (auto/manual mode)
- Manifest exports a scheduled function as `backend/index.scan`, which re-exports `scheduledScan` from `src/backend/services/scheduler.js` (key `function: scheduled-scan` and `scheduledTrigger: daily-scan`)

