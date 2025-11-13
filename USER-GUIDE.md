# 📚 Content Guardian - User Guide

**For users who know nothing about the app**

Welcome! This guide will walk you step-by-step through installing and using Content Guardian. No technical knowledge required.

***

## 🤔 What is Content Guardian?

**Simply put:**
Content Guardian is a Confluence app that automatically finds issues in your documentation and helps you fix them.

**What kind of issues does it find?**
- 📅 **Outdated pages** – Pages that haven’t been updated for a long time
- 👀 **Unread pages** – Pages that nobody reads
- 🔗 **Orphaned pages** – Pages nobody links to
- ✏️ **Incomplete pages** – Pages with very little content

**Why do I need this?**
- Your Confluence becomes cluttered with old pages over time
- It’s hard to find important docs among unneeded ones
- You're unsure what you can safely delete
- Content Guardian shows you exactly what’s a problem and helps you handle it

***


## 🚀 Step 1: First Launch

### How to open the app:

1. **In Confluence, open the Apps menu**
   - In the top bar, find **Apps**
   - Click the arrow beside “Apps”
   - Dropdown menu appears

2. **Find Content Guardian**
   - Find **Content Guardian** in the list of apps
   - Click it

3. **App opens**
   - A new page with the app loads
   - It can take 2–5 seconds
   - You’ll see the main dashboard

### First launch illustration:

```
╔══════════════════════════════════════════╗
║  Content Guardian                         ║
║                                          ║
║  Problem Pages: 0                        ║
║  Impact Score: 0                         ║
║                                          ║
║  [Scan Now] - Click to run first scan    ║
╚══════════════════════════════════════════╝
```

**Why are numbers zero?**
- No scans have been run yet
- You need to start the first detection manually

***

## 🔍 Step 2: First Scan (Issue Detection)

### How to initiate a scan:

1. **On the Dashboard screen:**
   - Find the **“Scan Now”** button
   - Click it

2. **Scan starts:**
   - Loading animation appears
   - See: “Scanning pages...”
   - Takes 10–60 seconds (depends on number of pages)

3. **Scan finishes:**
   - Numbers on the dashboard update
   - See the number of problematic pages
   - Graph with problem breakdown appears

### What the numbers mean:

**Problem Pages:**
- Number of pages with any issue
- Example: **15** = 15 problem pages found

**Impact Score:**
- Total value indicating severity
- Higher means more issues
- Example: **285** = lots of problems

**Breakdown Chart:**
- Colorful pie chart
- Shows which types of problems are most common
- Each color = one problem type

### Example scan result:

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

***

## 📊 Step 3: Viewing Problematic Pages

### How to view the list:

1. **Click the “Detected Pages” tab**
   - It’s the second tab at the top
   - Table with all problematic pages appears

2. **What’s in the table:**

| Column        | Meaning                    | Example                  |
|--------------|----------------------------|--------------------------|
| **Title**    | Page title                 | “Meeting Notes 2022”     |
| **Space**    | Which space                | “IT Team”                |
| **Last Updated** | When it was last edited | “2 years ago”            |
| **Views**    | How many people viewed (90 days) | “5 views”      |
| **Problems** | What issues it has         | “Stale, Inactive”        |
| **Impact**   | Severity (1–100)           | “35”                     |
| **Status**   | Action status              | “New”                    |

### How to filter and search:

**Filter by problem type:**
1. Buttons above the table:
   - 🟡 **Stale** – Only outdated pages
   - 🔵 **Inactive** – Only unread pages
   - 🟢 **Orphaned** – Only orphaned pages
   - 🟣 **Incomplete** – Only incomplete pages
2. Click a type to filter
3. Table updates to show only selected type

**Search:**
1. Find search box at the top
2. Enter page title you’re looking for
3. Results appear instantly

**Sorting:**
1. Click column header (e.g. “Last Updated”)
2. Table sorts by that column
3. Click again to reverse order

### How to open a page in Confluence:

- In "Title" column, click the page name
- New browser tab opens the page in Confluence
- You can read and decide what to do with it

***

## ✅ Step 4: Processing Pages (What now?)

Now you have a list of problem pages. What next?

### Option A: Bulk Review

**Best for:** Lots of pages, want to go through one by one

#### How it works:

1. **Click the “Bulk Review” tab**
   - Third tab at the top

2. **First problem page details show:**
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

3. **Read about the page**
   - Click “Open in Confluence” to view it
   - Decide what to do

4. **Select action:**

#### 🟢 **Keep (Tag)**
**When to use:**
- Page is still valid and important
- Maybe just needs an update
- You don’t want to delete or archive it

**What happens:**
- Page stays in Confluence
- Marked as “Tagged” (Checked)
- Will not appear as “New” in next scan
- You can add a note for audit trail

