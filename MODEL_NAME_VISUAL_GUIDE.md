# Model Name Field - Visual Guide

## 🎯 One Field, Three Ways to Use

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│  Model Name *          e.g. Evee C1, Evee Nisa        │
│                                                        │
│  ┌──────────────────────────────────────┐  ▼   🚲   │
│  │ Type or select model name...         │            │
│  └──────────────────────────────────────┘            │
│                                                        │
│  Type freely or select from saved models.             │
│  Click bike icon to manage list.                      │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 📝 Way 1: Type Freely (No Saving)

### Step 1: Just Type
```
┌──────────────────────────────────────┐  ▼   🚲
│ Evee Custom Model 2026               │
└──────────────────────────────────────┘
```

### Step 2: Continue Form
```
✓ Model name entered
✓ Continue with chassis, price, etc.
✓ Submit form
```

### Result
```
✓ Bike registered with "Evee Custom Model 2026"
✓ Model NOT saved to list (one-time use)
```

---

## 🎯 Way 2: Select from Suggestions

### Step 1: Start Typing
```
┌──────────────────────────────────────┐  ▼   🚲
│ Evee C                               │
└──────────────────────────────────────┘
  ↓
  Dropdown appears:
```

### Step 2: Dropdown Shows Matches
```
┌──────────────────────────────────────┐
│ 🚲 Evee C1                           │ ← Click
│ 🚲 Evee C1 Air                       │
│ 🚲 Evee Custom X1                    │
└──────────────────────────────────────┘
```

### Step 3: Click Selection
```
┌──────────────────────────────────────┐  ▼   🚲
│ Evee C1                              │
└──────────────────────────────────────┘
✓ Field filled automatically
```

### Result
```
✓ Model selected from saved list
✓ Fast and accurate
```

---

## 💾 Way 3: Manage Saved Models

### Step 1: Click Bike Icon 🚲
```
┌──────────────────────────────────────┐  ▼   🚲 ← Click
│ Evee C1                              │
└──────────────────────────────────────┘
```

### Step 2: Modal Opens
```
╔═════════════════════════════════════════════════╗
║ 🚲 Manage Model Names                      ✕   ║
╠═════════════════════════════════════════════════╣
║ Add New Model Name:                             ║
║ [_____________________________] [+ Save]        ║
╠═════════════════════════════════════════════════╣
║ Your Saved Models (3)                           ║
║                                                  ║
║ 🚲 Evee Sport 2026         ✏️  🗑️            ║
║ 🚲 Evee Custom X1          ✏️  🗑️            ║
║ 🚲 Evee Pro Max            ✏️  🗑️            ║
╠═════════════════════════════════════════════════╣
║                   [Done]                         ║
╚═════════════════════════════════════════════════╝
```

### Actions Available:
```
➕ Add new model → Type + Click "Save"
✏️  Edit model → Click edit → Change → Save
🗑️  Delete model → Click trash → Confirm
```

---

## 🎨 Visual States

### 1. Empty Field (Ready)
```
┌──────────────────────────────────────┐  ▼   🚲
│ Type or select model name...         │
└──────────────────────────────────────┘
```

### 2. Typing (Filtering)
```
┌──────────────────────────────────────┐  ▼   🚲
│ Evee S█                              │
└──────────────────────────────────────┘
  ┌──────────────────────────────────┐
  │ 🚲 Evee Sport 2026               │
  │ 🚲 Evee Special Edition          │
  └──────────────────────────────────┘
```

### 3. Selected (Filled)
```
┌──────────────────────────────────────┐  ▼   🚲
│ Evee C1                              │
└──────────────────────────────────────┘
✓ Ready to continue
```

### 4. Error State
```
┌──────────────────────────────────────┐  ▼   🚲
│                                      │ (red border)
└──────────────────────────────────────┘
⚠️ Model name is required
```

### 5. Disabled (Sold Bike)
```
┌──────────────────────────────────────┐  ▼   🚲
│ Evee C1                              │ (grayed out)
└──────────────────────────────────────┘
🔒 Cannot edit sold bike
```

---

## 🎯 Dropdown Behavior

### Opens When:
```
✓ User clicks dropdown icon (▼)
✓ User starts typing
✓ User focuses input
```

### Closes When:
```
✓ User selects a model
✓ User clicks outside
✓ User presses Escape
```

### Shows:
```
✓ All models (if empty/clicked dropdown)
✓ Filtered models (if typing)
✓ Maximum 10 visible, then scroll
```

---

## 💾 Management Modal Detail

