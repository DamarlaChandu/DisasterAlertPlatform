import mongoose from 'mongoose';

const resourceRequestSchema = new mongoose.Schema(
  {
    citizenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    disasterReportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DisasterReport',
      default: null,
    },
    resourceType: {
      type: String,
      enum: ['food', 'water', 'shelter', 'medical', 'clothing', 'tools', 'fuel', 'other'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    urgency: {
      type: String,
      enum: ['normal', 'urgent', 'critical'],
      default: 'normal',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      accuracy: Number, // GPS accuracy if available
      radius: {
        type: Number,
        default: 10, // 10km default search radius
      },
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    assignedVolunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    volunteerResponse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Response',
      default: null,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    acceptedAt: Date,
    completedAt: Date,
    estimatedDelivery: Date,
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Index for geospatial queries
resourceRequestSchema.index({ 'location.coordinates': '2dsphere' });

export default mongoose.model('ResourceRequest', resourceRequestSchema);
