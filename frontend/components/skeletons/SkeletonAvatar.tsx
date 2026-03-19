'use client';

import React from 'react';
import SkeletonBlock from './SkeletonBlock';

export default function SkeletonAvatar({ size = 40 }: { size?: number }) {
  return <SkeletonBlock rounded="full" style={{ width: size, height: size }} />;
}

