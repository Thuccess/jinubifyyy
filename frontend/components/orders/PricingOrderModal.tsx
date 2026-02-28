import React, { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '../icons/Icons';
import { publicOrdersAPI, type CreatePublicOrderPayload, briefsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export interface PricingOrderContext {
  service: string;
  serviceSlug: string;
  packageName: string;
  priceDisplay: string;
  numericPrice: number;
  currency: string;
  pricingCategory: string;
}

interface PricingOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: PricingOrderContext | null;
}

interface FormState {
  name: string;
  phone: string;
  email: string;
  country: string;
  region: string;
  city: string;
  company: string;
  industry: string;
  notes: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

const COUNTRIES = [
  { id: 'south-sudan', label: 'South Sudan' },
  { id: 'uganda', label: 'Uganda' },
  { id: 'kenya', label: 'Kenya' },
  { id: 'ethiopia', label: 'Ethiopia' },
  { id: 'other', label: 'Other' },
];

const REGIONS_BY_COUNTRY: Record<string, string[]> = {
  'south-sudan': [
    'Central Equatoria',
    'Eastern Equatoria',
    'Western Equatoria',
    'Jonglei',
    'Lakes',
    'Northern Bahr el Ghazal',
    'Western Bahr el Ghazal',
    'Warrap',
    'Unity',
    'Upper Nile',
  ],
  uganda: [
    'Central Region',
    'Eastern Region',
    'Northern Region',
    'Western Region',
  ],
  kenya: [
    'Central',
    'Coast',
    'Eastern',
    'Nairobi',
    'North Eastern',
    'Nyanza',
    'Rift Valley',
    'Western',
  ],
  ethiopia: [
    'Afar',
    'Amhara',
    'Benishangul-Gumuz',
    'Gambela',
    'Harari',
    'Oromia',
    'Sidama',
    'Somali',
    'South West Ethiopia Peoples',
    'Southern Nations, Nationalities, and Peoples’ Region (SNNP)',
    'Tigray',
    'Addis Ababa',
    'Dire Dawa',
  ],
};

const INDUSTRIES = [
  'Retail / E‑commerce',
  'Supermarkets & Grocery',
  'Restaurants & Cafes',
  'Bars, Clubs & Lounges',
  'Hotels, Lodges & Guest Houses',
  'Travel & Tourism',
  'Transportation & Logistics',
  'Professional Services (Law, Accounting, Consulting)',
  'Health & Medical Clinics',
  'Pharmacies & Health Stores',
  'Real Estate & Property',
  'Construction & Engineering',
  'Education & Training',
  'NGO / Non‑profit / Community Organisation',
  'Churches & Faith‑based Organisations',
  'Technology & SaaS',
  'Telecom & Internet Providers',
  'Media, PR & Communications',
  'Marketing & Advertising Agencies',
  'Fashion & Clothing Brands',
  'Beauty, Cosmetics & Salons',
  'Photography & Creative Studios',
  'Events, Conferences & Weddings',
  'Sports & Fitness (Gyms, Clubs)',
  'Agriculture & Agribusiness',
  'Manufacturing & Production',
  'Printing & Branding',
  'Government & Public Sector',
  'Freelancers, Creators & Influencers',
  'Other',
];

export const PricingOrderModal: React.FC<PricingOrderModalProps> = ({ isOpen, onClose, context }) => {
  const [form, setForm] = useState<FormState>({
    name: '',
    phone: '',
    email: '',
    country: '',
    region: '',
    city: '',
    company: '',
    industry: '',
    notes: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [industrySearch, setIndustrySearch] = useState('');
  const [briefs, setBriefs] = useState<Array<{ _id: string; title: string }>>([]);
  const [selectedBriefId, setSelectedBriefId] = useState<string>('');
  const { currentUser } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setErrors({});
      setServerError(null);
      setSuccessMessage(null);
      setSelectedBriefId('');

      if (currentUser && context) {
        briefsAPI
          .getBriefs({ serviceSlug: context.serviceSlug })
          .then((data) => {
            const items = (data.briefs || []).map((b: any) => ({
              _id: b._id,
              title: b.title as string,
            }));
            setBriefs(items);
          })
          .catch((err) => {
            console.error('Failed to load briefs for order modal', err);
          });
      } else {
        setBriefs([]);
      }
    }
  }, [isOpen]);

  if (!context) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Reset region when country changes
    if (name === 'country') {
      const countryId = value;
      const countryDef = COUNTRIES.find((c) => c.label === countryId || c.id === countryId);
      const countryValue = countryDef ? countryDef.label : value;
      setForm((prev) => ({
        ...prev,
        country: countryValue,
        region: '',
      }));
      setErrors((prev) => ({ ...prev, country: '' }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Full name is required';
    if (!form.phone.trim()) nextErrors.phone = 'Phone number is required';
    if (!form.email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = 'Enter a valid email address';
    }
    if (!form.country.trim()) nextErrors.country = 'Country is required';

    if (!context.service.trim()) {
      setServerError('Missing service information for this package. Please contact support.');
      return false;
    }
    if (!context.packageName.trim()) {
      setServerError('Missing package name. Please contact support.');
      return false;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;

    try {
      setSubmitting(true);
      const now = new Date().toISOString();
      const payload: CreatePublicOrderPayload = {
        customer: {
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          country: form.country.trim(),
          city: form.city.trim(),
          company: form.company.trim(),
          industry: form.industry.trim(),
          notes: form.notes.trim(),
        },
        order: {
          service: context.service,
          serviceSlug: context.serviceSlug,
          packageName: context.packageName,
          price: context.numericPrice,
          currency: context.currency,
          pricingCategory: context.pricingCategory,
          sourcePage: 'pricing',
          status: 'pending',
          orderTimestamp: now,
          // Optional linkage to a saved brief (for logged-in users)
          // @ts-expect-error - briefId is an optional backend field not surfaced in the TS type yet
          briefId: selectedBriefId || undefined,
        },
      };

      await publicOrdersAPI.create(payload);
      setSuccessMessage('Your order has been submitted. We will contact you shortly.');
      setForm({
        name: '',
        phone: '',
        email: '',
        country: '',
        region: '',
        city: '',
        company: '',
        industry: '',
        notes: '',
      });
    } catch (err: any) {
      const data = err?.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        const nextErrors: FormErrors = { ...errors };
        data.errors.forEach((e: { field?: string; message?: string }) => {
          const key = e.field || '';
          const msg = e.message || 'Invalid value';
          if (key.startsWith('customer.') && key.split('.').length === 2) {
            const fieldName = key.split('.')[1] as keyof FormState;
            nextErrors[fieldName] = msg;
          }
        });
        setErrors(nextErrors);
        setServerError(data.message || 'Please fix the errors below.');
      } else {
        setServerError(data?.message || 'Failed to submit order. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const closeAndReset = () => {
    setForm({
      name: '',
      phone: '',
      email: '',
      country: '',
      region: '',
      city: '',
      company: '',
      industry: '',
      notes: '',
    });
    setErrors({});
    setServerError(null);
    setSuccessMessage(null);
    onClose();
  };

  const normalizedCountryId =
    (COUNTRIES.find((c) => c.label === form.country)?.id as string) || '';
  const availableRegions = REGIONS_BY_COUNTRY[normalizedCountryId];
  const filteredIndustries = INDUSTRIES.filter((ind) =>
    ind.toLowerCase().includes(industrySearch.toLowerCase())
  );

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-40" onClose={closeAndReset}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden glass-surface glass-surface--modal glass-interactive p-6 text-left align-middle transition-all">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-text-primary">
                      Order: {context.packageName}
                    </Dialog.Title>
                    <p className="mt-1 text-xs text-text-secondary">
                      {context.service} • {context.priceDisplay} • {context.currency}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeAndReset}
                    className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-muted/90 transition-colors duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)] transition-colors"
                    aria-label="Close"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {successMessage ? (
                  <div className="space-y-4">
                    <p className="text-sm text-text-primary">{successMessage}</p>
                    <button
                      type="button"
                      onClick={closeAndReset}
                      className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-brand-primary text-text-inverted hover:opacity-90 transition-opacity duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {serverError && (
                      <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/40 rounded-lg px-3 py-2">
                        {serverError}
                      </p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1" htmlFor="name">
                          Full Name *
                        </label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          value={form.name}
                          onChange={handleChange}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-border-subtle bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-ring)]"
                          required
                        />
                        {errors.name && <p className="mt-1 text-[11px] text-red-500">{errors.name}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1" htmlFor="phone">
                          Phone Number *
                        </label>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={form.phone}
                          onChange={handleChange}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-border-subtle bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-ring)]"
                          required
                        />
                        {errors.phone && <p className="mt-1 text-[11px] text-red-500">{errors.phone}</p>}
                      </div>
                    </div>

                    {currentUser && briefs.length > 0 && (
                      <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1" htmlFor="brief">
                          Attach a saved brief (optional)
                        </label>
                        <select
                          id="brief"
                          name="brief"
                          value={selectedBriefId}
                          onChange={(e) => setSelectedBriefId(e.target.value)}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-border-subtle bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-ring)]"
                        >
                          <option value="">No brief attached</option>
                          {briefs.map((b) => (
                            <option key={b._id} value={b._id}>
                              {b.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1" htmlFor="email">
                        Email *
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-border-subtle bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-ring)]"
                        required
                      />
                      {errors.email && <p className="mt-1 text-[11px] text-red-500">{errors.email}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1" htmlFor="country">
                          Country *
                        </label>
                        <select
                          id="country"
                          name="country"
                          value={form.country}
                          onChange={handleChange}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-border-subtle bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-ring)]"
                          required
                        >
                          <option value="">Select country</option>
                          {COUNTRIES.map((c) => (
                            <option key={c.id} value={c.label}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                        {errors.country && <p className="mt-1 text-[11px] text-red-500">{errors.country}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1" htmlFor="region">
                          State / Region
                        </label>
                        {form.country && REGIONS_BY_COUNTRY[
                          (COUNTRIES.find((c) => c.label === form.country)?.id as string) || ''
                        ] ? (
                          <select
                            id="region"
                            name="region"
                            value={form.region}
                            onChange={handleChange}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-border-subtle bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-ring)]"
                          >
                            <option value="">Select state / region</option>
                            {REGIONS_BY_COUNTRY[
                              (COUNTRIES.find((c) => c.label === form.country)?.id as string) || ''
                            ]?.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            id="region"
                            name="region"
                            type="text"
                            value={form.region}
                            onChange={handleChange}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-border-subtle bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-ring)]"
                            placeholder="Region / State"
                          />
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1" htmlFor="city">
                        City / District
                      </label>
                      <input
                        id="city"
                        name="city"
                        type="text"
                        value={form.city}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-border-subtle bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-ring)]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1" htmlFor="company">
                          Business / Company Name
                        </label>
                        <input
                          id="company"
                          name="company"
                          type="text"
                          value={form.company}
                          onChange={handleChange}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-border-subtle bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-ring)]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1" htmlFor="industry">
                          Industry
                        </label>
                        <div className="space-y-1">
                          <input
                            type="text"
                            placeholder="Search industry..."
                            value={industrySearch}
                            onChange={(e) => setIndustrySearch(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs rounded-lg border border-border-subtle bg-surface-card text-text-primary focus:outline-none focus:ring-1 focus:ring-[color:var(--accent-ring)]"
                          />
                          <select
                            id="industry"
                            name="industry"
                            value={form.industry}
                            onChange={handleChange}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-border-subtle bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-ring)]"
                          >
                            <option value="">Select industry</option>
                            {filteredIndustries.map((ind) => (
                              <option key={ind} value={ind}>
                                {ind}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1" htmlFor="notes">
                        Additional Information
                      </label>
                      <textarea
                        id="notes"
                        name="notes"
                        value={form.notes}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-border-subtle bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-ring)]"
                        placeholder="Share any goals, context, or links that will help us understand your needs."
                      />
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
                      <p className="text-[11px] text-text-muted">
                        By submitting, you agree to be contacted about this order.
                      </p>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-brand-primary text-text-inverted hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
                      >
                        {submitting ? 'Submitting…' : 'Submit Order'}
                      </button>
                    </div>
                  </form>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default PricingOrderModal;

