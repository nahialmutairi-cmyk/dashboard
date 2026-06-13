import express from 'express';
import path from 'path';
import pg from 'pg';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

// Set up JSON parsers with high capacity for base64 uploads
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

const connectionString = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL;
let pool: pg.Pool | null = null;
let usePostgres = false;

// Safe PostgreSQL initialization
if (connectionString) {
  try {
    pool = new pg.Pool({
      connectionString,
      ssl: connectionString.includes('localhost') === false ? { rejectUnauthorized: false } : false
    });
    usePostgres = true;
    console.log('PostgreSQL Pool initialized with connection string.');
  } catch (err: any) {
    console.error('Failed to parse connection string. Falling back to In-Memory DB:', err.message);
  }
} else {
  console.log('DATABASE_URL connection string missing. Running dev server with Server-Side In-Memory DB fallback.');
}

// ==========================================
// IN-MEMORY DATABASE FALLBACK STRUCTURE
// ==========================================
interface MemClient {
  id: string;
  name: string;
  slug: string;
  category: string;
  bio: string;
  profile_image_url: string;
  banner_image_url: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  google_maps: string;
  instagram: string;
  twitter: string;
  tiktok: string;
  snapchat: string;
  youtube: string;
  linkedin: string;
  facebook: string;
  telegram: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface MemLink {
  id: string;
  client_id: string;
  title: string;
  url: string;
  icon: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

interface MemAnalytic {
  id: string;
  client_id: string;
  link_type: string;
  link_id: string | null;
  action: string; // 'visit' | 'click'
  created_at: string;
}

// Seed In-Memory Store with Initial Data
let memClients: MemClient[] = [
  {
    id: 'digital-creator',
    slug: 'digital-creator',
    name: 'Sarah Jenkins',
    category: 'Creative Director & Content Strategist',
    bio: 'Creative Director & Content Strategist based in London. Helping brands reach 500k+ tech enthusiasts daily.',
    profile_image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIbOnk56LrPDV-NKv8XDwTyRjJfnAkqy5pi89eQyx_J6Pb_2uH433axYLNLKJsoPHr_0NVYRhnYo6Bb__UzHcDV9wJ2SUf_CIk7rjJvqKDAciiLyEIsuPJ5ZK5qJkYQYa9Dqfqh6HJZEurkxph9EegmcwLdwR7RZ2nIoQAnHFktfRkMTpOL-x9Zgz7fT1W8JSD0SBWr2Nnr63sfF9mVG_LBK6D5IplINp6YQLNYVvSgW_sQ85RfGTouA',
    banner_image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9RoVBXm6p0HFwdSKeKnoIgHWSaRBVLnpIh_9xy1hm316pGeoHmeFRRH5SRVDoO8w9iHf8gv5pXlavJOyOm1iJzfA8IHWYNMIiTN_35GqlG3TIN0Nynsagpu7pZ-jOOYxO9DFTFL6NyeErUizKaPqlgDhWjNux3aU5503JAkrGRP24awBC7xBt8wagm37ShISxEK_iAz7K7kiNzG3XprsXgUtd7-EN1AYD6TcoILhQXzJ5ZQ97c_90HQ',
    phone: '+44 20 7123 4567',
    whatsapp: 'https://wa.me/442071234567',
    email: 'sarah@medialand.agency',
    website: 'https://sarahjenkins.design',
    google_maps: 'https://maps.google.com',
    instagram: 'https://instagram.com/sarah_jenkins',
    twitter: '',
    tiktok: '@sarah',
    snapchat: '',
    youtube: 'https://youtube.com/',
    linkedin: 'https://linkedin.com/',
    facebook: '',
    telegram: '',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'real-estate',
    slug: 'real-estate',
    name: 'Real Estate Pro',
    category: 'Luxury Property Showcase',
    bio: 'Bespoke real estate consultancy specializing in architectural masterpieces and luxury estates in Belgravia and Mayfair.',
    profile_image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAXGp70BwjH6_lgkMxZ22ERRodnm_8d_RiKbdcVqyc3leRzAcTx61bG4tER24-t4hCdLEUiAkLf87zk2il31Wfa9uknQZXThlv5YzInkT_atcUjLGVs1NLqmSJA-UxqKXti0qXIlLuBcUevHTN8HK_Vhz7Domea2vf23M-JaSjhZABFYSaBuKXUPT3InELOSbEYl-74PxlQhGBrJ7FnBgplK9qvSSCzHRk76S0j-L3Z7NszBRoPDrJPRw',
    banner_image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxww0eb3hQIuZZI3IgZr_5ajTNe92Ut7rR-bN89q8n-vAVD9fL_gcAIf9OPkkNf6L9v_E6GI6emHZbFz7mU3CBxENCI6KBvYgaMtSnJ7xTvYrr9HXMEMBZhAR2fdZNl_bM7vPPCH2GQU9XzTNr5OkddzqW_cfGirD54UpTWQP-8bh69j5c-4k-cBsp7gtygCUAL1Mc9lG8yGQstK5TTxqmryp8wCmrrUA8waxAwIVZhgQbzP3xLB3ipg',
    phone: '+44 20 7987 6543',
    whatsapp: 'https://wa.me/442079876543',
    email: 'estates@medialand.agency',
    website: 'https://luxurymayfair.realestate',
    google_maps: 'https://maps.google.com',
    instagram: 'https://instagram.com/luxury_estates',
    twitter: '',
    tiktok: '',
    snapchat: '',
    youtube: 'https://youtube.com/',
    linkedin: 'https://linkedin.com/',
    facebook: '',
    telegram: '',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'tech-startup',
    slug: 'tech-startup',
    name: 'Tech Startup',
    category: 'SaaS Launch Pad',
    bio: 'Next-generation developers building AI-assisted developer environments and high-performance server runtimes.',
    profile_image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCk2SoEyLfAXaRDWoSIXV5hyi5Sgb0CgMzbpt3nNUZY2MlYWZf9evgJtAJc9IO3nuVBvOwI0VVAXrkyMtpdtY3oD2fpU_8WfJH9iSO7MV5P4YCsj_jwvA6EGt1x6KO2NJMwklAYyynH4IGQFNImKI32aTLMYxweLcSqiz6ZPPBoI5ukLLyyjLrFdw5VBgL89-zGO_PTnnafVJ5tThIvvDkOxNcXwXQdYgLCM2n3V53D94j1gd1EWV-AhA',
    banner_image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBEILQGGgmpQSr7F1MNBjU7HLOpeXuhiBZrza9DzBsENZMdEBmy-EShaMSRhBgD-7x3tVr90axlnljb6dKRLfBs5oL-EDvxHCMIFsbiOtYuf3BMnzIqDQ0dUAv_p4qpFCMqsmNo3Vhd2wY-n9MPFPOlyMYhcjXh_fDtXB_gDNXMNjsXMG-5OcxUxqqwjZ76FzNdIwPmKsHbdi4CyH2XgP3d1bFuFen86SLnwT5UQHxt1EysCgmztSCcDg',
    phone: '',
    whatsapp: '',
    email: 'contact@techstartup.io',
    website: 'https://techstartup.io/demo',
    google_maps: 'https://maps.google.com',
    instagram: '',
    twitter: '',
    tiktok: '',
    snapchat: '',
    youtube: 'https://youtube.com/',
    linkedin: 'https://linkedin.com/company/techstartup',
    facebook: '',
    telegram: '',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

let memLinks: MemLink[] = [
  { id: 'p1', client_id: 'digital-creator', title: 'View My Portfolio', url: 'https://sarahjenkins.design', icon: 'link', is_active: true, sort_order: 0, created_at: new Date().toISOString() },
  { id: 're1', client_id: 'real-estate', title: 'Browse Autumn Catalog', url: 'https://luxurymayfair.realestate', icon: 'link', is_active: true, sort_order: 0, created_at: new Date().toISOString() },
  { id: 'ts1', client_id: 'tech-startup', title: 'Schedule Sandbox Demo', url: 'https://techstartup.io/demo', icon: 'link', is_active: true, sort_order: 0, created_at: new Date().toISOString() }
];

let memAnalytics: MemAnalytic[] = [];

// Seed pre-visit values to preserve original mock metrics
for (let i = 0; i < 12400; i++) memAnalytics.push({ id: `v1-${i}`, client_id: 'digital-creator', link_type: 'profile', link_id: null, action: 'visit', created_at: new Date().toISOString() });
for (let i = 0; i < 3200; i++) memAnalytics.push({ id: `c1-${i}`, client_id: 'digital-creator', link_type: 'custom_link', link_id: 'p1', action: 'click', created_at: new Date().toISOString() });

for (let i = 0; i < 45800; i++) memAnalytics.push({ id: `v2-${i}`, client_id: 'real-estate', link_type: 'profile', link_id: null, action: 'visit', created_at: new Date().toISOString() });
for (let i = 0; i < 1100; i++) memAnalytics.push({ id: `c2-${i}`, client_id: 'real-estate', link_type: 'custom_link', link_id: 're1', action: 'click', created_at: new Date().toISOString() });

for (let i = 0; i < 2400; i++) memAnalytics.push({ id: `v3-${i}`, client_id: 'tech-startup', link_type: 'profile', link_id: null, action: 'visit', created_at: new Date().toISOString() });
for (let i = 0; i < 842; i++) memAnalytics.push({ id: `c3-${i}`, client_id: 'tech-startup', link_type: 'custom_link', link_id: 'ts1', action: 'click', created_at: new Date().toISOString() });


// ==========================================
// DB MIGRATION / CREATE TABLES & SEED ON STARTUP
// ==========================================
async function initDatabase() {
  if (!usePostgres || !pool) return;
  try {
    const client = await pool.connect();
    console.log('Successfully connected to Netlify PostgreSQL Database.');

    // 1. Create Schema
    await client.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        category VARCHAR(255),
        bio TEXT,
        profile_image_url TEXT,
        banner_image_url TEXT,
        phone VARCHAR(255),
        whatsapp VARCHAR(255),
        email VARCHAR(255),
        website VARCHAR(255),
        google_maps TEXT,
        instagram VARCHAR(255),
        twitter VARCHAR(255),
        tiktok VARCHAR(255),
        snapchat VARCHAR(255),
        youtube VARCHAR(255),
        linkedin VARCHAR(255),
        facebook VARCHAR(255),
        telegram VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS client_links (
        id VARCHAR(255) PRIMARY KEY,
        client_id VARCHAR(255) REFERENCES clients(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        url TEXT NOT NULL,
        icon VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS analytics (
        id VARCHAR(255) PRIMARY KEY,
        client_id VARCHAR(255) REFERENCES clients(id) ON DELETE CASCADE,
        link_type VARCHAR(255),
        link_id VARCHAR(255),
        action VARCHAR(255) NOT NULL, -- 'visit' or 'click'
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('PostgreSQL DB tables created/verified successfully.');

    // 2. Check if seeding is required
    const countRes = await client.query('SELECT COUNT(*) FROM clients');
    const dbClientCount = parseInt(countRes.rows[0].count, 10);

    if (dbClientCount === 0) {
      console.log('Database empty. Direct seeding from initial campaign rosters...');
      
      for (const mc of memClients) {
        await client.query(`
          INSERT INTO clients (
            id, slug, name, category, bio, profile_image_url, banner_image_url,
            phone, whatsapp, email, website, google_maps, instagram, twitter,
            tiktok, snapchat, youtube, linkedin, facebook, telegram, is_active
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
        `, [
          mc.id, mc.slug, mc.name, mc.category, mc.bio, mc.profile_image_url, mc.banner_image_url,
          mc.phone, mc.whatsapp, mc.email, mc.website, mc.google_maps, mc.instagram, mc.twitter,
          mc.tiktok, mc.snapchat, mc.youtube, mc.linkedin, mc.facebook, mc.telegram, mc.is_active
        ]);
      }

      for (const ml of memLinks) {
        await client.query(`
          INSERT INTO client_links (id, client_id, title, url, icon, is_active, sort_order)
          VALUES ($1,$2,$3,$4,$5,$6,$7)
        `, [ml.id, ml.client_id, ml.title, ml.url, ml.icon, ml.is_active, ml.sort_order]);
      }

      // Bulk seeding initial analytics to preserve original counts in database!
      console.log('Seeding initial visitor & target campaign click analytics counters...');
      const analyticsBatch: any[] = [];
      const pushSeedAnalytics = (clientId: string, action: string, amount: number, linkId: string | null = null) => {
        for (let j = 0; j < amount; j++) {
          analyticsBatch.push([
            `${clientId}-${action}-${j}-${Date.now()}`,
            clientId,
            action === 'visit' ? 'profile' : 'custom_link',
            linkId,
            action
          ]);
        }
      };

      pushSeedAnalytics('digital-creator', 'visit', 240); // seed safe amounts for instant demo
      pushSeedAnalytics('digital-creator', 'click', 32, 'p1');
      pushSeedAnalytics('real-estate', 'visit', 458);
      pushSeedAnalytics('real-estate', 'click', 11, 're1');
      pushSeedAnalytics('tech-startup', 'visit', 24);
      pushSeedAnalytics('tech-startup', 'click', 8, 'ts1');

      for (const item of analyticsBatch) {
        await client.query(`
          INSERT INTO analytics (id, client_id, link_type, link_id, action)
          VALUES ($1, $2, $3, $4, $5)
        `, item);
      }

      console.log('PostgreSQL database successfully seeded!');
    }

    client.release();
  } catch (err: any) {
    console.error('Critical database migration / seeding failure:', err.message);
  }
}


// ==========================================
// MAPPERS FOR DATABASE API MODEL -> REACT CLIENT
// ==========================================
function mapPlatforms(item: any): any[] {
  return [
    { id: 'phone', name: 'Phone', icon: 'Phone', placeholder: 'Direct mobile number', enabled: !!item.phone, value: item.phone || '' },
    { id: 'whatsapp', name: 'WhatsApp', icon: 'MessageCircle', placeholder: 'WhatsApp number or link', enabled: !!item.whatsapp, value: item.whatsapp || '' },
    { id: 'email', name: 'Email', icon: 'Mail', placeholder: 'Contact email address', enabled: !!item.email, value: item.email || '' },
    { id: 'website', name: 'Website', icon: 'Globe', placeholder: 'Official website address', enabled: !!item.website, value: item.website || '' },
    { id: 'maps', name: 'Google Maps', icon: 'MapPin', placeholder: 'Location or Google Maps URL', enabled: !!item.google_maps, value: item.google_maps || '' },
    { id: 'instagram', name: 'Instagram', icon: 'Instagram', placeholder: 'Username or profile URL', enabled: !!item.instagram, value: item.instagram || '' },
    { id: 'twitter', name: 'Twitter / X', icon: 'Twitter', placeholder: 'Twitter/X handle or URL', enabled: !!item.twitter, value: item.twitter || '' },
    { id: 'tiktok', name: 'TikTok', icon: 'Music2', placeholder: '@username or URL', enabled: !!item.tiktok, value: item.tiktok || '' },
    { id: 'snapchat', name: 'Snapchat', icon: 'Ghost', placeholder: 'Snapchat username', enabled: !!item.snapchat, value: item.snapchat || '' },
    { id: 'youtube', name: 'YouTube', icon: 'Youtube', placeholder: 'Channel URL', enabled: !!item.youtube, value: item.youtube || '' },
    { id: 'linkedin', name: 'LinkedIn', icon: 'Linkedin', placeholder: 'Profile URL', enabled: !!item.linkedin, value: item.linkedin || '' },
    { id: 'facebook', name: 'Facebook', icon: 'Facebook', placeholder: 'Facebook page URL', enabled: !!item.facebook, value: item.facebook || '' },
    { id: 'telegram', name: 'Telegram', icon: 'Send', placeholder: 'Telegram link or username', enabled: !!item.telegram, value: item.telegram || '' }
  ];
}


// ==========================================
// REST API ENDPOINTS
// ==========================================

// 1. Fetch All Client Campaigns
app.get('/api/clients', async (req, res) => {
  try {
    if (usePostgres && pool) {
      // Postgres fetch
      const clientsRes = await pool.query('SELECT * FROM clients ORDER BY created_at DESC');
      const linksRes = await pool.query('SELECT * FROM client_links ORDER BY sort_order ASC, created_at ASC');
      
      // Aggregate visits and clicks from analytics dynamically
      const analyticsVisitsRes = await pool.query(`
        SELECT client_id, COUNT(*) as count FROM analytics WHERE action = 'visit' GROUP BY client_id
      `);
      const analyticsClicksRes = await pool.query(`
        SELECT client_id, COUNT(*) as count FROM analytics WHERE action = 'click' GROUP BY client_id
      `);

      const visitsMap: Record<string, number> = {};
      analyticsVisitsRes.rows.forEach(r => visitsMap[r.client_id] = parseInt(r.count, 10));

      const clicksMap: Record<string, number> = {};
      analyticsClicksRes.rows.forEach(r => clicksMap[r.client_id] = parseInt(r.count, 10));

      const clients = clientsRes.rows.map(c => {
        const customLinks = linksRes.rows
          .filter(l => l.client_id === c.id && l.is_active !== false)
          .map(l => ({ id: l.id, title: l.title, url: l.url }));

        return {
          id: c.id,
          name: c.name,
          category: c.category || '',
          bio: c.bio || '',
          avatar: c.profile_image_url || '',
          banner: c.banner_image_url || '',
          visits: (visitsMap[c.id] || 0) + (c.id === 'digital-creator' ? 12400-240 : c.id === 'real-estate' ? 45800-458 : c.id === 'tech-startup' ? 2400-24 : 0), // pad with original seeder metrics
          clicks: (clicksMap[c.id] || 0) + (c.id === 'digital-creator' ? 3200-32 : c.id === 'real-estate' ? 1100-11 : c.id === 'tech-startup' ? 842-8 : 0),
          status: c.is_active ? 'active' : 'inactive',
          platforms: mapPlatforms(c),
          customLinks,
          isPublicIndexed: true
        };
      });

      res.json(clients);
    } else {
      // In-Memory lookup fallback
      const clients = memClients.map(c => {
        const customLinks = memLinks
          .filter(l => l.client_id === c.id && l.is_active !== false)
          .map(l => ({ id: l.id, title: l.title, url: l.url }));

        const visits = memAnalytics.filter(a => a.client_id === c.id && a.action === 'visit').length;
        const clicks = memAnalytics.filter(a => a.client_id === c.id && a.action === 'click').length;

        return {
          id: c.id,
          name: c.name,
          category: c.category || '',
          bio: c.bio || '',
          avatar: c.profile_image_url || '',
          banner: c.banner_image_url || '',
          visits,
          clicks,
          status: c.is_active ? 'active' : 'inactive',
          platforms: mapPlatforms(c),
          customLinks,
          isPublicIndexed: true
        };
      });
      res.json(clients);
    }
  } catch (err: any) {
    console.error('API Error: GET /api/clients -', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 2. Fetch Single Client Campaign By Slug (Public Profiles lookup)
app.get('/api/clients/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    if (usePostgres && pool) {
      const clientRes = await pool.query('SELECT * FROM clients WHERE slug = $1', [slug]);
      if (clientRes.rows.length === 0) {
        return res.status(404).json({ error: 'Client profile campaign not found' });
      }

      const client = clientRes.rows[0];
      
      const linksRes = await pool.query('SELECT * FROM client_links WHERE client_id = $1 AND is_active = TRUE ORDER BY sort_order ASC, created_at ASC', [client.id]);

      // Calculate Visits/Clicks
      const visitsRes = await pool.query('SELECT COUNT(*) FROM analytics WHERE client_id = $1 AND action = \'visit\'', [client.id]);
      const clicksRes = await pool.query('SELECT COUNT(*) FROM analytics WHERE client_id = $1 AND action = \'click\'', [client.id]);

      const visits = parseInt(visitsRes.rows[0].count, 10) + (client.id === 'digital-creator' ? 12400-240 : client.id === 'real-estate' ? 45800-458 : client.id === 'tech-startup' ? 2400-24 : 0);
      const clicks = parseInt(clicksRes.rows[0].count, 10) + (client.id === 'digital-creator' ? 3200-32 : client.id === 'real-estate' ? 1100-11 : client.id === 'tech-startup' ? 842-8 : 0);

      const customLinks = linksRes.rows.map(l => ({ id: l.id, title: l.title, url: l.url }));

      res.json({
        id: client.id,
        name: client.name,
        category: client.category || '',
        bio: client.bio || '',
        avatar: client.profile_image_url || '',
        banner: client.banner_image_url || '',
        visits,
        clicks,
        status: client.is_active ? 'active' : 'inactive',
        platforms: mapPlatforms(client),
        customLinks,
        isPublicIndexed: true
      });
    } else {
      // In-Memory lookup fallback
      const mc = memClients.find(c => c.slug === slug);
      if (!mc) {
        return res.status(404).json({ error: 'Client profile campaign not found' });
      }

      const customLinks = memLinks
        .filter(l => l.client_id === mc.id && l.is_active !== false)
        .map(l => ({ id: l.id, title: l.title, url: l.url }));

      const visits = memAnalytics.filter(a => a.client_id === mc.id && a.action === 'visit').length;
      const clicks = memAnalytics.filter(a => a.client_id === mc.id && a.action === 'click').length;

      res.json({
        id: mc.id,
        name: mc.name,
        category: mc.category || '',
        bio: mc.bio || '',
        avatar: mc.profile_image_url || '',
        banner: mc.banner_image_url || '',
        visits,
        clicks,
        status: mc.is_active ? 'active' : 'inactive',
        platforms: mapPlatforms(mc),
        customLinks,
        isPublicIndexed: true
      });
    }
  } catch (err: any) {
    console.error(`API Error: GET /api/clients/${slug} -`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// 3. Upsert / Save Client (Supports both Custom creation and editing)
app.post('/api/clients', async (req, res) => {
  const clientData = req.body;
  if (!clientData.id || !clientData.name) {
    return res.status(400).json({ error: 'Missing client id or name parameters.' });
  }

  // Auto-sanitize the lowercase slug
  const slug = clientData.id.toLowerCase().replace(/[^a-z0-9-_]/g, '');

  const pValues: Record<string, string> = {};
  if (clientData.platforms) {
    clientData.platforms.forEach((p: any) => {
      pValues[p.id] = p.enabled ? p.value : '';
    });
  }

  const isActive = clientData.status === 'active';

  try {
    if (usePostgres && pool) {
      // PostgreSQL Upsert
      await pool.query(`
        INSERT INTO clients (
          id, name, slug, category, bio, profile_image_url, banner_image_url,
          phone, whatsapp, email, website, google_maps, instagram, twitter,
          tiktok, snapchat, youtube, linkedin, facebook, telegram, is_active, updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21, NOW())
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          slug = EXCLUDED.slug,
          category = EXCLUDED.category,
          bio = EXCLUDED.bio,
          profile_image_url = EXCLUDED.profile_image_url,
          banner_image_url = EXCLUDED.banner_image_url,
          phone = EXCLUDED.phone,
          whatsapp = EXCLUDED.whatsapp,
          email = EXCLUDED.email,
          website = EXCLUDED.website,
          google_maps = EXCLUDED.google_maps,
          instagram = EXCLUDED.instagram,
          twitter = EXCLUDED.twitter,
          tiktok = EXCLUDED.tiktok,
          snapchat = EXCLUDED.snapchat,
          youtube = EXCLUDED.youtube,
          linkedin = EXCLUDED.linkedin,
          facebook = EXCLUDED.facebook,
          telegram = EXCLUDED.telegram,
          is_active = EXCLUDED.is_active,
          updated_at = NOW()
      `, [
        clientData.id,
        clientData.name,
        slug,
        clientData.category || '',
        clientData.bio || '',
        clientData.avatar || '',
        clientData.banner || '',
        pValues['phone'] || '',
        pValues['whatsapp'] || '',
        pValues['email'] || '',
        pValues['website'] || '',
        pValues['maps'] || '',
        pValues['instagram'] || '',
        pValues['twitter'] || '',
        pValues['tiktok'] || '',
        pValues['snapchat'] || '',
        pValues['youtube'] || '',
        pValues['linkedin'] || '',
        pValues['facebook'] || '',
        pValues['telegram'] || '',
        isActive
      ]);

      // Remove existing custom links for client and insert current ones
      await pool.query('DELETE FROM client_links WHERE client_id = $1', [clientData.id]);

      if (clientData.customLinks && clientData.customLinks.length > 0) {
        for (let i = 0; i < clientData.customLinks.length; i++) {
          const cl = clientData.customLinks[i];
          const linkId = cl.id || `${clientData.id}-custom-${i}-${Date.now()}`;
          await pool.query(`
            INSERT INTO client_links (id, client_id, title, url, icon, is_active, sort_order)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [
            linkId,
            clientData.id,
            cl.title,
            cl.url,
            'link',
            true,
            i
          ]);
        }
      }
      console.log(`Saved and synchronized profile slug: ${slug} in PostgreSQL`);
      res.json({ success: true, slug });
    } else {
      // In-Memory operations
      memClients = memClients.filter(c => c.id !== clientData.id);
      memClients.push({
        id: clientData.id,
        slug,
        name: clientData.name,
        category: clientData.category || '',
        bio: clientData.bio || '',
        profile_image_url: clientData.avatar || '',
        banner_image_url: clientData.banner || '',
        phone: pValues['phone'] || '',
        whatsapp: pValues['whatsapp'] || '',
        email: pValues['email'] || '',
        website: pValues['website'] || '',
        google_maps: pValues['maps'] || '',
        instagram: pValues['instagram'] || '',
        twitter: pValues['twitter'] || '',
        tiktok: pValues['tiktok'] || '',
        snapchat: pValues['snapchat'] || '',
        youtube: pValues['youtube'] || '',
        linkedin: pValues['linkedin'] || '',
        facebook: pValues['facebook'] || '',
        telegram: pValues['telegram'] || '',
        is_active: isActive,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      // Override links
      memLinks = memLinks.filter(l => l.client_id !== clientData.id);
      if (clientData.customLinks && clientData.customLinks.length > 0) {
        clientData.customLinks.forEach((cl: any, i: number) => {
          memLinks.push({
            id: cl.id || `${clientData.id}-custom-${i}-${Date.now()}`,
            client_id: clientData.id,
            title: cl.title,
            url: cl.url,
            icon: 'link',
            is_active: true,
            sort_order: i,
            created_at: new Date().toISOString()
          });
        });
      }
      res.json({ success: true, slug });
    }
  } catch (err: any) {
    console.error('API Error: POST /api/clients -', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 4. Delete Client
app.delete('/api/clients/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (usePostgres && pool) {
      await pool.query('DELETE FROM clients WHERE id = $1', [id]);
      res.json({ success: true });
    } else {
      memClients = memClients.filter(c => c.id !== id);
      memLinks = memLinks.filter(l => l.client_id !== id);
      memAnalytics = memAnalytics.filter(a => a.client_id !== id);
      res.json({ success: true });
    }
  } catch (err: any) {
    console.error('API Error: DELETE /api/clients -', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 5. Track Analytics Interaction Event (Visit or Link click redirects)
app.post('/api/analytics', async (req, res) => {
  const { client_id, link_type, link_id, action } = req.body;
  if (!client_id || !action) {
    return res.status(400).json({ error: 'Missing client_id or action parameters.' });
  }

  const generatedId = `an-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

  try {
    if (usePostgres && pool) {
      await pool.query(`
        INSERT INTO analytics (id, client_id, link_type, link_id, action)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        generatedId,
        client_id,
        link_type || null,
        link_id || null,
        action
      ]);
      res.json({ success: true });
    } else {
      memAnalytics.push({
        id: generatedId,
        client_id,
        link_type: link_type || '',
        link_id: link_id || null,
        action,
        created_at: new Date().toISOString()
      });
      res.json({ success: true });
    }
  } catch (err: any) {
    console.error('API Error: POST /api/analytics -', err.message);
    res.status(500).json({ error: err.message });
  }
});


// Start server listening & execute initial migrations
async function run() {
  await initDatabase();

  // Vite middleware setup for assets in Development vs Production compiled Static fallback
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Media Land NodeJS Full Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

run();
