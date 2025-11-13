# 📚 Content Guardian - Návod k použití

**Pro uživatele, kteří o aplikaci nic neví**

Vítejte! Tento návod vás provede instalací a používáním Content Guardian krok za krokem. Nepotřebujete žádné technické znalosti.

---

## 🤔 Co je Content Guardian?

**Jednoduše řečeno:**
Content Guardian je aplikace pro Confluence, která automaticky najde problémy ve vaší dokumentaci a pomůže vám je vyřešit.

**Jaké problémy najde?**
- 📅 **Zastaralé stránky** - Stránky, které nebyly dlouho aktualizovány
- 👀 **Nečtené stránky** - Stránky, které nikdo nečte
- 🔗 **Osiřelé stránky** - Stránky, na které nikde není odkaz
- ✏️ **Neúplné stránky** - Stránky s málo obsahem

**Proč to potřebuji?**
- Confluence časem zaplevelí starými stránkami
- Těžko se hledá důležitá dokumentace mezi nepotřebnou
- Nejste si jistí, co můžete smazat a co ne
- Content Guardian vám ukáže přesně, co je problém a pomůže ho vyřešit

---

## 📋 Krok 1: Instalace aplikace

### Co potřebujete:
- Confluence Cloud (funguje jen v cloudu, ne na serveru)
- Oprávnění instalovat aplikace (Confluence admin)
- Email pro registraci: tom28881@gmail.com

### Jak nainstalovat:

#### Možnost A: Z Atlassian Marketplace (Doporučeno)

1. **Otevřete Confluence**
   - Jděte na váš Confluence workspace
   - Např: `https://vase-firma.atlassian.net/wiki`

2. **Najděte Apps (Aplikace)**
   - V horním menu klikněte na **⚙️ Settings** (Nastavení)
   - V levém menu klikněte na **Find new apps** (Najít nové aplikace)

3. **Vyhledejte Content Guardian**
   - Do vyhledávacího pole napište: `Content Guardian`
   - Klikněte na aplikaci "Content Guardian for Confluence"

4. **Nainstalujte**
   - Klikněte na tlačítko **Install** (Instalovat)
   - Počkejte 30-60 sekund
   - Zobrazí se zpráva "Installation successful" (Instalace úspěšná)

5. **Hotovo!**
   - Aplikace je nainstalovaná a připravená k použití

#### Možnost B: Přímá instalace z Developer Console

1. Jděte na: https://developer.atlassian.com/console
2. Přihlaste se emailem: tom28881@gmail.com
3. Najděte "Content Guardian"
4. Klikněte "Install"
5. Vyberte váš Confluence workspace
6. Potvrďte instalaci

---

## 🚀 Krok 2: První spuštění

### Jak otevřít aplikaci:

1. **V Confluence, otevřete Apps menu:**
   - V horní liště najděte **Apps** (Aplikace)
   - Klikněte na šipku vedle "Apps"
   - Zobrazí se dropdown menu

2. **Najděte Content Guardian:**
   - V seznamu aplikací najděte **Content Guardian**
   - Klikněte na něj

3. **Aplikace se otevře:**
   - Zobrazí se nová stránka s aplikací
   - Může to trvat 2-5 sekund
   - Uvidíte dashboard (hlavní obrazovku)

### Co uvidíte poprvé:

První spuštění aplikace vypadá takhle:

```
╔══════════════════════════════════════════╗
║  Content Guardian                         ║
║                                          ║
║  Problem Pages: 0                        ║
║  Impact Score: 0                         ║
║                                          ║
║  [Scan Now] - Klikněte pro první scan   ║
╚══════════════════════════════════════════╝
```

**Proč jsou čísla nula?**
- Aplikace ještě neproběhla žádný scan
- Musíte spustit první detekci ručně

---

## 🔍 Krok 3: První scan (Detekce problémů)

### Jak spustit scan:

1. **Na Dashboard obrazovce:**
   - Najděte tlačítko **"Scan Now"** (Skenovat teď)
   - Klikněte na něj

2. **Scan začne:**
   - Zobrazí se loading animace
   - Vidíte: "Scanning pages..." (Skenuji stránky...)
   - Trvá to 10-60 sekund (závisí na počtu stránek)

3. **Scan skončí:**
   - Čísla na dashboardu se aktualizují
   - Uvidíte počet problémových stránek
   - Zobrazí se graf s rozložením problémů

