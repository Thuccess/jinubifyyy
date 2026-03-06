import JobApplication from '../models/JobApplication.js';

export const createJobApplication = async (payload) => {
  const application = new JobApplication(payload);
  await application.save();
  return application;
};

export const listJobApplications = async ({ status, search, page = 1, limit = 20 } = {}) => {
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 20;
  const skip = (pageNum - 1) * limitNum;

  const query = {};
  if (status && status !== 'all') {
    query.status = status;
  }
  if (search) {
    const s = String(search).trim();
    query.$or = [
      { 'applicant.name': { $regex: s, $options: 'i' } },
      { 'applicant.email': { $regex: s, $options: 'i' } },
    ];
  }

  const [items, total] = await Promise.all([
    JobApplication.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
    JobApplication.countDocuments(query),
  ]);

  return {
    items,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  };
};

export const updateJobApplicationStatus = async (id, status, adminNotes) => {
  const update = { status };
  if (typeof adminNotes === 'string') {
    update.adminNotes = adminNotes;
  }
  const application = await JobApplication.findByIdAndUpdate(id, update, { new: true });
  return application;
};

export const deleteJobApplication = async (id) => {
  await JobApplication.findByIdAndDelete(id);
};

export const getJobApplicationStats = async () => {
  const [total, newly] = await Promise.all([
    JobApplication.countDocuments(),
    JobApplication.countDocuments({ status: 'new' }),
  ]);
  return { totalApplications: total, newApplications: newly };
};

