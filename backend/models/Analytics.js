import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    totalRequests: Number,
    completedRequests: Number,
    pendingRequests: Number,
    activeDisasters: Number,
    resolvedDisasters: Number,
    totalVolunteers: Number,
    averageResponseTime: Number, // in minutes
    requestsByType: {
      food: Number,
      water: Number,
      shelter: Number,
      medical: Number,
      clothing: Number,
      tools: Number,
      fuel: Number,
      other: Number,
    },
    disastersByType: {
      flood: Number,
      earthquake: Number,
      cyclone: Number,
      fire: Number,
      landslide: Number,
      storm: Number,
      other: Number,
    },
  },
  {
    timestamps: false,
  }
);

export default mongoose.model('Analytics', analyticsSchema);
