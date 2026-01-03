// Theme System - Manage app themes

export type Theme = {
  id: string;
  name: string;
  nameEn: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    cardBg: string;
    text: string;
    textSecondary: string;
  };
  gradient: string;
  backgroundImage?: string;
};

export const themes: Theme[] = [
  {
    id: "default",
    name: "คลาสสิก",
    nameEn: "Classic",
    colors: {
      primary: "#8b5cf6", // Purple
      secondary: "#ec4899", // Pink
      accent: "#f59e0b", // Amber
      background: "rgba(0, 0, 0, 0.6)",
      cardBg: "rgba(0, 0, 0, 0.4)",
      text: "#ffffff",
      textSecondary: "rgba(255, 255, 255, 0.6)",
    },
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  {
    id: "neon",
    name: "นีออน",
    nameEn: "Neon",
    colors: {
      primary: "#00ff88",
      secondary: "#00d9ff",
      accent: "#ff00ff",
      background: "rgba(10, 10, 30, 0.8)",
      cardBg: "rgba(20, 20, 40, 0.6)",
      text: "#00ff88",
      textSecondary: "rgba(0, 255, 136, 0.6)",
    },
    gradient: "linear-gradient(135deg, #00ff88 0%, #00d9ff 50%, #ff00ff 100%)",
  },
  {
    id: "sunset",
    name: "พระอาทิตย์ตก",
    nameEn: "Sunset",
    colors: {
      primary: "#ff6b6b",
      secondary: "#ffd93d",
      accent: "#ff8c42",
      background: "rgba(20, 10, 30, 0.7)",
      cardBg: "rgba(40, 20, 40, 0.5)",
      text: "#ffffff",
      textSecondary: "rgba(255, 255, 255, 0.7)",
    },
    gradient: "linear-gradient(135deg, #ff6b6b 0%, #ff8c42 50%, #ffd93d 100%)",
  },
  {
    id: "ocean",
    name: "มหาสมุทร",
    nameEn: "Ocean",
    colors: {
      primary: "#0066ff",
      secondary: "#00ccff",
      accent: "#00ffcc",
      background: "rgba(0, 20, 40, 0.8)",
      cardBg: "rgba(0, 40, 80, 0.5)",
      text: "#ffffff",
      textSecondary: "rgba(255, 255, 255, 0.7)",
    },
    gradient: "linear-gradient(135deg, #0066ff 0%, #00ccff 50%, #00ffcc 100%)",
  },
  {
    id: "forest",
    name: "ป่าไม้",
    nameEn: "Forest",
    colors: {
      primary: "#2d6a4f",
      secondary: "#52b788",
      accent: "#95d5b2",
      background: "rgba(20, 30, 20, 0.8)",
      cardBg: "rgba(30, 50, 30, 0.6)",
      text: "#ffffff",
      textSecondary: "rgba(255, 255, 255, 0.7)",
    },
    gradient: "linear-gradient(135deg, #2d6a4f 0%, #52b788 50%, #95d5b2 100%)",
  },
  {
    id: "royal",
    name: "ราชวงศ์",
    nameEn: "Royal",
    colors: {
      primary: "#6d28d9",
      secondary: "#a855f7",
      accent: "#fbbf24",
      background: "rgba(20, 10, 40, 0.8)",
      cardBg: "rgba(40, 20, 60, 0.6)",
      text: "#fbbf24",
      textSecondary: "rgba(251, 191, 36, 0.7)",
    },
    gradient: "linear-gradient(135deg, #6d28d9 0%, #a855f7 50%, #fbbf24 100%)",
  },
  {
    id: "dark",
    name: "มืดสนิท",
    nameEn: "Dark",
    colors: {
      primary: "#374151",
      secondary: "#6b7280",
      accent: "#9ca3af",
      background: "rgba(0, 0, 0, 0.9)",
      cardBg: "rgba(20, 20, 20, 0.8)",
      text: "#f3f4f6",
      textSecondary: "rgba(243, 244, 246, 0.6)",
    },
    gradient: "linear-gradient(135deg, #1f2937 0%, #374151 100%)",
  },
  {
    id: "candy",
    name: "ลูกอม",
    nameEn: "Candy",
    colors: {
      primary: "#ff69b4",
      secondary: "#ffd700",
      accent: "#00bfff",
      background: "rgba(255, 192, 203, 0.2)",
      cardBg: "rgba(255, 255, 255, 0.3)",
      text: "#ffffff",
      textSecondary: "rgba(255, 255, 255, 0.8)",
    },
    gradient: "linear-gradient(135deg, #ff69b4 0%, #ffd700 50%, #00bfff 100%)",
  },
];

const THEME_STORAGE_KEY = "party-games-theme";
const WEATHER_MODE_KEY = "party-games-weather-mode";

export function isWeatherModeEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(WEATHER_MODE_KEY) === "true";
}

