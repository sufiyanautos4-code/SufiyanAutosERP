import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { StockInventory } from './components/StockInventory';
import { InventoryOverview } from './components/InventoryOverview';
import { ProductEntry } from './components/ProductEntry';
import { ProductDetail } from './components/ProductDetail';
import { ProductSales } from './components/ProductSales';
import { SaleModal } from './components/SaleModal';
import { ReceivePaymentModal } from './components/ReceivePaymentModal';
import { InvoicePrintModal } from './components/InvoicePrintModal';
import { AuthPage } from './components/AuthPage';
import { UserProfileModal } from './components/UserProfileModal';
import { ActiveTab, EveeBike, AuthUser } from './types';
import { 
  exportBikesJSON 
} from './utils/storage';
import { 
  subscribeAuthState, 
  signOutUser, 
  getLocalSessionUser 
} from './services/authService';
import { 
  subscribeBikes, 
  saveBikeToFirestore, 
  deleteBikeFromFirestore, 
  batchSeedBikes, 
  clearAllBikesFromFirestore, 
  recordPaymentTransactionDoc,
  getCachedBikes 
} from './services/firestoreService';
import { SAMPLE_DEMO_BIKES } from './data/initialBikes';
import { Loader2 } from 'lucide-react';
import { debugFirebaseConfig } from './utils/firebaseDebug';

// Run Firebase configuration debug on app load (only in development)
if (import.meta.env.DEV) {
  debugFirebaseConfig();
}

