import React, { useMemo } from 'react';
import { 
  BookOpen,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  CheckCircle,
  Clock,
  AlertCircle,
  Sparkles,
  BarChart3,
  PieChart,
  Calculator
} from 'lucide-react';
import { EveeBike } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

interface StockLedgerProps {
  bikes: EveeBike[];
}

export const StockLedger: React.FC<StockLedgerProps> = ({ bikes }) => {
  
  // Overall Calculations
  const calculations = useMemo(() => {
    const totalPurchased = bikes.length;
    const totalSold = bikes.filter(b => b.status === 'SOLD_FULL' || b.status === 'SOLD_INSTALLMENT').length;
    const leftInStock = bikes.filter(b => b.status === 'IN_STOCK').length;

    // Purchase Cost (Total Investment)
    const totalPurchaseCost = bikes.reduce((sum, b) => sum + (b.purchasePrice || 0), 0);
    
    // Cost of remaining stock
    const stockPurchaseCost = bikes
      .filter(b => b.status === 'IN_STOCK')
      .reduce((sum, b) => sum + (b.purchasePrice || 0), 0);

    // Sales Revenue (Only from sold bikes)
    const totalSalesRevenue = bikes
      .filter(b => b.status === 'SOLD_FULL' || b.status === 'SOLD_INSTALLMENT')
      .reduce((sum, b) => {
        if (b.status === 'SOLD_FULL') {
          return sum + (b.actualSoldPrice || b.sellingPrice);
        } else if (b.status === 'SOLD_INSTALLMENT') {
          // For installment, count total paid so far
          return sum + (b.installmentPlan?.totalPaid || 0);
        }
        return sum;
      }, 0);

    // Potential revenue if all stock sells at retail price
    const potentialStockRevenue = bikes
      .filter(b => b.status === 'IN_STOCK')
      .reduce((sum, b) => sum + (b.sellingPrice || 0), 0);

    // Gross Profit (from sold bikes only)
    const soldBikesCost = bikes
      .filter(b => b.status === 'SOLD_FULL' || b.status === 'SOLD_INSTALLMENT')
      .reduce((sum, b) => sum + (b.purchasePrice || 0), 0);
    
    const grossProfit = totalSalesRevenue - soldBikesCost;

    // Potential total profit if all stock sells
    const potentialTotalProfit = potentialStockRevenue - stockPurchaseCost + grossProfit;

    // Outstanding Installment Balances
    const outstandingInstallments = bikes
      .filter(b => b.status === 'SOLD_INSTALLMENT')
      .reduce((sum, b) => sum + (b.installmentPlan?.remainingBalance || 0), 0);

    return {
      totalPurchased,
      totalSold,
      leftInStock,
      totalPurchaseCost,
      stockPurchaseCost,
      totalSalesRevenue,
      potentialStockRevenue,
      grossProfit,
      potentialTotalProfit,
      soldBikesCost,
      outstandingInstallments
    };
  }, [bikes]);

  const {
    totalPurchased,
    totalSold,
    leftInStock,
    totalPurchaseCost,
    stockPurchaseCost,
    totalSalesRevenue,
    potentialStockRevenue,
    grossProfit,
    potentialTotalProfit,
    soldBikesCost,
    outstandingInstallments
  } = calculations;

  // Sales breakdown
  const soldFullPayment = bikes.filter(b => b.status === 'SOLD_FULL').length;
  const soldInstallment = bikes.filter(b => b.status === 'SOLD_INSTALLMENT').length;

  // Percentage calculations
  const soldPercentage = totalPurchased > 0 ? Math.round((totalSold / totalPurchased) * 100) : 0;
  const stockPercentage = totalPurchased > 0 ? Math.round((leftInStock / totalPurchased) * 100) : 0;
  const profitMarginPct = soldBikesCost > 0 ? Math.round((grossProfit / soldBikesCost) * 100) : 0;

  return (
    <div className="space-y-6 sm:space-y-8 w-full max-w-[1720px] 2xl:max-w-[1920px] 3xl:max-w-[2400px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-4 sm:py-6">
      
      {/* Page Header */}
      <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-xl shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Stock Ledger & Financial Overview
              </h1>
              <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold flex items-center gap-1">
                <Calculator className="w-3 h-3" />
                Real-Time Calculations
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Complete overview of stock purchased, sales revenue, remaining inventory, and profit/loss calculations.
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics Row 1: Purchase, Sales, Stock */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Purchased */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Total Purchased</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-blue-600 tracking-tight mb-1">{totalPurchased}</div>
          <div className="text-xs text-slate-500 font-medium">Units acquired from supplier</div>
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="text-xs text-slate-600">Investment Cost:</div>
            <div className="text-lg font-bold text-slate-900 font-mono">{formatCurrency(totalPurchaseCost)}</div>
          </div>
        </div>

        {/* Total Sold */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Total Sold</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-black text-emerald-600 tracking-tight">{totalSold}</div>
            <span className="text-sm font-semibold text-emerald-700">({soldPercentage}%)</span>
          </div>
          <div className="text-xs text-slate-500 font-medium">Units sold to customers</div>
          <div className="mt-2 flex items-center gap-2 text-[11px]">
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200 font-semibold">
              {soldFullPayment} Cash
            </span>
            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded border border-amber-200 font-semibold">
              {soldInstallment} Installment
            </span>
          </div>
        </div>

        {/* Left in Stock */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm border-l-4 border-l-amber-600">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Left in Stock</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-black text-amber-600 tracking-tight">{leftInStock}</div>
            <span className="text-sm font-semibold text-amber-700">({stockPercentage}%)</span>
          </div>
          <div className="text-xs text-slate-500 font-medium">Available inventory</div>
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="text-xs text-slate-600">Stock Value (Cost):</div>
            <div className="text-lg font-bold text-slate-900 font-mono">{formatCurrency(stockPurchaseCost)}</div>
          </div>
        </div>
      </div>

      {/* Detailed Financial Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Revenue & Profit Card */}
        <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Revenue & Profit Analysis</h2>
          </div>

          <div className="space-y-4">
            {/* Sales Revenue */}
            <div className="bg-white rounded-lg p-4 border border-emerald-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-600">Total Sales Revenue Collected</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-700 font-mono">{formatCurrency(totalSalesRevenue)}</div>
              <div className="text-[11px] text-slate-500 mt-1">
                Cash collected from {totalSold} sold units
              </div>
            </div>

            {/* Gross Profit */}
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-600">Gross Profit Realized</span>
                <BarChart3 className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-blue-700 font-mono">{formatCurrency(grossProfit)}</div>
              <div className="text-[11px] text-slate-500 mt-1">
                Revenue ({formatCurrency(totalSalesRevenue)}) - Cost ({formatCurrency(soldBikesCost)})
              </div>
              <div className="mt-2 px-2 py-1 bg-blue-50 rounded text-[11px] font-semibold text-blue-800 inline-block border border-blue-200">
                Profit Margin: {profitMarginPct}%
              </div>
            </div>

            {/* Outstanding Installments */}
            {outstandingInstallments > 0 && (
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-amber-800">Pending Installment Balance</span>
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl font-black text-amber-700 font-mono">{formatCurrency(outstandingInstallments)}</div>
                <div className="text-[11px] text-amber-700 mt-1">
                  To be collected from active installment plans
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stock Potential Card */}
        <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
              <PieChart className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Stock Potential & Projections</h2>
          </div>

          <div className="space-y-4">
            {/* Potential Revenue */}
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-600">Potential Stock Revenue</span>
                <Sparkles className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-blue-700 font-mono">{formatCurrency(potentialStockRevenue)}</div>
              <div className="text-[11px] text-slate-500 mt-1">
                If all {leftInStock} stock units sell at retail price
              </div>
            </div>

            {/* Total Potential Profit */}
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-600">Total Potential Profit</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-700 font-mono">{formatCurrency(potentialTotalProfit)}</div>
              <div className="text-[11px] text-slate-500 mt-1">
                Realized profit + potential stock profit
              </div>
            </div>

            {/* Investment Summary */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="text-xs font-semibold text-slate-700 mb-3">Investment Summary</div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Capital Invested:</span>
                  <span className="font-bold font-mono text-slate-900">{formatCurrency(totalPurchaseCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Capital in Stock:</span>
                  <span className="font-bold font-mono text-amber-700">{formatCurrency(stockPurchaseCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Capital Recovered (Sales):</span>
                  <span className="font-bold font-mono text-emerald-700">{formatCurrency(totalSalesRevenue)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-600" />
          Inventory Distribution Breakdown
        </h3>
        
        <div className="space-y-3">
          {/* Units Distribution */}
          <div>
            <div className="flex justify-between text-xs text-slate-600 mb-2">
              <span className="font-semibold">Units: Sold vs In Stock</span>
              <span>{totalPurchased} Total Units</span>
            </div>
            <div className="w-full h-8 bg-slate-100 rounded-lg overflow-hidden flex border border-slate-200">
              <div 
                className="bg-emerald-500 flex items-center justify-center text-white text-xs font-bold"
                style={{ width: `${soldPercentage}%` }}
              >
                {soldPercentage > 15 && `${totalSold} Sold`}
              </div>
              <div 
                className="bg-amber-500 flex items-center justify-center text-white text-xs font-bold"
                style={{ width: `${stockPercentage}%` }}
              >
                {stockPercentage > 15 && `${leftInStock} Stock`}
              </div>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 mt-1">
              <span>✓ {totalSold} Sold ({soldPercentage}%)</span>
              <span>📦 {leftInStock} In Stock ({stockPercentage}%)</span>
            </div>
          </div>

          {/* Financial Distribution */}
          <div>
            <div className="flex justify-between text-xs text-slate-600 mb-2 mt-4">
              <span className="font-semibold">Capital: Recovered vs Remaining in Stock</span>
              <span>{formatCurrency(totalPurchaseCost)} Total Investment</span>
            </div>
            <div className="w-full h-8 bg-slate-100 rounded-lg overflow-hidden flex border border-slate-200">
              <div 
                className="bg-blue-600 flex items-center justify-center text-white text-xs font-bold"
                style={{ width: `${totalPurchaseCost > 0 ? (totalSalesRevenue / totalPurchaseCost) * 100 : 0}%` }}
              >
                {((totalSalesRevenue / totalPurchaseCost) * 100) > 15 && 'Revenue'}
              </div>
              <div 
                className="bg-slate-400 flex items-center justify-center text-white text-xs font-bold"
                style={{ width: `${totalPurchaseCost > 0 ? (stockPurchaseCost / totalPurchaseCost) * 100 : 0}%` }}
              >
                {((stockPurchaseCost / totalPurchaseCost) * 100) > 15 && 'In Stock'}
              </div>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 mt-1">
              <span>💰 {formatCurrency(totalSalesRevenue)} Collected ({Math.round((totalSalesRevenue / totalPurchaseCost) * 100)}%)</span>
              <span>📦 {formatCurrency(stockPurchaseCost)} In Stock ({Math.round((stockPurchaseCost / totalPurchaseCost) * 100)}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alert if no bikes */}
      {totalPurchased === 0 && (
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-10 text-center">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700 mb-1">No Inventory Data Available</h3>
          <p className="text-xs text-slate-500">
            Add bikes to your inventory to see financial calculations and ledger data.
          </p>
        </div>
      )}
    </div>
  );
};
