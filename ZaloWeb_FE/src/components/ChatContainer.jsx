import { useState, useEffect, useRef } from "react";
import {
  Smile,
  ImageIcon,
  Paperclip,
  FileSpreadsheet,
  Video,
  MessageSquare,
  MoreHorizontal,
  FolderIcon,
  FileIcon,
  SendHorizonal,
  ThumbsUp,
  Users,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import GroupAvatar from "./GroupAvatar";
import { addEventListener, removeEventListener } from "../services/socket";
import { useUser } from "../context/UserContext";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EmojiPickerComponent from "./EmojiPickerComponent";

import { messageService } from "../services/api/message.service";
import MessageBubble from "../components/MessageBubble";
import AddMemberGroup from "./AddMemberGroup";
import GroupManagement from "./GroupManagement";

const ChatInterface = ({ conversation }) => {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showAddMemberGroup, setShowAddMemberGroup] = useState(false);
  const [showGroupManagement, setShowGroupManagement] = useState(false);
  const { setTypingStatus, getTypingUsers } = useUser();
  const [typingUserIds, setTypingUserIds] = useState([]);

  const toggleAddMemberGroup = () => {
    setShowAddMemberGroup(!showAddMemberGroup);
  };

  const toggleGroupManagement = () => {
    setShowGroupManagement(!showGroupManagement);
  };

  const scrollRef = useRef(null);

  const fileInputRef = useRef(null);
  const imgInputRef = useRef(null);
  const folderInputRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user")).user;

  // Lấy đuôi file
  const getFileExtension = (fileName) => {
    if (!fileName) return "";
    return fileName.split(".").pop();
  };

  // Xử lý chọn emoji
  const handleEmojiSelect = (emoji) => {
    setNewMessage((prev) => prev + emoji);
  };

  // Gửi tin nhắn văn bản
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const newMessageData = {
      conversationId: conversation._id,
      content: newMessage,
    };

    try {
      const sentMessage = await messageService.sendMessage(newMessageData);
      setNewMessage("");
    } catch (error) {
      console.error("Gửi tin nhắn thất bại", error);
    }
  };

  // Gửi file
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      // Gửi file tới backend
      const formData = new FormData();
      formData.append("file", file);
      formData.append("conversationId", conversation._id);
      formData.append("senderId", user._id);

      const response = await messageService.sendFileFolder(formData);
    } catch (error) {
      alert("Không thể gửi file quá 1024MB");
    } finally {
      setIsUploading(false);
    }
  };

  // Gửi folder
  const handleFolderChange = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      console.log("Không có file nào được chọn");
      return;
    }

    setIsUploading(true);

    try {
      const firstFile = files[0];
      const folderName =
        firstFile.webkitRelativePath.split("/")[0] || "UnnamedFolder";

      const response = await messageService.sendFolder({
        conversationId: conversation._id,
        folderName,
        files: Array.from(files),
      });
    } catch (error) {
      alert("Không thể gửi folder quá 1024MB");
    } finally {
      setIsUploading(false);
    }
  };

  // Gửi ảnh
  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      // Gửi file tới backend
      const formData = new FormData();
      formData.append("file", file);
      formData.append("conversationId", conversation._id);
      formData.append("senderId", user._id);

      const response = await messageService.sendFileFolder(formData);
    } catch (error) {
      console.error("Lỗi khi gửi file:", error.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Tự động cuộn xuống khi có tin nhắn mới
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);  // Khởi tạo socket và lấy tin nhắn ban đầu
  useEffect(() => {
    // Import socket module outside the effect to avoid duplicate imports
    const socketModulePromise = import("../services/socket");

    // Generate a unique ID for this component instance
    const chatId = `chat_${conversation._id}_${Date.now()}`;
    // Create a flag to prevent state updates after unmount
    let isMounted = true;
    
    // Fetch messages function
    const fetchMessages = async () => {
      try {
        const data = await messageService.getMessagesByConversationId({
          conversationId: conversation._id,
          beforeMessageId: null,
          limit: 50,
        });
        
        // Only update state if component is still mounted
        if (isMounted) {
          setMessages(data.data || []);
        }
      } catch (error) {
        console.error("Lỗi khi lấy tin nhắn:", error);
      }
    };

    // Fetch messages immediately when component mounts or conversation changes
    fetchMessages();

  // Handler for new messages with improved validation and error handling
    const handleNewMessage = (message) => {
      // Verify message is valid and component is still mounted
      if (!message || !message.conversationId || !isMounted) {
        console.warn("⚠️ Received invalid message data or component unmounted:", 
                    message ? `message ID: ${message._id || 'unknown'}` : 'undefined message');
        return;
      }
      
      // Check if message belongs to the current conversation
      if (message.conversationId === conversation._id) {
        console.log("📩 Processing new message:", message._id, "for conversation:", conversation._id);
        
        try {
          setMessages(prevMessages => {
            // Check if message already exists to avoid duplicates
            if (prevMessages.some(m => m._id === message._id)) {
              console.log("⚠️ Duplicate message detected, skipping:", message._id);
              return prevMessages;
            }
            
            // Add new message and ensure messages are sorted by timestamp
            const updatedMessages = [...prevMessages, message];
            updatedMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            
            // Auto-scroll to latest message after state update
            setTimeout(() => {
              if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
              }
            }, 50);
            
            return updatedMessages;
          });
        } catch (error) {
          console.error("💥 Error updating messages state:", error);
        }
      }
    };    // Handler for recalled messages with improved validation and error handling
    const handleMessageRecalled = (data) => {
      // Validate data and check component is mounted
      if (!data || !data.conversationId || !data._id || !isMounted) {
        console.warn("⚠️ Received invalid recall data or component unmounted:", 
                    data ? `message ID: ${data._id || 'unknown'}` : 'undefined data');
        return;
      }
      
      // Only process if relevant to current conversation
      if (data.conversationId === conversation._id) {
        console.log("🗑️ Marking message as recalled:", data._id);
        
        try {
          setMessages(prevMessages => {
            // Check if the message exists before updating
            const messageExists = prevMessages.some(m => m._id === data._id);
            if (!messageExists) {
              console.warn("⚠️ Attempted to recall non-existent message:", data._id);
              return prevMessages;
            }
            
            // Update message status to recalled
            return prevMessages.map(msg =>
              msg._id === data._id ? { 
                ...msg, 
                status: "recalled", 
                content: "", 
                recalledAt: new Date().toISOString(),
                recalledBy: data.recalledBy || null
              } : msg
            );
          });
        } catch (error) {
          console.error("💥 Error updating message recall status:", error);
        }
      }
    };    // Handler for deleted messages with improved validation and error handling
    const handleMessageDeleted = (data) => {
      // Validate data and check component is mounted
      if (!data || !data.conversationId || !data._id || !isMounted) {
        console.warn("⚠️ Received invalid deletion data or component unmounted:", 
                    data ? `message ID: ${data._id || 'unknown'}` : 'undefined data');
        return;
      }
      
      // Only process if relevant to current conversation
      if (data.conversationId === conversation._id) {
        try {
          const userId = JSON.parse(localStorage.getItem("user"))?.user?._id;
          
          if (!userId) {
            console.error("❌ User ID not found in localStorage");
            return;
          }
          
          // Check if this message was deleted for the current user
          if (data.deletedFor === userId || data.deletedFor === "all") {
            console.log("🗑️ Removing deleted message from view:", data._id);
            
            setMessages(prevMessages => {
              // Verify the message exists before attempting to remove
              const messageExists = prevMessages.some(m => m._id === data._id);
              if (!messageExists) {
                console.warn("⚠️ Attempted to delete non-existent message:", data._id);
                return prevMessages;
              }
              
              // Remove the message from the view
              return prevMessages.filter(msg => msg._id !== data._id);
            });
          } else {
            console.log("ℹ️ Message deleted but not for current user:", data._id);
          }
        } catch (error) {
          console.error("💥 Error processing message deletion:", error);
        }
      }
    };    // Setup socket event listeners with improved error handling and connection monitoring
    const setupSocketListeners = async () => {
      try {
        const socketModule = await socketModulePromise;
        
        // Don't add listeners if component unmounted during async operation
        if (!isMounted) {
          console.log("⚠️ Component unmounted before socket listeners could be added");
          return null;
        }
        
        const { addEventListener, getSocket } = socketModule;
        const socket = getSocket();
        
        // Check if socket is available and connected
        if (!socket) {
          console.error("❌ Socket not initialized in Chat component");
          return socketModule;
        }
        
        console.log("🔌 Socket state in ChatContainer:", 
                    socket.connected ? "Connected" : "Disconnected", 
                    "ID:", socket.id || "unknown");
        
        // Handler for connection state changes
        const handleConnectionState = (state) => {
          if (!isMounted) return;
          
          if (state.connected) {
            console.log("✅ Socket reconnected, refreshing messages");
            // Refresh messages when connection is restored
            fetchMessages();
          } else {
            console.log("⚠️ Socket disconnected in ChatContainer");
          }
        };
        
        // Register event listeners for messages
        addEventListener("newMessage", chatId, handleNewMessage);
        addEventListener("messageRecalled", chatId, handleMessageRecalled);
        addEventListener("messageDeleted", chatId, handleMessageDeleted);
        addEventListener("connection", chatId, handleConnectionState);
        
        // Setup typing status listener
        addEventListener("typingStatus", chatId, (data) => {
          if (!data || !data.conversationId || data.conversationId !== conversation._id) return;
          console.log("⌨️ Typing status update:", data.userId, data.isTyping ? "is typing" : "stopped typing");
        });
        
        // Store the socketModule for cleanup
        return socketModule;
      } catch (error) {
        console.error("💥 Failed to load socket module:", error);
        return null;
      }
    };
    
    // Setup socket listeners and store the promise
    const socketSetupPromise = setupSocketListeners();
      // Clean up listeners when component unmounts with improved error handling
    return () => {
      // Set flag to prevent state updates after unmount
      isMounted = false;
      console.log("🧹 Starting cleanup for Chat component:", chatId);
      
      // Use the async/await pattern with IIFE for cleanup
      (async () => {
        try {
          const socketModule = await socketSetupPromise;
          if (socketModule) {
            const { removeEventListener } = socketModule;
            
            // Remove all event listeners to prevent memory leaks
            removeEventListener("newMessage", chatId);
            removeEventListener("messageRecalled", chatId);
            removeEventListener("messageDeleted", chatId);
            removeEventListener("connection", chatId);
            removeEventListener("typingStatus", chatId);
            
            console.log("✅ Successfully cleaned up socket listeners for chat:", chatId);
          } else {
            console.log("ℹ️ No socket module to clean up for chat:", chatId);
          }
        } catch (error) {
          console.error("💥 Error during socket cleanup:", error);
        }
      })();
      
      // Clear typing status before unmounting
      try {
        setTypingStatus(conversation._id, false);
      } catch (error) {
        console.error("❌ Failed to clear typing status on unmount:", error);
      }
    };
  }, [conversation._id]);
  // Xử lý nhấn Enter để gửi tin nhắn
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
      // Clear typing status when sending message
      setTypingStatus(conversation._id, false);
    }
  };
  
  // Effect to update typing users list
  useEffect(() => {
    const userId = user._id;
    const updateTypingUsers = () => {
      const currentTypingUsers = getTypingUsers(conversation._id, userId);
      setTypingUserIds(currentTypingUsers);
    };
    
    // Update immediately and set interval
    updateTypingUsers();
    const interval = setInterval(updateTypingUsers, 1000);
    
    return () => clearInterval(interval);
  }, [conversation._id, user._id]);

  return (
    <div className="flex h-screen flex-col bg-white">
      {isUploading && (
        <div className="absolute inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
            <p className="text-white mt-4">Đang gửi. Vui lòng chờ...</p>
          </div>
        </div>
      )}
      {/* Header */}
      <header className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-3">
          <Avatar className="h-16 w-16 shrink-0 grow-0 basis-auto flex items-center justify-center">
            {conversation.avatar ? (
              <img
                src={conversation.avatar}
                alt="avatar"
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : conversation.isGroup ? (
              <GroupAvatar chat={conversation} />
            ) : (
              <div className="size-14 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-semibold">
                {conversation.name
                  ?.split(" ")
                  .map((word) => word[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
            )}
          </Avatar>
          <span className="font-medium">
            {conversation.name && conversation.name.trim() !== ""
              ? conversation.name
              : conversation.groupName}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleAddMemberGroup}>
            <Users className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <MessageSquare className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleGroupManagement}>
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Chat Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble
            key={message._id}
            message={message}
            user={user}
            getFileExtension={getFileExtension}
          />
        ))}
      </div>

      {/* Input Area */}
      <div className="w-full flex mx-auto border-t">
        <div className="w-full flex flex-col gap-2">
          <div className="w-full flex items-center gap-2 p-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Smile className="h-5 w-5 text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => imgInputRef.current.click()}
            >
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
            </Button>
            <input
              type="file"
              accept="image/*"
              ref={imgInputRef}
              className="hidden"
              onChange={handleImageChange}
            />
            {/* Chọn file và folder */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />
            <input
              type="file"
              ref={folderInputRef}
              className="hidden"
              webkitdirectory="true"
              directory="true"
              onChange={handleFolderChange}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Paperclip className="h-5 w-5 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => fileInputRef.current.click()}>
                  <FileIcon className="mr-2 h-4 w-4" />
                  Chọn File
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => folderInputRef.current.click()}
                >
                  <FolderIcon className="mr-2 h-4 w-4" />
                  Chọn Thư mục
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon">
              <FileSpreadsheet className="h-5 w-5 text-gray-500" />
            </Button>            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
          <div className="w-full flex flex-col">
            {typingUserIds.length > 0 && (
              <div className="text-xs text-gray-500 italic px-2">
                {typingUserIds.length === 1 ? 
                  "Người dùng đang nhập tin nhắn..." : 
                  `${typingUserIds.length} người dùng đang nhập tin nhắn...`}
              </div>
            )}
            <div className="w-full flex items-center gap-2 p-2">              <input
                type="text"
                placeholder={`Nhập @, tin nhắn tới ${conversation.name}`}
                className="w-full outline-none flex-1"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  // Update typing status
                  setTypingStatus(conversation._id, e.target.value.length > 0);
                }}
                onFocus={() => {
                  if (newMessage.length > 0) {
                    setTypingStatus(conversation._id, true);
                  }
                }}
                onBlur={() => setTypingStatus(conversation._id, false)}
                onKeyDown={handleKeyPress}
              />
              <EmojiPickerComponent onEmojiSelect={handleEmojiSelect} />
              {newMessage.length === 0 ? (
                <button className=" text-gray-500 hover:text-gray-700">
                  <ThumbsUp className="h-5 w-5" />
                </button>
              ) : (
                <button
                  onClick={handleSendMessage}
                  className=" text-blue-500 hover:text-blue-700"
                >
                  <SendHorizonal className="" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {showAddMemberGroup && (
        <AddMemberGroup
          onClose={toggleAddMemberGroup}
          conversation={conversation}
        />
      )}
      {showGroupManagement && (
        <GroupManagement
          onClose={toggleGroupManagement}
          conversation={conversation}
        />
      )}
    </div>
  );
};

export default ChatInterface;
