
import React, { useState } from 'react';
import WelcomeView from './components/WelcomeView';
import AuthView from './components/AuthView';
import DashboardView from './components/DashboardView';
import TrendSpotterPage from './components/TrendSpotterPage';
import StrategistPage from './components/StrategistPage';
import CopywriterPage from './components/CopywriterPage';
import ArtDirectorPage from './components/ArtDirectorPage';

type View = 'welcome' | 'login' | 'signup' | 'dashboard' | 'agent-trend-spotter' | 'agent-strategist' | 'agent-copywriter' | 'agent-art-director';

interface SharedContext {
  niche: string;
  location: string;
  trend: string;
  goal: string;
  strategy?: {
    planName: string;
    phases: { day: number; task: string; objective: string }[];
  };
  copy?: {
    variants: { platform: string; headline: string; body: string; cta: string }[];
    taglines: string[];
  };
}

const App: React.FC = () => {
  const [view, setView] = useState<View>('welcome');
  const [sharedContext, setSharedContext] = useState<SharedContext | null>(null);

  const navigateTo = (newView: View) => setView(newView);

  const handlePushToStrategist = (context: SharedContext) => {
    setSharedContext(context);
    navigateTo('agent-strategist');
  };

  const handlePushToCopywriter = (context: SharedContext) => {
    setSharedContext(context);
    navigateTo('agent-copywriter');
  };

  const handlePushToArtDirector = (context: SharedContext) => {
    setSharedContext(context);
    navigateTo('agent-art-director');
  };

  return (
    <div className="min-h-screen bg-[#0b0f14] text-slate-200 selection:bg-[#00d8ff]/30 selection:text-white transition-colors duration-500">
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#00d8ff_1px,transparent_1px)] [background-size:24px_24px]"></div>

      {view === 'welcome' && (
        <WelcomeView onGetStarted={() => navigateTo('signup')} onLogin={() => navigateTo('login')} />
      )}

      {(view === 'login' || view === 'signup') && (
        <AuthView 
          type={view} 
          onSuccess={() => navigateTo('dashboard')} 
          onBack={() => navigateTo('welcome')}
          onSwitch={() => navigateTo(view === 'login' ? 'signup' : 'login')}
        />
      )}

      {view === 'dashboard' && (
        <DashboardView 
          onLogout={() => navigateTo('welcome')} 
          onNavigateToAgent={(id) => navigateTo(`agent-${id}` as View)}
        />
      )}

      {view === 'agent-trend-spotter' && (
        <TrendSpotterPage 
          onBack={() => navigateTo('dashboard')} 
          onPushToStrategist={handlePushToStrategist}
        />
      )}

      {view === 'agent-strategist' && (
        <StrategistPage 
          onBack={() => navigateTo('dashboard')} 
          initialContext={sharedContext}
          onPushToCopywriter={handlePushToCopywriter}
        />
      )}

      {view === 'agent-copywriter' && (
        <CopywriterPage 
          onBack={() => navigateTo('dashboard')} 
          initialContext={sharedContext}
          onPushToArtDirector={handlePushToArtDirector}
        />
      )}

      {view === 'agent-art-director' && (
        <ArtDirectorPage 
          onBack={() => navigateTo('dashboard')} 
          initialContext={sharedContext}
        />
      )}
    </div>
  );
};

export default App;
