import { Image } from 'expo-image';
import { ReactNode, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { EmptyState } from './Feedback';
import { LoadingState } from './Button';
import { FilterChips } from './FilterChips';
import { ListScrollView } from './Layout';
import { Icon } from './Icon';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export interface PickerItem {
  id: number;
  title: string;
  subtitle: string;
  photoUri: string | null;
  /** Marks an item that is already used and cannot be added again. */
  disabled?: boolean;
  /** Bucket used by the filter row, e.g. the muscle group of an exercise. */
  filterKey?: string;
}

interface ItemPickerListProps {
  items: PickerItem[];
  loading: boolean;
  searchPlaceholder: string;
  emptyTitle: string;
  emptyMessage: string;
  onSelect: (id: number) => void;
  /** Rendered above the list, e.g. an inline "new item" button. */
  header?: ReactNode;
  /** Filter row values, matched against `PickerItem.filterKey`. */
  filters?: readonly string[];
  filterLabel?: string;
  bottomInset?: number;
}

/** Search + list picker shared by the exercise and food pickers. */
export function ItemPickerList({
  items,
  loading,
  searchPlaceholder,
  emptyTitle,
  emptyMessage,
  onSelect,
  header,
  filters,
  filterLabel = 'All',
  bottomInset = spacing.xxl,
}: ItemPickerListProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<string | null>(null);

  const filterOptions = useMemo(
    () => (filters && filters.length > 0 ? [filterLabel, ...filters] : undefined),
    [filters, filterLabel],
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return items.filter((item) => {
      if (filter && item.filterKey !== filter) return false;
      if (!term) return true;
      return (
        item.title.toLowerCase().includes(term) || item.subtitle.toLowerCase().includes(term)
      );
    });
  }, [filter, items, query]);

  return (
    <View style={styles.container}>
      {header ? <View style={styles.header}>{header}</View> : null}

      {filterOptions ? (
        <FilterChips
          options={filterOptions}
          value={filter ?? filterLabel}
          onChange={(option) => setFilter(option === filterLabel ? null : option)}
          style={styles.filterRow}
          accessibilityLabel={filterLabel === 'All' ? 'Filter by group' : `Filter by ${filterLabel}`}
        />
      ) : null}

      <View style={styles.searchContainer}>
        <Icon name="search" size={18} color={colors.textTertiary} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={searchPlaceholder}
          placeholderTextColor={colors.textTertiary}
          style={styles.searchInput}
          selectionColor={colors.silverBright}
          cursorColor={colors.silverBright}
          underlineColorAndroid="transparent"
          autoCorrect={false}
          accessibilityLabel={searchPlaceholder}
        />
        {query ? (
          <Pressable
            onPress={() => setQuery('')}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <Icon name="close" size={18} color={colors.textTertiary} />
          </Pressable>
        ) : null}
      </View>

      {loading ? (
        <LoadingState label="Loading…" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="search"
          title={items.length === 0 ? emptyTitle : 'No matches'}
          message={
            items.length === 0
              ? emptyMessage
              : filter
                ? 'No items in this group. Try another filter or a different search term.'
                : 'Try a different search term.'
          }
        />
      ) : (
        <ListScrollView bottomInset={bottomInset}>
          <View style={styles.list}>
            {filtered.map((item, index) => (
              <Pressable
                key={item.id}
                onPress={() => !item.disabled && onSelect(item.id)}
                disabled={item.disabled}
                accessibilityRole="button"
                accessibilityState={{ disabled: item.disabled }}
                accessibilityLabel={item.title}
                accessibilityHint={item.disabled ? 'Already added to this workout' : 'Select this item'}
                style={({ pressed }) => [
                  styles.row,
                  index < filtered.length - 1 && styles.rowBorder,
                  pressed && styles.rowPressed,
                  item.disabled && styles.rowDisabled,
                ]}
              >
                <View style={styles.thumb}>
                  {item.photoUri ? (
                    <Image
                      source={{ uri: item.photoUri }}
                      style={StyleSheet.absoluteFill}
                      contentFit="cover"
                      transition={150}
                    />
                  ) : (
                    <View style={styles.thumbEmpty}>
                      <Icon name="barbell" size={16} color={colors.textTertiary} />
                    </View>
                  )}
                </View>
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.rowSubtitle} numberOfLines={1}>
                    {item.subtitle}
                  </Text>
                </View>
                {item.disabled ? (
                  <Text style={styles.rowTag}>Added</Text>
                ) : (
                  <Icon name="add-circle" size={22} color={colors.silverMuted} />
                )}
              </Pressable>
            ))}
          </View>
        </ListScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  filterRow: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    margin: 0,
    paddingVertical: spacing.sm,
  },
  list: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 68,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowPressed: {
    backgroundColor: colors.surfaceElevated,
  },
  rowDisabled: {
    opacity: 0.45,
  },
  thumb: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumbEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    ...typography.subheading,
    color: colors.text,
  },
  rowSubtitle: {
    ...typography.bodySmall,
    color: colors.textTertiary,
  },
  rowTag: {
    ...typography.caption,
    color: colors.textTertiary,
  },
});
