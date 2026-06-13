import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Key, ArrowRight, Globe } from 'lucide-react';
import { translations } from '../translations';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  language: 'en' | 'ar';
  onLanguageChange: (lang: 'en' | 'ar') => void;
}

export default function LoginScreen({ onLoginSuccess, language, onLanguageChange }: LoginScreenProps) {
  const [email, setEmail] = useState('admin@medialand.agency');
  const [password, setPassword] = useState('password1234');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const t = translations[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);

    // Authentic dark command center authentication loader simulation
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => {
        onLoginSuccess();
      }, 800);
    }, 1500);
  };

  const isRtl = language === 'ar';

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'}
      className="relative min-h-screen w-full flex items-center justify-center bg-[#090909] text-[#e5e2e1] overflow-hidden px-4 md:px-0"
    >
      {/* Immersive background decoration */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        {/* Vignette overlays */}
        <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_20%,rgba(0,0,0,0.8)_100%] pointer-events-none" />
      </div>

      {/* Language Switcher Button on Header corner */}
      <div className={`absolute top-6 ${isRtl ? 'left-6' : 'right-6'} z-50`}>
        <button
          onClick={() => onLanguageChange(language === 'en' ? 'ar' : 'en')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-xs text-zinc-300 hover:text-white transition-all cursor-pointer font-medium"
        >
          <Globe className="w-3.5 h-3.5 text-blue-400" />
          <span>{language === 'en' ? 'العربية (AR)' : 'English (EN)'}</span>
        </button>
      </div>

      <div className="relative z-10 w-full max-w-[440px]">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-[#e5e2e1] tracking-tight mb-2">
            {t.loginTitle}
          </h1>
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-semibold text-blue-400 tracking-wider uppercase">
              {t.adminAccessOnly}
            </span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-[#141414] border border-zinc-800/60 rounded-2xl p-8 shadow-2xl backdrop-blur-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block" htmlFor="email">
                {t.emailLabel}
              </label>
              <div className="relative flex items-center rounded-xl border border-zinc-800 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 bg-[#0e0e0e] overflow-hidden transition-all">
                <div className={`pl-4 ${isRtl ? 'pr-4 pl-0' : 'pl-4'} text-zinc-500`}>
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-3.5 bg-transparent border-none text-[#e5e2e1] text-sm focus:outline-none placeholder:text-zinc-650"
                  placeholder="admin@medialand.agency"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block" htmlFor="password">
                  {t.passwordLabel}
                </label>
                <button
                  type="button"
                  onClick={() => setIsSuccess(true)}
                  className="text-xs text-blue-400 hover:underline transition-all"
                >
                  {t.forgotBtn}
                </button>
              </div>
              <div className="relative flex items-center rounded-xl border border-zinc-800 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 bg-[#0e0e0e] overflow-hidden transition-all">
                <div className={`pl-4 ${isRtl ? 'pr-4 pl-0' : 'pl-4'} text-zinc-500`}>
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full ${isRtl ? 'pl-10 pr-3' : 'pl-3 pr-10'} py-3.5 bg-transparent border-none text-[#e5e2e1] text-sm focus:outline-none placeholder:text-zinc-650`}
                  placeholder="••••••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute ${isRtl ? 'left-3' : 'right-3'} text-zinc-500 hover:text-zinc-300 transition-colors`}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || isSuccess}
                className={`w-full py-4 rounded-xl font-semibold text-sm transition-all flex justify-center items-center gap-2 glow-btn cursor-pointer ${
                  isSuccess
                    ? 'bg-emerald-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-500 text-white active:scale-[0.98]'
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>{t.authenticating}</span>
                  </>
                ) : isSuccess ? (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>{t.accessGranted}</span>
                  </>
                ) : (
                  <>
                    <span>{t.signInBtn}</span>
                    <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Secure notice */}
          <div className="mt-8 pt-6 border-t border-zinc-800/60 text-center">
            <p className="text-xs text-zinc-500 leading-relaxed">
              {t.securityNotice}
            </p>
          </div>
        </div>

        {/* Badges */}
        <div className="mt-6 flex justify-center gap-8 opacity-40 hover:opacity-60 transition-opacity">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
            <ShieldCheck className="w-5 h-5 text-zinc-400" />
            <span className="tracking-widest uppercase">{t.secureCloud}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
            <Key className="w-5 h-5 text-zinc-400" />
            <span className="tracking-widest uppercase">{t.keySec}</span>
          </div>
        </div>
      </div>

      {/* Side visual decoration for large screens */}
      <div className={`fixed ${isRtl ? 'left-0 border-r' : 'right-0 border-l'} top-0 bottom-0 w-[30%] hidden xl:block pointer-events-none border-zinc-800/20 overflow-hidden bg-zinc-950`}>
        <div className="absolute inset-0 opacity-45 bg-cover bg-center mix-blend-overlay" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDwlDAFYVGFMWVBGtxemjiXuApP_e5oNYJ-yV1FW93R0hoQFkSMkQ-7EbZxojePbi4MhkeyvyvM7q6185c3cF5qTM-ch8TViFG7dqIwb_hGO92-V233PRSSA9Rm1b1wSnog8KVG4DIA3ePMesRSBu3sdxGc7Yt3QSfA_aKPrbEmmRWNXHz1xYA-OQn91WH9M_rYNldvZCmucKqQW8l0rc6zdxTA6PoRyNFhCNqEp6j3HQovXAaOZZMf6w')" }} />
        <div className={`absolute inset-0 bg-gradient-to-r ${isRtl ? 'from-transparent to-[#090909]' : 'from-[#090909] to-transparent'}`} />
      </div>
    </div>
  );
}
