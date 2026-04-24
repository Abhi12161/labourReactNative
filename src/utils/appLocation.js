const DEFAULT_CITY = 'Muzaffarpur';
const DEFAULT_REGION = 'Bihar';
const DEFAULT_COUNTRY = 'India';

export const DEFAULT_APP_LOCATION = {
  city: DEFAULT_CITY,
  region: DEFAULT_REGION,
  country: DEFAULT_COUNTRY,
  displayName: DEFAULT_CITY,
  fullAddress: `${DEFAULT_CITY}, ${DEFAULT_REGION}, ${DEFAULT_COUNTRY}`,
};

/**
 * Normalize the captured location so every screen can depend on the same shape.
 */
export function normalizeAppLocation(location) {
  const city = location?.city?.trim() || DEFAULT_CITY;
  const region = location?.region?.trim() || DEFAULT_REGION;
  const country = location?.country?.trim() || DEFAULT_COUNTRY;
  const displayName = location?.displayName?.trim() || city || region || country;
  const fullAddress = [city, region, country].filter(Boolean).join(', ');

  return {
    city,
    region,
    country,
    displayName,
    fullAddress,
  };
}

/**
 * Build a readable location label for cards and forms.
 */
export function buildAreaLocation(area, appLocation) {
  const location = normalizeAppLocation(appLocation);

  if (!area || area === location.city) {
    return location.city;
  }

  return `${area}, ${location.city}`;
}

/**
 * Replace the old default city name in copy strings with the captured city.
 */
export function replaceCityInText(value, appLocation) {
  if (typeof value !== 'string') {
    return value;
  }

  const city = normalizeAppLocation(appLocation).city;

  return value
    .replace(/\{city\}/gi, city)
    .replace(/Muzaffarpur/gi, city)
    .replace(/मुज़फ़्फ़रपुर/gi, city);
}

/**
 * Produce location-aware UI copy without mutating the original translation object.
 */
export function getLocationAwareCopy(copyBlock, appLocation) {
  return Object.fromEntries(
    Object.entries(copyBlock).map(([key, value]) => [key, replaceCityInText(value, appLocation)]),
  );
}
