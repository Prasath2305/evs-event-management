'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Building2, X } from 'lucide-react';

interface Department {
  id: string;
  name: string;
  code: string;
  created_at: string;
  event_count: number;
}

interface DepartmentsClientProps {
  departments: Department[];
}

export function DepartmentsClient({ departments: initialDepts }: DepartmentsClientProps) {
  const router = useRouter();
  const [departments, setDepartments] = useState(initialDepts);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const res = await fetch('/api/super-admin/departments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, code }),
    });

    if (res.ok) {
      const newDept = await res.json();
      setDepartments((prev) => [...prev, { ...newDept, event_count: 0 }].sort((a, b) => a.name.localeCompare(b.name)));
      setName('');
      setCode('');
      setShowForm(false);
      router.refresh();
    } else {
      const body = await res.json();
      setError(body.message || 'Failed to add department');
    }

    setSaving(false);
  };

  const handleDelete = async (id: string, deptName: string) => {
    if (!confirm(`Delete department "${deptName}"? This cannot be undone.`)) return;
    setDeletingId(id);

    const res = await fetch(`/api/super-admin/departments/${id}`, { method: 'DELETE' });

    if (res.ok) {
      setDepartments((prev) => prev.filter((d) => d.id !== id));
      router.refresh();
    } else {
      alert('Failed to delete department. It may have linked events or admins.');
    }

    setDeletingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Departments</h1>
          <p className="text-slate-500 mt-1">Manage academic departments and their event coordinators</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setError(''); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Department
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-violet-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-800">New Department</h2>
            <button onClick={() => { setShowForm(false); setError(''); }} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
          )}

          <form onSubmit={handleAdd} className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Department Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Environmental Science"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              />
            </div>
            <div className="w-32">
              <label className="block text-sm font-medium text-slate-700 mb-1">Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
                maxLength={10}
                placeholder="e.g. EVS"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 uppercase"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 disabled:opacity-60 transition-colors"
            >
              {saving ? 'Saving...' : 'Add'}
            </button>
          </form>
        </div>
      )}

      {/* Departments Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {departments.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No departments yet</p>
            <p className="text-sm text-slate-400 mt-1">Add your first department to get started</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Events</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Added On</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {departments.map((dept) => (
                <tr key={dept.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-violet-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-800">{dept.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                      {dept.code}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{dept.event_count} event{dept.event_count !== 1 ? 's' : ''}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(dept.created_at).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(dept.id, dept.name)}
                      disabled={deletingId === dept.id}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete department"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-xs text-slate-400">
        Note: Departments with linked events or coordinators cannot be deleted until those are removed first.
      </p>
    </div>
  );
}
