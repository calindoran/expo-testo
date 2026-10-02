import { useMemo } from "react";
import { useColorScheme } from "@/hooks/use-color-scheme";

export const PokeThemes = {
  light: {
    background: "#F7F5EF",
    surface: "#FFFFFF",
    ink: "#202622",
    muted: "#727A73",
    faint: "#A5AAA4",
    border: "#E9E7E0",
    accent: "#D9433D",
    accentSoft: "#FCE8E5",
    green: "#DCEBE0",
    blue: "#E1EAF3",
    yellow: "#F7EBCB",
    lavender: "#EAE5F4",
    feature: "#DCEBE0",
    featureText: "#244A3F",
    featureMuted: "#506C56",
    onAccent: "#FFFFFF",
  },
  dark: {
    background: "#111512",
    surface: "#1C221E",
    ink: "#F0F3EE",
    muted: "#B0B8B0",
    faint: "#828C84",
    border: "#323A34",
    accent: "#FF786F",
    accentSoft: "#3C2525",
    green: "#273B2E",
    blue: "#273543",
    yellow: "#3D3522",
    lavender: "#342D43",
    feature: "#252C27",
    featureText: "#F3F5F1",
    featureMuted: "#BDC5BD",
    onAccent: "#171A17",
  },
} as const;

export type PokePalette = (typeof PokeThemes)[keyof typeof PokeThemes];

export function usePokeTheme(): PokePalette {
  const scheme = useColorScheme();
  return PokeThemes[scheme];
}

export function usePokeStyles<T extends object>(
  createStyles: (theme: PokePalette) => T,
): T {
  const theme = usePokeTheme();
  return useMemo(() => createStyles(theme), [createStyles, theme]);
}
