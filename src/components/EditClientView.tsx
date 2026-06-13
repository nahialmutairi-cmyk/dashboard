import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Save, Trash2, Plus, Sparkles, AlertTriangle, Link as LinkIcon, Settings, ToggleLeft, ToggleRight, FileText, Image as ImageIcon } from 'lucide-react';
import { Client, PlatformLink, CustomLink } from '../types';
import { translations } from '../translations';
import ProfilePreviewView from './ProfilePreviewView';

interface EditClientViewProps {
  client: Client;
  onSave: (updatedClient: Client) => void;
  onDiscard: () => void;
  language: 'en' | 'ar';
}

export default function EditClientView({ client, onSave, onDiscard, language }: EditClientViewProps) {
  const [name, setName] = useState(client.name);
  const [category, setCategory] = useState(client.category);
  const [bio, setBio] = useState(client.bio);
  const [avatar, setAvatar] = useState(client.avatar);
  const [banner, setBanner] = useState(client.banner);
  const [isPublicIndexed, setIsPublicIndexed] = useState(client.isPublicIndexed);
  const [platforms, setPlatforms] = useState<PlatformLink[]>([...client.platforms]);
  const [customLinks, setCustomLinks] = useState<CustomLink[]>([...client.customLinks]);
  
  const t = translations[language];
  const isRtl = language === 'ar';

  // Real-time modified client object helper to feed into the Preview screen
  const currentModifiedClient: Client = {
    ...client,
    name,
    category,
    bio,
    avatar,
    banner,
    isPublicIndexed,
    platforms,
    customLinks
  };

  const handlePlatformToggle = (platformId: string) => {
    setPlatforms(
      platforms.map((p) => {
        if (p.id === platformId) {
          const nextState = !p.enabled;
          return {
            ...p,
            enabled: nextState,
            // Give it some default initial placeholder text so it populates nicely on toggle-on
            value: nextState && !p.value ? getPlatformDefaultValue(platformId) : p.value
          };
        }
        return p;
      })
    );
  };

  const handlePlatformValueChange = (platformId: string, value: string) => {
    setPlatforms(
      platforms.map((p) => {
        if (p.id === platformId) {
          return { ...p, value };
        }
        return p;
      })
    );
  };

  const getPlatformDefaultValue = (id: string) => {
    switch (id) {
      case 'phone': return '+44 20 7123 4567';
      case 'whatsapp': return 'https://wa.me/442071234567';
      case 'email': return 'sarah@medialand.agency';
      case 'instagram': return 'https://instagram.com/sarah_jenkins';
      case 'tiktok': return '@sarah';
      case 'linkedin': return 'https://linkedin.com/';
      case 'youtube': return 'https://youtube.com/';
      case 'maps': return 'https://maps.google.com';
      default: return '';
    }
  };

  const addCustomLink = () => {
    const newLink: CustomLink = {
      id: `custom-${Date.now()}`,
      title: isRtl ? 'رابط ترويجي مميز جديد' : 'New Featured Link',
      url: 'https://'
    };
    setCustomLinks([...customLinks, newLink]);
  };

  const removeCustomLink = (id: string) => {
    setCustomLinks(customLinks.filter((link) => link.id !== id));
  };

  const handleCustomLinkChange = (id: string, field: 'title' | 'url', value: string) => {
    setCustomLinks(
      customLinks.map((link) => {
        if (link.id === id) {
          return { ...link, [field]: value };
        }
        return link;
      })
    );
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(currentModifiedClient);
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-zinc-950 text-zinc-100" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Top Navbar */}
      <header className="flex justify-between items-center px-8 h-20 bg-[#131313] border-b border-zinc-850 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button
            onClick={onDiscard}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            {isRtl ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
          </button>
          <div>
            <h2 className="text-lg font-extrabold text-white tracking-tight">
              {t.editClientTitle}: <span className="text-zinc-400">{client.name}</span>
            </h2>
            <p className="text-xs text-zinc-500">{t.editClientSub}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onDiscard}
            className="px-5 py-2 border border-zinc-800 text-zinc-400 rounded-xl hover:bg-zinc-900 font-semibold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            {t.discardBtn}
          </button>
          <button
            onClick={handleSaveSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 font-semibold text-xs uppercase tracking-wider transition-all shadow-lg glow-btn active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{t.saveClientBtn}</span>
          </button>
        </div>
      </header>

      {/* Main Splitscreen Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Scrollable Forms */}
        <div className="flex-1 overflow-y-auto px-8 py-10 space-y-8 custom-scrollbar">
          
          {/* Profile Details Workspace */}
          <section className="bg-[#141414] p-6 rounded-2xl border border-zinc-850 space-y-6">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-[#e5e2e1] flex items-center gap-2 border-b border-zinc-850 pb-3">
              <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
              <span>{t.profileInfoTitle}</span>
            </h3>

            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Avatar upload Preview */}
              <div className="flex flex-col items-center gap-3 md:w-1/3">
                <div className="relative group w-32 h-32 rounded-full border-2 border-dashed border-zinc-800 hover:border-blue-500 flex items-center justify-center overflow-hidden bg-zinc-900 transition-all cursor-pointer">
                  <img
                    alt="Profile Preview"
                    src={avatar}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ImageIcon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider text-center">
                  {t.avatarPortrait}
                </span>
              </div>

              {/* Display fields */}
              <div className="flex-1 w-full space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    {t.displayNameLabel}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#0e0e0e] border border-zinc-800 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    {t.roleSpecialtyLabel}
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#0e0e0e] border border-zinc-800 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 text-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                {t.bioLabel}
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-[#0e0e0e] border border-zinc-800 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 text-white resize-none"
              />
            </div>

            {/* Custom URL inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  {t.avatarUrlLabel}
                </label>
                <input
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full bg-[#0e0e0e] border border-zinc-800 rounded-lg p-2.5 text-xs text-blue-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  {t.bannerUrlLabel}
                </label>
                <input
                  type="text"
                  value={banner}
                  onChange={(e) => setBanner(e.target.value)}
                  className="w-full bg-[#0e0e0e] border border-zinc-800 rounded-lg p-2.5 text-xs text-purple-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </section>

          {/* Platforms Link Toggles */}
          <section className="bg-[#141414] p-6 rounded-2xl border border-zinc-850 space-y-5">
            <div className="flex justify-between items-center mb-4 border-b border-zinc-850 pb-3">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-[#e5e2e1] flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-purple-500" />
                <span>{t.platformConnectivity}</span>
              </h3>
              <span className="text-[10px] font-bold text-[#e5e2e1] bg-zinc-850 px-3 py-1 rounded-full uppercase">
                {t.standardSlots}
              </span>
            </div>

            <div className="space-y-3">
              {platforms.map((p) => (
                <div
                  key={p.id}
                  className="p-4 bg-zinc-900/60 border border-zinc-850 rounded-xl transition-all hover:bg-zinc-900 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#141414] flex items-center justify-center border border-zinc-800 group-hover:border-zinc-700 transition-colors">
                        <span className="text-xs font-mono font-bold text-zinc-400">
                          {p.name[0]}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-extrabold text-[#e5e2e1] group-hover:text-blue-400 transition-colors">
                          {p.name}
                        </span>
                        <p className="text-[10px] text-zinc-500">{t.slotSubtitle}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePlatformToggle(p.id)}
                      className="text-zinc-400 hover:text-white transition-all cursor-pointer"
                    >
                      {p.enabled ? (
                        <div className="flex items-center gap-1.5 text-blue-500 font-bold text-[10px] uppercase tracking-wider select-none">
                          <span>{t.activeLabel}</span>
                          <ToggleRight className="w-7 h-7" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-zinc-500 font-bold text-[10px] uppercase tracking-wider select-none">
                          <span>{t.inactiveLabel}</span>
                          <ToggleLeft className="w-7 h-7" />
                        </div>
                      )}
                    </button>
                  </div>

                  {/* Open field inputs to record specific platform url/username if verified */}
                  {p.enabled && (
                    <div className="mt-4 pt-3 border-t border-zinc-850 animate-in fade-in slide-in-from-top-2 duration-200">
                      <input
                        type="text"
                        placeholder={p.placeholder}
                        value={p.value}
                        onChange={(e) => handlePlatformValueChange(p.id, e.target.value)}
                        className="w-full bg-[#111] border border-blue-600/30 rounded-lg p-2 text-xs focus:outline-none focus:border-blue-500 text-blue-300"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Custom links bespoke URLs */}
          <section className="bg-[#141414] p-6 rounded-2xl border border-zinc-850 space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-850 pb-3">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-[#e5e2e1] flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-500" />
                <span>{t.customCampaignsTitle}</span>
              </h3>
              <button
                type="button"
                onClick={addCustomLink}
                className="flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.addNewCustomLink}</span>
              </button>
            </div>

            {customLinks.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-zinc-850 rounded-xl bg-zinc-900/10">
                <p className="text-zinc-500 text-xs font-medium">
                  {t.noCustomLinks}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {customLinks.map((link) => (
                  <div
                    key={link.id}
                    className="flex flex-col md:flex-row gap-3 p-4 bg-zinc-900/60 border border-zinc-850 rounded-xl relative"
                  >
                    <div className="flex-1">
                      <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wide mb-1 block">
                        {t.linkTitleLabel}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Portfolio"
                        value={link.title}
                        onChange={(e) => handleCustomLinkChange(link.id, 'title', e.target.value)}
                        className="w-full bg-[#0e0e0e] border border-zinc-800 rounded p-2 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="flex-[2]">
                      <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wide mb-1 block">
                        {t.navigationUrlLabel}
                      </label>
                      <input
                        type="text"
                        placeholder="https://..."
                        value={link.url}
                        onChange={(e) => handleCustomLinkChange(link.id, 'url', e.target.value)}
                        className="w-full bg-[#0e0e0e] border border-zinc-800 rounded p-2 text-xs text-zinc-400 focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>

                    <div className="flex items-end justify-center">
                      <button
                        type="button"
                        onClick={() => removeCustomLink(link.id)}
                        className="p-2.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Visibility status */}
          <section className="bg-[#141414] p-6 rounded-2xl border border-zinc-850 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-white">{t.publicVisibilityTitle}</h3>
              <p className="text-xs text-zinc-500">{t.publicVisibilitySub}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsPublicIndexed(!isPublicIndexed)}
              className="cursor-pointer"
            >
              {isPublicIndexed ? (
                <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-4 py-2 rounded-xl">
                  <span>{t.indexedPublicly}</span>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-zinc-850 text-zinc-400 text-xs font-bold px-4 py-2 rounded-xl border border-zinc-800">
                  <span>{t.privateOnly}</span>
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
                </div>
              )}
            </button>
          </section>

        </div>

        {/* Right Side: LIVE DEVICE PREVIEWER */}
        <div className="hidden lg:flex w-[400px] border-l border-zinc-850 bg-[#0e0e0e] flex-col items-center justify-center p-8 select-none">
          <div className="mb-4 text-center">
            <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
              {t.realtimeMockupTitle}
            </span>
            <p className="text-[11px] text-zinc-500 mt-1.5">{t.realtimeMockupSub}</p>
          </div>
          <ProfilePreviewView client={currentModifiedClient} isInsideEmbed={true} language={language} />
        </div>

      </div>

    </div>
  );
}
