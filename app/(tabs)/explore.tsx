import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  usePokeStyles,
  usePokeTheme,
  type PokePalette,
} from "@/constants/poke-theme";
import { COLLECTIONS, type CollectionType } from "@/lib/pokeapi";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemePreference } from "@/hooks/theme-preference";

const sections: {
  type: CollectionType;
  icon: keyof typeof Ionicons.glyphMap;
  color: "lavender" | "yellow" | "blue";
  count: string;
}[] = [
  {
    type: "generations",
    icon: "globe-outline",
    color: "lavender",
    count: "Regions & species",
  },
  {
    type: "items",
    icon: "cube-outline",
    color: "yellow",
    count: "Useful discoveries",
  },
  {
    type: "moves",
    icon: "flash-outline",
    color: "blue",
    count: "Battle techniques",
  },
];

export default function ExploreScreen() {
  const router = useRouter();
  const theme = usePokeTheme();
  const styles = usePokeStyles(createStyles);
  const colorScheme = useColorScheme();
  const { preference, setPreference, storageError } = useThemePreference();

  return (
    <SafeAreaView edges={["top"]} style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.eyebrow}>YOUR ADVENTURE, ORGANIZED</Text>
        <Text style={styles.title}>Explore</Text>
        <Text style={styles.subtitle}>
          A few more corners of the Pokémon world to get lost in.
        </Text>

        <View style={styles.featureCard}>
          <View style={styles.featureTop}>
            <View style={styles.featureIcon}>
              <Ionicons
                name="compass-outline"
                size={22}
                color={theme.onAccent}
              />
            </View>
            <Text style={styles.featureTag}>FIELD NOTES / 01</Text>
          </View>
          <Text style={styles.featureTitle}>Curiosity looks good on you.</Text>
          <Text style={styles.featureBody}>
            Browse the details behind the creatures, places, and moves you know.
          </Text>
        </View>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Browse collections</Text>
          <Text style={styles.sectionCaption}>3 collections</Text>
        </View>
        <View style={styles.cards}>
          {sections.map(({ type, icon, color, count }) => {
            const collection = COLLECTIONS[type];
            return (
              <Pressable
                key={type}
                accessibilityRole="button"
                accessibilityLabel={`Browse ${collection.title}`}
                onPress={() =>
                  router.push({
                    pathname: "/collection/[type]",
                    params: { type },
                  })
                }
                style={({ pressed }) => [
                  styles.collectionCard,
                  pressed && styles.pressed,
                ]}
              >
                <View
                  style={[
                    styles.collectionIcon,
                    { backgroundColor: theme[color] },
                  ]}
                >
                  <Ionicons name={icon} size={21} color={theme.ink} />
                </View>
                <View style={styles.collectionCopy}>
                  <Text style={styles.collectionTitle}>{collection.title}</Text>
                  <Text style={styles.collectionDescription}>{count}</Text>
                </View>
                <Ionicons name="arrow-forward" size={18} color={theme.muted} />
              </Pressable>
            );
          })}
        </View>
        <View style={styles.appearanceSection}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.appearanceCard}>
            <View style={styles.appearanceCopy}>
              <Text style={styles.appearanceTitle}>Dark mode</Text>
              <Text style={styles.appearanceDescription}>
                {preference === "system"
                  ? `Following device setting (${colorScheme})`
                  : `Saved as ${preference} on this device`}
              </Text>
            </View>
            <Switch
              accessibilityLabel="Dark mode"
              onValueChange={(enabled) =>
                setPreference(enabled ? "dark" : "light")
              }
              trackColor={{ false: theme.border, true: theme.accent }}
              thumbColor={theme.surface}
              value={colorScheme === "dark"}
            />
          </View>
          {preference !== "system" ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => setPreference("system")}
              style={styles.deviceThemeButton}
            >
              <Ionicons
                name="phone-portrait-outline"
                size={16}
                color={theme.accent}
              />
              <Text style={styles.deviceThemeText}>Use device theme</Text>
            </Pressable>
          ) : null}
          {storageError ? (
            <Text accessibilityRole="alert" style={styles.storageError}>
              {storageError}
            </Text>
          ) : null}
        </View>
        <Text style={styles.footer}>
          Powered by PokéAPI · made for curious trainers
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: PokePalette) =>
  StyleSheet.create({
    screen: { backgroundColor: theme.background, flex: 1 },
    content: { paddingBottom: 36, paddingHorizontal: 20, paddingTop: 24 },
    eyebrow: {
      color: theme.accent,
      fontSize: 10,
      fontWeight: "900",
      letterSpacing: 1.5,
    },
    title: {
      color: theme.ink,
      fontSize: 36,
      fontWeight: "900",
      letterSpacing: -1.5,
      marginTop: 8,
    },
    subtitle: {
      color: theme.muted,
      fontSize: 15,
      lineHeight: 22,
      marginTop: 3,
    },
    featureCard: {
      backgroundColor: theme.feature,
      borderRadius: 23,
      marginTop: 24,
      padding: 20,
    },
    featureTop: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    featureIcon: {
      alignItems: "center",
      backgroundColor: theme.accent,
      borderRadius: 13,
      height: 40,
      justifyContent: "center",
      width: 40,
    },
    featureTag: {
      color: theme.featureMuted,
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 1.2,
    },
    featureTitle: {
      color: theme.featureText,
      fontSize: 21,
      fontWeight: "800",
      letterSpacing: -0.4,
      marginTop: 22,
    },
    featureBody: {
      color: theme.featureMuted,
      fontSize: 13,
      lineHeight: 20,
      marginTop: 7,
      maxWidth: 290,
    },
    sectionHeading: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 12,
      marginTop: 29,
    },
    sectionTitle: { color: theme.ink, fontSize: 17, fontWeight: "800" },
    sectionCaption: { color: theme.faint, fontSize: 12, fontWeight: "600" },
    cards: { gap: 10 },
    collectionCard: {
      alignItems: "center",
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderRadius: 19,
      borderWidth: 1,
      flexDirection: "row",
      gap: 13,
      padding: 14,
    },
    pressed: { opacity: 0.8 },
    collectionIcon: {
      alignItems: "center",
      borderRadius: 14,
      height: 46,
      justifyContent: "center",
      width: 46,
    },
    collectionCopy: { flex: 1 },
    collectionTitle: { color: theme.ink, fontSize: 15, fontWeight: "800" },
    collectionDescription: { color: theme.muted, fontSize: 12, marginTop: 3 },
    appearanceSection: { marginTop: 30 },
    appearanceCard: {
      alignItems: "center",
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderRadius: 19,
      borderWidth: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 12,
      paddingHorizontal: 15,
      paddingVertical: 12,
    },
    appearanceCopy: { flex: 1, gap: 4 },
    appearanceTitle: { color: theme.ink, fontSize: 14, fontWeight: "800" },
    appearanceDescription: { color: theme.muted, fontSize: 12 },
    deviceThemeButton: {
      alignItems: "center",
      alignSelf: "flex-start",
      flexDirection: "row",
      gap: 6,
      marginTop: 12,
      paddingVertical: 5,
    },
    deviceThemeText: { color: theme.accent, fontSize: 12, fontWeight: "700" },
    storageError: { color: theme.accent, fontSize: 12, marginTop: 8 },
    footer: {
      color: theme.faint,
      fontSize: 11,
      marginTop: 25,
      textAlign: "center",
    },
  });
