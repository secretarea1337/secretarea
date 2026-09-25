import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import Icon from './Icon';
import { auth } from '../src/firebase';
import { analyzeRequirements, checkCompatibilityStatus } from '../pages/SecretArea';
import { getCpuTier, getGpuTier } from '../src/data/systemSpecs';
import { useLanguage } from '../src/contexts/LanguageContext';
import { getStoredHardwareSpecs, saveUserHardwareSpecs } from '../src/services/userService';

interface Requirement {
  label: string;
  value: string;
  icon: string;
  link?: string;
}

interface SpecItem {
  name: string;
  userSpec: string;
  reqSpec: string;
  score: number; // 0 to 100
  passed: boolean;
}

const CircularProgress: React.FC<{ progress: number; colorClass: string }> = ({ progress, colorClass }) => {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 48 48">
        <circle
          className="text-slate-200 dark:text-slate-800"
          strokeWidth="4"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="24"
          cy="24"
        />
        <circle
          className={colorClass}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="24"
          cy="24"
        />
      </svg>
      <span className="absolute text-sm font-bold text-slate-900 dark:text-white">{progress}%</span>
    </div>
  );
};

const HardwareCompatibility: React.FC<{ 
  requirements?: Requirement[], 
  globalSpecs?: { ram: number, os: string, cpuModel: string, gpuModel: string, isActive: boolean } 
}> = ({ requirements, globalSpecs: initialGlobalSpecs }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(() => auth.currentUser);
  const [isOpen, setIsOpen] = useState(false);
  const [parsedSpecs, setParsedSpecs] = useState<any>(null);
  const [activeSpecs, setActiveSpecs] = useState(() => initialGlobalSpecs || getStoredHardwareSpecs());

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  const handleHardwareSettingsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!currentUser) {
      window.dispatchEvent(new CustomEvent('open-login-modal'));
    } else {
      navigate('/settings', { state: { tab: 'Hardware' } });
    }
  };

  const handleModalHardwareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(false);
    if (!currentUser) {
      window.dispatchEvent(new CustomEvent('open-login-modal'));
    } else {
      navigate('/settings', { state: { tab: 'Hardware' } });
    }
  };

  useEffect(() => {
    if (initialGlobalSpecs) {
      setActiveSpecs(initialGlobalSpecs);
    }
  }, [initialGlobalSpecs]);

  useEffect(() => {
    const handleSync = (e: any) => {
      if (e.detail) {
        setActiveSpecs(e.detail);
      }
    };
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'secretarea_hardware_specs' && e.newValue) {
        try {
          setActiveSpecs(JSON.parse(e.newValue));
        } catch (err) {}
      }
    };
    window.addEventListener('secretarea_hardware_sync', handleSync);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('secretarea_hardware_sync', handleSync);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  useEffect(() => {
    if (!requirements || requirements.length === 0) return;

    const parsedReqs = analyzeRequirements(requirements);

    const userRam = activeSpecs?.isActive ? activeSpecs.ram : 16;
    const userOs = parseInt(activeSpecs?.isActive ? activeSpecs.os : '11');
    const userCpuModel = activeSpecs?.isActive ? activeSpecs.cpuModel : 'AMD Ryzen 5 3600';
    const userGpuModel = activeSpecs?.isActive ? activeSpecs.gpuModel : 'NVIDIA GeForce RTX 3060';

    const userCpuTier = getCpuTier(userCpuModel);
    const userGpuTier = getGpuTier(userGpuModel);

    let totalScore = 0;

    // RAM
    const ramPass = parsedReqs.minRam === 0 || userRam >= parsedReqs.minRam;
    const ramScore = parsedReqs.minRam === 0 ? 100 : Math.min(100, Math.round((userRam / parsedReqs.minRam) * 100));
    totalScore += ramScore;

    // OS
    const osPass = parsedReqs.minOs === 0 || userOs >= parsedReqs.minOs;
    const osScore = parsedReqs.minOs === 0 ? 100 : (userOs >= parsedReqs.minOs ? 100 : 20);
    totalScore += osScore;

    // CPU
    const cpuPass = parsedReqs.minCpuTier <= 1 || userCpuTier >= parsedReqs.minCpuTier;
    const cpuScore = parsedReqs.minCpuTier <= 1 ? 100 : Math.min(100, Math.round((userCpuTier / parsedReqs.minCpuTier) * 100));
    totalScore += cpuScore;

    // GPU
    const gpuPass = parsedReqs.minGpuTier <= 1 || userGpuTier >= parsedReqs.minGpuTier;
    const gpuScore = parsedReqs.minGpuTier <= 1 ? 100 : Math.min(100, Math.round((userGpuTier / parsedReqs.minGpuTier) * 100));
    totalScore += gpuScore;

    // Extract req strings
    let cpuReqStr = 'Not specified';
    let gpuReqStr = 'Not specified';
    let ramReqStr = 'Not specified';
    let osReqStr = 'Not specified';
    let storageReqStr = 'Not specified';

    requirements.forEach(req => {
      const label = req.label.toLowerCase();
      if (label.includes('processor') || label.includes('cpu')) cpuReqStr = req.value;
      if (label.includes('graphics') || label.includes('gpu') || label.includes('video')) gpuReqStr = req.value;
      if (label.includes('memory') || label.includes('ram')) ramReqStr = req.value;
      if (label.includes('os') || label.includes('operating')) osReqStr = req.value;
      if (label.includes('storage') || label.includes('disk') || label.includes('space')) storageReqStr = req.value;
    });

    const storagePass = true; 
    const storageScore = 100;
    totalScore += storageScore;

    let avgScore = Math.round(totalScore / 5);

    const compStatus = checkCompatibilityStatus({ram: userRam, os: userOs.toString(), cpuTier: userCpuTier, gpuTier: userGpuTier}, requirements);

    let status = 'EXCELLENT';
    if (compStatus === 'fail') {
        status = 'POOR';
        if (avgScore >= 50) avgScore = 49; // Force score below 50 so it's red
    }
    else if (compStatus === 'warn') {
        status = 'GOOD';
        if (avgScore >= 80) avgScore = 79; // Force score below 80 so it's yellow
    }

    let summaryText = t('Your system comfortably meets all requirements. Experience optimal gameplay with high frame rates.');
    if (status === 'GOOD') summaryText = t('Your system comfortably meets most requirements. You should be able to run smoothly with stable performance.');
    if (status === 'POOR') summaryText = t('Your system falls below the recommended requirements. You may experience performance issues, and an upgrade is recommended.');

    const finalSpecs = {
      graphics: { name: t('Graphics Card'), userSpec: userGpuModel, reqSpec: gpuReqStr, score: gpuScore, passed: gpuPass },
      processor: { name: t('Processor'), userSpec: userCpuModel, reqSpec: cpuReqStr, score: cpuScore, passed: cpuPass },
      memory: { name: t('Memory'), userSpec: `${userRam} GB`, reqSpec: ramReqStr, score: ramScore, passed: ramPass },
      storage: { name: t('Storage'), userSpec: '1 TB SSD', reqSpec: storageReqStr, score: storageScore, passed: storagePass },
      os: { name: t('Operating System'), userSpec: `Windows ${userOs}`, reqSpec: osReqStr, score: osScore, passed: osPass }
    };

    setParsedSpecs({
      score: avgScore,
      statusText: status,
      summaryText,
      specs: finalSpecs
    });

  }, [requirements, activeSpecs]);

  if (!activeSpecs?.isActive) {
    return (
      <div className="relative overflow-hidden rounded-xl bg-slate-50 dark:bg-[#0f151e] border border-slate-200 dark:border-slate-800/50 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 text-center sm:text-start">
          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-primary-500 shrink-0">
            <Icon name="Cpu" size={24} />
          </div>
          <div>
            <h3 className="text-slate-900 dark:text-white font-bold text-sm sm:text-base">{t('Can I Run It?')}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5">{t('Enable compatibility checker to benchmark against your hardware specs.')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleHardwareSettingsClick}
            className="flex-1 sm:flex-none px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Icon name="Tools" size={14} />
            {t('Hardware Settings')}
          </button>
        </div>
      </div>
    );
  }

  if (!parsedSpecs) return null;

  const { score, statusText, summaryText, specs } = parsedSpecs;
  const colorClass = score >= 70 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-red-500';
  const badgeColor = score >= 70 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500';

  const dotCount = 5;
  const activeDots = Math.round((score / 100) * dotCount);
  const displayBadgeText = statusText === 'POOR' ? t("WON'T RUN") : statusText === 'GOOD' ? t("MIGHT STRUGGLE") : t("RUNS GREAT");

  return (
    <>
      <div 
        onClick={() => setIsOpen(true)}
        className="relative group cursor-pointer overflow-hidden rounded-xl bg-white dark:bg-[#0f151e] border border-slate-200 dark:border-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700 transition-colors p-4 flex items-center gap-4"
      >
        <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-${score >= 70 ? 'emerald-500' : score >= 50 ? 'amber-500' : 'red-500'}/50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity`} />
        
        <CircularProgress progress={score} colorClass={colorClass} />
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-slate-900 dark:text-white font-bold text-lg">{t('Can I Run It?')}</h3>
            <span className={`${badgeColor} text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider`}>
              {displayBadgeText}
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{t('View hardware analysis')} &rarr;</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: dotCount }).map((_, i) => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full ${i < activeDots ? (score >= 70 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500') : 'bg-slate-200 dark:bg-slate-700'}`}
              />
            ))}
          </div>
          <Icon name="ChevronRight" size={20} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors rtl:rotate-180" />
        </div>
      </div>

      {typeof document !== 'undefined' && createPortal(
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-3xl bg-white dark:bg-[#111721] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-4 sm:p-6 md:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 border-b border-slate-200 dark:border-slate-800/50 shrink-0 text-center sm:text-start relative">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 end-4 p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors shrink-0 sm:hidden"
                >
                  <Icon name="X" size={20} />
                </button>
                <CircularProgress progress={score} colorClass={colorClass} />
                <div className="flex-1 w-full flex flex-col items-center sm:items-start">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('Can I Run It?')}</h2>
                    <span className={`${badgeColor} text-white text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wider`}>
                      {displayBadgeText}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-xl">
                    {summaryText}
                  </p>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="hidden sm:block p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors shrink-0"
                >
                  <Icon name="X" size={20} />
                </button>
              </div>

              <div className="p-6 md:p-8 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SpecCard item={specs.graphics} icon="GPU" fallbackIcon="Monitor" />
                  <SpecCard item={specs.processor} icon="Cpu" />
                  <SpecCard item={specs.memory} icon="Database" />
                  <SpecCard item={specs.storage} icon="Database" />
                  <SpecCard item={specs.os} icon="BrandWindows" fallbackIcon="Layout" fullWidth />
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 dark:bg-[#0d1219] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
                <button 
                  type="button" 
                  onClick={handleModalHardwareClick}
                  className="flex items-center gap-2 text-primary-500 hover:text-primary-600 transition-colors text-sm font-semibold cursor-pointer"
                >
                  <Icon name="Tools" size={16} />
                  {t('Update your PC Specifications in Settings')} &rarr;
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  {t('Close')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>, document.body)}
    </>
  );
};

