import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
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
  type CollectionType,
  type GenerationDetail,
  type ItemDetail,
  type MoveDetail,
} from "@/lib/pokeapi";
import { usePokeApi } from "@/hooks/use-poke-api";

function isCollectionType(value: string | undefined): value is CollectionType {
  return value === "items" || value === "moves" || value === "generations";
}

export default function CollectionDetailRoute() {
  const theme = usePokeTheme();
  const params = useLocalSearchParams<{ type: string; name: string }>();
  const type = Array.isArray(params.type) ? params.type[0] : params.type;
  const name = Array.isArray(params.name) ? params.name[0] : params.name;
  if (!isCollectionType(type) || !name) {
    return (
      <DetailShell>
        <DetailBack label="Discover" />
        <Text style={{ color: theme.ink, fontSize: 24, fontWeight: "800" }}>
          Entry not found
        </Text>
      </DetailShell>
    );
  }
  if (type === "items") return <ItemDetailScreen name={name} />;
  if (type === "moves") return <MoveDetailScreen name={name} />;
  return <GenerationDetailScreen key={name} name={name} />;
}

function ItemDetailScreen({ name }: { name: string }) {
  const theme = usePokeTheme();
  const styles = usePokeStyles(createStyles);
  const detailStyles = useDetailStyles();
  const { data, error, isLoading, refresh } = usePokeApi<ItemDetail>(
    detailUrl("items", name),
  );
  const description = data?.effect_entries.find(
    (entry) => entry.language.name === "en",
  )?.short_effect;
  return (
    <DetailShell>
      <DetailBack label="Items" />
      {isLoading ? <LoadingState label="Looking up item…" /> : null}
      {error ? <ErrorState error={error} onRetry={refresh} /> : null}
      {data ? (
        <>
          <View style={styles.itemHero}>
            <Text style={styles.entryNumber}>
              ITEM / #{String(data.id).padStart(3, "0")}
            </Text>
            {data.sprites.default ? (
              <Image
                source={data.sprites.default}
                contentFit="contain"
                style={styles.itemImage}
              />
            ) : (
              <Ionicons name="cube-outline" size={64} color={theme.accent} />
            )}
            <Text style={styles.pageTitle}>{formatName(data.name)}</Text>
            <Text style={styles.subtitle}>
              {formatName(data.category.name)}
            </Text>
          </View>
          <View style={styles.priceCard}>
            <Text style={styles.priceLabel}>SHOP PRICE</Text>
            <Text style={styles.priceValue}>
              {data.cost > 0
                ? `${data.cost.toLocaleString()} ₽`
                : "Not for sale"}
            </Text>
          </View>
          <DetailSection title="About this item">
            <View style={detailStyles.card}>
              <Text style={detailStyles.mutedText}>
                {description || "No description is available for this item."}
              </Text>
            </View>
          </DetailSection>
          {data.attributes.length > 0 ? (
            <DetailSection title="Attributes">
              <View style={styles.chips}>
                {data.attributes.map((attribute) => (
                  <View key={attribute.name} style={detailStyles.chip}>
                    <Text style={detailStyles.chipText}>
                      {formatName(attribute.name)}
                    </Text>
                  </View>
                ))}
              </View>
            </DetailSection>
          ) : null}
        </>
      ) : null}
    </DetailShell>
  );
}

function MoveDetailScreen({ name }: { name: string }) {
  const theme = usePokeTheme();
  const styles = usePokeStyles(createStyles);
  const detailStyles = useDetailStyles();
  const { data, error, isLoading, refresh } = usePokeApi<MoveDetail>(
    detailUrl("moves", name),
  );
  const description = data?.effect_entries.find(
    (entry) => entry.language.name === "en",
  )?.short_effect;
  return (
    <DetailShell>
      <DetailBack label="Moves" />
      {isLoading ? <LoadingState label="Looking up move…" /> : null}
      {error ? <ErrorState error={error} onRetry={refresh} /> : null}
      {data ? (
        <>
          <View style={styles.moveHero}>
            <Text style={styles.entryNumber}>
              MOVE / #{String(data.id).padStart(3, "0")}
            </Text>
            <View
              style={[
                styles.typePill,
                { backgroundColor: TYPE_COLORS[data.type.name] ?? theme.muted },
              ]}
            >
              <Text style={styles.typeText}>{formatName(data.type.name)}</Text>
            </View>
            <Text style={styles.pageTitle}>{formatName(data.name)}</Text>
            <Text style={styles.subtitle}>
              {formatName(data.damage_class.name)} attack
            </Text>
          </View>
          <DetailSection title="Move stats">
            <View style={styles.statGrid}>
              <StatTile
                label="POWER"
                value={data.power == null ? "—" : String(data.power)}
              />
              <StatTile
                label="ACCURACY"
                value={data.accuracy == null ? "—" : `${data.accuracy}%`}
              />
              <StatTile
                label="PP"
                value={data.pp == null ? "—" : String(data.pp)}
              />
            </View>
          </DetailSection>
          <DetailSection title="Effect">
            <View style={detailStyles.card}>
              <Text style={detailStyles.mutedText}>
                {description || "No description is available for this move."}
              </Text>
            </View>
          </DetailSection>
        </>
      ) : null}
    </DetailShell>
  );
}

