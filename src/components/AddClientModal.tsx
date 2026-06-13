import React, { useState } from 'react';
import { X, Plus, Sparkles, User, FileText, Image as ImageIcon, BarChart3, Upload, Search } from 'lucide-react';
import { Client } from '../types';
import { translations } from '../translations';

const COUNTRIES_LIST = [
  { code: '+965', flag: '🇰🇼', nameAr: 'الكويت', nameEn: 'Kuwait' },
  { code: '+966', flag: '🇸🇦', nameAr: 'السعودية', nameEn: 'Saudi Arabia' },
  { code: '+971', flag: '🇦🇪', nameAr: 'الإمارات', nameEn: 'UAE' },
  { code: '+974', flag: '🇶🇦', nameAr: 'قطر', nameEn: 'Qatar' },
  { code: '+973', flag: '🇧🇭', nameAr: 'البحرين', nameEn: 'Bahrain' },
  { code: '+968', flag: '🇴🇲', nameAr: 'عمان', nameEn: 'Oman' },
  { code: '+20', flag: '🇪🇬', nameAr: 'مصر', nameEn: 'Egypt' },
  { code: '+1', flag: '🇺🇸', nameAr: 'الولايات المتحدة', nameEn: 'United States' },
  { code: '+44', flag: '🇬🇧', nameAr: 'المملكة المتحدة', nameEn: 'United Kingdom' }
];

// Base64 file converter utility
const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

interface AddClientModalProps {
  onClose: () => void;
  onAdd: (client: Client) => void;
  language: 'en' | 'ar';
}

const DEFAULT_AVATARS = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCIbOnk56LrPDV-NKv8XDwTyRjJfnAkqy5pi89eQyx_J6Pb_2uH433axYLNLKJsoPHr_0NVYRhnYo6Bb__UzHcDV9wJ2SUf_CIk7rjJvqKDAciiLyEIsuPJ5ZK5qJkYQYa9Dqfqh6HJZEurkxph9EegmcwLdwR7RZ2nIoQAnHFktfRkMTpOL-x9Zgz7fT1W8JSD0SBWr2Nnr63sfF9mVG_LBK6D5IplINp6YQLNYVvSgW_sQ85RfGTouA', // Sarah Jenkins Style
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBwAOBq7d4DVCLjB7Jiy9XiSp7fozlYyncXxZvrIe7LdkFYukXL3jBAZLFnxc18GVJZzl6MEH3AtyLuBYZmnXjNRku7dW26XLDxBnfolXTvqeeztvew2GqTbolg2n-_uthpgwvmqBmP0dHAY4e8CNFDg12yclIZsHWgKBXjTUg7NwrS_u2sNX5L71H4l7yXFrGncA_BRRRp_NkHwPXcnbPF4JnJ8cacttMVkNKaZKrgahqMljpn-Lt2Xg', // Creator Man
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAXGp70BwjH6_lgkMxZ22ERRodnm_8d_RiKbdcVqyc3leRzAcTx61bG4tER24-t4hCdLEUiAkLf87zk2il31Wfa9uknQZXThlv5YzInkT_atcUjLGVs1NLqmSJA-UxqKXti0qXIlLuBcUevHTN8HK_Vhz7Domea2vf23M-JaSjhZABFYSaBuKXUPT3InELOSbEYl-74PxlQhGBrJ7FnBgplK9qvSSCzHRk76S0j-L3Z7NszBRoPDrJPRw', // Realtor
];

