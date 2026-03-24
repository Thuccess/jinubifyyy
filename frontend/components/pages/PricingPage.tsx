 'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import AnimatedSection from '../AnimatedSection';
import { 
    ChatBubbleLeftRightIcon,
    MegaphoneIcon,
    PaintBrushIcon,
    CodeBracketIcon,
    DevicePhoneMobileIcon,
    ServerStackIcon,
    CpuChipIcon,
    DocumentTextIcon,
    CheckIcon,
    ArrowRightIcon
} from '../icons/Icons';
import { usePricingPackages } from '../../hooks/useServices';
import PricingOrderModal, { type PricingOrderContext } from '../orders/PricingOrderModal';
import { SkeletonCard } from '../ui/skeleton';
// --- CMS-driven pricing data ---

interface Package {
    name: string;
    price: string;
    features: string[];
    isPopular?: boolean;
    description?: string;
    ctaText?: string;
    serviceTitle: string;
    serviceSlug: string;
    pricingCategory: string;
}

interface PricingCategory {
    emoji: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    packages: Package[];
}

// Map service slugs to display emoji & icon; pricing data itself comes from the API.
const categoryVisuals: Record<string, { emoji: string; icon: React.ReactNode }> = {
    'social-media-management': {
        emoji: '💬',
        icon: <ChatBubbleLeftRightIcon className="h-8 w-8 text-text-secondary" />,
    },
    'digital-marketing': {
        emoji: '🔹',
        icon: <MegaphoneIcon className="h-8 w-8 text-blue-300" />,
    },
    'graphic-design-branding': {
        emoji: '🎨',
        icon: <PaintBrushIcon className="h-8 w-8 text-text-secondary" />,
    },
    'website-design-development': {
        emoji: '🌐',
        icon: <CodeBracketIcon className="h-8 w-8 text-blue-300" />,
    },
    'mobile-app-development': {
        emoji: '📱',
        icon: <DevicePhoneMobileIcon className="h-8 w-8 text-text-secondary" />,
    },
    'software-development': {
        emoji: '💻',
        icon: <CpuChipIcon className="h-8 w-8 text-text-secondary" />,
    },
    'cloud-hosting': {
        emoji: '☁️',
        icon: <ServerStackIcon className="h-8 w-8 text-text-secondary" />,
    },
    'printing-services': {
        emoji: '🖨️',
        icon: <DocumentTextIcon className="h-8 w-8 text-text-secondary" />,
    },
};

// --- Subcomponents ---

const PageHeader: React.FC = () => (
    <header className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Service Packages & Pricing</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl max-w-2xl">
                Flexible and Affordable Solutions
            </h1>
            <p className="mt-5 text-base text-text-secondary leading-relaxed max-w-xl sm:text-lg">
                Flexible packages for startups, SMEs, NGOs, and growing organizations. Prices below are starting estimates in USD; final pricing depends on project scope and requirements.
            </p>
        </div>
    </header>
);

interface PackageCardProps extends Package {
    onOrderNow: (ctx: PricingOrderContext) => void;
}

const parsePriceToNumber = (price: string): number => {
    const cleaned = price.replace(/[^0-9.,]/g, '').replace(',', '.');
    const parsed = parseFloat(cleaned);
    if (Number.isNaN(parsed)) return 0;
    return parsed;
};

const inferCurrency = (price: string): string => {
    if (price.includes('$')) return 'USD';
    if (price.includes('€')) return 'EUR';
    if (price.toLowerCase().includes('ssp')) return 'SSP';
    return 'USD';
};

