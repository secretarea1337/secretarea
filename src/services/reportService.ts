import { db, auth } from '../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as any;
  }
  if (typeof data !== 'object') {
    return data;
  }
  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) => sanitizeForFirestore(item)) as any;
  }
  const cleanObj: Record<string, any> = {};
  for (const [key, value] of Object.entries(data as Record<string, any>)) {
    if (value !== undefined) {
      cleanObj[key] = sanitizeForFirestore(value);
    }
  }
  return cleanObj as T;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

export interface ItemReport {
  id: string;
  itemId: string;
  itemName: string;
  itemCategory: string;
  itemCoverImage?: string;
  itemVersion?: string;
  downloadLinks?: Record<string, any>;
  brokenLinkType?: string;
  reason: string;
  details?: string;
  status: 'pending' | 'in_progress' | 'fixed' | 'dismissed';
  reporterType: 'user' | 'guest';
  reportedBy: {
    uid?: string;
    displayName?: string;
    email?: string;
    guestName?: string;
  };
  createdAt: string;
  fixedAt?: string;
  fixedBy?: string;
  fixedNotes?: string;
  fixedLinks?: Record<string, any>;
}

export interface ItemFix {
  itemId: string;
  itemName?: string;
  category?: string;
  fixedLinks: {
    full?: string;
    utorrent?: string;
    googleDrive?: string;
    mega?: string;
    preInstalledDownload?: string;
    preInstalledCloudDrop?: string;
    preInstalledTorrent?: string;
    mirrors?: string[];
    parts?: string[];
    [key: string]: any;
  };
  fixedVersion?: string;
  fixedNotes?: string;
  fixedAt: string;
  fixedBy: string;
}

const REPORTS_CACHE_KEY = 'secretarea_reports_cache';
const FIXES_CACHE_KEY = 'secretarea_item_fixes_cache';
const DELETED_REPORTS_CACHE_KEY = 'secretarea_deleted_reports_tombstones';

export function getDeletedReportIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_REPORTS_CACHE_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        return new Set(arr);
      }
    }
  } catch (e) {
    console.warn('Failed to parse deleted report IDs', e);
  }
  return new Set();
}

export function recordDeletedReportIds(ids: string[]): void {
  try {
    const current = getDeletedReportIds();
    ids.forEach((id) => current.add(id));
    localStorage.setItem(DELETED_REPORTS_CACHE_KEY, JSON.stringify(Array.from(current)));
  } catch (e) {
    console.warn('Failed to record deleted report IDs', e);
  }
}

export function getCachedReports(): ItemReport[] {
  try {
    const deletedIds = getDeletedReportIds();
    const raw = localStorage.getItem(REPORTS_CACHE_KEY);
    if (raw) {
      const parsed: ItemReport[] = JSON.parse(raw);
      return parsed
        .filter((r) => !deletedIds.has(r.id))
        .map((r) => ({
          ...r,
          fixedBy: r.fixedBy && r.fixedBy.includes('@') ? 'Admin' : (r.fixedBy || (r.status === 'fixed' ? 'Admin' : undefined)),
        }));
    }
  } catch (e) {
    console.warn('Failed to parse cached reports', e);
  }
  return [];
}

export const reportSubscribers = new Set<(reports: ItemReport[]) => void>();

export function notifyReportsChanged(reports?: ItemReport[]): void {
  const current = reports || getCachedReports();
  reportSubscribers.forEach((cb) => {
    try {
      cb(current);
    } catch (e) {
      console.error('Error in report subscriber callback:', e);
    }
  });
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('secretarea_reports_changed', { detail: current }));
  }
}

export function saveCachedReports(reports: ItemReport[], notify: boolean = true): void {
  try {
    const sanitized = reports.map((r) => ({
      ...r,
      fixedBy: r.fixedBy && r.fixedBy.includes('@') ? 'Admin' : (r.fixedBy || (r.status === 'fixed' ? 'Admin' : undefined)),
    }));
    localStorage.setItem(REPORTS_CACHE_KEY, JSON.stringify(sanitized));
    if (notify) {
      notifyReportsChanged(sanitized);
    }
  } catch (e) {
    console.warn('Failed to save cached reports', e);
  }
}

