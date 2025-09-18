import React, { useState } from 'react';

export default function BookingForm({ flightId, onSubmit }) {
  const [seats, setSeats] = useState(1);
  return (
    <form className="flex flex-col gap-4" onSubmit={e => { e.preventDefault(); onSubmit(seats); }}>
      <label className="font-medium">Seats to reserve:</label>
      <input type="number" min={1} max={12} value={seats} onChange={e => setSeats(e.target.value)} className="border rounded-lg px-3 py-2" />
      <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold">Book Flight</button>
    </form>
  );
}
