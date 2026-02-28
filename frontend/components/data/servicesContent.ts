export type ServiceContentItem = {
  title: string;
  intro: string;
  bulletsLabel: string;
  bullets: string[];
  slug: string;
  hasDemo: boolean;
};

export const servicesContent: ServiceContentItem[] = [
  {
    title: 'Social Media Management',
    intro: 'We manage your social media so you can focus on running your business. Jinubify helps you build a strong, professional presence on platforms your customers use every day. We don\'t just post—we create content that attracts attention, builds trust, and drives engagement.',
    bulletsLabel: 'What you get:',
    bullets: [
      'Facebook & Instagram page management',
      'Content creation (posts, captions & visuals)',
      'Posting schedules & consistency',
      'Audience engagement & page optimization',
      'Performance tracking & insights',
    ],
    slug: 'social-media-management',
    hasDemo: true,
  },
  {
    title: 'Digital Marketing',
    intro: 'Turn online attention into real customers. Our digital marketing services are designed to increase visibility, drive traffic, and generate leads. We use data-driven strategies tailored to your business goals and market.',
    bulletsLabel: 'Our solutions include:',
    bullets: [
      'Online advertising (Facebook & Google Ads)',
      'Search Engine Optimization (SEO)',
      'Marketing strategy & campaign planning',
      'Lead generation & conversion optimization',
      'Analytics & performance reporting',
    ],
    slug: 'digital-marketing',
    hasDemo: true,
  },
  {
    title: 'Graphic Design & Branding',
    intro: 'Make a powerful first impression. We design visuals that communicate trust, professionalism, and brand identity. From logos to marketing materials, we ensure your brand stands out and stays consistent everywhere.',
    bulletsLabel: 'Design services:',
    bullets: [
      'Logo design',
      'Brand identity (colors, fonts & guidelines)',
      'Flyers, posters & banners',
      'Social media graphics',
      'Company profiles & presentations',
    ],
    slug: 'graphic-design-branding',
    hasDemo: true,
  },
  {
    title: 'Website Design & Development',
    intro: 'Websites that work for your business. We build fast, mobile-friendly, and secure websites that showcase your brand and help convert visitors into customers.',
    bulletsLabel: 'Website solutions:',
    bullets: [
      'Business & corporate websites',
      'NGO & organization websites',
      'Landing pages for promotions',
      'Simple e-commerce websites',
      'Website maintenance & updates',
    ],
    slug: 'website-design-development',
    hasDemo: true,
  },
  {
    title: 'Mobile App Development',
    intro: 'Bring your ideas to your customers\' pockets. We develop practical, user-friendly mobile applications that help businesses improve service delivery and customer engagement.',
    bulletsLabel: 'Mobile app services:',
    bullets: [
      'Android app development',
      'Cross-platform mobile apps',
      'App updates & maintenance',
      'Scalable, future-ready solutions',
    ],
    slug: 'mobile-app-development',
    hasDemo: true,
  },
  {
    title: 'Software Development',
    intro: 'Custom software built around your business needs. We create tailored software solutions that help you automate processes, manage data, and work more efficiently.',
    bulletsLabel: 'Custom solutions include:',
    bullets: [
      'Business management systems',
      'Inventory & POS systems',
      'School & NGO management systems',
      'Booking & service management systems',
      'Custom web applications',
    ],
    slug: 'software-development',
    hasDemo: false,
  },
  {
    title: 'Cloud & Hosting Services',
    intro: 'Reliable technology that keeps your business online. We help you set up and manage cloud and hosting solutions that are secure, scalable, and easy to maintain.',
    bulletsLabel: 'Cloud & IT services:',
    bullets: [
      'Website hosting setup',
      'Domain registration support',
      'Cloud storage solutions',
      'Email & workspace setup',
      'Basic security & backups',
    ],
    slug: 'cloud-hosting',
    hasDemo: true,
  },
  {
    title: 'Printing Services',
    intro: 'Professional printing that supports your brand offline. We provide high-quality printing services to help you promote your business, events, and campaigns with confidence.',
    bulletsLabel: 'Printing solutions:',
    bullets: [
      'Business cards',
      'Flyers & posters',
      'Banners (indoor & outdoor)',
      'Brochures & company profiles',
      'Branded merchandise (T-shirts, caps, stickers)',
    ],
    slug: 'printing-services',
    hasDemo: false,
  },
];
