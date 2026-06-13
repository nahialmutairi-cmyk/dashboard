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

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('ml_admin_clients');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved clients, falling back to initial data', e);
      }
    }
    return INITIAL_CLIENTS;
  });

  // Current sub-view: 'dashboard' | 'edit' | 'preview' | 'settings' | 'account' | 'reports'
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [previewingClient, setPreviewingClient] = useState<Client | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const t = translations[language];
  const isRtl = language === 'ar';

  // Sync clients with localStorage
  useEffect(() => {
    localStorage.setItem('ml_admin_clients', JSON.stringify(clients));
  }, [clients]);

  // Sync language selection with localStorage
  useEffect(() => {
    localStorage.setItem('ml_admin_language', language);
  }, [language]);

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
  const handleAddClient = (newClient: Client) => {
    setClients([newClient, ...clients]);
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

  const handleSaveClient = (updatedClient: Client) => {
    setClients(clients.map((c) => (c.id === updatedClient.id ? updatedClient : c)));
    setEditingClient(null);
    setActiveTab('dashboard');
    triggerToast(translations[language].toastSavedClient);
  };

  const handleDeleteClient = (clientId: string) => {
    const clientToDelete = clients.find((c) => c.id === clientId);
    const confirmMsg = isRtl
      ? `هل أنت متأكد من رغبتك في حذف وإزالة الملف التعريفي للعميل: "${clientToDelete?.name || clientId}"؟`
      : `Are you sure you want to remove client campaign profile: "${clientToDelete?.name || clientId}"?`;

    if (window.confirm(confirmMsg)) {
      setClients(clients.filter((c) => c.id !== clientId));
      triggerToast(translations[language].toastRemovedClient);
    }
  };

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
                  <input type="text" readOnly value="https://medialand.agency/campaign" className="w-full bg-[#0e0e0e] border border-zinc-850 p-3 rounded-lg text-xs font-mono text-zinc-400" />
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
