# Content Guardian - Atlassian Marketplace Listing

## App Information

**App Name:** Content Guardian for Confluence
**App Key:** `content-guardian`
**Version:** 2.0.0
**Category:** Content Management, Productivity, Admin Tools
**Compatibility:** Confluence Cloud

---

## Short Description (80 characters max)

Automatically detect and manage stale, inactive, orphaned & incomplete Confluence pages

---

## Long Description (4000 characters max)

### Keep Your Confluence Clean and Organized

**Content Guardian** helps Confluence administrators and content managers maintain a healthy, organized workspace by automatically identifying problematic pages that need attention.

### 🎯 What It Does

Content Guardian continuously monitors your Confluence instance and flags pages that are:

- **📅 Stale** - Pages that haven't been updated in X days (customizable threshold)
- **💤 Inactive** - Pages with no activity or views (customizable inactivity period)
- **🏚️ Orphaned** - Pages without child pages or connections
- **🚧 Incomplete** - Pages containing keywords like "TODO", "WIP", "DRAFT" (customizable pattern)

### ✨ Key Features

**Automated Detection**
- Scheduled daily scans run automatically
- Customizable detection rules for each flag type
- Impact scoring (0-100) helps prioritize which pages to address first
- Real-time backend status monitoring

**Visual Dashboard**
- Overview of problem pages with key metrics
- Interactive charts (DonutChart, PieChart, BarChart)
- Quick-filter buttons for instant filtering
- Weekly trends and problem spaces visualization

**Bulk Review Workflow**
- Review problematic pages one-by-one with full context
- Quick actions: Keep (Tag), Add to Whitelist, Archive
- Skip pages you don't want to review yet
- Confirmation modals prevent accidental actions

**Flexible Management**
- Filter by status: detected, whitelisted, archived, tagged
- Filter by flags: stale, inactive, orphaned, incomplete
- Search by page title or space key
- Export to CSV or Excel for reporting

**Audit Trail**
- Complete history of all actions performed
- Track who archived/whitelisted/tagged which pages
- Filter audit log by action type and date
- Export audit log for compliance reporting

**Configurable Settings**
- Set custom thresholds for stale/inactive detection
- Define your own regex pattern for incomplete page detection
- Manage whitelist of pages/spaces to ignore
- Enable/disable scheduled scans
- Toggle individual detection rules on/off

### 💼 Perfect For

- **Confluence Administrators** maintaining workspace hygiene
- **Content Managers** ensuring documentation quality
- **Team Leads** cleaning up legacy content
- **Compliance Officers** auditing content lifecycle
- **IT Teams** reducing storage costs and improving searchability

### 🚀 Benefits

- **Save Time**: Automated detection vs. manual page-by-page review (90%+ time savings)
- **Improve Findability**: Clean workspace = better search results
- **Reduce Clutter**: Archive outdated content systematically
- **Maintain Quality**: Catch incomplete/draft pages before they spread
- **Compliance Ready**: Full audit trail of all content actions

### 🔒 Security & Privacy

- All data stays within your Confluence Cloud instance
- Uses official Atlassian Forge platform (secure by design)
- Only requests necessary permissions (read content, manage pages)
- No external data storage or transmission
- Open source repository available for review

### 📊 Use Cases

**Quarterly Content Cleanup**
Company has 5000+ pages, 30% stale. Content Guardian identifies 1500 problem pages, filters to 300 high-impact, bulk archives 200 in hours instead of weeks.

**New Team Onboarding**
Team inherits 500-page space. Content Guardian shows which 120 pages are stale, team whitelists important docs, new members know what to trust.

**Compliance & Governance**
Company must prove active documentation maintenance. Weekly reports + audit log demonstrate proactive content hygiene for auditors.

### 🛠️ Technical Details

- **Platform**: Atlassian Forge (Cloud)
- **Runtime**: Node.js 20.x
- **Frontend**: React + @forge/react UI Kit
- **Backend**: Forge Storage API + Confluence REST API v2
- **Scheduling**: Daily automatic scans via Forge scheduledTrigger
- **Data Persistence**: Forge Storage (no external databases)

### 📈 Metrics You Can Track

- Total problem pages detected
- Average impact score across workspace
- Pages archived/whitelisted/tagged per week
- Problem spaces ranking
- Stale vs. inactive vs. orphaned breakdown
- Content health trends over time

### 🎁 Free Features

- Unlimited pages scanned
- Unlimited users
- All detection rules (stale, inactive, orphaned, incomplete)
- Full audit trail
- CSV/Excel export
- Scheduled daily scans
- All dashboard visualizations
- Bulk review workflow
- Custom regex patterns

### 📚 Documentation

