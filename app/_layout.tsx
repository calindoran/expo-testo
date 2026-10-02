import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "expo-router/react-navigation";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useEffect } from "react";
import { Appearance, Platform, View } from "react-native";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { PokeThemes, usePokeTheme } from "@/constants/poke-theme";
import { ThemePreferenceProvider } from "@/hooks/theme-preference";

function setRootBackground(color: string) {
  SystemUI.setBackgroundColorAsync(color).catch((error: unknown) => {
    console.error("Failed to update the root view background color", error);
  });
}

if (Platform.OS !== "web") {
  const initialScheme = Appearance.getColorScheme();
  setRootBackground(
    initialScheme === "dark"
      ? PokeThemes.dark.background
      : PokeThemes.light.background,
  );
}

export const unstable_settings = {
  anchor: "(tabs)",
};

function RootNavigation() {
  const colorScheme = useColorScheme();
  const theme = usePokeTheme();

  useEffect(() => {
    setRootBackground(theme.background);
  }, [theme.background]);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <View style={{ backgroundColor: theme.background, flex: 1 }}>
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: theme.background },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="pokemon/[name]"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="collection/[type]"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="collection/[type]/[name]"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
        </Stack>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      </View>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemePreferenceProvider>
      <RootNavigation />
    </ThemePreferenceProvider>
  );
}
