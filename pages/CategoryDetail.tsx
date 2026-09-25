
import React, { useState } from 'react';
import { auth, db } from '../src/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { recordGameInteraction } from '../src/services/userService';

import { useParams, Navigate, Link } from 'react-router-dom';
import { CATEGORIES } from '../constants';
import Icon from '../components/Icon';
import ArchitectureRoadmapComponent from '../components/ArchitectureRoadmapComponent';
import ITRoadmapComponent from '../components/ITRoadmapComponent';
import GamingRoadmapComponent from '../components/GamingRoadmapComponent';
import { motion, AnimatePresence } from 'framer-motion';
import { Project, MindMapSection, MindMapNode, NexaProject } from '../types';

const MindMapRenderer: React.FC<{ data: MindMapSection }> = ({ data }) => {
  // Group nodes by category
  const groups = data.nodes.reduce((acc, node) => {
    if (!acc[node.category]) acc[node.category] = [];
    acc[node.category].push(node);
    return acc;
  }, {} as Record<string, MindMapNode[]>);

  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 relative overflow-hidden mb-12">
      {/* Background decoration */}
      <div className="absolute top-0 end-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -me-20 -mt-20"></div>

      <div className="relative z-10 mb-8 text-center md:text-start">
        <h3 className="text-2xl font-bold mb-2 flex items-center justify-center md:justify-start gap-2">
          <Icon name="Network" className="text-primary-500" />
          {data.title}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 max-w-3xl">{data.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        {Object.entries(groups).map(([category, nodes]) => (
          <div key={category} className="relative">
            {/* Connection Line decoration */}
            <div className="absolute start-4 top-8 bottom-0 w-0.5 bg-gradient-to-b from-primary-200 to-transparent dark:from-primary-900/50"></div>
            
            <h4 className="font-bold text-sm uppercase tracking-wider text-primary-600 dark:text-primary-400 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary-500"></span>
              {category}
            </h4>
            
            <div className="space-y-4 ps-6">
              {(nodes as MindMapNode[]).map((node, nIdx) => (
                <div key={nIdx} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800 transition-all group relative">
                  {/* Small connector line */}
                  <div className="absolute top-1/2 -start-6 w-6 h-0.5 bg-slate-200 dark:bg-slate-700 group-hover:bg-primary-300 transition-colors"></div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-primary-500 shrink-0">
                      <Icon name={node.icon || 'Circle'} size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">{node.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{node.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Nexa Project Detail Modal Component
const NexaProjectModal: React.FC<{ project: NexaProject; onClose: () => void; onTrack: (p: any, t: any) => void }> = ({ project, onClose, onTrack }) => {
    const [activeImage, setActiveImage] = useState(project.gallery[0]);
    const [includedOpen, setIncludedOpen] = useState(false);

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 md:backdrop-blur-sm p-4 overflow-y-auto"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-slate-900 rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl flex flex-col md:flex-row overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-4 end-4 z-50 p-2 bg-white/20 hover:bg-white/40 md:backdrop-blur rounded-full text-slate-900 dark:text-white transition-colors"
                >
                    <Icon name="X" size={24} />
                </button>

                {/* Left: Gallery */}
                <div className="w-full md:w-1/2 bg-slate-100 dark:bg-slate-950 p-6 flex flex-col">
                    <div className="flex-1 rounded-2xl overflow-hidden mb-4 shadow-lg bg-slate-200 dark:bg-slate-900 flex items-center justify-center">
                        <img src={activeImage} alt={project.title} className="w-full h-full object-cover"  loading="lazy" />
                    </div>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
                        {project.gallery.map((img, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => setActiveImage(img)}
                                className={`w-20 h-20 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${activeImage === img ? 'border-primary-500 scale-105' : 'border-transparent opacity-70 hover:opacity-100'}`}
                            >
                                <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover"  loading="lazy" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right: Details */}
                <div className="w-full md:w-1/2 p-8 overflow-y-auto">
                    <div className="mb-6">
                        <span className="text-xs font-bold text-primary-500 uppercase tracking-wide mb-2 block">{project.category}, Premium</span>
                        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">{project.title}</h2>
                        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{project.fullDescription}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                            <strong className="block text-slate-900 dark:text-white mb-1">Client:</strong>
                            <span className="text-slate-500 dark:text-slate-400">{project.client}</span>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                            <strong className="block text-slate-900 dark:text-white mb-1">Sales:</strong>
                            <span className="text-emerald-500 font-bold">{project.sales}</span>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                            <strong className="block text-slate-900 dark:text-white mb-1">Delivery:</strong>
                            <span className="text-slate-500 dark:text-slate-400">{project.delivery}</span>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                            <strong className="block text-slate-900 dark:text-white mb-1">Revisions:</strong>
                            <span className="text-slate-500 dark:text-slate-400">{project.revisions}</span>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800 col-span-2">
                             <strong className="block text-slate-900 dark:text-white mb-1">Technologies:</strong>
                             <span className="text-slate-500 dark:text-slate-400">{project.technologies}</span>
                        </div>
                    </div>

                    <div className="mb-8">
                        <button 
                            onClick={() => setIncludedOpen(!includedOpen)}
                            className="w-full flex items-center justify-between p-4 bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/30 rounded-xl text-start"
                        >
                            <div>
                                <strong className="block text-primary-700 dark:text-primary-300">What's Included:</strong>
                                <span className="text-xs text-primary-600 dark:text-primary-400">{project.included}</span>
                            </div>
                            <Icon name="ChevronLeft" size={20} className={`transform transition-transform text-primary-500 ${includedOpen ? '-rotate-90' : 'rotate-0'}`} />
                        </button>
                        <AnimatePresence>
                            {includedOpen && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <ul className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl border border-t-0 border-slate-100 dark:border-slate-800 text-sm space-y-2 text-slate-600 dark:text-slate-400 list-disc list-inside">
                                        {project.includedDetails.map((item, idx) => (
                                            <li key={idx}>{item}</li>
                                        ))}
                                    </ul>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>
            </div>
        </motion.div>
    );
};

const CategoryDetail: React.FC = () => {

    const trackProjectInteraction = async (project: any, interactionType: 'view' | 'like' | 'favorite' | 'download' = 'view') => {
        if (!auth.currentUser) return;
        try {
            const mappedType: 'view' | 'like' | 'favorite' = interactionType === 'download' ? 'view' : interactionType;
            await recordGameInteraction(auth.currentUser.uid, {
                id: project.id || project.title || 'project',
                name: project.name || project.title || 'Project',
                coverImage: project.coverImage || (project.images && project.images[0]) || ''
            }, mappedType);
        } catch (err) {
            console.warn("Error tracking project interaction", err);
        }
    };

  const { id } = useParams<{ id: string }>();
  const category = CATEGORIES.find(c => c.id === id);

  // Project Filter State (NEXA)
  const [projectFilter, setProjectFilter] = useState<'all' | 'web' | 'branding' | 'ai'>('all');
  const [activeNexaProject, setActiveNexaProject] = useState<NexaProject | null>(null);

  // Lightbox State (Standard Projects)
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);

  if (!category) {
    return <Navigate to={id ? `/game/${encodeURIComponent(id)}` : "/roadmap"} replace />;
  }

  // Helper to group tools by type
  const getToolsByType = (type: string) => category.tools.filter(t => t.type === type);
  
  const apps2d3d = getToolsByType('2d-3d');
  const appsRender = getToolsByType('render');
  const appsSecurity = getToolsByType('security');
  const appsLanguage = getToolsByType('language');
  const appsOther = getToolsByType('other').concat(category.tools.filter(t => !t.type));
  
  const isIT = category.id === 'it-cybersecurity';
  const isGaming = category.id === 'gaming';
  const isBusiness = category.id === 'business';

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // Lightbox Handlers (Standard)
  const openLightbox = (project: Project, index: number = 0) => {
    trackProjectInteraction(project, 'view');
    setActiveProject(project);
    setActiveImageIndex(index);
    setZoomLevel(1);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setActiveProject(null);
    setZoomLevel(1);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeProject) {
      setActiveImageIndex((prev) => (prev + 1) % activeProject.images.length);
      setZoomLevel(1);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeProject) {
      setActiveImageIndex((prev) => (prev - 1 + activeProject.images.length) % activeProject.images.length);
      setZoomLevel(1);
    }
  };

  const toggleZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel(prev => prev > 1 ? 1 : 2);
  };

  const zoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel(prev => Math.min(prev + 0.5, 3));
  };

  const zoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel(prev => Math.max(prev - 0.5, 1));
  };

  return (
    <div className="w-full pt-20 pb-24 min-h-screen bg-slate-50 dark:bg-slate-950">
      
      {/* --- NEXA PROJECT MODAL --- */}
      <AnimatePresence>
        {activeNexaProject && (
            <NexaProjectModal 
                project={activeNexaProject} 
                onClose={() => setActiveNexaProject(null)} 
                onTrack={trackProjectInteraction} 
            />
        )}
      </AnimatePresence>

      {/* --- STANDARD LIGHTBOX MODAL --- */}
      <AnimatePresence>
        {lightboxOpen && activeProject && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 md:backdrop-blur-sm p-4 overflow-hidden"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <button className="absolute top-4 end-4 text-white hover:text-primary-500 transition-colors z-50">
              <Icon name="X" size={32} />
            </button>

            {/* Zoom Controls */}
            <div className="absolute top-4 start-4 flex gap-2 z-50">
              <button onClick={zoomOut} className="p-2 bg-slate-800/80 rounded-full text-white hover:bg-slate-700">
                <Icon name="Minus" size={20} />
              </button>
              <button onClick={zoomIn} className="p-2 bg-slate-800/80 rounded-full text-white hover:bg-slate-700">
                <Icon name="Plus" size={20} />
              </button>
              <div className="px-3 py-2 bg-slate-800/80 rounded-full text-white text-xs flex items-center">
                {Math.round(zoomLevel * 100)}%
              </div>
            </div>
            
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Prev Button */}
              {activeProject.images.length > 1 && (
                <button onClick={prevImage} className="absolute start-2 p-3 text-white hover:text-primary-500 z-40 bg-black/50 rounded-full hover:bg-black/70 transition-colors">
                  <Icon name="ChevronLeft" size={32} />
                </button>
              )}
              
              {/* Image Container with Zoom */}
              <div 
                className="overflow-auto w-full h-full flex items-center justify-center cursor-move"
                style={{ cursor: zoomLevel > 1 ? 'grab' : 'zoom-in' }}
                onClick={zoomLevel === 1 ? toggleZoom : undefined}
              >
                <img 
                  src={activeProject.images[activeImageIndex]} 
                  alt={activeProject.title} 
                  className="max-h-full max-w-full object-contain transition-transform duration-300"
                  style={{ transform: `scale(${zoomLevel})` }}
                 loading="lazy" />
              </div>

              {/* Next Button */}
              {activeProject.images.length > 1 && (
                <button onClick={nextImage} className="absolute end-2 p-3 text-white hover:text-primary-500 z-40 bg-black/50 rounded-full hover:bg-black/70 transition-colors">
                  <Icon name="ChevronRight" size={32} />
                </button>
              )}

              {/* Navigation Dots */}
              <div className="absolute bottom-4 start-1/2 -translate-x-1/2 flex gap-2 z-50">
                {activeProject.images.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`w-2 h-2 rounded-full transition-colors ${idx === activeImageIndex ? 'bg-primary-500' : 'bg-white/30'}`}
                  ></div>
                ))}
              </div>
            </div>
            
            {/* Info Panel */}
            <div className="absolute bottom-8 start-8 text-white max-w-md hidden md:block z-40 bg-black/40 p-4 rounded-xl md:backdrop-blur-md">
              <h3 className="text-xl font-bold">{activeProject.title}</h3>
              <p className="text-slate-300 text-sm">{activeProject.description}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- HEADER --- */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 relative overflow-hidden">
          {/* Background Gradient for Header */}
          <div className={`absolute -end-20 -top-20 w-96 h-96 bg-${category.color}-500/10 rounded-full blur-3xl`}></div>

          <Link to="/roadmap" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 mb-6 transition-colors relative z-10">
            <Icon name="ArrowLeft" size={16} className="me-2" /> Back to Space
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-lg bg-${category.color}-100 dark:bg-${category.color}-900/30 text-${category.color}-600 dark:text-${category.color}-400`}>
                  <Icon name={category.iconName} size={32} />
                </div>
                <h1 className="text-3xl md:text-5xl font-bold">{category.title}</h1>
              </div>
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
                <span className="font-semibold text-slate-900 dark:text-white block mb-2">{category.role}</span>
                {category.bio}
              </p>
            </div>

            {/* Category Specific Socials */}
            {category.categorySocials && (
              <div className="flex gap-3">
                {category.categorySocials.map((social, idx) => (
                  <a key={idx} href={social.url} target="_blank" rel="noreferrer" className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
                    <Icon name={social.icon} size={20} />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12"
      >
        
        {/* --- MAIN CONTENT (LEFT) --- */}
        <div className="lg:col-span-8 space-y-16">

          {/* IT MINDMAP SECTIONS */}
          {category.mindMapDevelopment && (
             <motion.section variants={item}>
                <MindMapRenderer data={category.mindMapDevelopment} />
             </motion.section>
          )}

          {category.mindMapCyberSecurity && (
             <motion.section variants={item}>
                <MindMapRenderer data={category.mindMapCyberSecurity} />
             </motion.section>
          )}

          {/* NEXA BUSINESS SERVICES COLLECTION */}
          {isBusiness && category.nexaServices && (
             <motion.section variants={item} className="relative p-4 md:p-8 rounded-[40px] overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-slate-50 dark:bg-[#030712] -z-20"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] -z-10"></div>
                <div className="absolute top-0 start-1/2 -translate-x-1/2 w-3/4 h-32 bg-emerald-500/10 blur-[100px] -z-10"></div>

                <div className="text-center mb-12 relative z-10">
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    className="inline-block px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold tracking-widest uppercase mb-4 shadow-[0_0_15px_rgba(16,185,129,0.1)] dark:shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  >
                    Solutions
                  </motion.div>
                  <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">SecretArea <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500 dark:from-emerald-400 dark:to-cyan-400">Collection</span></h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                  {category.nexaServices.map((service, idx) => (
                    <motion.div 
                      key={idx} 
                      whileHover={{ y: -5, scale: 1.01 }}
                      className="group relative p-[1px] rounded-3xl overflow-hidden bg-slate-200 dark:bg-slate-800"
                    >
                      {/* Animated border gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-300 to-slate-200 dark:from-slate-700 dark:to-slate-800 group-hover:from-emerald-400 group-hover:to-cyan-400 dark:group-hover:from-emerald-500 dark:group-hover:to-cyan-500 transition-all duration-500 opacity-50 dark:opacity-100"></div>
                      
                      {/* Card Content */}
                      <div className="relative h-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-8 rounded-[23px] flex flex-col justify-between overflow-hidden">
                        
                        {/* Glow effect on hover */}
                        <div className="absolute -top-24 -end-24 w-48 h-48 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        <div>
                          <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-2">
                               <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:border-emerald-500/30 dark:group-hover:border-emerald-500/50 transition-colors">
                                  <Icon name={service.category.includes('AI') ? 'Cpu' : service.category.includes('WEB') ? 'Code' : service.category.includes('BRAND') ? 'PenTool' : 'Target'} size={14} />
                               </div>
                               <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 tracking-wider uppercase transition-colors">{service.category}</span>
                            </div>
                            {service.discount && (
                              <div className="bg-gradient-to-r from-emerald-500 to-teal-400 dark:to-teal-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.2)] dark:shadow-[0_0_10px_rgba(16,185,129,0.4)]">
                                {service.discount}
                              </div>
                            )}
                          </div>
                          
                          <h4 className="font-bold text-xl md:text-2xl text-slate-900 dark:text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-emerald-600 group-hover:to-cyan-600 dark:group-hover:from-emerald-300 dark:group-hover:to-cyan-300 transition-all duration-300">{service.title}</h4>
                          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                            {service.description}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800 group-hover:border-slate-200 dark:group-hover:border-slate-700 transition-colors">
                           <div className="flex flex-col">
                             <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-widest mb-1">Investment</span>
                             <span className="font-bold text-slate-900 dark:text-white text-lg font-mono">
                               {service.price}
                             </span>
                           </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
             </motion.section>

          )}
          {/* NEXA PROJECTS SECTION */}
          {isBusiness && category.nexaProjects && (
             <motion.section variants={item}>
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-bold mb-2">Our Projects</h2>
                  <p className="text-slate-600 dark:text-slate-400">Discover our latest work and creative solutions</p>
                </div>
                
                {/* Filter Buttons */}
                <div className="flex justify-center flex-wrap gap-2 mb-8">
                  {['all', 'web', 'branding', 'ai'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setProjectFilter(filter as any)}
                      className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                        projectFilter === filter
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {filter === 'all' ? 'All Projects' : filter === 'web' ? 'Web Development' : filter === 'branding' ? 'Branding' : 'AI Solutions'}
                    </button>
                  ))}
                </div>

                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <AnimatePresence mode='popLayout'>
                     {category.nexaProjects
                        .filter(p => projectFilter === 'all' || p.category === projectFilter)
                        .map((project, idx) => (
                       <motion.div
                         layout
                         initial={{ opacity: 0, scale: 0.9 }}
                         animate={{ opacity: 1, scale: 1 }}
                         exit={{ opacity: 0, scale: 0.9 }}
                         onClick={() => { setActiveNexaProject(project); trackProjectInteraction(project, 'view'); }}
                         key={project.title} // Use unique key if possible
                         className="group relative bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all cursor-pointer"
                       >
                          <div className="aspect-video relative overflow-hidden">
                             <img src={project.image} alt={project.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"  loading="lazy" />
                             <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="bg-white text-slate-900 px-4 py-2 rounded-full font-bold text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                  Quick View
                                </span>
                             </div>
                          </div>
                          <div className="p-6">
                             <span className="text-xs font-bold text-primary-500 uppercase tracking-wide block mb-2">
                               {project.category === 'web' ? 'Web Development' : project.category === 'branding' ? 'Branding' : 'AI Solutions'}
                             </span>
                             <h3 className="font-bold text-xl mb-2">{project.title}</h3>
                             <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2">{project.description}</p>
                          </div>
                       </motion.div>
                     ))}
                   </AnimatePresence>
                </div>
             </motion.section>
          )}

          {/* NEXA BUSINESS LINKS (Digital Products) */}
          {isBusiness && category.nexaBusinessLinks && (
             <motion.section variants={item} className="bg-gradient-to-r from-emerald-900 to-teal-900 p-8 rounded-2xl text-white relative overflow-hidden">
                <div className="absolute top-0 end-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -me-20 -mt-20"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                   <div>
                      <h2 className="text-2xl font-bold mb-2">SecretArea Business</h2>
                      <p className="text-emerald-200">Digital products, Print On demand & More</p>
                   </div>
                   <div className="flex gap-4">
                      {category.nexaBusinessLinks.map((link, idx) => (
                        <a 
                          key={idx} 
                          href={link.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="px-6 py-3 bg-white text-emerald-900 font-bold rounded-full hover:bg-emerald-50 transition-colors flex items-center"
                        >
                           {link.label} <Icon name="ExternalLink" size={16} className="ms-2" />
                        </a>
                      ))}
                   </div>
                </div>
             </motion.section>
          )}
          
          {/* GAMING MARKET CHART */}
          {isGaming && category.gamingMarketStats && (
            <motion.section variants={item} className="bg-white dark:bg-slate-900 p-4 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800">
               <div className="mb-6">
                 <h2 className="text-2xl font-bold flex items-center">
                    <Icon name="TrendingUp" className="me-2 text-emerald-500" /> Market Growth
                 </h2>
                 <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm">
                   Projected growth rates (CAGR) for the Gaming Industry (2026 - 2035) with estimated developer salaries. 
                   The MENA region shows aggressive growth potential compared to the established global market.
                 </p>
               </div>
               
               {/* Growth Chart */}
               <div className="mb-10">
                   <h3 className="text-sm font-bold uppercase text-slate-500 mb-4">Annual Growth Rate (%)</h3>
                   <div className="flex items-end justify-between h-48 gap-1 sm:gap-2 md:gap-3 pt-6 pb-2 relative border-b border-slate-200 dark:border-slate-700">
                      {category.gamingMarketStats.map((stat, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                           <div className="w-full flex justify-center items-end gap-0.5 sm:gap-1 h-full">
                              {/* Arab Growth Bar */}
                              <div 
                                style={{ height: `${stat.arabGrowth * 3}%` }} 
                                className="w-1.5 sm:w-3 md:w-4 bg-emerald-500 rounded-t-sm relative transition-all duration-1000 group-hover:bg-emerald-400"
                              ></div>
                              {/* Global Growth Bar */}
                              <div 
                                style={{ height: `${stat.globalGrowth * 3}%` }} 
                                className="w-1.5 sm:w-3 md:w-4 bg-slate-300 dark:bg-slate-600 rounded-t-sm relative transition-all duration-1000 group-hover:bg-slate-400"
                              ></div>
                           </div>
                           <div className="mt-2 text-[8px] sm:text-[10px] font-bold text-slate-500 sm:rotate-0">{stat.year}</div>
                        </div>
                      ))}
                   </div>
                   <div className="flex justify-center gap-6 mt-4">
                      <div className="flex items-center text-xs text-slate-600 dark:text-slate-400">
                        <div className="w-3 h-3 bg-emerald-500 rounded-sm me-2"></div> Arab Growth %
                      </div>
                      <div className="flex items-center text-xs text-slate-600 dark:text-slate-400">
                        <div className="w-3 h-3 bg-slate-300 dark:bg-slate-600 rounded-sm me-2"></div> Global Growth %
                      </div>
                   </div>
               </div>

               {/* Salary Data Grid */}
               <div>
                  <h3 className="text-sm font-bold uppercase text-slate-500 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span>Projected Developer Salaries (USD)</span>
                    <span className="text-[10px] w-fit normal-case bg-blue-100 dark:bg-blue-900/30 text-blue-600 px-2 py-1 rounded-full">Avg. Junior/Mid-Level</span>
                  </h3>
                  <div className="overflow-x-auto pb-2 no-scrollbar">
                    <div className="min-w-[600px] lg:min-w-0">
                      <div className="grid grid-cols-11 gap-2 text-xs font-mono text-center border-b border-slate-100 dark:border-slate-800 pb-2 mb-2 font-bold text-slate-400">
                         <div className="text-start">Region</div>
                         {category.gamingMarketStats.map((s) => <div key={s.year}>{s.year}</div>)}
                      </div>
                      {/* Global Row */}
                      <div className="grid grid-cols-11 gap-2 text-xs text-center items-center py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded transition-colors">
                         <div className="text-start font-bold text-slate-700 dark:text-slate-300">Global</div>
                         {category.gamingMarketStats.map((s) => (
                           <div key={s.year} className="text-slate-600 dark:text-slate-400">${(s.avgSalaryGlobal / 1000).toFixed(1)}k</div>
                         ))}
                      </div>
                      {/* Arab Row */}
                      <div className="grid grid-cols-11 gap-2 text-xs text-center items-center py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded transition-colors">
                         <div className="text-start font-bold text-emerald-600">Arab</div>
                         {category.gamingMarketStats.map((s) => (
                           <div key={s.year} className="text-emerald-600 dark:text-emerald-400 font-bold">${(s.avgSalaryArab / 1000).toFixed(1)}k</div>
                         ))}
                      </div>
                    </div>
                  </div>
               </div>

            </motion.section>
          )}

          {/* GAME BUILD PROCESS */}
          {isGaming && category.gameBuildProcess && (
            <motion.section variants={item}>
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Icon name="Wrench" className="me-2 text-primary-500" /> How I Build Games
              </h2>
              <div className="relative">
                 {/* Line */}
                 <div className="absolute start-6 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-800 md:hidden"></div>
                 <div className="hidden md:block absolute top-6 start-0 end-0 h-0.5 bg-slate-200 dark:bg-slate-800"></div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {category.gameBuildProcess.map((step, idx) => (
                      <div key={idx} className="relative flex flex-row md:flex-col items-center md:text-center gap-4">
                         <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 border-4 border-slate-50 dark:border-slate-900 z-10 flex items-center justify-center text-primary-500 shadow-sm shrink-0">
                           <Icon name={step.icon} size={20} />
                         </div>
                         <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm leading-tight mb-1">{step.title}</h4>
                            <p className="text-xs sm:text-[10px] md:text-xs text-slate-500 dark:text-slate-400 leading-snug">{step.description}</p>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            </motion.section>
          )}
          
          {/* GALLERY SECTION (Standard for others, excluding business and gaming special handling) */}
          {!isGaming && !isBusiness && category.projects.length > 0 && (
            <motion.section variants={item}>
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Icon name="Image" className="me-2 text-primary-500" /> Galerie
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {category.projects.map((project, idx) => (
                  <div 
                      key={idx} 
                      className="group relative aspect-video bg-slate-200 dark:bg-slate-800 rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
                      onClick={() => openLightbox(project)}
                  >
                      <img 
                        src={project.images[0]} 
                        alt={project.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                       loading="lazy" />
                      
                      {/* Overlay Info */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                        <h3 className="text-white font-bold text-lg translate-y-2 group-hover:translate-y-0 transition-transform duration-300">{project.title}</h3>
                        <p className="text-slate-300 text-xs mt-1 translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-75 line-clamp-1">{project.description}</p>
                        <div className="flex items-center gap-2 mt-3 translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-100">
                          <span className="text-white bg-white/20 md:backdrop-blur-md px-2 py-1 rounded text-xs flex items-center">
                            <Icon name="Images" size={12} className="me-1" /> {project.images.length}
                          </span>
                        </div>
                      </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* 2. FIELD ROADMAP / JOURNEY SECTION */}
          {category.id !== 'business' && (
          <motion.section variants={item} className={`p-8 rounded-2xl border relative overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800`}>
                <h2 className="text-2xl font-bold mb-8 flex items-center">
                  <Icon name="Map" className="me-2 text-primary-500" /> 
                  {isIT ? 'Gamified Learning Path' : 'Roadmap & Learning Path'}
                </h2>
            <div className="space-y-12 relative z-10">
              
              {/* Career Path / Learning Roadmap */}
              {category.id !== 'architecture' && category.id !== 'gaming' && (
              <div>
                 {!isIT && (
                   <h3 className="text-lg font-bold text-slate-400 uppercase tracking-widest text-xs mb-6 border-b border-slate-100 dark:border-slate-800 pb-2">
                     Career Path
                   </h3>
                 )}
                 
                 <div className="relative border-s-2 ms-3 space-y-12 border-slate-200 dark:border-slate-700">
                  {category.roadmap.map((step, idx) => (
                    <div key={idx} className="relative ps-10 group">
                      {/* Timeline Dot */}
                      <div className={`absolute -start-[9px] top-1.5 w-4 h-4 rounded-full border-2 transition-all duration-500 z-10 ${
                          step.status === 'completed' ? 'bg-emerald-500 border-emerald-500' : step.status === 'in-progress' ? 'bg-primary-500 border-primary-500 animate-pulse' : 'bg-slate-200 dark:bg-slate-800 border-slate-400 dark:border-slate-600'
                      }`}></div>
                      
                      {/* Content Card */}
                      <div className="transition-all duration-300">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                           <div className="flex items-center gap-3">
                              {/* Icon for roadmap step if available */}
                              {step.icon && <Icon name={step.icon} size={16} className={`text-slate-400 ${step.status === 'in-progress' ? 'text-primary-500 animate-pulse' : ''}`}/>}
                              <h4 className="font-bold transition-colors text-base group-hover:text-primary-500">{step.title}</h4>
                           </div>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full w-fit mt-2 sm:mt-0 ${
                              step.status === 'completed' ? 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30' : step.status === 'in-progress' ? 'text-primary-600 bg-primary-100 dark:bg-primary-900/30' : 'text-slate-500 bg-slate-100 dark:bg-slate-800'
                          }`}>
                            {step.status}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              )}

              {/* PROFESSIONAL EXPERIENCE */}
              {category.experience && (
                <div>
                  <h3 className="text-lg font-bold text-slate-400 uppercase tracking-widest text-xs mb-6 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center">
                    <Icon name="Briefcase" size={14} className="me-2"/> Professional Experience
                  </h3>
                  <div className="space-y-6">
                    {category.experience.map((exp, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row gap-4">
                        <div className="w-full sm:w-32 text-sm text-slate-400 font-mono shrink-0">{exp.period}</div>
                        <div>
                          <h4 className="font-bold text-base">{exp.role}</h4>
                          <div className="text-sm text-primary-600 dark:text-primary-400 mb-1">{exp.company}</div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{exp.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* EDUCATION */}
              {category.education && (
                <div>
                   <h3 className="text-lg font-bold text-slate-400 uppercase tracking-widest text-xs mb-6 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center">
                    <Icon name="GraduationCap" size={14} className="me-2"/> Education
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {category.education.map((edu, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                        <div className="text-xs text-slate-400 font-mono mb-1">{edu.year}</div>
                        <h4 className="font-bold text-sm">{edu.degree}</h4>
                        <div className="text-sm text-slate-600 dark:text-slate-400">{edu.institution}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* RESOURCES / PLATFORMS */}
              {category.resources.length > 0 && (
                <div>
                   <h3 className={`text-lg font-bold uppercase tracking-widest text-xs mb-6 border-b pb-2 flex items-center ${isBusiness ? 'text-slate-500 border-slate-800' : 'text-slate-400 border-slate-100 dark:border-slate-800'}`}>
                    <Icon name="Globe" size={14} className="me-2"/> Where I Learn From
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    {category.resources.map((res, idx) => (
                      <a 
                        key={idx} 
                        href={res.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className={`flex items-center p-3 rounded-lg border transition-colors group ${isBusiness ? 'bg-white/5 border-white/10 hover:border-emerald-500 text-white' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 hover:border-primary-500 dark:hover:border-primary-500'}`}
                      >
                         <div className={`w-8 h-8 rounded flex items-center justify-center shadow-sm me-3 ${isBusiness ? 'bg-emerald-900/50 text-emerald-400' : 'bg-white dark:bg-slate-900 text-primary-500'}`}>
                           <Icon name={res.type === 'Platform' ? 'Monitor' : res.type === 'YouTube' ? 'Youtube' : 'BookOpen'} size={16} />
                         </div>
                         <div>
                           <div className={`font-bold text-sm transition-colors ${isBusiness ? 'group-hover:text-emerald-400' : 'group-hover:text-primary-500'}`}>{res.name}</div>
                           <div className="text-xs text-slate-500">{res.type}</div>
                         </div>
                         <Icon name="ExternalLink" size={12} className="ms-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {category.id === 'architecture' && <ArchitectureRoadmapComponent />}
              {category.id === 'it-cybersecurity' && <ITRoadmapComponent />}
              {category.id === 'gaming' && <GamingRoadmapComponent />}

            </div>
          </motion.section>
          )}

        </div>

        {/* --- SIDEBAR (RIGHT) --- */}
        <div className="lg:col-span-4 space-y-8">

          {/* SERVICES ("What I Do") */}
          {category.services && (
            <motion.section variants={item} className="bg-gradient-to-br from-primary-900 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-primary-500/20">
               <h3 className="font-bold text-lg mb-4 flex items-center text-white">
                <Icon name="Zap" size={18} className="me-2 text-primary-400"/> What I Do
              </h3>
              <ul className="space-y-3">
                {category.services.map((service, idx) => (
                  <li key={idx} className="flex items-start text-sm">
                    <Icon name="Check" size={16} className="me-3 mt-0.5 text-primary-400 shrink-0" />
                    <span className="font-medium text-slate-200">{service}</span>
                  </li>
                ))}
              </ul>
            </motion.section>
          )}
          
          {/* COMPÉTENCES (Skills) */}
          <motion.section variants={item} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-lg mb-6 flex items-center text-slate-800 dark:text-white">
              <Icon name="Activity" size={18} className="me-2 text-yellow-500"/> Skills
            </h3>
            <div className="space-y-5">
              {category.skills.map((skill, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1.5 font-medium text-slate-700 dark:text-slate-300">
                    <span>{skill.name}</span>
                    <span className="text-slate-400 text-xs">{skill.level}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r from-${category.color}-400 to-${category.color}-600 rounded-full transition-all duration-1000`} style={{ width: `${skill.level}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* GAMING DEV TOOLS (Replacing standard tools for gaming) */}
          {isGaming && category.gameDevToolsList && (
             <motion.section variants={item} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-lg mb-4 flex items-center">
                  <Icon name="Wrench" className="me-2 text-primary-500"/> Dev Tools
                </h3>
                <div className="space-y-2">
                   {category.gameDevToolsList.map((tool, idx) => (
                     <div key={idx} className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors">
                        <div className="flex items-center">
                           <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded me-2 text-slate-600 dark:text-slate-300">
                              <Icon name={tool.icon || 'Box'} size={16} />
                           </div>
                           <div>
                              <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{tool.name}</div>
                              <div className="text-[10px] text-slate-400">{tool.description}</div>
                           </div>
                        </div>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                           tool.type === 'Free' 
                             ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' 
                             : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30'
                        }`}>
                           {tool.type}
                        </span>
                     </div>
                   ))}
                </div>
             </motion.section>
          )}

          {/* DYNAMIC TOOLS SECTIONS (Standard for others) */}
          {!isGaming && (
            <>
              {/* Section 1: 2D/3D (Architecture) OR Security (IT) */}
              {(apps2d3d.length > 0 || appsSecurity.length > 0) && (
                <motion.section variants={item} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <h3 className="font-bold text-lg mb-4 flex items-center">
                    <Icon name={appsSecurity.length > 0 ? 'Shield' : 'Box'} size={18} className="me-2 text-blue-500"/> 
                    {appsSecurity.length > 0 ? 'Security Tools' : 'Applications 2D et 3D'}
                  </h3>
                  <div className="space-y-3">
                    {(appsSecurity.length > 0 ? appsSecurity : apps2d3d).map((tool, idx) => (
                      <div key={idx} className="flex items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-900">
                        <div className="p-2 bg-white dark:bg-slate-900 rounded-md shadow-sm me-3 text-blue-600 dark:text-blue-400">
                          <Icon name={tool.icon || 'Box'} size={20} />
                        </div>
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{tool.name}</span>
                      </div>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Section 2: Render (Architecture) OR Languages (IT) */}
              {(appsRender.length > 0 || appsLanguage.length > 0) && (
                <motion.section variants={item} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <h3 className="font-bold text-lg mb-4 flex items-center">
                    <Icon name={appsLanguage.length > 0 ? 'Code' : 'Aperture'} size={18} className="me-2 text-purple-500"/> 
                    {appsLanguage.length > 0 ? 'Languages' : 'Applications Render'}
                  </h3>
                  <div className="space-y-3">
                    {(appsLanguage.length > 0 ? appsLanguage : appsRender).map((tool, idx) => (
                      <div key={idx} className="flex items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-purple-200 dark:hover:border-purple-900">
                        <div className="p-2 bg-white dark:bg-slate-900 rounded-md shadow-sm me-3 text-purple-600 dark:text-purple-400">
                          <Icon name={tool.icon || 'Image'} size={20} />
                        </div>
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{tool.name}</span>
                      </div>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Fallback or Other Tools */}
              {appsOther.length > 0 && apps2d3d.length === 0 && appsRender.length === 0 && appsSecurity.length === 0 && appsLanguage.length === 0 && (
                <motion.section variants={item} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-lg mb-4 flex items-center"><Icon name="Wrench" size={18} className="me-2 text-slate-500"/> Toolkit</h3>
                    <div className="flex flex-wrap gap-2">
                      {appsOther.map((tool, idx) => (
                        <span key={idx} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-2">
                          <Icon name={tool.icon || 'Wrench'} size={12} className="text-primary-500" />
                          {tool.name}
                        </span>
                      ))}
                    </div>
                </motion.section>
              )}
          </>
          )}

          {/* CERTIFICATS */}
          {category.certificates.length > 0 && (
            <motion.section variants={item} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-lg mb-4 flex items-center">
                <Icon name="Award" size={18} className="me-2 text-orange-500"/> Certificates
              </h3>
              
              {/* Disclaimer Alert */}
              {category.certificatesDisclaimer && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-lg text-xs text-blue-800 dark:text-blue-300 flex gap-2">
                   <Icon name="HelpCircle" size={16} className="shrink-0 mt-0.5" />
                   <p>{category.certificatesDisclaimer}</p>
                </div>
              )}

              <ul className="space-y-3">
                {category.certificates.map((cert, idx) => (
                  <li key={idx} className="flex items-start text-sm group">
                    <Icon name="CheckCircle2" size={16} className="me-2 mt-0.5 text-emerald-500 shrink-0" />
                    <span className="text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{cert}</span>
                  </li>
                ))}
              </ul>
            </motion.section>
          )}

          {/* MES INTÉRÊTS & DOWNLOAD CV (Conditional) */}
          {category.interests && (
            <motion.section variants={item} className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
              {/* Decorative Circle */}
              <div className="absolute top-0 end-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -me-10 -mt-10"></div>
              
              <h3 className="font-bold text-lg mb-4 flex items-center relative z-10">
                <Icon name="Heart" size={18} className="me-2 text-red-500"/> {isIT ? 'Highlights' : 'Mes Intérêts'}
              </h3>
              
              <div className="grid grid-cols-2 gap-3 mb-6 relative z-10">
                {category.interests.map((interest, idx) => {
                  const Wrapper = (interest as any).url ? 'a' : 'div';
                  const props = (interest as any).url ? { href: (interest as any).url, target: '_blank', rel: 'noreferrer' } : {};
                  
                  return (
                    <Wrapper 
                      key={idx} 
                      {...props}
                      className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 text-center cursor-pointer group/item"
                    >
                      <Icon name={interest.icon} size={24} className="mb-2 text-primary-400 group-hover/item:scale-110 transition-transform"/>
                      <span className="text-xs font-medium">{interest.name}</span>
                    </Wrapper>
                  );
                })}
              </div>

              {/* Portfolio / Gallery Button */}
              {isIT ? (
                <a 
                  href="https://marouananouar.github.io/RedTeamSpace/" 
                  target="_blank"
                  rel="noreferrer"
                  className="relative z-10 w-full flex items-center justify-center py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-primary-500 hover:text-white transition-all group mt-4"
                >
                  <span className="flex items-center">
                    <Icon name="Rocket" size={18} className="me-2 group-hover:animate-bounce" /> 
                    Red Team Space
                  </span>
                </a>
              ) : (
                <div 
                  className="relative z-10 w-full flex items-center justify-center py-3 bg-slate-800/50 text-slate-400 font-bold rounded-xl border border-slate-700/50 mt-4 cursor-not-allowed select-none"
                  title="No link available now"
                >
                  <span className="flex items-center">
                    <Icon name="Lock" size={18} className="me-2" /> 
                    Portfolio - No link available now
                  </span>
                </div>
              )}
            </motion.section>
          )}

        </div>

      </motion.div>
    </div>
  );
};

export default CategoryDetail;
