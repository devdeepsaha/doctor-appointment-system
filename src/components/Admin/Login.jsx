import React, { useState } from 'react';
import { supabase } from './supabaseClient'; // Import your client

const Login = ({ onLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    // --- AUTH LOGIC ---
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      // Successfully authenticated
      onLogin(); 
    }
  };

  return (
    <div className="bg-background font-body text-on-surface min-h-screen flex flex-col selection:bg-primary-fixed selection:text-on-primary-fixed relative overflow-hidden">
      
      {/* Organic Background Elements */}
      <div 
        className="fixed top-[-10%] left-[-10%] w-[60%] h-[60%] -z-10" 
        style={{
          background: 'radial-gradient(circle, rgba(134, 242, 228, 0.15) 0%, rgba(248, 249, 255, 0) 70%)',
          borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%'
        }}
      />
      <div 
        className="fixed bottom-[-5%] right-[-5%] w-[50%] h-[50%] -z-10"
        style={{
          background: 'radial-gradient(circle, rgba(214, 227, 255, 0.2) 0%, rgba(248, 249, 255, 0) 70%)',
          borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%'
        }}
      />

      <main className="flex-grow flex items-center justify-center px-6 py-20 z-10">
        <div className="w-full max-w-[480px]">
          
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary mb-6 shadow-[0_8px_32px_rgba(11,28,48,0.06)]">
              <span className="material-symbols-outlined text-white text-4xl">medical_services</span>
            </div>
            <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface mb-2">MedBook Admin</h1>
            <p className="text-on-surface-variant font-body text-sm tracking-wide uppercase font-semibold">Secure Provider Portal</p>
          </div>

          <div className="bg-white rounded-[2rem] p-10 shadow-[0_8px_32px_rgba(11,28,48,0.06)] relative overflow-hidden border border-outline-variant/10">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-secondary"></div>
            
            {/* Display Error Message if Login Fails */}
            {errorMsg && (
              <div className="mb-6 p-4 bg-error-container text-error rounded-xl text-xs font-bold flex items-center gap-2 animate-bounce">
                <span className="material-symbols-outlined text-sm">error</span>
                {errorMsg}
              </div>
            )}

            <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="block font-label text-sm font-semibold text-on-surface-variant ml-1" htmlFor="email">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-outline">
                    <span className="material-symbols-outlined text-xl">alternate_email</span>
                  </div>
                  <input 
                    className="w-full bg-surface-container-low border-none rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all text-on-surface placeholder:text-outline/60" 
                    id="email" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="doctor@medbook.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="block font-label text-sm font-semibold text-on-surface-variant" htmlFor="password">Password</label>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-outline">
                    <span className="material-symbols-outlined text-xl">lock</span>
                  </div>
                  <input 
                    className="w-full bg-surface-container-low border-none rounded-xl py-4 pl-12 pr-12 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all text-on-surface placeholder:text-outline/60" 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-4 flex items-center text-outline hover:text-on-surface-variant transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">{showPassword ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-container text-white font-headline font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Secure Sign In</span>
                    <span className="material-symbols-outlined text-xl">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center pt-8 border-t border-outline-variant/10">
              <p className="text-sm text-on-surface-variant">
                Difficulty signing in? <a className="text-primary font-semibold hover:underline" href="#">Contact IT Support</a>
              </p>
            </div>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8">
            <div className="flex items-center gap-2 bg-surface-container-high/40 px-4 py-2 rounded-full border border-outline-variant/20">
              <span className="material-symbols-outlined text-secondary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Medical Grade Security</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-10 px-6 mt-auto z-10 relative">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-on-surface-variant text-xs">© 2026 MedBook Dental. Confidential System.</p>
        </div>
      </footer>
    </div>
  );
};

export default Login;