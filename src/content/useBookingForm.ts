import { useState, type ChangeEvent, type FormEvent } from 'react';
import { CONTACT_EMAIL } from './socials';

export interface BookingFormData {
  name: string;
  email: string;
  eventDate: string;
  venue: string;
  eventType: string;
  details: string;
}

const EMPTY: BookingFormData = {
  name: '',
  email: '',
  eventDate: '',
  venue: '',
  eventType: '',
  details: '',
};

export type BookingStatus = 'idle' | 'submitting' | 'success' | 'error';

// Formspree (or Getform) endpoint, e.g. https://formspree.io/f/xxxxxxxx.
// When unset (local dev, or before the form is provisioned), we fall back to a
// mailto: hand-off so the button still does something instead of silently failing.
const ENDPOINT = import.meta.env.VITE_BOOKING_FORM_ENDPOINT || '';

function buildMailto(data: BookingFormData): string {
  const subject = encodeURIComponent(
    `Booking Inquiry — ${data.eventType || 'Event'} on ${data.eventDate || 'TBD'}`,
  );
  const body = encodeURIComponent(
    `Name: ${data.name}\nEmail: ${data.email}\nDate: ${data.eventDate}\nVenue: ${data.venue}\nEvent Type: ${data.eventType}\n\nDetails:\n${data.details}`,
  );
  return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
}

// Booking form state + submission, shared by the /booking page and the club
// Booking section so the logic lives in exactly one place.
export function useBookingForm() {
  const [formData, setFormData] = useState<BookingFormData>(EMPTY);
  const [status, setStatus] = useState<BookingStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // No backend configured → keep the legacy mailto hand-off.
    if (!ENDPOINT) {
      window.location.href = buildMailto(formData);
      setStatus('success');
      return;
    }

    setStatus('submitting');
    setError(null);
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          _subject: `Booking Inquiry — ${formData.eventType || 'Event'} on ${formData.eventDate || 'TBD'}`,
        }),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setStatus('error');
    }
  };

  return {
    formData,
    status,
    error,
    submitting: status === 'submitting',
    // Retained for existing call sites; true once the inquiry has been handed off.
    submitted: status === 'success',
    // True when there's no backend and we fall back to the visitor's mail client,
    // so the UI can show the right success copy.
    usesEmailClient: !ENDPOINT,
    handleChange,
    handleSubmit,
  };
}
