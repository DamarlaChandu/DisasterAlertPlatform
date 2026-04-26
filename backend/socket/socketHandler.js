import jwt from 'jsonwebtoken';

let connectedUsers = {};
let notifications = [];

export const initializeSocket = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);
    connectedUsers[socket.userId] = socket.id;

    // Broadcast user online status
    io.emit('user_online', { userId: socket.userId, status: 'online' });

    // Join role-based rooms
    socket.join(`role-${socket.userRole}`);
    socket.join(`user-${socket.userId}`);

    // NEW REQUEST NOTIFICATION
    socket.on('new_request', (data) => {
      console.log('New request created:', data);

      // Notify all volunteers
      io.to('role-volunteer').emit('new_request', {
        requestId: data.requestId,
        resourceType: data.resourceType,
        location: data.location,
        urgency: data.urgency,
        createdAt: data.createdAt,
        citizenId: data.citizenId,
      });

      // Store notification
      notifications.push({
        type: 'new_request',
        data,
        timestamp: new Date(),
      });
    });

    // REQUEST ACCEPTED NOTIFICATION
    socket.on('request_accepted', (data) => {
      console.log('Request accepted:', data);

      // Notify the citizen
      io.to(`user-${data.citizenId}`).emit('request_accepted', {
        requestId: data.requestId,
        volunteerId: data.volunteerId,
        volunteerName: data.volunteerName,
        volunteerPhone: data.volunteerPhone,
        acceptedAt: data.acceptedAt,
      });

      // Notify other volunteers
      socket.broadcast.to('role-volunteer').emit('request_accepted', {
        requestId: data.requestId,
        message: `Request ${data.requestId} has been accepted`,
      });
    });

    // STATUS UPDATE NOTIFICATION
    socket.on('status_updated', (data) => {
      console.log('Status updated:', data);

      // Notify citizen
      io.to(`user-${data.citizenId}`).emit('status_updated', {
        requestId: data.requestId,
        status: data.status,
        message: data.message,
        volunteerPhone: data.volunteerPhone,
        updatedAt: data.updatedAt,
      });

      // Notify admin
      io.to('role-admin').emit('status_updated', {
        requestId: data.requestId,
        status: data.status,
        message: data.message,
        updatedAt: data.updatedAt,
      });

      // Broadcast to all
      io.emit('dashboard_update', {
        type: 'status_change',
        requestId: data.requestId,
        status: data.status,
      });
    });

    // PRIORITY UPDATE NOTIFICATION (Admin)
    socket.on('admin_priority_update', (data) => {
      console.log('Priority updated:', data);

      // Broadcast to all connected clients
      io.emit('priority_updated', {
        requestId: data.requestId,
        priority: data.priority,
        updatedAt: data.updatedAt,
        message: `Request priority updated to ${data.priority}`,
      });

      // Notify volunteers
      io.to('role-volunteer').emit('request_updated', {
        requestId: data.requestId,
        priority: data.priority,
        message: `Request priority changed to ${data.priority}`,
      });
    });

    // PROGRESS UPDATE
    socket.on('progress_update', (data) => {
      console.log('Progress update:', data);

      // Notify citizen
      io.to(`user-${data.citizenId}`).emit('progress_update', {
        requestId: data.requestId,
        message: data.message,
        images: data.images,
        updatedAt: data.updatedAt,
      });

      // Broadcast to dashboard
      io.emit('request_progress_updated', {
        requestId: data.requestId,
        status: data.status,
        progress: data.progress,
      });
    });

    // DISASTER ALERT
    socket.on('disaster_alert', (data) => {
      console.log('Disaster alert:', data);

      // Broadcast to all users
      io.emit('disaster_alert', {
        reportId: data.reportId,
        disasterType: data.disasterType,
        location: data.location,
        severity: data.severity,
        description: data.description,
        createdAt: data.createdAt,
      });

      // Notify admin
      io.to('role-admin').emit('new_disaster', {
        reportId: data.reportId,
        disasterType: data.disasterType,
        severity: data.severity,
        location: data.location,
      });
    });

    // VOLUNTEER ACCEPTANCE
    socket.on('volunteer_accepted', (data) => {
      // Notify citizen immediately
      io.to(`user-${data.recipientId}`).emit('volunteer_accepted_alert', {
        volunteerId: data.volunteerId,
        volunteerName: data.volunteerName,
        requestId: data.requestId,
        message: `${data.volunteerName} has accepted your request!`,
      });
    });

    // RATING NOTIFICATION
    socket.on('volunteer_rated', (data) => {
      // Notify volunteer
      io.to(`user-${data.volunteerId}`).emit('you_were_rated', {
        rating: data.rating,
        feedback: data.feedback,
        ratedBy: data.ratedBy,
      });

      // Update volunteer stats broadcast
      io.to('role-admin').emit('volunteer_activity', {
        volunteerId: data.volunteerId,
        rating: data.rating,
        requestId: data.requestId,
      });
    });

    // ANALYTICS BROADCAST
    socket.on('request_analytics', (data) => {
      io.to('role-admin').emit('analytics_update', {
        pending: data.pending,
        inProgress: data.inProgress,
        completed: data.completed,
        cancelled: data.cancelled,
      });
    });

    // TYPING INDICATOR
    socket.on('volunteer_typing', (data) => {
      socket.broadcast.emit('volunteer_typing', {
        volunteerId: socket.userId,
        requestId: data.requestId,
      });
    });

    // MESSAGE/CHAT EVENT
    socket.on('send_message', (data) => {
      io.to(`user-${data.recipientId}`).emit('receive_message', {
        senderId: socket.userId,
        senderName: data.senderName,
        message: data.message,
        requestId: data.requestId,
        timestamp: new Date(),
      });
    });

    // NEARBY ALERTS
    socket.on('nearby_disaster_alert', (data) => {
      socket.broadcast.to(`location-${data.location}`).emit('nearby_disaster', {
        disasterType: data.disasterType,
        distance: data.distance,
        severity: data.severity,
      });
    });

    // LIVE LOCATION TRACKING
    socket.on('location:update', (data) => {
      // console.log('Live location update:', socket.userId, data.coordinates);
      
      // Store updated location in socket object for quick access
      socket.location = data.coordinates;
      socket.accuracy = data.accuracy;

      const movePayload = {
        userId: socket.userId,
        name: data.userName,
        role: socket.userRole,
        coordinates: data.coordinates,
        accuracy: data.accuracy,
        updatedAt: new Date(),
      };

      // 1. Notify admins about everyone (Detailed monitoring)
      io.to('role-admin').emit('user:move', movePayload);

      // 2. Notify everyone about volunteers (Public map)
      if (socket.userRole === 'volunteer') {
        io.emit('volunteer:move', movePayload);
      }



      // If volunteer is assigned to a request, notify the citizen
      if (data.activeRequestId && data.citizenId) {
        io.to(`user-${data.citizenId}`).emit('responder:move', {
          requestId: data.activeRequestId,
          responderId: socket.userId,
          coordinates: data.coordinates,
          accuracy: data.accuracy,
          estimatedArrival: data.estimatedArrival,
        });
      }
    });

    // BROADCAST NEARBY INCIDENT
    socket.on('incident:nearby', (data) => {
      // Find all users within radius and notify them
      // This is a specialized event for high-priority alerts
      io.emit('emergency_broadcast', {
        type: 'nearby_incident',
        incidentId: data.incidentId,
        coordinates: data.coordinates,
        radius: data.radius || 5, // km
        message: data.message,
      });
    });

    // USER DISCONNECT
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
      delete connectedUsers[socket.userId];

      // Broadcast user offline status
      io.emit('user_offline', { userId: socket.userId, status: 'offline' });
    });

    // ERROR HANDLING
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });
};

export const getConnectedUsers = () => connectedUsers;
export const getNotifications = () => notifications;
export const clearNotifications = () => {
  notifications = [];
};
