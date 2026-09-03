import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  User, 
  Calendar, 
  Check, 
  Sparkles, 
  Receipt, 
  DollarSign, 
  FileText,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { EveeBike, InstallmentPayment } from '../types';
import { formatCurrency, generateReceiptNumber } from '../utils/formatters';

interface ReceivePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bike: EveeBike | null;
  onPaymentRecorded: (updatedBike: EveeBike) => void;
}

export const ReceivePaymentModal: React.FC<ReceivePaymentModalProps> = ({
  isOpen,
  onClose,
  bike,
  onPaymentRecorded,
}) => {
  const plan = bike?.installmentPlan;

  const defaultAmount = plan?.monthlyInstallmentEstimate || (plan ? Math.min(15000, plan.remainingBalance) : 10000);

  const [paymentAmount, setPaymentAmount] = useState<number>(defaultAmount);
  const [payerName, setPayerName] = useState<string>(bike?.customer?.fullName || '');
  const [receivedByName, setReceivedByName] = useState<string>('Showroom Manager');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank Transfer' | 'Cheque' | 'Online / Raast'>('Cash');
  const [receiptNumber, setReceiptNumber] = useState<string>(generateReceiptNumber());
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  if (!isOpen || !bike || !plan) return null;

  const currentRemaining = plan.remainingBalance;
  const newRemaining = Math.max(0, currentRemaining - paymentAmount);
  const willBeFullyPaid = newRemaining === 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentAmount <= 0) {
      setError('Payment amount must be greater than 0');
      return;
    }
    if (!payerName.trim()) {
      setError('Payer / Customer Name is required');
      return;
    }

    const newPayment: InstallmentPayment = {
      id: `pay-${Date.now()}`,
      amount: Number(paymentAmount),
      paidDate: paymentDate,
      payerName: payerName.trim(),
      receivedByName: receivedByName.trim(),
      paymentMethod,
      receiptNumber: receiptNumber.trim() || generateReceiptNumber(),
      notes: notes.trim(),
    };

    const newTotalPaid = plan.totalPaid + Number(paymentAmount);
    const updatedRemaining = Math.max(0, plan.totalSalePrice - newTotalPaid);
    const updatedStatus = updatedRemaining <= 0 ? 'PAID' : 'ACTIVE';

    const updatedBike: EveeBike = {
      ...bike,
      installmentPlan: {
        ...plan,
        totalPaid: newTotalPaid,
        remainingBalance: updatedRemaining,
        status: updatedStatus,
        payments: [...plan.payments, newPayment],
      },
    };

    if (updatedStatus === 'PAID') {
      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        console.error(err);
      }
    }

    onPaymentRecorded(updatedBike);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh] my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">Receive Installment Payment</h2>
              <p className="text-xs text-slate-500">
                Log manual collection & update vehicle installment ledger
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          
          {/* Target Bike Summary */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 font-mono block">Chassis: {bike.chassisNumber}</span>
              <span className="text-xs font-bold text-slate-900">{bike.modelName} ({bike.color})</span>
              <span className="text-[11px] text-slate-500 block mt-0.5">Owner: {bike.customer?.fullName}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block">Current Balance</span>
              <span className="text-sm font-mono font-bold text-amber-700">
                {formatCurrency(currentRemaining)}
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Amount to Pay */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Payment Amount Received (PKR) <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setPaymentAmount(currentRemaining)}
                className="text-[11px] text-blue-600 hover:underline font-semibold"
              >
                Pay Full Remaining ({formatCurrency(currentRemaining)})
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">
                PKR
              </span>
              <input
                id="payment-amount-input"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Math.max(0, Number(e.target.value)))}
                className="w-full bg-white border border-slate-300 rounded-lg pl-12 pr-4 py-2 text-base font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                step="500"
              />
            </div>
          </div>

          {/* Payer Name & Received By */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payer / Paid Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="payer-name-input"
                type="text"
                value={payerName}
                onChange={(e) => setPayerName(e.target.value)}
                placeholder="e.g. Muhammad Usman Khan"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Received By (Cashier/Owner)
              </label>
              <input
                type="text"
                value={receivedByName}
                onChange={(e) => setReceivedByName(e.target.value)}
                placeholder="e.g. Tariq Mehmood"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Payment Method & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Channel
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:border-blue-500"
              >
                <option value="Cash">Cash at Showroom</option>
                <option value="Bank Transfer">Bank Transfer (Meezan / HBL / etc.)</option>
                <option value="Online / Raast">Online / Raast / EasyPaisa</option>
                <option value="Cheque">Crossed Cheque</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Receipt / Voucher #
              </label>
              <input
                type="text"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono"
              />
            </div>
          </div>

          {/* Notes / Remarks */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Payment Remarks / Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Month 2 installment received in cash"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500"
            />
          </div>

          {/* Live Outcome Calculation Preview */}
          <div className={`p-3.5 rounded-xl border text-xs transition ${
            willBeFullyPaid 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <div className="flex justify-between items-center font-mono font-semibold">
              <span>New Remaining Balance:</span>
              <span className={willBeFullyPaid ? 'text-emerald-700 font-bold' : 'text-amber-700'}>
                {formatCurrency(newRemaining)}
              </span>
            </div>
            {willBeFullyPaid ? (
              <div className="mt-1 flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>🎉 This payment will mark the vehicle installment status as PAID & Full Clearance!</span>
              </div>
            ) : (
              <div className="mt-1 text-[10px] text-slate-500">
                Balance will decrease from {formatCurrency(currentRemaining)} to {formatCurrency(newRemaining)}.
              </div>
            )}
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
              id="confirm-payment-btn"
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Save Payment & Update Ledger</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
