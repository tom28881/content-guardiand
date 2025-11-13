# Privacy Policy for Content Guardian

**Last Updated:** November 12, 2025

## Introduction

Content Guardian ("the App") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard information when you use our Confluence Cloud application.

## Information We Collect

### Data Processed Within Confluence

Content Guardian processes the following data **within your Confluence Cloud instance only**:

- **Page Metadata**: Page titles, creation dates, last modified dates, page IDs
- **Space Information**: Space keys, space IDs
- **User Information**: User IDs and display names (for audit logging only)
- **App Configuration**: Your custom settings (detection rules, whitelists, scheduling preferences)
- **Detection Results**: Lists of detected pages with flags and impact scores
- **Audit Logs**: History of actions performed using the app

### Data NOT Collected

We **DO NOT**:
- Store any data outside your Confluence instance
- Transmit data to external servers
- Collect personal information beyond what Confluence provides
- Track user behavior or analytics
- Use cookies or similar tracking technologies
- Share data with third parties

## How We Use Your Data

Content Guardian uses your Confluence data exclusively to:

1. **Scan Pages**: Analyze page metadata to detect stale, inactive, orphaned, or incomplete pages
2. **Display Results**: Show you which pages need attention in the app interface
3. **Enable Actions**: Allow you to archive, whitelist, or tag pages
4. **Maintain Audit Trail**: Track what actions were performed and by whom
5. **Store Configuration**: Remember your detection rules and preferences

## Data Storage

All data is stored using **Atlassian Forge Storage API**, which means:

- Data resides within your Atlassian Cloud infrastructure
- Data is subject to Atlassian's security and privacy policies
- No third-party storage services are used
- Data is encrypted at rest and in transit (managed by Atlassian)

## Data Access

- **Who has access**: Only users with appropriate Confluence permissions can access the app
- **Admin control**: Confluence administrators control who can install and use the app
- **Scope limitation**: The app only accesses data within scopes you've granted

## Data Retention

- **App Data**: Stored indefinitely until you uninstall the app
- **Upon Uninstallation**: All app data (detected pages, settings, audit logs) is deleted from Forge Storage
- **Confluence Pages**: The app never deletes Confluence pages automatically (only archives if you explicitly choose to do so)

## Your Rights

You have the right to:

- **Access**: View all data the app has stored via the app interface
- **Modify**: Change app settings at any time
- **Delete**: Uninstall the app to remove all associated data
- **Control**: Use whitelist feature to exclude specific pages/spaces from scanning

## Security

### App Security

- Built on **Atlassian Forge platform** (secure by design)
- Uses official Atlassian APIs only
- No custom backend servers (serverless Forge functions)
- Follows Atlassian security best practices

### Permissions

Content Guardian requests only necessary permissions:

- `read:confluence-content.all` - To scan page metadata
- `read:confluence-space.summary` - To identify spaces
- `write:confluence-content` - To archive pages (only when you choose to)
- `storage:app` - To store app settings and results
- `read:page:confluence` - To access page details
- `read:space:confluence` - To access space details
- `read:confluence-user` - To show who performed actions

### What We DON'T Have Access To

- Page content/body (only metadata)
- Attachments
- Comments
- User passwords
- Personal messages
- Data from other Atlassian products

## Third-Party Services

Content Guardian **does not use any third-party services**:

- No analytics services (e.g., Google Analytics)
- No external APIs
- No external storage
- No advertising networks
- No social media integrations

## Children's Privacy

Content Guardian is a business tool intended for organizational use. We do not knowingly collect information from children under 13.

## Changes to Privacy Policy

We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last Updated" date.

**Material changes** will be communicated via:
- App listing page update
- GitHub repository announcement
- Email notification (if we have your contact)

## Compliance

### GDPR Compliance (EU)

- **Lawful Basis**: Legitimate interest (providing app functionality)
- **Data Minimization**: We collect only necessary data
- **Purpose Limitation**: Data used only for stated purposes
- **Storage Limitation**: Data deleted upon uninstallation
- **Right to Erasure**: Uninstall app to delete all data

### CCPA Compliance (California)

- We do not "sell" personal information
- We do not share data with third parties for marketing
- Users can request data deletion by uninstalling

## Contact Us

If you have questions about this Privacy Policy or data practices:

**Email:** tom28881@gmail.com
**GitHub Issues:** https://github.com/tom28881/content-guardiand/issues
**Developer Console:** https://developer.atlassian.com/console/myapps/4ba6b0ec-dfa0-44b2-bcdd-719e3c965ccf

## Atlassian's Privacy Policy

Your use of Confluence Cloud is also subject to Atlassian's Privacy Policy:
https://www.atlassian.com/legal/privacy-policy

## Open Source

Content Guardian is open source. You can review the complete source code to verify our privacy claims:
https://github.com/tom28881/content-guardiand

## Summary

**In simple terms:**
- ✅ Your data stays in your Confluence
- ✅ No external storage or transmission
- ✅ No tracking or analytics
- ✅ You control what the app can see (permissions)
- ✅ Delete app = delete all app data
- ✅ Open source = fully transparent

---

**Content Guardian respects your privacy and the privacy of your users.**
