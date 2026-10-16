import Storage from "expo-sqlite/kv-store";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  Appearance,
  Platform,
  useColorScheme as useDeviceColorScheme,
} from "react-native";

export type ThemePreference = "system" | "light" | "dark";
type ColorScheme = Exclude<ThemePreference, "system">;

const STORAGE_KEY = "expo-testo.theme-preference";
const STORAGE_ERROR = "Your theme preference could not be saved.";

interface ThemeSnapshot {
  preference: ThemePreference;
  storageError: string | null;
  hydrated: boolean;
}

interface ThemePreferenceContextValue {
  colorScheme: ColorScheme;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  storageError: string | null;
}

function readStoredPreference(): Pick<ThemeSnapshot, "preference" | "storageError"> {
  if (Platform.OS === "web" && typeof window === "undefined") {
    return { preference: "system", storageError: null };
  }

  try {
    const stored = Storage.getItemSync(STORAGE_KEY);
    return {
      preference: stored === "light" || stored === "dark" ? stored : "system",
      storageError: null,
    };
  } catch (error) {
    console.error("Failed to read the saved theme preference", error);
    return { preference: "system", storageError: STORAGE_ERROR };
  }
}

const storedPreference = readStoredPreference();
let snapshot: ThemeSnapshot = { ...storedPreference, hydrated: true };
const serverSnapshot: ThemeSnapshot = {
  preference: "system",
  storageError: null,
  hydrated: false,
};
const subscribers = new Set<() => void>();

function subscribe(listener: () => void) {
  subscribers.add(listener);
  return () => subscribers.delete(listener);
}

function notifySubscribers() {
  for (const listener of subscribers) listener();
}

if (Platform.OS !== "web" && storedPreference.preference !== "system") {
  try {
    Appearance.setColorScheme(storedPreference.preference);
  } catch (error) {
    console.error("Failed to restore the native theme preference", error);
  }
}

const ThemePreferenceContext =
  createContext<ThemePreferenceContextValue | null>(null);

export function ThemePreferenceProvider({
  children,
}: {
  children: ReactNode;
}) {
  const deviceColorScheme = useDeviceColorScheme();
  const { preference, storageError, hydrated } = useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => serverSnapshot,
  );

  const setPreference = useCallback((nextPreference: ThemePreference) => {
    try {
      if (nextPreference === "system") {
        Storage.removeItemSync(STORAGE_KEY);
      } else {
        Storage.setItemSync(STORAGE_KEY, nextPreference);
      }
    } catch (error) {
      console.error("Failed to save the theme preference", error);
      snapshot = { ...snapshot, storageError: STORAGE_ERROR };
      notifySubscribers();
      return;
    }

    snapshot = {
      preference: nextPreference,
      storageError: null,
      hydrated: true,
    };
    notifySubscribers();

    if (Platform.OS !== "web") {
      try {
        Appearance.setColorScheme(
          nextPreference === "system" ? "unspecified" : nextPreference,
        );
      } catch (error) {
        console.error("Failed to apply the theme to native appearance", error);
      }
    }
  }, []);

  const colorScheme: ColorScheme =
    preference === "system"
      ? Platform.OS === "web" && !hydrated
        ? "light"
        : deviceColorScheme === "dark"
          ? "dark"
          : "light"
      : preference;

  const value = useMemo(
    () => ({ colorScheme, preference, setPreference, storageError }),
    [colorScheme, preference, setPreference, storageError],
  );

  return (
    <ThemePreferenceContext.Provider value={value}>
      {children}
    </ThemePreferenceContext.Provider>
  );
}

export function useThemePreference(): ThemePreferenceContextValue {
  const context = useContext(ThemePreferenceContext);
  if (!context) {
    throw new Error(
      "useThemePreference must be used within ThemePreferenceProvider",
    );
  }
  return context;
}

export function useColorScheme(): ColorScheme {
  return useThemePreference().colorScheme;
}
