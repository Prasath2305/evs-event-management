// src/components/admin/events/CreateEventForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Users, 
  Tag, 
  FileImage, 
  AlignLeft,
  Type,
  Building2,
  Sparkles,
  Save,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ImageUpload } from '@/components/admin/events/ImageUpload';
import { Department } from '@/types/supabase';
import { cn } from '@/lib/utils/helpers';

type DeptOption = Pick<Department, 'id' | 'name' | 'code'>;

const eventSchema = z.object({
  name: z.string().min(3, 'Event name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  date: z.string().min(1, 'Date is required'),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  venue: z.string().min(3, 'Venue is required'),
  theme: z.string().optional(),
  resource_person: z.string().min(2, 'Resource person name is required'),
  resource_person_bio: z.string().optional(),
  department_id: z.string().uuid('Please select a department'),
  event_type: z.enum([
    'workshop',
    'seminar',
    'conference',
    'webinar',
    'competition',
    'field_visit',
    'awareness_campaign',
    'tree_plantation',
    'cleanliness_drive',
    'other'
  ]),
  expected_participants: z.number().min(1, 'Expected participants must be at least 1'),
  is_featured: z.boolean().optional().default(false),
});

type EventFormData = z.infer<typeof eventSchema>;

interface CreateEventFormProps {
  departments: DeptOption[];
  lockedDepartmentId?: string | null;
}

const eventTypes = [
  { value: 'workshop', label: 'Workshop', color: 'bg-blue-100 text-blue-800' },
  { value: 'seminar', label: 'Seminar', color: 'bg-purple-100 text-purple-800' },
  { value: 'conference', label: 'Conference', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'webinar', label: 'Webinar', color: 'bg-cyan-100 text-cyan-800' },
  { value: 'competition', label: 'Competition', color: 'bg-amber-100 text-amber-800' },
  { value: 'field_visit', label: 'Field Visit', color: 'bg-green-100 text-green-800' },
  { value: 'awareness_campaign', label: 'Awareness Campaign', color: 'bg-pink-100 text-pink-800' },
  { value: 'tree_plantation', label: 'Tree Plantation', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'cleanliness_drive', label: 'Cleanliness Drive', color: 'bg-teal-100 text-teal-800' },
  { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800' },
];

export function CreateEventForm({ departments, lockedDepartmentId }: CreateEventFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [flyerFile, setFlyerFile] = useState<File | null>(null);
  const [flyerPreview, setFlyerPreview] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<EventFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(eventSchema) as Resolver<EventFormData, any>,
    defaultValues: {
      expected_participants: 50,
      is_featured: false,
      department_id: lockedDepartmentId || undefined,
    },
  });

  // Keep locked department set on mount
  useEffect(() => {
    if (lockedDepartmentId) {
      setValue('department_id', lockedDepartmentId);
    }
  }, [lockedDepartmentId, setValue]);

  const selectedEventType = watch('event_type');
  const selectedDepartment = watch('department_id');

  const onSubmit = async (data: EventFormData) => {
    setIsSubmitting(true);
    
    try {
      // 1. Create event first
      const eventResponse = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!eventResponse.ok) {
        const error = await eventResponse.json();
        throw new Error(error.message || 'Failed to create event');
      }

      const event = await eventResponse.json();

      // 2. Upload flyer if provided
      if (flyerFile && event.id) {
        const formData = new FormData();
        formData.append('file', flyerFile);
        formData.append('eventId', event.id);

        const uploadResponse = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          toast.error('Event created but flyer upload failed');
        }
      }

      toast.success('Event created successfully!');
      reset();
      setFlyerFile(null);
      setFlyerPreview(null);
      
      // Redirect to events list
      router.push('/admin/events');
      router.refresh();
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageSelect = (file: File, preview: string) => {
    setFlyerFile(file);
    setFlyerPreview(preview);
  };

  const handleImageRemove = () => {
    setFlyerFile(null);
    setFlyerPreview(null);
  };

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Type className="w-5 h-5 text-emerald-600" />
              Basic Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Event Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('name')}
                  type="text"
                  placeholder="e.g., Annual Tree Plantation Drive 2024"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  placeholder="Describe the event, its objectives, and what participants can expect..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Theme
                </label>
                <input
                  {...register('theme')}
                  type="text"
                  placeholder="e.g., Sustainable Future: Act Now"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
          </Card>

          {/* Date & Time */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              Date & Time
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('date')}
                  type="date"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Start Time
                </label>
                <input
                  {...register('start_time')}
                  type="time"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  End Time
                </label>
                <input
                  {...register('end_time')}
                  type="time"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
          </Card>

          {/* Location & Resource Person */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              Location & Speaker
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Venue <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('venue')}
                  type="text"
                  placeholder="e.g., Main Auditorium, Block A"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                {errors.venue && (
                  <p className="mt-1 text-sm text-red-600">{errors.venue.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Resource Person <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      {...register('resource_person')}
                      type="text"
                      placeholder="Speaker name"
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  {errors.resource_person && (
                    <p className="mt-1 text-sm text-red-600">{errors.resource_person.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Expected Participants <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      {...register('expected_participants', { valueAsNumber: true })}
                      type="number"
                      min="1"
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  {errors.expected_participants && (
                    <p className="mt-1 text-sm text-red-600">{errors.expected_participants.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Resource Person Bio
                </label>
                <textarea
                  {...register('resource_person_bio')}
                  rows={3}
                  placeholder="Brief biography and credentials of the speaker..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Classification */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-emerald-600" />
              Classification
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Department <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    {...register('department_id')}
                    disabled={!!lockedDepartmentId}
                    className={cn(
                      'w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white',
                      lockedDepartmentId && 'opacity-70 cursor-not-allowed bg-slate-50'
                    )}
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                </div>
                {lockedDepartmentId && (
                  <p className="text-xs text-slate-400 mt-1">Department is fixed to your assigned department.</p>
                )}
                {errors.department_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.department_id.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Event Type <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('event_type')}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
                >
                  <option value="">Select Type</option>
                  {eventTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.event_type && (
                  <p className="mt-1 text-sm text-red-600">{errors.event_type.message}</p>
                )}
              </div>

              {selectedEventType && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">Selected:</span>
                  <span className={cn(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    eventTypes.find(t => t.value === selectedEventType)?.color
                  )}>
                    {eventTypes.find(t => t.value === selectedEventType)?.label}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Featured Toggle */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              Visibility
            </h2>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                {...register('is_featured')}
                type="checkbox"
                className="w-5 h-5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
              />
              <div>
                <p className="font-medium text-slate-700">Feature this event</p>
                <p className="text-sm text-slate-500">Show on homepage</p>
              </div>
            </label>
          </Card>

          {/* Flyer Upload */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <FileImage className="w-5 h-5 text-emerald-600" />
              Event Flyer
            </h2>
            
            <ImageUpload
              onImageSelect={handleImageSelect}
              onImageRemove={handleImageRemove}
              preview={flyerPreview}
            />
            <p className="mt-2 text-xs text-slate-500">
              Recommended: 1200 x 630px, max 5MB
            </p>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Button
              type="submit"
              isLoading={isSubmitting}
              icon={Save}
              className="w-full"
            >
              {isSubmitting ? 'Creating...' : 'Create Event'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              icon={X}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}