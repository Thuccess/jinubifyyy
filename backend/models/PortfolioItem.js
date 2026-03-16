import mongoose from 'mongoose';
import { createCollectionItemSchema } from './collectionItemBase.js';

const portfolioSchema = createCollectionItemSchema();

portfolioSchema.index({ status: 1, isDeleted: 1, order: 1, date: -1 });

const PortfolioItem = mongoose.model('PortfolioItem', portfolioSchema);

export default PortfolioItem;

