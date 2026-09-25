import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icon';
import { gamingRoadmapData, RoadmapItem, Language } from '../data/gamingRoadmap';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const CustomNode = ({ data }: any) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      whileHover={{ scale: 1.05, rotate: 1, y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`relative flex flex-col items-center justify-center p-6 sm:p-7 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-[2.5rem] rounded-tr-[1rem] rounded-bl-[1rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] cursor-pointer hover:shadow-[0_20px_40px_rgba(168,85,247,0.15)] dark:hover:shadow-[0_20px_40px_rgba(168,85,247,0.2)] transition-all z-10 w-48 sm:w-56 group overflow-hidden`}
      onClick={(e) => { e.stopPropagation(); data.onClick(data.item); }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-fuchsia-500/5 dark:from-indigo-500/10 dark:via-purple-500/10 dark:to-fuchsia-500/10 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <Handle type="target" position={Position.Top} className="!bg-indigo-400 !w-6 !h-2 !rounded-full !border-none !top-[-4px] opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="text-center w-full flex flex-col items-center relative z-10">
        {data.item.icon && (
          <div className="mb-4 p-4 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-[1.5rem] rounded-tl-lg rounded-br-lg shadow-sm border border-slate-100 dark:border-slate-700 text-indigo-500 dark:text-indigo-400 group-hover:scale-110 group-hover:rotate-[-5deg] transition-all duration-300">
            <Icon name={data.item.icon} size={28} />
          </div>
        )}
        <h4 className={`font-semibold text-slate-800 dark:text-white text-xs sm:text-sm leading-snug tracking-tight ${data.isRTL ? 'font-arabic' : ''}`}>
          {data.item.title[data.lang]}
        </h4>
        {data.item.subtitle && (
          <p className={`text-[9px] sm:text-[10px] text-slate-700 dark:text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed font-medium ${data.isRTL ? 'font-arabic' : ''}`}>
            {data.item.subtitle[data.lang]}
          </p>
        )}
      </div>
      
      <Handle type="source" position={Position.Bottom} className="!bg-fuchsia-400 !w-6 !h-2 !rounded-full !border-none !bottom-[-4px] opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

const GamingRoadmapComponent: React.FC = () => {
  const [lang, setLang] = useState<Language>('fr');
  const [selectedNode, setSelectedNode] = useState<RoadmapItem | null>(null);
  const [colorMode, setColorMode] = useState<'light' | 'dark' | 'system'>('system');

  const isRTL = lang === 'ar';

  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      setColorMode(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
      
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.attributeName === 'class') {
            setColorMode(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
          }
        }
      });
      observer.observe(document.documentElement, { attributes: true });
      return () => observer.disconnect();
    }
  }, []);

  const initialNodes = useMemo(() => {
    const handleNodeClick = (item: RoadmapItem) => setSelectedNode(item);
    
    return [
      { id: 'intro', type: 'custom', position: { x: 0, y: 0 }, data: { item: gamingRoadmapData.find(d => d.id === 'intro'), lang, isRTL, onClick: handleNodeClick } },
      { id: 'phase0', type: 'custom', position: { x: 0, y: 220 }, data: { item: gamingRoadmapData.find(d => d.id === 'phase0'), lang, isRTL, onClick: handleNodeClick } },
      { id: 'phase1', type: 'custom', position: { x: 0, y: 440 }, data: { item: gamingRoadmapData.find(d => d.id === 'phase1'), lang, isRTL, onClick: handleNodeClick } },
      { id: 'phase2', type: 'custom', position: { x: 0, y: 660 }, data: { item: gamingRoadmapData.find(d => d.id === 'phase2'), lang, isRTL, onClick: handleNodeClick } },
      { id: 'phase3', type: 'custom', position: { x: 0, y: 880 }, data: { item: gamingRoadmapData.find(d => d.id === 'phase3'), lang, isRTL, onClick: handleNodeClick } },
      { id: 'stack', type: 'custom', position: { x: -280, y: 1100 }, data: { item: gamingRoadmapData.find(d => d.id === 'stack'), lang, isRTL, onClick: handleNodeClick } },
      { id: 'tech', type: 'custom', position: { x: 280, y: 1100 }, data: { item: gamingRoadmapData.find(d => d.id === 'tech'), lang, isRTL, onClick: handleNodeClick } },
      { id: 'salaries', type: 'custom', position: { x: -280, y: 1320 }, data: { item: gamingRoadmapData.find(d => d.id === 'salaries'), lang, isRTL, onClick: handleNodeClick } },
      { id: 'retenir', type: 'custom', position: { x: 280, y: 1320 }, data: { item: gamingRoadmapData.find(d => d.id === 'retenir'), lang, isRTL, onClick: handleNodeClick } },
    ];
  }, [lang, isRTL]);

  const initialEdges = useMemo(() => [
    { id: 'e-intro-p0', source: 'intro', target: 'phase0', animated: true, type: 'bezier', style: { stroke: '#818cf8', strokeWidth: 3, opacity: 0.6 } },
    { id: 'e-p0-p1', source: 'phase0', target: 'phase1', animated: true, type: 'bezier', style: { stroke: '#a855f7', strokeWidth: 3, opacity: 0.6 } },
    { id: 'e-p1-p2', source: 'phase1', target: 'phase2', animated: true, type: 'bezier', style: { stroke: '#d946ef', strokeWidth: 3, opacity: 0.6 } },
    { id: 'e-p2-p3', source: 'phase2', target: 'phase3', animated: true, type: 'bezier', style: { stroke: '#ec4899', strokeWidth: 3, opacity: 0.6 } },
    { id: 'e-p3-stack', source: 'phase3', target: 'stack', animated: true, type: 'bezier', style: { stroke: '#8b5cf6', strokeWidth: 3, opacity: 0.6 } },
    { id: 'e-p3-tech', source: 'phase3', target: 'tech', animated: true, type: 'bezier', style: { stroke: '#6366f1', strokeWidth: 3, opacity: 0.6 } },
    { id: 'e-stack-sal', source: 'stack', target: 'salaries', animated: true, type: 'bezier', style: { stroke: '#10b981', strokeWidth: 3, opacity: 0.6 } },
    { id: 'e-tech-ret', source: 'tech', target: 'retenir', animated: true, type: 'bezier', style: { stroke: '#f59e0b', strokeWidth: 3, opacity: 0.6 } },
  ], []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  React.useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  const closePopup = () => setSelectedNode(null);

  return (
    <div className={`mt-16 mb-16 ${isRTL ? 'text-end' : 'text-start'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight flex items-center">
          <Icon name="Map" className={`text-indigo-500 ${isRTL ? 'ms-3' : 'me-3'}`} size={36} />
          {lang === 'fr' ? 'Parcours du Combattant' : lang === 'en' ? 'The Roadmap' : 'خارطة الطريق'}
        </h2>
        
        <div className="flex items-center gap-2 bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-2xl backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
          {(['fr', 'en', 'ar'] as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                lang === l 
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-slate-700 dark:text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'
              }`}
            >
              {l === 'fr' ? 'FR' : l === 'en' ? 'EN' : 'عربي'}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[70vh] min-h-[600px] w-full bg-slate-50/50 dark:bg-slate-900/30 rounded-[3rem] border border-slate-200/60 dark:border-slate-800/60 overflow-hidden relative shadow-[inset_0_2px_20px_rgba(0,0,0,0.02)] dark:shadow-[inset_0_2px_20px_rgba(0,0,0,0.2)]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.1}
          maxZoom={1.5}
          defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
          attributionPosition="bottom-right"
          proOptions={{ hideAttribution: true }}
        >
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={24} 
            size={2} 
            color={colorMode === 'dark' ? '#334155' : '#cbd5e1'} 
          />
          <Controls className="!bg-white/80 dark:!bg-slate-800/80 backdrop-blur-md !border-slate-200/50 dark:!border-slate-700/50 !shadow-lg !rounded-2xl overflow-hidden fill-slate-700 dark:fill-slate-300 [&>button]:!border-b-slate-200/50 dark:[&>button]:!border-b-slate-700/50 [&>button:hover]:!bg-slate-100 dark:[&>button:hover]:!bg-slate-700 transition-colors" />
        </ReactFlow>
      </div>

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedNode && (
            <motion.div key="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 lg:p-8">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm" 
                onClick={closePopup} 
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className={`relative w-full max-w-4xl max-h-[90vh] sm:max-h-[85vh] flex flex-col bg-white dark:bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] border border-slate-100 dark:border-slate-800 overflow-hidden ${isRTL ? 'text-end' : 'text-start'}`}
                dir={isRTL ? 'rtl' : 'ltr'}
                onClick={e => e.stopPropagation()}
              >
                {/* Header */}
                <div className="bg-slate-50/80 dark:bg-slate-800/50 backdrop-blur-xl px-6 sm:px-10 py-6 sm:py-8 flex justify-between items-start border-b border-slate-100 dark:border-slate-800 shrink-0">
                  <div className={`${isRTL ? 'ms-12' : 'me-12'} flex items-center gap-5 sm:gap-6`}>
                    {selectedNode.icon && (
                      <div className="hidden sm:flex shrink-0 p-4 bg-white dark:bg-slate-800 text-indigo-500 dark:text-indigo-400 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <Icon name={selectedNode.icon} size={32} />
                      </div>
                    )}
                    <div>
                      <h3 className={`text-lg sm:text-xl font-semibold text-slate-800 dark:text-white tracking-tight ${isRTL ? 'font-arabic' : ''}`}>
                        {selectedNode.title[lang]}
                      </h3>
                      {selectedNode.subtitle && (
                        <p className={`text-sm sm:text-base text-slate-700 dark:text-slate-500 dark:text-slate-400 mt-2 font-normal ${isRTL ? 'font-arabic' : ''}`}>
                          {selectedNode.subtitle[lang]}
                        </p>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={closePopup}
                    className="p-3 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-500 dark:text-slate-400 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500 shrink-0"
                    aria-label="Close"
                  >
                    <Icon name="X" size={20} />
                  </button>
                </div>
                
                {/* Content Body */}
                <div className="p-6 sm:p-10 overflow-y-auto space-y-12 flex-1">
                  
                  {/* General / Intro text */}
                  {selectedNode.general && (
                    <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-6 sm:p-8 rounded-[2rem] border border-indigo-100/50 dark:border-indigo-800/30">
                      <ul className="space-y-4">
                        {selectedNode.general[lang].map((item, i) => {
                          const isHeading = item.startsWith('•') || item.includes(' :');
                          return (
                            <li key={i} className="flex items-start">
                              <Icon name="ArrowRight" size={20} className={`shrink-0 mt-0.5 text-indigo-400 ${isRTL ? 'ms-4' : 'me-4'}`} />
                              <span className={`text-xs sm:text-sm ${isHeading ? 'font-medium text-slate-800 dark:text-slate-200' : 'text-slate-600 dark:text-slate-400'} leading-relaxed ${isRTL ? 'font-arabic' : ''}`}>{item}</span>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )}
                  
                  {/* Roadmap / Learning Path */}
                  {selectedNode.roadmap && (
                    <div className="space-y-6">
                      <h4 className="font-semibold text-base sm:text-lg text-slate-800 dark:text-white flex items-center">
                        <div className={`p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl ${isRTL ? 'ms-4' : 'me-4'}`}>
                           <Icon name="Map" size={20} className="text-purple-600 dark:text-purple-400" />
                        </div>
                         {lang === 'fr' ? "Plan d'Apprentissage" : lang === 'en' ? 'Learning Path' : 'مسار التعلم'}
                      </h4>
                      <div className="grid gap-6 lg:grid-cols-2">
                        {selectedNode.roadmap[lang].map((block, i) => (
                          <div key={i} className="bg-white dark:bg-slate-800/50 rounded-[2rem] p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                            <h5 className="font-medium text-purple-600 dark:text-purple-400 mb-5 text-sm sm:text-base border-b border-slate-100 dark:border-slate-700/50 pb-3">{block.level}</h5>
                            <ul className="space-y-4">
                              {block.items.map((item, j) => (
                                <li key={j} className="flex items-start text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                  <div className={`mt-1 w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0 ${isRTL ? 'ms-4' : 'me-4'}`} />
                                  <span className={isRTL ? 'font-arabic' : ''}>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tools */}
                  {selectedNode.tools && (
                    <div className="space-y-6">
                      <h4 className="font-semibold text-base sm:text-lg text-slate-800 dark:text-white flex items-center">
                        <div className={`p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl ${isRTL ? 'ms-4' : 'me-4'}`}>
                           <Icon name="Wrench" size={20} className="text-blue-600 dark:text-blue-400" />
                        </div>
                         {lang === 'fr' ? 'Outils Recommandés' : lang === 'en' ? 'Recommended Tools' : 'الأدوات الموصى بها'}
                      </h4>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {selectedNode.tools[lang].map((tool, i) => (
                          <div key={i} className="flex flex-col p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] sm:text-xs font-medium text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">{tool.usage}</span>
                            <span className="text-sm sm:text-base font-normal text-slate-800 dark:text-slate-200">{tool.recommended}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Salaries */}
                  {selectedNode.salaries && (
                    <div className="space-y-6">
                      <h4 className="font-semibold text-base sm:text-lg text-slate-800 dark:text-white flex items-center">
                        <div className={`p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl ${isRTL ? 'ms-3' : 'me-3'}`}>
                           <Icon name="TrendingUp" size={20} className="text-emerald-600 dark:text-emerald-400" />
                        </div>
                         {lang === 'fr' ? 'Salaires' : lang === 'en' ? 'Salaries' : 'الرواتب'}
                      </h4>
                      <div className="overflow-x-auto rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
                        <table className="w-full text-sm text-start">
                          <thead className="bg-emerald-50/50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400">
                            <tr>
                              <th className="px-5 py-4 font-medium text-xs sm:text-sm">{lang === 'fr' ? 'Région' : lang === 'en' ? 'Region' : 'المنطقة'}</th>
                              <th className="px-5 py-4 font-medium text-xs sm:text-sm">{lang === 'fr' ? 'Détails' : lang === 'en' ? 'Details' : 'التفاصيل'}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-800/30">
                            {selectedNode.salaries[lang].map((salaryInfo, i) => (
                              <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                                <td className="px-5 py-5 font-normal text-sm text-slate-800 dark:text-slate-200 whitespace-nowrap align-top">
                                  <div className="flex items-center">
                                    <Icon name="Globe" size={16} className={`text-emerald-500/70 ${isRTL ? 'ms-2' : 'me-2'}`} />
                                    {salaryInfo.region}
                                  </div>
                                </td>
                                <td className="px-5 py-5 text-slate-600 dark:text-slate-300">
                                  <ul className="space-y-2">
                                    {salaryInfo.items.map((item, j) => (
                                      <li key={j} className="flex items-start text-sm">
                                        <div className={`mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 ${isRTL ? 'ms-2.5' : 'me-2.5'}`} />
                                        <span className={isRTL ? 'font-arabic' : ''}>{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default GamingRoadmapComponent;
