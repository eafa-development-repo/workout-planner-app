import Ionicons from '@expo/vector-icons/Ionicons';
import { ComponentProps } from 'react';

export type IconName = ComponentProps<typeof Ionicons>['name'];

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

/** Single icon entry point so the icon set stays consistent across the app. */
export function Icon({ name, size = 20, color }: IconProps) {
  return <Ionicons name={name} size={size} color={color} />;
}