export function getCachedFixes(): Record<string, ItemFix> {
  try {
    const raw = localStorage.getItem(FIXES_CACHE_KEY);
    if (raw) {
      const parsed: Record<string, ItemFix> = JSON.parse(raw);
      Object.keys(parsed).forEach((k) => {
        if (parsed[k]?.fixedBy?.includes('@')) {
          parsed[k].fixedBy = 'Admin';
        }
      });
      return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse cached fixes', e);
  }
  return {};
}

export function saveCachedFixes(fixes: Record<string, ItemFix>): void {
  try {
    const sanitized: Record<string, ItemFix> = {};
    Object.keys(fixes).forEach((k) => {
      sanitized[k] = {
        ...fixes[k],
        fixedBy: fixes[k]?.fixedBy?.includes('@') ? 'Admin' : (fixes[k]?.fixedBy || 'Admin'),
      };
    });
    localStorage.setItem(FIXES_CACHE_KEY, JSON.stringify(sanitized));
  } catch (e) {
    console.warn('Failed to save cached fixes', e);
  }
}

/**
 * Submit a report from a user or guest.
 */
export async function submitReport(reportData: {
  itemId: string;
  itemName: string;
  itemCategory: string;
  itemCoverImage?: string;
  itemVersion?: string;
  downloadLinks?: Record<string, any>;
  brokenLinkType?: string;
  reason: string;
  details?: string;
  reporterType: 'user' | 'guest';
  reportedBy: {
    uid?: string;
    displayName?: string;
    email?: string;
    guestName?: string;
  };
}): Promise<ItemReport> {
  const reportId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const fullReport: ItemReport = {
    ...reportData,
    id: reportId,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  // Optimistically cache locally first
  const cached = getCachedReports();
  const updatedCache = [fullReport, ...cached.filter((r) => r.id !== reportId)];
  saveCachedReports(updatedCache);

  try {
    const docRef = doc(db, 'reports', reportId);
    const sanitized = sanitizeForFirestore(fullReport);
    await setDoc(docRef, sanitized);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `reports/${reportId}`);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('secretarea_report_submitted', { detail: fullReport }));
  }

  return fullReport;
}

/**
 * Real-time subscription to reports for the Admin Page and Navbar badge.
 */
