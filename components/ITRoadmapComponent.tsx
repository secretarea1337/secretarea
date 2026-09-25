import React, { useState, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icon';
import { itRoadmapData, RoadmapItem, Language } from '../data/itRoadmap';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Custom Node Component
const CustomNode = ({ data }: any) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
      className={`relative flex items-center justify-center p-3 sm:p-4 bg-white dark:bg-slate-800 border-2 border-primary-500 rounded-xl shadow-[0_0_15px_rgba(14,165,233,0.3)] cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/40 transition-all z-10 w-48 sm:w-64 group`}
      onClick={() => data.onClick(data.item)}
    >
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none overflow-hidden"></div>
      
      <Handle type="target" position={Position.Top} className="!bg-primary-500 !w-3 !h-3" />
      <div className="text-center w-full">
        <h4 className={`font-bold text-slate-800 dark:text-white ${data.isRTL ? 'font-arabic' : ''}`}>
          {data.item.title[data.lang]}
        </h4>
        {data.item.subtitle && (
          <p className={`text-xs text-slate-700 dark:text-slate-500 dark:text-slate-400 mt-1 ${data.isRTL ? 'font-arabic' : ''}`}>
            {data.item.subtitle[data.lang]}
          </p>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-primary-500 !w-3 !h-3" />
    </motion.div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

const ITRoadmapComponent: React.FC = () => {
  const [lang, setLang] = useState<Language>('fr');
  const [selectedNode, setSelectedNode] = useState<RoadmapItem | null>(null);
  const [colorMode, setColorMode] = useState<'light' | 'dark' | 'system'>('system');

  React.useEffect(() => {
    // Check initial state
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

  const isRTL = lang === 'ar';
  
  const closePopup = () => setSelectedNode(null);
  
  // Memoize nodes and edges so they update when lang/isRTL changes
  const initialNodes = useMemo(() => {
    const handleNodeClick = (item: RoadmapItem) => setSelectedNode(item);
    
    return [
      { id: 'intro', type: 'custom', position: { x: 0, y: -200 }, data: { item: itRoadmapData.find(d => d.id === 'intro'), lang, isRTL, onClick: handleNodeClick } },
      
      { id: 'start', type: 'custom', position: { x: 0, y: 0 }, data: { item: itRoadmapData.find(d => d.id === 'start'), lang, isRTL, onClick: handleNodeClick } },
      
      { id: 'phase1', type: 'custom', position: { x: 0, y: 200 }, data: { item: itRoadmapData.find(d => d.id === 'phase1'), lang, isRTL, onClick: handleNodeClick } },
      
      { id: 'web-hacking', type: 'custom', position: { x: -600, y: 450 }, data: { item: itRoadmapData.find(d => d.id === 'web-hacking'), lang, isRTL, onClick: handleNodeClick } },
      { id: 'network-hacking', type: 'custom', position: { x: -300, y: 550 }, data: { item: itRoadmapData.find(d => d.id === 'network-hacking'), lang, isRTL, onClick: handleNodeClick } },
      { id: 'mobile-hacking', type: 'custom', position: { x: 0, y: 600 }, data: { item: itRoadmapData.find(d => d.id === 'mobile-hacking'), lang, isRTL, onClick: handleNodeClick } },
      { id: 'cloud-hacking', type: 'custom', position: { x: 300, y: 550 }, data: { item: itRoadmapData.find(d => d.id === 'cloud-hacking'), lang, isRTL, onClick: handleNodeClick } },
      { id: 'privilege-escalation', type: 'custom', position: { x: 600, y: 450 }, data: { item: itRoadmapData.find(d => d.id === 'privilege-escalation'), lang, isRTL, onClick: handleNodeClick } },
      
      { id: 'certifications', type: 'custom', position: { x: 0, y: 850 }, data: { item: itRoadmapData.find(d => d.id === 'certifications'), lang, isRTL, onClick: handleNodeClick } },
      
      { id: 'blue-team', type: 'custom', position: { x: -300, y: 1100 }, data: { item: itRoadmapData.find(d => d.id === 'blue-team'), lang, isRTL, onClick: handleNodeClick } },
      { id: 'timeline', type: 'custom', position: { x: 300, y: 1100 }, data: { item: itRoadmapData.find(d => d.id === 'timeline'), lang, isRTL, onClick: handleNodeClick } },
      
      { id: 'tools-lab', type: 'custom', position: { x: -600, y: 1350 }, data: { item: itRoadmapData.find(d => d.id === 'tools-lab'), lang, isRTL, onClick: handleNodeClick } },
      { id: 'salaries', type: 'custom', position: { x: -300, y: 1350 }, data: { item: itRoadmapData.find(d => d.id === 'salaries'), lang, isRTL, onClick: handleNodeClick } },
      { id: 'trends', type: 'custom', position: { x: 0, y: 1350 }, data: { item: itRoadmapData.find(d => d.id === 'trends'), lang, isRTL, onClick: handleNodeClick } },
    ];
  }, [lang, isRTL]);

  const initialEdges = useMemo(() => [
    { id: 'e-intro-start', source: 'intro', target: 'start', animated: true, type: 'default', style: { stroke: '#0ea5e9', strokeWidth: 2 } },
    
    { id: 'e-start-p1', source: 'start', target: 'phase1', animated: true, type: 'default', style: { stroke: '#0ea5e9', strokeWidth: 2 } },
    
    { id: 'e-p1-web', source: 'phase1', target: 'web-hacking', animated: true, type: 'default', style: { stroke: '#0ea5e9', strokeWidth: 2 } },
    { id: 'e-p1-net', source: 'phase1', target: 'network-hacking', animated: true, type: 'default', style: { stroke: '#0ea5e9', strokeWidth: 2 } },
    { id: 'e-p1-mob', source: 'phase1', target: 'mobile-hacking', animated: true, type: 'default', style: { stroke: '#0ea5e9', strokeWidth: 2 } },
    { id: 'e-p1-cld', source: 'phase1', target: 'cloud-hacking', animated: true, type: 'default', style: { stroke: '#0ea5e9', strokeWidth: 2 } },
    { id: 'e-p1-priv', source: 'phase1', target: 'privilege-escalation', animated: true, type: 'default', style: { stroke: '#0ea5e9', strokeWidth: 2 } },
    
    { id: 'e-web-cert', source: 'web-hacking', target: 'certifications', animated: true, type: 'default', style: { stroke: '#0ea5e9', strokeWidth: 2, strokeDasharray: '5,5' } },
    { id: 'e-net-cert', source: 'network-hacking', target: 'certifications', animated: true, type: 'default', style: { stroke: '#0ea5e9', strokeWidth: 2, strokeDasharray: '5,5' } },
    { id: 'e-mob-cert', source: 'mobile-hacking', target: 'certifications', animated: true, type: 'default', style: { stroke: '#0ea5e9', strokeWidth: 2, strokeDasharray: '5,5' } },
    { id: 'e-cld-cert', source: 'cloud-hacking', target: 'certifications', animated: true, type: 'default', style: { stroke: '#0ea5e9', strokeWidth: 2, strokeDasharray: '5,5' } },
    { id: 'e-priv-cert', source: 'privilege-escalation', target: 'certifications', animated: true, type: 'default', style: { stroke: '#0ea5e9', strokeWidth: 2, strokeDasharray: '5,5' } },
    
    { id: 'e-cert-blue', source: 'certifications', target: 'blue-team', animated: true, type: 'default', style: { stroke: '#0ea5e9', strokeWidth: 2 } },
    { id: 'e-cert-time', source: 'certifications', target: 'timeline', animated: true, type: 'default', style: { stroke: '#0ea5e9', strokeWidth: 2 } },
    
    { id: 'e-blue-tools', source: 'blue-team', target: 'tools-lab', animated: true, type: 'default', style: { stroke: '#0ea5e9', strokeWidth: 2 } },
    { id: 'e-blue-sal', source: 'blue-team', target: 'salaries', animated: true, type: 'default', style: { stroke: '#0ea5e9', strokeWidth: 2 } },
    { id: 'e-blue-trends', source: 'blue-team', target: 'trends', animated: true, type: 'default', style: { stroke: '#0ea5e9', strokeWidth: 2 } },
  ], []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when language changes to reflect new data bindings
  React.useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  return (
    <div className={`mt-12 mb-12 ${isRTL ? 'text-end' : 'text-start'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Header & Lang Toggle */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-slate-200 dark:border-slate-700 pb-4">
        <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white flex items-center w-full md:w-auto">
          <Icon name="Map" size={20} className={`text-primary-500 shrink-0 ${isRTL ? 'ms-2' : 'me-2'}`} />
          <span className="leading-tight">
            {lang === 'fr' && 'Cybersecurity Roadmap 2026-2027'}
            {lang === 'en' && 'Cybersecurity Roadmap 2026-2027'}
            {lang === 'ar' && 'خارطة طريق الأمن السيبراني 2026-2027'}
          </span>
        </h3>
        
        <div className="flex w-full md:w-auto bg-slate-100 dark:bg-slate-800 p-1 rounded-lg z-10">
          <button onClick={() => setLang('en')} className={`flex-1 md:flex-none px-3 py-2 md:py-1 text-sm font-medium rounded-md transition-colors ${lang === 'en' ? 'bg-white dark:bg-slate-700 shadow text-primary-600' : 'text-slate-700 dark:text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}>ENG</button>
          <button onClick={() => setLang('fr')} className={`flex-1 md:flex-none px-3 py-2 md:py-1 text-sm font-medium rounded-md transition-colors ${lang === 'fr' ? 'bg-white dark:bg-slate-700 shadow text-primary-600' : 'text-slate-700 dark:text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}>FR</button>
          <button onClick={() => setLang('ar')} className={`flex-1 md:flex-none px-3 py-2 md:py-1 text-sm font-medium rounded-md transition-colors font-arabic ${lang === 'ar' ? 'bg-white dark:bg-slate-700 shadow text-primary-600' : 'text-slate-700 dark:text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}>عربي</button>
        </div>
      </div>

      {/* Interactive Flow using React Flow */}
      <div className="w-full h-[70vh] min-h-[400px] max-h-[800px] border border-slate-200 dark:border-slate-700/50 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/20 shadow-inner">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          colorMode={colorMode}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.1}
          maxZoom={2}
          zoomOnScroll={true}
          panOnDrag={true}
          nodesDraggable={true}
          className="dark:bg-slate-900"
          proOptions={{ hideAttribution: true }}
        >
          <Controls className="bg-white dark:bg-slate-800 border-none shadow-md fill-slate-700 dark:fill-slate-300" />
          <Background variant={BackgroundVariant.Dots} gap={24} size={2} color="#94a3b8" />
        </ReactFlow>
      </div>

      {/* Popup Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedNode && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto ${isRTL ? 'text-end' : 'text-start'}`}
              dir={isRTL ? 'rtl' : 'ltr'}
              onClick={closePopup}
            >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 ${isRTL ? 'font-arabic' : ''}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                    {selectedNode.title[lang]}
                  </h2>
                  {selectedNode.subtitle && (
                    <p className="text-primary-600 mt-1">{selectedNode.subtitle[lang]}</p>
                  )}
                </div>
                <button 
                  onClick={closePopup}
                  className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  <Icon name="X" size={20} />
                </button>
              </div>

              <div className="space-y-8">
                {selectedNode.general && (
                  <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
                    {selectedNode.general[lang].map((p, i) => <p key={i}>{p}</p>)}
                  </div>
                )}

                {selectedNode.roadmap && (
                  <section>
                    <h3 className="text-xl font-bold mb-4 flex items-center text-slate-800 dark:text-white">
                      <Icon name="Target" size={18} className={`text-orange-500 ${isRTL ? 'ms-2' : 'me-2'}`} />
                      {lang === 'fr' ? 'Roadmap / Étapes' : lang === 'en' ? 'Roadmap / Steps' : 'خارطة الطريق / الخطوات'}
                    </h3>
                    <div className="space-y-4">
                      {selectedNode.roadmap[lang].map((step, i) => (
                        <div key={i} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                          <h4 className="font-bold text-primary-600 dark:text-primary-400 mb-2">{step.level}</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-300">
                            {step.items.map((item, j) => <li key={j}>{item}</li>)}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {selectedNode.tools && (
                  <section>
                    <h3 className="text-xl font-bold mb-4 flex items-center text-slate-800 dark:text-white">
                      <Icon name="Wrench" size={18} className={`text-blue-500 ${isRTL ? 'ms-2' : 'me-2'}`} />
                      {lang === 'fr' ? 'Meilleurs outils 2026' : lang === 'en' ? 'Best Tools 2026' : 'أفضل الأدوات 2026'}
                    </h3>
                    <div className="overflow-x-auto">
                      <table className={`w-full border-collapse text-sm ${isRTL ? 'text-end' : 'text-start'}`}>
                        <thead>
                          <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            <th className={`p-3 font-bold border-b dark:border-slate-700 ${isRTL ? 'text-end' : 'text-start'}`}>
                              {lang === 'fr' ? 'Usage' : lang === 'en' ? 'Usage' : 'الاستخدام'}
                            </th>
                            <th className={`p-3 font-bold border-b dark:border-slate-700 ${isRTL ? 'text-end' : 'text-start'}`}>
                              {lang === 'fr' ? 'Recommandé' : lang === 'en' ? 'Recommended' : 'موصى به'}
                            </th>
                            <th className={`p-3 font-bold border-b dark:border-slate-700 ${isRTL ? 'text-end' : 'text-start'}`}>
                              {lang === 'fr' ? 'Alternative' : lang === 'en' ? 'Alternative' : 'بديل'}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedNode.tools[lang].map((tool, i) => (
                            <tr key={i} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{tool.usage}</td>
                              <td className="p-3 text-emerald-600 dark:text-emerald-400">{tool.recommended}</td>
                              <td className="p-3 text-slate-700 dark:text-slate-500 dark:text-slate-400">{tool.alternative || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                )}

                {selectedNode.salaries && (
                  <section>
                    <h3 className="text-xl font-bold mb-4 flex items-center text-slate-800 dark:text-white">
                      <Icon name="TrendingUp" size={18} className={`text-emerald-500 ${isRTL ? 'ms-2' : 'me-2'}`} />
                      {lang === 'fr' ? 'Salaires' : lang === 'en' ? 'Salaries' : 'الرواتب'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedNode.salaries[lang].map((salary, i) => (
                        <div key={i} className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 p-4 rounded-xl">
                          <h4 className="font-bold text-emerald-700 dark:text-emerald-400 mb-2 border-b border-emerald-200 dark:border-emerald-800/50 pb-2">
                            {salary.region}
                          </h4>
                          <ul className="list-disc list-inside space-y-2 text-sm text-slate-700 dark:text-slate-300">
                            {salary.items.map((item, j) => (
                              <li key={j} className="leading-relaxed">{item}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </section>
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

export default ITRoadmapComponent;
