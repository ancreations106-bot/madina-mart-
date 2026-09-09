/**
 * Utility for device GPS detection and reverse-geocoding via standard OSM Nominatim.
 */

export interface GeocodeResult {
  locality: string;
  formattedAddress: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export async function reverseGeocodeCoords(
  lat: number,
  lon: number
): Promise<GeocodeResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en'
        },
        signal: controller.signal
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const neighbourhood =
        addr.neighbourhood ||
        addr.suburb ||
        addr.residential ||
        addr.village ||
        addr.town ||
        addr.city_district ||
        '';
      const city = addr.city || addr.town || addr.village || addr.county || addr.state_district || '';
      const state = addr.state || '';
      const pincode = addr.postcode || '';

      let locality = '';
      if (neighbourhood && (city || state)) {
        locality = `${neighbourhood}, ${city || state}`;
      } else if (city && state) {
        locality = `${city}, ${state}`;
      } else if (neighbourhood || city || state) {
        locality = neighbourhood || city || state;
      } else {
        locality = `${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`;
      }

      return {
        locality,
        formattedAddress: data.display_name || `${locality} (${lat.toFixed(5)}, ${lon.toFixed(5)})`,
        city,
        state,
        pincode
      };
    }
  } catch (err) {
    console.warn('Reverse geocoding fetch issue:', err);
  } finally {
    clearTimeout(timeoutId);
  }

  // Fallback if network blocked or offline
  return {
    locality: `${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`,
    formattedAddress: `GPS Location (${lat.toFixed(5)}, ${lon.toFixed(5)})`
  };
}
