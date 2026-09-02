export async function fetchText(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`ApiClient request failed: HTTP ${response.status}`);
  }
  return response.text();
}
