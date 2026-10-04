import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TbFileText, 
  TbAlertTriangle, 
  TbClock, 
  TbCircleCheck, 
  TbSearch, 
  TbExternalLink, 
  TbTrash, 
  TbX, 
  TbCheck, 
  TbAlertCircle, 
  TbDeviceGamepad2,
  TbRefresh,
  TbLinkOff,
  TbDownload,
  TbUser,
  TbGhost,
  TbCopy,
  TbFolder,
  TbChevronDown,
  TbChevronUp,
  TbLayersLinked,
  TbListDetails,
  TbFilter,
  TbFlame,
  TbCheckbox,
  TbChecklist,
  TbSparkles,
  TbTools,
  TbLink
} from 'react-icons/tb';
import { useLanguage } from '../src/contexts/LanguageContext';
import { auth } from '../src/firebase';
import { 
  ItemReport, 
  subscribeReports, 
  updateReportStatus, 
  deleteReport,
  deleteReports,
  deleteReportsByItemId,
  updateReportsStatusForItemId,
  fixAndResolveReport,
  getCachedReports 
} from '../src/services/reportService';

interface AdminReportsManagerProps {
  adminEmail?: string;
  onOpenItem?: (itemId: string, category?: string) => void;
}

export interface OrganicCluster {
  itemId: string;
  itemName: string;
  itemCategory: string;
  itemCoverImage?: string;
  itemVersion?: string;
  downloadLinks?: Record<string, any>;
  reports: ItemReport[];
  totalReports: number;
  pendingCount: number;
  inProgressCount: number;
  fixedCount: number;
  dismissedCount: number;
  reporters: { name: string; type: 'user' | 'guest'; email?: string }[];
  brokenLinkTypes: { type: string; count: number }[];
  firstReportedAt: string;
  latestReportedAt: string;
  primaryStatus: ItemReport['status'];
}

