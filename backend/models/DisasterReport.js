import mongoose from 'mongoose';

const disasterReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    disasterType: {
      type: String,
      enum: ['flood', 'earthquake', 'cyclone', 'fire', 'landslide', 'storm', 'other'],
      required: [true, 'Please specify disaster type'],
    },
    description: {
      type: String,
      required: [true, 'Please provide description'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
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
      country: String,
      state: String,
      city: String,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    images: [String], // URLs of images uploaded
    affectedPeople: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'resolved', 'closed'],
      default: 'active',
    },
    resourcesNeeded: [
      {
        type: String,
        enum: ['food', 'water', 'shelter', 'medical', 'clothing', 'tools', 'other'],
      },
    ],
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    assignedVolunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    autoDetectedKeywords: [String],
    resolvedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Index for geospatial queries
disasterReportSchema.index({ 'location.coordinates': '2dsphere' });

export default mongoose.model('DisasterReport', disasterReportSchema);
