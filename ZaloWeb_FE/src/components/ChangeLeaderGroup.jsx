import { useState } from "react";
import { X, ChevronLeft, Search } from "lucide-react";

const ChangeLeaderGroup = ({ onClose, onSelect, conversation }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const dummyUsers = conversation.participants;

  const sortedUsers = [...dummyUsers].sort((a, b) =>
    a.fullName.localeCompare(b.fullName, "vi")
  );

  const handleChangeLeader = async () => {
    onSelect(selectedUser);
    onClose();
  };

  const toggleUser = (user) => {
    if (selectedUser && selectedUser._id === user._id) {
      setSelectedUser(null);
    } else {
      setSelectedUser(user);
    }
  };

  const isSelected = (id) => selectedUser?._id === id;

  const isCreateGroupDisabled = !selectedUser;

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
          <h2 className="text-lg font-semibold">Chuyển quyền nhóm trưởng</h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <hr className="border-t border-gray-300 w-full" />

        <div className="relative">
          <input
            placeholder="Nhập tên, số điện thoại, hoặc danh sách số điện thoại"
            className="w-full px-10 py-2 border rounded text-sm focus:outline-none"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Search className="w-5 h-5" />
          </div>
        </div>

        <div className="flex flex-1 gap-4 overflow-hidden transition-all duration-300">
          <div className="flex-1 overflow-y-auto pr-1">
            <p className="text-sm font-medium text-gray-600 mb-1">
              Danh sách thành viên nhóm
            </p>
            {sortedUsers.map((user) => (
              <div
                key={user._id}
                className="flex items-center gap-3 py-2 cursor-pointer"
                onClick={() => toggleUser(user)}
              >
                <input
                  type="checkbox"
                  checked={isSelected(user._id)}
                  readOnly
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
        </div>

        <hr className="border-t border-gray-300 w-full my-4" />

        <div className="flex justify-end gap-2 mt-auto">
          <button
            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            onClick={handleChangeLeader}
            className={`px-4 py-2 text-sm text-white rounded hover:bg-blue-700 transition-all duration-200 ${
              isCreateGroupDisabled
                ? "bg-blue-300 cursor-not-allowed opacity-50"
                : "bg-blue-600"
            }`}
            disabled={isCreateGroupDisabled}
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangeLeaderGroup;