export const AdminReportsManager: React.FC<AdminReportsManagerProps> = ({
  adminEmail,
  onOpenItem,
}) => {
  const { t, dir } = useLanguage();
  const isRtl = dir === 'rtl';

  const [reports, setReports] = useState<ItemReport[]>(() => getCachedReports());
  const [viewMode, setViewMode] = useState<'organic' | 'stream'>('organic');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'fixed' | 'dismissed' | 'high_volume'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'reposts' | 'newest' | 'oldest'>('reposts');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Expanded clusters state (map itemId -> boolean)
  const [expandedClusters, setExpandedClusters] = useState<Record<string, boolean>>({});

  // Multi-select for bulk delete
  const [selectedReportIds, setSelectedReportIds] = useState<Set<string>>(new Set());

  // Subscribe to real-time reports
  useEffect(() => {
    const unsubscribe = subscribeReports((updated) => {
      setReports(updated);
    });
    return () => unsubscribe();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setActionNotice({ message, type });
    setTimeout(() => setActionNotice(null), 3500);
  };

  const toggleClusterExpand = (itemId: string) => {
    setExpandedClusters((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const handleSelectReport = (reportId: string) => {
    setSelectedReportIds((prev) => {
      const next = new Set(prev);
      if (next.has(reportId)) {
        next.delete(reportId);
      } else {
        next.add(reportId);
      }
      return next;
    });
  };

  const handleSelectCluster = (clusterReports: ItemReport[]) => {
    setSelectedReportIds((prev) => {
      const next = new Set(prev);
      const allSelected = clusterReports.every((r) => next.has(r.id));
      if (allSelected) {
        clusterReports.forEach((r) => next.delete(r.id));
      } else {
        clusterReports.forEach((r) => next.add(r.id));
      }
      return next;
    });
  };

  const handleStatusChange = async (reportId: string, newStatus: ItemReport['status']) => {
    try {
      await updateReportStatus(reportId, newStatus, undefined, 'Admin');
      showToast(`${t('Report status updated to') || 'Status updated to'}: ${t(newStatus) || newStatus}`);
    } catch (err: any) {
      showToast(err?.message || 'Failed to update status', 'error');
    }
  };

  const handleClusterStatusChange = async (itemId: string, itemName: string, newStatus: ItemReport['status']) => {
    try {
      await updateReportsStatusForItemId(itemId, newStatus, undefined, 'Admin');
      showToast(`${t('All reports for') || 'All reports for'} "${itemName}" ${t('updated to') || 'updated to'}: ${t(newStatus) || newStatus}`);
    } catch (err: any) {
      showToast(err?.message || 'Failed to batch update status', 'error');
    }
  };

  // In-app interactive Fix Broken Links modal state
  const [fixModal, setFixModal] = useState<{
    isOpen: boolean;
    reportId?: string;
    itemId: string;
    itemName: string;
    category?: string;
    version?: string;
    currentLinks?: Record<string, any>;
  } | null>(null);

  const [fixDirectLink, setFixDirectLink] = useState('');
  const [fixTorrentLink, setFixTorrentLink] = useState('');
  const [fixMegaLink, setFixMegaLink] = useState('');
  const [fixGdriveLink, setFixGdriveLink] = useState('');
  const [fixNotes, setFixNotes] = useState('');
  const [isSubmittingFix, setIsSubmittingFix] = useState(false);

  const openFixModal = (params: {
    reportId?: string;
    itemId: string;
    itemName: string;
    category?: string;
    version?: string;
    downloadLinks?: Record<string, any>;
  }) => {
    const dl = params.downloadLinks || {};
    setFixDirectLink(dl.full || '');
    setFixTorrentLink(dl.utorrent || '');
    setFixMegaLink(dl.mega || '');
    setFixGdriveLink(dl.googleDrive || '');
    setFixNotes('');
    setFixModal({
      isOpen: true,
      reportId: params.reportId,
      itemId: params.itemId,
      itemName: params.itemName,
      category: params.category,
      version: params.version,
      currentLinks: dl,
    });
  };

  const handleApplyFix = async () => {
    if (!fixModal) return;
    setIsSubmittingFix(true);
    try {
      const fixedLinks: Record<string, any> = {
        ...(fixModal.currentLinks || {}),
      };
      if (fixDirectLink.trim()) fixedLinks.full = fixDirectLink.trim();
      if (fixTorrentLink.trim()) fixedLinks.utorrent = fixTorrentLink.trim();
      if (fixMegaLink.trim()) fixedLinks.mega = fixMegaLink.trim();
      if (fixGdriveLink.trim()) fixedLinks.googleDrive = fixGdriveLink.trim();

      const repId = fixModal.reportId || `cluster-fix-${fixModal.itemId}`;
      await fixAndResolveReport(
        repId,
        fixModal.itemId,
        fixedLinks,
        {
          itemName: fixModal.itemName,
          category: fixModal.category,
          fixedVersion: fixModal.version,
          fixedNotes: fixNotes.trim(),
          adminEmail,
        }
      );

      // Also update all reports for this itemId to fixed status
      await updateReportsStatusForItemId(fixModal.itemId, 'fixed', undefined, 'Admin');

      showToast(`${t('Successfully fixed links for') || 'Fixed links for'} "${fixModal.itemName}"`);
      setFixModal(null);
    } catch (err: any) {
      showToast(err?.message || 'Failed to save fix', 'error');
    } finally {
      setIsSubmittingFix(false);
    }
  };

  // In-app interactive confirmation modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    onConfirm: () => Promise<void>;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteReport = (reportId: string, itemName: string) => {
    setDeleteModal({
      isOpen: true,
      title: t('Delete Report') || 'Delete Report',
      description: `${t('Delete report for') || 'Delete report for'} "${itemName}"? ${t('This report will be permanently removed.') || 'This report will be permanently removed.'}`,
      confirmText: t('Delete Report') || 'Delete Report',
      onConfirm: async () => {
        await deleteReport(reportId);
        setSelectedReportIds((prev) => {
          const next = new Set(prev);
          next.delete(reportId);
          return next;
        });
        showToast(`${t('Report deleted') || 'Report deleted'}: "${itemName}"`);
      },
    });
  };

  const handleDeleteCluster = (itemId: string, itemName: string, count: number) => {
    setDeleteModal({
      isOpen: true,
      title: t('Delete All Reports') || 'Delete All Reports',
      description: `${t('Delete all') || 'Delete all'} ${count} ${t('reports for') || 'reports for'} "${itemName}"? ${t('All reports in this cluster will be permanently erased.') || 'All reports in this cluster will be permanently erased.'}`,
      confirmText: `${t('Delete All') || 'Delete All'} (${count})`,
      onConfirm: async () => {
        await deleteReportsByItemId(itemId);
        showToast(`${t('Deleted all') || 'Deleted all'} ${count} ${t('reports for') || 'reports for'} "${itemName}"`);
      },
    });
  };

  const handleBulkDeleteSelected = () => {
    const count = selectedReportIds.size;
    if (count === 0) return;
    setDeleteModal({
      isOpen: true,
      title: t('Delete Selected Reports') || 'Delete Selected Reports',
      description: `${t('Delete selected') || 'Delete selected'} ${count} ${t('report(s)?') || 'report(s)?'} ${t('This action cannot be undone.') || 'This action cannot be undone.'}`,
      confirmText: `${t('Delete') || 'Delete'} ${count} ${t('Reports') || 'Reports'}`,
      onConfirm: async () => {
        await deleteReports(Array.from(selectedReportIds));
        setSelectedReportIds(new Set());
        showToast(`${t('Successfully deleted') || 'Successfully deleted'} ${count} ${t('reports') || 'reports'}`);
      },
    });
  };

  const handleClearDismissed = () => {
    const dismissedIds = reports.filter((r) => r.status === 'dismissed').map((r) => r.id);
    if (dismissedIds.length === 0) {
      showToast(t('No dismissed reports to clear') || 'No dismissed reports to clear', 'error');
      return;
    }
    setDeleteModal({
      isOpen: true,
      title: t('Clear Dismissed Reports') || 'Clear Dismissed Reports',
      description: `${t('Clear all') || 'Clear all'} ${dismissedIds.length} ${t('dismissed reports permanently?') || 'dismissed reports permanently?'}`,
      confirmText: `${t('Clear Dismissed') || 'Clear Dismissed'} (${dismissedIds.length})`,
      onConfirm: async () => {
        await deleteReports(dismissedIds);
        showToast(`${t('Cleared') || 'Cleared'} ${dismissedIds.length} ${t('dismissed reports') || 'dismissed reports'}`);
      },
    });
  };

  const handleClearFixed = () => {
    const fixedIds = reports.filter((r) => r.status === 'fixed').map((r) => r.id);
    if (fixedIds.length === 0) {
      showToast(t('No fixed reports to clear') || 'No fixed reports to clear', 'error');
      return;
    }
    setDeleteModal({
      isOpen: true,
      title: t('Clear Fixed Reports') || 'Clear Fixed Reports',
      description: `${t('Clear all') || 'Clear all'} ${fixedIds.length} ${t('fixed reports permanently?') || 'fixed reports permanently?'}`,
      confirmText: `${t('Clear Fixed') || 'Clear Fixed'} (${fixedIds.length})`,
      onConfirm: async () => {
        await deleteReports(fixedIds);
        showToast(`${t('Cleared') || 'Cleared'} ${fixedIds.length} ${t('fixed reports') || 'fixed reports'}`);
      },
    });
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(label);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  // Human-readable labels for brokenLinkType
  const getBrokenLinkTypeLabel = (type?: string): string => {
    if (!type) return t('All Links / General Download') || 'All Links / General Download';
    const lower = type.toLowerCase();
    if (lower === 'all') return t('All Links / General Download') || 'All Links / General Download';
    if (lower === 'full') return t('Direct Download / Master Magnet') || 'Direct Download / Master Magnet';
    if (lower === 'utorrent') return t('Torrent / Magnet Link') || 'Torrent / Magnet Link';
    if (lower === 'preinstalled') return t('Pre-Installed / Direct Play') || 'Pre-Installed / Direct Play';
    if (lower === 'mirrors') return t('Backup Mirrors / Parts Links') || 'Backup Mirrors / Parts Links';
    if (lower === 'gdrive' || lower === 'googledrive') return t('Google Drive') || 'Google Drive';
    if (lower === 'mega') return t('Mega Mirror') || 'Mega Mirror';
    return type;
  };

  // 1. Group reports into Organic Clusters
  const organicClusters = useMemo<OrganicCluster[]>(() => {
    const map = new Map<string, ItemReport[]>();

    reports.forEach((rep) => {
      const key = rep.itemId || rep.itemName || rep.id;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(rep);
    });

    const clusters: OrganicCluster[] = [];

    map.forEach((clusterReports, key) => {
      // Sort internal reports descending by date
      clusterReports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const first = clusterReports[0];
      const pendingCount = clusterReports.filter((r) => r.status === 'pending').length;
      const inProgressCount = clusterReports.filter((r) => r.status === 'in_progress').length;
      const fixedCount = clusterReports.filter((r) => r.status === 'fixed').length;
      const dismissedCount = clusterReports.filter((r) => r.status === 'dismissed').length;

      // Group broken link types
      const linkTypeCounts: Record<string, number> = {};
      clusterReports.forEach((r) => {
        const typeKey = r.brokenLinkType || 'all';
        linkTypeCounts[typeKey] = (linkTypeCounts[typeKey] || 0) + 1;
      });
      const brokenLinkTypes = Object.entries(linkTypeCounts).map(([type, count]) => ({ type, count }));

      // Unique reporters
      const reporterMap = new Map<string, { name: string; type: 'user' | 'guest'; email?: string }>();
      clusterReports.forEach((r) => {
        const name = r.reportedBy?.displayName || r.reportedBy?.guestName || (r.reporterType === 'user' ? 'User' : 'Guest');
        const idKey = r.reportedBy?.uid || r.reportedBy?.email || name;
        if (!reporterMap.has(idKey)) {
          reporterMap.set(idKey, {
            name,
            type: r.reporterType,
            email: r.reportedBy?.email,
          });
        }
      });

      // Primary status determination (pending > in_progress > fixed > dismissed)
      let primaryStatus: ItemReport['status'] = 'dismissed';
      if (pendingCount > 0) primaryStatus = 'pending';
      else if (inProgressCount > 0) primaryStatus = 'in_progress';
      else if (fixedCount > 0) primaryStatus = 'fixed';

      // Timestamps
      const timestamps = clusterReports.map((r) => new Date(r.createdAt).getTime());
      const minTime = Math.min(...timestamps);
      const maxTime = Math.max(...timestamps);

      clusters.push({
        itemId: first.itemId || key,
        itemName: first.itemName || 'Unknown Item',
        itemCategory: first.itemCategory || 'general',
        itemCoverImage: first.itemCoverImage,
        itemVersion: first.itemVersion,
        downloadLinks: first.downloadLinks,
        reports: clusterReports,
        totalReports: clusterReports.length,
        pendingCount,
        inProgressCount,
        fixedCount,
        dismissedCount,
        reporters: Array.from(reporterMap.values()),
        brokenLinkTypes,
        firstReportedAt: new Date(minTime).toISOString(),
        latestReportedAt: new Date(maxTime).toISOString(),
        primaryStatus,
      });
    });

    // Sorting
    if (sortBy === 'reposts') {
      clusters.sort((a, b) => {
        if (b.totalReports !== a.totalReports) return b.totalReports - a.totalReports;
        return new Date(b.latestReportedAt).getTime() - new Date(a.latestReportedAt).getTime();
      });
    } else if (sortBy === 'newest') {
      clusters.sort((a, b) => new Date(b.latestReportedAt).getTime() - new Date(a.latestReportedAt).getTime());
    } else {
      clusters.sort((a, b) => new Date(a.firstReportedAt).getTime() - new Date(b.firstReportedAt).getTime());
    }

    return clusters;
  }, [reports, sortBy]);

  // Filter organic clusters
  const filteredClusters = useMemo(() => {
    return organicClusters.filter((c) => {
      // Status filter
      if (statusFilter === 'pending' && c.pendingCount === 0) return false;
      if (statusFilter === 'in_progress' && c.inProgressCount === 0) return false;
      if (statusFilter === 'fixed' && c.fixedCount === 0) return false;
      if (statusFilter === 'dismissed' && c.dismissedCount === 0) return false;
      if (statusFilter === 'high_volume' && c.totalReports < 2) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = c.itemName?.toLowerCase().includes(q);
        const matchId = c.itemId?.toLowerCase().includes(q);
        const matchCat = c.itemCategory?.toLowerCase().includes(q);
        const matchReporters = c.reporters.some((r) => r.name.toLowerCase().includes(q) || r.email?.toLowerCase().includes(q));
        const matchReasons = c.reports.some((r) => r.reason?.toLowerCase().includes(q) || r.details?.toLowerCase().includes(q));
        if (!matchName && !matchId && !matchCat && !matchReporters && !matchReasons) return false;
      }
      return true;
    });
  }, [organicClusters, statusFilter, searchQuery]);

  // Filtered raw stream reports
  const filteredStreamReports = useMemo(() => {
    let list = reports.filter((r) => {
      if (statusFilter === 'pending' && r.status !== 'pending') return false;
      if (statusFilter === 'in_progress' && r.status !== 'in_progress') return false;
      if (statusFilter === 'fixed' && r.status !== 'fixed') return false;
      if (statusFilter === 'dismissed' && r.status !== 'dismissed') return false;
      if (statusFilter === 'high_volume') {
        const cluster = organicClusters.find((c) => c.itemId === r.itemId);
        if (!cluster || cluster.totalReports < 2) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = r.itemName?.toLowerCase().includes(q);
        const matchId = r.itemId?.toLowerCase().includes(q);
        const matchUser = r.reportedBy?.displayName?.toLowerCase().includes(q) || r.reportedBy?.email?.toLowerCase().includes(q);
        const matchReason = r.reason?.toLowerCase().includes(q);
        const matchDetails = r.details?.toLowerCase().includes(q);
        const matchLink = r.brokenLinkType?.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchUser && !matchReason && !matchDetails && !matchLink) return false;
      }
      return true;
    });

    if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'oldest') {
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    return list;
  }, [reports, statusFilter, searchQuery, sortBy, organicClusters]);

  // Aggregate metrics
  const pendingCount = reports.filter((r) => r.status === 'pending').length;
  const inProgressCount = reports.filter((r) => r.status === 'in_progress').length;
  const fixedCount = reports.filter((r) => r.status === 'fixed').length;
  const dismissedCount = reports.filter((r) => r.status === 'dismissed').length;
  const highVolumeClustersCount = organicClusters.filter((c) => c.totalReports >= 2).length;

  return (
    <div className="space-y-6" dir={dir}>
      {/* Action Toast Notice */}
      <AnimatePresence>
        {actionNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`fixed top-20 end-6 z-[99999] px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2 backdrop-blur-md ${
              actionNotice.type === 'error'
                ? 'bg-rose-500/95 text-white border-rose-600 shadow-rose-500/20'
                : 'bg-emerald-500/95 text-white border-emerald-600 shadow-emerald-500/20'
            }`}
          >
            {actionNotice.type === 'error' ? <TbAlertCircle size={18} /> : <TbCheck size={18} />}
            <span>{actionNotice.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Metrics Header */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        <div
          onClick={() => setStatusFilter('all')}
          className={`p-3 sm:p-3.5 rounded-2xl border cursor-pointer transition-all min-w-0 ${
            statusFilter === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-md ring-2 ring-slate-400/20'
              : 'bg-white dark:bg-[#111623] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-bold truncate">{t('All Reports') || 'All Reports'}</span>
            <TbFileText size={16} className="opacity-70 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-black mt-1 truncate">{reports.length}</p>
          <span className="text-[10px] opacity-75 truncate block">{organicClusters.length} {t('Items') || 'Items'}</span>
        </div>

        <div
          onClick={() => setStatusFilter('high_volume')}
          className={`p-3 sm:p-3.5 rounded-2xl border cursor-pointer transition-all min-w-0 ${
            statusFilter === 'high_volume'
              ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white border-transparent shadow-md ring-2 ring-rose-500/30'
              : 'bg-white dark:bg-[#111623] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-rose-500/50'
          }`}
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-bold flex items-center gap-1 min-w-0">
              <TbFlame size={14} className="text-amber-400 animate-pulse shrink-0" />
              <span className="truncate">{t('Reposts (2+)') || 'Reposts'}</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500/20 font-bold text-rose-400 shrink-0">
              {highVolumeClustersCount}
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-black mt-1 text-rose-500 dark:text-rose-400 truncate">
            {highVolumeClustersCount}
          </p>
          <span className="text-[10px] text-slate-400 truncate block">{t('Repeated issues') || 'Concurrent'}</span>
        </div>

        <div
          onClick={() => setStatusFilter('pending')}
          className={`p-3 sm:p-3.5 rounded-2xl border cursor-pointer transition-all min-w-0 ${
            statusFilter === 'pending'
              ? 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-400/20'
              : 'bg-white dark:bg-[#111623] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-500/50'
          }`}
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-bold truncate">{t('Pending') || 'Pending'}</span>
            <TbClock size={16} className={`shrink-0 ${statusFilter === 'pending' ? 'text-white' : 'text-amber-500'}`} />
          </div>
          <p className="text-xl sm:text-2xl font-black mt-1 text-amber-500 dark:text-amber-400 truncate">
            {pendingCount}
          </p>
          <span className="text-[10px] text-slate-400 truncate block">{t('Needs action') || 'Needs action'}</span>
        </div>

        <div
          onClick={() => setStatusFilter('in_progress')}
          className={`p-3 sm:p-3.5 rounded-2xl border cursor-pointer transition-all min-w-0 ${
            statusFilter === 'in_progress'
              ? 'bg-sky-500 text-white border-sky-600 shadow-md ring-2 ring-sky-400/20'
              : 'bg-white dark:bg-[#111623] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-500/50'
          }`}
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-bold truncate">{t('In Progress') || 'In Progress'}</span>
            <TbRefresh size={16} className={`shrink-0 ${statusFilter === 'in_progress' ? 'text-white' : 'text-sky-500'}`} />
          </div>
          <p className="text-xl sm:text-2xl font-black mt-1 text-sky-500 dark:text-sky-400 truncate">
            {inProgressCount}
          </p>
          <span className="text-[10px] text-slate-400 truncate block">{t('Being fixed') || 'Being fixed'}</span>
        </div>

        <div
          onClick={() => setStatusFilter('fixed')}
          className={`p-3 sm:p-3.5 rounded-2xl border cursor-pointer transition-all min-w-0 ${
            statusFilter === 'fixed'
              ? 'bg-emerald-500 text-white border-emerald-600 shadow-md ring-2 ring-emerald-400/20'
              : 'bg-white dark:bg-[#111623] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500/50'
          }`}
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-bold truncate">{t('Fixed') || 'Fixed'}</span>
            <TbCircleCheck size={16} className={`shrink-0 ${statusFilter === 'fixed' ? 'text-white' : 'text-emerald-500'}`} />
          </div>
          <p className="text-xl sm:text-2xl font-black mt-1 text-emerald-500 dark:text-emerald-400 truncate">
            {fixedCount}
          </p>
          <span className="text-[10px] text-slate-400 truncate block">{t('Links repaired') || 'Links repaired'}</span>
        </div>

        <div
          onClick={() => setStatusFilter('dismissed')}
          className={`p-3 sm:p-3.5 rounded-2xl border cursor-pointer transition-all min-w-0 ${
            statusFilter === 'dismissed'
              ? 'bg-slate-600 text-white border-slate-700 shadow-md ring-2 ring-slate-400/20'
              : 'bg-white dark:bg-[#111623] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400'
          }`}
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-bold truncate">{t('Dismissed') || 'Dismissed'}</span>
            <TbX size={16} className={`shrink-0 ${statusFilter === 'dismissed' ? 'text-white' : 'text-slate-400'}`} />
          </div>
          <p className="text-xl sm:text-2xl font-black mt-1 text-slate-500 dark:text-slate-400 truncate">
            {dismissedCount}
          </p>
          <span className="text-[10px] text-slate-400 truncate block">{t('Closed') || 'Closed'}</span>
        </div>
      </div>

      {/* Control Bar: Mode Toggle, Search, Sort & Bulk Deletion */}
      <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#111623] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-3">
          {/* Organic View Mode Switcher */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setViewMode('organic')}
              className={`flex-1 md:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'organic'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <TbLayersLinked size={15} className="text-emerald-500 shrink-0" />
              <span className="whitespace-nowrap">{t('Organic Clustered') || 'Organic Clustered'}</span>
              {highVolumeClustersCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-rose-500/20 text-rose-500 font-extrabold shrink-0">
                  {highVolumeClustersCount} {t('Hot') || 'Hot'}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setViewMode('stream')}
              className={`flex-1 md:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'stream'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <TbListDetails size={15} className="text-sky-500 shrink-0" />
              <span className="whitespace-nowrap">{t('Chronological Stream') || 'Chronological Stream'}</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:flex-1 md:max-w-xs lg:max-w-sm">
            <div className={`absolute top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none ${isRtl ? 'right-3' : 'left-3'}`}>
              <TbSearch size={16} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('Search by game, ID, user, reason...') || 'Search reports...'}
              className={`w-full py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 ${
                isRtl ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3 text-left'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ${isRtl ? 'left-3' : 'right-3'}`}
              >
                <TbX size={14} />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-between sm:justify-end">
            <span className="text-[11px] text-slate-400 font-bold shrink-0">{t('Sort') || 'Sort'}:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="flex-1 sm:flex-initial px-3 py-1.5 sm:py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
            >
              <option value="reposts">🔥 {t('Most Reposts First') || 'Most Reposts First'}</option>
              <option value="newest">⏱ {t('Newest Activity') || 'Newest Activity'}</option>
              <option value="oldest">⌛ {t('Oldest Activity') || 'Oldest Activity'}</option>
            </select>
          </div>
        </div>

        {/* Action Toolbar: Multi-select Deletion & Clear shortcuts */}
        <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap w-full sm:w-auto">
            {selectedReportIds.size > 0 && (
              <button
                type="button"
                onClick={handleBulkDeleteSelected}
                className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 animate-pulse text-[11px] sm:text-xs"
              >
                <TbTrash size={14} />
                <span>{t('Delete Selected') || 'Delete Selected'} ({selectedReportIds.size})</span>
              </button>
            )}

            {selectedReportIds.size > 0 && (
              <button
                type="button"
                onClick={() => setSelectedReportIds(new Set())}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold hover:bg-slate-200 dark:hover:bg-slate-750 transition-colors"
              >
                {t('Deselect All') || 'Deselect All'}
              </button>
            )}

            <button
              type="button"
              onClick={handleClearDismissed}
              disabled={dismissedCount === 0}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold flex items-center gap-1.5 transition-colors disabled:opacity-40 text-[11px]"
              title={t('Permanently remove dismissed reports') || 'Permanently remove dismissed reports'}
            >
              <TbTrash size={13} className="text-slate-400" />
              <span>{t('Clean Dismissed') || 'Clean Dismissed'} ({dismissedCount})</span>
            </button>

            <button
              type="button"
              onClick={handleClearFixed}
              disabled={fixedCount === 0}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold flex items-center gap-1.5 transition-colors disabled:opacity-40 text-[11px]"
              title={t('Clear fixed reports') || 'Clear fixed reports'}
            >
              <TbTrash size={13} className="text-emerald-500" />
              <span>{t('Clean Fixed') || 'Clean Fixed'} ({fixedCount})</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 self-end sm:self-auto">
            <span>
              {viewMode === 'organic' ? (
                <>
                  <strong className="text-slate-900 dark:text-white">{filteredClusters.length}</strong> {t('clustered item(s)') || 'clustered item(s)'} ({filteredClusters.reduce((acc, c) => acc + c.totalReports, 0)} {t('reports') || 'reports'})
                </>
              ) : (
                <>
                  <strong className="text-slate-900 dark:text-white">{filteredStreamReports.length}</strong> {t('individual reports') || 'individual reports'}
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content: Organic Clustered Mode OR Chronological Stream */}
      {viewMode === 'organic' ? (
        /* ================= ORGANIC CLUSTERED VIEW ================= */
        <div className="space-y-4">
          {filteredClusters.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#111623] border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto">
                <TbFileText size={28} />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {t('No reports match your filters') || 'No reports match your filters'}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {t('When visitors or registered users report issues on item details pages, repeated reports will be organized organically here.') || 'Reports submitted by users will appear here.'}
              </p>
            </div>
          ) : (
            filteredClusters.map((cluster) => {
              const isExpanded = !!expandedClusters[cluster.itemId];
              const isMultiReport = cluster.totalReports > 1;
              const allClusterSelected = cluster.reports.every((r) => selectedReportIds.has(r.id));
              const someClusterSelected = cluster.reports.some((r) => selectedReportIds.has(r.id));

              return (
                <motion.div
                  key={cluster.itemId}
                  layout
                  className={`rounded-2xl bg-white dark:bg-[#111623] border transition-all shadow-xs overflow-hidden ${
                    cluster.primaryStatus === 'pending'
                      ? 'border-amber-500/40 bg-gradient-to-r from-amber-500/[0.03] to-transparent'
                      : cluster.primaryStatus === 'in_progress'
                      ? 'border-sky-500/40 bg-gradient-to-r from-sky-500/[0.03] to-transparent'
                      : cluster.primaryStatus === 'fixed'
                      ? 'border-emerald-500/30'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {/* Organic Cluster Header Card */}
                  <div className="p-4 sm:p-5">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      {/* Left: Thumbnail & High-Level Details */}
                      <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                        {/* Multi-select Checkbox */}
                        <div className="pt-2 shrink-0">
                          <input
                            type="checkbox"
                            checked={allClusterSelected}
                            ref={(el) => {
                              if (el) el.indeterminate = someClusterSelected && !allClusterSelected;
                            }}
                            onChange={() => handleSelectCluster(cluster.reports)}
                            className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-rose-500 focus:ring-rose-500 cursor-pointer"
                            title={t('Select all reports for this item') || 'Select all'}
                          />
                        </div>

                        {/* Thumbnail */}
                        {cluster.itemCoverImage ? (
                          <img
                            src={cluster.itemCoverImage}
                            alt={cluster.itemName}
                            className="w-14 h-16 sm:w-16 sm:h-20 rounded-xl object-cover shadow-xs shrink-0 border border-slate-200 dark:border-slate-700"
                          />
                        ) : (
                          <div className="w-14 h-16 sm:w-16 sm:h-20 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0 border border-slate-200 dark:border-slate-700">
                            <TbDeviceGamepad2 size={28} />
                          </div>
                        )}

                        {/* Info & Badges */}
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                              {cluster.itemName}
                            </h4>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                              {cluster.itemId}
                            </span>
                            {cluster.itemCategory && (
                              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20">
                                {cluster.itemCategory}
                              </span>
                            )}
                            {cluster.itemVersion && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                                {cluster.itemVersion}
                              </span>
                            )}

                            {/* ORGANIC REPOST BADGE */}
                            {isMultiReport ? (
                              <span className="flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-rose-500/20 to-amber-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse">
                                <TbFlame size={13} className="text-rose-500" />
                                <span>{cluster.totalReports} {t('Reposts Grouped') || 'Reposts Grouped'}</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                                1 {t('Report') || 'Report'}
                              </span>
                            )}
                          </div>

                          {/* Aggregate Status Pill Bar */}
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            {cluster.pendingCount > 0 && (
                              <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[11px]">
                                <TbClock size={12} />
                                <span>{cluster.pendingCount} {t('Pending') || 'Pending'}</span>
                              </span>
                            )}
                            {cluster.inProgressCount > 0 && (
                              <span className="font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-500/10 border border-sky-500/20 text-[11px]">
                                <TbRefresh size={12} />
                                <span>{cluster.inProgressCount} {t('In Progress') || 'In Progress'}</span>
                              </span>
                            )}
                            {cluster.fixedCount > 0 && (
                              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[11px]">
                                <TbCircleCheck size={12} />
                                <span>{cluster.fixedCount} {t('Fixed') || 'Fixed'}</span>
                              </span>
                            )}
                            {cluster.dismissedCount > 0 && (
                              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px]">
                                <TbX size={12} />
                                <span>{cluster.dismissedCount} {t('Dismissed') || 'Dismissed'}</span>
                              </span>
                            )}

                            <span className="text-slate-400 text-[11px] flex items-center gap-1 ms-1">
                              <span>{t('Latest') || 'Latest'}: {new Date(cluster.latestReportedAt).toLocaleTimeString()}</span>
                            </span>
                          </div>

                          {/* Broken Link Types Aggregate Summary */}
                          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                            <span className="font-bold text-rose-500 flex items-center gap-1">
                              <TbLinkOff size={13} />
                              <span>{t('Targeted Links') || 'Targeted Links'}:</span>
                            </span>
                            {cluster.brokenLinkTypes.map(({ type, count }) => (
                              <span
                                key={type}
                                className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-700 dark:text-rose-300 font-semibold border border-rose-500/20 text-[10px]"
                              >
                                {getBrokenLinkTypeLabel(type)} {count > 1 ? `(${count}x)` : ''}
                              </span>
                            ))}
                          </div>

                          {/* Distinct Reporters Roster */}
                          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                            <span className="font-medium">{t('Reporters') || 'Reporters'} ({cluster.reporters.length}):</span>
                            {cluster.reporters.slice(0, 3).map((r, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[10px]"
                              >
                                {r.type === 'user' ? (
                                  <TbUser size={11} className="text-emerald-500" />
                                ) : (
                                  <TbGhost size={11} className="text-amber-500" />
                                )}
                                <span>{r.name}</span>
                              </span>
                            ))}
                            {cluster.reporters.length > 3 && (
                              <span className="text-[10px] text-slate-400">
                                +{cluster.reporters.length - 3} {t('others') || 'others'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions (Batch status, Fix Links, Delete cluster, Preview & Expand) */}
                      <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-2.5 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800 w-full lg:w-auto">
                        {/* Quick Batch Status Dropdown for this entire cluster */}
                        <div className="w-full sm:w-auto lg:w-44">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                            {t('Batch Status') || 'Batch Status'}:
                          </label>
                          <select
                            value={cluster.primaryStatus}
                            onChange={(e) => handleClusterStatusChange(cluster.itemId, cluster.itemName, e.target.value as any)}
                            className="w-full px-3 py-1.5 rounded-xl border text-xs font-bold transition-all bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                          >
                            <option value="pending">⏱ {t('Set All Pending') || 'Set All Pending'}</option>
                            <option value="in_progress">⚡ {t('Set All In Progress') || 'Set All In Progress'}</option>
                            <option value="fixed">✓ {t('Set All Fixed') || 'Set All Fixed'}</option>
                            <option value="dismissed">✕ {t('Set All Dismissed') || 'Set All Dismissed'}</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end flex-wrap">
                          {/* Quick Fix Links button */}
                          <button
                            type="button"
                            onClick={() => openFixModal({
                              itemId: cluster.itemId,
                              itemName: cluster.itemName,
                              category: cluster.itemCategory,
                              version: cluster.itemVersion,
                              downloadLinks: cluster.downloadLinks,
                            })}
                            title={t('Fix Broken Links') || 'Fix Broken Links'}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 text-xs font-bold transition-colors cursor-pointer"
                          >
                            <TbTools size={14} />
                            <span>{t('Fix Links') || 'Fix Links'}</span>
                          </button>

                          {/* Preview / Open Item */}
                          {onOpenItem && (
                            <button
                              type="button"
                              onClick={() => onOpenItem(cluster.itemId, cluster.itemCategory)}
                              title={t('Preview Item Details') || 'Preview Item'}
                              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                            >
                              <TbExternalLink size={16} />
                            </button>
                          )}

                          {/* Delete entire cluster */}
                          <button
                            type="button"
                            onClick={() => handleDeleteCluster(cluster.itemId, cluster.itemName, cluster.totalReports)}
                            title={t('Delete all reports for this item') || 'Delete all reports for this item'}
                            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-colors shrink-0 cursor-pointer"
                          >
                            <TbTrash size={16} />
                          </button>

                          {/* Toggle Expand / Collapse Repost Drawer */}
                          <button
                            type="button"
                            onClick={() => toggleClusterExpand(cluster.itemId)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-500/10 hover:bg-primary-500/20 text-primary-600 dark:text-primary-400 text-xs font-bold transition-colors cursor-pointer"
                          >
                            <span>
                              {isExpanded
                                ? t('Collapse') || 'Collapse'
                                : `${t('View') || 'View'} ${cluster.totalReports} ${t('Reposts') || 'Reposts'}`}
                            </span>
                            {isExpanded ? <TbChevronUp size={14} /> : <TbChevronDown size={14} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Organic Repost Timeline Accordion Drawer */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-[#0d121c]/70 p-4 sm:p-5 space-y-3"
                      >
                        <div className="flex items-center justify-between pb-1">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <TbLayersLinked size={15} className="text-emerald-500" />
                            <span>{t('Individual Repost Breakdown') || 'Individual Repost Breakdown'} ({cluster.reports.length})</span>
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {t('Sorted newest to oldest') || 'Sorted newest to oldest'}
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          {cluster.reports.map((report, idx) => {
                            const isReportSelected = selectedReportIds.has(report.id);
                            const dl = report.downloadLinks || {};
                            const hasLinks = dl.full || dl.utorrent || dl.mega || dl.googleDrive || dl.preInstalled || (dl.mirrors && dl.mirrors.length > 0);

                            return (
                              <div
                                key={report.id}
                                className={`p-3.5 rounded-xl border bg-white dark:bg-[#111623] transition-all space-y-2.5 shadow-xs ${
                                  report.status === 'pending'
                                    ? 'border-amber-500/30'
                                    : report.status === 'in_progress'
                                    ? 'border-sky-500/30'
                                    : report.status === 'fixed'
                                    ? 'border-emerald-500/30'
                                    : 'border-slate-200 dark:border-slate-800'
                                }`}
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                  {/* Reporter & Time */}
                                  <div className="flex items-center gap-2.5 flex-wrap">
                                    <input
                                      type="checkbox"
                                      checked={isReportSelected}
                                      onChange={() => handleSelectReport(report.id)}
                                      className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-700 text-rose-500 focus:ring-rose-500 cursor-pointer"
                                    />
                                    <span className="text-[11px] font-mono font-bold text-slate-400">
                                      #{idx + 1}
                                    </span>
                                    <div className="flex items-center gap-1 text-xs font-bold text-slate-800 dark:text-slate-200">
                                      {report.reporterType === 'user' ? (
                                        <TbUser size={13} className="text-emerald-500" />
                                      ) : (
                                        <TbGhost size={13} className="text-amber-500" />
                                      )}
                                      <span>{report.reportedBy?.displayName || report.reportedBy?.guestName || 'Anonymous'}</span>
                                    </div>
                                    {report.reportedBy?.email && (
                                      <span className="text-[11px] font-mono text-slate-400">
                                        ({report.reportedBy.email})
                                      </span>
                                    )}
                                    <span
                                      className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-bold border ${
                                        report.reporterType === 'user'
                                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                      }`}
                                    >
                                      {report.reporterType === 'user' ? t('Verified') || 'Verified' : t('Guest') || 'Guest'}
                                    </span>
                                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                      <TbClock size={11} />
                                      <span>{new Date(report.createdAt).toLocaleString()}</span>
                                    </span>
                                  </div>

                                  {/* Individual Action: Fix + Status + Delete */}
                                  <div className="flex items-center gap-1.5 self-end sm:self-auto flex-wrap">
                                    <button
                                      type="button"
                                      onClick={() => openFixModal({
                                        reportId: report.id,
                                        itemId: report.itemId,
                                        itemName: report.itemName,
                                        category: report.itemCategory,
                                        version: report.itemVersion,
                                        downloadLinks: report.downloadLinks,
                                      })}
                                      title={t('Fix this report') || 'Fix report'}
                                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold transition-colors cursor-pointer"
                                    >
                                      <TbTools size={13} />
                                      <span>{t('Fix') || 'Fix'}</span>
                                    </button>

                                    <select
                                      value={report.status}
                                      onChange={(e) => handleStatusChange(report.id, e.target.value as any)}
                                      className="px-2 py-1 rounded-lg text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer"
                                    >
                                      <option value="pending">⏱ Pending</option>
                                      <option value="in_progress">⚡ In Progress</option>
                                      <option value="fixed">✓ Fixed</option>
                                      <option value="dismissed">✕ Dismissed</option>
                                    </select>

                                    <button
                                      type="button"
                                      onClick={() => handleDeleteReport(report.id, report.itemName)}
                                      title={t('Delete single report') || 'Delete report'}
                                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-colors cursor-pointer"
                                    >
                                      <TbTrash size={14} />
                                    </button>
                                  </div>
                                </div>

                                {/* Broken link type & reason */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                  <div className="p-2 rounded-lg bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/15 flex items-center gap-2">
                                    <TbLinkOff size={14} className="text-rose-500 shrink-0" />
                                    <span className="text-slate-700 dark:text-slate-300 font-semibold truncate">
                                      {t('Failed Link') || 'Failed Link'}: <strong className="text-rose-600 dark:text-rose-400">{getBrokenLinkTypeLabel(report.brokenLinkType)}</strong>
                                    </span>
                                  </div>

                                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center gap-2">
                                    <TbAlertCircle size={14} className="text-amber-500 shrink-0" />
                                    <span className="text-slate-700 dark:text-slate-300 font-semibold truncate">
                                      {t('Reason') || 'Reason'}: <strong className="text-slate-900 dark:text-white">{report.reason}</strong>
                                    </span>
                                  </div>
                                </div>

                                {/* User Details if provided */}
                                {report.details && (
                                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 text-xs">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                                      {t('User Explanation') || 'User Description'}:
                                    </span>
                                    <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                                      "{report.details}"
                                    </p>
                                  </div>
                                )}

                                {/* Quick links tray for manual fixing */}
                                {hasLinks && (
                                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                      {t('Inspect link') || 'Inspect link'}:
                                    </span>
                                    {dl.full && (
                                      <button
                                        type="button"
                                        onClick={() => handleCopyText(dl.full, `${report.id}-full`)}
                                        className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-700 dark:text-slate-300 hover:bg-slate-200 flex items-center gap-1"
                                      >
                                        <TbCopy size={11} />
                                        <span>Direct</span>
                                        {copiedLink === `${report.id}-full` && <span className="text-emerald-500 font-bold">✓</span>}
                                      </button>
                                    )}
                                    {dl.utorrent && (
                                      <button
                                        type="button"
                                        onClick={() => handleCopyText(dl.utorrent, `${report.id}-torrent`)}
                                        className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-700 dark:text-slate-300 hover:bg-slate-200 flex items-center gap-1"
                                      >
                                        <TbCopy size={11} />
                                        <span>Torrent</span>
                                        {copiedLink === `${report.id}-torrent` && <span className="text-emerald-500 font-bold">✓</span>}
                                      </button>
                                    )}
                                    {dl.mega && (
                                      <button
                                        type="button"
                                        onClick={() => handleCopyText(dl.mega, `${report.id}-mega`)}
                                        className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-700 dark:text-slate-300 hover:bg-slate-200 flex items-center gap-1"
                                      >
                                        <TbCopy size={11} />
                                        <span>Mega</span>
                                        {copiedLink === `${report.id}-mega` && <span className="text-emerald-500 font-bold">✓</span>}
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>
      ) : (
        /* ================= CHRONOLOGICAL FLAT STREAM ================= */
        <div className="space-y-4">
          {filteredStreamReports.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#111623] border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto">
                <TbFileText size={28} />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {t('No reports match your filters') || 'No reports match your filters'}
              </h4>
            </div>
          ) : (
            filteredStreamReports.map((report) => {
              const isPending = report.status === 'pending';
              const isFixed = report.status === 'fixed';
              const isInProgress = report.status === 'in_progress';
              const isSelected = selectedReportIds.has(report.id);
              const dl = report.downloadLinks || {};
              const hasLinks = dl.full || dl.utorrent || dl.mega || dl.googleDrive || dl.preInstalled || (dl.mirrors && dl.mirrors.length > 0);

              return (
                <div
                  key={report.id}
                  className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111623] border transition-all shadow-xs ${
                    isPending
                      ? 'border-amber-500/40 bg-gradient-to-r from-amber-500/[0.02] to-transparent'
                      : isFixed
                      ? 'border-emerald-500/30'
                      : isInProgress
                      ? 'border-sky-500/30'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="pt-2 shrink-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectReport(report.id)}
                          className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-rose-500 focus:ring-rose-500 cursor-pointer"
                        />
                      </div>

                      {report.itemCoverImage ? (
                        <img
                          src={report.itemCoverImage}
                          alt={report.itemName}
                          className="w-14 h-16 sm:w-16 sm:h-20 rounded-xl object-cover shadow-xs shrink-0 border border-slate-200 dark:border-slate-700"
                        />
                      ) : (
                        <div className="w-14 h-16 sm:w-16 sm:h-20 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0 border border-slate-200 dark:border-slate-700">
                          <TbDeviceGamepad2 size={28} />
                        </div>
                      )}

                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                            {report.itemName}
                          </h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                            {report.itemId}
                          </span>
                          {report.itemCategory && (
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20">
                              {report.itemCategory}
                            </span>
                          )}
                          {report.itemVersion && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                              {report.itemVersion}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-bold text-rose-500 dark:text-rose-400 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20">
                            <TbAlertCircle size={14} className="shrink-0" />
                            <span>{report.reason}</span>
                          </span>
                          <span className="text-slate-400 text-[11px] flex items-center gap-1">
                            <TbClock size={12} />
                            <span>{new Date(report.createdAt).toLocaleString()}</span>
                          </span>
                        </div>

                        {/* FAILED DOWNLOAD LINK TARGET */}
                        <div className="p-3 rounded-xl bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/25 flex items-center justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-rose-500 text-white shrink-0 shadow-xs">
                              <TbLinkOff size={16} />
                            </div>
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block">
                                {t('Failed Download Link Target') || 'Failed Download Link Target'}:
                              </span>
                              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                {getBrokenLinkTypeLabel(report.brokenLinkType)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Reporter Tag */}
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                          <span className="font-semibold">{t('Reported by') || 'Reported by'}:</span>
                          <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                            {report.reporterType === 'user' ? (
                              <TbUser size={13} className="text-emerald-500" />
                            ) : (
                              <TbGhost size={13} className="text-amber-500" />
                            )}
                            <span>{report.reportedBy?.displayName || report.reportedBy?.guestName || 'Anonymous'}</span>
                          </div>
                          {report.reportedBy?.email && (
                            <span className="font-mono text-slate-400">
                              ({report.reportedBy.email})
                            </span>
                          )}
                        </div>

                        {report.details && (
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1">
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                              "{report.details}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-2.5 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800 w-full lg:w-auto">
                      <div className="w-full sm:w-auto lg:w-44">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                          {t('Status') || 'Status'}:
                        </label>
                        <select
                          value={report.status}
                          onChange={(e) => handleStatusChange(report.id, e.target.value as any)}
                          className="w-full px-3 py-2 rounded-xl border text-xs font-bold transition-all bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                        >
                          <option value="pending">⏱ {t('Pending') || 'Pending'}</option>
                          <option value="in_progress">⚡ {t('In Progress') || 'In Progress'}</option>
                          <option value="fixed">✓ {t('Fixed') || 'Fixed'}</option>
                          <option value="dismissed">✕ {t('Dismissed') || 'Dismissed'}</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end flex-wrap">
                        {/* Quick Fix Button */}
                        <button
                          type="button"
                          onClick={() => openFixModal({
                            reportId: report.id,
                            itemId: report.itemId,
                            itemName: report.itemName,
                            category: report.itemCategory,
                            version: report.itemVersion,
                            downloadLinks: report.downloadLinks,
                          })}
                          title={t('Fix Broken Links') || 'Fix Broken Links'}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 text-xs font-bold transition-colors cursor-pointer"
                        >
                          <TbTools size={14} />
                          <span>{t('Fix') || 'Fix'}</span>
                        </button>

                        {onOpenItem && (
                          <button
                            type="button"
                            onClick={() => onOpenItem(report.itemId, report.itemCategory)}
                            title={t('Preview Item') || 'Preview Item'}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                          >
                            <TbExternalLink size={16} />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteReport(report.id, report.itemName)}
                          title={t('Delete Report') || 'Delete Report'}
                          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-colors shrink-0 cursor-pointer"
                        >
                          <TbTrash size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* IN-APP CONFIRMATION MODAL - FULLY FUNCTIONAL IN IFRAMES, LAPTOP, TABLET & MOBILE */}
      <AnimatePresence>
        {deleteModal?.isOpen && (
          <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-white dark:bg-[#111623] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden relative"
              dir={dir}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-500 flex items-center justify-center shrink-0 border border-rose-500/25">
                  <TbTrash size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {deleteModal.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {deleteModal.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setDeleteModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {t('Cancel') || 'Cancel'}
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={async () => {
                    setIsDeleting(true);
                    try {
                      await deleteModal.onConfirm();
                      setDeleteModal(null);
                    } catch (err: any) {
                      showToast(err?.message || 'Failed to complete delete', 'error');
                    } finally {
                      setIsDeleting(false);
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{t('Deleting...') || 'Deleting...'}</span>
                    </>
                  ) : (
                    <>
                      <TbTrash size={15} />
                      <span>{deleteModal.confirmText || t('Delete') || 'Delete'}</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* IN-APP FIX BROKEN LINKS MODAL - FULLY RESPONSIVE FOR LAPTOP, TABLET & MOBILE */}
      <AnimatePresence>
        {fixModal?.isOpen && (
          <div className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-lg max-h-[90vh] flex flex-col bg-white dark:bg-[#111623] rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative"
              dir={dir}
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/25">
                    <TbTools size={20} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                      {t('Fix Download Links') || 'Fix Download Links'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {fixModal.itemName}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setFixModal(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <TbX size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
                {/* Item Details Tag Row */}
                <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 truncate">
                    {fixModal.itemName}
                  </span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {fixModal.itemId}
                  </span>
                  {fixModal.category && (
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-primary-500/10 text-primary-600 dark:text-primary-400">
                      {fixModal.category}
                    </span>
                  )}
                </div>

                {/* Direct Link Input */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {t('Direct / Master Download Link') || 'Direct / Master Download Link'}
                  </label>
                  <input
                    type="url"
                    value={fixDirectLink}
                    onChange={(e) => setFixDirectLink(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>

                {/* Torrent Link Input */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {t('Torrent / Magnet Link') || 'Torrent / Magnet Link'}
                  </label>
                  <input
                    type="text"
                    value={fixTorrentLink}
                    onChange={(e) => setFixTorrentLink(e.target.value)}
                    placeholder="magnet:?xt=... or https://..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 font-mono text-[11px]"
                  />
                </div>

                {/* Mega Mirror Input */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {t('Mega Mirror Link') || 'Mega Mirror Link'}
                  </label>
                  <input
                    type="url"
                    value={fixMegaLink}
                    onChange={(e) => setFixMegaLink(e.target.value)}
                    placeholder="https://mega.nz/..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>

                {/* Google Drive Input */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {t('Google Drive Mirror Link') || 'Google Drive Mirror Link'}
                  </label>
                  <input
                    type="url"
                    value={fixGdriveLink}
                    onChange={(e) => setFixGdriveLink(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>

                {/* Fix Notes */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {t('Fix Notes / Announcement') || 'Fix Notes'}
                  </label>
                  <textarea
                    rows={2}
                    value={fixNotes}
                    onChange={(e) => setFixNotes(e.target.value)}
                    placeholder={t('e.g. Replaced dead mirror link with updated Google Drive & Direct links') || 'Explanation of fixes...'}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5 shrink-0 bg-slate-50/50 dark:bg-[#0d121c]/50">
                <button
                  type="button"
                  disabled={isSubmittingFix}
                  onClick={() => setFixModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {t('Cancel') || 'Cancel'}
                </button>
                <button
                  type="button"
                  disabled={isSubmittingFix}
                  onClick={handleApplyFix}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingFix ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{t('Saving Fix...') || 'Saving Fix...'}</span>
                    </>
                  ) : (
                    <>
                      <TbCircleCheck size={16} />
                      <span>{t('Apply Fix & Resolve') || 'Apply Fix & Resolve'}</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminReportsManager;
