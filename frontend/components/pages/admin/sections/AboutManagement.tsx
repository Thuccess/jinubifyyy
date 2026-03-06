import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../../../services/api';
import type { AboutPagePayload } from '../../../../services/api';
import { useNotification } from '../../../admin/useNotification';
import { ImageUrlWithUpload } from '../../../ui/ImageUrlWithUpload';
import { DeleteIcon, ChevronDownIcon, ChevronUpIcon } from '../../../icons/Icons';

const inputBase =
  'w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-subtle bg-[color:var(--surface-card)] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-ring)]';
const labelBase = 'block text-sm font-medium text-text-primary mb-1.5';

const ICON_KEYS = ['CogIcon', 'LightBulbIcon', 'HandshakeIcon', 'SparklesIcon', 'HeartIcon', 'StarIcon'] as const;

const defaultAbout: AboutPagePayload = {
  hero: {
    eyebrow: 'About',
    heading: 'Pioneering Digital Excellence',
    subtitle: 'We are a passionate team dedicated to building innovative solutions that empower businesses and individuals in an ever-evolving digital world.',
    primaryCtaText: 'Our Services',
    primaryCtaLink: '/services',
    secondaryCtaText: 'Contact Us',
    secondaryCtaLink: '/contact',
  },
  ourStory: {
    heading: 'Our Story: From a Simple Idea to a Digital Powerhouse',
    imageUrl: 'https://picsum.photos/seed/office/600/400',
    paragraph1: 'Founded in 2024, Jinubify was born from a desire to bridge the gap between technology and user experience.',
    paragraph2: "Our team of developers, designers, and strategists works collaboratively to bring cutting-edge ideas to life.",
  },
  stats: {
    heading: 'By The Numbers',
    subtext: 'Our track record speaks for itself.',
    items: [
      { value: 150, label: 'Projects Completed' },
      { value: 95, label: 'Happy Clients (%)' },
      { value: 10, label: 'Years of Experience' },
      { value: 8, label: 'Team Members' },
    ],
  },
  whyJinubify: {
    heading: 'Why Jinubify',
    intro: 'We blend expertise with a passion for innovation and the principles that guide our work.',
    tagline: 'Expertise, innovation, and accountability.',
    differentiators: [
      { iconKey: 'CogIcon', title: 'Proven Expertise', description: 'Our team brings years of industry experience.' },
      { iconKey: 'LightBulbIcon', title: 'Technical Innovation', description: 'We leverage cutting-edge technology.' },
      { iconKey: 'HandshakeIcon', title: 'Client-Centric Focus', description: 'Your success is our ultimate metric.' },
    ],
    coreValues: [
      { iconKey: 'SparklesIcon', title: 'Accountable to members', description: 'We deliver on our promises.' },
      { iconKey: 'HeartIcon', title: 'Customer-centricity', description: 'Our clients are our partners.' },
      { iconKey: 'StarIcon', title: 'Empowering local SMEs', description: 'We help small businesses grow.' },
    ],
  },
};

