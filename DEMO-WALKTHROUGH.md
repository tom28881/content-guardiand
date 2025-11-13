# 🎥 Content Guardian - Demo Walkthrough

**For Atlassian Marketplace Reviewers**

This document provides a comprehensive demonstration of Content Guardian's functionality with screenshots showing real usage.

---

## 📋 Demo Overview

**What this demo shows:**
1. Initial dashboard with problem detection
2. Filtering and searching problematic pages
3. Bulk review workflow with actions
4. Audit trail for compliance
5. Configuration and customization
6. End-to-end user journey

**Demo Environment:**
- Confluence Cloud: stakeholder-reports-ai.atlassian.net
- Version: 2.0.0 (Production)
- Test Data: Real Confluence pages with various problems detected

---

## 🎬 Demo Workflow

### Step 1: Dashboard - Problem Overview

**Screenshot:** `screenshots/verify-01-initial-load.png`

**What you see:**
- **Problem Pages Counter:** Shows total number of problematic pages (15 detected)
- **Impact Score:** Aggregated score showing severity (100+)
- **Problem Breakdown Chart:** Visual pie chart showing distribution by problem type:
  - Stale pages (not updated in 180+ days)
  - Inactive pages (no views in 90+ days)
  - Orphaned pages (no incoming links)
  - Incomplete pages (missing content)
- **Quick Filters:** One-click filters for each problem type
- **Last Scan:** Timestamp showing when detection last ran
- **Status Indicators:** Backend connectivity and system health

**User Journey:**
1. Admin opens Content Guardian from Confluence Apps menu
2. Immediately sees overview of workspace health
3. Can identify biggest problem areas at a glance

---

### Step 2: Detected Pages - Detailed View

**Screenshot:** `screenshots/verify-02-detected-pages.png`

**What you see:**
- **Data Table:** List of all problematic pages with:
  - Page title (clickable link to actual page)
  - Space name
  - Last updated date
  - View count
  - Problem types (tags)
  - Impact score
  - Current status (New/Tagged/Archived/Whitelisted)
- **Advanced Filters:**
  - Filter by problem type
  - Filter by space
  - Filter by status
  - Search by page title
- **Sort Controls:** Sort by any column
- **Column Toggle:** Show/hide columns
- **Export Options:**
  - Export to CSV
  - Export to Excel
  - Copy to clipboard

**User Journey:**
1. User clicks "Detected Pages" tab
2. Reviews detailed list of problematic pages
3. Filters to focus on specific problem type (e.g., "stale" pages)
4. Exports report to share with stakeholders
5. Clicks on page title to review actual content

**Real Data Shown:**
- Multiple pages from different spaces
- Various problem combinations
- Realistic dates and metrics
- English UI labels (fully internationalized)

---

### Step 3: Bulk Review - Take Action

**Screenshot:** `screenshots/verify-03-bulk-review.png`

**What you see:**
- **Page Preview:** Full page details including:
  - Title
  - Space
  - URL (clickable)
  - Last updated date
  - View count
  - Problem tags
  - Impact score
- **Action Buttons (English):**
  - **"Keep (Tag)"** - Mark page as reviewed but keep it
  - **"Add to Whitelist"** - Permanently exclude from detection
  - **"Archive"** - Move page to archive status
  - **"Skip"** - Move to next page without action
  - **"Back"** - Return to previous page
- **Progress Indicator:** Shows position in review queue (e.g., "Page 1 of 15")
- **Reason Field:** Optional text field to document why action was taken

**User Journey:**
1. User clicks "Bulk Review" tab
2. Sees first problematic page with full context
3. Reviews page details and decides action
4. Clicks "Keep (Tag)" to mark as reviewed
5. Modal appears asking for optional reason
6. Confirms action
7. Automatically advances to next page
8. Continues until all pages reviewed

**Action Flow:**
```
Page Review → Choose Action → Confirm (with optional reason) → Action Applied → Audit Log Entry Created → Next Page
```

