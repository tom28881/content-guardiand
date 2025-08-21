# Confluence Content Guardian (Forge UI Kit)

Komplexní Forge aplikace pro správu obsahu v Confluence Cloud s pokročilými funkcemi detekce, filtrování a hromadných akcí.

## Stav implementace ✅

Aplikace je **plně funkční** s následujícími implementovanými funkcemi:

### Backend
- ✅ **Skenování obsahu** - reálné i simulované, s respektováním whitelistu
- ✅ **Detekce příznaků** - stale, inactive, orphaned, incomplete
- ✅ **Impact Score** - výpočet důležitosti stránky
- ✅ **Hromadné akce** - archivace, whitelist, tagování s dry-run náhledem
- ✅ **Audit log** - kompletní záznam všech akcí včetně scheduled skenů
- ✅ **Scheduled trigger** - denní automatické skenování
- ✅ **Lock mechanismus** - ochrana proti paralelním skenům
- ✅ **Export dat** - CSV a Excel formáty

### Frontend
- ✅ **Dashboard** - grafy (DonutChart, PieChart, BarChart) s agregacemi
- ✅ **Detected Pages** - tabulka s filtrováním (status, flags, impact)
- ✅ **Bulk Review** - rychlé rozhodování o stránkách
- ✅ **Audit Log** - historie akcí s exportem
- ✅ **Settings** - konfigurace pravidel, whitelistu a plánování
- ✅ **Export modal** - UI Kit-safe zobrazení a stažení dat

## Požadavky
- Node.js 20+ (runtime: nodejs20.x)
- Atlassian Forge CLI (`npm i -g @forge/cli@latest`)
- Dependencies:
  - `@forge/react`: ^11.2.6 (pro grafy)
  - `@forge/bridge`: ^5.2.0
  - `@forge/api`: ^6.0.3

## Scopes (manifest.yml)
```yaml
permissions:
  scopes:
    - storage:app
    - read:confluence-content.all
    - read:confluence-content.summary
    - read:confluence-space.summary
    - write:confluence-content
    # Granular scopes for Confluence Cloud REST API v2
    - read:page:confluence
    - read:space:confluence
    - read:confluence-user
```

## Nasazení a instalace
```bash
# Prvotní registrace
forge login
forge register

# Nasazení do prostředí
forge deploy

# Instalace do Confluence site
forge install --site your-site.atlassian.net --product confluence --environment development

# Pro aktualizaci oprávnění
forge install --upgrade
```

## Lokální vývoj
```bash
forge tunnel
```

## Struktura projektu
```
├── manifest.yml              # Konfigurace aplikace
├── package.json             # Závislosti (pinnuté verze)
├── src/
│   ├── frontend/
│   │   ├── index.jsx        # Hlavní vstup UI
│   │   ├── pages/           # Dashboard, DetectedPages, BulkReview, AuditLog, Settings
│   │   ├── components/      # DetectedTable, FilterBar, ActionBar, modals
│   │   ├── hooks/           # useExportDetected, useDetectedPages
│   │   └── utils/           # download, friendlyError
│   └── backend/
│       ├── index.js         # Registrace resolverů (modulárně) a export scheduled triggeru (scan)
│       ├── storage.js       # Storage abstrakce
│       ├── resolvers/       # settings.js, scan.js, detected.js, audit.js, bulk.js, dashboard.js, maintenance.js, debug.js
│       ├── services/        # scan.js, confluence.js, aggregations.js, scheduler.js
│       └── utils/           # format.js (CSV/HTML escapers)
└── docs/                    # Appendix dokumentace
```

## Klíčové funkcionality

### Filtrování a vyhledávání
- Status: detected, whitelisted, archived, tagged
- Flags: stale, inactive, orphaned, incomplete  
- Impact score: 0-100
- Textové vyhledávání v názvu a space key

### Hromadné akce
- Dry-run náhled před provedením
- Archivace stránek (přesun do archivu)
- Přidání do whitelistu
- Tagování stránek
- Audit záznam všech akcí

### Export dat
- CSV formát pro analýzu
- Excel HTML formát
- Export všech nebo vybraných položek
- UI Kit-safe modal s náhledem

## Kódový styl a lint/format
Projekt obsahuje základní konfiguraci ESLint a Prettier:

- **ESLint**: pravidla pro JS/JSX (Node i browser), importy a React.
- **Prettier**: formátování kódu s jednotným stylem.

Skripty:

```bash
npm run lint       # spustí ESLint nad src/ a tests/
npm run lint:fix   # opraví automaticky opravitelné chyby
npm run format     # spustí Prettier --write nad repozitářem
npm run format:check # zkontroluje formátování bez zápisu
```

## Poznámky
- Aplikace používá Forge Storage API pro perzistenci dat
- Rate limiting je implementován pro Confluence API volání
- Lock mechanismus zabraňuje paralelním skenům (10 min timeout)
- Scheduled trigger respektuje nastavení v Settings (auto/manual mode)
- Manifest exportuje naplánovanou funkci jako `backend/index.scan`, která re-exportuje `scheduledScan` ze `src/backend/services/scheduler.js` (klíč `function: scheduled-scan` a `scheduledTrigger: daily-scan`).
