import type { CSSProperties } from 'react';

export function Skeleton(props: { className?: string; rounded?: string; style?: CSSProperties }): JSX.Element;
export function SkeletonAvatar(props: { size?: number; className?: string }): JSX.Element;
export function SkeletonText(props: { lines?: number; className?: string }): JSX.Element;
export function SkeletonCard(props: { className?: string }): JSX.Element;