**Example:**
```
Page: “API Documentation v2”
Reason: “Still valid, team uses this daily”
Action: Keep (Tag)
```

#### ⚪ **Add to Whitelist**
**When to use:**
- Page is important but might look like a problem
- e.g. templates, landing pages, archived docs
- You never want it flagged as a problem

**What happens:**
- Added to whitelist
- Future scans skip it
- Will not show as problematic
- You can remove from whitelist in Settings

**Example:**
```
Page: “Page Template - Do Not Edit”
Reason: “This is a template, should never be flagged”
Action: Add to Whitelist
```

#### 🟠 **Archive**
**When to use:**
- Page is obsolete and no longer needed
- Content is outdated or incorrect
- Nobody reads it
- But you don’t want to completely delete (might need it someday)

**What happens:**
- Page is moved to Confluence archive
- No longer appears in standard search
- Still exists, can be restored
- Not shown to regular users

**Example:**
```
Page: “Meeting Notes - January 2022”
Reason: “Obsolete meeting notes, no longer relevant”
Action: Archive
```

#### ⏭️ **Skip**
**When to use:**
- Not sure what to do
- Want to decide later
- Need to discuss with someone

**What happens:**
- Move to next page
- Current page stays as “New”
- Will show up again in next Bulk Review

**Example:**
```
Decision: “Not sure if this is still needed”
Action: Skip (will return to it)
```

#### ⬅️ **Back**
**When to use:**
- Want to return to previous page
- Made a mistake, want to correct it

**What happens:**
- Go back to previous page
- Can change previous decision

5. **Confirm action:**

After clicking (except Skip and Back) a confirmation box appears:

```
╔══════════════════════════════════════════╗
║  Confirm Action                          ║
║                                          ║
║  Action: Archive                         ║
║  Page: Meeting Notes - Q1 2022           ║
║                                          ║
║  Reason (optional):                      ║
║  ┌────────────────────────────────────┐ ║
║  │ Obsolete meeting notes             │ ║
║  └────────────────────────────────────┘ ║
║                                          ║
║  [Confirm]            [Cancel]           ║
╚══════════════════════════════════════════╝
```

- **Reason:** Optional field for explanation
  - Not required, but good for audit trail
  - Example: “No longer used”, “Duplicate content”, “Project cancelled”
- **Confirm:** Confirm and continue
- **Cancel:** Cancel the action

6. **Automatic move to next page:**
   - After confirming, the next problem page loads
   - Continue until done

### Option B: Manual processing from the table

**Best for:** If you want to handle only specific pages

1. In “Detected Pages” tab, find the page
2. Action buttons are in the page’s row
3. Click the action you want
4. Confirmation works same as in Bulk Review

***

## 📜 Step 5: Audit Log (Action History)

### What is the Audit Log?

- Record of every action you’ve performed
- Who, when, what, and why
- Important for reporting and compliance

### How to view:

1. **Click the “Audit Log” tab**
   - It’s the fourth tab

2. **See a table with history:**

| Timestamp    | User      | Action         | Page           | Reason      |
|--------------|-----------|----------------|----------------|-------------|
| Nov 13, 14:30| Jan Novak | Archive        | Meeting Notes 2022 | Obsolete |
| Nov 13, 14:28| Jan Novak | Keep (Tag)     | API Docs v2    | Still valid |
| Nov 13, 14:25| Jan Novak | Whitelist      | Page Template  | Template    |

### What you can do:

**Filter by action:**
- “Action” dropdown menu
- Select action type (Archive, Tag, Whitelist)
- Only those actions will show

**Filter by user:**
- “User” dropdown menu
- Select a user
- Only their actions display

**Search for a page:**
- Search box
- Enter page name
- Find every action associated

**Export to CSV:**
- “Export to CSV” button
- Downloads full history as CSV
- Open in Excel

### Why is this useful:

- **Reporting:** Show management what you’ve done
- **Compliance:** Demonstrate governance processes
- **Control:** See who did what
- **Reversibility:** Track actions to revert mistakes

***

## ⚙️ Step 6: Settings

### How to open settings:

1. **Click the “Settings” tab**
   - It’s the last (fifth) tab

2. **See three sections:**
   - Detection Rules
   - Scheduling
   - Whitelist Management

### A) Detection Rules

**What are they:**
- Define what’s considered a “problem”
- Adjust for your organization

**Settings:**

#### 🟡 Stale Threshold
```
Stale Threshold (days): [180]
```
**What it means:**
- Pages not updated in X days
- Default: 180 days (6 months)

**How to change:**
- Edit the field
- Example: `365` = pages older than a year
- Example: `90` = older than 3 months

**When to use:**
- **Conservative org:** `365` days – keep more pages
- **Active org:** `90` days – expect frequent updates