### Co znamenají čísla:

**Problem Pages (Problémové stránky):**
- Počet stránek, které mají nějaký problém
- Např: **15** = našlo se 15 problémových stránek

**Impact Score (Skóre dopadu):**
- Celkové číslo vyjadřující závažnost
- Čím vyšší, tím víc problémů
- Např: **285** = hodně problémů

**Breakdown Chart (Graf rozložení):**
- Barevný koláčový graf
- Ukazuje, jaké typy problémů jsou nejčastější
- Každá barva = jeden typ problému

### Příklad výsledků po prvním scanu:

```
╔══════════════════════════════════════════╗
║  Content Guardian                         ║
║                                          ║
║  Problem Pages: 47                       ║
║  Impact Score: 285                       ║
║                                          ║
║  📊 Problem Breakdown:                   ║
║     🟡 Stale: 23 pages (49%)            ║
║     🔵 Inactive: 12 pages (26%)         ║
║     🟢 Orphaned: 8 pages (17%)          ║
║     🟣 Incomplete: 4 pages (8%)         ║
║                                          ║
║  Last scan: Just now                     ║
╚══════════════════════════════════════════╝
```

---

## 📊 Krok 4: Prohlížení problémových stránek

### Jak zobrazit seznam:

1. **Klikněte na záložku "Detected Pages"** (Detekované stránky)
   - Je to druhá záložka nahoře
   - Zobrazí se tabulka se všemi problémovými stránkami

2. **Co vidíte v tabulce:**

| Sloupec | Co znamená | Příklad |
|---------|------------|---------|
| **Title** | Název stránky | "Meeting Notes 2022" |
| **Space** | V jakém prostoru je | "IT Team" |
| **Last Updated** | Kdy byla naposledy upravena | "2 years ago" |
| **Views** | Kolik lidí ji vidělo (za 90 dní) | "5 views" |
| **Problems** | Jaké má problémy | "Stale, Inactive" |
| **Impact** | Jak moc je to problém (1-100) | "35" |
| **Status** | Co s tím bylo uděláno | "New" (nové) |

### Jak filtrovat a hledat:

**Filtr podle typu problému:**
1. Nahoře nad tabulkou jsou tlačítka:
   - 🟡 **Stale** - Zobrazit jen zastaralé stránky
   - 🔵 **Inactive** - Zobrazit jen nečtené stránky
   - 🟢 **Orphaned** - Zobrazit jen osiřelé stránky
   - 🟣 **Incomplete** - Zobrazit jen neúplné stránky
2. Klikněte na tlačítko typu, který chcete vidět
3. Tabulka se vyfiltruje

**Vyhledávání:**
1. Najděte vyhledávací pole nahoře
2. Napište název stránky, kterou hledáte
3. Výsledky se zobrazí okamžitě

**Třídění:**
1. Klikněte na hlavičku sloupce (např. "Last Updated")
2. Tabulka se setřídí podle toho sloupce
3. Klikněte znovu pro obrácení pořadí

### Jak otevřít stránku v Confluence:

- V sloupci "Title" klikněte na název stránky
- Otevře se nová karta s tou stránkou v Confluence
- Můžete si ji přečíst a rozhodnout, co s ní uděláte

---

## ✅ Krok 5: Zpracování stránek (Co s nimi?)

Teď máte seznam problémových stránek. Co dál?

### Možnost A: Bulk Review (Hromadné zpracování)

**Nejlepší pro:** Když máte hodně stránek a chcete je projít jednu po jedné

#### Jak to funguje:

1. **Klikněte na záložku "Bulk Review"** (Hromadné zpracování)
   - Je to třetí záložka nahoře

2. **Uvidíte detail první problémové stránky:**
   ```
   ╔══════════════════════════════════════════╗
   ║  Page 1 of 47                             ║
   ║                                          ║
   ║  📄 Meeting Notes - Q1 2022              ║
   ║  📁 Space: IT Team                       ║
   ║  📅 Last Updated: 2 years ago            ║
   ║  👀 Views (90 days): 3                   ║
   ║  ⚠️ Problems: Stale, Inactive            ║
   ║  📊 Impact Score: 42                     ║
   ║                                          ║
   ║  🔗 Open in Confluence                   ║
   ║                                          ║
   ║  What do you want to do?                 ║
   ║                                          ║
   ║  [Keep (Tag)]  [Add to Whitelist]       ║
   ║  [Archive]     [Skip]       [Back]       ║
   ╚══════════════════════════════════════════╝
   ```

