import React, { useState, useEffect } from 'react';
import { X, FileText, Check, Calendar, AlertCircle } from 'lucide-react';
import { EveeBike } from '../types';

interface DocumentationUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  bike: EveeBike | null;
  onUpdate: (updatedBike: EveeBike) => void;
}

export const DocumentationUpdateModal: React.FC<DocumentationUpdateModalProps> = ({
  isOpen,
  onClose,
  bike,
  onUpdate,
}) => {
  const [documentationReceived, setDocumentationReceived] = useState<boolean>(false);
  const [documentationReceivedDate, setDocumentationReceivedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [documentationNotes, setDocumentationNotes] = useState<string>('');

  useEffect(() => {
    if (bike) {
      setDocumentationReceived(bike.documentationReceived || false);
      setDocumentationReceivedDate(
        bike.documentationReceivedDate || new Date().toISOString().slice(0, 10)
      );
      setDocumentationNotes(bike.documentationNotes || '');
    }
  }, [bike, isOpen]);

  if (!isOpen || !bike) return null;

  // Only allow documentation updates for sold bikes
  if (bike.status === 'IN_STOCK') {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updated: EveeBike = {
      ...bike,
      documentationReceived,
      documentationReceivedDate: documentationReceived ? documentationReceivedDate : undefined,
      documentationNotes: documentationNotes.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };

    onUpdate(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Update Documentation Status
              </h2>
              <p className="text-xs text-slate-500">
                Track if bike documentation has been received from customer
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          
          {/* Bike Info Summary */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="text-[11px] font-semibold text-slate-500 mb-1">Bike Details</div>
            <div className="text-sm font-bold text-slate-900 font-mono">
              {bike.chassisNumber}
            </div>
            <div className="text-xs text-slate-600 mt-0.5">
              {bike.modelName} • {bike.color}
            </div>
            {bike.customer && (
              <div className="text-xs text-slate-600 mt-1">
                Customer: {bike.customer.fullName}
              </div>
            )}
          </div>

          {/* Documentation Received Toggle */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-emerald-50/50 border border-emerald-200 rounded-lg">
              <input
                type="checkbox"
                id="docReceived"
                checked={documentationReceived}
                onChange={(e) => setDocumentationReceived(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
              />
              <label htmlFor="docReceived" className="flex-1 cursor-pointer">
                <div className="text-sm font-semibold text-slate-900">
                  Documentation Received
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  Check this box when bike documentation (registration papers, transfer docs, etc.) 
                  has been received from the customer
                </div>
              </label>
            </div>

            {documentationReceived && (
              <div className="pl-7 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    Date Received
                  </label>
                  <input
                    type="date"
                    value={documentationReceivedDate}
                    onChange={(e) => setDocumentationReceivedDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* Notes Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Documentation Notes (Optional)
              </label>
              <textarea
                value={documentationNotes}
                onChange={(e) => setDocumentationNotes(e.target.value)}
                placeholder="e.g. Original registration papers received, token verified, transfer form signed..."
                rows={3}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
              />
              <div className="text-[10px] text-slate-500 mt-1">
                Add any relevant notes about the documentation status or details
              </div>
            </div>
          </div>

          {/* Info Notice */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-[11px] text-blue-900">
              <strong>Note:</strong> This update only affects documentation tracking. 
              Other bike details (customer info, pricing, installments) remain unchanged.
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 bg-white border border-slate-300 rounded-lg transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Save Documentation Status</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
