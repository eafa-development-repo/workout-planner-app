import { Image } from 'expo-image';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { pickImageFromDevice } from '../utils/imageStorage';
import { Icon } from './Icon';

interface PhotoFieldProps {
  label: string;
  value: string | null;
  onChange: (uri: string | null) => void;
  error?: string | null;
  helper?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Optional photo input. The chosen image is copied into the app's own
 * directory immediately, so it stays available with no network access.
 */
export function PhotoField({
  label,
  value,
  onChange,
  error: errorProp,
  helper,
  size = 108,
  style,
  testID,
}: PhotoFieldProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePick = async () => {
    setBusy(true);
    setError(null);
    try {
      const picked = await pickImageFromDevice();
      if (picked) onChange(picked.uri);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'The image could not be loaded. Please try another photo.',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.field, style]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <Pressable
          testID={testID}
          onPress={handlePick}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel={value ? 'Change photo' : 'Add photo from device'}
          style={({ pressed }) => [
            styles.preview,
            { width: size, height: size, borderRadius: radius.lg },
            errorProp ? styles.previewError : null,
            pressed && styles.pressed,
          ]}
        >
          {value ? (
            <Image
              source={{ uri: value }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={150}
            />
          ) : (
            <View style={styles.previewPlaceholder}>
              <Icon name="images-outline" size={24} color={colors.textTertiary} />
            </View>
          )}
          {busy ? (
            <View style={styles.busyOverlay}>
              <ActivityIndicator color={colors.text} />
            </View>
          ) : null}
        </Pressable>

        <View style={styles.actions}>
          <Pressable
            onPress={handlePick}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel="Choose photo from gallery"
            style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]}
          >
            <Icon name="images-outline" size={18} color={colors.silver} />
            <Text style={styles.actionText}>{value ? 'Replace photo' : 'Choose photo'}</Text>
          </Pressable>
          {value ? (
            <Pressable
              onPress={() => onChange(null)}
              disabled={busy}
              accessibilityRole="button"
              accessibilityLabel="Remove photo"
              style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]}
            >
              <Icon name="trash-outline" size={18} color={colors.danger} />
              <Text style={[styles.actionText, styles.actionTextDanger]}>Remove photo</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      {error ? (
        <Text style={styles.errorText} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : errorProp ? (
        <Text style={styles.errorText} accessibilityLiveRegion="polite">
          {errorProp}
        </Text>
      ) : helper ? (
        <Text style={styles.helperText}>{helper}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.sm,
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  preview: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewError: {
    borderColor: colors.danger,
  },
  previewPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  busyOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10,10,12,0.6)',
  },
  actions: {
    flex: 1,
    gap: spacing.xs,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
  },
  actionText: {
    ...typography.subheading,
    fontSize: 14,
    color: colors.text,
  },
  actionTextDanger: {
    color: colors.danger,
  },
  pressed: {
    opacity: 0.75,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
  },
  helperText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
});