export function subscribeReports(onUpdate: (reports: ItemReport[]) => void): () => void {
  // Register in memory broadcast list
  reportSubscribers.add(onUpdate);

  // Immediately notify with cached reports
  const initialCache = getCachedReports();
  onUpdate(initialCache);

  const handleCustomChange = (e: any) => {
    if (e.detail && Array.isArray(e.detail)) {
      onUpdate(e.detail);
    } else {
      onUpdate(getCachedReports());
    }
  };

  const handleReportAction = () => {
    onUpdate(getCachedReports());
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('secretarea_reports_changed', handleCustomChange);
    window.addEventListener('secretarea_report_deleted', handleReportAction);
    window.addEventListener('secretarea_report_updated', handleCustomChange);
    window.addEventListener('secretarea_item_fixed', handleCustomChange);
    window.addEventListener('secretarea_report_submitted', handleReportAction);
    window.addEventListener('storage', handleReportAction);
  }

  try {
    const colRef = collection(db, 'reports');
    const unsubscribeSnapshot = onSnapshot(
      colRef,
      (snapshot) => {
        const deletedIds = getDeletedReportIds();
        const reports: ItemReport[] = [];
        snapshot.forEach((d) => {
          if (!deletedIds.has(d.id)) {
            const data = d.data() as ItemReport;
            reports.push({ ...data, id: d.id });
          }
        });

        // Merge with local storage in case of any offline/unsynced entries
        const local = getCachedReports();
        const mergedMap = new Map<string, ItemReport>();
        
        // Remote first (ignoring tombstones)
        reports.forEach((r) => {
          if (!deletedIds.has(r.id)) {
            mergedMap.set(r.id, r);
          }
        });
        // Fill any local-only entries (ignoring tombstones)
        local.forEach((r) => {
          if (!deletedIds.has(r.id) && !mergedMap.has(r.id)) {
            mergedMap.set(r.id, r);
          }
        });

        const sorted = Array.from(mergedMap.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        saveCachedReports(sorted, false);
        onUpdate(sorted);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'reports');
        // Fallback to cached
        onUpdate(getCachedReports());
      }
    );

    return () => {
      reportSubscribers.delete(onUpdate);
      if (typeof window !== 'undefined') {
        window.removeEventListener('secretarea_reports_changed', handleCustomChange);
        window.removeEventListener('secretarea_report_deleted', handleReportAction);
        window.removeEventListener('secretarea_report_updated', handleCustomChange);
        window.removeEventListener('secretarea_item_fixed', handleCustomChange);
        window.removeEventListener('secretarea_report_submitted', handleReportAction);
        window.removeEventListener('storage', handleReportAction);
      }
      unsubscribeSnapshot();
    };
  } catch (err) {
    console.warn('Reports subscription fallback to local cache:', err);
    onUpdate(getCachedReports());
    return () => {
      reportSubscribers.delete(onUpdate);
      if (typeof window !== 'undefined') {
        window.removeEventListener('secretarea_reports_changed', handleCustomChange);
        window.removeEventListener('secretarea_report_deleted', handleReportAction);
        window.removeEventListener('secretarea_report_updated', handleCustomChange);
        window.removeEventListener('secretarea_item_fixed', handleCustomChange);
        window.removeEventListener('secretarea_report_submitted', handleReportAction);
        window.removeEventListener('storage', handleReportAction);
      }
    };
  }
}

/**
 * Update report status (e.g. In Progress, Dismissed, Fixed).
 */
export async function updateReportStatus(
  reportId: string,
  status: ItemReport['status'],
  notes?: string,
  adminEmail?: string
): Promise<void> {
  const now = new Date().toISOString();
  const partialUpdate: Partial<ItemReport> = {
    status,
    ...(status === 'fixed' ? { fixedAt: now, fixedBy: 'Admin' } : {}),
    ...(notes !== undefined ? { fixedNotes: notes } : {}),
  };

  // Update local cache
  const cached = getCachedReports();
  const updatedCache = cached.map((r) => (r.id === reportId ? { ...r, ...partialUpdate } : r));
  saveCachedReports(updatedCache);

  try {
    const docRef = doc(db, 'reports', reportId);
    const sanitized = sanitizeForFirestore(partialUpdate);
    const cachedFull = cached.find((r) => r.id === reportId);
    if (cachedFull) {
      await setDoc(docRef, sanitizeForFirestore({ ...cachedFull, ...partialUpdate }), { merge: true });
    } else {
      await setDoc(docRef, sanitized, { merge: true });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `reports/${reportId}`);
  }

  if (typeof window !== 'undefined') {
    const targetReport = cached.find((r) => r.id === reportId);
    window.dispatchEvent(
      new CustomEvent('secretarea_report_updated', {
        detail: {
          reportId,
          status,
          itemId: targetReport?.itemId,
          report: targetReport ? { ...targetReport, ...partialUpdate } : undefined,
        },
      })
    );
  }
}

/**
 * Batch update report status for all reports belonging to an itemId.
 */
