import React, { useState } from 'react';
import { Phone, MessageSquare, Mail, Instagram, Library, Linkedin, Youtube, MapPin, ChevronRight, ChevronLeft, ExternalLink, Sparkles } from 'lucide-react';
import { Client } from '../types';
import { translations } from '../translations';

interface ProfilePreviewViewProps {
  client: Client;
  onBack?: () => void;
  isInsideEmbed?: boolean; // True if rendered side-by-side or as widget, false if independent full page
  language?: 'en' | 'ar';
  onLinkClick?: () => void;
}

export default function ProfilePreviewView({ client, onBack, isInsideEmbed = false, language = 'en', onLinkClick }: ProfilePreviewViewProps) {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const t = translations[language];
  const isRtl = language === 'ar';

  const handleLinkClick = (title: string, url: string) => {
    setCopiedText(isRtl ? `تم التوجيه إلى: "${title}"` : `Redirecting to: "${title}"`);
    if (onLinkClick) {
      onLinkClick();
    }
    setTimeout(() => {
      // Safely open the link in a new tab
      window.open(url, '_blank', 'noopener,noreferrer');
      setCopiedText(null);
    }, 1000);
  };

  // Helper to map type icons to Lucide components
  const getIcon = (id: string) => {
    switch (id) {
      case 'phone': return <Phone className="w-5 h-5 text-blue-400" />;
      case 'whatsapp': return <MessageSquare className="w-5 h-5 text-emerald-400" />;
      case 'email': return <Mail className="w-5 h-5 text-amber-400" />;
      case 'instagram': return <Instagram className="w-5 h-5 text-pink-400" />;
      case 'tiktok': return <Library className="w-5 h-5 text-cyan-400" />;
      case 'linkedin': return <Linkedin className="w-5 h-5 text-sky-400" />;
      case 'youtube': return <Youtube className="w-5 h-5 text-red-500" />;
      case 'maps': return <MapPin className="w-5 h-5 text-blue-500" />;
      default: return <Sparkles className="w-5 h-5 text-zinc-400" />;
    }
  };

  const enabledPlatforms = client.platforms.filter((p) => p.enabled && p.value);
  const primaryPlatforms = enabledPlatforms.filter((p) => ['phone', 'whatsapp', 'email'].includes(p.id));
  const socialPlatforms = enabledPlatforms.filter((p) => !['phone', 'whatsapp', 'email', 'maps'].includes(p.id));
  const mapsPlatform = enabledPlatforms.find((p) => p.id === 'maps');

  // Preview page contents
  const previewBody = (
    <div className="relative z-10 w-full max-w-md mx-auto profile-gradient min-h-full flex flex-col items-center px-6 py-10" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Toast alert helper */}
      {copiedText && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#141414] border border-blue-500/30 text-xs text-blue-400 px-4 py-3 rounded-full shadow-2xl flex items-center gap-2 max-w-sm text-center">
          <Sparkles className="w-4 h-4 animate-spin text-blue-500" />
          <span>{copiedText}</span>
        </div>
      )}

      {/* Avatar portrait card */}
      <div className="flex flex-col items-center text-center w-full mb-8">
        <div className="relative mb-5 group">
          <div className="absolute inset-0 bg-blue-600 blur-md opacity-25 rounded-full group-hover:opacity-40 transition-opacity duration-300" />
          <img
            src={client.avatar}
            alt={client.name}
            className="relative w-32 h-32 rounded-full border-4 border-zinc-800 object-cover shadow-2xl"
          />
        </div>
        <h1 className="text-2xl font-bold text-[#e5e2e1] mb-2 leading-tight">
          {client.name}
        </h1>
        <p className="text-zinc-400 text-sm max-w-[280px]">
          {client.category}
        </p>
        <p className="text-zinc-500 text-xs mt-3 max-w-sm px-4">
          {client.bio}
        </p>
      </div>

      {/* Campaign custom links (Primary buttons) */}
      {client.customLinks.length > 0 && (
        <div className="w-full mb-8 space-y-3">
          <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">
            {t.featuredCampaigns}
          </h2>
          {client.customLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleLinkClick(link.title, link.url)}
              className="w-full bg-blue-600/15 border border-blue-500/30 hover:bg-blue-600/25 text-blue-300 p-4 rounded-xl flex items-center justify-between transition-all font-medium text-xs tracking-wide uppercase shadow-lg group cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                {link.title}
              </span>
              {isRtl ? (
                <ChevronLeft className="w-4 h-4 text-zinc-500 group-hover:text-blue-300 transition-colors" />
              ) : (
                <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-blue-300 transition-colors" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Primary connectivity links */}
      {primaryPlatforms.length > 0 && (
        <div className="w-full mb-8 space-y-3">
          {primaryPlatforms.map((p) => (
            <button
              key={p.id}
              onClick={() => handleLinkClick(`${client.name} ${p.name}`, p.value)}
              className={`glass-card hover:bg-[#1a1a1a] transition-all flex items-center justify-between p-4 rounded-xl w-full group cursor-pointer ${isRtl ? 'text-right' : 'text-left'}`}
            >
              <div className="flex items-center gap-4">
                {getIcon(p.id)}
                <span className="text-sm font-semibold text-[#e5e2e1] group-hover:text-blue-300 transition-colors">
                  {p.id === 'phone' ? t.callNow : p.id === 'whatsapp' ? t.whatsappChat : t.emailMe}
                </span>
              </div>
              {isRtl ? (
                <ChevronLeft className="w-4 h-4 text-zinc-500 group-hover:text-blue-400 transition-colors" />
              ) : (
                <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-blue-400 transition-colors" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Social connectivity grid */}
      {socialPlatforms.length > 0 && (
        <div className="w-full mb-8">
          <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 text-center opacity-70">
            {t.connectWithMe}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {socialPlatforms.map((p) => (
              <button
                key={p.id}
                onClick={() => handleLinkClick(`${client.name} on ${p.name}`, p.value)}
                className="bg-zinc-900 border border-zinc-800/40 hover:bg-[#1a1a1a] transition-all flex flex-col items-center justify-center p-5 rounded-xl text-center group cursor-pointer"
              >
                <div className="mb-2 transform group-hover:scale-110 transition-transform">{getIcon(p.id)}</div>
                <span className="text-xs font-medium text-zinc-300 group-hover:text-white transition-colors">
                  {p.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Maps bottom button */}
      {mapsPlatform && mapsPlatform.enabled && mapsPlatform.value && (
        <div className="w-full mt-auto">
          <button
            onClick={() => handleLinkClick(t.googleMapsLocation, mapsPlatform.value)}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-full py-4 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 glow-btn transition-all active:scale-[0.98] cursor-pointer"
          >
            <MapPin className="w-4 h-4 animate-bounce" />
            <span>{t.googleMapsLocation}</span>
          </button>
        </div>
      )}

      {/* Footer and Credit line */}
      <footer className="mt-8 pt-4 border-t border-zinc-900 w-full text-center text-zinc-600 flex items-center justify-center gap-1 opacity-50 hover:opacity-100 transition-opacity">
        <span className="text-xs">{t.poweredBy}</span>
        <span className="text-xs font-extrabold text-[#e5e2e1] tracking-tight">Media Land</span>
      </footer>
    </div>
  );

  // If we are looking at this inside an embed panel (like in split screen next to editing page!)
  if (isInsideEmbed) {
    return (
      <div className="w-full max-w-[340px] h-[640px] border border-zinc-800 rounded-[30px] p-2 bg-[#0a0a0a] shadow-inner flex flex-col relative overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
        {/* Notch / Speaker line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-[#0a0a0a] rounded-b-xl z-20 flex items-center justify-center gap-2">
          <div className="w-6 h-1 bg-zinc-800 rounded-full" />
          <div className="w-2 h-2 bg-zinc-900 rounded-full" />
        </div>
        
        {/* Device screen view */}
        <div className="flex-1 w-full bg-[#0d0d0d] rounded-[24px] overflow-y-auto relative pt-4 scrollbar-none custom-scrollbar">
          {previewBody}
        </div>
      </div>
    );
  }

  // Full-screen desktop preview layout with device mockup centered
  return (
    <div className="min-h-screen bg-[#070707] text-[#e5e2e1] flex flex-col relative" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Background radial accent */}
      <div className="absolute inset-0 z-0 bg-radial-[circle_at_top,rgba(0,102,255,0.06)_0%,transparent_70%]" />

      {/* Header bar */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md px-6 md:px-12 h-16 flex justify-between items-center border-b border-zinc-900">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="text-xs font-semibold px-4 py-2 border border-zinc-800 hover:border-zinc-700 bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition-all active:scale-[0.97] cursor-pointer"
            >
              {isRtl ? '← العودة لوحة المسؤولين' : '← Back to Admin'}
            </button>
          )}
          <h2 className="text-sm font-bold text-white hidden md:block">
            {isRtl ? 'محاكي صفحة الهبوط الرقمية للعميل' : 'Link Landing Page Simulator'}
          </h2>
        </div>
        <div className="flex items-center gap-2 bg-blue-500/10 text-xs px-3 py-1 rounded-full text-blue-400 font-semibold border border-blue-500/10">
          <ExternalLink className="w-3.5 h-3.5" />
          <span>mediadlandkw.netlify.app/profile/{client.id}</span>
        </div>
      </header>

      {/* Centered Device shell */}
      <div className="flex-1 flex items-center justify-center p-8 z-10">
        <div className="w-full max-w-[380px] h-[780px] border-8 border-zinc-800 rounded-[40px] p-2 bg-[#050505] shadow-2xl relative flex flex-col overflow-hidden">
          {/* Status bar mock */}
          <div className="absolute top-0 left-0 right-0 h-8 bg-transparent px-6 flex justify-between items-center text-[10px] text-zinc-500 z-30 font-medium font-mono">
            <span>09:41</span>
            <div className="w-16 h-4 bg-black rounded-b-xl flex items-center justify-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
              <div className="w-4 h-1 bg-zinc-800 rounded-full" />
            </div>
            <span>100% ✓</span>
          </div>

          <div className="flex-1 w-full bg-[#111111] rounded-[32px] overflow-y-auto scrollbar-none pt-6 select-none relative custom-scrollbar">
            {previewBody}
          </div>
        </div>
      </div>
    </div>
  );
}
