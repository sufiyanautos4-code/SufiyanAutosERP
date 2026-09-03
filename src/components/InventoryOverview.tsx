import React, { useState } from 'react';
import { 
  Package, 
  CheckCircle, 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  Filter, 
  Search, 
  Eye, 
  Plus, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Tag,
  Boxes,
  ShoppingBag,
  CreditCard,
  Sparkles,
  Store
} from 'lucide-react';
import { EveeBike, VehicleStatus } from '../types';
import { calculateModelSummaries, formatCurrency, formatDate } from '../utils/formatters';
import { matchesBikeSearch } from '../utils/searchMatcher';

interface InventoryOverviewProps {
  bikes: EveeBike[];
  onSelectBike: (bike: EveeBike) => void;
  onNewBike: () => void;
  onSellBike: (bike: EveeBike) => void;
  onReceivePayment: (bike: EveeBike) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const InventoryOverview: React.FC<InventoryOverviewProps> = ({
  bikes,
  onSelectBike,
  onNewBike,
  onSellBike,
  onReceivePayment,
  searchQuery,
  setSearchQuery,
}) => {
  const [selectedModelFilter, setSelectedModelFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [selectedColorFilter, setSelectedColorFilter] = useState<string>('ALL');

  // Compute model summaries
  const modelSummaries = calculateModelSummaries(bikes);

  // Overall totals
  const totalUnits = bikes.length;
  const inStockUnits = bikes.filter(b => b.status === 'IN_STOCK').length;
  const soldUnits = bikes.filter(b => b.status !== 'IN_STOCK').length;
  const soldFullUnits = bikes.filter(b => b.status === 'SOLD_FULL').length;
  const soldInstallmentUnits = bikes.filter(b => b.status === 'SOLD_INSTALLMENT').length;

  const totalCostValue = bikes
    .filter(b => b.status === 'IN_STOCK')
    .reduce((sum, b) => sum + (b.purchasePrice || 0), 0);

  const totalSalesRevenue = bikes
    .filter(b => b.status !== 'IN_STOCK')
    .reduce((sum, b) => {
      if (b.status === 'SOLD_FULL') {
        return sum + (b.actualSoldPrice || b.sellingPrice);
      } else if (b.status === 'SOLD_INSTALLMENT') {
        return sum + (b.installmentPlan?.totalPaid ?? b.installmentPlan?.downPayment ?? 0);
      }
      return sum;
    }, 0);

  // Extract unique colors for filter
  const allColors = Array.from(new Set(bikes.map(b => b.color).filter(Boolean)));

  // Filtered bikes for the detailed table
  const filteredBikes = bikes.filter(bike => {
    // Model filter
    if (selectedModelFilter !== 'ALL' && bike.modelName !== selectedModelFilter) {
      return false;
    }
    // Status filter
    if (selectedStatusFilter !== 'ALL' && bike.status !== selectedStatusFilter) {
      return false;
    }
    // Color filter
    if (selectedColorFilter !== 'ALL' && bike.color !== selectedColorFilter) {
      return false;
    }
    // Search query - Accurate multi-token & word-boundary matching
    if (!matchesBikeSearch(bike, searchQuery)) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 sm:space-y-8 w-full max-w-[1720px] 2xl:max-w-[1920px] 3xl:max-w-[2400px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-4 sm:py-6">
      
      {/* Top Header & Context Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-4 sm:p-5 rounded-xl shadow-sm">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Boxes className="w-5 h-5 text-blue-600 shrink-0" />
              Real-Time Stock Inventory Management
            </h1>
            <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-0.5 rounded-full border border-blue-200 font-semibold">
              Live Synchronized
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time stock calculations per Evee model, chassis status tracking, inventory value, and sales metrics.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            id="add-new-evee-stock-btn"
            onClick={onNewBike}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-lg shadow-sm transition active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Bike (VIN)</span>
          </button>
        </div>
      </div>

      {/* Top Metrics Row - Professional Polish Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Fleet */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm flex flex-col justify-between border-l-4 border-l-slate-400">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Fleet Acquired</span>
            <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{totalUnits}</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">
              Across {modelSummaries.length} Evee models
            </div>
          </div>
        </div>

        {/* Current In-Stock */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm flex flex-col justify-between border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">In-Stock (Available)</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">{inStockUnits}</div>
              <span className="text-xs font-semibold text-emerald-700">
                ({totalUnits > 0 ? Math.round((inStockUnits / totalUnits) * 100) : 0}%)
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">
              Ready for immediate dispatch
            </div>
          </div>
        </div>

        {/* Total Sold */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm flex flex-col justify-between border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Total Units Sold</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <div className="text-2xl sm:text-3xl font-black text-blue-600 tracking-tight">{soldUnits}</div>
              <span className="text-xs font-semibold text-blue-700">
                ({totalUnits > 0 ? Math.round((soldUnits / totalUnits) * 100) : 0}%)
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1 flex gap-2 font-medium flex-wrap">
              <span>{soldFullUnits} Cash</span>
              <span>•</span>
              <span>{soldInstallmentUnits} Installments</span>
            </div>
          </div>
        </div>

        {/* Revenue Collected */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm flex flex-col justify-between border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Sales Cash Collected</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono truncate">
              {formatCurrency(totalSalesRevenue)}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">
              Stock In-Hand: {formatCurrency(totalCostValue)}
            </div>
          </div>
        </div>
      </div>

      {/* MODEL-WISE INVENTORY SECTION */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Tag className="w-4 h-4 text-blue-600" />
              Stock Breakdown by Evee Bike Model
            </h2>
            <p className="text-xs text-slate-500">
              Accurately calculated stock on hand vs sold units for each specific model.
            </p>
          </div>
          <div className="text-xs text-slate-600 font-mono font-semibold">
            {modelSummaries.length} Models Registered
          </div>
        </div>

        {/* Model Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-6 gap-4">
          {modelSummaries.map((summary) => {
            const stockPct = summary.totalAcquired > 0 
              ? Math.round((summary.inStockCount / summary.totalAcquired) * 100) 
              : 0;

            const isFiltered = selectedModelFilter === summary.modelName;

            return (
              <div 
                key={summary.modelName}
                id={`model-card-${summary.modelName.replace(/\s+/g, '-').toLowerCase()}`}
                className={`bg-white border rounded-xl p-5 shadow-sm transition-all duration-200 hover:shadow-md flex flex-col justify-between ${
                  isFiltered ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Model Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-slate-900">{summary.modelName}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                          summary.stockHealth === 'Healthy' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : summary.stockHealth === 'Low Stock'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {summary.stockHealth}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Total Acquired: <span className="text-slate-800 font-semibold">{summary.totalAcquired} units</span>
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        if (selectedModelFilter === summary.modelName) {
                          setSelectedModelFilter('ALL');
                        } else {
                          setSelectedModelFilter(summary.modelName);
                        }
                      }}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition ${
                        isFiltered 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {isFiltered ? 'Filtering ✓' : 'Filter Table'}
                    </button>
                  </div>

                  {/* Stock vs Sold Numbers */}
                  <div className="grid grid-cols-2 gap-2 mt-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div>
                      <div className="text-[11px] text-slate-500 font-medium">Left in Stock</div>
                      <div className="text-xl font-bold text-emerald-600 flex items-center gap-1.5 mt-0.5">
                        <span>{summary.inStockCount}</span>
                        <span className="text-xs font-normal text-slate-500">units</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-500 font-medium">Sold Out</div>
                      <div className="text-xl font-bold text-blue-600 flex items-center gap-1.5 mt-0.5">
                        <span>{summary.soldCount}</span>
                        <span className="text-xs font-normal text-slate-500">units</span>
                      </div>
                    </div>
                  </div>

                  {/* Stock Meter */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[11px] text-slate-500 mb-1 font-medium">
                      <span>Stock Available: {stockPct}%</span>
                      <span>Sold: {100 - stockPct}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                      <div 
                        className="bg-emerald-500 h-full transition-all duration-500" 
                        style={{ width: `${stockPct}%` }}
                        title={`${summary.inStockCount} in stock`}
                      ></div>
                      <div 
                        className="bg-blue-600 h-full transition-all duration-500" 
                        style={{ width: `${100 - stockPct}%` }}
                        title={`${summary.soldCount} sold`}
                      ></div>
                    </div>
                  </div>

                  {/* Available Colors */}
                  {summary.availableColors.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5 items-center">
                      <span className="text-[11px] text-slate-500 font-medium">Colors:</span>
                      {summary.availableColors.map((color) => (
                        <span 
                          key={color}
                          className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200 font-medium"
                        >
                          {color}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Footer Breakdown */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    Full Cash: <strong className="text-slate-800">{summary.soldFullCount}</strong>
                  </span>
                  <span>
                    Installments: <strong className="text-amber-700">{summary.soldInstallmentCount}</strong>
                  </span>
                  <span className="text-emerald-700 font-mono font-bold">
                    {formatCurrency(summary.totalRevenueGenerated)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DETAILED CHASSIS INVENTORY TABLE */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Chassis-Level Inventory Registry
            </h2>
            <p className="text-xs text-slate-500">
              Unique chassis numbers (VIN), color, purchase & retail prices, and customer assignment.
            </p>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-lg text-xs shadow-sm">
              <span className="text-slate-500 px-2 font-medium">Status:</span>
              <button
                onClick={() => setSelectedStatusFilter('ALL')}
                className={`px-2.5 py-1 rounded text-xs transition ${
                  selectedStatusFilter === 'ALL' 
                    ? 'bg-slate-800 text-white font-semibold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({bikes.length})
              </button>
              <button
                onClick={() => setSelectedStatusFilter('IN_STOCK')}
                className={`px-2.5 py-1 rounded text-xs transition ${
                  selectedStatusFilter === 'IN_STOCK' 
                    ? 'bg-emerald-600 text-white font-semibold' 
                    : 'text-emerald-700 hover:text-emerald-800'
                }`}
              >
                In Stock ({inStockUnits})
              </button>
              <button
                onClick={() => setSelectedStatusFilter('SOLD_FULL')}
                className={`px-2.5 py-1 rounded text-xs transition ${
                  selectedStatusFilter === 'SOLD_FULL' 
                    ? 'bg-blue-600 text-white font-semibold' 
                    : 'text-blue-700 hover:text-blue-800'
                }`}
              >
                Sold (Full) ({soldFullUnits})
              </button>
              <button
                onClick={() => setSelectedStatusFilter('SOLD_INSTALLMENT')}
                className={`px-2.5 py-1 rounded text-xs transition ${
                  selectedStatusFilter === 'SOLD_INSTALLMENT' 
                    ? 'bg-amber-600 text-white font-semibold' 
                    : 'text-amber-700 hover:text-amber-800'
                }`}
              >
                Installment ({soldInstallmentUnits})
              </button>
            </div>

            {/* Model Filter Dropdown */}
            <select
              value={selectedModelFilter}
              onChange={(e) => setSelectedModelFilter(e.target.value)}
              className="bg-white border border-slate-300 text-xs text-slate-800 rounded-lg px-3 py-1.5 focus:border-blue-500 shadow-sm"
            >
              <option value="ALL">All Models ({modelSummaries.length})</option>
              {modelSummaries.map((m) => (
                <option key={m.modelName} value={m.modelName}>
                  {m.modelName} ({m.inStockCount} in stock / {m.soldCount} sold)
                </option>
              ))}
            </select>

            {/* Color Filter */}
            {allColors.length > 0 && (
              <select
                value={selectedColorFilter}
                onChange={(e) => setSelectedColorFilter(e.target.value)}
                className="bg-white border border-slate-300 text-xs text-slate-800 rounded-lg px-3 py-1.5 focus:border-blue-500 shadow-sm"
              >
                <option value="ALL">All Colors</option>
                {allColors.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            )}

            {(selectedModelFilter !== 'ALL' || selectedStatusFilter !== 'ALL' || selectedColorFilter !== 'ALL' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedModelFilter('ALL');
                  setSelectedStatusFilter('ALL');
                  setSelectedColorFilter('ALL');
                  setSearchQuery('');
                }}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold underline px-1"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Table View */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs text-slate-700 min-w-[850px]">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[130px]">Chassis # (VIN)</th>
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[130px]">Model & Bike Name</th>
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[100px]">Color</th>
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[130px]">Cost Price (Bought)</th>
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[120px]">Selling Price</th>
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[120px]">Status</th>
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[140px]">Customer Details</th>
                  <th className="py-3.5 px-4 text-right whitespace-nowrap min-w-[100px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBikes.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <AlertCircle className="w-6 h-6 text-slate-400" />
                        <p className="text-sm font-medium">No Evee bikes found matching current filters.</p>
                        <button
                          onClick={() => {
                            setSelectedModelFilter('ALL');
                            setSelectedStatusFilter('ALL');
                            setSelectedColorFilter('ALL');
                            setSearchQuery('');
                          }}
                          className="text-xs text-blue-600 font-semibold hover:underline"
                        >
                          Clear all filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredBikes.map((bike) => {
                    return (
                      <tr 
                        key={bike.id}
                        id={`bike-row-${bike.id}`}
                        className="hover:bg-slate-50/80 transition duration-150 group"
                      >
                        {/* Chassis Number */}
                        <td className="py-3 px-4 font-mono font-bold text-blue-600">
                          <div className="flex items-center gap-1.5">
                            <span>#</span>
                            <span className="cursor-pointer hover:underline" onClick={() => onSelectBike(bike)}>
                              {bike.chassisNumber}
                            </span>
                          </div>
                        </td>

                        {/* Model & Name */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{bike.modelName}</div>
                          {bike.customBikeName && bike.customBikeName !== bike.modelName && (
                            <div className="text-[11px] text-slate-500">{bike.customBikeName}</div>
                          )}
                        </td>

                        {/* Color */}
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium">
                            <span 
                              className="w-2 h-2 rounded-full inline-block border border-slate-300"
                              style={{
                                backgroundColor: 
                                  bike.color.toLowerCase().includes('black') ? '#0f172a' :
                                  bike.color.toLowerCase().includes('white') ? '#f8fafc' :
                                  bike.color.toLowerCase().includes('red') ? '#ef4444' :
                                  bike.color.toLowerCase().includes('blue') ? '#3b82f6' :
                                  bike.color.toLowerCase().includes('green') ? '#10b981' :
                                  bike.color.toLowerCase().includes('yellow') ? '#eab308' :
                                  bike.color.toLowerCase().includes('grey') || bike.color.toLowerCase().includes('silver') ? '#94a3b8' :
                                  '#06b6d4'
                              }}
                            ></span>
                            {bike.color}
                          </span>
                        </td>

                        {/* Purchase Price */}
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {formatCurrency(bike.purchasePrice)}
                        </td>

                        {/* Selling Price */}
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {formatCurrency(bike.sellingPrice)}
                          <span className="block text-[10px] text-emerald-600 font-sans font-semibold">
                            Profit: +{formatCurrency(bike.sellingPrice - bike.purchasePrice)}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          {bike.status === 'IN_STOCK' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              In Stock
                            </span>
                          )}
                          {bike.status === 'SOLD_FULL' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Sold (Cash)
                            </span>
                          )}
                          {bike.status === 'SOLD_INSTALLMENT' && (
                            <div className="space-y-0.5">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                                bike.installmentPlan?.status === 'PAID'
                                  ? 'bg-teal-50 text-teal-700 border-teal-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>
                                <CreditCard className="w-3 h-3" />
                                {bike.installmentPlan?.status === 'PAID' ? 'Installment Settled' : 'Installment Active'}
                              </span>
                              {bike.installmentPlan && (
                                <div className="text-[10px] text-slate-500 font-mono font-medium">
                                  Bal: {formatCurrency(bike.installmentPlan.remainingBalance)}
                                </div>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Customer Info */}
                        <td className="py-3 px-4">
                          {bike.customer ? (
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1">
                                <span>{bike.customer.fullName}</span>
                              </div>
                              <div className="text-[10px] text-slate-500">{bike.customer.phone}</div>
                              {(bike.shopName || bike.saleShopName) && (
                                <div className="inline-flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 mt-1 font-medium">
                                  <Store className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                                  <span>{bike.shopName || bike.saleShopName}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">— In Showroom Stock —</span>
                          )}
                        </td>

                        {/* Action buttons */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              id={`view-btn-${bike.id}`}
                              onClick={() => onSelectBike(bike)}
                              title="View Complete Specs & Record"
                              className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {bike.status === 'IN_STOCK' ? (
                              <button
                                id={`sell-btn-${bike.id}`}
                                onClick={() => onSellBike(bike)}
                                className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs shadow-sm transition"
                              >
                                <DollarSign className="w-3 h-3" />
                                <span>Sell</span>
                              </button>
                            ) : bike.status === 'SOLD_INSTALLMENT' && bike.installmentPlan?.status === 'ACTIVE' ? (
                              <button
                                id={`pay-btn-${bike.id}`}
                                onClick={() => onReceivePayment(bike)}
                                className="flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-xs shadow-sm transition"
                              >
                                <CreditCard className="w-3 h-3" />
                                <span>Pay</span>
                              </button>
                            ) : (
                              <span className="text-[10px] font-semibold text-slate-500 px-2 py-1 bg-slate-100 rounded">
                                Settled
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span className="font-medium">Showing {filteredBikes.length} of {bikes.length} units</span>
            <span className="font-mono text-slate-600 font-semibold">Every unit uniquely tracked by Chassis / VIN</span>
          </div>
        </div>
      </div>

    </div>
  );
};
