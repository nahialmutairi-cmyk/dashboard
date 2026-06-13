import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Activity, Settings, UserCircle, LogOut, Sparkles, Check, Phone, Globe, Smartphone, Monitor, Tablet, Share2, Calendar, MousePointer, ShieldCheck, TrendingUp, AlertCircle } from 'lucide-react';
import { Client } from './types';
import { INITIAL_CLIENTS } from './initialData';
import { translations } from './translations';
import LoginScreen from './components/LoginScreen';
import DashboardView from './components/DashboardView';
import EditClientView from './components/EditClientView';
import ProfilePreviewView from './components/ProfilePreviewView';
import AddClientModal from './components/AddClientModal';
import VisitorAnalyticsModal from './components/VisitorAnalyticsModal';

// Robust, privacy-respecting client analytics logger
const trackVisitorEvent = async (clientId: string, eventType: 'visit' | 'click', clickedButtonName?: string) => {
  try {
    // 1. Detect browser & OS from User Agent safely
    const ua = navigator.userAgent;
    let browser = 'Other';
    let os = 'Other';
    if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('SamsungBrowser')) browser = 'Samsung Browser';
    else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
    else if (ua.includes('Edge')) browser = 'Edge';
    else if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Safari')) browser = 'Safari';

    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Macintosh') || ua.includes('Mac OS X')) os = 'macOS';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad') || ua.includes('iPod')) os = 'iOS';
    else if (ua.includes('Linux')) os = 'Linux';

    // 2. Detect device type based on screen dimensions and user agent triggers
    let deviceType = 'desktop';
    const width = window.innerWidth;
    if (/mobile/i.test(ua)) {
      deviceType = 'mobile';
    } else if (/tablet|ipad/i.test(ua)) {
      deviceType = 'tablet';
    } else if (width < 768) {
      deviceType = 'mobile';
    } else if (width >= 768 && width < 1024) {
      deviceType = 'tablet';
    }

    // 3. Categorize referrers according to standard privacy categories
    let referrer = 'direct';
    const rawRef = document.referrer;
    if (rawRef) {
      const r = rawRef.toLowerCase();
      if (r.includes('instagram') || r.includes('ig.me')) referrer = 'instagram';
      else if (r.includes('whatsapp') || r.includes('wa.me') || r.includes('web.whatsapp')) referrer = 'whatsapp';
      else if (r.includes('google')) referrer = 'google';
      else referrer = 'other';
    }

    // 4. Resolve country & city via client geolocation with a 2.5s maximum safety abort signal
    let country = 'Unknown';
    let city = 'Unknown';
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    try {
      const geoCall = await fetch('https://ipapi.co/json/', { signal: controller.signal });
      clearTimeout(timeoutId);
      if (geoCall.ok) {
        const geoData = await geoCall.json();
        country = geoData.country_name || 'Unknown';
        city = geoData.city || 'Unknown';
      }
    } catch (err) {
      clearTimeout(timeoutId);
    }

    // Submit to server visitor-analytics endpoint
    await fetch('/api/visitor-analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        event_type: eventType,
        country,
        city,
        device_type: deviceType,
        browser,
        os,
        referrer,
        clicked_button: clickedButtonName || null
      })
    });
  } catch (err) {
    console.warn('Telemetry logger skipped:', err);
  }
};

