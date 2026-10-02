import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ErrorState, LoadingState } from "@/components/poke-status";
import {
  usePokeStyles,
  usePokeTheme,
  type PokePalette,
} from "@/constants/poke-theme";
import {
  catalogUrl,
  COLLECTIONS,
  resourceId,
  type CollectionType,
  type ResourceList,
} from "@/lib/pokeapi";
import { usePokeApi } from "@/hooks/use-poke-api";

const ICONS: Record<CollectionType, keyof typeof Ionicons.glyphMap> = {
  items: "cube-outline",
  moves: "flash-outline",
  generations: "globe-outline",
};

function isCollectionType(value: string | undefined): value is CollectionType {
  return value === "items" || value === "moves" || value === "generations";
}

export default function CollectionRoute() {
  const styles = usePokeStyles(createStyles);
  const { type } = useLocalSearchParams<{ type: string }>();
  const normalizedType = Array.isArray(type) ? type[0] : type;
  if (!isCollectionType(normalizedType)) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Collection not found</Text>
        </View>
      </SafeAreaView>
    );
  }
  return <CollectionScreen type={normalizedType} />;
}

function CollectionScreen({ type }: { type: CollectionType }) {
  const router = useRouter();
  const theme = usePokeTheme();
  const styles = usePokeStyles(createStyles);
  const collection = COLLECTIONS[type];
  const { data, error, isLoading, refresh } = usePokeApi<ResourceList>(
    catalogUrl(type),
  );
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(40);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return (data?.results ?? []).filter((entry) =>
      entry.name.includes(normalized),
    );
  }, [data, query]);

  return (
    <SafeAreaView edges={["top"]} style={styles.screen}>
      <FlatList
        data={filtered.slice(0, visibleCount)}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            tintColor={theme.accent}
          />
        }
        ListHeaderComponent={
          <View>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={18} color={theme.ink} />
              <Text style={styles.backText}>Discover</Text>
            </Pressable>
            <View style={styles.heading}>
              <View style={styles.iconBox}>
                <Ionicons name={ICONS[type]} size={23} color={theme.accent} />
              </View>
              <Text style={styles.title}>{collection.title}</Text>
            </View>
            <Text style={styles.subtitle}>{collection.description}</Text>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color={theme.muted} />
              <TextInput
                accessibilityLabel={`Search ${collection.title.toLowerCase()}`}
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={(value) => {
                  setQuery(value);
                  setVisibleCount(40);
                }}
                placeholder={`Search ${collection.title.toLowerCase()}`}
                placeholderTextColor={theme.faint}
                style={styles.searchInput}
                value={query}
              />
              {query.length > 0 ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Clear search"
                  onPress={() => setQuery("")}
                >
                  <Ionicons name="close-circle" size={18} color={theme.faint} />
                </Pressable>
              ) : null}
            </View>
            <View style={styles.resultsRow}>
              <Text style={styles.resultsLabel}>THE COLLECTION</Text>
              <Text style={styles.resultsCount}>
                {data
                  ? `${filtered.length.toLocaleString()} results`
                  : "Loading"}
              </Text>
            </View>
            {error && !data ? (
              <ErrorState error={error} onRetry={refresh} />
            ) : null}
            {isLoading && !data ? (
              <LoadingState
                label={`Loading ${collection.title.toLowerCase()}…`}
              />
            ) : null}
          </View>
        }
        renderItem={({ item }) => {
          const id = resourceId(item.url);
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`View ${item.name}`}
              onPress={() =>
                router.push({
                  pathname: "/collection/[type]/[name]",
                  params: { type, name: item.name },
                })
              }
              style={({ pressed }) => [
                styles.resourceRow,
                pressed && styles.pressed,
              ]}
            >
              <View
                style={[
                  styles.resourceIcon,
                  type === "moves" && styles.moveIcon,
                  type === "generations" && styles.generationIcon,
                ]}
              >
                <Ionicons name={ICONS[type]} size={19} color={theme.ink} />
              </View>
              <View style={styles.resourceCopy}>
                <Text numberOfLines={1} style={styles.resourceName}>
                  {item.name.replaceAll("-", " ")}
                </Text>
                <Text style={styles.resourceMeta}>
                  {type === "generations" ? `Generation ${id}` : `Entry #${id}`}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={17} color={theme.faint} />
            </Pressable>
          );
        }}
        ListEmptyComponent={
          data && !error ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>
                {query ? "No matches yet" : "Nothing here yet"}
              </Text>
              <Text style={styles.emptyBody}>Try another search term.</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          data && filtered.length > visibleCount ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => setVisibleCount((count) => count + 40)}
              style={styles.moreButton}
            >
              <Text style={styles.moreText}>Load more</Text>
            </Pressable>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const createStyles = (theme: PokePalette) =>
  StyleSheet.create({
    screen: { backgroundColor: theme.background, flex: 1 },
    content: { paddingBottom: 28, paddingHorizontal: 20 },
    backButton: {
      alignItems: "center",
      alignSelf: "flex-start",
      flexDirection: "row",
      gap: 6,
      paddingVertical: 9,
    },
    backText: { color: theme.muted, fontSize: 13, fontWeight: "700" },
    heading: {
      alignItems: "center",
      flexDirection: "row",
      gap: 12,
      marginTop: 21,
    },
    iconBox: {
      alignItems: "center",
      backgroundColor: theme.accentSoft,
      borderRadius: 15,
      height: 46,
      justifyContent: "center",
      width: 46,
    },
    title: {
      color: theme.ink,
      fontSize: 31,
      fontWeight: "900",
      letterSpacing: -1,
    },
    subtitle: {
      color: theme.muted,
      fontSize: 14,
      lineHeight: 20,
      marginTop: 7,
    },
    searchBox: {
      alignItems: "center",
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderRadius: 15,
      borderWidth: 1,
      flexDirection: "row",
      gap: 9,
      height: 50,
      marginTop: 20,
      paddingHorizontal: 14,
    },
    searchInput: { color: theme.ink, flex: 1, fontSize: 14, height: "100%" },
    resultsRow: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 10,
      marginTop: 23,
    },
    resultsLabel: {
      color: theme.muted,
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 1.1,
    },
    resultsCount: { color: theme.faint, fontSize: 12, fontWeight: "600" },
    resourceRow: {
      alignItems: "center",
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderRadius: 16,
      borderWidth: 1,
      flexDirection: "row",
      gap: 12,
      marginBottom: 9,
      paddingHorizontal: 13,
      paddingVertical: 12,
    },
    pressed: { opacity: 0.78 },
    resourceIcon: {
      alignItems: "center",
      backgroundColor: theme.yellow,
      borderRadius: 12,
      height: 40,
      justifyContent: "center",
      width: 40,
    },
    moveIcon: { backgroundColor: theme.blue },
    generationIcon: { backgroundColor: theme.lavender },
    resourceCopy: { flex: 1 },
    resourceName: {
      color: theme.ink,
      fontSize: 14,
      fontWeight: "800",
      textTransform: "capitalize",
    },
    resourceMeta: { color: theme.muted, fontSize: 11, marginTop: 3 },
    empty: { alignItems: "center", paddingHorizontal: 24, paddingVertical: 36 },
    emptyTitle: { color: theme.ink, fontSize: 16, fontWeight: "800" },
    emptyBody: { color: theme.muted, fontSize: 13, marginTop: 6 },
    moreButton: {
      alignItems: "center",
      backgroundColor: theme.accentSoft,
      borderRadius: 14,
      marginTop: 5,
      padding: 13,
    },
    moreText: { color: theme.accent, fontSize: 13, fontWeight: "800" },
  });
