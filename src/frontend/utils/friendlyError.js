export function friendlyError(err) {
  const s = typeof err === 'string' ? err : err?.message || String(err || 'Unknown error');
  // Detect common Forge tunnel / proxy HTML errors and Atlassian dev gateway messages
  if (/tunnel\.atlassian-dev\.net|ERR_CANNOT_FORWARD|Requested URL could not be retrieved|cannot be retrieved/i.test(s) || /<!doctype html>/i.test(s)) {
    return 'Backend není dostupný. Pokud vyvíjíte lokálně, spusťte prosím "forge tunnel" a obnovte stránku. Pokud aplikaci testujete bez tunelu, zavřete případně běžící tunnel (Ctrl+C) a/nebo proveďte "forge deploy" a načtěte stránku znovu.';
  }
  // Strip any HTML to avoid dumping raw pages into UI
  return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
