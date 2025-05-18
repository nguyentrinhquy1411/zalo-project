import { useState, useEffect } from "react";
import { X, ChevronLeft, Search } from "lucide-react";
import { addMembersToGroup } from "../services/api/conversation.service";
import { friendService } from "../services/api/friend.service";

const AddMemberGroup = ({ onClose, conversation }) => {
  console.log("conversation AddMemberGroup: ", conversation);

  const [selectedUsers, setSelectedUsers] = useState([]);
  const [friendList, setFriendList] = useState([]);
  const [alreadyInGroup, setAlreadyInGroup] = useState(new Set()); // Tạo một Set để lưu người đã có trong nhóm

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const friends = await friendService.getFriends();
        console.log("Danh sách bạn bè: ", friends.data);
        setFriendList(friends.data);
        const participants = conversation?.participants || [];
        setAlreadyInGroup(new Set(participants.map((user) => user._id)));
      } catch (error) {
        console.error(error.message);
      }
    };
    fetchFriends();
  }, [conversation]);

  const toggleUser = (user) => {
    // Kiểm tra xem người đó đã có trong nhóm chưa, nếu có thì không cho chọn
    if (alreadyInGroup.has(user._id)) {
      return; // Nếu có trong nhóm, không cho chọn
    }
    setSelectedUsers((prev) => {
      const exists = prev.find((u) => u._id === user._id);
      if (exists) return prev.filter((u) => u._id !== user._id);
      return [...prev, user];
    });
  };

  const handleAddMembers = async () => {
    try {
      const newMemberIds = selectedUsers.map((user) => user._id);

      const response = await addMembersToGroup(conversation._id, newMemberIds);
      console.log("Thêm thành viên thành công:", response);

      // Gọi callback hoặc đóng modal, tuỳ bạn
      onClose(); // hoặc show toast thông báo thành công
    } catch (error) {
      console.error("Lỗi khi thêm thành viên:", error.message);
      alert("Không thể thêm thành viên vào nhóm. Vui lòng thử lại.");
    }
  };

  const sortedUsers = [...friendList].sort((a, b) =>
    a.fullName.localeCompare(b.fullName, "vi")
  );

  const isSelected = (id) =>
    selectedUsers.findIndex((u) => u._id === id) !== -1;

  // Kiểm tra số lượng người dùng được chọn để kích hoạt nút "Tạo nhóm"
  const isCreateGroupDisabled = selectedUsers.length < 1;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="w-[500px] h-[650px] bg-white rounded shadow-lg p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <button
            className="text-gray-600 hover:text-black p-1"
            onClick={onClose}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold">Thêm thành viên vào nhóm</h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <hr className="border-t border-gray-300 w-full" />

        {/* PHẦN TÌM KIẾM */}
        <div className="relative">
          <input
            placeholder="Nhập tên, số điện thoại, hoặc danh sách số điện thoại"
            className="w-full px-10 py-2 border rounded text-sm focus:outline-none"
          />
          {/* Icon kính lúp */}
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Search className="w-5 h-5" />
          </div>
        </div>

        {/* PHẦN CHÍNH: Trò chuyện gần đây + Đã chọn */}
        <div className="flex flex-1 gap-4 overflow-hidden transition-all duration-300">
          {/* TRÒ CHUYỆN GẦN ĐÂY */}
          <div className="flex-1 overflow-y-auto pr-1 border-r">
            <p className="text-sm font-medium text-gray-600 mb-1">
              Trò chuyện gần đây
            </p>
            {sortedUsers.map((user) => (
              <div
                key={user._id}
                className={`flex items-center gap-3 py-2 cursor-pointer ${
                  alreadyInGroup.has(user._id) ? "opacity-50" : ""
                }`}
                onClick={() => toggleUser(user)}
              >
                <input
                  type="checkbox"
                  checked={isSelected(user._id)}
                  readOnly
                  disabled={alreadyInGroup.has(user._id)} // Vô hiệu hóa chọn nếu người đã có trong nhóm
                />
                {user.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt="avatar"
                    className="h-11 w-11 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-11 w-11 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-semibold">
                    {user.fullName
                      ?.split(" ")
                      .map((word) => word[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </div>
                )}
                <span>{user.fullName}</span>
              </div>
            ))}
          </div>

          {/* ĐÃ CHỌN: chỉ hiển thị khi có user và showSelectedUsers là true */}
          {selectedUsers.length > 0 && (
            <div className="w-1/2 overflow-y-auto pl-2">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-sm font-medium text-gray-700">
                  Đã chọn {selectedUsers.length}/100
                </h2>
              </div>
              <div className="space-y-2">
                {selectedUsers.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded"
                  >
                    <div className="flex items-center gap-2">
                      {user.profilePic ? (
                        <img
                          src={user.profilePic}
                          alt="avatar"
                          className="h-11 w-11 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-11 w-11 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-semibold">
                          {user.fullName
                            ?.split(" ")
                            .map((word) => word[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </div>
                      )}
                      <span>{user.fullName}</span>
                    </div>
                    <button onClick={() => toggleUser(user)}>
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <hr className="border-t border-gray-300 w-full my-4" />

        {/* Footer */}
        <div className="flex justify-end gap-2 mt-auto">
          <button
            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            onClick={handleAddMembers}
            className={`px-4 py-2 text-sm text-white rounded hover:bg-blue-700 transition-all duration-200 ${
              isCreateGroupDisabled
                ? "bg-blue-300 cursor-not-allowed opacity-50"
                : "bg-blue-600"
            }`}
            disabled={isCreateGroupDisabled} // Vô hiệu hóa nút khi ít hơn 2 người được chọn
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMemberGroup;
