import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  DetailBack,
  DetailSection,
  DetailShell,
  useDetailStyles,
} from "@/components/detail-shell";
import { ErrorState, LoadingState } from "@/components/poke-status";
import {
  usePokeStyles,
  usePokeTheme,
  type PokePalette,
} from "@/constants/poke-theme";
import {
  detailUrl,
  formatName,
  TYPE_COLORS,
  type PokemonDetail,
} from "@/lib/pokeapi";
import { usePokeApi } from "@/hooks/use-poke-api";

export default function PokemonDetailScreen() {
  const theme = usePokeTheme();
  const styles = usePokeStyles(createStyles);
  const detailStyles = useDetailStyles();
  const { name } = useLocalSearchParams<{ name: string }>();
  const pokemonName = Array.isArray(name) ? name[0] : name;
  const { data, error, isLoading, refresh } = usePokeApi<PokemonDetail>(
    detailUrl("pokemon", pokemonName ?? ""),
  );
  const [showShiny, setShowShiny] = useState(false);

  return (
    <DetailShell>
      <DetailBack label="Pokédex" fallbackHref="/" />
      {isLoading ? <LoadingState label="Looking up Pokémon…" /> : null}
      {error ? <ErrorState error={error} onRetry={refresh} /> : null}
      {data ? (
        <>
          <View style={styles.hero}>
            <Text style={styles.dexNumber}>
              NATIONAL DEX / #{String(data.id).padStart(3, "0")}
            </Text>
            {data.sprites.other?.["official-artwork"]?.front_default ? (
              <Image
                accessibilityLabel={`${formatName(data.name)} artwork${showShiny ? ", shiny form" : ""}`}
                source={
                  showShiny
                    ? (data.sprites.other["official-artwork"].front_shiny ??
                      data.sprites.other["official-artwork"].front_default)
                    : data.sprites.other["official-artwork"].front_default
                }
                contentFit="contain"
                style={styles.artwork}
                transition={180}
              />
            ) : (
              <View style={styles.artworkPlaceholder}>
                <Text style={styles.placeholderText}>No artwork available</Text>
              </View>
            )}
            <Text style={styles.name}>{formatName(data.name)}</Text>
            <View style={styles.types}>
              {data.types.map(({ type }) => (
                <View
                  key={type.name}
                  style={[
                    styles.typePill,
                    { backgroundColor: TYPE_COLORS[type.name] ?? theme.muted },
                  ]}
                >
                  <Text style={styles.typeText}>{type.name}</Text>
                </View>
              ))}
            </View>
            {data.sprites.other?.["official-artwork"]?.front_shiny ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  showShiny ? "Show regular artwork" : "Show shiny artwork"
                }
                accessibilityState={{ selected: showShiny }}
                onPress={() => setShowShiny((value) => !value)}
                style={styles.shinyButton}
              >
                <Text style={styles.shinyText}>
                  {showShiny ? "✦ Shiny form" : "✧ See shiny form"}
                </Text>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.measurements}>
            <View style={styles.measurement}>
              <Text style={styles.measurementValue}>
                {(data.height / 10).toFixed(1)} m
              </Text>
              <Text style={styles.measurementLabel}>HEIGHT</Text>
            </View>
            <View style={styles.measureDivider} />
            <View style={styles.measurement}>
              <Text style={styles.measurementValue}>
                {(data.weight / 10).toFixed(1)} kg
              </Text>
              <Text style={styles.measurementLabel}>WEIGHT</Text>
            </View>
          </View>

          <DetailSection title="Base stats">
            <View style={[detailStyles.card, styles.statCard]}>
              {data.stats.map(({ base_stat, stat }) => (
                <View key={stat.name} style={styles.statRow}>
                  <Text style={styles.statName}>{formatName(stat.name)}</Text>
                  <View style={styles.statTrack}>
                    <View
                      style={[
                        styles.statFill,
                        { width: `${Math.min(100, (base_stat / 255) * 100)}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.statValue}>{base_stat}</Text>
                </View>
              ))}
            </View>
          </DetailSection>

          <DetailSection title="Abilities">
            <View style={styles.chips}>
              {data.abilities.map(({ ability, is_hidden }) => (
                <View key={ability.name} style={detailStyles.chip}>
                  <Text style={detailStyles.chipText}>
                    {formatName(ability.name)}
                    {is_hidden ? " · Hidden" : ""}
                  </Text>
                </View>
              ))}
            </View>
          </DetailSection>
        </>
      ) : null}
    </DetailShell>
  );
}

const createStyles = (theme: PokePalette) =>
  StyleSheet.create({
    hero: {
      alignItems: "center",
      backgroundColor: theme.accentSoft,
      borderRadius: 25,
      paddingBottom: 20,
      paddingHorizontal: 18,
      paddingTop: 17,
    },
    dexNumber: {
      alignSelf: "flex-start",
      color: theme.accent,
      fontSize: 10,
      fontWeight: "900",
      letterSpacing: 1.1,
    },
    artwork: { height: 224, marginTop: 3, width: "85%" },
    artworkPlaceholder: {
      alignItems: "center",
      height: 220,
      justifyContent: "center",
    },
    placeholderText: { color: theme.muted, fontSize: 13 },
    name: {
      color: theme.ink,
      fontSize: 30,
      fontWeight: "900",
      letterSpacing: -0.8,
      marginTop: 2,
      textTransform: "capitalize",
    },
    types: { flexDirection: "row", gap: 8, marginTop: 10 },
    typePill: { borderRadius: 18, paddingHorizontal: 12, paddingVertical: 6 },
    typeText: {
      color: "#FFFFFF",
      fontSize: 11,
      fontWeight: "800",
      textTransform: "capitalize",
    },
    shinyButton: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      marginTop: 14,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    shinyText: { color: theme.ink, fontSize: 12, fontWeight: "800" },
    measurements: {
      alignItems: "center",
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderRadius: 19,
      borderWidth: 1,
      flexDirection: "row",
      justifyContent: "space-evenly",
      paddingVertical: 15,
    },
    measurement: { alignItems: "center", flex: 1, gap: 4 },
    measurementValue: { color: theme.ink, fontSize: 16, fontWeight: "800" },
    measurementLabel: {
      color: theme.faint,
      fontSize: 9,
      fontWeight: "900",
      letterSpacing: 1.1,
    },
    measureDivider: { backgroundColor: theme.border, height: 34, width: 1 },
    statCard: { gap: 13 },
    statRow: { alignItems: "center", flexDirection: "row", gap: 9 },
    statName: { color: theme.muted, fontSize: 11, width: 77 },
    statTrack: {
      backgroundColor: theme.background,
      borderRadius: 5,
      flex: 1,
      height: 8,
      overflow: "hidden",
    },
    statFill: {
      backgroundColor: theme.accent,
      borderRadius: 5,
      height: "100%",
    },
    statValue: {
      color: theme.ink,
      fontSize: 12,
      fontWeight: "800",
      textAlign: "right",
      width: 28,
    },
    chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  });
