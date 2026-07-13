import Image from 'next/image';

import { BRAND, BRAND_LOGO_PATH } from '../../../../../packages/shared/constants/brand';

type LogoProps = {
  className?: string;
  priority?: boolean;
};

export function Logo({ className, priority }: LogoProps) {
  return (
    <Image
      src={BRAND_LOGO_PATH.web}
      alt={BRAND.fullName}
      width={240}
      height={80}
      className={className}
      priority={priority}
    />
  );
}
