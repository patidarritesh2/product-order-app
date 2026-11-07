const HttpError = require('../utils/httpError');
const asyncHandler = require('../utils/asyncHandler');

// WMO weather interpretation codes used by Open-Meteo
const WMO = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Rime fog',
  51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
  61: 'Light rain', 63: 'Rain', 65: 'Heavy rain',
  71: 'Light snow', 73: 'Snow', 75: 'Heavy snow',
  80: 'Rain showers', 81: 'Heavy rain showers', 82: 'Violent rain showers',
  95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Severe thunderstorm with hail',
};

// Default location: Pune
exports.current = asyncHandler(async (req, res) => {
  const latitude = Number(req.query.lat ?? 18.5204);
  const longitude = Number(req.query.lon ?? 73.8567);
  if (!(latitude >= -90 && latitude <= 90) || !(longitude >= -180 && longitude <= 180)) {
    throw new HttpError(400, 'lat must be -90..90 and lon must be -180..180');
  }

  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', latitude);
  url.searchParams.set('longitude', longitude);
  url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code');

  let response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(5000) });
  } catch {
    throw new HttpError(504, 'Weather service unreachable');
  }
  if (!response.ok) throw new HttpError(502, 'Weather service returned an error');

  const data = await response.json();
  const c = data.current;
  if (!c) throw new HttpError(502, 'Weather service returned unexpected data');

  res.json({
    latitude,
    longitude,
    temperature: c.temperature_2m,
    humidity: c.relative_humidity_2m,
    windSpeed: c.wind_speed_10m,
    description: WMO[c.weather_code] ?? 'Unknown',
    time: c.time,
  });
});
