const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Ticket = require('../models/Ticket');
const Message = require('../models/Message');
const User = require('../models/User');
const { validateUser } = require('../middleware/userAuthMiddleware');
const { protect } = require('../middleware/authMiddleware'); // For admin routes

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../public/uploads/tickets');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration for attachments
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'ticket-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, and documents are allowed!'));
    }
  }
});

// Generate unique ticket ID
const generateTicketId = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `TKT-${year}${month}${day}-${random}`;
};

// USER ROUTES
// ============

// 1. Create new ticket
router.post('/create', validateUser, upload.single('attachment'), async (req, res) => {
  try {
    const { subject, category, description } = req.body;
    
    // Validation
    if (!subject || !category || !description) {
      return res.status(400).json({
        success: false,
        message: 'Subject, category, and description are required'
      });
    }

    // Generate unique ticket ID
    let ticketId;
    let isUnique = false;
    while (!isUnique) {
      ticketId = generateTicketId();
      const existingTicket = await Ticket.findOne({ ticketId });
      if (!existingTicket) isUnique = true;
    }

    // Create ticket
    const ticket = new Ticket({
      ticketId,
      userId: req.user._id, // Use _id from validated user
      subject,
      category,
      description,
      attachment: req.file ? `/uploads/tickets/${req.file.filename}` : null
    });

    await ticket.save();

    // Create initial message
    const message = new Message({
      ticketId: ticket._id,
      senderId: req.user._id, // Use _id from validated user
      senderType: 'user',
      message: description,
      attachment: req.file ? `/uploads/tickets/${req.file.filename}` : null
    });

    await message.save();

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      data: ticket
    });

  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create ticket'
    });
  }
});

// 2. Get user's tickets
router.get('/my-tickets', validateUser, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const tickets = await Ticket.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('assignedTo', 'email');

    const totalTickets = await Ticket.countDocuments({ userId: req.user._id });

    res.json({
      success: true,
      data: {
        tickets,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalTickets / limit),
          totalTickets,
          hasNext: page < Math.ceil(totalTickets / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get user tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tickets'
    });
  }
});

// 3. Get single ticket with messages
router.get('/:ticketId', validateUser, async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ 
      ticketId: req.params.ticketId,
      userId: req.user.id 
    }).populate('assignedTo', 'email');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Get all messages for this ticket
    const messages = await Message.find({ ticketId: ticket._id })
      .sort({ createdAt: 1 });

    // Mark user messages as read
    await Message.updateMany(
      { 
        ticketId: ticket._id, 
        senderType: 'admin',
        isRead: false 
      },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );

    res.json({
      success: true,
      data: {
        ticket,
        messages
      }
    });

  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ticket'
    });
  }
});

// 4. Add message to ticket
router.post('/:ticketId/message', validateUser, upload.single('attachment'), async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Verify ticket belongs to user
    const ticket = await Ticket.findOne({ 
      ticketId: req.params.ticketId,
      userId: req.user._id 
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check if ticket is closed
    if (ticket.status === 'Closed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot add message to closed ticket'
      });
    }

    // Create message
    const newMessage = new Message({
      ticketId: ticket._id,
      senderId: req.user._id,
      senderType: 'user',
      message,
      attachment: req.file ? `/uploads/tickets/${req.file.filename}` : null
    });

    await newMessage.save();

    // Update ticket last activity
    ticket.lastActivity = new Date();
    if (ticket.status === 'Resolved') {
      ticket.status = 'Open'; // Reopen if user responds after resolution
    }
    await ticket.save();

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage
    });

  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
});

// ADMIN ROUTES
// ============

// 5. Get all tickets (admin)
router.get('/admin/all', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;
    const search = req.query.search;
    const skip = (page - 1) * limit;

    let query = {};
    
    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Search by ticket ID or subject
    if (search) {
      query.$or = [
        { ticketId: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    const tickets = await Ticket.find(query)
      .sort({ lastActivity: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email')
      .populate('assignedTo', 'email');

    const totalTickets = await Ticket.countDocuments(query);

    res.json({
      success: true,
      data: {
        tickets,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalTickets / limit),
          totalTickets,
          hasNext: page < Math.ceil(totalTickets / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get all tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tickets'
    });
  }
});

// 6. Get ticket details with messages (admin)
router.get('/admin/:ticketId', protect, async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ ticketId: req.params.ticketId })
      .populate('userId', 'name email phoneNumber')
      .populate('assignedTo', 'email');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Get all messages
    const messages = await Message.find({ ticketId: ticket._id })
      .sort({ createdAt: 1 })
      .populate('senderId', 'name email');

    // Mark admin messages as read
    await Message.updateMany(
      { 
        ticketId: ticket._id, 
        senderType: 'user',
        isRead: false 
      },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );

    res.json({
      success: true,
      data: {
        ticket,
        messages
      }
    });

  } catch (error) {
    console.error('Get admin ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ticket'
    });
  }
});

// 7. Reply to ticket (admin)
router.post('/admin/:ticketId/reply', protect, upload.single('attachment'), async (req, res) => {
  try {
    const { message, status } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const ticket = await Ticket.findOne({ ticketId: req.params.ticketId });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Create admin message
    const newMessage = new Message({
      ticketId: ticket._id,
      senderId: req.admin.id,
      senderType: 'admin',
      message,
      attachment: req.file ? `/uploads/tickets/${req.file.filename}` : null
    });

    await newMessage.save();

    // Update ticket
    ticket.lastActivity = new Date();
    ticket.assignedTo = req.admin.id;
    
    if (status && ['Open', 'Pending', 'Resolved', 'Closed'].includes(status)) {
      ticket.status = status;
      
      if (status === 'Resolved') {
        ticket.resolvedAt = new Date();
      } else if (status === 'Closed') {
        ticket.closedAt = new Date();
      }
    }

    await ticket.save();

    res.status(201).json({
      success: true,
      message: 'Reply sent successfully',
      data: newMessage
    });

  } catch (error) {
    console.error('Admin reply error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send reply'
    });
  }
});

// 8. Update ticket status (admin)
router.put('/admin/:ticketId/status', protect, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['Open', 'Pending', 'Resolved', 'Closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required'
      });
    }

    const ticket = await Ticket.findOne({ ticketId: req.params.ticketId });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    ticket.status = status;
    ticket.assignedTo = req.admin.id;
    ticket.lastActivity = new Date();

    if (status === 'Resolved') {
      ticket.resolvedAt = new Date();
    } else if (status === 'Closed') {
      ticket.closedAt = new Date();
    }

    await ticket.save();

    res.json({
      success: true,
      message: `Ticket status updated to ${status}`,
      data: ticket
    });

  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update ticket status'
    });
  }
});

// 9. Assign ticket to admin
router.put('/admin/:ticketId/assign', protect, async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ ticketId: req.params.ticketId });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    ticket.assignedTo = req.admin.id;
    ticket.lastActivity = new Date();
    await ticket.save();

    res.json({
      success: true,
      message: 'Ticket assigned successfully',
      data: ticket
    });

  } catch (error) {
    console.error('Assign ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign ticket'
    });
  }
});

// Error handling for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum 5MB allowed.'
      });
    }
  } else if (error.message) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
});

module.exports = router;