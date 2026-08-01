import React, { useState } from "react";
import { Search, Filter, X, Calendar, MapPin, Tag, SlidersHorizontal, RotateCcw } from "lucide-react";
import { SmartInput } from "./SmartInput";

export interface FilterOption {
  key: string;
  label: string;
  options: { label: string; value: string }[];
}

export interface SmartSearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilters: Record<string, string>;
  onFilterChange: (filterKey: string, value: string) => void;
  onResetFilters: () => void;
  filterOptions?: FilterOption[];
  placeholder?: string;
  historyKey?: string;
  suggestions?: string[];
  className?: string;
}

export function SmartSearchFilter({
  searchQuery,
  onSearchChange,
  activeFilters,
  onFilterChange,
  onResetFilters,
  filterOptions = [],
  placeholder = "Search records, emergency types, locations...",
  historyKey = "global_search",
  suggestions = [],
  className = ""
}: SmartSearchFilterProps) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const activeFilterCount = Object.values(activeFilters).filter(v => v && v !== "all").length;

  return (
    <div className={`space-y-4 w-full ${className}`}>
      
      {/* Search Input Bar & Mobile Filter Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1">
          <SmartInput
            value={searchQuery}
            onChange={onSearchChange}
            placeholder={placeholder}
            historyKey={historyKey}
            suggestions={suggestions}
            showVoiceInput={true}
            enableAIIntent={true}
          />
        </div>

        {filterOptions.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className={`px-4 py-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                activeFilterCount > 0
                  ? "bg-amber-500 text-black border-amber-500 shadow-md"
                  : "bg-surface-50 dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white hover:bg-surface-100"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] flex items-center justify-center font-black">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={onResetFilters}
                className="p-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-500 hover:text-red-500 transition-colors"
                title="Reset Filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Expandable Filter Controls */}
      {filterOptions.length > 0 && showMobileFilters && (
        <div className="p-4 rounded-2xl bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-surface-200 dark:border-surface-800 pb-2">
            <span className="text-xs font-black uppercase tracking-wider text-surface-500">Refine Search Results</span>
            <button
              onClick={onResetFilters}
              className="text-[11px] font-bold text-amber-500 hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset All
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {filterOptions.map((filter) => (
              <div key={filter.key} className="space-y-1">
                <label className="text-[11px] font-bold text-surface-600 dark:text-surface-400">
                  {filter.label}
                </label>
                <select
                  value={activeFilters[filter.key] || "all"}
                  onChange={(e) => onFilterChange(filter.key, e.target.value)}
                  className="w-full bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-3 py-2 text-xs font-bold text-surface-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {filter.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