const DEFAULT_BANNERS = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC9RoVBXm6p0HFwdSKeKnoIgHWSaRBVLnpIh_9xy1hm316pGeoHmeFRRH5SRVDoO8w9iHf8gv5pXlavJOyOm1iJzfA8IHWYNMIiTN_35GqlG3TIN0Nynsagpu7pZ-jOOYxO9DFTFL6NyeErUizKaPqlgDhWjNux3aU5503JAkrGRP24awBC7xBt8wagm37ShISxEK_iAz7K7kiNzG3XprsXgUtd7-EN1AYD6TcoILhQXzJ5ZQ97c_90HQ',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCxww0eb3hQIuZZI3IgZr_5ajTNe92Ut7rR-bN89q8n-vAVD9fL_gcAIf9OPkkNf6L9v_E6GI6emHZbFz7mU3CBxENCI6KBvYgaMtSnJ7xTvYrr9HXMEMBZhAR2fdZNl_bM7vPPCH2GQU9XzTNr5OkddzqW_cfGirD54UpTWQP-8bh69j5c-4k-cBsp7gtygCUAL1Mc9lG8yGQstK5TTxqmryp8wCmrrUA8waxAwIVZhgQbzP3xLB3ipg',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBEILQGGgmpQSr7F1MNBjU7HLOpeXuhiBZrza9DzBsENZMdEBmy-EShaMSRhBgD-7x3tVr90axlnljb6dKRLfBs5oL-EDvxHCMIFsbiOtYuf3BMnzIqDQ0dUAv_p4qpFCMqsmNo3Vhd2wY-n9MPFPOlyMYhcjXh_fDtXB_gDNXMNjsXMG-5OcxUxqqwjZ76FzNdIwPmKsHbdi4CyH2XgP3d1bFuFen86SLnwT5UQHxt1EysCgmztSCcDg',
];

