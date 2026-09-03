import React from 'react';
import { X, Printer, Download, CheckCircle, Zap, ShieldCheck } from 'lucide-react';
import { EveeBike } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

interface InvoicePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  bike: EveeBike | null;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
  isOpen,
  onClose,
  bike,
}) => {
  if (!isOpen || !bike) return null;

  const handlePrint = () => {
    window.print();
  };

  const plan = bike.installmentPlan;
  const isInstallment = bike.status === 'SOLD_INSTALLMENT';
  const isFullyPaid = isInstallment ? plan?.status === 'PAID' : bike.status === 'SOLD_FULL';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150 print:p-0 print:bg-white print:static overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-3xl overflow-hidden shadow-2xl max-h-[95vh] flex flex-col my-auto print:border-none print:shadow-none print:max-h-full print:bg-white print:text-black">
        
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-slate-100 bg-slate-50/70 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Document Preview: Sale Invoice
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div id="printable-invoice" className="p-4 sm:p-8 space-y-5 sm:space-y-6 overflow-y-auto bg-white text-slate-900 print:bg-white print:text-slate-900 print:p-6 print:overflow-visible">
          
          {/* Company Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b-2 border-blue-600 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-base print:bg-blue-600 print:text-white shrink-0">
                  ⚡
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">EVEE ELECTRIC BIKES</h1>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 tracking-wider uppercase font-semibold">
                    Official Vehicle Sale Invoice & Warranty Certificate
                  </p>
                </div>
              </div>
              {(bike.shopName || bike.saleShopName) && (
                <div className="mt-2 text-xs text-slate-600 flex flex-wrap items-center gap-1.5">
                  <span className="font-semibold text-slate-900">Branch / Shop Location:</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                    {bike.shopName || bike.saleShopName}
                  </span>
                </div>
              )}
            </div>

            <div className="sm:text-right font-mono">
              <span className="text-xs font-bold px-2.5 py-1 rounded bg-slate-100 text-blue-700 border border-slate-200">
                {bike.saleInvoiceNumber || 'INV-EVEE-2024'}
              </span>
              <div className="text-xs text-slate-500 mt-1">
                Date: {formatDate(bike.saleDate || bike.entryDate)}
              </div>
            </div>
          </div>

          {/* Customer & Vehicle Info Two-Column Block */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
            {/* Customer Details */}
            <div className="space-y-1 text-xs">
              <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                Customer / Owner Information
              </span>
              <div className="font-bold text-sm text-slate-900">
                {bike.customer?.fullName || 'Walk-in Showroom Customer'}
              </div>
              <div className="text-slate-700">Phone: {bike.customer?.phone || '—'}</div>
              {bike.customer?.cnicOrId && (
                <div className="text-slate-600 font-mono">CNIC: {bike.customer.cnicOrId}</div>
              )}
              {bike.customer?.address && (
                <div className="text-slate-600">Address: {bike.customer.address}, {bike.customer.city}</div>
              )}
            </div>

            {/* Vehicle Identification */}
            <div className="space-y-1 text-xs sm:border-l sm:border-slate-200 sm:pl-6">
              <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                Vehicle Identification Details
              </span>
              <div className="font-mono font-bold text-blue-700 text-sm">
                VIN: {bike.chassisNumber}
              </div>
              <div className="text-slate-800 font-semibold">Model: {bike.modelName} ({bike.color})</div>
              <div className="text-slate-600 text-[11px]">{bike.engineMotorDetails}</div>
              <div className="text-slate-600">
                Motor: {bike.motorPowerWatts || 1200}W • Battery: {bike.batteryCapacity || 'Graphene Pack'}
              </div>
            </div>
          </div>

          {/* Pricing & Commercial Ledger */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Commercial Payment Ledger
            </h3>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] text-slate-500">
                  <th className="py-2">Item Description</th>
                  <th className="py-2">Chassis Number</th>
                  <th className="py-2">Payment Mode</th>
                  <th className="py-2 text-right">Agreed Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-3 font-semibold text-slate-900">
                    {bike.modelName} Electric Bike ({bike.color})
                  </td>
                  <td className="py-3 font-mono text-blue-600">
                    {bike.chassisNumber}
                  </td>
                  <td className="py-3 text-slate-700">
                    {isInstallment ? 'Installment Plan' : '100% Cash / Full Payment'}
                  </td>
                  <td className="py-3 text-right font-mono font-bold text-slate-900">
                    {formatCurrency(bike.actualSoldPrice || bike.sellingPrice)}
                  </td>
                </tr>

                {isInstallment && plan && (
                  <>
                    <tr className="bg-slate-50">
                      <td colSpan={3} className="py-2 pl-4 text-blue-700 font-semibold">
                        Initial Down Payment Received (Paid at Booking)
                      </td>
                      <td className="py-2 text-right font-mono font-semibold text-blue-700">
                        {formatCurrency(plan.downPayment)}
                      </td>
                    </tr>

                    {plan.payments.map((p, idx) => (
                      <tr key={p.id} className="text-[11px]">
                        <td colSpan={2} className="py-1.5 pl-6 text-slate-600">
                          Installment #{idx + 1} — Receipt {p.receiptNumber} ({formatDate(p.paidDate)})
                        </td>
                        <td className="py-1.5 text-slate-600">
                          Payer: {p.payerName} ({p.paymentMethod})
                        </td>
                        <td className="py-1.5 text-right font-mono text-emerald-700">
                          {formatCurrency(p.amount)}
                        </td>
                      </tr>
                    ))}

                    <tr className="border-t-2 border-slate-200 font-bold">
                      <td colSpan={3} className="py-2.5 text-slate-800">
                        Total Amount Received to Date:
                      </td>
                      <td className="py-2.5 text-right font-mono text-emerald-700 text-sm">
                        {formatCurrency(plan.totalPaid)}
                      </td>
                    </tr>

                    <tr className="font-bold">
                      <td colSpan={3} className="py-2 text-amber-700">
                        Outstanding Installment Balance Remaining:
                      </td>
                      <td className="py-2 text-right font-mono text-amber-700 text-sm">
                        {formatCurrency(plan.remainingBalance)}
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>

          {/* Status Clearance Box */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            isFullyPaid
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-amber-50 border-amber-300 text-amber-800'
          }`}>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              <div>
                <span className="font-bold text-xs block">
                  {isFullyPaid ? 'VEHICLE NOC & FULL PAYMENT CLEARANCE ISSUED' : 'ACTIVE INSTALLMENT HIRE-PURCHASE AGREEMENT'}
                </span>
                <span className="text-[11px] opacity-80">
                  {isFullyPaid 
                    ? '100% payments settled in full. Vehicle registration transfer authorized.'
                    : `Remaining balance of ${formatCurrency(plan?.remainingBalance)} due according to agreed schedule.`}
                </span>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-8 grid grid-cols-2 gap-12 text-center text-xs text-slate-500">
            <div className="border-t border-slate-300 pt-2">
              <p className="font-semibold text-slate-800">Authorized Evee Showroom Officer</p>
              <p className="text-[10px]">Signature & Stamp</p>
            </div>

            <div className="border-t border-slate-300 pt-2">
              <p className="font-semibold text-slate-800">Customer / Purchaser</p>
              <p className="text-[10px]">Signature & Acknowledgement</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