3. **Přečtěte si informace o stránce**
   - Klikněte na "Open in Confluence" pro zobrazení stránky
   - Rozhodněte se, co s ní uděláte

4. **Vyberte akci:**

#### 🟢 **Keep (Tag)** - Ponechat (Označit jako zkontrolováno)
**Kdy použít:**
- Stránka je stále důležitá a platná
- Potřebuje jen aktualizovat obsah
- Nechcete ji smazat ani archivovat

**Co se stane:**
- Stránka zůstane v Confluence beze změny
- Označí se jako "Tagged" (Zkontrolováno)
- Příště při scanu se nezobrazí jako "New"
- Můžete přidat poznámku, proč jste ji nechali

**Příklad:**
```
Stránka: "API Documentation v2"
Důvod: "Still valid, team uses this daily"
Akce: Keep (Tag)
```

#### ⚪ **Add to Whitelist** - Přidat na whitelist
**Kdy použít:**
- Stránka je důležitá, ale může vypadat jako problémová
- Např. šablony, landing pages, archivní dokumenty
- Nikdy ji nechcete vidět v seznamu problémů

**Co se stane:**
- Stránka se přidá na whitelist
- Budoucí scany ji přeskočí
- Nebude se zobrazovat jako problémová
- Můžete ji odebrat z whitelistu v Settings

**Příklad:**
```
Stránka: "Page Template - Do Not Edit"
Důvod: "This is a template, should never be flagged"
Akce: Add to Whitelist
```

#### 🟠 **Archive** - Archivovat
**Kdy použít:**
- Stránka je zastaralá a nepotřebná
- Obsah už není platný
- Nikdo ji nečte
- Ale nechcete ji smazat úplně (může být potřeba později)

**Co se stane:**
- Stránka se přesune do archivu v Confluence
- Zmizí z běžného vyhledávání
- Stále existuje a lze ji obnovit
- Neukazuje se běžným uživatelům

**Příklad:**
```
Stránka: "Meeting Notes - January 2022"
Důvod: "Obsolete meeting notes, no longer relevant"
Akce: Archive
```

#### ⏭️ **Skip** - Přeskočit
**Kdy použít:**
- Nejste si jistí, co s tím
- Chcete se k tomu vrátit později
- Potřebujete konzultovat s někým jiným

**Co se stane:**
- Přejdete na další stránku
- Tato stránka zůstane jako "New"
- Zobrazí se znovu při příštím použití Bulk Review

**Příklad:**
```
Rozhodování: "Not sure if this is still needed"
Akce: Skip (vrátím se k tomu)
```

#### ⬅️ **Back** - Zpět
**Kdy použít:**
- Chcete se vrátit k předchozí stránce
- Udělali jste chybu a chcete ji opravit

**Co se stane:**
- Vrátíte se o jednu stránku zpět
- Můžete změnit předchozí rozhodnutí

5. **Potvrzení akce:**

Po kliknutí na akci (kromě Skip a Back) se zobrazí potvrzovací okno:

```
╔══════════════════════════════════════════╗
║  Confirm Action                          ║
║                                          ║
║  Action: Archive                         ║
║  Page: Meeting Notes - Q1 2022          ║
║                                          ║
║  Reason (optional):                      ║
║  ┌────────────────────────────────────┐ ║
║  │ Obsolete meeting notes             │ ║
║  └────────────────────────────────────┘ ║
║                                          ║
║  [Confirm]            [Cancel]           ║
╚══════════════════════════════════════════╝
```

- **Reason (Důvod):** Volitelné pole pro vysvětlení
  - Nemusíte vyplňovat, ale je to dobré pro audit trail
  - Např: "No longer used", "Duplicate content", "Project cancelled"
- **Confirm:** Potvrdit a pokračovat
- **Cancel:** Zrušit akci

6. **Automatický posun na další stránku:**
   - Po potvrzení se automaticky zobrazí další problémová stránka
   - Můžete pokračovat, dokud neprojedete všechny

### Možnost B: Ruční zpracování z tabulky

**Nejlepší pro:** Když chcete zpracovat jen konkrétní stránky

