// src/components/reports/EventReport.tsx
'use client';

import { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Download, Calendar, MapPin, User, Users, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Event } from '@/types';
import { formatDate, formatTime } from '@/lib/utils/helpers';

interface EventReportProps {
  event: Event;
}

export function EventReport({ event }: EventReportProps) {
  const reportRef = useRef<HTMLDivElement>(null);

  const generatePDF = async () => {
    if (!reportRef.current) return;

    const canvas = await html2canvas(reportRef.current, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${event.name.replace(/\s+/g, '_')}_Report.pdf`);
  };

  return (
    <div>
      <Button
        onClick={generatePDF}
        icon={Download}
        className="mb-4"
      >
        Download Report PDF
      </Button>

      <div
        ref={reportRef}
        className="bg-white p-8 max-w-4xl mx-auto"
        style={{ width: '210mm', minHeight: '297mm' }}
      >
        {/* Header */}
        <div className="border-b-4 border-emerald-600 pb-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-600 rounded-full">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-emerald-900">Environmental Studies</h1>
              <p className="text-emerald-600">Event Management Portal</p>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mt-4">{event.name}</h2>
          <p className="text-lg text-slate-500 mt-1">Event Report</p>
        </div>

        {/* Event Details */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-emerald-600 mt-0.5" />
              <div>
                <p className="text-sm text-slate-500">Date & Time</p>
                <p className="font-medium text-slate-800">{formatDate(event.date)}</p>
                {event.start_time && (
                  <p className="text-slate-600">
                    {formatTime(event.start_time)} - {event.end_time ? formatTime(event.end_time) : 'TBD'}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-emerald-600 mt-0.5" />
              <div>
                <p className="text-sm text-slate-500">Venue</p>
                <p className="font-medium text-slate-800">{event.venue}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-emerald-600 mt-0.5" />
              <div>
                <p className="text-sm text-slate-500">Resource Person</p>
                <p className="font-medium text-slate-800">{event.resource_person || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-emerald-600 mt-0.5" />
              <div>
                <p className="text-sm text-slate-500">Participation</p>
                <p className="font-medium text-slate-800">
                  {event.actual_participants} / {event.expected_participants} attended
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Theme & Description */}
        {event.theme && (
          <div className="bg-emerald-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-emerald-600 font-medium mb-1">Theme</p>
            <p className="text-lg text-emerald-900 italic">"{event.theme}"</p>
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Event Description</h3>
          <p className="text-slate-600 leading-relaxed">
            {event.description || 'No description provided.'}
          </p>
        </div>

        {event.resource_person_bio && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800 mb-2">About the Resource Person</h3>
            <p className="text-slate-600 leading-relaxed">{event.resource_person_bio}</p>
          </div>
        )}

        {/* Flyer */}
        {event.flyer_url && (
          <div className="mt-8">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Event Flyer</h3>
            <img
              src={event.flyer_url}
              alt="Event Flyer"
              className="max-w-md rounded-lg shadow-md"
            />
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-slate-200 text-center text-sm text-slate-400">
          <p>Generated by EVS Event Management Portal</p>
          <p>{new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}