#### 🔵 Inactive Threshold
```
Inactive Threshold (days): [90]
```
**What it means:**
- Pages not viewed in X days
- Default: 90 days (3 months)

**How to change:**
- Same as Stale Threshold
- Example: `180` = 6 months no views
- Example: `30` = 1 month no views

#### 📊 Low View Threshold
```
Low View Count (per month): [10]
```
**What it means:**
- Pages with less than X views per month
- Default: 10 views/month

**How to change:**
- Example: `5` = 5 or fewer is “low”
- Example: `20` = 20 or fewer

#### ✏️ Incomplete Threshold
```
Minimum Content Length (characters): [100]
```
**What it means:**
- Pages with less than X characters of content
- Default: 100 characters

**How to change:**
- Example: `200` = less than 200 chars
- Example: `50` = less than 50 chars

**Saving changes:**
- After editing, click **"Save Rules"**
- Changes apply at next scan

### B) Scheduling (Automatic Scans)

**What is it:**
- Automatically runs scans
- No need to click “Scan Now” manually

**Options:**

#### ⏸️ Manual Only
```
[✓] Manual Only - Scan only when I click "Scan Now"
```
**Default setting**
- You run scans yourself
- Good for beginners

#### 📅 Daily
```
[ ] Daily at: [09:00]
```
**When to use:**
- Active workspace with many changes
- Want daily issues report

**How to set up:**
1. Check “Daily”
2. Choose time (e.g., 09:00)
3. Scan runs daily at chosen time

#### 📆 Weekly
```
[ ] Weekly on: [Monday ▼] at [09:00]
```
**When to use:**
- Standard workspaces
- **Recommended**

**How to set up:**
1. Check “Weekly”
2. Choose a day (e.g., Monday)
3. Choose a time (e.g., 09:00)
4. Scan runs weekly at set time

#### 🗓️ Monthly
```
[ ] Monthly on day: [1] at [09:00]
```
**When to use:**
- Less active workspaces
- Monthly check is enough

**How to set up:**
1. Check “Monthly”
2. Set day (1–28)
3. Choose time
4. Scan runs monthly at chosen day

**Saving:**
- Click **"Save Schedule"**
- See: “Next scheduled scan: Monday, Nov 18, 09:00”

### C) Whitelist Management

**What is it:**
- List of pages Content Guardian will skip
- Never flagged as problems

**How to view whitelist:**
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

**How to add a page to whitelist:**

**Option 1: From Bulk Review or Detected Pages**
- Use “Add to Whitelist” button
- (Easiest way)

**Option 2: Manually in Settings**
1. In “Whitelist Management”
2. Find “Add Page to Whitelist” field
3. Enter page URL or ID
4. Click “Add”

**How to remove from whitelist:**
1. In whitelisted pages list
2. Find the page you want to remove
3. Click “Remove from Whitelist”
4. Can reappear as a problem in next scan

**Export/Import whitelist:**
```
[Export Whitelist to CSV]  [Import from CSV]
```
- **Export:** Download as CSV
- **Import:** Upload a CSV with page URLs

***

## 🔄 Step 7: Ongoing Maintenance (Best Practices)

### Recommended workflow:

#### **First use (Day 1):**
1. ✅ Install the app
2. ✅ Run first scan
3. ✅ Review results in “Detected Pages”
4. ✅ Add important pages (templates, landing pages) to whitelist
5. ✅ Process 5–10 pages in Bulk Review (try the functions)

#### **First week:**
1. ✅ Go through all problem pages in Bulk Review
2. ✅ Archive clearly outdated pages
3. ✅ Tag important pages
4. ✅ Add more pages to whitelist as needed
5. ✅ Setup weekly automatic scans

#### **Each week:**
1. ✅ Check dashboard (2 minutes)
2. ✅ Discuss new problem pages (10–30 minutes)
3. ✅ Export audit log for reporting (5 minutes)

#### **Each month:**
1. ✅ Check whitelist – are all pages still relevant?
2. ✅ Check detection rules – are thresholds set right?
3. ✅ Create report for stakeholders (using audit log export)

### Tips for effective use:

**💡 Tip 1: Use reasons**
- Always fill the “Reason” field on actions
- Helps you and colleagues understand decisions
- Good audit trail

**💡 Tip 2: Start with the worst**
- In “Detected Pages”, sort by “Impact Score”
- Process pages with highest score first
- They affect your workspace the most

**💡 Tip 3: Collaborate with page authors**
- Before archiving, ask the author
- They might have a reason for the page’s state
- Use Confluence @mentions in comments

**💡 Tip 4: Export often**
- Export “Detected Pages” at the start
- Share with team to split the workload
- Everyone can process their pages

**💡 Tip 5: Set realistic thresholds**
- Don’t go too strict (e.g., 30 days for stale)
- Start with conservative values
- Tighten over time based on team culture

***