1. V záložce "Detected Pages" najděte stránku
2. V řádku stránky jsou malá tlačítka akcí
3. Klikněte na akci, kterou chcete použít
4. Potvrzení funguje stejně jako v Bulk Review

---

## 📜 Krok 6: Audit Log (Historie akcí)

### Co je Audit Log?

- Záznam všech akcí, které jste udělali
- Kdo, kdy, co a proč
- Důležité pro reporting a compliance

### Jak zobrazit:

1. **Klikněte na záložku "Audit Log"**
   - Je to čtvrtá záložka

2. **Uvidíte tabulku s historií:**

| Timestamp | User | Action | Page | Reason |
|-----------|------|--------|------|--------|
| Nov 13, 14:30 | Jan Novák | Archive | Meeting Notes 2022 | Obsolete |
| Nov 13, 14:28 | Jan Novák | Keep (Tag) | API Docs v2 | Still valid |
| Nov 13, 14:25 | Jan Novák | Whitelist | Page Template | Template |

### Co můžete dělat:

**Filtrovat podle akce:**
- Dropdown menu "Action"
- Vyberte typ akce (Archive, Tag, Whitelist)
- Zobrazí se jen ty akce

**Filtrovat podle uživatele:**
- Dropdown menu "User"
- Vyberte uživatele
- Zobrazí se jen jejich akce

**Hledat stránku:**
- Vyhledávací pole
- Napište název stránky
- Najdete všechny akce s tou stránkou

**Export do CSV:**
- Tlačítko "Export to CSV"
- Stáhne se soubor s celou historií
- Můžete otevřít v Excelu

### Proč je to užitečné:

- **Reporting:** Ukážete manažerovi, co jste udělali
- **Compliance:** Prokázání, že dodržujete governance
- **Kontrola:** Zjistíte, kdo co dělal
- **Vrácení změn:** Pokud někdo udělal chybu, víte co vrátit

---

## ⚙️ Krok 7: Nastavení (Settings)

### Jak otevřít nastavení:

1. **Klikněte na záložku "Settings"**
   - Je to pátá (poslední) záložka

2. **Uvidíte tři sekce:**
   - Detection Rules (Pravidla detekce)
   - Scheduling (Plánování)
   - Whitelist Management (Správa whitelistu)

### A) Detection Rules (Pravidla detekce)

**Co to je:**
- Nastavení, co se považuje za "problém"
- Můžete upravit podle vašich potřeb

**Nastavení:**

#### 🟡 Stale Threshold (Práh zastaralosti)
```
Stale Threshold (days): [180]
```
**Co to znamená:**
- Stránky, které nebyly aktualizovány X dní
- Výchozí: 180 dní (6 měsíců)

**Jak změnit:**
- Klikněte do pole
- Napište nové číslo
- Např: `365` = stránky starší než rok
- Např: `90` = stránky starší než 3 měsíce

**Kdy použít:**
- **Konzervativní org:** `365` dní - chcete zachovat víc
- **Aktivní org:** `90` dní - očekáváte časté aktualizace

#### 🔵 Inactive Threshold (Práh neaktivity)
```
Inactive Threshold (days): [90]
```
**Co to znamená:**
- Stránky, které nikdo neviděl X dní
- Výchozí: 90 dní (3 měsíce)

**Jak změnit:**
- Stejně jako Stale Threshold
- Např: `180` = 6 měsíců bez views
- Např: `30` = měsíc bez views

#### 📊 Low View Threshold (Práh nízkých zobrazení)
```
Low View Count (per month): [10]
```
**Co to znamená:**
- Stránky s méně než X zobrazení za měsíc
- Výchozí: 10 views/měsíc

**Jak změnit:**
- Např: `5` = málo views = 5 a méně
- Např: `20` = málo views = 20 a méně

#### ✏️ Incomplete Threshold (Práh neúplnosti)
```
Minimum Content Length (characters): [100]
```
**Co to znamená:**
- Stránky s méně než X znaky obsahu
- Výchozí: 100 znaků

**Jak změnit:**
- Např: `200` = stránky s méně než 200 znaky
- Např: `50` = stránky s méně než 50 znaky

**Uložení změn:**
- Po úpravě klikněte **"Save Rules"** (Uložit pravidla)
- Nové pravidla se použijí při příštím scanu

### B) Scheduling (Plánování automatických scanů)

**Co to je:**
- Automatické spouštění scanů
- Nemusíte klikat "Scan Now" ručně

**Možnosti:**

