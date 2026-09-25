import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Icon from './Icon';
import { useLanguage } from '../src/contexts/LanguageContext';

const DonateModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => { const { dir, t } = useLanguage();
    const [iframeLoaded, setIframeLoaded] = useState(false);

    if (!open) return null;

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            dir={dir} className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-[360px] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-xl">
                            <Icon name="Heart" size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('Support Us')}</h2>
                            <p className="text-xs text-slate-900 dark:text-slate-300 font-medium mt-0.5">{t('Keep the servers alive')}</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-colors border border-slate-200 dark:border-slate-700 shadow-sm"
                    >
                        <Icon name="X" size={18} />
                    </button>
                </div>
                
                <div className="p-5 flex flex-col items-center justify-center w-full bg-slate-50 dark:bg-slate-900 relative min-h-[400px]">
                    {!iframeLoaded && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="text-pink-500"
                            >
                                <Icon name="Loader2" size={24} />
                            </motion.div>
                            <p className="text-xs font-bold text-slate-600 dark:text-slate-300 animate-pulse uppercase tracking-widest">{t('Loading Gateway')}</p>
                        </div>
                    )}
                    <iframe 
                        src="https://trocador.app/anonpay/?ticker_to=xmr&network_to=Mainnet&address=4A1aLQiLKP9MppgCFYHWhM8GNP9eoxEQBQpAWKuiNaD5C2kLmrG2aM9cSK2pncFNNgKCCKbtqNrijAEampjek7SM7BsUFvX&donation=True&name=SecretArea&description=Support+the+website&email=nexa1337agency@gmail.com&bgcolor=00000000" 
                        width="310" 
                        height="350" 
                        className="bg-white rounded-xl dark:invert-[.85] dark:hue-rotate-180"
                        style={{ border: 0, opacity: iframeLoaded ? 1 : 0, transition: 'opacity 0.5s ease-in-out' }} 
                        scrolling="no"
                        onLoad={() => setIframeLoaded(true)}
                    ></iframe>
                    
                    <div className="mt-4 p-3 sm:p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-start gap-3 w-[310px]">
                        <div className="p-2 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
                            <Icon name="Wallet" size={18} />
                        </div>
                        <div className="text-start flex-1">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-300 mb-1">{t('No crypto wallet?')}</h4>
                            <p className="text-[10px] text-slate-600 dark:text-slate-500 leading-relaxed font-medium">
                                {t('You can use ')}<a href="https://exodus.com/" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-bold">Exodus</a>, <a href="https://cakewallet.com/" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-bold">Cake Wallet</a>, or another wallet to exchange and send.
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

// REQUEST MODAL

export default DonateModal;
