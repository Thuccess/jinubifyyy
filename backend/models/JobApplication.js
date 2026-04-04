import mongoose from 'mongoose';

const jobApplicationSchema = new mongoose.Schema(
  {
    applicant: {
      name: {
        type: String,
        required: [true, 'Applicant name is required'],
        trim: true,
      },
      email: {
        type: String,
        required: [true, 'Applicant email is required'],
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
      },
      phone: {
        type: String,
        trim: true,
      },
      position: {
        type: String,
        trim: true,
      },
      coverLetter: {
        type: String,
        trim: true,
      },
      resumeUrl: {
        type: String,
        trim: true,
      },
    },
    status: {
      type: String,
      enum: ['new', 'reviewing', 'shortlisted', 'rejected', 'hired'],
      default: 'new',
    },
    source: {
      type: String,
      default: 'career-page',
      trim: true,
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
jobApplicationSchema.index({ status: 1 });
jobApplicationSchema.index({ createdAt: -1 });

const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);

export default JobApplication;

