import { Image } from "expo-image";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { usePokeStyles, type PokePalette } from "@/constants/poke-theme";
import { formatName, pokemonArtwork } from "@/lib/pokeapi";

export function PokemonCard({
  name,
  id,
  onPress,
  style,
}: {
  name: string;
  id: number;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const styles = usePokeStyles(createStyles);
  const displayName = formatName(name);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View ${displayName}, number ${id}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, style, pressed && styles.pressed]}
    >
      <View style={styles.artwork}>
        <Text style={styles.number}>#{String(id).padStart(3, "0")}</Text>
        <Image
          source={pokemonArtwork(id)}
          contentFit="contain"
          style={styles.image}
          transition={150}
        />
      </View>
      <Text numberOfLines={1} style={styles.name}>
        {displayName}
      </Text>
      <Text style={styles.caption}>Pokémon</Text>
    </Pressable>
  );
}

const createStyles = (theme: PokePalette) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderRadius: 20,
      borderWidth: 1,
      marginBottom: 12,
      padding: 12,
    },
    pressed: { opacity: 0.82, transform: [{ scale: 0.985 }] },
    artwork: {
      alignItems: "center",
      backgroundColor: theme.background,
      borderRadius: 15,
      height: 128,
      justifyContent: "center",
      marginBottom: 12,
      overflow: "hidden",
      position: "relative",
    },
    number: {
      color: theme.faint,
      fontSize: 11,
      fontWeight: "700",
      position: "absolute",
      right: 10,
      top: 9,
    },
    image: { height: 110, width: "90%" },
    name: {
      color: theme.ink,
      fontSize: 15,
      fontWeight: "800",
    },
    caption: { color: theme.muted, fontSize: 11, marginTop: 3 },
  });
