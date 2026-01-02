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
    backgroundImage: `url('${import.meta.env.BASE_URL}bg-party.jpg')`,
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
const WEATHER_API_KEY = "439d4b804bc8187953eb36d2a8c26a02"; // OpenWeatherMap free API

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

function mapWeatherToTheme(weatherMain: string, isDay: boolean): string {
  const weatherLower = weatherMain.toLowerCase();

  // Night time
  if (!isDay) return "dark";

  // Weather conditions
  if (weatherLower.includes("clear")) return "neon";
  if (weatherLower.includes("cloud")) return "default";
  if (weatherLower.includes("rain") || weatherLower.includes("drizzle"))
    return "ocean";
  if (weatherLower.includes("thunder")) return "royal";
  if (weatherLower.includes("snow")) return "candy";
  if (weatherLower.includes("mist") || weatherLower.includes("fog"))
    return "forest";
  if (weatherLower.includes("sun")) return "sunset";

  return "default";
}

export async function updateThemeByWeather() {
  if (typeof window === "undefined" || !isWeatherModeEnabled()) return;

  try {
    // Get user location
    const position = await new Promise<GeolocationPosition>(
      (resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      }
    );

    const { latitude, longitude } = position.coords;

    // Fetch weather data
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}`
    );

    if (!response.ok) throw new Error("Weather API failed");

    const data = await response.json();
    const weatherMain = data.weather[0].main;
    const sunrise = data.sys.sunrise * 1000;
    const sunset = data.sys.sunset * 1000;
    const now = Date.now();
    const isDay = now >= sunrise && now <= sunset;

    // Map weather to theme
    const themeId = mapWeatherToTheme(weatherMain, isDay);
    setTheme(themeId);

    console.log(
      `🌤️ Weather: ${weatherMain}, Time: ${
        isDay ? "Day" : "Night"
      }, Theme: ${themeId}`
    );
  } catch (error) {
    console.error("Failed to get weather:", error);
    // Fallback to saved theme
    const savedThemeId = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedThemeId) setTheme(savedThemeId);
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
  if (!theme) return;

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
  window.dispatchEvent(new CustomEvent("themechange", { detail: theme }));
}

export function initializeTheme() {
  if (typeof window === "undefined") return;

  // Check if weather mode is enabled
  if (isWeatherModeEnabled()) {
    updateThemeByWeather();
  } else {
    const theme = getCurrentTheme();
    setTheme(theme.id);
  }
}
