import mongoose from 'mongoose';
import { createCollectionItemSchema } from './collectionItemBase.js';

const eventSchema = createCollectionItemSchema();

eventSchema.index({ status: 1, isDeleted: 1, order: 1, date: -1 });

const EventItem = mongoose.model('EventItem', eventSchema);

export default EventItem;

