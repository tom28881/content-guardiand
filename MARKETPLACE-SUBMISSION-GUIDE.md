# 🚀 Atlassian Marketplace Submission Guide

**App:** Content Guardian for Confluence
**Version:** 2.0.0 (Production)
**Date:** November 12, 2025
**Status:** ✅ Ready for Submission

---

## ✅ PRE-SUBMISSION CHECKLIST

All requirements completed:

- ✅ **App deployed to production** (v2.0.0)
- ✅ **All features tested** (111/111 tests passed)
- ✅ **UI fully internationalized** (100% English)
- ✅ **Screenshots prepared** (5 high-quality screenshots)
- ✅ **Privacy Policy created** (PRIVACY.md)
- ✅ **Terms of Use created** (TERMS.md)
- ✅ **Marketplace listing written** (MARKETPLACE-LISTING.md)
- ✅ **Documentation complete** (README.md)
- ✅ **Open source repository** (GitHub public)
- ✅ **Support email** (tom28881@gmail.com)

---

## 📝 STEP-BY-STEP SUBMISSION PROCESS

### Step 1: Access Developer Console

1. Go to https://developer.atlassian.com/console
2. Log in with your Atlassian account (tom28881@gmail.com)
3. Click on "Content Guardian" app
4. Navigate to **"Distribution"** tab

### Step 2: Create Marketplace Listing

In the Distribution tab:

1. Click **"List in Marketplace"** button
2. You'll be redirected to Atlassian Marketplace Vendor Portal

### Step 3: Fill Out App Listing Form

#### **Basic Information**

- **App Name:** `Content Guardian for Confluence`
- **App Key:** `content-guardian` (auto-filled)
- **Tagline/Short Description:**
  ```
  Automatically detect and manage stale, inactive, orphaned & incomplete Confluence pages
  ```
- **Category:**
  - Primary: Content Management
  - Secondary: Productivity, Admin Tools

#### **Description**

Paste the **Long Description** from `MARKETPLACE-LISTING.md` (lines 11-230)

Key sections to include:
- What It Does
- Key Features
- Benefits
- Use Cases
- Technical Details

#### **Pricing**

- **Pricing Model:** Free
- **Price:** $0.00
- **Billing Period:** N/A (Free)
- **Trial Period:** N/A (Free)

#### **Support & Links**

- **Support Email:** `tom28881@gmail.com`
- **Documentation URL:** `https://github.com/tom28881/content-guardiand/blob/main/README.md`
- **Website URL:** `https://github.com/tom28881/content-guardiand`
- **Privacy Policy URL:** `https://github.com/tom28881/content-guardiand/blob/main/PRIVACY.md`
- **Terms of Use URL:** `https://github.com/tom28881/content-guardiand/blob/main/TERMS.md`
- **Support URL:** `https://github.com/tom28881/content-guardiand/issues`

### Step 4: Upload Screenshots & Provide Demo Materials

Upload all 5 screenshots from `/workspace/content-guardiand/screenshots/`:

1. **verify-01-initial-load.png**
   - **Caption:** "Comprehensive dashboard with problem pages, impact scores, and visual breakdowns"
   - **Type:** Dashboard

2. **verify-02-detected-pages.png**
   - **Caption:** "Filter and search problematic pages, export to CSV/Excel for reporting"
   - **Type:** Feature

3. **verify-03-bulk-review.png**
   - **Caption:** "Review pages one-by-one with Keep, Archive, or Whitelist actions"
   - **Type:** Feature

4. **verify-04-audit-log.png**
   - **Caption:** "Complete audit trail of all content actions for compliance"
   - **Type:** Feature

5. **verify-05-settings.png**
   - **Caption:** "Configure detection rules, whitelist, and scheduled scans"
   - **Type:** Configuration

**Requirements:**
- Format: PNG
- Minimum Size: 1280x800px
- Maximum Size: 1920x1200px
- File Size: < 5MB each

**Additional Demo Materials (For Reviewers):**

In the "Additional Notes for Reviewers" or "Demo Video/Screenshots" section, provide:

```
For a comprehensive walkthrough of all features with detailed explanations,
please see our demo documentation:
https://github.com/tom28881/content-guardiand/blob/main/DEMO-WALKTHROUGH.md

This document includes:
- Complete user journey examples
- Feature demonstrations with screenshots
- Security and privacy details
- Real-world usage scenarios

All features are live and functional in production (v2.0.0).
Available for hands-on testing upon request.
```

