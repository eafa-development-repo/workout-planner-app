import { ReactNode } from 'react';
import {
  ScrollView,
  ScrollViewProps,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

interface ScreenProps {
  children: ReactNode;
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
}

/** Root background container. */
export function Screen({ children, edges = ['top'], style }: ScreenProps) {
  return (
    <SafeAreaView edges={edges} style={[styles.screen, style]}>
      {children}
    </SafeAreaView>
  );
}

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  /** Rendered on the right of the title, e.g. an edit action. */
  action?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** Large title header used by the three bottom tabs. */
export function AppHeader({ title, subtitle, action, style }: AppHeaderProps) {
  return (
    <View style={[styles.header, style]}>
      <View style={styles.headerText}>
        <Text style={styles.headerTitle} numberOfLines={1} accessibilityRole="header">
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {action ? <View style={styles.headerAction}>{action}</View> : null}
    </View>
  );
}

/** Consistent page padding and vertical rhythm. */
export function ScreenContent({
  children,
  style,
  gap = spacing.xl,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  gap?: number;
}) {
  return <View style={[styles.content, { gap }, style]}>{children}</View>;
}

interface ScrollableContentProps extends Omit<ScrollViewProps, 'children'> {
  children: ReactNode;
  /** Extra bottom padding so a FAB never covers the last row. */
  bottomInset?: number;
  gap?: number;
}

/** Scrollable body with the standard page padding, used by lists and forms. */
export function ScrollableContent({
  children,
  bottomInset = spacing.xxl,
  gap = spacing.lg,
  contentContainerStyle,
  ...rest
}: ScrollableContentProps) {
  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[
        styles.scrollContent,
        { gap, paddingBottom: bottomInset },
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      {...rest}
    >
      {children}
    </ScrollView>
  );
}

/** Scrollable list body used by the tab list sections. */
export function ListScrollView({
  children,
  bottomInset = 96,
  horizontal = true,
  contentStyle,
  ...rest
}: {
  children: ReactNode;
  bottomInset?: number;
  horizontal?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
} & Omit<ScrollViewProps, 'children' | 'contentContainerStyle'>) {
  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[
        styles.listContent,
        horizontal && styles.listContentHorizontal,
        { paddingBottom: bottomInset },
        contentStyle,
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      {...rest}
    >
      {children}
    </ScrollView>
  );
}

/** Small uppercase hint that explains a form section. */
export function FormHint({ children }: { children: ReactNode }) {
  return <Text style={styles.hint}>{children}</Text>;
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.xl,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  listContent: {
    paddingTop: spacing.xs,
  },
  listContentHorizontal: {
    paddingHorizontal: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  headerTitle: {
    ...typography.display,
    color: colors.text,
  },
  headerSubtitle: {
    ...typography.bodySmall,
    color: colors.textTertiary,
  },
  headerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  hint: {
    ...typography.caption,
    color: colors.textTertiary,
  },
});
