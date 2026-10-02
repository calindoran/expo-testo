import { ErrorState, LoadingState } from "@/components/poke-status";
import { useNetworkState } from "expo-network";
import { PokemonCard } from "@/components/pokemon-card";
import {
  usePokeStyles,
  usePokeTheme,
  type PokePalette,
} from "@/constants/poke-theme";
import { usePokeApi } from "@/hooks/use-poke-api";
import { catalogUrl, resourceId, type ResourceList } from "@/lib/pokeapi";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useMemo, useRef, useState } from "react";
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

const PAGE_SIZE = 24;

export default function PokedexScreen() {
  const router = useRouter();
  const theme = usePokeTheme();
  const styles = usePokeStyles(createStyles);
  const networkState = useNetworkState();
  const isOnline =
    networkState.isInternetReachable ?? networkState.isConnected;
  const connectionLabel =
    isOnline === true ? "Online" : isOnline === false ? "Offline" : "Checking";
  const connectionColor =
    isOnline === true
      ? "#6AA978"
      : isOnline === false
        ? theme.accent
        : theme.faint;
  const { data, error, isLoading, refresh } = usePokeApi<ResourceList>(
    catalogUrl("pokemon"),
  );
  const [query, setQuery] = useState("");
  const listRef = useRef<FlatList<ResourceList["results"][number]>>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return (data?.results ?? []).filter((pokemon) =>
      pokemon.name.includes(normalized),
    );
  }, [data, query]);
  const visiblePokemon = filtered.slice(0, visibleCount);

  return (
    <SafeAreaView edges={["top"]} style={styles.screen}>
      <FlatList
        ref={listRef}
        data={visiblePokemon}
        keyExtractor={(item) => item.name}
        numColumns={2}
        columnWrapperStyle={styles.row}
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
          <View style={styles.header}>
            <View style={styles.brandRow}>
              <Image
                source={require("@/assets/images/android-icon-foreground.png")}
                contentFit="contain"
                style={styles.brandImage}
              />
              <Text style={styles.eyebrow}>POCKET FIELD GUIDE</Text>
              <View
                accessibilityLabel={`Internet ${connectionLabel.toLowerCase()}`}
                accessibilityRole="text"
                style={styles.connectionStatus}
              >
                <View
                  style={[styles.onlineDot, { backgroundColor: connectionColor }]}
                />
                <Text style={styles.connectionLabel}>
                  {connectionLabel.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.title}>Pokédex</Text>
            <Text style={styles.subtitle}>
              A little closer to every Pokémon.
            </Text>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={19} color={theme.muted} />
              <TextInput
                accessibilityLabel="Search Pokémon"
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={(value) => {
                  setQuery(value);
                  setVisibleCount(PAGE_SIZE);
                }}
                placeholder="Search by name"
                placeholderTextColor={theme.faint}
                returnKeyType="search"
                style={styles.searchInput}
                value={query}
              />
              {query.length > 0 ? (
                <Pressable
                  accessibilityLabel="Clear search"
                  accessibilityRole="button"
                  hitSlop={10}
                  onPress={() => setQuery("")}
                >
                  <Ionicons name="close-circle" size={19} color={theme.faint} />
                </Pressable>
              ) : null}
            </View>
            <View style={styles.resultsRow}>
              <Text style={styles.resultsLabel}>
                {query ? "MATCHING POKÉMON" : "NATIONAL DEX"}
              </Text>
              <Text style={styles.resultsCount}>
                {data ? `${filtered.length.toLocaleString()} found` : "Loading"}
              </Text>
            </View>
            {error && !data ? (
              <ErrorState error={error} onRetry={refresh} />
            ) : null}
            {isLoading && !data ? <LoadingState /> : null}
          </View>
        }
        renderItem={({ item }) => (
          <PokemonCard
            name={item.name}
            id={resourceId(item.url)}
            onPress={() =>
              router.push({
                pathname: "/pokemon/[name]",
                params: { name: item.name },
              })
            }
            style={styles.card}
          />
        )}
        ListEmptyComponent={
          data && !error ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No Pokémon found</Text>
              <Text style={styles.emptyText}>
                Try a different name and search again.
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          data && filtered.length > visibleCount ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => setVisibleCount((count) => count + PAGE_SIZE)}
              style={styles.moreButton}
            >
              <Text style={styles.moreButtonText}>Show more Pokémon</Text>
              <Ionicons name="chevron-down" size={16} color={theme.accent} />
            </Pressable>
          ) : data && filtered.length > 0 ? (
            <Text style={styles.endNote}>You’re all caught up.</Text>
          ) : null
        }
        scrollEventThrottle={16}
        onScroll={({ nativeEvent }) => {
          const shouldShow = nativeEvent.contentOffset.y > 400;
          setShowScrollToTop((visible) =>
            visible === shouldShow ? visible : shouldShow,
          );
        }}
        onEndReached={() => {
          if (filtered.length > visibleCount) {
            setVisibleCount((count) => count + PAGE_SIZE);
          }
        }}
        onEndReachedThreshold={0.4}
      />
      {showScrollToTop ? (
        <Pressable
          accessibilityHint="Returns to the top of the Pokédex list"
          accessibilityLabel="Scroll to top"
          accessibilityRole="button"
          onPress={() =>
            listRef.current?.scrollToOffset({ offset: 0, animated: true })
          }
          style={({ pressed }) => [
            styles.scrollTopButton,
            pressed && styles.scrollTopPressed,
          ]}
        >
          <Ionicons name="arrow-up" size={22} color={theme.onAccent} />
        </Pressable>
      ) : null}
    </SafeAreaView>
  );
}