**Optional: Demo Video**

If you create a demo video (recommended for faster review):
1. Record 2-3 minute screen capture following DEMO-WALKTHROUGH.md script
2. Upload to YouTube as "Unlisted"
3. Provide YouTube URL in submission form
4. Keep video concise and show real functionality

### Step 5: App Icon/Logo

If you have an app icon:
- **Format:** PNG with transparent background
- **Size:** 256x256px
- **File Size:** < 1MB

If no icon yet, Atlassian will use a default icon.

### Step 6: Keywords/Tags

Add these keywords for better discoverability:

```
confluence, content-management, cleanup, maintenance, stale-pages, inactive-pages, orphaned-pages, admin-tools, productivity, documentation, governance, compliance, audit, bulk-actions, automation, forge, atlas kit, content-quality, workspace-hygiene, page-management
```

### Step 7: Version Information

- **Initial Version:** 2.0.0
- **Release Notes:**
  ```
  Initial public release of Content Guardian.

  Features:
  - Automated detection of stale, inactive, orphaned, and incomplete pages
  - Visual dashboard with charts and KPIs
  - Bulk review workflow for efficient page management
  - Comprehensive audit trail
  - Configurable detection rules and scheduling
  - CSV/Excel export capabilities
  - Fully internationalized English UI

  Technical:
  - Built on Atlassian Forge platform
  - 111/111 unit tests passing
  - Production-ready and tested
  - Open source on GitHub
  ```

### Step 8: Permissions Justification

For each permission, provide justification:

- **`storage:app`**
  - **Why:** Store app configuration, detected pages, and audit history
  - **What data:** Settings, detection results, audit logs

- **`read:confluence-content.all`**
  - **Why:** Scan all Confluence pages to detect problematic content
  - **What data:** Page metadata (title, dates, IDs) - NOT page body content

- **`read:confluence-space.summary`**
  - **Why:** Identify which space each page belongs to
  - **What data:** Space keys and names

- **`write:confluence-content`**
  - **Why:** Archive pages when user explicitly chooses to do so
  - **What data:** Page archive status

- **`read:page:confluence`**
  - **Why:** Access detailed page metadata via Confluence REST API v2
  - **What data:** Page properties, version info

- **`read:space:confluence`**
  - **Why:** Access space details for better organization
  - **What data:** Space properties

- **`read:confluence-user`**
  - **Why:** Show which user performed actions in audit log
  - **What data:** User display names and IDs

### Step 9: Compatibility

- **Products:** Confluence Cloud only
- **Minimum Confluence Version:** Any (Forge Cloud)
- **Maximum Confluence Version:** Any (Forge Cloud)

### Step 10: Vendor Information

If first-time vendor, fill out:

- **Vendor Name:** Tomáš Gregorovič (or company name if applicable)
- **Vendor Email:** tom28881@gmail.com
- **Vendor Country:** Czech Republic
- **Tax Information:** (As required by Atlassian)
- **Banking Information:** (For future paid apps, if any)

### Step 11: Security & Compliance

Answer security questionnaire:

- **Does your app store data?** Yes (in Forge Storage within Confluence)
- **Does your app transmit data externally?** No
- **Does your app use encryption?** Yes (Forge platform handles encryption)
- **Do you have a security disclosure policy?** Yes (via GitHub Issues)
- **GDPR Compliant?** Yes (see Privacy Policy)
- **SOC 2 Certified?** N/A (using Atlassian Forge infrastructure)

### Step 12: Review & Submit

1. Review all information carefully
2. Accept Atlassian Marketplace Vendor Agreement
3. Accept Atlassian Developer Terms
4. Click **"Submit for Review"**

---

## ⏱️ WHAT HAPPENS NEXT?

### Atlassian Review Process

1. **Initial Review (1-3 business days)**
   - Atlassian checks basic requirements
   - Verifies app works as described
   - Reviews permissions

2. **Security Review (3-7 business days)**
   - Automated security scan
   - Manual security review for sensitive permissions

3. **Content Review (1-2 business days)**
   - Checks description accuracy
   - Reviews screenshots quality
   - Verifies links work

4. **Approval or Feedback (1 business day)**
   - If approved: App goes live immediately
   - If issues: You'll receive feedback to address

**Total Expected Time:** 5-14 business days

### Communication