const PackageCard: React.FC<PackageCardProps> = ({
    name,
    price,
    description,
    features,
    ctaText,
    isPopular,
    serviceTitle,
    serviceSlug,
    pricingCategory,
    onOrderNow,
}) => {
    const router = useRouter();
    const currency = inferCurrency(price);
    return (
        <div className={`relative flex flex-col p-6 sm:p-8 rounded-lg border bg-[color:var(--surface-card)] ${
            isPopular ? 'border-brand-primary' : 'border-border-subtle'
        }`}>
            {isPopular && (
                <span className="absolute top-0 left-0 right-0 text-center -translate-y-1/2">
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold text-text-inverted bg-brand-primary">Most Popular</span>
                </span>
            )}
            <h3 className="text-lg font-semibold text-text-primary">{name}</h3>
            {description ? <p className="mt-2 text-sm text-text-secondary flex-grow">{description}</p> : null}
            <div className="mt-5">
                <span className="text-2xl font-bold text-text-primary">{price}</span>
                {price.includes('/') && <span className="text-sm font-medium text-text-muted"> / month</span>}
            </div>
            <ul className="mt-6 space-y-3 text-text-secondary">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckIcon className="w-4 h-4 text-brand-primary flex-shrink-0 mt-0.5" aria-hidden />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
            <div className="mt-8 pt-6 border-t border-border-subtle flex flex-col gap-3">
                <button
                    type="button"
                    onClick={() =>
                        onOrderNow({
                            service: serviceTitle || 'Custom Service',
                            serviceSlug: serviceSlug || 'custom-service',
                            packageName: name,
                            priceDisplay: price,
                            numericPrice: parsePriceToNumber(price),
                            currency,
                            pricingCategory,
                        })
                    }
                    className={`w-full px-4 py-2.5 text-sm font-semibold rounded-md min-h-[44px] ${
                        isPopular
                            ? 'text-text-inverted bg-brand-primary hover:opacity-90'
                            : 'text-brand-primary bg-brand-soft hover:bg-surface-muted/90'
                    }`}
                >
                    Order Now!
                </button>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => router.push('/demos')}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-brand-primary bg-brand-soft hover:bg-surface-muted/90 rounded-md min-h-[40px]"
                    >
                        View Demo <ArrowRightIcon className="h-4 w-4" aria-hidden />
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push('/contact')}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-text-secondary hover:text-brand-primary rounded-md min-h-[40px]"
                    >
                        Contact for Quote
                    </button>
                </div>
            </div>
        </div>
    );
};

const PricingCategorySection: React.FC<
  PricingCategory & { onOrderNow: (ctx: PricingOrderContext) => void }
> = ({ emoji, title, description, icon, packages, onOrderNow }) => (
    <div className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <div className="flex items-center justify-center mb-4">
                        <div className="flex items-center justify-center h-16 w-16 rounded-xl bg-brand-primary shadow-lg">
                            {icon}
                        </div>
                        <span className="ml-4 text-4xl">{emoji}</span>
                    </div>
                    <h2 className="text-3xl font-extrabold text-text-primary sm:text-4xl mt-4">
                        {title}
                    </h2>
                    <p className="mt-4 text-lg text-text-secondary">
                        {description}
                    </p>
                </div>

                <div className={`grid grid-cols-1 gap-8 ${
                    packages.length === 2 
                        ? 'md:grid-cols-2 max-w-4xl mx-auto' 
                        : packages.length === 3
                        ? 'md:grid-cols-2 lg:grid-cols-3'
                        : 'md:grid-cols-2 lg:grid-cols-3'
                }`}>
                    {packages.map((pkg) => (
                        <PackageCard key={pkg.name} {...pkg} onOrderNow={onOrderNow} />
                    ))}
                </div>
            </AnimatedSection>
        </div>
    </div>
);

const FreeConsultationSection: React.FC = () => {
    const router = useRouter();
    return (
        <section className="py-16 sm:py-20 lg:py-24 bg-[color:var(--bg-secondary)]" aria-labelledby="free-consultation-heading">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <AnimatedSection>
                    <div className="rounded-lg bg-brand-primary p-8 sm:p-10">
                        <h2 id="free-consultation-heading" className="text-2xl font-bold text-[color:var(--text-inverted)] sm:text-3xl">
                            Free Consultation
                        </h2>
                        <p className="mt-4 text-[color:var(--text-inverted)]/85 max-w-xl text-base leading-relaxed">
                            Not sure which package fits? Contact us for a free consultation. We'll help you choose based on your goals, timeline, and budget.
                        </p>
                        <button
                            onClick={() => router.push('/contact')}
                            className="mt-8 inline-flex items-center px-5 py-2.5 text-sm font-semibold text-brand-primary bg-[color:var(--text-inverted)] hover:opacity-90 rounded-md"
                        >
                            Get Free Consultation
                        </button>
                    </div>
                </AnimatedSection>
            </div>
        </section>
    );
};

