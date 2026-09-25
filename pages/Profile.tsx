import React, { useEffect, useState } from 'react';
import { useLanguage } from '../src/contexts/LanguageContext';
import { useNavigate, Link } from 'react-router-dom';
import Icon from '../components/Icon';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TbTrash, 
  TbHeart, 
  TbBookmark, 
  TbDeviceGamepad2, 
  TbCpu, 
  TbActivity, 
  TbEye, 
  TbClock, 
  TbShieldCheck,
  TbSettings,
  TbSparkles,
  TbUser,
  TbFlame,
  TbBrandGoogle,
  TbLayoutDashboard,
  TbUsers,
  TbSearch,
  TbChevronDown,
  TbChevronUp,
  TbBan,
  TbUserOff,
  TbUserCheck,
  TbCheck,
  TbAlertTriangle,
  TbCrown,
  TbDiamond,
  TbSword,
  TbTarget,
  TbShield,
  TbTent,
  TbAward,
  TbBolt,
  TbTrophy,
  TbMap,
  TbStar,
  TbRadar
} from 'react-icons/tb';
import { FaAngleLeft, FaAngleRight, FaArrowLeft } from 'react-icons/fa6';
import { auth } from '../src/firebase';
import { ResourceDetailModal, ResourceItem } from './SecretArea';
import { 
  subscribeUserProfile, 
  UserProfileData, 
  DEFAULT_PROFILE, 
  recordGameInteraction, 
  removeGameFromLibrary, 
  updateGameLibraryStatus,
  updateUserProfileData,
  saveUserProfileInfo,
  clearGameHistory,
  saveUserStash,
  getLocalProfile,
  isUserAdmin,
  subscribeAllUsers,
  subscribeGlobalBanner,
  computeUserBadge,
  blockUser,
  unblockUser,
  removeUserAndBanIdentifiers,
  deleteUserAccount
} from '../src/services/userService';

