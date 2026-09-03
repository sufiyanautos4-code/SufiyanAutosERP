import { EveeBike, ModelStockSummary } from '../types';

export function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return 'Rs. 0';
  return `Rs. ${Math.round(amount).toLocaleString('en-US')}`;
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function generateChassisNumber(modelName: string): string {
  const code = modelName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase();
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `EVEE-PK-${year}-${code}-${randomNum}`;
}

export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `INV-EVEE-${year}-${randomNum}`;
}

export function generateReceiptNumber(): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `RCPT-${randomNum}`;
}

export function calculateModelSummaries(bikes: EveeBike[]): ModelStockSummary[] {
  const modelMap = new Map<string, {
    totalAcquired: number;
    inStockCount: number;
    soldCount: number;
    soldFullCount: number;
    soldInstallmentCount: number;
    totalCostInvested: number;
    totalRevenueGenerated: number;
    colors: Set<string>;
  }>();

  for (const bike of bikes) {
    const model = bike.modelName || 'Other';
    if (!modelMap.has(model)) {
      modelMap.set(model, {
        totalAcquired: 0,
        inStockCount: 0,
        soldCount: 0,
        soldFullCount: 0,
        soldInstallmentCount: 0,
        totalCostInvested: 0,
        totalRevenueGenerated: 0,
        colors: new Set<string>(),
      });
    }

    const entry = modelMap.get(model)!;
    entry.totalAcquired += 1;
    entry.totalCostInvested += bike.purchasePrice || 0;
    if (bike.color) entry.colors.add(bike.color);

    if (bike.status === 'IN_STOCK') {
      entry.inStockCount += 1;
    } else {
      entry.soldCount += 1;
      if (bike.status === 'SOLD_FULL') {
        entry.soldFullCount += 1;
        entry.totalRevenueGenerated += bike.actualSoldPrice || bike.sellingPrice;
      } else if (bike.status === 'SOLD_INSTALLMENT') {
        entry.soldInstallmentCount += 1;
        // Total money collected so far for installment
        const collected = bike.installmentPlan?.totalPaid ?? (bike.installmentPlan?.downPayment || 0);
        entry.totalRevenueGenerated += collected;
      }
    }
  }

  const summaries: ModelStockSummary[] = [];
  modelMap.forEach((val, modelName) => {
    let stockHealth: 'Healthy' | 'Low Stock' | 'Out of Stock' = 'Healthy';
    if (val.inStockCount === 0) {
      stockHealth = 'Out of Stock';
    } else if (val.inStockCount <= 2) {
      stockHealth = 'Low Stock';
    }

    summaries.push({
      modelName,
      totalAcquired: val.totalAcquired,
      inStockCount: val.inStockCount,
      soldCount: val.soldCount,
      soldFullCount: val.soldFullCount,
      soldInstallmentCount: val.soldInstallmentCount,
      totalCostInvested: val.totalCostInvested,
      totalRevenueGenerated: val.totalRevenueGenerated,
      availableColors: Array.from(val.colors),
      stockHealth,
    });
  });

  // Sort by in stock desc
  return summaries.sort((a, b) => b.inStockCount - a.inStockCount);
}