## ❓ Frequently Asked Questions (FAQ)

### General

**Q: Is Content Guardian free?**
A: Yes, it’s completely free.

**Q: Does it work on Confluence Server?**
A: No, only on Confluence Cloud.

**Q: Do I need admin rights?**
A: Yes, for installation. Normal rights for regular use.

**Q: How many pages can Content Guardian handle?**
A: Thousands, no issue. Scans may take longer for large workspaces.

### Detection & Scans

**Q: How long does a scan take?**
A: 10–60 seconds for 100–1000 pages. Longer for really big workspaces.

**Q: Do I have to run scans manually?**
A: No, you can set up automatic scans (daily/weekly/monthly).

**Q: Why are some pages not detected?**
A: They may be on the whitelist or don’t meet detection thresholds.

**Q: Can I change what’s considered a “problem”?**
A: Yes, adjust all thresholds in Settings → Detection Rules.

### Actions & Processing

**Q: What happens when I archive a page?**
A: It moves to Confluence archive. Not deleted, just hidden. Can restore any time.

**Q: Can I reverse archiving?**
A: Yes, restore archived pages in Confluence. Content Guardian logs it in audit log.

**Q: What does “Tag” mean?**
A: Page stays as is, but marked as checked. Won’t show as “New” next time.

**Q: How to remove a page from whitelist?**
A: Settings → Whitelist Management → Find page → Click “Remove from Whitelist”

### Security & Privacy

**Q: Where is data stored?**
A: All is stored in Forge Storage inside your Confluence Cloud. No data leaves Atlassian.

**Q: Does Content Guardian read page content?**
A: No, only metadata (titles, dates, view counts). It does not read full contents.

**Q: Is it GDPR compliant?**
A: Yes, fully GDPR compliant. See Privacy Policy.

**Q: Who can view the audit log?**
A: Anyone with access to the app (typically admins).

### Technical Issues

**Q: App isn’t loading, what to do?**
A:
1. Refresh the page (F5)
2. Try another browser
3. Make sure you have Apps access in Confluence
4. Contact support: tom28881@gmail.com

**Q: Scan failed, now what?**
A:
1. Try scanning again
2. Check your internet connection
3. If it persists, contact support

**Q: Seeing “Backend is unavailable” error, what does it mean?**
A: Backend is down. Usually sorts itself out in a few minutes. Contact support if not.

**Q: CSV export doesn’t work**
A: If dataset’s too big, try filtering/limiting results first, then export.

***


## 📈 Advanced Tips

### For power users:

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
- Create a Confluence page with Content Guardian reports
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

***

## 🎓 Next Steps

### If you’re advanced:

**1. Optimize detection rules**
- Experiment with thresholds
- Find the sweet spot for your org
- Document settings

**2. Create a content governance policy**
- How often to check pages
- Who is responsible
- When to archive vs. delete
- Use Content Guardian for enforcement

**3. Train your team**
- Show colleagues how to use the app
- Share this guide
- Run internal workshops

**4. Share feedback**
- What works well?
- What could be improved?
- What features are missing?
- Contact: tom28881@gmail.com

***

## 🎉 Summary

Congratulations! You now know how to use Content Guardian from start to finish.

### Quick recap:

1. **Install** – From Marketplace or Developer Console
2. **First scan** – Click “Scan Now”
3. **View** – Detected Pages tab
4. **Processing** – Bulk Review tab
5. **History** – Audit Log tab
6. **Settings** – Settings tab
7. **Regular maintenance** – Weekly checkup

   <img width="1179" height="822" alt="Screenshot 2025-11-13 at 13 03 16" src="https://github.com/user-attachments/assets/7b0e7a2d-7326-4218-a925-8f441f1247f7" />
<img width="1127" height="940" alt="Screenshot 2025-11-13 at 13 03 10" src="https://github.com/user-attachments/assets/183515e1-7a30-471a-b8aa-e4b3898fad8d" />
<img width="1292" height="938" alt="Screenshot 2025-11-13 at 13 03 04" src="https://github.com/user-attachments/assets/a1cdd02f-ad34-48b3-8aac-957d2d519686" />
<img width="1125" height="1234" alt="Screenshot 2025-11-13 at 13 02 45" src="https://github.com/user-attachments/assets/be1256d7-238b-4dfa-a5b9-82ca7c0cef8e" />
<img width="1652" height="1247" alt="Screenshot 2025-11-13 at 13 02 41" src="https://github.com/user-attachments/assets/fef256e5-87f5-4a76-b082-041948afd35e" />
<img width="1503" height="1234" alt="Screenshot 2025-11-13 at 13 02 37" src="https://github.com/user-attachments/assets/32de2c80-b489-4aea-a19e-5afa5dc478f6" />


**Good luck cleaning up your Confluence workspace! 🚀**
