import { EveeBike, AuthUser } from '../types';
import { SAMPLE_DEMO_BIKES } from '../data/initialBikes';
import {
  saveBikeToFirestore,
  batchSeedBikes,
  clearAllBikesFromFirestore,
  addShopToFirestore,
  deleteShopFromFirestore,
  updateShopInFirestore,
  getCachedBikes,
  getCachedShops
} from '../services/firestoreService';

export function loadBikesFromStorage(userId?: string | null): EveeBike[] {
  return getCachedBikes(userId);
}

export function saveBikesToStorage(bikes: EveeBike[], userId?: string | null): void {
  if (!userId) return;
  try {
    localStorage.setItem(`evee_inventory_bikes_${userId}`, JSON.stringify(bikes));
  } catch (err) {
    console.error('Error saving bikes to localStorage:', err);
  }
}

export function clearAllInventoryData(currentUser?: AuthUser | null): EveeBike[] {
  if (currentUser?.id) {
    saveBikesToStorage([], currentUser.id);
  }
  clearAllBikesFromFirestore(currentUser).catch(err => {
    console.warn('Firestore clear error:', err);
  });
  return [];
}

export function resetToSampleData(currentUser?: AuthUser | null): EveeBike[] {
  if (currentUser?.id) {
    saveBikesToStorage(SAMPLE_DEMO_BIKES, currentUser.id);
  }
  batchSeedBikes(SAMPLE_DEMO_BIKES, currentUser).catch(err => {
    console.warn('Firestore batch seed error:', err);
  });
  return SAMPLE_DEMO_BIKES;
}

export function exportBikesJSON(bikes: EveeBike[]): void {
  const jsonStr = JSON.stringify(bikes, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `evee-inventory-cloud-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ==========================================
// OWNER-MANAGED SHOPS / BRANCHES STORAGE
// ==========================================

export function loadShopsFromStorage(userId?: string | null): string[] {
  return getCachedShops(userId);
}

export function saveShopsToStorage(shops: string[], userId?: string | null): void {
  if (!userId) return;
  try {
    const cleaned = Array.from(new Set(shops.map(s => s.trim()).filter(Boolean)));
    localStorage.setItem(`evee_owner_shops_${userId}`, JSON.stringify(cleaned));
  } catch (err) {
    console.error('Error saving shops to localStorage:', err);
  }
}

export function addShopToStorage(newShopName: string, currentUser?: AuthUser | null): string[] {
  const current = loadShopsFromStorage(currentUser?.id);
  const trimmed = newShopName.trim();
  if (!trimmed) return current;
  if (!current.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
    const updated = [...current, trimmed];
    if (currentUser?.id) {
      saveShopsToStorage(updated, currentUser.id);
    }
    addShopToFirestore(trimmed, currentUser).catch(err => {
      console.warn('Firestore shop save error:', err);
    });
    return updated;
  }
  return current;
}

// ==========================================
// CUSTOM MODEL NAMES STORAGE
// ==========================================

export function loadCustomModelNames(userId?: string | null): string[] {
  if (!userId) return [];
  try {
    const stored = localStorage.getItem(`evee_custom_models_${userId}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (err) {
    console.error('Error loading custom model names from localStorage:', err);
  }
  return [];
}

export function saveCustomModelNames(models: string[], userId?: string | null): void {
  if (!userId) return;
  try {
    const cleaned = Array.from(new Set(models.map(m => m.trim()).filter(Boolean)));
    localStorage.setItem(`evee_custom_models_${userId}`, JSON.stringify(cleaned));
  } catch (err) {
    console.error('Error saving custom model names to localStorage:', err);
  }
}

export function addCustomModelName(modelName: string, userId?: string | null): string[] {
  const current = loadCustomModelNames(userId);
  const trimmed = modelName.trim();
  if (!trimmed) return current;
  
  // Check if model already exists (case-insensitive)
  if (!current.some(m => m.toLowerCase() === trimmed.toLowerCase())) {
    const updated = [...current, trimmed];
    saveCustomModelNames(updated, userId);
    return updated;
  }
  return current;
}

export function removeCustomModelName(modelName: string, userId?: string | null): string[] {
  const current = loadCustomModelNames(userId);
  const trimmed = modelName.trim();
  const updated = current.filter(m => m.toLowerCase() !== trimmed.toLowerCase());
  saveCustomModelNames(updated, userId);
  return updated;
}

export function updateCustomModelName(oldName: string, newName: string, userId?: string | null): string[] {
  const current = loadCustomModelNames(userId);
  const updated = current.map(m => m.toLowerCase() === oldName.toLowerCase() ? newName.trim() : m);
  saveCustomModelNames(updated, userId);
  return updated;
}
