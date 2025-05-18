import { createContext, useContext, useState, useEffect } from "react";
import { addEventListener, removeEventListener } from "../services/socket";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [deletedUsers, setDeletedUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState({}); // { conversationId: { userId: timestamp } }

  // Listen for user status changes
  useEffect(() => {
    const userContextId = "user_context_" + Date.now();
    
    // Handle user status changes (online/offline/deleted)
    const handleUserStatusChange = (data) => {
      if (!data || !data.userId) return;
      
      switch (data.status) {
        case "online":
          setOnlineUsers(prev => {
            const newSet = new Set(prev);
            newSet.add(data.userId);
            return newSet;
          });
          break;
        case "offline":
          setOnlineUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(data.userId);
            return newSet;
          });
          break;
        case "deleted":
          markUserAsDeleted(data.userId);
          break;
      }
    };
    
    // Handle typing status
    const handleTypingStatus = (data) => {
      if (!data || !data.userId || !data.conversationId) return;
      
      setTypingUsers(prev => {
        const newState = { ...prev };
        
        if (!newState[data.conversationId]) {
          newState[data.conversationId] = {};
        }
        
        if (data.isTyping) {
          // Add user to typing list with current timestamp
          newState[data.conversationId][data.userId] = Date.now();
        } else {
          // Remove user from typing list
          delete newState[data.conversationId][data.userId];
        }
        
        return newState;
      });
    };

    // Register socket event listeners
    addEventListener("userStatusChanged", userContextId, handleUserStatusChange);
    addEventListener("typingStatus", userContextId, handleTypingStatus);

    // Clean up event listeners on unmount
    return () => {
      removeEventListener("userStatusChanged", userContextId);
      removeEventListener("typingStatus", userContextId);
    };
  }, []);

  // Clean up expired typing indicators every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      let hasChanges = false;
      
      setTypingUsers(prev => {
        const newState = { ...prev };
        
        // Check each conversation
        Object.keys(newState).forEach(conversationId => {
          // Check each user in the conversation
          Object.keys(newState[conversationId]).forEach(userId => {
            // If typing indicator is older than 3 seconds, remove it
            if (now - newState[conversationId][userId] > 3000) {
              delete newState[conversationId][userId];
              hasChanges = true;
            }
          });
          
          // Clean up empty conversation objects
          if (Object.keys(newState[conversationId]).length === 0) {
            delete newState[conversationId];
          }
        });
        
        return hasChanges ? newState : prev;
      });
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Check if a user is online
  const isUserOnline = (userId) => {
    if (!userId) return false;
    return onlineUsers.has(userId);
  };
  
  // Check if a user is deleted
  const isUserDeleted = (userId) => {
    if (!userId) return false;
    
    // Check our local cache first
    if (deletedUsers.has(userId)) return true;
    
    // Then check if the user is inactive in the selected conversation
    if (selectedUser && selectedUser.participants) {
      const participant = selectedUser.participants.find(p => p._id === userId);
      if (participant && participant.isActive === false) return true;
    }
    
    return false;
  };
  
  // Mark a user as deleted
  const markUserAsDeleted = (userId) => {
    if (userId) {
      setDeletedUsers(prev => {
        const newSet = new Set(prev);
        newSet.add(userId);
        return newSet;
      });
    }
  };
  
  // Check if a user is typing in a specific conversation
  const isUserTyping = (conversationId, userId) => {
    if (!conversationId || !userId) return false;
    return Boolean(typingUsers[conversationId]?.[userId]);
  };
  
  // Get all users typing in a conversation (except the specified userId to exclude)
  const getTypingUsers = (conversationId, excludeUserId) => {
    if (!conversationId || !typingUsers[conversationId]) return [];
    
    return Object.keys(typingUsers[conversationId])
      .filter(userId => userId !== excludeUserId);
  };
  
  // Set typing status
  const setTypingStatus = (conversationId, isTyping) => {
    const userId = JSON.parse(localStorage.getItem("user"))?.user?._id;
    if (!userId || !conversationId) return;
    
    // Emit typing status through socket
    import("../services/socket").then(({ getSocket }) => {
      const socket = getSocket();
      if (socket) {
        socket.emit("typingStatus", {
          userId,
          conversationId,
          isTyping
        });
      }
    });
  };

  return (
    <UserContext.Provider value={{ 
      selectedUser, 
      setSelectedUser, 
      isUserOnline,
      isUserDeleted,
      markUserAsDeleted,
      onlineUsers,
      setTypingStatus,
      isUserTyping,
      getTypingUsers
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
