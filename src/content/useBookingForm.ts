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

// Booking form state + mailto composition, shared by the /booking page and the
// club Booking section so the logic lives in exactly one place.
export function useBookingForm() {
  const [formData, setFormData] = useState<BookingFormData>(EMPTY);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(
      `Booking Inquiry — ${formData.eventType || 'Event'} on ${formData.eventDate || 'TBD'}`,
    );
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\nDate: ${formData.eventDate}\nVenue: ${formData.venue}\nEvent Type: ${formData.eventType}\n\nDetails:\n${formData.details}`,
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  return { formData, submitted, handleChange, handleSubmit };
}