export async function updateReportsStatusForItemId(
  itemId: string,
  status: ItemReport['status'],
  notes?: string,
  adminEmail?: string
): Promise<void> {
  const cached = getCachedReports();
  const matching = cached.filter((r) => r.itemId === itemId);
  if (matching.length === 0) return;

  const now = new Date().toISOString();
  const partialUpdate: Partial<ItemReport> = {
    status,
    ...(status === 'fixed' ? { fixedAt: now, fixedBy: 'Admin' } : {}),
    ...(notes !== undefined ? { fixedNotes: notes } : {}),
  };

  const updatedCache = cached.map((r) =>
    r.itemId === itemId ? { ...r, ...partialUpdate } : r
  );
  saveCachedReports(updatedCache);

  // Firestore update
  await Promise.allSettled(
    matching.map(async (r) => {
      try {
        const docRef = doc(db, 'reports', r.id);
        await setDoc(docRef, sanitizeForFirestore({ ...r, ...partialUpdate }), { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `reports/${r.id}`);
      }
    })
  );

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('secretarea_report_updated', {
        detail: { itemId, status, count: matching.length },
      })
    );
  }
}

/**
 * Get active report for an item (e.g. pending, in_progress, fixed)
 */
export function getItemActiveReport(itemId?: string): ItemReport | undefined {
  if (!itemId) return undefined;
  const all = getCachedReports();
  const matching = all.filter((r) => r.itemId === itemId);
  if (matching.length === 0) return undefined;

  // Prioritize active or recent statuses:
  // 1. Fixed (if fixed recently within 30 days)
  // 2. In progress
  // 3. Pending
  // 4. Dismissed
  const fixed = matching.find((r) => r.status === 'fixed');
  const inProgress = matching.find((r) => r.status === 'in_progress');
  const pending = matching.find((r) => r.status === 'pending');

  if (inProgress) return inProgress;
  if (pending) return pending;
  if (fixed) return fixed;

  // Fallback to latest
  matching.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return matching[0];
}

/**
 * Get all reports matching an itemId.
 */
export function getItemReports(itemId?: string): ItemReport[] {
  if (!itemId) return [];
  const all = getCachedReports();
  return all
    .filter((r) => r.itemId === itemId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Fix an item: updates the report as fixed AND publishes the corrected links to item_fixes collection.
 */
export async function fixAndResolveReport(
  reportId: string,
  itemId: string,
  fixedLinks: Record<string, any>,
  options?: {
    itemName?: string;
    category?: string;
    fixedVersion?: string;
    fixedNotes?: string;
    adminEmail?: string;
  }
): Promise<void> {
  const now = new Date().toISOString();
  const verifierName = 'Admin';

  const itemFixData: ItemFix = {
    itemId,
    itemName: options?.itemName || '',
    category: options?.category || '',
    fixedLinks,
    fixedVersion: options?.fixedVersion || '',
    fixedNotes: options?.fixedNotes || '',
    fixedAt: now,
    fixedBy: verifierName,
  };

  // 1. Save fix locally
  const currentFixes = getCachedFixes();
  currentFixes[itemId] = itemFixData;
  saveCachedFixes(currentFixes);

  // 2. Update report status to fixed locally
  const cachedReports = getCachedReports();
  const updatedReports = cachedReports.map((r) =>
    r.id === reportId
      ? {
          ...r,
          status: 'fixed' as const,
          fixedAt: now,
          fixedBy: verifierName,
          fixedNotes: options?.fixedNotes || '',
          fixedLinks,
        }
      : r
  );
  saveCachedReports(updatedReports);

  // 3. Save to Firestore
  try {
    const fixRef = doc(db, 'item_fixes', itemId);
    await setDoc(fixRef, itemFixData);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `item_fixes/${itemId}`);
  }

  try {
    const reportRef = doc(db, 'reports', reportId);
    await updateDoc(reportRef, {
      status: 'fixed',
      fixedAt: now,
      fixedBy: verifierName,
      fixedNotes: options?.fixedNotes || '',
      fixedLinks,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `reports/${reportId}`);
  }

  // 4. Notify app listeners
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('secretarea_item_fixed', { detail: itemFixData }));
  }
}

/**
 * Delete a report from admin panel.
 */
