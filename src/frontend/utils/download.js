// Generic download helper with clipboard fallback for text
// Returns: true if clipboard fallback was used, false if normal download succeeded
export async function downloadFile({ content, mime, ext, baseName, setMessage }) {
  try {
    let data = content;
    if (String(mime).startsWith('text/csv')) {
      // Prepend UTF-8 BOM for better Excel compatibility on Windows
      data = '\uFEFF' + String(content ?? '');
    }
    const blob = new Blob([data], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    a.download = `${baseName}-${ts}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return false;
  } catch (err) {
    if (String(mime).startsWith('text/')) {
      try {
        await navigator.clipboard.writeText(String(content ?? ''));
        setMessage?.({ appearance: 'warning', text: 'Download failed, data copied to clipboard.' });
        return true;
      } catch (e2) {
        setMessage?.({ appearance: 'error', text: `Download failed: ${String(err)}` });
        return true;
      }
    } else {
      setMessage?.({ appearance: 'error', text: `Download failed: ${String(err)}` });
      return true;
    }
  }
}
