import express from 'express';
import { body, validationResult } from 'express-validator';
import { contactLimiter } from '../middleware/rateLimiter.js';
import { createJobApplication } from '../services/applicationService.js';

const router = express.Router();

// @route   POST /api/career/apply
// @desc    Submit a job application from the public career page
// @access  Public (rate limited)
router.post(
  '/apply',
  contactLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('phone').optional().trim().isLength({ max: 64 }),
    body('position').optional().trim().isLength({ max: 256 }),
    body('coverLetter').optional().trim().isLength({ max: 8000 }),
    body('resumeUrl').optional().trim().isURL().withMessage('Invalid resume URL'),
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
      const { name, email, phone, position, coverLetter, resumeUrl } = req.body;
      const application = await createJobApplication({
        applicant: { name, email, phone, position, coverLetter, resumeUrl },
        source: 'career-page',
      });

      console.log('[JobApplication] New application received:', {
        id: application._id,
        name: application.applicant?.name,
        email: application.applicant?.email,
        position: application.applicant?.position,
      });

      // Hook for future email notification
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        // Implement optional email sending here when ready.
      }

      res.status(201).json({
        message: 'Application submitted successfully.',
        application: {
          _id: application._id,
          status: application.status,
          createdAt: application.createdAt,
        },
      });
    } catch (error) {
      console.error('Job application error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

export default router;