export function setWeatherMode(enabled: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(WEATHER_MODE_KEY, enabled.toString());
  if (enabled) {
    updateThemeByWeather();
  }
}

function mapWeatherCodeToTheme(weatherCode: number, isDay: boolean): string {
  // Night time
  if (!isDay) return "dark";

  // WMO Weather interpretation codes
  // 0 = Clear sky
  if (weatherCode === 0) return "sunset";

  // 1-3 = Mainly clear, partly cloudy, overcast
  if (weatherCode >= 1 && weatherCode <= 3) return "neon"; // Changed to neon for testing!

  // 45-48 = Fog
  if (weatherCode >= 45 && weatherCode <= 48) return "forest";

  // 51-67 = Drizzle and rain
  if (weatherCode >= 51 && weatherCode <= 67) return "ocean";

  // 71-77 = Snow
  if (weatherCode >= 71 && weatherCode <= 77) return "candy";

  // 80-82 = Rain showers
  if (weatherCode >= 80 && weatherCode <= 82) return "ocean";

  // 85-86 = Snow showers
  if (weatherCode >= 85 && weatherCode <= 86) return "candy";

  // 95-99 = Thunderstorm
  if (weatherCode >= 95 && weatherCode <= 99) return "royal";

  return "neon"; // Clear/Sunny default
}

