'use client';

import { X, AlertTriangle } from 'lucide-react';

export default function DeleteConfirmationModal({ isOpen, onClose, onConfirm, isDeleting, title, message, confirmText }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title || "Delete Account?"}</h3>
          <p className="text-gray-600 mb-6">
            {message || (
                <>
                Are you sure you want to delete your account? This action is <span className="font-bold text-red-600">irreversible</span>. 
                All your data, including courses and enrollments, will be permanently removed.
                </>
            )}
          </p>

          <div className="space-y-3">
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isDeleting ? 'Deleting...' : (confirmText || 'Yes, Delete My Account')}
            </button>
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
