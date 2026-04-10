import React from 'react';
import SocialMediaVisual from './SocialMediaVisual';
import DigitalMarketingVisual from './DigitalMarketingVisual';
import GraphicDesignVisual from './GraphicDesignVisual';
import MobileAppsVisual from './MobileAppsVisual';
import SoftwareVisual from './SoftwareVisual';
import CloudHostingVisual from './CloudHostingVisual';
import PrintingVisual from './PrintingVisual';
import type { DemoVisualProps } from './types';

export type DemoVisualComponent = React.FC<DemoVisualProps>;

export const visualDemoBySlug: Record<string, DemoVisualComponent> = {
  'social-media-management': SocialMediaVisual,
  'digital-marketing': DigitalMarketingVisual,
  'graphic-design-branding': GraphicDesignVisual,
  'mobile-app-development': MobileAppsVisual,
  'software-development': SoftwareVisual,
  'cloud-hosting': CloudHostingVisual,
  'printing-services': PrintingVisual,
};

export { default as SocialMediaVisual } from './SocialMediaVisual';
export { default as DigitalMarketingVisual } from './DigitalMarketingVisual';
export { default as GraphicDesignVisual } from './GraphicDesignVisual';
export { default as MobileAppsVisual } from './MobileAppsVisual';
export { default as SoftwareVisual } from './SoftwareVisual';
export { default as CloudHostingVisual } from './CloudHostingVisual';
export { default as PrintingVisual } from './PrintingVisual';