const AboutManagement: React.FC = () => {
  const { showNotification, NotificationComponent } = useNotification();
  const [data, setData] = useState<AboutPagePayload>(defaultAbout);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openSection, setOpenSection] = useState<string>('hero');

  const fetchAbout = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getAbout();
      setData({
        hero: res.hero ?? defaultAbout.hero,
        ourStory: res.ourStory ?? defaultAbout.ourStory,
        stats: res.stats ?? defaultAbout.stats,
        whyJinubify: res.whyJinubify ?? defaultAbout.whyJinubify,
      });
    } catch {
      setData(defaultAbout);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbout();
  }, []);

  const update = (section: keyof AboutPagePayload, payload: Record<string, unknown>) => {
    setData((prev) => ({
      ...prev,
      [section]: { ...(prev[section] as object), ...payload },
    }));
  };

  const updateHero = (key: string, value: string) => {
    setData((prev) => ({
      ...prev,
      hero: { ...prev.hero!, [key]: value },
    }));
  };

  const updateOurStory = (key: string, value: string) => {
    setData((prev) => ({
      ...prev,
      ourStory: { ...prev.ourStory!, [key]: value },
    }));
  };

  const updateStats = (key: string, value: string | { value: number; label: string }[]) => {
    setData((prev) => ({
      ...prev,
      stats: { ...prev.stats!, [key]: value },
    }));
  };

  const setStatItem = (index: number, field: 'value' | 'label', value: number | string) => {
    setData((prev) => {
      const items = [...(prev.stats?.items || [])];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, stats: { ...prev.stats!, items } };
    });
  };

  const addStat = () => {
    setData((prev) => ({
      ...prev,
      stats: {
        ...prev.stats!,
        items: [...(prev.stats?.items || []), { value: 0, label: '' }],
      },
    }));
  };

  const removeStat = (index: number) => {
    setData((prev) => ({
      ...prev,
      stats: {
        ...prev.stats!,
        items: (prev.stats?.items || []).filter((_, i) => i !== index),
      },
    }));
  };

  const setDifferentiator = (index: number, field: string, value: string) => {
    setData((prev) => {
      const list = [...(prev.whyJinubify?.differentiators || [])];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, whyJinubify: { ...prev.whyJinubify!, differentiators: list } };
    });
  };

  const addDifferentiator = () => {
    setData((prev) => ({
      ...prev,
      whyJinubify: {
        ...prev.whyJinubify!,
        differentiators: [...(prev.whyJinubify?.differentiators || []), { iconKey: 'CogIcon', title: '', description: '' }],
      },
    }));
  };

  const removeDifferentiator = (index: number) => {
    setData((prev) => ({
      ...prev,
      whyJinubify: {
        ...prev.whyJinubify!,
        differentiators: (prev.whyJinubify?.differentiators || []).filter((_, i) => i !== index),
      },
    }));
  };

  const setCoreValue = (index: number, field: string, value: string) => {
    setData((prev) => {
      const list = [...(prev.whyJinubify?.coreValues || [])];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, whyJinubify: { ...prev.whyJinubify!, coreValues: list } };
    });
  };

  const addCoreValue = () => {
    setData((prev) => ({
      ...prev,
      whyJinubify: {
        ...prev.whyJinubify!,
        coreValues: [...(prev.whyJinubify?.coreValues || []), { iconKey: 'StarIcon', title: '', description: '' }],
      },
    }));
  };

  const removeCoreValue = (index: number) => {
    setData((prev) => ({
      ...prev,
      whyJinubify: {
        ...prev.whyJinubify!,
        coreValues: (prev.whyJinubify?.coreValues || []).filter((_, i) => i !== index),
      },
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await adminAPI.updateAbout(data);
      showNotification('About page saved', 'success');
    } catch (err: unknown) {
      showNotification((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  const Section: React.FC<{ id: string; title: string; children: React.ReactNode }> = ({ id, title, children }) => (
    <div className="border border-border-subtle rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpenSection((s) => (s === id ? '' : id))}
        className="w-full flex items-center justify-between px-5 py-4 bg-[color:var(--surface-muted)]/60 text-left font-semibold text-text-primary"
      >
        {title}
        {openSection === id ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
      </button>
      {openSection === id && <div className="p-5 space-y-4">{children}</div>}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-9 w-9 rounded-full border-2 border-border-subtle border-t-text-primary animate-spin" />
      </div>
    );
  }

  return (
    <>
      <NotificationComponent />
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Site content</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">About Page</h1>
            <p className="mt-1 text-sm text-text-secondary max-w-xl">
              Edit the content shown on the public About page. Changes are saved in one step.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-text-primary text-text-inverted font-medium text-sm shadow-sm hover:opacity-90 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save all changes'}
          </button>
        </div>

        <div className="space-y-4">
          <Section id="hero" title="Hero section">
            <div className="grid gap-4">
              <div><label className={labelBase}>Eyebrow</label><input type="text" value={data.hero?.eyebrow || ''} onChange={(e) => updateHero('eyebrow', e.target.value)} className={inputBase} /></div>
              <div><label className={labelBase}>Heading</label><input type="text" value={data.hero?.heading || ''} onChange={(e) => updateHero('heading', e.target.value)} className={inputBase} /></div>
              <div><label className={labelBase}>Subtitle</label><textarea value={data.hero?.subtitle || ''} onChange={(e) => updateHero('subtitle', e.target.value)} className={inputBase} rows={3} /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className={labelBase}>Primary CTA text</label><input type="text" value={data.hero?.primaryCtaText || ''} onChange={(e) => updateHero('primaryCtaText', e.target.value)} className={inputBase} /></div>
                <div><label className={labelBase}>Primary CTA link</label><input type="text" value={data.hero?.primaryCtaLink || ''} onChange={(e) => updateHero('primaryCtaLink', e.target.value)} className={inputBase} /></div>
                <div><label className={labelBase}>Secondary CTA text</label><input type="text" value={data.hero?.secondaryCtaText || ''} onChange={(e) => updateHero('secondaryCtaText', e.target.value)} className={inputBase} /></div>
                <div><label className={labelBase}>Secondary CTA link</label><input type="text" value={data.hero?.secondaryCtaLink || ''} onChange={(e) => updateHero('secondaryCtaLink', e.target.value)} className={inputBase} /></div>
              </div>
            </div>
          </Section>

          <Section id="ourStory" title="Our Story section">
            <div className="space-y-4">
              <div><label className={labelBase}>Heading</label><input type="text" value={data.ourStory?.heading || ''} onChange={(e) => updateOurStory('heading', e.target.value)} className={inputBase} /></div>
              <div>
                <ImageUrlWithUpload
                  label="Image URL"
                  value={data.ourStory?.imageUrl || ''}
                  onChange={(url) => updateOurStory('imageUrl', url)}
                  placeholder="https://… or upload a file"
                />
              </div>
              <div><label className={labelBase}>Paragraph 1</label><textarea value={data.ourStory?.paragraph1 || ''} onChange={(e) => updateOurStory('paragraph1', e.target.value)} className={inputBase} rows={3} /></div>
              <div><label className={labelBase}>Paragraph 2</label><textarea value={data.ourStory?.paragraph2 || ''} onChange={(e) => updateOurStory('paragraph2', e.target.value)} className={inputBase} rows={3} /></div>
            </div>
          </Section>

          <Section id="stats" title="By The Numbers">
            <div className="space-y-4">
              <div><label className={labelBase}>Section heading</label><input type="text" value={data.stats?.heading || ''} onChange={(e) => updateStats('heading', e.target.value)} className={inputBase} /></div>
              <div><label className={labelBase}>Subtext</label><input type="text" value={data.stats?.subtext || ''} onChange={(e) => updateStats('subtext', e.target.value)} className={inputBase} /></div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={labelBase}>Stats (value + label; use &quot; (%)&quot; for percentage)</label>
                  <button type="button" onClick={addStat} className="text-sm text-brand-primary hover:underline">+ Add</button>
                </div>
                {(data.stats?.items || []).map((stat, i) => (
                  <div key={i} className="flex gap-2 items-center mb-2">
                    <input type="number" value={stat.value} onChange={(e) => setStatItem(i, 'value', parseInt(e.target.value, 10) || 0)} className={`${inputBase} w-24`} />
                    <input type="text" value={stat.label} onChange={(e) => setStatItem(i, 'label', e.target.value)} className={inputBase} placeholder="Label" />
                    <button type="button" onClick={() => removeStat(i)} className="p-2 text-red-500 hover:bg-surface-muted/90 rounded-lg" aria-label="Remove"><DeleteIcon className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <Section id="whyJinubify" title="Why Jinubify">
            <div className="space-y-6">
              <div><label className={labelBase}>Section heading</label><input type="text" value={data.whyJinubify?.heading || ''} onChange={(e) => setData((p) => ({ ...p, whyJinubify: { ...p.whyJinubify!, heading: e.target.value } }))} className={inputBase} /></div>
              <div><label className={labelBase}>Intro</label><textarea value={data.whyJinubify?.intro || ''} onChange={(e) => setData((p) => ({ ...p, whyJinubify: { ...p.whyJinubify!, intro: e.target.value } }))} className={inputBase} rows={2} /></div>
              <div><label className={labelBase}>Tagline</label><input type="text" value={data.whyJinubify?.tagline || ''} onChange={(e) => setData((p) => ({ ...p, whyJinubify: { ...p.whyJinubify!, tagline: e.target.value } }))} className={inputBase} /></div>
              <div>
                <div className="flex items-center justify-between mb-2"><span className="font-medium text-text-primary">Differentiators</span><button type="button" onClick={addDifferentiator} className="text-sm text-brand-primary hover:underline">+ Add</button></div>
                {(data.whyJinubify?.differentiators || []).map((item, i) => (
                  <div key={i} className="p-4 border border-border-subtle rounded-lg space-y-2 mb-2">
                    <div className="flex justify-between"><span className="text-xs text-text-muted">Item {i + 1}</span><button type="button" onClick={() => removeDifferentiator(i)} className="text-red-500 hover:underline text-xs">Remove</button></div>
                    <select value={item.iconKey} onChange={(e) => setDifferentiator(i, 'iconKey', e.target.value)} className={inputBase}>
                      {ICON_KEYS.map((k) => (<option key={k} value={k}>{k}</option>))}
                    </select>
                    <input type="text" value={item.title} onChange={(e) => setDifferentiator(i, 'title', e.target.value)} className={inputBase} placeholder="Title" />
                    <textarea value={item.description} onChange={(e) => setDifferentiator(i, 'description', e.target.value)} className={inputBase} rows={2} placeholder="Description" />
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center justify-between mb-2"><span className="font-medium text-text-primary">Core values</span><button type="button" onClick={addCoreValue} className="text-sm text-brand-primary hover:underline">+ Add</button></div>
                {(data.whyJinubify?.coreValues || []).map((item, i) => (
                  <div key={i} className="p-4 border border-border-subtle rounded-lg space-y-2 mb-2">
                    <div className="flex justify-between"><span className="text-xs text-text-muted">Value {i + 1}</span><button type="button" onClick={() => removeCoreValue(i)} className="text-red-500 hover:underline text-xs">Remove</button></div>
                    <select value={item.iconKey} onChange={(e) => setCoreValue(i, 'iconKey', e.target.value)} className={inputBase}>
                      {ICON_KEYS.map((k) => (<option key={k} value={k}>{k}</option>))}
                    </select>
                    <input type="text" value={item.title} onChange={(e) => setCoreValue(i, 'title', e.target.value)} className={inputBase} placeholder="Title" />
                    <textarea value={item.description} onChange={(e) => setCoreValue(i, 'description', e.target.value)} className={inputBase} rows={2} placeholder="Description" />
                  </div>
                ))}
              </div>
            </div>
          </Section>
        </div>
      </div>
    </>
  );
};

export default AboutManagement;
