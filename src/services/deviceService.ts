import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export interface DeviceInfo {
  fingerprint: string;
  ip: string;
  userAgent: string;
  screenResolution: string;
  language: string;
  timezone: string;
}

export interface BannedDeviceRecord {
  fingerprint: string;
  ip?: string;
  reason?: string;
  bannedAt: string;
  userId?: string;
  email?: string;
  blockCount?: number;
}

// Simple fast deterministic string hash (djb2 + fnv1a mix)
function hashString(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}

// Canvas-based hardware/browser entropy fingerprinting
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 240;
    canvas.height = 60;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'nocanvas';

    ctx.textBaseline = 'top';
    ctx.font = "14px 'Arial', sans-serif";
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);

    ctx.fillStyle = '#069';
    ctx.fillText('NEXA-1337-HWFP, \ud83d\ude03', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('NEXA-1337-HWFP, \ud83d\ude03', 4, 17);

    return hashString(canvas.toDataURL());
  } catch (e) {
    return 'fallback_canvas_' + (typeof navigator !== 'undefined' ? navigator.userAgent.length : '0');
  }
}

// WebGL renderer information
function getWebGLFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || (canvas.getContext('experimental-webgl') as any);
    if (!gl) return 'nowebgl';
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return 'nodebuginfo';
    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || '';
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
    return hashString(`${vendor}~${renderer}`);
  } catch (e) {
    return 'gl_err';
  }
}

let cachedDeviceInfo: DeviceInfo | null = null;

// Collect browser-based device entropy (NOT MAC address, strictly browser-available metrics)
export async function getDeviceInformation(): Promise<DeviceInfo> {
  if (cachedDeviceInfo) return cachedDeviceInfo;

  const storedFp = typeof window !== 'undefined' ? localStorage.getItem('secretarea_device_fingerprint') : null;

  const screenRes = typeof window !== 'undefined' && window.screen 
    ? `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}` 
    : '1920x1080x24';
  
  const userLang = typeof navigator !== 'undefined' ? (navigator.language || 'en') : 'en';
  const timeZone = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC';
  const hwConcurrency = typeof navigator !== 'undefined' ? (navigator.hardwareConcurrency || 4) : 4;
  const platform = typeof navigator !== 'undefined' ? (navigator.platform || 'unknown') : 'unknown';

  const canvasFp = getCanvasFingerprint();
  const webglFp = getWebGLFingerprint();

  const entropyComponents = [
    screenRes,
    userLang,
    timeZone,
    hwConcurrency,
    platform,
    canvasFp,
    webglFp
  ].join('||');

  const generatedHash = 'fp_' + hashString(entropyComponents);
  const finalFingerprint = storedFp || generatedHash;

  if (typeof window !== 'undefined' && !storedFp) {
    try {
      localStorage.setItem('secretarea_device_fingerprint', finalFingerprint);
    } catch (e) {}
  }

  // Fetch real IP from backend /api/client-info
  let ipAddress = '127.0.0.1';
  try {
    const res = await fetch('/api/client-info');
    if (res.ok) {
      const data = await res.json();
      if (data.ip) ipAddress = data.ip;
    }
  } catch (e) {
    // Non-blocking fallback
  }

  cachedDeviceInfo = {
    fingerprint: finalFingerprint,
    ip: ipAddress,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    screenResolution: screenRes,
    language: userLang,
    timezone: timeZone
  };

  return cachedDeviceInfo;
}

// Check if current device is stored in bannedDevices collection or locally banned
export async function isCurrentDeviceBanned(): Promise<{ isBanned: boolean; record?: BannedDeviceRecord }> {
  if (typeof window === 'undefined') return { isBanned: false };

  // 1. Instant local storage check
  if (
    localStorage.getItem('secretarea_device_banned') === 'true' ||
    localStorage.getItem('secretarea_device_blacklisted') === 'true' ||
    localStorage.getItem('secretarea_device_removed') === 'true'
  ) {
    return {
      isBanned: true,
      record: {
        fingerprint: localStorage.getItem('secretarea_device_fingerprint') || 'unknown',
        bannedAt: new Date().toISOString(),
        reason: 'Device permanently banned from SecretArea'
      }
    };
  }

  // 2. Query Firestore bannedDevices collection
  try {
    const device = await getDeviceInformation();
    const docRef = doc(db, 'bannedDevices', device.fingerprint);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data() as BannedDeviceRecord;
      // Mark locally so subsequent checks are instant
      localStorage.setItem('secretarea_device_banned', 'true');
      return { isBanned: true, record: data };
    }
  } catch (err) {
    console.warn('Could not query bannedDevices from Firestore:', err);
  }

  return { isBanned: false };
}

// Record device ban in Firestore bannedDevices collection
export async function recordDeviceBan(params: {
  fingerprint: string;
  ip?: string;
  reason?: string;
  userId?: string;
  email?: string;
  blockCount?: number;
}): Promise<void> {
  const { fingerprint, ip, reason, userId, email, blockCount } = params;
  if (!fingerprint) return;

  const record: BannedDeviceRecord = {
    fingerprint,
    ip: ip || 'unknown',
    reason: reason || 'Device permanently banned after moderation action',
    bannedAt: new Date().toISOString(),
    userId: userId || '',
    email: email || '',
    blockCount: blockCount || 3
  };

  try {
    const docRef = doc(db, 'bannedDevices', fingerprint);
    await setDoc(docRef, record, { merge: true });
  } catch (err) {
    console.warn('Could not record device ban to Firestore:', err);
  }

  // Also ban locally
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('secretarea_device_banned', 'true');
      localStorage.setItem('secretarea_device_blacklisted', 'true');
      localStorage.removeItem('secret_area_unlocked');
      localStorage.removeItem('nexa_guest_mode');
    } catch (e) {}
  }
}