#### ⏸️ Manual Only (Jen ručně)
```
[✓] Manual Only - Scan only when I click "Scan Now"
```
**Výchozí nastavení**
- Scany spouštíte sami
- Vhodné pro začátečníky

#### 📅 Daily (Denně)
```
[ ] Daily at: [09:00] (time picker)
```
**Kdy použít:**
- Aktivní workspace s častými změnami
- Chcete vidět problémy každý den

**Jak nastavit:**
1. Zaškrtněte "Daily"
2. Vyberte čas (např. 09:00)
3. Scan proběhne každý den v ten čas

#### 📆 Weekly (Týdně)
```
[ ] Weekly on: [Monday ▼] at [09:00]
```
**Kdy použít:**
- Běžné workspaces
- **Doporučené nastavení**

**Jak nastavit:**
1. Zaškrtněte "Weekly"
2. Vyberte den v týdnu (např. Monday)
3. Vyberte čas (např. 09:00)
4. Scan proběhne každé pondělí v 9:00

#### 🗓️ Monthly (Měsíčně)
```
[ ] Monthly on day: [1] at [09:00]
```
**Kdy použít:**
- Méně aktivní workspaces
- Kontrola jednou za měsíc stačí

**Jak nastavit:**
1. Zaškrtněte "Monthly"
2. Vyberte den v měsíci (1-28)
3. Vyberte čas
4. Scan proběhne každý měsíc v ten den

**Uložení:**
- Klikněte **"Save Schedule"** (Uložit plán)
- Zobrazí se "Next scheduled scan: Monday, Nov 18, 09:00"

### C) Whitelist Management (Správa whitelistu)

**Co to je:**
- Seznam stránek, které Content Guardian přeskočí
- Nikdy se neobjeví jako problémové

**Jak zobrazit whitelist:**
```
╔══════════════════════════════════════════╗
║  Whitelisted Pages (5)                   ║
║                                          ║
║  • Page Template - Do Not Edit           ║
║    [Remove from Whitelist]               ║
║                                          ║
║  • Company Homepage                      ║
║    [Remove from Whitelist]               ║
║                                          ║
║  • Archive - Historical Records          ║
║    [Remove from Whitelist]               ║
╚══════════════════════════════════════════╝
```

**Jak přidat stránku na whitelist:**

**Možnost 1: Z Bulk Review nebo Detected Pages**
- Použijte tlačítko "Add to Whitelist"
- (Nejjednodušší způsob)

**Možnost 2: Ručně v Settings**
1. V sekci "Whitelist Management"
2. Najděte pole "Add Page to Whitelist"
3. Vložte URL nebo ID stránky
4. Klikněte "Add"

**Jak odebrat stránku z whitelistu:**
1. V seznamu whitelistovaných stránek
2. Najděte stránku, kterou chcete odebrat
3. Klikněte "Remove from Whitelist"
4. Při příštím scanu se může objevit jako problémová

**Export/Import whitelistu:**
```
[Export Whitelist to CSV]  [Import from CSV]
```
- **Export:** Stáhne seznam jako CSV soubor
- **Import:** Nahraje CSV soubor s URL stránek

---

## 🔄 Krok 8: Pravidelná údržba (Best Practices)

### Doporučený workflow:

#### **První použití (Den 1):**
1. ✅ Nainstalujte aplikaci
2. ✅ Spusťte první scan
3. ✅ Prohlédněte si výsledky v "Detected Pages"
4. ✅ Přidejte důležité stránky (šablony, landing pages) na whitelist
5. ✅ Zpracujte 5-10 stránek v Bulk Review (vyzkoušejte funkcionalitu)

#### **První týden:**
1. ✅ Projděte všechny problémové stránky v Bulk Review
2. ✅ Archivujte zjevně zastaralé stránky
3. ✅ Označte důležité stránky jako "Tagged"
4. ✅ Přidejte další stránky na whitelist podle potřeby
5. ✅ Nastavte týdenní automatické scany

#### **Každý týden:**
1. ✅ Zkontrolujte dashboard (2 minuty)
2. ✅ Pokud jsou nové problémové stránky, projednejte je (10-30 minut)
3. ✅ Exportujte audit log pro reporting (5 minut)

#### **Každý měsíc:**
1. ✅ Zkontrolujte whitelist - jsou všechny stránky stále relevantní?
2. ✅ Zkontrolujte detection rules - jsou prahy správně nastavené?
3. ✅ Vytvořte report pro stakeholdery (audit log export)

