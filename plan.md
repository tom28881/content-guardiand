
---

### **Projektový Dokument: Confluence Content Guardian**

**Verze:** 1.2 (Final for Backend Development)
**Datum:** 6. srpna 2025
**Autor:** AI Asistent (na základě vašeho zadání)

### **Obsah**
1.  **Shrnutí pro Vedení (Executive Summary)**
2.  **Obchodní Případ a Tržní Příležitost**
3.  **Uživatelské Persony a Scénáře**
4.  **Produktové Požadavky (Funkční a Nefunkční)**
5.  **Design a Uživatelský Zážitek (UX/UI)**
6.  **Technická Architektura a Stack**
7.  **Go-to-Market Strategie a Cenový Model**
8.  **Plán Vydání a Roadmapa**
9.  **Předpoklady, Rizika a Mitigace**
10. **Mimo Rozsah (Out of Scope)**
11. **Slovník Pojmů**

---

### 1. Shrnutí pro Vedení (Executive Summary)

**Problém:** Confluence se ve firmách stává digitálním smetištěm. Zastaralý, duplicitní a nerelevantní obsah snižuje produktivitu, zvyšuje rizika a frustruje uživatele. Správa je časově náročná a často se zanedbává.

**Řešení:** Confluence Content Guardian je inteligentní plugin pro Confluence Cloud, který automatizuje životní cyklus obsahu. Na rozdíl od konkurence poskytuje **kontext o dopadu změn (Impact Score)**, **bezpečné hromadné akce s náhledem (Dry-Run)** a **efektivní nástroje pro hromadnou revizi (Bulk Review)**, čímž dává správcům jistotu a plnou kontrolu. **Disponujeme již hotovým, vizuálně i funkčně propracovaným frontendovým prototypem, který slouží jako přesná specifikace pro backend.**

### 2. Obchodní Případ a Tržní Příležitost

*   **Cílový trh:** Firmy využívající Confluence Cloud, primárně s 50+ uživateli a na plánech Premium/Enterprise.
*   **Konkurenční prostředí:** Přímá konkurence (Better Content Archiving) a nepřímá konkurence (nativní funkce Confluence).
*   **Naše odlišení (USP):**
    1.  **Inteligence:** `Impact Score` dává kontext pro rozhodování.
    2.  **Bezpečnost:** `Dry-Run` náhled a detailní auditní log budují důvěru.
    3.  **Efektivita:** `Bulk Review` a pokročilý reporting dramaticky zrychlují práci.
    4.  **UX:** Moderní, intuitivní a rychlé rozhraní, **jehož podoba je již definována hotovým frontendem.**

### 3. Uživatelské Persony a Scénáře

**Primární Persona (Uživatel / Administrátor):**
*   **Jméno:** Anna, Confluence Administrátor / Knowledge Manager
*   **Cíle:** Udržet Confluence přehledný, bezpečný a výkonný. Minimalizovat čas strávený reaktivní údržbou.
*   **Frustrace (“Pains”):** “Každý kvartál mám za úkol ‘uklidit Confluence’. Je to nekonečná práce. Bojím se něco smazat, protože nevím, jestli to někdo stále nepoužívá.”

**Sekundární Persona (Příjemce přínosů / Správce prostoru):**
*   **Jméno:** Tomáš, Týmový Vedoucí
*   **Cíle:** Zajistit, aby dokumentace jeho týmu byla 100% aktuální.
*   **Frustrace (“Pains”):** “Když od nás odejde zaměstnanec, zanechá po sobě desítky stránek a já netuším, které jsou ještě relevantní.”

**Uživatelská Cesta (Anny):**
1.  **Instalace a Nastavení:** Anna nainstaluje plugin a v přehledném rozhraní (definovaném v hotovém frontendu) nastaví pravidla a naplánuje první sken.
2.  **Analýza a Identifikace:** V pondělí otevře dashboard, vidí grafický přehled a přejde na seznam detekovaných stránek.
3.  **Rozhodování s Kontextem:** Seřadí stránky podle `Impact Score`. Stránky s vysokým dopadem přidá na `whitelist`.
4.  **Bezpečná Hromadná Akce:** Vyfiltruje 500 stránek s nízkým skóre. Klikne na "Archivovat". `Dry-Run` okno ji upozorní na problémy s oprávněními. Potvrdí akci.
5.  **Rychlá Revize:** Pro 100 stránek se středním skóre spustí funkci **"Hromadná revize (Bulk Review)"**. V rychlém rozhraní prochází jednu stránku po druhé a pomocí tlačítek rozhoduje o jejich osudu.
6.  **Výsledek a Reporting:** Během chvíle je hotovo. Anna exportuje souhrnný PDF report pro management a v "Auditním logu" vidí kompletní záznam.

