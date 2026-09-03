import React, { useState, useEffect } from 'react';
import { Store, Plus, Settings2, Building2 } from 'lucide-react';
import { loadShopsFromStorage, addShopToStorage } from '../utils/storage';
import { subscribeShops, addShopToFirestore } from '../services/firestoreService';
import { ManageShopsModal } from './ManageShopsModal';

interface ShopSelectorProps {
  selectedShop: string;
  onSelectShop: (shop: string) => void;
  label?: string;
  helperText?: string;
  required?: boolean;
  error?: string;
  className?: string;
}

export const ShopSelector: React.FC<ShopSelectorProps> = ({
  selectedShop,
  onSelectShop,
  label = 'Selling Shop / Branch Location',
  helperText = 'Enter or select your showroom / shop name where this bike is being sold.',
  required = false,
  error,
  className = '',
}) => {
  const [shops, setShops] = useState<string[]>(() => loadShopsFromStorage());
  const [isManageModalOpen, setIsManageModalOpen] = useState<boolean>(false);
  const [isAddingInline, setIsAddingInline] = useState<boolean>(() => shops.length === 0);
  const [newInlineShop, setNewInlineShop] = useState<string>('');

  useEffect(() => {
    const unsub = subscribeShops((cloudShops) => {
      if (cloudShops.length > 0) {
        setShops(cloudShops);
      }
    });
    return () => unsub();
  }, []);

  const handleShopsUpdated = (updated: string[]) => {
    setShops(updated);
    if (updated.length === 0) {
      setIsAddingInline(true);
    } else if (!selectedShop || !updated.includes(selectedShop)) {
      onSelectShop(updated[0]);
    }
  };

  const handleSaveInline = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newInlineShop.trim();
    if (trimmed) {
      const updated = addShopToStorage(trimmed);
      setShops(updated);
      onSelectShop(trimmed);
      setNewInlineShop('');
      setIsAddingInline(false);

      await addShopToFirestore(trimmed).catch(err => {
        console.warn('Firestore shop save error:', err);
      });
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        
        <div className="flex items-center gap-2">
          {shops.length > 0 && !isAddingInline && (
            <button
              type="button"
              onClick={() => setIsAddingInline(true)}
              className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-0.5"
            >
              <Plus className="w-3 h-3" />
              <span>Add New Shop</span>
            </button>
          )}

          {isAddingInline && shops.length > 0 && (
            <button
              type="button"
              onClick={() => setIsAddingInline(false)}
              className="text-[11px] text-slate-400 hover:text-slate-600"
            >
              Choose Existing
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsManageModalOpen(true)}
            className="text-[11px] text-slate-500 hover:text-slate-700 flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded transition"
            title="Manage All Shops & Branches"
          >
            <Settings2 className="w-3 h-3" />
            <span>Manage ({shops.length})</span>
          </button>
        </div>
      </div>

      {isAddingInline || shops.length === 0 ? (
        <div className="space-y-1.5">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={newInlineShop || selectedShop}
                onChange={(e) => {
                  setNewInlineShop(e.target.value);
                  onSelectShop(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSaveInline();
                  }
                }}
                placeholder="Type your shop or branch name..."
                className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-emerald-400 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                autoFocus={shops.length === 0}
              />
            </div>
            <button
              type="button"
              onClick={() => handleSaveInline()}
              className="px-3 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition shrink-0"
              title="Save this shop name to your list for future sales"
            >
              Save to List
            </button>
          </div>
          {shops.length === 0 && (
            <p className="text-[10px] text-emerald-700 font-medium">
              💡 Tip: Type your own shop/store name. Click "Save to List" to reuse it in future sales.
            </p>
          )}
        </div>
      ) : (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Store className="w-4 h-4 text-emerald-600" />
          </div>
          <select
            value={selectedShop}
            onChange={(e) => {
              if (e.target.value === '__ADD_NEW__') {
                setIsAddingInline(true);
              } else {
                onSelectShop(e.target.value);
              }
            }}
            className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          >
            <option value="" disabled>-- Select Your Selling Shop / Branch --</option>
            {shops.map((shop, idx) => (
              <option key={idx} value={shop}>
                🏬 {shop}
              </option>
            ))}
            <option value="__ADD_NEW__">+ Type a New Custom Shop Name...</option>
          </select>
        </div>
      )}

      {helperText && !error && (
        <p className="text-[10px] text-slate-500">{helperText}</p>
      )}

      {error && (
        <p className="text-[10px] text-rose-500">{error}</p>
      )}

      {/* Manage Shops Modal */}
      <ManageShopsModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        onShopsUpdated={handleShopsUpdated}
      />
    </div>
  );
};
