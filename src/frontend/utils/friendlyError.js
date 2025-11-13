export function friendlyError(err) {
  const s = typeof err === 'string' ? err : err?.message || String(err || 'Unknown error');
  // Detect common Forge tunnel / proxy HTML errors and Atlassian dev gateway messages
  if (/tunnel\.atlassian-dev\.net|ERR_CANNOT_FORWARD|Requested URL could not be retrieved|cannot be retrieved/i.test(s) || /<!doctype html>/i.test(s)) {
    return 'Backend is unavailable. If developing locally, please run "forge tunnel" and refresh the page. If testing without tunnel, close any running tunnel (Ctrl+C) and/or run "forge deploy" and reload the page.';
  }
  // Strip any HTML to avoid dumping raw pages into UI
  return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
