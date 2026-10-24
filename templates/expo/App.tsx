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
      padding: t.space[4],
      backgroundColor: t.color.background,
    },
    card: {
      width: '100%',
      maxWidth: 420,
      alignItems: 'center',
      padding: t.component.card.padding,
      borderWidth: 1,
      borderColor: t.component.card.border,
      borderRadius: t.component.card.radius,
      backgroundColor: t.component.card.bg,
      ...t.shadow.card,
    },
    title: {
      color: t.color.text,
      fontSize: t.fontSize.xl,
      fontWeight: t.fontWeight.bold as '700',
    },
    body: {
      marginTop: t.space[2],
      color: t.color.textMuted,
      fontSize: t.fontSize.md,
    },
    button: {
      minHeight: t.component.button.minHeight,
      justifyContent: 'center',
      marginTop: t.space[6],
      paddingVertical: t.component.button.paddingY,
      paddingHorizontal: t.component.button.paddingX,
      borderRadius: t.component.button.radius,
      backgroundColor: t.component.button.bg,
    },
    buttonPressed: {
      backgroundColor: t.component.button.bgPressed,
    },
    buttonText: {
      color: t.component.button.text,
      fontSize: t.fontSize.md,
      fontWeight: t.fontWeight.bold as '700',
    },
  });
