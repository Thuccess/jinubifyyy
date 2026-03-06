import mongoose from 'mongoose';

const investmentInquirySchema = new mongoose.Schema(
  {
    investor: {
      name: {
        type: String,
        required: [true, 'Investor name is required'],
        trim: true,
      },
      email: {
        type: String,
        required: [true, 'Investor email is required'],
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
      },
      phone: {
        type: String,
        trim: true,
      },
      country: {
        type: String,
        trim: true,
      },
    },
    interestLevel: {
      type: String,
      trim: true,
    },
    investmentRange: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      trim: true,
    },
    stage: {
      type: String,
      enum: ['new', 'contacted', 'negotiating', 'closed-won', 'closed-lost'],
      default: 'new',
      index: true,
    },
    adminNotes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
investmentInquirySchema.index({ stage: 1 });
investmentInquirySchema.index({ createdAt: -1 });

const InvestmentInquiry = mongoose.model('InvestmentInquiry', investmentInquirySchema);

export default InvestmentInquiry;

