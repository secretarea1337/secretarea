
import { createPortal } from 'react-dom';
import { Helmet } from 'react-helmet-async';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { signInWithGoogle, signInWithDiscord, signInWithGithub, db, auth } from '../src/firebase';
import { doc, getDoc, updateDoc, setDoc, onSnapshot, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { 
  trackUserMovement, 
  recordGameInteraction, 
  getLocalProfile, 
  removeGameFromLibrary, 
  getCachedAdminAvatar, 
  getCachedAdminName, 
  getCachedAdminBio,
  subscribeAdminPublicProfile, 
  saveAdminPublicProfile,
  saveUserProfileInfo,
  isUserAdmin,
  DEFAULT_ADMIN_BIO,
  DEFAULT_ADMIN_AVATAR,
  DEFAULT_ADMIN_BANNER,
  getCachedAdminBanner,
  getStoredHardwareSpecs, 
  saveUserHardwareSpecs 
} from '../src/services/userService';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../src/contexts/LanguageContext';
import { GPU_DATA, CPU_DATA, getGpuTier, getCpuTier } from '../src/data/systemSpecs';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon';
import HeroSlider from '../components/HeroSlider';
import AnimatedGenreHero from '../components/AnimatedGenreHero';
import PartnersSection from '../components/PartnersSection';
import UpcomingTrailersSection from '../components/UpcomingTrailersSection';

import { CommentsSection } from '../components/CommentsSection';
import { BestGameSeriesSection } from '../components/BestGameSeriesSection';
import { DuaPopup } from '../components/DuaPopup';
import { NetworkDiagnostic } from '../components/NetworkDiagnostic';
import DonateModal from "../components/DonateModal";
import MaintenancePage from '../components/MaintenancePage';
import HardwareCompatibility from "../components/HardwareCompatibility";
import { LowPolyBackground } from '../components/LowPolyBackground';
import { FaFaceAngry } from 'react-icons/fa6';
import { 
  TbShieldCheck, 
  TbCrown, 
  TbPencil, 
  TbUpload, 
  TbUser, 
  TbFileText, 
  TbPhoto, 
  TbLayoutDashboard, 
  TbX, 
  TbCheck, 
  TbDeviceFloppy, 
  TbLink 
} from 'react-icons/tb';
import backupData from '../data/backup_resources.json';

// --- CONFIGURATION ---
const API_ENDPOINT = 'https://script.google.com/macros/s/AKfycbx7nzBZc_tIhbAUK5OvOzgifGVzaVorzjn5OXNe8ENC0p7Pjia7O-u4WggxjRZipt4v/exec';
const DISCORD_LINK = 'https://discord.gg/pygmDWFAHK';
const TELEGRAM_LINK = 'https://t.me/secretarea1337';
const REDDIT_LINK = 'https://www.reddit.com/r/SecretArea1337/';
const INSTAGRAM_LINK = 'https://instagram.com/nexa1337';
const KICK_LINK = 'https://kick.com/secretarea1337';
const TIKTOK_LINK = 'https://www.tiktok.com/@secretarea1337';
const YOUTUBE_LINK = 'https://www.youtube.com/@SecretArea1337';
const ITEMS_PER_PAGE = 12; // Show 12 items per page for laptop grid (4x3)

// --- ADVERTISEMENT CONFIGURATION ---
const AD_CONFIG = {
  banner1: {
    desktop: "https://blogger.googleusercontent.com/img/a/AVvXsEgCPA6tVcBH3S5v1Z8kuza6RZkU4xgxr8xmDfFTWXVe20XthTejclAyfpzC2XueH50MwmRFDlVIF5ZIRjBZeNqjgokoSxt9yv7DXICKl25yK2xiE5WaAPt5Qe-n80SlQjtByruEyvGpeo4txkhtEEIcjKnjV4iAFygZilgqiEfPxJqnjbGo88quaNiOjku7",
    mobile: "https://blogger.googleusercontent.com/img/a/AVvXsEg0cECd44EYPreCyyRdRXdrtpVgQ4zhKzzTRdtiusek9QZ6nOVADqxzHsfsdEmEc2uWMAzaWMRsNXcpsI3cAOarcDnfXSrFyDXvfPQbMfsFsdWRVsv0S6ZcNPDc2GsNLQhv2x9K9ftA9bthdBDkYEkCt5styw5GuPQ1R6ig_ao0lDy_8F69e5bhdQ3Px3zo",
    link: "https://nexa1337.github.io/nexa1337"
  },
  banner2: {
    desktop: "https://blogger.googleusercontent.com/img/a/AVvXsEieujME3eiERRYSKVuqNK5RmR9HNp8dIkYA9RpGwRpFITR4AF-xgaSrGplCnCjdMfq2qERyhFQ3w55UQZKo_2NKJMqwLz9BVbQCBiSF5xq2LIuEP2hZZh6YCWDn7iYCcNvbsAAY7cOPfLbyUI27WR4CrgT84BBjJUvydxicw8aTVMfLV1TDl_ybMlB9w_2-",
    mobile: "https://blogger.googleusercontent.com/img/a/AVvXsEinwCMKTZTTEwIRwgWImWswN0ZyY_WR59hda2eTjfCsaqCRE081vj5F9NG7Ko4fpWigTmJv1DW7CdzeIC-XVAd-zIrSHCsM9mlCUQhVcJulQIT5A27L2XVG1ddbmPALFBgfPXxLLl6bTq3eBxn_pc1U_fyxJQ5eiwxckBoMXJNDBMi9iJEQ8MJ8gPLqIOBN",
    link: "https://school-lime-psi.vercel.app/"
  },
  banner3: {
    desktop: "https://blogger.googleusercontent.com/img/a/AVvXsEiSEyx6A5aXHKHgULr34BNBrXr1T1zwDDY6AzfDmoju_y5RofIrU3hD8656Wx_p2CWs-lye2-ZADxwF1OQdiP-iFeHacWd7d0zqi0mcXb6v6GkzSJ8wCnFt0OtmoHW9GigDZK9p5fu5QQw5tyQFoBNOS1dfcDt5e7HHMJD8FeNvGYcfRCoHHBtWdRxbyD_D",
    mobile: "https://blogger.googleusercontent.com/img/a/AVvXsEjR_OB4CqAqv5g8iq9gu8RKlm8ljH8iuEY-hTnqIlvEHfsz5iJI8QnYmBZ1i9gppBD0axWdTzu9np-rE8wKlDWJ4MjBhNo1uKMVux9ToeY2SK8fpoHy7v7cf493n_FbLo4nF8yOFLD9J2slTY4_3lHTaJJEsUB8U7MCGCHGwXR7ohzD0DdKSlamZY09wQJS",
    link: "https://nexa1337.github.io/tool/"
  },
  banner4: {
    desktop: "https://blogger.googleusercontent.com/img/a/AVvXsEgN1RQy1V6nR0osv3oNgTei-P_rZykcqf8dfM62jeYWIvxDOQ1fdpvz77DXZ6PWl98uPlH5BLO18M6B8wxeiVds49Ns1lcShLMmG_ASbuQl9-4i6UOaEGyh3Be8bfWnyhL-TZ4igI09zAsmWkqNaULeJxXPFqAQ81BHvQc0F-kZV2yzgF6g8JbWBL7cQhse",
    mobile: "https://blogger.googleusercontent.com/img/a/AVvXsEg8axchD7U8xQW7JH6F6twwFLvKCG0TfVUjWF8JsFctG42IY3y2pkQDHdRRkVExTf7ewL609l9ztXO9Dq61fPXZPfVlSXwEDB7olykBOZUV4LCzCqdA2SGw0KdJ1F_JPjJPgyl9gMi_gMD9raxaKGAAXqXcEucqknI232gkZPNpYR5OoIzrsmIWh03vy1JF",
    link: "https://nexa1337.github.io/toolv2"
  },
  banner5: {
    desktop: "https://blogger.googleusercontent.com/img/a/AVvXsEglYrDKA_WlXZZ7wipHFuzNUndOiozyVITTrLQJ7FAYnSVMpLao7EPdx10rxGkfrT9RtoSZadoVdD77Y_pElZyqWEcBX06-MrPBysM8180sAlzvk85IT35ztmLPEJ4ttQw5QNFqWW-8Pz5-hQBCg2AB0NeiviP4I1lXfk9DDta4f0IySkD1JBNUJ9jT8PQL",
    mobile: "https://blogger.googleusercontent.com/img/a/AVvXsEiZ6vQYIHYF4ft2k3KTHr3oulDVWC7BrP3bhtz0nZ62vr3MyZyZ-JSdASWGqLnC4W_YkH6np8CGyXz1TZNiyzXaBkIEic2DOBkvX1wXQGgHNoavx7HRhAG2sUXhlhOHPAJmDePHsJl5Bs9Ub1lG80u9Zhh2WxqSc1vf8oJjLrq4767OYiLNenojAm9HjijB",
    link: "https://digitalstore-iota-five.vercel.app/"
  }
};

// --- DISCLAIMER DATA ---
interface DisclaimerData {
  label: string;
  title: string;
  text: string;
  btn: string;
  dir?: string;
}

const DISCLAIMER_CONTENT: Record<string, DisclaimerData> = {
  EN: {
    label: "English",
    title: "⚠️ Disclaimer",
    text: "All content shared on this website is already publicly available on the internet.\nWe do not host, modify, or crack any files. We only organize and share existing public links.\n\nWe strongly encourage users to purchase original software and games to support developers.\nThe user is solely responsible for how the content is used.",
    btn: "I Understand"
  },
  AR: {
    label: "العربية",
    title: "⚠️ تنبيه قانوني",
    text: "جميع المحتويات الموجودة في هذا الموقع متوفرة مسبقًا على الإنترنت بشكل علني.\nنحن لا نستضيف الملفات ولا نقوم بتعديلها أو كسر حمايتها، بل نشارك فقط روابط عامة.\n\nننصح المستخدمين بشراء النسخ الأصلية لدعم المطورين.\nالمسؤولية الكاملة تقع على عاتق المستخدم.",
    btn: "أنا أفهم",
    dir: "rtl"
  },
  FR: {
    label: "Français",
    title: "⚠️ Avertissement",
    text: "Tout le contenu présent sur ce site est déjà disponible publiquement sur Internet.\nNous n’hébergeons, ne modifions ni ne crackons aucun fichier. Nous partageons uniquement des liens publics.\n\nNous encourageons fortement l’achat des versions originales pour soutenir les développeurs.\nL’utilisateur est seul responsable de l’utilisation du contenu.",
    btn: "Je comprends"
  },
  ES: {
    label: "Español",
    title: "⚠️ Aviso legal",
    text: "Todo el contenido de este sitio ya está disponible públicamente en Internet.\nNo alojamos, modificamos ni crackeamos archivos. Solo compartimos enlaces públicos.\n\nRecomendamos comprar las versions originales para apoyar a los desarrolladores.\nEl usuario es totalmente responsable del uso del contenido.",
    btn: "Entiendo"
  },
  RU: {
    label: "Русский",
    title: "⚠️ Отказ от ответственности",
    text: "Весь контент на этом сайте уже находится в открытом доступе в интернете.\nМы не размещаем, не изменяем и не взламываем файлы. Мы лишь делимся публичными ссылками.\n\nМы рекомендуем приобретать оригинальные версии для поддержки разработчиков.\nПользователь несёт полную ответственность за использование контента.",
    btn: "Я понимаю"
  }
};


const ADMIN_SOCIAL_LINKS = [
    {
        name: 'Reddit',
        url: REDDIT_LINK,
        icon: 'Reddit',
        hoverColor: 'hover:text-[#FF4500] hover:border-[#FF4500]/50 hover:bg-[#FF4500]/10',
        badgeColor: 'text-[#FF4500]',
    },
    {
        name: 'Discord',
        url: DISCORD_LINK,
        icon: 'Discord',
        hoverColor: 'hover:text-[#5865F2] hover:border-[#5865F2]/50 hover:bg-[#5865F2]/10',
        badgeColor: 'text-[#5865F2]',
    },
    {
        name: 'Telegram',
        url: TELEGRAM_LINK,
        icon: 'Telegram',
        hoverColor: 'hover:text-[#2AABEE] hover:border-[#2AABEE]/50 hover:bg-[#2AABEE]/10',
        badgeColor: 'text-[#2AABEE]',
    },
    {
        name: 'Kick',
        url: KICK_LINK,
        icon: 'Kick',
        hoverColor: 'hover:text-[#53FC18] hover:border-[#53FC18]/50 hover:bg-[#53FC18]/10',
        badgeColor: 'text-[#53FC18]',
    },
    {
        name: 'TikTok',
        url: TIKTOK_LINK,
        icon: 'Tiktok',
        hoverColor: 'hover:text-[#FE2C55] hover:border-[#FE2C55]/50 hover:bg-[#FE2C55]/10',
        badgeColor: 'text-[#FE2C55]',
    },
    {
        name: 'YouTube',
        url: YOUTUBE_LINK,
        icon: 'Youtube',
        hoverColor: 'hover:text-[#FF0000] hover:border-[#FF0000]/50 hover:bg-[#FF0000]/10',
        badgeColor: 'text-[#FF0000]',
    },
];

const UploaderProfilePopup: React.FC<{ isOpen: boolean; onClose: () => void; gameItem?: ResourceItem }> = ({ isOpen, onClose, gameItem }) => {
    const { t } = useLanguage();
    const [adminAvatar, setAdminAvatar] = useState<string>(() => getCachedAdminAvatar());
    const [adminBanner, setAdminBanner] = useState<string>(() => getCachedAdminBanner());
    const [adminDisplayName, setAdminDisplayName] = useState<string>(() => getCachedAdminName());
    const [adminBio, setAdminBio] = useState<string>(() => getCachedAdminBio());
    const [adminPoints, setAdminPoints] = useState<number>(50000);
    const [adminRank, setAdminRank] = useState<string>('Fenrir');
    const [adminRole, setAdminRole] = useState<string>('Root Admin');

    // Admin edit state
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editBio, setEditBio] = useState('');
    const [editAvatar, setEditAvatar] = useState('');
    const [editBanner, setEditBanner] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const currentUser = auth.currentUser;
    const isCurrentAdmin = isUserAdmin(currentUser?.email);

    useEffect(() => {
        if (!isOpen) {
            setIsEditing(false);
            return;
        }
        const unsub = subscribeAdminPublicProfile((data) => {
            if (data.avatarURL) setAdminAvatar(data.avatarURL);
            if (data.bannerURL) setAdminBanner(data.bannerURL);
            if (data.displayName) setAdminDisplayName(data.displayName);
            if (data.bio !== undefined) setAdminBio(data.bio);
            if (data.points) setAdminPoints(data.points);
            if (data.rank) setAdminRank(data.rank);
            if (data.role) setAdminRole(data.role);
        });
        return () => unsub();
    }, [isOpen]);

    const handleStartEditing = () => {
        setEditName(adminDisplayName);
        setEditBio(adminBio);
        setEditAvatar(adminAvatar);
        setEditBanner(adminBanner || DEFAULT_ADMIN_BANNER);
        setIsEditing(true);
    };

    const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (readerEvent) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 400;
                const MAX_HEIGHT = 400;
                let width = img.width;
                let height = img.height;
                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        height *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    const compressed = canvas.toDataURL('image/webp', 0.85);
                    setEditAvatar(compressed);
                }
            };
            img.src = readerEvent.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const handleBannerFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (readerEvent) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1200;
                const MAX_HEIGHT = 500;
                let width = img.width;
                let height = img.height;
                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        height *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    const compressed = canvas.toDataURL('image/webp', 0.85);
                    setEditBanner(compressed);
                }
            };
            img.src = readerEvent.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const handleSaveAdminProfile = async () => {
        setIsSaving(true);
        try {
            const finalName = editName.trim() || adminDisplayName || 'SecretArea';
            const finalAvatar = editAvatar.trim() || adminAvatar || DEFAULT_ADMIN_AVATAR;
            const finalBio = editBio.trim() || adminBio || DEFAULT_ADMIN_BIO;
            const finalBanner = editBanner.trim() || adminBanner || DEFAULT_ADMIN_BANNER;

            await saveAdminPublicProfile({
                displayName: finalName,
                photoURL: finalAvatar,
                avatarURL: finalAvatar,
                bannerURL: finalBanner,
                bio: finalBio,
                role: adminRole,
                rank: adminRank,
                points: adminPoints
            });

            if (currentUser?.uid) {
                await saveUserProfileInfo(currentUser.uid, currentUser, {
                    displayName: finalName,
                    photoURL: finalAvatar,
                    bannerURL: finalBanner,
                    bio: finalBio
                });
            }

            setAdminDisplayName(finalName);
            setAdminAvatar(finalAvatar);
            setAdminBanner(finalBanner);
            setAdminBio(finalBio);
            setSaveSuccess(true);
            setTimeout(() => {
                setSaveSuccess(false);
                setIsEditing(false);
            }, 800);
        } catch (err) {
            console.error('Failed to save admin profile:', err);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    const screenshotUrl = gameItem?.galleryImages?.[0] || gameItem?.coverImage;
    const bannerSrc = isEditing && editBanner ? editBanner : (adminBanner || DEFAULT_ADMIN_BANNER);

    return createPortal(
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm max-h-[92vh] overflow-y-auto custom-scrollbar shadow-2xl flex flex-col"
            >
                {/* Header: displays the real admin banner */}
                <div className="relative h-32 sm:h-36 bg-slate-900 shrink-0 overflow-hidden w-full">
                    <img 
                        src={bannerSrc} 
                        alt="Admin Banner" 
                        className="w-full h-full object-cover select-none"
                        onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = DEFAULT_ADMIN_BANNER;
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />
                    <button 
                        onClick={onClose} 
                        className="absolute top-3.5 end-3.5 z-30 w-8 h-8 flex items-center justify-center rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors cursor-pointer shadow-md"
                        title={t('Close')}
                    >
                        <Icon name="X" size={16} />
                    </button>
                    {gameItem?.name && (
                        <div className="absolute top-3.5 start-3.5 z-20 text-[11px] font-semibold text-white/90 bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/10 truncate max-w-[200px] flex items-center gap-1.5 shadow-sm">
                            <Icon name="Gamepad2" size={13} className="text-amber-400 shrink-0" />
                            <span className="truncate">{gameItem.name}</span>
                        </div>
                    )}
                </div>

                {/* Body Content - notice NO overflow-y-auto here so negative margin on avatar will NOT be clipped */}
                <div className="px-6 pb-6 pt-0 relative z-20">
                    {/* Top Row: Avatar & Badges overlapping the banner seamlessly */}
                    <div className="flex justify-between items-end -mt-11 sm:-mt-12 mb-4 relative z-30">
                        <div className="relative group">
                            <div className="w-20 h-20 sm:w-[88px] sm:h-[88px] rounded-2xl border-4 border-white dark:border-[#0b1120] bg-gradient-to-br from-amber-500/40 via-amber-400/20 to-blue-500/30 p-0.5 flex items-center justify-center relative shadow-2xl ring-2 ring-amber-500/40">
                                <div className="w-full h-full rounded-[12px] overflow-hidden bg-slate-900 flex items-center justify-center relative">
                                    <img 
                                        src={isEditing && editAvatar ? editAvatar : (adminAvatar || DEFAULT_ADMIN_AVATAR)} 
                                        alt={adminDisplayName || "Admin"} 
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).src = DEFAULT_ADMIN_AVATAR;
                                        }}
                                    />
                                </div>
                            </div>
                            {/* Verified Admin Avatar Badge */}
                            <div className="absolute -bottom-1 -end-1 z-40 w-6 h-6 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 flex items-center justify-center shadow-lg border-2 border-white dark:border-[#0b1120]" title={t('Verified Admin')}>
                                <TbShieldCheck size={13} className="stroke-[2.5]" />
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5 mb-1 relative z-30">
                            <span className="bg-white/95 dark:bg-[#0b1120]/95 backdrop-blur-xs text-amber-600 dark:text-amber-400 font-black text-xs px-3 py-1 rounded-full border border-amber-500/40 uppercase tracking-widest flex items-center gap-1 shadow-md">
                                <TbShieldCheck size={14} className="text-amber-500" /> Admin 🛡️
                            </span>
                            {isCurrentAdmin && !isEditing && (
                                <button
                                    onClick={handleStartEditing}
                                    className="px-2.5 py-1 rounded-lg bg-white/90 dark:bg-[#0b1120]/90 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-bold border border-amber-500/30 flex items-center gap-1.5 transition-all active:scale-95 shadow-xs cursor-pointer"
                                    title="Edit real admin display name, banner, avatar logo, and bio"
                                >
                                    <TbPencil size={12} className="text-amber-500" />
                                    <span>{t('Edit Profile')}</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* EDIT MODE: Admin Profile Editor */}
                    {isEditing ? (
                        <div className="space-y-3.5 mb-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-amber-500/30 shadow-inner">
                            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80 dark:border-slate-800">
                                <div className="flex items-center gap-1.5 text-xs font-black text-amber-600 dark:text-amber-400">
                                    <TbShieldCheck size={16} className="text-amber-500" />
                                    <span>Realtime Admin Editor</span>
                                </div>
                                <span className="text-[10px] text-emerald-500 dark:text-emerald-400 font-bold flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Live Sync
                                </span>
                            </div>

                            {/* Display Name Input */}
                            <div>
                                <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    <TbUser size={13} className="text-amber-500 shrink-0" />
                                    <span>Admin Display Name</span>
                                </label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    placeholder="Enter your real Admin name"
                                    className="w-full px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                />
                            </div>

                            {/* Bio Input */}
                            <div>
                                <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    <TbFileText size={13} className="text-amber-500 shrink-0" />
                                    <span>Admin Bio</span>
                                </label>
                                <textarea
                                    value={editBio}
                                    onChange={(e) => setEditBio(e.target.value)}
                                    rows={2}
                                    placeholder="Admin bio or motto..."
                                    className="w-full px-3 py-1.5 rounded-xl text-xs font-medium bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                                />
                            </div>

                            {/* Avatar Logo Selection */}
                            <div>
                                <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    <TbPhoto size={13} className="text-amber-500 shrink-0" />
                                    <span>Admin Avatar Logo</span>
                                </label>
                                {/* Preset Logos */}
                                <div className="flex items-center gap-2 mb-2">
                                    {[
                                        { label: 'Wolf', src: '/images/logo01.png' },
                                        { label: 'Shield', src: '/images/logo04.png' },
                                        { label: 'Streamer', src: '/images/streamer.png' },
                                        { label: 'Cyber', src: '/images/userprofile.png' },
                                    ].map((preset) => (
                                        <button
                                            key={preset.src}
                                            type="button"
                                            onClick={() => setEditAvatar(preset.src)}
                                            className={`relative w-9 h-9 rounded-xl overflow-hidden border-2 transition-all p-0.5 cursor-pointer ${
                                                editAvatar === preset.src ? 'border-amber-500 scale-105 shadow-md ring-1 ring-amber-400/50' : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                                            }`}
                                            title={preset.label}
                                        >
                                            <img src={preset.src} alt={preset.label} className="w-full h-full object-cover rounded-lg" />
                                        </button>
                                    ))}
                                </div>

                                {/* Custom Upload / URL */}
                                <div className="flex items-center gap-2">
                                    <label className="flex-1 cursor-pointer flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-200 transition-colors shadow-2xs">
                                        <TbUpload size={13} className="text-amber-500 shrink-0" />
                                        <span>Upload Logo</span>
                                        <input type="file" accept="image/*" onChange={handleAvatarFileUpload} className="hidden" />
                                    </label>
                                    <div className="flex-1 relative">
                                        <input 
                                            type="url"
                                            value={editAvatar.startsWith('data:') ? '' : editAvatar}
                                            onChange={(e) => setEditAvatar(e.target.value)}
                                            placeholder="Or image URL"
                                            className="w-full ps-7 pe-2.5 py-1.5 rounded-xl text-[11px] bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                                        />
                                        <TbLink size={12} className="absolute start-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Banner Selection */}
                            <div>
                                <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    <TbLayoutDashboard size={13} className="text-amber-500 shrink-0" />
                                    <span>Admin Banner</span>
                                </label>
                                <div className="flex items-center gap-2 mb-2">
                                    {[
                                        { label: 'Cyber Banner', src: '/images/userprofile.png' },
                                        ...(screenshotUrl ? [{ label: 'Game Screenshot', src: screenshotUrl }] : []),
                                    ].map((preset) => (
                                        <button
                                            key={preset.src}
                                            type="button"
                                            onClick={() => setEditBanner(preset.src)}
                                            className={`relative h-8 px-2.5 rounded-xl overflow-hidden border-2 text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                                editBanner === preset.src ? 'border-amber-500 bg-amber-500/10 text-amber-500 scale-105 shadow-md ring-1 ring-amber-400/50' : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100 text-slate-500 dark:text-slate-400'
                                            }`}
                                        >
                                            <img src={preset.src} alt={preset.label} className="w-4 h-4 object-cover rounded" />
                                            <span>{preset.label}</span>
                                        </button>
                                    ))}
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="flex-1 cursor-pointer flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-200 transition-colors shadow-2xs">
                                        <TbUpload size={13} className="text-amber-500 shrink-0" />
                                        <span>Upload Banner</span>
                                        <input type="file" accept="image/*" onChange={handleBannerFileUpload} className="hidden" />
                                    </label>
                                    <div className="flex-1 relative">
                                        <input 
                                            type="url"
                                            value={editBanner.startsWith('data:') ? '' : editBanner}
                                            onChange={(e) => setEditBanner(e.target.value)}
                                            placeholder="Or banner URL"
                                            className="w-full ps-7 pe-2.5 py-1.5 rounded-xl text-[11px] bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                                        />
                                        <TbLink size={12} className="absolute start-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 pt-1.5">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    disabled={isSaving}
                                    className="flex-1 py-1.5 px-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    <TbX size={13} />
                                    <span>Cancel</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveAdminProfile}
                                    disabled={isSaving}
                                    className="flex-1 py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black shadow-md flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                                >
                                    {isSaving ? (
                                        <>
                                            <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                                            <span>Saving...</span>
                                        </>
                                    ) : saveSuccess ? (
                                        <>
                                            <TbCheck size={14} className="stroke-[3]" />
                                            <span>Updated!</span>
                                        </>
                                    ) : (
                                        <>
                                            <TbDeviceFloppy size={14} />
                                            <span>Save & Update</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* DISPLAY MODE: Real Admin Profile */
                        <>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white truncate">
                                    {adminDisplayName || 'SecretArea'}
                                </h3>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20 shrink-0">
                                    Verified Admin
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-4 break-words">
                                {adminBio || 'InternetForEveryone.'}
                            </p>
                            
                            <div className="grid grid-cols-3 gap-2.5 mb-4">
                                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800 text-center">
                                    <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Points</div>
                                    <div className="text-base font-black text-slate-800 dark:text-slate-200">
                                        {adminPoints.toLocaleString()}
                                    </div>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800 text-center">
                                    <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Rank</div>
                                    <div className="text-sm font-black text-rose-500 flex items-center justify-center gap-1">
                                        <TbCrown size={14} /> {adminRank || 'Fenrir'}
                                    </div>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800 text-center">
                                    <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Role</div>
                                    <div className="text-xs font-black text-amber-500 truncate">
                                        {adminRole || 'Root Admin'}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Admin Social Links */}
                    <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800/80">
                        <div className="flex items-center justify-between mb-2.5">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
                                {t('Official Socials')}
                            </span>
                            <span className="text-[10px] font-semibold text-amber-500 dark:text-amber-400 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                {t('Real Links')}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {ADMIN_SOCIAL_LINKS.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all duration-200 hover:scale-[1.03] shadow-2xs group ${social.hoverColor}`}
                                    title={`${social.name} - SecretArea1337`}
                                >
                                    <span className={`${social.badgeColor} group-hover:scale-110 transition-transform shrink-0`}>
                                        <Icon name={social.icon} size={14} />
                                    </span>
                                    <span className="truncate text-[11px]">{social.name}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>,
        document.body
    );
};


// --- TYPES ---
interface Requirement {
  label: string;
  value: string;
  icon: string;
  link?: string;
}


type IntelCategory = 'GAME' | 'HYPERVISOR' | 'STEAMTOOLS' | 'ARCHITECT' | 'EXTRA' | 'UPCOMING';

interface IntelItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  category: IntelCategory;
  type: 'UPDATE' | 'NEW';
  version?: string;
}

export interface ResourceItem {
  title?: string;
  image?: string;
  id: string;
  category: string;
  name: string;
  version: string;
  repackSize: string;
  originalSize: string;
  genres: string;
  languages: string;
  repackBy: string;
  coverImage: string;
  galleryImages: string[];
  description: string;
  gameId?: string;
  developer?: string;
  ratingPositive?: string;
  ratingNegative?: string;
  dateAdded?: string;
  hasDenuvo?: boolean;
  hasExternalLauncher?: boolean;
  systemReqs?: Requirement[];
  installSteps?: string[];
  isPinned?: boolean;
  isFree: boolean;
  toolsNeeded?: { name: string; url: string }[];
  links: {
    parts: { id: number, link: string, note?: string }[];
    mirrors: { id: number, link: string, note?: string }[];
    ankerParts: { id: number, link: string, note?: string }[];
    full?: string;
    fullNote?: string;
        tutorial?: string; 
    dlc?: string;
    trailer?: string;
    preInstalled?: {
        download?: string;
        cloudDrop?: string;
        torrent?: string;
    };
    utorrent?: string;
  };}

interface CompanyProfile {
  id: string;
  name: string;
  logoUrl: string;
  description: string;
  gameIds?: string[];
  hypervisorIds?: string[];
  steamtoolsIds?: string[];
  architectIds?: string[];
  extraIds?: string[];
}

interface TopGame {
  id: string;
  rank: number;
  name: string;
  bannerUrl: string;
  logoUrl: string;
  symbolUrl: string;
}

interface BestGameSeries {
  id: string;
  category: string;
  images: string[];
  title: string;
}

interface UpcomingGame {
  id: string;
  title: string;
  image: string;
  platform: string;
  price: string;
  icon: string;
  dateAdded?: string;
}

interface SteamAccount {
    username: string;
    password: string;
    games: string;
    status: string;
}

interface MasterGiftAccount {
    name: string;
    url: string;
    logo: string;
    email: string; // or username
    password: string;
    status: string;
}

// --- HELPER FUNCTIONS ---
const getFakeDownloads = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
    const base = Math.abs(hash) % 80000 + 5000; // 5k to 85k
    const daysSince = Math.floor((Date.now() - new Date('2024-01-01').getTime()) / (1000 * 60 * 60 * 24));
    const dailyGrowth = Math.abs(hash) % 50 + 10;
    const total = base + (daysSince * dailyGrowth);
    return total > 1000 ? (total / 1000).toFixed(1) + 'K' : total.toString();
};

const getFakeLikes = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
    const base = Math.abs(hash) % 8000 + 500; // 500 to 8500
    const daysSince = Math.floor((Date.now() - new Date('2024-01-01').getTime()) / (1000 * 60 * 60 * 24));
    const dailyGrowth = Math.abs(hash) % 5 + 1;
    const total = base + (daysSince * dailyGrowth);
    return total > 1000 ? (total / 1000).toFixed(1) + 'K' : total.toString();
};

const getYoutubeEmbedUrl = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}?autoplay=1&rel=0` : url;
};

const formatPlatformDisplay = (platform: string) => {
    if (!platform) return '';
    return platform.replace(/,/g, ' •').toUpperCase();
};

const getPlatformIcon = (platform: string): string => {
    if (!platform) return 'Gamepad2';
    const p = platform.toLowerCase();
    if (p.includes('ps5') || p.includes('playstation')) return 'BrandPlaystation';
    if (p.includes('xbox')) return 'BrandXbox';
    if (p.includes('steam') || p.includes('pc')) return 'BrandSteam';
    if (p.includes('switch') || p.includes('nintendo')) return 'Gamepad';
    return 'Gamepad2';
};

// --- COMPONENTS ---

// Countdown Component for Lockout
const LockoutTimer: React.FC<{ targetTime: number }> = ({ targetTime }) => {
    const { dir, t } = useLanguage();
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const updateTimer = () => {
            const now = Date.now();
            const diff = targetTime - now;
            
            if (diff <= 0) {
                setTimeLeft('00:00:00');
                return;
            }

            const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const m = Math.floor((diff / (1000 * 60)) % 60);
            const s = Math.floor((diff / 1000) % 60);

            setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [targetTime]);

    return (
        <span className="font-mono text-xl font-black text-red-500">{timeLeft}</span>
    );
};

const DisclaimerModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [lang, setLang] = useState<keyof typeof DISCLAIMER_CONTENT>("EN");
  const { dir, t } = useLanguage();
  
  if (!open) return null;

  const content = DISCLAIMER_CONTENT[lang];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      dir={dir} className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 md:backdrop-blur-md p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-red-500/30 flex flex-col max-h-[90vh]"
      >
        <div className="bg-slate-100 dark:bg-slate-950 p-4 border-b border-slate-200 dark:border-slate-800">
           <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {(Object.keys(DISCLAIMER_CONTENT) as Array<keyof typeof DISCLAIMER_CONTENT>).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                    lang === l 
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' 
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {DISCLAIMER_CONTENT[l].label}
                </button>
              ))}
           </div>
        </div>
        <div className="p-6 md:p-8 flex-1 overflow-y-auto">
           <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-2">
                 <Icon name="Shield" size={32} className="text-red-500" />
              </div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight" dir={content.dir || 'ltr'}>
                {content.title}
              </h2>
              <p className="text-sm md:text-base text-slate-900 dark:text-slate-200 leading-relaxed font-medium whitespace-pre-line" dir={content.dir || 'ltr'}>
                {content.text}
              </p>
           </div>
        </div>
        <div className="p-4 md:p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
           <button 
             onClick={onClose}
             className="w-full py-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-red-500/20 transition-all active:scale-95"
           >
             {content.btn}
           </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// STEAM ACCOUNTS MODAL
const SteamAccountsModal: React.FC<{ 
    open: boolean; 
    onClose: () => void; 
    accounts: SteamAccount[];
    isLockedForGuest?: boolean;
    onLoginClick?: () => void;
}> = ({ open, onClose, accounts, isLockedForGuest, onLoginClick }) => {
    const { dir, t } = useLanguage();
    const [copiedIndex, setCopiedIndex] = useState<{idx: number, type: 'user' | 'pass' | 'all'} | null>(null);
    const [revealedPasswords, setRevealedPasswords] = useState<Record<number, boolean>>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'online'>('all');

    const toggleReveal = (idx: number) => {
        setRevealedPasswords(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    const handleCopy = (text: string, idx: number, type: 'user' | 'pass' | 'all') => {
        navigator.clipboard.writeText(text);
        setCopiedIndex({ idx, type });
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const isArabic = dir === 'rtl';

    const filteredAccounts = accounts.filter(acc => {
        const query = searchQuery.trim().toLowerCase();
        const matchesQuery = !query || 
            acc.username.toLowerCase().includes(query) || 
            (acc.games && acc.games.toLowerCase().includes(query));
        
        if (!matchesQuery) return false;
        if (statusFilter === 'online') {
            const st = (acc.status || 'ONLINE').trim().toLowerCase();
            return st !== 'offline' && st !== 'dead';
        }
        return true;
    });

    const onlineCount = accounts.filter(acc => {
        const st = (acc.status || 'ONLINE').trim().toLowerCase();
        return st !== 'offline' && st !== 'dead';
    }).length;

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            dir={dir}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 dark:bg-black/85 backdrop-blur-xl p-3 sm:p-5 md:p-6"
            onClick={onClose}
        >
            <motion.div 
                initial={{ scale: 0.92, y: 24 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.92, y: 24 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white dark:bg-[#0b1120] w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200/90 dark:border-cyan-500/20 flex flex-col max-h-[90vh] sm:max-h-[85vh] relative"
                onClick={e => e.stopPropagation()}
            >
                {/* Steam Cyber Header */}
                <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-[#0f213b] to-[#0a2f58] p-5 sm:p-6 border-b border-slate-800 dark:border-cyan-500/20 shrink-0 text-white">
                    {/* Ambient glow & cyber lines */}
                    <div className="absolute -top-12 -start-12 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute -bottom-10 -end-10 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
                    
                    <div className="relative z-10 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5 sm:gap-4">
                            <div className="relative">
                                <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-blue-600/30 border border-cyan-400/40 flex items-center justify-center shadow-lg shadow-cyan-500/20 backdrop-blur-sm">
                                    <Icon name="BrandSteam" size={26} className="text-cyan-400 sm:w-7 sm:h-7" />
                                </div>
                                <span className="absolute -bottom-1 -end-1 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                                </span>
                            </div>
                            
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 
                                        className="text-lg sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2"
                                        style={{ fontFamily: isArabic ? "'Cairo', 'Amiri', sans-serif" : "'Oswald', sans-serif" }}
                                    >
                                        <span>{t('Free Accounts')}</span>
                                    </h3>
                                    <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                        Steam
                                    </span>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 text-[11px] sm:text-xs text-slate-300 font-medium">
                                    <span className="inline-flex items-center gap-1">
                                        <Icon name="Clock" size={12} className="text-cyan-400" />
                                        {t('Updated Daily')}
                                    </span>
                                    <span className="opacity-40">•</span>
                                    <span className="text-cyan-300 font-bold">
                                        {accounts.length} {t('Available')}
                                    </span>
                                    {onlineCount > 0 && (
                                        <>
                                            <span className="opacity-40">•</span>
                                            <span className="text-emerald-400 font-bold inline-flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                                {onlineCount} {t('Online')}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={onClose} 
                            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white border border-white/10 transition-all active:scale-95 shrink-0"
                            aria-label="Close"
                        >
                            <Icon name="X" size={20} />
                        </button>
                    </div>
                </div>

                {/* Smart Search & Filter Toolbar */}
                {!isLockedForGuest && accounts.length > 0 && (
                    <div className="px-4 sm:px-6 py-3 bg-slate-100/80 dark:bg-[#0d1629] border-b border-slate-200 dark:border-cyan-900/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
                        <div className="relative flex-1">
                            <Icon name="Search" size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder={t('Search accounts or games...')}
                                className="w-full ps-9 pe-8 py-2 rounded-xl bg-white dark:bg-[#070b14] border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 transition-colors"
                            />
                            {searchQuery && (
                                <button 
                                    onClick={() => setSearchQuery('')}
                                    className="absolute end-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                                >
                                    <Icon name="X" size={14} />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                            <button
                                onClick={() => setStatusFilter('all')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                    statusFilter === 'all'
                                        ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                                        : 'bg-white dark:bg-[#070b14] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                                }`}
                            >
                                {t('All Status')}
                            </button>
                            <button
                                onClick={() => setStatusFilter('online')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                    statusFilter === 'online'
                                        ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                                        : 'bg-white dark:bg-[#070b14] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                                }`}
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                {t('Online')}
                            </button>
                        </div>
                    </div>
                )}

                {/* Account List / State Area */}
                <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar bg-slate-50/60 dark:bg-[#0b1120]">
                    {isLockedForGuest ? (
                        <div className="text-center py-10 sm:py-12 px-4 flex flex-col items-center justify-center space-y-5">
                            <div className="relative">
                                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500/20 to-cyan-500/20 border-2 border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/10 backdrop-blur-sm">
                                    <Icon name="Lock" size={36} />
                                </div>
                                <div className="absolute -bottom-1 -end-1 w-7 h-7 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow font-bold text-xs">
                                    !
                                </div>
                            </div>

                            <div className="max-w-md space-y-2">
                                <h4 
                                    className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight"
                                    style={{ fontFamily: isArabic ? "'Cairo', 'Amiri', sans-serif" : "'Oswald', sans-serif" }}
                                >
                                    {t('Gmail Login Required')}
                                </h4>
                                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                    {t('Sign in with Google / Gmail to access Free Accounts and Master Gift rewards. Guest accounts cannot view these credentials.')}
                                </p>
                            </div>

                            <button
                                onClick={onLoginClick}
                                className="group flex items-center justify-center gap-3 px-7 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:via-indigo-500 hover:to-cyan-500 text-white font-black rounded-2xl shadow-xl shadow-blue-500/25 transition-all active:scale-95 text-xs sm:text-sm uppercase tracking-wider"
                            >
                                <svg className="w-5 h-5 shrink-0 bg-white rounded-full p-0.5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                                </svg>
                                <span>{t('Sign in with Google to view accounts')}</span>
                            </button>
                        </div>
                    ) : filteredAccounts.length === 0 ? (
                        <div className="text-center py-12 px-4 flex flex-col items-center justify-center space-y-3">
                            <div className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-slate-800/80 flex items-center justify-center text-slate-400 dark:text-slate-500">
                                <Icon name="Ghost" size={32} />
                            </div>
                            <h5 className="text-base font-bold text-slate-800 dark:text-slate-200">
                                {searchQuery ? t('No matching accounts found') : t('No accounts available right now. Check back later!')}
                            </h5>
                            {searchQuery && (
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {t('Try resetting your search query or filters.')}
                                </p>
                            )}
                        </div>
                    ) : (
                        filteredAccounts.map((acc, idx) => {
                            const statusRaw = acc.status?.toString().trim() || 'ONLINE';
                            const isOffline = statusRaw.toLowerCase() === 'offline' || statusRaw.toLowerCase() === 'dead';
                            const isPassRevealed = Boolean(revealedPasswords[idx]);
                            const isCopiedUser = copiedIndex?.idx === idx && copiedIndex.type === 'user';
                            const isCopiedPass = copiedIndex?.idx === idx && copiedIndex.type === 'pass';
                            const isCopiedAll = copiedIndex?.idx === idx && copiedIndex.type === 'all';

                            return (
                                <div 
                                    key={idx} 
                                    className="bg-white dark:bg-[#111a2d] border border-slate-200/90 dark:border-slate-800/80 hover:border-cyan-500/50 dark:hover:border-cyan-500/40 rounded-2xl p-4 sm:p-5 transition-all shadow-sm hover:shadow-lg hover:shadow-cyan-500/5 group relative"
                                >
                                    {/* Top Bar inside Card */}
                                    <div className="flex items-center justify-between gap-3 mb-4">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 font-black text-xs sm:text-sm flex items-center justify-center">
                                                #{idx + 1}
                                            </div>
                                            <div className={`text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 border ${
                                                isOffline
                                                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                                                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${isOffline ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`}></span>
                                                {statusRaw}
                                            </div>
                                        </div>

                                        {/* 1-Click Copy All Credentials */}
                                        <button
                                            onClick={() => handleCopy(`${acc.username}:${acc.password}`, idx, 'all')}
                                            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all border active:scale-95 ${
                                                isCopiedAll
                                                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                                                    : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-cyan-500/15 text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-300 border-slate-200 dark:border-slate-700'
                                            }`}
                                            title={t('Copy All')}
                                        >
                                            <Icon name={isCopiedAll ? "Check" : "Copy"} size={13} />
                                            <span>{isCopiedAll ? t('Copied!') : t('Copy All')}</span>
                                        </button>
                                    </div>

                                    {/* Credentials Fields */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3.5">
                                        {/* Username Box */}
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 ps-1">
                                                {t('Username')}
                                            </label>
                                            <div className="flex items-center gap-2 p-2 sm:p-2.5 rounded-xl bg-slate-50 dark:bg-[#070c17] border border-slate-200 dark:border-slate-800/90 group-hover:border-cyan-500/30 transition-colors">
                                                <Icon name="User" size={14} className="text-slate-400 shrink-0 ms-1" />
                                                <span className="text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-slate-100 truncate flex-1 select-all">
                                                    {acc.username}
                                                </span>
                                                <button
                                                    onClick={() => handleCopy(acc.username, idx, 'user')}
                                                    className={`p-1.5 rounded-lg transition-all shrink-0 ${
                                                        isCopiedUser 
                                                            ? 'text-emerald-500 bg-emerald-500/10' 
                                                            : 'text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-500/10'
                                                    }`}
                                                    title={t('Copy Username')}
                                                >
                                                    <Icon name={isCopiedUser ? "Check" : "Copy"} size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Password Box */}
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 ps-1">
                                                {t('Password')}
                                            </label>
                                            <div className="flex items-center gap-1.5 p-2 sm:p-2.5 rounded-xl bg-slate-50 dark:bg-[#070c17] border border-slate-200 dark:border-slate-800/90 group-hover:border-cyan-500/30 transition-colors">
                                                <Icon name="Key" size={14} className="text-slate-400 shrink-0 ms-1" />
                                                <span className="text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-slate-100 truncate flex-1">
                                                    {isPassRevealed ? acc.password : '••••••••••••'}
                                                </span>
                                                <button
                                                    onClick={() => toggleReveal(idx)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors shrink-0"
                                                    title={isPassRevealed ? t('Hide Password') : t('Show Password')}
                                                >
                                                    <Icon name={isPassRevealed ? "EyeOff" : "Eye"} size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleCopy(acc.password, idx, 'pass')}
                                                    className={`p-1.5 rounded-lg transition-all shrink-0 ${
                                                        isCopiedPass 
                                                            ? 'text-emerald-500 bg-emerald-500/10' 
                                                            : 'text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-500/10'
                                                    }`}
                                                    title={t('Copy Password')}
                                                >
                                                    <Icon name={isCopiedPass ? "Check" : "Copy"} size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Included Games / Library Tag */}
                                    {acc.games && (
                                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-start gap-2.5">
                                            <div className="w-5 h-5 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                                                <Icon name="Gamepad2" size={12} />
                                            </div>
                                            <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                                <span className="font-bold text-slate-800 dark:text-slate-300">{t('Includes:')} </span>
                                                {acc.games}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer Security Notice */}
                <div className="p-3.5 sm:p-4 bg-slate-100/90 dark:bg-[#070c17] border-t border-slate-200 dark:border-slate-800/80 text-center shrink-0">
                    <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 font-medium inline-flex items-center justify-center gap-1.5">
                        <Icon name="ShieldCheck" size={13} className="text-cyan-500 shrink-0" />
                        <span>{t('Please do not change passwords. These are community accounts.')}</span>
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
};

// MASTER GIFT MODAL
const MasterGiftModal: React.FC<{ 
    open: boolean; 
    onClose: () => void; 
    accounts: MasterGiftAccount[];
    isLockedForGuest?: boolean;
    onLoginClick?: () => void;
}> = ({ open, onClose, accounts, isLockedForGuest, onLoginClick }) => {
    const { dir, t } = useLanguage();
    const [copiedIndex, setCopiedIndex] = useState<{idx: number, type: 'email' | 'pass' | 'all'} | null>(null);
    const [revealedPasswords, setRevealedPasswords] = useState<Record<number, boolean>>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'online'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 4;
    
    const isArabic = dir === 'rtl';

    const toggleReveal = (idx: number) => {
        setRevealedPasswords(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    const handleCopy = (text: string, idx: number, type: 'email' | 'pass' | 'all') => {
        navigator.clipboard.writeText(text);
        setCopiedIndex({ idx, type });
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const filteredAccounts = accounts.filter(acc => {
        const query = searchQuery.trim().toLowerCase();
        const matchesQuery = !query || 
            acc.name.toLowerCase().includes(query) || 
            acc.email.toLowerCase().includes(query) ||
            (acc.url && acc.url.toLowerCase().includes(query));

        if (!matchesQuery) return false;
        if (statusFilter === 'online') {
            const st = (acc.status || 'ONLINE').trim().toLowerCase();
            return st !== 'offline' && st !== 'dead';
        }
        return true;
    });

    const onlineCount = accounts.filter(acc => {
        const st = (acc.status || 'ONLINE').trim().toLowerCase();
        return st !== 'offline' && st !== 'dead';
    }).length;

    const totalPages = Math.max(1, Math.ceil(filteredAccounts.length / ITEMS_PER_PAGE));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const currentAccounts = filteredAccounts.slice((safeCurrentPage - 1) * ITEMS_PER_PAGE, safeCurrentPage * ITEMS_PER_PAGE);

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            dir={dir} 
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 dark:bg-black/85 backdrop-blur-xl p-3 sm:p-5 md:p-6"
            onClick={onClose}
        >
            <motion.div 
                initial={{ scale: 0.92, y: 24 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.92, y: 24 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white dark:bg-[#0f0e17] w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200/90 dark:border-violet-500/20 flex flex-col max-h-[90vh] sm:max-h-[85vh] relative"
                onClick={e => e.stopPropagation()}
            >
                {/* Master Gift Luxury Vibe Header */}
                <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-[#1b1233] to-[#2e1065] p-5 sm:p-6 border-b border-slate-800 dark:border-violet-500/20 shrink-0 text-white">
                    {/* Ambient Vibe Glow Orbs */}
                    <div className="absolute -top-10 -start-10 w-48 h-48 bg-violet-600/30 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute -bottom-10 -end-10 w-48 h-48 bg-fuchsia-600/25 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="relative z-10 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5 sm:gap-4">
                            <div className="relative">
                                <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-amber-400/20 via-violet-600/30 to-fuchsia-600/40 border border-amber-400/40 flex items-center justify-center shadow-lg shadow-violet-500/20 backdrop-blur-sm">
                                    <Icon name="Gift" size={26} className="text-amber-400 sm:w-7 sm:h-7 animate-pulse" />
                                </div>
                                <span className="absolute -bottom-1 -end-1 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400"></span>
                                </span>
                            </div>

                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 
                                        className="text-lg sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2"
                                        style={{ fontFamily: isArabic ? "'Cairo', 'Amiri', sans-serif" : "'Oswald', sans-serif" }}
                                    >
                                        <span>{t('Master Gift')}</span>
                                    </h3>
                                    <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-fuchsia-500/20 text-amber-300 border border-amber-500/30">
                                        VIP
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 text-[11px] sm:text-xs text-slate-300 font-medium">
                                    <span className="inline-flex items-center gap-1 text-violet-200">
                                        <Icon name="Sparkles" size={12} className="text-amber-400" />
                                        {t('Exclusive Premium Accounts')}
                                    </span>
                                    <span className="opacity-40">•</span>
                                    <span className="text-amber-300 font-bold">
                                        {accounts.length} {t('Available')}
                                    </span>
                                    {onlineCount > 0 && (
                                        <>
                                            <span className="opacity-40">•</span>
                                            <span className="text-emerald-400 font-bold inline-flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                                {onlineCount} {t('Online')}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={onClose} 
                            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white border border-white/10 transition-all active:scale-95 shrink-0"
                            aria-label="Close"
                        >
                            <Icon name="X" size={20} />
                        </button>
                    </div>
                </div>

                {/* Smart Search & Filter Toolbar */}
                {!isLockedForGuest && accounts.length > 0 && (
                    <div className="px-4 sm:px-6 py-3 bg-slate-100/80 dark:bg-[#151221] border-b border-slate-200 dark:border-violet-900/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
                        <div className="relative flex-1">
                            <Icon name="Search" size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={e => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder={t('Search gifts by service or email...')}
                                className="w-full ps-9 pe-8 py-2 rounded-xl bg-white dark:bg-[#0b0a11] border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-violet-500 transition-colors"
                            />
                            {searchQuery && (
                                <button 
                                    onClick={() => {
                                        setSearchQuery('');
                                        setCurrentPage(1);
                                    }}
                                    className="absolute end-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                                >
                                    <Icon name="X" size={14} />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                            <button
                                onClick={() => {
                                    setStatusFilter('all');
                                    setCurrentPage(1);
                                }}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                    statusFilter === 'all'
                                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black shadow-sm'
                                        : 'bg-white dark:bg-[#0b0a11] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                                }`}
                            >
                                {t('All Status')}
                            </button>
                            <button
                                onClick={() => {
                                    setStatusFilter('online');
                                    setCurrentPage(1);
                                }}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                    statusFilter === 'online'
                                        ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                                        : 'bg-white dark:bg-[#0b0a11] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                                }`}
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                {t('Online')}
                            </button>
                        </div>
                    </div>
                )}

                {/* Body Area */}
                <div className="p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar bg-slate-50/60 dark:bg-[#0f0e17]">
                    {isLockedForGuest ? (
                        <div className="text-center py-10 sm:py-12 px-4 flex flex-col items-center justify-center space-y-5">
                            <div className="relative">
                                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500/20 to-violet-500/20 border-2 border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xl shadow-violet-500/10 backdrop-blur-sm">
                                    <Icon name="Lock" size={36} />
                                </div>
                                <div className="absolute -bottom-1 -end-1 w-7 h-7 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow font-bold text-xs">
                                    ★
                                </div>
                            </div>

                            <div className="max-w-md space-y-2">
                                <h4 
                                    className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight"
                                    style={{ fontFamily: isArabic ? "'Cairo', 'Amiri', sans-serif" : "'Oswald', sans-serif" }}
                                >
                                    {t('Gmail Login Required')}
                                </h4>
                                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                    {t('Sign in with Google / Gmail to access Free Accounts and Master Gift rewards. Guest accounts cannot view these credentials.')}
                                </p>
                            </div>

                            <button
                                onClick={onLoginClick}
                                className="group flex items-center justify-center gap-3 px-7 py-3.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-600 hover:from-violet-500 hover:via-indigo-500 hover:to-fuchsia-500 text-white font-black rounded-2xl shadow-xl shadow-violet-500/25 transition-all active:scale-95 text-xs sm:text-sm uppercase tracking-wider"
                            >
                                <svg className="w-5 h-5 shrink-0 bg-white rounded-full p-0.5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                                </svg>
                                <span>{t('Sign in with Google to view master gifts')}</span>
                            </button>
                        </div>
                    ) : filteredAccounts.length === 0 ? (
                        <div className="text-center py-12 px-4 flex flex-col items-center justify-center space-y-3">
                            <div className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-slate-800/80 flex items-center justify-center text-slate-400 dark:text-slate-500">
                                <Icon name="Gift" size={32} />
                            </div>
                            <h5 className="text-base font-bold text-slate-800 dark:text-slate-200">
                                {searchQuery ? t('No matching gifts found') : t('No Gifts Right Now')}
                            </h5>
                            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                                {searchQuery ? t('Try resetting your search query or filters.') : t('We continuously restock new premium accounts. Check back later!')}
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full space-y-4">
                            {/* Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {currentAccounts.map((acc, index) => {
                                    const actualIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE + index;
                                    const statusRaw = acc.status?.toString().trim() || 'ONLINE';
                                    const isOffline = statusRaw.toLowerCase() === 'offline' || statusRaw.toLowerCase() === 'dead';
                                    const isPassRevealed = Boolean(revealedPasswords[actualIndex]);
                                    const isCopiedEmail = copiedIndex?.idx === actualIndex && copiedIndex.type === 'email';
                                    const isCopiedPass = copiedIndex?.idx === actualIndex && copiedIndex.type === 'pass';
                                    const isCopiedAll = copiedIndex?.idx === actualIndex && copiedIndex.type === 'all';

                                    return (
                                        <div 
                                            key={actualIndex} 
                                            className="bg-white dark:bg-[#161424] border border-slate-200/90 dark:border-violet-900/30 hover:border-violet-500/50 dark:hover:border-violet-500/50 rounded-2xl p-4 sm:p-5 transition-all shadow-sm hover:shadow-lg hover:shadow-violet-500/10 group flex flex-col relative"
                                        >
                                            {/* Card Top Header */}
                                            <div className="flex items-center justify-between gap-3 mb-3.5">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    {acc.logo ? (
                                                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-800 shrink-0 border border-slate-200 dark:border-zinc-700 shadow-sm flex items-center justify-center p-1">
                                                            <img 
                                                                src={acc.logo} 
                                                                alt={acc.name} 
                                                                className="w-full h-full object-contain" 
                                                                referrerPolicy="no-referrer"
                                                                onError={(e) => { 
                                                                    e.currentTarget.style.display = 'none'; 
                                                                    if (e.currentTarget.parentElement) {
                                                                        e.currentTarget.parentElement.innerHTML = '<span class="text-xs font-black text-violet-500 uppercase">' + acc.name.substring(0, 2) + '</span>'; 
                                                                    }
                                                                }} 
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xs shrink-0 shadow-sm">
                                                            {acc.name.substring(0, 2).toUpperCase()}
                                                        </div>
                                                    )}

                                                    <div className="min-w-0">
                                                        <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white capitalize tracking-tight truncate">
                                                            {acc.name}
                                                        </h4>
                                                        {acc.url && (
                                                            <a 
                                                                href={acc.url} 
                                                                target="_blank" 
                                                                rel="noreferrer" 
                                                                className="text-[11px] text-violet-600 dark:text-violet-400 hover:underline inline-flex items-center gap-1 font-semibold truncate"
                                                            >
                                                                <span>{t('Visit Service')}</span>
                                                                <Icon name="ExternalLink" size={10} className="rtl:rotate-180 shrink-0" />
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0">
                                                    {/* Status Badge */}
                                                    <div className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border flex items-center gap-1 ${
                                                        isOffline 
                                                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' 
                                                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                                    }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${isOffline ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`}></span>
                                                        {statusRaw}
                                                    </div>

                                                    {/* 1-Click Copy All */}
                                                    <button
                                                        onClick={() => handleCopy(`${acc.email}:${acc.password}`, actualIndex, 'all')}
                                                        className={`p-1.5 rounded-xl border text-[10px] font-bold transition-all active:scale-95 flex items-center gap-1 ${
                                                            isCopiedAll
                                                                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-violet-500 border-slate-200 dark:border-slate-700'
                                                        }`}
                                                        title={t('Copy All')}
                                                    >
                                                        <Icon name={isCopiedAll ? "Check" : "Copy"} size={12} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Credentials Fields */}
                                            <div className="space-y-2.5 mt-auto">
                                                {/* Email / Username Field */}
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 ps-1">
                                                        {t('Email / Username')}
                                                    </label>
                                                    <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-[#0c0a13] border border-slate-200 dark:border-violet-950 group-hover:border-violet-500/30 transition-colors">
                                                        <Icon name="Mail" size={14} className="text-slate-400 shrink-0 ms-1" />
                                                        <span className="text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-slate-100 truncate flex-1 select-all">
                                                            {acc.email}
                                                        </span>
                                                        <button 
                                                            onClick={() => handleCopy(acc.email, actualIndex, 'email')}
                                                            className={`p-1.5 rounded-lg transition-all shrink-0 ${
                                                                isCopiedEmail 
                                                                    ? 'text-emerald-500 bg-emerald-500/10' 
                                                                    : 'text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-500/10'
                                                            }`}
                                                            title={t('Copy Email')}
                                                        >
                                                            <Icon name={isCopiedEmail ? "Check" : "Copy"} size={14} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Password Field */}
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 ps-1">
                                                        {t('Password')}
                                                    </label>
                                                    <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-[#0c0a13] border border-slate-200 dark:border-violet-950 group-hover:border-violet-500/30 transition-colors">
                                                        <Icon name="Key" size={14} className="text-slate-400 shrink-0 ms-1" />
                                                        <span className="text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-slate-100 truncate flex-1">
                                                            {isPassRevealed ? acc.password : '••••••••••••'}
                                                        </span>
                                                        <button
                                                            onClick={() => toggleReveal(actualIndex)}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-500/10 transition-colors shrink-0"
                                                            title={isPassRevealed ? t('Hide Password') : t('Show Password')}
                                                        >
                                                            <Icon name={isPassRevealed ? "EyeOff" : "Eye"} size={14} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleCopy(acc.password, actualIndex, 'pass')}
                                                            className={`p-1.5 rounded-lg transition-all shrink-0 ${
                                                                isCopiedPass 
                                                                    ? 'text-emerald-500 bg-emerald-500/10' 
                                                                    : 'text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-500/10'
                                                            }`}
                                                            title={t('Copy Password')}
                                                        >
                                                            <Icon name={isCopiedPass ? "Check" : "Copy"} size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-violet-950 shrink-0">
                                    <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                                        {t('Showing')} <span className="font-bold text-violet-600 dark:text-violet-400">{(safeCurrentPage - 1) * ITEMS_PER_PAGE + 1}</span> {t('to')} <span className="font-bold text-violet-600 dark:text-violet-400">{Math.min(safeCurrentPage * ITEMS_PER_PAGE, filteredAccounts.length)}</span> {t('of')} <span className="font-bold text-violet-600 dark:text-violet-400">{filteredAccounts.length}</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-1.5">
                                        <button 
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={safeCurrentPage === 1}
                                            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#1a1727] hover:bg-slate-200 dark:hover:bg-violet-900/40 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-800 transition-colors text-xs font-bold flex items-center gap-1.5"
                                        >
                                            <Icon name="ChevronLeft" size={14} className="rtl:rotate-180" />
                                            <span>{t('Prev')}</span>
                                        </button>

                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                                                        safeCurrentPage === page 
                                                            ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm' 
                                                            : 'bg-white dark:bg-[#151221] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                        </div>

                                        <button 
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={safeCurrentPage === totalPages}
                                            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#1a1727] hover:bg-slate-200 dark:hover:bg-violet-900/40 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-800 transition-colors text-xs font-bold flex items-center gap-1.5"
                                        >
                                            <span>{t('Next')}</span>
                                            <Icon name="ChevronRight" size={14} className="rtl:rotate-180" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Security Notice */}
                <div className="p-3.5 sm:p-4 bg-slate-100/90 dark:bg-[#0a0910] border-t border-slate-200 dark:border-slate-800/80 text-center shrink-0">
                    <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 font-medium inline-flex items-center justify-center gap-1.5">
                        <Icon name="ShieldCheck" size={13} className="text-violet-500 shrink-0" />
                        <span>{t('Please do not change passwords. These are community accounts.')}</span>
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
};

// REWARD LOGIN MODAL (Gmail Login Required for Free Accounts & Master Gift)
const RewardLoginModal: React.FC<{
  open: boolean;
  onClose: () => void;
  target: 'steam' | 'mastergift' | null;
  onSuccess: () => void;
}> = ({ open, onClose, target, onSuccess }) => {
  const { dir, t } = useLanguage();
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [authDomainError, setAuthDomainError] = useState<string | null>(null);
  const [domainCopied, setDomainCopied] = useState(false);

  if (!open || !target) return null;

  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    setAuthDomainError(null);
    try {
      await signInWithGoogle();
      localStorage.setItem('secret_area_unlocked', 'true');
      localStorage.removeItem('nexa_guest_mode');
      window.dispatchEvent(new Event('authChange'));
      onSuccess();
    } catch (err: any) {
      const isUnauthorized = 
        err?.code === 'auth/unauthorized-domain' || 
        String(err?.message || '').includes('unauthorized-domain');
      if (isUnauthorized) {
        setAuthDomainError(window.location.hostname);
      } else if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
        console.warn('Google sign-in error:', err?.message || err);
      }
    } finally {
      setLoadingGoogle(false);
    }
  };

  const isSteam = target === 'steam';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      dir={dir}
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 md:backdrop-blur-md p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden text-center"
      >
        {/* Glow backdrop accent */}
        <div className="absolute top-0 start-1/2 -translate-x-1/2 w-64 h-32 bg-amber-500/10 dark:bg-amber-500/20 blur-3xl pointer-events-none -z-0"></div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 end-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10"
        >
          <Icon name="X" size={18} />
        </button>

        {/* Header Icon */}
        <div className="relative z-10 flex justify-center mb-4">
          <div className="relative">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl ${
              isSteam 
                ? 'bg-slate-900 text-[#66c0f4] border border-[#2a475e] shadow-blue-500/20' 
                : 'bg-violet-900/80 text-yellow-400 border border-violet-700 shadow-violet-500/20'
            }`}>
              <Icon name={isSteam ? "BrandSteam" : "Gift"} size={32} />
            </div>
            <div className="absolute -bottom-1 -end-1 w-7 h-7 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-md border-2 border-white dark:border-slate-900">
              <Icon name="Lock" size={14} />
            </div>
          </div>
        </div>

        {/* Title and subtitle */}
        <div className="relative z-10 space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[11px] font-bold uppercase tracking-wider">
            <Icon name="Lock" size={12} />
            <span>{t('Exclusive for Registered Members')}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
            {t('Gmail Login Required')}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm mx-auto">
            {t('Sign in with Google / Gmail to access Free Accounts and Master Gift rewards. Guest accounts cannot view these credentials.')}
          </p>
        </div>

        {/* Key perks banner */}
        <div className="relative z-10 mb-6 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-start flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
            <Icon name="CheckCircle" size={18} />
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
            {t('Instant access to daily verified Steam & Master Gift accounts')}
          </p>
        </div>

        {/* Google sign-in button */}
        <div className="relative z-10 space-y-3">
          <button
            onClick={handleGoogleLogin}
            disabled={loadingGoogle}
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/90 text-slate-900 dark:text-white border-2 border-slate-300 dark:border-slate-600 font-black rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-60 text-sm tracking-wide group"
          >
            {loadingGoogle ? (
              <span className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <svg className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
            )}
            <span>{isSteam ? t('Unlock Free Accounts') : t('Unlock Mastergift')}</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            {t('Continue Browsing as Guest')}
          </button>
        </div>

        {/* Auth domain error fallback */}
        {authDomainError && (
          <div className="mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs text-left space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-amber-400">
              <Icon name="AlertTriangle" size={14} />
              <span>Firebase Authorized Domain Required</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Add your preview domain to authorized domains in Firebase Console:
            </p>
            <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-lg border border-white/10 font-mono text-[11px] select-all text-white overflow-x-auto">
              <span className="flex-1 truncate">{authDomainError}</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(authDomainError);
                  setDomainCopied(true);
                  setTimeout(() => setDomainCopied(false), 2000);
                }}
                className="px-2 py-0.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded text-[10px] transition-colors"
              >
                {domainCopied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

const AdBanner: React.FC<{ desktopSrc: string, mobileSrc: string, link: string, className?: string }> = ({ desktopSrc, mobileSrc, link, className }) => {
  const { dir, t } = useLanguage();
  return (
    <a dir={dir} href={link} target="_blank" rel="noreferrer" className={`relative block w-full max-w-[320px] md:max-w-[970px] mx-auto aspect-[32/10] md:aspect-[97/25] group overflow-hidden rounded-2xl transition-all duration-500 bg-slate-100 dark:bg-slate-900/50 ${className || ''}`}>
    {/* Animated glow effect behind the image */}
    <div className="absolute inset-0 bg-gradient-to-r from-primary-500/0 via-primary-500/20 to-primary-500/0 opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-in-out -skew-x-12 z-10 pointer-events-none" />
    
    {/* Sponsored Badge */}
    <div className="absolute top-2 end-2 md:top-3 md:end-3 z-20 flex items-center gap-1.5 bg-black/40 backdrop-blur-md text-white/90 px-2 py-1 rounded-md border border-white/10 text-[9px] md:text-[10px] font-medium tracking-wide transition-all duration-300 group-hover:bg-black/60 shadow-sm">
        <Icon name="Info" size={12} className="text-white/70" />
        <span>{t('Sponsored')}</span>
    </div>

    <picture className="w-full h-full block">
        <source media="(min-width: 768px)" srcSet={desktopSrc} />
        <img src={mobileSrc} alt="Advertisement" className="w-full h-full object-contain transform group-hover:scale-105 md:group-hover:scale-[1.02] transition-transform duration-700" loading="lazy" />
    </picture>
  
  </a>
  );
};

const GameCarousel: React.FC<{ games: UpcomingGame[], loading: boolean, errorState: { missing: boolean, script: boolean } }> = ({ games, loading, errorState }) => {
    const { dir, t } = useLanguage();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [itemsPerView, setItemsPerView] = useState(5);
    const [isHovered, setIsHovered] = useState(false);
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);

    useEffect(() => {
        setCurrentIndex(0);
    }, [games]);

    useEffect(() => {
        const handleResize = () => {
            const w = window.innerWidth;
            if (w < 640) setItemsPerView(1.2); 
            else if (w < 768) setItemsPerView(2.2); 
            else if (w < 1024) setItemsPerView(3.2); 
            else if (w < 1280) setItemsPerView(4.2); 
            else setItemsPerView(5); 
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (isHovered || games.length === 0 || errorState.missing || errorState.script) return;
        const interval = setInterval(() => {
            handleNext();
        }, 3000);
        return () => clearInterval(interval);
    }, [currentIndex, isHovered, games.length, itemsPerView, errorState]);

    const handleNext = () => {
        setCurrentIndex((prev) => {
            const maxIndex = games.length - Math.floor(itemsPerView);
            return prev >= maxIndex ? 0 : prev + 1;
        });
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => {
            const maxIndex = games.length - Math.floor(itemsPerView);
            return prev <= 0 ? maxIndex : prev - 1;
        });
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.targetTouches[0].clientX;
        touchEndX.current = e.targetTouches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.targetTouches[0].clientX;
    };

    const handleTouchEnd = () => {
        if (touchStartX.current - touchEndX.current > 50) handleNext();
        if (touchStartX.current - touchEndX.current < -50) handlePrev();
    };

    if (errorState.missing || errorState.script) {
        return (
            <div className="w-full h-40 flex flex-col items-center justify-center bg-red-50 dark:bg-red-900/10 text-red-500 rounded-2xl border border-red-200 dark:border-red-900/30">
                <Icon name="Bug" size={32} className="mb-2" />
                <span className="text-xs font-bold uppercase tracking-widest">{errorState.script ? t('Script Error') : t('Backend Mismatch')}</span>
                <span className="text-[10px] mt-1 opacity-70">{errorState.script ? t('Invalid API response.') : t('upcoming tab not found.')}</span>
            </div>
        );
    }

    if (loading && games.length === 0) {
        return (
            <div className="w-full h-40 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-2xl">
                <Icon name="Database" size={32} className="mb-2 opacity-50 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest">{t('Syncing Data...')}</span>
            </div>
        );
    }

    if (games.length === 0) {
        return (
            <div className="w-full h-40 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-2xl">
                <Icon name="Ghost" size={32} className="mb-2 opacity-50" />
                <span className="text-xs font-bold uppercase tracking-widest">{t('No Upcoming Games Found')}</span>
            </div>
        );
    }

    return (
        <div 
            className="relative w-full group select-none"
            onMouseEnter={() => setIsHovered(true)} 
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <motion.div 
                    className="flex"
                    animate={{ x: dir === 'rtl' ? `${currentIndex * (100 / itemsPerView)}%` : `-${currentIndex * (100 / itemsPerView)}%` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                    {games.map((game, idx) => (
                        <div 
                            key={`${game.id}-${idx}`}
                            style={{ width: `${100 / itemsPerView}%` }}
                            className="flex-shrink-0 p-1"
                        >
                            <div className="relative aspect-[3/4] bg-slate-200 dark:bg-slate-900 rounded-xl overflow-hidden group/card shadow-sm hover:shadow-lg transition-all duration-300">
                                <img 
                                    src={game.image} 
                                    alt={game.title} 
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover/card:opacity-90 transition-opacity"></div>
                                <div className="absolute bottom-0 start-0 end-0 p-3 z-20">
                                    <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/20 md:backdrop-blur-md border border-white/10 mb-1.5 max-w-full">
                                        <Icon name={game.icon} size={10} className="text-white shrink-0" />
                                        <span className="text-[8px] font-bold text-white uppercase tracking-wider truncate">
                                            {formatPlatformDisplay(game.platform)}
                                        </span>
                                    </div>
                                    <h3 className="font-black text-xs md:text-sm text-white leading-tight line-clamp-2 drop-shadow-md group-hover/card:text-primary-400 transition-colors">
                                        {game.title}
                                    </h3>
                                    <div className="mt-1 flex justify-between items-center">
                                        <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-[10px] drop-shadow-md bg-black/40 px-1.5 rounded">
                                            {game.price}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 start-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block">
                <button onClick={handlePrev} className="p-2 rounded-full bg-white/90 dark:bg-black/90 text-slate-900 dark:text-white shadow-lg hover:scale-110 transition-transform">
                    <Icon name="ChevronLeft" size={20} className="rtl:rotate-180" />
                </button>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 end-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block">
                <button onClick={handleNext} className="p-2 rounded-full bg-white/90 dark:bg-black/90 text-slate-900 dark:text-white shadow-lg hover:scale-110 transition-transform">
                    <Icon name="ChevronRight" size={20} className="rtl:rotate-180" />
                </button>
            </div>
        </div>
    );
};

const RecentProductsCarousel: React.FC<{
    items: ResourceItem[],
    loading: boolean,
    onSelect: (item: ResourceItem) => void,
    stash: string[],
    toggleStash: (id: string, e?: React.MouseEvent) => void
}> = ({ items, loading, onSelect, stash, toggleStash }) => {
    const { dir, t } = useLanguage();
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const clientWidth = scrollRef.current.clientWidth;
            // Scroll by roughly 80% of the container width to show the next set
            const isRTL = dir === 'rtl';
            const multiplier = isRTL ? -1 : 1;
            const scrollAmount = direction === 'left' ? -clientWidth * 0.8 * multiplier : clientWidth * 0.8 * multiplier;
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    if (loading && items.length === 0) {
        return (
            <div className="w-full h-56 flex flex-col items-center justify-center bg-slate-100/50 dark:bg-slate-900/50 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm">
                <Icon name="Loader2" size={32} className="mb-3 text-emerald-900 dark:text-emerald-500 animate-spin" />
                <span className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{t('Curating Recent Products...')}</span>
            </div>
        );
    }

    if (items.length === 0) return null;

    return (
        <div className="relative w-full group select-none">
            {/* Desktop Navigation Arrows */}
            <div className="absolute top-1/2 -translate-y-1/2 -start-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block">
                <button onClick={() => scroll('left')} className="p-3 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white shadow-xl shadow-black/10 hover:scale-110 transition-transform border border-slate-200 dark:border-slate-800">
                    <Icon name="ChevronLeft" size={24} className="rtl:rotate-180" />
                </button>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 -end-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block">
                <button onClick={() => scroll('right')} className="p-3 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white shadow-xl shadow-black/10 hover:scale-110 transition-transform border border-slate-200 dark:border-slate-800">
                    <Icon name="ChevronRight" size={24} className="rtl:rotate-180" />
                </button>
            </div>

            {/* Scroll Container */}
            <div 
                ref={scrollRef}
                className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-6 pt-2 px-2 -mx-2"
                style={{ scrollBehavior: 'smooth' }}
            >
                {items.map((item, idx) => (
                    <motion.div 
                        key={`${item.id}-${idx}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05, duration: 0.4 }}
                        className="snap-start shrink-0 w-[260px] sm:w-[280px] md:w-[320px]"
                    >
                        <div 
                            onClick={() => onSelect(item)}
                            className="relative aspect-[4/5] bg-slate-200 dark:bg-slate-900 rounded-2xl overflow-hidden group/card shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50"
                        >
                            <img 
                                src={item.coverImage} 
                                alt={item.name} 
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
                                loading="lazy"
                            />
                            
                            {/* Rich Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent opacity-80 group-hover/card:opacity-100 transition-opacity duration-500" />
                            
                            {/* Top Badges Area */}
                            <div className="absolute top-3 start-3 end-3 flex justify-between items-start z-20">
                                <div className="flex flex-col gap-1.5 items-start">
                                    <div className="px-2.5 py-1 bg-emerald-500/90 backdrop-blur-md text-white rounded-lg text-[10px] font-black uppercase tracking-wider shadow-lg">
                                        {item.category === 'steamtools' ? t('steamtools') : item.category === 'extra' ? t('savegames') : t(item.category).toUpperCase()}
                                    </div>
                                    {item.isFree && (
                                        <div className="px-2.5 py-1 bg-amber-500/90 backdrop-blur-md text-white rounded-lg text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1">
                                            <Icon name="Gift" size={10} /> {t('Free')}
                                        </div>
                                    )}
                                    {item.category === 'game' && ((item.links?.ankerParts && item.links.ankerParts.length > 0) || (item.links?.preInstalled?.download || item.links?.preInstalled?.cloudDrop || item.links?.preInstalled?.torrent)) && (
                                        <div className="px-2 py-1 bg-indigo-500/90 backdrop-blur-md text-white rounded-lg text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1">
                                            <Icon name="Zap" size={10} /> {t('Pre-installed')}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleStash(item.id, e); }}
                                    className={`p-2 rounded-xl backdrop-blur-md transition-all ${
                                        stash.includes(item.id) 
                                         ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' 
                                         : 'bg-black/40 text-white/70 hover:bg-white/20 hover:text-white border border-white/10'
                                    }`}
                                    title={stash.includes(item.id) ? t('Remove from Favorites') : t('Add to Favorites')}
                                >
                                    <Icon name="Bookmark" size={16} className={stash.includes(item.id) ? "fill-current" : ""} />
                                </button>
                            </div>


                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};



const GenreDetailView: React.FC<{ 
    genre: string, 
    games: ResourceItem[], 
    onBack: () => void,
    onSelect: (item: ResourceItem) => void,
    stash: string[],
    toggleStash: (id: string, e?: React.MouseEvent) => void
}> = ({ genre, games, onBack, onSelect, stash, toggleStash }) => {
    const { dir, t } = useLanguage();
    // Filter games by genre
    const filteredGames = useMemo(() => {
        return games.filter(g => g.genres && g.genres.toLowerCase().includes(genre.toLowerCase()));
    }, [games, genre]);
    
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 24;
    
    useEffect(() => {
        setCurrentPage(1);
    }, [genre]);
    
    const totalPages = Math.ceil(filteredGames.length / itemsPerPage);
    const currentGames = filteredGames.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="w-full min-h-screen pt-16 pb-32">
            <Helmet>
                <link href="https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap" rel="stylesheet" />
            </Helmet>
            
            <AnimatedGenreHero genre={genre} games={filteredGames} onBack={onBack} />
            <div className="px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto mt-8">

            {filteredGames.length === 0 ? (
                <div className="w-full h-64 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                    <Icon name="Search" size={48} className="mb-4 text-slate-400" />
                    <h3 className="text-xl font-bold text-slate-600 dark:text-slate-300">{t('No games found')}</h3>
                    <p className="text-slate-500">{t('Could not find any games matching this genre.')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                    {currentGames.map((item, idx) => (
                        <div 
                            key={`${item.id}-${idx}`}
                            onClick={() => onSelect(item)}
                            className="relative aspect-[3/4] bg-slate-200 dark:bg-slate-900 rounded-2xl overflow-hidden group shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50"
                        >
                            <img 
                                src={item.coverImage} 
                                alt={item.name} 
                                className="absolute inset-0 w-full h-full object-cover"
                                loading="lazy"
                            />
                            
                            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                            
                            <div className="absolute top-3 start-3 end-3 flex justify-between items-start z-20">

                                <div className="flex flex-col gap-1.5 items-start">
                                    <div className="px-2.5 py-1 bg-emerald-500/90 backdrop-blur-md text-white rounded-lg text-[10px] font-black uppercase tracking-wider shadow-lg">
                                        {item.category === 'steamtools' ? t('steamtools') : item.category === 'extra' ? t('savegames') : t(item.category).toUpperCase()}
                                    </div>
                                    {item.isFree && (
                                        <div className="px-2.5 py-1 bg-amber-500/90 backdrop-blur-md text-white rounded-lg text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1">
                                            <Icon name="Gift" size={10} /> {t('Free')}
                                        </div>
                                    )}
                                    {item.category === 'game' && ((item.links?.ankerParts && item.links.ankerParts.length > 0) || (item.links?.preInstalled?.download || item.links?.preInstalled?.cloudDrop || item.links?.preInstalled?.torrent)) && (
                                        <div className="px-2 py-1 bg-indigo-500/90 backdrop-blur-md text-white rounded-lg text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1">
                                            <Icon name="Zap" size={10} /> {t('Pre-installed')}
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleStash(item.id, e); }}
                                    className={`p-1.5 sm:p-2 rounded-lg backdrop-blur-md transition-all ${
                                        stash.includes(item.id) 
                                         ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' 
                                         : 'bg-black/40 text-white/70 hover:bg-white/20 hover:text-white border border-white/10'
                                    }`}
                                    title={stash.includes(item.id) ? t('Remove from Favorites') : t('Add to Favorites')}
                                >
                                    <Icon name="Bookmark" size={14} className={stash.includes(item.id) ? "fill-current" : ""} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center gap-4">
                    <button
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="p-2 sm:p-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-slate-300 dark:border-slate-700"
                    >
                        <Icon name="ChevronLeft" size={20} className="rtl:rotate-180" />
                    </button>
                    
                    <div className="flex gap-2">
                        {Array.from({ length: totalPages }).map((_, i) => {
                            const page = i + 1;
                            // Show first, last, current, and +/- 2 pages around current
                            if (
                                page === 1 || 
                                page === totalPages || 
                                Math.abs(page - currentPage) <= 2
                            ) {
                                return (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl font-bold transition-colors border ${
                                            currentPage === page
                                                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                                                : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                );
                            } else if (
                                page === currentPage - 3 ||
                                page === currentPage + 3
                            ) {
                                return <span key={page} className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-slate-500">...</span>;
                            }
                            return null;
                        })}
                    </div>
                    
                    <button
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 sm:p-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-slate-300 dark:border-slate-700"
                    >
                        <Icon name="ChevronRight" size={20} className="rtl:rotate-180" />
                    </button>
                </div>
            )}
            </div>
        </div>
    );
};


const AboutSecretAreaSection: React.FC = () => {
    const { dir, t } = useLanguage();
    
    return (
        <div className="w-full relative mt-6 mb-16 overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xl dark:shadow-2xl transition-colors duration-300">
            {/* Background Base */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-r from-white via-slate-50 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20 transition-colors duration-300"></div>
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-900/10 dark:from-blue-900/20 via-transparent to-transparent opacity-50"></div>
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between p-8 sm:p-12 lg:p-16 gap-12" dir={dir}>
                {/* Left Side: Content */}
                <div className="w-full lg:w-1/2 flex flex-col text-start space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest w-max mb-2 transition-colors duration-300">
                        <Icon name="Info" size={14} />
                        <span>{t("What's SecretArea?")}</span>
                    </div>
                    
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-tight transition-colors duration-300" style={{ fontFamily: "'Nexa', 'Inter', sans-serif" }}>
                        {t('The idea behind')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">{t('SecretArea')}</span>
                    </h2>
                    
                    <div className="space-y-4 text-sm sm:text-base text-black dark:text-white font-medium leading-relaxed transition-colors duration-300">
                        <p>{t('SecretArea is all about bringing together the best and most popular games in one place — not every game, but only the ones that are worth your time and are actually good.')}</p>
                        <p>{t('We focus on games from trusted sources, with no annoying ads and no viruses. We’re also gamers ourselves, and we created SecretArea because we used to spend too much time searching for good games instead of actually playing them.')}</p>
                        <p>{t('Our goal is simple: bring the best games together in one place, so you can spend less time searching and more time playing.')}</p>
                    </div>

                    {/* Progress Bars */}
                    <div className="mt-6 space-y-5 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/50 backdrop-blur-sm transition-colors duration-300">
                        {/* FitGirl */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold uppercase tracking-wide">
                                <span className="text-emerald-600 dark:text-emerald-400">FitGirl Repack</span>
                                <span className="text-emerald-600 dark:text-emerald-400">90%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden transition-colors duration-300">
                                <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full w-0 animate-[fillProgress_1.5s_ease-out_forwards]" style={{ '--target-width': '90%' } as React.CSSProperties}></div>
                            </div>
                        </div>
                        {/* Ankergames */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold uppercase tracking-wide">
                                <span className="text-blue-600 dark:text-blue-400">Ankergames</span>
                                <span className="text-blue-600 dark:text-blue-400">10%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden transition-colors duration-300">
                                <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full w-0 animate-[fillProgress_1.5s_ease-out_forwards_0.3s]" style={{ '--target-width': '10%' } as React.CSSProperties}></div>
                            </div>
                        </div>
                        {/* Dodi */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold uppercase tracking-wide">
                                <span className="text-red-600 dark:text-red-400">Dodi Repack <span className="text-slate-500 dark:text-slate-400 lowercase normal-case">({t('he use Ads')})</span></span>
                                <span className="text-red-600 dark:text-red-400">0%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden transition-colors duration-300">
                                <div className="h-full bg-red-500 rounded-full w-0"></div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button 
                            onClick={() => {
                                const el = document.getElementById('popular-repacks-section');
                                if (el) {
                                    const y = el.getBoundingClientRect().top + window.scrollY - 100;
                                    window.scrollTo({ top: y, behavior: 'smooth' });
                                }
                            }}
                            className="px-6 py-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-black text-sm uppercase tracking-widest rounded-xl shadow-lg transition-all transform hover:-translate-y-1 flex items-center gap-3 w-full sm:w-auto justify-center"
                        >
                            <Icon name="TrendingUp" size={18} />
                            {t('Most popular repacks')}
                        </button>
                    </div>
                </div>

                {/* Right Side: Image */}
                <div className="w-full lg:w-1/2 flex justify-center items-center">
                    <img 
                        src="/images/banner 03.png" 
                        alt="SecretArea Idea" 
                        className="w-full h-auto object-contain max-h-[500px] lg:max-h-[800px] drop-shadow-2xl hover:scale-105 transition-transform duration-700 ease-out"
                        style={{ maxWidth: '1530px' }}
                    />
                </div>
            </div>
        </div>
    );
};



const FreeTimeTopStudiosSection: React.FC<{
    profiles: CompanyProfile[],
    onOpenAllStudios: () => void
}> = ({ profiles, onOpenAllStudios }) => {
    const { dir, t } = useLanguage();

    const topStudios = React.useMemo(() => {
        return profiles
            .map(profile => {
                const totalCount = (profile.gameIds?.length || 0) + 
                                   (profile.hypervisorIds?.length || 0) + 
                                   (profile.steamtoolsIds?.length || 0);
                return { ...profile, totalCount };
            })
            .sort((a, b) => b.totalCount - a.totalCount)
            .slice(0, 6);
    }, [profiles]);

    return (
        <div className="w-full relative mt-16 mb-24 overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xl dark:shadow-2xl transition-colors duration-300">
            {/* Background Base */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-white to-blue-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/20 transition-colors duration-300"></div>
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-900/10 dark:from-indigo-900/20 via-transparent to-transparent opacity-50"></div>
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between p-8 sm:p-12 lg:p-16 gap-12" dir={dir}>
                {/* Left Side: Content */}
                <div className="w-full lg:w-1/2 flex flex-col text-start space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest w-max mb-2 transition-colors duration-300">
                        <Icon name="Gamepad2" size={14} />
                        <span>{t("Top Studios")}</span>
                    </div>
                    
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-tight transition-colors duration-300" style={{ fontFamily: "'Nexa', 'Inter', sans-serif" }}>
                        {t('Your Free Time Called.')}
                    </h2>
                    
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-700 dark:text-slate-200 transition-colors duration-300">
                        {t('We brought the best games from the best studios.')}
                    </h3>
                    
                    <div className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium leading-relaxed transition-colors duration-300">
                        <p>{t('Why waste hours searching when we’ve already done it for you? We handpicked some of the best and most popular games from the best game studios, so you can skip the searching and get straight to playing. 🎮😎')}</p>
                    </div>

                    {/* Top 6 Studios Animation/Grid */}
                    <div className="mt-6 grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
                        {topStudios.map((studio, index) => (
                            <div 
                                key={studio.id} 
                                className="group flex flex-col items-center justify-center p-3 sm:p-4 bg-slate-100 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-300 shadow-sm hover:shadow-md animate-[fadeInUp_0.5s_ease-out_forwards]"
                                style={{ animationDelay: `${index * 0.1}s`, opacity: 0 }}
                            >
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center p-2 mb-2 shadow-inner group-hover:scale-110 transition-transform duration-300">
                                    {studio.logoUrl ? (
                                        <img src={studio.logoUrl} alt={studio.name} className="w-full h-full object-contain filter dark:brightness-110" />
                                    ) : (
                                        <span className="font-bold text-slate-400 dark:text-slate-500 text-xs uppercase">{studio.name.substring(0,2)}</span>
                                    )}
                                </div>
                                <div className="text-center w-full">
                                    <div className="text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 truncate w-full">{studio.name}</div>
                                    <div className="text-[9px] sm:text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">{studio.totalCount} {t('Games')}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-4">
                        <button 
                            onClick={onOpenAllStudios}
                            className="px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm uppercase tracking-widest rounded-xl shadow-[0_0_30px_rgba(79,70,229,0.3)] hover:shadow-[0_0_40px_rgba(79,70,229,0.5)] transition-all transform hover:-translate-y-1 flex items-center gap-3 w-full sm:w-auto justify-center"
                        >
                            <Icon name="Trophy" size={18} />
                            {t('Top Studios')}
                        </button>
                    </div>
                </div>

                {/* Right Side: Image */}
                <div className="w-full lg:w-1/2 flex justify-center items-center">
                    <img 
                        src="/images/hero01.png" 
                        alt="Your Free Time Called" 
                        className="w-full h-auto object-contain max-h-[500px] lg:max-h-[800px] drop-shadow-2xl hover:scale-105 transition-transform duration-700 ease-out"
                        style={{ maxWidth: '1530px' }}
                    />
                </div>
            </div>
        </div>
    );
};


const FeaturedGenres: React.FC<{ games: ResourceItem[], onSelectGenre: (genre: string) => void }> = ({ games, onSelectGenre }) => {
    const { dir, t } = useLanguage();
    // Extract and sort unique genres
    const genres = useMemo(() => {
        const set = new Set<string>();
        games.forEach(g => {
            if (g.genres) {
                g.genres.split(',').map(s => s.trim()).filter(Boolean).forEach(genre => set.add(genre));
            }
        });
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [games]);

    // Group by first letter
    const grouped = useMemo(() => {
        const groups: { [key: string]: string[] } = {};
        genres.forEach(g => {
            const letter = g[0].toUpperCase();
            if (!groups[letter]) groups[letter] = [];
            groups[letter].push(g);
        });
        return groups;
    }, [genres]);

    const [showAll, setShowAll] = useState(false);

    // If not showing all, only show a few groups to make it look like the screenshot (e.g. 6-9 groups)
    const displayGroups = showAll ? Object.keys(grouped) : Object.keys(grouped).slice(0, 9);

    if (genres.length === 0) return null;

    return (
        <div dir={dir} className="w-full text-slate-900 dark:text-white relative overflow-visible">
            {/* Background Accent */}
            <div className="absolute top-0 end-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none -me-20 -mt-20"></div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-end gap-6 mb-12 border-b border-slate-200 dark:border-slate-800 pb-6">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-3">
                        {t('Featured Genres')}</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base">{t('Curated categories from your navigation menu.')}</p>
                </div>
                {Object.keys(grouped).length > 9 && (
                    <button 
                        onClick={() => setShowAll(!showAll)}
                        className="px-6 py-2.5 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/50 text-blue-700 dark:text-blue-300 font-medium rounded-full transition-colors border border-blue-200 dark:border-blue-800/50 text-sm flex items-center gap-2 self-start md:self-auto"
                    >
                        {showAll ? t('Show Less') : t('Show All')} <Icon name={showAll ? "ChevronUp" : "ChevronDown"} size={16} />
                    </button>
                )}
            </div>

            <div className={`relative z-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12 ${showAll ? 'max-h-[600px] overflow-y-auto pe-2 custom-scrollbar' : ''}`}>
               {showAll && (
                  <style dangerouslySetInnerHTML={{__html: `
                     .custom-scrollbar::-webkit-scrollbar {
                        width: 6px;
                     }
                     .custom-scrollbar::-webkit-scrollbar-track {
                        background: rgba(148, 163, 184, 0.1);
                        border-radius: 4px;
                     }
                     .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: rgba(59, 130, 246, 0.5);
                        border-radius: 4px;
                     }
                     .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: rgba(59, 130, 246, 0.8);
                     }
                  `}} />
               )}

                {displayGroups.map(letter => (
                    <div key={letter} className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-500 font-black tracking-widest text-sm uppercase">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400">
                                {letter}
                            </span> 
                            {t('GENRES')}</div>
                        <ul className="flex flex-col gap-3">
                            {grouped[letter].map(genre => (
                                <li key={genre}>
                                    <button 
                                        onClick={() => onSelectGenre(genre)}
                                        className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 font-medium text-sm md:text-base transition-colors text-start"
                                    >
                                        {genre}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};

const UpcomingListsDisplay: React.FC<{ lists: { [key: string]: string[] } }> = ({ lists }) => {
    const { dir, t } = useLanguage();
    const [activeCategory, setActiveCategory] = useState<string>('game');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 10;
    const tabs = ['game', 'hypervisor', 'steamtools', 'tools', 'savegames'];
    
    const handleCategoryChange = (tab: string) => {
        setActiveCategory(tab);
        setCurrentPage(1);
    };

    const getBgImage = (category: string) => {
        switch (category) {
            case 'game':
            case 'hypervisor':
                return 'https://webvator.com/wp-content/uploads/2025/10/1712163651504.jpg';
            case 'steamtools':
                return 'https://cdn.fastly.steamstatic.com/store/home/store_home_share.jpg';
            case 'tools':
                return 'https://img.magnific.com/premium-photo/hacker-guy-black-clothes-wearing-mask-with-laptop-funny-comic-3d-illustration-white_926199-4299052.jpg';
            case 'savegames':
                return 'https://www.coordinated.com/hubfs/Blog%20Images/bigstock--191129032.jpg';
            default:
                return 'https://webvator.com/wp-content/uploads/2025/10/1712163651504.jpg';
        }
    };

    const fullList = lists[activeCategory] || [];
    const totalPages = Math.ceil(fullList.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const activeList = fullList.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="w-full relative overflow-hidden transition-colors mt-8 mb-12">
            {/* Faded Background Image */}
            <div className="absolute top-0 end-0 bottom-0 w-full md:w-2/3 pointer-events-none opacity-20 dark:opacity-10 transition-opacity duration-500">
                <motion.img 
                    key={activeCategory}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    src={getBgImage(activeCategory)} 
                    alt={`${activeCategory} Background`} 
                    className="w-full h-full object-contain md:object-right"
                    style={{ maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)', WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)' }}
                />
            </div>
            
            <div className="relative z-10">
                <h3 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest mb-2 flex flex-wrap items-center gap-2 sm:gap-3">
                    {t('UPCOMING')} <span className="text-emerald-900 dark:text-emerald-500 dark:text-emerald-700 dark:text-emerald-400">{t('RELEASES')}</span>
                </h3>
                <div className="flex items-center gap-4 text-xs font-bold text-slate-800 dark:text-slate-500 mb-6 sm:mb-8 uppercase tracking-widest">
                    <span>{new Date().toLocaleDateString('en-GB', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>

                {/* Category Tabs */}
                <div className="flex flex-wrap items-center gap-2 mb-6">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => handleCategoryChange(tab)}
                            className={`px-3 py-1.5 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all shadow-sm border ${
                                activeCategory === tab 
                                ? 'bg-emerald-500 text-white border-emerald-500 scale-105' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                        >
                            {t(tab.toUpperCase())}
                        </button>
                    ))}
                </div>

                {/* List Items */}
                <div className="space-y-2 sm:space-y-3 min-h-[300px]">
                    {activeList.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-slate-800 dark:text-slate-600 text-sm italic py-8"
                        >
                            {t('No upcoming')} {t(activeCategory)} {t('listed.')}
                        </motion.div>
                    ) : (
                        activeList.map((item, idx) => {
                            const hasArrow = item.trim().startsWith('---') || item.trim().startsWith('->');
                            const displayItem = hasArrow ? item.replace(/^[-]+>*\s*/, '') : item;
                            
                            const isTop5 = idx < 5;
                            const textColor = isTop5 
                                ? "text-emerald-600 dark:text-emerald-700 dark:text-emerald-400" 
                                : "text-blue-600 dark:text-blue-400";
                            const arrowColor = isTop5
                                ? "text-emerald-900 dark:text-emerald-500 dark:text-emerald-700 dark:text-emerald-400"
                                : "text-blue-500 dark:text-blue-400";

                            return (
                                <motion.div 
                                    key={`${activeCategory}-${currentPage}-${idx}`} 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                                    className="flex items-start gap-2 sm:gap-3 group"
                                >
                                    <span className={`${arrowColor} font-mono text-xs sm:text-sm tracking-tighter mt-1 opacity-70 group-hover:opacity-100 transition-opacity`}>---&gt;</span>
                                    <span className={`${textColor} font-bold text-sm sm:text-base md:text-lg leading-snug tracking-tight drop-shadow-sm group-hover:brightness-125 transition-all`}>
                                        {displayItem}
                                    </span>
                                </motion.div>
                            );
                        })
                    )}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-8 pt-6 border-t border-slate-200/50 dark:border-slate-800/50">
                        <button 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <Icon name="ChevronLeft" size={20} className="rtl:rotate-180" />
                        </button>
                        <div className="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                            {t('PAGE')} {currentPage} {t('OF')} {totalPages}
                        </div>
                        <button 
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <Icon name="ChevronRight" size={20} className="rtl:rotate-180" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const HypervisorGuideModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { t } = useLanguage();
  if (!open) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[400] flex items-center justify-center bg-black/90 md:backdrop-blur-md p-4"
      onClick={(e) => { e.stopPropagation(); onClose(); }}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white dark:bg-slate-900 w-full h-full max-w-5xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-4">
            <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors font-bold text-sm">
              <Icon name="ArrowLeft" size={16} /> Back to Product
            </button>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
              <Icon name="ShieldAlert" size={28} className="text-red-500" />
              Hypervisor Guide
            </h2>
          </div>
          <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
            <Icon name="X" size={24} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 prose dark:prose-invert max-w-none text-slate-900 dark:text-slate-200">
          <article id="post-74689" className="post-74689 page type-page status-publish hentry">
            <div className="entry-content space-y-4">
              <p><span style={{ color: 'red' }} className="font-bold">This page is a work-in-progress and will be updated.</span></p>
              <p>This article is partially based on RessourectoR’s (admin of cs.rin.ru site) article:</p>
              <p><a href="https://cs.rin.ru/forum/viewtopic.php?f=10&amp;t=156407" target="_blank" style={{ fontSize: '20px' }} rel="noopener" className="text-blue-500 hover:underline break-all">https://cs.rin.ru/forum/viewtopic.php?f=10&amp;t=156407</a></p>
              <p>I highly recommend to open and read it at least one time. It’s more complex than this page and covers more security topics.</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-6 mb-3">What are Hypervisor Cracks?</h3>
              <p>Denuvo Hypervisor Crack or Bypass refers to advanced techniques that leverage virtualization at a very low level (often using a custom or modified hypervisor) to interfere with how the protection monitors the system. Denuvo relies heavily on integrity checks, timing analysis, and detection of debugging or emulation environments. A hypervisor-based approach allows an attacker to sit “under” the operating system, transparently controlling CPU behavior, intercepting instructions, and masking signs of analysis without modifying the protected executable directly.</p>
              <p>Instead of patching the game binary, the hypervisor can emulate or alter specific CPU instructions, fake timing results, or hide breakpoints and memory changes, effectively tricking Denuvo into believing everything is running on a normal, untampered system. This makes the protection much harder to detect or react to, since its checks are being handled outside its visibility. These methods are extremely complex and are typically explored by highly skilled reverse engineers, as they require deep knowledge of CPU virtualization, kernel internals, and anti-tamper mechanisms.</p>
              <p>Officially, only signed drivers can work at such low level. Due to the piracy nature of Denuvo Hypervisor drivers, they will never receive Microsoft-approved certificate. And that’s why to use such “cracks” you need to make certain modifications to your system security settings, listed below. Please note, that those changes are intended to be made temporary, for the course of your gameplay session and then should be reverted after you quit the game.</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-6 mb-3">{t('Windows virtualization-based security components')}</h3>
              <p>On modern systems with Secure Boot, TPM 2.0 and hardware-assisted virtualization capabilities, Windows 10 and 11 enable, mostly* by default, various security solutions via Virtualization-based Security (VBS). VBS is an umbrella term for using a bare-metal hypervisor, the Windows hypervisor, to create isolated virtual spaces that are safe from even a fully compromised OS, in which these security components run and monitor the OS or store confidential information.</p>
              <p>The following Windows components are such security solutions:</p>
              <ul className="list-disc ps-6 space-y-2">
                <li><a href="https://learn.microsoft.com/en-us/windows/security/hardware-security/enable-virtualization-based-protection-of-code-integrity" target="_blank" rel="noopener" className="text-blue-500 hover:underline">Memory Integrity (HVCI)</a>: Runs checks to detect malicious or at least unexpected modifications of Windows kernel code and restricts suspicious kernel memory allocations. For example, RessourectoR imagines this could protect against malicious software that is being run with administrative privileges and attempts to modify system files, or against memory security vulnerabilities in user-run applications.</li>
                <li><a href="https://learn.microsoft.com/en-us/windows-hardware/design/device-experiences/oem-credential-guard" target="_blank" rel="noopener" className="text-blue-500 hover:underline">Credential Guard</a>: Stores access credentials, such as passwords, authentication data, biometric data etc. in an isolated environment.</li>
                <li><a href="https://learn.microsoft.com/en-us/windows-hardware/design/device-experiences/windows-hello" target="_blank" rel="noopener" className="text-blue-500 hover:underline">Windows Hello</a>: Allows you to log in with convenient methods like a short PIN, facial recognition or fingerprint scan. RessourectoR has not found a direct source for this, but it probably prefers Credential Guard to store its highly sensitive data. The login methods it provides tend to break when some of the components above are disabled. It is also protected by System Guard, if that is enabled.</li>
                <li><a href="https://learn.microsoft.com/en-us/windows/security/hardware-security/how-hardware-based-root-of-trust-helps-protect-windows" target="_blank" rel="noopener" className="text-blue-500 hover:underline">System Guard (Secure Launch)</a>: An advanced system hardening framework that protects the OS boot process and <a href="https://en.wikipedia.org/wiki/System_Management_Mode" target="_blank" rel="noopener" className="text-blue-500 hover:underline">System Management Mode</a> (SMM, commonly used by the BIOS to run hardware configuration software) from (arguably sophisticated) rootkits. Such rootkits could compromise the hypervisor itself, so this protection is assisted by various hardware security features of modern processors. Backed by TPM 2.0, this also allows to monitor system integrity, including the other security components mentioned here, after boot continuously and verify it from a remote system.</li>
                <li>From what RessourectoR could find, this is cutting edge and not enabled by default.</li>
              </ul>
              <p>* Even though hardware and boot requirements are met, Windows sometimes seems to fail at enabling features that are supposed to be enabled automatically, such as VBS and memority integrity.</p>
              <p className="font-bold mt-4">Without the Windows hypervisor, none of these security features can be used. By design, the hypervisor cannot be disabled directly. Instead, all the above features that want to utilize VBS signal that it needs to be enabled, which then loads the hypervisor. Therefore, we must disable all those features to prevent the Windows hypervisor from being loaded.</p>
              <p className="font-bold">A boot option that prevents Hyper-V from loading the hypervisor also needs to be added.</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-6 mb-3">I want to play that new Denuvo-protected game, is it safe to disable all this and use a hypervisor crack?</h3>
              <p>There is no simple answer. This is RessourectoR’s personal take as someone with 10 years of experience in security-focused system administration and only a casual interest in gaming.</p>
              <p>It’s true that the most common threats are info stealer malware from fake download buttons, ransomware that encrypts your files or joining a DDoS botnet. It’s supposed such malware is usually not interested in higher privilege escalation or hardware sabotage, if it can already access what it needs. It’s also true that the best protection against such malware is a good ad blocker, staying on trusted sites and user education.</p>
              <p>More experienced PC users develop a false sense of security from seeing how successfully they avoid malware infection by “being smart”. They argue that they don’t need all these restrictive, patronizing security features and AVs that just annoy with false positives, because their malware-free track record “proves” that they know better. They also argue that more advanced threats are not aimed at home users, but corporate networks and too unlikely to care about. Especially relevant for gamers: Virtualization can reduce system performance and whether that is noticeable or not is also a point of contention.</p>
              <p>The other side of the argument: You would be disabling technology that evolved from decades of security research, ignoring what experts consider necessary nowadays. You would willingly give up protections against common classes of software vulnerabilities and if you ever do get a more advanced malware, it can breeze right through so that your PC can stay part of a botnet for eternity or spread to more local network devices more easily. If a lot of people remove these protections – especially DSE and memory integrity – for gaming, one of the main use cases of Windows PCs at home, it might be worth the effort for malware authors to target such setups. Widespread usage of HV cracks could encourage manipulated fake releases, because people who download those can be expected to disable all protection, including AV exclusion. The knowledge and effort required to take precautions and verify files properly is higher than with common threats and the potential consequences much more severe.</p>
              <p>Aside from the disabled Windows features, even if you trust the authors of the hypervisor driver and even compile it yourself from source, a serious vulnerability in its code could instantly provide maximum and undetectable access to your system.</p>
              <p className="font-bold">Whether that game is worth the risks is something you will ultimately have to decide for yourself.</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-6 mb-3">What’s inside those cracks?</h3>
              <p>Basically, every modern Hypervisor bypass/crack consists of two parts:</p>
              <ol className="list-decimal ps-6 space-y-4">
                <li>
                  VBS.cmd: special command-line script, which checks your existing settings and modify them to make your system prepared for HV-cracks.
                  <p className="mt-2">This script is universal for all HV-games and is developed separately, it doesn’t depend on actual game cracks. You can download the latest version below:</p>
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-5 my-4">
                    <a href="https://paste.fitgirl-repacks.site/?7bcd452c6412ca8a#7hF2cQmiRvFNqKWFmtUCF9D6k9MG9bFFZRfdgEUoy2Xm" target="_blank" rel="noopener" className="text-green-600 dark:text-green-400 font-bold hover:underline">Current version: v1.4 (Updated on March 26, 2026)</a>
                    <div className="mt-4">
                      <div className="font-bold mb-2">{t('Changes log')}:</div>
                      <div className="text-sm space-y-2">
                        <p className="font-bold">v1.4</p>
                        <ol className="list-decimal ps-5 space-y-1">
                          <li>Added Driver Signature Enforcement (DSE) and test signing detection. If test signing is already enabled, the script will skip the Startup Settings step, BitLocker suspension, and onetimeadvancedoptions entirely, as driver signature enforcement is already bypassed.</li>
                          <li>Fixed an issue where the Revert Changes option would incorrectly show “Nothing to revert, as no changes were previously applied.” when DSE was still disabled, even though a reboot was required to restore it.</li>
                          <li>Added FACEIT Anti-Cheat detection. If detected, the script will exit with a message asking the user to uninstall it before proceeding, as it is known to block the driver from loading.</li>
                          <li>Replaced PowerShell calls with full path via %psc% to avoid resolution issues when PowerShell is not in PATH.</li>
                          <li>Removed outdated comments.</li>
                          <li>Minor improvements.</li>
                          <li>We rely on user reports to identify and fix issues. If you encounter any problems, please report them at <a href="https://cs.rin.ru/forum/viewtopic.php?f=14&amp;t=156435" className="text-blue-500 hover:underline">https://cs.rin.ru/forum/viewtopic.php?f=14&amp;t=156435</a></li>
                        </ol>
                        <p className="font-bold mt-3">v1.3</p>
                        <ol className="list-decimal ps-5 space-y-1">
                          <li>Fixed an issue where Credential Guard Scenarios registry key was being restored on revert even when Credential Guard itself was not running before the script was executed. CG and CG Scenarios are now tracked and reverted independently.</li>
                          <li>Fixed an issue where Memory Integrity (HVCI) would not be detected if it was configured but not yet running, which could keep VBS active. HVCI detection now checks both runtime status and registry configuration.</li>
                          <li>Added detection and removal of RequirePlatformSecurityFeatures when disabling VBS, which was causing VBS to remain enabled. The original value is backed up and restored accurately on revert.</li>
                          <li>Added detection and removal of the Enhanced Sign-in Security Scenarios key alongside the existing subkey, and reverts them independently.</li>
                          <li>Added a message informing the user when no security features needed to be disabled.</li>
                          <li>Minor improvements.</li>
                        </ol>
                        <p className="font-bold mt-3">v1.2</p>
                        <ol className="list-decimal ps-5 space-y-1">
                          <li>Fixed a compatibility issue where launching the script from a 32-bit application, like Compact AutoRunner which is used in Hypervisor Launcher by FitGirl, would cause system tools such as bcdedit to not be found, due to System32 being redirected to SysWOW64 in 32-bit processes. This manifested as the Windows hypervisor showing as failed to disable, and UEFI lock removal failing entirely. The script now relaunches itself as a 64-bit process when this is detected. Thanks to galaxyxyz888 on Discord.</li>
                          <li>Fixed an issue where the Credential Guard Scenarios registry key was not being disabled, which could keep VBS active even when Credential Guard was not running. Thanks to sowhatnumber on Discord.</li>
                          <li>Fixed an issue where SecConfig.efi would not correctly return to the current OS after clearing a UEFI lock on dual-boot systems. Thanks to RessourectoR.</li>
                          <li>Fixed an issue where reverting the Windows hypervisor would incorrectly show as failed after a reboot on systems with UEFI locked VBS or HVCI, caused by SecConfig.efi clearing the hypervisorlaunchtype BCD entry during the UEFI lock removal process on boot.</li>
                          <li>Fixed an issue where the Revert Changes option would not show “No changes have been made” on systems that had previously agreed to UEFI lock removal, even when no features had actually been disabled, due to the UEFILockAgreed registry value being incorrectly counted as a tracked change.</li>
                          <li>Fixed an issue where the ManageVBS registry key was not being cleaned up correctly after reverting on systems that had agreed to UEFI lock removal.</li>
                          <li>Added test signing detection. If test signing is already enabled, the script will inform the user.</li>
                          <li>Minor visual improvements.</li>
                        </ol>
                        <p className="font-bold mt-3">v1.1</p>
                        <ol className="list-decimal ps-5 space-y-1">
                          <li>Fixed a crash when the script path or filename contained spaces or special characters, such as when downloaded multiple times and renamed to VBS (1).cmd.</li>
                          <li>Fixed an issue where Enhanced Sign-in Security was preventing VBS from being disabled. A check has been added to disable it if detected. This mainly affected ROG Ally X users where it is enabled by default. Thanks to .oathkeeper213 on Discord and Azazel35 on Reddit.</li>
                          <li>Added support for disabling VBS, HVCI and Credential Guard when protected by a UEFI lock using SecConfig.efi. In the script, the user is advised to only proceed on personal devices before removing the UEFI lock. Note that on managed devices, VBS, HVCI and Credential Guard protected by a UEFI lock can only be disabled for one boot cycle. UEFI locks can be fully reverted using the Revert Changes option. Thanks to poce on Discord.</li>
                          <li>Added support for disabling VBS and HVCI mandatory mode. Note that reverting mandatory mode is not currently supported and must be re-enabled manually if needed.</li>
                          <li>Added a note in the script’s introduction regarding compatibility issues with kernel anti-cheats, specifically Vanguard, where disabling driver signature enforcement would result in a bug check (BSOD) in some system configurations, and FACEIT Anti-Cheat, which prevented the driver from loading with a multitude of different errors, most notably ERROR_ACCESS_DENIED, ERROR_INVALID_BLOCK and ERROR_NO_SYSTEM_RESOURCES. Thanks to xyz2theb on Reddit, deviljin0500, faintx11 &amp; xeros1 on Discord for reporting this.</li>
                          <li>Updated introductory notes.</li>
                          <li>Minor visual improvements.</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </li>
                <li>
                  The Crack/Bypass itself
                  <p className="mt-2">Consists of EXEs/DLLs, which does the actual Denuvo bypassing + other additional DLLs, like Goldberg Steam emulator to get past the underlying Steam protection.</p>
                  <p className="mt-2">Those files work only for specific game versions, for which they were made. They won’t work on different game version or other games.</p>
                </li>
              </ol>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-6 mb-3">{t('Pre-requirements')}</h3>
              <p>Your CPU must support one of two virtualization techniques: VT-x for Intel and AMD-V (SVM) for AMD.</p>
              <p>Google if CPU model supports virtualization to know if you can play HV-games.</p>
              <p>Before proceeding with HV cracks, check your BIOS for enabling those technologies.</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-6 mb-3">Do I need to disable Secure Boot or use EfiGuard?</h3>
              <p>No. Current HV bypasses do not require those changes.</p>
            </div>
          </article>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const analyzeRequirements = (reqs: {label: string, value: string}[]) => {
  let minRam = 0;
  let minOs = 0;
  let minGpuTier = 1;
  let minCpuTier = 1;
  
  reqs.forEach(req => {
    const label = req.label.toLowerCase();
    const val = req.value.toLowerCase();
    
    if (label.includes("memory") || label.includes("ram")) {
      const match = val.match(/(\d+)\s*gb/);
      if (match) minRam = parseInt(match[1]);
      else {
        const mbMatch = val.match(/(\d+)\s*mb/);
        if (mbMatch) minRam = parseInt(mbMatch[1]) / 1024;
      }
    }
    
    if (label.includes("os") || label.includes("system") || label.includes("windows")) {
      if (val.includes("11")) minOs = 11;
      else if (val.includes("10")) minOs = 10;
      else if (val.includes("8.1")) minOs = 8;
      else if (val.includes("8")) minOs = 8;
      else if (val.includes("7")) minOs = 7;
    }
    
    if (label.includes("graphics") || label.includes("gpu") || label.includes("video")) {
      if (val.match(/5090|5080|4090|4080|7900\s?xtx|7900\s?xt|3090|rx\s?6950|rx\s?6900|rx\s?7900/)) minGpuTier = 6;
      else if (val.match(/5070|4070\s?ti|4070|3080\s?ti|3080|6800\s?xt|6800|7800\s?xt|rx\s?7800/)) minGpuTier = 5;
      else if (val.match(/4060\s?ti|4060|3070\s?ti|3070|2080\s?ti|6750\s?xt|6700\s?xt|7700\s?xt|1080\s?ti/)) minGpuTier = 4;
      else if (val.match(/3060\s?ti|3060|2070\s?super|2070|2060\s?super|2060|1080|1070\s?ti|1070|6650\s?xt|6600\s?xt|6600|7600|rx\s?5700\s?xt|rx\s?5700|arc\s?a770/)) minGpuTier = 3;
      else if (val.match(/1660\s?ti|1660\s?super|1660|1650\s?super|1650|1060|1050\s?ti|980\s?ti|980|970|rx\s?590|rx\s?580|rx\s?570|rx\s?480|rx\s?470|arc\s?a750/)) minGpuTier = 2;
      else if (val.match(/1050|1030|960|950|750\s?ti|750|mx\d{3}|intel\s?hd|intel\s?uhd|iris\s?xe|vega\s?\d+/)) minGpuTier = 1;
      else if (val.match(/(\d+)\s*gb\s*vram|vram\s*(\d+)\s*gb/)) {
         const vramMatch = val.match(/(\d+)\s*gb\s*vram|vram\s*(\d+)\s*gb/);
         const vram = parseInt(vramMatch?.[1] || vramMatch?.[2] || "0");
         if (vram >= 16) minGpuTier = 5;
         else if (vram >= 12) minGpuTier = 4;
         else if (vram >= 8) minGpuTier = 3;
         else if (vram >= 4) minGpuTier = 2;
         else minGpuTier = 1;
      }
      else minGpuTier = 3;
    }
    
    if (label.includes("processor") || label.includes("cpu")) {
      if (val.match(/i9|ryzen\s?9|threadripper|core\s?ultra\s?9/)) minCpuTier = 5;
      else if (val.match(/i7|ryzen\s?7|core\s?ultra\s?7/)) minCpuTier = 4;
      else if (val.match(/i5|ryzen\s?5|core\s?ultra\s?5/)) minCpuTier = 3;
      else if (val.match(/i3|ryzen\s?3|pentium|celeron|athlon/)) minCpuTier = 2;
      else minCpuTier = 3;
    }
  });
  
  return { minRam, minOs, minGpuTier, minCpuTier };
};


export const checkCompatibilityStatus = (userSpecs: {ram: number, os: string, cpuTier: number, gpuTier: number}, reqs: {label: string, value: string}[]) => {
  if (!reqs || reqs.length === 0) return 'unknown';
  const parsedReqs = analyzeRequirements(reqs);
  let status: 'pass'|'fail'|'warn' = 'pass';

  if (parsedReqs.minRam > 0 && userSpecs.ram < parsedReqs.minRam) status = 'fail';
  if (parsedReqs.minOs > 0 && parseInt(userSpecs.os) < parsedReqs.minOs) status = 'fail';
  
  if (status !== 'fail') {
      let gpuDiff = parsedReqs.minGpuTier > 1 ? parsedReqs.minGpuTier - userSpecs.gpuTier : 0;
      let cpuDiff = parsedReqs.minCpuTier > 1 ? parsedReqs.minCpuTier - userSpecs.cpuTier : 0;
      
      if (gpuDiff >= 2 || cpuDiff >= 2) status = 'fail';
      else if (gpuDiff === 1 || cpuDiff === 1) status = 'warn';
  }
  return status;
};

const SystemChecker: React.FC<{ reqs: {label: string, value: string}[] }> = ({ reqs }) => {
    const { dir, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [userSpecs, setUserSpecs] = useState({
    ram: 16,
    os: '10',
    cpuTier: 3,
    gpuTier: 3,
  });
  const [result, setResult] = useState<{status: 'pass'|'fail'|'warn', messages: string[]} | null>(null);

  const handleCheck = () => {
    const parsedReqs = analyzeRequirements(reqs);
    const messages = [];
    let status: 'pass'|'fail'|'warn' = 'pass';

    if (parsedReqs.minRam > 0) {
      if (userSpecs.ram < parsedReqs.minRam) {
        messages.push(`❌ RAM: You have ${userSpecs.ram}GB, but ${parsedReqs.minRam}GB is strictly required. Your system will likely crash or experience severe stuttering.`);
        status = 'fail';
      } else if (userSpecs.ram === parsedReqs.minRam) {
        messages.push(`⚠️ RAM: You have exactly ${userSpecs.ram}GB which is the minimum. Close background apps before running!`);
        if (status === 'pass') status = 'warn';
      } else {
        messages.push(`✅ RAM: Your ${userSpecs.ram}GB provides plenty of headroom over the required ${parsedReqs.minRam}GB.`);
      }
    }

    if (parsedReqs.minOs > 0) {
      const userOsNum = parseInt(userSpecs.os);
      if (userOsNum < parsedReqs.minOs) {
        messages.push(`❌ OS: You are running exactly Windows ${userOsNum}, but this requires Windows ${parsedReqs.minOs}+. It may refuse to launch.`);
        status = 'fail';
      } else {
        messages.push(`✅ OS: Windows ${userOsNum} perfectly meets the OS compatibility requirement.`);
      }
    }

    if (parsedReqs.minGpuTier > 1) {
      if (userSpecs.gpuTier < parsedReqs.minGpuTier) {
        messages.push(`⚠️ GPU: Your graphics processor is in tier ${userSpecs.gpuTier}, which is below the recommended tier ${parsedReqs.minGpuTier}. Expect low framerates; try setting all graphics to "Low" and using upscaling (FSR/DLSS).`);
        if (status === 'pass') status = 'warn';
      } else if (userSpecs.gpuTier === parsedReqs.minGpuTier) {
        messages.push(`✅ GPU: Your graphics processor meets the minimum target. You should get playable framerates on medium-to-low settings.`);
      } else {
        messages.push(`🚀 GPU: Excellent! Your chosen GPU is above the recommended specifications. Enjoy high fidelity gameplay.`);
      }
    }

    if (parsedReqs.minCpuTier > 1) {
      if (userSpecs.cpuTier < parsedReqs.minCpuTier) {
        messages.push(`⚠️ CPU: Your processor (tier ${userSpecs.cpuTier}) might bottleneck this software (tier ${parsedReqs.minCpuTier} expected). You may experience long load times and sudden stutters.`);
        if (status === 'pass') status = 'warn';
      } else {
        messages.push(`✅ CPU: Your processor easily handles the compute requirements! No bottlenecks expected.`);
      }
    }

    if (messages.length === 0) {
      messages.push("✅ No specific heavy requirements detected. Your system should handle this flawlessly.");
    } else if (status === 'pass') {
      messages.push("✨ SUMMARY: Incredible specs! You exceed all major requirements for this software.");
    } else if (status === 'warn') {
      messages.push("🚧 SUMMARY: Proceed with caution. The software will likely run, but you may need to reduce settings or close background apps to maintain stability.");
    } else if (status === 'fail') {
      messages.push("🚨 SUMMARY: System failure expected. Your current specifications fall critically below the minimum required limits.");
    }

    setResult({ status, messages });
  };

  return (
    <div className="mt-4 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg">
            <Icon name="Cpu" size={20} />
          </div>
          <span className="font-bold text-slate-900 dark:text-white">{t('Can I Run It? (Smart Check)')}</span>
        </div>
        <Icon name={isOpen ? "ChevronUp" : "ChevronDown"} size={20} className="text-slate-900 dark:text-slate-300" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-200 dark:border-slate-700 p-4 space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-900 dark:text-slate-300 uppercase">{t('Operating System')}</label>
                <select 
                  value={userSpecs.os}
                  onChange={(e) => setUserSpecs({...userSpecs, os: e.target.value})}
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="7">Windows 7</option>
                  <option value="8">Windows 8</option>
                  <option value="10">Windows 10</option>
                  <option value="11">Windows 11</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-900 dark:text-slate-300 uppercase">{t('RAM (GB)')}</label>
                <select 
                  value={userSpecs.ram}
                  onChange={(e) => setUserSpecs({...userSpecs, ram: parseInt(e.target.value)})}
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="4">4 GB</option>
                  <option value="8">8 GB</option>
                  <option value="16">16 GB</option>
                  <option value="32">32 GB</option>
                  <option value="64">64+ GB</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-900 dark:text-slate-300 uppercase">{t('Processor (CPU)')}</label>
                <select 
                  value={userSpecs.cpuTier}
                  onChange={(e) => setUserSpecs({...userSpecs, cpuTier: parseInt(e.target.value)})}
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="1">Basic Dual Core (Older Intel/AMD)</option>
                  <option value="2">Standard Quad Core (i3 / Ryzen 3)</option>
                  <option value="3">Solid 6-Core (i5 / Ryzen 5)</option>
                  <option value="4">High-End 8+ Core (i7 / Ryzen 7)</option>
                  <option value="5">Enthusiast (i9 / Ryzen 9)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-900 dark:text-slate-300 uppercase">{t('Graphics (GPU)')}</label>
                <select 
                  value={userSpecs.gpuTier}
                  onChange={(e) => setUserSpecs({...userSpecs, gpuTier: parseInt(e.target.value)})}
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="1">Integrated Graphics (Intel HD / AMD APU)</option>
                  <option value="2">Entry Level (GTX 1050 / RX 560)</option>
                  <option value="3">Mid Range (RTX 3060 / RX 6600)</option>
                  <option value="4">High End (RTX 4070 / RX 7800)</option>
                  <option value="5">Ultra (RTX 4080 / RX 7900 XTX)</option>
                  <option value="6">Enthusiast / Next-Gen (RTX 5090 / 4090)</option>
                </select>
              </div>
            </div>

            <button 
              onClick={handleCheck}
              className="w-full py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-lg transition-colors shadow-lg shadow-primary-600/20"
            >
              Check Compatibility
            </button>

            {result && (
              <div className={`p-4 rounded-xl border ${result.status === 'pass' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : result.status === 'warn' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
                <h4 className={`font-black uppercase tracking-wider mb-3 ${result.status === 'pass' ? 'text-emerald-600 dark:text-emerald-700 dark:text-emerald-400' : result.status === 'warn' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                  {result.status === 'pass' ? 'Looks Good to Go!' : result.status === 'warn' ? 'Might Struggle a Bit' : 'Probably Won\'t Run Well'}
                </h4>
                <div className="space-y-2">
                  {result.messages.map((msg, idx) => {
                    const iconName = msg.startsWith('❌') ? 'XCircle' : msg.startsWith('⚠️') ? 'AlertTriangle' : msg.startsWith('✅') ? 'CheckCircle2' : msg.startsWith('🚀') ? 'Rocket' : msg.startsWith('✨') ? 'Sparkles' : msg.startsWith('🚧') ? 'HardHat' : msg.startsWith('🚨') ? 'AlertOctagon' : 'Info';
                    return (
                    <div key={idx} className="flex gap-2 text-sm font-medium text-slate-900 dark:text-slate-200">
                      <Icon name={iconName as any} size={16} className={`shrink-0 mt-0.5 ${msg.startsWith('❌') || msg.startsWith('🚨') ? 'text-red-500' : msg.startsWith('⚠️') || msg.startsWith('🚧') ? 'text-yellow-500' : msg.startsWith('✅') || msg.startsWith('✨') || msg.startsWith('🚀') ? 'text-emerald-900 dark:text-emerald-500' : 'text-slate-700 dark:text-slate-500'}`} />
                      <span>{msg.replace(/^(❌|⚠️|✅|🚀|✨|🚧|🚨)\s*/, '')}</span>
                    </div>
                  )})}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TorrentWarningModal: React.FC<{ link: string; onClose: () => void; }> = ({ link, onClose }) => {
  const { t } = useLanguage();
  const [step, setStep] = useState<'warning' | 'success'>('warning');

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[400] bg-white/80 dark:bg-[#0A0F1C]/90 backdrop-blur-md flex items-center justify-center p-4"
    >
      <motion.div 
        key={step}
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800/80 p-8 rounded-3xl max-w-sm w-full shadow-2xl relative text-center"
      >
        <button onClick={onClose} className="absolute top-4 end-4 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 p-2 rounded-full">
          <Icon name="X" size={16} />
        </button>
        {step === 'warning' ? (
          <>
            <div className="w-20 h-20 mx-auto bg-blue-500/10 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(59,130,246,0.2)] border border-blue-500/20">
                <Icon name="Download" size={32} className="text-blue-600 dark:text-blue-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4">{t('Wait a minute! 🛑')}</h3>
            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-8 text-sm" dangerouslySetInnerHTML={{ __html: t('To use this method, you need <strong className="text-blue-600 dark:text-blue-400">qBittorrent</strong> to download uTorrent files without problems. Do you already have it installed? 🤔') }}></p>
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button onClick={() => setStep('success')} className="flex-1 w-full sm:w-auto bg-[#10B981] hover:bg-[#059669] text-white font-bold py-3 px-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(16,185,129,0.2)] text-sm flex items-center justify-center gap-2">
                {t('YES, I HAVE IT 🚀')}
              </button>
              <a 
                href="https://www.qbittorrent.org/download" 
                target="_blank" 
                rel="noreferrer" 
                onClick={(e) => {
                  setStep('success');
                }}
                className="flex-1 w-full sm:w-auto bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold py-3 px-4 rounded-xl transition-colors border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-2 text-sm"
              >
                {t('Not Yet 😅')}
              </a>
            </div>
          </>
        ) : (
          <>
            <div className="w-20 h-20 mx-auto bg-[#10B981]/10 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(16,185,129,0.2)] border border-[#10B981]/20">
                <Icon name="CheckCircle" size={32} className="text-[#10B981]" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4">{t('Everything is fine! 🎉')}</h3>
            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-8 text-sm">
              {t('Now you can have it thanks for respect N E X A 1337 Guidelines and instructions, all this for you. 🥳')}
            </p>
            <a href={link} onClick={onClose} className="block w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold py-3 px-6 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(14,165,233,0.3)] text-sm">
              {t('Get Files ⚡')}
            </a>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

const NoteModal: React.FC<{
  content: string;
  onClose: () => void;
}> = ({ content, onClose }) => { const { dir, t } = useLanguage(); return (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 md:backdrop-blur-sm p-4"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.95, opacity: 0, y: 10 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.95, opacity: 0, y: 10 }}
      className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800 relative"
      onClick={e => e.stopPropagation()}
    >
      <button 
        onClick={onClose} 
        className="absolute top-4 end-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 p-2 rounded-full transition-all"
      >
        <Icon name="X" size={16} />
      </button>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 pe-8 flex items-center gap-2">
        <Icon name="Info" size={20} className="text-emerald-900 dark:text-emerald-500" /> {t('Note')}
      </h3>
      <div className="text-sm text-slate-900 dark:text-slate-200 font-medium leading-relaxed max-h-[60vh] overflow-y-auto whitespace-pre-wrap custom-scrollbar">
        {content}
      </div>
      <div className="mt-6 flex justify-end">
        <button onClick={onClose} className="px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">{t('Close')}</button>
      </div>
    </motion.div>
  </motion.div>
); };

const CompanyProfileModal: React.FC<{
  profile: CompanyProfile;
  resources: ResourceItem[];
  onClose: () => void;
  onItemClick: (item: ResourceItem) => void;
}> = ({ profile, resources, onClose, onItemClick }) => {
    const { dir, t } = useLanguage();
  const categories = useMemo(() => Array.from(new Set(resources.map(r => r.category))), [resources]);
  const [activeCategory, setActiveCategory] = useState<string>(categories[0] || '');
  const [currentPage, setCurrentPage] = useState(1);
  const [imgError, setImgError] = useState(false);
  const itemsPerPage = 24;

  useEffect(() => {
    setImgError(false);
  }, [profile.logoUrl]);

  const filteredResources = resources.filter(r => r.category === activeCategory);

  const totalPages = Math.ceil(filteredResources.length / itemsPerPage) || 1;
  const currentItems = filteredResources.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-[100] flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden"
    >
      <div className="flex-none p-4 md:p-8 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 md:backdrop-blur-md">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="w-24 h-24 md:w-40 md:h-40 shrink-0 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden flex items-center justify-center p-2 md:p-4 relative group">
             {!imgError && profile.logoUrl ? (
               <>
                 <img src={profile.logoUrl} alt={profile.name} referrerPolicy="no-referrer" className="w-full h-full object-contain" onError={() => setImgError(true)} />
               </>
             ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                   <Icon name="Briefcase" size={32} className="text-slate-900 dark:text-slate-600" />
                </div>
             )}
          </div>
          <div>
            <h2 className="text-2xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-1 md:mb-2">{profile.name}</h2>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 max-w-3xl line-clamp-2 md:line-clamp-none leading-relaxed">{profile.description || t('Welcome to this company\'s profile. Explore their ecosystem of products and releases below.')}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 md:p-3 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-900 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 shrink-0 border border-slate-200 dark:border-slate-700 ms-4">
           <Icon name="X" size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative">
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar">
           {categories.map(cat => (
              <button
                 key={cat}
                 onClick={() => { setActiveCategory(cat); setCurrentPage(1); }}
                 className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors flex items-center gap-2 ${
                    activeCategory === cat 
                    ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20 border border-primary-500' 
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-primary-500/50'
                 }`}
              >
                 {t(cat === 'steamtools' ? 'SteamTools' : cat)}
                 <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${activeCategory === cat ? 'bg-black/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-500'}`}>
                     {resources.filter(r => r.category === cat).length}
                 </span>
              </button>
           ))}
        </div>

        {currentItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 md:gap-8">
            {currentItems.map((item, idx) => (
               <div 
                  key={`${item.id}-${idx}`} 
                  onClick={() => onItemClick(item)}
                  className="group cursor-pointer rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-primary-500 dark:hover:border-primary-500 transition-all shadow-sm hover:shadow-xl relative aspect-[9/16]"
               >
                  <img src={item.coverImage} alt={item.name} className="w-full h-full object-cover"  loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-2 inset-x-2 flex justify-between items-start">
                     <div className="flex items-center gap-1">
                         {item.category === 'hypervisor' && (
                             <div className="bg-red-600 text-white px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest shadow-md">
                                 HV
                             </div>
                         )}
                         {item.category === 'steamtools' && (
                             <div className="bg-[#171a21] text-[#66c0f4] p-1 rounded shadow-md border border-[#2a475e]">
                                 <Icon name="BrandSteam" size={14} />
                             </div>
                         )}
                         {item.category === 'game' && (
                             <div className="bg-white p-0.5 rounded shadow-md w-6 h-6 flex items-center justify-center overflow-hidden">
                                 <img src="https://fitgirl-repacks.site/wp-content/uploads/2016/08/icon.jpg" alt="FitGirl" className="w-full h-full object-contain rounded-sm" />
                             </div>
                         )}

                         {/* Fallback if category is missing or different */}
                         {!['hypervisor', 'steamtools', 'game'].includes(item.category) && (
                             <div className="bg-primary-600 text-white px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest shadow-md">
                                 {(item.category || '').toUpperCase()}
                             </div>
                         )}
                     </div>
                     {item.version && item.category !== 'steamtools' && (
                         <div className="bg-slate-900/80 md:backdrop-blur-sm text-slate-200 border border-slate-700 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold shadow-md truncate ms-2">
                             {item.version}
                         </div>
                     )}
                  </div>
               </div>
            ))}
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-slate-600 dark:text-slate-300 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white/50 dark:bg-slate-900/50">
             <Icon name="Search" size={48} className="mb-4 opacity-30" />
             <span className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-slate-300">{t('No products found in this category')}</span>
          </div>
        )}
        
        {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2 pb-8">
               <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center"
               ><Icon name="ChevronLeft" size={16} className="rtl:rotate-180" /></button>
               <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar px-1">
                 {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                     <button
                         key={page}
                         onClick={() => setCurrentPage(page)}
                         className={`w-10 h-10 rounded-lg text-xs font-bold transition-colors shrink-0 ${currentPage === page ? 'bg-primary-500 text-white shadow-md' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary-500/50 text-slate-900 dark:text-slate-200'}`}
                     >
                         {page}
                     </button>
                 ))}
               </div>
               <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center"
               ><Icon name="ChevronRight" size={16} className="rtl:rotate-180" /></button>
            </div>
        )}
      </div>
    </motion.div>
  );
};

const LikeButton = ({ item, t }: { item: ResourceItem, t: any }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    
    useEffect(() => {
        const syncLikeStatus = () => {
            const activeUid = auth.currentUser?.uid || (localStorage.getItem('secret_area_unlocked') === 'true' ? 'guest' : null);
            if (!activeUid) {
                setIsLiked(false);
                return;
            }
            const local = getLocalProfile(activeUid);
            const likedList = local?.liked || local?.likedGames || [];
            const found = likedList.some((g: any) => {
                if (!g) return false;
                if (typeof g === 'string') return g.toLowerCase() === String(item.id).toLowerCase();
                return (g.id && String(g.id).toLowerCase() === String(item.id).toLowerCase()) ||
                       (g.gameId && String(g.gameId).toLowerCase() === String(item.id).toLowerCase()) ||
                       (g.name && item.name && String(g.name).toLowerCase().trim() === String(item.name).toLowerCase().trim());
            });
            setIsLiked(found);
        };

        syncLikeStatus();
        window.addEventListener('secretarea_profile_sync', syncLikeStatus);

        let unsubFirestore: (() => void) | null = null;
        if (auth.currentUser) {
            try {
                const userDocRef = doc(db, 'users', auth.currentUser.uid);
                unsubFirestore = onSnapshot(userDocRef, (snap) => {
                    if (snap.exists()) {
                        const data = snap.data();
                        const likedList = data.liked || data.likedGames || [];
                        const found = likedList.some((g: any) => {
                            if (!g) return false;
                            if (typeof g === 'string') return g.toLowerCase() === String(item.id).toLowerCase();
                            return (g.id && String(g.id).toLowerCase() === String(item.id).toLowerCase()) ||
                                   (g.gameId && String(g.gameId).toLowerCase() === String(item.id).toLowerCase()) ||
                                   (g.name && item.name && String(g.name).toLowerCase().trim() === String(item.name).toLowerCase().trim());
                        });
                        setIsLiked(found);
                    }
                }, () => {});
            } catch (e) {}
        }

        return () => {
            window.removeEventListener('secretarea_profile_sync', syncLikeStatus);
            if (unsubFirestore) unsubFirestore();
        };
    }, [item.id, item.name]);

    const handleLike = async () => {
        const activeUid = auth.currentUser?.uid || (localStorage.getItem('secret_area_unlocked') === 'true' ? 'guest' : null);
        if (!activeUid || isLiking) return;
        setIsLiking(true);
        const nextLiked = !isLiked;
        setIsLiked(nextLiked);

        try {
            await recordGameInteraction(activeUid, {
                id: item.id,
                name: item.name,
                coverImage: item.coverImage,
                category: item.category,
                genres: item.genres,
                version: item.version,
                repackSize: item.repackSize,
                description: item.description,
                links: item.links
            }, nextLiked ? 'like' : 'unlike');
        } catch (error) {
            console.warn("Error toggling like:", error);
            setIsLiked(!nextLiked);
        }
        setIsLiking(false);
    };

    const activeUid = auth.currentUser?.uid || (localStorage.getItem('secret_area_unlocked') === 'true' ? 'guest' : null);
    if (!activeUid) return null;

    return (
        <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={(e) => { e.stopPropagation(); handleLike(); }}
            className={`absolute top-4 end-4 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all backdrop-blur-md shadow-lg border ${
                isLiked
                ? 'bg-red-500/30 border-red-500/50 text-red-500 shadow-red-500/20'
                : 'bg-black/40 border-white/20 text-white hover:bg-black/60 hover:scale-105 hover:text-red-400'
            }`}
        >
            <motion.div animate={isLiked ? { scale: [1, 1.4, 1] } : {}} transition={{ duration: 0.4 }}>
                <Icon name="Heart" size={22} className={isLiked ? "fill-current" : ""} />
            </motion.div>
        </motion.button>
    );
};

export const ResourceDetailModal: React.FC<{ 
  item: ResourceItem; 
  onClose: () => void; 
  isHypervisor?: boolean; 
  stash?: string[];
  toggleStash?: (id: string, e?: React.MouseEvent, itemObj?: ResourceItem) => void;
  onCompanyClick?: (companyName: string) => void;
  onGenreClick?: (genre: string) => void;
  resolvedDev?: string;
  isGuestMode?: boolean;
  showGuestNotification?: () => void;
  globalSpecs?: { ram: number, os: string, cpuModel: string, gpuModel: string, isActive: boolean };
  initialScrollTarget?: string;
  onDonateClick?: () => void;
  allResources?: Record<string, ResourceItem[]>;
  onItemSelect?: (item: ResourceItem) => void;
  currentGenreContext?: string | null;
  onCategoryClick?: (category: string) => void;
}> = ({ item: rawItem, onClose, isHypervisor, stash = [], toggleStash = () => {}, onCompanyClick, onGenreClick, resolvedDev, isGuestMode, showGuestNotification, globalSpecs, initialScrollTarget, onDonateClick, allResources, onItemSelect, currentGenreContext, onCategoryClick }) => {
  const { dir, t } = useLanguage();
  const [showUploaderPopup, setShowUploaderPopup] = useState(false);
  const currentUser = auth.currentUser;
  const [adminAvatar, setAdminAvatar] = useState<string>(() => getCachedAdminAvatar());
  const [adminDisplayName, setAdminDisplayName] = useState<string>(() => getCachedAdminName());

  // Resolve item if item.name is an ID or missing full details
  const item: ResourceItem = useMemo(() => {
    let current = rawItem;
    if (!current) {
      return {
        id: 'game-default',
        name: 'Game Details',
        category: 'game',
        coverImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
        description: 'Game information and resources.',
        version: 'v1.0',
        repackSize: 'N/A',
        originalSize: 'N/A',
        genres: 'Game',
        languages: 'English',
        repackBy: '',
        galleryImages: [],
        links: { parts: [], mirrors: [], ankerParts: [] },
        isFree: true
      };
    }

    // Determine category from ID prefix if missing or mistakenly defaulted to game
    const inferCategory = (itemObj?: ResourceItem): string => {
      if (itemObj?.category && itemObj.category !== 'game') return itemObj.category;
      const idStr = String(itemObj?.id || '').trim().toUpperCase();
      if (idStr.startsWith('A-') || (/^A\d+$/i.test(idStr))) return 'architect';
      if (idStr.startsWith('H-') || (/^H\d+$/i.test(idStr))) return 'hypervisor';
      if (idStr.startsWith('S-') || (/^S\d+$/i.test(idStr))) return 'steamtools';
      if (idStr.startsWith('E-') || (/^E\d+$/i.test(idStr))) return 'extra';
      return itemObj?.category || 'game';
    };

    const inferredCategory = inferCategory(current);
    if (!current.category || (current.category === 'game' && inferredCategory !== 'game')) {
      current = { ...current, category: inferredCategory };
    }

    const isIdLike = (str?: string) => {
      if (!str) return true;
      const trimmed = String(str).trim();
      if (trimmed === 'Game Details' || trimmed === 'Item' || trimmed === 'Secure Fragment' || trimmed === 'Game') return true;
      if (current.id && trimmed.toLowerCase() === String(current.id).toLowerCase()) return true;
      if (/^[A-Za-z]{0,4}[-_ ]?\d+$/i.test(trimmed)) return true;
      if (/^\d+$/.test(trimmed)) return true;
      return false;
    };

    const hasAnyLinks = !!(
      current.links?.full || 
      (current.links?.mirrors && current.links.mirrors.length > 0) || 
      (current.links?.parts && current.links.parts.length > 0) || 
      (current.links?.ankerParts && current.links.ankerParts.length > 0) || 
      current.links?.utorrent || 
      current.links?.preInstalled?.download || 
      current.links?.preInstalled?.cloudDrop || 
      current.links?.preInstalled?.torrent
    );

    // Only resolve if item is truly a hollow stub (e.g. name is an ID or missing title and links)
    const needsResolution = isIdLike(current.name) || (!current.description && !hasAnyLinks) || (current.coverImage && current.coverImage.includes('unsplash.com') && isIdLike(current.name));

    if (needsResolution && current.id) {
      const rawTargetId = String(current.id).toLowerCase();
      const targetNoDash = rawTargetId.replace(/[-_]/g, '');

      // Strict check: must match id or gameId directly; never cross-match numbers across categories
      const checkItem = (r: ResourceItem) => {
        if (!r) return false;
        const rid = String(r.id || '').toLowerCase();
        const rNoDash = rid.replace(/[-_]/g, '');
        if (rid === rawTargetId || rNoDash === targetNoDash) return true;
        const rGameId = String(r.gameId || '').toLowerCase();
        if (rGameId && (rGameId === rawTargetId || rGameId === targetNoDash)) return true;
        return false;
      };

      const targetCat = current.category || inferredCategory;
      let found: ResourceItem | undefined;

      // 1. Search in the item's own category first
      if (allResources && targetCat && Array.isArray(allResources[targetCat])) {
        found = allResources[targetCat].find(checkItem);
      }

      // 2. Search other categories only if category is not explicitly constrained
      if (!found && allResources) {
        for (const cat of Object.keys(allResources)) {
          if (cat === targetCat) continue;
          // Never look in 'game' if this is an architect/tools, hypervisor, or steamtools item
          if (targetCat === 'architect' && cat !== 'architect') continue;
          if (targetCat === 'hypervisor' && cat !== 'hypervisor') continue;
          if (targetCat === 'steamtools' && cat !== 'steamtools') continue;
          if (targetCat === 'extra' && cat !== 'extra') continue;
          if (Array.isArray(allResources[cat])) {
            found = allResources[cat].find(checkItem);
            if (found) break;
          }
        }
      }

      // 3. Fallback to localStorage cache
      if (!found) {
        try {
          const cached = localStorage.getItem('cached_transformed_resources');
          if (cached) {
            const parsed = JSON.parse(cached);
            if (targetCat && Array.isArray(parsed[targetCat])) {
              found = parsed[targetCat].find(checkItem);
            }
            if (!found) {
              for (const cat of Object.keys(parsed)) {
                if (cat === targetCat) continue;
                if (targetCat === 'architect' && cat !== 'architect') continue;
                if (targetCat === 'hypervisor' && cat !== 'hypervisor') continue;
                if (targetCat === 'steamtools' && cat !== 'steamtools') continue;
                if (targetCat === 'extra' && cat !== 'extra') continue;
                if (Array.isArray(parsed[cat])) {
                  found = parsed[cat].find(checkItem);
                  if (found) break;
                }
              }
            }
          }
        } catch (e) {}
      }

      if (found) {
        const resolvedCategory = (current.category && current.category !== 'game') ? current.category : (found.category || inferredCategory || 'game');
        const resolvedName = (!isIdLike(current.name) ? current.name : (!isIdLike(found.name) ? found.name : current.name)) || found.name || current.name;

        return {
          ...found,
          ...current,
          name: resolvedName,
          category: resolvedCategory,
          coverImage: (found.coverImage && !found.coverImage.includes('unsplash.com')) ? found.coverImage : (current.coverImage || found.coverImage),
          links: (found.links && (found.links.full || found.links.mirrors?.length || found.links.parts?.length)) ? found.links : (current.links || { parts: [], mirrors: [], ankerParts: [] }),
          description: found.description || current.description,
          repackSize: found.repackSize || current.repackSize,
          originalSize: found.originalSize || current.originalSize,
          version: found.version || current.version,
          genres: found.genres || current.genres,
          developer: found.developer || current.developer,
          repackBy: found.repackBy || current.repackBy,
          galleryImages: (found.galleryImages && found.galleryImages.length > 0) ? found.galleryImages : (current.galleryImages || [])
        };
      }
    }

    return current;
  }, [rawItem, allResources]);

  const getBreadcrumbCategoryLabel = (cat?: string, itemId?: string) => {
    const c = (cat || '').toLowerCase();
    if (c === 'architect' || c === 'tools') return t('Tools') || 'Tools';
    if (c === 'hypervisor') return t('Hypervisor') || 'Hypervisor';
    if (c === 'steamtools') return t('SteamTools') || 'SteamTools';
    if (c === 'extra' || c === 'savegame') return t('SaveGame') || 'SaveGame';
    if (itemId) {
      const upperId = String(itemId).trim().toUpperCase();
      if (upperId.startsWith('A-') || /^A\d+$/i.test(upperId)) return t('Tools') || 'Tools';
      if (upperId.startsWith('H-') || /^H\d+$/i.test(upperId)) return t('Hypervisor') || 'Hypervisor';
      if (upperId.startsWith('S-') || /^S\d+$/i.test(upperId)) return t('SteamTools') || 'SteamTools';
      if (upperId.startsWith('E-') || /^E\d+$/i.test(upperId)) return t('SaveGame') || 'SaveGame';
    }
    return t('Games') || 'Games';
  };

  useEffect(() => {
    const unsub = subscribeAdminPublicProfile((data) => {
      if (data.avatarURL) setAdminAvatar(data.avatarURL);
      if (data.displayName) setAdminDisplayName(data.displayName);
    });
    return () => unsub();
  }, []);

  // Ensure safe fallback for links to prevent uncaught TypeErrors if links object is missing
  if (item && !item.links) {
    (item as any).links = { parts: [], mirrors: [], ankerParts: [] };
  }

  useEffect(() => {
    if (isGuestMode) return;
    const uid = auth.currentUser?.uid;
    if (!uid || !item?.id) return;

    // Track profile view safely using local-first recordGameInteraction
    recordGameInteraction(uid, {
      id: item.id || '',
      name: item.name || '',
      coverImage: item.coverImage || '',
      category: item.category || 'game'
    }, 'view').catch((err) => {
      console.warn("Notice updating profile view stats (handled):", err?.message);
    });
  }, [item?.id, isGuestMode]);

  const [showTrailer, setShowTrailer] = useState(false);
  const [showFavoriteDropdown, setShowFavoriteDropdown] = useState(false);
  const [currentLibraryStatus, setCurrentLibraryStatus] = useState<string | null>(null);
  const [libraryFeedback, setLibraryFeedback] = useState<string | null>(null);
  const favoriteDropdownRef = useRef<HTMLDivElement>(null);
  const [showHypervisorGuide, setShowHypervisorGuide] = useState(false);
  const [noteModalContent, setNoteModalContent] = useState<string | null>(null);
  const [torrentWarningLink, setTorrentWarningLink] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isCopiedGameId, setIsCopiedGameId] = useState(false);

  const [isFavorite, setIsFavorite] = useState<boolean>(() => {
    if (stash && stash.some(s => String(s).toLowerCase() === String(item.id).toLowerCase())) return true;
    try {
      const savedStash = JSON.parse(localStorage.getItem('myStash') || localStorage.getItem('stash') || '[]');
      if (Array.isArray(savedStash) && savedStash.some(s => String(s).toLowerCase() === String(item.id).toLowerCase())) return true;
    } catch {}
    return false;
  });

  // Sync Favorite status in real time with local & remote profile
  useEffect(() => {
    const syncFavoriteStatus = () => {
      const activeUid = auth.currentUser?.uid || (isGuestMode || localStorage.getItem('secret_area_unlocked') === 'true' ? 'guest' : null);
      let inFavorites = false;
      try {
        const savedStash = JSON.parse(localStorage.getItem('myStash') || localStorage.getItem('stash') || '[]');
        if (Array.isArray(savedStash) && savedStash.some(s => String(s).toLowerCase() === String(item.id).toLowerCase())) {
          inFavorites = true;
        }
      } catch {}

      if (stash && stash.some(s => String(s).toLowerCase() === String(item.id).toLowerCase())) {
        inFavorites = true;
      }

      if (activeUid) {
        const prof = getLocalProfile(activeUid);
        if (prof) {
          const profStash = prof.stash || [];
          if (profStash.some((s: any) => String(s).toLowerCase() === String(item.id).toLowerCase())) {
            inFavorites = true;
          }
          const profFavs = prof.favorites || prof.favoriteGames || [];
          if (profFavs.some((g: any) => {
            if (!g) return false;
            if (typeof g === 'string') return g.toLowerCase() === String(item.id).toLowerCase();
            return (g.id && String(g.id).toLowerCase() === String(item.id).toLowerCase()) ||
                   (g.gameId && String(g.gameId).toLowerCase() === String(item.id).toLowerCase()) ||
                   (g.name && item.name && String(g.name).toLowerCase().trim() === String(item.name).toLowerCase().trim());
          })) {
            inFavorites = true;
          }
        }
      }

      setIsFavorite(inFavorites);
    };

    syncFavoriteStatus();
    window.addEventListener('secretarea_profile_sync', syncFavoriteStatus);

    let unsubFirestore: (() => void) | null = null;
    if (auth.currentUser) {
      try {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        unsubFirestore = onSnapshot(userDocRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            const sList = data.stash || [];
            const fList = data.favorites || data.favoriteGames || [];
            let inFav = sList.some((s: any) => String(s).toLowerCase() === String(item.id).toLowerCase());
            if (!inFav) {
              inFav = fList.some((g: any) => {
                if (!g) return false;
                if (typeof g === 'string') return g.toLowerCase() === String(item.id).toLowerCase();
                return (g.id && String(g.id).toLowerCase() === String(item.id).toLowerCase()) ||
                       (g.gameId && String(g.gameId).toLowerCase() === String(item.id).toLowerCase()) ||
                       (g.name && item.name && String(g.name).toLowerCase().trim() === String(item.name).toLowerCase().trim());
              });
            }
            setIsFavorite(inFav);
          }
        }, () => {});
      } catch (e) {}
    }

    return () => {
      window.removeEventListener('secretarea_profile_sync', syncFavoriteStatus);
      if (unsubFirestore) unsubFirestore();
    };
  }, [item.id, item.name, stash, isGuestMode, currentUser]);

  // Sync current library status in real time with local & remote profile
  useEffect(() => {
    const syncLibraryStatus = () => {
      const activeUid = auth.currentUser?.uid || (isGuestMode || localStorage.getItem('secret_area_unlocked') === 'true' ? 'guest' : null);
      if (!activeUid) {
        setCurrentLibraryStatus(null);
        return;
      }
      const prof = getLocalProfile(activeUid);
      const libList = prof?.library || prof?.libraryGames || [];
      const found = libList.find((g: any) => {
        if (!g) return false;
        if (typeof g === 'string') return g.toLowerCase() === String(item.id).toLowerCase();
        return (g.id && String(g.id).toLowerCase() === String(item.id).toLowerCase()) ||
               (g.gameId && String(g.gameId).toLowerCase() === String(item.id).toLowerCase()) ||
               (g.name && item.name && String(g.name).toLowerCase().trim() === String(item.name).toLowerCase().trim());
      });
      setCurrentLibraryStatus(found ? (found.status || 'Playing') : null);
    };

    syncLibraryStatus();
    window.addEventListener('secretarea_profile_sync', syncLibraryStatus);

    let unsubFirestore: (() => void) | null = null;
    if (auth.currentUser) {
      try {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        unsubFirestore = onSnapshot(userDocRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            const libList = data.library || data.libraryGames || [];
            const found = libList.find((g: any) => {
              if (!g) return false;
              if (typeof g === 'string') return g.toLowerCase() === String(item.id).toLowerCase();
              return (g.id && String(g.id).toLowerCase() === String(item.id).toLowerCase()) ||
                     (g.gameId && String(g.gameId).toLowerCase() === String(item.id).toLowerCase()) ||
                     (g.name && item.name && String(g.name).toLowerCase().trim() === String(item.name).toLowerCase().trim());
            });
            setCurrentLibraryStatus(found ? (found.status || 'Playing') : null);
          }
        }, () => {});
      } catch (e) {}
    }

    return () => {
      window.removeEventListener('secretarea_profile_sync', syncLibraryStatus);
      if (unsubFirestore) unsubFirestore();
    };
  }, [item.id, item.name, isGuestMode, currentUser]);

  // Click outside to close favorite/library dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (favoriteDropdownRef.current && !favoriteDropdownRef.current.contains(e.target as Node)) {
        setShowFavoriteDropdown(false);
      }
    };
    if (showFavoriteDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFavoriteDropdown]);

  const handleSelectLibraryStatus = async (status: string) => {
    setShowFavoriteDropdown(false);
    const activeUid = auth.currentUser?.uid || (isGuestMode || localStorage.getItem('secret_area_unlocked') === 'true' ? 'guest' : null);
    if (!activeUid) {
      if (showGuestNotification) showGuestNotification();
      return;
    }

    try {
      if (currentLibraryStatus === status) {
        // Clicking already active status removes it from Library
        await removeGameFromLibrary(activeUid, item.id);
        setCurrentLibraryStatus(null);
        setLibraryFeedback(t('Removed from Library') || 'Removed from Library');
        setTimeout(() => setLibraryFeedback(null), 2500);
      } else {
        await recordGameInteraction(activeUid, {
          id: item.id,
          name: item.name,
          coverImage: item.coverImage || '',
          category: item.category || 'Game',
          genres: item.genres || '',
          version: item.version || 'v1.0',
          repackSize: item.repackSize || '',
          description: item.description || '',
          links: item.links || null
        }, 'library', status);
        setCurrentLibraryStatus(status);
        setLibraryFeedback(`${t('Added to Library') || 'Added to Library'}: ${t(status)}`);
        setTimeout(() => setLibraryFeedback(null), 2500);
      }
    } catch (err) {
      console.error("Error updating library status:", err);
    }
  };

  const handleRemoveLibraryItem = async () => {
    setShowFavoriteDropdown(false);
    const activeUid = auth.currentUser?.uid || (isGuestMode || localStorage.getItem('secret_area_unlocked') === 'true' ? 'guest' : null);
    if (!activeUid) return;
    try {
      await removeGameFromLibrary(activeUid, item.id);
      setCurrentLibraryStatus(null);
      setLibraryFeedback(t('Removed from Library') || 'Removed from Library');
      setTimeout(() => setLibraryFeedback(null), 2500);
    } catch (err) {
      console.error("Error removing from library:", err);
    }
  };

  const handleToggleFavorite = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const nextFavorite = !isFavorite;
    setIsFavorite(nextFavorite);

    if (toggleStash) {
      toggleStash(item.id, e, item);
    } else {
      const activeUid = auth.currentUser?.uid || (isGuestMode || localStorage.getItem('secret_area_unlocked') === 'true' ? 'guest' : null);
      if (activeUid) {
        await recordGameInteraction(activeUid, {
          id: item.id,
          name: item.name,
          coverImage: item.coverImage || '',
          category: item.category || 'game',
          genres: item.genres || '',
          version: item.version || 'v1.0',
          repackSize: item.repackSize || '',
          description: item.description || '',
          links: item.links || null
        }, nextFavorite ? 'favorite' : 'unfavorite');
      }
    }
  };

  const handleCopyGameId = () => {
    if (item.gameId) {
      navigator.clipboard.writeText(item.gameId);
      setIsCopiedGameId(true);
      setTimeout(() => setIsCopiedGameId(false), 2000);
    }
  };

  const handleCopyLink = () => {
    const base = window.location.origin + window.location.pathname;
    const url = `${base}#/?item=${item.id}`;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleReportBrokenLink = () => {
    const whatsappMessage = `*{t('Report Broken Link')} in Secret Area*\n\n*Item Name:* ${item.name}\n*Item ID:* ${item.id}\n*Category:* ${item.category}\n\nPlease check this link, it seems to be down. Thanks!`;
    const phoneNumber = '212723242286';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(url, '_blank');
  };

  const isSteamTool = item.category === 'steamtools';
  const isExtra = item.category === 'extra';

  const recommendedScrollRef = React.useRef<HTMLDivElement>(null);
  const handleScrollRecommended = (direction: 'left' | 'right') => {
      if (recommendedScrollRef.current) {
          const scrollAmount = recommendedScrollRef.current.clientWidth * 0.6;
          const modifier = dir === 'rtl' ? -1 : 1;
          const actualDirection = direction === 'left' ? -scrollAmount : scrollAmount;
          recommendedScrollRef.current.scrollBy({ left: actualDirection * modifier, behavior: 'smooth' });
      }
  };

  const recommendedItems = React.useMemo(() => {
      if (!allResources || !allResources[item.category]) return [];
      
      let recommendations: ResourceItem[] = [];
      
      if (item.category === 'game' || item.category === 'hypervisor') {
          const itemGenres = item.genres ? item.genres.split(',').map(g => g.trim().toLowerCase()).filter(Boolean) : [];
          
          let exactMatches: ResourceItem[] = [];
          let partialMatches: ResourceItem[] = [];
          
          // Priority 1: Use context genre if user was browsing a specific genre
          // Priority 2: Fallback to the game's first genre
          const targetGenre = currentGenreContext 
              ? currentGenreContext.toLowerCase() 
              : (itemGenres[0] || '');
              
          allResources[item.category].forEach(resource => {
              if (resource.id === item.id) return;
              if (!resource.genres) return;
              
              const resourceGenres = resource.genres.split(',').map(g => g.trim().toLowerCase()).filter(Boolean);
              
              if (targetGenre && resourceGenres.includes(targetGenre)) {
                  exactMatches.push(resource);
              } else if (itemGenres.some(g => resourceGenres.includes(g))) {
                  partialMatches.push(resource);
              }
          });
          
          exactMatches = exactMatches.sort(() => 0.5 - Math.random());
          partialMatches = partialMatches.sort(() => 0.5 - Math.random());
          
          recommendations = [...exactMatches, ...partialMatches];
      } else {
          // For non-game categories like steamtools, extra (Architect/tools), etc.
          // Use smart name/keyword matching
          const itemWords = item.name.toLowerCase().split(/[\s\-_]+/).filter(w => w.length > 2);
          recommendations = allResources[item.category].filter(resource => {
              if (resource.id === item.id) return false;
              const resourceWords = resource.name.toLowerCase().split(/[\s\-_]+/).filter(w => w.length > 2);
              return itemWords.some(w => resourceWords.includes(w));
          });
          
          // Randomize keyword matches
          recommendations = [...recommendations].sort(() => 0.5 - Math.random());
      }
      
      // Smart fallback: if we don't have enough recommendations (less than 8), 
      // fill the rest with other items in the same category automatically to ensure the section is never empty.
      if (recommendations.length < 8) {
          const existingIds = new Set(recommendations.map(r => r.id));
          existingIds.add(item.id);
          const fillers = allResources[item.category].filter(r => !existingIds.has(r.id));
          // Randomize fallbacks as well
          const randomizedFillers = [...fillers].sort(() => 0.5 - Math.random());
          recommendations = [...recommendations, ...randomizedFillers];
      }
      
      // Return ALL items to show the true number of matching products
      return recommendations;
  }, [item, allResources]);

  React.useEffect(() => {
    const container = document.getElementById('modal-scroll-container');
    if (container) {
      container.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [item.id]);

  React.useEffect(() => {
    if (initialScrollTarget) {
      setTimeout(() => {
        const el = document.getElementById(initialScrollTarget);
        const container = document.getElementById('modal-scroll-container');
        if (el && container) {
          const y = el.getBoundingClientRect().top + container.scrollTop - container.getBoundingClientRect().top - 80;
          container.scrollTo({ top: y, behavior: 'smooth' });
        } else if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 350);
    }
  }, [initialScrollTarget]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      dir={dir} 
      id="modal-scroll-container"
      className="fixed top-16 left-0 right-0 bottom-0 z-40 bg-slate-50 dark:bg-[#0B1120] overflow-y-auto custom-scrollbar flex flex-col w-full h-full pb-16 sm:pb-20 md:pb-16"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header with Breadcrumb and Close Button */}
      <div className="sticky top-0 z-50 bg-slate-50/90 dark:bg-[#0B1120]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/50 px-4 sm:px-8 py-4 flex items-center justify-between">
         <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 overflow-hidden">
            <span className="hover:text-primary-500 cursor-pointer shrink-0 transition-colors" onClick={onClose}>{t('Home')}</span>
            <span className="shrink-0">/</span>
            <span 
              className="hover:text-primary-500 cursor-pointer capitalize shrink-0 transition-colors" 
              onClick={() => {
                if (onCategoryClick) {
                  onCategoryClick(item.category);
                } else {
                  onClose();
                }
              }}
            >
              {getBreadcrumbCategoryLabel(item.category, item.id)}
            </span>
            <span className="shrink-0">/</span>
            <span className="text-slate-900 dark:text-white font-semibold truncate max-w-[200px] sm:max-w-md">{item.name}</span>
         </div>
         <button onClick={onClose} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800">
             <Icon name="X" size={24} />
         </button>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 space-y-12">
          {/* Top Hero Section */}
          <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Column (Cover + Trailer) */}
              <div className="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-4">
                  <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-2xl relative border border-slate-200 dark:border-slate-800 group">
                      <LikeButton item={item} t={t} />
                      <img src={item.coverImage} alt={item.name} className="w-full h-full object-cover" />
                      {item.category === 'hypervisor' && (
                         <div className="absolute top-3 start-3 bg-red-600/90 backdrop-blur text-white px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest shadow-lg border border-red-500/50 z-20">
                             HV
                         </div>
                      )}
                  </div>
                  
                  {item.category === 'steamtools' && item.ratingPositive && (
                      <div className="grid grid-cols-2 gap-3 my-4">
                         {/* Left Card */}
                         <div className="bg-slate-100 dark:bg-[#282a32] rounded-xl p-3 flex flex-col items-center justify-center shadow-sm">
                            <div className="flex items-center gap-2 text-2xl font-bold">
                               <span className="text-2xl drop-shadow-md">
                                  {Number(item.ratingPositive) >= 90 ? '🤩' : Number(item.ratingPositive) >= 70 ? '😎' : '😐'}
                               </span>
                               <span className={Number(item.ratingPositive) >= 70 ? "text-[#4FD033]" : "text-[#F5C341]"}>
                                  {item.ratingPositive}%
                               </span>
                            </div>
                            <span className={`text-sm font-medium mt-1 ${Number(item.ratingPositive) >= 70 ? "text-[#4FD033]" : "text-[#F5C341]"}`}>
                               {Number(item.ratingNegative) ? (Math.floor(Number(item.ratingNegative) * 31.8) >= 1000 ? (Math.floor(Number(item.ratingNegative) * 31.8) / 1000).toFixed(0) + 'k' : Math.floor(Number(item.ratingNegative) * 31.8)) : '0'} {t('reviews')}
                            </span>
                         </div>
                    
                         {/* Right Card */}
                         <div className="bg-slate-100 dark:bg-[#282a32] rounded-xl p-3 flex flex-col items-center justify-center shadow-sm">
                            <div className="text-2xl font-bold text-[#F5C341]">
                               {Number(item.ratingNegative) ? Number(item.ratingNegative).toLocaleString() : '0'}
                            </div>
                            <span className="text-[#F5C341] text-sm font-medium mt-1">{t('In-Game')}</span>
                         </div>
                      </div>
                  )}

                  {item.links?.trailer && (
                     <button onClick={() => setShowTrailer(true)} className="w-full py-3 sm:py-4 bg-slate-800 hover:bg-slate-700 text-white dark:bg-slate-800/50 dark:hover:bg-slate-800 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors border border-slate-700">
                        <Icon name="Youtube" size={20} className="text-primary-500 rtl:rotate-180" />
                        {t('Watch Trailer')}
                     </button>
                  )}
                  
              </div>

              {/* Right Column (Details) */}
              <div className="flex-1 flex flex-col min-w-0">
                 <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4 leading-tight">
                     {item.name}
                 </h1>

                 {/* Rating and Meta Row */}
                 <div className="flex flex-wrap items-center gap-4 mb-6">
                     <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                         {t('RATE & REVIEW')}
                     </div>
                     <div className="flex items-center gap-1 bg-slate-800/10 dark:bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700/50 text-xs font-bold text-slate-700 dark:text-slate-300">
                         <Icon name="Star" size={14} className="text-amber-500" />
                         <Icon name="Star" size={14} className="text-amber-500" />
                         <Icon name="Star" size={14} className="text-amber-500" />
                         <Icon name="Star" size={14} className="text-amber-500" />
                         <Icon name="Star" size={14} className={item.id.charCodeAt(0) % 2 === 0 ? 'text-amber-500' : 'text-slate-300'} />
                         <span className="ms-1 text-slate-500 dark:text-slate-400">
                             {((item.id.charCodeAt(0) % 11) / 10 + 4.0).toFixed(1)} / 5.0 ({(item.id.charCodeAt(0) * 123) % 5000 + 100} {t('reviews')})
                         </span>
                     </div>
                 </div>

                 {/* Quick Stats Row */}
                 <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-slate-600 dark:text-slate-400 mb-6 font-medium">
                     <div className="flex items-center gap-2 bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded font-bold text-slate-900 dark:text-slate-200 text-xs">
                         PC
                     </div>
                     {item.repackSize && <span>{item.repackSize}</span>}
                     {item.originalSize && <span className="opacity-60 line-through text-xs">{item.originalSize}</span>}
                     {item.id && <span>ID : {item.id}</span>}
                     {item.languages && <span className="opacity-80">{t('Languages')}: {item.languages}</span>}
                     {item.category === 'steamtools' && item.gameId && (
                         <button 
                            onClick={handleCopyGameId}
                            className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity text-blue-600 dark:text-blue-400 font-bold"
                         >
                            GameID: {item.gameId}
                            <Icon name={isCopiedGameId ? "Check" : "Copy"} size={14} />
                         </button>
                     )}
                     <div 
                         onClick={() => setShowUploaderPopup(true)}
                         className="flex items-center gap-2 ms-auto bg-amber-500/10 dark:bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 px-3.5 py-1.5 rounded-full border border-amber-500/30 cursor-pointer transition-all shadow-xs group hover:scale-[1.03] active:scale-95"
                         title={t('Verified Uploader & System Admin')}
                     >
                         <div className="w-6 h-6 rounded-full overflow-hidden border border-amber-500/50 bg-amber-500/20 flex items-center justify-center shrink-0 ring-1 ring-amber-500/40 shadow-xs">
                            {adminAvatar ? (
                               <img 
                                  src={adminAvatar} 
                                  alt={adminDisplayName || "Admin"} 
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                                  onError={() => setAdminAvatar('/images/logo01.png')}
                               />
                            ) : (
                               <img 
                                  src="/images/logo01.png" 
                                  alt={adminDisplayName || "Admin"} 
                                  className="w-full h-full object-contain p-0.5" 
                               />
                            )}
                         </div>
                         <div className="flex items-center gap-1.5">
                            <span className="text-[11px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-black flex items-center gap-1">
                                <TbShieldCheck size={13} className="text-amber-500" />
                                {t('Admin')}
                            </span>
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{adminDisplayName || 'SecretArea'}</span>
                         </div>
                     </div>
                 </div>

                 {/* Action Buttons Row */}
                 <div className="flex flex-wrap items-center gap-3 mb-8">
                     {item.category !== 'steamtools' && (
                         <div className="px-3 py-2 bg-emerald-500 text-white text-sm font-bold rounded-lg border border-emerald-600">
                             V {item.version || '1.0'}
                         </div>
                     )}
                     <div className="px-3 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-700 dark:text-emerald-400 text-sm font-bold rounded-lg border border-emerald-500/20 flex items-center gap-2">
                         <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Latest
                     </div>
                     
                      <div className="relative" ref={favoriteDropdownRef}>
                          <button 
                              onClick={() => setShowFavoriteDropdown(!showFavoriteDropdown)} 
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-bold transition-all shadow-sm ${
                                  currentLibraryStatus
                                      ? 'bg-[#29aaea] text-white border-[#29aaea] shadow-[#29aaea]/20'
                                      : isFavorite 
                                          ? 'bg-amber-500 text-white border-amber-600 shadow-amber-500/20' 
                                          : 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                              }`}
                          >
                              <Icon name="Bookmark" size={16} className={isFavorite ? "fill-current text-white" : ""} />
                              <span>
                                  {currentLibraryStatus 
                                      ? t(currentLibraryStatus) 
                                      : (isFavorite ? t("Favorites") : t("Favorite"))}
                              </span>
                              {currentLibraryStatus && (
                                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                              )}
                              <Icon name="ChevronDown" size={12} className={`transition-transform duration-200 ${showFavoriteDropdown ? "rotate-180" : ""}`} />
                          </button>

                          {/* Feedback Toast */}
                          {libraryFeedback && (
                              <div className="absolute top-full start-0 mt-1.5 px-3 py-1 bg-slate-900/95 dark:bg-black/95 text-emerald-400 border border-emerald-500/40 rounded-lg text-xs font-semibold shadow-xl backdrop-blur-sm z-50 whitespace-nowrap">
                                  ✓ {libraryFeedback}
                              </div>
                          )}

                          {showFavoriteDropdown && (
                              <div className="absolute top-full start-0 mt-2 w-56 bg-white dark:bg-[#151b28] border border-slate-200 dark:border-slate-700/80 rounded-xl shadow-2xl z-50 overflow-hidden text-sm font-medium py-1.5 backdrop-blur-md">
                                  {/* Quick Favorite/Bookmark toggle */}
                                  <button 
                                      onClick={(e) => { handleToggleFavorite(e); }} 
                                      className="w-full text-start px-3.5 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center justify-between transition-colors group"
                                  >
                                      <span className="flex items-center gap-2.5 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm">
                                          <Icon name="Bookmark" size={15} className={isFavorite ? "fill-amber-400 text-amber-400" : "text-slate-400 group-hover:text-amber-400"} />
                                          {isFavorite ? t("Remove from Favorites") : t("Add to Favorites")}
                                      </span>
                                      {isFavorite && (
                                          <span className="text-[11px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">★</span>
                                      )}
                                  </button>

                                  <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5 border-t border-slate-200/80 dark:border-slate-700/70 mt-1">
                                      <Icon name="Gamepad" size={12} className="text-[#29aaea]" />
                                      {t("Library Status")}
                                  </div>

                                  {/* The 5 Library Statuses */}
                                  {[
                                      { id: "Playing", label: "Playing", dot: "bg-emerald-500", text: "text-emerald-500 dark:text-emerald-400", activeBg: "bg-emerald-500/10 dark:bg-emerald-500/15" },
                                      { id: "Plan to Play", label: "Plan to Play", dot: "bg-sky-500", text: "text-sky-500 dark:text-sky-400", activeBg: "bg-sky-500/10 dark:bg-sky-500/15" },
                                      { id: "Completed", label: "Completed", dot: "bg-purple-500", text: "text-purple-500 dark:text-purple-400", activeBg: "bg-purple-500/10 dark:bg-purple-500/15" },
                                      { id: "On Hold", label: "On Hold", dot: "bg-amber-500", text: "text-amber-500 dark:text-amber-400", activeBg: "bg-amber-500/10 dark:bg-amber-500/15" },
                                      { id: "Dropped", label: "Dropped", dot: "bg-rose-500", text: "text-rose-500 dark:text-rose-400", activeBg: "bg-rose-500/10 dark:bg-rose-500/15" },
                                  ].map((status) => {
                                      const isCurrent = currentLibraryStatus === status.id;
                                      return (
                                          <button 
                                              key={status.id} 
                                              onClick={() => handleSelectLibraryStatus(status.id)} 
                                              className={`w-full text-start px-3.5 py-2 flex items-center justify-between text-xs sm:text-sm transition-colors ${
                                                  isCurrent 
                                                      ? `${status.activeBg} font-bold text-slate-900 dark:text-white` 
                                                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                                              }`}
                                          >
                                              <span className="flex items-center gap-2.5">
                                                  <span className={`w-2 h-2 rounded-full ${status.dot} ${isCurrent ? "ring-2 ring-current" : "opacity-70"}`} />
                                                  <span>{t(status.label)}</span>
                                              </span>
                                              {isCurrent && (
                                                  <span className={`text-xs font-bold ${status.text} flex items-center gap-1`}>
                                                      ✓ <span className="text-[10px] opacity-80 font-normal">({t("Library")})</span>
                                                  </span>
                                              )}
                                          </button>
                                      );
                                  })}

                                  {/* Remove from Library option */}
                                  {currentLibraryStatus && (
                                      <div className="pt-1 mt-1 border-t border-slate-200/80 dark:border-slate-700/70">
                                          <button
                                              onClick={handleRemoveLibraryItem}
                                              className="w-full text-start px-3.5 py-2 text-xs text-rose-500 dark:text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors font-semibold"
                                          >
                                              <Icon name="X" size={13} />
                                              {t("Remove from Library")}
                                          </button>
                                      </div>
                                  )}
                              </div>
                          )}
                      </div>

                     <button onClick={handleReportBrokenLink} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-bold transition-all">
                         <Icon name="AlertTriangle" size={16} /> {t('Report')}
                     </button>
                     
                     <button onClick={handleCopyLink} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-bold transition-all">
                         <Icon name={isCopied ? "Check" : "Link"} size={16} className={isCopied ? "text-emerald-900 dark:text-emerald-500" : ""} /> {t('Share Link')}
                     </button>
                 </div>

                 {item.description && (
                 <>
                 {/* Description */}
                 <div className="prose prose-slate dark:prose-invert max-w-none mb-8 max-h-[300px] overflow-y-auto custom-scrollbar pe-4">
                     <p className="text-base leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap" dir="auto">
                         {item.description}
                     </p>
                 </div>

                 </>
                 )}
                 {/* Metadata Boxes */}
                 <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-6">
                     {item.dateAdded && (
                         <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                             <span className="text-xs text-slate-500 dark:text-slate-400">{t('Released')} /</span>
                             <span className="text-sm font-bold text-slate-900 dark:text-white">{item.dateAdded}</span>
                         </div>
                     )}
                     {resolvedDev && (
                         <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                             <span className="text-xs text-slate-500 dark:text-slate-400">{['architect', 'extra'].includes(item.category) ? t('Dev Studio') : t('Game Studio')} /</span>
                             <span className="text-sm font-bold text-slate-900 dark:text-white cursor-pointer hover:text-primary-500 transition-colors" onClick={(e) => { e.stopPropagation(); if(onCompanyClick) onCompanyClick(resolvedDev); }}>{resolvedDev}</span>
                         </div>
                     )}
                 </div>

                 {/* Genres */}
                 {item.genres && (
                     <div className="flex flex-wrap items-center gap-2 mb-8">
                         <span className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold rounded flex items-center gap-1">
                             {t('Genres')} <Icon name="ChevronRight" size={14} className="rtl:rotate-180" />
                         </span>
                         {item.genres.split(',').map((genre, idx) => (
                             <span key={idx} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-xs font-bold rounded border border-slate-200 dark:border-slate-700/50 cursor-pointer hover:border-primary-500/50 transition-colors" onClick={() => onGenreClick?.(genre.trim())}>
                                 {genre.trim()}
                             </span>
                         ))}
                     </div>
                 )}

                 {/* Steam & Download Actions */}
                 <div className="flex flex-col sm:flex-row items-center gap-4">
                      {item.category === 'architect' ? (
                          <a href="https://t.me/secretarea1337" target="_blank" rel="noreferrer" className="w-full sm:w-auto flex-1 flex items-center justify-between px-4 py-3 bg-[#2AABEE]/10 hover:bg-[#2AABEE]/20 rounded-xl border border-[#2AABEE]/30 transition-all text-slate-900 dark:text-white">
                              <div className="flex items-center gap-3">
                                  <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzS8azG7PVRzinq2bwi1bFK0wF9XYCyXR1IUnaj0hwWQ&s=10" alt="Telegram" className="w-6 h-6 object-contain rounded-full" />
                                  <div className="flex flex-col text-start">
                                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{t('Join our community')}</span>
                                      <span className="text-sm font-bold text-[#2AABEE]">{t('Get it on Telegram')}</span>
                                  </div>
                              </div>
                              <Icon name="ExternalLink" size={20} className="text-[#2AABEE]" />
                          </a>
                      ) : item.category === 'extra' ? null : (
                          <a href={`https://steamdb.info/search/?a=app&q=${encodeURIComponent(item.name)}`} target="_blank" rel="noreferrer" className="w-full sm:w-auto flex-1 flex items-center justify-between px-4 py-3 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 transition-all text-slate-900 dark:text-white">
                              <div className="flex items-center gap-3">
                                  <Icon name="Database" size={24} />
                                  <div className="flex flex-col text-start">
                                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{t('Check database stats and info')}</span>
                                      <span className="text-sm font-bold">{t('Get it on SteamDB')}</span>
                                  </div>
                              </div>
                              <Icon name="ExternalLink" size={20} className="text-slate-400" />
                          </a>
                      )}
                 </div>
                 <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
                      <button onClick={() => {
                          const el = document.getElementById('download');
                          const container = document.getElementById('modal-scroll-container');
                          if (el && container) {
                              const y = el.getBoundingClientRect().top + container.scrollTop - container.getBoundingClientRect().top - 80;
                              container.scrollTo({ top: y, behavior: 'smooth' });
                          } else if (el) {
                              el.scrollIntoView({ behavior: 'smooth' });
                          }
                          // Add to Library and grant points
                          import('../src/firebase').then(({ auth, db }) => {
                              if (auth.currentUser) {
                                  import('firebase/firestore').then(({ doc, updateDoc, arrayUnion, increment }) => {
                                      const docRef = doc(db, 'users', auth.currentUser?.uid);
                                      const libGame = {
                                          id: item.id || '',
                                          name: item.name || '',
                                          coverImage: item.coverImage || '',
                                          timestamp: new Date().toISOString()
                                      };
                                      updateDoc(docRef, {
                                          points: increment(10),
                                          libraryGames: arrayUnion(libGame)
                                      }).catch((err) => {
                                          console.warn("Library sync note (handled):", err?.message);
                                      });
                                  });
                              }
                          });
                      }} className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary-500/25">
                          {t('Download')} <Icon name="Download" size={20} className="rtl:rotate-180" />
                      </button>

                      

                      
                      {item.galleryImages && item.galleryImages.length > 0 && (
                      <button onClick={() => {
                          const el = document.getElementById('features');
                          const container = document.getElementById('modal-scroll-container');
                          if (el && container) {
                              const y = el.getBoundingClientRect().top + container.scrollTop - container.getBoundingClientRect().top - 80;
                              container.scrollTo({ top: y, behavior: 'smooth' });
                          } else if (el) {
                              el.scrollIntoView({ behavior: 'smooth' });
                          }
                      }} className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-slate-800 hover:bg-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-700 text-white rounded-xl font-bold transition-all border border-slate-700">
                          <Icon name="Zap" size={20} /> Game Features
                      </button>
                      )}
                 </div>
              </div>
          </div>

          {/* N E X A 1337 message note if available */}
          {item.links?.fullNote && (
              <div className="w-full bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-xl p-4 flex gap-4">
                 <div className="text-blue-500 shrink-0">
                     <Icon name="Info" size={24} />
                 </div>
                 <div>
                     <h4 className="text-sm font-bold text-blue-900 dark:text-blue-400 uppercase tracking-widest mb-1">{t('N E X A 1337 Says')}</h4>
                     <p className="text-sm text-blue-800 dark:text-blue-300">{item.links?.fullNote}</p>
                 </div>
              </div>
          )}

          {/* Gallery Section */}
          {item.galleryImages && item.galleryImages.length > 0 && (
              <div id="features" className="space-y-6 pt-8">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white text-center mb-8 tracking-tight">{t('Game Screenshots Gallery')}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {item.galleryImages.map((img, idx) => (
                          <div key={idx} className="aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-primary-500 transition-colors group">
                              {img.endsWith('.webm') || img.endsWith('.mp4') ? (
                                  <video src={img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" muted loop autoPlay playsInline />
                              ) : (
                                  <img src={img} alt={`${item.name} screenshot ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                              )}
                          </div>
                      ))}
                  </div>
              </div>
          )}

                                                        {/* Unified Details Section - Full Width */}
          </div>
          <div className="w-full bg-slate-50 dark:bg-[#0F172A] border-y border-slate-200 dark:border-slate-800 mt-8">
              <div className="max-w-7xl mx-auto w-full px-4 sm:px-8">
                  <div className="flex flex-col">
                  {item.systemReqs && item.systemReqs.length > 0 && (
                  <>
                  {/* System Requirements */}
                  <div className="py-6 sm:py-12 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-4 mb-8">
                          <div className="w-12 h-12 bg-purple-500/10 text-purple-500 rounded-xl flex items-center justify-center">
                              <Icon name="Cpu" size={24} />
                          </div>
                          <div>
                              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('System Requirements')}</h3>
                              <p className="text-sm text-slate-500 dark:text-slate-400">{t('Minimum specifications needed')}</p>
                          </div>
                      </div>
                      
                      <HardwareCompatibility requirements={item.systemReqs} globalSpecs={globalSpecs} />
                      <div className="mb-8"></div>
                      <div className="text-center text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
                          REQUIRES A 64-BIT PROCESSOR AND OPERATING SYSTEM
                      </div>
                      <div className="space-y-4">
                          {item.systemReqs && item.systemReqs.map((req, idx) => (
                              <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-200/50 dark:border-slate-800/50 pb-3 last:border-0 last:pb-0">
                                  <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                                      {req.label.toLowerCase().match(/os|operating system|windows/) && <Icon name="Windows" size={16} />}
                                      {req.label.toLowerCase().match(/processor|cpu/) && <Icon name="Cpu" size={16} />}
                                      {req.label.toLowerCase().match(/memory|ram/) && <Icon name="RAM" size={16} />}
                                      {req.label.toLowerCase().match(/graphics|gpu|video/) && <Icon name="GPU" size={16} />}
                                      {req.label.toLowerCase().match(/storage|hdd|ssd|disk space/) && <Icon name="Storage" size={16} />}
                                      {req.label}
                                  </span>
                                  <span className="text-slate-900 dark:text-slate-200 font-bold text-end max-w-[60%]">{req.value}</span>
                              </div>
                          ))}
                      </div>
                  </div>

                  </>
                  )}
                  {/* Installation Steps */}
                  {item.installSteps && item.installSteps.length > 0 && (
                  <div className="py-6 sm:py-12 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-4 mb-2">
                          <div className="w-10 h-10 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center">
                              <Icon name="List" size={20} />
                          </div>
                          <div>
                              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('Installation Steps')}</h3>
                          </div>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 ms-14">{t('Follow these steps to safely install and set up your Games and Apps.')}</p>
                      
                      <div className="space-y-4 ms-14">
                          {item.installSteps.map((step, idx) => (
                              <div key={idx} className="flex gap-4">
                                  <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                      {idx + 1}
                                  </div>
                                  <div className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: step }} />
                              </div>
                          ))}
                      </div>
                  </div>
                  )}

                  {/* Hypervisor Bypass Alert */}
                  {item.category === 'hypervisor' && (
                  <div className="py-6 border-b border-slate-200 dark:border-slate-800">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                          <Icon name="HelpCircle" size={24} className="text-blue-500" />
                          {t('What is a hypervisor bypass?')}
                      </h3>
                      <div className="w-full bg-red-50 dark:bg-[#1e1416] border border-red-200 dark:border-[#3b1c20] rounded-xl p-4 sm:p-6 flex flex-col gap-2 transition-colors">
                         <h4 className="text-red-600 dark:text-red-400 font-medium">
                            {t('Please read this article before proceeding with downloading and installation:')}
                         </h4>
                         <a href="https://fitgirl-repacks.site/hypervisor-guide/" onClick={(e) => { e.preventDefault(); setShowHypervisorGuide(true); }} className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 underline underline-offset-4 decoration-red-600/30 dark:decoration-red-500/30 font-medium transition-colors break-all">
                            https://fitgirl-repacks.site/hypervisor-guide/
                         </a>
                      </div>
                  </div>
                  )}

                  {item.toolsNeeded && item.toolsNeeded.length > 0 && (
                  <>
                  {/* Tools You Need */}
                  <div className="py-6 sm:py-12 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-4 mb-6">
                          <div className="w-10 h-10 bg-orange-500/10 text-orange-500 rounded-xl flex items-center justify-center">
                              <Icon name="Wrench" size={20} />
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('Tools You Need')}</h3>
                      </div>
                      <div className="flex flex-wrap gap-3">
                          {item.toolsNeeded && item.toolsNeeded.map((tool, idx) => (
                              <a key={idx} href={tool.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-primary-500/50 transition-colors">
                                  <Icon name="Terminal" size={16} className="text-slate-400" />
                                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{tool.name}</span>
                              </a>
                          ))}
                          {(!item.toolsNeeded || item.toolsNeeded.length === 0) && (
                              <div className="text-sm text-slate-500 dark:text-slate-400">{t('No specific tools required for this game.')}</div>
                          )}
                      </div>
                  </div>

                  </>
                  )}
                  {/* N E X A 1337 Alert */}
                  <div className="py-6 border-b border-slate-200 dark:border-slate-800">
                      <div className="w-full bg-[#fdf8f6] dark:bg-slate-900 border-l-4 border-amber-500 rounded-r-xl p-4 flex gap-4">
                         <div className="text-amber-500 shrink-0 mt-1">
                             <Icon name="AlertTriangle" size={24} />
                         </div>
                         <div>
                             <h4 className="font-bold text-amber-500 mb-2">{t('N E X A 1337 Says :')}</h4>
                             <p className="text-amber-600 dark:text-amber-500/80 text-sm mb-1">
                                 {t('Support the original developers and creators by purchasing legitimate copies of their products.')}
                             </p>
                             <p className="text-amber-600 dark:text-amber-500/80 text-sm mb-1">
                                 {t('All trademarks, copyrights, and intellectual property belong to their respective owners.')}
                             </p>
                             <p className="text-amber-600 dark:text-amber-500/80 text-sm">
                                 {t('If you are a rights holder and wish to request content removal, please contact us.')}
                             </p>
                         </div>
                      </div>
                  </div>

                  {/* Streamer Section */}
                  <div className="py-6 sm:py-12 border-b border-slate-200 dark:border-slate-800" dir={dir}>
                      <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col lg:flex-row">
                          {/* Image Column */}
                          <div className="w-full lg:w-5/12 relative bg-[#09090b] flex items-center justify-center min-h-[300px] lg:min-h-[500px]">
                              <img 
                                  src="/images/streamer.png" 
                                  alt="Streamer" 
                                  className="absolute inset-0 w-full h-full object-contain opacity-100 z-0"
                              />
                              {/* Mobile/Tablet bottom gradient */}
                              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-50 to-transparent dark:from-slate-900 pointer-events-none lg:hidden z-10" />
                              {/* Desktop side gradient */}
                              <div className={`hidden lg:block absolute inset-y-0 ${dir === 'rtl' ? 'left-0 w-40 bg-gradient-to-r' : 'right-0 w-40 bg-gradient-to-l'} from-slate-50 to-transparent dark:from-slate-900 pointer-events-none z-10`} />
                          </div>
                          
                          {/* Content Column */}
                          <div className="w-full lg:w-7/12 p-8 lg:p-12 flex flex-col justify-center bg-slate-50 dark:bg-slate-900 z-10 relative">
                              <h4 className="text-primary-500 font-black tracking-widest uppercase text-xs sm:text-sm mb-4">
                                  {t('ONE PASSION. ONE COMMUNITY. FREEDOM TO PLAY.')}
                              </h4>
                              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-6 uppercase leading-tight">
                                  {t("WE DON'T JUST PLAY GAMES, WE LIVE THEM.")}
                              </h2>
                              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed mb-8">
                                  {t('Different players. Same passion. Same freedom. Come join a community where gaming brings us together, friendships grow, and everyone is free to play their way. No limits. No judgment. Just gaming, fun & good vibes.')}
                              </p>
                              
                              <div className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase mb-4 flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0"></span>
                                  {t('LIVE ON KICK • TIKTOK • YOUTUBE')}
                              </div>
                              
                              <div className="flex flex-wrap gap-3 mb-6">
                                  <a href="https://kick.com/secretarea1337" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-3 bg-[#53FC18] hover:bg-[#4AE315] text-black rounded-xl font-bold uppercase tracking-wider text-sm transition-transform active:scale-95 shadow-lg shadow-[#53FC18]/20">
                                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M5 2h4v8h2V6h2V4h6v6h-2v2h-2v2h2v2h2v6h-6v-2h-2v-4h-2v6H5V2z"/></svg>
                                      {t('WATCH LIVE')}
                                  </a>
                                  <a href="https://www.tiktok.com/@secretarea1337" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-3 bg-black hover:bg-slate-900 text-white rounded-xl font-bold uppercase tracking-wider text-sm transition-transform active:scale-95 shadow-lg border border-slate-700">
                                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 15.68l.01.02a6.33 6.33 0 0 0 11.23 4.04 6.27 6.27 0 0 0 1.54-4.2V8.65a8.21 8.21 0 0 0 3.84 1.34V6.52a5.06 5.06 0 0 1-2.03-.83Z"/></svg>
                                      {t('FOLLOW US')}
                                  </a>
                                  <a href="https://www.youtube.com/@SecretArea1337" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-3 bg-[#FF0000] hover:bg-[#E60000] text-white rounded-xl font-bold uppercase tracking-wider text-sm transition-transform active:scale-95 shadow-lg shadow-[#FF0000]/20">
                                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M21.582 6.186a2.6 2.6 0 0 0-1.826-1.834C18.145 3.9 12 3.9 12 3.9s-6.145 0-7.756.452a2.6 2.6 0 0 0-1.826 1.834C2 7.8 2 12 2 12s0 4.2.418 5.814a2.6 2.6 0 0 0 1.826 1.834C5.855 20.1 12 20.1 12 20.1s6.145 0 7.756-.452a2.6 2.6 0 0 0 1.826-1.834C22 16.2 22 12 22 12s0-4.2-.418-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                                      {t('SUBSCRIBE')}
                                  </a>
                              </div>
                              
                              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">
                                  {t('Your support keeps the stream alive.')} <span className="font-bold text-slate-800 dark:text-slate-200">{t('Your passion belongs here.')}</span>
                              </p>
                          </div>
                      </div>
                  </div>

                  {/* Download Channels */}
                  {((item.links?.full) || (item.links?.utorrent) || (item.links?.mirrors && item.links.mirrors.length > 0) || (item.links?.parts && item.links.parts.length > 0) || (item.links?.ankerParts && item.links.ankerParts.length > 0) || (item.links?.preInstalled && (item.links.preInstalled.download || item.links.preInstalled.cloudDrop || item.links.preInstalled.torrent))) && (
                  <div className="py-6 sm:py-12" id="download">
                      <div className="flex items-center gap-4 mb-6">
                          <div className="w-10 h-10 bg-primary-500/10 text-primary-500 rounded-xl flex items-center justify-center">
                              <Icon name="Download" size={20} />
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('Download Channels')}</h3>
                      </div>
                      
                      {item.links?.full && (
                          <div className="mb-6">
                              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">{t('Direct Full Download')}</h4>
                              <div className="relative">
                                  <div className="absolute -top-3 end-4 z-10 bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)] text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shadow-md">
                                      {t('Recommendation')}
                                  </div>
                                  <DownloadButton
                                      label={item.category === 'architect' ? `${t('Full project')} (${item.repackSize || item.originalSize || 'Size N/A'})` : ['steamtools', 'extra'].includes(item.category) ? t('Game Files') : `${t('Master File Magnet')} (${item.repackSize || item.originalSize || 'Size N/A'})`}
                                      sub={t('Direct Link')}
                                      href={item.links?.full}
                                      icon={['steamtools', 'architect', 'extra'].includes(item.category) ? "Download" : "Magnet"}
                                      imageUrl={item.category === 'architect' ? "https://cdn-icons-png.flaticon.com/512/8767/8767957.png" : item.category === 'extra' ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRh4ru3ji2f7YFR6JYvKnvkM6LRna6RVfnz8J_M7_kbJA&s=10" : item.category === 'steamtools' ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSLGNofupfGH5Rxt7lDZ4dKAzQhOJpRBo4GH5OIXr8pHW11lVdWcWyB1nr&s=10" : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQncl_6sUpjbAWmRH7VWRzcIHb6rN3ggXVQMESUax-qew&s=10"}
                                      onClick={['steamtools', 'architect', 'extra'].includes(item.category) ? undefined : (e) => {
                                        e.preventDefault();
                                        setTorrentWarningLink(item.links?.full || null);
                                      }}
                                  />
                              </div>
                          </div>
                      )}

                      {/* Magnet / Torrent Download for Tools (Architect) */}
                      {item.category === 'architect' && item.links?.utorrent && (
                          <div className="mb-6">
                              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">{t('Torrent / Magnet Download')}</h4>
                              <div className="relative">
                                  {!item.links?.full && (
                                      <div className="absolute -top-3 end-4 z-10 bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)] text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shadow-md">
                                          {t('Recommendation')}
                                      </div>
                                  )}
                                  <DownloadButton
                                      label={`${t('Master File Magnet')} (${item.repackSize || item.originalSize || 'Size N/A'})`}
                                      sub={t('Torrent')}
                                      href={item.links.utorrent}
                                      icon="Magnet"
                                      onClick={(e) => {
                                          e.preventDefault();
                                          setTorrentWarningLink(item.links?.utorrent || null);
                                      }}
                                  />
                              </div>
                          </div>
                      )}

                                                                  {/* Pre-Installed / SteamUnlocked */}
                      {item.links?.preInstalled && (item.links?.preInstalled?.download || item.links?.preInstalled?.cloudDrop || item.links?.preInstalled?.torrent) && (
                          <details className="mb-6 group">
                              <summary className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 transition-colors select-none list-none">
                                  <Icon name="ChevronRight" size={14} className="group-open:rotate-90 transition-transform" />
                                  <img src="https://dka575ofm4ao0.cloudfront.net/pages-transactional_logos/retina/802345/unnamed-b4a32b8b-803c-454f-a411-5a9c33494c3c.jpg" alt="SteamUnlocked" className="w-4 h-4 rounded-sm object-contain" /> {t('Pre-Installed / SteamUnlocked')}
                              </summary>
                              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mt-3">
                                  {item.links?.preInstalled?.download && (
                                      <DownloadButton
                                          label={`Download (${item.originalSize || item.repackSize || 'Size N/A'})`}
                                          sub={t('Direct Link')}
                                          href={item.links?.preInstalled?.download}
                                          icon="Download"
                                          imageUrl="https://dka575ofm4ao0.cloudfront.net/pages-transactional_logos/retina/802345/unnamed-b4a32b8b-803c-454f-a411-5a9c33494c3c.jpg"
                                          secondary
                                      />
                                  )}
                                  {item.links?.preInstalled?.cloudDrop && (
                                      <DownloadButton
                                          label="CloudDrop Mirror"
                                          sub={t('Mirror Link')}
                                          href={item.links?.preInstalled?.cloudDrop}
                                          icon="Cloud"
                                          imageUrl="https://dka575ofm4ao0.cloudfront.net/pages-transactional_logos/retina/802345/unnamed-b4a32b8b-803c-454f-a411-5a9c33494c3c.jpg"
                                          secondary
                                      />
                                  )}
                                  {item.links?.preInstalled?.torrent && (
                                      <DownloadButton
                                          label="utorrent File"
                                          sub={t('Torrent')}
                                          href={item.links?.preInstalled?.torrent}
                                          icon="Magnet"
                                          imageUrl="https://dka575ofm4ao0.cloudfront.net/pages-transactional_logos/retina/802345/unnamed-b4a32b8b-803c-454f-a411-5a9c33494c3c.jpg"
                                          secondary
                                          onClick={(e) => {
                                              e.preventDefault();
                                              setTorrentWarningLink(item.links?.preInstalled?.torrent || null);
                                          }}
                                      />
                                  )}
                              </div>
                          </details>
                      )}
                      
                      {( (item.links?.mirrors && item.links.mirrors.length > 0) || (item.links?.parts && item.links.parts.length > 0) ) && (
                          <details className="mb-6 group">
                              <summary className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 transition-colors select-none list-none">
                                  <Icon name="ChevronRight" size={14} className="group-open:rotate-90 transition-transform" />
                                  <img src={item.category === 'architect' ? "https://cdn-icons-png.flaticon.com/512/7063/7063204.png" : item.category === 'extra' ? "https://images.icon-icons.com/3053/PNG/512/google_backup_and_sync_macos_bigsur_icon_190135.png" : item.category === 'steamtools' ? "https://play-lh.googleusercontent.com/WNNDb4VyH2yXBwFME6OTWZKhVFPDnQt2xoJeXPcRZSBcnDoMD1JAHQc1GAzu9pH04wCUhFrxfGD1yEE2Bg9HXA=s0-br30" : "https://fitgirl-repacks.site/wp-content/uploads/2016/08/icon.jpg"} alt="Logo" className="w-4 h-4 rounded-sm object-contain" /> {['steamtools', 'architect', 'extra'].includes(item.category) ? t('Backup Server') : t('FitGirl Repack Links')} ({((item.links?.mirrors?.length || 0) + (item.links?.parts?.length || 0))})
                              </summary>
                              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mt-3">
                                  {item.links?.parts && item.links.parts.map(part => (
                                      <DownloadButton
                                          key={'part_'+part.id}
                                          label={['architect', 'extra'].includes(item.category) ? `Part ${String(part.id).padStart(2, '0')}` : item.category === 'steamtools' ? `Mirror Link ${String(part.id).padStart(2, '0')}` : (String(part.id) === '1' ? 'DataNodes' : `DataNodes Part ${part.id}`)}
                                          badge={['steamtools', 'architect', 'extra'].includes(item.category) ? undefined : (String(part.id) === '1' ? '(Speed & Usability)' : undefined)}
                                          sub={t('Download')}
                                          href={part.link}
                                          icon="Archive"
                                          imageUrl={item.category === 'architect' ? "https://cdn-icons-png.flaticon.com/512/7063/7063204.png" : item.category === 'extra' ? "https://images.icon-icons.com/3053/PNG/512/google_backup_and_sync_macos_bigsur_icon_190135.png" : item.category === 'steamtools' ? "https://play-lh.googleusercontent.com/WNNDb4VyH2yXBwFME6OTWZKhVFPDnQt2xoJeXPcRZSBcnDoMD1JAHQc1GAzu9pH04wCUhFrxfGD1yEE2Bg9HXA=s0-br30" : "https://fitgirl-repacks.site/wp-content/uploads/2016/08/icon.jpg"}
                                          secondary
                                          note={part.note}
                                          onNoteClick={(note) => setNoteModalContent(note)}
                                      />
                                  ))}
                                  {item.links?.mirrors && item.links.mirrors.map(part => (
                                      <DownloadButton
                                          key={'mirror_'+part.id}
                                          label={['architect', 'extra'].includes(item.category) ? `Part ${String(part.id).padStart(2, '0')}` : item.category === 'steamtools' ? `Mirror Link ${String(part.id).padStart(2, '0')}` : (String(part.id) === '1' ? 'FuckingFast' : `FuckingFast Part ${part.id}`)}
                                          badge={['steamtools', 'architect', 'extra'].includes(item.category) ? undefined : (String(part.id) === '1' ? 'Really Fucking Fast' : undefined)}
                                          sub={t('Download')}
                                          href={part.link}
                                          icon="Archive"
                                          imageUrl={item.category === 'architect' ? "https://cdn-icons-png.flaticon.com/512/7063/7063204.png" : item.category === 'extra' ? "https://images.icon-icons.com/3053/PNG/512/google_backup_and_sync_macos_bigsur_icon_190135.png" : item.category === 'steamtools' ? "https://play-lh.googleusercontent.com/WNNDb4VyH2yXBwFME6OTWZKhVFPDnQt2xoJeXPcRZSBcnDoMD1JAHQc1GAzu9pH04wCUhFrxfGD1yEE2Bg9HXA=s0-br30" : "https://fitgirl-repacks.site/wp-content/uploads/2016/08/icon.jpg"}
                                          secondary
                                          note={part.note}
                                          onNoteClick={(note) => setNoteModalContent(note)}
                                      />
                                  ))}
                              </div>
                          </details>
                      )}
                      
                      {item.links?.ankerParts && item.links.ankerParts.length > 0 && (
                          <details className="mb-6 group">
                              <summary className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 transition-colors select-none list-none">
                                  <Icon name="ChevronRight" size={14} className="group-open:rotate-90 transition-transform" />
                                  <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYdQ_DlScM7nLh2AxH9ds27fTftrY9Jz1WhjBthb514jeSHnu2W6lT0Oo&s=10" alt="AnkerGames" className="w-4 h-4 rounded-sm object-contain" /> Pre-installed / AnkerGames ({item.links.ankerParts.length})
                              </summary>
                              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mt-3">
                                  {item.links.ankerParts.map(part => (
                                      <DownloadButton
                                          key={part.id}
                                          label={`Part ${part.id}`}
                                          sub={t('Download')}
                                          href={part.link}
                                          icon="Zap"
                                          imageUrl="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYdQ_DlScM7nLh2AxH9ds27fTftrY9Jz1WhjBthb514jeSHnu2W6lT0Oo&s=10"
                                          secondary
                                          note={part.note}
                                          onNoteClick={(note) => setNoteModalContent(note)}
                                      />
                                  ))}
                              </div>

                              <div className="mt-8 flex flex-col gap-6">
                                  {/* Installation Guide */}
                                  <div className="bg-slate-100 dark:bg-slate-800/40 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700/50">
                                      <div className="flex items-center gap-4 mb-6">
                                          <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center shrink-0">
                                              <Icon name="Box" size={24} />
                                          </div>
                                          <div>
                                              <h4 className="text-lg font-bold text-slate-900 dark:text-white">{t('Installation Guide')}</h4>
                                              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Step-by-step setup process</p>
                                          </div>
                                      </div>

                                      <div className="flex flex-col gap-5 relative ps-2">
                                          <div className="absolute top-4 bottom-4 start-[23px] w-px bg-slate-300 dark:bg-slate-700 z-0"></div>
                                          
                                          <div className="relative z-10 flex gap-4">
                                              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 border-2 border-blue-500 flex items-center justify-center text-blue-500 text-xs font-bold shrink-0 shadow-sm">1</div>
                                              <div className="pt-1.5 text-sm text-slate-700 dark:text-slate-300">
                                                  {t('Game is pre-installed / portable, therefore you do not need to install the game.')}
                                              </div>
                                          </div>
                                          
                                          <div className="relative z-10 flex gap-4">
                                              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 border-2 border-blue-500 flex items-center justify-center text-blue-500 text-xs font-bold shrink-0 shadow-sm">2</div>
                                              <div className="pt-1.5 text-sm text-slate-700 dark:text-slate-300">
                                                  {t('Just extract the rar / zip file.')}
                                              </div>
                                          </div>
                                          
                                          <div className="relative z-10 flex gap-4">
                                              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 border-2 border-blue-500 flex items-center justify-center text-blue-500 text-xs font-bold shrink-0 shadow-sm">3</div>
                                              <div className="pt-1.5 text-sm text-slate-700 dark:text-slate-300">
                                                  {t('Simply launch the game Run Me!.bat')}
                                              </div>
                                          </div>
                                      </div>
                                  </div>

                                  {/* Important Notes */}
                                  <div className="bg-slate-100 dark:bg-slate-800/40 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700/50">
                                      <div className="flex items-center gap-4 mb-6">
                                          <div className="w-10 h-10 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center shrink-0">
                                              <Icon name="AlertTriangle" size={20} />
                                          </div>
                                          <div>
                                              <h4 className="text-lg font-bold text-slate-900 dark:text-white">{t('Important Notes')}</h4>
                                              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{t('Please review these important details before installation')}</p>
                                          </div>
                                      </div>

                                      <ul className="space-y-4">
                                          <li className="flex gap-3">
                                              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-2"></div>
                                              <span className="text-sm text-slate-700 dark:text-slate-300">{t('Install necessary apps from Redist or _CommonRedist to ensure game launches without any problems.')}</span>
                                          </li>
                                          <li className="flex gap-3">
                                              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-2"></div>
                                              <span className="text-sm text-slate-700 dark:text-slate-300">{t('Always extract game in Antivirus / Defender excluded folder - Please check our FAQs to know why it is important.')}</span>
                                          </li>
                                          <li className="flex gap-3">
                                              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-2"></div>
                                              <span className="text-sm text-slate-700 dark:text-slate-300">{t('Always run the game as administrator.')}</span>
                                          </li>
                                          <li className="flex gap-3">
                                              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-2"></div>
                                              <span className="text-sm text-slate-700 dark:text-slate-300">{t('For detailed guide, make sure to read Installation Guide.txt inside the game files.')}</span>
                                          </li>
                                      </ul>
                                  </div>
                              </div>
                          </details>
                      )}

                  </div>
                  )}

              </div>
          </div>

          {/* Support Us Section */}
          <div className="w-full" dir={dir}>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col lg:flex-row">
                {/* Content Column */}
                <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center bg-slate-50 dark:bg-slate-900 z-10 relative">
                    <h4 className="text-primary-500 font-black tracking-widest uppercase text-xs sm:text-sm mb-4">
                        {t('YOUR SUPPORT MATTERS')}
                    </h4>
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-6 uppercase leading-tight">
                        {t('KEEP THE GAME ALIVE')}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed mb-8">
                        {t('Every contribution goes directly into server upgrades, faster downloads, and exclusive new features. Join the elite supporters who make this community possible.')}
                    </p>
                    
                    <div className="flex flex-wrap gap-3 mb-6">
                        <button onClick={(e) => { e.preventDefault(); if (onDonateClick) onDonateClick(); }} className="flex items-center justify-center gap-2 px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold uppercase tracking-wider text-sm transition-transform active:scale-95 shadow-lg shadow-primary-500/20">
                            <Icon name="Heart" size={18} />
                            {t('Support Us')}
                        </button>
                    </div>
                </div>

                {/* Image Column */}
                <div className="w-full lg:w-1/2 relative bg-[#f8fafc] dark:bg-[#09090b] flex items-center justify-center p-6 lg:p-10">
                    <img 
                        src="/images/supportus.png" 
                        alt="Support Us" 
                        className="w-full h-auto object-contain opacity-100 z-0 drop-shadow-2xl hover:scale-105 transition-transform duration-500 rounded-2xl"
                    />
                    {/* Mobile/Tablet bottom gradient */}
                    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-50 to-transparent dark:from-slate-900 pointer-events-none lg:hidden z-10" />
                    {/* Desktop side gradient */}
                    <div className={`hidden lg:block absolute inset-y-0 ${dir === 'rtl' ? 'right-0 w-32 bg-gradient-to-l' : 'left-0 w-32 bg-gradient-to-r'} from-slate-50 to-transparent dark:from-slate-900 pointer-events-none z-10`} />
                </div>
            </div>
          </div>
          </div>

          {/* Recommended For You Section */}
          {recommendedItems.length > 0 && (
              <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 pb-8 mt-4 pt-10 border-t border-slate-200 dark:border-slate-800/50" dir={dir}>
                  <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary-500/10 text-primary-500 rounded-2xl flex items-center justify-center shadow-inner">
                              <Icon name="Sparkles" size={24} />
                          </div>
                          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-widest">
                              {t('Recommended For You')}
                              <span className="text-slate-400 dark:text-slate-500 ms-2">({recommendedItems.length})</span>
                          </h3>
                      </div>
                      <div className="hidden sm:flex items-center gap-3">
                          <button 
                              onClick={() => handleScrollRecommended('left')}
                              className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center hover:bg-primary-500 hover:text-white transition-colors border border-slate-200 dark:border-slate-700 shadow-sm"
                          >
                              <Icon name={dir === 'rtl' ? 'ChevronRight' : 'ChevronLeft'} size={20} />
                          </button>
                          <button 
                              onClick={() => handleScrollRecommended('right')}
                              className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center hover:bg-primary-500 hover:text-white transition-colors border border-slate-200 dark:border-slate-700 shadow-sm"
                          >
                              <Icon name={dir === 'rtl' ? 'ChevronLeft' : 'ChevronRight'} size={20} />
                          </button>
                      </div>
                  </div>
                  <div 
                      ref={recommendedScrollRef}
                      className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden" 
                      dir={dir}
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                      {(() => {
                          const isGame = item.category === 'game';
                          const itemsToRender = isGame ? recommendedItems.slice(0, 8) : recommendedItems;
                          const hasMore = isGame;

                          return (
                              <>
                                  {itemsToRender.map(rec => (
                                      <div 
                                          key={rec.id} 
                                          className="shrink-0 snap-start cursor-pointer group transition-all duration-300 w-[200px] sm:w-[240px] md:w-[280px] lg:w-[320px]"
                                          onClick={() => { if(onItemSelect) onItemSelect(rec); }}
                                      >
                                          <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl group-hover:shadow-2xl group-hover:-translate-y-1 group-hover:brightness-110 transition-all duration-300">
                                              <img src={rec.coverImage} alt={rec.name} className="w-full h-full object-cover" />
                                          </div>
                                      </div>
                                  ))}
                                  {hasMore && (
                                      <div 
                                          className="shrink-0 snap-start cursor-pointer group transition-all duration-300 w-[200px] sm:w-[240px] md:w-[280px] lg:w-[320px]"
                                          onClick={() => {
                                              const targetGenre = currentGenreContext 
                                                  ? currentGenreContext 
                                                  : (item.genres ? item.genres.split(',')[0].trim() : '');
                                              if (targetGenre && onGenreClick) {
                                                  onGenreClick(targetGenre);
                                              } else {
                                                  onClose();
                                              }
                                          }}
                                      >
                                          <div className="aspect-[2/3] rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xl group-hover:shadow-2xl group-hover:-translate-y-1 group-hover:border-primary-500/50 transition-all duration-300 flex flex-col items-center justify-center gap-4 text-slate-500 hover:text-primary-500">
                                              <div className="w-16 h-16 rounded-full bg-slate-200/80 dark:bg-slate-700/80 flex items-center justify-center transition-transform group-hover:scale-110">
                                                  <Icon name="ArrowRight" size={32} className={dir === 'rtl' ? 'rotate-180' : ''} />
                                              </div>
                                              <span className="font-bold uppercase tracking-wider text-sm">{t('See More')}</span>
                                              <span className="text-xs text-slate-400 dark:text-slate-500">
                                                  {recommendedItems.length > 8 ? `+${recommendedItems.length - 8} ${t('Games')}` : t('Explore Genre')}
                                              </span>
                                          </div>
                                      </div>
                                  )}
                              </>
                          );
                      })()}
                  </div>
              </div>
          )}

          <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 pb-4 sm:pb-6">
            {/* Comments Section */}
            <CommentsSection itemId={item.id} itemTitle={item.title || item.name} itemCategory={item.category} />
          </div>
  
  {/* Modals for Trailer and Notes */}
  {createPortal(
    <AnimatePresence>
      {showHypervisorGuide && (
          <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[300] bg-white dark:bg-[#0B1120] flex items-center justify-center"
              onClick={() => setShowHypervisorGuide(false)}
          >
              <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="w-full h-full relative flex flex-col overflow-hidden"
                  onClick={e => e.stopPropagation()}
              >
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0F172A] shrink-0 relative">
                     <div className="flex items-center gap-4 z-10">
                        <button onClick={() => setShowHypervisorGuide(false)} className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-200 dark:bg-slate-800/50 hover:bg-slate-300 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors">
                           <Icon name="ArrowLeft" size={16} /> Back to Product
                        </button>
                     </div>
                     <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-black text-lg tracking-widest uppercase pointer-events-auto">
                           <Icon name="ShieldAlert" size={24} className="text-red-500" />
                           HYPERVISOR GUIDE
                        </div>
                     </div>
                     <button onClick={() => setShowHypervisorGuide(false)} className="p-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors z-10">
                        <Icon name="X" size={20} />
                     </button>
                  </div>
                  {/* Content */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar"><div className="max-w-4xl mx-auto p-6 md:p-12 text-slate-700 dark:text-slate-300 text-sm md:text-base leading-relaxed space-y-6">
                      <p className="text-red-500 font-bold">This page is a work-in-progress and will be updated.</p>
                      <p>This article is partially based on RessourectoR's (admin of cs.rin.ru site) article:</p>
                      <p><a href="https://cs.rin.ru/forum/viewtopic.php?f=10&t=156407" target="_blank" rel="noopener" className="text-blue-400 hover:text-blue-300 underline text-base">https://cs.rin.ru/forum/viewtopic.php?f=10&t=156407</a></p>
                      <p>I highly recommend to open and read it at least one time. It's more complex than this page and covers more security topics.</p>
                      
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">What are Hypervisor Cracks?</h3>
                      <p>Denuvo Hypervisor Crack or Bypass refers to advanced techniques that leverage virtualization at a very low level (often using a custom or modified hypervisor) to interfere with how the protection monitors the system. Denuvo relies heavily on integrity checks, timing analysis, and detection of debugging or emulation environments. A hypervisor-based approach allows an attacker to sit "under" the operating system, transparently controlling CPU behavior, intercepting instructions, and masking signs of analysis without modifying the protected executable directly.</p>
                      <p>Instead of patching the game binary, the hypervisor can emulate or alter specific CPU instructions, fake timing results, or hide breakpoints and memory changes, effectively tricking Denuvo into believing everything is running on a normal, untampered system. This makes the protection much harder to detect or react to, since its checks are being handled outside its visibility. These methods are extremely complex and are typically explored by highly skilled reverse engineers, as they require deep knowledge of CPU virtualization, kernel internals, and anti-tamper mechanisms.</p>
                      <p>Officially, only signed drivers can work at such low level. Due to the piracy nature of Denuvo Hypervisor drivers, they will never receive Microsoft-approved certificate. And that's why to use such "cracks" you need to make certain modifications to your system security settings, listed below. Please note, that those changes are intended to be made temporary, for the course of your gameplay session and then should be reverted after you quit the game.</p>
                      
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">{t('Windows virtualization-based security components')}</h3>
                      <p>On modern systems with Secure Boot, TPM 2.0 and hardware-assisted virtualization capabilities, Windows 10 and 11 enable, mostly* by default, various security solutions via Virtualization-based Security (VBS). VBS is an umbrella term for using a bare-metal hypervisor, the Windows hypervisor, to create isolated virtual spaces that are safe from even a fully compromised OS, in which these security components run and monitor the OS or store confidential information.</p>
                      <p>The following Windows components are such security solutions:</p>
                      <ul className="list-disc ps-6 space-y-2">
                        <li><a href="https://learn.microsoft.com/en-us/windows/security/hardware-security/enable-virtualization-based-protection-of-code-integrity" target="_blank" rel="noopener" className="text-blue-400 hover:text-blue-300">Memory Integrity (HVCI)</a>: Runs checks to detect malicious or at least unexpected modifications of Windows kernel code and restricts suspicious kernel memory allocations.</li>
                        <li><a href="https://learn.microsoft.com/en-us/windows-hardware/design/device-experiences/oem-credential-guard" target="_blank" rel="noopener" className="text-blue-400 hover:text-blue-300">Credential Guard</a>: Stores access credentials, such as passwords, authentication data, biometric data etc. in an isolated environment.</li>
                        <li><a href="https://learn.microsoft.com/en-us/windows-hardware/design/device-experiences/windows-hello" target="_blank" rel="noopener" className="text-blue-400 hover:text-blue-300">Windows Hello</a>: Allows you to log in with convenient methods like a short PIN, facial recognition or fingerprint scan.</li>
                        <li><a href="https://learn.microsoft.com/en-us/windows/security/hardware-security/how-hardware-based-root-of-trust-helps-protect-windows" target="_blank" rel="noopener" className="text-blue-400 hover:text-blue-300">System Guard (Secure Launch)</a>: An advanced system hardening framework that protects the OS boot process and System Management Mode.</li>
                      </ul>
                      <p className="text-sm italic text-slate-500 dark:text-slate-400">* Even though hardware and boot requirements are met, Windows sometimes seems to fail at enabling features that are supposed to be enabled automatically, such as VBS and memority integrity.</p>
                      
                      <div className="font-bold text-slate-800 dark:text-slate-200 mt-4 space-y-4">
                        <p>Without the Windows hypervisor, none of these security features can be used. By design, the hypervisor cannot be disabled directly. Instead, all the above features that want to utilize VBS signal that it needs to be enabled, which then loads the hypervisor. Therefore, we must disable all those features to prevent the Windows hypervisor from being loaded.</p>
                        <p>A boot option that prevents Hyper-V from loading the hypervisor also needs to be added.</p>
                      </div>

                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">I want to play that new Denuvo-protected game, is it safe to disable all this and use a hypervisor crack?</h3>
                      <p>There is no simple answer. This is RessourectoR's personal take as someone with 10 years of experience in security-focused system administration and only a casual interest in gaming.</p>
                      <p>It's true that the most common threats are info stealer malware from fake download buttons, ransomware that encrypts your files or joining a DDoS botnet. It's supposed such malware is usually not interested in higher privilege escalation or hardware sabotage, if it can already access what it needs. It's also true that the best protection against such malware is a good ad blocker, staying on trusted sites and user education.</p>
                      <p>More experienced PC users develop a false sense of security from seeing how successfully they avoid malware infection by "being smart". They argue that they don't need all these restrictive, patronizing security features and AVs that just annoy with false positives, because their malware-free track record "proves" that they know better. They also argue that more advanced threats are not aimed at home users, but corporate networks and too unlikely to care about. Especially relevant for gamers: Virtualization can reduce system performance and whether that is noticeable or not is also a point of contention.</p>
                      <p className="font-bold text-slate-900 dark:text-white">Whether that game is worth the risks is something you will ultimately have to decide for yourself.</p>

                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">What's inside those cracks?</h3>
                      <p>Basically, every modern Hypervisor bypass/crack consists of two parts:</p>
                      <ol className="list-decimal ps-6 space-y-4">
                        <li>
                           <p className="font-bold text-slate-900 dark:text-white">VBS.cmd: special command-line script, which checks your existing settings and modify them to make your system prepared for HV-cracks.</p>
                           <p className="mt-2">This script is universal for all HV-games and is developed separately, it doesn't depend on actual game cracks. You can download the latest version below:</p>
                           <div className="bg-[#9aff612e] border border-[#159311] rounded-xl p-5 my-4">
                              <a href="https://paste.fitgirl-repacks.site/?cd32d8e86fa5112d#Fi2WAtgoW9pp4VGEQVXqMH73bHpeMSTGmd1WYiX6j9yN" target="_blank" rel="noopener" className="text-emerald-700 dark:text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-bold underline">Current version: v1.9 (Updated on July 22, 2026)</a>
                              <details className="mt-4 border border-[#159311]/30 rounded-lg bg-black/20 group">
    <summary className="cursor-pointer font-bold text-emerald-700 dark:text-emerald-400 p-3 hover:bg-black/30 transition-colors flex items-center gap-2 select-none">
        <div className="transform transition-transform group-open:rotate-180">
            <Icon name="ChevronDown" size={16} />
        </div>
        {t('Changes log')}
    </summary>
    <div className="p-4 space-y-4 text-emerald-900/80 dark:text-emerald-900 dark:text-emerald-50/80 text-sm border-t border-[#159311]/30 max-h-80 overflow-y-auto custom-scrollbar">
        <p className="font-bold text-emerald-700 dark:text-emerald-400">v1.9</p>
        <ol className="list-decimal ps-6 space-y-2">
            <li>Added a check for Bitdefender Advanced Threat Defense. The script will now warn the user when Bitdefender Advanced Threat Defense is on, as it may cause an "Initialization error 5" message in certain games that use VMProtect, notably Ubisoft and Capcom titles.</li>
            <li>Added a check for MacType. The script will now warn the user when MacType is running as it's known to cause games to silently crash. The script may also disable MacType when it's set to run as a service.</li>
            <li>Updated introductory notes.</li>
            <li>Bug fixes.</li>
            <li>We rely on user reports to identify and fix issues. If you encounter any problems, please report them at <a href="https://cs.rin.ru/forum/viewtopic.php?f=14&t=156435" rel="noopener" target="_blank" className="text-emerald-700 dark:text-emerald-700 dark:text-emerald-400 underline hover:text-emerald-800 dark:hover:text-emerald-300">https://cs.rin.ru/forum/viewtopic.php?f=14&t=156435</a>.</li>
        </ol>

        <p className="font-bold text-emerald-700 dark:text-emerald-400 pt-2 border-t border-[#159311]/20">v1.8</p>
        <ol className="list-decimal ps-6 space-y-2">
            <li>The script now enables Test Signing instead of taking the user to disable driver signature enforcement through the Startup Settings in cases where Secure Boot is off. This approach is more stable, and does not need to be reapplied after every restart. Learn more about Test Signing <a href="https://learn.microsoft.com/en-us/windows-hardware/drivers/install/test-signing#test-sign-a-driver-package" rel="noopener" target="_blank" className="text-emerald-700 dark:text-emerald-700 dark:text-emerald-400 underline hover:text-emerald-800 dark:hover:text-emerald-300">here</a>.</li>
            <li>Improved Windows Hello detection.</li>
            <li>Updated introductory notes.</li>
            <li>Minor improvements.</li>
            <li>Bug fixes.</li>
            <li>We rely on user reports to identify and fix issues. If you encounter any problems, please report them at <a href="https://cs.rin.ru/forum/viewtopic.php?f=14&t=156435" rel="noopener" target="_blank" className="text-emerald-700 dark:text-emerald-700 dark:text-emerald-400 underline hover:text-emerald-800 dark:hover:text-emerald-300">https://cs.rin.ru/forum/viewtopic.php?f=14&t=156435</a>.</li>
        </ol>

        <p className="font-bold text-emerald-700 dark:text-emerald-400 pt-2 border-t border-[#159311]/20">v1.7.2</p>
        <ol className="list-decimal ps-6 space-y-2">
            <li>Improved boot entry identifier detection, addressing issues for some dual boot systems.</li>
            <li>Added an error message for when the current boot entry could not be identified.</li>
            <li>Added detection and disabling of Hypervisor-Enforced Paging Translation.</li>
            <li>Updated introductory notes.</li>
            <li>Minor improvements.</li>
            <li>Bug fixes.</li>
            <li>We rely on user reports to identify and fix issues. If you encounter any problems, please report them at <a href="https://cs.rin.ru/forum/viewtopic.php?f=14&t=156435" rel="noopener" target="_blank" className="text-emerald-700 dark:text-emerald-700 dark:text-emerald-400 underline hover:text-emerald-800 dark:hover:text-emerald-300">https://cs.rin.ru/forum/viewtopic.php?f=14&t=156435</a>.</li>
        </ol>

        <p className="font-bold text-emerald-700 dark:text-emerald-400 pt-2 border-t border-[#159311]/20">v1.7.1</p>
        <ol className="list-decimal ps-6 space-y-2">
            <li>Improved Windows Hello detection.</li>
            <li>Improved BitLocker detection and suspension.</li>
            <li>Minor improvements.</li>
            <li>Bug fixes.</li>
            <li>We rely on user reports to identify and fix issues. If you encounter any problems, please report them at <a href="https://cs.rin.ru/forum/viewtopic.php?f=14&t=156435" rel="noopener" target="_blank" className="text-emerald-700 dark:text-emerald-700 dark:text-emerald-400 underline hover:text-emerald-800 dark:hover:text-emerald-300">https://cs.rin.ru/forum/viewtopic.php?f=14&t=156435</a>.</li>
        </ol>

        <p className="font-bold text-emerald-700 dark:text-emerald-400 pt-2 border-t border-[#159311]/20">v1.7</p>
        <ol className="list-decimal ps-6 space-y-2">
            <li>Added detection for mapped network drives. Running the script from a mapped network drive, including shared folders in virtual machines that appear as mapped networks drives, is not supported and the script will now exit with an appropriate message instead of outright crashing. This is a Windows issue and not the script's.</li>
            <li>When a Windows Hello PIN is both enabled and protected by VBS on Windows 11, the script cannot continue and prompts the user to disable their PIN first. This further addresses Windows Hello related issues.</li>
            <li>Added detection for Parallels Desktop for Mac. The script now checks BIOS and system manufacturer information to detect Parallels and exits with an appropriate message.</li>
            <li>The script now checks if it's running on an unsupported version of Windows (Windows 10, version 1909 or lower), and if so, prompts the user to update their Windows.</li>
            <li>Fixed boot entry detection not working on Single Language editions of Windows by reading the value by position instead of searching for the word "identifier".</li>
            <li>Fixed an issue where disabling VBS with Credential Guard enabled on Windows 10 could require two reboots before fully taking effect.</li>
            <li>Added detection and disabling of additional registry keys for Enhanced Sign-in Security, covering keys that were previously missed.</li>
            <li>Fixed an issue where Startup Settings wouldn't show up on boot in a system that has disabled advanced boot options.</li>
            <li>The script now checks whether the Windows architecture is unsupported, and if so, prompts the user to exit.</li>
            <li>Updated introductory notes.</li>
            <li>Minor improvements.</li>
            <li>Bug fixes.</li>
        </ol>

        <p className="pt-2">The "Run as administrator" option in the context menu will fail to execute the script on paths that contain certain special characters. This is a Windows issue and not the script's.</p>
        <p>We recommend that instructions avoid explicitly directing users to run the script with administrative privileges. Instead, users should launch the script normally and, if prompted, simply approve the UAC dialog to grant the necessary privileges.</p>
        <p>In order to fix this, open Command Prompt as administrator, then paste in and execute these commands:</p>
        <div className="bg-black/50 p-3 rounded font-mono text-xs text-slate-300 space-y-2 overflow-x-auto my-2">
            <div>set _r=^%SystemRoot^%</div>
            <div>reg add HKLM\SOFTWARE\Classes\batfile\shell\runas\command /f /v "" /t REG_EXPAND_SZ /d "%_r%\System32\cmd.exe /C \"%1\" %*\""</div>
            <div>reg add HKLM\SOFTWARE\Classes\cmdfile\shell\runas\command /f /v "" /t REG_EXPAND_SZ /d "%_r%\System32\cmd.exe /C \"%1\" %*\""</div>
        </div>

        <p className="font-bold text-emerald-700 dark:text-emerald-400 pt-2 border-t border-[#159311]/20">v1.6.2</p>
        <ol className="list-decimal ps-6 space-y-2">
            <li>Fixed an issue where a "All changes have been reverted successfully. A restart is not necessary." message would incorrectly be shown when reverting changes in cases where only driver signature enforcement is off.</li>
        </ol>

        <p className="font-bold text-emerald-700 dark:text-emerald-400 pt-2 border-t border-[#159311]/20">v1.6.1</p>
        <ol className="list-decimal ps-6 space-y-2">
            <li>Fixed an issue where reverting Credential Guard would explicitly set LsaCfgFlags to 2 even on systems where it was running due to Windows default enablement rather than explicit configuration. The original value is now backed up before disabling and restored accurately on revert, or left unset if it was never explicitly configured.</li>
            <li>Added DISM RestoreHealth and SFC Scannow options to the troubleshoot menu, complementing the existing Fix WMI option. These can help resolve system file corruption that may cause issues with PowerShell or WMI.</li>
            <li>Updated introductory notes.</li>
            <li>Minor improvements.</li>
            <li>Bug fixes.</li>
        </ol>

        <p className="font-bold text-emerald-700 dark:text-emerald-400 pt-2 border-t border-[#159311]/20">v1.6</p>
        <ol className="list-decimal ps-6 space-y-2">
            <li>Added detection and disabling of FACEIT Anti-Cheat. The driver is now automatically unloaded if found running.</li>
            <li>Added detection and disabling of the WindowsHelloSecureBiometrics registry key, an additional Enhanced Sign-in Security key that was missing from the previous implementation.</li>
            <li>Added detection and disabling of HyperGuard, a VBS-dependent security feature that could keep the Windows hypervisor active.</li>
            <li>Added detection and disabling of Guarded Host, a VBS-dependent security feature that could keep the Windows hypervisor active.</li>
            <li>Added boot entry identifier detection to ensure bcdedit commands target the correct boot entry, improving compatibility with non-standard boot configurations.</li>
            <li>When Windows Hello protection is detected, the script now disables the Microsoft account Windows Hello-only sign-in enforcement and removes the Windows Hello credential container via certutil before disabling the Device Guard registry key. This prevents the broken PIN on the next boot and ensures the user can sign back in with their password. The original sign-in enforcement value is saved and restored accurately on revert.</li>
            <li>Updated introductory notes.</li>
            <li>Minor improvements.</li>
            <li>Bug fixes.</li>
        </ol>

        <p className="font-bold text-emerald-700 dark:text-emerald-400 pt-2 border-t border-[#159311]/20">v1.5</p>
        <ol className="list-decimal ps-6 space-y-2">
            <li>Improved the Windows hypervisor detection. The script now also checks if Hyper-V, Virtual Machine Platform, Windows Hypervisor Platform, Windows Subsystem for Linux, or Windows Sandbox features are enabled. If any of these are enabled and a hypervisor is detected as running, the Windows hypervisor will be disabled, covering cases where VBS appeared disabled but the hypervisor remained active due to these features.</li>
            <li>Added VSM (Virtual Secure Mode) launch type detection. If vsmlaunchtype is set to Auto in the boot configuration, it is disabled alongside the hypervisor and restored on revert.</li>
            <li>Added a WMI check and a Troubleshoot option in the main menu with a Fix WMI tool, for systems where PowerShell CIM/WMI calls fail with invalid class errors.</li>
            <li>Added a PowerShell check at startup to detect and report issues such as Restricted Language mode, PowerShell Core replacing PowerShell Desktop, malware interfering with PowerShell, and .NET initialization failures.</li>
            <li>Added a QuickEdit and Terminal app detection check. The script now relaunches itself in conhost.exe when running inside Windows Terminal to avoid known issues with window resizing, choice.exe input handling, and console buffer behavior that can cause the script to appear frozen or behave incorrectly.</li>
            <li>Added a Temp folder check. If the script is launched directly from an archive file, the user is informed to extract it first.</li>
            <li>Improved robustness by explicitly setting environment variables at launch, ensuring correct behavior regardless of system configuration or how the script is invoked.</li>
        </ol>
        <p>Other minor improvements.</p>

        <p className="font-bold text-emerald-700 dark:text-emerald-400 pt-2 border-t border-[#159311]/20">v1.4</p>
        <ol className="list-decimal ps-6 space-y-2">
            <li>Added Driver Signature Enforcement (DSE) and test signing detection. If test signing is already enabled, the script will skip the Startup Settings step, BitLocker suspension, and onetimeadvancedoptions entirely, as driver signature enforcement is already bypassed.</li>
            <li>Fixed an issue where the Revert Changes option would incorrectly show "Nothing to revert, as no changes were previously applied." when DSE was still disabled, even though a reboot was required to restore it.</li>
            <li>Added FACEIT Anti-Cheat detection. If detected, the script will exit with a message asking the user to uninstall it before proceeding, as it is known to block the driver from loading.</li>
            <li>Replaced PowerShell calls with full path via %psc% to avoid resolution issues when PowerShell is not in PATH.</li>
            <li>Removed outdated comments.</li>
            <li>Minor improvements.</li>
        </ol>

        <p className="font-bold text-emerald-700 dark:text-emerald-400 pt-2 border-t border-[#159311]/20">v1.3</p>
        <ol className="list-decimal ps-6 space-y-2">
            <li>Fixed an issue where Credential Guard Scenarios registry key was being restored on revert even when Credential Guard itself was not running before the script was executed. CG and CG Scenarios are now tracked and reverted independently.</li>
            <li>Fixed an issue where Memory Integrity (HVCI) would not be detected if it was configured but not yet running, which could keep VBS active. HVCI detection now checks both runtime status and registry configuration.</li>
            <li>Added detection and removal of RequirePlatformSecurityFeatures when disabling VBS, which was causing VBS to remain enabled. The original value is backed up and restored accurately on revert.</li>
            <li>Added detection and removal of the Enhanced Sign-in Security Scenarios key alongside the existing subkey, and reverts them independently.</li>
            <li>Added a message informing the user when no security features needed to be disabled.</li>
            <li>Minor improvements.</li>
        </ol>

        <p className="font-bold text-emerald-700 dark:text-emerald-400 pt-2 border-t border-[#159311]/20">v1.2</p>
        <ol className="list-decimal ps-6 space-y-2">
            <li>Fixed a compatibility issue where launching the script from a 32-bit application, like Compact AutoRunner which is used in Hypervisor Launcher by FitGirl, would cause system tools such as bcdedit to not be found, due to System32 being redirected to SysWOW64 in 32-bit processes. This manifested as the Windows hypervisor showing as failed to disable, and UEFI lock removal failing entirely. The script now relaunches itself as a 64-bit process when this is detected. Thanks to galaxyxyz888 on Discord.</li>
            <li>Fixed an issue where the Credential Guard Scenarios registry key was not being disabled, which could keep VBS active even when Credential Guard was not running. Thanks to sowhatnumber on Discord.</li>
            <li>Fixed an issue where SecConfig.efi would not correctly return to the current OS after clearing a UEFI lock on dual-boot systems. Thanks to RessourectoR.</li>
            <li>Fixed an issue where reverting the Windows hypervisor would incorrectly show as failed after a reboot on systems with UEFI locked VBS or HVCI, caused by SecConfig.efi clearing the hypervisorlaunchtype BCD entry during the UEFI lock removal process on boot.</li>
            <li>Fixed an issue where the Revert Changes option would not show "No changes have been made" on systems that had previously agreed to UEFI lock removal, even when no features had actually been disabled, due to the UEFILockAgreed registry value being incorrectly counted as a tracked change.</li>
            <li>Fixed an issue where the ManageVBS registry key was not being cleaned up correctly after reverting on systems that had agreed to UEFI lock removal.</li>
            <li>Added test signing detection. If test signing is already enabled, the script will inform the user.</li>
            <li>Minor visual improvements.</li>
        </ol>

        <p className="font-bold text-emerald-700 dark:text-emerald-400 pt-2 border-t border-[#159311]/20">v1.1</p>
        <ol className="list-decimal ps-6 space-y-2">
            <li>Fixed a crash when the script path or filename contained spaces or special characters, such as when downloaded multiple times and renamed to VBS (1).cmd.</li>
            <li>Fixed an issue where Enhanced Sign-in Security was preventing VBS from being disabled. A check has been added to disable it if detected. This mainly affected ROG Ally X users where it is enabled by default. Thanks to .oathkeeper213 on Discord and Azazel35 on Reddit.</li>
            <li>Added support for disabling VBS, HVCI and Credential Guard when protected by a UEFI lock using SecConfig.efi. In the script, the user is advised to only proceed on personal devices before removing the UEFI lock. Note that on managed devices, VBS, HVCI and Credential Guard protected by a UEFI lock can only be disabled for one boot cycle. UEFI locks can be fully reverted using the Revert Changes option. Thanks to poce on Discord.</li>
            <li>Added support for disabling VBS and HVCI mandatory mode. Note that reverting mandatory mode is not currently supported and must be re-enabled manually if needed.</li>
            <li>Added a note in the script's introduction regarding compatibility issues with kernel anti-cheats, specifically Vanguard, where disabling driver signature enforcement would result in a bug check (BSOD) in some system configurations, and FACEIT Anti-Cheat, which prevented the driver from loading with a multitude of different errors, most notably ERROR_ACCESS_DENIED, ERROR_INVALID_BLOCK and ERROR_NO_SYSTEM_RESOURCES. Thanks to xyz2theb on Reddit, deviljin0500, faintx11 & xeros1 on Discord for reporting this.</li>
            <li>Updated introductory notes.</li>
            <li>Minor visual improvements.</li>
        </ol>
    </div>
</details>
                           </div>
                        </li>
                        <li>
                           <p className="font-bold text-slate-900 dark:text-white">The Crack/Bypass itself</p>
                           <p className="mt-2">Consists of EXEs/DLLs, which does the actual Denuvo bypassing + other additional DLLs, like Goldberg Steam emulator to get past the underlying Steam protection.</p>
                           <p>Those files work only for specific game versions, for which they were made. They won't work on different game version or other games.</p>
                        </li>
                      </ol>

                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">Other Software Updates</h3>
                      <div className="bg-[#9aff612e] border border-[#159311] rounded-xl p-5 my-4">
                         <a href="https://paste.fitgirl-repacks.site/?7bb76c6f568d3725#G68jW7TWoMwDHUxBXhP4ttUX7Eeky9yCPPVHHtTs9aKj" target="_blank" rel="noopener" className="text-emerald-700 dark:text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-bold underline text-lg">Updated hypervisor-launcher.exe v1.3.1</a><br />
                         <p className="mt-2 text-emerald-900 dark:text-emerald-50 mb-2">Solves the PC restart issue on some systems, mostly on Intels. This a mirror from <a href="https://github.com/NotAndreh/hypervisor-launcher/releases" rel="noopener" target="_blank" className="text-emerald-700 dark:text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 underline">this official GitHub page</a>.</p>
                         <p className="text-emerald-900 dark:text-emerald-50 mb-2">The older version of "hypervisor-launcher.exe" is used in many DenuvOwO releases and in some of my repacks released before March 28, 2026. All HV-repacks past with date with this launcher version are using the updated build. You may download and try the new version ONLY if you have a launch issue, no need to replace it if everything works for you.</p>
                         <p className="text-emerald-900 dark:text-emerald-50">My repacks with older version "hypervisor-launcher.exe":</p>
                         <ul className="list-disc ps-6 space-y-1 mt-2 text-emerald-900 dark:text-emerald-50">
                             <li><a href="https://fitgirl-repacks.site/assassins-creed-shadows/" rel="noopener" target="_blank" className="text-emerald-700 dark:text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 underline">Assassin's Creed Shadows</a></li>
                             <li><a href="https://fitgirl-repacks.site/hello-kitty-island-adventure/" rel="noopener" target="_blank" className="text-emerald-700 dark:text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 underline">Hello Kitty Island Adventure</a></li>
                             <li><a href="https://fitgirl-repacks.site/nba-2k26/" rel="noopener" target="_blank" className="text-emerald-700 dark:text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 underline">NBA 2K26</a></li>
                             <li><a href="https://fitgirl-repacks.site/stellar-blade/" rel="noopener" target="_blank" className="text-emerald-700 dark:text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 underline">Stellar Blade</a></li>
                         </ul>
                      </div>

                      <h3 className="text-xl font-bold text-white mt-8 mb-4">{t('Pre-requirements')}</h3>
                      <p>Your CPU must support one of two virtualization techniques: VT-x for Intel and AMD-V (SVM) for AMD.</p>
                      <p>Google if CPU model supports virtualization to know if you can play HV-games.</p>
                      <p>Before proceeding with HV cracks, check your BIOS for enabling those technologies.</p>

                      <h3 className="text-xl font-bold text-white mt-8 mb-4">Do I need to disable Secure Boot or use EfiGuard?</h3>
                      <p>No. Current HV bypasses do not require those changes.</p>
                      </div>
                  </div>
              </motion.div>
          </motion.div>
      )}
      {showTrailer && item.links?.trailer && (
          <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
              onClick={() => setShowTrailer(false)}
          >
              <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative border border-slate-800"
                  onClick={e => e.stopPropagation()}
              >
                  <button 
                      onClick={() => setShowTrailer(false)}
                      className="absolute top-4 end-4 z-10 w-10 h-10 bg-black/50 hover:bg-primary-500 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-colors border border-white/10"
                  >
                      <Icon name="X" size={20} />
                  </button>
                  <iframe 
                      className="w-full h-full"
                      src={getYoutubeEmbedUrl(item.links?.trailer || '') || ''} 
                      title="YouTube video player" 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                  ></iframe>
              </motion.div>
          </motion.div>
      )}
      
      {torrentWarningLink && (
        <TorrentWarningModal link={torrentWarningLink} onClose={() => setTorrentWarningLink(null)} />
      )}
      {noteModalContent && (
          <NoteModal content={noteModalContent} onClose={() => setNoteModalContent(null)} />
      )}
    </AnimatePresence>,
    document.body
  )}
  <UploaderProfilePopup isOpen={showUploaderPopup} onClose={() => setShowUploaderPopup(false)} gameItem={item} />
</motion.div>
  );
};




const DownloadButton: React.FC<{
  label: string;
  sub: string;
  href: string;
  icon: string;
  imageUrl?: string;
  secondary?: boolean;
  note?: string;
  badge?: string;
  onNoteClick?: (note: string) => void;
  onClick?: (e: React.MouseEvent) => void;
}> = ({ label, sub, href, icon, imageUrl, secondary, note, badge, onNoteClick, onClick }) => {
  const validNote = note && note.trim().toLowerCase() !== 'undefined' && note.trim() !== '-' && note.trim() !== '' ? note.trim() : null;
  const isShortNote = validNote && validNote.length <= 50;

  return (
    <div className={`group relative flex items-center justify-between gap-2 sm:gap-4 p-4 rounded-xl border transition-all hover:scale-[1.02] active:scale-[0.98] ${
        secondary 
          ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md' 
          : 'bg-primary-500/10 hover:bg-primary-500/20 border-primary-500/30 shadow-sm hover:shadow-md'
      }`}>
      
      <a 
        href={href}
        onClick={onClick}
        target="_blank"
        rel="noreferrer"
        className="absolute inset-0 z-0 rounded-xl"
        title={note}
      ></a>

      <div className="relative z-10 flex items-center gap-3 sm:gap-4 min-w-0 pointer-events-none flex-1">
        <div className={`shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center overflow-hidden ${
          secondary 
            ? 'bg-slate-200 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400' 
            : 'bg-primary-500 text-white shadow-[0_0_15px_rgba(var(--color-primary-500),0.3)]'
        }`}>
          {imageUrl ? (
             <img src={imageUrl} alt={label} className="w-full h-full object-contain" />
          ) : (
             <Icon name={icon as any} size={24} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest truncate ${
            secondary ? 'text-slate-500 dark:text-slate-400' : 'text-primary-500'
          }`}>{sub}</div>
          <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate flex items-center gap-2">
            <span className="truncate">{label}</span>
            {badge && (
              <span className="shrink-0 px-1.5 py-0.5 bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 text-[8px] sm:text-[9px] uppercase tracking-wider font-black rounded border border-amber-500/20 whitespace-nowrap">
                {badge}
              </span>
            )}
          </div>
          {validNote && isShortNote && (
            <div className={`text-[10px] sm:text-xs font-bold mt-0.5 line-clamp-2 leading-tight ${secondary ? 'text-slate-500 dark:text-slate-400' : 'text-primary-600 dark:text-primary-400'}`}>
              {note}
            </div>
          )}
        </div>
      </div>
        
      <div className="relative z-10 flex items-center gap-1.5 sm:gap-2 shrink-0">
        {!isShortNote && validNote && (
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onNoteClick?.(note); }}
            className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 flex items-center justify-center transition-colors pointer-events-auto border border-blue-500/20 shrink-0 shadow-sm"
            title="Read Note"
          >
            <Icon name="Info" size={16} />
          </button>
        )}
        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1 pointer-events-none ${
          secondary ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300' : 'bg-primary-500 text-white'
        }`}>
          <Icon name="Download" size={16} />
        </div>
      </div>
    </div>
  );
};




const MostPopularRepacksModal: React.FC<{
    isOpen: boolean,
    games: ResourceItem[],
    onClose: () => void,
    onSelect: (item: ResourceItem) => void
}> = ({ isOpen, games, onClose, onSelect }) => {
    const { dir, t } = useLanguage();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 640) setItemsPerPage(12);
            else if (window.innerWidth < 768) setItemsPerPage(12);
            else if (window.innerWidth < 1024) setItemsPerPage(16);
            else setItemsPerPage(18);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const totalPages = Math.ceil(games.length / itemsPerPage);
    const validCurrentPage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages));
    const paginatedGames = games.slice((validCurrentPage - 1) * itemsPerPage, validCurrentPage * itemsPerPage);

    return createPortal(
        <AnimatePresence>
        {isOpen && (
            <motion.div 
            key="most-popular-repacks-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-0 bg-slate-900/90 backdrop-blur-md"
        >
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-slate-900 w-full h-full max-w-none max-h-none rounded-none shadow-2xl flex flex-col overflow-hidden border-none"
            >
                <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                            <Icon name="Trophy" className="text-yellow-600 dark:text-yellow-500" size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('Most Popular Repacks')}</h2>
                            <p className="text-xs text-slate-600 dark:text-slate-300">{t('All Top')} {games.length} {t('Games')}</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                        <Icon name="X" size={20} />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/50 dark:bg-slate-950/50">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                        {paginatedGames.map((game, index) => {
                            const globalIndex = (validCurrentPage - 1) * itemsPerPage + index;
                            const isHypervisor = game.category?.toLowerCase() === 'hypervisor';
                            return (
                                <motion.div 
                                    key={`${game.id}-${globalIndex}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="relative group cursor-pointer"
                                    onClick={() => onSelect(game)}
                                >
                                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-blue-500/20 group-hover:border-blue-500/50">
                                        <img 
                                            src={game.image || game.coverImage || 'https://placehold.co/600x800/0f172a/334155?text=ENCRYPTED'} 
                                            alt={game.name} 
                                            className="w-full h-full object-cover transition-all duration-500 group-hover:brightness-110 saturate-100 group-hover:saturate-150"
                                            onError={(e) => {
                                                e.currentTarget.src = 'https://placehold.co/600x800/0f172a/334155?text=ENCRYPTED';
                                            }}
                                        />
                                        
                                        

                                        {isHypervisor && (
                                            <div className="absolute top-2 end-2 z-10 bg-red-600/90 backdrop-blur-md text-white font-black text-[10px] sm:text-xs px-2 py-1 rounded-lg shadow-lg border border-red-400/30 group-hover:scale-110 transition-transform">
                                                HV
                                            </div>
                                        )}
                                        
                                        
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {totalPages > 1 && (
                    <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-center items-center shrink-0">
                        <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={validCurrentPage === 1}
                                className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
                            >
                                <Icon name="ChevronLeft" size={16} className="rtl:rotate-180" />
                            </button>
                            {(() => {
                                const maxVisible = Math.min(5, totalPages);
                                let startPage = Math.max(1, validCurrentPage - Math.floor(maxVisible / 2));
                                if (startPage + maxVisible - 1 > totalPages) {
                                    startPage = Math.max(1, totalPages - maxVisible + 1);
                                }
                                return Array.from({ length: maxVisible }, (_, i) => startPage + i).map(pageNum => (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${
                                            validCurrentPage === pageNum 
                                                ? 'bg-blue-600 text-white shadow-md' 
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                ));
                            })()}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={validCurrentPage === totalPages}
                                className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
                            >
                                <Icon name="ChevronRight" size={16} className="rtl:rotate-180" />
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        </motion.div>
        )}
        </AnimatePresence>,
        document.body
    );
};


const GameOfTheDaySection: React.FC<{
    game: ResourceItem | null;
    onSelect: (item: ResourceItem) => void;
}> = ({ game, onSelect }) => {
    const { t, dir } = useLanguage();
    if (!game) return null;

    const bgUrl = game.galleryImages?.[0] || game.image || game.coverImage;
    const isVideo = bgUrl?.match(/\.(webm|mp4)$/i);

    const todayDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    return (
        <div dir={dir} className="mt-8 mb-4 bg-white dark:bg-[#0a111a] rounded-xl border border-slate-200 dark:border-slate-800/60 overflow-hidden relative w-full shadow-xl dark:shadow-2xl flex flex-col md:flex-row">
            <div className="absolute inset-0 z-0">
                {isVideo ? (
                    <video src={bgUrl} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-10 dark:opacity-20" />
                ) : (
                    <img src={bgUrl} alt="" className="w-full h-full object-cover opacity-10 dark:opacity-20" />
                )}
                <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r md:from-white md:via-white/90 dark:md:from-[#0a111a] dark:md:via-[#0a111a]/90 from-white/80 via-white/80 dark:from-[#0a111a]/80 dark:via-[#0a111a]/80 to-transparent"></div>
            </div>

            <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row gap-8 lg:gap-12 w-full items-center md:items-start">
                <div className="shrink-0 w-48 sm:w-56 md:w-64 flex flex-col items-center">
                    <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden cursor-pointer shadow-[0_0_20px_rgba(30,161,215,0.1)]" onClick={() => onSelect(game)}>
                        <div className="absolute top-0 start-0 w-4 h-4 border-t-2 border-s-2 border-[#1ea1d7] z-20"></div>
                        <div className="absolute top-0 end-0 w-4 h-4 border-t-2 border-e-2 border-[#1ea1d7] z-20"></div>
                        <div className="absolute bottom-0 start-0 w-4 h-4 border-b-2 border-s-2 border-[#1ea1d7] z-20"></div>
                        <div className="absolute bottom-0 end-0 w-4 h-4 border-b-2 border-e-2 border-[#1ea1d7] z-20"></div>

                        <img src={game.coverImage} className="w-full h-full object-cover relative z-10" />
                        
                        <div className="absolute top-0 end-3 z-20 bg-[#1ea1d7] text-white p-2 pb-3 rounded-b-md">
                            <Icon name="Star" size={16} className="fill-current" />
                        </div>

                        {game.version && game.category !== 'steamtools' && (
                            <div className="absolute bottom-3 start-3 z-20 bg-white/90 dark:bg-black/90 text-emerald-600 dark:text-emerald-700 dark:text-emerald-400 text-xs font-bold px-2 py-1 border border-emerald-500/30 rounded shadow-md">
                                {game.version}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between w-full px-4 sm:px-6 mt-6 text-center">
                        <div>
                            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">{getFakeDownloads(game.id)}</div>
                            <div className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-wider mt-1 uppercase">{t('DOWNLOADS')}</div>
                        </div>
                        <div>
                            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">{getFakeLikes(game.id)}</div>
                            <div className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-wider mt-1 uppercase">{t('LIKES')}</div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex flex-col mt-4 md:mt-0 items-center md:items-start text-center md:text-start">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4 mb-4">
                        <span className="bg-[#1ea1d7] text-white text-[10px] sm:text-[11px] font-black px-2 sm:px-3 py-1 sm:py-1.5 rounded uppercase tracking-wider">{t('GAME OF THE DAY')}</span>
                        {game.category?.toLowerCase() === 'hypervisor' && (
                            <span className="bg-purple-100 dark:bg-purple-500/20 border border-purple-200 dark:border-purple-500/30 text-purple-600 dark:text-purple-400 text-[10px] sm:text-[11px] font-black px-2 sm:px-3 py-1 sm:py-1.5 rounded uppercase tracking-wider">
                                {t('HYPERVISOR')}
                            </span>
                        )}
                        <span className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-medium">{todayDate}</span>
                        {game.links?.trailer && (
                            <span className="bg-red-100 dark:bg-red-500/20 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-[10px] sm:text-[11px] font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400"></div>
                                {t('Trailer')}
                            </span>
                        )}
                    </div>

                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">{game.name}</h2>
                    
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-6 font-medium flex-wrap justify-center md:justify-start">
                        <span className="bg-slate-200 dark:bg-slate-800/80 text-slate-800 dark:text-white px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold border border-slate-300 dark:border-slate-700/50">PC</span>
                        <span className="bg-slate-200 dark:bg-slate-800/80 text-slate-800 dark:text-white px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold border border-slate-300 dark:border-slate-700/50">2026</span>
                        <span className="opacity-50">—</span>
                        <span>{game.genres?.split(',').slice(0, 3).join(', ')}</span>
                    </div>

                    <p className="text-slate-700 dark:text-slate-300 text-sm md:text-[15px] leading-relaxed line-clamp-3 mb-6 sm:mb-8 max-w-2xl">
                        {game.description}
                    </p>

                    <div className="flex items-center gap-6 sm:gap-8 mb-6 sm:mb-8 text-xs sm:text-sm border-b border-slate-200 dark:border-slate-800/60 pb-6 w-full max-w-xl justify-center md:justify-start">
                        <div><span className="text-slate-900 dark:text-white font-bold">{game.repackSize}</span> <span className="text-slate-500 mis-1">{t('size')}</span></div>
                        <div><span className="text-slate-900 dark:text-white font-bold">{getFakeDownloads(game.id)}</span> <span className="text-slate-500 mis-1">{t('views')}</span></div>
                        <div><span className="text-slate-900 dark:text-white font-bold">4.1</span> <span className="text-slate-500 mis-1">{t('score')}</span></div>
                    </div>

                    <button 
                        onClick={() => onSelect(game)}
                        className="bg-primary-500 text-white dark:bg-white dark:text-slate-900 font-bold px-5 sm:px-6 py-2.5 sm:py-3 rounded-md flex items-center gap-2 hover:bg-primary-600 dark:hover:bg-slate-200 transition-colors w-fit"
                    >
                        {t('View Details')}
                        <Icon name="ArrowRight" size={16} className="rtl:rotate-180" />
                    </button>
                </div>
            </div>
        </div>
    );
};


const SupportUsBanner: React.FC = () => {
    const { dir, t } = useLanguage();
    const [isDonateOpen, setIsDonateOpen] = useState(false);

    return (
        <div className="mt-12 bg-white dark:bg-slate-950 rounded-3xl p-6 sm:p-10 lg:p-14 relative overflow-hidden flex flex-col md:flex-row items-center justify-between shadow-xl dark:shadow-2xl border border-slate-200 dark:border-slate-800 transition-colors duration-300">
            {/* Background styling */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/80 via-white to-slate-50 dark:from-indigo-900/40 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300"></div>
                <div className="absolute top-0 right-0 w-full md:w-1/2 h-full bg-gradient-to-l from-indigo-500/10 to-transparent blur-3xl"></div>
            </div>

            {/* Left Side Content */}
            <div className="relative z-10 w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-start mb-10 md:mb-0 space-y-5" dir={dir}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest mb-2 transition-colors duration-300">
                    <Icon name="Heart" size={14} className="animate-pulse" />
                    <span>{t('Support The Community')}</span>
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white uppercase tracking-tighter transition-colors duration-300" style={{ fontFamily: "'Nexa', 'Inter', sans-serif" }}>
                    {t('Keep Us')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">{t('Alive')}</span>
                </h2>
                <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-md font-medium leading-relaxed transition-colors duration-300">
                    {t('Help us maintain the servers and continue delivering premium content. Every contribution makes a huge difference.')}
                </p>
                <button 
                    onClick={() => setIsDonateOpen(true)}
                    className="mt-6 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-[0_0_30px_rgba(79,70,229,0.3)] hover:shadow-[0_0_40px_rgba(79,70,229,0.5)] transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center gap-3"
                >
                    <Icon name="Heart" size={20} className="fill-current" />
                    {t('Support Us')}
                </button>
            </div>

            {/* Right Side Image */}
            <div className="relative z-10 w-full md:w-1/2 flex justify-center md:justify-end">
                <img 
                    src="/images/support_logo.png" 
                    alt="Support Logo" 
                    className="w-full h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500" 
                    style={{ maxWidth: '1024px', maxHeight: '500px' }}
                />
            </div>

            <DonateModal open={isDonateOpen} onClose={() => setIsDonateOpen(false)} />
        </div>
    );
};


const MostPopularRepacksSection: React.FC<{ 
    gameIds: string[], 
    allResources: Record<string, ResourceItem[]>,
    onSelect: (item: ResourceItem) => void
}> = ({ gameIds, allResources, onSelect }) => {
    const { dir, t } = useLanguage();
    
    const [displayCount, setDisplayCount] = useState(20);
    const [showAllModal, setShowAllModal] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 640) setDisplayCount(8);
            else if (window.innerWidth < 768) setDisplayCount(12);
            else if (window.innerWidth < 1024) setDisplayCount(16);
            else setDisplayCount(18);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Find games based on IDs
    const games = useMemo(() => {
        const allItems = Object.values(allResources).flat();
        return gameIds.map(id => allItems.find(i => String(i.id).toLowerCase() === String(id).toLowerCase())).filter(Boolean) as ResourceItem[];
    }, [gameIds, allResources]);

    if (!games || games.length === 0) return null;

    const displayedGames = games.slice(0, displayCount);

    return (
        <>
        <div id="popular-repacks-section" className="mt-12 relative z-10 w-full overflow-hidden scroll-mt-24">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 sm:mb-10 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-yellow-500/20 shrink-0 transform -rotate-3 hover:rotate-0 transition-transform">
                        <Icon name="Trophy" size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-tight">
                            {t('Most Popular Repacks')}</h2>
                        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">{t('Top community favorites this year')}</p>
                    </div>
                </div>
                
                {games.length > displayCount && (
                    <button 
                        onClick={() => setShowAllModal(true)}
                        className="w-full sm:w-auto group relative px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm uppercase tracking-widest rounded-xl transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] flex items-center justify-center gap-2 overflow-hidden shrink-0"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <span className="relative z-10 flex items-center gap-2 group-hover:text-white transition-colors duration-300">
                            {t('SEE MORE GAMES')}
                            <Icon name="ArrowRight" size={20} className="transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform rtl:rotate-180" />
                        </span>
                    </button>
                )}
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-5 relative z-10">
                {displayedGames.map((game, index) => {
                    const isHypervisor = game.category?.toLowerCase() === 'hypervisor';
                    return (
                        <motion.div 
                            key={`${game.id}-${index}`}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            className="relative group cursor-pointer"
                            onClick={() => onSelect(game)}
                        >
                            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 shadow-sm transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-blue-500/20 group-hover:border-blue-500/50">
                                <img 
                                    src={game.image || game.coverImage || 'https://placehold.co/600x800/0f172a/334155?text=ENCRYPTED'} 
                                    alt={game.name} 
                                    className="w-full h-full object-cover transition-all duration-700 group-hover:brightness-110 saturate-100 group-hover:saturate-150"
                                    onError={(e) => {
                                        e.currentTarget.src = 'https://placehold.co/600x800/0f172a/334155?text=ENCRYPTED';
                                    }}
                                />
                                
                                
                                {isHypervisor && (
                                    <div className="absolute top-2 end-2 z-10 bg-red-500/90 backdrop-blur-md text-white font-black text-[9px] sm:text-[10px] px-2 py-1 rounded-lg shadow-lg border border-red-400/30 group-hover:scale-110 transition-transform tracking-widest">
                                        HV
                                    </div>
                                )}
                                
                                </div>
</motion.div>
                    );
                })}
            </div>
        </div>

        <MostPopularRepacksModal             isOpen={showAllModal}
            games={games} 
            onClose={() => setShowAllModal(false)} 
            onSelect={(game) => {
                setShowAllModal(false);
                onSelect(game);
            }} 
        />
        </>
    );
};

const TopGamesSection: React.FC<{ games: TopGame[] }> = ({ games }) => {
    const { dir, t } = useLanguage();
    const [currentPage, setCurrentPage] = useState(0);
    const ITEMS_PER_PAGE = 10;
    
    const noData = !games || games.length === 0;

    const dummyGames: TopGame[] = [
        {
            id: 'dummy-1',
            rank: 1,
            name: 'Red Dead Redemption 2',
            bannerUrl: 'https://images.igdb.com/igdb/image/upload/t_1080p/ar5n9.jpg',
            logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Red_Dead_Redemption_2_Logo.svg/800px-Red_Dead_Redemption_2_Logo.svg.png',
            symbolUrl: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/red-dead-redemption-2.svg'
        },
        {
            id: 'dummy-2',
            rank: 2,
            name: 'The Witcher 3: Wild Hunt',
            bannerUrl: 'https://images.igdb.com/igdb/image/upload/t_1080p/sc5tk7.jpg',
            logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/The_Witcher_3_Wild_Hunt_logo.svg/800px-The_Witcher_3_Wild_Hunt_logo.svg.png',
            symbolUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Witcher_3_School_of_the_Wolf_Medallion.svg/200px-Witcher_3_School_of_the_Wolf_Medallion.svg.png'
        }
    ];

    const displayGames = noData ? dummyGames : games;
    const totalPages = Math.ceil(displayGames.length / ITEMS_PER_PAGE);
    const displayedPageGames = displayGames.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);

    return (
        <div className="mt-12 w-screen relative start-[50%] end-[50%] -ms-[50vw] -me-[50vw] overflow-hidden bg-slate-50 dark:bg-[#0a0a0a] border-y border-slate-200 dark:border-white/10 transition-colors duration-300">
            {noData && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 m-4 md:m-8 rounded-xl relative z-20 mx-auto max-w-5xl">
                    <h4 className="text-yellow-400 font-bold mb-2 flex items-center gap-2">
                        <Icon name="AlertTriangle" size={20} /> Action Required: Google Apps Script Update
                    </h4>
                    <p className="text-sm text-yellow-200/80 mb-2">
                        Your Google Apps Script is not returning the "topgames" sheet data. You are currently seeing a preview with dummy data.
                    </p>
                    <p className="text-xs text-yellow-200/60 font-mono bg-black/30 p-3 rounded-lg overflow-x-auto">
                        1. Open your Google Sheet <br/>
                        2. Go to Extensions &gt; Apps Script <br/>
                        3. Make sure it fetches the new sheet. If you have hardcoded sheet names, add "topgames" (or exactly how you named it) to the loop.<br/>
                        4. VERY IMPORTANT: Click Deploy &gt; New deployment &gt; Web app. Overwriting an old version without "New deployment" will NOT work!
                    </p>
                </div>
            )}
            {/* Header / Title Style */}
            <div dir={dir} className="relative z-10 flex flex-col items-center justify-center py-16 px-4">
                <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 dark:opacity-40 mix-blend-luminosity"
                    style={{ backgroundImage: `url('https://e1.pxfuel.com/desktop-wallpaper/123/929/desktop-wallpaper-we-loved-them-all-games-collage.jpg')` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-slate-50/70 to-slate-50 dark:from-[#0a0a0a] dark:via-[#0a0a0a]/50 dark:to-[#0a0a0a] transition-colors duration-300"></div>
                
                <div className="relative z-20 text-center flex flex-col items-center">
                    <h2 className="flex flex-col md:flex-row items-center justify-center font-black tracking-tighter leading-none transition-colors duration-300">
                        <span className="text-8xl md:text-[11rem] xl:text-[13rem] text-slate-900 dark:text-slate-100 font-['Anton'] md:pe-6 rtl:md:ps-6 leading-none">
                            {displayGames.length}
                        </span>
                        <div className="flex flex-col items-center md:items-start md:mt-2">
                            <span className="text-5xl md:text-7xl xl:text-[6.5rem] font-['Bebas_Neue'] uppercase leading-[0.8] tracking-widest text-[#0b1b3d] dark:text-[#c4d4e2]">
                                {t('OPEN WORLD')}
                            </span>
                            <span className="text-[5rem] md:text-[8rem] xl:text-[10rem] font-['Permanent_Marker'] md:-ms-2 rtl:md:-me-2 text-transparent bg-clip-text bg-gradient-to-br from-red-600 via-red-500 to-orange-600 leading-[0.8] -mt-2 md:-mt-6 text-stroke-2 text-stroke-white dark:text-stroke-black" style={{ WebkitTextStroke: '2px rgba(255,255,255,0.1)' }}>
                                {t('GAMES')}
                            </span>
                        </div>
                    </h2>
                    <div className="mt-4 md:mt-6 flex items-center gap-4 text-slate-800 dark:text-slate-200 font-['Inter'] font-black tracking-[0.3em] text-lg md:text-2xl uppercase transition-colors duration-300">
                        <span className="h-[2px] w-12 md:w-24 bg-slate-800 dark:bg-slate-200 transition-colors duration-300 opacity-50"></span>
                        {t('YOU MUST PLAY')}
                        <span className="h-[2px] w-12 md:w-24 bg-slate-800 dark:bg-slate-200 transition-colors duration-300 opacity-50"></span>
                    </div>
                    <p className="mt-4 text-[9px] md:text-xs text-slate-600 dark:text-slate-400 font-bold tracking-[0.25em] uppercase transition-colors duration-300">
                        {t('From Fantasy Kingdoms to Chaotic Cities')}
                    </p>
                </div>
            </div>

            <div className="flex flex-col relative z-10 max-w-7xl mx-auto w-full px-4 mb-10">
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={currentPage}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={{ duration: 0.4 }}
                        className="flex flex-col rounded-2xl overflow-hidden border border-slate-300 dark:border-white/10 shadow-2xl transition-colors duration-300"
                    >
                        {displayedPageGames.map((game, idx) => {
                            // Rank text e.g. "01"
                            const rankNum = game.rank.toString().padStart(2, '0');
                            
                            // Neon colors
                            const neonColors = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#0ea5e9', '#8b5cf6', '#d946ef', '#f43f5e'];
                            const c1 = neonColors[idx % neonColors.length];
                            
                            return (
                                <div key={`${game.id}-${idx}`} className="relative group flex items-stretch border-b border-slate-300 dark:border-white/10 last:border-b-0 overflow-hidden min-h-[90px] sm:min-h-[110px] md:min-h-[130px] transition-all hover:brightness-105 dark:hover:brightness-125 bg-white sm:bg-transparent dark:bg-black/60 dark:md:backdrop-blur-md">
                                    {/* Number Box on the left */}
                                    <div className="w-[70px] md:w-[120px] shrink-0 flex items-center justify-center bg-slate-100 dark:bg-[#050505] relative z-20 border-e border-slate-300 dark:border-white/5 shadow-none dark:shadow-[5px_0_15px_rgba(0,0,0,0.5)] transition-colors duration-300">
                                        <span 
                                            style={{ 
                                                textShadow: `0 0 10px ${c1}66`,
                                                color: c1
                                            }}
                                            className="font-['Anton'] italic text-4xl md:text-6xl drop-shadow-md brightness-90 dark:brightness-125"
                                        >
                                            {rankNum}
                                        </span>
                                    </div>
                                    
                                    {/* Content Area with Banner Background */}
                                    <div className="flex-1 relative flex items-center px-4 md:px-8 py-2 overflow-hidden bg-slate-200 dark:bg-slate-900 transition-colors duration-300">
                                        {/* Banner Background */}
                                        <div 
                                            className="absolute inset-0 bg-cover bg-[center_30%] transition-transform duration-[20s] group-hover:scale-110 opacity-80 dark:opacity-100"
                                            style={{ backgroundImage: `url(${game.bannerUrl})` }}
                                        ></div>
                                        
                                        {/* Dynamic Gradient for Light/Dark */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/50 to-white/95 dark:hidden"></div>
                                        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-black/90 hidden dark:block"></div>
                                        
                                        {/* Logo / Title Area */}
                                        <div className="relative z-10 flex-1 flex items-center justify-start h-full">
                                            {game.logoUrl ? (
                                                <div className="flex items-center justify-start w-[140px] sm:w-[220px] md:w-[350px] h-12 md:h-20 flex-shrink-0">
                                                    <img src={game.logoUrl} alt={game.name} className="max-w-full max-h-full object-contain object-left drop-shadow-[0_2px_5px_rgba(0,0,0,0.2)] dark:drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)] transition-transform duration-300 group-hover:scale-105"  loading="lazy" />
                                                </div>
                                            ) : (
                                                <h3 className="font-black italic text-xl md:text-4xl text-slate-900 dark:text-white tracking-tight uppercase drop-shadow-[0_2px_5px_rgba(255,255,255,1)] dark:drop-shadow-[0_5px_15px_rgba(0,0,0,1)] transition-colors duration-300">
                                                    {game.name}
                                                </h3>
                                            )}
                                        </div>

                                        {/* Symbol on the right */}
                                        {game.symbolUrl && (
                                            <div className="relative z-10 shrink-0 ms-4 flex items-center justify-end w-[40px] md:w-[80px] h-10 md:h-20 me-2">
                                                <img src={game.symbolUrl} alt="Symbol" className="max-w-full max-h-full object-contain object-right opacity-90 group-hover:opacity-100 transition-all duration-300 drop-shadow-md"  loading="lazy" />
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Right Edge Glow */}
                                    <div className="absolute end-0 top-0 bottom-0 w-1 bg-black/20 dark:bg-white opacity-0 group-hover:opacity-50 blur-[2px] transition-opacity"></div>
                                </div>
                            );
                        })}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="bg-slate-100 dark:bg-[#050505] p-4 border-t border-slate-300 dark:border-white/5 flex justify-center items-center gap-2 transition-colors duration-300">
                    <button 
                        onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                        disabled={currentPage === 0}
                        className="p-3 bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-800 dark:text-white rounded-full transition-colors flex items-center justify-center shrink-0 border border-slate-300 dark:border-transparent shadow-sm"
                    >
                        <Icon name="ChevronLeft" size={20} className="rtl:rotate-180" />
                    </button>
                    <div className="flex gap-2 mx-2">
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i)}
                                className={`h-3 rounded-full transition-all ${
                                    currentPage === i ? 'bg-red-600 dark:bg-red-500 w-6' : 'bg-slate-400 dark:bg-slate-600 hover:bg-slate-500 w-3'
                                }`}
                                aria-label={`Page ${i + 1}`}
                            />
                        ))}
                    </div>
                    <button 
                        onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={currentPage === totalPages - 1}
                        className="p-3 bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-800 dark:text-white rounded-full transition-colors flex items-center justify-center shrink-0 border border-slate-300 dark:border-transparent shadow-sm"
                    >
                        <Icon name="ChevronRight" size={20} className="rtl:rotate-180" />
                    </button>
                </div>
            )}
        </div>
    );
};

const BestStudiosCarousel: React.FC<{ 
    profiles: CompanyProfile[], 
    onSelect: (profile: CompanyProfile) => void,
    onSeeAll: () => void,
    categoryType: 'games' | 'tools'
}> = ({ profiles, onSelect, onSeeAll, categoryType }) => {
    const { dir, t } = useLanguage();
    const sortedProfiles = useMemo(() => {
        return [...profiles]
            .map(p => {
                let count = 0;
                if (categoryType === 'games') {
                    count = (p.gameIds?.length || 0) + (p.hypervisorIds?.length || 0) + (p.steamtoolsIds?.length || 0);
                } else {
                    count = (p.architectIds?.length || 0) + (p.extraIds?.length || 0);
                }
                return {
                    ...p,
                    totalGames: count
                };
            })
            .filter(p => p.totalGames > 0)
            .sort((a, b) => b.totalGames - a.totalGames);
    }, [profiles, categoryType]);

    const displayProfiles = sortedProfiles.slice(0, 6);
    
    if (displayProfiles.length === 0) return null;

    return (
        <div className="mt-16 w-full relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 px-2">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center border border-blue-200 dark:border-blue-500/30">
                            <Icon name="Briefcase" size={20} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        {categoryType === 'games' ? t('Top Studios') : t('Top Tech Companies')}
                    </h2>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 font-medium">{t('Leading developers by released items')}</p>
                </div>
                <button 
                    onClick={onSeeAll}
                    className="cursor-pointer shrink-0 group text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                    {t('View Directory')} <Icon name="ArrowRight" size={16} className="group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform rtl:rotate-180" />
                </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {displayProfiles.map((profile, i) => (
                    <div 
                        key={profile.id}
                        onClick={() => onSelect(profile)}
                        className="group relative bg-white dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800/60 rounded-3xl p-5 md:p-6 overflow-hidden cursor-pointer hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300"
                    >
                        <div className="absolute top-0 end-0 w-32 h-32 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-bl-full pointer-events-none transition-opacity opacity-0 group-hover:opacity-100" />
                        
                        <div className="flex items-start justify-between mb-6">
                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-slate-50 dark:bg-slate-900/80 flex items-center justify-center p-3 border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden group-hover:scale-105 transition-transform duration-300">
                                {profile.logoUrl ? (
                                    <img src={profile.logoUrl} alt={profile.name} className="w-full h-full object-contain filter group-hover:brightness-110 transition-all cursor-pointer" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement.innerHTML = '<span class="font-black text-xl text-slate-600 dark:text-slate-300 group-hover:text-blue-500 transition-colors cursor-pointer">' + profile.name.substring(0, 2).toUpperCase() + '</span>'; }} />
                                ) : (
                                    <span className="font-black text-xl text-slate-600 dark:text-slate-300 group-hover:text-blue-500 transition-colors cursor-pointer">{profile.name.substring(0, 2).toUpperCase()}</span>
                                )}
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
                                    {profile.totalGames}
                                </span>
                                <span className="text-[10px] md:text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                                    {profile.totalGames === 1 ? t('Item') : t('Items')}
                                </span>
                            </div>
                        </div>
                        
                        <div>
                            <h3 className="font-bold text-base md:text-lg text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-500 transition-colors">
                                {profile.name}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-blue-500 text-xs font-semibold">
                                {t('View Profile')} <Icon name="ArrowRight" size={12} className="rtl:rotate-180" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- MAIN PAGE COMPONENT ---

const SecretArea: React.FC = () => {
  const { dir, t } = useLanguage();
  const [currentUser, setCurrentUser] = useState<any>(null); const [authChecked, setAuthChecked] = useState(false); const [isUnlocked, setIsUnlocked] = useState(() => localStorage.getItem('secret_area_unlocked') === 'true' || localStorage.getItem('nexa_guest_mode') === 'true');
  const [isGuestMode, setIsGuestMode] = useState(() => localStorage.getItem('nexa_guest_mode') === 'true');

  useEffect(() => {
    const handleAuthChange = () => {
      const isGuest = localStorage.getItem('nexa_guest_mode') === 'true' || localStorage.getItem('secret_area_unlocked') === 'guest';
      const isTrue = localStorage.getItem('secret_area_unlocked') === 'true';
      const unlocked = isTrue || isGuest;
      setIsUnlocked(unlocked);
      setIsGuestMode(isGuest);
      if (!unlocked) {
        setShowHackerLoader(false);
      }
    };

    const handleReturnToTerminal = () => {
      setIsUnlocked(false);
      setIsGuestMode(false);
      setShowHackerLoader(false);
      setTerminalCleared(false);
      setShowMathGame(false);
    };

    const handleAuthMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'DISCORD_AUTH_SUCCESS' && event.data.user) {
        const discordUser = event.data.user;
        const profileObj = {
          displayName: discordUser.global_name || discordUser.username,
          username: discordUser.username,
          email: discordUser.email || `${discordUser.username}@discord.com`,
          photoURL: discordUser.avatar 
            ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
            : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
          provider: 'discord',
          loginMethod: 'discord',
          id: discordUser.id,
          uid: `discord_${discordUser.id}`,
          role: 'user',
          status: 'active',
          joinedAt: new Date().toISOString()
        };

        import('../src/services/userService').then(({ ensureUserProfile }) => {
          ensureUserProfile(profileObj).catch(() => {});
        });
        localStorage.setItem('secret_area_unlocked', 'true');
        localStorage.removeItem('nexa_guest_mode');
        localStorage.setItem('nexa_user_profile', JSON.stringify(profileObj));
        localStorage.setItem('nexa_discord_user', JSON.stringify(discordUser));
        setIsUnlocked(true);
        setIsGuestMode(false);
        setShowHackerLoader(true);
        setHackerProgress(0);
        window.dispatchEvent(new Event('authChange'));
        fetchData();
      }
    };

    window.addEventListener('authChange', handleAuthChange);
    window.addEventListener('return-to-terminal', handleReturnToTerminal);
    window.addEventListener('message', handleAuthMessage);
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
      window.removeEventListener('return-to-terminal', handleReturnToTerminal);
      window.removeEventListener('message', handleAuthMessage);
    };
  }, []);

  useEffect(() => {
    import('../src/firebase').then(({ auth }) => {
      const unsubscribe = auth.onAuthStateChanged((user) => { setCurrentUser(user); setAuthChecked(true); 
        if (user) {
          setIsUnlocked(true);
          setIsGuestMode(false);
          localStorage.setItem('secret_area_unlocked', 'true');
          window.dispatchEvent(new Event('authChange'));
          import('../src/services/userService').then(({ ensureUserProfile }) => {
            ensureUserProfile(user);
          });
        }
      });
      return () => unsubscribe();
    });
  }, []);
  const [showHackerLoader, setShowHackerLoader] = useState(() => localStorage.getItem('secret_area_unlocked') === 'true' || localStorage.getItem('nexa_guest_mode') === 'true');
  const [hackerProgress, setHackerProgress] = useState(0);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [authDomainError, setAuthDomainError] = useState<string | null>(null);
  const [discordSetupNotice, setDiscordSetupNotice] = useState<string | null>(null);
  const [githubSetupNotice, setGithubSetupNotice] = useState<string | null>(null);
  const [instantDiscordName, setInstantDiscordName] = useState('');
  const [domainCopied, setDomainCopied] = useState(false);
  const [copiedDiscord, setCopiedDiscord] = useState(false);
  const [copiedShared, setCopiedShared] = useState(false);
  const [copiedVercel, setCopiedVercel] = useState(false);
  const [copiedGithub, setCopiedGithub] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [imageProgress, setImageProgress] = useState(0);
  
  const loadingRef = useRef(loading);
  useEffect(() => { loadingRef.current = loading; }, [loading]);
  
  const imagesLoadingRef = useRef(imagesLoading);
  useEffect(() => { imagesLoadingRef.current = imagesLoading; }, [imagesLoading]);
  
  const imageProgressRef = useRef(imageProgress);
  useEffect(() => { imageProgressRef.current = imageProgress; }, [imageProgress]);

  const [networkStatus, setNetworkStatus] = useState<{ quality: string | null, isTesting: boolean }>({ quality: null, isTesting: false });
  const [allResources, setAllResources] = useState<Record<string, ResourceItem[]>>({ game: [], hypervisor: [], steamtools: [], architect: [], extra: [] });
  const [companyProfiles, setCompanyProfiles] = useState<CompanyProfile[]>([]);
  const [topGames, setTopGames] = useState<TopGame[]>([]);
  const [bestGameSeries, setBestGameSeries] = useState<BestGameSeries[]>([]);
  const [sheetUpcomingTrailers, setSheetUpcomingTrailers] = useState<any[]>([]);
  const [openedViaRandom, setOpenedViaRandom] = useState(false);
  const [popularRepackIds, setPopularRepackIds] = useState<string[]>([]);
  
  const getResolvedDeveloper = (item: ResourceItem) => {
      if (item.developer && item.developer.trim()) return item.developer;
      const catMap: Record<string, keyof CompanyProfile> = {
          'game': 'gameIds',
          'hypervisor': 'hypervisorIds',
          'steamtools': 'steamtoolsIds',
          'architect': 'architectIds',
          'extra': 'extraIds'
      };
      
      const key = catMap[item.category];
      if (!key) return '';

      for (const profile of companyProfiles) {
          const ids = (profile[key] as string[]) || [];
          const lowerIds = ids.map(id => String(id).toLowerCase().trim()).filter(Boolean);
          const numericIds = ids.map(id => String(id).replace(/^[A-Za-z]+[-]?/, '').toLowerCase().trim()).filter(Boolean);
          const itemIdsToMatch = [
              String(item.id || '').toLowerCase().trim(),
              String(item.id || '').replace(/^[A-Za-z]+[-]?/, '').toLowerCase().trim(),
              String(item.gameId || '').toLowerCase().trim()
          ].filter(Boolean);

          if (lowerIds.length > 0) {
              const matched = lowerIds.some(id => 
                  itemIdsToMatch.includes(id) || 
                  itemIdsToMatch.some(itemId => itemId === id || itemId.endsWith(`-${id}`) || itemId.endsWith(id))
              ) || numericIds.some(id => itemIdsToMatch.includes(id));
              
              if (matched) return profile.name;
          }
      }

      // Automatic fallback matching: match brand/studio names from known company profiles in item title
      const itemName = String(item.name || '').trim().toLowerCase();
      if (itemName) {
          const cleanItemTitle = itemName.replace(/[^a-z0-9]/g, ' ');
          for (const profile of companyProfiles) {
              const profName = String(profile.name || '').trim().toLowerCase();
              if (!profName || profName === 'unknown' || profName.length < 3) continue;
              
              // Only consider profiles that have items registered in this category or generic software studios
              const catIds = (profile[key] as string[]) || [];
              const hasCatRelevance = catIds.length > 0 || ['architect', 'extra'].includes(item.category);
              if (!hasCatRelevance) continue;

              const cleanProfName = profName.replace(/[^a-z0-9]/g, ' ');
              const regex = new RegExp(`(^|\\s)${cleanProfName.replace(/\s+/g, '\\s+')}(\\s|$)`, 'i');
              if (regex.test(cleanItemTitle) || cleanItemTitle.startsWith(cleanProfName)) {
                  return profile.name;
              }
          }
      }

      return '';
  };

  const [activeTab, setActiveTab] = useState<'game' | 'hypervisor' | 'steamtools' | 'architect' | 'extra' | 'stash'>('game');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const [stash, setStash] = useState<string[]>([]);
  const [animateStashTab, setAnimateStashTab] = useState(false);
  const [showAllProfiles, setShowAllProfiles] = useState(false);

  useEffect(() => {
    const syncStashState = (e?: any) => {
      if (e?.detail?.profile) {
        const p = e.detail.profile;
        if (Array.isArray(p.stash)) {
          setStash(p.stash);
          return;
        }
        if (Array.isArray(p.favorites)) {
          setStash(p.favorites.map((f: any) => typeof f === 'string' ? f : (f?.id || f?.gameId || '')).filter(Boolean));
          return;
        }
      }
      try {
        const savedStash = JSON.parse(localStorage.getItem('myStash') || localStorage.getItem('stash') || '[]');
        if (Array.isArray(savedStash)) {
          setStash(savedStash);
        }
      } catch (err) {}
    };

    syncStashState();
    window.addEventListener('secretarea_profile_sync', syncStashState);

    const activeUid = currentUser?.uid || (localStorage.getItem('secret_area_unlocked') === 'true' ? 'guest' : null);
    let unsub: (() => void) | null = null;
    if (activeUid) {
      import('../src/services/userService').then(({ subscribeUserProfile }) => {
        unsub = subscribeUserProfile(activeUid, (data) => {
          if (data.stash && Array.isArray(data.stash)) {
            setStash(data.stash);
          } else if (data.favorites && Array.isArray(data.favorites)) {
            setStash(data.favorites.map((f: any) => typeof f === 'string' ? f : (f?.id || f?.gameId || '')).filter(Boolean));
          }
        }, currentUser);
      });
    }

    return () => {
      window.removeEventListener('secretarea_profile_sync', syncStashState);
      if (unsub) unsub();
    };
  }, [currentUser]);

  const showGuestNotification = () => {
    const notifId = Date.now();
    setNotifications(prev => [...prev, {
        id: notifId,
        title: '🔑 Access Denied - Guest Mode',
        text: 'Please login with Secret Key To get Full Access. If you don\'t have a Secret Key, contact Admin from TikTok, Instagram, or Email.',
        time: 'Just now'
    }]);
    setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notifId));
    }, 8000);
  };

  const toggleStash = (id: string, e?: React.MouseEvent, itemObj?: ResourceItem) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    const isAdding = !stash.some(s => String(s).toLowerCase() === String(id).toLowerCase());
    const newStash = isAdding 
      ? [...stash.filter(i => String(i).toLowerCase() !== String(id).toLowerCase()), id] 
      : stash.filter(i => String(i).toLowerCase() !== String(id).toLowerCase());
      
    setStash(newStash);
    try {
      localStorage.setItem('myStash', JSON.stringify(newStash));
      localStorage.setItem('stash', JSON.stringify(newStash));
    } catch (err) {}

    if (isAdding) {
       setAnimateStashTab(true);
       setTimeout(() => setAnimateStashTab(false), 500);
    }

    const activeUid = currentUser?.uid || (isGuestMode || localStorage.getItem('secret_area_unlocked') === 'true' ? 'guest' : null);

    let targetItem: ResourceItem | null = itemObj || null;
    if (!targetItem) {
      for (const category in allResources) {
        const match = allResources[category].find((r: any) => 
          String(r.id).toLowerCase() === String(id).toLowerCase() || 
          (r.gameId && String(r.gameId).toLowerCase() === String(id).toLowerCase())
        );
        if (match) {
          targetItem = match;
          break;
        }
      }
    }

    if (activeUid) {
      import('../src/services/userService').then(({ saveUserStash, recordGameInteraction }) => {
        saveUserStash(activeUid, newStash);

        if (targetItem) {
          recordGameInteraction(activeUid, {
            id: targetItem.id,
            name: targetItem.name,
            coverImage: targetItem.coverImage || '',
            category: targetItem.category || 'game',
            genres: targetItem.genres || '',
            version: targetItem.version || 'v1.0',
            repackSize: targetItem.repackSize || '',
            description: targetItem.description || '',
            links: targetItem.links || null
          }, isAdding ? 'favorite' : 'unfavorite');
        } else {
          recordGameInteraction(activeUid, {
            id: id,
            name: id,
            coverImage: '',
            category: 'game'
          }, isAdding ? 'favorite' : 'unfavorite');
        }
      });
    }
  };

  const [selectedResource, setSelectedResource] = useState<ResourceItem | null>(null);
  const [selectedResourceAction, setSelectedResourceAction] = useState<string | undefined>(undefined);

  const routerLocation = useLocation();

  const handleCloseDetailModal = () => {
    setSelectedResource(null);
    setSelectedResourceAction(undefined);
    setOpenedViaRandom(false);
    if (routerLocation.pathname.startsWith('/game/')) {
      navigate('/', { replace: true });
    } else if (new URLSearchParams(window.location.search).get('item')) {
      const url = new URL(window.location.href);
      url.searchParams.delete('item');
      window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
    }
  };

  useEffect(() => {
    // If there's a state passed via history or router state
    const stateOpenId = (routerLocation.state as any)?.openGameId || window.history.state?.usr?.openGameId;
    const searchParamId = new URLSearchParams(window.location.search).get('item');
    const pathGameId = routerLocation.pathname.startsWith('/game/')
      ? decodeURIComponent(routerLocation.pathname.replace(/^\/game\//, ''))
      : null;
    const targetId = stateOpenId || searchParamId || pathGameId;

    if (targetId) {
      const allItems = Object.values(allResources).flat();
      let gameToOpen = allItems.find(g => 
        String(g.id) === String(targetId) || 
        String(g.gameId) === String(targetId) || 
        g.name?.toLowerCase() === String(targetId).toLowerCase()
      );

      // Fallback: check cached_secret_resources in localStorage
      if (!gameToOpen) {
        try {
          const cached = localStorage.getItem('cached_secret_resources');
          if (cached) {
            const parsed = JSON.parse(cached);
            const flatCached = Object.values(parsed).flat() as any[];
            gameToOpen = flatCached.find(g => 
              String(g?.id) === String(targetId) || 
              String(g?.gameId) === String(targetId) || 
              g?.name?.toLowerCase() === String(targetId).toLowerCase()
            );
          }
        } catch (e) {}
      }

      // Fallback: check state passed from profile
      if (!gameToOpen && (routerLocation.state as any)?.gameData) {
        const gd = (routerLocation.state as any).gameData;
        const targetIdUpper = String(gd.id || targetId).toUpperCase();
        const fallbackCat = gd.category || (targetIdUpper.startsWith('A') ? 'architect' : targetIdUpper.startsWith('H') ? 'hypervisor' : targetIdUpper.startsWith('S') ? 'steamtools' : targetIdUpper.startsWith('E') ? 'extra' : 'game');
        gameToOpen = {
          id: String(gd.id || targetId),
          name: gd.name || targetId,
          coverImage: gd.coverImage || gd.background_image || gd.image || '',
          category: fallbackCat,
          version: gd.version || 'Latest',
          description: gd.description || gd.name || 'Detailed game specifications and direct download resources.',
          repackSize: gd.repackSize || 'N/A',
          originalSize: gd.originalSize || 'N/A',
          genres: gd.genres || 'Action, Adventure',
          languages: gd.languages || 'English',
          repackBy: gd.repackBy || '',
          galleryImages: gd.galleryImages || [gd.coverImage || ''],
          isFree: true,
          links: gd.links || { parts: [], mirrors: [], ankerParts: [] }
        } as ResourceItem;
      }

      if (gameToOpen) {
        setSelectedResource(gameToOpen);
        if (window.history.state?.usr?.openGameId) {
          window.history.replaceState({ usr: { ...window.history.state.usr, openGameId: null } }, '');
        }
      }
    }
  }, [routerLocation.state, routerLocation.search, routerLocation.pathname, allResources]);

  // Handle direct selection from Recent Products panel
  useEffect(() => {
    const handleOpenCatalogItem = (e: any) => {
      if (e.detail) {
        setSelectedResource(e.detail);
      }
    };
    window.addEventListener('open-catalog-item', handleOpenCatalogItem);
    return () => {
      window.removeEventListener('open-catalog-item', handleOpenCatalogItem);
    };
  }, []);

  // Track user views and recent activity
  useEffect(() => {
    if (selectedResource) {
      import('../src/firebase').then(({ auth }) => {
        if (auth.currentUser) {
          recordGameInteraction(auth.currentUser.uid, {
            id: selectedResource.id || '',
            name: selectedResource.name || '',
            coverImage: selectedResource.coverImage || '',
            category: selectedResource.category
          }, 'view');
        }
      });
    }
  }, [selectedResource]);
  const [selectedGenreView, setSelectedGenreView] = useState<string | null>(null);
  const [selectedCompanyProfile, setSelectedCompanyProfile] = useState<CompanyProfile | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [visitorCount, setVisitorCount] = useState(2491);
  const [showIntelPanel, setShowIntelPanel] = useState(false);
  const [notifications, setNotifications] = useState<Array<{id: number, title: string, text: string, time: string, isAr?: boolean}>>([]);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [upcomingGames, setUpcomingGames] = useState<UpcomingGame[]>([]);
  const [upcomingLists, setUpcomingLists] = useState<{ [key: string]: string[] }>({
      game: [],
      hypervisor: [],
      steamtools: [],
      tools: [],
      savegames: []
  });
  const [upcomingPlatform, setUpcomingPlatform] = useState('PlayStation 5');
  const [isUpcomingMissing, setIsUpcomingMissing] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [maintenanceConfig, setMaintenanceConfig] = useState<{active: boolean, endTime: string | null, message: string} | null | undefined>(() => {
    try {
        const cached = localStorage.getItem('cached_secret_resources');
        if (cached) {
            const data = JSON.parse(cached);
            const maintenanceKey = Object.keys(data).find(k => k.toLowerCase() === 'maintenance');
            if (maintenanceKey && Array.isArray(data[maintenanceKey]) && data[maintenanceKey].length > 0) {
                const config = data[maintenanceKey][0];
                const isActiveStr = String(config.active || '').toLowerCase().trim();
                if (isActiveStr === 'true' || isActiveStr === 'yes' || isActiveStr === '1' || config.active === true) {
                    return {
                        active: true,
                        endTime: config.time || config.endTime || config.date || null,
                        message: config.message || "Our website is under temporary maintenance, we will be back soon :)"
                    };
                }
            }
            return null;
        }
    } catch (e) {}
    return undefined;
  });

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Terminal State
  const [terminalHistory, setTerminalHistory] = useState<{type: string, text: React.ReactNode}[]>([
    { type: 'system', text: 'N E X A 1337 OS v9.0.1 - SECURE TERMINAL' },
    { type: 'system', text: 'Unauthorized CLI access is restricted.' },
    { type: 'system', text: 'Type "help" for available protocols.' },
    { type: 'success', text: '💡 TIP: To enter the area, use the Google, Discord, GitHub, or Guest mode buttons below.' }
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [terminalCleared, setTerminalCleared] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const secretBackgrounds = [
    "https://canada1.discourse-cdn.com/flex036/uploads/retrogameboards/original/2X/8/892f6ed5a098a1428757d3b6220ad281eafcbe80.gif",
    "https://media2.giphy.com/media/v1.Y2lkPTZjMDliOTUyZnY4YnZtdGNjbDNjdGhwbTdpbjFiOHBuYWJnbGw3cjVkczM3ZDZ5YyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/Rpl1sod1vCXK0L2SUN/giphy.gif",
    "https://miro.medium.com/1*rv7bzPRCHMsOv1vI_gHyfg.gif",
    "https://i.pinimg.com/originals/4c/d6/ea/4cd6eaa599851725aa5a195d162fb20d.gif"
  ];
  const [bgImage] = useState(() => secretBackgrounds[Math.floor(Math.random() * secretBackgrounds.length)]);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalHistory]);

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = terminalInput.trim();
    if (!cmd) return;

    const newHistory = [...terminalHistory];
    newHistory.push({ type: 'user', text: `┌──(guest㉿SecretArea1337)-[~]\n└─$ ${cmd}` });

    const lowerCmd = cmd.toLowerCase();

    if (
      lowerCmd === 'wolfspace' ||
      cmd === 'Wolfspace' ||
      lowerCmd === 'login' ||
      lowerCmd === 'auth' ||
      lowerCmd === 'login wolfspace' ||
      lowerCmd === 'login guest' ||
      lowerCmd === 'guest' ||
      lowerCmd === 'code' ||
      lowerCmd === 'passcode' ||
      lowerCmd === 'password'
    ) {
      newHistory.push({ 
        type: 'error', 
        text: '⚠️ Terminal CLI login is disabled.\nPlease use the Visitor Login buttons below (Login with Google, Discord, GitHub, or Continue as Guest) to enter.' 
      });
    } else if (lowerCmd === 'help') {
      newHistory.push({ type: 'system', text: '┌──────────────────────────────────┐' });
      newHistory.push({ type: 'system', text: '│ AVAILABLE PROTOCOLS              │' });
      newHistory.push({ type: 'system', text: '└──────────────────────────────────┘' });
      newHistory.push({ type: 'info', text: '  [1] INQUIRE : What is inside?' });
      newHistory.push({ type: 'info', text: '  [2] COMMS   : Contact Support' });
      newHistory.push({ type: 'info', text: '  [3] NETWORK : Community & Socials' });
      newHistory.push({ type: 'info', text: '  clear       : Flush memory' });
      newHistory.push({ type: 'system', text: ' ' });
      newHistory.push({ type: 'success', text: '  💡 TIP: Login with Google, Discord, GitHub, or Guest mode using the buttons below.' });
    } else if (lowerCmd === '1' || lowerCmd === 'inquire') {
      newHistory.push({ type: 'system', text: '>>> AREA SUMMARY EXECUTED <<<' });
      newHistory.push({ type: 'info', text: '  ██╗    ██╗ ██████╗ ██╗     ███████╗   ██╗██████╗ ██████╗ ███████╗' });
      newHistory.push({ type: 'info', text: '  ██║    ██║██╔═══██╗██║     ██╔════╝  ███║╚════██╗╚════██╗╚════██║' });
      newHistory.push({ type: 'info', text: '  ██║ █╗ ██║██║   ██║██║     █████╗    ╚██║ █████╔╝ █████╔╝    ██╔╝' });
      newHistory.push({ type: 'info', text: '  ██║███╗██║██║   ██║██║     ██╔══╝     ██║ ╚═══██╗ ╚═══██╗   ██╔╝ ' });
      newHistory.push({ type: 'info', text: '  ╚███╔███╔╝╚██████╔╝███████╗██║        ██║██████╔╝██████╔╝   ██║  ' });
      newHistory.push({ type: 'info', text: '   ╚══╝╚══╝  ╚═════╝ ╚══════╝╚═╝        ╚═╝╚═════╝ ╚═════╝    ╚═╝  ' });
      newHistory.push({ type: 'system', text: '────────────────────────────────────────────────────────────────────────────' });
      newHistory.push({ type: 'info', text: '[-] 🎮 Hypervisors Games from FitGirl with easy UI to understand' });
      newHistory.push({ type: 'info', text: '[-] 💿 Repacks Games from FitGirl with easy UI to understand' });
      newHistory.push({ type: 'info', text: '[-] 🚂 Steam games With SteamTools One Click Get File without ADS' });
      newHistory.push({ type: 'info', text: '[-] 🔓 Crack Apps From Popular Company' });
      newHistory.push({ type: 'info', text: '[-] 💾 100% save games Files' });
      newHistory.push({ type: 'info', text: '[-] 👤 Free Offline Steam Account' });
      newHistory.push({ type: 'info', text: '[-] 🎁 Free Gifts like Netflix Accounts and more.' });
      newHistory.push({ type: 'success', text: '[+] All this and more without adult pop-up ads and with an easy-to-use user interface.' });
      newHistory.push({ type: 'system', text: '────────────────────────────────────────────────────────────────────────────' });
      newHistory.push({ type: 'info', text: '💡 Ready to browse? Select a login option below to continue.' });
    } else if (lowerCmd === '2' || lowerCmd === 'comms') {
      newHistory.push({ type: 'system', text: 'ESTABLISHING SECURE COMMS...' });
      newHistory.push({ 
        type: 'info', 
        text: (
          <div className="flex flex-col space-y-2 mt-1 ms-2">
            <div>[-] <a href="https://wa.me/212723242286" target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">WhatsApp</a></div>
            <div>[-] <a href="https://www.instagram.com/nexa1337" target="_blank" rel="noreferrer" className="text-pink-400 hover:text-pink-300 underline underline-offset-2">Instagram</a></div>
            <div>[-] <a href="mailto:support@nexa1337.com" className="text-purple-400 hover:text-purple-300 underline underline-offset-2">Email (support@nexa1337.com)</a></div>
            <div>[-] <a href="mailto:nexa1337agency@gmail.com" className="text-red-400 hover:text-red-300 underline underline-offset-2">Gmail (nexa1337agency@gmail.com)</a></div>
            <div>[-] <a href="https://linktr.ee/nexa1337" target="_blank" rel="noreferrer" className="text-green-400 hover:text-green-300 underline underline-offset-2">N E X A 1337</a></div>
          </div>
        ) 
      });
    } else if (lowerCmd === '3' || lowerCmd === '4' || lowerCmd === 'network') {
      newHistory.push({ 
        type: 'info', 
        text: (
          <div className="flex flex-col space-y-3 mt-2 ms-2 font-mono">
            <div className="text-[#a6e3a1] font-bold">{"\u003e\u003e\u003e SECURE NETWORKS DETECTED \u003c\u003c\u003c"}</div>
            <div className="flex items-center space-x-2.5">
              <img 
                src="https://cdn.pixabay.com/photo/2021/12/27/10/50/telegram-6896827_1280.png" 
                alt="Telegram" 
                referrerPolicy="no-referrer" 
                className="w-5 h-5 object-contain" 
               loading="lazy" />
              <a 
                href="https://t.me/secretarea1337" 
                target="_blank" 
                rel="noreferrer" 
                className="text-blue-400 hover:text-blue-300 underline underline-offset-2 font-bold"
              >
                Telegram Channel
              </a>
            </div>
            <div className="flex items-center space-x-2.5">
              <img 
                src="https://pngimg.com/uploads/discord/discord_PNG8.png" 
                alt="Discord" 
                referrerPolicy="no-referrer" 
                className="w-5 h-5 object-contain" 
               loading="lazy" />
              <a 
                href="https://discord.gg/pygmDWFAHK" 
                target="_blank" 
                rel="noreferrer" 
                className="text-blue-400 hover:text-blue-300 underline underline-offset-2 font-bold"
              >
                Discord Server
              </a>
            </div>
            <div className="flex items-center space-x-2.5">
              <img 
                src="https://vectorseek.com/wp-content/uploads/2023/12/Reddit-New-2023-Icon-Logo-Vector.svg-.png" 
                alt="Reddit" 
                referrerPolicy="no-referrer" 
                className="w-5 h-5 object-contain" 
               loading="lazy" />
              <a 
                href="https://www.reddit.com/r/SecretArea1337/" 
                target="_blank" 
                rel="noreferrer" 
                className="text-blue-400 hover:text-blue-300 underline underline-offset-2 font-bold"
              >
                Reddit Community
              </a>
            </div>
          </div>
        ) 
      });
    } else if (lowerCmd === 'clear') {
      setTerminalHistory([]);
      setTerminalCleared(true);
      setTerminalInput('');
      return;
    } else {
      newHistory.push({ type: 'error', text: `Command not found: ${cmd}. Type "help" for options.` });
    }

    setTerminalHistory(newHistory);
    setTerminalInput('');
    
    if (cmd) {
      setCommandHistory(prev => [...prev, cmd]);
    }
    setHistoryIndex(-1);
  };
  
  const handleTerminalKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.ctrlKey && e.key === 'c') {
      e.preventDefault();
      const newHistory = [...terminalHistory];
      newHistory.push({ type: 'user', text: `┌──(guest㉿SecretArea1337)-[~]\n└─$ ${terminalInput}^C` });
      setTerminalHistory(newHistory);
      setTerminalInput('');
      setHistoryIndex(-1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const nextIndex = historyIndex + 1;
        if (nextIndex < commandHistory.length) {
          setHistoryIndex(nextIndex);
          setTerminalInput(commandHistory[commandHistory.length - 1 - nextIndex]);
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex >= 0) {
        const nextIndex = historyIndex - 1;
        if (nextIndex >= 0) {
          setHistoryIndex(nextIndex);
          setTerminalInput(commandHistory[commandHistory.length - 1 - nextIndex]);
        } else {
          setHistoryIndex(-1);
          setTerminalInput('');
        }
      }
    }
  };

  // Global System Filter - initialized directly from stored hardware specs
  const [globalSpecs, setGlobalSpecs] = useState(() => getStoredHardwareSpecs());
  const [hideFailedGames] = useState(false);

  // Synchronize hardware specs in real time across Settings, Details Modal, and catalog cards
  useEffect(() => {
    const handleSync = (e: any) => {
      if (e.detail) {
        setGlobalSpecs(e.detail);
      }
    };
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'secretarea_hardware_specs' && e.newValue) {
        try {
          setGlobalSpecs(JSON.parse(e.newValue));
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
    if (currentUser) {
        const local = getLocalProfile(currentUser.uid);
        if (local?.pcSpecs) {
            setGlobalSpecs(prev => {
                const merged = { ...prev, ...local.pcSpecs };
                saveUserHardwareSpecs(currentUser.uid, merged);
                return merged;
            });
        }
        import('../src/firebase').then(({ db }) => {
            import('firebase/firestore').then(({ doc, getDoc }) => {
                const docRef = doc(db, 'users', currentUser.uid);
                getDoc(docRef).then(snap => {
                    if (snap.exists() && snap.data().pcSpecs) {
                        const specs = snap.data().pcSpecs;
                        setGlobalSpecs(prev => {
                            const merged = { ...prev, ...specs };
                            saveUserHardwareSpecs(currentUser.uid, merged);
                            return merged;
                        });
                    }
                }).catch((err) => {
                    if (err?.code !== 'permission-denied' && !err?.message?.includes('permissions')) {
                        console.warn("PC specs sync note (handled):", err?.message);
                    }
                });
            }).catch(() => {});
        }).catch(() => {});
    }
  }, [currentUser]);

  
  // Steam Accounts Feature
  const [steamAccounts, setSteamAccounts] = useState<SteamAccount[]>([]);
  
  // Master Gift Feature
  const [masterGifts, setMasterGifts] = useState<MasterGiftAccount[]>([]);
  const [showMasterGiftModal, setShowMasterGiftModal] = useState(false);
  const [showDonateModal, setShowDonateModal] = useState(false);

  const intelItems = useMemo(() => {
    const items: IntelItem[] = [];
    let idCounter = 1;

    const addItems = (sourceItems: any[], intelCategory: IntelCategory) => {
      // Sort source items by real date if available
      const sorted = [...sourceItems].sort((a, b) => {
          const dA = new Date(a.dateAdded || 0).getTime();
          const dB = new Date(b.dateAdded || 0).getTime();
          if (!isNaN(dA) && !isNaN(dB)) return dB - dA;
          if (!isNaN(dA)) return -1;
          if (!isNaN(dB)) return 1;
          return 0;
      });
      
      const recent = sorted.slice(0, 4);
      recent.forEach((item) => {
        const v = String(item.version || '').toLowerCase();
        const title = String(item.name || item.title || '').toLowerCase();
        
        // Smart determination of NEW vs UPDATE
        const isUpdate = (v && v !== '1.0' && v !== '1.0.0' && v !== 'v1.0' && v !== 'v1.0.0' && v !== 'release' && v !== 'n/a' && v !== 'tba') || title.includes('update') || title.includes('hotfix') || title.includes('patch');
        const type = isUpdate ? 'UPDATE' : 'NEW';
        const descPrefix = isUpdate ? 'Updated to' : 'New addition:';
        
        items.push({
          id: `intel-${idCounter++}`,
          title: item.name || item.title || 'Unknown',
          description: `${descPrefix} ${item.version ? `(v${item.version})` : item.name || item.title}`,
          timestamp: item.dateAdded || '', // Use exact real date, formatTimeAgo handles empty
          category: intelCategory,
          type: type,
          version: item.version
        });
      });
    };

    addItems(allResources['game'] || [], 'GAME');
    addItems(allResources['hypervisor'] || [], 'HYPERVISOR');
    addItems(allResources['steamtools'] || [], 'STEAMTOOLS');
    addItems(allResources['architect'] || [], 'ARCHITECT');
    addItems(allResources['extra'] || [], 'EXTRA');

    // Sort globally by timestamp descending
    return items.sort((a, b) => {
        const dA = new Date(a.timestamp || 0).getTime();
        const dB = new Date(b.timestamp || 0).getTime();
        if (!isNaN(dA) && !isNaN(dB)) return dB - dA;
        if (!isNaN(dA)) return -1;
        if (!isNaN(dB)) return 1;
        return 0;
    });
  }, [allResources]);

  const recentProducts = useMemo(() => {
    let all: { item: ResourceItem, rowIndex: number, dateScore: number }[] = [];
    
    // The items in allResources are already reversed (newest from bottom of sheet are at index 0).
    ["game", "hypervisor", "steamtools", "architect", "extra"].forEach(cat => {
        const items = allResources[cat] || [];
        items.forEach((item, index) => {
             let d = 0;
             if (item.dateAdded) {
                 if (!isNaN(Number(item.dateAdded))) d = Number(item.dateAdded);
                 else d = new Date(item.dateAdded).getTime();
             }
             
             all.push({ item, rowIndex: index, dateScore: isNaN(d) ? 0 : d });
        });
    });

    return all.sort((a, b) => {
        // If both have a valid dateAdded, sort by date directly
        if (a.dateScore > 0 && b.dateScore > 0 && a.dateScore !== b.dateScore) {
            return b.dateScore - a.dateScore;
        }
        // Fallback: sort by their position in the sheet (rowIndex 0 is newest)
        // Since we want the newest items first, lower rowIndex should come first.
        return a.rowIndex - b.rowIndex;
    }).map(s => s.item).slice(0, 20);
  }, [allResources]);

  const [showSteamModal, setShowSteamModal] = useState(false);
  const [rewardLoginModalTarget, setRewardLoginModalTarget] = useState<'steam' | 'mastergift' | null>(null);
  const isGmailUser = Boolean(
    currentUser &&
    !isGuestMode &&
    localStorage.getItem('nexa_guest_mode') !== 'true' &&
    localStorage.getItem('secret_area_unlocked') !== 'guest' &&
    (currentUser.email || currentUser.providerData?.some((p: any) => p?.providerId === 'google.com'))
  );

  // Math Game State
  const [showMathGame, setShowMathGame] = useState(false);
  const [mathProblem, setMathProblem] = useState({ q: '', a: 0, note: '' });
  const [mathInput, setMathInput] = useState('');
  const [mathStatus, setMathStatus] = useState<'playing' | 'won' | 'lost' | 'locked'>('playing');
  const [mathLockoutTime, setMathLockoutTime] = useState<number | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState(2);

  useEffect(() => {
    const accepted = localStorage.getItem('nexa_disclaimer_accepted');
    if (!accepted) {
        setShowDisclaimer(true);
    }
  }, []);

  // --- INITIALIZE LOCKOUT STATE ---
  useEffect(() => {
    const lockout = localStorage.getItem('nexa_math_lockout');
    if (lockout) {
        const time = parseInt(lockout);
        if (time > Date.now()) {
            setMathLockoutTime(time);
            setMathStatus('locked');
        } else {
            localStorage.removeItem('nexa_math_lockout');
        }
    }
  }, []);

  useEffect(() => {
    if (showHackerLoader) {
      setHackerProgress(0);
      setTerminalLines([]);
      
      const lines = [
        "INIT: SECURE_PROTOCOL_V4",
        "CONNECTING TO MAINFRAME...",
        "BYPASSING FIREWALL...",
        "ACCESS GRANTED.",
        "DECRYPTING AREA CONTENTS...",
        "FETCHING CLOUD DATA...",
        "SYNCING ASSETS...",
        "FINALIZING..."
      ];
      let lineIndex = 0;

      const interval = setInterval(() => {
        setHackerProgress(prev => {
          let nextProgress = prev;
          
          if (loadingRef.current) {
            nextProgress = Math.min(30, prev + Math.floor(Math.random() * 5) + 2);
          } else if (imagesLoadingRef.current) {
            const mappedProgress = 30 + Math.floor(imageProgressRef.current * 0.69);
            nextProgress = Math.max(prev, mappedProgress);
          } else if (!loadingRef.current && !imagesLoadingRef.current) {
            nextProgress = Math.min(100, prev + 15);
          }

          if (nextProgress > lineIndex * 12 && lineIndex < lines.length) {
            const currentLine = lines[lineIndex];
            setTerminalLines(current => [...current, `> ${currentLine}`]);
            lineIndex++;
          }
          
          if (nextProgress === 100 && lineIndex === lines.length) {
            setTerminalLines(current => [...current, "> SYNC COMPLETE. WELCOME."]);
            lineIndex++;
          }
          
          if (prev >= 100 && lineIndex > lines.length) {
            clearInterval(interval);
            setTimeout(() => setShowHackerLoader(false), 1000);
            return 100;
          }

          return nextProgress;
        });
      }, 150);
      return () => clearInterval(interval);
    }
  }, [showHackerLoader]);

  const handleCloseDisclaimer = () => {
    setShowDisclaimer(false);
    localStorage.setItem('nexa_disclaimer_accepted', 'true');
  };

  useEffect(() => {
    if (isUnlocked && !showHackerLoader) {
        const hasSeenWolfGreeting = localStorage.getItem('nexa_wolf_greeting_seen');
        if (hasSeenWolfGreeting) return;
        localStorage.setItem('nexa_wolf_greeting_seen', 'true');

        const t1 = setTimeout(() => {
            const id = Date.now();
            setNotifications(prev => [...prev, {
                id,
                title: '🐺 Alpha Protocol Initiated',
                text: 'Welcome to the inner circle.\nOnly the most perceptive navigate this far.\nYour instinct has led you to the pack. 🖤',
                time: 'Just now'
            }]);
            setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 8000);
        }, 5000);

        const t2 = setTimeout(() => {
            const id = Date.now() + 1;
            setNotifications(prev => [...prev, {
                id,
                title: '🐺 تفعيل بروتوكول النخبة',
                text: 'مرحباً بك في الدائرة الداخلية.\nغريزتك قادتك إلى هذا العمق حيث ينتمي الأقوى.\nهنا، لا مكان سوى للذئاب الحقيقية. 🖤',
                time: 'الآن',
                isAr: true
            }]);
            setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 8000);
        }, 14000); 

        return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [isUnlocked, showHackerLoader]);

  // Math Game Functions
  const startMathGame = () => {
    // Check for lockout first
    const lockout = localStorage.getItem('nexa_math_lockout');
    if (lockout) {
        const time = parseInt(lockout);
        if (time > Date.now()) {
            setMathLockoutTime(time);
            setMathStatus('locked');
            setShowMathGame(true);
            return;
        } else {
            localStorage.removeItem('nexa_math_lockout');
        }
    }

    // Reset attempts if starting fresh without lockout
    setAttemptsLeft(2);

    // Advanced math patterns to challenge the user
    const mode = Math.floor(Math.random() * 5); // 5 complex modes
    let q = '';
    let a = 0;
    let note = ''; // Context like "α = 5"

    switch (mode) {
        case 0: // Greek Variables Algebra
            const alpha = Math.floor(Math.random() * 10) + 2; // 2-11
            const omega = Math.floor(Math.random() * 50) + 10;
            note = `Let α = ${alpha}, Ω = ${omega}`;
            // Problem: (Ω - α) * α
            q = `(Ω - α) × α`;
            a = (omega - alpha) * alpha;
            break;
        case 1: // Summation Sequence
            const limit = Math.floor(Math.random() * 3) + 3; // 3 to 5
            const add = Math.floor(Math.random() * 10);
            // Sum k=1 to limit of k
            // sum(3) = 6, sum(4) = 10, sum(5) = 15
            const sum = (limit * (limit + 1)) / 2;
            q = `∑(k=1 to ${limit}) k + ${add}`;
            a = sum + add;
            note = 'Calculate the summation sequence';
            break;
        case 2: // Squares and Roots
            const roots = [4, 9, 16, 25, 36, 49, 64, 81, 100];
            const sqVal = roots[Math.floor(Math.random() * roots.length)];
            const rootVal = Math.sqrt(sqVal);
            const factor = Math.floor(Math.random() * 5) + 2;
            // q: √sqVal * factor^2
            q = `√${sqVal} × ${factor}²`;
            a = rootVal * (factor * factor);
            break;
        case 3: // Fractions and Cube Roots
            const cubes = [8, 27, 64]; // roots: 2, 3, 4
            const cbVal = cubes[Math.floor(Math.random() * cubes.length)];
            const cbRoot = Math.cbrt(cbVal); // 2,3,4
            // q: 1/2 of (∛cbVal * 100)
            q = `½ (∛${cbVal} × 100)`;
            a = 0.5 * (cbRoot * 100);
            break;
        case 4: // Delta Logic
            const delta = Math.floor(Math.random() * 5) + 3; // 3-7
            note = `Given Δ = ${delta}`;
            // q: (Δ³ ÷ Δ) + 10  -> simplifies to Δ^2 + 10
            q = `(Δ³ ÷ Δ) + 10`;
            a = (Math.pow(delta, 3) / delta) + 10;
            break;
    }
    
    setMathProblem({ q, a, note });
    setMathStatus('playing');
    setMathInput('');
    setShowMathGame(true);
  };

  const verifyMath = (e: React.FormEvent) => {
    e.preventDefault();
    if (Math.abs(parseFloat(mathInput) - mathProblem.a) < 0.1) {
        setMathStatus('won');
        // Clear any previous attempts/lockout if won
        localStorage.removeItem('nexa_math_lockout');
    } else {
        const newAttempts = attemptsLeft - 1;
        setAttemptsLeft(newAttempts);
        
        if (newAttempts <= 0) {
            // LOCKOUT LOGIC
            const lockTime = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
            localStorage.setItem('nexa_math_lockout', lockTime.toString());
            setMathLockoutTime(lockTime);
            setMathStatus('locked');
        } else {
            // WRONG ANSWER FEEDBACK
            setMathStatus('lost');
            setTimeout(() => {
                setMathStatus('playing');
            }, 1000);
        }
    }
  };

  const copyAndCloseMath = () => {
    setShowMathGame(false); // Close game
  };

  const filteredUpcoming = useMemo(() => {
    return upcomingGames.filter(g => {
        const p = g.platform ? g.platform.toLowerCase() : '';
        if (upcomingPlatform === 'PlayStation 5') return p.includes('ps5') || p.includes('playstation');
        if (upcomingPlatform === 'Xbox S/X') return p.includes('xbox') || p.includes('series');
        if (upcomingPlatform === 'Steam') return p.includes('steam') || p.includes('pc');
        return false;
    }).reverse();
  }, [upcomingPlatform, upcomingGames]);

  useEffect(() => {
    const initial = Math.floor(Math.random() * (150000 - 30000 + 1)) + 30000;
    setVisitorCount(initial);
    const interval = setInterval(() => {
      setVisitorCount(prev => prev + Math.floor(Math.random() * 21) - 10);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const processRawData = (data: any) => {
    const maintenanceKey = Object.keys(data).find(k => k.toLowerCase() === 'maintenance');
    if (maintenanceKey && Array.isArray(data[maintenanceKey]) && data[maintenanceKey].length > 0) {
        const config = data[maintenanceKey][0];
        const isActiveStr = String(config.active || '').toLowerCase().trim();
        if (isActiveStr === 'true' || isActiveStr === 'yes' || isActiveStr === '1' || config.active === true) {
            setMaintenanceConfig({
                active: true,
                endTime: config.time || config.endTime || config.date || null,
                message: config.message || "Our website is under temporary maintenance, we will be back soon :)"
            });
            // Don't return early so we still process the rest of the data just in case, but the UI will render maintenance mode
        } else {
            setMaintenanceConfig(null);
        }
    } else {
        setMaintenanceConfig(null);
    }

    const upcomingKey = Object.keys(data).find(k => k.toLowerCase() === 'upcoming');
    if (!upcomingKey) {
        setIsUpcomingMissing(true);
        setUpcomingGames([]);
    } else if (Array.isArray(data[upcomingKey])) {
       const mappedUpcoming: UpcomingGame[] = data[upcomingKey].map((item: any, index: number) => ({
           id: `ug-${index}`,
           title: item.name || item.title || 'Untitled',
           image: item.image || item.coverImage || 'https://placehold.co/600x800/0f172a/334155?text=ENCRYPTED',
           platform: item.platform || 'TBA',
           price: item.price || 'TBA',
           icon: getPlatformIcon(item.platform || ''),
           dateAdded: item.date || item.timestamp || item.dateAdded || item.updated || ''
       }));
       setUpcomingGames(mappedUpcoming);
    } else {
       setUpcomingGames([]);
    }

    // Handle Upcoming Lists
    const upcomingListKey = Object.keys(data).find(k => k.toLowerCase() === 'upcominglist');
    if (upcomingListKey && Array.isArray(data[upcomingListKey])) {
        const newLists: { [key: string]: string[] } = {
            game: [],
            hypervisor: [],
            steamtools: [],
            tools: [],
            savegames: []
        };
        data[upcomingListKey].forEach((row: any) => {
            const rowKeys = Object.keys(row);
            Object.keys(newLists).forEach(category => {
                const matchingKey = rowKeys.find(k => k.toLowerCase().replace(/\s+/g, '') === category);
                if (matchingKey) {
                    const val = row[matchingKey];
                    if (val && typeof val === 'string' && val.trim() !== '') {
                        newLists[category].unshift(val.trim());
                    }
                }
            });
        });
        setUpcomingLists(newLists);
    } else {
        setUpcomingLists({
            game: [],
            hypervisor: [],
            steamtools: [],
            tools: [],
            savegames: []
        });
    }

    // Handle Steam Accounts with robust header normalization
    const steamKey = Object.keys(data).find(k => k.toLowerCase() === 'steamaccounts');
    if (steamKey && Array.isArray(data[steamKey])) {
        setSteamAccounts(data[steamKey].map((raw: any) => {
            const findByPrefix = (prefix: string) => {
                const key = Object.keys(raw).find(k => k.toLowerCase().trim().startsWith(prefix.toLowerCase()));
                return key ? raw[key] : undefined;
            };

            return {
                username: findByPrefix('username') || '',
                password: findByPrefix('password') || '',
                games: findByPrefix('games') || '',
                status: findByPrefix('status') || 'Online'
            };
        }));
    } else {
        setSteamAccounts([]);
    }

    // Handle Master Gift Accounts
    const masterGiftKey = Object.keys(data).find(k => k.toLowerCase().replace(/\s+/g, '') === 'mastergift');
    if (masterGiftKey && Array.isArray(data[masterGiftKey])) {
        setMasterGifts(data[masterGiftKey].map((raw: any) => {
            const findByPrefix = (prefix: string) => {
                const key = Object.keys(raw).find(k => k.toLowerCase().trim().startsWith(prefix.toLowerCase()));
                return key ? raw[key] : undefined;
            };
            return {
                name: findByPrefix('name') || 'Unknown',
                url: findByPrefix('url') || findByPrefix('link') || '',
                logo: findByPrefix('logo') || findByPrefix('image') || '',
                email: findByPrefix('email') || findByPrefix('user') || '',
                password: findByPrefix('password') || findByPrefix('pass') || '',
                status: findByPrefix('status') || 'Online'
            };
        }));
    } else {
        setMasterGifts([]);
    }

    // Handle Company Profiles
    const profilKey = Object.keys(data).find(k => {
        const lowerK = k.toLowerCase().trim();
        return lowerK === 'profil' || lowerK === 'profile' || lowerK === 'profiles' || lowerK === 'company';
    });
    if (profilKey && Array.isArray(data[profilKey])) {
        const profiles: CompanyProfile[] = data[profilKey].map((row: any, idx: number) => {
           const getVal = (key: string) => {
              const normalizedSearchKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
              const foundKey = Object.keys(row).find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedSearchKey);
              return foundKey ? row[foundKey] : '';
           };
           return {
               id: row.id || `profile-${idx}`,
               name: getVal('name') || getVal('company') || getVal('studio') || getVal('developer') || 'Unknown Company',
               logoUrl: getVal('logourl') || getVal('logo') || getVal('image') || getVal('icon') || '',
               description: getVal('description') || getVal('info') || '',
               gameIds: (getVal('gamesid') || getVal('gameids') || getVal('gameid') || '').toString().split(',').map(s => s.trim()).filter(Boolean),
               hypervisorIds: (getVal('hypervisionid') || getVal('hypervisorid') || getVal('hypervisorids') || '').toString().split(',').map(s => s.trim()).filter(Boolean),
               steamtoolsIds: (getVal('steamtoolsid') || getVal('steamtoolsids') || '').toString().split(',').map(s => s.trim()).filter(Boolean),
               architectIds: (getVal('toolsid') || getVal('architectids') || getVal('architectid') || '').toString().split(',').map(s => s.trim()).filter(Boolean)
           };
        });
        setCompanyProfiles(profiles);
    } else {
        setCompanyProfiles([]);
    }

    // Handle Popular Repacks
    const popularKey = Object.keys(data).find(k => k.toLowerCase().replace(/\s+/g, '').includes('popularrepack') || k.toLowerCase().replace(/\s+/g, '') === 'mostpopular');
    if (popularKey && Array.isArray(data[popularKey])) {
        const ids: string[] = [];
        data[popularKey].forEach((row: any) => {
           Object.values(row).forEach((val: any) => {
              if (val && typeof val === 'string' && val.trim() !== '') {
                  val.split(',').forEach((v: string) => ids.push(v.trim()));
              } else if (val && typeof val === 'number') {
                  ids.push(String(val));
              }
           });
        });
        setPopularRepackIds(Array.from(new Set(ids)).reverse());
    } else {
        setPopularRepackIds([]);
    }

    // Handle Top Games
    const topGamesKey = Object.keys(data).find(k => k.toLowerCase().replace(/\s+/g, '') === 'topgames');
    if (topGamesKey && Array.isArray(data[topGamesKey])) {
        const topGamesList: TopGame[] = data[topGamesKey].map((row: any, idx: number) => {
           const getVal = (keyStr: string) => {
              const normalizedSearchKey = keyStr.toLowerCase().replace(/[^a-z0-9]/g, '');
              const foundKey = Object.keys(row).find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedSearchKey);
              return foundKey ? row[foundKey] : '';
           };
           return {
               id: row.id || `topgame-${idx}`,
               rank: Number(getVal('rank') || idx + 1),
               name: getVal('name') || getVal('gamename') || getVal('title') || 'Unknown Game',
               bannerUrl: getVal('bannerurl') || getVal('banner') || getVal('image') || '',
               logoUrl: getVal('logourl') || getVal('logo') || '',
               symbolUrl: getVal('symbolurl') || getVal('symbol') || getVal('icon') || ''
           };
        }).sort((a: TopGame, b: TopGame) => a.rank - b.rank);
        setTopGames(topGamesList);
    } else {
        setTopGames([]);
    }

    // Handle Best Game Series
    const bestGameSeriesKey = Object.keys(data).find(k => k.toLowerCase().replace(/\s+/g, '') === 'bestgameseries');
    if (bestGameSeriesKey && Array.isArray(data[bestGameSeriesKey])) {
        const seriesList: BestGameSeries[] = data[bestGameSeriesKey].map((row: any, idx: number) => {
           const getVal = (keyStr: string) => {
              const normalizedSearchKey = keyStr.toLowerCase().replace(/[^a-z0-9]/g, '');
              const foundKey = Object.keys(row).find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedSearchKey);
              return foundKey ? row[foundKey] : '';
           };
           
           const gamesRaw = (getVal('games') || getVal('gamelist') || '').toString().split(/[,\n\|]/).map((s: string) => s.trim()).filter(Boolean);
           const bestGamesRaw = (getVal('bestgame') || getVal('bestgames') || getVal('best') || '').toString().split(/[,\n\|]/).map((s: string) => s.trim().toLowerCase()).filter(Boolean);
           
           const parsedGames = gamesRaw.map((g: string) => {
               const lowerG = g.toLowerCase();
               const isExplicitlyBest = lowerG.endsWith('(best)') || lowerG.endsWith('[best]');
               const cleanName = isExplicitlyBest ? g.substring(0, g.length - 6).trim() : g;
               
               return {
                   name: cleanName,
                   isBest: isExplicitlyBest || bestGamesRaw.includes(cleanName.toLowerCase()) || bestGamesRaw.includes(g.toLowerCase())
               };
           });

           return {
               id: row.id || `series-${idx}`,
               category: getVal('categories') || getVal('category') || '',
               images: (getVal('images') || getVal('image') || '').toString().split(/[,\n\|]/).map((s: string) => s.trim()).filter(Boolean),
               title: getVal('title') || getVal('name') || '',
               background: getVal('background') || getVal('bg') || getVal('bgurl') || '',
               games: parsedGames
           };
        });
        setBestGameSeries(seriesList);
    } else {
        setBestGameSeries([]);
    }

    // Handle Upcoming Trailers from Google Sheet
    const upcomingTrailersKey = Object.keys(data).find(k => {
      const norm = k.toLowerCase().replace(/[^a-z0-9]/g, '');
      return norm === 'upcomingtrailers' || norm === 'trailers' || norm === 'upcominggametrailers' || norm === 'gametrailers' || norm === 'upcomingtrailerslist';
    });
    if (upcomingTrailersKey && Array.isArray(data[upcomingTrailersKey])) {
      setSheetUpcomingTrailers(data[upcomingTrailersKey]);
    } else {
      setSheetUpcomingTrailers([]);
    }

    const transformed: Record<string, ResourceItem[]> = { game: [], hypervisor: [], steamtools: [], architect: [], extra: [] };
    Object.keys(data).forEach(tabKey => {
      const normalizedKey = tabKey.toLowerCase();
      let targetKey = '';
      let idPrefix = '';
      
      if (normalizedKey.includes('hypervisor')) { targetKey = 'hypervisor'; idPrefix = 'H'; }
      else if (normalizedKey.includes('upcoming') || normalizedKey.includes('steamaccounts') || normalizedKey.includes('mastergift') || normalizedKey.includes('profil') || normalizedKey.includes('topgames') || normalizedKey.includes('popularrepack') || normalizedKey.includes('bestgameseries')) { return; }
      else if (normalizedKey.includes('game') && !normalizedKey.includes('savegame')) { targetKey = 'game'; idPrefix = 'G'; }
      else if (normalizedKey.includes('steamtools')) { targetKey = 'steamtools'; idPrefix = 'S'; }
      else if (normalizedKey.includes('architect')) { targetKey = 'architect'; idPrefix = 'A'; }
      else if (normalizedKey.includes('extra') || normalizedKey.includes('savegame')) { targetKey = 'extra'; idPrefix = 'E'; }

      if (targetKey && transformed.hasOwnProperty(targetKey)) {
        const newItems = data[tabKey].map((row: any, idx: number) => {
          const getVal = (key: string) => {
              const normalizedSearchKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
              const foundKey = Object.keys(row).find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedSearchKey);
              return foundKey ? row[foundKey] : '';
          };
          
          const reqsStr = getVal('requirements');
          const reqs = (reqsStr || '').toString().split('|').map((s: string) => {
            const parts = s.split(':');
            return { 
              label: parts[0]?.trim() || 'Info', 
              value: parts[1]?.trim() || 'N/A', 
              icon: parts[2]?.trim() || 'Box',
              link: parts[3]?.trim() || undefined
            };
          }).filter((r: any) => r.value && r.value !== 'N/A');

          const steps = (getVal('steps') || '').toString().split('|').map((s: string) => s.trim()).filter((s: string) => s);
          const gallery = (getVal('gallery') || '').toString().split('|').map((s: string) => s.trim()).filter((s: string) => s && s.startsWith('http'));
          const toolsParsed = (getVal('tools') || '').toString().split('|').map((s: string) => {
              const parts = s.split('^');
              return { name: parts[0]?.trim(), url: parts[1]?.trim() };
          }).filter((t: any) => t.name && t.url);

          const partsArr: { id: number, link: string, note?: string }[] = [];
          const mirrorsArr: { id: number, link: string, note?: string }[] = [];
          const ankerArr: { id: number, link: string, note?: string }[] = [];
          for (let i = 1; i <= 20; i++) {
              let pVal = getVal(`part${i}`);
              let pNote = getVal(`partNote${i}`) || getVal(`note${i}`);
              
              const extractNote = (val: string) => {
                  if (!val) return { link: '', note: '' };
                  val = val.trim();
                  if (val.includes('|')) {
                      const parts = val.split('|');
                      return { link: parts[0].trim(), note: parts[1].trim() };
                  }
                  
                  const singleQuoteMatch = val.match(/^(.*?)\s+'([^']+)'\s*$/);
                  if (singleQuoteMatch) {
                      return { link: singleQuoteMatch[1].trim(), note: singleQuoteMatch[2].trim() };
                  }
                  
                  const quoteMatch = val.match(/^(.*?)\s+"([^"]+)"\s*$/);
                  if (quoteMatch) {
                      return { link: quoteMatch[1].trim(), note: quoteMatch[2].trim() };
                  }

                  const parenMatch = val.match(/^(.*?)\s+\(([^)]+)\)\s*$/);
                  if (parenMatch) {
                      return { link: parenMatch[1].trim(), note: parenMatch[2].trim() };
                  }

                  const spaceMatch = val.match(/^(https?:\/\/[^\s]+)\s+(.+)$/);
                  if (spaceMatch) {
                      return { link: spaceMatch[1].trim(), note: spaceMatch[2].trim() };
                  }

                  return { link: val.trim(), note: '' };
              };

              if (pVal) {
                  const extracted = extractNote(pVal);
                  pVal = extracted.link;
                  if (extracted.note) pNote = extracted.note;
              }

              let mVal = getVal(`mirror${i}`);
              let mNote = getVal(`mirrorNote${i}`);
              let aVal = getVal(`anker${i}`);
              let aNote = getVal(`ankerNote${i}`);

              if (mVal) {
                  const extracted = extractNote(mVal);
                  mVal = extracted.link;
                  if (extracted.note) mNote = extracted.note;
              }
              if (aVal) {
                  const extracted = extractNote(aVal);
                  aVal = extracted.link;
                  if (extracted.note) aNote = extracted.note;
              }

              if (pVal) partsArr.push({ id: i, link: pVal, note: pNote });
              if (mVal) mirrorsArr.push({ id: i, link: mVal, note: mNote });
              if (aVal) ankerArr.push({ id: i, link: aVal, note: aNote });
          }

          const isPinnedRaw = getVal('pinned');
          const isFreeRaw = getVal('price') || getVal('isfree') || getVal('free');

          return {
            id: `${idPrefix}${row.id || (idx + 1)}`,
            category: targetKey,
            name: getVal('name') || 'Secure Fragment',
            version: getVal('version') || 'v1.0',
            repackSize: getVal('repackSize') || 'N/A',
            originalSize: getVal('originalSize') || 'N/A',
            genres: getVal('genres') || '',
            languages: getVal('languages') || 'ENG',
            repackBy: getVal('repackBy') || '',
            developer: getVal('developer') || getVal('studio') || getVal('company') || '',
            coverImage: getVal('coverImage') || 'https://placehold.co/600x800/0f172a/334155?text=ENCRYPTED',
            galleryImages: gallery,
            description: getVal('description') || 'No intel available.',
            gameId: getVal('gameId') || '',
            ratingPositive: getVal('ratingPositive') || '',
            ratingNegative: getVal('ratingNegative') || '',
            dateAdded: getVal('date') || getVal('timestamp') || getVal('dateAdded') || getVal('updated') || getVal('time') || getVal('created') || '',
            hasDenuvo: String(getVal('denuvo')).toLowerCase() === 'true',
            hasExternalLauncher: String(getVal('launcher')).toLowerCase() === 'true',
            systemReqs: reqs,
            installSteps: steps,
            isPinned: String(isPinnedRaw).toLowerCase() === 'true' || String(isPinnedRaw).toLowerCase() === 'yes' || String(isPinnedRaw).toLowerCase() === 'on',
            isFree: String(isFreeRaw).toLowerCase() === 'true' || String(isFreeRaw).toLowerCase() === 'yes' || String(isFreeRaw).toLowerCase() === 'free' || String(isFreeRaw) === '0',
            toolsNeeded: toolsParsed,
            links: { 
              parts: partsArr,
              mirrors: mirrorsArr,
              ankerParts: ankerArr,
              full: getVal('full'), 
              fullNote: getVal('fullNote') || getVal('note'),
                            tutorial: getVal('tutorial'), 
              dlc: getVal('dlc'), 
              trailer: getVal('trailer'),
              preInstalled: {
                  download: getVal('unlock 01'),
                  cloudDrop: getVal('unlock 02'),
                  torrent: getVal('unlock 03')
              },
              utorrent: (
                getVal('utorrent') ||
                getVal('torrent') ||
                getVal('magnet') ||
                getVal('utorrentlink') ||
                getVal('magnetlink') ||
                (row && (row['µTorrent'] || row['utorrent'] || row['magnet'] || row['Torrent'])) ||
                ''
              ).toString().trim() || undefined
            }
          };
        }).reverse();
        transformed[targetKey] = [...transformed[targetKey], ...newItems];
      }
    });
    
    setAllResources(transformed);
    try {
      localStorage.setItem('cached_transformed_resources', JSON.stringify(transformed));
    } catch (e) {
      console.warn("Writing transformed cache failed:", e);
    }
  };

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    if (!silent && showHackerLoader) {
        setImagesLoading(true);
        setImageProgress(0);
    }
    setError(null);
    setIsUpcomingMissing(false);
    setScriptError(false);
    let dataToPreload = null;

    try {
      const response = await fetch(API_ENDPOINT, {
          method: 'GET',
          cache: 'no-store',
          redirect: 'follow'
      });
      if (!response.ok) {
          throw new Error(`Server returned ${response.status} ${response.statusText}`);
      }
      let data;
      try {
          data = await response.json();
      } catch (parseError) {
          setScriptError(true);
          throw new Error("Google Script is down or returned invalid data. Please check code.gs deployment.");
      }
      
      processRawData(data);
      dataToPreload = data;
      // Cache the loaded data in localStorage
      try {
        localStorage.setItem('cached_secret_resources', JSON.stringify(data));
      } catch (cacheErr) {
        console.warn("Writing to cache failed:", cacheErr);
      }
    } catch (err: any) {
      const isAbortOrTeardown = err?.name === 'AbortError' || err?.message === 'Failed to fetch';
      if (!silent && !isAbortOrTeardown) {
        console.warn("Fetch failed, using local offline backup and cache data:", err);
      }
      let loadedData = null;
      try {
        const cached = localStorage.getItem('cached_secret_resources');
        if (cached) {
          loadedData = JSON.parse(cached);
          if (!silent) console.log("Successfully loaded resources from localStorage cache.");
        }
      } catch (e) {
        if (!silent) console.warn("LocalStorage cache read failed:", e);
      }

      if (!loadedData) {
        loadedData = backupData;
        if (!silent) console.log("Successfully fell back to local JSON backup.");
      }

      if (loadedData) {
        processRawData(loadedData);
        dataToPreload = loadedData;
        
        // Show subtle notification about offline mode only when active and not aborting
        if (!silent && !isAbortOrTeardown) {
          const notifId = Date.now();
          setNotifications(prev => [...prev, {
              id: notifId,
              title: 'Offline Backup Active',
              text: 'Connection to cloud database is unavailable. Displaying local offline database.',
              time: 'Just now'
          }]);
          setTimeout(() => {
              setNotifications(prev => prev.filter(n => n.id !== notifId));
          }, 6000);
        }
      } else {
        if (!silent) {
          setError("CRITICAL ERROR: Google Apps Script Connection Failed and no local backup could be found.");
          setMaintenanceConfig(null);
        }
      }
    } finally {
      setLoading(false);
      
      if (!silent && showHackerLoader && dataToPreload) {
          const urls = new Set<string>();
          if (Array.isArray(dataToPreload.companyProfiles)) {
              dataToPreload.companyProfiles.forEach((p: any) => p.logoUrl && urls.add(p.logoUrl));
          }
          if (Array.isArray(dataToPreload.topGames)) {
              dataToPreload.topGames.forEach((g: any) => {
                  if (g.bannerUrl) urls.add(g.bannerUrl);
                  if (g.logoUrl) urls.add(g.logoUrl);
                  if (g.symbolUrl) urls.add(g.symbolUrl);
              });
          }
          if (Array.isArray(dataToPreload.bestGameSeries)) {
              dataToPreload.bestGameSeries.forEach((g: any) => {
                  if (Array.isArray(g.images)) g.images.forEach((img: string) => urls.add(img));
              });
          }
          const upcomingKey = Object.keys(dataToPreload).find(k => k.toLowerCase() === 'upcoming');
          if (upcomingKey && Array.isArray(dataToPreload[upcomingKey])) {
              dataToPreload[upcomingKey].forEach((ug: any) => {
                  const img = ug.image || ug.coverImage;
                  if (img) urls.add(img);
              });
          }
          
          const uniqueUrls = Array.from(urls).filter(Boolean);
          if (uniqueUrls.length === 0) {
              setImagesLoading(false);
              setImageProgress(100);
          } else {
              let loaded = 0;
              const total = uniqueUrls.length;
              
              const loadPromises = Promise.all(uniqueUrls.map(url => {
                  return new Promise(resolve => {
                      const img = new Image();
                      img.onload = () => {
                          loaded++;
                          setImageProgress(Math.floor((loaded / total) * 100));
                          resolve(true);
                      };
                      img.onerror = () => {
                          loaded++;
                          setImageProgress(Math.floor((loaded / total) * 100));
                          resolve(false);
                      };
                      img.src = url;
                  });
              }));

              // Maximum 3 seconds for image preloading
              const timeoutPromise = new Promise(resolve => setTimeout(resolve, 3000));
              
              Promise.race([loadPromises, timeoutPromise]).then(() => {
                  setImagesLoading(false);
                  setImageProgress(100);
              });
          }
      } else {
          setImagesLoading(false);
          setImageProgress(100);
      }
    }
  };

  const getCompanyResources = (profile: CompanyProfile) => {
      const resources: ResourceItem[] = [];
      const isMatch = (item: ResourceItem, ids: string[]) => {
          const lowerIds = (ids || []).map(id => String(id).toLowerCase().trim()).filter(Boolean);
          const numericIds = (ids || []).map(id => String(id).replace(/^[A-Za-z]+[-]?/, '').toLowerCase().trim()).filter(Boolean);
          const itemIdsToMatch = [
              String(item.id || '').toLowerCase().trim(),
              String(item.id || '').replace(/^[A-Za-z]+[-]?/, '').toLowerCase().trim(),
              String(item.gameId || '').toLowerCase().trim()
          ].filter(Boolean);
          
          if (lowerIds.length > 0) {
              return lowerIds.some(id => 
                 itemIdsToMatch.includes(id) || 
                 itemIdsToMatch.some(itemId => itemId === id || itemId.endsWith(`-${id}`) || itemId.endsWith(id))
              ) || numericIds.some(id => itemIdsToMatch.includes(id));
          }
          
          // Fallback strict matching if no IDs were provided or for unmapped items
          const dev = String(item.developer || '').trim().toLowerCase();
          const rep = String(item.repackBy || '').trim().toLowerCase();
          const pname = String(profile.name || '').trim().toLowerCase();
          
          if (dev && pname && (dev === pname || dev.includes(pname) || pname.includes(dev))) return true;
          if (rep && pname && (rep === pname || rep.includes(pname) || pname.includes(rep))) return true;

          // Also check if item name begins with or contains company name for architect/extra items
          if (['architect', 'extra'].includes(item.category) && pname && pname.length >= 3) {
              const cleanItemName = String(item.name || '').toLowerCase().replace(/[^a-z0-9]/g, ' ');
              const cleanProfName = pname.replace(/[^a-z0-9]/g, ' ');
              const regex = new RegExp(`(^|\\s)${cleanProfName.replace(/\\s+/g, '\\s+')}(\\s|$)`, 'i');
              if (regex.test(cleanItemName) || cleanItemName.startsWith(cleanProfName)) return true;
          }
          
          return false;
      };
      
      if (allResources.game) resources.push(...allResources.game.filter(item => isMatch(item, profile.gameIds || [])));
      if (allResources.hypervisor) resources.push(...allResources.hypervisor.filter(item => isMatch(item, profile.hypervisorIds || [])));
      if (allResources.steamtools) resources.push(...allResources.steamtools.filter(item => isMatch(item, profile.steamtoolsIds || [])));
      if (allResources.architect) resources.push(...allResources.architect.filter(item => isMatch(item, profile.architectIds || [])));
      if (allResources.extra) resources.push(...allResources.extra.filter(item => isMatch(item, profile.extraIds || [])));

      return resources;
  };

  const handleCompanyClick = (companyName: string) => {
      const profile = companyProfiles.find(p => p.name.trim().toLowerCase() === companyName.trim().toLowerCase());
      if (profile) {
          setSelectedCompanyProfile(profile);
      } else {
          setSelectedCompanyProfile({
              id: 'temp-' + companyName,
              name: companyName,
              logoUrl: '',
              description: 'Company Profile not fully established in our database yet. Explore ecosystem tools below.'
          });
      }
  };

  const hasPrefetchedRef = useRef(false);
  useEffect(() => { 
      if (isUnlocked) {
          fetchData(); 
      } else if (!hasPrefetchedRef.current) {
          hasPrefetchedRef.current = true;
          fetchData(true);
      }
  }, [isUnlocked]);

  useEffect(() => {
    const handleOauthMessage = (e: MessageEvent) => {
      if (e.data?.type === 'DISCORD_AUTH_SUCCESS' && e.data?.user) {
        const discordUser = e.data.user;
        const avatarUrl = discordUser.avatar
          ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200';

        const profileObj = {
          displayName: discordUser.global_name || discordUser.username || 'Discord Wolf',
          email: discordUser.email || `${discordUser.username}@discord.com`,
          photoURL: avatarUrl,
          provider: 'discord',
          id: discordUser.id,
          uid: discordUser.id,
          joinedAt: new Date().toISOString()
        };

        localStorage.setItem('secret_area_unlocked', 'true');
        localStorage.removeItem('nexa_guest_mode');
        localStorage.setItem('nexa_user_profile', JSON.stringify(profileObj));
        localStorage.setItem('nexa_discord_user', JSON.stringify(discordUser));
        setIsUnlocked(true);
        setIsGuestMode(false);
        setShowHackerLoader(true);
        setHackerProgress(0);
        window.dispatchEvent(new Event('authChange'));
        fetchData();
      }
    };
    window.addEventListener('message', handleOauthMessage);
    return () => window.removeEventListener('message', handleOauthMessage);
  }, []);

  useEffect(() => { setCurrentPage(1); }, [activeTab, searchQuery]);

    useEffect(() => {
            const handleRandomGame = () => {
          let popularItems = [];
          if (popularRepackIds.length > 0) {
              const allItems = Object.values(allResources).flat();
              popularItems = allItems.filter(item => popularRepackIds.some(id => String(id).toLowerCase() === String(item.id).toLowerCase()));
          }
          if (popularItems.length === 0 && allResources['game'] && allResources['game'].length > 0) {
              popularItems = allResources['game'];
          }
          if (popularItems.length > 0) {
              const randomIndex = Math.floor(Math.random() * popularItems.length);
              const randomGame = popularItems[randomIndex];
              setOpenedViaRandom(true);
              setSelectedResource(randomGame);
          }
      };
      window.addEventListener('randomPopularGame', handleRandomGame);
      return () => window.removeEventListener('randomPopularGame', handleRandomGame);
  }, [popularRepackIds, allResources]);

  useEffect(() => {
      const hash = window.location.hash;
      const qIndex = hash.indexOf('?');
      if (qIndex !== -1) {
          const params = new URLSearchParams(hash.substring(qIndex));
          const itemId = params.get('item');
          if (itemId) {
              const allItems = Object.values(allResources).flat();
              if (allItems.length > 0) {
                  const foundItem = allItems.find(i => i.id === itemId);
                  if (foundItem) {
                      setSelectedResource(foundItem);
                      if (['game', 'hypervisor', 'steamtools', 'architect', 'extra'].includes(foundItem.category.toLowerCase())) {
                          setActiveTab(foundItem.category.toLowerCase() as any);
                      }
                      // Remove the query param to prevent reopening on reload
                      const newHash = hash.substring(0, qIndex);
                      window.history.replaceState({}, document.title, window.location.pathname + window.location.search + newHash);
                  }
              }
          }
      }
  }, [allResources, isUnlocked]);

  const filteredData = useMemo(() => {
    let currentTabData: ResourceItem[] = allResources[activeTab] || [];

    const query = searchQuery.toLowerCase();
    let filtered = currentTabData.filter(item => 
      item.name.toLowerCase().includes(query) || 
      item.id.toLowerCase().includes(query) ||
      (item.genres && item.genres.toLowerCase().includes(query)) ||
      (item.gameId && String(item.gameId).toLowerCase().includes(query))
    );

    if (globalSpecs.isActive && hideFailedGames) {
      const activeSpecsWithTiers = {
        ...globalSpecs,
        cpuTier: getCpuTier(globalSpecs.cpuModel),
        gpuTier: getGpuTier(globalSpecs.gpuModel)
      };
      filtered = filtered.filter(item => {
        const comp = checkCompatibilityStatus(activeSpecsWithTiers, item.systemReqs || []);
        return comp !== 'fail';
      });
    }

    return filtered.sort((a, b) => {
        if (a.isPinned === b.isPinned) return 0;
        return a.isPinned ? -1 : 1;
    });
  }, [allResources, activeTab, searchQuery, globalSpecs, hideFailedGames]);

  
  useEffect(() => {
    if (intelItems.length > 0) {
      try {
        localStorage.setItem('cached_intel_items', JSON.stringify(intelItems));
      } catch (e) {}
      window.dispatchEvent(new CustomEvent('intel-items-data', { detail: intelItems }));
      window.dispatchEvent(new CustomEvent('intel-updated', { detail: String(new Date(intelItems[0].timestamp || 0).getTime()) }));
    }
  }, [intelItems]);

const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setError('Please use the Visitor Login buttons (Google, Discord, GitHub, or Guest mode) to enter.');
  };

  const handleInstantDiscordLogin = async (customTag?: string) => {
    try {
      const tag = (customTag || instantDiscordName || 'DiscordGamer').trim();
      const cleanUsername = tag.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase() || 'gamer';
      const discordUser = {
        id: '1337' + Math.floor(100000 + Math.random() * 900000),
        username: cleanUsername,
        global_name: tag,
        email: `${cleanUsername}@discord.com`,
        avatar: null
      };

      const profileObj = {
        displayName: discordUser.global_name,
        username: discordUser.username,
        email: discordUser.email,
        photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
        provider: 'discord',
        loginMethod: 'discord',
        id: discordUser.id,
        uid: `discord_${discordUser.id}`,
        role: 'user',
        status: 'active',
        joinedAt: new Date().toISOString()
      };

      import('../src/services/userService').then(({ ensureUserProfile }) => {
        ensureUserProfile(profileObj).catch(() => {});
      });
      localStorage.setItem('secret_area_unlocked', 'true');
      localStorage.removeItem('nexa_guest_mode');
      localStorage.setItem('nexa_user_profile', JSON.stringify(profileObj));
      localStorage.setItem('nexa_discord_user', JSON.stringify(discordUser));
      setIsUnlocked(true);
      setIsGuestMode(false);
      setShowHackerLoader(true);
      setHackerProgress(0);
      window.dispatchEvent(new Event('authChange'));
      fetchData();
    } catch (e) {
      console.error('Instant discord login error:', e);
    }
  };

  const handleGithubLogin = async () => {
    setAuthDomainError(null);
    setDiscordSetupNotice(null);
    setGithubSetupNotice(null);
    try {
      const cred = await signInWithGithub();
      if (cred?.user) {
        import('../src/services/userService').then(({ ensureUserProfile }) => {
          ensureUserProfile(cred.user);
        });
      }
      localStorage.setItem('secret_area_unlocked', 'true');
      localStorage.removeItem('nexa_guest_mode');
      setIsUnlocked(true);
      setIsGuestMode(false);
      setShowHackerLoader(true);
      setHackerProgress(0);
      window.dispatchEvent(new Event('authChange'));
      fetchData();
    } catch (err: any) {
      const isUnauthorized = 
        err?.code === 'auth/unauthorized-domain' || 
        String(err?.message || '').includes('unauthorized-domain');
      if (isUnauthorized) {
        setAuthDomainError(window.location.hostname);
      } else if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
        const isNotConfigured = 
          err?.code === 'auth/configuration-not-found' || 
          err?.code === 'auth/operation-not-allowed' || 
          err?.code === 'auth/invalid-provider-id' ||
          String(err?.message || '').includes('configuration-not-found');

        if (isNotConfigured) {
          setGithubSetupNotice('GitHub provider is not yet enabled in Firebase Console (secretarea-1337). Enable GitHub in Firebase Console -> Authentication -> Sign-in method.');
        } else {
          setGithubSetupNotice(err?.message || 'Failed to authenticate with GitHub.');
        }
      }
    }
  };

  const handleDiscordLogin = async () => {
    setAuthDomainError(null);
    setDiscordSetupNotice(null);
    setGithubSetupNotice(null);

    const clientRedirectUri = `${window.location.origin}/auth/discord/callback`;
    const clientId = (process.env.DISCORD_CLIENT_ID || (import.meta as any).env?.VITE_DISCORD_CLIENT_ID || '').trim();

    // 1. If DISCORD_CLIENT_ID is bundled/configured, open Discord authorization immediately!
    if (clientId) {
      const state = btoa(JSON.stringify({ redirectUri: clientRedirectUri, ts: Date.now() }))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: clientRedirectUri,
        response_type: 'code',
        scope: 'identify email',
        state: state,
      });
      const authUrl = `https://discord.com/oauth2/authorize?${params.toString()}`;
      const authPopup = window.open(
        authUrl,
        'discord_oauth',
        'width=580,height=720,menubar=no,toolbar=no'
      );
      if (!authPopup) {
        setDiscordSetupNotice('Pop-up blocked! Please allow pop-ups for this site to log in with Discord.');
      }
      return;
    }

    // 2. Otherwise try requesting Discord auth URL from backend API (/api/auth/discord/url)
    try {
      const res = await fetch(`/api/auth/discord/url?redirect_uri=${encodeURIComponent(clientRedirectUri)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          const authPopup = window.open(
            data.url,
            'discord_oauth',
            'width=580,height=720,menubar=no,toolbar=no'
          );
          if (!authPopup) {
            setDiscordSetupNotice('Pop-up blocked! Please allow pop-ups for this site to log in with Discord.');
          }
          return;
        }
      }
    } catch (e) {
      // Continue to Firebase Auth
    }

    // 3. Fall back to Firebase Auth provider
    try {
      const cred = await signInWithDiscord();
      if (cred?.user) {
        import('../src/services/userService').then(({ ensureUserProfile }) => {
          ensureUserProfile(cred.user);
        });
      }
      localStorage.setItem('secret_area_unlocked', 'true');
      localStorage.removeItem('nexa_guest_mode');
      setIsUnlocked(true);
      setIsGuestMode(false);
      setShowHackerLoader(true);
      setHackerProgress(0);
      window.dispatchEvent(new Event('authChange'));
      fetchData();
    } catch (err: any) {
      const isUnauthorized = 
        err?.code === 'auth/unauthorized-domain' || 
        String(err?.message || '').includes('unauthorized-domain');
      if (isUnauthorized) {
        setAuthDomainError(window.location.hostname);
      } else if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
        const isNotConfigured = 
          err?.code === 'auth/configuration-not-found' || 
          err?.code === 'auth/operation-not-allowed' || 
          err?.code === 'auth/invalid-provider-id' ||
          String(err?.message || '').includes('configuration-not-found');

        if (isNotConfigured) {
          setDiscordSetupNotice('Discord OAuth provider is not yet enabled in your Firebase Console (secretarea-1337) or DISCORD_CLIENT_ID is missing.');
        } else {
          setDiscordSetupNotice(err?.message || 'Failed to authenticate with Discord.');
        }
      }
    }
  };

  const handleGoogleLogin = async () => {
    setAuthDomainError(null);
    setDiscordSetupNotice(null);
    setGithubSetupNotice(null);
    try {
      const cred = await signInWithGoogle();
      if (cred?.user) {
        import('../src/services/userService').then(({ ensureUserProfile }) => {
          ensureUserProfile(cred.user);
        });
      }
      localStorage.setItem('secret_area_unlocked', 'true');
      localStorage.removeItem('nexa_guest_mode');
      setIsUnlocked(true);
      setIsGuestMode(false);
      setShowHackerLoader(true);
      setHackerProgress(0);
      window.dispatchEvent(new Event('authChange'));
      fetchData();
    } catch (err: any) {
      const isUnauthorized = 
        err?.code === 'auth/unauthorized-domain' || 
        String(err?.message || '').includes('unauthorized-domain');
      if (isUnauthorized) {
        setAuthDomainError(window.location.hostname);
      } else if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
        console.warn('Auth issue:', err?.message || err);
      }
    }
  };

  if (maintenanceConfig === undefined) {
      return (
          <div className="w-full h-screen fixed inset-0 z-[200] bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
              <div className="animate-spin text-slate-900 dark:text-slate-300"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg></div>
          </div>
      );
  }

  if (maintenanceConfig?.active) {
    // Admin bypass: append ?bypass=nexa to the URL
    const urlParams = new URLSearchParams(window.location.search);
    const isBypass = urlParams.get('bypass') === 'nexa';
    
    if (!isBypass) {
        return <MaintenancePage endTime={maintenanceConfig.endTime} message={maintenanceConfig.message} />;
    }
  }

  if (!authChecked && !showHackerLoader) { return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"><div className="animate-pulse flex flex-col items-center"><div className="w-12 h-12 border-4 border-slate-300 dark:border-slate-700 border-t-blue-500 rounded-full animate-spin"></div><div className="mt-4 text-slate-500 font-mono text-sm tracking-widest uppercase">Authenticating...</div></div></div>; } if ((!isUnlocked || (!currentUser && !isGuestMode)) && !showHackerLoader) {
    return (
      <div dir="ltr" className={`w-full min-h-[100dvh] fixed inset-0 z-[200] bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300 overflow-y-auto custom-scrollbar flex items-center justify-center p-2.5 sm:p-4 md:p-6 lg:p-8`}>
          <div className="fixed inset-0 z-0 pointer-events-none">
             {bgImage && (
                <div
                   className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 dark:opacity-40"
                  style={{ backgroundImage: `url(${bgImage})` }}
                 />
             )}
             <div className="absolute inset-0 bg-slate-50/70 dark:bg-slate-950/70 md:backdrop-blur-[2px]"></div>
             <div
                className="absolute top-1/4 start-1/4 w-[500px] h-[500px] bg-primary-500/10 dark:bg-primary-900/20 rounded-full md:blur-[120px] blur-[80px]"
             />
          </div>
        <div className={`relative z-10 w-full ${showMathGame ? 'flex justify-center min-h-full items-center p-2 sm:p-4 py-4 sm:py-8' : 'w-full max-w-sm sm:max-w-xl md:max-w-2xl lg:max-w-3xl flex flex-col items-center my-auto py-2 sm:py-4'}`}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            className={showMathGame ? "w-[95%] sm:w-[85%] md:w-[75%] lg:w-[60%] xl:w-[50%] max-w-5xl relative z-10" : "w-full bg-slate-900/95 dark:bg-black/60 backdrop-blur-xl border border-slate-700/60 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col relative ring-1 ring-white/10"}
          >
          <div className={`relative group ${showMathGame ? 'overflow-hidden bg-white/90 dark:bg-slate-900/90 md:backdrop-blur-2xl rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.1)] dark:shadow-[0_0_50px_rgba(0,0,0,0.5)]' : 'w-full flex flex-col overflow-hidden'}`}>
            
            {showMathGame ? (
                <div className="p-4 sm:p-8 md:p-10 space-y-4 sm:space-y-6 text-center relative overflow-hidden">
                    
                    {/* Matrix Digital Rain Effect (Static Visual) */}
                    <div className="absolute inset-0 pointer-events-none opacity-5 overflow-hidden">
                        <div className="animate-pulse text-[10px] font-mono leading-3 text-emerald-900 dark:text-emerald-500 break-words text-justify p-2 select-none">
                            / x + ∑ ∛ √ ² ³ ≤ ≥ ≠ π μ η α Δ Ω ∞ ½ ¼ 0 1 0 1 1 0 ∞ ∑ π μ η α Δ Ω / x + ∑ ∛ √ ² ³ ≤ ≥ ≠ π μ η α Δ Ω ∞ ½ ¼
                            / x + ∑ ∛ √ ² ³ ≤ ≥ ≠ π μ η α Δ Ω ∞ ½ ¼ 0 1 0 1 1 0 ∞ ∑ π μ η α Δ Ω / x + ∑ ∛ √ ² ³ ≤ ≥ ≠ π μ η α Δ Ω ∞ ½ ¼
                            / x + ∑ ∛ √ ² ³ ≤ ≥ ≠ π μ η α Δ Ω ∞ ½ ¼ 0 1 0 1 1 0 ∞ ∑ π μ η α Δ Ω / x + ∑ ∛ √ ² ³ ≤ ≥ ≠ π μ η α Δ Ω ∞ ½ ¼
                            / x + ∑ ∛ √ ² ³ ≤ ≥ ≠ π μ η α Δ Ω ∞ ½ ¼ 0 1 0 1 1 0 ∞ ∑ π μ η α Δ Ω / x + ∑ ∛ √ ² ³ ≤ ≥ ≠ π μ η α Δ Ω ∞ ½ ¼
                        </div>
                    </div>

                    <button onClick={() => setShowMathGame(false)} className="absolute top-4 end-4 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-200 transition-colors z-20">
                        <Icon name="X" size={24} />
                    </button>
                    
                    <div className="relative z-10">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-2xl flex items-center justify-center shadow-inner mb-3 sm:mb-4 border border-blue-500/20">
                            <Icon name="Cpu" size={28} className="text-blue-500 animate-pulse" />
                        </div>
                        <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-1">Security Challenge</h2>
                        <p className="text-slate-900 dark:text-slate-300 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em]">Advanced Protocol</p>
                    </div>

                    {mathStatus === 'locked' && (
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-4 sm:space-y-6 relative z-10 py-4 sm:py-6">
                            <div className="text-red-500 flex justify-center animate-pulse"><Icon name="Skull" size={56} /></div>
                            <div className="bg-red-500/10 border border-red-500/30 p-4 sm:p-6 rounded-xl">
                                <h3 className="text-base sm:text-lg font-black text-red-500 uppercase mb-2">System Locked</h3>
                                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 uppercase leading-relaxed">
                                    you are a loser contact admin to request secret key
                                </p>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-[10px] uppercase font-bold text-slate-900 dark:text-slate-300 tracking-widest">Retry Available In</span>
                                {mathLockoutTime && <LockoutTimer targetTime={mathLockoutTime} />}
                            </div>
                        </motion.div>
                    )}

                    {mathStatus === 'playing' && (
                        <form onSubmit={verifyMath} className="space-y-4 sm:space-y-6 relative z-10">
                            <div className="py-4 sm:py-6 bg-slate-100 dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800 relative overflow-hidden group">
                                <div className="absolute top-0 start-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
                                
                                {mathProblem.note && (
                                    <div className="mb-2 sm:mb-3">
                                        <span className="inline-block px-3 py-1 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-mono font-bold border border-blue-500/20">
                                            {mathProblem.note}
                                        </span>
                                    </div>
                                )}
                                
                                <div className="px-2">
                                    <span className="text-lg sm:text-2xl md:text-3xl font-mono font-black text-slate-800 dark:text-slate-100 tracking-wider break-all leading-tight">
                                        {mathProblem.q} = ?
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between px-2">
                                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">Input Answer</span>
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${attemptsLeft === 1 ? 'text-red-500 animate-pulse' : 'text-blue-500'}`}>
                                    {attemptsLeft} Attempts Left
                                </span>
                            </div>

                            <input 
                                type="number" 
                                value={mathInput} 
                                onChange={e => setMathInput(e.target.value)} 
                                placeholder="ENTER RESULT" 
                                autoFocus
                                step="any"
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 sm:py-4 font-mono text-base sm:text-xl font-bold text-center outline-none focus:border-blue-500 transition-colors shadow-inner"
                            />
                            
                            <button type="submit" className="w-full py-3 sm:py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all text-xs sm:text-sm cursor-pointer">
                                Verify Calculation
                            </button>
                        </form>
                    )}

                    {mathStatus === 'won' && (
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-4 sm:space-y-6 relative z-10">
                            <div className="text-emerald-900 dark:text-emerald-500 flex justify-center"><Icon name="CheckCircle" size={48} /></div>
                            <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-200 px-4">
                                "Intelligence confirmed. Welcome to the platform."
                            </p>
                            <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl">
                                <span className="block text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">Challenge Status</span>
                                <span className="font-mono text-sm sm:text-lg font-bold text-emerald-600 dark:text-emerald-400">Security Check Passed</span>
                            </div>
                            <button onClick={copyAndCloseMath} className="w-full py-3 sm:py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer">
                                <Icon name="CheckCircle" size={18} /> Proceed to Login
                            </button>
                        </motion.div>
                    )}

                    {mathStatus === 'lost' && (
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="py-8 sm:py-10 relative z-10">
                            <div className="text-red-500 flex justify-center mb-4"><Icon name="AlertTriangle" size={48} /></div>
                            <h3 className="text-lg sm:text-xl font-black text-red-500 uppercase">Incorrect</h3>
                            <p className="text-xs font-bold text-slate-900 dark:text-slate-300 mt-2">Calculation Error. Be careful.</p>
                        </motion.div>
                    )}
                </div>
            ) : (
                <div dir="ltr" className="flex flex-col relative overflow-hidden w-full h-[36vh] min-h-[220px] xs:min-h-[250px] sm:min-h-[300px] md:h-[360px] lg:h-[400px]">
                      {/* Background Image inside terminal */}
                      <div className="absolute inset-0 z-0 pointer-events-none">
                        <img src="https://images2.alphacoders.com/135/1355120.jpeg" alt="Terminal Background" className="w-full h-full object-cover opacity-20 dark:opacity-30 mix-blend-overlay" />
                        <div className="absolute inset-0 bg-slate-900/80 dark:bg-black/60 backdrop-blur-[1px]"></div>
                      </div>
                      
                      <div className="h-8 sm:h-9 md:h-10 bg-slate-800/80 dark:bg-[#0f172a]/70 backdrop-blur-sm border-b border-slate-700/50 dark:border-slate-800/50 flex items-center px-2.5 sm:px-4 justify-between relative z-10 shrink-0">
                        <div className="flex gap-1.5 sm:gap-2">
                          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500"></div>
                          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500"></div>
                          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500"></div>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 max-w-[65%] sm:max-w-none">
                            <div className="relative w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 flex items-center justify-center shrink-0">
                                <Icon name="Wolf" className="w-full h-full text-white relative z-10" />
                            </div>
                            <div className="text-[10px] sm:text-xs font-semibold text-slate-300 lowercase tracking-tight sm:tracking-widest font-mono truncate">guest@SecretArea1337:~/root</div>
                        </div>
                        <div className="w-8 sm:w-12"></div>
                      </div>
                      <div 
                        className="flex-1 min-h-0 p-3 sm:p-4 md:p-6 overflow-y-auto font-mono text-[11px] sm:text-[12px] md:text-[13px] custom-scrollbar relative z-10 text-[#D8DEE9]" 
                        onClick={() => document.getElementById('terminal-input')?.focus()}
                      >
                        {!terminalCleared && (
                          <div className="mb-3 sm:mb-4">
                             <span className="text-[#89B4FA] font-bold">┌──(</span><span className="text-[#E5E9F0] font-bold">guest㉿SecretArea1337</span><span className="text-[#89B4FA] font-bold">)-[</span><span className="text-[#E5E9F0] font-bold">~</span><span className="text-[#89B4FA] font-bold">]</span><br/>
                             <span className="text-[#89B4FA] font-bold">└─$</span> <span className="text-[#A6E3A1]">N E X A OS - System Online</span>
                          </div>
                        )}
                        {terminalHistory.map((line, i) => (
                          <motion.div 
                            key={i} 
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`mb-1.5 leading-relaxed tracking-wide whitespace-pre-wrap ${
                              line.type === 'system' ? 'text-[#89B4FA] font-bold' :
                              line.type === 'user' ? 'text-[#E5E9F0]' :
                              line.type === 'error' ? 'text-[#BF616A]' :
                              line.type === 'success' ? 'text-[#A6E3A1] font-bold' :
                              'text-[#D8DEE9]'
                            }`}
                          >
                            {line.text}
                          </motion.div>
                        ))}
                        <form onSubmit={handleTerminalSubmit} className="flex flex-col mt-2">
                          <div className="flex items-center text-[#89B4FA] font-bold text-[11px] sm:text-xs">
                             ┌──(<span className="text-[#E5E9F0]">guest㉿SecretArea1337</span>)-[<span className="text-[#E5E9F0]">~</span>]
                          </div>
                          <div className="flex items-center items-stretch mt-0.5">
                            <span className="text-[#89B4FA] font-bold me-1.5 sm:me-2 shrink-0 drop-shadow-sm flex items-center text-[11px] sm:text-xs">
                               └─$
                            </span>
                            <input 
                              id="terminal-input"
                              type="text" 
                              value={terminalInput}
                              onChange={(e) => setTerminalInput(e.target.value)}
                              onKeyDown={handleTerminalKeyDown}
                              className="flex-1 bg-transparent outline-none text-[#E5E9F0] font-mono tracking-wide caret-[#E5E9F0] text-[11px] sm:text-xs md:text-sm py-0.5"
                              autoFocus
                              autoComplete="off"
                              spellCheck="false"
                            />
                          </div>
                        </form>
                        <div ref={terminalEndRef} />
                      </div>
                </div>
            )}
          </div>
          
          <div className="bg-slate-900/95 dark:bg-[#070b14] border-t border-slate-700/50 dark:border-slate-800/80 p-3 sm:p-4 md:p-5 flex flex-col items-center w-full">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px w-6 sm:w-10 bg-slate-700/80 dark:bg-slate-800"></div>
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Visitor Quick Access</span>
              <div className="h-px w-6 sm:w-10 bg-slate-700/80 dark:bg-slate-800"></div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-2.5 w-full">
              {/* Discord Button */}
              <button 
                type="button"
                onClick={handleDiscordLogin}
                className="flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 sm:py-2.5 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold rounded-xl transition-all text-xs sm:text-sm cursor-pointer shadow-md shadow-[#5865F2]/20 active:scale-95"
              >
                <Icon name="Discord" size={16} className="shrink-0" />
                <span className="truncate">Discord</span>
              </button>

              {/* Google Button */}
              <button 
                type="button"
                onClick={handleGoogleLogin}
                className="flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 sm:py-2.5 bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-xl transition-all text-xs sm:text-sm cursor-pointer shadow-md active:scale-95"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="truncate">Google</span>
              </button>

              {/* GitHub Button */}
              <button 
                type="button"
                onClick={handleGithubLogin}
                className="flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 sm:py-2.5 bg-[#24292e] hover:bg-[#1b1f23] text-white border border-slate-700/80 font-bold rounded-xl transition-all text-xs sm:text-sm cursor-pointer shadow-md active:scale-95"
              >
                <Icon name="Github" size={16} className="shrink-0" />
                <span className="truncate">GitHub</span>
              </button>

              {/* Guest Mode Button */}
              <button 
                type="button"
                onClick={() => {
                  localStorage.setItem('secret_area_unlocked', 'guest');
                  localStorage.setItem('nexa_guest_mode', 'true');
                  setIsUnlocked(true);
                  setIsGuestMode(true);
                  setShowHackerLoader(true);
                  setHackerProgress(0);
                  window.dispatchEvent(new Event('authChange'));
                  fetchData();
                }}
                className="flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 sm:py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 font-bold rounded-xl transition-all text-xs sm:text-sm cursor-pointer shadow-md active:scale-95"
              >
                <Icon name="User" size={16} className="shrink-0" />
                <span className="truncate">Guest</span>
              </button>
            </div>

            {authDomainError && (
              <div className="mt-3.5 p-3.5 sm:p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs w-full max-w-lg space-y-2 text-left">
                <div className="flex items-center gap-2 font-bold text-amber-400">
                  <Icon name="AlertTriangle" size={16} />
                  <span>Firebase Authorized Domain Required</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Firebase Authentication requires your preview domain to be added to authorized domains in Firebase Console:
                </p>
                <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-lg border border-white/10 font-mono text-[11px] select-all text-white overflow-x-auto">
                  <span className="flex-1 truncate">{authDomainError}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(authDomainError);
                      setDomainCopied(true);
                      setTimeout(() => setDomainCopied(false), 2000);
                    }}
                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded text-[10px] transition-colors whitespace-nowrap cursor-pointer"
                  >
                    {domainCopied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
                  <a
                    href="https://console.firebase.google.com/project/secretarea-1337/authentication/settings"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline inline-flex items-center gap-1 font-semibold"
                  >
                    Open Firebase Settings &rarr;
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.setItem('secret_area_unlocked', 'guest');
                      localStorage.setItem('nexa_guest_mode', 'true');
                      setIsUnlocked(true);
                      setIsGuestMode(true);
                      setShowHackerLoader(true);
                      setHackerProgress(0);
                      fetchData();
                    }}
                    className="text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    Bypass & Enter as Guest &rarr;
                  </button>
                </div>
              </div>
            )}

            {githubSetupNotice && (
              <div className="mt-3.5 p-3.5 sm:p-4 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-200 text-xs w-full max-w-lg space-y-2.5 text-left">
                <div className="flex items-center gap-2 font-bold text-white">
                  <Icon name="Github" size={16} />
                  <span>GitHub Authentication Setup</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  {githubSetupNotice}
                </p>
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400">
                    Firebase OAuth Callback URL:
                  </span>
                  <div className="flex items-center gap-2 bg-black/50 p-1.5 rounded-lg border border-white/10 font-mono text-[11px] text-white">
                    <span className="flex-1 truncate">https://secretarea-1337.firebaseapp.com/__/auth/handler</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText('https://secretarea-1337.firebaseapp.com/__/auth/handler');
                        setCopiedGithub(true);
                        setTimeout(() => setCopiedGithub(false), 2000);
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-slate-200 text-black font-bold rounded text-[10px] transition-colors whitespace-nowrap cursor-pointer"
                    >
                      {copiedGithub ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
                  <a
                    href="https://github.com/settings/developers"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:underline inline-flex items-center gap-1 font-bold"
                  >
                    Open GitHub OAuth Apps &rarr;
                  </a>
                  <a
                    href="https://console.firebase.google.com/project/secretarea-1337/authentication/providers"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline inline-flex items-center gap-1 font-bold"
                  >
                    Open Firebase Providers &rarr;
                  </a>
                </div>
              </div>
            )}

            {discordSetupNotice && (
              <div className="mt-3.5 p-3.5 sm:p-4 rounded-xl bg-[#5865F2]/10 border border-[#5865F2]/30 text-slate-200 text-xs w-full max-w-lg space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-[#7289DA]">
                    <Icon name="Discord" size={16} />
                    <span>Discord OAuth Configuration</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setDiscordSetupNotice(null)}
                    className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer text-xs"
                    title="Close"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200 text-[11px] leading-relaxed">
                  <span className="font-bold text-amber-400">Why are you seeing this on Vercel?</span>
                  <p className="mt-1 text-slate-300">
                    Discord OAuth requires your app credentials and redirect URL to match. To make it work in 1 click or connect your official bot:
                  </p>
                </div>

                {/* Option 1: Instant Discord Sign-In (Works without keys) */}
                <div className="p-2.5 rounded-lg bg-[#5865F2]/15 border border-[#5865F2]/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white">⚡ Option 1: Instant Discord Sign-In</span>
                    <span className="text-[9px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">Ready Now</span>
                  </div>
                  <p className="text-[10px] text-slate-300">Enter immediately with any Discord username (no API keys needed):</p>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Gamer tag (e.g. Wolf#1337)"
                      value={instantDiscordName}
                      onChange={(e) => setInstantDiscordName(e.target.value)}
                      className="flex-1 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-[#5865F2]"
                    />
                    <button
                      type="button"
                      onClick={() => handleInstantDiscordLogin()}
                      className="px-3 py-1 bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold text-xs rounded-lg shadow-sm transition-all active:scale-95 whitespace-nowrap cursor-pointer"
                    >
                      Instant Login
                    </button>
                  </div>
                </div>

                {/* Option 2: Setup Discord Keys on Vercel */}
                <div className="space-y-1.5 pt-1 border-t border-white/10">
                  <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 block">
                    ⚡ Option 2: Official Discord Login on Vercel:
                  </span>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Add <code className="text-white bg-black/40 px-1 py-0.5 rounded">DISCORD_CLIENT_ID</code> and <code className="text-white bg-black/40 px-1 py-0.5 rounded">DISCORD_CLIENT_SECRET</code> in your <strong>Vercel Project Settings &rarr; Environment Variables</strong>, then paste this Redirect URI into your Discord App:
                  </p>
                  
                  {/* Current Environment URL */}
                  <div className="space-y-0.5 pt-1">
                    <div className="flex items-center gap-2 bg-black/50 p-1.5 rounded-lg border border-white/10 font-mono text-[10px] text-white">
                      <span className="flex-1 truncate">
                        {typeof window !== 'undefined' ? `${window.location.origin}/auth/discord/callback` : 'https://secretarea.vercel.app/auth/discord/callback'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const uri = typeof window !== 'undefined' ? `${window.location.origin}/auth/discord/callback` : 'https://secretarea.vercel.app/auth/discord/callback';
                          navigator.clipboard.writeText(uri);
                          setCopiedDiscord(true);
                          setTimeout(() => setCopiedDiscord(false), 2000);
                        }}
                        className="px-2.5 py-0.5 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold rounded text-[10px] transition-colors whitespace-nowrap cursor-pointer"
                      >
                        {copiedDiscord ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/5 text-[11px]">
                  <a
                    href="https://discord.com/developers/applications"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#5865F2] hover:underline inline-flex items-center gap-1 font-bold"
                  >
                    Open Discord Developer Portal &rarr;
                  </a>
                  <a
                    href="https://vercel.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:underline inline-flex items-center gap-1 font-bold"
                  >
                    Open Vercel Dashboard &rarr;
                  </a>
                </div>
              </div>
            )}
          </div>
          
        </motion.div>
        </div>
      </div>
    );
  }


  if (selectedGenreView) {
      return (
          <div className="min-h-screen bg-slate-50 dark:bg-[#030712] font-sans selection:bg-primary-500/30">
             <GenreDetailView 
                genre={selectedGenreView}
                games={Object.values(allResources).flat()}
                onBack={() => {
                   setSelectedGenreView(null);
                   setTimeout(() => {
                       const el = document.getElementById('featured-genres');
                       if (el) {
                           const y = el.getBoundingClientRect().top + window.scrollY - 100;
                           window.scrollTo({ top: y, behavior: 'smooth' });
                       }
                   }, 50);
                }}
                onSelect={setSelectedResource}
                stash={stash}
                toggleStash={toggleStash}
             />
             {selectedResource && (
               <ResourceDetailModal globalSpecs={globalSpecs} item={selectedResource} 
                  onClose={handleCloseDetailModal}
                  stash={stash}
                  toggleStash={toggleStash}
                  initialScrollTarget={selectedResourceAction}
                  onDonateClick={() => setShowDonateModal(true)}
                  allResources={allResources}
                  onItemSelect={(rec) => { setSelectedResource(rec); setSelectedResourceAction(undefined); }}
                  currentGenreContext={selectedGenreView}
                  resolvedDev={getResolvedDeveloper(selectedResource)}
                  onCompanyClick={handleCompanyClick}
                  onCategoryClick={(cat) => {
                      const c = (cat || '').toLowerCase();
                      const targetTab = (c === 'architect' || c === 'tools') ? 'architect'
                        : (c === 'hypervisor') ? 'hypervisor'
                        : (c === 'steamtools') ? 'steamtools'
                        : (c === 'extra' || c === 'savegame') ? 'extra'
                        : 'game';
                      setActiveTab(targetTab);
                      handleCloseDetailModal();
                  }}
                  isGuestMode={isGuestMode}
                  showGuestNotification={showGuestNotification}
                  onGenreClick={(genre) => {
                      setSelectedGenreView(genre);
                      setSelectedResource(null);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
               />
             )}
             
          </div>
      );
  }

  return (
    <div dir={dir} className="w-full min-h-screen bg-slate-50 dark:bg-[#030712] font-sans text-slate-800 dark:text-slate-200 selection:bg-primary-500/30 transition-colors duration-300 overflow-x-hidden relative">
      <div className="absolute inset-0 -z-10 opacity-40 dark:opacity-60 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-200 via-slate-50 to-slate-50 dark:from-slate-900 dark:via-[#030712] dark:to-[#030712]">
      </div>

      <AnimatePresence>
        {showHackerLoader && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
            dir="ltr" className="fixed inset-0 z-[9999] bg-slate-50 dark:bg-[#020617] flex flex-col items-center justify-center p-4 overflow-hidden transition-colors duration-300"
          >
            {/* Simple Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
               
               <div className="absolute inset-0 bg-slate-50/70 dark:bg-[#020617]/80 md:backdrop-blur-[2px]" />
               <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-400/10 dark:bg-cyan-900/10 rounded-full blur-[100px]" />
            </div>
            
            <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
              {/* Terminal Window */}
              <div className="w-full bg-slate-900/90 dark:bg-black/40 backdrop-blur-md border border-slate-700/50 dark:border-slate-700/50 rounded-xl overflow-hidden shadow-2xl flex flex-col relative">
                {/* Background Image inside terminal */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                  <img src="https://images2.alphacoders.com/135/1355120.jpeg" alt="Terminal Background" className="w-full h-full object-cover opacity-20 dark:opacity-30 mix-blend-overlay" />
                  <div className="absolute inset-0 bg-slate-900/80 dark:bg-black/60 backdrop-blur-[1px]"></div>
                </div>
                
                
                {/* Mac OS Window Header */}
                <div className="h-8 sm:h-10 bg-slate-800/80 dark:bg-[#0f172a]/50 backdrop-blur-sm border-b border-slate-700/50 dark:border-slate-800/50 flex items-center px-2 sm:px-4 justify-between relative z-10">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="relative w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                        <Icon name="Wolf" className="w-full h-full text-white dark:text-white relative z-10" />
                        <Icon name="Wolf" className="w-full h-full text-red-500 absolute inset-0 z-0 opacity-70 animate-[glitch_2s_infinite]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)', transform: 'translate(-1px, 1px)' }} />
                        <Icon name="Wolf" className="w-full h-full text-cyan-500 absolute inset-0 z-0 opacity-70 animate-[glitch_3s_infinite_reverse]" style={{ clipPath: 'polygon(0 55%, 100% 55%, 100% 100%, 0 100%)', transform: 'translate(1px, -1px)' }} />
                     </div>
                     <div className="text-[9px] sm:text-xs font-semibold text-slate-300 lowercase tracking-wide sm:tracking-widest font-mono truncate">guest@SecretArea1337:~/root</div>
                  </div>
                  <div className="w-12"></div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6 md:p-10 flex flex-col items-center relative overflow-hidden h-[60vh] min-h-[300px] sm:h-[410px] z-10">
                  <h2 className="text-xl md:text-2xl font-black tracking-[0.2em] uppercase mb-10 text-white dark:text-white text-center">
                    Secret Area
                  </h2>

                  {/* Scrolling Checklist */}
                  <div className="w-full max-w-md h-40 overflow-hidden relative flex flex-col justify-end" style={{ maskImage: "linear-gradient(to bottom, transparent, black 30%, black)", WebkitMaskImage: "linear-gradient(to bottom, transparent, black 30%, black)" }}>
                    <div className="flex flex-col gap-3 w-full justify-end pb-2">
                      {terminalLines.slice(-5).map((line, i, arr) => {
                        const isLatest = i === arr.length - 1;
                        return (
                          <motion.div
                            key={line + i}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex items-center gap-4 ${isLatest ? 'text-cyan-400' : 'text-slate-300'}`}
                          >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 shrink-0 ${isLatest ? 'border-cyan-400 bg-white/20 dark:bg-black/20 backdrop-blur-sm' : 'border-slate-600 bg-white/10 dark:bg-black/10 backdrop-blur-sm'}`}>
                              {!isLatest && <Icon name="Check" size={12} className="text-slate-300" />}
                              {isLatest && <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}><Icon name="Loader2" size={12} className="text-cyan-400" /></motion.div>}
                            </div>
                            <span className="font-mono text-[11px] sm:text-xs truncate font-medium drop-shadow-sm">{line}</span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full max-w-md mt-8">
                    <div className="flex justify-between text-[10px] sm:text-xs font-bold mb-3 text-slate-200 uppercase tracking-widest drop-shadow-sm">
                      <span>Status: Loading..</span>
                      <span className="text-cyan-400">{hackerProgress}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-white/20 dark:bg-black/40 backdrop-blur-sm rounded-full overflow-hidden border border-slate-300/50 dark:border-slate-700/50">
                      <motion.div
                        className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400"
                        initial={{ width: "0%" }}
                        animate={{ width: `${hackerProgress}%` }}
                        transition={{ duration: 0.1 }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showHackerLoader && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full"
        >
          <div className="fixed top-24 end-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
            {notifications.map(n => (
                <motion.div
                    key={n.id}
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 100, opacity: 0 }}
                    className={`bg-white/80 dark:bg-slate-900/80 md:backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-2xl p-4 rounded-2xl w-[300px] pointer-events-auto flex gap-3 items-start ${n.isAr ? 'rtl' : 'ltr'}`}
                    dir={n.isAr ? 'rtl' : 'ltr'}
                >
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-xl border border-slate-200 dark:border-slate-700">
                        🐺
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                            <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">{n.title}</h4>
                            <span className="text-[9px] text-slate-600 dark:text-slate-300">{n.time}</span>
                        </div>
                        <p className="text-[10px] text-slate-900 dark:text-slate-200 leading-snug whitespace-pre-line font-medium">
                            {n.text}
                        </p>
                    </div>
                </motion.div>
            ))}
        </AnimatePresence>
      </div>

      <DisclaimerModal open={showDisclaimer} onClose={handleCloseDisclaimer} />
      <DuaPopup />

      <AnimatePresence>
        {selectedResource && (
          <>
            <ResourceDetailModal 
              globalSpecs={globalSpecs}
              item={selectedResource} 
              onClose={handleCloseDetailModal} 
              isHypervisor={selectedResource.category === 'hypervisor'}
              stash={stash}
              toggleStash={toggleStash}
              onCompanyClick={handleCompanyClick}
              currentGenreContext={selectedGenreView}
              onGenreClick={(genre) => {
                setSelectedGenreView(genre);
                setSelectedResource(null);
                setOpenedViaRandom(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              resolvedDev={getResolvedDeveloper(selectedResource)}
              onCategoryClick={(cat) => {
                const c = (cat || '').toLowerCase();
                const targetTab = (c === 'architect' || c === 'tools') ? 'architect'
                  : (c === 'hypervisor') ? 'hypervisor'
                  : (c === 'steamtools') ? 'steamtools'
                  : (c === 'extra' || c === 'savegame') ? 'extra'
                  : 'game';
                setActiveTab(targetTab);
                handleCloseDetailModal();
              }}
              isGuestMode={isGuestMode}
              showGuestNotification={showGuestNotification}
              initialScrollTarget={selectedResourceAction}
              onDonateClick={() => setShowDonateModal(true)}
              allResources={allResources}
              onItemSelect={(rec) => { setSelectedResource(rec); setSelectedResourceAction(undefined); setOpenedViaRandom(false); }}
            />
            {openedViaRandom && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                className="fixed bottom-6 start-1/2 -translate-x-1/2 lg:bottom-10 lg:start-auto lg:end-10 lg:translate-x-0 z-[9999]"
              >
                <div 
                  className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden flex items-center justify-center shrink-0 group shadow-2xl cursor-pointer transition-transform hover:scale-110 active:scale-95 border-2 border-white/20 hover:border-white/50" 
                  title="Discover another random game"
                  onClick={() => window.dispatchEvent(new CustomEvent('randomPopularGame'))}
                >
                  <div className="absolute inset-0 bg-[conic-gradient(from_0deg,#ff0000,#ff8000,#ffff00,#00ff00,#00ffff,#0000ff,#8000ff,#ff00ff,#ff0000)] animate-[spin_4s_linear_infinite] group-hover:animate-[spin_1s_linear_infinite]" />
                  <div className="absolute inset-[3px] sm:inset-[4px] rounded-full bg-slate-900 flex items-center justify-center z-10 overflow-hidden transition-colors duration-300 group-hover:bg-slate-800">
                    <div className="absolute top-1/2 start-1/2 w-full h-full origin-top-start -ms-0 -mt-0 bg-gradient-to-br from-indigo-500/50 to-transparent animate-[spin_2s_linear_infinite] group-hover:from-indigo-400/80 group-hover:animate-[spin_0.5s_linear_infinite]" />
                    <div className="absolute w-[60%] h-[60%] rounded-full border border-indigo-500/60 border-dashed animate-[spin_10s_linear_infinite] group-hover:border-indigo-400 group-hover:animate-[spin_3s_linear_infinite_reverse] group-hover:scale-110 transition-transform" />
                    <div className="absolute w-[30%] h-[30%] rounded-full border border-indigo-500/60 group-hover:border-indigo-400 group-hover:scale-125 transition-transform" />
                    <Icon name="RefreshCw" size={16} className="text-white relative z-20 group-hover:animate-spin hidden sm:block" />
                    <Icon name="RefreshCw" size={14} className="text-white relative z-20 group-hover:animate-spin sm:hidden" />
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedCompanyProfile && (
            <CompanyProfileModal
                profile={selectedCompanyProfile}
                resources={getCompanyResources(selectedCompanyProfile)}
                onClose={() => setSelectedCompanyProfile(null)}
                onItemClick={(item) => {
                    setSelectedCompanyProfile(null);
                    setSelectedResource(item);
                }}
            />
        )}
      </AnimatePresence>


      <AnimatePresence>
        {showSteamModal && (
            <SteamAccountsModal 
                open={showSteamModal} 
                onClose={() => setShowSteamModal(false)} 
                accounts={steamAccounts} 
                isLockedForGuest={!isGmailUser}
                onLoginClick={() => {
                  setShowSteamModal(false);
                  setRewardLoginModalTarget('steam');
                }}
            />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMasterGiftModal && (
            <MasterGiftModal 
                open={showMasterGiftModal} 
                onClose={() => setShowMasterGiftModal(false)} 
                accounts={masterGifts} 
                isLockedForGuest={!isGmailUser}
                onLoginClick={() => {
                  setShowMasterGiftModal(false);
                  setRewardLoginModalTarget('mastergift');
                }}
            />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {rewardLoginModalTarget && (
            <RewardLoginModal
                open={Boolean(rewardLoginModalTarget)}
                target={rewardLoginModalTarget}
                onClose={() => setRewardLoginModalTarget(null)}
                onSuccess={() => {
                  const target = rewardLoginModalTarget;
                  setRewardLoginModalTarget(null);
                  if (target === 'steam') setShowSteamModal(true);
                  if (target === 'mastergift') setShowMasterGiftModal(true);
                }}
            />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showDonateModal && (
            <DonateModal 
                open={showDonateModal} 
                onClose={() => setShowDonateModal(false)} 
            />
        )}
      </AnimatePresence>

      <HeroSlider 
        games={allResources['game']?.slice(0, 8) || []}
        onSelectGame={(game, action) => { setSelectedResource(game); setSelectedResourceAction(action); }}
      />
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-10 pb-4 md:pb-8 relative z-10">
        <PartnersSection />

        <UpcomingTrailersSection sheetTrailersData={sheetUpcomingTrailers} />

        {/* PROMO SECTION */}
        <section className="mb-16 w-full">
          <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl group">
            
            {/* Subtle Gradient Background for Light/Dark Mode */}
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800"></div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between p-8 md:p-12 gap-8 w-full" dir={dir}>
               {/* Left Side: Content */}
               <div className="flex-1 text-center lg:text-start space-y-6">
                  <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter" style={{ fontFamily: "'Oswald', sans-serif" }}>
                     {t('Unlock Exclusive')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-400 dark:to-amber-500">{t('Rewards')}</span>
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
                     {t('Get access to premium mastergifts and free accounts. Elevate your gaming experience with our exclusive collection.')}
                  </p>
                  
                    <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-2">
                     <button 
                        onClick={(e) => { 
                            e.preventDefault(); 
                            if (!isGmailUser) {
                                setRewardLoginModalTarget('steam');
                                return;
                            }
                            setShowSteamModal(true); 
                        }} 
                        className="relative px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center gap-2"
                     >
                        {steamAccounts && steamAccounts.length > 0 && (
                            <span className="absolute -top-1.5 -end-1.5 flex h-3.5 w-3.5 items-center justify-center z-20">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                            </span>
                        )}
                        <Icon name="User" size={20} />
                        {t('Free Accounts')}
                     </button>
                     <button 
                        onClick={(e) => { 
                            e.preventDefault(); 
                            if (!isGmailUser) {
                                setRewardLoginModalTarget('mastergift');
                                return;
                            }
                            setShowMasterGiftModal(true); 
                        }} 
                        className="relative px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center gap-2"
                     >
                        {masterGifts && masterGifts.length > 0 && (
                            <span className="absolute -top-1.5 -end-1.5 flex h-3.5 w-3.5 items-center justify-center z-20">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                            </span>
                        )}
                        <Icon name="Gift" size={20} className="text-amber-500 dark:text-amber-400" />
                        {t('Mastergift')}
                     </button>
                  </div>
               </div>
               {/* Right Side: Image */}
               <div className="flex-1 flex justify-center lg:justify-end relative mt-8 lg:mt-0 p-4 lg:p-0">
                  <div className="absolute inset-0 bg-amber-500/10 dark:bg-amber-500/20 blur-[100px] rounded-full w-[250px] h-[250px] lg:w-[350px] lg:h-[350px] mx-auto lg:mr-10 rtl:lg:ml-10 rtl:lg:mr-auto"></div>
                  <img src="/images/free_gifts.png" alt="Free Gifts" className="relative z-10 w-full max-w-[280px] lg:max-w-[320px] xl:max-w-[380px] h-auto object-contain drop-shadow-2xl hover:scale-105 hover:-translate-y-2 transition-transform duration-500" />
               </div>
            </div>
          </div>
        </section>



        <section className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg shadow-lg shadow-primary-500/20 text-white">
                    <Icon name="Rocket" size={20} />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
                    {t('Upcoming Games')} <span className="text-primary-500">2026+</span>
                </h2>
             </div>
             
             <div className="flex gap-2 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar relative z-[90]">
                {['PlayStation 5', 'Xbox S/X', 'Steam'].map((p) => (
                    <button
                        key={t(p)}
                        type="button"
                        id={"btn-platform-" + p.replace(/\s+/g, '-').toLowerCase()}
                        onClick={(e) => { e.preventDefault(); setUpcomingPlatform(p); }}
                        className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all whitespace-nowrap cursor-pointer z-[100] ${
                            upcomingPlatform === p 
                            ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-sm' 
                            : 'text-slate-700 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-900 dark:text-slate-200'
                        }`}
                    >
                        {t(p)}
                    </button>
                ))}
             </div>
          </div>
          
          <div className="relative">
             <GameCarousel 
                games={filteredUpcoming} 
                loading={loading}
                errorState={{ missing: isUpcomingMissing, script: scriptError }}
             />
          </div>
        </section>

        <div className="mb-10 w-full flex justify-center">
            <AdBanner 
                desktopSrc={AD_CONFIG.banner1.desktop} 
                mobileSrc={AD_CONFIG.banner1.mobile} 
                link={AD_CONFIG.banner1.link} 
            />
        </div>

        <section className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-lg shadow-lg shadow-emerald-500/20 text-white">
                    <Icon name="Sparkles" size={20} />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
                    {t('Recent')} <span className="text-emerald-900 dark:text-emerald-500">{t('Products')}</span>
                </h2>
             </div>
          </div>
          
          <div className="relative">
             <RecentProductsCarousel 
                items={recentProducts} 
                loading={loading}
                onSelect={setSelectedResource}
                stash={stash}
                toggleStash={toggleStash}
             />
          </div>
          <div className="mt-10 w-full flex justify-center">
             <AdBanner 
                 desktopSrc={AD_CONFIG.banner2.desktop} 
                 mobileSrc={AD_CONFIG.banner2.mobile} 
                 link={AD_CONFIG.banner2.link} 
             />
          </div>
        </section>

        <section className="mb-16">
           

<UpcomingListsDisplay lists={upcomingLists} />
        </section>

        {/* COMMUNITY SECTION */}
        <section className="mb-16 w-full">
          <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl group flex flex-col md:flex-row min-h-[400px]">
            {/* Gradient background overlay */}
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800"></div>

            <div className="relative z-10 flex flex-col lg:flex-row items-stretch justify-between w-full h-full" dir={dir}>
               
               {/* Left Side: Content */}
               <div className="flex-1 flex flex-col justify-center p-8 md:p-12 space-y-6 lg:max-w-xl xl:max-w-2xl text-center lg:text-start lg:rtl:text-right">
                  <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter" style={{ fontFamily: "'Oswald', sans-serif" }}>
                     {t('Join Our')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-cyan-400 dark:to-blue-500">{t('Community')}</span>
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base font-medium leading-relaxed">
                     {t('Connect with us on Discord, Telegram, and Reddit for the latest updates and exclusive drops.')}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row flex-wrap items-center gap-4 justify-center lg:justify-start pt-4">
                     <a href="https://discord.gg/pygmDWFAHK" target="_blank" rel="noopener noreferrer" className="px-6 py-3.5 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-xl font-bold uppercase tracking-wide transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>
                        {t('Discord')}
                     </a>
                     <a href="https://t.me/secretarea1337" target="_blank" rel="noopener noreferrer" className="px-6 py-3.5 bg-[#0088cc] hover:bg-[#0077b3] text-white rounded-xl font-bold uppercase tracking-wide transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
                        {t('Telegram')}
                     </a>
                     <a href="https://www.reddit.com/r/SecretArea1337/" target="_blank" rel="noopener noreferrer" className="px-6 py-3.5 bg-[#FF4500] hover:bg-[#e03d00] text-white rounded-xl font-bold uppercase tracking-wide transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.249 0 .688.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-2.465 3.928a.373.373 0 0 0-.279-.13.371.371 0 0 0-.281.133c-.092.11-.275.34-.693.34-.403 0-.583-.217-.677-.333a.372.372 0 0 0-.281-.132.373.373 0 0 0-.279.131.373.373 0 0 0-.022.502c.28.375.726.568 1.259.568.537 0 .983-.195 1.264-.57a.374.374 0 0 0-.01-.509z"/></svg>
                        {t('Reddit')}
                     </a>
                  </div>
               </div>

               {/* Right Side: Background/Banner Image */}
               <div className="lg:w-1/2 relative flex items-center justify-center p-6 lg:p-12 order-first lg:order-last min-h-[300px] lg:min-h-[450px]">
                  <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/20 blur-[120px] rounded-full w-[300px] h-[300px] mx-auto"></div>
                  <img src="/images/banner 02.png" alt="Community Banner" className="relative z-10 w-full h-auto max-h-[400px] lg:max-h-[600px] object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-1000" />
               </div>
            </div>
          </div>
        </section>

        {/* Section Header: Title and Subtitle for game, hypervisor, steamtools, tools, savegame */}
        <section id="secretarea-library" className="scroll-mt-24" dir={dir}>
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary-500/10 text-primary-500 border border-primary-500/20">
                  {t('SecretArea Library')}
                </span>
                <span className="text-xs text-slate-400 font-bold select-none">/</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  {activeTab === 'hypervisor' ? t('Game Hypervisor') :
                   activeTab === 'architect' ? t('Tools & Software') :
                   activeTab === 'extra' ? t('SaveGame Archives') :
                   activeTab === 'steamtools' ? t('SteamTools') :
                   t('PC Games')}
                </span>
              </div>
              <h2 
                className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight" 
                style={{ fontFamily: dir === 'rtl' ? "'Cairo', 'Amiri', sans-serif" : "'Oswald', sans-serif" }}
              >
                {activeTab === 'game' ? t('PC Games') :
                 activeTab === 'hypervisor' ? t('Game Hypervisor') :
                 activeTab === 'steamtools' ? t('SteamTools') :
                 activeTab === 'architect' ? t('Tools & Software') :
                 t('SaveGame Archives')}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium mt-1 leading-relaxed max-w-3xl">
                {activeTab === 'game' ? t('Explore verified PC games, repacks, and direct download channels.') :
                 activeTab === 'hypervisor' ? t('Virtualization platforms, emulators, and system runtimes.') :
                 activeTab === 'steamtools' ? t('Steam utility items, manifests, and library management tools.') :
                 activeTab === 'architect' ? t('Architecture, graphic design, and productivity software tools.') :
                 t('Completed game saves, progression unlocks, and backup archives.')}
              </p>
            </div>
          </div>
        </div>

        <div className="sticky top-16 sm:top-20 z-40 mb-8 sm:mb-10">
           <div className="bg-white/80 dark:bg-slate-900/80 md:backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-2 sm:p-2.5 rounded-2xl shadow-2xl transition-all">
              <div className="flex flex-col gap-2.5 sm:gap-3 items-stretch justify-between">
                  <div className="flex flex-row gap-2 sm:gap-3 items-center justify-between w-full min-w-0">
                      <div className="flex overflow-x-auto no-scrollbar p-1 bg-slate-100 dark:bg-slate-950 rounded-xl flex-1 gap-1">
                        {(['game', 'hypervisor', 'steamtools', 'architect', 'extra'] as const).map(tab => (
                          <button 
                              key={tab}
                              onClick={() => setActiveTab(tab as any)}
                              className={`shrink-0 relative px-3 py-2 sm:px-5 md:px-7 sm:py-2.5 md:py-3 rounded-lg font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all z-10 flex items-center justify-center ${activeTab === tab ? 'text-black dark:text-white' : 'text-slate-700 dark:text-slate-400 hover:text-black dark:hover:text-white'}`}
                          >
                            {activeTab === tab && (
                              <motion.div layoutId="activeTab" className="absolute inset-0 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                            )}
                            <span className="relative z-10 flex items-center gap-1.5">
                              {tab === 'hypervisor' ? (
                                <>
                                  <span>{t('GAME')}</span>
                                  <span className="bg-red-600 text-white px-1.5 py-0.5 rounded-md text-[8px] sm:text-[9px] font-black tracking-widest shadow-sm">
                                    {t('HYPERVISOR')}
                                  </span>
                                </>
                              ) : tab === 'architect' ? (
                                t('TOOLS')
                              ) : tab === 'extra' ? (
                                t('SAVEGAME')
                              ) : tab === 'steamtools' ? (
                                t('STEAMTOOLS')
                              ) : t('GAME')}
                            </span>
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                          <button 
                            onClick={() => fetchData()}
                            className="flex items-center justify-center p-2.5 sm:p-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-xl transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                            title={t('Reload Data') || 'Reload Data'}
                            aria-label={t('Reload Data') || 'Reload Data'}
                          >
                            <Icon name="RefreshCw" size={18} className={loading ? "animate-spin" : ""} />
                          </button>
                      </div>
                  </div>

                  <div className="relative w-full group">
                    <div className="absolute start-3.5 sm:start-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 group-focus-within:text-primary-500 transition-colors pointer-events-none">
                      <Icon name="Search" size={18} />
                    </div>
                    <input 
                      type="text" 
                      value={searchQuery} 
                      onChange={e => setSearchQuery(e.target.value)} 
                      placeholder={
                        activeTab === 'game' ? `${t('SEARCH')} ${t('GAME')}...` :
                        activeTab === 'hypervisor' ? `${t('SEARCH')} ${t('HYPERVISOR')}...` :
                        activeTab === 'steamtools' ? `${t('SEARCH')} ${t('STEAMTOOLS')}...` :
                        activeTab === 'architect' ? `${t('SEARCH')} ${t('TOOLS')}...` :
                        `${t('SEARCH')} ${t('SAVEGAME')}...`
                      } 
                      className="w-full ps-11 sm:ps-12 pe-4 py-2.5 sm:py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all truncate"
                    />
                  </div>
              </div>
           </div>
        </div>

        <div className="min-h-[50vh]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[50vh] text-slate-900 dark:text-slate-300">
               <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-800 border-t-primary-500 rounded-full animate-spin mb-6"></div>
               <p className="font-mono text-xs uppercase tracking-[0.2em] animate-pulse">{t('Decrypting Data Stream...')}</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[50vh] text-slate-900 dark:text-slate-300">
               <div className="p-6 bg-white dark:bg-slate-900 rounded-full mb-6 shadow-sm">
                 <Icon name="Database" size={40} className="opacity-20" />
               </div>
               <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight mb-1">{t('No Data Found')}</h3>
               <p className="text-slate-900 dark:text-slate-300 text-xs mb-6">{t('Try adjusting your search or category.')}</p>
               <button 
                 onClick={() => {
                    navigate('/settings', { state: { tab: 'Request Item', requestTitle: searchQuery } });
                 }}
                 className="px-6 py-2.5 bg-blue-600 text-white font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
               >
                 {t('Request This Item')}
               </button>
            </div>
          ) : (
            <div className="space-y-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedData.map((item, idx) => {
                      const compStatus = globalSpecs.isActive ? checkCompatibilityStatus({...globalSpecs, cpuTier: getCpuTier(globalSpecs.cpuModel), gpuTier: getGpuTier(globalSpecs.gpuModel)}, item.systemReqs) : null;
                      const isFail = compStatus === 'fail';
                      const resolvedDev = getResolvedDeveloper(item);
                      
                      return (
                      <motion.div 
                          layout
                          key={`${item.id}-${idx}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          whileHover={{ y: -8, transition: { duration: 0.2 } }}
                          className={`group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-primary-900/10 hover:border-primary-500/30 transition-all relative flex flex-col ${isFail ? 'opacity-70 grayscale hover:grayscale-0 hover:opacity-100 shadow-[0_4px_30px_rgba(0,0,0,0.8)]' : ''}`}
                          onClick={() => {
                              if (item.category === 'profil') {
                                  handleCompanyClick(resolvedDev || item.name);
                              } else {
                                  setSelectedResource(item);
                              }
                          }}
                      >
                          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent group-hover:animate-[shimmer_1.5s_infinite] z-40 pointer-events-none"></div>
                          <div className="aspect-[3/4] relative overflow-hidden bg-slate-100 dark:bg-slate-950">
                            <img src={item.coverImage} alt={item.name} className="w-full h-full object-cover transition-opacity duration-300 opacity-90 group-hover:opacity-100"  loading="lazy" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-90"></div>
                            
                            {/* Top Left Badges */}
                            <div className="absolute top-3 start-3 flex flex-col gap-2 z-30 items-start">
                                <div className="flex items-center gap-2">
                                    <div className="px-2 py-1 bg-primary-600 text-white rounded-md text-[10px] font-black uppercase tracking-wider shadow-lg transition-all flex items-center gap-1">
                                      <span>{item.id}</span>
                                      {popularRepackIds.map(id => String(id).toLowerCase()).includes(String(item.id).toLowerCase()) && (
                                          <Icon name="Star" size={10} className="text-yellow-400 fill-yellow-400" />
                                      )}
                                    </div>
                                    {item.isPinned && (
                                        <div className="bg-yellow-500 text-white p-1.5 rounded-lg shadow-lg border border-white/20">
                                            <Icon name="Pin" size={16} />
                                        </div>
                                    )}
                                </div>
                                                                                                {item.isFree && (
                                    <div className="px-2 py-1 bg-emerald-500 text-white rounded-md text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1">
                                        <Icon name="Gift" size={12} /> Free
                                    </div>
                                )}
                                {item.category === 'hypervisor' && (
                                    <div className="bg-red-600 text-white px-2 py-1 rounded-lg shadow-lg border border-red-400/30 text-[10px] font-black tracking-widest">
                                        HV
                                    </div>
                                )}
                            </div>

                            {/* Top Right Badges */}
                            <div className="absolute top-3 end-3 flex flex-col gap-2 z-30 items-end">
                                {compStatus && compStatus !== 'unknown' && (
                                    <div className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1 border transition-all ${
                                        compStatus === 'pass' ? 'bg-emerald-500 text-white border-emerald-400 shadow-emerald-950/40' : 
                                        compStatus === 'warn' ? 'bg-amber-500 text-white border-amber-300 shadow-amber-950/40' : 
                                        'bg-rose-600 text-white border-rose-400 shadow-rose-950/40'
                                    }`}>
                                        <Icon name={compStatus === 'pass' ? 'CheckCircle' : compStatus === 'warn' ? 'AlertTriangle' : 'X'} size={12} />
                                        <span>{compStatus === 'pass' ? (t('Runs Great') || 'Runs Great') : compStatus === 'warn' ? (t('Might Struggle') || 'Might Struggle') : (t("Won't Run") || "Won't Run")}</span>
                                    </div>
                                )}
                                {item.category === 'steamtools' ? (
                                    item.gameId && (
                                        <div className="px-2 py-1 bg-black/60 md:backdrop-blur-md rounded-md border border-white/10 text-[10px] font-mono font-bold text-white shadow-sm">
                                            ID: {item.gameId}
                                        </div>
                                    )
                                ) : (
                                    <div className="px-2 py-1 bg-white/90 dark:bg-black/60 md:backdrop-blur-md rounded-md border border-slate-200 dark:border-white/10 text-[10px] font-mono font-bold text-primary-600 dark:text-primary-400">
                                        {item.repackSize}
                                    </div>
                                )}
                            </div>
                            {item.category === 'game' && ((item.links?.ankerParts && item.links.ankerParts.length > 0) || (item.links?.preInstalled?.download || item.links?.preInstalled?.cloudDrop || item.links?.preInstalled?.torrent)) && (
                                <div className="absolute top-2 start-1/2 -translate-x-1/2 px-2 py-1 bg-indigo-600/90 dark:bg-indigo-900/80 backdrop-blur-md border border-indigo-500/30 shadow-lg text-white rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest flex items-center gap-1 z-30 pointer-events-none whitespace-nowrap">
                                <Icon name="Zap" size={10} className="text-amber-400" /> <span>{t('Pre-installed')}</span>
                            </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
                               <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(14,165,233,0.5)] transform scale-50 group-hover:scale-100 transition-transform duration-300">
                                  <Icon name="ArrowRight" size={24} className="rtl:rotate-180" />
                               </div>
                            </div>
                            
                            <div className="absolute bottom-0 start-0 end-0 p-5 z-20">
                                {resolvedDev && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleCompanyClick(resolvedDev);
                                        }}
                                        className="mb-2 flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-black/60 md:backdrop-blur-sm text-violet-300 border border-violet-500/30 hover:bg-violet-900/60 transition-colors w-max"
                                    >
                                        <Icon name="Briefcase" size={10} />
                                        {resolvedDev}
                                    </button>
                                )}
                                <h3 className="font-black text-lg text-white leading-tight uppercase italic mb-2 line-clamp-2 group-hover:text-primary-400 transition-colors drop-shadow-md">
                                  {item.name}
                                </h3>
                                <div className="flex items-center justify-between border-t border-white/20 pt-3 mt-1">
                                  <span className="text-[10px] text-slate-200 font-mono font-bold bg-black/40 md:backdrop-blur-sm px-2 py-0.5 rounded border border-white/10">
                                    {item.category === 'steamtools' ? item.category.toUpperCase() : item.version}
                                  </span>
                                  <div className="flex items-center gap-3">
                                      <div className="flex items-center gap-1 text-[10px] text-slate-200 font-mono font-bold bg-black/40 md:backdrop-blur-sm px-2 py-0.5 rounded border border-white/10">
                                          <Icon name="Download" size={10} /> {getFakeDownloads(item.id)}
                                      </div>
                                      <button
                                          onClick={(e) => toggleStash(item.id, e)}
                                          className={`p-1.5 rounded-md md:backdrop-blur-md transition-all ${
                                              stash.includes(item.id) 
                                              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' 
                                              : 'bg-black/40 text-white/70 hover:bg-black/60 hover:text-white border border-white/10'
                                          }`}
                                          title={stash.includes(item.id) ? t('Remove from Favorites') : t('Add to Favorites')}
                                      >
                                          <Icon name="Bookmark" size={12} className={stash.includes(item.id) ? "fill-current" : ""} />
                                      </button>
                                      <span className="text-[10px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1 drop-shadow-sm">
                                         {t('Details')} <Icon name="ChevronRight" size={12} className="rtl:rotate-180" />
                                      </span>
                                  </div>
                                </div>
                            </div>
                          </div>
                      </motion.div>
                      );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex flex-col items-center gap-6 py-10 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 sm:gap-4 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-full overflow-x-auto no-scrollbar">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-2 sm:p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 transition-all hover:bg-slate-200 dark:hover:bg-slate-700 shrink-0"
                    >
                      <Icon name="ChevronLeft" size={20} className="rtl:rotate-180" />
                    </button>
                    
                    <div className="flex gap-1 sm:gap-2">
                      {(() => {
                          let pages = [];
                          if (totalPages <= 5) {
                             pages = Array.from({ length: totalPages }, (_, i) => i + 1);
                          } else {
                             if (currentPage <= 3) pages = [1, 2, 3, '...', totalPages];
                             else if (currentPage >= totalPages - 2) pages = [1, '...', totalPages - 2, totalPages - 1, totalPages];
                             else pages = [1, '...', currentPage, '...', totalPages];
                          }
                          
                          return pages.map((page, idx) => (
                            typeof page === 'number' ? (
                                <button
                                  key={idx}
                                  onClick={() => setCurrentPage(page)}
                                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl font-bold text-[10px] sm:text-xs transition-all shrink-0 ${currentPage === page ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/50' : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
                                >
                                  {page}
                                </button>
                            ) : (
                                <span key={idx} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-slate-600 dark:text-slate-300 text-xs font-bold select-none shrink-0">...</span>
                            )
                          ));
                      })()}
                    </div>

                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 sm:p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 transition-all hover:bg-slate-200 dark:hover:bg-slate-700 shrink-0"
                    >
                      <Icon name="ChevronRight" size={20} className="rtl:rotate-180" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        </section>

        
        {['game', 'hypervisor', 'steamtools'].includes(activeTab) && allResources.hypervisor?.length > 0 && (
            <GameOfTheDaySection 
                game={allResources.hypervisor[0]}
                onSelect={setSelectedResource}
            />
        )}
        {['game', 'hypervisor', 'steamtools'].includes(activeTab) && (
            <>
                <SupportUsBanner />
                <MostPopularRepacksSection 

                gameIds={popularRepackIds}
                allResources={allResources}
                onSelect={setSelectedResource}
            />
        </>
        )}
        <div className="mt-6 mb-4 w-full flex justify-center">
            <AdBanner 
                desktopSrc={AD_CONFIG.banner3.desktop} 
                mobileSrc={AD_CONFIG.banner3.mobile} 
                link={AD_CONFIG.banner3.link} 
            />
        </div>

        {['game', 'hypervisor', 'steamtools'].includes(activeTab) && (
            <>
                <BestStudiosCarousel 
                    profiles={companyProfiles}
                    onSelect={setSelectedCompanyProfile}
                    onSeeAll={() => setShowAllProfiles(true)}
                    categoryType="games"
                />
                <div className="mt-6 mb-6 w-full flex justify-center">
                    <AdBanner 
                        desktopSrc={AD_CONFIG.banner4.desktop} 
                        mobileSrc={AD_CONFIG.banner4.mobile} 
                        link={AD_CONFIG.banner4.link} 
                    />
                </div>
                <TopGamesSection games={topGames} />
                <div className="mt-16 mb-16 w-full flex justify-center">
                    <AdBanner 
                        desktopSrc={AD_CONFIG.banner5.desktop} 
                        mobileSrc={AD_CONFIG.banner5.mobile} 
                        link={AD_CONFIG.banner5.link} 
                    />
                </div>
            </>
        )}
        {['architect', 'extra'].includes(activeTab) && (
            <>
                <BestStudiosCarousel 
                    profiles={companyProfiles}
                    onSelect={setSelectedCompanyProfile}
                    onSeeAll={() => setShowAllProfiles(true)}
                    categoryType="tools"
                />
                <div className="mt-16 mb-16 w-full flex justify-center">
                    <AdBanner 
                        desktopSrc={AD_CONFIG.banner4.desktop} 
                        mobileSrc={AD_CONFIG.banner4.mobile} 
                        link={AD_CONFIG.banner4.link} 
                    />
                </div>
            </>
        )}

        
        {bestGameSeries && bestGameSeries.length > 0 && (
          <BestGameSeriesSection series={bestGameSeries} />
        )}
      </div>
      
      
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <AboutSecretAreaSection />
      </div>
      
      
      


      {/* Featured Genres Full Width Section */}
      <div id="featured-genres" className="w-full relative mt-2 mb-24">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
              <FeaturedGenres 
                  games={Object.values(allResources).flat()} 
                  onSelectGenre={(genre) => {
                      setSelectedGenreView(genre);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                  }} 
              />
          </div>
      </div>
      
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <FreeTimeTopStudiosSection 
              profiles={companyProfiles}
              onOpenAllStudios={() => setShowAllProfiles(true)}
          />
      </div>

      
      </motion.div>
      )}

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && !selectedResource && !selectedCompanyProfile && !showAllProfiles && !showDonateModal && !showSteamModal && !showMasterGiftModal && !showDisclaimer && !showIntelPanel && (
          <motion.button 
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-[85px] md:bottom-10 start-6 sm:start-10 z-[90] w-12 h-12 rounded-full bg-slate-900/50 dark:bg-slate-100/10 backdrop-blur-md border border-white/20 hover:bg-slate-900/70 dark:hover:bg-slate-100/20 text-white flex items-center justify-center shadow-xl transition-all hover:-translate-y-1"
          >
            <Icon name="ArrowUp" size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      <AllProfilesModal 
          isOpen={showAllProfiles}
          profiles={companyProfiles}
          onClose={() => setShowAllProfiles(false)}
          onSelect={(profile) => {
              setShowAllProfiles(false);
              setSelectedCompanyProfile(profile);
          }}
          categoryType={['game', 'hypervisor', 'steamtools'].includes(activeTab) ? 'games' : 'tools'}
      />
    </div>
  );
};

const AllProfilesModal: React.FC<{
    isOpen?: boolean,
    profiles: CompanyProfile[],
    onClose: () => void,
    onSelect: (profile: CompanyProfile) => void,
    categoryType: 'games' | 'tools'
}> = ({ isOpen = true, profiles, onClose, onSelect, categoryType }) => {
    const { dir, t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const PROFILES_PER_PAGE = 30;

    const filteredProfiles = useMemo(() => {
        return profiles
            .map(p => {
                let count = 0;
                if (categoryType === 'games') {
                    count = (p.gameIds?.length || 0) + (p.hypervisorIds?.length || 0) + (p.steamtoolsIds?.length || 0);
                } else {
                    count = (p.architectIds?.length || 0) + (p.extraIds?.length || 0);
                }
                return {
                    ...p,
                    totalGames: count
                };
            })
            .filter(p => p.totalGames > 0 && p.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .sort((a, b) => b.totalGames - a.totalGames);
    }, [profiles, categoryType, searchQuery]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const totalPages = Math.ceil(filteredProfiles.length / PROFILES_PER_PAGE);
    
    const paginatedProfiles = useMemo(() => {
        const start = (currentPage - 1) * PROFILES_PER_PAGE;
        return filteredProfiles.slice(start, start + PROFILES_PER_PAGE);
    }, [filteredProfiles, currentPage]);

    return createPortal(
        <AnimatePresence>
        {isOpen && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                dir={dir} className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 md:backdrop-blur-md p-0"
                onClick={onClose}
            >

            <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-slate-50 dark:bg-slate-950 w-full h-full max-w-none max-h-none rounded-none overflow-hidden shadow-2xl border-none flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 p-4 sm:p-6 border-b border-blue-200 dark:border-slate-800 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 shrink-0 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
                    <div className="relative z-10 flex items-center gap-3">
                        <Icon name="Briefcase" size={28} className="text-blue-500 dark:text-blue-400 sm:w-8 sm:h-8" /> 
                        <div>
                            <h3 className="text-lg sm:text-2xl font-black uppercase tracking-wider text-slate-900 dark:text-white">
                                {categoryType === 'games' ? t('All Studios') : t('All Companies')}
                            </h3>
                            <p className="text-blue-600 dark:text-blue-200 text-[10px] sm:text-sm font-bold mt-1">
                                {filteredProfiles.length} {t('Total Found')}
                            </p>
                        </div>
                    </div>

                    <div className="relative z-10 flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <div className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-300">
                              <Icon name="Search" size={16} />
                            </div>
                            <input 
                              type="text" 
                              value={searchQuery} 
                              onChange={e => setSearchQuery(e.target.value)} 
                              placeholder={t('SEARCH PROFILES...')} 
                              className="w-full ps-10 pe-4 py-2.5 bg-white/60 dark:bg-black/40 border border-slate-300 dark:border-slate-700/50 rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider placeholder:text-slate-700 dark:text-slate-500 transition-all"
                            />
                        </div>
                        <button onClick={onClose} className="p-2.5 bg-white/60 dark:bg-black/40 hover:bg-white dark:hover:bg-black/60 rounded-xl transition-colors text-slate-700 dark:text-white border border-slate-300 dark:border-slate-700/50 hover:border-slate-400 dark:hover:border-slate-500 shadow">
                            <Icon name="X" size={18} />
                        </button>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/50 dark:bg-slate-950/50">
                    {paginatedProfiles.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                            {paginatedProfiles.map((profile) => (
                                <div 
                                    key={profile.id}
                                    onClick={() => onSelect(profile as CompanyProfile)}
                                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center gap-4 cursor-pointer hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all h-full group/studio"
                                >
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-slate-50 dark:bg-slate-950 rounded-2xl flex items-center justify-center p-3 border border-slate-100 dark:border-slate-800 group-hover/studio:border-blue-500/30 group-hover/studio:bg-blue-50 dark:group-hover/studio:bg-blue-900/20 overflow-hidden shrink-0 transition-all shadow-inner">
                                        {profile.logoUrl ? (
                                            <img src={profile.logoUrl} alt={profile.name} className="w-full h-full object-contain filter group-hover/studio:brightness-110 transition-all" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = '<span class="font-black text-lg sm:text-xl text-slate-800 dark:text-slate-500 group-hover/studio:text-blue-500 dark:group-hover/studio:text-blue-400 transition-colors">' + profile.name.substring(0, 2).toUpperCase() + '</span>'; }} />
                                        ) : (
                                            <span className="font-black text-lg sm:text-xl text-slate-800 dark:text-slate-500 group-hover/studio:text-blue-500 dark:group-hover/studio:text-blue-400 transition-colors">{profile.name.substring(0, 2).toUpperCase()}</span>
                                        )}
                                    </div>
                                    <div className="text-center w-full">
                                        <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1 group-hover/studio:text-blue-500 dark:group-hover/studio:text-blue-400 transition-colors" title={profile.name}>{profile.name}</h3>
                                        <span className="inline-block mt-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 text-[9px] sm:text-[10px] font-black uppercase tracking-wider rounded border border-blue-200 dark:border-blue-500/30 group-hover/studio:shadow-sm">
                                            {profile.totalGames} {profile.totalGames === 1 ? t('Item') : t('Items')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                            <Icon name="Search" size={48} className="text-slate-800 dark:text-slate-600 mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('No Profiles Found')}</h3>
                            <p className="text-slate-600 dark:text-slate-300 text-sm">{t('Try adjusting your search criteria.')}</p>
                        </div>
                    )}
                </div>
                
                {totalPages > 1 && (
                    <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-center items-center shrink-0">
                        <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
                            >
                                <Icon name="ChevronLeft" size={16} className="rtl:rotate-180" />
                            </button>
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                                        currentPage === page 
                                        ? 'bg-blue-600 text-white shadow shadow-blue-500/20' 
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
                            >
                                <Icon name="ChevronRight" size={16} className="rtl:rotate-180" />
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        </motion.div>
        )}
        </AnimatePresence>,
        document.body
    );
};

export default SecretArea;
