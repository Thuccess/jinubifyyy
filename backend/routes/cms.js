import express from 'express';
import SiteSettings from '../models/SiteSettings.js';
import Page from '../models/Page.js';
import Section from '../models/Section.js';
import NavItem from '../models/NavItem.js';

const router = express.Router();

const PUBLIC_FILTER = { isDeleted: false, status: 'published', isVisible: true };

// @route   GET /api/cms/site
// @desc    Get full public site config (nav, settings, pages with sections)
// @access  Public
router.get('/site', async (req, res) => {
  try {
    const [settingsDocs, navItems, pages] = await Promise.all([
      SiteSettings.find(PUBLIC_FILTER).sort({ order: 1, key: 1 }).lean(),
      NavItem.find(PUBLIC_FILTER).sort({ order: 1 }).lean(),
      Page.find(PUBLIC_FILTER).sort({ order: 1, slug: 1 }).lean(),
    ]);

    const siteSettings = {};
    for (const s of settingsDocs) {
      siteSettings[s.key] = s.value;
    }

    const pageIds = pages.map((p) => p._id);
    const sections = await Section.find({
      page: { $in: pageIds },
      ...PUBLIC_FILTER,
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

    res.json({
      siteSettings,
      nav: navItems.map((n) => ({ id: n._id.toString(), label: n.label, href: n.href, order: n.order })),
      pages: pagesWithSections,
    });
  } catch (error) {
    console.error('CMS get site error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