export async function deleteReport(reportId: string): Promise<void> {
  // 1. Mark in persistent tombstone set
  recordDeletedReportIds([reportId]);

  // 2. Remove immediately from local cache
  const cached = getCachedReports();
  const targetReport = cached.find((r) => r.id === reportId);
  const updated = cached.filter((r) => r.id !== reportId);
  saveCachedReports(updated);

  // 3. Delete from Firestore
  try {
    const docRef = doc(db, 'reports', reportId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `reports/${reportId}`);
  }

  // 4. Server-side notification
  try {
    fetch('/api/admin/reports/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportIds: [reportId] }),
    }).catch(() => {});
  } catch (e) {}

  // 5. Notify app listeners
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('secretarea_report_deleted', {
        detail: { reportId, itemId: targetReport?.itemId },
      })
    );
  }
}

/**
 * Delete multiple reports in batch from admin panel.
 */
export async function deleteReports(reportIds: string[]): Promise<void> {
  if (!reportIds || reportIds.length === 0) return;
  // 1. Mark all in persistent tombstone set
  recordDeletedReportIds(reportIds);

  const idSet = new Set(reportIds);
  const cached = getCachedReports();
  const affectedItemIds = new Set<string>();

  cached.forEach((r) => {
    if (idSet.has(r.id) && r.itemId) {
      affectedItemIds.add(r.itemId);
    }
  });

  const updated = cached.filter((r) => !idSet.has(r.id));
  saveCachedReports(updated);

  // 3. Delete each from Firestore
  await Promise.allSettled(
    reportIds.map(async (id) => {
      try {
        const docRef = doc(db, 'reports', id);
        await deleteDoc(docRef);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `reports/${id}`);
      }
    })
  );

  // 4. Server-side notification
  try {
    fetch('/api/admin/reports/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportIds }),
    }).catch(() => {});
  } catch (e) {}

  // 5. Notify app listeners
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('secretarea_report_deleted', {
        detail: { reportIds, affectedItemIds: Array.from(affectedItemIds) },
      })
    );
  }
}

/**
 * Delete all reports for a specific itemId.
 */
export async function deleteReportsByItemId(itemId: string): Promise<void> {
  const cached = getCachedReports();
  const targetIds = cached.filter((r) => r.itemId === itemId).map((r) => r.id);
  if (targetIds.length > 0) {
    await deleteReports(targetIds);
  }
}

/**
 * Real-time subscription to item fixes so detail pages show updated links immediately.
 */
export function subscribeItemFixes(onUpdate: (fixes: Record<string, ItemFix>) => void): () => void {
  // Initial cached emit
  const initialCache = getCachedFixes();
  onUpdate(initialCache);

  try {
    const colRef = collection(db, 'item_fixes');
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const fixes: Record<string, ItemFix> = { ...getCachedFixes() };
        snapshot.forEach((d) => {
          fixes[d.id] = d.data() as ItemFix;
        });
        saveCachedFixes(fixes);
        onUpdate(fixes);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'item_fixes');
        onUpdate(getCachedFixes());
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Item fixes subscription fallback to local cache:', err);
    onUpdate(getCachedFixes());
    return () => {};
  }
}

/**
 * Helper to merge an item with any admin fixes.
 */
export function mergeItemWithFix(item: any, fix?: ItemFix | null): any {
  if (!fix || !fix.fixedLinks) return item;

  const currentLinks = item.links || {};
  const mergedLinks = {
    ...currentLinks,
    ...fix.fixedLinks,
    preInstalled: {
      ...(currentLinks.preInstalled || {}),
      ...(fix.fixedLinks.preInstalled || {}),
      download: fix.fixedLinks.preInstalledDownload || currentLinks.preInstalled?.download,
      cloudDrop: fix.fixedLinks.preInstalledCloudDrop || currentLinks.preInstalled?.cloudDrop,
      torrent: fix.fixedLinks.preInstalledTorrent || currentLinks.preInstalled?.torrent,
    },
  };

  return {
    ...item,
    version: fix.fixedVersion || item.version,
    isFixedByAdmin: true,
    adminFixNotes: fix.fixedNotes,
    links: mergedLinks,
  };
}
