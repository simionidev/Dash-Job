import { Image, ImageProps } from 'react-native';

import { BRAND } from '../../../../packages/shared/constants/brand';

const logoSource = require('../../../assets/logo.png');

type BrandLogoProps = Omit<ImageProps, 'source'> & {
  size?: 'sm' | 'md' | 'lg';
};

const sizes = {
  sm: { width: 120, height: 40 },
  md: { width: 180, height: 60 },
  lg: { width: 240, height: 80 },
} as const;

export function BrandLogo({ size = 'md', style, ...props }: BrandLogoProps) {
  const dimensions = sizes[size];

  return (
    <Image
      source={logoSource}
      accessibilityLabel={BRAND.fullName}
      resizeMode="contain"
      style={[dimensions, style]}
      {...props}
    />
  );
}