### 4. Produktové Požadavky

#### 4.1. Funkční Požadavky (Epics & User Stories)

**EPIC 1: Skenovací Engine a Nastavení**
*   **USER STORY 1.1:** Jako administrátor chci nastavit globální pravidla a plán skenování.
    *   **AC:** Lze definovat parametry pro pravidla (stáří, neaktivita, neúplnost, osiřelost).
    *   **AC:** Lze nastavit frekvenci a čas skenu.
    *   **AC:** Lze spravovat `whitelist` stránek a prostorů.

**EPIC 2: Dashboard, Analýza a Reporting**
*   **USER STORY 2.1:** Jako administrátor chci vidět přehledný dashboard s výsledky skenu pro rychlou analýzu.
    *   **AC 2.1.1:** Dashboard obsahuje **grafické vizualizace**: koláčový graf pro rozpad problémů a časovou osu pro stáří stránek.
    *   **AC 2.1.2:** Interaktivní tabulka s detekovanými stránkami je stránkovaná, filtrovatelná a řaditelná.
    *   **AC 2.1.3:** Sloupec `Impact Score` je barevně kódovaný.
*   **USER STORY 2.2:** Jako administrátor chci exportovat data pro další analýzu nebo sdílení.
    *   **AC 2.2.1:** Filtrovaný seznam detekovaných stránek lze exportovat do formátů **CSV, Excel a PDF**.

**EPIC 3: Hromadné Akce a Bezpečnost**
*   **USER STORY 3.1:** Jako administrátor chci provádět hromadné akce s jistotou díky `Dry-Run` náhledu.
    *   **AC 3.1.1:** Před každou hromadnou akcí se zobrazí modální okno "Potvrzení akce".
    *   **AC 3.1.2:** Okno jasně zobrazuje počet úspěšných akcí, varování a chyby.
    *   **AC 3.1.3:** Podporované akce: `Archivovat`, `Přidat štítek`, `Přidat na whitelist`.
*   **USER STORY 3.2:** Jako administrátor chci efektivně a rychle projít velké množství stránek a rozhodnout o jejich osudu.
    *   **AC 3.2.1:** Uživatel může vybrat více stránek a spustit akci **"Hromadná revize (Bulk Review)"**.
    *   **AC 3.2.2:** Otevře se specializované rozhraní, které zobrazuje jednu stránku po druhé.
    *   **AC 3.2.3:** Pro každou stránku jsou k dispozici rychlé akce: `Ponechat`, `Označit k revizi`, `Archivovat`.

**EPIC 4: Správa Uživatelů a Oprávnění**
*   **USER STORY 4.1:** Jako administrátor chci spravovat, kdo má k pluginu přístup a jaké má oprávnění.
    *   **AC 4.1.1:** Seznam uživatelů je synchronizován z Confluence.
    *   **AC 4.1.2:** Lze mapovat Confluence skupiny na role v pluginu (Admin, Editor, Viewer).
    *   **AC 4.1.3:** Sekce oprávnění jasně vizualizuje, co která role může dělat.

**EPIC 5: Audit a Reporting**
*   **USER STORY 5.1:** Jako administrátor chci mít kompletní a neměnný záznam o všech akcích.
    *   **AC 5.1.1:** Samostatná záložka "Auditní log" zobrazuje všechny akce.
    *   **AC 5.1.2:** Log je prohledávatelný, filtrovatelný a lze jej exportovat do **CSV, Excel a PDF**.

#### 4.2. Nefunkční Požadavky (NFRs)
*   **Výkon:** Načtení dashboardu < 3s, filtrování < 500ms.
*   **Škálovatelnost:** Architektura navržena pro 200 000+ stránek.
*   **Bezpečnost:** Soulad s Atlassian Marketplace Security, šifrování dat, respektování oprávnění.
*   **Použitelnost:** Intuitivní ovládání, jasné texty, srozumitelné chybové hlášky.


