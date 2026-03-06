import InvestmentInquiry from '../models/InvestmentInquiry.js';

export const createInvestmentInquiry = async (payload) => {
  const inquiry = new InvestmentInquiry(payload);
  await inquiry.save();
  return inquiry;
};

export const listInvestmentInquiries = async ({ stage, search, page = 1, limit = 20 } = {}) => {
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 20;
  const skip = (pageNum - 1) * limitNum;

  const query = {};
  if (stage && stage !== 'all') {
    query.stage = stage;
  }
  if (search) {
    const s = String(search).trim();
    query.$or = [
      { 'investor.name': { $regex: s, $options: 'i' } },
      { 'investor.email': { $regex: s, $options: 'i' } },
    ];
  }

  const [items, total] = await Promise.all([
    InvestmentInquiry.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
    InvestmentInquiry.countDocuments(query),
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

export const updateInvestmentStage = async (id, stage, adminNotes) => {
  const update = { stage };
  if (typeof adminNotes === 'string') {
    update.adminNotes = adminNotes;
  }
  const inquiry = await InvestmentInquiry.findByIdAndUpdate(id, update, { new: true });
  return inquiry;
};

export const deleteInvestmentInquiry = async (id) => {
  await InvestmentInquiry.findByIdAndDelete(id);
};

export const getInvestorStats = async () => {
  const [total, newly] = await Promise.all([
    InvestmentInquiry.countDocuments(),
    InvestmentInquiry.countDocuments({ stage: 'new' }),
  ]);
  return { totalInvestors: total, newInvestors: newly };
};

