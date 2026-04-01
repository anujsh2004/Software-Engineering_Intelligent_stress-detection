const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// Create a new notification for the logged-in user
router.post('/', protect, async (req, res) => {
  try {
    const { message, recommendation, stressLevel, metrics } = req.body;

    console.log('[Notifications API] Creating notification for user:', req.user._id, req.user.name);
    console.log('[Notifications API] Data:', { message, stressLevel, metrics });

    if (!message || !recommendation) {
      return res.status(400).json({
        success: false,
        error: 'Message and recommendation are required'
      });
    }

    const notification = await Notification.create({
      userId: req.user._id,
      message,
      recommendation,
      stressLevel: stressLevel || 'MILD',
      metrics: metrics || {}
    });

    console.log('[Notifications API] Created notification:', notification._id);

    res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('[Notifications API] Error creating:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all notifications for the logged-in user
router.get('/', protect, async (req, res) => {
  try {
    console.log('[Notifications API] Fetching for user:', req.user._id, req.user.name);
    
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ timestamp: -1 })
      .limit(50);

    console.log('[Notifications API] Found', notifications.length, 'notifications');

    res.json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    console.error('[Notifications API] Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete a notification
router.delete('/:id', protect, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    await notification.deleteOne();

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Clear all notifications for user
router.delete('/', protect, async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.user._id });

    res.json({
      success: true,
      message: 'All notifications cleared'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
