import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { Notice } from '../../types';
import {
  Megaphone,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react';

export const AdminNoticeBoard: React.FC = () => {
  const {
    notices,
    addNotice,
    updateNotice,
    deleteNotice,
    toggleNoticeActive,
    showToast
  } = useStore();

  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNoticeId, setEditingNoticeId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [imageError, setImageError] = useState('');
  const [formError, setFormError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtered notices
  const filteredNotices = notices.filter(n => {
    if (filter === 'active') return n.isActive;
    if (filter === 'inactive') return !n.isActive;
    return true;
  });

  const handleOpenCreateModal = () => {
    setEditingNoticeId(null);
    setTitle('');
    setMessage('');
    // Current local datetime formatted for datetime-local input: YYYY-MM-DDTHH:mm
    const now = new Date();
    const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setDateTime(localIso);
    setIsActive(true);
    setImageUrl('');
    setImageError('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (notice: Notice) => {
    setEditingNoticeId(notice.id);
    setTitle(notice.title);
    setMessage(notice.message);
    let dtVal = '';
    if (notice.dateTime) {
      try {
        const d = new Date(notice.dateTime);
        if (!isNaN(d.getTime())) {
          dtVal = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
        }
      } catch {
        dtVal = '';
      }
    }
    setDateTime(dtVal);
    setIsActive(notice.isActive);
    setImageUrl(notice.imageUrl || '');
    setImageError('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError('');
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Allowed types: JPG, JPEG, PNG, WEBP
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const validExtension = /\.(jpg|jpeg|png|webp)$/i.test(file.name);

    if (!allowedTypes.includes(file.type) && !validExtension) {
      setImageError('Only JPG, JPEG, PNG, and WEBP image formats are allowed.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Maximum allowed file size: 5 MB per image
    const MAX_SIZE_BYTES = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      setImageError('Image must be 5 MB or smaller.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Read and convert to Data URL for preview and storage
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
      }
    };
    reader.onerror = () => {
      setImageError('Failed to read image file. Please try another image.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    setImageError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveNotice = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim()) {
      setFormError('Notice title is required.');
      return;
    }

    if (!message.trim()) {
      setFormError('Notice description / message is required.');
      return;
    }

    const isoDateTime = dateTime ? new Date(dateTime).toISOString() : new Date().toISOString();

    if (editingNoticeId) {
      updateNotice(editingNoticeId, {
        title: title.trim(),
        message: message.trim(),
        dateTime: isoDateTime,
        isActive,
        imageUrl: imageUrl.trim() || undefined
      });
    } else {
      addNotice({
        title: title.trim(),
        message: message.trim(),
        dateTime: isoDateTime,
        isActive,
        imageUrl: imageUrl.trim() || undefined
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, noticeTitle: string) => {
    if (window.confirm(`Are you sure you want to delete notice "${noticeTitle}"? This cannot be undone.`)) {
      deleteNotice(id);
    }
  };

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
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Megaphone className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white font-['Outfit',sans-serif]">
              Notice Board Management
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neutral-800 text-neutral-300">
              {notices.length} Total
            </span>
          </div>
          <p className="text-xs text-neutral-400 max-w-xl">
            Create, update, and manage official customer announcements. Active notices appear automatically on the Customer App's homepage and notice board.
          </p>
        </div>

        <button
          id="btn-admin-create-notice"
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-950 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Notice</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-neutral-500 font-semibold mr-1">Filter:</span>
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
            filter === 'all'
              ? 'bg-neutral-800 text-white'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          All ({notices.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
            filter === 'active'
              ? 'bg-emerald-800/80 text-emerald-200'
              : 'text-neutral-400 hover:text-emerald-300 hover:bg-neutral-900'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Active ({notices.filter(n => n.isActive).length})</span>
        </button>
        <button
          onClick={() => setFilter('inactive')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
            filter === 'inactive'
              ? 'bg-neutral-800 text-neutral-300'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-neutral-500"></span>
          <span>Disabled ({notices.filter(n => !n.isActive).length})</span>
        </button>
      </div>

      {/* Notices List */}
      {filteredNotices.length === 0 ? (
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-3xl p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-neutral-800/80 text-neutral-500 flex items-center justify-center mx-auto">
            <Megaphone className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-neutral-300 font-['Outfit',sans-serif]">
            No notices found
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            {notices.length === 0
              ? 'No notices have been created yet. Click "Create New Notice" to broadcast your first announcement to customers.'
              : 'No notices match the selected filter.'}
          </p>
          {notices.length === 0 && (
            <button
              onClick={handleOpenCreateModal}
              className="mt-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create First Notice</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotices.map((notice) => (
            <div
              key={notice.id}
              id={`admin-notice-item-${notice.id}`}
              className={`bg-neutral-900 border rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all ${
                notice.isActive
                  ? 'border-neutral-800 hover:border-emerald-500/40'
                  : 'border-neutral-800/60 opacity-70'
              }`}
            >
              <div className="space-y-3">
                {/* Top Meta & Status badge */}
                <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                        notice.isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${notice.isActive ? 'bg-emerald-400' : 'bg-neutral-500'}`}></span>
                      <span>{notice.isActive ? 'Active & Published' : 'Disabled / Hidden'}</span>
                    </span>
                  </div>

                  <span className="text-[11px] text-neutral-400 font-mono flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-neutral-500" />
                    <span>{formatNoticeDateTime(notice.dateTime || notice.createdAt)}</span>
                  </span>
                </div>

                {/* Photo Preview if uploaded */}
                {notice.imageUrl && (
                  <div className="w-full h-44 rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 flex items-center justify-center">
                    <img
                      src={notice.imageUrl}
                      alt={notice.title}
                      className="w-full h-full object-cover rounded-xl"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {/* Title & Message */}
                <div>
                  <h3 className="text-base font-bold text-white font-['Outfit',sans-serif]">
                    {notice.title}
                  </h3>
                  <p className="text-xs text-neutral-300 mt-1.5 whitespace-pre-line leading-relaxed">
                    {notice.message}
                  </p>
                </div>
              </div>

              {/* Action Controls */}
              <div className="pt-4 mt-3 border-t border-neutral-800/80 flex items-center justify-between gap-2 text-xs">
                {/* Toggle Active / Inactive switch */}
                <button
                  type="button"
                  id={`btn-toggle-notice-${notice.id}`}
                  onClick={() => toggleNoticeActive(notice.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                    notice.isActive
                      ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                      : 'bg-emerald-800/40 hover:bg-emerald-800/60 text-emerald-300 border border-emerald-700/50'
                  }`}
                  title={notice.isActive ? 'Disable notice' : 'Enable notice'}
                >
                  {notice.isActive ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Disable</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Enable</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    id={`btn-edit-notice-${notice.id}`}
                    onClick={() => handleOpenEditModal(notice)}
                    className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    id={`btn-delete-notice-${notice.id}`}
                    onClick={() => handleDelete(notice.id, notice.title)}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Notice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-xl p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 text-xs text-neutral-200 flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Megaphone className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-white font-['Outfit',sans-serif]">
                  {editingNoticeId ? 'Edit Notice' : 'Create New Notice'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSaveNotice} className="space-y-4 overflow-y-auto flex-1 pr-1">
              {/* Notice Title */}
              <div>
                <label className="block font-bold text-neutral-300 mb-1">
                  Notice Title <span className="text-rose-400">*</span>
                </label>
                <input
                  id="notice-title-input"
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Ramadan Special Store Timings & Offers"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 text-xs"
                  required
                />
              </div>

              {/* Date & Time and Active Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-300 mb-1">
                    Notice Date & Time
                  </label>
                  <input
                    id="notice-datetime-input"
                    type="datetime-local"
                    value={dateTime}
                    onChange={e => setDateTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-white focus:outline-none focus:border-emerald-500 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-300 mb-1">
                    Publication Status
                  </label>
                  <label className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 cursor-pointer hover:border-neutral-600 transition-colors">
                    <input
                      id="notice-active-checkbox"
                      type="checkbox"
                      checked={isActive}
                      onChange={e => setIsActive(e.target.checked)}
                      className="accent-emerald-600 w-4 h-4 cursor-pointer"
                    />
                    <span className="font-semibold text-neutral-200">
                      {isActive ? 'Active (Visible to Customers)' : 'Disabled (Hidden)'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Notice Description / Message */}
              <div>
                <label className="block font-bold text-neutral-300 mb-1">
                  Notice Description / Message <span className="text-rose-400">*</span>
                </label>
                <textarea
                  id="notice-message-input"
                  rows={4}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Write the full announcement message, details, timings, or customer instructions here..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 text-xs leading-relaxed"
                  required
                />
              </div>

              {/* Photo Upload Section */}
              <div className="space-y-2">
                <label className="block font-bold text-neutral-300">
                  Notice Photo / Banner Image (Optional)
                </label>
                <p className="text-[11px] text-neutral-500">
                  Formats: JPG, JPEG, PNG, WEBP. Maximum file size: 5 MB per image.
                </p>

                {imageError && (
                  <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-[11px] font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{imageError}</span>
                  </div>
                )}

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  id="notice-photo-file-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                {imageUrl ? (
                  /* Photo Preview */
                  <div className="relative rounded-2xl overflow-hidden border border-neutral-700 bg-neutral-950 p-2 space-y-2">
                    <div className="w-full h-48 rounded-xl overflow-hidden bg-neutral-900 flex items-center justify-center">
                      <img
                        src={imageUrl}
                        alt="Notice preview"
                        className="w-full h-full object-contain rounded-xl"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2 px-1">
                      <button
                        type="button"
                        id="btn-replace-notice-photo"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Change / Replace Photo</span>
                      </button>
                      <button
                        type="button"
                        id="btn-remove-notice-photo"
                        onClick={handleRemoveImage}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove Photo</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Empty Upload Box */
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-neutral-700 hover:border-emerald-500/60 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-neutral-950 hover:bg-neutral-900/50"
                  >
                    <div className="w-10 h-10 rounded-xl bg-neutral-800 text-neutral-400 flex items-center justify-center mx-auto mb-2">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="font-semibold text-neutral-300 text-xs">
                      Click to upload notice photo
                    </p>
                    <p className="text-[10px] text-neutral-500 mt-1">
                      Max file size: 5 MB (JPG, PNG, WEBP)
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-neutral-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-save-notice"
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950 cursor-pointer transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingNoticeId ? 'Update Notice' : 'Publish Notice'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
