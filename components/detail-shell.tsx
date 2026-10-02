import { type Href, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { type ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePokeStyles, type PokePalette } from "@/constants/poke-theme";

export function DetailShell({ children }: { children: ReactNode }) {
  const styles = usePokeStyles(createShellStyles);
  return (
    <SafeAreaView edges={["top"]} style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function DetailBack({
  label = "Back",
  fallbackHref = "/explore",
}: {
  label?: string;
  fallbackHref?: Href;
}) {
  const router = useRouter();
  const styles = usePokeStyles(createShellStyles);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => {
        if (router.canGoBack()) router.back();
        else router.replace(fallbackHref);
      }}
      style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
    >
      <Ionicons name="arrow-back" size={18} color={styles.backText.color} />
      <Text style={styles.backText}>{label}</Text>
    </Pressable>
  );
}

export function DetailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const styles = usePokeStyles(createShellStyles);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export function useDetailStyles() {
  return usePokeStyles(createDetailStyles);
}

const createShellStyles = (theme: PokePalette) =>
  StyleSheet.create({
    screen: { backgroundColor: theme.background, flex: 1 },
    content: {
      gap: 16,
      paddingBottom: 40,
      paddingHorizontal: 20,
      paddingTop: 8,
    },
    backButton: {
      alignItems: "center",
      alignSelf: "flex-start",
      flexDirection: "row",
      gap: 7,
      paddingVertical: 10,
    },
    pressed: { opacity: 0.75 },
    backText: { color: theme.muted, fontSize: 13, fontWeight: "700" },
    section: { gap: 12 },
    sectionTitle: { color: theme.ink, fontSize: 17, fontWeight: "800" },
  });

const createDetailStyles = (theme: PokePalette) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderRadius: 19,
      borderWidth: 1,
      padding: 17,
    },
    mutedText: { color: theme.muted, fontSize: 13, lineHeight: 20 },
    chip: {
      backgroundColor: theme.accentSoft,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 7,
    },
    chipText: {
      color: theme.ink,
      fontSize: 12,
      fontWeight: "700",
      textTransform: "capitalize",
    },
  });
