export type VehicleStatus = 'IN_STOCK' | 'SOLD_FULL' | 'SOLD_INSTALLMENT';

export type InstallmentStatus = 'ACTIVE' | 'PAID' | 'OVERDUE';

export interface InstallmentPayment {
  id: string;
  amount: number;
  paidDate: string;
  payerName: string;
  receivedByName: string;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Cheque' | 'Online / Raast';
  receiptNumber: string;
  shopName?: string;
  notes?: string;
  receivedByUserId?: string;
  createdAt?: string;
}

export interface CustomerDetails {
  fullName: string;
  phone: string;
  cnicOrId?: string;
  address?: string;
  city?: string;
  emergencyContact?: string;
  fatherOrHusbandName?: string;
  guarantor1Name?: string;
  guarantor1Phone?: string;
  guarantor2Name?: string;
  guarantor2Phone?: string;
}

export interface InstallmentPlan {
  totalSalePrice: number;
  downPayment: number;
  installmentBalance: number; // Initially: totalSalePrice - downPayment
  totalPaid: number; // downPayment + sum(payments)
  remainingBalance: number; // totalSalePrice - totalPaid
  monthlyInstallmentEstimate?: number;
  totalTenureMonths?: number;
  startDate: string;
  status: InstallmentStatus; // 'ACTIVE' or 'PAID' (when remainingBalance <= 0)
  payments: InstallmentPayment[];
}

export interface EveeBike {
  id: string;
  chassisNumber: string; // Unique Chassis / Frame Number
  modelName: string; // e.g. 'Evee C1', 'Evee C1 Air', 'Evee Nisa', 'Evee Gen-Z', 'Evee Pro'
  customBikeName?: string;
  color: string;
  purchasePrice: number; // Price bought from manufacturer/company
  sellingPrice: number; // Retail selling price
  engineMotorDetails: string; // e.g. '1200W Bosch Motor, 72V 30Ah Graphene Battery'
  motorPowerWatts?: number; // e.g. 1200
  batteryCapacity?: string; // e.g. '72V 30Ah Graphene' or '60V 20Ah Lithium'
  maxSpeedKmH?: number; // e.g. 60
  rangeKm?: number; // e.g. 80
  status: VehicleStatus;
  entryDate: string;
  notes?: string;
  
  // Sales Info (populated if sold)
  saleDate?: string;
  saleType?: 'FULL_PAYMENT' | 'INSTALLMENT';
  saleInvoiceNumber?: string;
  actualSoldPrice?: number;
  shopName?: string; // Shop or Branch location where vehicle was sold / assigned
  saleShopName?: string; // Alias for shopName
  customer?: CustomerDetails;
  installmentPlan?: InstallmentPlan;

  // Cloud & Audit metadata
  createdBy?: string;
  createdByName?: string;
  soldByUserId?: string;
  soldByUserName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ModelStockSummary {
  modelName: string;
  totalAcquired: number;
  inStockCount: number;
  soldCount: number;
  soldFullCount: number;
  soldInstallmentCount: number;
  totalCostInvested: number;
  totalRevenueGenerated: number;
  availableColors: string[];
  stockHealth: 'Healthy' | 'Low Stock' | 'Out of Stock';
}

export type UserRole = 'SUPER_ADMIN' | 'SHOWROOM_MANAGER' | 'SALES_OFFICER' | 'ACCOUNTS_CASHIER';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: UserRole;
  roleTitle?: string;
  shopLocation?: string;
  avatarBg?: string;
  photoURL?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface ShopRecord {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  createdBy?: string;
  createdByName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SaleTransactionRecord {
  id: string;
  invoiceNumber: string;
  bikeId: string;
  chassisNumber: string;
  modelName: string;
  color: string;
  saleType: 'FULL_PAYMENT' | 'INSTALLMENT';
  totalPrice: number;
  downPayment: number;
  remainingBalance: number;
  customer: CustomerDetails;
  shopName: string;
  soldByUserId?: string;
  soldByUserName?: string;
  saleDate: string;
  createdAt: string;
}

export interface PaymentTransactionRecord {
  id: string;
  receiptNumber: string;
  bikeId: string;
  chassisNumber: string;
  modelName: string;
  amount: number;
  payerName: string;
  paymentMethod: string;
  receivedByUserId?: string;
  receivedByName: string;
  paymentDate: string;
  shopName?: string;
  notes?: string;
  createdAt: string;
}

export type ActiveTab = 'stock' | 'inventory' | 'entry' | 'detail' | 'sales';

