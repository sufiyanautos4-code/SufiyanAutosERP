import React, { useState, useMemo } from 'react';
import { 
  Boxes, 
  Package, 
  Tag, 
  Layers, 
  TrendingUp, 
  AlertTriangle, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Eye, 
  DollarSign, 
  CheckCircle, 
  CreditCard, 
  ShieldCheck, 
  BatteryCharging, 
  Zap, 
  Calendar, 
  Gauge, 
  Palette, 
  Copy, 
  Check, 
  Plus, 
  Sparkles,
  ChevronDown,
  ArrowUpDown,
  RefreshCw,
  Clock,
  X
} from 'lucide-react';
import { EveeBike, ModelStockSummary, VehicleStatus } from '../types';
import { calculateModelSummaries, formatCurrency, formatDate } from '../utils/formatters';
import { matchesBikeSearch } from '../utils/searchMatcher';

interface StockInventoryProps {
  bikes: EveeBike[];
  onSelectBike: (bike: EveeBike) => void;
  onNewBike: () => void;
  onSellBike: (bike: EveeBike) => void;
  onReceivePayment: (bike: EveeBike) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const StockInventory: React.FC<StockInventoryProps> = ({
  bikes,
  onSelectBike,
  onNewBike,
  onSellBike,
  onReceivePayment,
  searchQuery,
  setSearchQuery,
}) => {
  // Filters & Sorting state
  const [selectedModel, setSelectedModel] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('IN_STOCK'); // Default to In-Stock for pure stock view
  const [selectedColor, setSelectedColor] = useState<string>('ALL');
  const [selectedBatteryType, setSelectedBatteryType] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price-desc' | 'price-asc' | 'model' | 'chassis'>('newest');
  const [copiedVin, setCopiedVin] = useState<string | null>(null);

  // Placard modal state
  const [selectedPlacardBike, setSelectedPlacardBike] = useState<EveeBike | null>(null);
  const [isAuditPrintOpen, setIsAuditPrintOpen] = useState<boolean>(false);

  // Model Summaries
  const modelSummaries = useMemo(() => calculateModelSummaries(bikes), [bikes]);

  // Overall Stock Calculations
  const totalFleetCount = bikes.length;
  const inStockBikes = useMemo(() => bikes.filter(b => b.status === 'IN_STOCK'), [bikes]);
  const inStockCount = inStockBikes.length;
  const soldFullCount = bikes.filter(b => b.status === 'SOLD_FULL').length;
  const soldInstallmentCount = bikes.filter(b => b.status === 'SOLD_INSTALLMENT').length;
  const totalSoldCount = soldFullCount + soldInstallmentCount;

  // Valuation metrics
  const totalInStockPurchaseCost = inStockBikes.reduce((sum, b) => sum + (b.purchasePrice || 0), 0);
  const totalInStockRetailValue = inStockBikes.reduce((sum, b) => sum + (b.sellingPrice || 0), 0);
  const expectedProfit = totalInStockRetailValue - totalInStockPurchaseCost;
  const averageUnitCost = inStockCount > 0 ? Math.round(totalInStockPurchaseCost / inStockCount) : 0;
  const averageRetailPrice = inStockCount > 0 ? Math.round(totalInStockRetailValue / inStockCount) : 0;

  // Low stock models (<= 2 units in stock)
  const lowStockModels = modelSummaries.filter(m => m.stockHealth === 'Low Stock' || m.stockHealth === 'Out of Stock');

  // Unique Colors & Battery Types in current inventory
  const uniqueColors = useMemo(() => Array.from(new Set(bikes.map(b => b.color).filter(Boolean))), [bikes]);
  
  // Model variant matrix with color counts per model
  const modelDetailedMatrix = useMemo(() => {
    const map = new Map<string, {
      modelName: string;
      inStock: number;
      sold: number;
      total: number;
      colorsInStock: Record<string, number>;
      batteryTypes: Set<string>;
      motorWatts: Set<number>;
      avgPurchasePrice: number;
      avgSellingPrice: number;
      stockValue: number;
    }>();

    bikes.forEach(b => {
      if (!map.has(b.modelName)) {
        map.set(b.modelName, {
          modelName: b.modelName,
          inStock: 0,
          sold: 0,
          total: 0,
          colorsInStock: {},
          batteryTypes: new Set(),
          motorWatts: new Set(),
          avgPurchasePrice: 0,
          avgSellingPrice: 0,
          stockValue: 0,
        });
      }
      const item = map.get(b.modelName)!;
      item.total += 1;
      if (b.batteryCapacity) item.batteryTypes.add(b.batteryCapacity);
      if (b.motorPowerWatts) item.motorWatts.add(b.motorPowerWatts);

      if (b.status === 'IN_STOCK') {
        item.inStock += 1;
        item.stockValue += (b.purchasePrice || 0);
        if (b.color) {
          item.colorsInStock[b.color] = (item.colorsInStock[b.color] || 0) + 1;
        }
      } else {
        item.sold += 1;
      }
    });

    return Array.from(map.values()).sort((a, b) => b.inStock - a.inStock);
  }, [bikes]);

  // Copy VIN handler
  const handleCopyVin = (vin: string) => {
    navigator.clipboard?.writeText(vin);
    setCopiedVin(vin);
    setTimeout(() => setCopiedVin(null), 2000);
  };

  // Filtered & Sorted Bikes List
  const filteredBikes = useMemo(() => {
    return bikes.filter(bike => {
      // Model Filter
      if (selectedModel !== 'ALL' && bike.modelName !== selectedModel) return false;

      // Status Filter
      if (selectedStatus === 'IN_STOCK' && bike.status !== 'IN_STOCK') return false;
      if (selectedStatus === 'SOLD' && bike.status === 'IN_STOCK') return false;
      if (selectedStatus === 'SOLD_FULL' && bike.status !== 'SOLD_FULL') return false;
      if (selectedStatus === 'SOLD_INSTALLMENT' && bike.status !== 'SOLD_INSTALLMENT') return false;

      // Color Filter
      if (selectedColor !== 'ALL' && bike.color !== selectedColor) return false;

      // Battery Filter
      if (selectedBatteryType !== 'ALL') {
        const bikeBat = (bike.batteryCapacity || bike.engineMotorDetails || '').toLowerCase();
        if (!bikeBat.includes(selectedBatteryType.toLowerCase())) return false;
      }

      // Search Query - Accurate multi-token & word-boundary matching
      if (!matchesBikeSearch(bike, searchQuery)) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime();
      }
      if (sortBy === 'price-desc') {
        return (b.sellingPrice || 0) - (a.sellingPrice || 0);
      }
      if (sortBy === 'price-asc') {
        return (a.sellingPrice || 0) - (b.sellingPrice || 0);
      }
      if (sortBy === 'model') {
        return a.modelName.localeCompare(b.modelName);
      }
      if (sortBy === 'chassis') {
        return a.chassisNumber.localeCompare(b.chassisNumber);
      }
      return 0;
    });
  }, [bikes, selectedModel, selectedStatus, selectedColor, selectedBatteryType, searchQuery, sortBy]);

