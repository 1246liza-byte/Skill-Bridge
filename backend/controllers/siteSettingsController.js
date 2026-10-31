const SiteSettings = require('../models/SiteSettings');
const asyncHandler = require('../utils/asyncHandler');

// Default settings used when a key does not exist yet
const DEFAULTS = {
    branding: {
        logo: '',
        siteName: 'Skills Bridge',
        tagline: 'Connecting talented students with great clients',
    },
    homepage: {
        heroTitle: 'Bridge the Gap Between Talent and Opportunity',
        heroSubtitle:
            'Skills Bridge connects ambitious students with clients who need real work done. Build your portfolio, earn while you learn, and hire verified student talent.',
        heroImage: '',
        stats: { students: 0, clients: 0, projects: 0, hires: 0 },
        testimonials: [],
    },
    about: {
        title: 'About Skills Bridge',
        introduction:
            'Skills Bridge is a student freelancing platform built to help students turn their skills into real-world experience.',
        mission:
            'Our mission is to empower students with meaningful project opportunities while giving clients access to fresh, motivated talent.',
        vision:
            'Our vision is a world where every student can build a professional portfolio before graduation.',
        howItWorks: '',
        benefitsStudents: '',
        benefitsClients: '',
    },
    contact: {
        title: 'Contact Us',
        email: 'support@skillsbridge.com',
        phone: '',
        address: '',
        socialLinks: {
            facebook: '',
            twitter: '',
            linkedin: '',
            instagram: '',
            github: '',
        },
    },
    footer: {
        text: 'Skills Bridge — Connecting students and clients.',
        links: [],
    },
    navigation: {
        links: [
            { label: 'Home', path: '/' },
            { label: 'About', path: '/about' },
            { label: 'Contact', path: '/contact' },
            { label: 'Students', path: '/students' },
            { label: 'Projects', path: '/projects' },
        ],
    },
};

// Load raw docs from DB and merge with defaults
const loadRawSettings = async () => {
    const docs = await SiteSettings.find();
    const settings = { ...DEFAULTS };
    docs.forEach((doc) => {
        settings[doc.key] = doc.value;
    });
    return settings;
};

// Flatten the nested settings into the shape the frontend expects
const flattenSettings = (s) => ({
    siteName: s.branding?.siteName || '',
    tagline: s.branding?.tagline || '',
    logo: s.branding?.logo || '',
    aboutUs: s.about?.introduction || '',
    aboutTitle: s.about?.title || '',
    aboutMission: s.about?.mission || '',
    aboutVision: s.about?.vision || '',
    contactEmail: s.contact?.email || '',
    contactPhone: s.contact?.phone || '',
    address: s.contact?.address || '',
    footerText: s.footer?.text || '',
    primaryColor: '#1B365D',
    accentColor: '#D4AF37',
    homepage: {
        heroTitle: s.homepage?.heroTitle || '',
        heroSubtitle: s.homepage?.heroSubtitle || '',
        heroImage: s.homepage?.heroImage || '',
        stats: s.homepage?.stats || { students: 0, clients: 0, projects: 0, hires: 0 },
        testimonials: s.homepage?.testimonials || [],
    },
    socialLinks: {
        facebook: s.contact?.socialLinks?.facebook || '',
        twitter: s.contact?.socialLinks?.twitter || '',
        linkedin: s.contact?.socialLinks?.linkedin || '',
        instagram: s.contact?.socialLinks?.instagram || '',
        github: s.contact?.socialLinks?.github || '',
    },
});

// @desc    Get all site settings (public)
// @route   GET /api/site-settings
// @access  Public
const getSettings = asyncHandler(async (req, res) => {
    const raw = await loadRawSettings();
    res.json({ success: true, data: flattenSettings(raw) });
});

// @desc    Get a single settings key (public)
// @route   GET /api/site-settings/:key
// @access  Public
const getSetting = asyncHandler(async (req, res) => {
    const doc = await SiteSettings.findOne({ key: req.params.key });
    const value = doc ? doc.value : DEFAULTS[req.params.key] || null;
    res.json({ success: true, data: value });
});

// @desc    Update a settings key (admin)
// @route   PUT /api/site-settings/:key
// @access  Private (admin)
const updateSetting = asyncHandler(async (req, res) => {
    const { key } = req.params;
    const { value } = req.body;

    if (value === undefined) {
        res.status(400);
        throw new Error('Value is required');
    }

    const doc = await SiteSettings.findOneAndUpdate(
        { key },
        { key, value },
        { new: true, upsert: true, runValidators: true }
    );

    res.json({ success: true, data: doc });
});

// @desc    Bulk update site settings (admin)
// @route   PUT /api/site-settings
// @access  Private (admin)
const updateSettings = asyncHandler(async (req, res) => {
    const body = req.body || {};

    // Build the nested structure from the flat payload
    const branding = {
        siteName: body.siteName,
        tagline: body.tagline,
        logo: body.logo,
    };
    const about = {
        title: body.aboutTitle,
        introduction: body.aboutUs,
        mission: body.aboutMission,
        vision: body.aboutVision,
    };
    const contact = {
        email: body.contactEmail,
        phone: body.contactPhone,
        address: body.address,
        socialLinks: {
            facebook: body.socialLinks?.facebook,
            twitter: body.socialLinks?.twitter,
            linkedin: body.socialLinks?.linkedin,
            instagram: body.socialLinks?.instagram,
            github: body.socialLinks?.github,
        },
    };
    const footer = {
        text: body.footerText,
    };
    const homepage = {
        heroTitle: body.homepage?.heroTitle,
        heroSubtitle: body.homepage?.heroSubtitle,
        heroImage: body.homepage?.heroImage,
        stats: body.homepage?.stats,
        testimonials: body.homepage?.testimonials,
    };

    const updates = { branding, about, contact, footer, homepage };

    // Upsert each key
    const ops = Object.entries(updates).map(([key, value]) =>
        SiteSettings.findOneAndUpdate(
            { key },
            { key, value },
            { new: true, upsert: true, runValidators: true }
        )
    );
    await Promise.all(ops);

    const raw = await loadRawSettings();
    res.json({ success: true, data: flattenSettings(raw) });
});

module.exports = {
    getSettings,
    getSetting,
    updateSetting,
    updateSettings,
};