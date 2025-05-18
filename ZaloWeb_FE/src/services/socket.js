import { io } from "socket.io-client";

let socket = null;
const listeners = new Map(); // Store listeners by event type and id

// Configuration
const SOCKET_SERVER_URL = "http://localhost:5001/";
const RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 1000;
const RECONNECT_DELAY_MAX = 5000;

/**
 * Initializes the socket connection with automatic reconnection
 * @param {string} userId - User ID for authentication
 * @returns {object} - Socket instance
 */
export const initializeSocket = (userId) => {
  if (socket && socket.connected) {
    console.log("Socket already connected, reusing existing connection");
    return socket;
  }
  
  // Disconnect any existing socket before creating a new one
  if (socket) {
    disconnectSocket();
  }

  console.log("🔌 Initializing socket connection for user:", userId);
  
  socket = io(SOCKET_SERVER_URL, {
    query: {
      userId,
      deviceType: "web",
    },
    reconnectionAttempts: RECONNECT_ATTEMPTS,
    reconnectionDelay: RECONNECT_DELAY,
    reconnectionDelayMax: RECONNECT_DELAY_MAX,
    timeout: 10000,
    autoConnect: true,
    transports: ['websocket', 'polling'], // Try WebSocket first, fall back to polling
  });

  // Connection event handlers
  socket.on("connect", () => {
    console.log("✅ Connected to socket server with ID:", socket.id);
    notifyListeners("connection", { connected: true, id: socket.id });
  });

  socket.on("connect_error", (error) => {
    console.error("❌ Socket connection error:", error.message);
    notifyListeners("connection", { connected: false, error: error.message });
  });

  socket.on("reconnect", (attemptNumber) => {
    console.log(`🔄 Reconnected to socket server after ${attemptNumber} attempts`);
    notifyListeners("connection", { connected: true, reconnected: true });
  });

  socket.on("reconnect_attempt", (attemptNumber) => {
    console.log(`⏳ Attempting to reconnect: attempt ${attemptNumber}`);
    notifyListeners("connection", { connected: false, reconnecting: true, attempt: attemptNumber });
  });
  
  socket.on("disconnect", (reason) => {
    console.log("❌ Disconnected from socket server:", reason);
    notifyListeners("connection", { connected: false, reason });
  });
  // Message and friend request event handlers
  socket.on("friendRequest", (data) => {
    console.log("📩 Received friend request:", data);
    notifyListeners("friendRequest", data);
  });

  socket.on("friendRequestAccepted", (data) => {
    console.log("✅ Friend request accepted:", data);
    notifyListeners("friendRequestAccepted", data);
  });
  
  socket.on("friendRequestRejected", (data) => {
    console.log("❌ Friend request rejected:", data);
    notifyListeners("friendRequestRejected", data);
  });
  
  // Handle group events
  socket.on("createGroup", (data) => {
    console.log("👥 New group created:", data);
    notifyListeners("createGroup", data);
  });
  
  // Handle client-side group creation event
  socket.on("clientCreateGroup", (data) => {
    console.log("👥 Client created a new group:", data);
    // Forward to createGroup handlers
    notifyListeners("createGroup", data);
  });

  socket.on("newMessage", (message) => {
    console.log("📩 New message received:", message._id || message);
    notifyListeners("newMessage", message);
  });
  
  socket.on("messageRecalled", (data) => {
    console.log("🗑️ Message recalled:", data);
    notifyListeners("messageRecalled", data);
  });
  
  socket.on("messageDeleted", (data) => {
    console.log("🗑️ Message deleted:", data);
    notifyListeners("messageDeleted", data);
  });
  
  socket.on("userStatusChanged", (data) => {
    console.log("👤 User status changed:", data);
    notifyListeners("userStatusChanged", data);
  });

  return socket;
};

/**
 * Notifies all registered listeners for a specific event
 * @param {string} eventType - The event type
 * @param {*} data - The event data
 */
const notifyListeners = (eventType, data) => {
  if (!listeners.has(eventType)) return;
  
  listeners.get(eventType).forEach(callback => {
    try {
      callback(data);
    } catch (error) {
      console.error(`Error in ${eventType} listener:`, error);
    }
  });
};

/**
 * Returns current socket instance
 * @returns {object|null} - Socket instance or null if not initialized
 */
export const getSocket = () => socket;

/**
 * Adds an event listener
 * @param {string} eventType - Event to listen for
 * @param {string} listenerId - Unique ID for this listener
 * @param {function} callback - Function to call when event occurs
 */
export const addEventListener = (eventType, listenerId, callback) => {
  if (!listeners.has(eventType)) {
    listeners.set(eventType, new Map());
  }
  
  const eventListeners = listeners.get(eventType);
  eventListeners.set(listenerId, callback);
    // If socket exists and we're adding a listener for socket.io events, register it immediately
  if (socket && typeof socket.on === 'function' && ['newMessage', 'messageRecalled', 'messageDeleted', 
       'friendRequest', 'friendRequestAccepted', 'friendRequestRejected', 'userStatusChanged',
       'createGroup', 'clientCreateGroup', 'groupUpdated', 'leaveGroup'].includes(eventType)) {
    socket.on(eventType, callback);
  }
};

/**
 * Removes an event listener
 * @param {string} eventType - Event type
 * @param {string} listenerId - ID of listener to remove
 */
export const removeEventListener = (eventType, listenerId) => {
  if (!listeners.has(eventType)) return;
  
  const eventListeners = listeners.get(eventType);
  const callback = eventListeners.get(listenerId);
  
  // If this was a socket.io event and we have a socket connection,
  // properly remove the event listener from the socket
  if (socket && typeof socket.off === 'function' && callback &&
      ['newMessage', 'messageRecalled', 'messageDeleted', 
       'friendRequest', 'friendRequestAccepted', 'friendRequestRejected', 
       'userStatusChanged', 'typingStatus'].includes(eventType)) {
    socket.off(eventType, callback);
  }
  
  eventListeners.delete(listenerId);
  
  // If no listeners left for this event type, clean up
  if (eventListeners.size === 0) {
    listeners.delete(eventType);
  }
};

/**
 * Disconnects the socket and cleans up resources
 */
export const disconnectSocket = () => {
  if (socket) {
    console.log("🔌 Disconnecting socket");
    socket.disconnect();
    socket = null;
  }
  
  // Don't clear listeners on disconnect
  // This allows reconnecting and maintaining the same listeners
};