export default function AddClientModal({ onClose, onAdd, language }: AddClientModalProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugError, setSlugError] = useState<string | null>(null);
  const [category, setCategory] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState(DEFAULT_AVATARS[0]);
  const [banner, setBanner] = useState(DEFAULT_BANNERS[0]);
  const [visits, setVisits] = useState('11500');
  const [clicks, setClicks] = useState('2400');
  const [customAvatar, setCustomAvatar] = useState('');
  const [customBanner, setCustomBanner] = useState('');
  
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  const [countryCode, setCountryCode] = useState('+965');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const t = translations[language];
  const isRtl = language === 'ar';

  const handleSlugChange = (val: string) => {
    // Live sanitization: convert spaces to hyphens, force lowercase, and allow only lowercase english letters, numbers, and hyphens
    const sanitized = val
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    setSlug(sanitized);
    setSlugError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category) return;
    setSlugError(null);
    setPhoneError(null);

    // Validate the slug
    const finalSlug = slug.trim().toLowerCase().replace(/\s+/g, '-');
    if (!finalSlug) {
      setSlugError(isRtl ? 'اسم المستخدم مطلوب ولا يمكن تركه فارغاً.' : 'Username/slug is required and cannot be empty.');
      return;
    }
    
    if (finalSlug === '-') {
      setSlugError(isRtl ? 'اسم المستخدم لا يمكن أن يكون شرطة "-" فقط.' : 'Username/slug cannot be only "-".');
      return;
    }

    // Allow only lowercase English letters, numbers, and hyphen, reject Arabic characters
    const validRegex = /^[a-z0-9-]+$/;
    if (!validRegex.test(finalSlug)) {
      setSlugError(t.slugErrorFormat);
      return;
    }

    // Validate Phone and Country Code
    const cleanedPhone = phoneNumber.replace(/[^0-9]/g, '');
    if (!cleanedPhone) {
      setPhoneError(isRtl ? 'رقم الهاتف مطلوب.' : 'Phone number is required.');
      return;
    }
    if (cleanedPhone.length < 5) {
      setPhoneError(isRtl ? 'رقم الهاتف غير صالح وقصير جداً.' : 'Phone number is too short.');
      return;
    }
    if (!countryCode || !countryCode.startsWith('+') || countryCode.length < 2) {
      setPhoneError(isRtl ? 'رمز الدولة غير صالح. مثال: +965' : 'Invalid country code. e.g. +965');
      return;
    }

    // Validate slug uniqueness before saving!
    try {
      const response = await fetch(`/api/getPublicProfileBySlug?slug=${finalSlug}`);
      if (response.ok) {
        // Find existing client with same slug
        setSlugError(t.slugErrorExists);
        return;
      }
    } catch (_) {
      // Ignore network errors or offline, proceed to insert
    }

    const finalAvatar = customAvatar.trim() || avatar;
    const finalBanner = customBanner.trim() || banner;

    const newClient: Client = {
      id: finalSlug, // The id matches the slug
      slug: finalSlug,
      name,
      category,
      bio: bio || `${name} specialized in ${category}.`,
      avatar: finalAvatar,
      banner: finalBanner,
      visits: parseInt(visits, 10) || 0,
      clicks: parseInt(clicks, 10) || 0,
      status: 'active',
      country_code: countryCode,
      phone_number: cleanedPhone,
      platforms: [
        { id: 'phone', name: 'Phone', icon: 'Phone', placeholder: 'Direct mobile number', enabled: true, value: `${countryCode}${cleanedPhone}` },
        { id: 'whatsapp', name: 'WhatsApp', icon: 'MessageCircle', placeholder: 'WhatsApp or link', enabled: true, value: `https://wa.me/${countryCode.replace('+', '')}${cleanedPhone}` },
        { id: 'email', name: 'Email', icon: 'Mail', placeholder: 'Contact email address', enabled: true, value: 'hello@agency.com' },
        { id: 'instagram', name: 'Instagram', icon: 'Instagram', placeholder: 'Username or profile URL', enabled: true, value: 'https://instagram.com/' },
        { id: 'tiktok', name: 'TikTok', icon: 'Music2', placeholder: '@username', enabled: false, value: '' },
        { id: 'linkedin', name: 'LinkedIn', icon: 'Linkedin', placeholder: 'Profile URL', enabled: true, value: 'https://linkedin.com/' },
        { id: 'youtube', name: 'YouTube', icon: 'Youtube', placeholder: 'Channel URL', enabled: false, value: '' },
        { id: 'maps', name: 'Google Maps', icon: 'MapPin', placeholder: 'Location or Google Maps URL', enabled: true, value: 'https://maps.google.com' }
      ],
      customLinks: [],
      isPublicIndexed: true
    };

    onAdd(newClient);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="relative w-full max-w-2xl bg-[#141414] border border-zinc-850 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
            <h3 className="text-lg font-bold text-white">{t.addClientModalTitle}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {slugError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs font-semibold leading-relaxed">
              {slugError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Display Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                {t.displayNameLabel}
              </label>
              <div className="relative flex items-center rounded-lg border border-zinc-800 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 bg-[#0e0e0e] overflow-hidden">
                <div className={`${isRtl ? 'pr-3 pl-1' : 'pl-3' } text-zinc-500`}><User className="w-4 h-4" /></div>
                <input
                  type="text"
                  required
                  placeholder={isRtl ? "مثال: سارة أحمد" : "e.g. Sarah Jenkins"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-transparent border-none text-[#e5e2e1] text-sm focus:outline-none"
                />
              </div>
            </div>

            {/* Username / Public Link Slug */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                {t.slugLabel}
              </label>
              <div className="relative flex items-center rounded-lg border border-zinc-800 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 bg-[#0e0e0e] overflow-hidden">
                <div className={`${isRtl ? 'pr-3 pl-1' : 'pl-3' } text-zinc-500`}><Sparkles className="w-4 h-4 text-zinc-500" /></div>
                <input
                  type="text"
                  required
                  placeholder={t.slugPlaceholder}
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  className="w-full px-3 py-2.5 bg-transparent border-none text-[#e5e2e1] text-sm focus:outline-none font-mono"
                />
              </div>
              <p className="text-[10px] text-zinc-500 font-semibold leading-tight">
                {isRtl ? 'رابط الصفحة العامة سيكون:' : 'Public link slug:'} <span className="text-blue-400 font-mono">/u/{slug || '...'}</span>
              </p>
            </div>
          </div>

          {/* Role / Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
              {t.roleSpecialtyLabel}
            </label>
            <div className="relative flex items-center rounded-lg border border-zinc-800 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 bg-[#0e0e0e] overflow-hidden">
              <div className={`${isRtl ? 'pr-3 pl-1' : 'pl-3' } text-zinc-500`}><Sparkles className="w-4 h-4" /></div>
              <input
                type="text"
                required
                placeholder={isRtl ? "مثال: مصممة وصانعة محتوى" : "e.g. Creative & Content Strategist"}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-transparent border-none text-[#e5e2e1] text-sm focus:outline-none"
              />
            </div>
          </div>

          {/* Professional Bio */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
              {t.bioLabel}
            </label>
            <div className="relative flex items-start rounded-lg border border-zinc-800 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 bg-[#0e0e0e] overflow-hidden">
              <div className={`${isRtl ? 'pr-3 pt-3.5' : 'pl-3 pt-3.5'} text-zinc-500`}><FileText className="w-4 h-4" /></div>
              <textarea
                rows={3}
                placeholder={isRtl ? "اكتب نبذة مختصرة عن الإنجازات المهنية والتخصص..." : "Give a short professional description of the client..."}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-2.5 bg-transparent border-none text-[#e5e2e1] text-sm focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Country Code & Phone Number Admin Block */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-900/40 p-4 border border-zinc-850 rounded-xl relative z-30">
            <div className="relative space-y-1">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                {isRtl ? 'مفتاح الدولة والرمز' : 'Country Flag & Code'}
              </label>
              <div className="flex gap-2 relative">
                <button
                  type="button"
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  className="bg-[#0e0e0e] border border-zinc-800 hover:border-zinc-700 transition-all rounded-lg px-3 py-2 text-sm text-white flex items-center justify-center gap-1.5 shrink-0 select-none cursor-pointer"
                >
                  <span className="text-base">{COUNTRIES_LIST.find(c => c.code === countryCode)?.flag || '🌍'}</span>
                  <span className="font-semibold font-mono">{countryCode}</span>
                  <span className="text-[10px] text-zinc-500">▼</span>
                </button>
                <input
                  type="text"
                  required
                  placeholder="+965"
                  value={countryCode}
                  onChange={(e) => {
                    let code = e.target.value.trim();
                    if (code && !code.startsWith('+')) {
                      code = '+' + code.replace(/[^0-9]/g, '');
                    } else if (code) {
                      code = '+' + code.substring(1).replace(/[^0-9]/g, '');
                    }
                    setCountryCode(code);
                  }}
                  className="w-full bg-[#0e0e0e] border border-zinc-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-white font-mono"
                />
                
                {/* Searchable dropdown menu */}
                {showCountryDropdown && (
                  <div className="absolute top-12 left-0 z-50 w-64 bg-[#121212] border border-zinc-800 rounded-xl shadow-2xl p-2.5 space-y-2 text-right">
                    <div className="relative flex items-center bg-[#070707] border border-zinc-850 rounded-lg px-2 py-1.5" dir="ltr">
                      <Search className="w-3.5 h-3.5 text-zinc-500 shrink-0 mr-1.5" />
                      <input
                        type="text"
                        autoFocus
                        placeholder={isRtl ? "ابحث عن دولة..." : "Search country..."}
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        className="w-full bg-transparent border-none text-xs text-white focus:outline-none placeholder:text-zinc-650"
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {COUNTRIES_LIST.filter(c => 
                        c.code.includes(countrySearch) || 
                        c.nameEn.toLowerCase().includes(countrySearch.toLowerCase()) || 
                        c.nameAr.includes(countrySearch)
                      ).map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => {
                            setCountryCode(c.code);
                            setShowCountryDropdown(false);
                            setCountrySearch('');
                          }}
                          className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-zinc-850 text-left cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span>{c.flag}</span>
                            <span className="text-xs text-zinc-300 font-semibold">{isRtl ? c.nameAr : c.nameEn}</span>
                          </div>
                          <span className="text-xs font-mono text-zinc-500 font-bold">{c.code}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                {isRtl ? 'رقم الهاتف (أرقام فقط)' : 'Phone Number (Digits only)'}
              </label>
              <input
                type="text"
                required
                placeholder="60000000"
                value={phoneNumber}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^0-9]/g, '');
                  setPhoneNumber(cleaned);
                  setPhoneError(null);
                }}
                className="w-full bg-[#0e0e0e] border border-zinc-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-white font-mono"
              />
              {phoneError && (
                <p className="text-[10px] text-red-400 font-semibold mt-1">{phoneError}</p>
              )}
            </div>
          </div>

          {/* Avatar Options */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
              {t.selectProfilePic}
            </label>
            <div className="flex flex-wrap gap-4 items-center">
              {DEFAULT_AVATARS.map((url, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    setAvatar(url);
                    setCustomAvatar('');
                  }}
                  className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    avatar === url && !customAvatar ? 'border-blue-500 scale-105' : 'border-zinc-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt={`Avatar option ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
              <div className="text-xs text-zinc-500 font-semibold uppercase">
                {t.orCustomUrl}
              </div>
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder={isRtl ? "رابط خارجي https://..." : "e.g. https://example.com/avatar.jpg"}
                value={customAvatar}
                onChange={(e) => setCustomAvatar(e.target.value)}
                className="flex-1 p-2.5 bg-[#0e0e0e] border border-zinc-800 rounded-lg text-xs placeholder:text-zinc-650 text-[#e5e2e1] focus:outline-none focus:border-blue-500"
              />
              <label className="shrink-0 bg-blue-600/10 hover:bg-blue-650 text-blue-400 hover:text-white border border-blue-500/25 px-4 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer relative">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isUploadingAvatar}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setIsUploadingAvatar(true);
                    try {
                      const url = await convertToBase64(file);
                      setCustomAvatar(url);
                      setAvatar(url);
                    } catch (err) {
                      alert(err instanceof Error ? err.message : 'Upload failed');
                    } finally {
                      setIsUploadingAvatar(false);
                    }
                  }}
                />
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploadingAvatar ? '...' : isRtl ? 'رفع' : 'Upload'}</span>
              </label>
            </div>
          </div>

          {/* Banner Options */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
              {t.selectCoverBanner}
            </label>
            <div className="flex flex-wrap gap-4 items-center">
              {DEFAULT_BANNERS.map((url, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    setBanner(url);
                    setCustomBanner('');
                  }}
                  className={`relative h-12 w-24 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                    banner === url && !customBanner ? 'border-blue-500 scale-105' : 'border-zinc-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt={`Banner option ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
              <div className="text-xs text-zinc-500 font-semibold uppercase">
                {t.orCustomUrl}
              </div>
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder={isRtl ? "رابط خارجي https://..." : "e.g. https://example.com/banner.jpg"}
                value={customBanner}
                onChange={(e) => setCustomBanner(e.target.value)}
                className="flex-1 p-2.5 bg-[#0e0e0e] border border-zinc-800 rounded-lg text-xs placeholder:text-zinc-650 text-[#e5e2e1] focus:outline-none focus:border-blue-500"
              />
              <label className="shrink-0 bg-blue-600/10 hover:bg-blue-650 text-blue-400 hover:text-white border border-blue-500/25 px-4 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer relative">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isUploadingBanner}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setIsUploadingBanner(true);
                    try {
                      const url = await convertToBase64(file);
                      setCustomBanner(url);
                      setBanner(url);
                    } catch (err) {
                      alert(err instanceof Error ? err.message : 'Upload failed');
                    } finally {
                      setIsUploadingBanner(false);
                    }
                  }}
                />
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploadingBanner ? '...' : isRtl ? 'رفع' : 'Upload'}</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Simulated visits */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                {t.simulatedVisits}
              </label>
              <div className="relative flex items-center rounded-lg border border-zinc-800 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 bg-[#0e0e0e] overflow-hidden">
                <div className={`${isRtl ? 'pr-3 pl-1' : 'pl-3' } text-zinc-500`}><BarChart3 className="w-4 h-4" /></div>
                <input
                  type="number"
                  required
                  placeholder="e.g. 15000"
                  value={visits}
                  onChange={(e) => setVisits(e.target.value)}
                  className="w-full px-3 py-2.5 bg-transparent border-none text-[#e5e2e1] text-sm focus:outline-none"
                />
              </div>
            </div>

            {/* Simulated clicks */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                {t.simulatedClicks}
              </label>
              <div className="relative flex items-center rounded-lg border border-zinc-800 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 bg-[#0e0e0e] overflow-hidden">
                <div className={`${isRtl ? 'pr-3 pl-1' : 'pl-3' } text-zinc-500`}><BarChart3 className="w-4 h-4" /></div>
                <input
                  type="number"
                  required
                  placeholder="e.g. 3500"
                  value={clicks}
                  onChange={(e) => setClicks(e.target.value)}
                  className="w-full px-3 py-2.5 bg-transparent border-none text-[#e5e2e1] text-sm focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-850 transition-colors text-xs font-semibold uppercase tracking-wider cursor-pointer"
            >
              {t.cancelBtn}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all text-xs font-semibold uppercase tracking-wider cursor-pointer"
            >
              {t.createAccountBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
