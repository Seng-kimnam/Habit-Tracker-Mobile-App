import { StyleSheet } from 'react-native';
import type { ImageStyle, StyleProp } from 'react-native';

export type LazyImageProps = {
  source: number;
  alt: string;
  width: number;
  height: number;
  style?: StyleProp<ImageStyle>;
};

export function LazyImage({ source, alt, width, height, style }: LazyImageProps) {
  const uri = (source as unknown as { uri?: string }).uri ?? '';

  return (
    <img
      src={uri}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      style={{ height: 'auto', ...StyleSheet.flatten(style) } as never}
    />
  );
}