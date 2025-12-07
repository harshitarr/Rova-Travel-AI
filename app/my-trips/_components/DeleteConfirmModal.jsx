"use client";
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, tripName }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-red-500 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-all duration-300"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Confirm Deletion</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 text-lg mb-2">
            Are you sure you want to delete{' '}
            <span className="font-bold text-gray-900">{tripName}</span>?
          </p>
          <p className="text-gray-600 text-sm">
            This action cannot be undone. All trip details and itinerary will be permanently removed.
          </p>
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50 flex gap-3 justify-end">
          <Button
            onClick={onClose}
            variant="outline"
            className="px-6 border-2 hover:bg-gray-100"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600 text-white px-6"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
