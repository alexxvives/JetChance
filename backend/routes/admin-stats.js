// System stats endpoint for admin dashboard
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const db = require('../config/database-sqlite');

/**
 * GET /api/admin/system-stats
 * Returns comprehensive system statistics for admin dashboard
 * Only accessible by super-admin
 */
router.get('/system-stats', authenticate, authorize(['super-admin']), async (req, res) => {
  try {
    // Total users
    const usersCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
    
    // Active users (logged in last 30 days - if we tracked this)
    // For now, just use total users
    const totalUsers = usersCount.count;
    const activeUsers = totalUsers; // TODO: Track last_login_at
    
    // Total flights
    const flightsCount = db.prepare('SELECT COUNT(*) as count FROM flights').get();
    const activeFlightsCount = db.prepare(`
      SELECT COUNT(*) as count 
      FROM flights 
      WHERE status IN ('available', 'pending', 'partially booked') 
        AND departure_datetime > datetime('now')
    `).get();
    
    // Total bookings
    const bookingsCount = db.prepare('SELECT COUNT(*) as count FROM bookings').get();
    const confirmedBookingsCount = db.prepare(`
      SELECT COUNT(*) as count 
      FROM bookings 
      WHERE status = 'confirmed'
    `).get();
    
    // Revenue calculations
    const revenueData = db.prepare(`
      SELECT 
        SUM(total_amount) as total,
        COUNT(*) as count
      FROM bookings 
      WHERE status = 'confirmed'
    `).get();
    
    const totalRevenue = revenueData.total || 0;
    // Platform commission: 30% markup means commission = revenue - (revenue / 1.3)
    const platformCommission = totalRevenue - (totalRevenue / 1.3);
    
    // Growth calculations (last 30 days vs previous 30 days)
    const currentMonthUsers = db.prepare(`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE created_at >= datetime('now', '-30 days')
    `).get();
    
    const previousMonthUsers = db.prepare(`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE created_at >= datetime('now', '-60 days') 
        AND created_at < datetime('now', '-30 days')
    `).get();
    
    const userGrowth = previousMonthUsers.count > 0 
      ? Math.round(((currentMonthUsers.count - previousMonthUsers.count) / previousMonthUsers.count) * 100)
      : 100;
    
    // Revenue growth
    const currentMonthRevenue = db.prepare(`
      SELECT SUM(total_amount) as total 
      FROM bookings 
      WHERE status = 'confirmed' 
        AND created_at >= datetime('now', '-30 days')
    `).get();
    
    const previousMonthRevenue = db.prepare(`
      SELECT SUM(total_amount) as total 
      FROM bookings 
      WHERE status = 'confirmed' 
        AND created_at >= datetime('now', '-60 days') 
        AND created_at < datetime('now', '-30 days')
    `).get();
    
    const revenueGrowth = (previousMonthRevenue.total && previousMonthRevenue.total > 0)
      ? Math.round(((currentMonthRevenue.total - previousMonthRevenue.total) / previousMonthRevenue.total) * 100)
      : 100;
    
    // Database stats
    const tableRows = {
      users: db.prepare('SELECT COUNT(*) as count FROM users').get().count,
      flights: db.prepare('SELECT COUNT(*) as count FROM flights').get().count,
      bookings: db.prepare('SELECT COUNT(*) as count FROM bookings').get().count,
      passengers: db.prepare('SELECT COUNT(*) as count FROM passengers').get().count,
      airports: db.prepare('SELECT COUNT(*) as count FROM airports').get().count,
      operators: db.prepare('SELECT COUNT(*) as count FROM operators').get().count,
      customers: db.prepare('SELECT COUNT(*) as count FROM customers').get().count,
      notifications: db.prepare('SELECT COUNT(*) as count FROM notifications').get().count
    };
    
    const totalRecords = Object.values(tableRows).reduce((sum, count) => sum + count, 0);
    
    // Total airports
    const airportsCount = db.prepare('SELECT COUNT(*) as count FROM airports').get();
    
    res.json({
      totalUsers,
      activeUsers,
      userGrowth: `+${userGrowth}`,
      totalFlights: flightsCount.count,
      activeFlights: activeFlightsCount.count,
      totalBookings: bookingsCount.count,
      confirmedBookings: confirmedBookingsCount.count,
      totalRevenue: Math.round(totalRevenue),
      platformCommission: Math.round(platformCommission),
      revenueGrowth,
      dbRecords: totalRecords,
      dbSizeMB: 0.17, // Placeholder - would need to check actual file size
      totalAirports: airportsCount.count
    });
    
  } catch (error) {
    console.error('❌ Error fetching system stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch system stats',
      details: error.message 
    });
  }
});

/**
 * GET /api/admin/r2-stats
 * Returns R2 storage statistics
 * Only accessible by super-admin
 */
router.get('/r2-stats', authenticate, authorize(['super-admin']), async (req, res) => {
  try {
    // For now, return mock data since R2 is on Cloudflare Workers
    // In production, this would call the Workers API endpoint
    
    // Count flights with images
    const flightsWithImages = db.prepare(`
      SELECT COUNT(*) as count 
      FROM flights 
      WHERE images != '[]' AND images IS NOT NULL
    `).get();
    
    // Estimate image count (assuming average 3 images per flight)
    const estimatedImageCount = flightsWithImages.count * 3;
    
    // Estimate storage usage (assuming 2MB per image average)
    const estimatedStorageMB = Math.round(estimatedImageCount * 2);
    
    // Flights pending cleanup (30 days past departure)
    const pendingCleanup = db.prepare(`
      SELECT COUNT(*) as count 
      FROM flights 
      WHERE images != '[]' 
        AND images IS NOT NULL
        AND image_cleanup_date IS NOT NULL
        AND image_cleanup_date <= datetime('now')
    `).get();
    
    res.json({
      success: true,
      storage: {
        usedMB: estimatedStorageMB,
        limitMB: 10240, // 10GB
        percentageUsed: Math.round((estimatedStorageMB / 10240) * 100),
        imageCount: estimatedImageCount
      },
      cleanup: {
        flightsPendingCleanup: pendingCleanup.count
      },
      alert: estimatedStorageMB > 8192 ? 'WARNING: Approaching storage limit' : null
    });
    
  } catch (error) {
    console.error('❌ Error fetching R2 stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch R2 stats',
      details: error.message 
    });
  }
});

module.exports = router;
