import express from 'express';
import { body, validationResult } from 'express-validator';
import { contactLimiter } from '../middleware/rateLimiter.js';
import { createInvestmentInquiry } from '../services/investorService.js';

const router = express.Router();

// @route   POST /api/investment/inquire
// @desc    Submit an investment inquiry from the public investment page
// @access  Public (rate limited)
router.post(
  '/inquire',
  contactLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('phone').optional().trim().isLength({ max: 64 }),
    body('country').optional().trim().isLength({ max: 128 }),
    body('interestLevel').optional().trim().isLength({ max: 256 }),
    body('investmentRange').optional().trim().isLength({ max: 256 }),
    body('message').optional().trim().isLength({ max: 8000 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map((err) => ({
          field: err.path || err.param,
          message: err.msg,
        })),
      });
    }

    try {
      const { name, email, phone, country, interestLevel, investmentRange, message } = req.body;
      const inquiry = await createInvestmentInquiry({
        investor: { name, email, phone, country },
        interestLevel,
        investmentRange,
        message,
      });

      console.log('[InvestmentInquiry] New inquiry received:', {
        id: inquiry._id,
        name: inquiry.investor?.name,
        email: inquiry.investor?.email,
        interestLevel: inquiry.interestLevel,
      });

      // Hook for future email notification
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        // Implement optional email sending here when ready.
      }

      res.status(201).json({
        message: 'Inquiry submitted successfully.',
        inquiry: {
          _id: inquiry._id,
          stage: inquiry.stage,
          createdAt: inquiry.createdAt,
        },
      });
    } catch (error) {
      console.error('Investment inquiry error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

export default router;

