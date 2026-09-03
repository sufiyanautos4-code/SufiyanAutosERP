import React from 'react';
import { 
  Zap, 
  Layers, 
  PlusCircle, 
  FileText, 
  BadgeDollarSign, 
  RotateCcw, 
  Download, 
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  Boxes,
  Trash2,
  User,
  LogOut,
  LogIn,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { ActiveTab, EveeBike, AuthUser } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  bikes: EveeBike[];
  currentUser: AuthUser | null;
  onOpenProfile: () => void;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  onSignOut: () => void;
  onClearData: () => void;
  onResetData: () => void;
  onExportData: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onQuickSell: () => void;
  onNewBike: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  bikes,
  currentUser,
  onOpenProfile,
  onOpenAuth,
  onSignOut,
  onClearData,
  onResetData,
  onExportData,
  searchQuery,
  setSearchQuery,
  onNewBike,
}) => {
  const inStockCount = bikes.filter(b => b.status === 'IN_STOCK').length;
  const soldCount = bikes.filter(b => b.status !== 'IN_STOCK').length;
  const activeInstallments = bikes.filter(
    b => b.status === 'SOLD_INSTALLMENT' && b.installmentPlan?.status === 'ACTIVE'
  ).length;

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-slate-100 shadow-md">
      {/* Top Banner / Brand Header */}
      <div className="w-full max-w-7xl 2xl:max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 sm:gap-3 cursor-pointer shrink-0" onClick={() => setActiveTab('inventory')}>
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-sm">
              E
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-bold tracking-tight text-base sm:text-lg text-white">Sufiyan Autos</span>
                <span className="hidden xs:inline-block text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wider">
                  Enterprise
                </span>
              </div>
              <p className="hidden sm:block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Inventory & Sales ERP
              </p>
            </div>
          </div>

          {/* Global Search */}
          <div className="hidden md:flex flex-1 max-w-md 2xl:max-w-xl relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="navbar-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search: chassis, model, customer, phone, address, invoice, shop..."
              className="w-full bg-slate-800/90 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg pl-9 pr-8 py-2 text-xs text-slate-100 placeholder-slate-400 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Metrics Bar & Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* System Online & Live Stock Chip */}
            <div className="hidden xl:flex items-center gap-3 bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span>System Online</span>
              </div>
              <span className="text-slate-600">|</span>
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span>{inStockCount} In Stock</span>
              </div>
              <span className="text-slate-600">|</span>
              <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
                <span>{soldCount} Sold</span>
              </div>
            </div>

            {/* Quick Add Product Button */}
            <button
              id="nav-quick-add-btn"
              onClick={onNewBike}
              className="flex items-center gap-1 sm:gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg shadow-sm transition active:scale-95 whitespace-nowrap"
            >
              <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden sm:inline">Add Evee Bike</span>
              <span className="sm:hidden">+ Bike</span>
            </button>

            {/* Data Tools Menu */}
            <div className="flex items-center gap-0.5 sm:gap-1">
              <button
                id="export-data-btn"
                onClick={onExportData}
                title="Export Inventory JSON Backup"
                className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button
                id="clear-all-data-btn"
                onClick={onClearData}
                title="Clear All Inventory Data (Wipe to Empty)"
                className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button
                id="reset-data-btn"
                onClick={onResetData}
                title="Load Sample Demo Data (Optional)"
                className="p-1.5 sm:p-2 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition"
              >
                <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* User Auth / Profile Badge */}
            <div className="pl-1 border-l border-slate-700/80">
              {currentUser ? (
                <button
                  id="user-profile-btn"
                  onClick={onOpenProfile}
                  title={`Logged in as ${currentUser.name}`}
                  className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 transition text-left"
                >
                  <div className={`w-7 h-7 rounded-lg ${currentUser.avatarBg || 'bg-blue-600'} text-white flex items-center justify-center font-bold text-xs shadow-sm`}>
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden lg:block text-left">
                    <span className="text-xs font-bold text-slate-200 block leading-tight truncate max-w-[120px]">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium block leading-tight truncate max-w-[120px]">
                      {currentUser.email}
                    </span>
                  </div>
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onOpenAuth('login')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-sm"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              id="mobile-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search: chassis, model, customer, phone, invoice..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Main Tab Navigation Bar */}
        <nav className="flex space-x-1 sm:space-x-2 border-t border-slate-800 pt-1.5 pb-2 overflow-x-auto scrollbar-none touch-pan-x">
          <button
            id="tab-btn-stock"
            onClick={() => setActiveTab('stock')}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition shrink-0 ${
              activeTab === 'stock'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Boxes className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>1. Stock Inventory & Types</span>
            <span className={`ml-1 px-1.5 py-0.2 rounded text-[10px] font-mono ${
              activeTab === 'stock' ? 'bg-blue-700 text-white' : 'bg-emerald-500/20 text-emerald-300 font-bold'
            }`}>
              {inStockCount} In Stock
            </span>
          </button>

          <button
            id="tab-btn-inventory"
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition shrink-0 ${
              activeTab === 'inventory'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>2. Fleet Operations & Hub</span>
            <span className={`ml-1 px-1.5 py-0.2 rounded text-[10px] font-mono ${
              activeTab === 'inventory' ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-300'
            }`}>
              {bikes.length}
            </span>
          </button>

          <button
            id="tab-btn-entry"
            onClick={() => setActiveTab('entry')}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition shrink-0 ${
              activeTab === 'entry'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>3. Product Entry (VIN Registry)</span>
          </button>

          <button
            id="tab-btn-detail"
            onClick={() => setActiveTab('detail')}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition shrink-0 ${
              activeTab === 'detail'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>4. Product Details & Specs</span>
          </button>

          <button
            id="tab-btn-sales"
            onClick={() => setActiveTab('sales')}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition shrink-0 ${
              activeTab === 'sales'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BadgeDollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>5. Sales & Installments</span>
            {activeInstallments > 0 && (
              <span className={`ml-1 px-1.5 py-0.2 rounded text-[10px] font-mono ${
                activeTab === 'sales' ? 'bg-amber-400 text-slate-900 font-bold' : 'bg-amber-500/20 text-amber-300'
              }`}>
                {activeInstallments} Active
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};
