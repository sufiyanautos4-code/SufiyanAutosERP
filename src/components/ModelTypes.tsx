import React, { useState, useMemo } from 'react';
import { 
  Layers, 
  Zap, 
  Plus, 
  Tag,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Box,
  Battery
} from 'lucide-react';
import { EveeBike } from '../types';
import { formatCurrency } from '../utils/formatters';

interface ModelTypesProps {
  bikes: EveeBike[];
  onNewBike: () => void;
  onFilterByModel: (modelName: string) => void;
}

export const ModelTypes: React.FC<ModelTypesProps> = ({
  bikes,
  onNewBike,
  onFilterByModel,
}) => {
  const [selectedModel, setSelectedModel] = useState<string>('');

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

  const handleModelClick = (modelName: string) => {
    if (selectedModel === modelName) {
      setSelectedModel('');
      onFilterByModel('ALL');
    } else {
      setSelectedModel(modelName);
      onFilterByModel(modelName);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 w-full max-w-[1720px] 2xl:max-w-[1920px] 3xl:max-w-[2400px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-4 sm:py-6">
      
      {/* Page Header */}
      <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  Stock Breakdown by Bike Types & Model Variants
                </h1>
                <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-0.5 rounded-full border border-blue-200 font-semibold">
                  {modelDetailedMatrix.length} Model Types
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Stock availability, color breakdown, battery technology, and retail valuation per Evee model variant.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onNewBike}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 sm:px-4 py-2 rounded-lg shadow-sm transition active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Model</span>
          </button>
        </div>
      </div>

      {/* Low Stock Alert */}
      {modelDetailedMatrix.filter(m => m.inStock > 0 && m.inStock <= 2).length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3 text-amber-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Low Stock Warning: {modelDetailedMatrix.filter(m => m.inStock > 0 && m.inStock <= 2).length} Model(s)
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                {modelDetailedMatrix
                  .filter(m => m.inStock > 0 && m.inStock <= 2)
                  .map(m => `${m.modelName} (${m.inStock} left)`)
                  .join(' • ')} need replenishment.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Model Cards Grid */}
      <div className="space-y-4">
        {modelDetailedMatrix.length === 0 ? (
          <div className="py-16 px-4 text-center bg-white border border-dashed border-slate-300 rounded-xl">
            <div className="max-w-md mx-auto space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
                <Box className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No Model Types Registered</h3>
              <p className="text-xs text-slate-500">
                Start by adding your first Evee electric bike to create model type categories.
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-6 gap-4">
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
                          <Battery className="w-3 h-3 text-amber-500 shrink-0" />
                          <span>Battery: {Array.from(item.batteryTypes).join(', ')}</span>
                        </div>
                      )}
                      {item.motorWatts.size > 0 && (
                        <div className="flex items-center gap-1 text-[10px]">
                          <Zap className="w-3 h-3 text-blue-500 shrink-0" />
                          <span>Motor: {Array.from(item.motorWatts).join(', ')}W</span>
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
                      onClick={() => handleModelClick(item.modelName)}
                      className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold transition ${
                        isSelected 
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300'
                      }`}
                    >
                      {isSelected ? 'Filtered ✓' : `View ${item.modelName} Details`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
