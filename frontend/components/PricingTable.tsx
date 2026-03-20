import React from 'react';
import { CheckIcon } from './icons/Icons';
import { usePricingPackages } from '../hooks/useServices';
import Card from './ui/Card';
import SkeletonBlock from './skeletons/SkeletonBlock';
import SkeletonText from './skeletons/SkeletonText';

const PricingTable: React.FC = () => {
  const { data, isLoading, isError } = usePricingPackages({ active: true });
  const packages = data?.data || [];

  return (
    <div className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold text-text-primary sm:text-4xl">
            Flexible Plans for Every Need
          </h2>
          <p className="mt-4 text-lg text-text-secondary">
            Choose the perfect plan to accelerate your growth. All plans come with a 14-day money-back guarantee.
          </p>
        </div>

        <div className="mt-16">
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="relative" size="lg" variant="default" hover="none">
                  <SkeletonBlock className="h-6 w-40" rounded="full" />
                  <SkeletonText className="mt-4" lines={2} />
                  <div className="mt-6">
                    <SkeletonBlock className="h-10 w-28" rounded="full" />
                  </div>
                  <div className="mt-8 space-y-4">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <div key={j} className="flex items-start gap-3">
                        <SkeletonBlock className="h-5 w-5" rounded="full" />
                        <SkeletonBlock className="h-3 w-full" rounded="full" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto pt-8">
                    <SkeletonBlock className="h-11 w-full" rounded="lg" />
                  </div>
                </Card>
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-12 text-text-secondary">
              Failed to load pricing. Please try again later.
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-12 text-text-secondary">
              No pricing packages are currently available.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
              {packages.slice(0, 3).map((pkg: any) => (
                <Card
                  key={pkg._id}
                  className="relative"
                  size="lg"
                  variant={pkg.isFeatured ? 'emphasis' : 'default'}
                  hover="lift"
                >
                  {pkg.isFeatured && (
                    <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                      <Card.Badge tone="emphasis">Most Popular</Card.Badge>
                    </div>
                  )}

                  <h3 className="text-xl font-semibold text-text-primary">
                    {pkg.name}
                  </h3>
                  <p className="mt-4 text-text-secondary flex-grow">
                    {pkg.service?.title
                      ? `Package for ${pkg.service.title}`
                      : 'Service package'}
                  </p>

                  <div className="mt-6">
                    <span className="text-4xl font-extrabold text-text-primary">
                      {pkg.price}
                    </span>
                  </div>

                  <ul className="mt-8 space-y-4 text-text-secondary">
                    {(pkg.features || []).map((feature: string) => (
                      <li key={feature} className="flex items-start">
                        <CheckIcon className="w-5 h-5 text-brand-primary mr-3 flex-shrink-0 mt-1" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-8">
                    <button
                      type="button"
                      className="btn-primary w-full text-center block"
                    >
                      Contact for this package
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PricingTable;