export async function updateThemeByWeather() {
  if (typeof window === "undefined" || !isWeatherModeEnabled()) return;

  try {
    console.log("🌤️ Starting weather detection...");

    let latitude: number;
    let longitude: number;

    // Check if the site is running on a secure origin
    const isSecureContext = window.isSecureContext;

    if (!isSecureContext) {
      console.log(
        "⚠️ Not a secure context (HTTPS), using IP-based geolocation..."
      );
    }

    try {
      // Try GPS first if secure context
      if (isSecureContext && navigator.geolocation) {
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              resolve,
              (error) => {
                console.log(
                  `⚠️ GPS failed: ${error.message}, falling back to IP location`
                );
                reject(error);
              },
              {
                enableHighAccuracy: false,
                timeout: 5000,
                maximumAge: 300000,
              }
            );
          }
        );
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        console.log(
          `📍 GPS Location: ${latitude.toFixed(2)}, ${longitude.toFixed(2)}`
        );
      } else {
        throw new Error("GPS not available");
      }
    } catch (gpsError) {
      // Fallback to IP-based geolocation
      console.log("🌐 Fetching location from IP address...");

      try {
        const ipResponse = await fetch("https://ipapi.co/json/");
        if (!ipResponse.ok) throw new Error("IP geolocation failed");

        const ipData = await ipResponse.json();
        latitude = ipData.latitude;
        longitude = ipData.longitude;
        console.log(
          `📍 IP Location: ${latitude.toFixed(2)}, ${longitude.toFixed(2)} (${
            ipData.city
          }, ${ipData.country_name})`
        );
      } catch (ipError) {
        // If IP geolocation also fails, use Bangkok as default
        console.log("⚠️ IP geolocation failed, using Bangkok as default");
        latitude = 13.7563;
        longitude = 100.5018;
        console.log(`📍 Default Location: Bangkok, Thailand`);
      }
    }

    // Fetch weather data from Open-Meteo
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=weather_code,is_day&timezone=auto`
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Weather API failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const weatherCode = data.current.weather_code;
    const isDay = data.current.is_day === 1;

    // Map weather to theme
    const themeId = mapWeatherCodeToTheme(weatherCode, isDay);
    setTheme(themeId);

    // Weather code descriptions
    const weatherDescriptions: Record<number, string> = {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Foggy",
      48: "Depositing rime fog",
      51: "Light drizzle",
      53: "Moderate drizzle",
      55: "Dense drizzle",
      61: "Slight rain",
      63: "Moderate rain",
      65: "Heavy rain",
      71: "Slight snow",
      73: "Moderate snow",
      75: "Heavy snow",
      80: "Slight rain showers",
      81: "Moderate rain showers",
      82: "Violent rain showers",
      95: "Thunderstorm",
      96: "Thunderstorm with slight hail",
      99: "Thunderstorm with heavy hail",
    };

    const description =
      weatherDescriptions[weatherCode] || `Weather code ${weatherCode}`;

    console.log(
      `🌤️ Weather: ${description} (code ${weatherCode}), Time: ${
        isDay ? "Day ☀️" : "Night 🌙"
      }, Theme: ${themeId}`
    );

    // Dispatch custom event for UI feedback
    window.dispatchEvent(
      new CustomEvent("weatherupdated", {
        detail: { weather: description, description, isDay, theme: themeId },
      })
    );

    return { success: true, weather: description, theme: themeId };
  } catch (error) {
    console.error("❌ Failed to get weather:", error);

    // Dispatch error event
    window.dispatchEvent(
      new CustomEvent("weathererror", {
        detail: {
          error: error instanceof Error ? error.message : String(error),
        },
      })
    );

    // Fallback to saved theme
    const savedThemeId = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedThemeId) {
      setTheme(savedThemeId);
    } else {
      setTheme("default");
    }

    return { success: false, error };
  }
}

export function getCurrentTheme(): Theme {
  if (typeof window === "undefined") return themes[0];

  const savedThemeId = localStorage.getItem(THEME_STORAGE_KEY);
  return themes.find((t) => t.id === savedThemeId) || themes[0];
}

export function setTheme(themeId: string) {
  if (typeof window === "undefined") return;

  const theme = themes.find((t) => t.id === themeId);
  if (!theme) {
    console.error(`❌ Theme not found: ${themeId}`);
    return;
  }

  console.log(`🎨 Applying theme: ${theme.name} (${theme.id})`);

  localStorage.setItem(THEME_STORAGE_KEY, themeId);

  // Apply CSS variables
  const root = document.documentElement;
  root.style.setProperty("--color-primary", theme.colors.primary);
  root.style.setProperty("--color-secondary", theme.colors.secondary);
  root.style.setProperty("--color-accent", theme.colors.accent);
  root.style.setProperty("--color-background", theme.colors.background);
  root.style.setProperty("--color-card-bg", theme.colors.cardBg);
  root.style.setProperty("--color-text", theme.colors.text);
  root.style.setProperty("--color-text-secondary", theme.colors.textSecondary);
  root.style.setProperty("--gradient", theme.gradient);

  // Trigger custom event for components to react
  console.log(`📢 Dispatching themechange event for ${theme.name}`);
  window.dispatchEvent(new CustomEvent("themechange", { detail: theme }));

  console.log(`✅ Theme ${theme.name} applied successfully`);
}

export function initializeTheme() {
  if (typeof window === "undefined") return;

  // Check if weather mode is enabled
  if (isWeatherModeEnabled()) {
    updateThemeByWeather();

    // Auto-refresh every 10 minutes
    const refreshInterval = setInterval(() => {
      if (isWeatherModeEnabled()) {
        console.log("🔄 Auto-refreshing weather...");
        updateThemeByWeather();
      } else {
        clearInterval(refreshInterval);
      }
    }, 10 * 60 * 1000); // 10 minutes
  } else {
    const theme = getCurrentTheme();
    setTheme(theme.id);
  }
}