export default function App() {
  const [language, setLanguage] = useState<'en' | 'ar'>(() => {
    return (localStorage.getItem('ml_admin_language') as 'en' | 'ar') || 'en';
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('ml_admin_logged_in') === 'true';
  });

  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [isLoadingClients, setIsLoadingClients] = useState<boolean>(true);
  const [currentPublicClient, setCurrentPublicClient] = useState<Client | null>(null);
  const [publicProfileError, setPublicProfileError] = useState<boolean>(false);

  // Current sub-view: 'dashboard' | 'edit' | 'preview' | 'settings' | 'account' | 'reports'
  const [activeTab, setActiveTab] = useState<string>(() => {
    const pathname = window.location.pathname.toLowerCase();
    if (pathname.includes('/settings')) return 'settings';
    if (pathname.includes('/reports')) return 'reports';
    if (pathname.includes('/account')) return 'account';
    return 'dashboard';
  });
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [previewingClient, setPreviewingClient] = useState<Client | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // States for live privacy-friendly visitor reports and modals
  const [analyticsClient, setAnalyticsClient] = useState<Client | null>(null);
  const [selectedReportClientId, setSelectedReportClientId] = useState<string>('');
  const [reportStats, setReportStats] = useState<any>(null);
  const [reportLoading, setReportLoading] = useState<boolean>(false);

  // Parse path or search queries to check if we are directly loading a client landing page
  const [directProfileId, setDirectProfileId] = useState<string | null>(() => {
    const pathname = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash;

    if (pathname.includes('/u/')) {
      const parts = pathname.split('/u/');
      if (parts[1]) {
        return parts[1].split('?')[0].split('#')[0].replace(/\/$/, '');
      }
    }
    if (pathname.includes('/client/')) {
      const parts = pathname.split('/client/');
      if (parts[1]) {
        return parts[1].split('?')[0].split('#')[0].replace(/\/$/, '');
      }
    }
    if (pathname.includes('/profile/')) {
      const parts = pathname.split('/profile/');
      if (parts[1]) {
        return parts[1].split('?')[0].split('#')[0].replace(/\/$/, '');
      }
    }
    if (hash.startsWith('#/profile/')) {
      return hash.replace('#/profile/', '');
    }
    if (searchParams.has('profile')) {
      return searchParams.get('profile');
    }
    // Fallback: support top-level route if they deploy as index and append query e.g. mediadlandkw.netlify.app/?id=client
    if (searchParams.has('id')) {
      return searchParams.get('id');
    }
    return null;
  });

  const t = translations[language];
  const isRtl = language === 'ar';

  // Load and sync clients on mount from local netlify action functions or cache
  useEffect(() => {
    if (directProfileId) {
      setIsLoadingClients(true);
      fetch(`/api/getPublicProfileBySlug?slug=${directProfileId}`)
        .then(async (res) => {
          if (!res.ok) {
            setPublicProfileError(true);
            return;
          }
          const data = await res.json();
          if (data && data.status === 'active') {
            setCurrentPublicClient(data);
            
            // Background profile visitor analytics tracking
            trackVisitorEvent(data.id, 'visit');

          } else {
            setPublicProfileError(true);
          }
        })
        .catch((err) => {
          console.error('Failed to fetch from DB on slug lookup:', err);
          setPublicProfileError(true);
        })
        .finally(() => {
          setIsLoadingClients(false);
        });
    } else {
      // Fetch entire admin list campaign roster
      setIsLoadingClients(true);
      fetch('/api/getClients')
        .then(res => {
          if (!res.ok) throw new Error('Bad network response in fetching roster');
          return res.json();
        })
        .then(data => {
          if (data && data.length > 0) {
            setClients(data);
          }
        })
        .catch((err) => {
          console.warn('Backend unavailable, falling back to local storage cache', err);
          const saved = localStorage.getItem('ml_admin_clients');
          if (saved) {
            try {
              setClients(JSON.parse(saved));
            } catch (e) {
              setClients(INITIAL_CLIENTS);
            }
          } else {
            setClients(INITIAL_CLIENTS);
          }
        })
        .finally(() => {
          setIsLoadingClients(false);
        });
    }
  }, [directProfileId]);

  // Sync clients with localStorage cache for offline/failure resilience
  useEffect(() => {
    localStorage.setItem('ml_admin_clients', JSON.stringify(clients));
  }, [clients]);

  // Sync language selection with localStorage
  useEffect(() => {
    localStorage.setItem('ml_admin_language', language);
  }, [language]);

  // Load aggregated stats for active Reports view
  useEffect(() => {
    if (activeTab === 'reports') {
      let targetId = selectedReportClientId;
      if (!targetId && clients.length > 0) {
        // Set the default client to the first client in alphabetical custom list
        targetId = clients[0].id;
        setSelectedReportClientId(targetId);
      }
      if (!targetId) return;
      setReportLoading(true);
      fetch(`/api/getAnalytics?clientId=${targetId}`)
        .then(async (res) => {
          if (!res.ok) throw new Error('Fetch status not OK');
          const data = await res.json();
          setReportStats(data);
          setReportLoading(false);
        })
        .catch((err) => {
          console.warn('Error fetching reports metrics payload:', err);
          setReportLoading(false);
        });
    }
  }, [activeTab, selectedReportClientId, clients]);

  // Sync URL pushState for SPA views when logged in, or handle redirect back to root login page when unauthenticated
  useEffect(() => {
    const pathname = window.location.pathname.toLowerCase();
    const isAdminPath = ['/admin', '/dashboard', '/clients', '/settings', '/reports', '/account'].some(p => pathname.includes(p));

    if (!isLoggedIn) {
      if (isAdminPath && pathname !== '/') {
        // Redirect unauthorized request to root login portal
        window.history.pushState({}, '', '/');
      }
    } else if (!directProfileId) {
      // Synchronize address bar for active tab when logged in
      if (activeTab === 'dashboard' && !pathname.includes('/dashboard') && !pathname.includes('/admin') && !pathname.includes('/clients')) {
        window.history.pushState({}, '', '/dashboard');
      } else if (activeTab === 'settings' && !pathname.includes('/settings')) {
        window.history.pushState({}, '', '/settings');
      } else if (activeTab === 'reports' && !pathname.includes('/reports')) {
        window.history.pushState({}, '', '/reports');
      } else if (activeTab === 'account' && !pathname.includes('/account')) {
        window.history.pushState({}, '', '/account');
      } else if (activeTab === 'edit' && !pathname.includes('/edit-campaign')) {
        window.history.pushState({}, '', '/edit-campaign');
      }
    }
  }, [activeTab, isLoggedIn, directProfileId]);

  // Handle OTA clink clicks analytics tracking
  const handleTrackClick = (clientId: string, linkId?: string) => {
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        action: 'click',
        link_type: 'custom_link',
        link_id: linkId || null
      })
    }).catch(e => console.log('Failed background click tracking', e));

    // Also dispatch to visitor_analytics table
    trackVisitorEvent(clientId, 'click', linkId || 'Custom Link');

    setClients(prev => {
      const match = prev.find(c => c.id === clientId);
      if (match) {
        return prev.map(c => c.id === clientId ? { ...c, clicks: c.clicks + 1 } : c);
      }
      return prev;
    });

    if (currentPublicClient && currentPublicClient.id === clientId) {
      setCurrentPublicClient(prev => prev ? { ...prev, clicks: prev.clicks + 1 } : null);
    }
  };

  // Auth helper
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    localStorage.setItem('ml_admin_logged_in', 'true');
    triggerToast(translations[language].toastAuthSuccess);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('ml_admin_logged_in');
  };

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // State actions
  const handleAddClient = async (newClient: Client) => {
    try {
      const res = await fetch('/api/createClient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient)
      });
      if (!res.ok) {
        let errorMsg = 'Unknown error';
        try {
          const errData = await res.json();
          errorMsg = errData.error || errData.message || JSON.stringify(errData);
        } catch (_) {}
        throw new Error(errorMsg);
      }
      
      const dataRes = await fetch('/api/getClients');
      if (dataRes.ok) {
        const list = await dataRes.json();
        setClients(list);
      } else {
        setClients([newClient, ...clients]);
      }
    } catch (err: any) {
      console.error('Failed to save client:', err);
      alert(isRtl 
        ? `فشل حفظ العميل في قاعدة البيانات: ${err.message || err}`
        : `Failed to save client to Netlify PostgreSQL database: ${err.message || err}`
      );
      return;
    }
    setIsAddModalOpen(false);
    triggerToast(translations[language].toastAddedClient);
  };

  const handleEditClientStart = (client: Client) => {
    setEditingClient(client);
    setActiveTab('edit');
  };

  const handlePreviewClientStart = (client: Client) => {
    setPreviewingClient(client);
    setActiveTab('preview');
  };

  const handleSaveClient = async (updatedClient: Client) => {
    try {
      const res = await fetch('/api/updateClient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedClient)
      });
      if (!res.ok) {
        let errorMsg = 'Unknown error';
        try {
          const errData = await res.json();
          errorMsg = errData.error || errData.message || JSON.stringify(errData);
        } catch (_) {}
        throw new Error(errorMsg);
      }

      const dataRes = await fetch('/api/getClients');
      if (dataRes.ok) {
        const list = await dataRes.json();
        setClients(list);
      } else {
        setClients(clients.map((c) => (c.id === updatedClient.id ? updatedClient : c)));
      }
    } catch (err: any) {
      console.error('Failed to update client:', err);
      alert(isRtl 
        ? `فشل تحديث العميل في قاعدة البيانات: ${err.message || err}`
        : `Failed to update client in Netlify PostgreSQL database: ${err.message || err}`
      );
      return;
    }
    setEditingClient(null);
    setActiveTab('dashboard');
    triggerToast(translations[language].toastSavedClient);
  };

  const handleDeleteClient = async (clientId: string) => {
    const clientToDelete = clients.find((c) => c.id === clientId);
    const confirmMsg = isRtl
      ? `هل أنت متأكد من رغبتك في حذف وإزالة الملف التعريفي للعميل: "${clientToDelete?.name || clientId}"؟`
      : `Are you sure you want to remove client campaign profile: "${clientToDelete?.name || clientId}"?`;

    if (window.confirm(confirmMsg)) {
      try {
        const res = await fetch(`/api/deleteClient?id=${clientId}`, {
          method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to delete client');

        const dataRes = await fetch('/api/getClients');
        if (dataRes.ok) {
          const list = await dataRes.json();
          setClients(list);
        } else {
          setClients(clients.filter((c) => c.id !== clientId));
        }
      } catch (err) {
        console.error('Failed to delete client:', err);
        alert(isRtl ? 'فشل حذف العميل من قاعدة البيانات' : 'Failed to delete client from Netlify PostgreSQL database.');
        return;
      }
      triggerToast(translations[language].toastRemovedClient);
    }
  };

  // Render direct client public campaign profile if designated by URL path/hash/search
  if (directProfileId) {
    if (isLoadingClients) {
      return (
        <div className="min-h-screen bg-[#070707] text-[#e5e2e1] flex flex-col justify-center items-center px-6 py-12 relative font-sans">
          <div className="absolute inset-0 z-0 bg-radial-[circle_at_top,rgba(0,102,255,0.06)_0%,transparent_70%]" />
          <div className="relative z-10 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-medium text-zinc-400">
              {isRtl ? 'جاري تحميل الملف التعريفي...' : 'Loading profile...'}
            </p>
          </div>
        </div>
      );
    }

    if (currentPublicClient) {
      return (
        <ProfilePreviewView
          client={currentPublicClient}
          language={language}
          isPublicRoute={true}
          onLinkClick={(btn) => handleTrackClick(currentPublicClient.id, btn)}
        />
      );
    } else {
      // Sleek client not found page
      return (
        <div className="min-h-screen bg-[#070707] text-[#e5e2e1] flex flex-col justify-center items-center px-6 py-12 relative font-sans">
          <div className="absolute inset-0 z-0 bg-radial-[circle_at_top,rgba(0,102,255,0.06)_0%,transparent_70%]" />
          <div className="relative z-10 w-full max-w-sm glass-card p-8 rounded-2xl border border-zinc-800 text-center space-y-6">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto text-xl font-bold animate-bounce">
              !
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-black text-white leading-tight">
                {isRtl ? 'لم يتم العثور على الملف' : 'Profile Not Found'}
              </h1>
              <p className="text-xs text-zinc-500 leading-relaxed">
                {isRtl 
                  ? 'رابط الحملة هذا غير متاح حالياً أو قد تم إزالته بواسطة إدارة الوكالة.' 
                  : 'This campaign link is currently unavailable or has been removed by the agency admin.'}
              </p>
            </div>
            <div className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold pt-4 border-t border-zinc-900/40">
              Media Land
            </div>
          </div>
        </div>
      );
    }
  }

  // If user is not yet authenticated, render login panel
  if (!isLoggedIn) {
    return (
      <LoginScreen
        onLoginSuccess={handleLoginSuccess}
        language={language}
        onLanguageChange={setLanguage}
      />
    );
  }

  // Handle immersive smartphone independent full page preview
  if (activeTab === 'preview' && previewingClient) {
    return (
      <ProfilePreviewView
        client={previewingClient}
        language={language}
        onBack={() => {
          setPreviewingClient(null);
          setActiveTab('dashboard');
        }}
        onLinkClick={(btn) => handleTrackClick(previewingClient.id, btn)}
      />
    );
  }

  return (
    <div
      className="flex h-screen overflow-hidden bg-zinc-950 text-[#e5e2e1] font-sans antialiased"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      
      {/* Dynamic persistent success toast alerts */}
      {successToast && (
        <div className={`fixed bottom-6 ${isRtl ? 'left-6' : 'right-6'} z-50 bg-[#161616] border border-blue-500/25 text-xs text-blue-400 px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300`}>
          <Check className="w-5 h-5 text-emerald-500 bg-emerald-500/10 p-1 rounded-full animate-bounce shrink-0" />
          <span className="font-semibold tracking-wide">{successToast}</span>
        </div>
      )}

      {/* Main Side Navigation Shell */}
      <aside className="hidden md:flex flex-col p-4 bg-[#111111] border-r border-zinc-900 w-64 shrink-0 transition-all z-50">
        
        {/* Brand header labels */}
        <div className="mb-10 px-4 pt-2 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-1.5 leading-none">
              Media Land
            </h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1 font-bold">
              {t.agencyAdminSub}
            </p>
          </div>
          
          {/* Global Language state direct toggler in the sidebar */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="text-[10px] font-extrabold text-blue-400 hover:text-blue-300 px-2.5 py-1 rounded-full bg-blue-900/10 hover:bg-blue-900/20 border border-blue-500/20 transition-all uppercase tracking-widest cursor-pointer inline-flex items-center"
          >
            {language === 'en' ? 'AR' : 'EN'}
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1.5 select-none text-start">
          
          <button
            onClick={() => {
              setActiveTab('dashboard');
              setEditingClient(null);
            }}
            className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-zinc-900 text-blue-400 border border-zinc-805/40 shadow-lg'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>{t.dashboardTab}</span>
          </button>

          <button
            onClick={() => {
              if (clients.length > 0) {
                handleEditClientStart(clients[0]);
              } else {
                setActiveTab('dashboard');
                triggerToast(t.toastSelectToEdit);
              }
            }}
            className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'edit'
                ? 'bg-zinc-900 text-blue-400 border border-zinc-805/40 shadow-lg'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span>{t.editTab}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('reports');
              setEditingClient(null);
            }}
            className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-zinc-900 text-blue-400 border border-zinc-805/40 shadow-lg'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
            }`}
          >
            <Activity className="w-4 h-4 shrink-0" />
            <span>{t.reportsTab}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('settings');
              setEditingClient(null);
            }}
            className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-zinc-900 text-blue-400 border border-zinc-805/40 shadow-lg'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
            }`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span>{t.settingsTab}</span>
          </button>

        </nav>

        {/* Footer profile settings */}
        <div className="pt-4 border-t border-zinc-900 select-none">
          
          <button
            onClick={() => setActiveTab('account')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors cursor-pointer ${
              activeTab === 'account' ? 'bg-zinc-900 text-blue-400' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-bold shrink-0">
              A
            </div>
            <div className={`flex-1 min-w-0 ${isRtl ? 'text-right' : 'text-left'}`}>
              <p className="text-xs font-bold text-white truncate">{t.adminUser}</p>
              <p className="text-[10px] text-zinc-500 truncate">{t.superAdmin}</p>
            </div>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 mt-1.5 text-xs font-bold uppercase tracking-wider text-red-500/80 hover:text-red-400 hover:bg-red-950/15 rounded-xl transition-all cursor-pointer text-start"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>{t.logoutBtn}</span>
          </button>

        </div>
      </aside>

      {/* Main Content Workspace viewport */}
      <main className="flex-1 flex flex-col min-w-0 relative h-full bg-[#070707] overflow-y-auto">
        
        {/* Render sub-view */}
        {activeTab === 'dashboard' && (
          <DashboardView
            clients={clients}
            onAddClientClick={() => setIsAddModalOpen(true)}
            onEditClientClick={handleEditClientStart}
            onPreviewClientClick={handlePreviewClientStart}
            onDeleteClientClick={handleDeleteClient}
            onViewAnalyticsClick={setAnalyticsClient}
            language={language}
          />
        )}

        {activeTab === 'edit' && editingClient && (
          <EditClientView
            client={editingClient}
            onSave={handleSaveClient}
            language={language}
            onDiscard={() => {
              setEditingClient(null);
              setActiveTab('dashboard');
              triggerToast(t.toastDiscarded);
            }}
          />
        )}

        {/* Settings Workspace Mock view */}
        {activeTab === 'settings' && (
          <div className="flex-1 overflow-y-auto px-8 md:px-12 py-10 max-w-4xl mx-auto space-y-6 w-full custom-scrollbar text-start">
            <h2 className="text-xl font-extrabold text-[#e5e2e1] uppercase tracking-wider border-b border-zinc-900 pb-4">
              {t.systemSettingsTitle}
            </h2>
            
            <div className="bg-[#141414] border border-zinc-850 p-6 rounded-2xl space-y-6">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-[#e5e2e1]">{t.agencyConfigTitle}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">{t.workspaceUrlLabel}</span>
                  <input type="text" readOnly value="https://mediadlandkw.netlify.app" className="w-full bg-[#0e0e0e] border border-zinc-850 p-3 rounded-lg text-xs font-mono text-zinc-400" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">{t.apiCacheLabel}</span>
                  <input type="text" readOnly value={isRtl ? "٣٠٠ ثانية" : "300 Seconds"} className="w-full bg-[#0e0e0e] border border-zinc-850 p-3 rounded-lg text-xs font-mono text-zinc-400" />
                </div>
              </div>

              <div className={`pt-4 border-t border-zinc-900 flex ${isRtl ? 'justify-start' : 'justify-end'}`}>
                <button
                  onClick={() => {
                    setActiveTab('dashboard');
                    triggerToast(t.toastSettingsUpdated);
                  }}
                  className="bg-blue-600 hover:bg-blue-500 px-6 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white rounded-xl active:scale-[0.98] outline-none transition-all cursor-pointer"
                >
                  {t.saveSystemBtn}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Account Workspace Mock view */}
        {activeTab === 'account' && (
          <div className="flex-1 overflow-y-auto px-8 md:px-12 py-10 max-w-4xl mx-auto space-y-6 w-full custom-scrollbar text-start">
            <h2 className="text-xl font-extrabold text-[#e5e2e1] uppercase tracking-wider border-b border-zinc-900 pb-4">
              {t.adminProfileTitle}
            </h2>
            
            <div className="bg-[#141414] border border-zinc-850 p-6 rounded-2xl space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-600/10 border border-blue-500/25 flex items-center justify-center text-blue-400 text-lg font-black shrink-0 font-sans">
                  A
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-[#e5e2e1] tracking-tight">{t.adminUser}</h4>
                  <p className="text-xs text-zinc-500">{t.superAdminCreds}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-900">
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">{t.contactEmailLabel}</span>
                  <input type="text" readOnly value="admin@medialand.agency" className="w-full bg-[#0e0e0e] border border-zinc-850 p-3 rounded-lg text-xs text-zinc-400 font-sans" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">{t.assignedRoleLabel}</span>
                  <input type="text" readOnly value="SUPER_ADMIN_CONTRIBUTION_ACCESS_LEVEL" className="w-full bg-[#0e0e0e] border border-zinc-850 p-3 rounded-lg text-xs text-zinc-400 font-mono" />
                </div>
              </div>

              <div className={`pt-4 border-t border-zinc-900 flex ${isRtl ? 'justify-start' : 'justify-end'}`}>
                <button
                  onClick={() => {
                    setActiveTab('dashboard');
                    triggerToast(t.toastDetailsChanged);
                  }}
                  className="bg-blue-600 hover:bg-blue-500 px-6 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white rounded-xl active:scale-[0.98] outline-none transition-all cursor-pointer"
                >
                  {t.updateDetailsBtn}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reports overview tab */}
        {activeTab === 'reports' && (
          <div className="flex-1 overflow-y-auto px-6 md:px-10 py-10 max-w-5xl mx-auto space-y-6 w-full custom-scrollbar text-start">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-[#e5e2e1] uppercase tracking-wider">
                  {t.agencyReportsTitle}
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  {isRtl ? 'تحليل ومراقبة مؤشرات أداء كروت العملاء الرقمية ومصادر النقر في الوقت الفعلي' : 'Monitor and audit client microview performances and live referral traffic'}
                </p>
              </div>

              {/* CSV Export Button */}
              <button
                onClick={() => {
                  if (clients.length === 0) {
                    triggerToast(t.toastSelectToEdit);
                    return;
                  }
                  // Compile high quality simulated performance CSV sheet
                  const csvHeaders = "Campaign Client,Username Slug,Total Visits,Total Clicks,Conversion Rate,Main Traffic Referrer\n";
                  const csvRows = clients.map(c => {
                    const conv = c.visits > 0 ? ((c.clicks / c.visits) * 100).toFixed(1) + "%" : "0%";
                    const mainRef = c.id === 'real-estate' ? "WhatsApp" : c.id === 'digital-creator' ? "Instagram" : "Direct";
                    return `"${c.name}","${c.slug || '-'}","${c.visits}","${c.clicks}","${conv}","${mainRef}"`;
                  }).join("\n");
                  
                  const blob = new Blob([csvHeaders + csvRows], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.setAttribute('download', `medialand_agency_performance_report_${Date.now()}.csv`);
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  triggerToast(t.toastCsvReady);
                }}
                className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-white rounded-xl active:scale-[0.98] outline-none transition-all cursor-pointer flex items-center gap-2 self-start md:self-auto shrink-0"
              >
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>{t.downloadCsvBtn}</span>
              </button>
            </div>

            {/* Selector block */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#141414] border border-zinc-850 p-5 rounded-2xl text-start">
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-white">{isRtl ? 'اختر العميل المستهدف لمراقبة مؤشرات الأداء' : 'Select Campaign Client to Review'}</h3>
                <p className="text-[10px] text-zinc-500">{isRtl ? 'مستندة بالكامل إلى تحليلات معزية ومجهولة الهوية وآمنة تماماً' : 'Fully compiled using zero-identifiable anonymous visitor analytics'}</p>
              </div>
              <select
                className="bg-[#0b0b0b] border border-[#1e1e1e] text-xs text-[#e5e2e1] px-4 py-3 rounded-xl outline-none focus:border-blue-500 font-extrabold cursor-pointer min-w-[200px]"
                value={selectedReportClientId}
                onChange={(e) => setSelectedReportClientId(e.target.value)}
              >
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.slug || '-'})
                  </option>
                ))}
              </select>
            </div>

            {/* Report Widget Body */}
            {reportLoading ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-4 bg-[#141414] border border-zinc-850 p-6 rounded-2xl">
                <div className="w-8 h-8 border-3 border-blue-600/30 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold animate-pulse">
                  {isRtl ? 'جاري استدعاء حقول تقرير الأداء المجهول...' : 'Aggregating client analytics logs...'}
                </p>
              </div>
            ) : !reportStats ? (
              <div className="text-center py-16 bg-[#141414] border border-zinc-850 p-6 rounded-2xl">
                <p className="text-sm text-zinc-500">{isRtl ? 'يرجى اختيار أحد عملاء الوكالة أعلاه لاستعراض مستند التحليلات' : 'Please select an agency client above to review performance documentation.'}</p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* 1. Metric stats columns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#141414] border border-zinc-850 p-5 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center text-zinc-500">
                      <span className="text-[9px] font-black uppercase tracking-widest">{t.totalVisits}</span>
                      <Globe className="w-4 h-4 text-blue-500" />
                    </div>
                    <h4 className="text-2xl font-black text-white">{reportStats.total_visits.toLocaleString(isRtl ? 'ar-EG' : 'en-US')}</h4>
                    <p className="text-[10px] text-zinc-600 leading-normal">{isRtl ? 'إجمالي عدد الزيارات المستقلة الآمنة لكرت العميل' : 'Total unique visits generated on client smart card.'}</p>
                  </div>

                  <div className="bg-[#141414] border border-zinc-850 p-5 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center text-zinc-500">
                      <span className="text-[9px] font-black uppercase tracking-widest">{t.totalClicks}</span>
                      <MousePointer className="w-4 h-4 text-indigo-500" />
                    </div>
                    <h4 className="text-2xl font-black text-white">{reportStats.total_clicks.toLocaleString(isRtl ? 'ar-EG' : 'en-US')}</h4>
                    <p className="text-[10px] text-zinc-600 leading-normal">{isRtl ? 'عدد النقرات الإجمالية لتوجيه الروابط المخصصة والاتصال' : 'Total connectivity redirects triggered by users.'}</p>
                  </div>

                  <div className="bg-[#141414] border border-zinc-850 p-5 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center text-zinc-500">
                      <span className="text-[9px] font-black uppercase tracking-widest">{isRtl ? 'متوسط معدل التحويل' : 'Engagement Action Ratio'}</span>
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                    </div>
                    <h4 className="text-2xl font-black text-white">
                      {reportStats.total_visits > 0 ? ((reportStats.total_clicks / reportStats.total_visits) * 100).toFixed(1) + "%" : "0.0%"}
                    </h4>
                    <p className="text-[10px] text-zinc-600 leading-normal">{isRtl ? 'النسبة المئوية للزوار الذين نقروا على زر تواصل واحد على الأقل' : 'Percent of visits carrying at least one clicked CTA.'}</p>
                  </div>
                </div>

                {/* 2. Half layout widgets */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Country stats widget */}
                  <div className="bg-[#141414] border border-zinc-850 p-5 rounded-2xl space-y-4">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-900 pb-2 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-500" />
                      <span>{t.byCountry}</span>
                    </h5>
                    <div className="space-y-3">
                      {reportStats.visits_by_country?.length === 0 ? (
                        <p className="text-xs text-zinc-500 text-center py-6">{isRtl ? 'لا توجد بيانات جغرافية بعد' : 'No geographic data logged yet.'}</p>
                      ) : (
                        reportStats.visits_by_country.slice(0, 5).map((c: any, index: number) => {
                          const maxCount = reportStats.visits_by_country?.[0]?.count || 1;
                          const pct = Math.round((c.count / maxCount) * 100);
                          return (
                            <div key={index} className="space-y-1">
                              <div className="flex justify-between text-xs text-zinc-300">
                                <span className="font-semibold">{c.country}</span>
                                <span className="text-zinc-500 font-mono">{c.count.toLocaleString(isRtl ? 'ar-EG' : 'en-US')} {isRtl ? 'زيارة' : 'visits'}</span>
                              </div>
                              <div className="h-2 bg-zinc-900/60 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Top traffic referrers widget */}
                  <div className="bg-[#141414] border border-zinc-850 p-5 rounded-2xl space-y-4">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-900 pb-2 flex items-center gap-2">
                      <Share2 className="w-4 h-4 text-purple-500" />
                      <span>{t.topReferrers}</span>
                    </h5>
                    <div className="space-y-3">
                      {reportStats.top_referrers?.length === 0 ? (
                        <p className="text-xs text-zinc-500 text-center py-6">{isRtl ? 'لا توجد مصادر إحالة مسجلة للحملة' : 'No referral sources logged.'}</p>
                      ) : (
                        reportStats.top_referrers.slice(0, 5).map((r: any, index: number) => {
                          const maxCount = reportStats.top_referrers?.[0]?.count || 1;
                          const pct = Math.round((r.count / maxCount) * 100);
                          const label = r.referrer === 'direct' ? (isRtl ? 'زيارة مباشرة' : 'Direct Traffic') : r.referrer;
                          return (
                            <div key={index} className="space-y-1">
                              <div className="flex justify-between text-xs text-zinc-300">
                                <span className="font-semibold capitalize">{label}</span>
                                <span className="text-zinc-500 font-mono">{r.count.toLocaleString(isRtl ? 'ar-EG' : 'en-US')}</span>
                              </div>
                              <div className="h-2 bg-zinc-900/60 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                </div>

                {/* 3. Devices and custom clicks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Devices category picker block */}
                  <div className="bg-[#141414] border border-zinc-850 p-5 rounded-2xl space-y-4">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-900 pb-2 flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-emerald-500" />
                      <span>{t.byDevice}</span>
                    </h5>
                    <div className="space-y-3">
                      {reportStats.visits_by_device?.length === 0 ? (
                        <p className="text-xs text-zinc-500 text-center py-6">{isRtl ? 'لا توجد بيانات أجهزة للحملة' : 'No device records logged.'}</p>
                      ) : (
                        reportStats.visits_by_device.map((d: any, index: number) => {
                          const total = reportStats.visits_by_device.reduce((acc: number, x: any) => acc + x.count, 0) || 1;
                          const pct = Math.round((d.count / total) * 100);
                          const icon = d.device_type === 'mobile' ? <Smartphone className="w-4 h-4 text-zinc-400" /> : d.device_type === 'tablet' ? <Tablet className="w-4 h-4 text-zinc-400" /> : <Monitor className="w-4 h-4 text-zinc-400" />;
                          const deviceLabel = d.device_type === 'mobile' ? (isRtl ? 'هاتف محمول' : 'Mobile Phone') : d.device_type === 'tablet' ? (isRtl ? 'جهاز لوحي' : 'Tablet Device') : (isRtl ? 'حاسوب مكتبي' : 'Desktop PC');
                          return (
                            <div key={index} className="flex items-center justify-between text-xs hover:bg-[#1a1a1a]/30 p-2.5 rounded-xl transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-zinc-950 rounded-lg">
                                  {icon}
                                </div>
                                <div>
                                  <p className="font-bold text-zinc-200 capitalize">{deviceLabel}</p>
                                  <p className="text-[10px] text-zinc-500">{pct}% {isRtl ? 'من إجمالي الزوار' : 'of total user hosts'}</p>
                                </div>
                              </div>
                              <span className="font-mono font-bold text-zinc-300">{d.count.toLocaleString(isRtl ? 'ar-EG' : 'en-US')}</span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Buttons clicks widget */}
                  <div className="bg-[#141414] border border-zinc-850 p-5 rounded-2xl space-y-4">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-900 pb-2 flex items-center gap-2">
                       <MousePointer className="w-4 h-4 text-orange-500" />
                       <span>{t.buttonClicks}</span>
                    </h5>
                    <div className="space-y-3">
                      {reportStats.button_clicks?.length === 0 ? (
                        <p className="text-xs text-zinc-500 text-center py-6">{isRtl ? 'لا توجد نقرات مسجلة على هذا الكرت بعد' : 'No button clicks registered yet.'}</p>
                      ) : (
                        reportStats.button_clicks.slice(0, 5).map((btn: any, index: number) => {
                          const maxCount = reportStats.button_clicks?.[0]?.count || 1;
                          const pct = Math.round((btn.count / maxCount) * 100);
                          return (
                            <div key={index} className="space-y-1">
                              <div className="flex justify-between text-xs text-zinc-300">
                                <span className="font-semibold truncate max-w-[200px]">{btn.clicked_button}</span>
                                <span className="text-zinc-500 font-mono">{btn.count.toLocaleString(isRtl ? 'ar-EG' : 'en-US')}</span>
                              </div>
                              <div className="h-2 bg-zinc-900/60 rounded-full overflow-hidden">
                                <div className="h-full bg-orange-500 rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                </div>

                {/* 4. Active daily trend last 7 days chart */}
                <div className="bg-[#141414] border border-zinc-850 p-5 rounded-2xl space-y-4">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-900 pb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-500" />
                    <span>{t.last7Days}</span>
                  </h5>
                  <div className="flex items-end justify-between h-40 pt-4 px-2">
                    {reportStats.last_7_days?.map((day: any, index: number) => {
                      const maxDaily = Math.max(...reportStats.last_7_days.map((d: any) => d.count), 1);
                      const heightPct = Math.round((day.count / maxDaily) * 80) + 10;
                      return (
                        <div key={index} className="flex flex-col items-center flex-1 group space-y-2 relative">
                          <div className="opacity-0 group-hover:opacity-100 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded text-[9px] font-mono text-white transition-opacity absolute translate-y-[-32px] pointer-events-none shadow-xl z-10">
                            {day.count} {isRtl ? 'زيارة' : 'visits'}
                          </div>
                          <div className="w-full max-w-[24px] md:max-w-[40px] bg-gradient-to-t from-emerald-600 to-emerald-400 hover:from-emerald-500 hover:to-emerald-300 rounded-t-md transition-all duration-700" style={{ height: `${heightPct}px` }} />
                          <span className="text-[9px] font-mono text-zinc-500 group-hover:text-zinc-300 transition-colors uppercase select-none">{day.visit_date.slice(5)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Privacy compliance note */}
                <div className="p-4 bg-zinc-900/30 border border-zinc-900 rounded-2xl flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 select-none" />
                  <p className="text-[10px] text-zinc-500 leading-relaxed">
                    {t.anonymizedNotice}
                  </p>
                </div>

              </div>
            )}

          </div>
        )}

      </main>

      {/* Add Client Modal */}
      {isAddModalOpen && (
        <AddClientModal
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddClient}
          language={language}
        />
      )}

      {/* Visitor Analytics Modal overlay popup */}
      {analyticsClient && (
        <VisitorAnalyticsModal
          client={analyticsClient}
          isOpen={analyticsClient !== null}
          onClose={() => setAnalyticsClient(null)}
          language={language}
        />
      )}

    </div>
  );
}
