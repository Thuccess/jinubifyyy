import express from 'express';
import SiteSettings from '../models/SiteSettings.js';
import Page from '../models/Page.js';
import Section from '../models/Section.js';
import NavItem from '../models/NavItem.js';
import { withShortCache, getPublicReadCacheMs } from '../utils/shortCache.js';

const router = express.Router();

// Public visibility rules:
// - Site settings & nav: must be published, visible, not deleted
// - Pages: must be visible and not deleted (status can be draft/review/published/archived)
// - Sections: must be published, visible, not deleted
const PUBLIC_FILTER = { isDeleted: false, status: 'published', isVisible: true };
const PUBLIC_PAGE_FILTER = { isDeleted: false, isVisible: true };
const PUBLIC_SECTION_FILTER = { isDeleted: false, status: 'published', isVisible: true };

// @route   GET /api/cms/site
// @desc    Get full public site config (nav, settings, pages with sections)
// @access  Public
router.get('/site', async (req, res) => {
  const cacheMs = getPublicReadCacheMs();
  const edgeMaxAge = Math.min(3600, Math.max(60, Math.floor(cacheMs / 1000)));
  res.set(
    'Cache-Control',
    `public, max-age=${edgeMaxAge}, s-maxage=${edgeMaxAge}, stale-while-revalidate=86400`,
  );
  try {
    const payload = await withShortCache('cms:public:site', cacheMs, async () => {
      const [settingsDocs, navItems, pages] = await Promise.all([
        SiteSettings.find(PUBLIC_FILTER).sort({ order: 1, key: 1 }).lean(),
        NavItem.find(PUBLIC_FILTER).sort({ order: 1 }).lean(),
        Page.find(PUBLIC_PAGE_FILTER).sort({ order: 1, slug: 1 }).lean(),
      ]);

      const siteSettings = {};
      for (const s of settingsDocs) {
        siteSettings[s.key] = s.value;
      }

      const pageIds = pages.map((p) => p._id);
      const sections = await Section.find({
        page: { $in: pageIds },
        ...PUBLIC_SECTION_FILTER,
      })
        .sort({ order: 1 })
        .lean();

      const sectionsByPage = {};
      for (const sec of sections) {
        const pid = sec.page.toString();
        if (!sectionsByPage[pid]) sectionsByPage[pid] = [];
        sectionsByPage[pid].push(sec);
      }

      const pagesWithSections = pages.map((p) => ({
        ...p,
        sections: sectionsByPage[p._id.toString()] || [],
      }));

      return {
        siteSettings,
        nav: navItems.map((n) => ({
          id: n._id.toString(),
          label: n.label,
          href: n.href,
          order: n.order,
        })),
        pages: pagesWithSections,
      };
    });

    res.json(payload);
  } catch (error) {
    console.error('CMS get site error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
