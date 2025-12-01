import React, { useState, useEffect } from 'react';
import { Alert, Severity } from '../types';
import { ShieldAlert, CheckCircle, BrainCircuit, Clock, ChevronDown, ChevronUp, AlertTriangle, Terminal, RefreshCcw } from 'lucide-react';
import { analyzeThreat } from '../services/geminiService';
import ReactMarkdown from 'react-markdown'; 

interface AlertsProps {
  alerts: Alert[];
  onResolve: (id: string) => void;
  onSnooze: (id: string, minutes: number) => void;
  onUpdateAlert: (alert: Alert) => void;
}

export const Alerts: React.FC<AlertsProps> = ({ alerts, onResolve, onSnooze, onUpdateAlert }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [analyzingIds, setAnalyzingIds] = useState<Set<string>>(new Set());
  const [snoozeOpenId, setSnoozeOpenId] = useState<string | null>(null);

  const getSeverityStyle = (sev: Severity) => {
    switch (sev) {
      case Severity.CRITICAL: return 'text-cyber-400 border-cyber-400 shadow-[0_0_10px_rgba(255,0,60,0.3)]';
      case Severity.HIGH: return 'text-orange-500 border-orange-500';
      case Severity.MEDIUM: return 'text-cyber-300 border-cyber-300';
      case Severity.LOW: return 'text-cyber-500 border-cyber-500';
    }
  };

  const isAnalysisError = (text?: string) => {
    if (!text) return false;
    return text.startsWith("Error") || text.includes("API Key missing") || text.includes("No analysis");
  };

  // Auto-analysis effect
  useEffect(() => {
    const candidates = alerts.filter(a => !a.analysis && !analyzingIds.has(a.id));

    if (candidates.length === 0) return;

    setAnalyzingIds(prev => {
      const next = new Set(prev);
      candidates.forEach(c => next.add(c.id));
      return next;
    });

    candidates.forEach(async (alert) => {
      // Set status to ANALYZING
      if (alert.status !== 'ANALYZING') {
        onUpdateAlert({ ...alert, status: 'ANALYZING' });
      }

      try {
        const result = await analyzeThreat(alert);
        // Analysis complete: update result and revert status to NEW (active)
        onUpdateAlert({ ...alert, analysis: result, status: 'NEW' });
      } catch (err) {
        console.error(`Auto-analysis failed for ${alert.id}:`, err);
        onUpdateAlert({ ...alert, status: 'NEW' });
      } finally {
        setAnalyzingIds(prev => {
          const next = new Set(prev);
          next.delete(alert.id);
          return next;
        });
      }
    });
  }, [alerts, analyzingIds, onUpdateAlert]);

  const handleAnalyze = async (e: React.MouseEvent, alert: Alert) => {
    e.stopPropagation();
    if (expandedId !== alert.id) setExpandedId(alert.id);
    if (analyzingIds.has(alert.id)) return;

    setAnalyzingIds(prev => new Set(prev).add(alert.id));
    
    // Set status to ANALYZING
    onUpdateAlert({ ...alert, status: 'ANALYZING' });
    
    try {
      const result = await analyzeThreat(alert);
      // Analysis complete: update result and revert status to NEW
      onUpdateAlert({ ...alert, analysis: result, status: 'NEW' });
    } catch (err) {
      console.error(err);
      onUpdateAlert({ ...alert, analysis: "Error: Analysis sequence failed. Check connection.", status: 'NEW' });
    } finally {
      setAnalyzingIds(prev => {
        const next = new Set(prev);
        next.delete(alert.id);
        return next;
      });
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="relative h-full flex flex-col space-y-4">
      {/* Overlay for snooze click-away */}
      {snoozeOpenId && (
        <div 
          className="fixed inset-0 z-40 cursor-default" 
          onClick={() => setSnoozeOpenId(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between bg-cyber-900/80 p-4 border-b border-cyber-500/30 tech-border">
        <div className="flex items-center">
           <ShieldAlert className="w-6 h-6 text-cyber-400 mr-3 animate-pulse" />
           <div>
             <h2 className="text-xl font-bold tracking-widest text-white uppercase">Intrusion_Log</h2>
             <p className="text-[10px] text-cyber-500 font-mono">REAL-TIME PACKET INTERCEPTION</p>
           </div>
        </div>
        <div className="flex items-center space-x-4">
           <div className="text-right hidden sm:block">
              <div className="text-xs text-gray-400 font-mono">ACTIVE THREATS</div>
              <div className="text-2xl font-mono text-cyber-400 leading-none">{alerts.length}</div>
           </div>
        </div>
      </div>

      {/* Alert List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
         {alerts.map((alert) => (
           <div key={alert.id} className={`group transition-all duration-300 ${expandedId === alert.id ? 'mb-4' : ''}`}>
              {/* Alert Row */}
              <div 
                onClick={() => toggleExpand(alert.id)}
                className={`
                  relative cursor-pointer bg-cyber-800/40 border-l-4 p-4 hover:bg-cyber-800/80 transition-all
                  flex flex-col sm:flex-row items-start sm:items-center gap-4
                  ${getSeverityStyle(alert.severity).split(' ')[1].replace('text-', 'border-l-')}
                  ${expandedId === alert.id ? 'bg-cyber-800/80 border-b border-cyber-700' : 'border-b border-transparent'}
                `}
              >
                {/* Background Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                <div className="flex-shrink-0 flex items-center space-x-4 w-full sm:w-auto">
                   <div className={`w-2 h-2 rounded-full ${analyzingIds.has(alert.id) || alert.status === 'ANALYZING' ? 'bg-cyber-500 animate-ping' : 'bg-gray-600'}`}></div>
                   <div className="font-mono text-xs text-cyber-500">{alert.timestamp.toLocaleTimeString()}</div>
                   <div className={`
                      text-[10px] font-bold px-2 py-0.5 border uppercase tracking-wider
                      ${getSeverityStyle(alert.severity)}
                   `}>
                      {alert.severity}
                   </div>
                </div>

                <div className="flex-1 min-w-0">
                   <div className="text-white font-bold font-mono truncate text-sm flex items-center">
                      {alert.type}
                      {alert.analysis && !isAnalysisError(alert.analysis) && <BrainCircuit className="w-3 h-3 text-cyber-500 ml-2" />}
                   </div>
                   <div className="text-xs text-gray-500 font-mono truncate mt-1">
                      SRC: <span className="text-gray-400">{alert.sourceIp}</span> <span className="text-cyber-600">::</span> DST: <span className="text-gray-400">{alert.destinationIp}</span>
                   </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity sm:opacity-100" onClick={e => e.stopPropagation()}>
                    <div className="relative z-50">
                        <button 
                          onClick={() => setSnoozeOpenId(snoozeOpenId === alert.id ? null : alert.id)}
                          className="p-2 hover:bg-cyber-700 text-cyber-300 rounded transition-colors"
                          title="Snooze"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                        {snoozeOpenId === alert.id && (
                          <div className="absolute right-0 top-full mt-2 w-32 bg-cyber-950 border border-cyber-500 shadow-[0_0_15px_rgba(0,240,255,0.2)] z-50">
                             <div className="px-2 py-1 text-[10px] text-cyber-500 bg-cyber-900 font-bold uppercase border-b border-cyber-800">Snooze Duration</div>
                             {[5, 60, 1440].map(mins => (
                               <button 
                                 key={mins}
                                 onClick={() => { onSnooze(alert.id, mins); setSnoozeOpenId(null); }}
                                 className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-cyber-500 hover:text-black font-mono transition-colors"
                               >
                                 {mins === 1440 ? '24 Hours' : `${mins} Minutes`}
                               </button>
                             ))}
                          </div>
                        )}
                    </div>
                    <button onClick={(e) => handleAnalyze(e, alert)} className="p-2 hover:bg-cyber-700 text-cyber-500 rounded transition-colors" title="Re-analyze">
                       <BrainCircuit className={`w-4 h-4 ${analyzingIds.has(alert.id) || alert.status === 'ANALYZING' ? 'animate-spin' : ''}`} />
                    </button>
                    <button onClick={() => onResolve(alert.id)} className="p-2 hover:bg-cyber-700 text-green-400 rounded transition-colors" title="Resolve">
                       <CheckCircle className="w-4 h-4" />
                    </button>
                    <div className="pl-2">
                       {expandedId === alert.id ? <ChevronUp className="w-4 h-4 text-cyber-500" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
                    </div>
                </div>
              </div>

              {/* Expanded Detail View */}
              {expandedId === alert.id && (
                <div className="mx-4 mb-4 border-l border-b border-r border-cyber-700 bg-black/40 relative animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyber-500 to-transparent opacity-50"></div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3">
                     {/* Raw Data Column */}
                     <div className="p-6 border-r border-cyber-700 space-y-4">
                        <div className="flex items-center text-cyber-500 mb-2">
                           <Terminal className="w-4 h-4 mr-2" />
                           <span className="text-xs font-bold tracking-widest uppercase">Packet_Header</span>
                        </div>
                        <div className="space-y-2 font-mono text-xs text-gray-400">
                           <div className="flex justify-between border-b border-cyber-800 pb-1">
                              <span>ID</span> <span className="text-white">{alert.id.substring(0,8)}...</span>
                           </div>
                           <div className="flex justify-between border-b border-cyber-800 pb-1">
                              <span>PROTO</span> <span className="text-cyber-300">{alert.protocol}</span>
                           </div>
                           <div className="flex justify-between border-b border-cyber-800 pb-1">
                              <span>STATUS</span> <span className={alert.status === 'NEW' ? 'text-cyber-400' : alert.status === 'ANALYZING' ? 'text-cyber-500 animate-pulse' : 'text-green-400'}>{alert.status}</span>
                           </div>
                           <div className="pt-2">
                              <div className="mb-1 text-[10px] uppercase text-gray-600">Payload Signature</div>
                              <div className="bg-black border border-cyber-900 p-2 text-cyber-400 break-all">
                                 {alert.payload}
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* AI Analysis Column */}
                     <div className="lg:col-span-2 p-6 bg-cyber-900/30">
                        <div className="flex items-center text-cyber-200 mb-4">
                           <BrainCircuit className="w-4 h-4 mr-2" />
                           <span className="text-xs font-bold tracking-widest uppercase">Gemini_Threat_Assessment</span>
                           {(analyzingIds.has(alert.id) || alert.status === 'ANALYZING') && <span className="ml-2 text-[10px] text-cyber-500 animate-pulse">PROCESSING...</span>}
                        </div>
                        
                        <div className="prose prose-invert prose-sm max-w-none prose-p:font-mono prose-headings:font-sans prose-headings:text-cyber-500">
                           {analyzingIds.has(alert.id) || alert.status === 'ANALYZING' ? (
                              <div className="flex flex-col items-center justify-center h-40 space-y-4 border border-cyber-800/50 bg-cyber-950/50 rounded">
                                <div className="relative w-12 h-12">
                                    <div className="absolute inset-0 border-t-2 border-cyber-500 rounded-full animate-spin"></div>
                                    <div className="absolute inset-2 border-r-2 border-cyber-300 rounded-full animate-spin-slow"></div>
                                    <div className="absolute inset-3 border-b-2 border-cyber-400 rounded-full animate-spin reverse"></div>
                                </div>
                                <div className="text-center">
                                    <div className="text-cyber-500 font-mono text-xs tracking-widest animate-pulse">NEURAL_SCAN_IN_PROGRESS</div>
                                    <div className="text-cyber-700 font-mono text-[10px] mt-1">Decrypting Payload Signature...</div>
                                    {/* Fake progress bar */}
                                    <div className="w-32 h-1 bg-cyber-900 mt-2 mx-auto overflow-hidden rounded-full">
                                        <div className="h-full bg-cyber-500 animate-[pulse_1s_ease-in-out_infinite] w-2/3"></div>
                                    </div>
                                </div>
                              </div>
                           ) : alert.analysis ? (
                              isAnalysisError(alert.analysis) ? (
                                <div className="border border-red-500/30 bg-red-900/10 p-6 rounded flex flex-col items-center justify-center text-center">
                                    <AlertTriangle className="w-8 h-8 text-red-500 mb-2" />
                                    <h4 className="text-red-500 font-bold text-sm tracking-widest uppercase mb-1">Analysis Sequence Failed</h4>
                                    <p className="text-red-400/70 text-xs font-mono mb-4 max-w-md">{alert.analysis}</p>
                                    <button 
                                        onClick={(e) => handleAnalyze(e, alert)}
                                        className="flex items-center space-x-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 text-red-400 font-mono text-xs uppercase tracking-wider rounded transition-all active:scale-95"
                                    >
                                        <RefreshCcw className="w-3 h-3" />
                                        <span>Retry Sequence</span>
                                    </button>
                                </div>
                              ) : (
                                <ReactMarkdown 
                                  components={{
                                    strong: ({node, ...props}) => <span className="text-cyber-300 font-bold" {...props} />,
                                    li: ({node, ...props}) => <li className="text-gray-300" {...props} />
                                  }}
                                >
                                  {alert.analysis}
                                </ReactMarkdown>
                              )
                           ) : (
                              <div className="text-center py-8 text-gray-600 italic">
                                 <div className="mb-2">Awaiting analysis trigger...</div>
                                 <button 
                                    onClick={(e) => handleAnalyze(e, alert)} 
                                    className="text-xs border border-cyber-700 px-3 py-1 hover:bg-cyber-800 hover:text-cyber-500 transition-colors"
                                 >
                                    INITIATE_MANUAL_SCAN
                                 </button>
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
                </div>
              )}
           </div>
         ))}
         
         {alerts.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600 border border-dashed border-cyber-800 rounded">
               <ShieldAlert className="w-12 h-12 mb-4 opacity-20" />
               <p className="font-mono text-sm">NO ACTIVE SIGNATURES DETECTED</p>
            </div>
         )}
      </div>
    </div>
  );
};