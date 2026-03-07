import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';

const Landing = () => {
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-neutral-300 min-h-screen flex flex-col relative overflow-x-hidden">
      <div className="fixed inset-0 grid-bg pointer-events-none z-0"></div>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-[150px] pointer-events-none z-0"></div>

      <nav className="fixed top-0 w-full z-50 glass-effect border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer group">
              <Icon name="graphic_eq" className="text-white text-3xl group-hover:rotate-12 transition-transform duration-300" />
              <span className="font-bold text-xl tracking-tight text-white">Campus Whisper</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              {['About', 'Community Guidelines', 'Safety'].map((item) => (
                <a key={item} href="#" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">
                  {item}
                </a>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white transition-colors">
                Log in
              </Link>
              <Link to="/login" className="btn-gradient text-black px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center gap-2">
                <span>Get Started</span>
                <Icon name="arrow_forward" className="text-sm" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow z-10 pt-32 pb-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center max-w-7xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-200 text-xs font-medium mb-8 animate-fade-in-up">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          Live Campus Network
        </div>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 leading-[1.1]">
          Speak Freely.<br />
          <span className="text-gradient">Campus Voices, Unfiltered.</span>
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-neutral-400 font-light mb-10 leading-relaxed">
          The anonymous network for your campus. Connect with peers, share confessions, and join the conversation without the social friction.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto mb-16">
          <Link to="/login" className="w-full sm:w-auto px-8 py-4 btn-gradient text-black text-lg font-bold rounded-xl shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 group">
            Start Whispering
            <Icon name="send" className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <button className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 text-lg font-medium rounded-xl transition-all duration-300 backdrop-blur-sm flex items-center justify-center gap-2">
            Find Your Campus
            <Icon name="search" />
          </button>
        </div>

        <div className="w-full max-w-5xl mx-auto bg-surface-dark/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-white/10">
            <div className="flex flex-col items-center justify-center gap-2 p-2">
              <div className="flex items-center gap-2 text-neutral-500 text-sm font-medium uppercase tracking-wider">
                <Icon name="public" className="text-emerald-400 text-base" />
                Students Online
              </div>
              <div className="text-4xl font-bold text-white tabular-nums flex items-baseline gap-1">
                1,240
                <span className="text-sm font-normal text-emerald-400 animate-pulse">●</span>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-2 p-2 pt-8 md:pt-2">
              <div className="flex items-center gap-2 text-neutral-500 text-sm font-medium uppercase tracking-wider">
                <Icon name="local_fire_department" className="text-orange-300 text-base" />
                Active Rooms
              </div>
              <div className="text-4xl font-bold text-white tabular-nums">85</div>
            </div>
             <div className="flex flex-col items-center justify-center gap-2 p-2 pt-8 md:pt-2">
              <div className="flex items-center gap-2 text-neutral-500 text-sm font-medium uppercase tracking-wider">
                <Icon name="forum" className="text-white text-base" />
                Whispers/min
              </div>
              <div className="text-4xl font-bold text-white tabular-nums">340</div>
            </div>
          </div>
        </div>
      </main>

      <section className="relative z-10 py-24 bg-surface-dark border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { icon: 'visibility_off', title: 'Total Anonymity', desc: 'Your identity is cryptographically hashed. Speak your mind without fear of being doxxed or tracked by administration.' },
                    { icon: 'timer', title: 'Ephemeral Rooms', desc: 'Chats disappear after 24 hours. The conversation is live, raw, and doesn\'t leave a permanent digital footprint.' },
                    { icon: 'domain_verification', title: 'Campus Locked', desc: 'Verify with your .edu email once to get access, then discard it. We ensure only real students join the conversation.' }
                ].map((item) => (
                     <div key={item.title} className="p-8 rounded-2xl bg-black/40 border border-white/5 hover:border-white/20 transition-colors group">
                        <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform duration-500">
                            <Icon name={item.icon} className="text-3xl" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                        <p className="text-neutral-400 leading-relaxed">{item.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 bg-background-dark pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
                <div className="text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                        <Icon name="graphic_eq" className="text-white text-2xl" />
                        <span className="font-bold text-lg text-white">Campus Whisper</span>
                    </div>
                     <p className="text-neutral-500 text-sm max-w-xs">
                        Building the future of unfiltered student communication. Open source, secure, and always anonymous.
                    </p>
                </div>
                 <div className="flex items-center gap-3 px-5 py-3 rounded-lg bg-white/5 border border-white/10">
                    <Icon name="lock" className="text-neutral-400" />
                    <div className="flex flex-col text-left">
                        <span className="text-xs text-neutral-400 uppercase tracking-wider font-bold">Privacy First</span>
                        <span className="text-sm text-neutral-300 font-medium">No email required. No tracking.</span>
                    </div>
                </div>
            </div>
             <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-neutral-600 text-sm">© 2026 Campus Whisper. All rights reserved.</p>
                <div className="flex gap-6">
                    {['Privacy Policy', 'Terms of Service', 'Contact Support'].map(l => (
                         <a key={l} href="#" className="text-neutral-500 hover:text-white text-sm transition-colors">{l}</a>
                    ))}
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;