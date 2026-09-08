# Audit & Placard Print Fix

## Problem Fixed
When clicking "Print Audit Sheet" or "Print Placard", the browser was printing the entire page (with navigation, filters, and all UI elements) instead of just the audit report or placard content.

## Solution Applied
Replaced all `window.print()` calls with the same JavaScript window approach used for the invoice printing:
1. Opens a new browser window (pop-up)
2. Copies ONLY the specific content (audit or placard)
3. Embeds all CSS styles
4. Prints the new window
5. Auto-closes after printing

## Files Modified

### `src/components/StockInventory.tsx`

#### 1. Audit Print Button (Line ~1110)
- Changed from `onClick={() => window.print()}`
- Now uses JavaScript function that:
  - Extracts `#printable-audit-manifest` content
  - Opens new window with only audit content
  - Embeds all styles for proper formatting
  - Triggers print dialog for the new window

#### 2. Placard Print Button (Line ~1080)
- Changed from `onClick={() => window.print()}`
- Now uses JavaScript function that:
  - Extracts `#printable-placard` content
  - Opens new window with only placard content
  - Uses A5 page size for the placard
  - Triggers print dialog

#### 3. Added IDs for Print Targeting
- Added `id="printable-audit-manifest"` to audit content wrapper
- Added `id="printable-placard"` to placard content wrapper
- Added scrollable container with proper overflow for audit modal

## What Now Prints

### Audit Print (Ctrl+P from Audit Modal)
**Prints ONLY:**
- ✅ Sufiyan Autos header
- ✅ Audit reference and date
- ✅ Summary statistics (total fleet, in-stock, sold, stock value)
- ✅ Model type breakdown table
- ✅ Complete chassis (VIN) audit list with verification checkboxes
- ✅ Signature lines for auditor and manager

**Does NOT print:**
- ❌ Page navigation bar
- ❌ "Stock Inventory" page title
- ❌ Filter buttons and search boxes
- ❌ Any other page UI elements

### Placard Print (from Showroom Display Placard)
**Prints ONLY:**
- ✅ Vehicle model name and color
- ✅ Chassis number (VIN)
- ✅ Motor and battery specifications
- ✅ Range and speed specs
- ✅ Retail price
- ✅ Evee Electric Bikes branding

**Does NOT print:**
- ❌ Page content
- ❌ Modal controls
- ❌ Any UI elements

## Technical Details

### Pop-up Handling
- If pop-ups are blocked, user sees alert: "Please allow pop-ups to print the audit report"
- After allowing pop-ups, clicking print again will work

### Styling
- All CSS rules from the main document are copied to the print window
- Ensures proper colors, fonts, spacing, and layout
- Print-specific styles ensure clean output

### Page Size
- **Audit**: A4 portrait with 0.5in margins
- **Placard**: A5 portrait with 0.25in margins (smaller for display cards)

## Testing Steps

1. **Test Audit Print:**
   - Go to Stock Inventory page
   - Click "Print Stock Audit" button
   - In the audit modal, click "Print Audit Sheet / Save PDF"
   - Verify print preview shows ONLY audit content

2. **Test Placard Print:**
   - Go to Stock Inventory page
   - Click the placard icon next to any bike
   - Click "Print Placard" button
   - Verify print preview shows ONLY the placard content

## Build Status
✅ Build successful - No errors

## Files Changed (Not Yet Committed)
- `src/components/StockInventory.tsx`
- `AUDIT_PRINT_FIX.md` (this file)

---

**REMINDER:** Test these changes before committing/pushing to GitHub.
