import { body } from 'express-validator';

/**
 * Validation for POST /api/auth/register (personal vs business onboarding).
 * Legacy clients may omit accountType — treated as business (company + phone required).
 */
export const registerOnboardingValidators = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number')
    .matches(/[^A-Za-z0-9]/)
    .withMessage('Password must contain at least one special character'),
  body('photoURL').optional().isURL().withMessage('Photo URL must be a valid URL'),
  body('accountType')
    .optional()
    .isIn(['personal', 'business'])
    .withMessage('accountType must be personal or business'),
  body('company')
    .optional()
    .trim()
    .custom((value, { req }) => {
      const t = req.body.accountType || 'business';
      if (t === 'business' && (!value || !String(value).trim())) {
        throw new Error('Company is required for business accounts');
      }
      return true;
    }),
  body('phone')
    .optional()
    .trim()
    .custom((value, { req }) => {
      const t = req.body.accountType || 'business';
      if (t === 'business' && (!value || !String(value).trim())) {
        throw new Error('Phone is required for business accounts');
      }
      return true;
    }),
  body('website')
    .optional()
    .trim()
    .custom((value) => {
      if (value === '' || value == null) return true;
      try {
        // eslint-disable-next-line no-new
        new URL(value.startsWith('http') ? value : `https://${value}`);
        return true;
      } catch {
        throw new Error('Website URL must be valid');
      }
    }),
  body('industry').optional().trim(),
];