export default function App() {
  // Authentication & Active User State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getLocalSessionUser());
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'signup'>('login');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // Inventory state initialized with cached bikes for the current logged-in user
  const [bikes, setBikes] = useState<EveeBike[]>(() => currentUser ? getCachedBikes(currentUser.id) : []);
  const [activeTab, setActiveTab] = useState<ActiveTab>('stock');

  // Selected Bike for Detail / Inspection
  const [selectedBikeId, setSelectedBikeId] = useState<string | null>(null);
  
  // Editing state for Product Entry
  const [editingBike, setEditingBike] = useState<EveeBike | null>(null);

  // Modals state
  const [isSaleModalOpen, setIsSaleModalOpen] = useState<boolean>(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState<boolean>(false);
  const [activeModalBike, setActiveModalBike] = useState<EveeBike | null>(null);

  // Global Search
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1. Subscribe to Firebase Authentication State
  useEffect(() => {
    const unsubscribeAuth = subscribeAuthState((user, loading) => {
      setCurrentUser(user);
      setIsAuthLoading(loading);
      if (!user) {
        setBikes([]);
        setSelectedBikeId(null);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // 2. Subscribe to Real-Time Cloud Firestore Database (User-Scoped Inventory)
  useEffect(() => {
    if (!currentUser?.id) {
      setBikes([]);
      return;
    }

    const unsubscribeBikes = subscribeBikes(currentUser.id, (cloudBikes) => {
      setBikes(cloudBikes);
    });

    return () => unsubscribeBikes();
  }, [currentUser?.id]);

  // Set default selected bike if not set
  useEffect(() => {
    if (!selectedBikeId && bikes.length > 0) {
      setSelectedBikeId(bikes[0].id);
    }
  }, [bikes, selectedBikeId]);

  // Auth Handlers
  const handleAuthSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
  };

  const handleSignOut = async () => {
    await signOutUser();
    setCurrentUser(null);
    setBikes([]);
    setSelectedBikeId(null);
    setIsProfileModalOpen(false);
    setAuthInitialMode('login');
  };

  const handleSwitchUser = (user: AuthUser) => {
    setCurrentUser(user);
  };

  const handleOpenAuth = (mode: 'login' | 'signup' = 'login') => {
    setAuthInitialMode(mode);
    setIsAuthModalOpen(true);
  };

  // Bike Operations (Optimistic UI + Cloud Firestore Persistence)
  const handleSaveBike = (bikeToSave: EveeBike) => {
    setBikes((prevBikes) => {
      const existsIndex = prevBikes.findIndex(b => b.id === bikeToSave.id);
      if (existsIndex >= 0) {
        const updated = [...prevBikes];
        updated[existsIndex] = bikeToSave;
        return updated;
      } else {
        return [bikeToSave, ...prevBikes];
      }
    });

    setSelectedBikeId(bikeToSave.id);
    setEditingBike(null);

    // Sync to Cloud Firestore
    saveBikeToFirestore(bikeToSave, currentUser).catch(err => {
      console.error('Firestore save error:', err);
    });
  };

  const handleDeleteBike = (bikeId: string) => {
    setBikes(prev => prev.filter(b => b.id !== bikeId));
    if (selectedBikeId === bikeId) {
      const remaining = bikes.filter(b => b.id !== bikeId);
      setSelectedBikeId(remaining.length > 0 ? remaining[0].id : null);
    }

    // Sync deletion to Cloud Firestore
    deleteBikeFromFirestore(bikeId, currentUser).catch(err => {
      console.error('Firestore delete error:', err);
    });
  };

  const handleSelectBikeToView = (bike: EveeBike) => {
    setSelectedBikeId(bike.id);
    setActiveTab('detail');
  };

  const handleEditBike = (bike: EveeBike) => {
    setEditingBike(bike);
    setActiveTab('entry');
  };

  const handleCancelEdit = () => {
    setEditingBike(null);
  };

  const handleOpenSaleModal = (bike?: EveeBike) => {
    if (bike) {
      setActiveModalBike(bike);
    } else {
      const inStock = bikes.find(b => b.status === 'IN_STOCK') || null;
      setActiveModalBike(inStock);
    }
    setIsSaleModalOpen(true);
  };

  const handleOpenReceivePaymentModal = (bike: EveeBike) => {
    setActiveModalBike(bike);
    setIsPaymentModalOpen(true);
  };

  const handleOpenPrintInvoice = (bike: EveeBike) => {
    setActiveModalBike(bike);
    setIsInvoiceModalOpen(true);
  };

  const handleConfirmSale = (updatedBike: EveeBike) => {
    setBikes(prev => prev.map(b => b.id === updatedBike.id ? updatedBike : b));
    setSelectedBikeId(updatedBike.id);

    // Sync sold vehicle + record in sales ledger
    saveBikeToFirestore(updatedBike, currentUser).catch(err => {
      console.error('Firestore sale record error:', err);
    });
  };

  const handlePaymentRecorded = (updatedBike: EveeBike) => {
    setBikes(prev => prev.map(b => b.id === updatedBike.id ? updatedBike : b));
    setSelectedBikeId(updatedBike.id);

    // Sync updated ledger to Cloud Firestore
    saveBikeToFirestore(updatedBike, currentUser).catch(err => {
      console.error('Firestore payment update error:', err);
    });

    // Record relational payment transaction
    const latestPayment = updatedBike.installmentPlan?.payments[updatedBike.installmentPlan.payments.length - 1];
    if (latestPayment) {
      recordPaymentTransactionDoc(updatedBike, latestPayment, currentUser).catch(err => {
        console.warn('Payment transaction log error:', err);
      });
    }
  };

  const handleClearData = () => {
    if (window.confirm('Remove all vehicles and sales data? Your Firestore collection will be completely cleared.')) {
      setBikes([]);
      setSelectedBikeId(null);
      clearAllBikesFromFirestore(currentUser).catch(err => {
        console.error('Firestore clear error:', err);
      });
    }
  };

  const handleResetData = () => {
    if (window.confirm('Load sample Evee demonstration data into Cloud Firestore inventory?')) {
      setBikes(SAMPLE_DEMO_BIKES);
      setSelectedBikeId(SAMPLE_DEMO_BIKES[0]?.id || null);
      batchSeedBikes(SAMPLE_DEMO_BIKES, currentUser).catch(err => {
        console.error('Firestore reset error:', err);
      });
    }
  };

  const handleExportData = () => {
    exportBikesJSON(bikes);
  };

  const handleNewBikeTab = () => {
    setEditingBike(null);
    setActiveTab('entry');
  };

  const inStockBikes = bikes.filter(b => b.status === 'IN_STOCK');

  // Loading state during initial Firebase session verification
  if (isAuthLoading && !currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center font-black text-xl mb-4 shadow-lg animate-pulse">
          E
        </div>
        <div className="flex items-center gap-2 text-slate-300 text-sm font-semibold">
          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          <span>Connecting to Firebase Cloud ERP...</span>
        </div>
      </div>
    );
  }

  // If user is completely signed out, show the Login/Signup portal view
  if (!currentUser) {
    return (
      <AuthPage
        initialMode={authInitialMode}
        onAuthSuccess={handleAuthSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col selection:bg-blue-600 selection:text-white font-sans">
      
      {/* Top Main Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        bikes={bikes}
        currentUser={currentUser}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenAuth={handleOpenAuth}
        onSignOut={handleSignOut}
        onClearData={handleClearData}
        onResetData={handleResetData}
        onExportData={handleExportData}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onQuickSell={() => handleOpenSaleModal()}
        onNewBike={handleNewBikeTab}
      />

      {/* Main Content Area Routing */}
      <main className="flex-1 pb-16">
        {/* TAB 1: Stock Inventory & Types Master Page */}
        {activeTab === 'stock' && (
          <StockInventory
            bikes={bikes}
            onSelectBike={handleSelectBikeToView}
            onNewBike={handleNewBikeTab}
            onSellBike={(bike) => handleOpenSaleModal(bike)}
            onReceivePayment={(bike) => handleOpenReceivePaymentModal(bike)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}

        {/* TAB 2: Fleet Operations & Hub Dashboard */}
        {activeTab === 'inventory' && (
          <InventoryOverview
            bikes={bikes}
            onSelectBike={handleSelectBikeToView}
            onNewBike={handleNewBikeTab}
            onSellBike={(bike) => handleOpenSaleModal(bike)}
            onReceivePayment={(bike) => handleOpenReceivePaymentModal(bike)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}

        {/* TAB 3: Product Entry Page (Chassis & Specs Registry) */}
        {activeTab === 'entry' && (
          <ProductEntry
            existingBikes={bikes}
            onSaveBike={handleSaveBike}
            editingBike={editingBike}
            onCancelEdit={handleCancelEdit}
          />
        )}

        {/* TAB 4: Product Detail Page & Master Inspector */}
        {activeTab === 'detail' && (
          <ProductDetail
            bikes={bikes}
            selectedBikeId={selectedBikeId}
            onSelectBike={(b) => setSelectedBikeId(b.id)}
            onEditBike={handleEditBike}
            onDeleteBike={handleDeleteBike}
            onSellBike={(bike) => handleOpenSaleModal(bike)}
            onReceivePayment={(bike) => handleOpenReceivePaymentModal(bike)}
            onPrintInvoice={(bike) => handleOpenPrintInvoice(bike)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}

        {/* TAB 5: Product Sales Page (Full Payment & Installments) */}
        {activeTab === 'sales' && (
          <ProductSales
            bikes={bikes}
            onSelectBike={handleSelectBikeToView}
            onSellBikeModal={() => handleOpenSaleModal()}
            onReceivePaymentModal={(bike) => handleOpenReceivePaymentModal(bike)}
            onPrintInvoice={(bike) => handleOpenPrintInvoice(bike)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}
      </main>

      {/* Auth Overlay Modal if triggered when already logged in */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md overflow-y-auto">
          <AuthPage
            initialMode={authInitialMode}
            onAuthSuccess={handleAuthSuccess}
            onCancel={() => setIsAuthModalOpen(false)}
          />
        </div>
      )}

      {/* User Profile & Account Switcher Modal */}
      {currentUser && (
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          currentUser={currentUser}
          onSignOut={handleSignOut}
          onSwitchUser={handleSwitchUser}
        />
      )}

      {/* Modals */}
      <SaleModal
        isOpen={isSaleModalOpen}
        onClose={() => setIsSaleModalOpen(false)}
        bike={activeModalBike}
        availableBikes={inStockBikes}
        onConfirmSale={handleConfirmSale}
      />

      <ReceivePaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        bike={activeModalBike}
        onPaymentRecorded={handlePaymentRecorded}
      />

      <InvoicePrintModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        bike={activeModalBike}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-slate-700">Sufiyan Autos ERP • Firebase Cloud & Firestore Live DB</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Real-time multi-model stock balances • Unique Chassis/VIN registry • Hire-Purchase Installment Engine
          </p>
        </div>
      </footer>

    </div>
  );
}
