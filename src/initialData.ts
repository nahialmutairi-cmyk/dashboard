import { Client } from './types';

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'digital-creator',
    name: 'Sarah Jenkins',
    category: 'Creative Director & Content Strategist',
    bio: 'Creative Director & Content Strategist based in London. Helping brands reach 500k+ tech enthusiasts daily.',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIbOnk56LrPDV-NKv8XDwTyRjJfnAkqy5pi89eQyx_J6Pb_2uH433axYLNLKJsoPHr_0NVYRhnYo6Bb__UzHcDV9wJ2SUf_CIk7rjJvqKDAciiLyEIsuPJ5ZK5qJkYQYa9Dqfqh6HJZEurkxph9EegmcwLdwR7RZ2nIoQAnHFktfRkMTpOL-x9Zgz7fT1W8JSD0SBWr2Nnr63sfF9mVG_LBK6D5IplINp6YQLNYVvSgW_sQ85RfGTouA',
    banner: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9RoVBXm6p0HFwdSKeKnoIgHWSaRBVLnpIh_9xy1hm316pGeoHmeFRRH5SRVDoO8w9iHf8gv5pXlavJOyOm1iJzfA8IHWYNMIiTN_35GqlG3TIN0Nynsagpu7pZ-jOOYxO9DFTFL6NyeErUizKaPqlgDhWjNux3aU5503JAkrGRP24awBC7xBt8wagm37ShISxEK_iAz7K7kiNzG3XprsXgUtd7-EN1AYD6TcoILhQXzJ5ZQ97c_90HQ',
    visits: 12400,
    clicks: 3200,
    status: 'active',
    platforms: [
      { id: 'phone', name: 'Phone', icon: 'Phone', placeholder: 'Direct mobile number', enabled: true, value: '+44 20 7123 4567' },
      { id: 'whatsapp', name: 'WhatsApp', icon: 'MessageCircle', placeholder: 'WhatsApp number or link', enabled: true, value: 'https://wa.me/442071234567' },
      { id: 'email', name: 'Email', icon: 'Mail', placeholder: 'Contact email address', enabled: true, value: 'sarah@medialand.agency' },
      { id: 'instagram', name: 'Instagram', icon: 'Instagram', placeholder: 'Username or profile URL', enabled: true, value: 'https://instagram.com/sarah_jenkins' },
      { id: 'tiktok', name: 'TikTok', icon: 'Music2', placeholder: '@username', enabled: true, value: '@sarah' },
      { id: 'linkedin', name: 'LinkedIn', icon: 'Linkedin', placeholder: 'Profile URL', enabled: true, value: 'https://linkedin.com/' },
      { id: 'youtube', name: 'YouTube', icon: 'Youtube', placeholder: 'Channel URL', enabled: true, value: 'https://youtube.com/' },
      { id: 'maps', name: 'Google Maps', icon: 'MapPin', placeholder: 'Location or Google Maps URL', enabled: true, value: 'https://maps.google.com' }
    ],
    customLinks: [
      { id: 'p1', title: 'View My Portfolio', url: 'https://sarahjenkins.design' }
    ],
    isPublicIndexed: true
  },
  {
    id: 'real-estate',
    name: 'Real Estate Pro',
    category: 'Luxury Property Showcase',
    bio: 'Bespoke real estate consultancy specializing in architectural masterpieces and luxury estates in Belgravia and Mayfair.',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAXGp70BwjH6_lgkMxZ22ERRodnm_8d_RiKbdcVqyc3leRzAcTx61bG4tER24-t4hCdLEUiAkLf87zk2il31Wfa9uknQZXThlv5YzInkT_atcUjLGVs1NLqmSJA-UxqKXti0qXIlLuBcUevHTN8HK_Vhz7Domea2vf23M-JaSjhZABFYSaBuKXUPT3InELOSbEYl-74PxlQhGBrJ7FnBgplK9qvSSCzHRk76S0j-L3Z7NszBRoPDrJPRw',
    banner: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxww0eb3hQIuZZI3IgZr_5ajTNe92Ut7rR-bN89q8n-vAVD9fL_gcAIf9OPkkNf6L9v_E6GI6emHZbFz7mU3CBxENCI6KBvYgaMtSnJ7xTvYrr9HXMEMBZhAR2fdZNl_bM7vPPCH2GQU9XzTNr5OkddzqW_cfGirD54UpTWQP-8bh69j5c-4k-cBsp7gtygCUAL1Mc9lG8yGQstK5TTxqmryp8wCmrrUA8waxAwIVZhgQbzP3xLB3ipg',
    visits: 45800,
    clicks: 1100,
    status: 'active',
    platforms: [
      { id: 'phone', name: 'Phone', icon: 'Phone', placeholder: 'Direct mobile number', enabled: true, value: '+44 20 7987 6543' },
      { id: 'whatsapp', name: 'WhatsApp', icon: 'MessageCircle', placeholder: 'WhatsApp number or link', enabled: true, value: 'https://wa.me/442079876543' },
      { id: 'email', name: 'Email', icon: 'Mail', placeholder: 'Contact email address', enabled: true, value: 'estates@medialand.agency' },
      { id: 'instagram', name: 'Instagram', icon: 'Instagram', placeholder: 'Username or profile URL', enabled: true, value: 'https://instagram.com/luxury_estates' },
      { id: 'tiktok', name: 'TikTok', icon: 'Music2', placeholder: '@username', enabled: false, value: '' },
      { id: 'linkedin', name: 'LinkedIn', icon: 'Linkedin', placeholder: 'Profile URL', enabled: true, value: 'https://linkedin.com/' },
      { id: 'youtube', name: 'YouTube', icon: 'Youtube', placeholder: 'Channel URL', enabled: true, value: 'https://youtube.com/' },
      { id: 'maps', name: 'Google Maps', icon: 'MapPin', placeholder: 'Location or Google Maps URL', enabled: true, value: 'https://maps.google.com' }
    ],
    customLinks: [
      { id: 're1', title: 'Browse Autumn Catalog', url: 'https://luxurymayfair.realestate' }
    ],
    isPublicIndexed: true
  },
  {
    id: 'tech-startup',
    name: 'Tech Startup',
    category: 'SaaS Launch Pad',
    bio: 'Next-generation developers building AI-assisted developer environments and high-performance server runtimes.',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCk2SoEyLfAXaRDWoSIXV5hyi5Sgb0CgMzbpt3nNUZY2MlYWZf9evgJtAJc9IO3nuVBvOwI0VVAXrkyMtpdtY3oD2fpU_8WfJH9iSO7MV5P4YCsj_jwvA6EGt1x6KO2NJMwklAYyynH4IGQFNImKI32aTLMYxweLcSqiz6ZPPBoI5ukLLyyjLrFdw5VBgL89-zGO_PTnnafVJ5tThIvvDkOxNcXwXQdYgLCM2n3V53D94j1gd1EWV-AhA',
    banner: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBEILQGGgmpQSr7F1MNBjU7HLOpeXuhiBZrza9DzBsENZMdEBmy-EShaMSRhBgD-7x3tVr90axlnljb6dKRLfBs5oL-EDvxHCMIFsbiOtYuf3BMnzIqDQ0dUAv_p4qpFCMqsmNo3Vhd2wY-n9MPFPOlyMYhcjXh_fDtXB_gDNXMNjsXMG-5OcxUxqqwjZ76FzNdIwPmKsHbdi4CyH2XgP3d1bFuFen86SLnwT5UQHxt1EysCgmztSCcDg',
    visits: 2400,
    clicks: 842,
    status: 'active',
    platforms: [
      { id: 'phone', name: 'Phone', icon: 'Phone', placeholder: 'Direct mobile number', enabled: false, value: '' },
      { id: 'whatsapp', name: 'WhatsApp', icon: 'MessageCircle', placeholder: 'WhatsApp number or link', enabled: false, value: '' },
      { id: 'email', name: 'Email', icon: 'Mail', placeholder: 'Contact email address', enabled: true, value: 'contact@techstartup.io' },
      { id: 'instagram', name: 'Instagram', icon: 'Instagram', placeholder: 'Username or profile URL', enabled: false, value: '' },
      { id: 'tiktok', name: 'TikTok', icon: 'Music2', placeholder: '@username', enabled: false, value: '' },
      { id: 'linkedin', name: 'LinkedIn', icon: 'Linkedin', placeholder: 'Profile URL', enabled: true, value: 'https://linkedin.com/company/techstartup' },
      { id: 'youtube', name: 'YouTube', icon: 'Youtube', placeholder: 'Channel URL', enabled: true, value: 'https://youtube.com/' },
      { id: 'maps', name: 'Google Maps', icon: 'MapPin', placeholder: 'Location or Google Maps URL', enabled: true, value: 'https://maps.google.com' }
    ],
    customLinks: [
      { id: 'ts1', title: 'Schedule Sandbox Demo', url: 'https://techstartup.io/demo' }
    ],
    isPublicIndexed: true
  }
];
