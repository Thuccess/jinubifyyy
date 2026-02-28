import React from 'react';
import clsx from 'clsx';

type IconSize = 'sm' | 'md' | 'lg';
type IconTone = 'muted' | 'primary' | 'brand' | 'inverted';

export interface IconWrapperProps {
  /**
   * The underlying SVG icon component. It must accept a `className` prop.
   */
  icon: React.ComponentType<{ className?: string }>;
  size?: IconSize;
  tone?: IconTone;
  className?: string;
  ariaLabel?: string;
}

function getSizeClasses(size: IconSize): string {
  switch (size) {
    case 'sm':
      return 'h-4 w-4';
    case 'lg':
      return 'h-8 w-8';
    case 'md':
    default:
      return 'h-6 w-6';
  }
}

function getToneClasses(tone: IconTone): string {
  switch (tone) {
    case 'primary':
      return 'text-text-primary';
    case 'brand':
      return 'text-brand-primary';
    case 'inverted':
      return 'text-text-inverted';
    case 'muted':
    default:
      return 'text-text-secondary';
  }
}

export const Icon: React.FC<IconWrapperProps> = ({
  icon: IconComponent,
  size = 'md',
  tone = 'muted',
  className,
  ariaLabel,
}) => {
  const iconClasses = clsx(getSizeClasses(size), getToneClasses(tone), className);

  const accessibilityProps = ariaLabel
    ? { role: 'img', 'aria-label': ariaLabel }
    : { 'aria-hidden': 'true' as const };

  return <IconComponent className={iconClasses} {...accessibilityProps} />;
};

export default Icon;

