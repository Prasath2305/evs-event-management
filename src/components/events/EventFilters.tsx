// src/components/events/EventFilters.tsx
'use client';

import { useState } from 'react';
import { Search, Filter, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EVENT_TYPES } from '@/lib/constants';
import { EventFilters as FilterType } from '@/types';

interface EventFiltersProps {
  departments: { id: string; name: string }[];
  onFilterChange: (filters: FilterType) => void;
}

export function EventFilters({ departments, onFilterChange }: EventFiltersProps) {
  const [filters, setFilters] = useState<FilterType>({});
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (key: keyof FilterType, value: string) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-4 mb-8">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
          <input
            type="text"
            placeholder="Search events, themes, venues..."
            className="w-full pl-10 pr-4 py-2.5 bg-emerald-50/50 border border-emerald-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            onChange={(e) => handleChange('searchQuery', e.target.value)}
          />
        </div>

        {/* Quick Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          <select
            className="px-4 py-2.5 bg-emerald-50/50 border border-emerald-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            onChange={(e) => handleChange('dateRange', e.target.value)}
            defaultValue=""
          >
            <option value="">All Time</option>
            <option value="this-week">This Week</option>
            <option value="this-month">This Month</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past Events</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            icon={Filter}
            onClick={() => setIsOpen(!isOpen)}
            className={isOpen ? 'bg-emerald-50' : ''}
          >
            Filters
          </Button>
        </div>
      </div>

      {/* Expanded Filters */}
      {isOpen && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-emerald-100">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
            <select
              className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              onChange={(e) => handleChange('department', e.target.value)}
              defaultValue=""
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Event Type</label>
            <select
              className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              onChange={(e) => handleChange('eventType', e.target.value)}
              defaultValue=""
            >
              <option value="">All Types</option>
              {EVENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <Button
              variant="ghost"
              onClick={() => {
                setFilters({});
                onFilterChange({});
              }}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}