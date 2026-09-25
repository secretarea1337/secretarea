import { useLanguage } from '../src/contexts/LanguageContext';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../components/Icon';
import { CATEGORIES } from '../constants';

const getHoverBg = (color: string) => {
  switch (color) {
    case 'orange': return 'bg-orange-500/5 dark:bg-orange-500/10';
    case 'blue': return 'bg-blue-500/5 dark:bg-blue-500/10';
    case 'purple': return 'bg-purple-500/5 dark:bg-purple-500/10';
    case 'emerald': return 'bg-emerald-500/5 dark:bg-emerald-500/10';
    default: return 'bg-slate-500/5 dark:bg-slate-500/10';
  }
};

const getIconColors = (color: string) => {
  switch (color) {
    case 'orange': return 'group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30 group-hover:text-orange-600 dark:group-hover:text-orange-400';
    case 'blue': return 'group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400';
    case 'purple': return 'group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 group-hover:text-purple-600 dark:group-hover:text-purple-400';
    case 'emerald': return 'group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 group-hover:text-emerald-600 dark:group-hover:text-emerald-400';
    default: return 'group-hover:bg-slate-100 dark:group-hover:bg-slate-900/30 group-hover:text-slate-600 dark:group-hover:text-slate-400';
  }
};

const Roadmap: React.FC = () => {
  const { t } = useLanguage();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="w-full pt-28 pb-32 min-h-screen bg-[#fcfcfc] dark:bg-[#030712] px-4 sm:px-6 md:px-8 font-sans overflow-hidden">
      <div className="max-w-6xl mx-auto relative">
        
        {/* Subtle grid background for the "intelligent" look */}
        <div className="absolute inset-0 pointer-events-none -z-10 opacity-[0.03] dark:opacity-[0.05]" 
             style={{ backgroundImage: 'linear-gradient(to right, #808080 1px, transparent 1px), linear-gradient(to bottom, #808080 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="mb-24 text-start relative z-10">
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">
               <Icon name="ArrowLeft" size={16} />
               {t('Back to Dashboard')}
            </Link>
          </div>
          <motion.div 
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: '40px' }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="h-1 bg-emerald-500 mb-8"
          />
          <motion.h1 
            initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter"
          >
            Evolution <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500">Matrix</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-slate-500 dark:text-slate-400 max-w-2xl text-lg md:text-xl font-medium leading-relaxed"
          >
            A non-linear progression of disciplines. Select a node to explore its architecture, insights, and continuous development path.
          </motion.p>
        </div>

        <div className="relative z-10 flex flex-col w-full">
          {/* Vertical connection line */}
          <div className="absolute start-[29px] md:start-[39px] top-12 bottom-12 w-px bg-gradient-to-b from-transparent via-slate-200 dark:via-slate-800 to-transparent -z-10 hidden sm:block" />

          {CATEGORIES.map((category, index) => {
            const isHovered = hoveredIndex === index;
            const itemsCount = category.projects.length + (category.nexaProjects?.length || 0);

            return (
              <motion.div 
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="group relative border-b border-slate-200 dark:border-slate-800/60 first:border-t"
              >
                <Link to={`/roadmap/${category.id}`} className="block w-full py-8 md:py-12 relative overflow-hidden">
                  
                  {/* Organic hover effect bg */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div 
                        layoutId="hover-bg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`absolute inset-0 ${getHoverBg(category.color)} -z-10 rounded-2xl`}
                      />
                    )}
                  </AnimatePresence>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-12 relative z-10 px-4">
                    <div className="flex items-center gap-6 md:w-[45%]">
                      <div className="hidden sm:flex text-slate-300 dark:text-slate-700 font-mono text-sm md:text-base font-bold bg-white dark:bg-[#030712] py-2 z-10">
                        0{index + 1}
                      </div>
                      <div className={`p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-400 ${getIconColors(category.color)} transition-all duration-500 shadow-sm group-hover:shadow-md group-hover:-rotate-3`}>
                        <Icon name={category.iconName} size={32} />
                      </div>
                      <div>
                        <h3 className="text-2xl md:text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight group-hover:translate-x-2 transition-transform duration-500">
                          {category.title}
                        </h3>
                        <p className="text-sm font-medium text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-widest hidden md:block opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-500 delay-75">
                           {category.role}
                        </p>
                      </div>
                    </div>

                    <div className="md:w-[35%] text-slate-500 dark:text-slate-400 text-sm md:text-base leading-relaxed group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-500 font-medium">
                      {category.shortDescription}
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-8 md:w-[20%]">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-emerald-500 transition-colors duration-500" />
                        <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {itemsCount} Nodes
                        </span>
                      </div>
                      
                      <div className="w-12 h-12 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 group-hover:border-emerald-500/50 group-hover:bg-emerald-500 text-slate-400 dark:text-slate-500 group-hover:text-white transition-all duration-500">
                         <Icon name="ArrowRight" className={isHovered ? '-rotate-45 transition-transform duration-500' : 'transition-transform duration-500'} size={20} />
                      </div>
                    </div>
                  </div>
                  
                </Link>
              </motion.div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default Roadmap;