### **5. Design a Uživatelský Zážitek (UX/UI)**

Frontend Framework: Forge UI Kit 2
Odkaz na dokumentaci: developer.atlassian.com/platform/forge/ui-kit/components/
Výhody tohoto přístupu:
Nativní Vzhled: Aplikace bude vizuálně k nerozeznání od zbytku Confluence, včetně plné podpory světlého/tmavého režimu.
Výkon: UI Kit aplikace se načítají výrazně rychleji.
Jednoduchost a Bezpečnost: Menší množství kódu a závislostí znamená rychlejší vývoj a vyšší bezpečnost.
5.2. Mapování Návrhů na Komponenty UI Kit 2
Dashboard:
Layout: <Grid>, <Cell>
Metriky: <Heading>, <Text>, <Strong>
Grafy: <PieChart>, <BarChart>, <LineChart> (UI Kit)
Poznámka: Grafové komponenty vyžadují @forge/react ≥ 11.2.0.
Detected Pages:
Tabulka: <DynamicTable>
Interaktivita: Filtrování pomocí <TextField> a <Select>, řazení je nativní vlastnost tabulky.
Status: <Badge> s různými appearance props.
Bulk Actions:
Layout: <Form> obalující <DynamicTable>.
Výběr: <Checkbox> v záhlaví i v každém řádku.
Potvrzení akce (Dry-Run): <Modal> (UI Kit 2), který zobrazí souhrn a bude vyžadovat potvrzení pomocí <Button>.
Audit Log & Settings:
Layout: <Form> pro nastavení, <DynamicTable> pro logy.
Komponenty: <TextField>, <Select>, <Checkbox>, <DatePicker>, <Modal>

### 6. Technická Architektura a Stack

Platforma: Výhradně Atlassian Forge pro Confluence Cloud.
Frontend: Forge UI Kit 2. Uživatelské rozhraní bude postaveno pomocí nativních React komponent poskytovaných platformou Forge.
Backend: Forge Functions (Node.js) v serverless architektuře. Veškerá aplikační logika, volání API a zpracování dat bude probíhat zde.
Uložiště dat: Forge Storage API pro ukládání veškerých perzistentních dat (pravidla, logy, nastavení).
Klíčová API: Confluence REST API, Confluence Analytics API, Forge API.
Omezení: Závislost na limitech Atlassian API. Analytics API vyžaduje plán Premium+.

### 7. Go-to-Market Strategie a Cenový Model

*   **Fáze:** Beta program -> Veřejné spuštění na Marketplace -> Růst a škálování.
*   **Cenový model:** Tiered pricing podle počtu uživatelů v instanci, s 30denní trial verzí.
*   **Marketing:** Obsahový marketing, placená reklama, aktivita v komunitách.

### 8. Plán Vydání a Roadmapa

*   **Verze 1.0 (MVP):** Základní skenování a jednotlivé akce pro validaci myšlenky.
*   **Verze 1.1 (Tento dokument):** Hromadné akce, Dry-Run, Impact Score, **pokročilý reporting (grafy, exporty)** a **funkce Bulk Review**.
*   **Verze 1.2 (Q+1):** Notifikace autorům, pokročilý `whitelist` (podle vzorů).
*   **Verze 2.0 (Dlouhodobý cíl):** Sémantická detekce duplicit (AI), asistent pro slučování stránek.

### 9. Předpoklady, Rizika a Mitigace

*   **Riziko (Tržní):** Silná konkurence. **Mitigace:** Jasná diferenciace (bezpečnost, UX, Bulk Review).
*   **Riziko (Technické):** Výkon na velkých instancích. **Mitigace:** Důkladné testování, optimalizace.
*   **Riziko (Adopce):** Strach z automatizace. **Mitigace:** Důraz na bezpečnostní prvky a kontrolu uživatele.

### 10. Mimo Rozsah (pro tuto verzi)

*   Podpora pro Confluence Data Center / Server.
*   Detekce duplicit v reálném čase.
*   Sémantická analýza obsahu.

### 11. Slovník Pojmů

*   **Impact Score:** Metrika odhadující důležitost stránky.
*   **Dry-Run:** Náhledový režim před provedením hromadné akce.
*   **Bulk Review:** Specializované rozhraní pro rychlé sekvenční hodnocení více stránek.
*   **Whitelist:** Seznam stránek a prostorů ignorovaných při skenování.