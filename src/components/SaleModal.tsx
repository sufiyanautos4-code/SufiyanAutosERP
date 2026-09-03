import React, { useState, useEffect } from 'react';
import { 
  X, 
  DollarSign, 
  CreditCard, 
  User, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Check, 
  AlertCircle,
  Calendar,
  Sparkles,
  Store
} from 'lucide-react';
import { EveeBike, InstallmentPlan } from '../types';
import { formatCurrency, generateInvoiceNumber } from '../utils/formatters';
import { loadShopsFromStorage, addShopToStorage } from '../utils/storage';
import { ShopSelector } from './ShopSelector';

interface SaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  bike: EveeBike | null;
  availableBikes: EveeBike[];
  onConfirmSale: (updatedBike: EveeBike) => void;
}

export const SaleModal: React.FC<SaleModalProps> = ({
  isOpen,
  onClose,
  bike,
  availableBikes,
  onConfirmSale,
}) => {
  const [selectedBikeId, setSelectedBikeId] = useState<string>('');
  const [saleType, setSaleType] = useState<'FULL_PAYMENT' | 'INSTALLMENT'>('INSTALLMENT');
  
  // Shop Name / Branch
  const [shopName, setShopName] = useState<string>(() => {
    const saved = loadShopsFromStorage();
    return saved.length > 0 ? saved[0] : '';
  });

  // Pricing
  const [actualSoldPrice, setActualSoldPrice] = useState<number>(100000);
  const [downPayment, setDownPayment] = useState<number>(30000);
  const [tenureMonths, setTenureMonths] = useState<number>(5);

  // Customer Details
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [cnicOrId, setCnicOrId] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [city, setCity] = useState<string>('Islamabad');
  const [saleDate, setSaleDate] = useState<string>(new Date().toISOString().slice(0, 10));

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const currentBike = availableBikes.find(b => b.id === selectedBikeId) || bike || availableBikes[0];

  useEffect(() => {
    const saved = loadShopsFromStorage();
    if (bike) {
      setSelectedBikeId(bike.id);
      setActualSoldPrice(bike.sellingPrice || 100000);
      setDownPayment(Math.round((bike.sellingPrice || 100000) * 0.3));
      if (bike.shopName) {
        setShopName(bike.shopName);
      } else if (saved.length > 0) {
        setShopName(saved[0]);
      }
    } else if (availableBikes.length > 0) {
      setSelectedBikeId(availableBikes[0].id);
      setActualSoldPrice(availableBikes[0].sellingPrice || 100000);
      setDownPayment(Math.round((availableBikes[0].sellingPrice || 100000) * 0.3));
      if (availableBikes[0].shopName) {
        setShopName(availableBikes[0].shopName);
      } else if (saved.length > 0) {
        setShopName(saved[0]);
      }
    }
  }, [bike, availableBikes, isOpen]);

  if (!isOpen) return null;

  const remainingInstallment = Math.max(0, actualSoldPrice - downPayment);
  const monthlyEstimate = tenureMonths > 0 ? Math.round(remainingInstallment / tenureMonths) : 0;

  const validate = (): boolean => {
    const errs: { [key: string]: string } = {};
    if (!currentBike) errs.bike = 'Please select a vehicle to sell';
    if (!fullName.trim()) errs.fullName = 'Customer Full Name is required';
    if (!phone.trim()) errs.phone = 'Customer phone number is required';
    if (actualSoldPrice <= 0) errs.actualSoldPrice = 'Sale price must be greater than 0';

    if (saleType === 'INSTALLMENT') {
      if (downPayment <= 0) {
        errs.downPayment = 'Down payment must be greater than 0';
      } else if (downPayment >= actualSoldPrice) {
        errs.downPayment = 'Down payment cannot be equal to or greater than sale price (use Full Payment)';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !currentBike) return;

    if (shopName.trim()) {
      addShopToStorage(shopName.trim());
    }

    const invoiceNumber = generateInvoiceNumber();

    const updated: EveeBike = {
      ...currentBike,
      status: saleType === 'FULL_PAYMENT' ? 'SOLD_FULL' : 'SOLD_INSTALLMENT',
      saleDate,
      saleType,
      saleInvoiceNumber: invoiceNumber,
      actualSoldPrice: Number(actualSoldPrice),
      shopName: shopName.trim(),
      saleShopName: shopName.trim(),
      customer: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        cnicOrId: cnicOrId.trim(),
        address: address.trim(),
        city: city.trim(),
      },
    };

    if (saleType === 'INSTALLMENT') {
      const dp = Number(downPayment);
      const remaining = Number(actualSoldPrice) - dp;
      const plan: InstallmentPlan = {
        totalSalePrice: Number(actualSoldPrice),
        downPayment: dp,
        installmentBalance: remaining,
        totalPaid: dp,
        remainingBalance: remaining,
        monthlyInstallmentEstimate: monthlyEstimate,
        totalTenureMonths: Number(tenureMonths) || 5,
        startDate: saleDate,
        status: remaining <= 0 ? 'PAID' : 'ACTIVE',
        payments: [],
      };
      updated.installmentPlan = plan;
    }

    onConfirmSale(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">Record Vehicle Sale & Invoice</h2>
              <p className="text-xs text-slate-500">
                Sell an in-stock Evee bike with Cash Full Payment or Installment Financing.
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

        {/* Scrollable Body */}
        <form onSubmit={handleSaleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto">
          
          {/* Vehicle Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Available In-Stock Evee Bike:
            </label>
            <select
              value={selectedBikeId}
              onChange={(e) => {
                const b = availableBikes.find(item => item.id === e.target.value);
                if (b) {
                  setSelectedBikeId(b.id);
                  setActualSoldPrice(b.sellingPrice);
                  setDownPayment(Math.round(b.sellingPrice * 0.3));
                }
              }}
              className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              {availableBikes.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.chassisNumber} — {b.modelName} ({b.color}) — Retail: {formatCurrency(b.sellingPrice)}
                </option>
              ))}
            </select>
          </div>

          {/* Sale Type Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Select Sale Type:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSaleType('INSTALLMENT')}
                className={`p-3 rounded-xl text-left border transition flex items-center gap-3 ${
                  saleType === 'INSTALLMENT'
                    ? 'bg-amber-50 border-amber-400 text-amber-950 ring-1 ring-amber-400'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <CreditCard className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <div className="font-bold text-xs text-amber-900">Installment Plan</div>
                  <div className="text-[10px] text-slate-500">Down Payment + Monthly Balance</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSaleType('FULL_PAYMENT')}
                className={`p-3 rounded-xl text-left border transition flex items-center gap-3 ${
                  saleType === 'FULL_PAYMENT'
                    ? 'bg-blue-50 border-blue-400 text-blue-950 ring-1 ring-blue-400'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <DollarSign className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <div className="font-bold text-xs text-blue-900">Full Cash Payment</div>
                  <div className="text-[10px] text-slate-500">100% Upfront Clearance</div>
                </div>
              </button>
            </div>
          </div>

          {/* Shop / Branch Location Selector */}
          <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100">
            <ShopSelector
              selectedShop={shopName}
              onSelectShop={setShopName}
              label="Selling Shop / Branch Location"
              helperText="Record which dealership shop/branch this bike is being sold from (Full Cash or Installment)."
              required
            />
          </div>

          {/* Pricing & Installment Calculation (Scenario: 100k price, 30k DP -> 70k installment) */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs font-bold text-slate-800">Commercial Financials</span>
              <span className="text-[11px] font-mono text-blue-600 font-semibold">
                Model: {currentBike?.modelName}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Agreed Sale Price (PKR)
                </label>
                <input
                  type="number"
                  value={actualSoldPrice}
                  onChange={(e) => setActualSoldPrice(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-mono font-bold focus:border-blue-500"
                  step="500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Sale / Delivery Date
                </label>
                <input
                  type="date"
                  value={saleDate}
                  onChange={(e) => setSaleDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900"
                />
              </div>
            </div>

            {saleType === 'INSTALLMENT' && (
              <div className="pt-2 border-t border-slate-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-amber-800 mb-1">
                      Down Payment Received
                    </label>
                    <input
                      type="number"
                      value={downPayment}
                      onChange={(e) => setDownPayment(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-white border border-amber-300 rounded-lg px-3 py-1.5 text-xs text-amber-900 font-mono font-bold focus:border-amber-500"
                      step="1000"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Remaining Installment
                    </label>
                    <div className="bg-white border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-slate-900">
                      {formatCurrency(remainingInstallment)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Tenure (Months)
                    </label>
                    <input
                      type="number"
                      value={tenureMonths}
                      onChange={(e) => setTenureMonths(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-mono focus:border-blue-500"
                      min="1"
                      max="36"
                    />
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                  💡 <strong className="text-slate-800">Scenario Note:</strong> Down Payment of <span className="text-blue-600 font-semibold">{formatCurrency(downPayment)}</span> is recorded as initially paid. Remaining balance of <span className="text-amber-700 font-semibold">{formatCurrency(remainingInstallment)}</span> will be tracked in the Installment Ledger with monthly updates (~{formatCurrency(monthlyEstimate)}/mo).
                </div>
              </div>
            )}
          </div>

          {/* Customer Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              Customer / Buyer Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Customer Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Tariq Mehmood"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:border-blue-500"
                />
                {errors.fullName && <p className="text-[10px] text-rose-500 mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Phone / Mobile # <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +92 300 1234567"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:border-blue-500"
                />
                {errors.phone && <p className="text-[10px] text-rose-500 mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  CNIC / National Identity Card #
                </label>
                <input
                  type="text"
                  value={cnicOrId}
                  onChange={(e) => setCnicOrId(e.target.value)}
                  placeholder="e.g. 35201-1234567-1"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Lahore"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Delivery Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. House #10, Street 3, Sector G-9"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                />
              </div>
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
              className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Confirm & Issue Vehicle Sale</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
