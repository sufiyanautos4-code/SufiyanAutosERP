import React, { useState } from 'react';
import { 
  BadgeDollarSign, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Search, 
  User, 
  ArrowUpRight, 
  FileText, 
  Printer, 
  TrendingUp, 
  Eye, 
  Check, 
  AlertCircle,
  HelpCircle,
  Sparkles,
  Calendar,
  Wallet,
  Store,
  MapPin,
  Settings,
  FileCheck
} from 'lucide-react';
import { EveeBike, InstallmentPayment } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { loadShopsFromStorage } from '../utils/storage';
import { matchesBikeSearch } from '../utils/searchMatcher';
import { ManageShopsModal } from './ManageShopsModal';

interface ProductSalesProps {
  bikes: EveeBike[];
  onSelectBike: (bike: EveeBike) => void;
  onSellBikeModal: () => void;
  onReceivePaymentModal: (bike: EveeBike) => void;
  onPrintInvoice: (bike: EveeBike) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const ProductSales: React.FC<ProductSalesProps> = ({
  bikes,
  onSelectBike,
  onSellBikeModal,
  onReceivePaymentModal,
  onPrintInvoice,
  searchQuery,
  setSearchQuery,
}) => {
  const [salesSection, setSalesSection] = useState<'FULL_PAYMENT' | 'INSTALLMENTS'>('INSTALLMENTS');
  const [installmentStatusFilter, setInstallmentStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PAID'>('ALL');
  const [selectedShopFilter, setSelectedShopFilter] = useState<string>('ALL');
  const [isManageShopsOpen, setIsManageShopsOpen] = useState<boolean>(false);
  const [savedShops, setSavedShops] = useState<string[]>(() => loadShopsFromStorage());

  // Filter sold bikes
  const fullPaymentBikes = bikes.filter(b => b.status === 'SOLD_FULL');
  const installmentBikes = bikes.filter(b => b.status === 'SOLD_INSTALLMENT');
  const allSoldBikes = [...installmentBikes, ...fullPaymentBikes];

  // Extract all unique shops that have sales
  const uniqueSaleShops = Array.from(
    new Set([
      ...savedShops,
      ...allSoldBikes.map(b => b.shopName || b.saleShopName).filter(Boolean) as string[]
    ])
  );

  // Installment overall aggregates
  const totalInstallmentSalesValue = installmentBikes.reduce((sum, b) => sum + (b.installmentPlan?.totalSalePrice || b.sellingPrice), 0);
  const totalDownPayments = installmentBikes.reduce((sum, b) => sum + (b.installmentPlan?.downPayment || 0), 0);
  
  const totalInstallmentPaymentsCollected = installmentBikes.reduce((sum, b) => {
    const paymentsSum = b.installmentPlan?.payments.reduce((pSum, p) => pSum + p.amount, 0) || 0;
    return sum + paymentsSum;
  }, 0);

  const totalCollectedSoFar = totalDownPayments + totalInstallmentPaymentsCollected;
  const totalOutstandingBalance = installmentBikes.reduce((sum, b) => sum + (b.installmentPlan?.remainingBalance || 0), 0);
  
  const activeInstallmentsCount = installmentBikes.filter(b => b.installmentPlan?.status === 'ACTIVE').length;
  const fullyPaidInstallmentsCount = installmentBikes.filter(b => b.installmentPlan?.status === 'PAID').length;

  // Full Payment aggregates
  const totalFullPaymentRevenue = fullPaymentBikes.reduce((sum, b) => sum + (b.actualSoldPrice || b.sellingPrice), 0);
  const totalFullPaymentCost = fullPaymentBikes.reduce((sum, b) => sum + (b.purchasePrice || 0), 0);
  const totalFullPaymentProfit = totalFullPaymentRevenue - totalFullPaymentCost;

  // Filtered lists
  const filteredFullPayments = fullPaymentBikes.filter(b => {
    if (selectedShopFilter !== 'ALL') {
      const bikeShop = b.shopName || b.saleShopName || '';
      if (bikeShop !== selectedShopFilter) return false;
    }
    return matchesBikeSearch(b, searchQuery);
  });

  const filteredInstallments = installmentBikes.filter(b => {
    if (selectedShopFilter !== 'ALL') {
      const bikeShop = b.shopName || b.saleShopName || '';
      if (bikeShop !== selectedShopFilter) return false;
    }
    if (installmentStatusFilter !== 'ALL') {
      if (installmentStatusFilter === 'ACTIVE' && b.installmentPlan?.status !== 'ACTIVE') return false;
      if (installmentStatusFilter === 'PAID' && b.installmentPlan?.status !== 'PAID') return false;
    }
    return matchesBikeSearch(b, searchQuery);
  });

  return (
    <div className="w-full max-w-[1720px] 2xl:max-w-[1920px] 3xl:max-w-[2400px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-4 sm:py-6 space-y-6">

      {/* Top Banner */}
      <div className="bg-white border border-slate-200 p-4 sm:p-6 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
              <BadgeDollarSign className="w-5 h-5" />
            </span>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Evee Product Sales & Installment Ledger
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track vehicle sales across all your dealership shops/branches with full cash and installment financing records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsManageShopsOpen(true)}
            className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-3 py-2 rounded-lg border border-slate-300 transition"
          >
            <Store className="w-4 h-4 text-emerald-600" />
            <span>Manage Shops ({savedShops.length})</span>
          </button>

          <button
            id="new-sale-action-btn"
            onClick={onSellBikeModal}
            className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 sm:px-4 py-2 rounded-lg shadow-sm transition active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>New Vehicle Sale</span>
          </button>
        </div>
      </div>

      {/* Shop Location Filter Bar */}
      <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5 text-emerald-600" />
            Filter by Shop / Branch:
          </span>
          <button
            onClick={() => setSelectedShopFilter('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition border ${
              selectedShopFilter === 'ALL'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            All Shops ({allSoldBikes.length} Sales)
          </button>

          {uniqueSaleShops.map((shop) => {
            const count = allSoldBikes.filter(b => (b.shopName || b.saleShopName) === shop).length;
            const isSelected = selectedShopFilter === shop;
            return (
              <button
                key={shop}
                onClick={() => setSelectedShopFilter(shop)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition border flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                    : 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                <span>{shop}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isSelected ? 'bg-emerald-800 text-white' : 'bg-emerald-200 text-emerald-900'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {selectedShopFilter !== 'ALL' && (
          <button
            onClick={() => setSelectedShopFilter('ALL')}
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline"
          >
            Reset Shop Filter
          </button>
        )}
      </div>

      {/* SECTION TABS: Full Payment Sales vs Vehicles on Installments */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 w-full sm:w-auto">
          <button
            id="tab-sales-installments"
            onClick={() => setSalesSection('INSTALLMENTS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition flex-1 sm:flex-initial justify-center ${
              salesSection === 'INSTALLMENTS'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-4 h-4 text-amber-600" />
            <span>Vehicles on Installments</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
              salesSection === 'INSTALLMENTS' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
            }`}>
              {filteredInstallments.length}
            </span>
          </button>

          <button
            id="tab-sales-full-payment"
            onClick={() => setSalesSection('FULL_PAYMENT')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition flex-1 sm:flex-initial justify-center ${
              salesSection === 'FULL_PAYMENT'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span>Full Payment Sales (Cash)</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
              salesSection === 'FULL_PAYMENT' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'
            }`}>
              {filteredFullPayments.length}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION B: VEHICLES ON INSTALLMENTS (Prompt Scenario Focus) */}
      {/* ========================================================================= */}
      {salesSection === 'INSTALLMENTS' && (
        <div className="space-y-6">

          {/* Prompt Scenario Calculation Explanation Card */}
          <div className="bg-blue-50/70 border border-blue-200 p-5 rounded-xl shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-700 border border-blue-200 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-blue-900">
                  Installment Financing Calculation Matrix
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed">
                  <strong>How it works:</strong> If an Evee bike selling price is <span className="text-slate-900 font-mono font-bold">Rs. 100,000</span> and customer pays a down payment of <span className="text-blue-700 font-mono font-bold">Rs. 30,000</span>, the remaining installment balance is automatically set to <span className="text-amber-700 font-mono font-bold">Rs. 70,000</span>.
                  Whenever the showroom owner receives an installment payment, they update it manually with the <strong>Payer's Name</strong>, amount, and receipt. The system tallies total received vs remaining balance and marks the vehicle status as <span className="text-emerald-700 font-bold">PAID (Settled)</span> when balance reaches Rs. 0.
                </p>
              </div>
            </div>
          </div>

          {/* Installment Metrics Matrix */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 block">Total Installment Value</span>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                {formatCurrency(totalInstallmentSalesValue)}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Across {installmentBikes.length} booked plans
              </span>
            </div>

            <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-sm bg-emerald-50/20">
              <span className="text-[11px] font-semibold text-emerald-800 block">Total Cash Collected</span>
              <div className="text-xl font-bold font-mono text-emerald-600 mt-1">
                {formatCurrency(totalCollectedSoFar)}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Down Payments ({formatCurrency(totalDownPayments)}) + Installments
              </span>
            </div>

            <div className="bg-white border border-amber-200 rounded-xl p-4 shadow-sm bg-amber-50/20">
              <span className="text-[11px] font-semibold text-amber-800 block">Outstanding Receivables</span>
              <div className="text-xl font-bold font-mono text-amber-700 mt-1">
                {formatCurrency(totalOutstandingBalance)}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Remaining to collect from customers
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 block">Installment Plans Status</span>
              <div className="flex items-center gap-3 mt-1.5">
                <div>
                  <span className="text-lg font-bold text-amber-700 font-mono">{activeInstallmentsCount}</span>
                  <span className="text-[10px] text-slate-500 block">Active</span>
                </div>
                <span className="text-slate-300">|</span>
                <div>
                  <span className="text-lg font-bold text-emerald-600 font-mono">{fullyPaidInstallmentsCount}</span>
                  <span className="text-[10px] text-slate-500 block">Fully Settled</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Filter Chips */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-600 font-medium">Filter Plans:</span>
              <button
                onClick={() => setInstallmentStatusFilter('ALL')}
                className={`px-3 py-1 rounded-lg border text-xs transition ${
                  installmentStatusFilter === 'ALL'
                    ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                    : 'text-slate-600 border-slate-200 bg-white hover:bg-slate-100'
                }`}
              >
                All ({installmentBikes.length})
              </button>
              <button
                onClick={() => setInstallmentStatusFilter('ACTIVE')}
                className={`px-3 py-1 rounded-lg border text-xs transition ${
                  installmentStatusFilter === 'ACTIVE'
                    ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                    : 'text-slate-600 border-slate-200 bg-white hover:bg-slate-100'
                }`}
              >
                Active Installments ({activeInstallmentsCount})
              </button>
              <button
                onClick={() => setInstallmentStatusFilter('PAID')}
                className={`px-3 py-1 rounded-lg border text-xs transition ${
                  installmentStatusFilter === 'PAID'
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold'
                    : 'text-slate-600 border-slate-200 bg-white hover:bg-slate-100'
                }`}
              >
                Fully Paid ({fullyPaidInstallmentsCount})
              </button>
            </div>
          </div>

          {/* Installment Vehicles List / Compact Cards */}
          <div className="space-y-2">
            {filteredInstallments.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-500 shadow-sm">
                <CreditCard className="w-10 h-10 mx-auto text-slate-400 mb-2" />
                <h3 className="text-sm font-bold text-slate-800">No Installment Records Found</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Sell an in-stock bike with an installment plan or adjust filters.
                </p>
                <button
                  onClick={onSellBikeModal}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm"
                >
                  Create New Installment Sale
                </button>
              </div>
            ) : (
              filteredInstallments.map((bike) => {
                const plan = bike.installmentPlan;
                if (!plan) return null;

                const completionPct = plan.totalSalePrice > 0 
                  ? Math.min(100, Math.round((plan.totalPaid / plan.totalSalePrice) * 100)) 
                  : 0;

                const isPaid = plan.status === 'PAID' || plan.remainingBalance <= 0;

                return (
                  <div
                    key={bike.id}
                    id={`installment-card-${bike.id}`}
                    className={`bg-white border rounded-lg p-3 transition hover:border-slate-300 shadow-xs ${
                      isPaid ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-200'
                    }`}
                  >
                    {/* Compact Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      {/* Left: Vehicle & Customer Info */}
                      <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
                        <span className="font-mono text-xs font-bold text-blue-600 shrink-0">
                          {bike.chassisNumber}
                        </span>
                        <span className="text-slate-300 shrink-0 hidden sm:inline">•</span>
                        <span className="font-semibold text-xs text-slate-900 truncate">
                          {bike.modelName}
                        </span>
                        <span className="text-[10px] text-slate-500 shrink-0">({bike.color})</span>
                        <span className="text-slate-300 shrink-0 hidden sm:inline">|</span>
                        <div className="flex items-center gap-1 min-w-0">
                          <User className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="font-semibold text-xs text-slate-800 truncate">
                            {bike.customer?.fullName}
                          </span>
                        </div>
                        {(bike.shopName || bike.saleShopName) && (
                          <>
                            <span className="text-slate-300 shrink-0 hidden sm:inline">•</span>
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-medium shrink-0">
                              <Store className="w-2.5 h-2.5" />
                              <span className="hidden xs:inline">{bike.shopName || bike.saleShopName}</span>
                            </span>
                          </>
                        )}
                      </div>

                      {/* Right: Status & Actions */}
                      <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                            <CheckCircle2 className="w-3 h-3" />
                            PAID
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 shrink-0">
                            <Clock className="w-3 h-3" />
                            Active
                          </span>
                        )}

                        <button
                          onClick={() => onSelectBike(bike)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs border border-slate-200"
                          title="View Detail"
                        >
                          <Eye className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() => onPrintInvoice(bike)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs border border-slate-200"
                          title="Print"
                        >
                          <Printer className="w-3 h-3" />
                        </button>

                        {!isPaid && (
                          <button
                            id={`receive-payment-btn-${bike.id}`}
                            onClick={() => onReceivePaymentModal(bike)}
                            className="flex items-center gap-1 px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded text-[10px] shadow-xs transition shrink-0"
                          >
                            <Plus className="w-3 h-3" />
                            Pay
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Compact Financials Row */}
                    <div className="flex items-center gap-1.5 sm:gap-3 text-[10px] sm:text-[11px] mb-2 flex-wrap">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500">Price:</span>
                        <span className="font-mono font-bold text-slate-900">{formatCurrency(plan.totalSalePrice)}</span>
                      </div>
                      <span className="text-slate-300 hidden sm:inline">|</span>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500">Down:</span>
                        <span className="font-mono font-bold text-blue-600">{formatCurrency(plan.downPayment)}</span>
                      </div>
                      <span className="text-slate-300 hidden sm:inline">|</span>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500">Paid:</span>
                        <span className="font-mono font-bold text-emerald-600">{formatCurrency(plan.totalPaid)}</span>
                      </div>
                      <span className="text-slate-300 hidden sm:inline">|</span>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500">Balance:</span>
                        <span className={`font-mono font-bold ${isPaid ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {formatCurrency(plan.remainingBalance)}
                        </span>
                      </div>
                      <span className="text-slate-300 hidden sm:inline">|</span>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500">{completionPct}%</span>
                        <span className="text-slate-400">({plan.payments.length} pmts)</span>
                      </div>
                      <span className="text-slate-300 hidden sm:inline">|</span>
                      <div className="flex items-center gap-1">
                        <FileCheck className={`w-3 h-3 ${bike.documentationReceived ? 'text-emerald-600' : 'text-amber-500'}`} />
                        <span className={`text-[10px] font-semibold ${bike.documentationReceived ? 'text-emerald-700' : 'text-amber-700'}`}>
                          Docs {bike.documentationReceived ? '✓' : 'Pending'}
                        </span>
                      </div>
                    </div>

                    {/* Compact Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${isPaid ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-500 to-amber-500'}`}
                        style={{ width: `${completionPct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION A: FULL PAYMENT SALES (Cash Outright) */}
      {/* ========================================================================= */}
      {salesSection === 'FULL_PAYMENT' && (
        <div className="space-y-6">

          {/* Full Payment Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 block">Total Full Cash Sales</span>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                {fullPaymentBikes.length} Units
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">100% upfront settlement</span>
            </div>

            <div className="bg-white border border-blue-200 rounded-xl p-4 shadow-sm bg-blue-50/20">
              <span className="text-[11px] font-semibold text-blue-800 block">Total Revenue Realized</span>
              <div className="text-2xl font-bold font-mono text-blue-600 mt-1">
                {formatCurrency(totalFullPaymentRevenue)}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Cost of goods: {formatCurrency(totalFullPaymentCost)}
              </span>
            </div>

            <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-sm bg-emerald-50/20">
              <span className="text-[11px] font-semibold text-emerald-800 block">Gross Profit Realized</span>
              <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">
                +{formatCurrency(totalFullPaymentProfit)}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Avg Profit / Bike: {fullPaymentBikes.length > 0 ? formatCurrency(totalFullPaymentProfit / fullPaymentBikes.length) : '0'}
              </span>
            </div>
          </div>

          {/* Full Payments Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs text-slate-700 min-w-[950px]">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 whitespace-nowrap min-w-[110px]">Invoice #</th>
                    <th className="py-3 px-4 whitespace-nowrap min-w-[140px]">Shop / Branch</th>
                    <th className="py-3 px-4 whitespace-nowrap min-w-[130px]">Chassis # (VIN)</th>
                    <th className="py-3 px-4 whitespace-nowrap min-w-[130px]">Model & Color</th>
                    <th className="py-3 px-4 whitespace-nowrap min-w-[150px]">Customer Name & Phone</th>
                    <th className="py-3 px-4 whitespace-nowrap min-w-[110px]">Sale Date</th>
                    <th className="py-3 px-4 whitespace-nowrap min-w-[110px]">Cost Price</th>
                    <th className="py-3 px-4 whitespace-nowrap min-w-[110px]">Sold Price</th>
                    <th className="py-3 px-4 whitespace-nowrap min-w-[110px]">Profit Earned</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap min-w-[100px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFullPayments.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-slate-500">
                        No full payment sales recorded yet for the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredFullPayments.map((bike) => {
                      const soldPrice = bike.actualSoldPrice || bike.sellingPrice;
                      const costPrice = bike.purchasePrice || 0;
                      const profit = soldPrice - costPrice;

                      return (
                        <tr key={bike.id} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-4 font-mono text-blue-600 font-semibold">
                            {bike.saleInvoiceNumber || 'INV-001'}
                          </td>
                          <td className="py-3 px-4">
                            {(bike.shopName || bike.saleShopName) ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-medium whitespace-nowrap">
                                <Store className="w-3 h-3 text-emerald-600 shrink-0" />
                                {bike.shopName || bike.saleShopName}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic text-xs">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            {bike.chassisNumber}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-900">{bike.modelName}</span>
                            <span className="text-[11px] text-slate-500 block">{bike.color}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-900">{bike.customer?.fullName || 'Walk-in Customer'}</span>
                            <span className="text-[11px] text-slate-500 block">{bike.customer?.phone}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {formatDate(bike.saleDate)}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-500">
                            {formatCurrency(costPrice)}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            {formatCurrency(soldPrice)}
                          </td>
                          <td className="py-3 px-4 font-mono font-semibold text-emerald-600">
                            +{formatCurrency(profit)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => onSelectBike(bike)}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs border border-slate-200"
                                title="View Detail"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onPrintInvoice(bike)}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs border border-slate-200"
                                title="Print Invoice"
                              >
                                <Printer className="w-3.5 h-3.5 text-blue-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Manage Shops / Branches Modal */}
      <ManageShopsModal
        isOpen={isManageShopsOpen}
        onClose={() => {
          setIsManageShopsOpen(false);
          setSavedShops(loadShopsFromStorage());
        }}
        onShopsUpdated={(shops) => setSavedShops(shops)}
      />

    </div>
  );
};
