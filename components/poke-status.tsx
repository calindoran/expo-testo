import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  usePokeStyles,
  usePokeTheme,
  type PokePalette,
} from "@/constants/poke-theme";

export function LoadingState({
  label = "Loading the Pokédex…",
}: {
  label?: string;
}) {
  const theme = usePokeTheme();
  const styles = usePokeStyles(createStyles);
  return (
    <View accessibilityRole="progressbar" style={styles.container}>
      <ActivityIndicator color={theme.accent} size="large" />
      <Text style={styles.body}>{label}</Text>
    </View>
  );
}

export function ErrorState({
  error,
  onRetry,
}: {
  error: Error;
  onRetry: () => void;
}) {
  const styles = usePokeStyles(createStyles);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Couldn’t load this right now</Text>
      <Text style={styles.body}>{error.message}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={onRetry}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Try again</Text>
      </Pressable>
    </View>
  );
}

const createStyles = (theme: PokePalette) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      gap: 12,
      justifyContent: "center",
      padding: 28,
    },
    title: {
      color: theme.ink,
      fontSize: 17,
      fontWeight: "800",
      textAlign: "center",
    },
    body: {
      color: theme.muted,
      fontSize: 14,
      lineHeight: 20,
      textAlign: "center",
    },
    button: {
      backgroundColor: theme.accent,
      borderRadius: 14,
      marginTop: 4,
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    buttonText: { color: theme.onAccent, fontSize: 14, fontWeight: "700" },
  });
