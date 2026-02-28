import React from 'react';
import clsx from 'clsx';

type CardVariant = 'default' | 'subtle' | 'emphasis' | 'danger';
type CardSize = 'sm' | 'md' | 'lg';
type CardHover = 'lift' | 'glow' | 'none';

type AsProp = keyof JSX.IntrinsicElements;

interface BaseCardProps {
  variant?: CardVariant;
  size?: CardSize;
  hover?: CardHover;
  as?: AsProp;
  className?: string;
}

type PolymorphicProps<T extends AsProp> = BaseCardProps &
  Omit<JSX.IntrinsicElements[T], keyof BaseCardProps>;

function getVariantClasses(variant: CardVariant): string {
  switch (variant) {
    case 'subtle':
      return 'border-border-subtle bg-surface-card/80';
    case 'emphasis':
      return 'border-border-accent bg-surface-muted';
    case 'danger':
      return 'border-border-strong bg-surface-card';
    case 'default':
    default:
      return 'border-border-subtle';
  }
}

function getSizeClasses(size: CardSize): string {
  switch (size) {
    case 'sm':
      return 'p-4 sm:p-5 gap-3';
    case 'lg':
      return 'p-6 sm:p-8 gap-5';
    case 'md':
    default:
      return 'p-5 sm:p-6 gap-4';
  }
}

function getHoverClasses(hover: CardHover): string {
  switch (hover) {
    case 'glow':
      return 'hover:-translate-y-1 hover:shadow-xl hover:shadow-[0_0_30px_color-mix(in_oklab,var(--accent-soft)_0.6,var(--bg-primary))]';
    case 'none':
      return '';
    case 'lift':
    default:
      return 'hover:-translate-y-1 hover:shadow-lg';
  }
}

export function Card<T extends AsProp = 'div'>(
  props: PolymorphicProps<T>,
) {
  const {
    variant = 'default',
    size = 'md',
    hover = 'lift',
    as,
    className,
    children,
    ...rest
  } = props;

  const Component: any = as || 'div';

  return (
    <Component
      className={clsx(
        'glass-surface glass-surface--card glass-interactive rounded-2xl flex flex-col transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bg-primary)]',
        getVariantClasses(variant),
        getSizeClasses(size),
        getHoverClasses(hover),
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}

interface CardSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

function CardHeader({ className, ...rest }: CardSectionProps) {
  return (
    <div
      className={clsx(
        'flex items-start justify-between gap-3',
        className,
      )}
      {...rest}
    />
  );
}

function CardBody({ className, ...rest }: CardSectionProps) {
  return (
    <div
      className={clsx('flex flex-col gap-3 flex-1', className)}
      {...rest}
    />
  );
}

function CardFooter({ className, ...rest }: CardSectionProps) {
  return (
    <div
      className={clsx(
        'pt-4 mt-4 border-t border-border-subtle flex items-center justify-between gap-3',
        className,
      )}
      {...rest}
    />
  );
}

interface EyebrowProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string;
}

function CardEyebrow({ className, ...rest }: EyebrowProps) {
  return (
    <p
      className={clsx(
        'text-xs font-semibold uppercase tracking-[0.16em] text-text-muted',
        className,
      )}
      {...rest}
    />
  );
}

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: 'default' | 'emphasis';
}

function CardBadge({ tone = 'default', className, ...rest }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide',
        tone === 'emphasis'
          ? 'bg-brand-primary text-text-inverted'
          : 'bg-surface-muted text-text-secondary border border-border-subtle',
        className,
      )}
      {...rest}
    />
  );
}

interface IconProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

function CardIcon({ size = 'md', className, children, ...rest }: IconProps) {
  const sizeClasses =
    size === 'sm'
      ? 'h-10 w-10'
      : size === 'lg'
      ? 'h-16 w-16'
      : 'h-12 w-12';

  return (
    <div
      className={clsx(
        'inline-flex items-center justify-center rounded-xl bg-brand-soft text-brand-primary shadow-md',
        sizeClasses,
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

interface StatsRowProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

function CardStatsRow({ className, ...rest }: StatsRowProps) {
  return (
    <div
      className={clsx(
        'flex items-baseline justify-between gap-3',
        className,
      )}
      {...rest}
    />
  );
}

interface StatValueProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string;
}

function CardStatValue({ className, ...rest }: StatValueProps) {
  return (
    <p
      className={clsx(
        'text-3xl sm:text-4xl font-extrabold text-text-primary',
        className,
      )}
      {...rest}
    />
  );
}

interface StatLabelProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string;
}

function CardStatLabel({ className, ...rest }: StatLabelProps) {
  return (
    <p
      className={clsx(
        'text-xs font-medium uppercase tracking-[0.16em] text-text-muted',
        className,
      )}
      {...rest}
    />
  );
}

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
Card.Eyebrow = CardEyebrow;
Card.Badge = CardBadge;
Card.Icon = CardIcon;
Card.StatsRow = CardStatsRow;
Card.StatValue = CardStatValue;
Card.StatLabel = CardStatLabel;

export default Card;

