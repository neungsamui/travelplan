export interface SearchResult {
  place_id: number | string;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  category?: string;
}

/**
 * Normalizes Thai search queries by separating Thai letters and digits.
 * e.g., "บางบอน1 ซอย16" => "บางบอน 1 ซอย 16"
 * e.g., "สุขุมวิท55" => "สุขุมวิท 55"
 * e.g., "พระราม9" => "พระราม 9"
 */
export function normalizeThaiSearchQuery(text: string): string {
  if (!text) return '';
  // Separate Thai characters and numbers
  let normalized = text
    .replace(/([\u0E00-\u0E7F]+)(\d+)/g, (_m, p1, p2) => `${p1} ${p2}`)
    .replace(/(\d+)([\u0E00-\u0E7F]+)/g, (_m, p1, p2) => `${p1} ${p2}`)
    .replace(/\s+/g, ' ')
    .trim();

  return normalized;
}

/**
 * Executes a resilient place search.
 * Tries the user's raw query, then normalized Thai query, and variations if needed.
 */
export async function searchPlaces(rawQuery: string): Promise<SearchResult[]> {
  const trimmed = rawQuery.trim();
  if (!trimmed || trimmed.length < 2) return [];

  const normalized = normalizeThaiSearchQuery(trimmed);
  const queriesToTry = Array.from(new Set([
    trimmed,
    normalized,
    // If has 'ซอย' but no space
    normalized.startsWith('ซอย') ? normalized : `ซอย${normalized}`
  ]));

  for (const q of queriesToTry) {
    try {
      const encoded = encodeURIComponent(q);
      const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&countrycodes=th&format=json&addressdetails=1&limit=8&accept-language=th,en`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'SweetJourneyCoupleApp/1.0 (contact: info@sweetjourney.love)'
        }
      });

      if (response.ok) {
        const data: SearchResult[] = await response.json();
        if (data && data.length > 0) {
          return data;
        }
      }
    } catch (err) {
      console.warn('Place search attempt failed for:', q, err);
    }
  }

  // If still not found, try fallback search without country restriction for international spots (Japan, Korea, etc.)
  try {
    const encoded = encodeURIComponent(normalized);
    const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&addressdetails=1&limit=6&accept-language=th,en`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SweetJourneyCoupleApp/1.0 (contact: info@sweetjourney.love)'
      }
    });
    if (response.ok) {
      const data: SearchResult[] = await response.json();
      return data || [];
    }
  } catch (err) {
    console.error('Fallback search error:', err);
  }

  return [];
}
