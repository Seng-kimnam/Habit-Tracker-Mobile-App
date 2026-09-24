import { Image } from 'expo-image';
import type { ImageStyle, StyleProp } from 'react-native';

export type LazyImageProps = {
  source: number;
  alt: string;
  width: number;
  height: number;
  style?: StyleProp<ImageStyle>;
};

export function LazyImage({ source, alt, style }: LazyImageProps) {
  return <Image source={source} alt={alt} style={style} />;
}