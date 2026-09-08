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
    // Get the invoice content
    const invoiceContent = document.getElementById('printable-invoice');
    if (!invoiceContent) return;

    // Get all stylesheets from the current document
    const styles = Array.from(document.styleSheets)
      .map(styleSheet => {
        try {
          return Array.from(styleSheet.cssRules)
            .map(rule => rule.cssText)
            .join('\n');
        } catch (e) {
          // Handle cross-origin stylesheets
          return '';
        }
      })
      .join('\n');

    // Create a new window
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) {
      alert('Please allow pop-ups to print the invoice');
      return;
    }

    // Write the complete HTML document with all styles
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Sales Invoice - ${bike?.chassisNumber || 'EVEE'}</title>
          <style>
            ${styles}
            
            /* Additional print-specific styles */
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              background: white;
              color: #1e293b;
              padding: 0;
              margin: 0;
            }
            
            /* Ensure colors print */
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            @media print {
              body {
                padding: 0;
                margin: 0;
              }
              
              @page {
                margin: 0.5in;
                size: A4 portrait;
              }
            }
          </style>
        </head>
        <body>
          ${invoiceContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    
    // Wait for content and images to load, then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }, 500);
    };
  };

  const plan = bike.installmentPlan;
  const isInstallment = bike.status === 'SOLD_INSTALLMENT';
  const isFullyPaid = isInstallment ? plan?.status === 'PAID' : bike.status === 'SOLD_FULL';

  return (
    <div className="printable-invoice-container fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150 print:p-0 print:bg-white print:static">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-4xl overflow-hidden shadow-2xl max-h-[95vh] flex flex-col my-auto print:border-none print:shadow-none print:max-h-full print:bg-white print:text-black">
        
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

        {/* Scrollable Container for Invoice */}
        <div className="overflow-y-auto flex-1 print:overflow-visible">
          {/* Printable Document Body */}
          <div id="printable-invoice" className="bg-white text-slate-900" style={{ 
            maxWidth: '210mm',
            minHeight: '297mm', 
            padding: '20mm 15mm',
            margin: '0 auto',
            fontSize: '11pt',
            lineHeight: '1.6',
            color: '#1e293b',
            backgroundColor: 'white'
          }}>
          
          {/* Company Header */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            borderBottom: '3px solid #2563eb', 
            paddingBottom: '20px',
            marginBottom: '30px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ 
                  width: '50px', 
                  height: '50px', 
                  backgroundColor: '#2563eb', 
                  color: 'white', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  borderRadius: '8px',
                  fontSize: '24px',
                  fontWeight: '900'
                }}>
                  ⚡
                </div>
                <div>
                  <h1 style={{ 
                    fontSize: '28px', 
                    fontWeight: '900', 
                    color: '#0f172a',
                    margin: '0',
                    letterSpacing: '-0.5px'
                  }}>
                    Sufiyan Autos
                  </h1>
                  <p style={{ 
                    fontSize: '10px', 
                    color: '#64748b', 
                    textTransform: 'uppercase', 
                    fontWeight: '600',
                    margin: '4px 0 0 0',
                    letterSpacing: '1px'
                  }}>
                    Official Vehicle Sale Invoice 
                  </p>
                </div>
              </div>
              {(bike.shopName || bike.saleShopName) && (
                <div style={{ 
                  fontSize: '12px', 
                  color: '#475569',
                  marginTop: '8px'
                }}>
                  <span style={{ fontWeight: '600', color: '#0f172a' }}>Branch / Shop Location: </span>
                  <span style={{ 
                    backgroundColor: '#d1fae5', 
                    color: '#065f46', 
                    padding: '4px 10px', 
                    borderRadius: '4px',
                    border: '1px solid #6ee7b7',
                    fontWeight: '700'
                  }}>
                    {bike.shopName || bike.saleShopName}
                  </span>
                </div>
              )}
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ 
                backgroundColor: '#f1f5f9', 
                color: '#1d4ed8', 
                padding: '8px 16px', 
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontWeight: '700',
                fontSize: '13px',
                fontFamily: 'monospace',
                marginBottom: '8px'
              }}>
                {bike.saleInvoiceNumber || 'INV-EVEE-2024'}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                <strong>Date:</strong> {formatDate(bike.saleDate || bike.entryDate)}
              </div>
            </div>
          </div>

          {/* Customer & Vehicle Info */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '25px',
            backgroundColor: '#f8fafc',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            marginBottom: '30px'
          }}>
            {/* Customer Details */}
            <div>
              <div style={{ 
                fontSize: '10px', 
                fontWeight: '700', 
                textTransform: 'uppercase', 
                color: '#64748b',
                marginBottom: '12px',
                letterSpacing: '0.5px'
              }}>
                Customer / Owner Information
              </div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
                {bike.customer?.fullName || 'Walk-in Showroom Customer'}
              </div>
              <div style={{ fontSize: '12px', color: '#475569', marginBottom: '4px' }}>
                <strong>Phone:</strong> {bike.customer?.phone || '—'}
              </div>
              {bike.customer?.cnicOrId && (
                <div style={{ fontSize: '12px', color: '#475569', fontFamily: 'monospace', marginBottom: '4px' }}>
                  <strong>CNIC:</strong> {bike.customer.cnicOrId}
                </div>
              )}
              {bike.customer?.address && (
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '8px' }}>
                  <strong>Address:</strong> {bike.customer.address}, {bike.customer.city}
                </div>
              )}
            </div>

            {/* Vehicle Identification */}
            <div style={{ borderLeft: '2px solid #cbd5e1', paddingLeft: '25px' }}>
              <div style={{ 
                fontSize: '10px', 
                fontWeight: '700', 
                textTransform: 'uppercase', 
                color: '#64748b',
                marginBottom: '12px',
                letterSpacing: '0.5px'
              }}>
                Vehicle Identification Details
              </div>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: '700', 
                color: '#1d4ed8', 
                fontFamily: 'monospace',
                marginBottom: '8px'
              }}>
                VIN: {bike.chassisNumber}
              </div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>
                Model: {bike.modelName} ({bike.color})
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                {bike.engineMotorDetails}
              </div>
              <div style={{ fontSize: '11px', color: '#475569' }}>
                <strong>Motor:</strong> {bike.motorPowerWatts || 1200}W • 
                <strong> Battery:</strong> {bike.batteryCapacity || 'Graphene Pack'}
              </div>
            </div>
          </div>

          {/* Pricing & Commercial Ledger */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ 
              fontSize: '12px', 
              fontWeight: '700', 
              textTransform: 'uppercase', 
              color: '#334155',
              marginBottom: '15px',
              letterSpacing: '0.5px'
            }}>
              Commercial Payment Ledger
            </h3>

            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              fontSize: '11px'
            }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #cbd5e1' }}>
                  <th style={{ 
                    padding: '10px 8px', 
                    textAlign: 'left', 
                    fontSize: '10px',
                    fontWeight: '600',
                    color: '#64748b',
                    textTransform: 'uppercase'
                  }}>
                    Item Description
                  </th>
                  <th style={{ 
                    padding: '10px 8px', 
                    textAlign: 'left', 
                    fontSize: '10px',
                    fontWeight: '600',
                    color: '#64748b',
                    textTransform: 'uppercase'
                  }}>
                    Chassis Number
                  </th>
                  <th style={{ 
                    padding: '10px 8px', 
                    textAlign: 'left', 
                    fontSize: '10px',
                    fontWeight: '600',
                    color: '#64748b',
                    textTransform: 'uppercase'
                  }}>
                    Payment Mode
                  </th>
                  <th style={{ 
                    padding: '10px 8px', 
                    textAlign: 'right', 
                    fontSize: '10px',
                    fontWeight: '600',
                    color: '#64748b',
                    textTransform: 'uppercase'
                  }}>
                    Agreed Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '14px 8px', fontWeight: '600', color: '#0f172a' }}>
                    {bike.modelName} Electric Bike ({bike.color})
                  </td>
                  <td style={{ padding: '14px 8px', fontFamily: 'monospace', color: '#1d4ed8', fontWeight: '600' }}>
                    {bike.chassisNumber}
                  </td>
                  <td style={{ padding: '14px 8px', color: '#475569' }}>
                    {isInstallment ? 'Installment Plan' : '100% Cash / Full Payment'}
                  </td>
                  <td style={{ padding: '14px 8px', textAlign: 'right', fontFamily: 'monospace', fontWeight: '700', color: '#0f172a', fontSize: '12px' }}>
                    {formatCurrency(bike.actualSoldPrice || bike.sellingPrice)}
                  </td>
                </tr>

                {isInstallment && plan && (
                  <>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <td colSpan={3} style={{ padding: '10px 8px 10px 20px', color: '#1d4ed8', fontWeight: '600' }}>
                        Initial Down Payment Received (Paid at Booking)
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', fontFamily: 'monospace', fontWeight: '700', color: '#1d4ed8' }}>
                        {formatCurrency(plan.downPayment)}
                      </td>
                    </tr>

                    {plan.payments.map((p, idx) => (
                      <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '10px' }}>
                        <td colSpan={2} style={{ padding: '8px 8px 8px 30px', color: '#64748b' }}>
                          Installment #{idx + 1} — Receipt {p.receiptNumber} ({formatDate(p.paidDate)})
                        </td>
                        <td style={{ padding: '8px', color: '#64748b' }}>
                          Payer: {p.payerName} ({p.paymentMethod})
                        </td>
                        <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'monospace', color: '#059669', fontWeight: '600' }}>
                          {formatCurrency(p.amount)}
                        </td>
                      </tr>
                    ))}

                    <tr style={{ borderTop: '2px solid #cbd5e1', fontWeight: '700' }}>
                      <td colSpan={3} style={{ padding: '12px 8px', color: '#0f172a', fontSize: '12px' }}>
                        Total Amount Received to Date:
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'right', fontFamily: 'monospace', color: '#059669', fontSize: '13px' }}>
                        {formatCurrency(plan.totalPaid)}
                      </td>
                    </tr>

                    <tr style={{ fontWeight: '700' }}>
                      <td colSpan={3} style={{ padding: '10px 8px', color: '#b45309', fontSize: '12px' }}>
                        Outstanding Installment Balance Remaining:
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', fontFamily: 'monospace', color: '#b45309', fontSize: '13px' }}>
                        {formatCurrency(plan.remainingBalance)}
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>

          {/* Status Clearance Box */}
          <div style={{
            backgroundColor: isFullyPaid ? '#d1fae5' : '#fef3c7',
            border: isFullyPaid ? '2px solid #6ee7b7' : '2px solid #fcd34d',
            color: isFullyPaid ? '#065f46' : '#92400e',
            padding: '18px',
            borderRadius: '8px',
            marginBottom: '40px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ fontSize: '20px', marginTop: '2px' }}>
                {isFullyPaid ? '✓' : '⚠'}
              </div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '12px', marginBottom: '6px' }}>
                  {isFullyPaid ? 'VEHICLE NOC & FULL PAYMENT CLEARANCE ISSUED' : 'ACTIVE INSTALLMENT HIRE-PURCHASE AGREEMENT'}
                </div>
                <div style={{ fontSize: '11px', opacity: '0.9' }}>
                  {isFullyPaid 
                    ? '100% payments settled in full. Vehicle registration transfer authorized.'
                    : `Remaining balance of ${formatCurrency(plan?.remainingBalance)} due according to agreed schedule.`}
                </div>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '60px',
            marginTop: '60px',
            paddingTop: '20px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                borderTop: '2px solid #94a3b8', 
                paddingTop: '10px',
                marginBottom: '6px'
              }}>
                <p style={{ fontWeight: '600', color: '#0f172a', fontSize: '11px', margin: '0' }}>
                  Authorized Evee Showroom Officer
                </p>
              </div>
              <p style={{ fontSize: '9px', color: '#64748b', margin: '0' }}>
                Signature & Stamp
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                borderTop: '2px solid #94a3b8', 
                paddingTop: '10px',
                marginBottom: '6px'
              }}>
                <p style={{ fontWeight: '600', color: '#0f172a', fontSize: '11px', margin: '0' }}>
                  Customer / Purchaser
                </p>
              </div>
              <p style={{ fontSize: '9px', color: '#64748b', margin: '0' }}>
                Signature & Acknowledgement
              </p>
            </div>
          </div>

        </div>
        {/* End of scrollable container */}
      </div>
      </div>
    </div>
  );
};
