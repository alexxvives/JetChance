# Seat Availability Management

## Summary
Seat availability is now driven by the `flights.available_seats` column. Bookings reduce this value at creation time so the catalog and flight detail pages reflect the live capacity without additional runtime calculations.

## Approach
- **Single Source of Truth**: `flights.available_seats` stores the remaining seats for each flight.
- **Booking Integration**: During booking creation we verify enough seats remain, then decrement `available_seats` by the number of passengers confirmed.
- **Catalog Display**: Flight endpoints (`GET /api/flights`, `GET /api/flights/:id`) return the stored `available_seats`, ensuring all clients display the same data.
- **Legacy Compatibility**: Both `available_seats` and `seats_available` fields remain in the API responses for existing frontend code.

## Backend Details

### Booking Creation Flow (`POST /api/bookings`)
1. Validate seat availability with `available_seats >= passengers`.
2. Insert the booking and passengers.
3. Update the flight record: `available_seats = available_seats - passenger_count`.

### Flight Queries (`routes/flights.js`)
- Query the `flights` table directly without additional seat joins.
- Return stored seat counts in both list and detail endpoints.
- Continue to expose `total_seats` for reference.

## Operational Considerations
- Existing flights may need a one-time reconciliation (e.g., subtract current bookings) if legacy data predates this approach.
- Future enhancements could include incrementing seats when bookings are cancelled or expired.
- Monitoring: consider alerts if `available_seats` drifts negative, indicating inconsistent data.

## Benefits
1. **Simplicity**: No expensive runtime joins required.
2. **Consistency**: All consumers rely on the same persisted value.
3. **Performance**: Lightweight queries against the flights table.
4. **Extensibility**: Easy to layer additional workflows (cancellations, hold timers) that adjust the same column.

## Next Steps
- Add administrative tools or cron jobs to reconcile seat counts as needed.
- Extend booking lifecycle handling to increment seats on cancellations.
- Capture audit logs whenever seat counts change for traceability.