- **Status updates:** Via email to tom28881@gmail.com
- **Feedback:** Via Marketplace Vendor Portal
- **Questions:** Contact marketplace@atlassian.com

---

## 🎯 POST-APPROVAL ACTIONS

Once approved and live:

### 1. Announce Launch

- **Atlassian Community:** Post in "Apps" section
- **Social Media:** Share on LinkedIn, Twitter
- **Email:** Notify interested beta testers
- **GitHub:** Update README with Marketplace link

### 2. Monitor Performance

- **Marketplace Dashboard:** Track installs, ratings, reviews
- **Support Email:** Respond to support requests within 48h
- **GitHub Issues:** Monitor bug reports and feature requests
- **Analytics:** Review usage patterns (if available)

### 3. Gather Feedback

- **User Surveys:** Ask for feedback after 30 days
- **Review Requests:** Encourage satisfied users to leave reviews
- **Feature Requests:** Collect and prioritize user requests

### 4. Plan Updates

- **Bug Fixes:** Release within 1-2 weeks of discovery
- **Feature Updates:** Quarterly releases
- **Security Patches:** Immediate release if needed

---

## 📊 SUCCESS METRICS

Track these KPIs post-launch:

- **Installs:** Target 100 in first month, 500 in first quarter
- **Active Users:** Track daily/weekly active users
- **Retention:** % of users still using after 30/60/90 days
- **Ratings:** Maintain 4.5+ star average
- **Support Tickets:** < 5% of users need support
- **NPS Score:** Net Promoter Score from user surveys

---

## 🚨 COMMON PITFALLS TO AVOID

1. **Incomplete Documentation**
   - ✅ We have comprehensive README, Privacy Policy, Terms

2. **Low-Quality Screenshots**
   - ✅ Our screenshots are clear and show real functionality

3. **Vague Permission Justifications**
   - ✅ We provide detailed justification for each permission

4. **No Support Channel**
   - ✅ We have email + GitHub Issues

5. **Unclear Pricing**
   - ✅ Clearly stated as "Free"

6. **Missing Privacy Policy**
   - ✅ Complete Privacy Policy created

7. **Broken Links**
   - ✅ All links tested and working

---

## 🔧 TROUBLESHOOTING

### If Rejected

**Common reasons and fixes:**

1. **"App doesn't work as described"**
   - Solution: Provide demo video or detailed walkthrough

2. **"Excessive permissions"**
   - Solution: Review and justify each permission in detail

3. **"Privacy concerns"**
   - Solution: Emphasize that data stays in Confluence, no external transmission

4. **"Screenshot quality issues"**
   - Solution: Retake screenshots at higher resolution

5. **"Broken support links"**
   - Solution: Verify all URLs work from external browser

### If Stuck

**Contact Atlassian Marketplace Support:**
- Email: marketplace@atlassian.com
- Portal: https://support.atlassian.com/contact/
- Community: https://community.atlassian.com/

---

## 📞 CONTACTS

**Developer:**
- Email: tom28881@gmail.com
- GitHub: https://github.com/tom28881

**App:**
- Repository: https://github.com/tom28881/content-guardiand
- Issues: https://github.com/tom28881/content-guardiand/issues

**Atlassian:**
- Developer Console: https://developer.atlassian.com/console
- Marketplace Vendor Portal: https://marketplace.atlassian.com/vendors
- Support: marketplace@atlassian.com

---

## ✅ FINAL CHECKLIST BEFORE CLICKING "SUBMIT"

- [ ] All screenshots uploaded and captioned
- [ ] Privacy Policy URL works
- [ ] Terms of Use URL works
- [ ] Support email is monitored
- [ ] Documentation link works
- [ ] App is deployed to production (v2.0.0)
- [ ] App is tested and working
- [ ] All permissions justified
- [ ] Description is complete and accurate
- [ ] Pricing is set to "Free"
- [ ] Keywords/tags added
- [ ] Vendor information complete
- [ ] Security questionnaire answered
- [ ] Ready to respond to reviewer feedback within 24h

---

## 🎊 YOU'RE READY!

**Everything is prepared. Time to submit Content Guardian to Atlassian Marketplace!**

**Good luck! 🚀**

---

**Next Steps:**
1. Go to https://developer.atlassian.com/console
2. Click "Content Guardian"
3. Click "Distribution" → "List in Marketplace"
4. Follow the steps above
5. Wait for approval (5-14 days)
6. Celebrate when it goes live! 🎉
