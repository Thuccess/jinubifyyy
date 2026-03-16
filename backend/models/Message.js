import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: false,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    attachments: [
      {
        name: String,
        url: String,
      },
    ],
  },
  { timestamps: true }
);

messageSchema.index({ projectId: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;

