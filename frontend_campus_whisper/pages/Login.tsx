import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, register, user } = useAuth();
  const [alias, setAlias] = useState('Anonymous_Badger');
  const [passkey, setPasskey] = useState('');
  const [frequency, setFrequency] = useState('Main Campus');
  const [showRules, setShowRules] = useState(false);
  const [isNewSignal, setIsNewSignal] = useState(true); // true = Register, false = Login
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // If already logged in, redirect
  React.useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alias.trim() || !passkey.trim()) {
      setError('Alias and passkey are required');
      return;
    }
    setError('');
    setLoading(true);
    try {
      if (isNewSignal) {
        await register(alias.trim(), passkey, frequency);
      } else {
        await login(alias.trim(), passkey);
      }
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Something went wrong';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const randomizeAlias = () => {
      const adjectives = ['Anonymous', 'Silent', 'Neon', 'Quiet', 'Hidden', 'Digital'];
      const nouns = ['Badger', 'Owl', 'Fox', 'Ghost', 'Signal', 'Echo'];
      const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
      const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
      setAlias(`${randomAdjective}_${randomNoun}`);
  };

  return (
    <div className="bg-neutral-950 text-neutral-300 min-h-screen flex flex-col overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-white/5 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-neutral-800/20 rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
      </div>

      {/* Code of Silence Modal Overlay */}
      {showRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="absolute inset-0" 
            onClick={() => setShowRules(false)}
          ></div>
          <div className="bg-neutral-950 border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden group">
             {/* Decorative gradient top bar */}
             <div className="h-1 w-full bg-gradient-to-r from-neutral-800 via-white/20 to-neutral-800"></div>
             
             <div className="p-8">
                <button 
                  onClick={() => setShowRules(false)}
                  className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
                >
                  <Icon name="close" className="text-xl" />
                </button>

                <div className="flex flex-col items-center text-center mb-8">
                  <div className="w-12 h-12 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center mb-4 text-white">
                    <Icon name="gavel" className="text-2xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">The Code of Silence</h3>
                  <p className="text-neutral-500 text-sm mt-2 uppercase tracking-widest">Read carefully</p>
                </div>

                <div className="space-y-6 font-mono text-sm">
                  <div className="bg-neutral-900/50 p-4 rounded-lg border border-white/5 flex gap-4 items-start">
                    <span className="text-2xl font-bold text-white/10 select-none">01</span>
                    <p className="text-neutral-300 leading-relaxed mt-1">
                      The first rule of Campus Whisper is: <br/>
                      <strong className="text-white">You do not talk about Campus Whisper.</strong>
                    </p>
                  </div>

                  <div className="bg-neutral-900/50 p-4 rounded-lg border border-white/5 flex gap-4 items-start">
                    <span className="text-2xl font-bold text-white/10 select-none">02</span>
                    <p className="text-neutral-300 leading-relaxed mt-1">
                      The second rule of Campus Whisper is: <br/>
                      <strong className="text-white">You do NOT talk about Campus Whisper.</strong>
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setShowRules(false)}
                  className="w-full mt-8 bg-white text-black font-bold py-3 rounded-lg hover:bg-neutral-200 transition-colors uppercase text-xs tracking-wider"
                >
                  I Understand
                </button>
             </div>
          </div>
        </div>
      )}

      <main className="flex-grow flex items-center justify-center relative z-10 px-4 py-12">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column (Hero) - Unchanged */}
          <div className="hidden lg:flex flex-col gap-6 pr-8">
            <div className="inline-flex items-center gap-2 text-neutral-400 font-bold tracking-widest uppercase text-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Secure Connection Established
            </div>
            <h1 className="text-6xl font-bold leading-tight text-white">
              Voices without <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-400 to-neutral-600">faces.</span>
            </h1>
            <p className="text-xl text-neutral-500 max-w-md leading-relaxed">
              Join the anonymous campus network where ideas flow freely without social friction. Your identity is what you make it.
            </p>
            <div className="flex gap-4 mt-4">
              <div className="flex -space-x-3">
                 {[1, 2, 3].map((i) => (
                    <img key={i} className="w-10 h-10 rounded-full border-2 border-neutral-950 bg-neutral-800 grayscale object-cover" src={`https://images.unsplash.com/photo-${i === 1 ? '1534528741775-53994a69daeb' : i === 2 ? '1506794778202-cad84cf45f1d' : '1531123897727-8f129e1688ce'}?w=100&h=100&fit=crop`} alt="avatar" />
                 ))}
                <div className="w-10 h-10 rounded-full border-2 border-neutral-950 bg-neutral-900 flex items-center justify-center text-xs font-bold text-neutral-300">
                  +2k
                </div>
              </div>
              <div className="flex flex-col justify-center text-sm text-neutral-500">
                <span className="font-bold text-white">2,403 students</span>
                <span>online now</span>
              </div>
            </div>
          </div>

          {/* Right Column (Login Card) */}
          <div className="w-full max-w-md mx-auto">
            <div className="bg-neutral-900/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-1 overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              <div className="bg-neutral-950/95 rounded-xl p-8 relative z-10 h-full flex flex-col gap-6">
                <div className="flex flex-col gap-6">
                  <div className="text-center lg:hidden mb-2">
                    <h2 className="text-2xl font-bold tracking-tight text-white">Campus Whisper</h2>
                  </div>
                  <div className="bg-neutral-900 rounded-lg p-1 flex relative border border-white/5">
                    <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gradient-to-b from-neutral-800 to-neutral-900 rounded shadow border border-white/5 transition-all duration-300 ${isNewSignal ? 'right-1' : 'left-1'}`}></div>
                    <button type="button" onClick={() => { setIsNewSignal(false); setError(''); }} className={`flex-1 py-2.5 text-sm font-medium transition-colors relative z-10 ${!isNewSignal ? 'text-white font-bold' : 'text-neutral-500 hover:text-neutral-300'}`}>Access Terminal</button>
                    <button type="button" onClick={() => { setIsNewSignal(true); setError(''); }} className={`flex-1 py-2.5 text-sm font-medium transition-colors relative z-10 ${isNewSignal ? 'text-white font-bold' : 'text-neutral-500 hover:text-neutral-300'}`}>New Signal</button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-2.5 rounded-lg text-center">
                    {error}
                  </div>
                )}

                <form className="flex flex-col gap-5 mt-2" onSubmit={handleSubmit}>
                  <div className="flex justify-center mb-2">
                    <div className="relative group cursor-pointer" onClick={randomizeAlias}>
                      <div className="w-24 h-24 rounded-full bg-neutral-900 border-2 border-neutral-800 shadow-lg overflow-hidden flex items-center justify-center transition-transform transform group-hover:scale-105">
                         <Icon name="fingerprint" className="text-6xl text-white/20" />
                      </div>
                      <div className="absolute bottom-0 right-0 bg-white text-black p-1.5 rounded-full shadow-lg border-2 border-neutral-950 hover:bg-neutral-200 transition-all">
                        <Icon name="refresh" className="text-sm block font-bold" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider ml-1">Alias</label>
                    <div className="relative flex items-center group">
                      <Icon name="alternate_email" className="absolute left-3 text-neutral-400 text-lg" />
                      <input
                        type="text"
                        className="w-full bg-neutral-900 border border-white/10 rounded-lg py-3 pl-10 pr-12 text-white placeholder-neutral-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all font-mono"
                        placeholder="Generate a username..."
                        value={alias}
                        onChange={(e) => setAlias(e.target.value)}
                      />
                      <button type="button" onClick={randomizeAlias} className="absolute right-2 p-1.5 text-neutral-400 hover:bg-white/10 rounded-md transition-colors group-hover:text-white" title="Randomize Alias">
                         <Icon name="casino" className="text-lg block" />
                      </button>
                    </div>
                    <p className="text-[10px] text-neutral-600 pl-1">Click the dice to generate a new persona.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider ml-1">Passkey</label>
                    <div className="relative flex items-center">
                        <Icon name="lock" className="absolute left-3 text-neutral-400 text-lg" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="w-full bg-neutral-900 border border-white/10 rounded-lg py-3 pl-10 pr-10 text-white placeholder-neutral-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all font-mono"
                        placeholder={isNewSignal ? 'Create a secure passkey' : 'Enter your passkey'}
                        value={passkey}
                        onChange={(e) => setPasskey(e.target.value)}
                        required
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 text-neutral-500 hover:text-neutral-300">
                        <Icon name={showPassword ? 'visibility' : 'visibility_off'} className="text-lg block" />
                      </button>
                    </div>
                  </div>

                  {isNewSignal && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider ml-1">Frequency</label>
                    <div className="relative">
                      <select 
                        className="w-full bg-neutral-900 border border-white/10 rounded-lg py-3 pl-3 pr-10 text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 appearance-none cursor-pointer"
                        value={frequency}
                        onChange={(e) => setFrequency(e.target.value)}
                      >
                        <option value="Main Campus">Main Campus (General)</option>
                        <option value="Engineering Hall">Engineering Hall</option>
                        <option value="Arts District">Arts District</option>
                        <option value="The Dorms">The Dorms</option>
                      </select>
                      <span className="absolute right-3 top-3.5 text-neutral-400 pointer-events-none">
                        <Icon name="expand_more" className="text-lg" />
                      </span>
                    </div>
                  </div>
                  )}

                  <div className="flex items-start gap-3 mt-1 px-1">
                    <div className="flex items-center h-5">
                      <input id="terms" type="checkbox" className="w-4 h-4 rounded border-white/20 bg-neutral-900 text-neutral-200 focus:ring-offset-neutral-900 focus:ring-white/20" />
                    </div>
                    <label htmlFor="terms" className="text-xs text-neutral-500 leading-snug">
                      I agree to keep the secrets I hear and follow the{' '}
                      <button 
                        type="button" 
                        onClick={() => setShowRules(true)} 
                        className="text-white hover:underline focus:outline-none"
                      >
                        Code of Silence
                      </button>.
                    </label>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="mt-2 w-full bg-white hover:bg-neutral-200 text-black font-bold py-3.5 px-4 rounded-lg shadow-lg hover:shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>{isNewSignal ? 'Enter the Network' : 'Access Terminal'}</span>
                        <Icon name="arrow_forward" className="text-sm transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-2 text-center border-t border-white/5 pt-4">
                  <div className="flex items-center justify-center gap-1 text-xs text-neutral-500">
                    <Icon name="verified_user" className="text-[14px] text-neutral-400" />
                    <span>End-to-end encryption active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
       <footer className="relative z-10 w-full py-6 text-center text-neutral-600 text-xs">
        <div className="flex justify-center gap-6 mb-2">
            {['Manifesto', 'Safety', 'Support'].map(l => (
                <a key={l} href="#" className="hover:text-white transition-colors">{l}</a>
            ))}
        </div>
        <p>© 2026 Campus Whisper Network. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Login;