function GenerationDetailScreen({ name }: { name: string }) {
  const theme = usePokeTheme();
  const styles = usePokeStyles(createStyles);
  const router = useRouter();
  const [visibleSpeciesCount, setVisibleSpeciesCount] = useState(30);
  const { data, error, isLoading, refresh } = usePokeApi<GenerationDetail>(
    detailUrl("generations", name),
  );
  return (
    <DetailShell>
      <DetailBack label="Generations" />
      {isLoading ? <LoadingState label="Discovering this generation…" /> : null}
      {error ? <ErrorState error={error} onRetry={refresh} /> : null}
      {data ? (
        <>
          <View style={styles.generationHero}>
            <View style={styles.generationIcon}>
              <Ionicons name="globe-outline" size={27} color={theme.accent} />
            </View>
            <Text style={styles.entryNumber}>POKÉMON HISTORY</Text>
            <Text style={styles.pageTitle}>{formatName(data.name)}</Text>
            <Text style={styles.subtitle}>
              {data.main_region
                ? `${formatName(data.main_region.name)} region`
                : "A new chapter in the Pokémon world"}
            </Text>
          </View>
          <View style={styles.priceCard}>
            <Text style={styles.priceLabel}>SPECIES INTRODUCED</Text>
            <Text style={styles.priceValue}>{data.pokemon_species.length}</Text>
          </View>
          <DetailSection title="Meet the Pokémon">
            <View style={styles.speciesList}>
              {data.pokemon_species.slice(0, visibleSpeciesCount).map((species) => (
                <Pressable
                  key={species.name}
                  accessibilityRole="button"
                  onPress={() =>
                    router.push({
                      pathname: "/pokemon/[name]",
                      params: { name: species.name },
                    })
                  }
                  style={({ pressed }) => [
                    styles.speciesButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.speciesName}>
                    {formatName(species.name)}
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={15}
                    color={theme.faint}
                  />
                </Pressable>
              ))}
            </View>
            {data.pokemon_species.length > visibleSpeciesCount ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => setVisibleSpeciesCount((count) => count + 30)}
                style={({ pressed }) => [
                  styles.moreSpecies,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.moreSpeciesText}>Load more Pokémon</Text>
                <Ionicons
                  name="chevron-down"
                  size={16}
                  color={theme.accent}
                />
              </Pressable>
            ) : null}
          </DetailSection>
        </>
      ) : null}
    </DetailShell>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  const styles = usePokeStyles(createStyles);
  return (
    <View style={styles.statTile}>
      <Text style={styles.tileValue}>{value}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

const createStyles = (theme: PokePalette) =>
  StyleSheet.create({
    entryNumber: {
      color: theme.accent,
      fontSize: 10,
      fontWeight: "900",
      letterSpacing: 1.1,
    },
    pageTitle: {
      color: theme.ink,
      fontSize: 29,
      fontWeight: "900",
      letterSpacing: -0.8,
      marginTop: 5,
      textTransform: "capitalize",
    },
    subtitle: {
      color: theme.muted,
      fontSize: 14,
      marginTop: 5,
      textTransform: "capitalize",
    },
    itemHero: {
      alignItems: "center",
      backgroundColor: theme.yellow,
      borderRadius: 24,
      minHeight: 230,
      justifyContent: "center",
      padding: 20,
    },
    itemImage: { height: 100, marginVertical: 9, width: 120 },
    priceCard: {
      alignItems: "center",
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderRadius: 18,
      borderWidth: 1,
      padding: 17,
    },
    priceLabel: {
      color: theme.faint,
      fontSize: 9,
      fontWeight: "900",
      letterSpacing: 1.1,
    },
    priceValue: {
      color: theme.ink,
      fontSize: 20,
      fontWeight: "900",
      marginTop: 5,
    },
    chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    moveHero: {
      alignItems: "center",
      backgroundColor: theme.blue,
      borderRadius: 24,
      padding: 22,
    },
    typePill: {
      borderRadius: 16,
      marginTop: 16,
      paddingHorizontal: 12,
      paddingVertical: 7,
    },
    typeText: {
      color: "#FFFFFF",
      fontSize: 11,
      fontWeight: "800",
      textTransform: "capitalize",
    },
    statGrid: { flexDirection: "row", gap: 9 },
    statTile: {
      alignItems: "center",
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderRadius: 17,
      borderWidth: 1,
      flex: 1,
      paddingVertical: 16,
    },
    tileValue: { color: theme.ink, fontSize: 20, fontWeight: "900" },
    tileLabel: {
      color: theme.faint,
      fontSize: 9,
      fontWeight: "900",
      letterSpacing: 0.8,
      marginTop: 5,
    },
    generationHero: {
      alignItems: "center",
      backgroundColor: theme.lavender,
      borderRadius: 24,
      padding: 23,
    },
    generationIcon: {
      alignItems: "center",
      backgroundColor: theme.surface,
      borderRadius: 18,
      height: 58,
      justifyContent: "center",
      marginBottom: 15,
      width: 58,
    },
    speciesList: { gap: 8 },
    speciesButton: {
      alignItems: "center",
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderRadius: 13,
      borderWidth: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    pressed: { opacity: 0.75 },
    speciesName: {
      color: theme.ink,
      fontSize: 13,
      fontWeight: "700",
      textTransform: "capitalize",
    },
    moreSpecies: {
      alignItems: "center",
      backgroundColor: theme.accentSoft,
      borderRadius: 14,
      flexDirection: "row",
      gap: 8,
      justifyContent: "center",
      marginTop: 5,
      padding: 13,
    },
    moreSpeciesText: { color: theme.accent, fontSize: 13, fontWeight: "800" },
  });
