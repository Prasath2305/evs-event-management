// src/components/events/EventCard.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Calendar, MapPin, User, Leaf } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Event } from '@/types';
import { cn, formatDate, formatTime, getEventStatusColor } from '@/lib/utils/helpers';

interface EventCardProps {
  event: Event;
  variant?: 'default' | 'featured';
}

export function EventCard({ event, variant = 'default' }: EventCardProps) {
  const isFeatured = variant === 'featured' || event.is_featured;

  return (
    <Card 
      variant={isFeatured ? 'featured' : 'default'}
      className={cn(
        'group relative flex flex-col h-full',
        isFeatured && 'ring-2 ring-emerald-400 ring-offset-2'
      )}
    >
      {/* Flyer Image */}
      <div className="relative h-48 overflow-hidden bg-emerald-900/5">
        {event.flyer_url ? (
          <Image
            src={event.flyer_url}
            alt={event.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100">
            <Leaf className="w-16 h-16 text-emerald-200" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant={event.status === 'upcoming' ? 'success' : 'default'}>
            {event.status}
          </Badge>
          {isFeatured && (
            <Badge variant="warning" className="flex items-center gap-1">
              <Leaf className="w-3 h-3" /> Featured
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center gap-2 text-sm text-emerald-600 mb-2">
          <span className="font-medium uppercase tracking-wider text-xs">
            {event.event_type.replace('_', ' ')}
          </span>
          {event.departments && (
            <>
              <span className="text-emerald-300">•</span>
              <span className="text-emerald-700">{event.departments.name}</span>
            </>
          )}
        </div>

        <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-emerald-700 transition-colors">
          {event.name}
        </h3>

        {event.theme && (
          <p className="text-sm text-slate-500 mb-3 italic">
            Theme: {event.theme}
          </p>
        )}

        <div className="space-y-2 mt-auto">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar className="w-4 h-4 text-emerald-500" />
            <span>{formatDate(event.date)}</span>
            {event.start_time && (
              <span className="text-slate-400">at {formatTime(event.start_time)}</span>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin className="w-4 h-4 text-emerald-500" />
            <span className="truncate">{event.venue}</span>
          </div>

          {event.resource_person && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <User className="w-4 h-4 text-emerald-500" />
              <span className="truncate">{event.resource_person}</span>
            </div>
          )}
        </div>

        <Link
          href={`/events/${event.id}`}
          className="mt-4 w-full py-2 text-center text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
        >
          View Details →
        </Link>
      </div>
    </Card>
  );
}