- Comprehensive README with setup instructions
- In-app tooltips and helpful UI
- Example configurations for common scenarios
- Troubleshooting guide
- API documentation for advanced users

### 🆘 Support

For questions, feature requests, or bug reports:
- GitHub Issues: https://github.com/tom28881/content-guardiand/issues
- Email: tom28881@gmail.com

### 🔄 Roadmap

Future enhancements we're considering:
- Email notifications to content owners
- AI-powered duplicate detection
- Slack/Teams integration
- Custom dashboards
- Advanced analytics

---

## Screenshots

1. **Dashboard Overview** - `screenshots/verify-01-initial-load.png`
   - Shows KPI metrics, charts, and quick filters
   - Caption: "Comprehensive dashboard with problem pages, impact scores, and visual breakdowns"

2. **Detected Pages** - `screenshots/verify-02-detected-pages.png`
   - Shows table with filters and export options
   - Caption: "Filter and search problematic pages, export to CSV/Excel for reporting"

3. **Bulk Review** - `screenshots/verify-03-bulk-review.png`
   - Shows review workflow with action buttons
   - Caption: "Review pages one-by-one with Keep, Archive, or Whitelist actions"

4. **Audit Log** - `screenshots/verify-04-audit-log.png`
   - Shows audit history table
   - Caption: "Complete audit trail of all content actions for compliance"

5. **Settings** - `screenshots/verify-05-settings.png`
   - Shows configuration options
   - Caption: "Configure detection rules, whitelist, and scheduled scans"

---

## Pricing

**Free** - All features included, no limits

**Business Model:**
- Currently free as open-source project
- Potential future paid tiers for enterprise features (SSO, advanced analytics, priority support)

---

## App Links

**Privacy Policy:** https://github.com/tom28881/content-guardiand/blob/main/PRIVACY.md
**Terms of Use:** https://github.com/tom28881/content-guardiand/blob/main/TERMS.md
**Support:** https://github.com/tom28881/content-guardiand/issues
**Website:** https://github.com/tom28881/content-guardiand
**Documentation:** https://github.com/tom28881/content-guardiand/blob/main/README.md

---

## Installation

1. Install from Atlassian Marketplace
2. Grant requested permissions (read content, manage pages)
3. Access via Apps menu → "Content Guardian"
4. Configure detection rules in Settings tab
5. Run your first scan from Dashboard
6. Review and action problematic pages

---

## Permissions Required

- `storage:app` - Store app configuration and detected pages
- `read:confluence-content.all` - Read all Confluence pages
- `read:confluence-space.summary` - Read space information
- `write:confluence-content` - Archive pages (optional bulk action)
- `read:page:confluence` - Access page details via REST API v2
- `read:space:confluence` - Access space details via REST API v2
- `read:confluence-user` - Show current user in audit log

---

## Compatibility

- **Confluence Cloud** - Fully supported
- **Confluence Server/Data Center** - Not supported (Forge Cloud only)

---

## Version History

### 2.0.0 (Current - Production)
- ✅ Full internationalization (100% English UI)
- ✅ All features tested and verified
- ✅ 111/111 unit tests passing
- ✅ Production-ready deployment

### 16.9.0 (Development)
- ✅ English UI translations
- ✅ Bug fixes and improvements

### 16.8.0
- ✅ Initial feature-complete version
- ✅ All 6 tabs implemented
- ✅ Scheduled scans functional

---

## Keywords/Tags

confluence, content-management, cleanup, maintenance, stale-pages, inactive-pages, orphaned-pages, admin-tools, productivity, documentation, governance, compliance, audit, bulk-actions, automation, forge

---

## Developer Information

**Developer:** Tomáš Gregorovič
**Company:** Independent Developer
**Contact:** tom28881@gmail.com
**GitHub:** https://github.com/tom28881
**Repository:** https://github.com/tom28881/content-guardiand

---

## Marketplace Submission Checklist

✅ App deployed to production (v2.0.0)
✅ All features tested and functional
✅ Screenshots prepared (5 high-quality screenshots)
✅ Description written (short + long)
✅ Privacy policy created
✅ Support email provided
✅ Pricing information defined (Free)
✅ App icon/logo ready
✅ Terms of use created
✅ Documentation available
✅ Version history documented

---

## Post-Launch

**Marketing:**
- Share on Atlassian Community
- Post on LinkedIn
- Submit to relevant newsletters
- Create demo video

**Monitoring:**
- Track installations
- Monitor support requests
- Gather user feedback
- Plan feature updates

**Maintenance:**
- Respond to support within 48h
- Release bug fixes promptly
- Consider user feature requests
- Keep documentation updated

---

**Ready for Marketplace Submission!** 🚀
