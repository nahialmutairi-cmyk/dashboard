import React, { useState, useEffect } from 'react';
import { 
  X, Globe, Smartphone, Monitor, Tablet, Share2, 
  MousePointer, Calendar, ShieldCheck, TrendingUp, AlertCircle
} from 'lucide-react';
import { Client } from '../types';
import { translations } from '../translations';

interface VisitorAnalyticsModalProps {
  client: Client;
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'ar';
}

export default function VisitorAnalyticsModal({ client, isOpen, onClose, language }: VisitorAnalyticsModalProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const t = translations[language];
  const isRtl = language === 'ar';

  useEffect(() => {
    if (!isOpen || !client.id) return;
    setLoading(true);
    setError(null);

    fetch(`/api/getAnalytics?clientId=${client.id}`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(isRtl ? 'فشل تحميل بيانات المقاييس التحليلية' : 'Failed to fetch analytics payload');
        }
        const data = await res.json();
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Visitor aggregation stats error:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [client.id, isOpen]);

  if (!isOpen) return null;

  // Render localized numbers nicely
  const formatNum = (num: number) => {
    return num.toLocaleString(isRtl ? 'ar-EG' : 'en-US');
  };

  const getDeviceIcon = (device: string) => {
    const d = device.toLowerCase();
    if (d.includes('mobile')) return <Smartphone className="w-4 h-4 text-zinc-400" />;
    if (d.includes('tablet')) return <Tablet className="w-4 h-4 text-zinc-400" />;
    return <Monitor className="w-4 h-4 text-zinc-400" />;
  };

  // Referrer styling helper
  const getReferrerLabel = (ref: string) => {
    const r = ref.toLowerCase();
    if (r === 'direct') return isRtl ? 'زيارة مباشرة' : 'Direct Traffic';
    if (r === 'instagram') return 'Instagram';
    if (r === 'whatsapp') return 'WhatsApp';
    if (r === 'google') return 'Google Search';
    return isRtl ? 'مصادر أخرى' : 'Other referral';
  };

  // Convert percentages / safe ratios
  const maxCountryCount = stats?.visits_by_country?.[0]?.count || 1;
  const maxReferrerCount = stats?.top_referrers?.[0]?.count || 1;
  const maxButtonClicks = stats?.button_clicks?.[0]?.count || 1;
  const maxDailyVisits = stats?.last_7_days ? Math.max(...stats.last_7_days.map((d: any) => d.count), 1) : 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Box */}
      <div 
        className="relative z-10 w-full max-w-4xl bg-[#121212] border border-zinc-850 rounded-2xl p-6 md:p-8 text-[#e5e2e1] shadow-2xl space-y-6 overflow-hidden max-h-[90vh] flex flex-col"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        
        {/* Header decoration */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

        {/* Modal Title Row */}
        <div className="flex items-start justify-between pb-3 border-b border-zinc-900 shrink-0">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>{t.visitorAnalyticsTitle}</span>
            </h3>
            <p className="text-xs text-zinc-500">
              {isRtl ? `مؤشرات وتقارير الأداء للعميل: ${client.name}` : `Insight report for customer: ${client.name}`}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-zinc-500 hover:text-white p-1 hover:bg-zinc-900/50 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Loader / Content scrollbox */}
        <div className="flex-1 overflow-y-auto pr-1 pl-1 space-y-6 custom-scrollbar py-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-xs text-zinc-500 font-bold tracking-wider uppercase animate-pulse">
                {isRtl ? 'جاري تجميع الإحصائيات الفورية...' : 'Compiling granular metadata logs...'}
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center text-center py-16 space-y-3 bg-red-500/5 border border-red-500/10 rounded-2xl p-6">
              <AlertCircle className="w-10 h-10 text-red-500 animate-bounce" />
              <p className="text-sm font-bold text-red-400">{error}</p>
              <button 
                onClick={onClose}
                className="mt-2 bg-zinc-900 text-xs text-zinc-300 border border-zinc-800 px-4 py-2 rounded-lg hover:text-white hover:bg-zinc-800"
              >
                {t.closeBtn}
              </button>
            </div>
          ) : (
            <>
              {/* 1. Counter cards grid summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Visits Card */}
                <div className="bg-[#181818] border border-zinc-850 p-5 rounded-2xl space-y-2 relative overflow-hidden group hover:border-blue-500/30 transition-all">
                  <div className="flex justify-between items-center text-zinc-500">
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">{t.totalVisits}</span>
                    <Globe className="w-4 h-4 text-blue-500" />
                  </div>
                  <h4 className="text-2xl font-black text-white">{formatNum(stats.total_visits)}</h4>
                  <p className="text-[10px] text-zinc-600 leading-tight">
                    {isRtl ? 'مسجلة من الزيارات المستقلة الآمنة' : 'Recorded from unique browser telemetry events.'}
                  </p>
                </div>

                {/* Clicks Card */}
                <div className="bg-[#181818] border border-zinc-850 p-5 rounded-2xl space-y-2 relative overflow-hidden group hover:border-indigo-500/30 transition-all">
                  <div className="flex justify-between items-center text-zinc-500">
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">{t.totalClicks}</span>
                    <MousePointer className="w-4 h-4 text-indigo-500" />
                  </div>
                  <h4 className="text-2xl font-black text-white">{formatNum(stats.total_clicks)}</h4>
                  <p className="text-[10px] text-zinc-600 leading-tight">
                    {isRtl ? 'إجمالي النقرات على كرت الهاتف الذكي' : 'Total phone connectivity action logs.'}
                  </p>
                </div>

                {/* Engagement Conversion Card */}
                <div className="bg-[#181818] border border-zinc-850 p-5 rounded-2xl space-y-2 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                  <div className="flex justify-between items-center text-zinc-500">
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                      {isRtl ? 'نسبة النقر للوصول' : 'Engagement Conversion Ratio'}
                    </span>
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  </div>
                  <h4 className="text-2xl font-black text-white">
                    {stats.total_visits > 0 
                      ? `${((stats.total_clicks / stats.total_visits) * 100).toFixed(1)}%` 
                      : '0.0%'}
                  </h4>
                  <p className="text-[10px] text-zinc-600 leading-tight">
                    {isRtl ? 'تقدير لفاعلية الروابط وكرت العميل الإعلاني' : 'Calculated action rate generated per visitor Session.'}
                  </p>
                </div>

              </div>

              {/* 2. Interactive Charts Grid Split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                
                {/* Chart Block A: Visits by Country */}
                <div className="bg-[#161616] border border-zinc-850/60 p-5 rounded-2xl space-y-4">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-900 pb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-500" />
                    <span>{t.byCountry}</span>
                  </h5>
                  <div className="space-y-3">
                    {stats.visits_by_country?.length === 0 ? (
                      <p className="text-xs text-zinc-500 text-center py-6">{isRtl ? 'لا توجد بيانات جغرافية للحملة بعد' : 'No geographic data logged yet.'}</p>
                    ) : (
                      stats.visits_by_country.map((c: any, index: number) => {
                        const pct = Math.round((c.count / maxCountryCount) * 100);
                        return (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between text-xs text-zinc-300">
                              <span className="font-semibold">{c.country}</span>
                              <span className="text-zinc-500 font-mono">{formatNum(c.count)} {isRtl ? 'زيارة' : 'visits'}</span>
                            </div>
                            <div className="h-2 bg-zinc-900/60 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Chart Block B: Referral sources */}
                <div className="bg-[#161616] border border-zinc-850/60 p-5 rounded-2xl space-y-4">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-900 pb-2 flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-purple-500" />
                    <span>{t.topReferrers}</span>
                  </h5>
                  <div className="space-y-3">
                    {stats.top_referrers?.length === 0 ? (
                      <p className="text-xs text-zinc-500 text-center py-6">{isRtl ? 'لا توجد تفاعلات إحالة بعد' : 'No referral sources logged yet.'}</p>
                    ) : (
                      stats.top_referrers.map((r: any, index: number) => {
                        const pct = Math.round((r.count / maxReferrerCount) * 100);
                        return (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between text-xs text-zinc-300">
                              <span className="font-semibold">{getReferrerLabel(r.referrer)}</span>
                              <span className="text-zinc-500 font-mono">{formatNum(r.count)}</span>
                            </div>
                            <div className="h-2 bg-zinc-900/60 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-purple-500 rounded-full transition-all duration-1000"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>

              {/* 3. Devices breakdown & button clicks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Devices categories lists */}
                <div className="bg-[#161616] border border-zinc-850/60 p-5 rounded-2xl space-y-4">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-900 pb-2 flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-500" />
                    <span>{t.byDevice}</span>
                  </h5>
                  <div className="space-y-4">
                    {stats.visits_by_device?.length === 0 ? (
                      <p className="text-xs text-zinc-500 text-center py-6">{isRtl ? 'لم يتم التعرف على الأجهزة بعد' : 'No device records logged.'}</p>
                    ) : (
                      stats.visits_by_device.map((d: any, index: number) => {
                        const totalVisGroup = stats.visits_by_device.reduce((sum: number, x: any) => sum + x.count, 0) || 1;
                        const pct = Math.round((d.count / totalVisGroup) * 100);
                        return (
                          <div key={index} className="flex items-center justify-between text-xs hover:bg-[#1a1a1a]/40 p-2 rounded-xl transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-zinc-900 rounded-lg">
                                {getDeviceIcon(d.device_type)}
                              </div>
                              <div>
                                <p className="font-extrabold capitalize text-zinc-200">
                                  {d.device_type === 'mobile' ? (isRtl ? 'هاتف ذكي' : 'Mobile Phone') : d.device_type === 'tablet' ? (isRtl ? 'كمبيوتر لوحي' : 'Tablet Device') : (isRtl ? 'كمبيوتر مكتبي' : 'Desktop PC')}
                                </p>
                                <p className="text-[10px] text-zinc-500">{pct}% {isRtl ? 'من إجمالي الأجهزة' : 'of total user hosts'}</p>
                              </div>
                            </div>
                            <span className="font-mono font-bold text-zinc-300">{formatNum(d.count)}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Specific custom links button clicks counts */}
                <div className="bg-[#161616] border border-zinc-850/60 p-5 rounded-2xl space-y-4">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-900 pb-2 flex items-center gap-2">
                    <MousePointer className="w-4 h-4 text-orange-500" />
                    <span>{t.buttonClicks}</span>
                  </h5>
                  <div className="space-y-3">
                    {stats.button_clicks?.length === 0 ? (
                      <p className="text-xs text-zinc-500 text-center py-6">{isRtl ? 'لا توجد نقرات مسجلة على الروابط إلى الآن' : 'No button clicks registered yet.'}</p>
                    ) : (
                      stats.button_clicks.slice(0, 5).map((btn: any, index: number) => {
                        const pct = Math.round((btn.count / maxButtonClicks) * 100);
                        return (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between text-xs text-zinc-300">
                              <span className="font-semibold truncate max-w-[220px]">{btn.clicked_button}</span>
                              <span className="text-zinc-500 font-mono">{formatNum(btn.count)}</span>
                            </div>
                            <div className="h-2 bg-zinc-900/60 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-orange-500 rounded-full transition-all duration-1000"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>

              {/* 4. Last 7 Days Daily Trend */}
              <div className="bg-[#161616] border border-zinc-850/60 p-5 rounded-2xl space-y-4">
                <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-900 pb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-500" />
                  <span>{t.last7Days}</span>
                </h5>
                
                <div className="flex items-end justify-between h-40 pt-4 px-2">
                  {stats.last_7_days?.map((day: any, index: number) => {
                    const heightPct = Math.round((day.count / maxDailyVisits) * 80) + 10; // offset for layout visibility
                    return (
                      <div key={index} className="flex flex-col items-center flex-1 group space-y-2">
                        {/* Tooltip on hover */}
                        <div className="opacity-0 group-hover:opacity-100 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded text-[9px] font-mono text-white transition-opacity absolute translate-y-[-32px] pointer-events-none shadow-xl">
                          {formatNum(day.count)} {isRtl ? 'زيارة' : 'visits'}
                        </div>
                        
                        {/* Actual Bar */}
                        <div className="w-full max-w-[24px] md:max-w-[40px] bg-gradient-to-t from-emerald-600 to-emerald-400 hover:from-emerald-500 hover:to-emerald-300 rounded-t-md transition-all duration-700"
                          style={{ height: `${heightPct}px` }}
                        />
                        
                        {/* Day label */}
                        <span className="text-[9px] font-mono text-zinc-500 group-hover:text-zinc-300 transition-colors uppercase select-none">
                          {day.visit_date.slice(5)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer info disclosure line */}
        <div className="pt-4 border-t border-zinc-900 bg-zinc-950/20 px-2 flex flex-col md:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-[10px] text-zinc-500 max-w-lg leading-relaxed text-center md:text-start">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 select-none pointer-events-none" />
            <span>{t.anonymizedNotice}</span>
          </div>

          <button 
            onClick={onClose}
            className="w-full md:w-auto bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white px-5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-zinc-800"
          >
            {t.closeBtn}
          </button>
        </div>

      </div>
    </div>
  );
}
