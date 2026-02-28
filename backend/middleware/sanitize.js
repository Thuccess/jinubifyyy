import { body, param, query } from 'express-validator';
import mongoSanitize from 'express-mongo-sanitize';

// MongoDB injection protection
export const mongoSanitizeMiddleware = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`MongoDB injection attempt detected: ${key}`);
  },
});

// Sanitize string inputs
export const sanitizeString = (field) => {
  return body(field)
    .trim()
    .escape()
    .optional({ nullable: true });
};

// Sanitize HTML content (for blog posts)
export const sanitizeHTML = (field) => {
  return body(field)
    .trim()
    .optional({ nullable: true });
};

// Sanitize email
export const sanitizeEmail = () => {
  return body('email')
    .trim()
    .normalizeEmail()
    .toLowerCase();
};

// Sanitize URL
export const sanitizeURL = (field) => {
  return body(field)
    .trim()
    .optional({ nullable: true });
};

// Sanitize slug
export const sanitizeSlug = () => {
  return body('slug')
    .trim()
    .toLowerCase()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug can only contain lowercase letters, numbers, and hyphens');
};

// Sanitize query parameters
export const sanitizeQuery = (field) => {
  return query(field)
    .trim()
    .escape()
    .optional();
};

// Sanitize route parameters
export const sanitizeParam = (field) => {
  return param(field)
    .trim()
    .escape();
};

export default {
  mongoSanitizeMiddleware,
  sanitizeString,
  sanitizeHTML,
  sanitizeEmail,
  sanitizeURL,
  sanitizeSlug,
  sanitizeQuery,
  sanitizeParam,
};