  // Export Stock CSV
  const handleExportStockCSV = () => {
    const headers = [
      'Chassis Number (VIN)',
      'Model Name',
      'Color',
      'Motor Power (Watts)',
      'Battery Specs',
      'Max Speed (km/h)',
      'Range (km)',
      'Purchase Price (PKR)',
      'Selling Price (PKR)',
      'Profit Margin (PKR)',
      'Stock Status',
      'Entry Date',
      'Customer Name',
      'Customer Phone'
    ];

    const rows = filteredBikes.map(b => [
      `"${b.chassisNumber}"`,
      `"${b.modelName}"`,
      `"${b.color}"`,
      b.motorPowerWatts || 1200,
      `"${b.batteryCapacity || b.engineMotorDetails}"`,
      b.maxSpeedKmH || 60,
      b.rangeKm || 80,
      b.purchasePrice,
      b.sellingPrice,
      b.sellingPrice - b.purchasePrice,
      b.status,
      b.entryDate,
      `"${b.customer?.fullName || ''}"`,
      `"${b.customer?.phone || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Evee_Stock_Inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate days in stock
  const getDaysInStock = (entryDate: string) => {
    const entry = new Date(entryDate).getTime();
    const now = new Date().getTime();
    const diffDays = Math.max(0, Math.floor((now - entry) / (1000 * 60 * 60 * 24)));
    return diffDays;
  };

  return (
    <div className="space-y-6 sm:space-y-8 w-full max-w-7xl 2xl:max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
      
      {/* Top Main Stock Header */}
      <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  Overall Stock & Inventory Master
                </h1>
                <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {inStockCount} In Stock
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Complete inventory visibility: all bike types, model quantities, battery variants, physical chassis numbers, and capital valuation.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="print-audit-report-btn"
            onClick={() => setIsAuditPrintOpen(true)}
            className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold px-3 py-2 rounded-lg transition"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Print Stock Audit</span>
            <span className="sm:hidden">Audit</span>
          </button>

          <button
            id="export-stock-csv-btn"
            onClick={handleExportStockCSV}
            className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold px-3 py-2 rounded-lg transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Export Stock CSV</span>
            <span className="sm:hidden">CSV</span>
          </button>

          <button
            id="add-stock-direct-btn"
            onClick={onNewBike}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 sm:px-4 py-2 rounded-lg shadow-sm transition active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Stock Item</span>
          </button>
        </div>
      </div>

      {/* Low Stock Warning Alert if any model has <= 2 units */}
      {lowStockModels.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Low Inventory Level Notice ({lowStockModels.length} Model{lowStockModels.length > 1 ? 's' : ''})
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                {lowStockModels.map(m => `${m.modelName} (${m.inStockCount} left)`).join(' • ')} need replenishment from the factory.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedModel(lowStockModels[0].modelName);
              setSelectedStatus('IN_STOCK');
            }}
            className="text-xs font-semibold bg-white border border-amber-300 text-amber-800 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition whitespace-nowrap self-start sm:self-center"
          >
            Filter Low Stock Models
          </button>
        </div>
      )}

      {/* OVERALL STOCK VALUATION & KPI SUITE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Available In-Stock */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm border-l-4 border-l-emerald-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Available In-Stock</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">{inStockCount}</div>
              <span className="text-xs font-semibold text-emerald-700">
                ({bikes.length > 0 ? Math.round((inStockCount / bikes.length) * 100) : 0}% of fleet)
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">
              Physical inventory ready for delivery
            </div>
          </div>
        </div>

        {/* Capital Valuation (In-Stock Value) */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm border-l-4 border-l-blue-600 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">In-Stock Valuation (Cost)</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono truncate">
              {formatCurrency(totalInStockPurchaseCost)}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">
              Wholesale asset cost invested
            </div>
          </div>
        </div>

        {/* Total Potential Retail Revenue */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm border-l-4 border-l-indigo-600 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider">Retail Value (Potential)</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-indigo-900 tracking-tight font-mono truncate">
              {formatCurrency(totalInStockRetailValue)}
            </div>
            <div className="text-xs text-emerald-600 mt-1 font-semibold">
              Potential Margin: +{formatCurrency(expectedProfit)}
            </div>
          </div>
        </div>

        {/* Sold Fleet Units */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm border-l-4 border-l-slate-400 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Total Sold Units</span>
            <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{totalSoldCount}</div>
            <div className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-1.5 flex-wrap">
              <span className="text-blue-600 font-semibold">{soldFullCount} Cash</span>
              <span>•</span>
              <span className="text-amber-600 font-semibold">{soldInstallmentCount} Installments</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: TYPES & QUANTITY BREAKDOWN (MODEL & VARIANT MATRIX) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm space-y-4 sm:space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              Stock Breakdown by Bike Types & Model Variants
            </h2>
            <p className="text-xs text-slate-500">
              Stock availability, color breakdown, battery technology, and retail valuation per Evee model.
            </p>
          </div>
          <div className="text-xs font-semibold text-slate-600">
            {modelDetailedMatrix.length} Unique Model Types
          </div>
        </div>

        {/* Model Cards Grid */}
        {modelDetailedMatrix.length === 0 ? (
          <div className="py-10 px-4 text-center bg-slate-50 border border-dashed border-slate-300 rounded-xl">
            <div className="max-w-md mx-auto space-y-2">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
                <Boxes className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No Vehicles in Showroom Stock</h3>
              <p className="text-xs text-slate-500">
                All dummy data has been removed. You can now register real vehicles with their VIN / Chassis numbers to start tracking inventory.
              </p>
              <button
                onClick={onNewBike}
                className="mt-3 inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Evee Bike</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modelDetailedMatrix.map((item) => {
              const availPct = item.total > 0 ? Math.round((item.inStock / item.total) * 100) : 0;
              const isSelected = selectedModel === item.modelName;

              return (
                <div 
                  key={item.modelName}
                  className={`border rounded-xl p-4 transition-all duration-200 flex flex-col justify-between ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50/20 ring-2 ring-blue-500/20 shadow-sm' 
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div>
                    {/* Card Title & Health */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">{item.modelName}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] text-slate-500">Fleet Acquired:</span>
                          <span className="text-xs font-semibold text-slate-800">{item.total} units</span>
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                        item.inStock === 0
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : item.inStock <= 2
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {item.inStock === 0 ? 'Out of Stock' : item.inStock <= 2 ? 'Low Stock' : 'In Stock'}
                      </span>
                    </div>

                    {/* Numbers Grid */}
                    <div className="grid grid-cols-2 gap-2 mt-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Available in Stock</span>
                        <span className="text-lg font-bold text-emerald-600">{item.inStock} units</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Sold to Customers</span>
                        <span className="text-lg font-bold text-blue-600">{item.sold} units</span>
                      </div>
                    </div>

                    {/* Stock Bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                        <span>Available: {availPct}%</span>
                        <span>Sold: {100 - availPct}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
                        <div className="bg-emerald-500 h-full" style={{ width: `${availPct}%` }}></div>
                        <div className="bg-blue-600 h-full" style={{ width: `${100 - availPct}%` }}></div>
                      </div>
                    </div>

                    {/* Color Breakdown */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100">
                      <span className="text-[11px] font-semibold text-slate-700 block mb-1.5">
                        In-Stock Color Variants:
                      </span>
                      {Object.keys(item.colorsInStock).length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(item.colorsInStock).map(([col, count]) => (
                            <span 
                              key={col}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-medium"
                            >
                              <span 
                                className="w-2 h-2 rounded-full border border-slate-300"
                                style={{
                                  backgroundColor: 
                                    col.toLowerCase().includes('white') ? '#ffffff' :
                                    col.toLowerCase().includes('black') ? '#0f172a' :
                                    col.toLowerCase().includes('red') ? '#ef4444' :
                                    col.toLowerCase().includes('blue') ? '#3b82f6' :
                                    col.toLowerCase().includes('green') ? '#10b981' :
                                    col.toLowerCase().includes('yellow') ? '#eab308' :
                                    col.toLowerCase().includes('grey') || col.toLowerCase().includes('silver') ? '#94a3b8' :
                                    '#06b6d4'
                                }}
                              ></span>
                              <span>{col}</span>
                              <span className="font-bold text-slate-900 bg-white px-1 rounded ml-0.5 border border-slate-200">
                                {count}
                              </span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">No units in stock currently</span>
                      )}
                    </div>

                    {/* Specs & Valuation */}
                    <div className="mt-3 text-[11px] text-slate-500 space-y-1">
                      {item.batteryTypes.size > 0 && (
                        <div className="flex items-center gap-1 text-[10px]">
                          <Zap className="w-3 h-3 text-amber-500 shrink-0" />
                          <span>Battery: {Array.from(item.batteryTypes).join(', ')}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-[11px] font-mono pt-1">
                        <span className="text-slate-500">Stock Capital:</span>
                        <span className="font-bold text-slate-800">{formatCurrency(item.stockValue)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Filter Trigger Button */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100">
                    <button
                      onClick={() => {
                        if (selectedModel === item.modelName) {
                          setSelectedModel('ALL');
                        } else {
                          setSelectedModel(item.modelName);
                        }
                      }}
                      className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold transition ${
                        isSelected 
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300'
                      }`}
                    >
                      {isSelected ? 'Showing Filtered Stock ✓' : `View ${item.modelName} Stock Details`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION: GRANULAR STOCK MASTER TABLE (EVERY DETAIL OF STOCK) */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Chassis-by-Chassis Stock Registry & Specification Ledger
            </h2>
            <p className="text-xs text-slate-500">
              Detailed registry of every single vehicle: VIN, motor watts, battery type, stock age, costs, margins, and customer allocation.
            </p>
          </div>

          <div className="text-xs font-mono font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
            Displaying {filteredBikes.length} of {bikes.length} Vehicles
          </div>
        </div>

        {/* Multi-Facet Filter Bar */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            
            {/* Status Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Stock Status:
              </label>
              <select
                id="stock-status-filter-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-white border border-slate-300 text-xs text-slate-800 rounded-lg px-2.5 py-1.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="IN_STOCK">In-Stock Only ({inStockCount})</option>
                <option value="ALL">All Fleet Units ({bikes.length})</option>
                <option value="SOLD">All Sold Units ({totalSoldCount})</option>
                <option value="SOLD_FULL">Sold (Cash Full) ({soldFullCount})</option>
                <option value="SOLD_INSTALLMENT">Sold (Installments) ({soldInstallmentCount})</option>
              </select>
            </div>

            {/* Model Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Model Type:
              </label>
              <select
                id="stock-model-filter-select"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-white border border-slate-300 text-xs text-slate-800 rounded-lg px-2.5 py-1.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">All Models ({modelSummaries.length})</option>
                {modelSummaries.map(m => (
                  <option key={m.modelName} value={m.modelName}>
                    {m.modelName} ({m.inStockCount} in stock)
                  </option>
                ))}
              </select>
            </div>

            {/* Color Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Color Variant:
              </label>
              <select
                id="stock-color-filter-select"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-full bg-white border border-slate-300 text-xs text-slate-800 rounded-lg px-2.5 py-1.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">All Colors ({uniqueColors.length})</option>
                {uniqueColors.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Battery Spec Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Battery Chemistry:
              </label>
              <select
                id="stock-battery-filter-select"
                value={selectedBatteryType}
                onChange={(e) => setSelectedBatteryType(e.target.value)}
                className="w-full bg-white border border-slate-300 text-xs text-slate-800 rounded-lg px-2.5 py-1.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">All Battery Types</option>
                <option value="Graphene">Graphene Battery</option>
                <option value="Lithium">Lithium-Ion Battery</option>
                <option value="72V">72V Series</option>
                <option value="60V">60V Series</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Sort Order:
              </label>
              <select
                id="stock-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-white border border-slate-300 text-xs text-slate-800 rounded-lg px-2.5 py-1.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="newest">Newest Arrival (Recent)</option>
                <option value="oldest">Oldest in Stock (Aging)</option>
                <option value="price-desc">Price: Highest to Lowest</option>
                <option value="price-asc">Price: Lowest to Highest</option>
                <option value="model">Model Name (A-Z)</option>
                <option value="chassis">Chassis / VIN (A-Z)</option>
              </select>
            </div>

          </div>

          {/* Quick Active Filter Pills & Reset */}
          {(selectedModel !== 'ALL' || selectedStatus !== 'IN_STOCK' || selectedColor !== 'ALL' || selectedBatteryType !== 'ALL' || searchQuery) && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-slate-500 text-[11px]">Active Filters:</span>
                {selectedStatus !== 'IN_STOCK' && (
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold border border-slate-200">
                    Status: {selectedStatus}
                  </span>
                )}
                {selectedModel !== 'ALL' && (
                  <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-semibold border border-blue-200">
                    Model: {selectedModel}
                  </span>
                )}
                {selectedColor !== 'ALL' && (
                  <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-[10px] font-semibold border border-purple-200">
                    Color: {selectedColor}
                  </span>
                )}
                {selectedBatteryType !== 'ALL' && (
                  <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[10px] font-semibold border border-amber-200">
                    Battery: {selectedBatteryType}
                  </span>
                )}
                {searchQuery && (
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold border border-slate-200">
                    Search: "{searchQuery}"
                  </span>
                )}
              </div>

              <button
                onClick={() => {
                  setSelectedModel('ALL');
                  setSelectedStatus('IN_STOCK');
                  setSelectedColor('ALL');
                  setSelectedBatteryType('ALL');
                  setSearchQuery('');
                }}
                className="text-rose-600 hover:text-rose-700 font-semibold underline text-xs ml-auto"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>

        {/* Master Stock Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs text-slate-700 min-w-[900px]">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[140px]">Chassis # (VIN)</th>
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[130px]">Model & Type</th>
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[110px]">Color</th>
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[150px]">Motor & Battery</th>
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[120px]">Range & Speed</th>
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[150px]">Cost vs Retail</th>
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[130px]">Stock Age / Entry</th>
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[130px]">Status</th>
                  <th className="py-3.5 px-4 text-right whitespace-nowrap min-w-[120px]">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBikes.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Boxes className="w-8 h-8 text-slate-300" />
                        <p className="text-sm font-semibold text-slate-700">No stock vehicles found</p>
                        <p className="text-xs text-slate-400">
                          Try changing the status filter or clearing search keywords.
                        </p>
                        <button
                          onClick={() => {
                            setSelectedModel('ALL');
                            setSelectedStatus('ALL');
                            setSelectedColor('ALL');
                            setSelectedBatteryType('ALL');
                            setSearchQuery('');
                          }}
                          className="mt-2 text-xs bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-100"
                        >
                          Show All Fleet Units
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredBikes.map((bike) => {
                    const daysInStock = getDaysInStock(bike.entryDate);
                    const profitMargin = (bike.sellingPrice || 0) - (bike.purchasePrice || 0);
                    const profitPct = bike.purchasePrice > 0 
                      ? Math.round((profitMargin / bike.purchasePrice) * 100) 
                      : 0;

                    return (
                      <tr 
                        key={bike.id}
                        id={`stock-row-${bike.id}`}
                        className="hover:bg-slate-50/80 transition duration-150 group"
                      >
                        {/* VIN / Chassis Number with Copy */}
                        <td className="py-3.5 px-4 font-mono">
                          <div className="flex items-center gap-1.5">
                            <span 
                              className="font-bold text-blue-600 hover:underline cursor-pointer"
                              onClick={() => onSelectBike(bike)}
                              title="Click to inspect full details"
                            >
                              {bike.chassisNumber}
                            </span>
                            <button
                              onClick={() => handleCopyVin(bike.chassisNumber)}
                              title="Copy VIN"
                              className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition"
                            >
                              {copiedVin === bike.chassisNumber ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Model & Type */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{bike.modelName}</div>
                          {bike.customBikeName && bike.customBikeName !== bike.modelName && (
                            <div className="text-[11px] text-slate-500">{bike.customBikeName}</div>
                          )}
                        </td>

                        {/* Color Variant */}
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium">
                            <span 
                              className="w-2 h-2 rounded-full inline-block border border-slate-300"
                              style={{
                                backgroundColor: 
                                  bike.color.toLowerCase().includes('white') ? '#ffffff' :
                                  bike.color.toLowerCase().includes('black') ? '#0f172a' :
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

                        {/* Motor & Battery Specifications */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800 flex items-center gap-1">
                            <Zap className="w-3 h-3 text-amber-500 shrink-0" />
                            <span>{bike.motorPowerWatts || 1200}W Motor</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {bike.batteryCapacity || bike.engineMotorDetails || 'Graphene Battery'}
                          </div>
                        </td>

                        {/* Performance Specs */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2 text-[11px]">
                            <span className="font-semibold text-slate-800">{bike.rangeKm || 80} km</span>
                            <span className="text-slate-300">|</span>
                            <span className="text-slate-600">{bike.maxSpeedKmH || 60} km/h</span>
                          </div>
                        </td>

                        {/* Cost vs Selling Price */}
                        <td className="py-3.5 px-4 font-mono">
                          <div className="font-bold text-slate-900 text-xs">
                            {formatCurrency(bike.sellingPrice)}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Cost: {formatCurrency(bike.purchasePrice)}
                          </div>
                          <div className="text-[10px] text-emerald-600 font-semibold font-sans">
                            Margin: +{formatCurrency(profitMargin)} ({profitPct}%)
                          </div>
                        </td>

                        {/* Stock Age & Entry Date */}
                        <td className="py-3.5 px-4 text-[11px]">
                          <div className="text-slate-800 font-medium">{formatDate(bike.entryDate)}</div>
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{daysInStock} day{daysInStock === 1 ? '' : 's'} in stock</span>
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-4">
                          {bike.status === 'IN_STOCK' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              In Stock
                            </span>
                          )}
                          {bike.status === 'SOLD_FULL' && (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                                <CheckCircle className="w-3 h-3" />
                                Sold (Cash)
                              </span>
                              {bike.customer && (
                                <div className="text-[10px] text-slate-500 truncate max-w-[120px]">
                                  {bike.customer.fullName}
                                </div>
                              )}
                            </div>
                          )}
                          {bike.status === 'SOLD_INSTALLMENT' && (
                            <div className="space-y-0.5">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                                bike.installmentPlan?.status === 'PAID'
                                  ? 'bg-teal-50 text-teal-700 border-teal-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>
                                <CreditCard className="w-3 h-3" />
                                {bike.installmentPlan?.status === 'PAID' ? 'Installment Settled' : 'Installment Active'}
                              </span>
                              {bike.customer && (
                                <div className="text-[10px] text-slate-500 truncate max-w-[120px]">
                                  {bike.customer.fullName}
                                </div>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Quick Action Buttons */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Inspect Details */}
                            <button
                              id={`stock-view-btn-${bike.id}`}
                              onClick={() => onSelectBike(bike)}
                              title="View Complete Technical & Sales Dossier"
                              className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Showroom Placard Button */}
                            <button
                              id={`stock-placard-btn-${bike.id}`}
                              onClick={() => setSelectedPlacardBike(bike)}
                              title="Generate Showroom Display Spec Card"
                              className="p-1.5 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition"
                            >
                              <Tag className="w-3.5 h-3.5" />
                            </button>

                            {/* Sell Action if In-Stock */}
                            {bike.status === 'IN_STOCK' && (
                              <button
                                id={`stock-sell-btn-${bike.id}`}
                                onClick={() => onSellBike(bike)}
                                className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs shadow-sm transition"
                              >
                                <DollarSign className="w-3 h-3" />
                                <span>Sell</span>
                              </button>
                            )}

                            {/* Receive Payment if Installment */}
                            {bike.status === 'SOLD_INSTALLMENT' && bike.installmentPlan?.status === 'ACTIVE' && (
                              <button
                                id={`stock-pay-btn-${bike.id}`}
                                onClick={() => onReceivePayment(bike)}
                                className="flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-xs shadow-sm transition"
                              >
                                <CreditCard className="w-3 h-3" />
                                <span>Pay</span>
                              </button>
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

          <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="font-medium">
              Showing {filteredBikes.length} of {bikes.length} total units across all showroom stock
            </span>
            <div className="flex items-center gap-3">
              <span className="font-mono text-slate-700 font-semibold">
                Active Filter Valuation: {formatCurrency(filteredBikes.reduce((s, b) => s + (b.purchasePrice || 0), 0))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SHOWROOM DISPLAY PLACARD MODAL */}
      {selectedPlacardBike && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800">Showroom Vehicle Spec Card</h3>
              </div>
              <button
                onClick={() => setSelectedPlacardBike(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-slate-800">
              <div className="text-center pb-4 border-b border-slate-200">
                <div className="text-xs font-bold uppercase tracking-wider text-blue-600">EVEE ELECTRIC VEHICLES</div>
                <h2 className="text-2xl font-black text-slate-900 mt-1">{selectedPlacardBike.modelName}</h2>
                <p className="text-xs text-slate-500">Color: {selectedPlacardBike.color} • Frame VIN: {selectedPlacardBike.chassisNumber}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Motor Spec</span>
                  <span className="font-semibold text-slate-900">{selectedPlacardBike.motorPowerWatts || 1200}W Bosch Tech</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Battery Pack</span>
                  <span className="font-semibold text-slate-900">{selectedPlacardBike.batteryCapacity || '72V 30Ah Graphene'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Estimated Range</span>
                  <span className="font-semibold text-slate-900">{selectedPlacardBike.rangeKm || 80} km / charge</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Top Speed</span>
                  <span className="font-semibold text-slate-900">{selectedPlacardBike.maxSpeedKmH || 60} km/h</span>
                </div>
              </div>

              <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <span className="text-xs text-blue-700 font-semibold block">Official Retail Price</span>
                <span className="text-2xl font-black text-blue-900 font-mono">
                  {formatCurrency(selectedPlacardBike.sellingPrice)}
                </span>
                <span className="block text-[10px] text-blue-600 mt-0.5">Easy Monthly Installment Plans Available</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Placard</span>
              </button>
              <button
                onClick={() => setSelectedPlacardBike(null)}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE AUDIT MANIFEST MODAL */}
      {isAuditPrintOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150 print:p-0 print:bg-white print:static">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-4xl overflow-hidden shadow-2xl max-h-[95vh] flex flex-col print:border-none print:shadow-none print:max-h-full print:bg-white print:text-black">
            
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50 print:hidden">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800">Physical Stock Inventory Audit Manifest</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Audit Sheet / Save PDF</span>
                </button>
                <button
                  onClick={() => setIsAuditPrintOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-6 overflow-y-auto bg-white text-slate-900 print:p-6 print:overflow-visible">
              
              {/* Audit Header */}
              <div className="flex items-start justify-between border-b-2 border-blue-600 pb-4">
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-900">EVEE ELECTRIC BIKES</h1>
                  <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mt-0.5">
                    Official Physical Stock Audit & Inventory Manifest
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Showroom & Warehouse Inventory Control Sheet</p>
                </div>
                <div className="text-right text-xs">
                  <div className="font-mono font-bold text-blue-700">AUDIT REF: {new Date().toISOString().slice(0,10)}</div>
                  <div className="text-slate-500 mt-0.5">Generated: {new Date().toLocaleString()}</div>
                </div>
              </div>

              {/* Summary Stats in Print */}
              <div className="grid grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Total Fleet</span>
                  <span className="text-lg font-bold text-slate-900">{bikes.length} units</span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-700 uppercase font-bold block">Physical In-Stock</span>
                  <span className="text-lg font-bold text-emerald-700">{inStockCount} units</span>
                </div>
                <div>
                  <span className="text-[10px] text-blue-700 uppercase font-bold block">Units Sold</span>
                  <span className="text-lg font-bold text-blue-700">{totalSoldCount} units</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">In-Stock Capital</span>
                  <span className="text-lg font-bold text-slate-900 font-mono">{formatCurrency(totalInStockPurchaseCost)}</span>
                </div>
              </div>

              {/* Model Breakdown Table */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">Model Type Counts</h4>
                <table className="w-full text-xs text-left border border-slate-200">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-2">Model Type</th>
                      <th className="p-2 text-center">Acquired</th>
                      <th className="p-2 text-center">In Stock</th>
                      <th className="p-2 text-center">Sold</th>
                      <th className="p-2">Available Colors</th>
                      <th className="p-2 text-right">Stock Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {modelDetailedMatrix.map(m => (
                      <tr key={m.modelName}>
                        <td className="p-2 font-bold">{m.modelName}</td>
                        <td className="p-2 text-center">{m.total}</td>
                        <td className="p-2 text-center font-bold text-emerald-700">{m.inStock}</td>
                        <td className="p-2 text-center">{m.sold}</td>
                        <td className="p-2 text-[11px]">{Object.entries(m.colorsInStock).map(([c, qty]) => `${c} (${qty})`).join(', ') || 'None'}</td>
                        <td className="p-2 text-right font-mono">{formatCurrency(m.stockValue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Chassis Inventory Manifest */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">Complete Chassis (VIN) Audit List</h4>
                <table className="w-full text-[11px] text-left border border-slate-200">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-1.5">#</th>
                      <th className="p-1.5">Chassis Number (VIN)</th>
                      <th className="p-1.5">Model</th>
                      <th className="p-1.5">Color</th>
                      <th className="p-1.5">Battery & Motor</th>
                      <th className="p-1.5 font-mono">Cost (PKR)</th>
                      <th className="p-1.5">Status</th>
                      <th className="p-1.5 text-center">Physical Verified [✓]</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bikes.map((b, idx) => (
                      <tr key={b.id}>
                        <td className="p-1.5 text-slate-400">{idx + 1}</td>
                        <td className="p-1.5 font-mono font-bold text-blue-700">{b.chassisNumber}</td>
                        <td className="p-1.5 font-semibold">{b.modelName}</td>
                        <td className="p-1.5">{b.color}</td>
                        <td className="p-1.5 text-[10px]">{b.batteryCapacity || 'Graphene'} • {b.motorPowerWatts || 1200}W</td>
                        <td className="p-1.5 font-mono">{formatCurrency(b.purchasePrice)}</td>
                        <td className="p-1.5 font-semibold">
                          {b.status === 'IN_STOCK' ? 'IN STOCK' : b.status === 'SOLD_FULL' ? 'SOLD (CASH)' : 'INSTALLMENT'}
                        </td>
                        <td className="p-1.5 text-center border-l border-slate-200">
                          [ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ]
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Audit Verification Signatures */}
              <div className="pt-8 grid grid-cols-2 gap-12 text-center text-xs text-slate-500">
                <div className="border-t border-slate-300 pt-2">
                  <p className="font-semibold text-slate-800">Inventory Stock Controller / Auditor</p>
                  <p className="text-[10px]">Signature & Date</p>
                </div>
                <div className="border-t border-slate-300 pt-2">
                  <p className="font-semibold text-slate-800">Showroom General Manager</p>
                  <p className="text-[10px]">Verification & Stamp</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