// --- Main Pricing Page Component ---

const PricingPage: React.FC = () => {
    const { data, isLoading, isError } = usePricingPackages({ active: true });
    const packages = (data?.data || []) as any[];
    const [orderContext, setOrderContext] = useState<PricingOrderContext | null>(null);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

    const categories: PricingCategory[] = useMemo(() => {
        const map = new Map<string, PricingCategory>();

        for (const pkg of packages) {
            const svc = pkg.service || {};
            const slug: string = svc.slug || 'uncategorized';
            const key = slug || svc._id || 'uncategorized';
            if (!map.has(key)) {
                const visuals = categoryVisuals[slug] || {
                    emoji: '💼',
                    icon: <DocumentTextIcon className="h-8 w-8 text-text-secondary" />,
                };
                map.set(key, {
                    emoji: visuals.emoji,
                    title: svc.title ? `${svc.title} Packages` : 'Other Packages',
                    description: svc.intro || svc.shortDescription || svc.description || '',
                    icon: visuals.icon,
                    packages: [],
                });
            }
            const cat = map.get(key)!;
            cat.packages.push({
                name: pkg.name,
                price: pkg.price,
                features: pkg.features || [],
                isPopular: !!pkg.isFeatured,
                description: pkg.description || '',
                ctaText: pkg.ctaText || 'Order Now!',
                serviceTitle: svc.title || '',
                serviceSlug: svc.slug || '',
                pricingCategory: slug || 'pricing',
            });
        }

        // Preserve insertion order; no extra sorting yet
        return Array.from(map.values());
    }, [packages]);

    return (
        <div className="animate-fade-in">
            <PageHeader />
            
            {/* Pricing Categories (CMS-driven) */}
            {isLoading ? (
                <section className="py-16 sm:py-20 lg:py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in-up">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <SkeletonCard key={i} />
                            ))}
                        </div>
                    </div>
                </section>
            ) : isError ? (
                <section className="py-16 sm:py-20 lg:py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-text-secondary">
                        <p>Unable to load pricing at the moment. Please try again later.</p>
                    </div>
                </section>
            ) : categories.length === 0 ? (
                <section className="py-16 sm:py-20 lg:py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-text-secondary">
                        <p>No pricing packages have been configured yet. Please check back soon.</p>
                    </div>
                </section>
            ) : (
                categories.map((category) => (
                    <div key={category.title}>
                        <PricingCategorySection
                          {...category}
                          onOrderNow={(ctx) => {
                            setOrderContext(ctx);
                            setIsOrderModalOpen(true);
                          }}
                        />
                    </div>
                ))
            )}

            {/* Free Consultation Section */}
            <FreeConsultationSection />

            <PricingOrderModal
              isOpen={isOrderModalOpen}
              onClose={() => setIsOrderModalOpen(false)}
              context={orderContext}
            />

            <section className="py-16 sm:py-20 lg:py-24" aria-labelledby="pricing-why-heading">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <AnimatedSection>
                        <h2 id="pricing-why-heading" className="text-xl font-bold text-text-primary sm:text-2xl">
                            Why Choose Jinubify?
                        </h2>
                        <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl">
                            {['Affordable and flexible pricing', 'Professional and reliable service', 'One team for digital, design, and print', 'Solutions tailored to your business goals', 'Support for startups, SMEs, and NGOs'].map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-text-secondary">
                                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[color:var(--surface-muted)] flex items-center justify-center mt-0.5 text-brand-primary text-xs font-bold">✓</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </AnimatedSection>
                </div>
            </section>

        </div>
    );
};

export default PricingPage;
