import React, { useState, useEffect } from 'react';
import { X, Store, Plus, Trash2, Edit2, Check, AlertCircle, Building2 } from 'lucide-react';
import { loadShopsFromStorage, saveShopsToStorage } from '../utils/storage';
import {
  subscribeShops,
  addShopToFirestore,
  updateShopInFirestore,
  deleteShopFromFirestore
} from '../services/firestoreService';

interface ManageShopsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShopsUpdated: (updatedShops: string[]) => void;
}

export const ManageShopsModal: React.FC<ManageShopsModalProps> = ({
  isOpen,
  onClose,
  onShopsUpdated,
}) => {
  const [shops, setShops] = useState<string[]>(() => loadShopsFromStorage());
  const [newShopName, setNewShopName] = useState<string>('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;
    const unsub = subscribeShops((cloudShops) => {
      if (cloudShops.length > 0) {
        setShops(cloudShops);
      }
    });
    return () => unsub();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddShop = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newShopName.trim();
    if (!trimmed) {
      setError('Please enter a shop or branch name.');
      return;
    }
    if (shops.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      setError('A shop with this name already exists.');
      return;
    }

    const updated = [...shops, trimmed];
    setShops(updated);
    saveShopsToStorage(updated);
    onShopsUpdated(updated);
    setNewShopName('');
    setError('');

    await addShopToFirestore(trimmed).catch(err => {
      console.warn('Firestore add shop error:', err);
    });
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditingText(shops[index]);
    setError('');
  };

  const handleSaveEdit = async (index: number) => {
    const trimmed = editingText.trim();
    const oldName = shops[index];
    if (!trimmed) {
      setError('Shop name cannot be blank.');
      return;
    }
    const duplicate = shops.some((s, idx) => idx !== index && s.toLowerCase() === trimmed.toLowerCase());
    if (duplicate) {
      setError('Another shop already has this name.');
      return;
    }

    const updated = [...shops];
    updated[index] = trimmed;
    setShops(updated);
    saveShopsToStorage(updated);
    onShopsUpdated(updated);
    setEditingIndex(null);
    setEditingText('');
    setError('');

    await updateShopInFirestore(oldName, trimmed).catch(err => {
      console.warn('Firestore update shop error:', err);
    });
  };

  const handleDelete = async (index: number) => {
    const target = shops[index];
    if (window.confirm(`Delete "${target}" from your saved shops list?`)) {
      const updated = shops.filter((_, idx) => idx !== index);
      setShops(updated);
      saveShopsToStorage(updated);
      onShopsUpdated(updated);
      setError('');

      await deleteShopFromFirestore(target).catch(err => {
        console.warn('Firestore delete shop error:', err);
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Manage Your Shops & Branches</h2>
              <p className="text-[11px] text-slate-500">
                Add, rename, or delete your own showroom locations where bikes are sold.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Add New Shop Form */}
          <form onSubmit={handleAddShop} className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Add New Shop / Branch:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={newShopName}
                  onChange={(e) => {
                    setNewShopName(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter your shop or branch name..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition shrink-0 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Save Shop</span>
              </button>
            </div>
            {error && (
              <div className="flex items-center gap-1.5 text-rose-600 text-[11px] mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{error}</span>
              </div>
            )}
          </form>

          {/* Existing Shops List */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                Your Saved Shops ({shops.length})
              </span>
            </div>

            {shops.length === 0 ? (
              <div className="py-6 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <Store className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                <p className="text-xs font-medium text-slate-600">No custom shops added yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Type your shop or branch name above and click "Save Shop".
                </p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {shops.map((shop, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 transition"
                  >
                    {editingIndex === idx ? (
                      <div className="flex items-center gap-2 flex-1 mr-2">
                        <input
                          type="text"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="flex-1 px-2.5 py-1 text-xs bg-white border border-emerald-400 rounded text-slate-900 font-semibold focus:outline-none"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(idx)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"
                          title="Save"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingIndex(null);
                            setEditingText('');
                          }}
                          className="p-1.5 text-slate-400 hover:bg-slate-200 rounded"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                          <Store className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{shop}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(idx)}
                            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-white rounded transition"
                            title="Rename Shop"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded transition"
                            title="Delete Shop"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
