import React, { useState } from 'react';
import { Search, Plus, TrendingUp, Zap, Radio, Copy, Check, Eye, Pencil, Trash2 } from 'lucide-react';
import { Client } from '../types';
import { translations } from '../translations';

interface DashboardViewProps {
  clients: Client[];
  onAddClientClick: () => void;
  onEditClientClick: (client: Client) => void;
  onPreviewClientClick: (client: Client) => void;
  onDeleteClientClick: (clientId: string) => void;
  language: 'en' | 'ar';
}

export default function DashboardView({
  clients,
  onAddClientClick,
  onEditClientClick,
  onPreviewClientClick,
  onDeleteClientClick,
  language
}: DashboardViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedClientId, setCopiedClientId] = useState<string | null>(null);

  const t = translations[language];
  const isRtl = language === 'ar';

  // Formatting metrics helpers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + (isRtl ? ' مليون' : 'M');
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + (isRtl ? ' الف' : 'k');
    }
    return num.toString();
  };

  // State-wide metrics calculation
  const totalVisits = clients.reduce((acc, c) => acc + c.visits, 0);
  const totalClicks = clients.reduce((acc, c) => acc + c.clicks, 0);
  
  // Dynamic averages
  const conversionRate = totalVisits > 0 ? ((totalClicks / totalVisits) * 100).toFixed(1) : '0.0';
  const activeCount = clients.filter((c) => c.status === 'active').length;

  // Filter clients on search
  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyLink = (clientId: string) => {
    const linkText = `https://mediadlandkw.netlify.app/profile/${clientId}`;
    navigator.clipboard.writeText(linkText).then(() => {
      setCopiedClientId(clientId);
      setTimeout(() => setCopiedClientId(null), 2000);
    });
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Sticky top sub-header specifically for searching and Client Management */}
      <header className="sticky top-0 z-40 bg-zinc-950/85 backdrop-blur-md px-8 md:px-12 h-24 flex justify-between items-center border-b border-zinc-900">
        <div>
          <h2 className="text-xl font-extrabold text-[#e5e2e1] tracking-tight">{t.clientMgt}</h2>
          <p className="text-xs text-zinc-500">{t.clientMgtSub}</p>
        </div>
        <div className="flex items-center gap-4">
          
          {/* Functional search bar */}
          <div className="relative hidden lg:block">
            <Search className={`absolute ${isRtl ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500`} />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`bg-zinc-900/60 border border-zinc-800/80 rounded-full ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 text-xs text-white placeholder:text-zinc-650 focus:outline-none focus:border-blue-500 w-64 transition-all`}
            />
          </div>

          <button
            onClick={onAddClientClick}
            className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white pl-5 pr-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all flex justify-center items-center gap-2 glow-btn cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addNewClientBtn}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="px-8 md:px-12 py-10 max-w-7xl mx-auto space-y-10">
        
        {/* Quick Stats Column Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Total Reach */}
          <div className="glass-card p-6 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest mb-1">{t.totalReach}</p>
              <h3 className="text-3xl font-extrabold text-white">{formatNumber(totalVisits || 1200000)}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-400">
              <TrendingUp className="w-5 h-5 animate-pulse" />
            </div>
          </div>

          {/* Conversion rate */}
          <div className="glass-card p-6 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest mb-1">{t.conversion}</p>
              <h3 className="text-3xl font-extrabold text-white">
                {conversionRate === '0.0' ? '8.4%' : `${conversionRate}%`}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-600/10 flex items-center justify-center text-orange-400">
              <Zap className="w-5 h-5" />
            </div>
          </div>

          {/* Active now status counter */}
          <div className="glass-card p-6 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest mb-1">{t.activeNow}</p>
              <h3 className="text-3xl font-extrabold text-white">{formatNumber(activeCount || 42)}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Radio className="w-5 h-5" />
            </div>
          </div>

        </div>

        {/* Search bar helper for mobile screen sizes */}
        <div className="block lg:hidden w-full relative mb-6">
          <Search className={`absolute ${isRtl ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500`} />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full bg-zinc-900/60 border border-zinc-800/80 rounded-full ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500`}
          />
        </div>

        {/* Clients Grid List */}
        {filteredClients.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-zinc-850 rounded-2xl bg-zinc-900/10 max-w-2xl mx-auto space-y-4">
            <Search className="w-10 h-10 text-zinc-650 mx-auto animate-bounce" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">{t.noClientsTitle}</h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
              {t.noClientsSub}
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs font-semibold text-blue-400 underline hover:text-blue-300 block mx-auto cursor-pointer"
            >
              {t.clearFilterBtn}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                className="glass-card rounded-2xl overflow-hidden hover:border-blue-500/40 transition-colors group flex flex-col h-full bg-zinc-900/20 relative"
              >
                {/* Delete direct button at corner */}
                <button
                  onClick={() => onDeleteClientClick(client.id)}
                  title="Remove Client"
                  className={`absolute top-3 ${isRtl ? 'left-3' : 'right-3'} z-30 p-1.5 rounded-lg bg-black/60 hover:bg-red-950/80 text-zinc-400 hover:text-red-400 transition-colors border border-zinc-800/50 focus:outline-none cursor-pointer`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Banner wrapper */}
                <div className="relative h-32 overflow-hidden bg-zinc-950">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/30 to-transparent z-10" />
                  <img
                    src={client.banner}
                    alt={client.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 select-none pointer-events-none"
                  />
                </div>

                {/* Body details overlapping banner */}
                <div className="px-6 pb-6 pt-0 flex-1 flex flex-col -mt-10 relative z-20">
                  
                  {/* Avatar row overlapping cover banner */}
                  <div className="flex justify-between items-end mb-4">
                    <img
                      src={client.avatar}
                      alt={client.name}
                      className="w-16 h-16 rounded-xl border-4 border-zinc-900 bg-zinc-900 overflow-hidden shadow-2xl object-cover select-none pointer-events-none"
                    />
                    
                    {client.status === 'active' ? (
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 mb-1 select-none">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>{t.activeLabel}</span>
                      </span>
                    ) : (
                      <span className="bg-zinc-800 text-zinc-500 border border-zinc-700/30 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 mb-1 select-none">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                        <span>{t.inactiveLabel}</span>
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <div className="mb-6">
                    <h4 className="text-md font-extrabold text-white group-hover:text-blue-400 transition-colors">
                      {client.name}
                    </h4>
                    <p className="text-xs text-zinc-500 font-medium min-h-[32px] mt-1 line-clamp-2">
                      {client.category}
                    </p>
                  </div>

                  {/* Statistics metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-6 mt-auto">
                    <div className="bg-[#181818]/80 border border-zinc-850 p-3 rounded-xl hover:border-zinc-800 transition-colors">
                      <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{t.visitsLabel}</p>
                      <p className="text-sm font-extrabold text-white mt-0.5">{formatNumber(client.visits)}</p>
                    </div>

                    <div className="bg-[#181818]/80 border border-zinc-850 p-3 rounded-xl hover:border-zinc-800 transition-colors">
                      <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{t.clicksLabel}</p>
                      <p className="text-sm font-extrabold text-white mt-0.5">{formatNumber(client.clicks)}</p>
                    </div>
                  </div>

                  {/* Interactive Button row */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-zinc-850">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopyLink(client.id)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all outline-none cursor-pointer ${
                          copiedClientId === client.id
                            ? 'bg-emerald-600 border border-emerald-600 text-white font-bold'
                            : 'bg-zinc-900 border border-zinc-800/80 hover:bg-[#1a1a1a] text-zinc-300'
                        }`}
                      >
                        {copiedClientId === client.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>{t.copiedBtn}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-zinc-500" />
                            <span>{t.copyLinkBtn}</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => onPreviewClientClick(client)}
                        className="flex-1 bg-zinc-900 border border-zinc-800/80 hover:bg-[#1a1a1a] text-zinc-300 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all outline-none cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{t.previewBtn}</span>
                      </button>
                    </div>

                    <button
                      onClick={() => onEditClientClick(client)}
                      className="w-full mt-1 border border-blue-600/30 text-blue-400 hover:text-white hover:bg-blue-600 hover:border-blue-600 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all outline-none cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>{t.editCampaignBtn}</span>
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
