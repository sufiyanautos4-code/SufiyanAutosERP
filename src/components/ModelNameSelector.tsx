import React, { useState, useRef, useEffect } from 'react';
import { Bike, Plus, X, Pencil, Trash2, Check, ChevronDown } from 'lucide-react';

interface ModelNameSelectorProps {
  currentModel: string;
  onModelChange: (modelName: string) => void;
  availableModels: string[];
  onAddModel: (modelName: string) => void;
  onRemoveModel?: (modelName: string) => void;
  disabled?: boolean;
  error?: string;
}

export const ModelNameSelector: React.FC<ModelNameSelectorProps> = ({
  currentModel,
  onModelChange,
  availableModels,
  onAddModel,
  onRemoveModel,
  disabled = false,
  error = '',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newModelName, setNewModelName] = useState('');
  const [editingModel, setEditingModel] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredModels, setFilteredModels] = useState<string[]>(availableModels);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter models based on input
  useEffect(() => {
    if (currentModel) {
      const filtered = availableModels.filter(model =>
        model.toLowerCase().includes(currentModel.toLowerCase())
      );
      setFilteredModels(filtered);
    } else {
      setFilteredModels(availableModels);
    }
  }, [currentModel, availableModels]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSaveNewModel = () => {
    const trimmed = newModelName.trim();
    if (!trimmed) return;

    // Check for duplicate
    if (availableModels.some(m => m.toLowerCase() === trimmed.toLowerCase())) {
      alert('This model name already exists!');
      return;
    }

    onAddModel(trimmed);
    setNewModelName('');
  };

  const handleRemoveModel = (modelName: string) => {
    if (window.confirm(`Remove "${modelName}" from the list?`)) {
      onRemoveModel?.(modelName);
    }
  };

  const handleStartEdit = (modelName: string) => {
    setEditingModel(modelName);
    setEditValue(modelName);
  };

  const handleCancelEdit = () => {
    setEditingModel(null);
    setEditValue('');
  };

  const handleSaveEdit = () => {
    const trimmed = editValue.trim();
    if (!trimmed || trimmed === editingModel) {
      handleCancelEdit();
      return;
    }

    // Check for duplicate
    if (availableModels.some(m => m !== editingModel && m.toLowerCase() === trimmed.toLowerCase())) {
      alert('This model name already exists!');
      return;
    }

    // Remove old and add new
    if (onRemoveModel) {
      onRemoveModel(editingModel!);
      onAddModel(trimmed);
      
      // If the edited model was currently selected, update selection
      if (currentModel === editingModel) {
        onModelChange(trimmed);
      }
    }

    handleCancelEdit();
  };

  const handleSelectModel = (model: string) => {
    onModelChange(model);
    setShowDropdown(false);
  };

  return (
    <>
      {/* Combo Input with Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={currentModel}
              onChange={(e) => {
                onModelChange(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Type or select model name (e.g. Evee C1, Evee Nisa)..."
              disabled={disabled}
              className={`w-full bg-white border rounded-lg pl-3.5 pr-9 py-2.5 text-xs text-slate-900 focus:outline-none transition ${
                disabled 
                  ? 'bg-slate-100 text-slate-500 cursor-not-allowed' 
                  : error
                  ? 'border-rose-500 focus:border-rose-500'
                  : 'border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              disabled={disabled}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 disabled:opacity-30"
              title="Show suggestions"
            >
              <ChevronDown className="w-4 h-4" />
            </button>

            {/* Dropdown Suggestions */}
            {showDropdown && !disabled && filteredModels.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredModels.map((model) => (
                  <button
                    key={model}
                    type="button"
                    onClick={() => handleSelectModel(model)}
                    className="w-full text-left px-3.5 py-2.5 text-xs text-slate-900 hover:bg-blue-50 transition flex items-center gap-2 border-b border-slate-100 last:border-b-0"
                  >
                    <Bike className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{model}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            disabled={disabled}
            className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 rounded-lg transition flex items-center gap-1.5 border border-slate-300"
            title="Manage Models"
          >
            <Bike className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Management Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 p-5 border-b border-slate-200 shrink-0">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                <Bike className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-slate-900">
                  Manage Model Names
                </h2>
                <p className="text-xs text-slate-500">
                  Add or remove your own showroom or region-specific model names.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Add New Model */}
            <div className="p-5 border-b border-slate-200 shrink-0">
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Add New Model Name:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newModelName}
                  onChange={(e) => setNewModelName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSaveNewModel();
                    }
                  }}
                  placeholder="Enter your model or branch name..."
                  className="flex-1 bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSaveNewModel}
                  disabled={!newModelName.trim()}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Save
                </button>
              </div>
            </div>

            {/* Saved Models List */}
            <div className="flex-1 overflow-y-auto p-5">
              <h3 className="text-xs font-bold text-slate-700 mb-3">
                Your Saved Models ({availableModels.length})
              </h3>
              
              {availableModels.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  <Bike className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No custom models saved yet.</p>
                  <p className="mt-1">Add your first model above.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableModels.map((model) => (
                    <div
                      key={model}
                      className="flex items-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
                    >
                      <Bike className="w-4 h-4 text-slate-400 shrink-0" />
                      
                      {editingModel === model ? (
                        <>
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSaveEdit();
                              } else if (e.key === 'Escape') {
                                handleCancelEdit();
                              }
                            }}
                            className="flex-1 bg-white border border-blue-500 rounded px-2 py-1 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={handleSaveEdit}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded transition"
                            title="Save"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="p-1.5 text-slate-400 hover:bg-slate-200 rounded transition"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="flex-1 text-xs text-slate-900 font-medium">
                            {model}
                          </span>
                          {currentModel === model && (
                            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold">
                              SELECTED
                            </span>
                          )}
                          {onRemoveModel && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleStartEdit(model)}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                                title="Edit"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveModel(model)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                                title="Remove"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-full px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-lg transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
