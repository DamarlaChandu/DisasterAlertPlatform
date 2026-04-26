import mongoose from 'mongoose';

const responseSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ResourceRequest',
      required: true,
    },
    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['accepted', 'in_progress', 'completed', 'cancelled'],
      default: 'accepted',
    },
    acceptedAt: {
      type: Date,
      default: Date.now,
    },
    estimatedTime: Number, // in minutes
    notes: String,
    progressUpdates: [
      {
        timestamp: {
          type: Date,
          default: Date.now,
        },
        message: String,
        images: [String],
      },
    ],
    completedAt: Date,
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    feedback: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Response', responseSchema);
