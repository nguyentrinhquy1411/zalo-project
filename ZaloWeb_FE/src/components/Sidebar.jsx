import { useState, useEffect } from "react";
import {
  Search,
  MoreHorizontal,
  ChevronDown,
  Users,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "../context/UserContext";
import {
  getConversationList,
  getConversationById,
} from "../services/api/conversation.service";
import { formatUpdatedAt } from "../services/formatDate";
import { getSocket } from "../services/socket";
import FriendPage from "./ParentComponentFriend";
import CreateGroup from "./CreateGroup";
import GroupAvatar from "./GroupAvatar";

const Sidebar = () => {
  const [chatItems, setChatItems] = useState([]);
  const { setSelectedUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const fetchConversations = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getConversationList();
      
      if (!response || !response.data) {
        throw new Error("Invalid response format from server");
      }
      
      // Process and validate the conversation data
      const conversations = response.data;
      
      if (!Array.isArray(conversations)) {
        throw new Error("Expected array of conversations");
      }
        console.log(`📋 Loaded ${conversations.length} conversations`);
      setChatItems(conversations);
      
      // Cache conversations locally for offline fallback
      localStorage.setItem("cachedConversations", JSON.stringify(conversations));
    } catch (err) {
      console.error("❌ Failed to load conversations:", err);
      
      // Provide more specific error messages based on the error type
      if (err.response) {
        // Server responded with an error status code
        const statusCode = err.response.status;
        if (statusCode === 401) {
          setError("Please log in again to view conversations");
        } else if (statusCode === 403) {
          setError("You don't have permission to view these conversations");
        } else {
          setError(`Server error (${statusCode}): ${err.response.data?.message || "Failed to load conversations"}`);
        }
      } else if (err.request) {
        // Request was made but no response received
        setError("Network error: Server did not respond");
      } else {
        // Error during request setup
        setError(err.message || "Failed to load conversations");
      }
      
      // Attempt to recover by using cached data if available
      const cachedConversations = localStorage.getItem("cachedConversations");
      if (cachedConversations) {
        try {
          const parsed = JSON.parse(cachedConversations);
          if (Array.isArray(parsed)) {
            setChatItems(parsed);
            console.log("ℹ️ Using cached conversation data");
          }
        } catch (cacheError) {
          console.error("❌ Failed to parse cached conversations:", cacheError);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };
  const fetchConversationById = async (conversationId) => {
    if (!conversationId) {
      console.error("❌ Invalid conversation ID provided");
      return;
    }

    try {
      const response = await getConversationById(conversationId);
      
      if (!response || !response._id) {
        console.error("❌ Invalid conversation data received:", response);
        return;
      }
      
      const conversation = response;
      
      setChatItems((prevChatItems) => {
        // Check if this conversation exists in the current list
        const conversationExists = prevChatItems.some(chat => chat._id === conversationId);
        
        let updated;
        if (conversationExists) {
          // Update existing conversation
          updated = prevChatItems.map((chat) => {
            if (chat._id === conversationId) {
              return conversation;
            }
            return chat;
          });
        } else {
          // Add new conversation to the list
          updated = [...prevChatItems, conversation];
        }
        
        // Sort by most recent activity
        updated.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        return updated;
      });
      
      console.log("✅ Updated conversation in sidebar:", conversationId);
    } catch (err) {
      console.error("❌ Error fetching conversation by ID:", err);
    }
  };useEffect(() => {
    // Generate a unique ID for this component instance to prevent listener conflicts
    const sidebarId = `sidebar_${Date.now()}`;
    // Flag to prevent state updates after component unmount
    let isMounted = true;

    // Import socket module dynamically to avoid circular dependencies
    const setupSocketListeners = async () => {
      try {
        // Dynamic import of the socket module
        const socketModule = await import("../services/socket");
        if (!isMounted) return null;
        
        const { addEventListener, getSocket } = socketModule;
        const socket = getSocket();
        
        if (!socket) {
          console.warn("⚠️ Socket not initialized in Sidebar component");
          return null;
        }

        // Log socket connection status for debugging
        console.log("🔌 Socket connected in Sidebar:", socket.connected, "Socket ID:", socket.id);
        
        // Handler for group leave/delete events
        const handleLeaveGroup = (data) => {
          if (!isMounted) return;
          console.log("👥 Group update received:", data);
          fetchConversations();
          setSelectedUser(null);
        };

        // Handler for new messages
        const handleNewMessage = (newMessage) => {
          if (!isMounted) return;
          if (!newMessage || !newMessage.conversationId) {
            console.warn("⚠️ Received invalid message data:", newMessage);
            return;
          }
          console.log("📩 New message received for conversation:", newMessage.conversationId);
          fetchConversationById(newMessage.conversationId);
        };

        // Handler for accepted friend requests
        const handleFriendRequestAccepted = (data) => {
          if (!isMounted) return;
          console.log("✅ Friend request accepted:", data);
          fetchConversations();
        };        // Handler for new group creation with enhanced real-time functionality
        const handleCreateGroup = (newGroupConversation) => {
          if (!isMounted) return;
          
          // Validate incoming group data
          if (!newGroupConversation || !newGroupConversation._id) {
            console.warn("⚠️ Received invalid group data:", newGroupConversation);
            return;
          }
          
          console.log("👥 Received new group notification:", 
                     newGroupConversation.groupName || newGroupConversation.name || "Unnamed Group");
          
          // Play notification sound if available
          try {
            const notificationSound = new Audio("/notification.mp3");
            notificationSound.volume = 0.5;
            notificationSound.play().catch(e => console.log("Notification sound blocked by browser policy"));
          } catch (error) {
            console.log("Notification sound not available");
          }
          
          setChatItems((prevChatItems) => {
            // Check if the group already exists to prevent duplicates
            const conversationExists = prevChatItems.some(
              item => item._id === newGroupConversation._id
            );
            
            if (conversationExists) {
              console.log("👥 Group already exists in chat items:", newGroupConversation._id);
              
              // If the group exists but might have been updated
              const updatedItems = prevChatItems.map(item => 
                item._id === newGroupConversation._id 
                  ? { ...item, ...newGroupConversation, isNew: true } 
                  : item
              );
              
              return updatedItems;
            }
            
            // Add new group with isNew flag for potential highlighting
            console.log("👥 Adding new group to chat items:", 
                       newGroupConversation.groupName || newGroupConversation.name || "Unnamed Group");
            
            const updatedChatItems = [
              { ...newGroupConversation, isNew: true }, // Mark as new for UI highlighting
              ...prevChatItems
            ];
            
            // Sort by most recent activity
            updatedChatItems.sort(
              (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
            );
            
            // Optionally: Show a toast notification
            try {
              if (window.toast) {
                window.toast.success(`Nhóm "${newGroupConversation.groupName || 'mới'}" đã được tạo`);
              }
            } catch (error) {
              console.log("Toast notification not available");
            }
            
            return updatedChatItems;
          });
        };// Handler for user status changes
        const handleUserStatusChange = (data) => {
          if (!isMounted) return;
          if (!data || !data.userId) {
            console.warn("⚠️ Received invalid user status data:", data);
            return;
          }
          
          console.log("👤 User status changed:", data);
          
          // Update the online status in the chat list for direct conversations
          setChatItems(prevChatItems => {
            const updated = prevChatItems.map(chat => {
              // Only update for non-group conversations
              if (!chat.isGroup && chat.participants) {
                // Find the participant that matches this user ID
                const participant = chat.participants.find(p => p._id === data.userId);
                if (participant) {
                  return {
                    ...chat,
                    isOnline: data.status === 'online'
                  };
                }
              }
              return chat;
            });
            return updated;
          });
        };

        // Register event listeners using our enhanced addEventListener function
        addEventListener("newMessage", sidebarId, handleNewMessage);
        addEventListener("friendRequestAccepted", sidebarId, handleFriendRequestAccepted);
        addEventListener("createGroup", sidebarId, handleCreateGroup);
        addEventListener("groupUpdated", sidebarId, handleLeaveGroup);
        addEventListener("leaveGroup", sidebarId, handleLeaveGroup);
        addEventListener("userStatusChanged", sidebarId, handleUserStatusChange);
        
        return socketModule;
      } catch (error) {
        console.error("💥 Error setting up socket listeners:", error);
        return null;
      }
    };

    // Load conversation list when component mounts
    fetchConversations();
    
    // Setup socket listeners and store the promise
    const socketSetupPromise = setupSocketListeners();
    
    // Cleanup when component unmounts
    return () => {
      isMounted = false;
      
      // Use an IIFE for async cleanup
      (async () => {
        try {
          const socketModule = await socketSetupPromise;
          if (socketModule) {
            const { removeEventListener } = socketModule;
              // Remove all event listeners
            removeEventListener("newMessage", sidebarId);
            removeEventListener("friendRequestAccepted", sidebarId);
            removeEventListener("createGroup", sidebarId);
            removeEventListener("groupUpdated", sidebarId);
            removeEventListener("leaveGroup", sidebarId);
            removeEventListener("userStatusChanged", sidebarId);
            
            console.log("🔌 Cleaned up socket listeners in Sidebar");
          }
        } catch (error) {
          console.error("💥 Error during socket cleanup:", error);
        }
      })();
    };
  }, [setSelectedUser]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const closeDialog = () => {
    setIsDialogOpen(false); // Đóng modal
  };

  return (
    <div className="w-full h-full max-w-md mx-auto bg-white">
      {/* Thanh tìm kiếm */}
      <div className="flex items-center justify-between p-2.5">        <div className="flex items-center w-full p-0.5 bg-gray-100 rounded-full">
          <Search className="text-gray-400 h-4 w-4 ml-2 mr-1" />
          <input
            type="text"
            placeholder="Tìm kiếm"
            className="w-full py-2 bg-transparent text-sm focus:outline-none"
            onChange={(e) => {
              const searchText = e.target.value.toLowerCase();
              if (searchText === "") {
                fetchConversations();
              } else {
                // Filter conversations locally
                setChatItems(prevChatItems => 
                  prevChatItems.filter(chat => 
                    (chat.name && chat.name.toLowerCase().includes(searchText)) ||
                    (chat.groupName && chat.groupName.toLowerCase().includes(searchText)) ||
                    (chat.lastMessage && chat.lastMessage.content && 
                     chat.lastMessage.content.toLowerCase().includes(searchText))
                  )
                );
              }
            }}
          />
        </div>

        {/* Nút mở dialog */}
        <button
          onClick={() => setIsDialogOpen(true)}
          className="p-2 hover:bg-gray-100 rounded"
        >
          <UserPlus className="w-5 h-5 text-gray-600" />
        </button>

        <button
          className="p-2 hover:bg-gray-100 rounded"
          onClick={() => setShowCreateGroup(true)}
        >
          <Users className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Thanh điều hướng */}
      <div className="flex justify-between items-center border-b">
        <div>
          <Button variant="ghost" className="text-blue-600 font-medium">
            Tất cả
            <div className=" bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
          </Button>
          <Button variant="ghost" className="text-gray-600 font-medium">
            Chưa đọc
          </Button>
        </div>
        <div className="flex-1 flex justify-end items-center gap-2">
          <Button
            variant="ghost"
            className="text-gray-600 text-sm flex items-center gap-1"
          >
            Phân loại
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Danh sách chat */}
      <div className="h-[calc(100vh-120px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
        {isLoading ? (
          <div className="p-4 text-center">Đang tải...</div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">{error}</div>
        ) : (
          <div className="divide-y">            {chatItems.map((chat) => (
              <div
                key={chat._id}
                className={`flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors duration-300 ${
                  chat.isNew ? 'bg-blue-50 animate-pulse' : ''
                }`}
                onClick={() => {
                  // Clear the "new" status when clicked
                  if (chat.isNew) {
                    setChatItems(prevItems => 
                      prevItems.map(item => 
                        item._id === chat._id ? { ...item, isNew: false } : item
                      )
                    );
                  }
                  setSelectedUser(chat);
                }}
              >
                {chat.avatar ? (
                  <img
                    src={chat.avatar}
                    alt="avatar"
                    className="h-11 w-16 rounded-full object-cover"
                  />
                ) : chat.isGroup ? (
                  <GroupAvatar chat={chat} />
                ) : (
                  <div className="h-11 w-14 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-semibold">
                    {chat.name
                      ?.split(" ")
                      .map((word) => word[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                )}

                <div className="flex flex-col w-full ">
                  <div className="flex justify-between items-center">
                    <h3 className="max-w-[180px] truncate whitespace-nowrap overflow-hidden text-ellipsis">
                      {chat.name && chat.name.trim() !== ""
                        ? chat.name
                        : chat.groupName}
                    </h3>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {formatUpdatedAt(chat.updatedAt)}
                    </span>
                  </div>                <div className="flex justify-between items-center w-full">
                    <div className="flex items-center max-w-[80%]">
                      {chat.isGroup ? (
                        <p className="text-sm text-gray-500 truncate">
                          {chat.lastMessage?.content || "Không có tin nhắn"}
                        </p>
                      ) : (
                        <>
                          {/* Show user online status for regular chats */}
                          <div 
                            className={`h-2 w-2 rounded-full mr-1 ${
                              chat.isOnline ? "bg-green-500" : "bg-gray-300"
                            }`} 
                          />
                          <p className="text-sm text-gray-500 truncate">
                            {chat.lastMessage?.content || "Không có tin nhắn"}
                          </p>
                        </>
                      )}
                    </div>
                    {chat.unseenCount > 0 && (
                      <div className="bg-red-500 text-white rounded-full px-2 py-1 text-xs">
                        {chat.unseenCount}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hiển thị AddFriendModal khi isDialogOpen là true */}
      {isDialogOpen && <FriendPage onClose={closeDialog} />}
      {showCreateGroup && (
        <CreateGroup onClose={() => setShowCreateGroup(false)} />
      )}
    </div>
  );
};

export default Sidebar;