**Note:** All actions are reversible and tracked in audit log.

---

### Step 4: Audit Log - Compliance Trail

**Screenshot:** `screenshots/verify-04-audit-log.png`

**What you see:**
- **Audit History Table:**
  - Timestamp of each action
  - User who performed action
  - Action type (tag/whitelist/archive)
  - Page affected (with link)
  - Reason provided (if any)
- **Filters:**
  - Filter by action type
  - Filter by user
  - Filter by date range
  - Search by page name
- **Export Options:**
  - Export complete audit trail to CSV
  - Generate compliance reports

**User Journey:**
1. Admin clicks "Audit Log" tab
2. Reviews complete history of all actions
3. Verifies who made which decisions and when
4. Exports for compliance reporting or stakeholder review

**Compliance Value:**
- Complete audit trail for governance
- GDPR/SOX compliance support
- Transparency for content decisions
- Ability to reverse decisions if needed

---

### Step 5: Settings - Configuration

**Screenshot:** `screenshots/verify-05-settings.png`

**What you see:**
- **Detection Rules Section:**
  - Configure thresholds for each problem type:
    - Stale threshold: Days since last update (default: 180)
    - Inactive threshold: Days without views (default: 90)
    - Low view threshold: Minimum views per month (default: 10)
    - Incomplete threshold: Minimum content length (default: 100 chars)
  - Enable/disable specific detection types
- **Scheduling Section:**
  - Configure automatic scan frequency:
    - Manual only
    - Daily at specified time
    - Weekly on specified day
    - Monthly on specified date
  - Last scan timestamp
  - Next scheduled scan
- **Whitelist Management:**
  - View all whitelisted pages
  - Add pages by URL or ID
  - Remove pages from whitelist
  - Bulk import/export whitelist

**User Journey:**
1. Admin clicks "Settings" tab
2. Adjusts detection rules to match organization's needs
3. Sets up weekly automatic scans
4. Adds specific pages to whitelist (e.g., templates, landing pages)
5. Saves configuration
6. System uses new rules for future scans

**Customization Examples:**
- Conservative org: Stale = 365 days, Inactive = 180 days
- Aggressive org: Stale = 90 days, Inactive = 30 days
- Mixed: Different rules for different spaces (future feature)

---

## 🔄 Complete User Journey Example

### Scenario: IT Admin Managing Documentation Quality

**Step 1: Discovery (Dashboard)**
- Admin opens Content Guardian
- Sees 47 problem pages detected
- Impact score: 285
- Notices 23 stale pages (biggest problem)

**Step 2: Investigation (Detected Pages)**
- Clicks "Detected Pages"
- Filters to show only "stale" pages
- Sorts by "Last Updated" (oldest first)
- Finds pages not updated in 2+ years
- Exports list to share with team leads

**Step 3: Action (Bulk Review)**
- Clicks "Bulk Review"
- Reviews first page: Old meeting notes from 2022
- Clicks "Archive" → Enters reason: "Obsolete meeting notes"
- Confirms action
- Next page: Important documentation, still relevant
- Clicks "Keep (Tag)" → Enters reason: "Still valid, needs refresh"
- Next page: Template that should never be flagged
- Clicks "Add to Whitelist" → Reason: "System template"
- Continues through all 47 pages over 2 days

**Step 4: Verification (Audit Log)**
- Reviews audit log to see all actions
- Exports report for monthly stakeholder meeting
- Shows 20 pages archived, 15 tagged, 12 whitelisted

**Step 5: Optimization (Settings)**
- Adjusts stale threshold from 180 to 120 days
- Sets up weekly Monday morning scans
- Adds 5 more template pages to whitelist

**Result:**
- Workspace cleaned up
- Team awareness of content quality increased
- Ongoing monitoring established
- Compliance trail maintained

---

## 🎯 Key Features Demonstrated