const TABS = ['Overview', 'Liked', 'Library', 'Game history', 'Favorites', 'Live Movement'];
const LIBRARY_STATUSES = ['All', 'Playing', 'Plan to Play', 'Completed', 'On Hold', 'Dropped'];

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  'Playing': { bg: 'bg-emerald-500/15', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500', border: 'border-emerald-500/30' },
  'Plan to Play': { bg: 'bg-sky-500/15', text: 'text-sky-600 dark:text-sky-400', dot: 'bg-sky-500', border: 'border-sky-500/30' },
  'Completed': { bg: 'bg-purple-500/15', text: 'text-purple-600 dark:text-purple-400', dot: 'bg-purple-500', border: 'border-purple-500/30' },
  'On Hold': { bg: 'bg-amber-500/15', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500', border: 'border-amber-500/30' },
  'Dropped': { bg: 'bg-rose-500/15', text: 'text-rose-600 dark:text-rose-400', dot: 'bg-rose-500', border: 'border-rose-500/30' },
};

const ALL_BADGES = [
  { id: 'first_blood', name: 'First Blood', description: 'View your first 100 games', icon: <TbEye className="text-blue-500" />, condition: (data: UserProfileData) => (data.gamesViewed || 0) >= 100 },
  { id: 'explorer', name: 'Explorer', description: 'View 500 different games', icon: <TbMap className="text-emerald-500" />, condition: (data: UserProfileData) => (data.gamesViewed || 0) >= 500 },
  { id: 'enthusiast', name: 'Enthusiast', description: 'View 2,000 different games', icon: <TbFlame className="text-amber-500" />, condition: (data: UserProfileData) => (data.gamesViewed || 0) >= 2000 },
  { id: 'critic', name: 'Critic', description: 'Like 50 games', icon: <TbHeart className="text-rose-500" />, condition: (data: UserProfileData) => (data.contentLiked || 0) >= 50 },
  { id: 'fanboy', name: 'Fanboy', description: 'Like 250 games', icon: <TbStar className="text-yellow-500" />, condition: (data: UserProfileData) => (data.contentLiked || 0) >= 250 },
  { id: 'pup', name: 'Pup Wolf', description: 'Reach Pup Wolf rank (250 XP)', icon: <TbShield className="text-cyan-500" />, condition: (data: UserProfileData) => (data.points || 0) >= 250 },
  { id: 'hunter', name: 'Hunter Wolf', description: 'Reach Hunter Wolf rank (1,000 XP)', icon: <TbTarget className="text-emerald-500" />, condition: (data: UserProfileData) => (data.points || 0) >= 1000 },
  { id: 'lone_wolf', name: 'Lone Wolf', description: 'Reach Lone Wolf rank (5,000 XP)', icon: <TbSword className="text-purple-500" />, condition: (data: UserProfileData) => (data.points || 0) >= 5000 },
  { id: 'alpha', name: 'Alpha Wolf', description: 'Reach Alpha Wolf rank (20,000 XP)', icon: <TbDiamond className="text-amber-500" />, condition: (data: UserProfileData) => (data.points || 0) >= 20000 },
  { id: 'fenrir', name: 'Fenrir', description: 'Unlock the ultimate Fenrir rank (50,000 XP)', icon: <TbCrown className="text-rose-500" />, condition: (data: UserProfileData) => (data.points || 0) >= 50000 },
];

function formatTimeAgo(dateString?: string): string {
  if (!dateString) return 'recently';
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

const Profile: React.FC = () => {
    const { t, dir } = useLanguage();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Overview');
    const [libraryTab, setLibraryTab] = useState('All');
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [profileData, setProfileData] = useState<UserProfileData>(DEFAULT_PROFILE);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    
    // Pagination for Game history
    const [historyPage, setHistoryPage] = useState(1);
    const historyPerPage = 12;

    // Pagination for Live Movement
    const [movementPage, setMovementPage] = useState(1);
    const movementPerPage = 10;

    // Admin Users Directory state
    const [allUsers, setAllUsers] = useState<UserProfileData[]>([]);
    const [adminUserSearch, setAdminUserSearch] = useState('');
    const [usersPage, setUsersPage] = useState(1);
    const [expandedUserIds, setExpandedUserIds] = useState<Record<string, boolean>>({});
    const usersPerPage = 8;

    const toggleUserExpanded = (userId: string) => {
        setExpandedUserIds(prev => ({
            ...prev,
            [userId]: !prev[userId]
        }));
    };

    // Admin moderation action state
    const [actionLoadingUserId, setActionLoadingUserId] = useState<string | null>(null);
    const [actionFeedback, setActionFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [deleteModalUser, setDeleteModalUser] = useState<UserProfileData | null>(null);

    const handleBlockUser = async (targetUser: UserProfileData) => {
        if (!targetUser.uid) return;
        try {
            setActionLoadingUserId(targetUser.uid);
            const res = await blockUser(targetUser.uid, 'Restricted by administrator', 24);
            if (res.autoBlacklisted) {
                setActionFeedback({
                    text: `User ${targetUser.displayName || targetUser.email || targetUser.username} received block #3 and has been automatically blacklisted.`,
                    type: 'success'
                });
            } else {
                setActionFeedback({
                    text: `User ${targetUser.displayName || targetUser.email || targetUser.username} blocked (${res.blockCount}/3 blocks until permanent ban).`,
                    type: 'success'
                });
            }
            setTimeout(() => setActionFeedback(null), 4000);
        } catch (err: any) {
            console.error("Error blocking user:", err);
            setActionFeedback({
                text: `Failed to block user: ${err?.message || 'Permission denied'}`,
                type: 'error'
            });
            setTimeout(() => setActionFeedback(null), 4000);
        } finally {
            setActionLoadingUserId(null);
        }
    };

    const handleUnblockUser = async (targetUser: UserProfileData) => {
        if (!targetUser.uid) return;
        try {
            setActionLoadingUserId(targetUser.uid);
            await unblockUser(targetUser.uid);
            setActionFeedback({
                text: `User ${targetUser.displayName || targetUser.email || targetUser.username} has been unblocked.`,
                type: 'success'
            });
            setTimeout(() => setActionFeedback(null), 4000);
        } catch (err: any) {
            console.error("Error unblocking user:", err);
            setActionFeedback({
                text: `Failed to unblock user: ${err?.message || 'Permission denied'}`,
                type: 'error'
            });
            setTimeout(() => setActionFeedback(null), 4000);
        } finally {
            setActionLoadingUserId(null);
        }
    };

    const handleConfirmDeleteUser = async () => {
        if (!deleteModalUser?.uid) return;
        const uid = deleteModalUser.uid;
        const targetUser = deleteModalUser;
        const name = targetUser.displayName || targetUser.email || targetUser.username;
        try {
            setActionLoadingUserId(uid);
            setDeleteModalUser(null);
            await removeUserAndBanIdentifiers(targetUser, currentUser?.email || 'secretarea1337@gmail.com', 'Removed by Administrator');
            setAllUsers(prev => prev.filter(u => u.uid !== uid));
            setActionFeedback({
                text: `User ${name} was completely removed and identifiers banned.`,
                type: 'success'
            });
            setTimeout(() => setActionFeedback(null), 4000);
        } catch (err: any) {
            console.error("Error deleting user:", err);
            setActionFeedback({
                text: `Failed to remove user: ${err?.message || 'Permission denied'}`,
                type: 'error'
            });
            setTimeout(() => setActionFeedback(null), 4000);
        } finally {
            setActionLoadingUserId(null);
        }
    };

    const buildGamesMap = (flatItems: any[]) => {
        const map = new Map<string, any>();
        flatItems.forEach(item => {
            if (!item) return;
            const rawId = String(item.id || '').toLowerCase();
            if (rawId) {
                map.set(rawId, item);
                map.set(rawId.replace(/[-_]/g, ''), item);
                const match = rawId.match(/^([a-z]+)[-_]?(\d+)$/);
                if (match) {
                    map.set(`${match[1]}${match[2]}`, item);
                    map.set(`${match[1]}-${match[2]}`, item);
                    map.set(match[2], item);
                }
            }
            const numOnlyMatch = String(item.id || '').match(/\d+/);
            if (numOnlyMatch) {
                map.set(numOnlyMatch[0], item);
                map.set(`game-${numOnlyMatch[0]}`, item);
                map.set(`g${numOnlyMatch[0]}`, item);
                map.set(`g-${numOnlyMatch[0]}`, item);
            }
            const rawGameId = String(item.gameId || '').toLowerCase();
            if (rawGameId) {
                map.set(rawGameId, item);
                map.set(rawGameId.replace(/[-_]/g, ''), item);
            }
            const rawName = String(item.name || '').toLowerCase().trim();
            if (rawName) {
                map.set(rawName, item);
                map.set(rawName.replace(/[^a-z0-9]/g, ''), item);
            }
        });
        return map;
    };

    // Detail modal state
    const [selectedGame, setSelectedGame] = useState<ResourceItem | null>(null);
    const [allResources, setAllResources] = useState<Record<string, ResourceItem[]>>(() => {
        try {
            const raw = localStorage.getItem('cached_transformed_resources');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed.architect && !parsed.tools) parsed.tools = parsed.architect;
                if (parsed.extra && !parsed.savegame) parsed.savegame = parsed.extra;
                return parsed;
            }
        } catch (e) {}
        return { game: [], hypervisor: [], steamtools: [], architect: [], extra: [] };
    });

    const [cachedGamesMap, setCachedGamesMap] = useState<Map<string, any>>(() => {
        try {
            const raw = localStorage.getItem('cached_transformed_resources');
            if (raw) {
                const parsed = JSON.parse(raw);
                const flatItems = Object.values(parsed).flat() as any[];
                return buildGamesMap(flatItems);
            }
        } catch (e) {}
        return new Map();
    });

    const [stash, setStash] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem('stash');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const [librarySearch, setLibrarySearch] = useState('');

    const toggleStash = (id: string, e?: React.MouseEvent, itemObj?: ResourceItem) => {
        if (e) e.stopPropagation();
        const activeUid = currentUser?.uid || (isUnlocked ? 'guest' : null);
        const isAdding = !stash.some(s => s.toLowerCase() === id.toLowerCase());
        const next = isAdding ? [...stash.filter(x => x.toLowerCase() !== id.toLowerCase()), id] : stash.filter(x => x.toLowerCase() !== id.toLowerCase());
        setStash(next);
        try {
            localStorage.setItem('stash', JSON.stringify(next));
            localStorage.setItem('myStash', JSON.stringify(next));
        } catch {}
        if (activeUid) {
            saveUserStash(activeUid, next);
            const targetItem = itemObj || resolveGameInfo(id);
            recordGameInteraction(activeUid, targetItem, isAdding ? 'favorite' : 'unfavorite');
        }
    };

    useEffect(() => {
        const loadResources = async () => {
            try {
                const transformedRaw = localStorage.getItem('cached_transformed_resources');
                if (transformedRaw) {
                    const parsed = JSON.parse(transformedRaw);
                    if (parsed.architect && !parsed.tools) parsed.tools = parsed.architect;
                    if (parsed.extra && !parsed.savegame) parsed.savegame = parsed.extra;
                    setAllResources(parsed);
                    const flatItems = Object.values(parsed).flat() as any[];
                    setCachedGamesMap(buildGamesMap(flatItems));
                    return;
                }

                let rawData: any = null;
                const cachedRaw = localStorage.getItem('cached_secret_resources');
                if (cachedRaw) {
                    try { rawData = JSON.parse(cachedRaw); } catch (e) {}
                }
                if (!rawData) {
                    const res = await fetch('https://script.google.com/macros/s/AKfycbx7nzBZc_tIhbAUK5OvOzgifGVzaVorzjn5OXNe8ENC0p7Pjia7O-u4WggxjRZipt4v/exec', {
                        method: 'GET',
                        cache: 'no-store'
                    });
                    if (res.ok) {
                        rawData = await res.json();
                        localStorage.setItem('cached_secret_resources', JSON.stringify(rawData));
                    }
                }
                if (rawData) {
                    const transformed: Record<string, ResourceItem[]> = { game: [], hypervisor: [], steamtools: [], architect: [], extra: [] };
                    Object.keys(rawData).forEach(tabKey => {
                        const normalizedKey = tabKey.toLowerCase();
                        let targetKey = '';
                        if (normalizedKey.includes('hypervisor')) targetKey = 'hypervisor';
                        else if (normalizedKey.includes('game') && !normalizedKey.includes('savegame')) targetKey = 'game';
                        else if (normalizedKey.includes('steamtools')) targetKey = 'steamtools';
                        else if (normalizedKey.includes('architect') || normalizedKey.includes('tool')) targetKey = 'architect';
                        else if (normalizedKey.includes('extra') || normalizedKey.includes('savegame')) targetKey = 'extra';

                        if (targetKey && Array.isArray(rawData[tabKey])) {
                            const idPrefix = targetKey === 'game' ? 'G' :
                                             targetKey === 'hypervisor' ? 'H' :
                                             targetKey === 'steamtools' ? 'S' :
                                             targetKey === 'architect' ? 'A' : 'E';
                            const newItems = rawData[tabKey].map((row: any, idx: number) => {
                                const getVal = (key: string) => {
                                    const normalizedSearchKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
                                    const foundKey = Object.keys(row).find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedSearchKey);
                                    return foundKey ? row[foundKey] : '';
                                };
                                const rawRowId = getVal('id');
                                const idVal = rawRowId ? (String(rawRowId).match(/^[A-Za-z]/) ? String(rawRowId) : `${idPrefix}${rawRowId}`) : `${idPrefix}${idx + 1}`;
                                const nameVal = getVal('name') || getVal('title') || 'Item';
                                const coverVal = getVal('coverimage') || getVal('image') || getVal('img') || '';
                                return {
                                    id: String(idVal),
                                    category: targetKey,
                                    name: nameVal,
                                    version: getVal('version') || '1.0',
                                    repackSize: getVal('repacksize') || getVal('size') || '',
                                    originalSize: getVal('originalsize') || '',
                                    genres: getVal('genres') || getVal('category') || '',
                                    languages: getVal('languages') || 'ENG',
                                    repackBy: getVal('repackby') || '',
                                    coverImage: coverVal,
                                    galleryImages: (getVal('galleryimages') || '').toString().split(/[,\n\|]/).map((s: string) => s.trim()).filter(Boolean),
                                    description: getVal('description') || '',
                                    gameId: getVal('gameid') || '',
                                    developer: getVal('developer') || '',
                                    isFree: true,
                                    links: {
                                        parts: [],
                                        mirrors: [],
                                        ankerParts: [],
                                        full: getVal('link') || getVal('downloadlink') || undefined
                                    }
                                };
                            });
                            transformed[targetKey] = [...transformed[targetKey], ...newItems];
                        }
                    });
                    transformed.tools = transformed.architect;
                    transformed.savegame = transformed.extra;
                    setAllResources(transformed);
                    try {
                        localStorage.setItem('cached_transformed_resources', JSON.stringify(transformed));
                    } catch (err) {}
                    const flatItems = Object.values(transformed).flat() as any[];
                    setCachedGamesMap(buildGamesMap(flatItems));
                }
            } catch (e) {
                console.warn("Could not parse or load resources for profile:", e);
            }
        };

        loadResources();
    }, []);

    const isUnlocked = localStorage.getItem('secret_area_unlocked') === 'true' || localStorage.getItem('nexa_guest_mode') === 'true';

    useEffect(() => {
        let unsubscribeProfile: (() => void) | null = null;

        const unsubscribeAuth = auth.onAuthStateChanged((user) => {
            if (unsubscribeProfile) {
                unsubscribeProfile();
                unsubscribeProfile = null;
            }
            setCurrentUser(user);
            if (user) {
                // Subscribe to real-time updates from Firestore
                unsubscribeProfile = subscribeUserProfile(
                    user.uid, 
                    (data) => {
                        setProfileData(data);
                        if (data.stash && Array.isArray(data.stash)) {
                            setStash(data.stash);
                        }
                        setIsLoadingProfile(false);
                    },
                    user
                );
            } else {
                // Guests and unauthenticated users cannot access profile - redirect to home and prompt login
                setIsLoadingProfile(false);
                navigate('/', { replace: true });
                window.dispatchEvent(new CustomEvent('open-login-modal'));
            }
        });

        return () => {
            if (unsubscribeProfile) {
                unsubscribeProfile();
                unsubscribeProfile = null;
            }
            unsubscribeAuth();
        };
    }, [isUnlocked, navigate]);

    // Listen for local profile sync updates from modals / interactions
    useEffect(() => {
        const handleProfileSync = (e: any) => {
            const uid = currentUser?.uid;
            if (uid) {
                if (e.detail?.uid === uid && e.detail?.profile) {
                    setProfileData(e.detail.profile);
                    if (e.detail.profile.stash && Array.isArray(e.detail.profile.stash)) {
                        setStash(e.detail.profile.stash);
                    }
                } else {
                    const updated = getLocalProfile(uid);
                    if (updated) {
                        setProfileData(prev => ({ ...prev, ...updated }));
                        if (updated.stash && Array.isArray(updated.stash)) {
                            setStash(updated.stash);
                        }
                    }
                }
            }
        };
        window.addEventListener('secretarea_profile_sync', handleProfileSync);
        return () => window.removeEventListener('secretarea_profile_sync', handleProfileSync);
    }, [currentUser]);

    const isAdmin = isUserAdmin(currentUser?.email || profileData.email, profileData.role);

    // Synchronize global banner in real-time
    useEffect(() => {
        const unsubBanner = subscribeGlobalBanner((url) => {
            if (url) {
                setProfileData(prev => ({ ...prev, bannerURL: url }));
            }
        });
        return () => unsubBanner();
    }, []);

    // Subscribe all users directory for admin
    useEffect(() => {
        if (isAdmin) {
            const unsubUsers = subscribeAllUsers((list) => {
                setAllUsers(list);
            });
            return () => unsubUsers();
        }
    }, [isAdmin]);

    // Auto-sanitize mock 9,999 in profile data to real-time history count
    useEffect(() => {
        const uid = currentUser?.uid;
        if (uid && (profileData.gamesViewed === 9999 || profileData.gamesViewed === 99999)) {
            const historyItems = (profileData.gameHistory && profileData.gameHistory.length > 0)
                ? profileData.gameHistory
                : (profileData.recentGames || []);
            updateUserProfileData(uid, { gamesViewed: historyItems.length });
        }
    }, [currentUser?.uid, profileData.gamesViewed, profileData.gameHistory, profileData.recentGames]);

    if (!currentUser) {
        if (isLoadingProfile) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-white">
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="w-10 h-10 border-4 border-slate-300 dark:border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                </div>
            );
        }
        return (
            <div dir={dir} className="min-h-[70vh] flex items-center justify-center px-4 py-16">
                <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-[#111623] border border-slate-200 dark:border-slate-800 text-center shadow-xl">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                        <Icon name="Lock" size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{t('Gmail Login Required') || 'Login Required'}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                        {t('You must be signed in with a Google / Gmail account to access your Profile and Settings.') || 'You must be signed in with a Google / Gmail account to access your Profile and Settings.'}
                    </p>
                    <button
                        type="button"
                        onClick={() => window.dispatchEvent(new CustomEvent('open-login-modal'))}
                        className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                        <Icon name="LogIn" size={18} />
                        <span>{t('Sign in with Google / Gmail') || 'Sign in with Google'}</span>
                    </button>
                    <div className="mt-4">
                        <Link to="/" className="text-xs text-slate-500 dark:text-slate-400 hover:underline">
                            &larr; {t('Back to Home') || 'Back to Home'}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const earnedBadges = isAdmin ? ALL_BADGES : ALL_BADGES.filter(b => b.condition(profileData));
    const liked = (profileData.liked && profileData.liked.length > 0) ? profileData.liked : (profileData.likedGames || []);
    const library = (profileData.library && profileData.library.length > 0) ? profileData.library : (profileData.libraryGames || []);
    const history = (profileData.gameHistory && profileData.gameHistory.length > 0) ? profileData.gameHistory : (profileData.recentGames || []);
    const favorites = (profileData.favorites && profileData.favorites.length > 0) 
        ? profileData.favorites 
        : (profileData.favoriteGames && profileData.favoriteGames.length > 0)
            ? profileData.favoriteGames
            : (profileData.stash && profileData.stash.length > 0)
                ? profileData.stash
                : stash;
    const activities = profileData.activities || [];
    const libraryFiltered = library.filter((g: any) => {
        const matchesStatus = libraryTab === 'All' || g.status === libraryTab;
        if (!matchesStatus) return false;
        if (!librarySearch.trim()) return true;
        const q = librarySearch.toLowerCase().trim();
        return (g.name && g.name.toLowerCase().includes(q)) || (g.category && g.category.toLowerCase().includes(q));
    });
    const tabsToRender = [
        'Overview', 
        'Liked', 
        'Library', 
        'Game history', 
        'Favorites', 
        'Live Movement',
        ...(isAdmin ? ['Users Directory'] : [])
    ];

    // Filtered users & pagination for admin
    const filteredUsers = allUsers.filter(u => {
        if (!adminUserSearch.trim()) return true;
        const q = adminUserSearch.toLowerCase().trim();
        return (
            (u.email && u.email.toLowerCase().includes(q)) ||
            (u.displayName && u.displayName.toLowerCase().includes(q)) ||
            (u.username && u.username.toLowerCase().includes(q)) ||
            (u.badge && u.badge.toLowerCase().includes(q)) ||
            (u.role && u.role.toLowerCase().includes(q))
        );
    });
    const totalUsersPages = Math.ceil(filteredUsers.length / usersPerPage) || 1;
    const idxLastUser = usersPage * usersPerPage;
    const idxFirstUser = idxLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(idxFirstUser, idxLastUser);

    // Live Movement Pagination
    const totalMovementPages = Math.ceil(activities.length / movementPerPage) || 1;
    const idxLastMovement = movementPage * movementPerPage;
    const idxFirstMovement = idxLastMovement - movementPerPage;
    const currentMovements = activities.slice(idxFirstMovement, idxLastMovement);

    // Recent Activity (last 24 hours, max 4)
    const recentActivity = history
        .filter((g: any) => (Date.now() - new Date(g.timestamp || 0).getTime()) < 24 * 60 * 60 * 1000)
        .slice(0, 4);

    // History Pagination
    const idxLastHistory = historyPage * historyPerPage;
    const idxFirstHistory = idxLastHistory - historyPerPage;
    const currentHistory = history.slice(idxFirstHistory, idxLastHistory);
    const totalHistoryPages = Math.ceil(history.length / historyPerPage);

    // Rank Calculation & Real-time Stats
    const points = isAdmin ? 50000 : (profileData.points || 0);
    const rawGamesViewed = profileData.gamesViewed || 0;
    // Realtime data: eliminate mock 9,999 or 99,999
    const gamesViewed = (rawGamesViewed === 9999 || rawGamesViewed === 99999) 
        ? history.length 
        : (rawGamesViewed || history.length);
    const contentLiked = liked.length || profileData.contentLiked || 0;
    
    const getRank = (xp: number) => {
        if (xp >= 50000) return { title: 'Fenrir', icon: TbCrown, tier: 6, next: 'MAX', progress: 100, color: 'text-rose-400 border-rose-500/40 bg-rose-500/10', bar: 'from-rose-500 to-pink-500' };
        if (xp >= 20000) return { title: 'Alpha Wolf', icon: TbDiamond, tier: 5, next: '50,000 XP', progress: Math.min(100, Math.round((xp / 50000) * 100)), color: 'text-amber-400 border-amber-500/40 bg-amber-500/10', bar: 'from-amber-400 to-orange-500' };
        if (xp >= 5000) return { title: 'Lone Wolf', icon: TbSword, tier: 4, next: '20,000 XP', progress: Math.min(100, Math.round((xp / 20000) * 100)), color: 'text-purple-400 border-purple-500/40 bg-purple-500/10', bar: 'from-purple-500 to-indigo-500' };
        if (xp >= 1000) return { title: 'Hunter Wolf', icon: TbTarget, tier: 3, next: '5,000 XP', progress: Math.min(100, Math.round((xp / 5000) * 100)), color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10', bar: 'from-emerald-400 to-teal-500' };
        if (xp >= 250) return { title: 'Pup Wolf', icon: TbShield, tier: 2, next: '1,000 XP', progress: Math.min(100, Math.round((xp / 1000) * 100)), color: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10', bar: 'from-cyan-400 to-blue-500' };
        return { title: 'Novice Scout', icon: TbTent, tier: 1, next: '250 XP', progress: Math.min(100, Math.round((xp / 250) * 100)), color: 'text-slate-400 border-slate-500/40 bg-slate-500/10', bar: 'from-slate-400 to-slate-500' };
    };
    const currentRank = getRank(points);

    const activeUid = currentUser?.uid || (isUnlocked ? 'guest' : null);

    const handleUnlikeGame = async (e: React.MouseEvent, game: any) => {
        e.stopPropagation();
        if (activeUid) {
            const rawId = typeof game === 'string' ? game : (game?.id || game?.gameId || '');
            const rawName = typeof game === 'string' ? game : (game?.name || '');
            setProfileData(prev => ({
                ...prev,
                liked: (prev.liked || prev.likedGames || []).filter((g: any) => {
                    if (typeof g === 'string') return g.toLowerCase() !== rawId.toLowerCase();
                    return String(g.id || '').toLowerCase() !== rawId.toLowerCase() &&
                           String(g.gameId || '').toLowerCase() !== rawId.toLowerCase() &&
                           String(g.name || '').toLowerCase().trim() !== rawName.toLowerCase().trim();
                }),
                likedGames: (prev.likedGames || []).filter((g: any) => {
                    if (typeof g === 'string') return g.toLowerCase() !== rawId.toLowerCase();
                    return String(g.id || '').toLowerCase() !== rawId.toLowerCase() &&
                           String(g.gameId || '').toLowerCase() !== rawId.toLowerCase() &&
                           String(g.name || '').toLowerCase().trim() !== rawName.toLowerCase().trim();
                })
            }));
            await recordGameInteraction(activeUid, game, 'unlike');
        }
    };

    const handleUnfavoriteGame = async (e: React.MouseEvent, game: any) => {
        e.stopPropagation();
        if (activeUid) {
            const rawId = typeof game === 'string' ? game : (game?.id || game?.gameId || '');
            const rawName = typeof game === 'string' ? game : (game?.name || '');
            setStash(prev => prev.filter(s => s.toLowerCase() !== rawId.toLowerCase()));
            setProfileData(prev => ({
                ...prev,
                stash: (prev.stash || []).filter(s => s.toLowerCase() !== rawId.toLowerCase()),
                favorites: (prev.favorites || prev.favoriteGames || []).filter((g: any) => {
                    if (typeof g === 'string') return g.toLowerCase() !== rawId.toLowerCase();
                    return String(g.id || '').toLowerCase() !== rawId.toLowerCase() &&
                           String(g.gameId || '').toLowerCase() !== rawId.toLowerCase() &&
                           String(g.name || '').toLowerCase().trim() !== rawName.toLowerCase().trim();
                }),
                favoriteGames: (prev.favoriteGames || []).filter((g: any) => {
                    if (typeof g === 'string') return g.toLowerCase() !== rawId.toLowerCase();
                    return String(g.id || '').toLowerCase() !== rawId.toLowerCase() &&
                           String(g.gameId || '').toLowerCase() !== rawId.toLowerCase() &&
                           String(g.name || '').toLowerCase().trim() !== rawName.toLowerCase().trim();
                })
            }));
            await recordGameInteraction(activeUid, game, 'unfavorite');
        }
    };

    const handleRemoveFromLibrary = async (e: React.MouseEvent, gameId: any) => {
        e.stopPropagation();
        if (activeUid) {
            const targetId = typeof gameId === 'string' ? gameId : String(gameId?.id || gameId?.gameId || '');
            const rawName = typeof gameId === 'string' ? gameId : (gameId?.name || '');
            if (targetId) {
                setProfileData(prev => ({
                    ...prev,
                    library: (prev.library || prev.libraryGames || []).filter((g: any) => {
                        if (typeof g === 'string') return g.toLowerCase() !== targetId.toLowerCase();
                        return String(g.id || '').toLowerCase() !== targetId.toLowerCase() &&
                               String(g.gameId || '').toLowerCase() !== targetId.toLowerCase() &&
                               String(g.name || '').toLowerCase().trim() !== rawName.toLowerCase().trim();
                    }),
                    libraryGames: (prev.libraryGames || []).filter((g: any) => {
                        if (typeof g === 'string') return g.toLowerCase() !== targetId.toLowerCase();
                        return String(g.id || '').toLowerCase() !== targetId.toLowerCase() &&
                               String(g.gameId || '').toLowerCase() !== targetId.toLowerCase() &&
                               String(g.name || '').toLowerCase().trim() !== rawName.toLowerCase().trim();
                    })
                }));
                await removeGameFromLibrary(activeUid, targetId);
            }
        }
    };

    const handleUpdateLibraryStatus = async (gameId: string, newStatus: string) => {
        if (activeUid) {
            await updateGameLibraryStatus(activeUid, gameId, newStatus);
        }
    };

    const handleClearHistory = async () => {
        const uid = activeUid || currentUser?.uid;
        if (!uid) return;
        setProfileData(prev => ({
            ...prev,
            gameHistory: [],
            recentGames: [],
            gamesViewed: 0
        }));
        setHistoryPage(1);
        try {
            await clearGameHistory(uid);
        } catch (err) {
            console.warn('Error clearing game history:', err);
        }
    };

    const EmptyState = ({ message }: { message?: string }) => (
        <div className="flex flex-col justify-center items-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center text-slate-400 mb-4">
                <TbDeviceGamepad2 size={32} />
            </div>
            <p className="text-slate-500 dark:text-[#8892b0] text-[15px] font-medium">{message || t("No games in this list yet.")}</p>
            <button 
                onClick={() => navigate('/')}
                className="mt-4 px-4 py-2 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 text-xs font-semibold transition-colors"
            >
                {t("Explore Games in SecretArea")} &rarr;
            </button>
        </div>
    );

    const resolveGameInfo = (game: any): ResourceItem => {
        if (!game) {
            return {
                id: 'game-default',
                name: 'Game Details',
                category: 'game',
                coverImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
                description: 'Full game details and resources.',
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

        const isString = typeof game === 'string';
        const rawId = isString ? game : (game.id || game.gameId || '');
        const idKey = rawId ? String(rawId).toLowerCase() : '';
        const idNoDash = idKey ? idKey.replace(/[-_]/g, '') : '';
        const numMatch = idKey.match(/\d+/);
        const idNum = numMatch ? numMatch[0] : '';
        const gameIdKey = (!isString && game.gameId) ? String(game.gameId).toLowerCase() : '';
        const nameKey = (!isString && (game.name || game.title)) ? String(game.name || game.title).toLowerCase().trim() : (isString ? game.toLowerCase().trim() : '');
        const nameClean = nameKey ? nameKey.replace(/[^a-z0-9]/g, '') : '';

        let matched = (idKey && cachedGamesMap.get(idKey)) ||
                      (idNoDash && cachedGamesMap.get(idNoDash)) ||
                      (gameIdKey && cachedGamesMap.get(gameIdKey)) ||
                      (idNum && cachedGamesMap.get(idNum)) ||
                      (nameKey && cachedGamesMap.get(nameKey)) ||
                      (nameClean && cachedGamesMap.get(nameClean)) ||
                      null;

        if (!matched && (idKey || idNum || nameKey) && allResources) {
            for (const cat of Object.keys(allResources)) {
                if (Array.isArray(allResources[cat])) {
                    const found = allResources[cat].find((r: any) => {
                        if (!r) return false;
                        const rid = String(r.id || '').toLowerCase();
                        if (idKey && (rid === idKey || rid.replace(/[-_]/g, '') === idNoDash)) return true;
                        if (idNum && rid.match(/\d+/)?.[0] === idNum) return true;
                        const rName = String(r.name || '').toLowerCase().trim();
                        if (nameKey && (rName === nameKey || rName.replace(/[^a-z0-9]/g, '') === nameClean)) return true;
                        return false;
                    });
                    if (found) {
                        matched = found;
                        break;
                    }
                }
            }
        }

        const isIdLike = (str?: string) => {
            if (!str) return true;
            const trimmed = String(str).trim();
            if (trimmed === 'Game Details' || trimmed === 'Item' || trimmed === 'Secure Fragment' || trimmed === 'Game') return true;
            if (rawId && trimmed.toLowerCase() === String(rawId).toLowerCase()) return true;
            if (/^[A-Za-z]{0,4}[-_ ]?\d+$/i.test(trimmed)) return true;
            if (/^\d+$/.test(trimmed)) return true;
            return false;
        };

        const resolvedId = String(matched?.id || (!isString ? (game.id || game.gameId) : rawId) || ('game-' + (matched?.name || (!isString ? game.name : rawId) || 'item').replace(/\s+/g, '-')));
        const coverImage = (matched?.coverImage && !matched.coverImage.includes('unsplash.com')) 
            ? matched.coverImage 
            : ((!isString && game.coverImage && !game.coverImage.includes('unsplash.com')) 
                ? game.coverImage 
                : (matched?.coverImage || (!isString ? (game.coverImage || game.background_image || game.image) : '') || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80'));

        let name = '';
        if (matched?.name && !isIdLike(matched.name)) {
            name = matched.name;
        } else if (!isString && game.name && !isIdLike(game.name)) {
            name = game.name;
        } else if (!isString && game.title && !isIdLike(game.title)) {
            name = game.title;
        } else if (matched?.name) {
            name = matched.name;
        } else if (!isString && game.name && game.name !== 'Item') {
            name = game.name;
        } else {
            name = isIdLike(rawId) ? 'Game Details' : rawId;
        }

        const category = (matched?.category && matched.category !== 'game') 
            ? matched.category 
            : ((!isString && game.category) ? game.category : (matched?.category || 'game'));
        const gameIdVal = (!isString && game.gameId) ? game.gameId : (matched?.gameId || '');
        const toolsNeeded = (!isString && game.toolsNeeded) ? game.toolsNeeded : (matched?.toolsNeeded || []);

        const resolvedLinks = (matched?.links && (matched.links.full || matched.links.mirrors?.length || matched.links.parts?.length)) 
            ? matched.links 
            : ((!isString && game.links) ? game.links : (matched?.links || {
                parts: [],
                mirrors: [],
                ankerParts: [],
                full: (!isString ? game.downloadUrl : undefined),
                trailer: (!isString ? game.trailer : undefined)
            }));

        const resolvedItem: ResourceItem = {
            id: resolvedId,
            gameId: gameIdVal,
            toolsNeeded: toolsNeeded,
            name: name,
            category: category,
            coverImage: coverImage,
            description: (!isString && game.description) ? game.description : (matched?.description || 'Full game information and download package from SecretArea.'),
            version: (!isString && game.version) ? game.version : (matched?.version || 'v1.0'),
            repackSize: (!isString && game.repackSize) ? game.repackSize : (matched?.repackSize || 'N/A'),
            originalSize: (!isString && game.originalSize) ? game.originalSize : (matched?.originalSize || 'N/A'),
            genres: (!isString && game.genres) ? game.genres : (matched?.genres || matched?.category || 'Game'),
            languages: (!isString && game.languages) ? game.languages : (matched?.languages || 'ENG'),
            repackBy: (!isString && game.repackBy) ? game.repackBy : (matched?.repackBy || ''),
            galleryImages: (!isString && Array.isArray(game.galleryImages) && game.galleryImages.length > 0) ? game.galleryImages : (matched?.galleryImages || (coverImage ? [coverImage] : [])),
            developer: (!isString && game.developer) ? game.developer : (matched?.developer || ''),
            ratingPositive: (!isString && game.ratingPositive) ? game.ratingPositive : (matched?.ratingPositive || '95%'),
            ratingNegative: (!isString && game.ratingNegative) ? game.ratingNegative : (matched?.ratingNegative || '5%'),
            dateAdded: (!isString && game.dateAdded) ? game.dateAdded : (matched?.dateAdded || game.timestamp || ''),
            hasDenuvo: (!isString && game.hasDenuvo !== undefined) ? game.hasDenuvo : (matched?.hasDenuvo ?? false),
            hasExternalLauncher: (!isString && game.hasExternalLauncher !== undefined) ? game.hasExternalLauncher : (matched?.hasExternalLauncher ?? false),
            systemReqs: (!isString && game.systemReqs) ? game.systemReqs : (matched?.systemReqs || []),
            installSteps: (!isString && game.installSteps) ? game.installSteps : (matched?.installSteps || []),
            isFree: (!isString && game.isFree !== undefined) ? game.isFree : (matched?.isFree ?? true),
            links: resolvedLinks
        };

        if (!resolvedItem.links) {
            resolvedItem.links = { parts: [], mirrors: [], ankerParts: [] };
        }

        return resolvedItem;
    };

    const handleOpenGameDetail = (game: any) => {
        const resolved = resolveGameInfo(game);
        setSelectedGame(resolved);
        if (activeUid) {
            recordGameInteraction(activeUid, resolved, 'view').catch(() => {});
        }
    };

    const GameGrid = ({ 
        games, 
        onGameClick, 
        onRemove, 
        removeIcon,
        isLibrary = false,
        onUpdateStatus
    }: { 
        games: any[], 
        onGameClick: (g: any) => void, 
        onRemove?: (e: React.MouseEvent, g: any) => void,
        removeIcon?: React.ReactNode,
        isLibrary?: boolean,
        onUpdateStatus?: (gameId: string, newStatus: string) => void
    }) => {
        if (!games || games.length === 0) return null;
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {games.map((rawGame, i) => {
                    const resolved = resolveGameInfo(rawGame);
                    const statusCfg = rawGame.status ? STATUS_CONFIG[rawGame.status] : null;

                    return (
                        <div 
                            key={`${resolved.id || rawGame?.id || 'game'}-${i}`} 
                            onClick={() => onGameClick(resolved)} 
                            className="relative aspect-[3/4] rounded-xl overflow-hidden group cursor-pointer bg-white dark:bg-[#111623] border border-slate-200 dark:border-slate-800 hover:ring-2 hover:ring-[#29aaea] transition-all shadow-sm flex flex-col justify-end"
                        >
                            <img 
                                src={resolved.coverImage} 
                                alt={resolved.name} 
                                className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300" 
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80';
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10 pointer-events-none" />
                            
                            {/* Badges: Status / Category */}
                            <div className="absolute top-2.5 start-2.5 flex flex-col gap-1 z-10" onClick={e => isLibrary && e.stopPropagation()}>
                                {isLibrary && onUpdateStatus ? (
                                    <div className="relative group/status" title={t("Change status")}>
                                        <select
                                            value={rawGame.status || 'Plan to Play'}
                                            onChange={(e) => onUpdateStatus(rawGame.id, e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            className={`appearance-none text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 pe-4 rounded-md cursor-pointer backdrop-blur-md shadow border transition-colors ${
                                                statusCfg 
                                                    ? `${statusCfg.bg} ${statusCfg.text} ${statusCfg.border} bg-black/75` 
                                                    : 'bg-black/75 text-[#29aaea] border-[#29aaea]/30'
                                            }`}
                                        >
                                            {LIBRARY_STATUSES.filter(s => s !== 'All').map(s => (
                                                <option key={s} value={s} className="bg-slate-900 text-white text-xs">
                                                    {s}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute end-1 top-1/2 -translate-y-1/2 pointer-events-none text-[7px] text-white/80">
                                            ▼
                                        </div>
                                    </div>
                                ) : rawGame.status ? (
                                    <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm shadow flex items-center gap-1.5 ${
                                        statusCfg ? `${statusCfg.bg} ${statusCfg.text} border ${statusCfg.border} bg-black/60` : 'bg-[#29aaea]/90 text-white'
                                    }`}>
                                        {statusCfg && <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />}
                                        {rawGame.status}
                                    </div>
                                ) : (
                                    <div className="px-2 py-0.5 rounded-md bg-black/60 text-[#29aaea] text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm border border-[#29aaea]/30 shadow flex items-center gap-1">
                                        <span className="truncate max-w-[80px]">{resolved.category || 'Game'}</span>
                                    </div>
                                )}
                            </div>

                            {/* Top Actions: Remove */}
                            {onRemove && (
                                <div className="absolute top-2.5 end-2.5 flex items-center gap-1.5 z-10">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRemove(e, rawGame);
                                        }}
                                        title={t("Remove")}
                                        className="w-7 h-7 rounded-lg bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm shadow"
                                    >
                                        {removeIcon || <TbTrash size={14} />}
                                    </button>
                                </div>
                            )}

                            {/* Bottom Card Content: Title & Details Indicator */}
                            <div className="relative z-10 p-3 text-start">
                                <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2 drop-shadow-sm">{resolved.name}</h3>
                                <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                                    <span>
                                        {rawGame.timestamp ? formatTimeAgo(rawGame.timestamp) : (resolved.category || 'Game')}
                                    </span>
                                    <span className="text-[#29aaea] font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <TbEye size={12} />
                                        <span>{t("Details") || "Details"}</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const displayPhoto = profileData.photoURL || currentUser?.photoURL;
    const displayInitial = (profileData.displayName || currentUser?.displayName || 'W')[0].toUpperCase();
    const displayBanner = profileData.bannerURL || '/images/userprofile.png';

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] pt-24 pb-16 font-sans text-slate-900 dark:text-white transition-colors duration-200" dir={dir}>
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
                
                {/* Above Banner Action: "Back to Dashboard" and "Settings" */}
                <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                    <button 
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#111623] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-[#29aaea] dark:hover:text-[#29aaea] hover:border-[#29aaea]/40 text-xs sm:text-sm font-semibold transition-all shadow-sm"
                    >
                        <TbLayoutDashboard size={16} className="text-[#29aaea]" />
                        <span>{t("Back to Dashboard") || "Back to Dashboard"}</span>
                    </button>

                    <div className="flex items-center gap-2.5">
                        <button 
                            onClick={() => navigate('/settings')}
                            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#111623] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-[#29aaea] dark:hover:text-[#29aaea] hover:border-[#29aaea]/40 text-xs sm:text-sm font-semibold transition-all shadow-sm"
                        >
                            <TbSettings size={16} />
                            <span>{t("Settings") || "Settings"}</span>
                        </button>
                    </div>
                </div>

                {/* Banner - Full 1983 x 793 aspect ratio without hover zoom */}
                <div className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800/80 bg-[#0a0f1d]">
                    <div className="w-full aspect-[1983/793] relative overflow-hidden bg-[#0a0f1d]">
                        <img 
                            src={displayBanner} 
                            alt="User Profile Banner" 
                            className="w-full h-full object-cover select-none"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                if (!target.src.includes('public/images/userprofile.png')) {
                                    target.src = 'public/images/userprofile.png';
                                }
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />
                    </div>
                </div>
                
                {/* Profile Identity Card - Cleanly positioned below banner, NOT occluding banner artwork */}
                <div className="relative px-5 sm:px-8 pb-6 pt-4 bg-white dark:bg-[#0c111e] rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-xl -mt-8 sm:-mt-12 md:-mt-16 z-20 mx-2 sm:mx-4 mb-8">
                    {/* Account Suspended / Blacklisted Warning */}
                    {(profileData.isBlacklisted || profileData.isBlocked) && (
                        <div className="mb-4 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-600 dark:text-rose-400">
                            <TbBan size={22} className="shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-sm">
                                    {profileData.isBlacklisted ? t("Account Blacklisted") : t("Account Suspended / Blocked")}
                                </h4>
                                <p className="text-xs mt-0.5 text-slate-600 dark:text-slate-300">
                                    {profileData.blockedReason || t("Your account has been restricted by the administrator. Contact secretarea1337@gmail.com for inquiries.")}
                                </p>
                            </div>
                        </div>
                    )}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
                        <div className="flex flex-col sm:flex-row sm:items-end gap-5">
                            {/* Avatar */}
                            <div className="relative shrink-0 -mt-16 sm:-mt-20">
                                {/* Blocked / Banned Badge - visible directly above avatar */}
                                {(profileData.isBlocked || profileData.isBlacklisted || profileData.status === 'blocked' || profileData.status === 'blacklisted') && (
                                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 px-3 py-0.5 rounded-full bg-rose-600 text-white border-2 border-white dark:border-[#0c111e] text-[10px] font-black uppercase tracking-wider shadow-xl flex items-center gap-1.5 whitespace-nowrap animate-pulse">
                                        <TbBan size={12} className="shrink-0" />
                                        <span>{profileData.isBlacklisted || (profileData.blockCount && profileData.blockCount >= 3) ? t("Banned") : t("Blocked")}</span>
                                    </div>
                                )}
                                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-2xl md:rounded-3xl border-4 sm:border-[5px] border-white dark:border-[#0c111e] bg-[#29aaea] flex items-center justify-center text-4xl sm:text-5xl font-black text-white overflow-hidden shadow-2xl transition-all">
                                    {displayPhoto ? (
                                        <img 
                                            src={displayPhoto} 
                                            alt={profileData.displayName || 'User Avatar'} 
                                            className="w-full h-full object-cover"
                                            referrerPolicy="no-referrer"
                                        />
                                    ) : (
                                        <span>{displayInitial}</span>
                                    )}
                                </div>
                                <div className="absolute -bottom-1 -end-1 w-7 h-7 rounded-xl bg-emerald-500 border-2 border-white dark:border-[#0c111e] flex items-center justify-center text-white shadow" title="Online & Active">
                                    <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
                                </div>
                            </div>

                            {/* Display Name, Username, Rank & Badges */}
                            <div className="space-y-1.5 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                        {profileData.displayName || currentUser?.displayName || 'SecretArea Gamer'}
                                    </h1>
                                    <span className="text-sm font-bold text-[#29aaea] bg-blue-500/10 dark:bg-blue-500/20 px-3 py-1 rounded-xl border border-blue-500/20">
                                        @{profileData.username || currentUser?.email?.split('@')[0] || 'gamer'}
                                    </span>
                                    {isAdmin && (
                                        <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-1 shadow-sm">
                                            <TbShieldCheck size={14} /> Admin
                                        </span>
                                    )}
                                </div>

                                {/* Bio */}
                                <p className="text-slate-600 dark:text-slate-300 text-sm max-w-3xl leading-relaxed">
                                    {profileData.bio || 'Exploring games and roadmaps in SecretArea.'}
                                </p>

                                {/* Meta Tags: Email, Active, Hardware */}
                                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 dark:text-slate-500 pt-1">
                                    {profileData.email && (
                                        <span className="flex items-center gap-1.5 font-medium">
                                            <TbBrandGoogle size={14} className="text-blue-500" /> {profileData.email}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1.5">
                                        <TbClock size={14} /> Active {formatTimeAgo(profileData.lastActive || profileData.createdAt)}
                                    </span>
                                    {profileData.pcSpecs?.isActive && profileData.pcSpecs?.gpuModel && (
                                        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                                            <TbCpu size={14} /> {profileData.pcSpecs.gpuModel} ({profileData.pcSpecs.ram}GB)
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-6 border-b border-slate-200 dark:border-slate-800/80 mb-8 overflow-x-auto no-scrollbar px-2">
                    {tabsToRender.map((tab) => {
                        let count: number | null = null;
                        if (tab === 'Liked') count = liked.length;
                        if (tab === 'Library') count = library.length;
                        if (tab === 'Game history') count = history.length;
                        if (tab === 'Favorites') count = favorites.length;
                        if (tab === 'Live Movement') count = activities.length;
                        if (tab === 'Users Directory') count = allUsers.length;

                        return (
                            <button 
                                key={tab} 
                                onClick={() => { setActiveTab(tab); setHistoryPage(1); setUsersPage(1); setMovementPage(1); }}
                                className={`pb-4 text-[15px] font-semibold whitespace-nowrap border-b-2 transition-all flex items-center gap-2 ${
                                    activeTab === tab 
                                        ? 'text-[#29aaea] border-[#29aaea]' 
                                        : 'text-slate-500 dark:text-[#8892b0] border-transparent hover:text-slate-800 dark:hover:text-slate-300'
                                }`}
                            >
                                {tab === 'Users Directory' && <TbUsers size={16} className="text-amber-400" />}
                                <span>{t(tab)}</span>
                                {count !== null && count > 0 && (
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        activeTab === tab 
                                            ? 'bg-[#29aaea]/20 text-[#29aaea]' 
                                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                                    }`}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Content Area */}
                <div className="min-h-[420px] text-start">
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={activeTab}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* OVERVIEW TAB */}
                            {activeTab === 'Overview' && (
                                <div className="space-y-10">
                                    {/* Stats Grid */}
                                    <div>
                                        <div className="flex items-center justify-between mb-5">
                                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                <TbSparkles className="text-[#29aaea]" /> {t("Overview")}
                                            </h2>
                                            <span className="text-xs text-slate-400 font-mono">
                                                Level {currentRank.tier} • {currentRank.title}
                                            </span>
                                        </div>

                                        {/* Rank Progress Bar */}
                                        <div className="mb-6 p-5 rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-[#151b2b] dark:to-[#0f1420] border border-slate-200/80 dark:border-slate-800/80 shadow-sm relative overflow-hidden">
                                            {/* Decorative glow */}
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#29aaea] opacity-[0.03] blur-3xl rounded-full translate-x-10 -translate-y-10" />
                                            
                                            <div className="flex items-center justify-between mb-4 relative z-10">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${currentRank.color}`}>
                                                        <currentRank.icon size={20} />
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-0.5">{t("Wolf Rank Progression")}</span>
                                                        <span className="text-slate-900 dark:text-white font-bold text-lg flex items-center gap-2">
                                                            {currentRank.title}
                                                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] rounded-full border border-slate-200 dark:border-slate-700">Tier {currentRank.tier}</span>
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-end">
                                                    <span className="text-[#29aaea] font-mono font-bold text-lg">{points.toLocaleString()}</span>
                                                    <span className="text-slate-400 dark:text-slate-500 text-xs font-mono ms-1">/ {currentRank.next}</span>
                                                </div>
                                            </div>
                                            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-700/50 relative z-10">
                                                <div 
                                                    className={`h-full bg-gradient-to-r ${currentRank.bar || 'from-[#29aaea] to-indigo-500'} rounded-full transition-all duration-1000 relative`}
                                                    style={{ width: `${currentRank.progress}%` }}
                                                >
                                                    <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div className="group bg-white dark:bg-[#111623] p-5 rounded-2xl border border-slate-200 dark:border-slate-800/70 shadow-sm hover:shadow-md hover:border-amber-500/30 transition-all relative overflow-hidden">
                                                <div className="absolute -right-4 -top-4 text-amber-500/5 group-hover:text-amber-500/10 transition-colors">
                                                    <TbBolt size={80} />
                                                </div>
                                                <div className="flex justify-between items-start mb-3 relative z-10">
                                                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#8892b0]">
                                                        {t("Total Points")}
                                                    </div>
                                                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
                                                        <TbBolt size={18} />
                                                    </div>
                                                </div>
                                                <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight relative z-10">{points.toLocaleString()}</div>
                                                <div className="text-[11px] text-slate-400 mt-2 font-medium bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-md inline-block relative z-10">{t("Very Hard to Earn (+1/view)")}</div>
                                            </div>

                                            <div className="group bg-white dark:bg-[#111623] p-5 rounded-2xl border border-slate-200 dark:border-slate-800/70 shadow-sm hover:shadow-md hover:border-blue-500/30 transition-all relative overflow-hidden">
                                                <div className="absolute -right-4 -top-4 text-blue-500/5 group-hover:text-blue-500/10 transition-colors">
                                                    <TbEye size={80} />
                                                </div>
                                                <div className="flex justify-between items-start mb-3 relative z-10">
                                                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#8892b0]">
                                                        {t("Games Viewed")}
                                                    </div>
                                                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
                                                        <TbEye size={18} />
                                                    </div>
                                                </div>
                                                <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight relative z-10">{gamesViewed.toLocaleString()}</div>
                                                <div className="text-[11px] text-slate-400 mt-2 font-medium bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-md inline-block relative z-10">{history.length} {t("games logged")}</div>
                                            </div>

                                            <div className="group bg-white dark:bg-[#111623] p-5 rounded-2xl border border-slate-200 dark:border-slate-800/70 shadow-sm hover:shadow-md hover:border-rose-500/30 transition-all relative overflow-hidden">
                                                <div className="absolute -right-4 -top-4 text-rose-500/5 group-hover:text-rose-500/10 transition-colors">
                                                    <TbHeart size={80} />
                                                </div>
                                                <div className="flex justify-between items-start mb-3 relative z-10">
                                                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#8892b0]">
                                                        {t("Games Liked")}
                                                    </div>
                                                    <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500 group-hover:scale-110 transition-transform">
                                                        <TbHeart size={18} />
                                                    </div>
                                                </div>
                                                <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight relative z-10">{contentLiked.toLocaleString()}</div>
                                                <div className="text-[11px] text-slate-400 mt-2 font-medium bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-md inline-block relative z-10">{liked.length} {t("in liked list")}</div>
                                            </div>

                                            <div className="group bg-white dark:bg-[#111623] p-5 rounded-2xl border border-slate-200 dark:border-slate-800/70 shadow-sm hover:shadow-md hover:border-emerald-500/30 transition-all relative overflow-hidden">
                                                <div className="absolute -right-4 -top-4 text-emerald-500/5 group-hover:text-emerald-500/10 transition-colors">
                                                    <TbAward size={80} />
                                                </div>
                                                <div className="flex justify-between items-start mb-3 relative z-10">
                                                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#8892b0]">
                                                        {t("Badges Earned")}
                                                    </div>
                                                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
                                                        <TbAward size={18} />
                                                    </div>
                                                </div>
                                                <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight relative z-10">{earnedBadges.length} <span className="text-base text-slate-400 font-medium">/ {ALL_BADGES.length}</span></div>
                                                <div className="text-[11px] text-slate-400 mt-2 font-medium bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-md inline-block relative z-10">{t("Unlocked achievements")}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* PC Hardware Specs Card */}
                                    {profileData.pcSpecs && (
                                        <div className="p-5 rounded-xl bg-white dark:bg-[#111623] border border-slate-200 dark:border-slate-800 shadow-sm">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <TbCpu className="text-[#29aaea]" size={20} />
                                                    <h3 className="font-bold text-slate-900 dark:text-white text-base">{t("Configured PC Hardware")}</h3>
                                                </div>
                                                <button 
                                                    onClick={() => navigate('/settings')}
                                                    className="text-xs text-[#29aaea] hover:underline font-semibold"
                                                >
                                                    Configure in Settings &rarr;
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                                                    <span className="text-slate-400 block mb-0.5">GPU Model</span>
                                                    <span className="font-bold text-slate-800 dark:text-slate-200">{profileData.pcSpecs.gpuModel || 'Not Set'}</span>
                                                </div>
                                                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                                                    <span className="text-slate-400 block mb-0.5">CPU Model</span>
                                                    <span className="font-bold text-slate-800 dark:text-slate-200">{profileData.pcSpecs.cpuModel || 'Not Set'}</span>
                                                </div>
                                                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                                                    <span className="text-slate-400 block mb-0.5">RAM</span>
                                                    <span className="font-bold text-slate-800 dark:text-slate-200">{profileData.pcSpecs.ram || 16} GB</span>
                                                </div>
                                                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                                                    <span className="text-slate-400 block mb-0.5">Operating System</span>
                                                    <span className="font-bold text-slate-800 dark:text-slate-200">Windows {profileData.pcSpecs.os || '10'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Smart Realtime Live Movement & Activity Stream */}
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                <TbActivity className="text-emerald-400" /> Realtime Website Movement & Activity
                                            </h2>
                                            <button 
                                                onClick={() => setActiveTab('Live Movement')}
                                                className="text-xs text-[#29aaea] hover:underline font-semibold"
                                            >
                                                View All ({activities.length}) &rarr;
                                            </button>
                                        </div>

                                        {activities.length > 0 ? (
                                            <div className="space-y-2.5">
                                                {activities.slice(0, 5).map((act, actIdx) => (
                                                    <div 
                                                        key={act.id ? `${act.id}-${actIdx}` : `act-${actIdx}`}
                                                        className="p-3.5 rounded-xl bg-white dark:bg-[#111623] border border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-4 shadow-sm hover:border-[#29aaea]/40 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[#29aaea] flex-shrink-0">
                                                                {act.type === 'like_game' ? <TbHeart className="text-rose-500" size={18} /> :
                                                                 act.type === 'favorite_game' ? <TbBookmark className="text-amber-400" size={18} /> :
                                                                 act.type === 'hardware_update' ? <TbCpu className="text-cyan-400" size={18} /> :
                                                                 act.type === 'profile_update' ? <TbUser className="text-purple-400" size={18} /> :
                                                                 <TbEye className="text-blue-400" size={18} />}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                                                                    {act.title}
                                                                </div>
                                                                {act.description && (
                                                                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                                        {act.description}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <span className="text-xs text-slate-400 whitespace-nowrap font-mono">
                                                            {formatTimeAgo(act.timestamp)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-6 rounded-xl bg-white dark:bg-[#111623] border border-slate-200 dark:border-slate-800 text-center text-sm text-slate-500">
                                                No movement logged yet. Explore games or customize settings to see live updates!
                                            </div>
                                        )}
                                    </div>

                                    {/* Recent Activity (Last 24h) */}
                                    <div>
                                        <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">{t("Recent Activity")} (24h)</h2>
                                        {recentActivity.length > 0 ? (
                                            <GameGrid games={recentActivity} onGameClick={handleOpenGameDetail} />
                                        ) : (
                                            <div className="bg-white dark:bg-[#111623] p-6 rounded-xl border border-slate-200 dark:border-slate-800/70 text-center text-slate-500 dark:text-[#8892b0] shadow-sm">
                                                {t("No recent activity in the last 24 hours.")}
                                            </div>
                                        )}
                                    </div>

                                    {/* Badges */}
                                    <div>
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                                <TbTrophy className="text-amber-500" />
                                                {t("Achievements & Badges")}
                                            </h2>
                                            <span className="text-sm font-semibold px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20">
                                                {earnedBadges.length} / {ALL_BADGES.length} Unlocked
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-5">
                                            {ALL_BADGES.map(badge => {
                                                const isEarned = isAdmin || badge.condition(profileData);
                                                return (
                                                    <div 
                                                        key={badge.id} 
                                                        className={`group relative p-5 rounded-2xl border transition-all duration-300 flex flex-col items-center text-center overflow-hidden ${
                                                            isEarned 
                                                                ? 'bg-gradient-to-br from-white to-slate-50 dark:from-[#1a2333] dark:to-[#111623] border-[#29aaea]/30 shadow-md hover:shadow-lg hover:border-[#29aaea]/60 hover:-translate-y-1' 
                                                                : 'bg-white dark:bg-[#0c101a] border-slate-200 dark:border-slate-800/80 opacity-60 hover:opacity-100 grayscale hover:grayscale-0'
                                                        }`}
                                                    >
                                                        {isEarned && (
                                                            <div className="absolute top-0 right-0 w-24 h-24 bg-[#29aaea] opacity-5 blur-2xl rounded-full translate-x-10 -translate-y-10" />
                                                        )}
                                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform duration-500 ${isEarned ? 'bg-[#29aaea]/10 shadow-[0_0_15px_rgba(41,170,234,0.15)] group-hover:scale-110 group-hover:rotate-3' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                                            <div className="text-3xl drop-shadow-sm">{badge.icon}</div>
                                                        </div>
                                                        <div className="font-extrabold text-sm text-slate-900 dark:text-white mb-1.5">{t(badge.name)}</div>
                                                        <div className="text-xs text-slate-500 dark:text-[#8892b0] leading-snug">{t(badge.description)}</div>
                                                        <div className="mt-auto pt-4 w-full">
                                                            {isEarned ? (
                                                                <span className="block w-full py-1.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-emerald-500/20">
                                                                    Unlocked
                                                                </span>
                                                            ) : (
                                                                <span className="block w-full py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-widest rounded-lg">
                                                                    Locked
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* LIKED TAB */}
                            {activeTab === 'Liked' && (
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <TbHeart className="text-rose-500" /> {t("Liked Games")} ({liked.length})
                                        </h2>
                                    </div>
                                    {liked.length > 0 ? (
                                        <GameGrid 
                                            games={liked} 
                                            onGameClick={handleOpenGameDetail}
                                            onRemove={handleUnlikeGame}
                                            removeIcon={<TbHeart size={16} className="text-rose-300" />}
                                        />
                                    ) : (
                                        <EmptyState message={t("You haven't liked any games yet.")} />
                                    )}
                                </div>
                            )}

                            {/* LIBRARY TAB */}
                            {activeTab === 'Library' && (
                                <div>
                                    {/* Header & Search */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                <TbDeviceGamepad2 className="text-[#29aaea]" /> {t("Game Library")} ({library.length})
                                            </h2>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                {t("Manage and track your gaming journey across all devices.")}
                                            </p>
                                        </div>

                                        {/* Search in library */}
                                        <div className="relative w-full sm:w-64">
                                            <TbSearch className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                            <input 
                                                type="text"
                                                value={librarySearch}
                                                onChange={(e) => setLibrarySearch(e.target.value)}
                                                placeholder={t("Search library games...")}
                                                className="w-full ps-9 pe-8 py-2 text-xs bg-slate-100 dark:bg-[#111623] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-[#29aaea] text-slate-900 dark:text-white placeholder-slate-400"
                                            />
                                            {librarySearch && (
                                                <button 
                                                    onClick={() => setLibrarySearch('')}
                                                    className="absolute end-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Library Overview Summary Cards */}
                                    {library.length > 0 && (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                                            <div className="bg-slate-50 dark:bg-[#111623] p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/70">
                                                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t("Total Games")}</div>
                                                <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{library.length}</div>
                                            </div>
                                            <div className="bg-emerald-500/5 dark:bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                                                <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> {t("Playing")}
                                                </div>
                                                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                                                    {library.filter((g: any) => g.status === 'Playing').length}
                                                </div>
                                            </div>
                                            <div className="bg-sky-500/5 dark:bg-sky-500/10 p-3 rounded-xl border border-sky-500/20">
                                                <div className="text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                                                    <span className="w-2 h-2 rounded-full bg-sky-500" /> {t("Plan to Play")}
                                                </div>
                                                <div className="text-xl font-black text-sky-600 dark:text-sky-400 mt-1">
                                                    {library.filter((g: any) => g.status === 'Plan to Play').length}
                                                </div>
                                            </div>
                                            <div className="bg-purple-500/5 dark:bg-purple-500/10 p-3 rounded-xl border border-purple-500/20">
                                                <div className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                                                    <span className="w-2 h-2 rounded-full bg-purple-500" /> {t("Completed")}
                                                </div>
                                                <div className="text-xl font-black text-purple-600 dark:text-purple-400 mt-1">
                                                    {library.filter((g: any) => g.status === 'Completed').length}
                                                </div>
                                            </div>
                                            <div className="bg-amber-500/5 dark:bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                                                <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                                                    <span className="w-2 h-2 rounded-full bg-amber-500" /> {t("On Hold")}
                                                </div>
                                                <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
                                                    {library.filter((g: any) => g.status === 'On Hold').length}
                                                </div>
                                            </div>
                                            <div className="bg-rose-500/5 dark:bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                                                <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                                                    <span className="w-2 h-2 rounded-full bg-rose-500" /> {t("Dropped")}
                                                </div>
                                                <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">
                                                    {library.filter((g: any) => g.status === 'Dropped').length}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Status filter tabs */}
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {LIBRARY_STATUSES.map(status => {
                                            const count = status === 'All' ? library.length : library.filter((g: any) => g.status === status).length;
                                            const isActive = libraryTab === status;
                                            const cfg = status !== 'All' ? STATUS_CONFIG[status] : null;

                                            return (
                                                <button 
                                                    key={status}
                                                    onClick={() => setLibraryTab(status)}
                                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                                        isActive 
                                                            ? 'bg-[#29aaea] text-white shadow-md shadow-[#29aaea]/25' 
                                                            : 'bg-slate-100 dark:bg-[#111623] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-[#29aaea]/40'
                                                    }`}
                                                >
                                                    {cfg && <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />}
                                                    <span>{t(status)}</span>
                                                    <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                                                        {count}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {libraryFiltered.length > 0 ? (
                                        <GameGrid 
                                            games={libraryFiltered} 
                                            onGameClick={handleOpenGameDetail}
                                            onRemove={(e, g) => handleRemoveFromLibrary(e, g)}
                                            removeIcon={<TbTrash size={16} />}
                                            isLibrary={true}
                                            onUpdateStatus={handleUpdateLibraryStatus}
                                        />
                                    ) : (
                                        <EmptyState 
                                            message={
                                                librarySearch
                                                    ? t(`No games in library match "${librarySearch}".`)
                                                    : library.length === 0
                                                        ? t("Your library is empty. Discover games and add them with custom play status!")
                                                        : t(`No games currently in "${libraryTab}" status.`)
                                            } 
                                        />
                                    )}
                                </div>
                            )}

                            {/* GAME HISTORY TAB */}
                            {activeTab === 'Game history' && (
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <TbClock className="text-blue-400" /> {t("Game history")} ({history.length})
                                        </h2>
                                        {history.length > 0 && (
                                            <button 
                                                onClick={handleClearHistory}
                                                className="flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-600 font-semibold px-3 py-1.5 rounded-lg border border-rose-500/20 hover:bg-rose-500/10 transition-colors"
                                            >
                                                <TbTrash size={14} /> {t("Clear History")}
                                            </button>
                                        )}
                                    </div>

                                    {history.length > 0 ? (
                                        <>
                                            <GameGrid games={currentHistory} onGameClick={handleOpenGameDetail} />
                                            {totalHistoryPages > 1 && (
                                                <div className="flex items-center justify-between mt-10 pt-4 border-t border-slate-200 dark:border-slate-800/70">
                                                    <div className="text-sm text-slate-500 dark:text-[#8892b0]">
                                                        {t("Showing")} {idxFirstHistory + 1} {t("to")} {Math.min(idxLastHistory, history.length)} {t("of")} {history.length}
                                                    </div>
                                                    <div className="flex gap-2" dir="ltr">
                                                        <button 
                                                            onClick={() => setHistoryPage(p => Math.max(1, p - 1))} 
                                                            disabled={historyPage === 1} 
                                                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-[#111623] border border-slate-200 dark:border-slate-800/70 hover:bg-slate-100 dark:hover:bg-[#1a2333] text-slate-700 dark:text-white disabled:opacity-40"
                                                        >
                                                            <FaAngleLeft />
                                                        </button>
                                                        <button 
                                                            onClick={() => setHistoryPage(p => Math.min(totalHistoryPages, p + 1))} 
                                                            disabled={historyPage === totalHistoryPages} 
                                                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-[#111623] border border-slate-200 dark:border-slate-800/70 hover:bg-slate-100 dark:hover:bg-[#1a2333] text-slate-700 dark:text-white disabled:opacity-40"
                                                        >
                                                            <FaAngleRight />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <EmptyState message={t("No viewed game history yet.")} />
                                    )}
                                </div>
                            )}

                            {/* FAVORITES TAB */}
                            {activeTab === 'Favorites' && (
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <TbBookmark className="text-amber-400" /> {t("Favorites")} ({favorites.length})
                                        </h2>
                                    </div>
                                    {favorites.length > 0 ? (
                                        <GameGrid 
                                            games={favorites} 
                                            onGameClick={handleOpenGameDetail}
                                            onRemove={handleUnfavoriteGame}
                                            removeIcon={<TbBookmark size={16} className="text-amber-300" />}
                                        />
                                    ) : (
                                        <EmptyState message={t("You have no favorites saved yet.")} />
                                    )}
                                </div>
                            )}

                            {/* LIVE MOVEMENT TAB */}
                            {activeTab === 'Live Movement' && (
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                <TbActivity className="text-emerald-400" /> Smart Live Movement & Website Telemetry
                                            </h2>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                Real-time stream of all your navigations, likes, library updates, and interactions across the website.
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                            <span className="text-xs font-mono text-emerald-400">Live Active</span>
                                        </div>
                                    </div>

                                    {activities.length > 0 ? (
                                        <div className="space-y-3">
                                            {currentMovements.map((act, actIdx) => (
                                                <div 
                                                    key={act.id ? `${act.id}-${actIdx}` : `move-${actIdx}`}
                                                    className="p-4 rounded-xl bg-white dark:bg-[#111623] border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shadow-sm hover:border-[#29aaea]/40 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3.5 min-w-0">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[#29aaea] flex-shrink-0">
                                                            {act.type === 'like_game' ? <TbHeart className="text-rose-500" size={20} /> :
                                                             act.type === 'favorite_game' ? <TbBookmark className="text-amber-400" size={20} /> :
                                                             act.type === 'hardware_update' ? <TbCpu className="text-cyan-400" size={20} /> :
                                                             act.type === 'profile_update' ? <TbUser className="text-purple-400" size={20} /> :
                                                             act.type === 'library_update' ? <TbDeviceGamepad2 className="text-emerald-400" size={20} /> :
                                                             <TbEye className="text-blue-400" size={20} />}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="font-semibold text-sm text-slate-900 dark:text-white">
                                                                {act.title}
                                                            </div>
                                                            {act.description && (
                                                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                                    {act.description}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-end flex-shrink-0">
                                                        <span className="text-xs font-mono text-slate-400 block">
                                                            {formatTimeAgo(act.timestamp)}
                                                        </span>
                                                        {act.gameId && (
                                                            <button 
                                                                onClick={() => handleOpenGameDetail({ id: act.gameId, name: act.title })}
                                                                className="text-[11px] text-[#29aaea] hover:underline mt-1 font-semibold flex items-center gap-1 justify-end"
                                                            >
                                                                <TbEye size={12} />
                                                                <span>{t("Game Details") || "Game Details"} &rarr;</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}

                                            {totalMovementPages > 1 && (
                                                <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200 dark:border-slate-800/70">
                                                    <div className="text-xs text-slate-500 dark:text-[#8892b0]">
                                                        {t("Showing")} {idxFirstMovement + 1} {t("to")} {Math.min(idxLastMovement, activities.length)} {t("of")} {activities.length}
                                                    </div>
                                                    <div className="flex items-center gap-2" dir="ltr">
                                                        <button 
                                                            onClick={() => setMovementPage(p => Math.max(1, p - 1))} 
                                                            disabled={movementPage === 1} 
                                                            className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#111623] border border-slate-200 dark:border-slate-800/70 hover:bg-slate-100 dark:hover:bg-[#1a2333] text-xs font-semibold text-slate-700 dark:text-white disabled:opacity-40 flex items-center gap-1"
                                                        >
                                                            <FaAngleLeft />
                                                            <span>{t("Previous")}</span>
                                                        </button>
                                                        <span className="text-xs font-mono px-2 text-slate-400">
                                                            {movementPage} / {totalMovementPages}
                                                        </span>
                                                        <button 
                                                            onClick={() => setMovementPage(p => Math.min(totalMovementPages, p + 1))} 
                                                            disabled={movementPage === totalMovementPages} 
                                                            className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#111623] border border-slate-200 dark:border-slate-800/70 hover:bg-slate-100 dark:hover:bg-[#1a2333] text-xs font-semibold text-slate-700 dark:text-white disabled:opacity-40 flex items-center gap-1"
                                                        >
                                                            <span>{t("Next")}</span>
                                                            <FaAngleRight />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <EmptyState message="No movements recorded yet. Start browsing roadmaps or games to see realtime results here!" />
                                    )}
                                </div>
                            )}

                            {/* ADMIN USERS DIRECTORY & LIVE MOVEMENT TAB */}
                            {activeTab === 'Users Directory' && isAdmin && (
                                <div className="space-y-6">
                                    {/* Admin Action Bar with Quick Return Buttons */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-[#111623] border border-slate-200 dark:border-slate-800 shadow-sm">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                                    <TbShieldCheck size={20} />
                                                </span>
                                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                                    {t("Admin Users Directory & Live Telemetry")}
                                                </h2>
                                                <span className="text-xs font-bold font-mono bg-[#29aaea]/10 text-[#29aaea] px-2.5 py-0.5 rounded-full border border-[#29aaea]/20">
                                                    {allUsers.length} {t("Users")}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {t("Real-time inspection of Gmail, display name, username, points, badges, login dates, and website movements.")}
                                            </p>
                                        </div>

                                        {/* Back to dashboard and settings buttons */}
                                        <div className="flex items-center gap-2.5 flex-wrap">
                                            <button 
                                                onClick={() => navigate('/')}
                                                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-[#29aaea]/10 text-slate-700 dark:text-slate-200 hover:text-[#29aaea] border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-all shadow-sm"
                                            >
                                                <TbLayoutDashboard size={15} className="text-[#29aaea]" />
                                                <span>{t("Back to Dashboard")}</span>
                                            </button>
                                            <button 
                                                onClick={() => navigate('/settings')}
                                                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-[#29aaea]/10 text-slate-700 dark:text-slate-200 hover:text-[#29aaea] border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-all shadow-sm"
                                            >
                                                <TbSettings size={15} />
                                                <span>{t("Settings")}</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Action Feedback Notification */}
                                    {actionFeedback && (
                                        <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs font-semibold animate-in fade-in duration-200 ${
                                            actionFeedback.type === 'success'
                                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                                        }`}>
                                            <div className="flex items-center gap-2">
                                                {actionFeedback.type === 'success' ? <TbCheck size={16} /> : <TbAlertTriangle size={16} />}
                                                <span>{actionFeedback.text}</span>
                                            </div>
                                            <button onClick={() => setActionFeedback(null)} className="opacity-70 hover:opacity-100">✕</button>
                                        </div>
                                    )}

                                    {/* Search & Filter Input */}
                                    <div className="relative">
                                        <TbSearch size={18} className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input 
                                            type="text"
                                            value={adminUserSearch}
                                            onChange={(e) => { setAdminUserSearch(e.target.value); setUsersPage(1); }}
                                            placeholder={t("Filter by Gmail, display name, username, or badge...")}
                                            className="w-full bg-white dark:bg-[#111623] border border-slate-200 dark:border-slate-800 rounded-xl ps-11 pe-24 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#29aaea] shadow-sm transition-all"
                                        />
                                        {adminUserSearch && (
                                            <button 
                                                onClick={() => setAdminUserSearch('')}
                                                className="absolute end-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-semibold"
                                            >
                                                Clear
                                            </button>
                                        )}
                                    </div>

                                    {/* User Cards List */}
                                    {filteredUsers.length > 0 ? (
                                        <div className="space-y-4">
                                            {currentUsers.map((u) => {
                                                const userKey = u.uid || u.email || 'user';
                                                const isExpanded = !!expandedUserIds[userKey];
                                                const isRootAdmin = (u.email && u.email.toLowerCase() === 'secretarea1337@gmail.com');
                                                const userRole = (u.role && u.role.toLowerCase() === 'admin') || isRootAdmin ? 'Admin' : 'User';
                                                const isUserBlocked = u.isBlocked === true || u.status === 'blocked';
                                                const isUserBlacklisted = u.isBlacklisted === true || u.status === 'blacklisted';
                                                const userBadge = computeUserBadge(u);
                                                const loginTimestamp = u.lastLogin || u.lastActive || u.createdAt;
                                                const formattedLoginDate = loginTimestamp 
                                                    ? new Date(loginTimestamp).toLocaleString(undefined, { 
                                                        year: 'numeric', 
                                                        month: 'short', 
                                                        day: 'numeric', 
                                                        hour: '2-digit', 
                                                        minute: '2-digit',
                                                        second: '2-digit'
                                                    }) 
                                                    : 'Never';
                                                const userActivities = u.activities || [];

                                                return (
                                                    <div 
                                                        key={userKey}
                                                        className="rounded-2xl bg-white dark:bg-[#111623] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all hover:border-[#29aaea]/30"
                                                    >
                                                        {/* Primary User Row */}
                                                        <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                                            {/* User Identity */}
                                                            <div className="flex items-center gap-4 min-w-0">
                                                                <div className="relative shrink-0">
                                                                    {(isUserBlocked || isUserBlacklisted) && (
                                                                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-20 px-1.5 py-0.5 rounded-md bg-rose-600 text-white text-[9px] font-black uppercase tracking-wider border border-white dark:border-[#111623] shadow-md flex items-center gap-0.5 whitespace-nowrap animate-pulse">
                                                                            <TbBan size={10} />
                                                                            <span>{isUserBlacklisted ? 'BANNED' : 'BLOCKED'}</span>
                                                                        </span>
                                                                    )}
                                                                    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#29aaea] to-indigo-600 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-md overflow-hidden">
                                                                        {u.photoURL ? (
                                                                            <img src={u.photoURL} alt={u.displayName || 'User'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                                                        ) : (
                                                                            <span>{(u.displayName || u.email || 'U')[0].toUpperCase()}</span>
                                                                        )}
                                                                    </div>
                                                                    {userRole === 'Admin' && (
                                                                        <span className="absolute -top-1.5 -end-1.5 w-5 h-5 rounded-full bg-amber-500 text-black flex items-center justify-center text-[10px] font-black shadow" title="Admin">
                                                                            ★
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                <div className="min-w-0 space-y-1">
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                                                                            {u.displayName || 'SecretArea Gamer'}
                                                                        </h3>
                                                                        <span className="text-xs font-semibold text-[#29aaea] bg-blue-500/10 px-2.5 py-0.5 rounded-lg border border-blue-500/20 font-mono">
                                                                            @{u.username || (u.email ? u.email.split('@')[0] : 'user')}
                                                                        </span>
                                                                        <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border ${
                                                                            userRole === 'Admin'
                                                                                ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                                                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                                                                        }`}>
                                                                            {userRole}
                                                                        </span>

                                                                        {/* Status badge: Active, Blocked, or Blacklisted with block count */}
                                                                        {isUserBlacklisted ? (
                                                                            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/30 flex items-center gap-1" title="Permanently blacklisted">
                                                                                <TbBan size={12} /> {t("Blacklisted")} {typeof u.blockCount === 'number' && u.blockCount >= 3 ? `(${u.blockCount}/3)` : ''}
                                                                            </span>
                                                                        ) : isUserBlocked ? (
                                                                            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/30 flex items-center gap-1" title="Temporarily blocked">
                                                                                <TbUserOff size={12} /> {t("Blocked")} ({u.blockCount || 1}/3)
                                                                            </span>
                                                                        ) : (
                                                                            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 flex items-center gap-1">
                                                                                <TbCheck size={12} /> {t("Active")} {u.blockCount ? `(${u.blockCount}/3 blocks)` : ''}
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                                                                        <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                                                                            <TbBrandGoogle size={14} className="text-blue-500" />
                                                                            <span>{u.email || 'No Gmail address'}</span>
                                                                        </span>
                                                                        <span className="text-slate-300 dark:text-slate-700">•</span>
                                                                        <span className="flex items-center gap-1 font-mono text-slate-400">
                                                                            <TbClock size={13} />
                                                                            <span>{t("Login")}: {formattedLoginDate} ({formatTimeAgo(loginTimestamp)})</span>
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* User Stats & Badges & Moderation */}
                                                            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap lg:justify-end">
                                                                {/* Points */}
                                                                <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-start min-w-[80px]">
                                                                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                                                        <TbFlame size={12} className="text-amber-500" /> {t("Points")}
                                                                    </div>
                                                                    <div className="text-sm font-black text-slate-900 dark:text-white font-mono">
                                                                        {u.points || 0} <span className="text-[10px] font-normal text-slate-400">XP</span>
                                                                    </div>
                                                                </div>

                                                                {/* Badge */}
                                                                <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-start min-w-[110px]">
                                                                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                                                        <TbSparkles size={12} className="text-purple-400" /> {t("Badge")}
                                                                    </div>
                                                                    <div className="text-xs font-bold text-purple-600 dark:text-purple-400 truncate">
                                                                        {userBadge}
                                                                    </div>
                                                                </div>

                                                                {/* Movement Trigger Button */}
                                                                <button 
                                                                    onClick={() => toggleUserExpanded(userKey)}
                                                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all shadow-sm ${
                                                                        isExpanded 
                                                                            ? 'bg-[#29aaea] text-white border-[#29aaea]' 
                                                                            : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-[#29aaea]/10 text-slate-700 dark:text-slate-200 hover:text-[#29aaea] border-slate-200 dark:border-slate-700'
                                                                    }`}
                                                                >
                                                                    <TbActivity size={15} />
                                                                    <span>{t("Movement")}: {userActivities.length}</span>
                                                                    {isExpanded ? <TbChevronUp size={14} /> : <TbChevronDown size={14} />}
                                                                </button>

                                                                {/* Moderation Action Buttons (ONLY 2: BLOCK and REMOVE) */}
                                                                {!isRootAdmin && u.uid && (
                                                                    <div className="flex items-center gap-1.5">
                                                                        {/* Action 1: Block / Unblock */}
                                                                        {isUserBlocked ? (
                                                                            <button
                                                                                disabled={actionLoadingUserId === u.uid}
                                                                                onClick={() => handleUnblockUser(u)}
                                                                                className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all disabled:opacity-50 shadow-sm"
                                                                                title={t("Unblock user account")}
                                                                            >
                                                                                <TbUserCheck size={14} />
                                                                                <span className="hidden sm:inline">{t("Unblock")}</span>
                                                                            </button>
                                                                        ) : (
                                                                            <button
                                                                                disabled={actionLoadingUserId === u.uid || isUserBlacklisted}
                                                                                onClick={() => handleBlockUser(u)}
                                                                                className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-semibold transition-all disabled:opacity-50 shadow-sm"
                                                                                title={isUserBlacklisted ? t("Account permanently blacklisted (3 blocks reached)") : t("Block user account (adds infraction towards 3-block auto-ban)")}
                                                                            >
                                                                                <TbUserOff size={14} />
                                                                                <span className="hidden sm:inline">{t("Block")}</span>
                                                                                {typeof u.blockCount === 'number' && u.blockCount > 0 && !isUserBlacklisted && (
                                                                                    <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-[10px] font-mono font-bold">
                                                                                        {u.blockCount}/3
                                                                                    </span>
                                                                                )}
                                                                            </button>
                                                                        )}

                                                                        {/* Action 2: Remove (Delete completely from Auth & Firestore, wipe data, ban device) */}
                                                                        <button
                                                                            disabled={actionLoadingUserId === u.uid}
                                                                            onClick={() => setDeleteModalUser(u)}
                                                                            className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-semibold transition-all hover:border-rose-500/40 disabled:opacity-50 shadow-sm"
                                                                            title={t("Permanently remove user and delete from Auth and Firestore")}
                                                                        >
                                                                            <TbTrash size={14} />
                                                                            <span className="hidden sm:inline">{t("Remove")}</span>
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Expanded Movement Details for this User */}
                                                        {isExpanded && (
                                                            <div className="px-5 pb-5 pt-2 border-t border-slate-100 dark:border-slate-800/70 bg-slate-50/50 dark:bg-[#0c111e]/50">
                                                                <div className="flex items-center justify-between mb-3 pt-2">
                                                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                                                        <TbActivity className="text-emerald-400" />
                                                                        {t("User Activity & Movement Logs")} ({userActivities.length})
                                                                    </h4>
                                                                    <span className="text-[11px] text-slate-400 font-mono">
                                                                        ID: {u.uid || 'local'}
                                                                    </span>
                                                                </div>

                                                                {userActivities.length > 0 ? (
                                                                    <div className="space-y-2 max-h-[300px] overflow-y-auto pe-1">
                                                                        {userActivities.map((act, actIdx) => (
                                                                            <div 
                                                                                key={act.id ? `${act.id}-${actIdx}` : `uact-${actIdx}`}
                                                                                className="p-3 rounded-xl bg-white dark:bg-[#111623] border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                                                                            >
                                                                                <div className="flex items-center gap-3 min-w-0">
                                                                                    <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[#29aaea] shrink-0">
                                                                                        {act.type === 'like_game' ? <TbHeart className="text-rose-500" size={14} /> :
                                                                                         act.type === 'favorite_game' ? <TbBookmark className="text-amber-400" size={14} /> :
                                                                                         act.type === 'hardware_update' ? <TbCpu className="text-cyan-400" size={14} /> :
                                                                                         act.type === 'profile_update' ? <TbUser className="text-purple-400" size={14} /> :
                                                                                         act.type === 'library_update' ? <TbDeviceGamepad2 className="text-emerald-400" size={14} /> :
                                                                                         <TbEye className="text-blue-400" size={14} />}
                                                                                    </div>
                                                                                    <div className="min-w-0">
                                                                                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                                                                                            {act.title}
                                                                                        </span>
                                                                                        {act.description && (
                                                                                            <span className="text-slate-400 ms-2">
                                                                                                • {act.description}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                                <div className="shrink-0 text-end font-mono text-[11px] text-slate-400">
                                                                                    {act.timestamp ? new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''} ({formatTimeAgo(act.timestamp)})
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-xs text-slate-400 py-3 text-center italic">
                                                                        {t("No recorded movement actions on website for this user yet.")}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <EmptyState message={t("No users found matching your search query.")} />
                                    )}

                                    {/* Pagination Controls ("with next pages button if list have alot users") */}
                                    {totalUsersPages > 1 && (
                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800/70">
                                            <div className="text-xs text-slate-500 dark:text-[#8892b0]">
                                                {t("Showing")} {idxFirstUser + 1} {t("to")} {Math.min(idxLastUser, filteredUsers.length)} {t("of")} {filteredUsers.length} {t("users")}
                                            </div>

                                            <div className="flex items-center gap-2" dir="ltr">
                                                <button 
                                                    onClick={() => setUsersPage(p => Math.max(1, p - 1))}
                                                    disabled={usersPage === 1}
                                                    className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-[#111623] border border-slate-200 dark:border-slate-800/70 hover:bg-slate-100 dark:hover:bg-[#1a2333] text-xs font-semibold text-slate-700 dark:text-white disabled:opacity-40 flex items-center gap-1.5 transition-all shadow-sm"
                                                >
                                                    <FaAngleLeft />
                                                    <span>{t("Previous")}</span>
                                                </button>

                                                <div className="flex items-center gap-1">
                                                    {Array.from({ length: totalUsersPages }, (_, i) => i + 1).map((pageNum) => (
                                                        <button
                                                            key={pageNum}
                                                            onClick={() => setUsersPage(pageNum)}
                                                            className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                                                                usersPage === pageNum
                                                                    ? 'bg-[#29aaea] text-white'
                                                                    : 'bg-white dark:bg-[#111623] border border-slate-200 dark:border-slate-800/70 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1a2333]'
                                                            }`}
                                                        >
                                                            {pageNum}
                                                        </button>
                                                    ))}
                                                </div>

                                                <button 
                                                    onClick={() => setUsersPage(p => Math.min(totalUsersPages, p + 1))}
                                                    disabled={usersPage === totalUsersPages}
                                                    className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-[#111623] border border-slate-200 dark:border-slate-800/70 hover:bg-slate-100 dark:hover:bg-[#1a2333] text-xs font-semibold text-slate-700 dark:text-white disabled:opacity-40 flex items-center gap-1.5 transition-all shadow-sm"
                                                >
                                                    <span>{t("Next")}</span>
                                                    <FaAngleRight />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Game Detail Modal Popup */}
            <AnimatePresence>
                {selectedGame && (
                    <ResourceDetailModal
                        item={selectedGame}
                        onClose={() => setSelectedGame(null)}
                        stash={stash}
                        toggleStash={toggleStash}
                        allResources={allResources}
                        onItemSelect={(newItem) => setSelectedGame(resolveGameInfo(newItem))}
                        globalSpecs={{
                            ram: profileData.pcSpecs?.ram || 16,
                            os: profileData.pcSpecs?.os || '10',
                            cpuModel: profileData.pcSpecs?.cpuModel || '',
                            gpuModel: profileData.pcSpecs?.gpuModel || '',
                            isActive: profileData.pcSpecs?.isActive ?? true
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Admin Delete User Confirmation Modal */}
            <AnimatePresence>
                {deleteModalUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-[#111623] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20 mx-auto">
                                <TbAlertTriangle size={26} />
                            </div>
                            <div className="text-center space-y-1.5">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    {t("Permanently Remove User?")}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {t("Are you sure you want to delete")} <span className="font-semibold text-slate-900 dark:text-white">{deleteModalUser.displayName || deleteModalUser.email || deleteModalUser.username}</span> {t("from the Firestore database? This action is irreversible.")}
                                </p>
                                <div className="pt-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 font-mono text-[11px] text-slate-500 truncate text-start">
                                    UID: {deleteModalUser.uid}
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    onClick={() => setDeleteModalUser(null)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                                >
                                    {t("Cancel")}
                                </button>
                                <button
                                    onClick={handleConfirmDeleteUser}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-md transition-all flex items-center gap-1.5"
                                >
                                    <TbTrash size={14} />
                                    <span>{t("Yes, Delete User")}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Profile;
