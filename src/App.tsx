import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Activity, Settings, UserCircle, LogOut, Sparkles, Check, Phone } from 'lucide-react';
import { Client } from './types';
import { INITIAL_CLIENTS } from './initialData';
import { translations } from './translations';
import LoginScreen from './components/LoginScreen';
import DashboardView from './components/DashboardView';
import EditClientView from './components/EditClientView';
import ProfilePreviewView from './components/ProfilePreviewView';
import AddClientModal from './components/AddClientModal';
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
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [previewingClient, setPreviewingClient] = useState<Client | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

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

  // Load and sync clients on mount from local node rest service database or direct profile load
  useEffect(() => {
    if (directProfileId) {
      setIsLoadingClients(true);
      fetch(`/api/clients/${directProfileId}`)
        .then(async (res) => {
          if (!res.ok) {
            setPublicProfileError(true);
            return;
          }
          const data = await res.json();
          if (data && data.status === 'active') {
            setCurrentPublicClient(data);
            
            // Background profile visit tracking
            fetch('/api/analytics', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                client_id: data.id,
                action: 'visit',
                link_type: 'profile'
              })
            }).catch(e => console.log('Analytics profile tracking event error', e));

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
      fetch('/api/clients')
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
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient)
      });
      if (!res.ok) throw new Error('Network response not ok');
      
      const dataRes = await fetch('/api/clients');
      if (dataRes.ok) {
        const list = await dataRes.json();
        setClients(list);
      } else {
        setClients([newClient, ...clients]);
      }
    } catch (err) {
      console.error('Failed to save client:', err);
      alert(isRtl ? 'فشل حفظ العميل في قاعدة البيانات' : 'Failed to save client to Netlify PostgreSQL database.');
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
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedClient)
      });
      if (!res.ok) throw new Error('Network response not ok');

      const dataRes = await fetch('/api/clients');
      if (dataRes.ok) {
        const list = await dataRes.json();
        setClients(list);
      } else {
        setClients(clients.map((c) => (c.id === updatedClient.id ? updatedClient : c)));
      }
    } catch (err) {
      console.error('Failed to update client:', err);
      alert(isRtl ? 'فشل تحديث العميل في قاعدة البيانات' : 'Failed to update client in Netlify PostgreSQL database.');
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
        const res = await fetch(`/api/clients/${clientId}`, {
          method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to delete client');

        const dataRes = await fetch('/api/clients');
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
          onBack={isLoggedIn ? () => {
            // Remove routing indicator from browser URL to clear refresh behavior
            window.history.pushState({}, '', '/');
            setDirectProfileId(null);
            setCurrentPublicClient(null);
          } : undefined}
          onLinkClick={() => handleTrackClick(currentPublicClient.id)}
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
            {isLoggedIn ? (
              <button
                onClick={() => {
                  window.history.pushState({}, '', '/');
                  setDirectProfileId(null);
                }}
                className="w-full bg-zinc-900 border border-zinc-800 hover:bg-[#1a1a1a] text-zinc-400 hover:text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                {isRtl ? 'العودة للوحة الإدارة' : 'Return to Admin Dashboard'}
              </button>
            ) : (
              <button
                onClick={() => {
                  window.history.pushState({}, '', '/');
                  setDirectProfileId(null);
                }}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                {isRtl ? 'تسجيل دخول المسؤول' : 'Admin Sign In'}
              </button>
            )}
            <div className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
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
        onLinkClick={() => handleTrackClick(previewingClient.id)}
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

        {/* Reports overview mock */}
        {activeTab === 'reports' && (
          <div className="flex-1 overflow-y-auto px-8 md:px-12 py-10 max-w-4xl mx-auto space-y-6 w-full custom-scrollbar text-center">
            <h2 className="text-xl font-extrabold text-[#e5e2e1] uppercase tracking-wider border-b border-zinc-900 pb-4 text-start">
              {t.agencyReportsTitle}
            </h2>
            
            <div className="bg-[#141414] border border-zinc-850 p-6 rounded-2xl space-y-6 text-center py-20">
              <span className="text-xs font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
                {t.reportingServerOnline}
              </span>
              <p className="text-xs text-zinc-500 max-w-md mx-auto mt-4 leading-relaxed">
                {t.reportingServerSub}
              </p>
              <div className="pt-4 flex justify-center gap-4">
                <button
                  onClick={() => {
                    setActiveTab('dashboard');
                    triggerToast(t.toastCsvReady);
                  }}
                  className="bg-blue-600 hover:bg-blue-500 px-6 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white rounded-xl active:scale-[0.98] outline-none transition-all cursor-pointer"
                >
                  {t.downloadCsvBtn}
                </button>
              </div>
            </div>
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

    </div>
  );
}