### 1. Automated Detection
- ✅ Detects multiple problem types simultaneously
- ✅ Configurable rules and thresholds
- ✅ Scheduled automatic scanning
- ✅ Real-time impact scoring

### 2. Visual Dashboard
- ✅ At-a-glance workspace health
- ✅ Problem breakdown charts
- ✅ Quick filters for rapid focus
- ✅ Status indicators

### 3. Advanced Filtering & Search
- ✅ Multi-dimensional filtering
- ✅ Column sorting and customization
- ✅ Search across all fields
- ✅ Export to multiple formats

### 4. Efficient Bulk Actions
- ✅ One-page-at-a-time review workflow
- ✅ Multiple action types (tag/whitelist/archive)
- ✅ Optional reason documentation
- ✅ Progress tracking
- ✅ Skip and navigate controls

### 5. Complete Audit Trail
- ✅ Every action logged with timestamp
- ✅ User attribution
- ✅ Reason documentation
- ✅ Filterable and exportable
- ✅ Compliance-ready reporting

### 6. Flexible Configuration
- ✅ Customizable detection rules
- ✅ Scheduled automation
- ✅ Whitelist management
- ✅ Per-organization tuning

### 7. Production Quality
- ✅ Fully internationalized English UI
- ✅ Responsive design
- ✅ Error handling with friendly messages
- ✅ Loading states and feedback
- ✅ 111/111 unit tests passing

---

## 🔐 Security & Privacy

**Demonstrated in screenshots:**
- ✅ No sensitive data exposed
- ✅ All data stays within Confluence
- ✅ User authentication via Confluence
- ✅ Permission-based access control

**Privacy:**
- Only page metadata accessed (titles, dates, IDs)
- No page body content read or stored
- All data stored in Forge Storage (Confluence Cloud)
- No external API calls or data transmission
- GDPR/CCPA compliant (see PRIVACY.md)

**Permissions Used:**
- `storage:app` - Store settings and audit log
- `read:confluence-content.all` - Scan page metadata
- `read:confluence-space.summary` - Identify spaces
- `write:confluence-content` - Archive pages (when user chooses)
- `read:page:confluence` - Access page details via REST API
- `read:space:confluence` - Access space details
- `read:confluence-user` - Show usernames in audit log

---

## 📊 Technical Details

**Platform:** Atlassian Forge
**Frontend:** React + @forge/react + Atlassian UI Kit
**Backend:** Forge Functions + Forge Storage
**Testing:** Jest (111/111 tests passing)
**Version:** 2.0.0 (Production)
**Open Source:** https://github.com/tom28881/content-guardiand

**Performance:**
- Dashboard loads in <2 seconds
- Page scans process 1000+ pages efficiently
- Responsive UI with loading states
- Optimized API calls with rate limit handling

**Compatibility:**
- ✅ Confluence Cloud only
- ✅ All modern browsers
- ✅ Desktop and tablet viewports
- ✅ Works with all Confluence plans

---

## 🎬 Creating a Demo Video (Optional)

If you prefer a video demo instead of/in addition to screenshots:

### Option 1: Screen Recording Tool

