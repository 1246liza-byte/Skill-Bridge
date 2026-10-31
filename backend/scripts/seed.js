/**
 * Skills Bridge - Seed Script
 * Seeds development data: categories, skills, sample students, clients, and projects.
 * Run with: npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const colors = require('colors');
const config = require('../config');
const connectDB = require('../config/db');

const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const ClientProfile = require('../models/ClientProfile');
const Category = require('../models/Category');
const Skill = require('../models/Skill');
const Project = require('../models/Project');
const SiteSettings = require('../models/SiteSettings');

const seedCategories = [
    { name: 'Web Development', slug: 'web-development', description: 'Websites, web apps, and full-stack development', icon: 'code', color: '#1B365D' },
    { name: 'Mobile Development', slug: 'mobile-development', description: 'iOS and Android app development', icon: 'smartphone', color: '#D4AF37' },
    { name: 'Graphic Design', slug: 'graphic-design', description: 'Logos, branding, and visual design', icon: 'palette', color: '#1B365D' },
    { name: 'Content Writing', slug: 'content-writing', description: 'Articles, blogs, and copywriting', icon: 'pen', color: '#D4AF37' },
    { name: 'Digital Marketing', slug: 'digital-marketing', description: 'SEO, social media, and advertising', icon: 'megaphone', color: '#1B365D' },
    { name: 'Data Science', slug: 'data-science', description: 'Data analysis, ML, and visualization', icon: 'chart', color: '#D4AF37' },
    { name: 'Video Editing', slug: 'video-editing', description: 'Video production and post-production', icon: 'video', color: '#1B365D' },
    { name: 'UI/UX Design', slug: 'ui-ux-design', description: 'User interface and experience design', icon: 'layout', color: '#D4AF37' },
];

const seedSkills = [
    // Web Development
    { name: 'React', category: 'Web Development' },
    { name: 'Node.js', category: 'Web Development' },
    { name: 'MongoDB', category: 'Web Development' },
    { name: 'Express', category: 'Web Development' },
    { name: 'HTML/CSS', category: 'Web Development' },
    { name: 'JavaScript', category: 'Web Development' },
    { name: 'TypeScript', category: 'Web Development' },
    { name: 'Next.js', category: 'Web Development' },
    // Mobile Development
    { name: 'React Native', category: 'Mobile Development' },
    { name: 'Flutter', category: 'Mobile Development' },
    { name: 'Swift', category: 'Mobile Development' },
    { name: 'Kotlin', category: 'Mobile Development' },
    // Graphic Design
    { name: 'Adobe Photoshop', category: 'Graphic Design' },
    { name: 'Adobe Illustrator', category: 'Graphic Design' },
    { name: 'Figma', category: 'Graphic Design' },
    { name: 'Brand Identity', category: 'Graphic Design' },
    // Content Writing
    { name: 'SEO Writing', category: 'Content Writing' },
    { name: 'Copywriting', category: 'Content Writing' },
    { name: 'Technical Writing', category: 'Content Writing' },
    { name: 'Blog Writing', category: 'Content Writing' },
    // Digital Marketing
    { name: 'SEO', category: 'Digital Marketing' },
    { name: 'Social Media Marketing', category: 'Digital Marketing' },
    { name: 'Google Ads', category: 'Digital Marketing' },
    { name: 'Email Marketing', category: 'Digital Marketing' },
    // Data Science
    { name: 'Python', category: 'Data Science' },
    { name: 'Machine Learning', category: 'Data Science' },
    { name: 'Data Analysis', category: 'Data Science' },
    { name: 'SQL', category: 'Data Science' },
    // Video Editing
    { name: 'Adobe Premiere Pro', category: 'Video Editing' },
    { name: 'After Effects', category: 'Video Editing' },
    { name: 'DaVinci Resolve', category: 'Video Editing' },
    // UI/UX Design
    { name: 'Wireframing', category: 'UI/UX Design' },
    { name: 'Prototyping', category: 'UI/UX Design' },
    { name: 'User Research', category: 'UI/UX Design' },
    { name: 'Interaction Design', category: 'UI/UX Design' },
];

const seedStudents = [
    {
        name: 'Ayesha Khan',
        email: 'student1@skillsbridge.com',
        password: 'Student@123',
        headline: 'Full-Stack Web Developer',
        bio: 'Computer Science student passionate about building modern web applications with React and Node.js.',
        skills: ['React', 'Node.js', 'MongoDB', 'Express', 'JavaScript'],
        preferredCategories: ['Web Development'],
        hourlyRate: 15,
        projectRate: 300,
        availability: 'available',
        education: [{ institution: 'National University', degree: 'BSc Computer Science', field: 'Computer Science', startYear: 2021, endYear: 2025 }],
    },
    {
        name: 'Bilal Ahmed',
        email: 'student2@skillsbridge.com',
        password: 'Student@123',
        headline: 'UI/UX Designer',
        bio: 'Design student specializing in user-centered interfaces and mobile app design.',
        skills: ['Figma', 'Wireframing', 'Prototyping', 'User Research'],
        preferredCategories: ['UI/UX Design'],
        hourlyRate: 12,
        projectRate: 250,
        availability: 'available',
        education: [{ institution: 'Design Institute', degree: 'BDes Visual Communication', field: 'Design', startYear: 2020, endYear: 2024 }],
    },
    {
        name: 'Fatima Noor',
        email: 'student3@skillsbridge.com',
        password: 'Student@123',
        headline: 'Content Writer & SEO Specialist',
        bio: 'English literature student with a knack for engaging, SEO-optimized content.',
        skills: ['SEO Writing', 'Copywriting', 'Blog Writing', 'SEO'],
        preferredCategories: ['Content Writing', 'Digital Marketing'],
        hourlyRate: 10,
        projectRate: 150,
        availability: 'available',
        education: [{ institution: 'City University', degree: 'BA English Literature', field: 'English', startYear: 2022, endYear: 2026 }],
    },
];

const seedClients = [
    {
        name: 'TechNova Solutions',
        email: 'client1@skillsbridge.com',
        password: 'Client@123',
        companyName: 'TechNova Solutions',
        companyDescription: 'A growing software agency looking for talented student developers.',
        website: 'https://technova.example.com',
        industry: 'Technology',
    },
    {
        name: 'BrightStart Marketing',
        email: 'client2@skillsbridge.com',
        password: 'Client@123',
        companyName: 'BrightStart Marketing',
        companyDescription: 'Digital marketing agency seeking creative student designers and writers.',
        website: 'https://brightstart.example.com',
        industry: 'Marketing',
    },
];

const seedProjects = [
    {
        title: 'E-commerce Website for Local Boutique',
        description: 'Build a modern e-commerce website with product listings, cart, and checkout for a local clothing boutique.',
        requiredSkills: ['React', 'Node.js', 'MongoDB', 'Express'],
        budgetType: 'fixed',
        budget: 800,
        deadline: '2026-12-15',
        projectType: 'one-time',
    },
    {
        title: 'Mobile App UI Design',
        description: 'Design a complete UI kit and interactive prototype for a fitness tracking mobile app.',
        requiredSkills: ['Figma', 'Prototyping', 'Wireframing'],
        budgetType: 'fixed',
        budget: 500,
        deadline: '2026-11-30',
        projectType: 'one-time',
    },
    {
        title: 'SEO Blog Content (10 Articles)',
        description: 'Write 10 SEO-optimized blog articles for a tech startup website, 1000 words each.',
        requiredSkills: ['SEO Writing', 'Blog Writing', 'SEO'],
        budgetType: 'fixed',
        budget: 400,
        deadline: '2026-12-01',
        projectType: 'one-time',
    },
];

// Site settings are stored as { key, value } documents and merged into
// DEFAULTS by the siteSettingsController. Keys: branding, homepage, about,
// contact, footer, navigation.
const seedSiteSettings = [
    {
        key: 'branding',
        value: {
            logo: '',
            siteName: 'Skills Bridge',
            tagline: 'Connecting Students with Real-World Opportunities',
            primaryColor: '#1B365D',
            accentColor: '#D4AF37',
        },
    },
    {
        key: 'homepage',
        value: {
            heroTitle: 'Find Skilled Students for Your Next Project',
            heroSubtitle: 'Hire talented students for web development, design, writing, and more.',
            heroImage: '',
            features: [
                { title: 'Verified Students', description: 'Every student is verified and rated by real clients.' },
                { title: 'Secure Payments', description: 'Payments are handled securely through our platform.' },
                { title: 'Quality Work', description: 'Get high-quality work at student-friendly rates.' },
            ],
        },
    },
    {
        key: 'about',
        value: {
            title: 'About Skills Bridge',
            introduction: 'Skills Bridge is a marketplace that connects talented students with clients who need real-world work done. We empower students to build their portfolios, earn income, and gain professional experience while studying.',
            mission: 'Our mission is to empower students with meaningful project opportunities while giving clients access to fresh, motivated talent.',
            vision: 'Our vision is a world where every student can build a professional portfolio before graduation.',
            howItWorks: '',
            benefitsStudents: '',
            benefitsClients: '',
        },
    },
    {
        key: 'contact',
        value: {
            title: 'Contact Us',
            email: 'support@skillsbridge.com',
            phone: '+1 (555) 123-4567',
            address: '123 University Avenue, Tech City',
            socialLinks: {
                facebook: 'https://facebook.com/skillsbridge',
                twitter: 'https://twitter.com/skillsbridge',
                linkedin: 'https://linkedin.com/company/skillsbridge',
                instagram: 'https://instagram.com/skillsbridge',
                github: '',
            },
        },
    },
    {
        key: 'footer',
        value: {
            text: '© 2026 Skills Bridge. All rights reserved.',
            links: [],
        },
    },
    {
        key: 'navigation',
        value: {
            links: [
                { label: 'Home', path: '/' },
                { label: 'Find Students', path: '/students' },
                { label: 'Find Projects', path: '/projects' },
                { label: 'About', path: '/about' },
                { label: 'Contact', path: '/contact' },
            ],
        },
    },
];

async function seed() {
    try {
        await connectDB();
        console.log('Connected to MongoDB'.cyan.bold);

        // Clear existing data (in safe order)
        await Promise.all([
            Project.deleteMany({}),
            StudentProfile.deleteMany({}),
            ClientProfile.deleteMany({}),
            User.deleteMany({}),
            Category.deleteMany({}),
            Skill.deleteMany({}),
            SiteSettings.deleteMany({}),
        ]);
        console.log('Cleared existing data'.yellow);

        // Seed categories
        const categories = await Category.insertMany(seedCategories);
        console.log(`Seeded ${categories.length} categories`.green);

        // Build category map
        const categoryMap = {};
        categories.forEach((c) => {
            categoryMap[c.name] = c._id;
        });

        // Seed skills
        const skillDocs = seedSkills.map((s) => ({
            name: s.name,
            slug: s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            category: categoryMap[s.category],
        }));
        const skills = await Skill.insertMany(skillDocs);
        console.log(`Seeded ${skills.length} skills`.green);

        // Build skill map
        const skillMap = {};
        skills.forEach((s) => {
            skillMap[s.name] = s._id;
        });

        // Seed students
        const studentUsers = [];
        for (const s of seedStudents) {
            const user = await User.create({
                name: s.name,
                email: s.email,
                password: s.password,
                role: 'student',
                status: 'active',
            });
            const skillIds = s.skills.map((sk) => skillMap[sk]).filter(Boolean);
            const categoryIds = s.preferredCategories.map((c) => categoryMap[c]).filter(Boolean);
            await StudentProfile.create({
                user: user._id,
                headline: s.headline,
                bio: s.bio,
                skills: skillIds,
                preferredCategories: categoryIds,
                hourlyRate: s.hourlyRate,
                projectRate: s.projectRate,
                availability: s.availability,
                education: s.education,
                profileCompletion: 80,
            });
            studentUsers.push(user);
        }
        console.log(`Seeded ${studentUsers.length} students`.green);

        // Seed clients
        const clientUsers = [];
        for (const c of seedClients) {
            const user = await User.create({
                name: c.name,
                email: c.email,
                password: c.password,
                role: 'client',
                status: 'active',
            });
            await ClientProfile.create({
                user: user._id,
                companyName: c.companyName,
                companyDescription: c.companyDescription,
                website: c.website,
                industry: c.industry,
            });
            clientUsers.push(user);
        }
        console.log(`Seeded ${clientUsers.length} clients`.green);

        // Seed projects (assign to clients)
        for (let i = 0; i < seedProjects.length; i++) {
            const p = seedProjects[i];
            const client = clientUsers[i % clientUsers.length];
            const skillIds = p.requiredSkills.map((sk) => skillMap[sk]).filter(Boolean);
            await Project.create({
                owner: client._id,
                title: p.title,
                description: p.description,
                category: categoryMap['Web Development'],
                requiredSkills: skillIds,
                budgetType: p.budgetType,
                budget: p.budget,
                deadline: new Date(p.deadline),
                projectType: p.projectType,
                status: 'open',
                visibility: 'public',
                featured: i === 0,
            });
        }
        console.log(`Seeded ${seedProjects.length} projects`.green);

        // Seed site settings
        await SiteSettings.insertMany(seedSiteSettings);
        console.log('Seeded site settings'.green);

        console.log('\nSeed completed successfully!'.green.bold);
        console.log('\nTest credentials:'.cyan.bold);
        console.log('  Student: student1@skillsbridge.com / Student@123'.yellow);
        console.log('  Client:  client1@skillsbridge.com / Client@123'.yellow);
        console.log('  Admin:   (use npm run create-admin)'.yellow);

        process.exit(0);
    } catch (error) {
        console.error(`Seed failed: ${error.message}`.red.bold);
        process.exit(1);
    }
}

seed();