### Tipy pro efektivní používání:

**💡 Tip 1: Používejte důvody (reasons)**
- Vždy vyplňujte pole "Reason" při akcích
- Pomůže to vám i kolegům pochopit rozhodnutí
- Dobré pro audit trail

**💡 Tip 2: Začněte s nejhoršími**
- V "Detected Pages" setřiďte podle "Impact Score"
- Zpracujte nejdřív stránky s nejvyšším skóre
- Mají největší vliv na workspace

**💡 Tip 3: Spolupracujte s autory stránek**
- Než archivujete stránku, zeptejte se autora
- Možná má důvod, proč je stránka tak, jak je
- Používejte Confluence @mentions v komentářích

**💡 Tip 4: Exportujte často**
- Exportujte "Detected Pages" na začátku
- Sdílejte s týmem pro rozdělení práce
- Každý může zpracovat své stránky

**💡 Tip 5: Nastavte realistické prahy**
- Nepřehánějte to (např. 30 dní pro stale)
- Začněte s konzervativními hodnotami
- Postupně zpřísňujte podle kultury týmu

---

## ❓ Často kladené otázky (FAQ)

### Obecné otázky

**Q: Je Content Guardian zdarma?**
A: Ano, aplikace je kompletně zdarma.

**Q: Funguje to na Confluence Server?**
A: Ne, jen na Confluence Cloud.

**Q: Potřebuji admin práva?**
A: Ano, pro instalaci. Pro používání stačí běžná práva.

**Q: Kolik stránek může Content Guardian zpracovat?**
A: Tisíce stránek bez problémů. Scan může trvat déle u velkých workspaces.

### Detekce a scany

**Q: Jak dlouho trvá scan?**
A: 10-60 sekund pro běžné workspaces (100-1000 stránek). Může být delší u velmi velkých workspaces.

**Q: Musím spouštět scan ručně?**
A: Ne, můžete nastavit automatické scany (denně/týdně/měsíčně).

**Q: Proč některé stránky nejsou detekované?**
A: Možná jsou na whitelistu nebo nesplňují prahy v detection rules.

**Q: Můžu změnit, co se považuje za "problém"?**
A: Ano, v Settings → Detection Rules můžete upravit všechny prahy.

### Akce a zpracování

**Q: Co se stane, když archivuji stránku?**
A: Stránka se přesune do Confluence archivu. Není smazaná, jen skrytá. Můžete ji kdykoliv obnovit.

**Q: Můžu vrátit archivaci zpět?**
A: Ano, v Confluence můžete obnovit archivovanou stránku. Content Guardian to zaznamenává v audit logu.

**Q: Co znamená "Tag" (Označit)?**
A: Stránka zůstane beze změny, ale označí se jako zkontrolovaná. Příště se nezobrazí jako "New".

**Q: Jak odebrat stránku z whitelistu?**
A: Settings → Whitelist Management → najděte stránku → klikněte "Remove from Whitelist".

### Bezpečnost a soukromí

**Q: Kde se ukládají data?**
A: Vše se ukládá ve Forge Storage v rámci vašeho Confluence Cloud. Žádná data neopouštějí Atlassian infrastrukturu.

**Q: Čte Content Guardian obsah stránek?**
A: Ne, čte jen metadata (názvy, datumy, počty zobrazení). Obsah stránek nečte.

**Q: Je to GDPR compliant?**
A: Ano, aplikace je v souladu s GDPR. Viz Privacy Policy: https://github.com/tom28881/content-guardiand/blob/main/PRIVACY.md

**Q: Kdo může vidět audit log?**
A: Každý, kdo má přístup k aplikaci (obvykle admini).

### Technické problémy

**Q: Aplikace se nenačítá, co dělat?**
A:
1. Obnovte stránku (F5)
2. Zkuste jiný browser
3. Zkontrolujte, že máte přístup k Apps v Confluence
4. Kontaktujte support: tom28881@gmail.com

**Q: Scan selhal, co teď?**
A:
1. Zkuste spustit scan znovu
2. Zkontrolujte připojení k internetu
3. Pokud problém přetrvává, kontaktujte support

**Q: Vidím chybu "Backend is unavailable", co to znamená?**
A: Backend aplikace není dostupný. Obvykle se vyřeší samo za pár minut. Pokud ne, kontaktujte support.

