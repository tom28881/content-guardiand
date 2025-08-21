# Content Guardian - Unit Tests

Důkladné unit testy pro všechny komponenty Confluence Forge pluginu Content Guardian.

## Struktura testů

### `setup.js`
- Globální nastavení testů a mocky pro Forge API
- Automatické resetování mocků před každým testem
- Mock implementace pro `@forge/api`, `crypto` a další závislosti

### `storage.test.js`
- Testy pro storage helper funkce
- Testuje `getIndex`, `setIndex`, `getSettingsFromStore`
- Testuje `getMany` (náhrada za `storage.getBulk`) včetně chunkingu
- Testuje audit log funkce (`addAuditLogEntry`, `getAuditLog`)
- Pokrývá edge cases jako null hodnoty, chybějící klíče

### `confluence.test.js`
- Testy pro Confluence API v2 integraci
- Testuje `getPagesBatchV2` s cursor paginací
- Testuje `getPagesBatchV2WithRetry` s retry logikou pro 429/500 chyby
- Testuje `hasChildPages` s novým parentId filtrem
- Testuje `getSpaceKeyById` s cachováním
- Testuje akce jako `archivePage`, `addLabels`, `setContentProperty`
- Pokrývá fallback mezi různými base URL

### `scan.test.js`
- Testy pro scan logiku (real i simulated)
- Testuje batch processing s paginací
- Testuje flag detection (stale, inactive, orphaned, incomplete)
- Testuje whitelist filtrování (spaces a pages)
- Testuje finalizaci s preservation existujících non-detected items
- Testuje error handling pro API chyby
- Testuje impact score kalkulaci

### `aggregations.test.js`
- Testy pro dashboard data agregaci
- Testuje chunked processing velkých datasetů
- Testuje status/flags breakdown kalkulace
- Testuje primary flags priority logiku
- Testuje weekly trend s limitováním na 12 týdnů
- Testuje handling chybějících/null hodnot

### `resolver.test.js`
- Testy pro všechny resolver funkce
- Testuje `startScan` s lock mechanismem
- Testuje `listDetectedPages` s filtrováním a paginací
- Testuje `applyBulkAction` pro archive/whitelist/tag akce
- Testuje export funkce (CSV a Excel HTML)
- Testuje audit log listing a export
- Testuje error handling a edge cases

## Spuštění testů

```bash
# Instalace závislostí
npm install

# Spuštění všech testů
npm test

# Spuštění testů s watch módem
npm run test:watch

# Spuštění testů s coverage reportem
npm run test:coverage
```

## Pokrytí

Testy pokrývají:
- ✅ Všechny storage operace včetně batch fetchingu
- ✅ Confluence API v2 integrace s retry logikou
- ✅ Scan proces s paginací a flag detection
- ✅ Dashboard agregace s chunked processing
- ✅ Všechny resolver funkce s error handling
- ✅ Edge cases a error scenarios
- ✅ Mock implementace pro Forge runtime

## Klíčové testovací scénáře

### Storage
- Batch fetching s chunking (100 items per chunk)
- Null/undefined handling
- Audit log pagination a persistence

### Confluence API
- V2 pagination s cursor extraction
- Retry logika pro rate limits (429) a server errors (500+)
- Fallback mezi base URLs na 404/410
- hasChildPages s parentId filtrem místo direct-children

### Scan
- Multi-batch processing s cursor pagination
- Flag detection podle rules (age, inactivity, orphaned, incomplete)
- Whitelist filtrování na space i page level
- Impact score kalkulace s cappingem na 100
- Preservation archived/whitelisted items při finalizaci

### Dashboard
- Chunked aggregace pro velké datasety (1000+ items)
- Status a flags breakdown s primary flag priority
- Weekly trend s limitováním na posledních 12 týdnů
- Handling missing fields a null values

### Resolver
- Scan lock mechanism s timeout
- Bulk actions s remote API calls a local storage updates
- Export s CSV escaping a HTML encoding
- Error handling s graceful degradation

Tyto testy pomohou identifikovat a opravit problémy s paginací, timeouty a API integrací.