const SpecCard: React.FC<{ item: SpecItem; icon: string; fallbackIcon?: string; fullWidth?: boolean }> = ({ item, icon, fallbackIcon, fullWidth }) => {
  const { t } = useLanguage();
  const isPass = item.passed;
  const borderColor = isPass ? 'border-emerald-200 dark:border-[#152e25]' : 'border-red-200 dark:border-[#3a1a1f]';
  const bgGradient = isPass ? 'from-emerald-50 dark:from-[#0d1b17] to-transparent' : 'from-red-50 dark:from-[#1f1013] to-transparent';
  const badgeColor = isPass ? 'bg-emerald-100 text-emerald-700 dark:bg-[#0f3b2d] dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-[#4a1820] dark:text-red-400';
  const progressColor = isPass ? 'bg-emerald-500' : 'bg-red-500';
  const iconBg = isPass ? 'bg-emerald-100 dark:bg-[#0f2a20] text-emerald-600 dark:text-emerald-400' : 'bg-red-100 dark:bg-[#2a1215] text-red-600 dark:text-red-400';
  
  return (
    <div className={`rounded-xl border ${borderColor} bg-gradient-to-br ${bgGradient} p-5 flex flex-col ${fullWidth ? 'md:col-span-2' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200 font-medium">
          <div className={`p-2 rounded-lg ${iconBg}`}>
            <Icon name={icon} size={18} />
          </div>
          {item.name}
        </div>
        <div className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1 ${badgeColor}`}>
          {isPass ? <Icon name="Check" size={12} /> : <Icon name="X" size={12} />}
          {isPass ? t('PASSES') : t('FAILS')}
        </div>
      </div>

      <div className="mt-auto">
        <h4 className="text-slate-900 dark:text-white font-bold text-lg mb-1">{item.userSpec}</h4>
        <p className="text-slate-500 text-xs mb-4 line-clamp-2" title={item.reqSpec}>{item.reqSpec}</p>
        
        <div className="flex items-center gap-3">
          <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 flex-1 overflow-hidden">
            <div className={`h-full ${progressColor} rounded-full`} style={{ width: `${item.score}%` }} />
          </div>
          <span className={`text-xs font-bold ${isPass ? 'text-emerald-500' : 'text-red-500'}`}>
            {item.score}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default HardwareCompatibility;
