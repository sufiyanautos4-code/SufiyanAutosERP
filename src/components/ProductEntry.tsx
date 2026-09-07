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
  // Check if trying to edit a sold bike
  const isSoldBike = editingBike && (editingBike.status === 'SOLD_FULL' || editingBike.status === 'SOLD_INSTALLMENT');
  
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

  // Initial Status - Only IN_STOCK mode (no state needed, always IN_STOCK)
  
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent editing sold bikes
    if (isSoldBike) {
      setErrors({ general: 'Cannot edit sold bikes. Please use the Product Detail view to update documentation status.' });
      return;
    }
    
    if (!validate()) {
      return;
    }

    const finalColor = customColor.trim() ? customColor.trim() : color;
    const finalChassis = chassisNumber.trim().toUpperCase();
    const finalStatus: VehicleStatus = 'IN_STOCK'; // Always IN_STOCK

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

    onSaveBike(bikeData);
    setSuccessMessage(`Vehicle chassis "${finalChassis}" (${modelName}) successfully ${editingBike ? 'updated' : 'added to stock inventory'}!`);

    if (!editingBike) {
      // Reset for next bike entry
      setChassisNumber(generateChassisNumber(modelName || 'EVEE'));
      setCustomColor('');
      setCustomerName('');
      setCustomerPhone('');
      setCustomerCnic('');
      setCustomerAddress('');
      setEmergencyContact('');
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
    <div className="w-full max-w-[1720px] 2xl:max-w-[1920px] 3xl:max-w-[2400px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-4 sm:py-6 space-y-6">
      
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

      {/* Sold Bike Warning - Cannot Edit */}
      {isSoldBike && (
        <div className="bg-rose-50 border border-rose-300 p-5 rounded-xl shadow-sm animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-rose-100 text-rose-700 border border-rose-200 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-rose-900 mb-1">
                Cannot Edit Sold Vehicle
              </h3>
              <p className="text-xs text-rose-800 leading-relaxed mb-3">
                This bike has been sold (Status: <strong>{editingBike.status === 'SOLD_FULL' ? 'Full Payment' : 'Installment'}</strong>) and its core details cannot be modified through the Product Entry form.
                {editingBike.customer && ` Sold to: ${editingBike.customer.fullName}`}
              </p>
              <div className="flex flex-wrap gap-2">
                <div className="text-[11px] bg-white border border-rose-200 px-3 py-1.5 rounded-lg">
                  <strong>Invoice:</strong> {editingBike.saleInvoiceNumber || 'N/A'}
                </div>
                <div className="text-[11px] bg-white border border-rose-200 px-3 py-1.5 rounded-lg">
                  <strong>Sale Date:</strong> {editingBike.saleDate || 'N/A'}
                </div>
                <div className="text-[11px] bg-white border border-rose-200 px-3 py-1.5 rounded-lg">
                  <strong>Chassis:</strong> {editingBike.chassisNumber}
                </div>
              </div>
              <p className="text-[11px] text-rose-700 mt-3 italic">
                💡 <strong>Note:</strong> Documentation status can still be updated through the Product Detail view or Sales tab, but vehicle specifications, pricing, and customer information are locked to maintain sale record integrity.
              </p>
              {onCancelEdit && (
                <button
                  onClick={onCancelEdit}
                  className="mt-3 flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Return to Product List
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Entry Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <fieldset disabled={isSoldBike} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: Vehicle Specs & Core Identification (7 cols on lg+) */}
          <div className="lg:col-span-7 xl:col-span-7 2xl:col-span-7 space-y-6">

            {/* SECTION 1: CORE VEHICLE IDENTIFICATION */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm space-y-5">
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
                disabled={isSoldBike}
                className={`w-full bg-white border rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none transition ${
                  isSoldBike ? 'bg-slate-100 text-slate-500 cursor-not-allowed' :
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
              {/* <button
                type="button"
                onClick={handleGenerateChassis}
                className="text-[11px] text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold"
              >
                <Sparkles className="w-3 h-3" />
                Generate Unique VIN
              </button> */}
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

            {/* SECTION 3: TECHNICAL & BATTERY SPECIFICATIONS */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  2. Powertrain, Motor & Battery Specifications
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
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
                    Battery Chemistry
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
                    Range (km)
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

          </div>

          {/* RIGHT COLUMN: Pricing, Commercials, Registration & Save Action (5 cols on lg+) */}
          <div className="lg:col-span-5 xl:col-span-5 2xl:col-span-5 space-y-6">

            {/* SECTION 2: PRICING & COMMERCIAL VALUES */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  3. Commercial Pricing & Margins
                </h2>
                <div className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  Margin: +{formatCurrency(profitMargin)} ({marginPercentage}%)
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Purchase Price */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Purchase Cost <span className="text-rose-500">*</span>
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
                      Wholesale inventory cost paid.
                    </p>
                  )}
                </div>

                {/* Selling Price */}
                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200">
                  <label className="block text-xs font-semibold text-emerald-800 mb-1.5">
                    Retail Selling Price <span className="text-rose-500">*</span>
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

            {/* SECTION 4: INVENTORY STATUS - ADD TO STOCK ONLY */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Bike className="w-4 h-4 text-slate-700" />
                  4. Registration Mode & Initial Status
                </h2>
              </div>

              {/* Entry Mode Display - Stock Only */}
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 border border-blue-200">
                    <Check className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-blue-900 block">Add to In-Stock Inventory</span>
                    <p className="text-xs text-slate-600 mt-0.5">
                      This bike will be added to available showroom inventory. To sell, use the Sales page after registration.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 5: NOTES & ACTION BUTTONS */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
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
                  disabled={isSoldBike}
                  className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 font-bold text-xs px-6 py-2.5 rounded-lg shadow-sm transition ${
                    isSoldBike 
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
                  }`}
                >
                  <Save className="w-4 h-4" />
                  <span>{editingBike ? 'Update Vehicle Record' : 'Save & Register Evee Bike'}</span>
                </button>
              </div>
            </div>

          </div>

        </div>
        </fieldset>
      </form>
    </div>
  );
};
