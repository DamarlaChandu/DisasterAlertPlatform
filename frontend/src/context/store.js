import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isLoading: false,
  error: null,

  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  setToken: (token) => {
    localStorage.setItem('token', token);
    set({ token });
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  login: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    set({ user, token, error: null });
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  clearError: () => set({ error: null }),
}));

export const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  markAsRead: () => set({ unreadCount: 0 }),

  clearAllNotifications: () => set({ notifications: [], unreadCount: 0 }),
}));

export const useRequestStore = create((set) => ({
  requests: [],
  myRequests: [],
  selectedRequest: null,
  isLoading: false,

  setRequests: (requests) => set({ requests }),
  setMyRequests: (requests) => set({ myRequests: requests }),
  setSelectedRequest: (request) => set({ selectedRequest: request }),
  setLoading: (loading) => set({ isLoading: loading }),

  addRequest: (request) =>
    set((state) => ({
      requests: [request, ...state.requests],
    })),

  updateRequest: (requestId, updatedData) =>
    set((state) => ({
      requests: state.requests.map((r) => (r._id === requestId ? { ...r, ...updatedData } : r)),
    })),
}));

export const useDisasterStore = create((set) => ({
  disasters: [],
  nearbyDisasters: [],
  selectedDisaster: null,
  isLoading: false,

  setDisasters: (disasters) => set({ disasters }),
  setNearbyDisasters: (disasters) => set({ nearbyDisasters: disasters }),
  setSelectedDisaster: (disaster) => set({ selectedDisaster: disaster }),
  setLoading: (loading) => set({ isLoading: loading }),

  addDisaster: (disaster) =>
    set((state) => ({
      disasters: [disaster, ...state.disasters],
    })),
}));