### Add Section (Top)
```
Add New Model Name:
┌─────────────────────────────────┐  ┌─────────┐
│ Type new model name here...     │  │ + Save  │
└─────────────────────────────────┘  └─────────┘
↑ Type here                           ↑ Click to save
```

### List Section (Middle - Scrollable)
```
Your Saved Models (5)

┌──────────────────────────────────────────────┐
│ 🚲 Evee C1                  ✏️  🗑️         │
├──────────────────────────────────────────────┤
│ 🚲 Evee C1 Air             ✏️  🗑️         │
├──────────────────────────────────────────────┤
│ 🚲 Evee Sport 2026         ✏️  🗑️         │
├──────────────────────────────────────────────┤
│ 🚲 Evee Custom X1          ✏️  🗑️         │
├──────────────────────────────────────────────┤
│ 🚲 Evee Pro Max            ✏️  🗑️         │
└──────────────────────────────────────────────┘
       ↑ Scrollable if many models
```

### Edit Mode (When Clicking ✏️)
```
┌──────────────────────────────────────────────┐
│ 🚲 [Evee Sport Limited 2026____] ✓  ✕      │
│                                    ↑  ↑      │
│                                Save Cancel    │
└──────────────────────────────────────────────┘
```

---

## 🎯 Common Scenarios

### Scenario A: New User (No Saved Models)
```
1. Field is empty
2. User types "Evee C1"
3. No dropdown appears (no saved models yet)
4. User continues with form
5. Model used but not saved

Optional:
6. User clicks 🚲 to save "Evee C1" for future
```

### Scenario B: Regular User (Has Saved Models)
```
1. User clicks field
2. Starts typing "Evee"
3. Dropdown shows all "Evee" models
4. User clicks "Evee C1"
5. Field fills
6. Continue with form
```

### Scenario C: Power User (Managing List)
```
1. User clicks 🚲
2. Adds "Evee New Model 2026"
3. Edits "Evee C1" to "Evee C1 2026"
4. Deletes old "Evee Test"
5. Clicks Done
6. All models ready for quick selection
```

---

## 📊 Icon Reference

| Icon | Location | Action |
|------|----------|--------|
| 🚲 | Input right | Open management modal |
| ▼ | Input right | Show/hide dropdown |
| ✏️ | Modal list | Edit model name |
| 🗑️ | Modal list | Delete model |
| ✓ | Edit mode | Save changes |
| ✕ | Edit mode / Modal | Cancel / Close |
| ➕ | Add button | Save new model |

---

## ⌨️ Keyboard Shortcuts

| Key | Action | Where |
|-----|--------|-------|
| **Type** | Filter models | Input field |
| **Enter** | Select highlighted | Dropdown |
| **Escape** | Close dropdown | Dropdown open |
| **Tab** | Next field | Input field |
| **↑ ↓** | Navigate | Dropdown (planned) |

---

## 🎨 Color States

### Normal State
```
Border: Gray (slate-300)
Focus: Blue (blue-500)
Background: White
```

### Error State
```
Border: Red (rose-500)
Focus: Red (rose-500)
Background: White
```

### Disabled State
```
Border: Gray (slate-300)
Background: Light gray (slate-100)
Text: Gray (slate-500)
Cursor: Not allowed
```

### Dropdown Item Hover
```
Background: Light blue (blue-50)
Transition: Smooth
```

---

## 💡 Pro Tips Visualized

### Tip 1: Click ▼ for Full List
```
┌──────────────────────────────────────┐  ▼ ← Click
│                                      │
└──────────────────────────────────────┘
   ↓
Shows ALL saved models (not filtered)
```

### Tip 2: Type to Filter
```
┌──────────────────────────────────────┐
│ Sp█                                  │
└──────────────────────────────────────┘
   ↓
Shows only: "Evee Sport", "Evee Special"
```

### Tip 3: Save Your Top 5-10 Models
```
Save these to list:
✓ Evee C1
✓ Evee C1 Air
✓ Evee Nisa
✓ Evee Gen-Z
✓ Evee Pro

Type these as needed:
○ One-time special models
○ Custom modifications
○ Test entries
```

---

## 🎯 Summary: Simple & Professional

```
ONE FIELD
    ↓
┌─────────────────┐
│  Type freely    │ → Quick entry
│       OR        │
│ Select saved    │ → Fast selection
│       OR        │
│ Manage list     │ → Organization
└─────────────────┘
    ↓
DONE!
```

---

**Clean. Simple. Professional.**

No dual dropdowns. No confusion. Just works.

---

**Version**: 3.0 (Final)  
**Status**: ✅ Production Ready  
**Date**: January 2026
