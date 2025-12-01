import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Activity, Shield, ShieldAlert, Cpu, Server, Wifi, Zap, Hexagon, Database } from 'lucide-react';
import { TrafficPoint, SystemStats } from '../types';

interface DashboardProps {
  stats: SystemStats;
  trafficData: TrafficPoint[];
}

const StatCard = ({ title, value, sub, icon: Icon, colorClass, barColor }: any) => (
  <div className="tech-border p-4 h-full relative group overflow-hidden">
    <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity">
      <Icon className={`w-12 h-12 ${colorClass}`} />
    </div>
    <div className="relative z-10">
      <div className="flex items-center space-x-2 mb-2">
        <Icon className={`w-4 h-4 ${colorClass}`} />
        <h3 className="text-cyber-500 text-xs font-bold tracking-[0.2em] uppercase">{title}</h3>
      </div>
      <div className="text-3xl font-mono font-bold text-white mb-1 glow-text">{value}</div>
      <div className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">{sub}</div>
      
      <div className="w-full bg-cyber-900 h-1 mt-4 relative overflow-hidden">
         <div 
           className={`h-full ${barColor}`} 
           style={{ width: '100%', transform: `scaleX(${typeof value === 'number' ? value / 100 : 0.5})`, transformOrigin: 'left' }}
         ></div>
      </div>
    </div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ stats, trafficData }) => {
  return (
    <div className="space-y-6">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="CPU Core Load" 
          value={`${stats.cpu}%`} 
          sub="Processing Unit 01" 
          icon={Cpu} 
          colorClass="text-cyber-500"
          barColor="bg-cyber-500"
        />
        <StatCard 
          title="Memory Alloc" 
          value={`${stats.memory}%`} 
          sub="Volatile Storage" 
          icon={Database} 
          colorClass="text-cyber-200"
          barColor="bg-cyber-200"
        />
        <StatCard 
          title="Active Links" 
          value={stats.activeConnections} 
          sub="Encrypted Tunnels" 
          icon={Wifi} 
          colorClass="text-cyber-300"
          barColor="bg-cyber-300"
        />
        <StatCard 
          title="Threats Nullified" 
          value={stats.blockedToday} 
          sub="Auto-Defense Matrix" 
          icon={Shield} 
          colorClass="text-cyber-400"
          barColor="bg-cyber-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Traffic Monitor */}
        <div className="lg:col-span-2 tech-border p-6 min-h-[400px]">
          <div className="flex justify-between items-start mb-6">
             <div>
               <h3 className="text-lg font-bold text-white flex items-center">
                 <Activity className="w-5 h-5 mr-2 text-cyber-500" />
                 NETWORK_TRAFFIC_ANALYZER
               </h3>
               <p className="text-xs text-cyber-500 font-mono mt-1">LIVE DATA FEED // MONITORING INTERFACE eth0</p>
             </div>
             <div className="flex space-x-1">
               <div className="w-2 h-2 bg-cyber-500 animate-pulse"></div>
               <div className="w-2 h-2 bg-cyber-500/50"></div>
               <div className="w-2 h-2 bg-cyber-500/20"></div>
             </div>
          </div>
          
          <div className="h-[300px] w-full border border-cyber-800 bg-cyber-900/50 p-2 relative">
            {/* Grid decoration */}
            <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 pointer-events-none opacity-10">
               {[...Array(24)].map((_, i) => <div key={i} className="border border-cyber-500/20"></div>)}
            </div>
            
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData}>
                <defs>
                  <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00f0ff" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7000ff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#7000ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#112240" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="#233554" 
                  tick={{fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono'}} 
                  tickLine={false}
                />
                <YAxis 
                  stroke="#233554" 
                  tick={{fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono'}} 
                  tickLine={false}
                  orientation="right"
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#050a14', borderColor: '#00f0ff', color: '#f1f5f9', fontFamily: 'JetBrains Mono', fontSize: '12px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                  cursor={{stroke: '#00f0ff', strokeWidth: 1, strokeDasharray: '4 4'}}
                />
                <Area 
                  type="step" 
                  dataKey="inboundMb" 
                  stroke="#00f0ff" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorIn)" 
                  name="INBOUND"
                  animationDuration={500}
                />
                <Area 
                  type="step" 
                  dataKey="outboundMb" 
                  stroke="#7000ff" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorOut)"
                  name="OUTBOUND"
                  animationDuration={500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Panel - System Health */}
        <div className="space-y-6">
           <div className="tech-border p-6">
              <h3 className="text-sm font-bold text-cyber-300 uppercase tracking-widest mb-4 border-b border-cyber-800 pb-2">
                Node Status
              </h3>
              <div className="space-y-4">
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 font-mono">FIREWALL</span>
                    <span className="text-green-400 font-bold font-mono text-xs px-2 py-0.5 bg-green-900/30 border border-green-500/30 rounded">ACTIVE</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 font-mono">AI ENGINE</span>
                    <span className="text-cyber-500 font-bold font-mono text-xs px-2 py-0.5 bg-cyber-900/30 border border-cyber-500/30 rounded">ONLINE</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 font-mono">DB INTEGRITY</span>
                    <span className="text-green-400 font-bold font-mono text-xs px-2 py-0.5 bg-green-900/30 border border-green-500/30 rounded">100%</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 font-mono">LAST BACKUP</span>
                    <span className="text-gray-500 font-bold font-mono text-xs">04:00 UTC</span>
                 </div>
              </div>
           </div>

           <div className="tech-border p-6 bg-gradient-to-br from-cyber-900 to-cyber-800">
             <div className="flex items-center space-x-3 mb-4">
                <Hexagon className="w-6 h-6 text-cyber-400 animate-spin-slow" />
                <div>
                   <h4 className="text-white font-bold text-sm">THREAT LEVEL</h4>
                   <p className="text-[10px] text-gray-400 uppercase">Heuristic Analysis</p>
                </div>
             </div>
             
             <div className="flex items-end space-x-1 h-16">
                {[40, 60, 30, 80, 50, 90, 20, 40, 60, 30].map((h, i) => (
                  <div key={i} className="flex-1 bg-cyber-400/20 relative group">
                     <div 
                        className="absolute bottom-0 w-full bg-cyber-400 transition-all duration-300 group-hover:bg-cyber-300" 
                        style={{height: `${h}%`}}
                     ></div>
                  </div>
                ))}
             </div>
             <p className="mt-2 text-center text-cyber-400 font-mono text-xs font-bold animate-pulse">ELEVATED</p>
           </div>
        </div>
      </div>
    </div>
  );
};