const createStyles = (theme: PokePalette) =>
  StyleSheet.create({
    screen: { backgroundColor: theme.background, flex: 1 },
    content: { paddingBottom: 28, paddingHorizontal: 20 },
    header: { paddingTop: 14 },
    brandRow: {
      alignItems: "center",
      flexDirection: "row",
      gap: 9,
      marginBottom: 22,
    },
    brandImage: { height: 44, width: 44 },
    eyebrow: {
      color: theme.muted,
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 1.4,
    },
    connectionStatus: {
      alignItems: "center",
      flexDirection: "row",
      gap: 5,
      marginLeft: "auto",
    },
    onlineDot: { borderRadius: 4, height: 7, width: 7 },
    connectionLabel: {
      color: theme.muted,
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 0.5,
    },
    title: {
      color: theme.ink,
      fontSize: 36,
      fontWeight: "900",
      letterSpacing: -1.5,
    },
    subtitle: { color: theme.muted, fontSize: 15, marginTop: 2 },
    searchBox: {
      alignItems: "center",
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderRadius: 16,
      borderWidth: 1,
      flexDirection: "row",
      gap: 10,
      height: 52,
      marginTop: 22,
      paddingHorizontal: 15,
    },
    searchInput: { color: theme.ink, flex: 1, fontSize: 15, height: "100%" },
    resultsRow: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 13,
      marginTop: 25,
    },
    resultsLabel: {
      color: theme.muted,
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 1.1,
    },
    resultsCount: { color: theme.faint, fontSize: 12, fontWeight: "600" },
    row: { justifyContent: "space-between" },
    card: { width: "48.2%" },
    empty: { alignItems: "center", paddingVertical: 46 },
    emptyTitle: { color: theme.ink, fontSize: 17, fontWeight: "800" },
    emptyText: { color: theme.muted, fontSize: 13, marginTop: 7 },
    moreButton: {
      alignItems: "center",
      alignSelf: "center",
      backgroundColor: theme.accentSoft,
      borderRadius: 15,
      flexDirection: "row",
      gap: 8,
      marginTop: 5,
      paddingHorizontal: 18,
      paddingVertical: 13,
    },
    moreButtonText: { color: theme.accent, fontSize: 13, fontWeight: "800" },
    scrollTopButton: {
      alignItems: "center",
      backgroundColor: theme.accent,
      borderRadius: 28,
      bottom: 18,
      elevation: 5,
      height: 52,
      justifyContent: "center",
      position: "absolute",
      right: 20,
      shadowColor: theme.ink,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.22,
      shadowRadius: 7,
      width: 52,
      zIndex: 1,
    },
    scrollTopPressed: { opacity: 0.8 },
    endNote: {
      color: theme.faint,
      fontSize: 12,
      paddingBottom: 8,
      paddingTop: 4,
      textAlign: "center",
    },
  });
