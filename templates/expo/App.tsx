import { useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme, type AppTheme } from './src/theme';

export default function App() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [count, setCount] = useState(0);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>__APP_NAME__</Text>
        <Text style={styles.body}>ここから作り始めましょう。</Text>
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={() => setCount((c) => c + 1)}
        >
          <Text style={styles.buttonText}>押した回数: {count}</Text>
        </Pressable>
      </View>
      <StatusBar style={theme.scheme === 'dark' ? 'light' : 'dark'} />
    </View>
  );
}

// 見た目はここに集約し、値はすべて theme (デザイントークン) から取る。
const createStyles = (t: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: t.space.md,
      backgroundColor: t.color.bg,
    },
    card: {
      width: '100%',
      maxWidth: 420,
      alignItems: 'center',
      padding: t.space.xl,
      borderWidth: 1,
      borderColor: t.color.border,
      borderRadius: t.radius.lg,
      backgroundColor: t.color.surface,
    },
    title: {
      color: t.color.text,
      fontSize: t.font.size.xl,
      fontWeight: t.font.weight.bold as '700',
    },
    body: {
      marginTop: t.space.sm,
      color: t.color.textMuted,
      fontSize: t.font.size.md,
    },
    button: {
      marginTop: t.space.lg,
      paddingVertical: t.space.sm,
      paddingHorizontal: t.space.lg,
      borderRadius: t.radius.full,
      backgroundColor: t.color.primary,
    },
    buttonPressed: {
      backgroundColor: t.color.primaryHover,
    },
    buttonText: {
      color: t.color.onPrimary,
      fontSize: t.font.size.md,
      fontWeight: t.font.weight.bold as '700',
    },
  });
