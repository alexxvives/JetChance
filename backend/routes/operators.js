const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const db = require('../config/database-sqlite');

const router = express.Router();

// @route   GET /api/operators
// @desc    Get all operators with their flight statistics
// @access  Private (Admin/Super Admin only)
router.get('/', authenticate, authorize(['admin', 'super-admin']), async (req, res) => {
  try {
    console.log('🔄 Fetching all operators...');

    // Get all operators with their user information
    const operatorsQuery = `
      SELECT 
        o.id as operator_id,
        o.company_name,
        o.total_flights,
        o.created_at,
        u.id as user_id,
        u.email,
        u.role
      FROM operators o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `;

    const operatorsResult = await db.query(operatorsQuery);

    // For each operator, get their flight statistics
    const operatorsWithStats = await Promise.all(
      operatorsResult.rows.map(async (operator) => {
        // Get flight statistics for this operator using the actual operator.id, not user_id
        const flightStatsQuery = `
          SELECT 
            COUNT(*) as total_flights,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_flights,
            SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_flights,
            SUM(CASE WHEN status = 'declined' THEN 1 ELSE 0 END) as declined_flights,
            SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available_flights,
            SUM(CASE WHEN status = 'booked' THEN 1 ELSE 0 END) as booked_flights,
            SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_flights
          FROM flights 
          WHERE operator_id = ?
        `;

        const flightStatsResult = await db.query(flightStatsQuery, [operator.operator_id]);
        const flightStats = flightStatsResult.rows[0];

        // Get booking statistics for this operator using the actual operator.id
        const bookingStatsQuery = `
          SELECT 
            COUNT(DISTINCT b.id) as total_bookings,
            SUM(CASE WHEN b.status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_bookings,
            SUM(CASE WHEN b.status = 'pending' THEN 1 ELSE 0 END) as pending_bookings,
            SUM(CASE WHEN b.status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_bookings,
            COALESCE(SUM(CASE WHEN b.status = 'confirmed' THEN b.total_amount ELSE 0 END), 0) as total_revenue
          FROM bookings b
          JOIN flights f ON b.flight_id = f.id
          WHERE f.operator_id = ?
        `;

        const bookingStatsResult = await db.query(bookingStatsQuery, [operator.operator_id]);
        const bookingStats = bookingStatsResult.rows[0];

        return {
          ...operator,
          // Add default status since users table doesn't have status
          status: 'active', // Assume all registered operators are active for now
          first_name: 'N/A', // Users table doesn't have first_name
          last_name: 'N/A',  // Users table doesn't have last_name
          flightStats: {
            total: flightStats?.total_flights || 0,
            pending: flightStats?.pending_flights || 0,
            approved: flightStats?.approved_flights || 0,
            declined: flightStats?.declined_flights || 0,
            available: flightStats?.available_flights || 0,
            booked: flightStats?.booked_flights || 0,
            cancelled: flightStats?.cancelled_flights || 0
          },
          bookingStats: {
            total: bookingStats?.total_bookings || 0,
            confirmed: bookingStats?.confirmed_bookings || 0,
            pending: bookingStats?.pending_bookings || 0,
            cancelled: bookingStats?.cancelled_bookings || 0,
            totalRevenue: bookingStats?.total_revenue || 0
          }
        };
      })
    );

    console.log(`✅ Found ${operatorsWithStats.length} operators`);
    res.json({
      success: true,
      operators: operatorsWithStats
    });

  } catch (error) {
    console.error('❌ Error fetching operators:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch operators'
    });
  }
});

// @route   GET /api/operators/pending
// @desc    Get pending operators for approval (returns empty for now since no status system)
// @access  Private (Admin/Super Admin only)
router.get('/pending', authenticate, authorize(['admin', 'super-admin']), async (req, res) => {
  try {
    console.log('🔄 Fetching pending operators...');

    // Since the users table doesn't have a status column, 
    // we'll return an empty array for now or implement a different logic
    // You could check for operators with 0 flights or recent registrations
    
    const query = `
      SELECT 
        o.id as operator_id,
        o.company_name,
        o.created_at,
        u.id as user_id,
        u.email,
        u.role
      FROM operators o
      JOIN users u ON o.user_id = u.id
      WHERE o.total_flights = 0
      AND datetime(o.created_at) > datetime('now', '-7 days')
      ORDER BY o.created_at DESC
    `;

    const result = await db.query(query);

    const formattedOperators = result.rows.map(operator => ({
      id: operator.user_id,
      operatorId: operator.operator_id,
      firstName: 'N/A', // Users table doesn't have first_name
      lastName: 'N/A',  // Users table doesn't have last_name
      email: operator.email,
      companyName: operator.company_name,
      status: 'pending', // Simulated status for new operators
      role: operator.role,
      createdAt: operator.created_at
    }));

    console.log(`✅ Found ${formattedOperators.length} pending operators`);
    res.json({
      success: true,
      operators: formattedOperators
    });

  } catch (error) {
    console.error('❌ Error fetching pending operators:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pending operators'
    });
  }
});