**Recommended Tools:**
- **Loom** (https://loom.com) - Free, easy recording
- **OBS Studio** (https://obsproject.com) - Free, professional
- **QuickTime** (Mac) - Built-in screen recording
- **Windows Game Bar** (Windows) - Built-in recording

### Option 2: Demo Script (2-3 minutes)

**Intro (10 seconds):**
"Hi, I'm demonstrating Content Guardian for Confluence - an app that automatically detects and helps you manage stale, inactive, and orphaned pages."

**Dashboard (20 seconds):**
"Here's the dashboard showing 15 problem pages detected across our workspace. The pie chart breaks down problems by type - we have stale pages, inactive pages, and orphaned content."

**Detected Pages (30 seconds):**
"The Detected Pages tab shows the full list with all details. I can filter by problem type, search for specific pages, and export to CSV for reporting. Let me click on this page to see the actual Confluence content..."

**Bulk Review (40 seconds):**
"In Bulk Review, I can efficiently process pages one by one. Here's a page that hasn't been updated in 2 years. I'll click Archive, provide a reason 'Obsolete documentation', and confirm. The app automatically moves to the next page. This one is still relevant, so I'll click Keep and tag it for review."

**Audit Log (20 seconds):**
"Every action is logged in the Audit Log with timestamp, user, and reason. Perfect for compliance and transparency."

**Settings (20 seconds):**
"In Settings, I can customize detection rules - like changing the stale threshold from 180 to 120 days - and set up weekly automatic scans."

**Outro (10 seconds):**
"Content Guardian helps keep your Confluence workspace clean and organized. Questions? Contact tom28881@gmail.com. Thanks!"

**Total Duration:** ~2.5 minutes

### Recording Tips:
1. Use clean test environment
2. Disable browser notifications
3. Use high resolution (1920x1080)
4. Speak clearly and not too fast
5. Show real functionality, not dummy data
6. Keep it under 3 minutes
7. Export as MP4 (H.264, 1080p)

---

## 📤 Providing Demo Materials to Atlassian

### For Marketplace Submission:

**Option A: Screenshots Only (Current)**
- ✅ 5 high-quality screenshots already prepared
- ✅ All show real functionality with English UI
- ✅ Covers all major features
- ✅ Meets Marketplace requirements (1280x720px PNG)

**Option B: Screenshots + This Document**
- Upload screenshots as required
- Include link to this DEMO-WALKTHROUGH.md in "Additional Notes for Reviewers"
- GitHub URL: https://github.com/tom28881/content-guardiand/blob/main/DEMO-WALKTHROUGH.md

**Option C: Screenshots + Demo Video**
- Upload screenshots
- Upload video to YouTube (unlisted)
- Provide YouTube link in submission form
- Include this document as supplementary

### Reviewer Access (If Requested):

If Atlassian reviewers need hands-on access:

**Option 1: Public Demo Site**
- Install on a public demo Confluence instance
- Provide credentials in submission notes

**Option 2: Private Demo**
- Offer to schedule live demo session
- Provide sandbox access upon request

**Option 3: Test Installation**
- Reviewers can install on their own test Confluence
- App is already deployed to production (v2.0.0)
- Installation takes <1 minute

---

## ✅ Demo Checklist

- [x] Screenshots captured (6 total)
- [x] Screenshots show real functionality
- [x] All UI in English (internationalized)
- [x] Screenshots meet size requirements (1280x720px PNG)
- [x] Comprehensive walkthrough document created
- [x] User journey examples provided
- [x] Feature list documented
- [x] Security/privacy explained
- [x] Technical details included
- [ ] Optional: Demo video recorded
- [ ] Optional: Demo video uploaded to YouTube

---

## 📞 Questions?

**For Atlassian Marketplace Reviewers:**

If you have any questions about the app functionality, need additional demo materials, or want to schedule a live demo:

**Contact:**
- Email: tom28881@gmail.com
- GitHub Issues: https://github.com/tom28881/content-guardiand/issues
- Response Time: Within 24 hours

**App Details:**
- Production URL: Installed via Atlassian Marketplace (pending approval)
- Version: 2.0.0
- Open Source: https://github.com/tom28881/content-guardiand
- Privacy Policy: https://github.com/tom28881/content-guardiand/blob/main/PRIVACY.md
- Terms: https://github.com/tom28881/content-guardiand/blob/main/TERMS.md

---

## 🎊 Summary

This demo walkthrough provides:
- ✅ Complete feature overview with screenshots
- ✅ Real user journey examples
- ✅ Technical and security details
- ✅ Video creation guide (optional)
- ✅ Clear path for reviewer verification

**Content Guardian is production-ready and fully functional.** All features shown in screenshots are working in the live v2.0.0 production deployment.

---

**Thank you for reviewing Content Guardian! 🚀**
