import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Megaphone, X, Calendar, Clock, AlertCircle, Sparkles } from 'lucide-react';
import { Notice } from '../../types';

export const NoticeBoardModal: React.FC = () => {
  const {
    isNoticeBoardOpen,
    setIsNoticeBoardOpen,
    activeNotices,
    selectedNoticeForView,
    setSelectedNoticeForView
  } = useStore();

  if (!isNoticeBoardOpen) return null;

  const formatNoticeDateTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div
        id="customer-notice-board-modal"
        className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-neutral-200 animate-in zoom-in-95 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white px-5 sm:px-6 py-4 flex items-center justify-between relative shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-amber-300 shadow-xs">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-200">
                  Madina Mart Updates
                </span>
                <span className="px-2 py-0.2 bg-amber-400 text-neutral-900 rounded-full text-[10px] font-black">
                  Notice Board
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black font-['Outfit',sans-serif] tracking-tight">
                Store Announcements & Notices
              </h2>
            </div>
          </div>
          <button
            id="close-notice-board-modal-btn"
            onClick={() => {
              setIsNoticeBoardOpen(false);
              setSelectedNoticeForView(null);
            }}
            className="p-1.5 rounded-full text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close Notice Board"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice List or Empty State */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {activeNotices.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-neutral-100 flex items-center justify-center text-neutral-400 mx-auto">
                <Megaphone className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-neutral-800 font-['Outfit',sans-serif]">
                No Active Notices
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
                There are currently no active announcements from Madina Mart management. Please check back later for store updates, holiday hours, and special notices.
              </p>
            </div>
          ) : (
            activeNotices.map((notice, index) => (
              <div
                key={notice.id}
                id={`customer-notice-card-${notice.id}`}
                className="bg-neutral-50 hover:bg-white rounded-2xl border border-neutral-200/90 hover:border-emerald-500/50 shadow-2xs hover:shadow-md transition-all overflow-hidden p-4 sm:p-5 flex flex-col gap-3"
              >
                {/* Notice Top Meta */}
                <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                  <div className="flex items-center gap-2">
                    {index === 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>Latest Notice</span>
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-[11px] text-neutral-500 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{formatNoticeDateTime(notice.dateTime || notice.createdAt)}</span>
                    </span>
                  </div>
                </div>

                {/* Notice Image if Uploaded */}
                {notice.imageUrl && (
                  <div className="w-full rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 max-h-80 flex items-center justify-center">
                    <img
                      src={notice.imageUrl}
                      alt={notice.title}
                      className="w-full h-auto max-h-80 object-contain rounded-xl"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {/* Notice Title & Message */}
                <div>
                  <h3 className="text-base sm:text-lg font-black text-neutral-900 font-['Outfit',sans-serif] leading-snug">
                    {notice.title}
                  </h3>
                  <div className="text-xs sm:text-sm text-neutral-700 mt-2 whitespace-pre-line leading-relaxed font-normal">
                    {notice.message}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="bg-neutral-50 px-5 py-3 border-t border-neutral-200 flex items-center justify-between text-[11px] text-neutral-500">
          <span>{activeNotices.length} active notice{activeNotices.length === 1 ? '' : 's'} displayed</span>
          <button
            onClick={() => setIsNoticeBoardOpen(false)}
            className="px-4 py-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