// @route   GET /api/operators/:operatorId/flights
// @desc    Get flights for a specific operator
// @access  Private (Admin/Super Admin only)
router.get('/:operatorId/flights', authenticate, authorize(['admin', 'super-admin']), async (req, res) => {
  try {
    const { operatorId } = req.params; // This is actually the user_id
    console.log(`🔄 Fetching flights for operator user_id ${operatorId}...`);

    // First, get the actual operator.id from the user_id
    const operatorLookupQuery = `
      SELECT id FROM operators WHERE user_id = ?
    `;
    const operatorLookupResult = await db.query(operatorLookupQuery, [operatorId]);
    
    if (!operatorLookupResult.rows.length) {
      return res.status(404).json({
        success: false,
        error: 'Operator not found'
      });
    }

    const actualOperatorId = operatorLookupResult.rows[0].id;
    console.log(`📋 Using actual operator_id ${actualOperatorId} for user_id ${operatorId}`);

    const query = `
      SELECT 
        f.id,
        SUBSTR(f.origin_name, INSTR(f.origin_name, '(') + 1, INSTR(f.origin_name, ')') - INSTR(f.origin_name, '(') - 1) as origin_code,
        SUBSTR(f.destination_name, INSTR(f.destination_name, '(') + 1, INSTR(f.destination_name, ')') - INSTR(f.destination_name, '(') - 1) as destination_code,
        f.departure_datetime as departure,
        f.arrival_datetime as arrival,
        f.status,
        f.available_seats as seats_available,
        f.total_seats,
        f.aircraft_model as aircraft_name,
        f.created_at,
        COUNT(b.id) as booking_count,
        SUM(CASE WHEN b.status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_bookings,
        SUM(CASE WHEN b.status = 'confirmed' THEN b.total_amount ELSE 0 END) as total_revenue
      FROM flights f
      LEFT JOIN bookings b ON f.id = b.flight_id
      WHERE f.operator_id = ?
      GROUP BY f.id
      ORDER BY f.departure_datetime DESC
    `;

    const result = await db.query(query, [actualOperatorId]);
    const flights = result.rows;

    // Add derived status based on bookings
    const flightsWithStatus = flights.map(flight => {
      let derivedStatus = flight.status;
      
      if (flight.booking_count > 0) {
        if (flight.confirmed_bookings === 0) {
          derivedStatus = 'pending_bookings';
        } else if (flight.seats_available > 0) {
          derivedStatus = 'partially_booked';
        } else {
          derivedStatus = 'fully_booked';
        }
      }

      return {
        ...flight,
        derivedStatus,
        totalRevenue: flight.total_revenue || 0
      };
    });

    console.log(`✅ Found ${flightsWithStatus.length} flights for operator ${operatorId}`);
    res.json({
      success: true,
      flights: flightsWithStatus
    });

  } catch (error) {
    console.error('❌ Error fetching operator flights:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch operator flights'
    });
  }
});

// @route   PUT /api/operators/:operatorId/approve
// @desc    Approve a pending operator (no-op since no status system)
// @access  Private (Admin/Super Admin only)
router.put('/:operatorId/approve', authenticate, authorize(['admin', 'super-admin']), async (req, res) => {
  try {
    const { operatorId } = req.params;
    console.log(`🔄 Approving operator ${operatorId}...`);

    // Since there's no status column, we'll just verify the operator exists
    const checkQuery = `
      SELECT u.id FROM users u
      JOIN operators o ON u.id = o.user_id
      WHERE u.id = ? AND u.role = 'operator'
    `;

    const result = await db.query(checkQuery, [operatorId]);

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        error: 'Operator not found'
      });
    }

    // For now, just return success since there's no status to update
    console.log(`✅ Operator ${operatorId} approved successfully (no-op)`);
    res.json({
      success: true,
      message: 'Operator approved successfully'
    });

  } catch (error) {
    console.error('❌ Error approving operator:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to approve operator'
    });
  }
});

// @route   PUT /api/operators/:operatorId/deny
// @desc    Deny a pending operator (no-op since no status system)
// @access  Private (Admin/Super Admin only)
router.put('/:operatorId/deny', authenticate, authorize(['admin', 'super-admin']), async (req, res) => {
  try {
    const { operatorId } = req.params;
    console.log(`🔄 Denying operator ${operatorId}...`);

    // Since there's no status column, we'll just verify the operator exists
    const checkQuery = `
      SELECT u.id FROM users u
      JOIN operators o ON u.id = o.user_id
      WHERE u.id = ? AND u.role = 'operator'
    `;

    const result = await db.query(checkQuery, [operatorId]);

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        error: 'Operator not found'
      });
    }

    // For now, just return success since there's no status to update
    console.log(`✅ Operator ${operatorId} denied successfully (no-op)`);
    res.json({
      success: true,
      message: 'Operator denied successfully'
    });

  } catch (error) {
    console.error('❌ Error denying operator:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to deny operator'
    });
  }
});

module.exports = router;