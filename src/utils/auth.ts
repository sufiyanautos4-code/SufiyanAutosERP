import { AuthUser, UserRole } from '../types';
export {
  ROLE_LABELS,
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  signOutUser,
  sendPasswordReset,
  updateUserProfile,
  subscribeAuthState,
  getLocalSessionUser as getActiveSessionUser,
  saveLocalSessionUser as setActiveSessionUser,
  clearLocalSessionUser,
  getFriendlyAuthErrorMessage
} from '../services/authService';

// Default pre-seeded demo accounts for quick testing
export const DEMO_TEST_CREDENTIALS = [
  {
    email: 'admin@evee.pk',
    role: 'SUPER_ADMIN' as UserRole,
    roleTitle: 'Super Administrator',
    description: 'Full ERP control, inventory management, global reports & shops management'
  },
  {
    email: 'manager@evee.pk',
    role: 'SHOWROOM_MANAGER' as UserRole,
    roleTitle: 'Showroom & Branch Manager',
    description: 'Vehicle entries, pricing overrides, customer invoicing & installments'
  },
  {
    email: 'sales@evee.pk',
    role: 'SALES_OFFICER' as UserRole,
    roleTitle: 'Sales & Leasing Officer',
    description: 'Direct sales booking, customer profiles, hire-purchase agreements'
  }
];