**Q: Export do CSV nefunguje**
A: Pokud je datová sada velká, zkuste nejdřív filtrovat/omezit výsledky, pak exportovat.

---

## 🆘 Podpora a pomoc

### Když něco nejde:

**1. Zkontrolujte tento návod**
- Možná jste něco přehlédli
- FAQ sekce má odpovědi na běžné problémy

**2. GitHub Issues**
- Nahlaste problém: https://github.com/tom28881/content-guardiand/issues
- Popište problém co nejdetailněji
- Přiložte screenshot, pokud možno

**3. Email support**
- Email: tom28881@gmail.com
- Odpovídáme do 24 hodin
- Uveďte:
  - Co jste dělali
  - Co se stalo
  - Chybová hláška (pokud nějaká)
  - Screenshot

**4. Dokumentace**
- README: https://github.com/tom28881/content-guardiand/blob/main/README.md
- Privacy Policy: https://github.com/tom28881/content-guardiand/blob/main/PRIVACY.md
- Terms: https://github.com/tom28881/content-guardiand/blob/main/TERMS.md

---

## 📈 Pokročilé tipy

### Pro power users:

**1. Bulk Export & Process**
```
Workflow:
1. Detected Pages → Filter by type
2. Export to CSV
3. Open in Excel
4. Share with team members
5. Each person marks their decision in Excel
6. Import back or process manually
```

**2. Team Workflow**
```
Monday 9:00 AM:
- Automatic scan runs
- Email notification (if configured)
- Check dashboard

Monday 10:00 AM:
- Team meeting: Review new problems
- Assign pages to team members
- Each member processes their assigned pages

Friday:
- Export audit log
- Share report with management
```

**3. Integration with Confluence**
```
Tips:
- Use Confluence labels to mark pages
- Create Confluence page with Content Guardian reports
- Link to Content Guardian from team space
- Document your content governance policy
```

**4. Custom Reporting**
```
Use audit log exports to create:
- Monthly cleanup reports
- Team performance metrics
- Workspace health trends
- Compliance documentation
```

---

## 🎓 Další kroky

### Když už jste experti:

**1. Optimalizujte detection rules**
- Experimentujte s prahy
- Najděte sweet spot pro vaši organizaci
- Dokumentujte své nastavení

**2. Vytvořte content governance policy**
- Jak často kontrolovat stránky
- Kdo je zodpovědný
- Kdy archivovat vs. smazat
- Content Guardian jako nástroj pro enforcement

**3. Školte tým**
- Ukažte kolegům, jak používat aplikaci
- Sdílejte tento návod
- Vytvořte interní workshop

**4. Sdílejte feedback**
- Co funguje dobře?
- Co by mohlo být lepší?
- Jaké funkce chybí?
- Kontaktujte: tom28881@gmail.com

---

## 🎉 Shrnutí

Gratulujeme! Nyní víte, jak používat Content Guardian od začátku do konce.

### Rychlé připomenutí:

1. **Instalace** - Z Marketplace nebo Developer Console
2. **První scan** - Klikněte "Scan Now"
3. **Prohlížení** - Záložka "Detected Pages"
4. **Zpracování** - Záložka "Bulk Review"
5. **Historie** - Záložka "Audit Log"
6. **Nastavení** - Záložka "Settings"
7. **Pravidelná údržba** - Týdenní kontrola

### Klíčové body:

✅ Content Guardian automaticky najde problémy
✅ Můžete rozhodnout, co s každou stránkou
✅ Všechny akce jsou zaznamenané (audit trail)
✅ Můžete přizpůsobit podle vašich potřeb
✅ Je to zdarma a bezpečné

---

## 📞 Kontakt

**Máte otázky? Potřebujete pomoc?**

- 📧 Email: tom28881@gmail.com
- 🐙 GitHub: https://github.com/tom28881/content-guardiand
- 🐛 Issues: https://github.com/tom28881/content-guardiand/issues
- 📚 Dokumentace: https://github.com/tom28881/content-guardiand/blob/main/README.md

**Těšíme se na vaši zpětnou vazbu!**

---

**Verze návodu:** 1.0
**Datum:** November 13, 2025
**Pro aplikaci:** Content Guardian v2.0.0

---

**Hodně štěstí s čištěním vašeho Confluence workspace! 🚀**
