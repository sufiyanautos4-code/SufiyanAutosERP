import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShieldCheck, 
  Zap, 
  DollarSign, 
  User, 
  Calendar, 
  CreditCard, 
  FileText, 
  Edit, 
  Trash2, 
  Printer, 
  CheckCircle, 
  AlertCircle, 
  Copy, 
  Check, 
  ArrowLeft,
  Gauge,
  BatteryCharging,
  Layers,
  Phone,
  MapPin,
  Clock,
  Plus,
  Store,
  Search,
  Filter,
  ChevronRight,
  ChevronLeft,
  Bike,
  Sparkles,
  SlidersHorizontal,
  Eye,
  ListFilter
} from 'lucide-react';
import { EveeBike } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { matchesBikeSearch } from '../utils/searchMatcher';

interface ProductDetailProps {
  bikes: EveeBike[];
  selectedBikeId?: string | null;
  onSelectBike: (bike: EveeBike) => void;
  onEditBike: (bike: EveeBike) => void;
  onDeleteBike: (bikeId: string) => void;
  onSellBike: (bike: EveeBike) => void;
  onReceivePayment: (bike: EveeBike) => void;
  onPrintInvoice: (bike: EveeBike) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  bikes,
  selectedBikeId,
  onSelectBike,
  onEditBike,
  onDeleteBike,
  onSellBike,
  onReceivePayment,
  onPrintInvoice,
  searchQuery,
  setSearchQuery,
}) => {
  // View mode: 'list' shows all products in list form; 'detail' opens the specs sheet
  // Always start with 'list' view when navigating to this tab
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');

  const [activeId, setActiveId] = useState<string | null>(() => {
    return selectedBikeId || (bikes.length > 0 ? bikes[0].id : null);
  });

  const [copiedChassis, setCopiedChassis] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'IN_STOCK' | 'SOLD_FULL' | 'SOLD_INSTALLMENT'>('ALL');
  const [modelFilter, setModelFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'MODEL_ASC' | 'PRICE_DESC' | 'PRICE_ASC'>('NEWEST');

  // Track previous selectedBikeId to detect external navigation
  const [prevSelectedBikeId, setPrevSelectedBikeId] = useState<string | null>(selectedBikeId || null);

  // Sync when selectedBikeId changes from outside (e.g. from Inventory tab click)
  // Only switch to detail view if selectedBikeId actually changed (external navigation)
  useEffect(() => {
    if (selectedBikeId && bikes.some(b => b.id === selectedBikeId) && selectedBikeId !== prevSelectedBikeId) {
      setActiveId(selectedBikeId);
      setViewMode('detail');
      setPrevSelectedBikeId(selectedBikeId);
    }
  }, [selectedBikeId, bikes, prevSelectedBikeId]);

  // Find active bike
  const activeBike = useMemo(() => {
    return bikes.find(b => b.id === activeId) || bikes[0] || null;
  }, [bikes, activeId]);

  // Extract distinct models for filter
  const distinctModels = useMemo(() => {
    return Array.from(new Set(bikes.map(b => b.modelName).filter(Boolean)));
  }, [bikes]);

  // Filtered & Sorted Bikes for the List View
  const filteredBikes = useMemo(() => {
    return bikes.filter(bike => {
      // Status Filter
      if (statusFilter !== 'ALL' && bike.status !== statusFilter) {
        return false;
      }

      // Model Filter
      if (modelFilter !== 'ALL' && bike.modelName !== modelFilter) {
        return false;
      }

      // Search Query - Accurate multi-token & word-boundary matching
      if (!matchesBikeSearch(bike, searchQuery)) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'NEWEST') {
        return new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime();
      }
      if (sortBy === 'MODEL_ASC') {
        return a.modelName.localeCompare(b.modelName);
      }
      if (sortBy === 'PRICE_DESC') {
        return b.sellingPrice - a.sellingPrice;
      }
      if (sortBy === 'PRICE_ASC') {
        return a.sellingPrice - b.sellingPrice;
      }
      return 0;
    });
  }, [bikes, statusFilter, modelFilter, searchQuery, sortBy]);

  const handleCopyChassis = () => {
    if (activeBike?.chassisNumber) {
      navigator.clipboard.writeText(activeBike.chassisNumber);
      setCopiedChassis(true);
      setTimeout(() => setCopiedChassis(false), 2000);
    }
  };

  const handleOpenBikeDetail = (bike: EveeBike) => {
    setActiveId(bike.id);
    onSelectBike(bike);
    setViewMode('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextBike = () => {
    if (!activeBike) return;
    const currentIndex = bikes.findIndex(b => b.id === activeBike.id);
    if (currentIndex < bikes.length - 1) {
      const nextBike = bikes[currentIndex + 1];
      setActiveId(nextBike.id);
      onSelectBike(nextBike);
    }
  };

  const handlePrevBike = () => {
    if (!activeBike) return;
    const currentIndex = bikes.findIndex(b => b.id === activeBike.id);
    if (currentIndex > 0) {
      const prevBike = bikes[currentIndex - 1];
      setActiveId(prevBike.id);
      onSelectBike(prevBike);
    }
  };

  // If no bikes exist at all
  if (bikes.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-500">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-sm">
          <Bike className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">No Evee Bikes Registered Yet</h2>
        <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto">
          Please register your electric bikes in the Product Entry page to view detailed technical specifications and inspect inventory records.
        </p>
      </div>
    );
  }

  // Active Index in list for Prev/Next
  const currentBikeIndex = activeBike ? bikes.findIndex(b => b.id === activeBike.id) : -1;
  const profit = activeBike ? (activeBike.sellingPrice || 0) - (activeBike.purchasePrice || 0) : 0;
  const marginPct = activeBike && activeBike.purchasePrice > 0 ? Math.round((profit / activeBike.purchasePrice) * 100) : 0;
  const isInstallment = activeBike?.status === 'SOLD_INSTALLMENT';
  const plan = activeBike?.installmentPlan;

  const installmentPct = plan && plan.totalSalePrice > 0 
    ? Math.min(100, Math.round((plan.totalPaid / plan.totalSalePrice) * 100)) 
    : 0;

  return (
    <div className="w-full max-w-[1720px] 2xl:max-w-[1920px] 3xl:max-w-[2400px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-4 sm:py-6 space-y-6">

      {/* =========================================================================
          VIEW MODE 1: ALL PRODUCTS LIST / CATALOG
          ========================================================================= */}
      {viewMode === 'list' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          
          {/* Header & Controls Bar */}
          <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-xl shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Evee Product Catalog & Specs Explorer</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-mono">
                      {bikes.length} {bikes.length === 1 ? 'Product' : 'Products'} Total
                    </span>
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Click on any product row from the list below to inspect full specifications, customer details, and installment ledger.
                  </p>
                </div>
              </div>

              {/* Quick Jump to active detail if available */}
              {activeBike && (
                <button
                  onClick={() => setViewMode('detail')}
                  className="self-start md:self-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-300 transition"
                >
                  <span>Open Selected: {activeBike.modelName}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filters and Search Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 pt-3 border-t border-slate-100">
              
              {/* Search Bar */}
              <div className="lg:col-span-5 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search model, variant, chassis VIN, color, customer, shop..."
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg pl-9 pr-8 py-2 text-xs text-slate-800 placeholder-slate-400 transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <div className="lg:col-span-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium"
                >
                  <option value="ALL">All Statuses ({bikes.length})</option>
                  <option value="IN_STOCK">In Stock ({bikes.filter(b => b.status === 'IN_STOCK').length})</option>
                  <option value="SOLD_FULL">Sold (Full Cash) ({bikes.filter(b => b.status === 'SOLD_FULL').length})</option>
                  <option value="SOLD_INSTALLMENT">On Installment ({bikes.filter(b => b.status === 'SOLD_INSTALLMENT').length})</option>
                </select>
              </div>

              {/* Model Filter */}
              <div className="lg:col-span-2">
                <select
                  value={modelFilter}
                  onChange={(e) => setModelFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium"
                >
                  <option value="ALL">All Models</option>
                  {distinctModels.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div className="lg:col-span-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium"
                >
                  <option value="NEWEST">Sort: Newest First</option>
                  <option value="MODEL_ASC">Sort: Model (A-Z)</option>
                  <option value="PRICE_DESC">Price: High to Low</option>
                  <option value="PRICE_ASC">Price: Low to High</option>
                </select>
              </div>

            </div>
          </div>

          {/* Product List Table / Directory */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <ListFilter className="w-3.5 h-3.5 text-blue-600" />
                Products List ({filteredBikes.length} {filteredBikes.length === 1 ? 'Record' : 'Records'})
              </span>
              <span className="text-[11px] text-slate-500">
                Click any row or "View Specs" to open detailed specs sheet
              </span>
            </div>

            {filteredBikes.length === 0 ? (
              <div className="p-12 text-center text-slate-500 space-y-2">
                <AlertCircle className="w-8 h-8 mx-auto text-slate-400" />
                <p className="text-sm font-semibold text-slate-700">No vehicles match your search or filter</p>
                <p className="text-xs text-slate-500">Try clearing your search query or selecting "All Statuses".</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('ALL');
                    setModelFilter('ALL');
                  }}
                  className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700 underline"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs text-slate-700 min-w-[950px]">
                  <thead className="bg-slate-100/75 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Vehicle Model & Variant</th>
                      <th className="py-3 px-3">Chassis Number (VIN)</th>
                      <th className="py-3 px-3">Color</th>
                      <th className="py-3 px-3">Powertrain & Specs</th>
                      <th className="py-3 px-3">Cost / Retail Price</th>
                      <th className="py-3 px-3">Status / Assignment</th>
                      <th className="py-3 px-4 text-right">Inspect Detail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBikes.map((bike) => {
                      const itemProfit = bike.sellingPrice - bike.purchasePrice;
                      return (
                        <tr
                          key={bike.id}
                          onClick={() => handleOpenBikeDetail(bike)}
                          className="hover:bg-blue-50/60 cursor-pointer transition group"
                        >
                          {/* Model & Variant */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-blue-100/70 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-blue-600 group-hover:text-white transition">
                                <Bike className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 text-sm block group-hover:text-blue-600 transition">
                                  {bike.modelName}
                                </span>
                                <span className="text-[11px] text-slate-500 font-medium">
                                  {bike.customBikeName && bike.customBikeName !== bike.modelName 
                                    ? bike.customBikeName 
                                    : 'Standard Edition'}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Chassis Number */}
                          <td className="py-3.5 px-3">
                            <span className="font-mono text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-800 border border-slate-200 block w-fit">
                              {bike.chassisNumber}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              Reg: {formatDate(bike.entryDate)}
                            </span>
                          </td>

                          {/* Color */}
                          <td className="py-3.5 px-3">
                            <span className="inline-flex items-center gap-1.5 font-medium text-slate-800">
                              <span 
                                className="w-2.5 h-2.5 rounded-full inline-block border border-slate-300 shrink-0"
                                style={{
                                  backgroundColor: 
                                    bike.color.toLowerCase().includes('black') ? '#0f172a' :
                                    bike.color.toLowerCase().includes('white') ? '#f8fafc' :
                                    bike.color.toLowerCase().includes('red') ? '#ef4444' :
                                    bike.color.toLowerCase().includes('blue') ? '#3b82f6' :
                                    bike.color.toLowerCase().includes('green') ? '#10b981' :
                                    bike.color.toLowerCase().includes('yellow') ? '#eab308' :
                                    bike.color.toLowerCase().includes('grey') ? '#94a3b8' :
                                    '#06b6d4'
                                }}
                              ></span>
                              <span>{bike.color}</span>
                            </span>
                          </td>

                          {/* Powertrain */}
                          <td className="py-3.5 px-3">
                            <div className="space-y-0.5">
                              <span className="font-mono font-semibold text-slate-800 text-[11px] block">
                                {bike.motorPowerWatts || 1200}W • {bike.batteryCapacity || '72V Graphene'}
                              </span>
                              <span className="text-[10px] text-blue-600 font-mono block">
                                {bike.maxSpeedKmH || 60} km/h • {bike.rangeKm || 75} km
                              </span>
                            </div>
                          </td>

                          {/* Cost / Retail Price */}
                          <td className="py-3.5 px-3">
                            <div className="space-y-0.5">
                              <span className="font-mono font-bold text-slate-900 text-xs block">
                                {formatCurrency(bike.sellingPrice)}
                              </span>
                              <span className="font-mono text-[10px] text-slate-500 block">
                                Cost: {formatCurrency(bike.purchasePrice)}
                              </span>
                            </div>
                          </td>

                          {/* Status & Assignment */}
                          <td className="py-3.5 px-3">
                            {bike.status === 'IN_STOCK' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                In Stock
                              </span>
                            )}
                            {bike.status === 'SOLD_FULL' && (
                              <div>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-300">
                                  <CheckCircle className="w-3 h-3" />
                                  Sold (Cash)
                                </span>
                                {bike.customer && (
                                  <span className="text-[10px] text-slate-600 block mt-0.5 font-medium truncate max-w-[140px]">
                                    {bike.customer.fullName}
                                  </span>
                                )}
                              </div>
                            )}
                            {bike.status === 'SOLD_INSTALLMENT' && (
                              <div>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                                  bike.installmentPlan?.status === 'PAID'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                    : 'bg-amber-50 text-amber-800 border-amber-300'
                                }`}>
                                  <CreditCard className="w-3 h-3" />
                                  {bike.installmentPlan?.status === 'PAID' ? 'Fully Paid' : 'Installment'}
                                </span>
                                {bike.customer && (
                                  <span className="text-[10px] text-slate-600 block mt-0.5 font-medium truncate max-w-[140px]">
                                    {bike.customer.fullName}
                                  </span>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Inspect Detail Button */}
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenBikeDetail(bike);
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white text-xs font-bold border border-blue-200 group-hover:border-blue-600 transition shadow-sm"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Specs</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* =========================================================================
          VIEW MODE 2: VEHICLE MASTER INSPECTOR & SPECS SHEET
          ========================================================================= */}
      {viewMode === 'detail' && activeBike && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Top Navigation & Selector Bar */}
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Left: Back to List Button & Title */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => setViewMode('list')}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 transition shadow-sm shrink-0"
              >
                <ArrowLeft className="w-4 h-4 text-slate-600" />
                <span>Back to Products List</span>
              </button>

              <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

              <div>
                <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Evee Vehicle Master Inspector & Specs Sheet</span>
                </h1>
                <p className="text-xs text-slate-500">
                  Inspecting {activeBike.modelName} ({activeBike.chassisNumber})
                </p>
              </div>
            </div>

            {/* Right: Quick Bike Dropdown & Prev/Next */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevBike}
                  disabled={currentBikeIndex <= 0}
                  title="Previous Vehicle"
                  className="p-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextBike}
                  disabled={currentBikeIndex >= bikes.length - 1}
                  title="Next Vehicle"
                  className="p-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <span className="text-xs text-slate-600 font-medium whitespace-nowrap hidden sm:inline">Select Bike:</span>
              <select
                id="bike-detail-selector"
                value={activeBike.id}
                onChange={(e) => {
                  const b = bikes.find(item => item.id === e.target.value);
                  if (b) {
                    setActiveId(b.id);
                    onSelectBike(b);
                  }
                }}
                className="w-full sm:w-64 md:w-72 bg-white border border-slate-300 text-xs text-slate-900 rounded-lg px-3 py-2 font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                {bikes.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.chassisNumber} — {b.modelName} ({b.status === 'IN_STOCK' ? 'In Stock' : b.status === 'SOLD_FULL' ? 'Sold Cash' : 'Installment'})
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* MAIN VEHICLE DETAIL SHEET */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* LEFT 2 COLUMNS: VEHICLE SPECS & STATUS */}
            <div className="lg:col-span-2 space-y-6">

              {/* Vehicle Identity Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 relative overflow-hidden shadow-sm">
                {/* Top Row: Model & Status */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                        Evee Electric Motors
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-500 font-mono">
                        Registered {formatDate(activeBike.entryDate)}
                      </span>
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-900 mt-1">{activeBike.modelName}</h2>
                    {activeBike.customBikeName && (
                      <p className="text-sm text-slate-600 font-medium mt-0.5">{activeBike.customBikeName}</p>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div>
                    {activeBike.status === 'IN_STOCK' && (
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        AVAILABLE IN STOCK
                      </span>
                    )}
                    {activeBike.status === 'SOLD_FULL' && (
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-300">
                        <CheckCircle className="w-3.5 h-3.5" />
                        SOLD (FULL PAYMENT)
                      </span>
                    )}
                    {activeBike.status === 'SOLD_INSTALLMENT' && (
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${
                        plan?.status === 'PAID'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}>
                        <CreditCard className="w-3.5 h-3.5" />
                        {plan?.status === 'PAID' ? 'INSTALLMENT FULLY PAID (NOC ISSUED)' : 'ON INSTALLMENT PLAN'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Chassis VIN Highlight Box */}
                <div className="mt-5 bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">
                      Unique Vehicle Chassis Number (VIN)
                    </span>
                    <span className="text-lg font-mono font-extrabold text-blue-700 tracking-wider">
                      {activeBike.chassisNumber}
                    </span>
                  </div>
                  <button
                    onClick={handleCopyChassis}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-300 transition shadow-sm"
                  >
                    {copiedChassis ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy VIN</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Specifications Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">Color</span>
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mt-1">
                      <span 
                        className="w-2.5 h-2.5 rounded-full inline-block border border-slate-300"
                        style={{
                          backgroundColor: 
                            activeBike.color.toLowerCase().includes('black') ? '#0f172a' :
                            activeBike.color.toLowerCase().includes('white') ? '#f8fafc' :
                            activeBike.color.toLowerCase().includes('red') ? '#ef4444' :
                            activeBike.color.toLowerCase().includes('blue') ? '#3b82f6' :
                            activeBike.color.toLowerCase().includes('green') ? '#10b981' :
                            activeBike.color.toLowerCase().includes('yellow') ? '#eab308' :
                            activeBike.color.toLowerCase().includes('grey') ? '#94a3b8' :
                            '#06b6d4'
                        }}
                      ></span>
                      {activeBike.color}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">Motor Power</span>
                    <span className="text-xs font-bold text-slate-800 mt-1 block font-mono">
                      {activeBike.motorPowerWatts ? `${activeBike.motorPowerWatts}W BLDC` : 'High Efficiency'}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">Battery Pack</span>
                    <span className="text-xs font-bold text-slate-800 mt-1 block">
                      {activeBike.batteryCapacity || 'Graphene / Lithium'}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">Max Speed / Range</span>
                    <span className="text-xs font-bold text-blue-700 mt-1 block font-mono">
                      {activeBike.maxSpeedKmH || 60} km/h • {activeBike.rangeKm || 75} km
                    </span>
                  </div>
                </div>

                {/* Detailed Engine Text */}
                <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                    Engine & Drivetrain Specifications:
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed font-mono">
                    {activeBike.engineMotorDetails}
                  </p>
                </div>

                {/* Notes */}
                {activeBike.notes && (
                  <div className="mt-3 text-[11px] text-slate-500 italic">
                    Showroom Notes: {activeBike.notes}
                  </div>
                )}
              </div>

              {/* INSTALLMENT LEDGER & PAYMENT HISTORY (If Sold on Installment) */}
              {isInstallment && plan && (
                <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-amber-600" />
                        Installment Ledger & Payment History
                      </h3>
                      <p className="text-xs text-slate-500">
                        Real-time payment tracking, paid amount calculations, and remaining balances.
                      </p>
                    </div>

                    {plan.status === 'ACTIVE' && (
                      <button
                        onClick={() => onReceivePayment(activeBike)}
                        className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow-sm transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Record Installment Payment</span>
                      </button>
                    )}
                  </div>

                  {/* Installment Summary Matrix */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-[10px] uppercase text-slate-500 block font-semibold">Selling Price</span>
                      <span className="text-sm font-bold font-mono text-slate-900 mt-0.5 block">
                        {formatCurrency(plan.totalSalePrice)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase text-slate-500 block font-semibold">Down Payment</span>
                      <span className="text-sm font-bold font-mono text-blue-600 mt-0.5 block">
                        {formatCurrency(plan.downPayment)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase text-slate-500 block font-semibold">Total Paid to Date</span>
                      <span className="text-sm font-bold font-mono text-emerald-600 mt-0.5 block">
                        {formatCurrency(plan.totalPaid)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase text-slate-500 block font-semibold">Remaining Balance</span>
                      <span className="text-sm font-bold font-mono text-amber-700 mt-0.5 block">
                        {formatCurrency(plan.remainingBalance)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-600 mb-1.5 font-medium">
                      <span>Paid: {formatCurrency(plan.totalPaid)} ({installmentPct}%)</span>
                      <span>Balance: {formatCurrency(plan.remainingBalance)}</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          plan.status === 'PAID' ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-500 to-amber-500'
                        }`}
                        style={{ width: `${installmentPct}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Payment History Table */}
                  <div>
                    <span className="text-xs font-semibold text-slate-700 block mb-2">
                      Transaction Logs & Payment Receipts ({plan.payments.length} Payments Recorded)
                    </span>

                    {plan.payments.length === 0 ? (
                      <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs">
                        No recurring installments recorded yet. Only initial down payment received.
                      </div>
                    ) : (
                      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto w-full">
                          <table className="w-full text-left text-xs text-slate-700 min-w-[500px]">
                            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                              <tr>
                                <th className="py-2.5 px-3 whitespace-nowrap">Receipt #</th>
                                <th className="py-2.5 px-3 whitespace-nowrap">Date</th>
                                <th className="py-2.5 px-3 whitespace-nowrap">Payer Name</th>
                                <th className="py-2.5 px-3 whitespace-nowrap">Received By</th>
                                <th className="py-2.5 px-3 whitespace-nowrap">Method</th>
                                <th className="py-2.5 px-3 text-right whitespace-nowrap">Amount Paid</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-mono">
                              {plan.payments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-slate-50">
                                  <td className="py-2.5 px-3 font-semibold text-blue-600">
                                    {payment.receiptNumber}
                                  </td>
                                  <td className="py-2.5 px-3 text-slate-700 font-sans">
                                    {formatDate(payment.paidDate)}
                                  </td>
                                  <td className="py-2.5 px-3 font-sans text-slate-900 font-semibold">
                                    {payment.payerName}
                                  </td>
                                  <td className="py-2.5 px-3 font-sans text-slate-500">
                                    {payment.receivedByName}
                                  </td>
                                  <td className="py-2.5 px-3 font-sans text-slate-600">
                                    <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px]">
                                      {payment.paymentMethod}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-bold text-emerald-600">
                                    {formatCurrency(payment.amount)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* RIGHT COLUMN: PRICING, CUSTOMER RECORD & ACTIONS */}
            <div className="space-y-6">

              {/* Pricing & Commercial Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Financial & Cost Details
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 text-xs">
                    <span className="text-slate-500">Purchase Price (Bought):</span>
                    <span className="font-mono font-semibold text-slate-700">
                      {formatCurrency(activeBike.purchasePrice)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-slate-100 text-xs">
                    <span className="text-slate-500">Customer Retail Price:</span>
                    <span className="font-mono font-bold text-blue-600">
                      {formatCurrency(activeBike.sellingPrice)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-slate-100 text-xs">
                    <span className="text-slate-500">Gross Margin (Profit):</span>
                    <span className="font-mono font-bold text-emerald-600">
                      +{formatCurrency(profit)} ({marginPct}%)
                    </span>
                  </div>

                  {activeBike.actualSoldPrice && (
                    <div className="flex justify-between items-center py-2 border-b border-slate-100 text-xs bg-slate-50 px-2 rounded-lg">
                      <span className="text-slate-600 font-medium">Actual Sale Price:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {formatCurrency(activeBike.actualSoldPrice)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Profile Card (if sold) */}
              {activeBike.customer ? (
                <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-blue-600" />
                      Owner / Customer Details
                    </h3>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {activeBike.saleInvoiceNumber}
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-500 block">Full Name:</span>
                      <span className="font-bold text-slate-900 text-sm">{activeBike.customer.fullName}</span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-500 block">Phone / Mobile:</span>
                      <span className="font-mono text-blue-600 font-semibold">{activeBike.customer.phone}</span>
                    </div>

                    {activeBike.customer.cnicOrId && (
                      <div>
                        <span className="text-[11px] text-slate-500 block">CNIC / National ID:</span>
                        <span className="font-mono text-slate-700">{activeBike.customer.cnicOrId}</span>
                      </div>
                    )}

                    {activeBike.customer.address && (
                      <div>
                        <span className="text-[11px] text-slate-500 block">Address:</span>
                        <span className="text-slate-700 leading-snug">
                          {activeBike.customer.address}, {activeBike.customer.city}
                        </span>
                      </div>
                    )}

                    {/* Sold From Shop / Branch */}
                    {(activeBike.shopName || activeBike.saleShopName) && (
                      <div>
                        <span className="text-[11px] text-slate-500 block">Sold From Shop / Branch:</span>
                        <div className="flex items-center gap-1.5 mt-0.5 text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          <Store className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{activeBike.shopName || activeBike.saleShopName}</span>
                        </div>
                      </div>
                    )}

                    {activeBike.saleDate && (
                      <div>
                        <span className="text-[11px] text-slate-500 block">Sale & Handover Date:</span>
                        <span className="text-slate-700">{formatDate(activeBike.saleDate)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-5 text-center text-xs text-slate-500">
                  <User className="w-6 h-6 mx-auto text-slate-400 mb-2" />
                  <p className="font-semibold text-slate-700">Vehicle In Stock</p>
                  <p className="text-[11px] mt-0.5">No customer assigned yet. Ready for sale.</p>
                </div>
              )}

              {/* Action Hub */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2.5 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">
                  Vehicle Operations
                </span>

                {activeBike.status === 'IN_STOCK' ? (
                  <button
                    id="detail-sell-bike-btn"
                    onClick={() => onSellBike(activeBike)}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-lg shadow-sm transition"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Sell This Evee Bike</span>
                  </button>
                ) : (
                  <button
                    id="detail-print-invoice-btn"
                    onClick={() => onPrintInvoice(activeBike)}
                    className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs py-2.5 rounded-lg border border-slate-300 transition shadow-sm"
                  >
                    <Printer className="w-4 h-4 text-blue-600" />
                    <span>Print Sale Invoice & Certificate</span>
                  </button>
                )}

                {isInstallment && plan?.status === 'ACTIVE' && (
                  <button
                    onClick={() => onReceivePayment(activeBike)}
                    className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2.5 rounded-lg shadow-sm transition"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Record Installment Payment</span>
                  </button>
                )}

                <button
                  onClick={() => onEditBike(activeBike)}
                  className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs py-2 rounded-lg border border-slate-300 transition"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Bike Details</span>
                </button>

                <button
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete bike with chassis ${activeBike.chassisNumber}?`)) {
                      onDeleteBike(activeBike.id);
                      setViewMode('list');
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs py-1.5 rounded-lg transition font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete from Inventory</span>
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};
