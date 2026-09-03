import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  AlertCircle, 
  DollarSign, 
  Zap, 
  User, 
  Phone, 
  MapPin, 
  FileText, 
  CreditCard, 
  Save, 
  RotateCcw,
  Bike
} from 'lucide-react';
import { EveeBike, VehicleStatus } from '../types';
import { formatCurrency, generateChassisNumber, generateInvoiceNumber } from '../utils/formatters';
import { loadShopsFromStorage, addShopToStorage } from '../utils/storage';
import { ShopSelector } from './ShopSelector';

interface ProductEntryProps {
  existingBikes: EveeBike[];
  onSaveBike: (bike: EveeBike) => void;
  editingBike?: EveeBike | null;
  onCancelEdit?: () => void;
}

export const ProductEntry: React.FC<ProductEntryProps> = ({
  existingBikes,
  onSaveBike,
  editingBike,
  onCancelEdit,
}) => {
  // Shop / Branch State for Sales
  const [shopName, setShopName] = useState<string>(() => {
    const saved = loadShopsFromStorage();
    return saved.length > 0 ? saved[0] : '';
  });

  // Form States - Model Name & Bike Variant
  const [modelName, setModelName] = useState<string>('');
  const [customBikeName, setCustomBikeName] = useState<string>('');
  const [chassisNumber, setChassisNumber] = useState<string>('');
  const [color, setColor] = useState<string>('Midnight Black');
  const [customColor, setCustomColor] = useState<string>('');
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [engineMotorDetails, setEngineMotorDetails] = useState<string>('1200W Brushless DC Motor, 72V 30Ah Graphene Battery');
  const [motorPowerWatts, setMotorPowerWatts] = useState<number>(1200);
  const [batteryCapacity, setBatteryCapacity] = useState<string>('72V 30Ah Graphene');
  const [maxSpeedKmH, setMaxSpeedKmH] = useState<number>(60);
  const [rangeKm, setRangeKm] = useState<number>(75);
  const [notes, setNotes] = useState<string>('');

  // Initial Status / Direct Sale Option
  const [entryMode, setEntryMode] = useState<'IN_STOCK' | 'DIRECT_SALE_FULL' | 'DIRECT_SALE_INSTALLMENT'>('IN_STOCK');
  
  // Customer Details (if sold directly)
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerCnic, setCustomerCnic] = useState<string>('');
  const [customerAddress, setCustomerAddress] = useState<string>('');
  const [customerCity, setCustomerCity] = useState<string>('Islamabad');
  const [emergencyContact, setEmergencyContact] = useState<string>('');
  
  // Installment Details (if sold on installment)
  const [downPayment, setDownPayment] = useState<number>(0);
  const [installmentTenureMonths, setInstallmentTenureMonths] = useState<number>(5);

  // Validation & Feedback
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Initialize or load editing bike
  useEffect(() => {
    if (editingBike) {
      setModelName(editingBike.modelName);
      setCustomBikeName(editingBike.customBikeName || editingBike.modelName);
      setChassisNumber(editingBike.chassisNumber);
      setColor(editingBike.color);
      setPurchasePrice(editingBike.purchasePrice);
      setSellingPrice(editingBike.sellingPrice);
      setEngineMotorDetails(editingBike.engineMotorDetails);
      setMotorPowerWatts(editingBike.motorPowerWatts || 1200);
      setBatteryCapacity(editingBike.batteryCapacity || '72V 30Ah Graphene');
      setMaxSpeedKmH(editingBike.maxSpeedKmH || 60);
      setRangeKm(editingBike.rangeKm || 75);
      setNotes(editingBike.notes || '');

      if (editingBike.shopName) {
        setShopName(editingBike.shopName);
      }

      if (editingBike.status === 'SOLD_FULL') {
        setEntryMode('DIRECT_SALE_FULL');
        setCustomerName(editingBike.customer?.fullName || '');
        setCustomerPhone(editingBike.customer?.phone || '');
        setCustomerCnic(editingBike.customer?.cnicOrId || '');
        setCustomerAddress(editingBike.customer?.address || '');
        setCustomerCity(editingBike.customer?.city || '');
      } else if (editingBike.status === 'SOLD_INSTALLMENT') {
        setEntryMode('DIRECT_SALE_INSTALLMENT');
        setCustomerName(editingBike.customer?.fullName || '');
        setCustomerPhone(editingBike.customer?.phone || '');
        setCustomerCnic(editingBike.customer?.cnicOrId || '');
        setCustomerAddress(editingBike.customer?.address || '');
        setCustomerCity(editingBike.customer?.city || '');
        setDownPayment(editingBike.installmentPlan?.downPayment || 0);
      } else {
        setEntryMode('IN_STOCK');
      }
    } else {
      // If brand new entry and no chassis yet
      if (!chassisNumber) {
        setChassisNumber(generateChassisNumber('EVEE'));
      }
    }
  }, [editingBike]);

  const handleGenerateChassis = () => {
    setChassisNumber(generateChassisNumber(modelName || 'EVEE'));
    if (errors.chassisNumber) {
      setErrors(prev => ({ ...prev, chassisNumber: '' }));
    }
  };

  // Validate form
  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!modelName.trim()) {
      newErrors.modelName = 'Model Name is required';
    }

    if (!chassisNumber.trim()) {
      newErrors.chassisNumber = 'Chassis Number (VIN) is required for every vehicle';
    } else {
      // Check duplicate chassis number (unless we are editing the same bike)
      const duplicate = existingBikes.find(
        b => b.chassisNumber.trim().toUpperCase() === chassisNumber.trim().toUpperCase() &&
        b.id !== editingBike?.id
      );
      if (duplicate) {
        newErrors.chassisNumber = `Chassis Number "${chassisNumber}" is already registered in inventory!`;
      }
    }

    const finalColor = customColor.trim() ? customColor.trim() : color;
    if (!finalColor) {
      newErrors.color = 'Color is required';
    }

    if (purchasePrice <= 0 || isNaN(purchasePrice)) {
      newErrors.purchasePrice = 'Purchase price must be greater than 0';
    }

    if (sellingPrice <= 0 || isNaN(sellingPrice)) {
      newErrors.sellingPrice = 'Selling price must be greater than 0';
    }

    if (!engineMotorDetails.trim()) {
      newErrors.engineMotorDetails = 'Engine / Motor specifications are required';
    }

    // Customer Validation if sold
    if (entryMode !== 'IN_STOCK') {
      if (!customerName.trim()) {
        newErrors.customerName = 'Customer Name is required for sold vehicles';
      }
      if (!customerPhone.trim()) {
        newErrors.customerPhone = 'Customer Phone is required';
      }

      if (entryMode === 'DIRECT_SALE_INSTALLMENT') {
        if (downPayment <= 0) {
          newErrors.downPayment = 'Down payment must be greater than 0';
        } else if (downPayment >= sellingPrice) {
          newErrors.downPayment = 'Down payment cannot be equal to or greater than selling price (use Full Payment)';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    const finalColor = customColor.trim() ? customColor.trim() : color;
    const finalChassis = chassisNumber.trim().toUpperCase();
    const finalStatus: VehicleStatus = 
      entryMode === 'DIRECT_SALE_FULL' 
        ? 'SOLD_FULL' 
        : entryMode === 'DIRECT_SALE_INSTALLMENT' 
        ? 'SOLD_INSTALLMENT' 
        : 'IN_STOCK';

    const bikeId = editingBike?.id || `evee-${Date.now()}`;
    const today = new Date().toISOString().slice(0, 10);

    const bikeData: EveeBike = {
      id: bikeId,
      chassisNumber: finalChassis,
      modelName: modelName.trim(),
      customBikeName: customBikeName.trim() || modelName.trim(),
      color: finalColor,
      purchasePrice: Number(purchasePrice),
      sellingPrice: Number(sellingPrice),
      engineMotorDetails: engineMotorDetails.trim(),
      motorPowerWatts: Number(motorPowerWatts),
      batteryCapacity: batteryCapacity.trim(),
      maxSpeedKmH: Number(maxSpeedKmH),
      rangeKm: Number(rangeKm),
      status: finalStatus,
      entryDate: editingBike?.entryDate || today,
      notes: notes.trim(),
    };

    // If Direct Sale, attach Customer & Invoice
    if (entryMode !== 'IN_STOCK') {
      if (shopName.trim()) {
        addShopToStorage(shopName.trim());
      }
      bikeData.saleDate = editingBike?.saleDate || today;
      bikeData.saleInvoiceNumber = editingBike?.saleInvoiceNumber || generateInvoiceNumber();
      bikeData.actualSoldPrice = Number(sellingPrice);
      bikeData.shopName = shopName.trim();
      bikeData.saleShopName = shopName.trim();
      bikeData.customer = {
        fullName: customerName.trim(),
        phone: customerPhone.trim(),
        cnicOrId: customerCnic.trim(),
        address: customerAddress.trim(),
        city: customerCity.trim(),
        emergencyContact: emergencyContact.trim(),
      };

      if (entryMode === 'DIRECT_SALE_FULL') {
        bikeData.saleType = 'FULL_PAYMENT';
      } else if (entryMode === 'DIRECT_SALE_INSTALLMENT') {
        bikeData.saleType = 'INSTALLMENT';
        const dp = Number(downPayment);
        const remainingInstBalance = Number(sellingPrice) - dp;
        
        bikeData.installmentPlan = {
          totalSalePrice: Number(sellingPrice),
          downPayment: dp,
          installmentBalance: remainingInstBalance,
          totalPaid: dp,
          remainingBalance: remainingInstBalance,
          monthlyInstallmentEstimate: Math.round(remainingInstBalance / (installmentTenureMonths || 5)),
          totalTenureMonths: Number(installmentTenureMonths) || 5,
          startDate: editingBike?.installmentPlan?.startDate || today,
          status: remainingInstBalance <= 0 ? 'PAID' : 'ACTIVE',
          payments: editingBike?.installmentPlan?.payments || [],
        };
      }
    }

    onSaveBike(bikeData);
    setSuccessMessage(`Vehicle chassis "${finalChassis}" (${modelName}) successfully ${editingBike ? 'updated' : 'registered in inventory'}!`);

    if (!editingBike) {
      // Reset for next bike entry
      setChassisNumber(generateChassisNumber(modelName || 'EVEE'));
      setCustomColor('');
      setCustomerName('');
      setCustomerPhone('');
      setCustomerCnic('');
      setCustomerAddress('');
      setEmergencyContact('');
      setEntryMode('IN_STOCK');
    }

    setTimeout(() => {
      setSuccessMessage('');
    }, 4000);
  };

  const profitMargin = sellingPrice - purchasePrice;
  const marginPercentage = purchasePrice > 0 ? Math.round((profitMargin / purchasePrice) * 100) : 0;

  // Extract distinct models from existing inventory for clean auto-complete suggestion
  const modelSuggestions = Array.from(
    new Set([
      ...existingBikes.map(b => b.modelName),
      'Evee C1',
      'Evee C1 Air',
      'Evee Nisa',
      'Evee Gen-Z',
      'Evee Pro',
      'Evee Flipper'
    ].filter(Boolean))
  );

  return (
    <div className="w-full max-w-4xl 2xl:max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 p-4 sm:p-6 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
              <PlusCircle className="w-5 h-5" />
            </span>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              {editingBike ? `Edit Evee Bike (${editingBike.chassisNumber})` : 'Product Entry: Register Evee Electric Bike'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Directly enter Model Name, Bike Variant, unique Chassis Number (VIN), specs, purchase cost, and selling price.
          </p>
        </div>

        {editingBike && onCancelEdit && (
          <button
            onClick={onCancelEdit}
            className="text-xs px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-300 font-semibold whitespace-nowrap"
          >
            Cancel Editing
          </button>
        )}
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl flex items-center gap-3 text-emerald-800 text-xs font-semibold shadow-sm animate-in fade-in duration-200">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Entry Form */}
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* SECTION 1: CORE VEHICLE IDENTIFICATION */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              1. Vehicle Model & Variant Identification
            </h2>
            <span className="text-[11px] text-blue-600 font-mono font-semibold">
              Step 1 of 4
            </span>
          </div>

          {/* Model Name & Bike Variant Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Model Name */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <span>Model Name</span>
                  <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-slate-400">e.g. Evee C1, Evee Nisa</span>
              </div>
              <input
                id="model-name-input"
                type="text"
                list="model-suggestions-list"
                value={modelName}
                onChange={(e) => {
                  setModelName(e.target.value);
                  if (errors.modelName) setErrors(prev => ({ ...prev, modelName: '' }));
                }}
                placeholder="Enter model name (e.g. Evee C1, Evee Nisa, Evee Gen-Z, Evee Pro)..."
                className={`w-full bg-white border rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none transition ${
                  errors.modelName ? 'border-rose-500 focus:border-rose-500' : 'border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                }`}
              />
              <datalist id="model-suggestions-list">
                {modelSuggestions.map(name => (
                  <option key={name} value={name} />
                ))}
              </datalist>
              {errors.modelName ? (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {errors.modelName}
                </p>
              ) : (
                <p className="text-[10px] text-slate-500 mt-1">
                  Primary vehicle series / model title.
                </p>
              )}
            </div>

            {/* Bike Variant / Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Bike Variant / Title
              </label>
              <input
                id="bike-name-input"
                type="text"
                value={customBikeName}
                onChange={(e) => setCustomBikeName(e.target.value)}
                placeholder="e.g. Standard, Air Commuter 2026, Sport Edition..."
                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Variant specification or sub-brand name for invoice, receipts, and showroom tags.
              </p>
            </div>
          </div>

          {/* Chassis Number (VIN) */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <span>Chassis Number / Frame VIN</span>
                <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleGenerateChassis}
                className="text-[11px] text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold"
              >
                <Sparkles className="w-3 h-3" />
                Generate Unique VIN
              </button>
            </div>
            <div className="relative">
              <input
                id="chassis-number-input"
                type="text"
                value={chassisNumber}
                onChange={(e) => {
                  setChassisNumber(e.target.value.toUpperCase());
                  if (errors.chassisNumber) setErrors(prev => ({ ...prev, chassisNumber: '' }));
                }}
                placeholder="e.g. EVEE-PK-2024-C1-9081"
                className={`w-full bg-white border rounded-lg px-3.5 py-2.5 text-xs text-slate-900 font-mono uppercase tracking-wider focus:outline-none transition ${
                  errors.chassisNumber ? 'border-rose-500 focus:border-rose-500' : 'border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                }`}
              />
            </div>
            {errors.chassisNumber ? (
              <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.chassisNumber}
              </p>
            ) : (
              <p className="text-[10px] text-slate-500 mt-1">
                Unique physical chassis code stamped on the electric bike frame.
              </p>
            )}
          </div>

          {/* Color Selection */}
          <div className="pt-1">
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Color of Vehicle <span className="text-rose-500">*</span>
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {['Midnight Black', 'Arctic White', 'Emerald Green', 'Metallic Blue', 'Crimson Red', 'Matte Grey', 'Electric Teal', 'Sunburst Yellow'].map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => {
                    setColor(c);
                    setCustomColor('');
                    if (errors.color) setErrors(prev => ({ ...prev, color: '' }));
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-2 transition ${
                    color === c && !customColor
                      ? 'bg-slate-900 text-white border-blue-600 ring-2 ring-blue-500/20'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span 
                    className="w-2.5 h-2.5 rounded-full inline-block border border-slate-300"
                    style={{
                      backgroundColor: 
                        c.toLowerCase().includes('black') ? '#0f172a' :
                        c.toLowerCase().includes('white') ? '#f8fafc' :
                        c.toLowerCase().includes('red') ? '#ef4444' :
                        c.toLowerCase().includes('blue') ? '#3b82f6' :
                        c.toLowerCase().includes('green') ? '#10b981' :
                        c.toLowerCase().includes('yellow') ? '#eab308' :
                        c.toLowerCase().includes('grey') ? '#94a3b8' :
                        '#06b6d4'
                    }}
                  ></span>
                  {c}
                </button>
              ))}
            </div>

            {/* Custom Color Manual Input */}
            <div className="mt-2 flex items-center gap-2">
              <input
                type="text"
                value={customColor}
                onChange={(e) => {
                  setCustomColor(e.target.value);
                  if (e.target.value) setColor(e.target.value);
                  if (errors.color) setErrors(prev => ({ ...prev, color: '' }));
                }}
                placeholder="Or type custom paint color (e.g. Metallic Rose Gold, Matte Desert Tan)..."
                className="w-full sm:max-w-md bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            {errors.color && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.color}</p>
            )}
          </div>
        </div>

        {/* SECTION 2: PRICING & COMMERCIAL VALUES */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              2. Commercial Pricing & Margins
            </h2>
            <div className="text-xs font-bold text-emerald-600">
              Expected Margin: +{formatCurrency(profitMargin)} ({marginPercentage}%)
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Purchase Price */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Purchase Price (Wholesale Cost from Company) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                  PKR
                </span>
                <input
                  id="purchase-price-input"
                  type="number"
                  value={purchasePrice || ''}
                  onChange={(e) => {
                    setPurchasePrice(Math.max(0, Number(e.target.value)));
                    if (errors.purchasePrice) setErrors(prev => ({ ...prev, purchasePrice: '' }));
                  }}
                  placeholder="0"
                  className={`w-full bg-white border rounded-lg pl-12 pr-3 py-2 text-sm text-slate-900 font-mono font-bold focus:outline-none ${
                    errors.purchasePrice ? 'border-rose-500' : 'border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                  }`}
                  min="0"
                  step="500"
                />
              </div>
              {errors.purchasePrice ? (
                <p className="text-[11px] text-rose-500 mt-1">{errors.purchasePrice}</p>
              ) : (
                <p className="text-[10px] text-slate-500 mt-1">
                  Wholesale inventory cost paid to manufacturing plant.
                </p>
              )}
            </div>

            {/* Selling Price */}
            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200">
              <label className="block text-xs font-semibold text-emerald-800 mb-1.5">
                Retail Selling Price (Sold to Customer) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-emerald-700">
                  PKR
                </span>
                <input
                  id="selling-price-input"
                  type="number"
                  value={sellingPrice || ''}
                  onChange={(e) => {
                    const sp = Math.max(0, Number(e.target.value));
                    setSellingPrice(sp);
                    if (downPayment === 0 || downPayment > sp) {
                      setDownPayment(Math.round(sp * 0.3));
                    }
                    if (errors.sellingPrice) setErrors(prev => ({ ...prev, sellingPrice: '' }));
                  }}
                  placeholder="0"
                  className={`w-full bg-white border rounded-lg pl-12 pr-3 py-2 text-sm text-emerald-800 font-mono font-bold focus:outline-none ${
                    errors.sellingPrice ? 'border-rose-500' : 'border-emerald-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                  }`}
                  min="0"
                  step="500"
                />
              </div>
              {errors.sellingPrice ? (
                <p className="text-[11px] text-rose-500 mt-1">{errors.sellingPrice}</p>
              ) : (
                <p className="text-[10px] text-emerald-700 mt-1">
                  Official showroom retail sticker price.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: TECHNICAL & BATTERY SPECIFICATIONS */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              3. Powertrain, Motor & Battery Specifications
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Motor Power */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Motor Power (Watts)
              </label>
              <input
                type="number"
                value={motorPowerWatts || ''}
                onChange={(e) => {
                  const w = Number(e.target.value);
                  setMotorPowerWatts(w);
                  setEngineMotorDetails(`${w}W BLDC Motor, ${batteryCapacity}`);
                }}
                placeholder="1200"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono focus:border-blue-500"
                step="100"
              />
            </div>

            {/* Battery Capacity */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Battery Type & Chemistry
              </label>
              <input
                type="text"
                value={batteryCapacity}
                onChange={(e) => {
                  setBatteryCapacity(e.target.value);
                  setEngineMotorDetails(`${motorPowerWatts}W BLDC Motor, ${e.target.value}`);
                }}
                placeholder="72V 30Ah Graphene"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:border-blue-500"
              />
            </div>

            {/* Top Speed */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Top Speed (km/h)
              </label>
              <input
                type="number"
                value={maxSpeedKmH || ''}
                onChange={(e) => setMaxSpeedKmH(Number(e.target.value))}
                placeholder="60"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono focus:border-blue-500"
              />
            </div>

            {/* Range per Charge */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Range / Charge (km)
              </label>
              <input
                type="number"
                value={rangeKm || ''}
                onChange={(e) => setRangeKm(Number(e.target.value))}
                placeholder="75"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono focus:border-blue-500"
              />
            </div>
          </div>

          {/* Engine/Motor Summary Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Motor & Engine Description (Specs Stamp) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={engineMotorDetails}
              onChange={(e) => {
                setEngineMotorDetails(e.target.value);
                if (errors.engineMotorDetails) setErrors(prev => ({ ...prev, engineMotorDetails: '' }));
              }}
              placeholder="e.g. 1200W Bosch High Efficiency Brushless DC Motor, 72V 30Ah Graphene Fast Charge Pack"
              className={`w-full bg-white border rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none ${
                errors.engineMotorDetails ? 'border-rose-500' : 'border-slate-300 focus:border-blue-500'
              }`}
            />
            {errors.engineMotorDetails && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.engineMotorDetails}</p>
            )}
          </div>
        </div>

        {/* SECTION 4: INVENTORY STATUS & DIRECT SALE OPTION */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Bike className="w-4 h-4 text-slate-700" />
              4. Registration Mode & Initial Status
            </h2>
            <span className="text-xs text-slate-500">
              Add directly into In-Stock or record Immediate Sale
            </span>
          </div>

          {/* Entry Mode Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setEntryMode('IN_STOCK')}
              className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between gap-2 ${
                entryMode === 'IN_STOCK'
                  ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-600'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-blue-900">Add to In-Stock</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                  Ready for Sale
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Add to available showroom inventory for immediate browsing and future sales.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setEntryMode('DIRECT_SALE_FULL')}
              className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between gap-2 ${
                entryMode === 'DIRECT_SALE_FULL'
                  ? 'bg-emerald-50 border-emerald-600 ring-1 ring-emerald-600'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-emerald-900">Direct Full Sale (Cash)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  100% Paid
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Register as immediately sold with complete cash/bank payment and printable invoice.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setEntryMode('DIRECT_SALE_INSTALLMENT')}
              className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between gap-2 ${
                entryMode === 'DIRECT_SALE_INSTALLMENT'
                  ? 'bg-amber-50 border-amber-600 ring-1 ring-amber-600'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-amber-900">Direct Installment Sale</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                  Financing Ledger
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Record sale with down payment and schedule remaining balance into monthly installments.
              </p>
            </button>
          </div>

          {/* CUSTOMER INFORMATION (If Direct Sale) */}
          {entryMode !== 'IN_STOCK' && (
            <div className="mt-4 p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  Buyer Customer Information & Showroom Assignment
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                  Sale Invoice Generator
                </span>
              </div>

              {/* Shop / Branch Selector */}
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <ShopSelector
                  selectedShop={shopName}
                  onSelectShop={(name) => setShopName(name)}
                  required={false}
                  label="Sales Shop / Branch Outlet Location"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Buyer Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (errors.customerName) setErrors(prev => ({ ...prev, customerName: '' }));
                    }}
                    placeholder="e.g. Tariq Mehmood"
                    className={`w-full bg-white border rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none ${
                      errors.customerName ? 'border-rose-500' : 'border-slate-300 focus:border-blue-500'
                    }`}
                  />
                  {errors.customerName && (
                    <p className="text-[11px] text-rose-500 mt-1">{errors.customerName}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => {
                      setCustomerPhone(e.target.value);
                      if (errors.customerPhone) setErrors(prev => ({ ...prev, customerPhone: '' }));
                    }}
                    placeholder="e.g. 0300-1234567"
                    className={`w-full bg-white border rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none ${
                      errors.customerPhone ? 'border-rose-500' : 'border-slate-300 focus:border-blue-500'
                    }`}
                  />
                  {errors.customerPhone && (
                    <p className="text-[11px] text-rose-500 mt-1">{errors.customerPhone}</p>
                  )}
                </div>

                {/* CNIC */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    CNIC / National Identity Card #
                  </label>
                  <input
                    type="text"
                    value={customerCnic}
                    onChange={(e) => setCustomerCnic(e.target.value)}
                    placeholder="e.g. 35202-8492019-1"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono focus:border-blue-500"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City / Showroom Region
                  </label>
                  <input
                    type="text"
                    value={customerCity}
                    onChange={(e) => setCustomerCity(e.target.value)}
                    placeholder="e.g. Lahore / Islamabad / Karachi"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:border-blue-500"
                  />
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Delivery Address
                  </label>
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="e.g. House #42, Street 8, Sector F-10"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* INSTALLMENT FORM (If direct installment selected) */}
              {entryMode === 'DIRECT_SALE_INSTALLMENT' && (
                <div className="mt-4 pt-4 border-t border-slate-200 space-y-3 bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                      Installment Calculation Matrix
                    </span>
                    <span className="text-[11px] font-mono text-slate-700 font-bold">
                      Total Sale Price: {formatCurrency(sellingPrice)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Down Payment Received (PKR)
                      </label>
                      <input
                        type="number"
                        value={downPayment || ''}
                        onChange={(e) => setDownPayment(Math.max(0, Number(e.target.value)))}
                        className="w-full bg-white border border-amber-300 rounded-lg px-3 py-1.5 text-xs text-amber-800 font-mono font-bold focus:border-amber-500"
                        step="1000"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Remaining Installment Balance
                      </label>
                      <div className="bg-white border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-slate-900">
                        {formatCurrency(Math.max(0, sellingPrice - downPayment))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Tenure (Months)
                      </label>
                      <input
                        type="number"
                        value={installmentTenureMonths}
                        onChange={(e) => setInstallmentTenureMonths(Math.max(1, Number(e.target.value)))}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-mono focus:border-blue-500"
                        min="1"
                        max="36"
                      />
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-600">
                    Scenario: Selling Price {formatCurrency(sellingPrice)} − Down payment {formatCurrency(downPayment)} = {formatCurrency(sellingPrice - downPayment)} to be paid in {installmentTenureMonths} monthly payments (~{formatCurrency(Math.round((sellingPrice - downPayment) / (installmentTenureMonths || 1)))}/mo).
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* SECTION 5: NOTES & ACTION BUTTONS */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Internal Vehicle Notes / Comments (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Received from Karachi factory, tested OK, charger & 2 remote keys in box..."
              rows={2}
              className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            {editingBike && onCancelEdit && (
              <button
                type="button"
                onClick={onCancelEdit}
                className="px-5 py-2.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition border border-slate-300"
              >
                Cancel
              </button>
            )}

            <button
              id="save-evee-bike-btn"
              type="submit"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 rounded-lg shadow-sm transition active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{editingBike ? 'Update Vehicle Record' : 'Save & Register Evee Bike'}</span>
            </button>
          </div>
        </div>

      </form>
    </div>
  );
};
