import { useState, useEffect, useMemo } from "react";
import { Users, UserPlus, UsersRound, UserCheck, Search, ChevronLeft } from "lucide-react";
import AddFriendModal from "./AddFriendModal";
import { friendService } from "../services/api/friend.service";
import { getSocket } from "../services/socket";
import PropTypes from "prop-types";

const menuItems = [
  {
    icon: <Users className="w-5 h-5" />,
    label: "Danh sách bạn bè",
  },
  {
    icon: <UsersRound className="w-5 h-5" />,
    label: "Danh sách nhóm và cộng đồng",
  },
  {
    icon: <UserPlus className="w-5 h-5" />,
    label: "Lời mời kết bạn",
  },
  {
    icon: <UserCheck className="w-5 h-5" />,
    label: "Lời mời vào nhóm và cộng đồng",
  },
];

export default function ContactSidebar({ onClose }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeMenuIndex, setActiveMenuIndex] = useState(0); // Theo dõi menu được chọn
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [groupInvitations, setGroupInvitations] = useState([]);
  const socket = getSocket();

  // Fetch friends list
  const fetchFriends = async () => {
    try {
      setLoading(true);
      const response = await friendService.getFriends();
      setFriends(response.data || []);
    } catch (error) {
      console.error("Error fetching friends:", error);
    } finally {
      setLoading(false);
    }
  };  // Fetch friend requests
  const fetchFriendRequests = async () => {
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem("user"));
      console.log("userData:", userData);
      
      if (!userData.user._id) return;

      console.log("Fetching friend requests for user ID:", userData.user._id);
      
      
      const response = await friendService.getFriendRequests(userData.user._id);
      // The API returns { data: { totalRequests, requests } }
      if (response.data && response.data.requests) {
        setFriendRequests(response.data.requests);
      } else {
        setFriendRequests([]);
      }
    } catch (error) {
      console.error("Error fetching friend requests:", error);
      setFriendRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchFriends();
    fetchFriendRequests();
    // TODO: Fetch group invitations
  }, []);
  // Socket event listeners
  useEffect(() => {
    if (socket) {
      // Listen for new friend request
      socket.on("friendRequest", (data) => {
        console.log("Received friend request:", data);
        fetchFriendRequests(); // Refresh friend requests
      });

      // Listen for friend request accepted
      socket.on("friendRequestAccepted", (data) => {
        console.log("Friend request accepted:", data);
        fetchFriends(); // Refresh friend list
        fetchFriendRequests(); // Refresh friend requests
      });

      // Listen for friend request rejected
      socket.on("friendRequestRejected", (data) => {
        console.log("Friend request rejected:", data);
        fetchFriendRequests(); // Refresh friend requests
      });

      return () => {
        socket.off("friendRequest");
        socket.off("friendRequestAccepted");
        socket.off("friendRequestRejected");
      };
    }
  }, [socket]);

  // Handle accepting friend request
  const handleAccept = async (requestId) => {
    try {
      await friendService.acceptRequest(requestId);
      fetchFriendRequests();
      fetchFriends();
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };
  // Handle rejecting friend request
  const handleReject = async (requestId) => {
    try {
      await friendService.rejectRequest(requestId);
      fetchFriendRequests();
    } catch (error) {
      console.error("Error rejecting friend request:", error);
    }
  };

  const openDialog = () => setIsDialogOpen(true);
  const closeDialog = () => setIsDialogOpen(false);

  // Filter friends by search term
  const filteredFriends = useMemo(() => {
    if (!searchTerm.trim()) return friends;
    return friends.filter((friend) =>
      friend.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [friends, searchTerm]);

  // Group friends alphabetically
  const groupedFriends = useMemo(() => {
    if (!filteredFriends.length) return {};

    // Sort friends by fullName
    const sorted = [...filteredFriends].sort((a, b) =>
      a.fullName.localeCompare(b.fullName, "vi")
    );

    // Group by first letter
    return sorted.reduce((groups, friend) => {
      const firstLetter = friend.fullName.charAt(0).toUpperCase();
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(friend);
      return groups;
    }, {});
  }, [filteredFriends]);
  return (
    <div className="w-full bg-white rounded-md shadow p-4 space-y-4">
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          {onClose && (
            <button
              onClick={onClose}
              className="mr-2 p-1 hover:bg-gray-100 rounded-full"
              aria-label="Quay lại"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-lg font-semibold">Danh bạ</h1>
        </div>
      </div>
      
      {/* Thanh tìm kiếm */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button onClick={openDialog} className="p-2 hover:bg-gray-100 rounded">
          <UserPlus className="w-5 h-5 text-gray-600" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded">
          <Users className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Danh sách menu */}
      <div className="space-y-1">
        {menuItems.map((item, index) => (
          <div
            key={index}
            onClick={() => setActiveMenuIndex(index)}
            className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer 
              ${
                index === activeMenuIndex
                  ? "bg-blue-100 font-medium text-blue-700"
                  : "hover:bg-blue-50 text-gray-700"
              }`}
          >
            {item.icon}
            <span>{item.label}</span>
            {index === 2 && friendRequests.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full ml-auto">
                {friendRequests.length}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Dialog thêm bạn */}
      {isDialogOpen && (
        <AddFriendModal
          onClose={closeDialog}
          onSearch={(user) => {
            closeDialog();
            // Handle search result - maybe open user info modal
          }}
        />
      )}

      {/* Danh sách bạn bè - được sắp xếp theo thứ tự chữ cái */}
      {activeMenuIndex === 0 && (
        <div className="space-y-4 mt-2">
          <h2 className="text-lg font-semibold">Danh sách bạn bè</h2>
          {loading ? (
            <div className="text-center py-4">Đang tải...</div>
          ) : Object.keys(groupedFriends).length === 0 ? (
            <p className="text-gray-500">Không có bạn bè nào.</p>
          ) : (
            Object.entries(groupedFriends).map(([letter, letterFriends]) => (
              <div key={letter} className="mb-4">
                <div className="sticky top-0 bg-gray-100 px-2 py-1 rounded">
                  <h3 className="text-sm font-medium text-gray-600">{letter}</h3>
                </div>
                <div className="space-y-2 mt-2">
                  {letterFriends.map((friend) => (
                    <div
                      key={friend._id}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                    >
                      {friend.profilePic ? (
                        <img
                          src={friend.profilePic}
                          alt={friend.fullName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-semibold">
                          {friend.fullName
                            .split(" ")
                            .map((word) => word[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{friend.fullName}</p>
                        {friend.isOnline ? (
                          <p className="text-xs text-green-600">Đang hoạt động</p>
                        ) : (
                          <p className="text-xs text-gray-500">
                            {friend.lastSeen
                              ? `Hoạt động ${new Date(
                                  friend.lastSeen
                                ).toLocaleDateString("vi-VN")}`
                              : "Không hoạt động"}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Danh sách nhóm và cộng đồng */}
      {activeMenuIndex === 1 && (
        <div className="space-y-4 mt-2">
          <h2 className="text-lg font-semibold">Danh sách nhóm và cộng đồng</h2>
          <p className="text-gray-500">Chưa có nhóm nào.</p>
          {/* TODO: Implement group list */}
        </div>
      )}

      {/* Danh sách lời mời kết bạn */}
      {activeMenuIndex === 2 && (
        <div className="space-y-4 mt-2">
          <h2 className="text-lg font-semibold">Lời mời kết bạn</h2>
          {loading ? (
            <div className="text-center py-4">Đang tải...</div>
          ) : friendRequests.length === 0 ? (
            <p className="text-gray-500">Không có lời mời kết bạn nào.</p>
          ) : (
            friendRequests.map((request) => (
              <div
                key={request._id}
                className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50"
              >
                {request.actionUser.profilePic ? (
                  <img
                    src={request.actionUser.profilePic}
                    alt={request.actionUser.fullName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-semibold">
                    {request.actionUser.fullName
                      .split(" ")
                      .map((word) => word[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium">{request.actionUser.fullName}</p>
                  <p className="text-sm text-gray-500">
                    Muốn kết bạn với bạn
                  </p>
                </div>                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(request._id)}
                    className="border border-gray-300 rounded px-3 py-1 hover:bg-gray-100"
                  >
                    Chấp nhận
                  </button>
                  <button
                    onClick={() => handleReject(request._id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    Từ chối
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Danh sách lời mời vào nhóm và cộng đồng */}      {activeMenuIndex === 3 && (
        <div className="space-y-4 mt-2">
          <h2 className="text-lg font-semibold">Lời mời vào nhóm</h2>
          <p className="text-gray-500">Không có lời mời vào nhóm nào.</p>
          {/* TODO: Implement group invitations */}
        </div>
      )}
    </div>
  );
}

ContactSidebar.propTypes = {
  onClose: PropTypes.func
};
