export type DemoStep = { title: string; description: string };

export type DemoPageContent = {
  serviceName: string;
  valueStatement: string;
  steps: DemoStep[];
  features: string[];
  benefits: string[];
  whoFor: string[];
  startingPrice: string;
  offerings: string[];
  offeringDescriptions?: string[];
};

const slugs = [
  'social-media-management',
  'digital-marketing',
  'graphic-design-branding',
  'website-design-development',
  'mobile-app-development',
  'software-development',
  'cloud-hosting',
  'printing-services',
] as const;

export type DemoSlug = (typeof slugs)[number];

export const demoPageContentBySlug: Record<string, DemoPageContent> = {
  'social-media-management': {
    serviceName: 'Social Media Management',
    valueStatement:
      'See how Jinubify helps businesses grow with professional Social Media Management.',
    steps: [
      { title: 'Business & audience analysis', description: 'We understand your brand, goals, and target audience to shape the right strategy.' },
      { title: 'Content planning & strategy', description: 'A clear content calendar and themes that align with your business objectives.' },
      { title: 'Design & content creation', description: 'Professional posts, captions, and visuals that attract and engage.' },
      { title: 'Posting & engagement', description: 'Consistent publishing and community responses so your presence stays active.' },
      { title: 'Performance tracking & improvement', description: 'Regular insights and tweaks to grow reach and engagement over time.' },
    ],
    features: [
      'Scheduled content posting',
      'Community engagement & responses',
      'Page optimization',
      'Performance analytics & reports',
      'Multi-platform management (Facebook, Instagram)',
    ],
    benefits: [
      'Consistent online presence without extra effort',
      'Stronger connection with your audience',
      'Better visibility and discoverability',
      'Data-driven decisions from monthly reports',
      'One team handling all your social channels',
    ],
    whoFor: ['Small & medium businesses', 'Startups', 'NGOs & organizations', 'Growing brands'],
    startingPrice: 'Starting from $120',
    offerings: [
      'Facebook page management',
      'Instagram page management',
      'WhatsApp Business setup',
      'Content planning & scheduling',
      'Post design & captions',
      'Social media posters & flyers',
      'Audience engagement',
      'Page optimization',
      'Performance analytics',
      'Social media captions & copywriting',
    ],
    offeringDescriptions: [
      'We create, schedule, and manage your Facebook Business page and posts so your brand stays active and professional.',
      'We handle your Instagram profile, feed, and Stories to grow reach and engagement.',
      'We set up and manage WhatsApp Business so you can connect with customers via chat.',
      'We build a content calendar and schedule posts so your presence stays consistent.',
      'We design posts and write captions that attract and engage your audience.',
      'We create posters and flyers tailored for social media and promotions.',
      'We respond to comments and messages and run engagement activities.',
      'We optimize your page setup, bio, and content for better reach and conversions.',
      'We track reach, engagement, and growth and report insights so you see what works.',
      'We write social media copy and captions that match your brand voice.',
    ],
  },
  'digital-marketing': {
    serviceName: 'Digital Marketing',
    valueStatement:
      'See how Jinubify turns online attention into real customers with data-driven Digital Marketing.',
    steps: [
      { title: 'Goals & audience research', description: 'We define your targets and understand where your customers are online.' },
      { title: 'Strategy & channel selection', description: 'A clear plan across SEO, ads, and content tailored to your budget.' },
      { title: 'Campaign setup & creative', description: 'Ads and landing pages designed to capture leads and traffic.' },
      { title: 'Launch & optimization', description: 'Ongoing tweaks to improve CTR, leads, and cost per result.' },
      { title: 'Reporting & insights', description: 'Regular reports so you see what works and what to scale.' },
    ],
    features: [
      'SEO optimization',
      'Facebook & Google Ads management',
      'Email & content marketing',
      'Campaign planning & execution',
      'Analytics & performance reporting',
    ],
    benefits: [
      'More visibility and qualified traffic',
      'Measurable leads and conversions',
      'Efficient spend with data-driven optimization',
      'Clear view of ROI and performance',
      'Strategy that scales with your business',
    ],
    whoFor: ['Small & medium businesses', 'Startups', 'NGOs & organizations', 'Growing brands'],
    startingPrice: 'Starting from $250',
    offerings: [
      'Facebook Ads',
      'Google Ads',
      'Lead generation campaigns',
      'Marketing strategy planning',
      'Conversion optimization',
      'Analytics & reporting',
    ],
  },
  'graphic-design-branding': {
    serviceName: 'Graphic Design & Branding',
    valueStatement:
      'See how Jinubify builds a powerful first impression with professional Graphic Design & Branding.',
    steps: [
      { title: 'Brand discovery', description: 'We capture your vision, values, and market to shape the brand direction.' },
      { title: 'Concept & direction', description: 'Mood boards and concepts that align with your identity.' },
      { title: 'Logo & identity design', description: 'Logo, colors, fonts, and guidelines that work across all touchpoints.' },
      { title: 'Application & assets', description: 'Social graphics, flyers, business cards, and other materials.' },
      { title: 'Delivery & guidelines', description: 'Final files and a simple guide so your brand stays consistent.' },
    ],
    features: [
      'Logo design',
      'Brand identity (colors, fonts & guidelines)',
      'Flyers, posters & banners',
      'Social media graphics',
      'Company profiles & presentations',
    ],
    benefits: [
      'A professional, memorable brand',
      'Consistent look everywhere',
      'Materials that build trust',
      'Ready-to-use templates for your team',
      'A strong foundation for future marketing',
    ],
    whoFor: ['Small & medium businesses', 'Startups', 'NGOs & organizations', 'Growing brands'],
    startingPrice: 'Starting from $80',
    offerings: [
      'Logo design',
      'Brand identity design (colors, fonts & guidelines)',
      'Brand guidelines',
      'Brand messaging support',
      'Social media graphics',
      'Flyers & posters',
      'Banners & signage',
      'Business cards',
      'Brochures & company profiles',
      'Company profiles & presentations',
      'Image editing & design',
      'Branded merchandise design',
    ],
    offeringDescriptions: [
      'We design a distinctive logo that represents your brand and works across all touchpoints.',
      'We define your brand colors, typography, and visual guidelines for consistency.',
      'We create a brand guide so your team and partners use your brand correctly.',
      'We craft messaging and taglines that communicate your brand clearly.',
      'We design graphics for social media that match your brand and drive engagement.',
      'We create flyers and posters for events, promotions, and campaigns.',
      'We design banners and signage for indoor and outdoor use.',
      'We design business cards that make a strong first impression.',
      'We create brochures and company profiles that showcase your business.',
      'We design company profiles and presentations for pitches and proposals.',
      'We edit and retouch images and create visuals for your marketing.',
      'We design branded merchandise (apparel, mugs, etc.) that promotes your brand.',
    ],
  },
  'website-design-development': {
    serviceName: 'Website Design & Development',
    valueStatement:
      'See how Jinubify builds websites that work for your business and convert visitors into customers.',
    steps: [
      { title: 'Discovery & structure', description: 'We define goals, pages, and content structure for your site.' },
      { title: 'Design & approval', description: 'Mockups and layouts so you see the look and flow before build.' },
      { title: 'Development', description: 'Fast, mobile-friendly, and secure build with forms and integrations.' },
      { title: 'Content & SEO', description: 'Copy and basic SEO so your site is findable and clear.' },
      { title: 'Launch & maintenance', description: 'Go live and optional updates so your site stays current.' },
    ],
    features: [
      'Business & corporate websites',
      'NGO & organization websites',
      'Landing pages for promotions',
      'Simple e-commerce websites',
      'Website maintenance & updates',
    ],
    benefits: [
      'A professional online presence 24/7',
      'Mobile-friendly experience for all visitors',
      'Clear path from visitor to lead or customer',
      'Fast, secure, and easy to update',
      'Foundation for SEO and future growth',
    ],
    whoFor: ['Small & medium businesses', 'Startups', 'NGOs & organizations', 'Growing brands'],
    startingPrice: 'Starting from $250',
    offerings: [
      'Business websites',
      'Corporate websites',
      'NGO & organization websites',
      'Landing pages for promotions',
      'Simple e-commerce websites',
      'Mobile-friendly / responsive design',
      'Website maintenance & updates',
      'Website optimization (performance & SEO)',
      'Contact forms & integrations (WhatsApp, email)',
    ],
  },
  'mobile-app-development': {
    serviceName: 'Mobile App Development',
    valueStatement:
      'See how Jinubify brings your ideas to your customers\' pockets with practical, user-friendly mobile apps.',
    steps: [
      { title: 'Discovery & scope', description: 'We define features, users, and platforms (Android, iOS, or both).' },
      { title: 'Design & flow', description: 'Screens and user flows so the app is intuitive and on-brand.' },
      { title: 'Development', description: 'Native or cross-platform build with quality and performance in mind.' },
      { title: 'Testing & refinement', description: 'Testing and fixes so the app is stable before launch.' },
      { title: 'Launch & support', description: 'Publish to stores and optional updates and maintenance.' },
    ],
    features: [
      'Android app development',
      'Cross-platform mobile apps (Android & iOS)',
      'App updates & maintenance',
      'Scalable, future-ready solutions',
    ],
    benefits: [
      'Direct channel to your customers',
      'Better service delivery and engagement',
      'Professional, reliable app experience',
      'Option to grow features over time',
    ],
    whoFor: ['Small & medium businesses', 'Startups', 'NGOs & organizations', 'Service-based businesses'],
    startingPrice: 'From $1,200',
    offerings: [
      'Android app development',
      'iOS app development',
      'Cross-platform apps',
      'App UI/UX design',
      'App updates & maintenance',
      'App performance optimization',
    ],
  },
  'software-development': {
    serviceName: 'Software Development',
    valueStatement:
      'See how Jinubify builds custom software that automates processes and helps you work more efficiently.',
    steps: [
      { title: 'Requirements & workflow', description: 'We map your processes and define what the system must do.' },
      { title: 'Architecture & design', description: 'System design and modules that fit your workflow and scale.' },
      { title: 'Development', description: 'Build of dashboards, workflows, and integrations.' },
      { title: 'Testing & training', description: 'Quality checks and training so your team can use it confidently.' },
      { title: 'Launch & support', description: 'Deployment and ongoing maintenance or enhancements.' },
    ],
    features: [
      'Business management systems',
      'Inventory & POS systems',
      'School & NGO management systems',
      'Booking & service management systems',
      'Custom web applications',
    ],
    benefits: [
      'Streamlined operations and less manual work',
      'Centralized data and reporting',
      'Solutions tailored to your workflow',
      'Scalable systems that grow with you',
      'Ongoing support when you need it',
    ],
    whoFor: ['Small & medium businesses', 'Startups', 'NGOs & organizations', 'Schools & institutions'],
    startingPrice: 'From $800',
    offerings: [
      'Custom web applications',
      'Business management systems',
      'Inventory & POS systems',
      'School management systems',
      'NGO management & data/reporting systems',
      'Booking & service management systems',
      'System integrations & admin panels',
      'Custom admin dashboards / reporting tools',
    ],
  },
  'cloud-hosting': {
    serviceName: 'Cloud & Hosting Services',
    valueStatement:
      'See how Jinubify keeps your business online with reliable cloud and hosting solutions.',
    steps: [
      { title: 'Assessment & needs', description: 'We identify what you need: hosting, domain, email, or storage.' },
      { title: 'Setup & configuration', description: 'Professional setup with SSL, security, and best practices.' },
      { title: 'Migration (if needed)', description: 'Smooth move of sites or data with minimal downtime.' },
      { title: 'Documentation & handover', description: 'Clear notes and access so you or your team can manage it.' },
      { title: 'Ongoing support', description: 'Help with updates, backups, and troubleshooting when needed.' },
    ],
    features: [
      'Website hosting setup',
      'Domain registration support',
      'Cloud storage solutions',
      'Email & workspace setup',
      'Basic security & backups',
    ],
    benefits: [
      'Reliable uptime so your business is always reachable',
      'Secure setup with SSL and good practices',
      'One place for hosting, domain, and email',
      'Peace of mind with backups and support',
      'Scalable as your traffic and needs grow',
    ],
    whoFor: ['Small & medium businesses', 'Startups', 'NGOs & organizations', 'Growing brands'],
    startingPrice: 'From $50',
    offerings: [
      'Website hosting setup',
      'Domain registration support',
      'Cloud storage setup',
      'Email hosting & workspace setup (Google Workspace)',
      'Server configuration',
      'Data backup solutions',
      'Basic security setup (backups, HTTPS, basic hardening)',
    ],
  },
  'printing-services': {
    serviceName: 'Printing Services',
    valueStatement:
      'See how Jinubify supports your brand offline with professional printing for business, events, and campaigns.',
    steps: [
      { title: 'Brief & specs', description: 'We confirm what you need: quantity, size, finish, and timeline.' },
      { title: 'Design or artwork check', description: 'We use your files or help prepare print-ready artwork.' },
      { title: 'Proof & approval', description: 'You approve a proof before we go to print.' },
      { title: 'Production', description: 'High-quality printing with care for consistency and durability.' },
      { title: 'Delivery or pickup', description: 'Finished products delivered or ready for pickup.' },
    ],
    features: [
      'Business cards',
      'Flyers & posters',
      'Banners (indoor & outdoor)',
      'Brochures & company profiles',
      'Branded merchandise (T-shirts, caps, stickers)',
    ],
    benefits: [
      'Professional materials that build trust',
      'Consistent branding in print',
      'Options for events and campaigns at scale',
      'Quality that represents your brand well',
      'One team for design and print',
    ],
    whoFor: ['Small & medium businesses', 'Startups', 'NGOs & organizations', 'Events & campaigns'],
    startingPrice: 'From $30',
    offerings: [
      'Business cards',
      'Flyers',
      'Posters',
      'Banners (indoor & outdoor)',
      'Brochures',
      'Stickers & labels',
      'Branded merchandise (T-shirts, mugs, caps)',
      'Event & promotional materials',
    ],
  },
};

export function getDemoPageContent(slug: string | undefined): DemoPageContent | null {
  if (!slug) return null;
  return demoPageContentBySlug[slug] ?? null;
}
