import Image from 'next/image';

type LogoProps = {
  className?: string;
  priority?: boolean;
  width?: number;
  height?: number;
};

export function Logo({ className, priority, width = 240, height = 80 }: LogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="Dash Job Eventos"
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  );
}
