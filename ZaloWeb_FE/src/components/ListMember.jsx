import { X, Plus, MoreHorizontal, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";

import AddMemberGroup from "./AddMemberGroup";
import { removeMemberFromGroup } from "../services/api/conversation.service";

const ListMember = ({ onClose, conversation }) => {
  const user = JSON.parse(localStorage.getItem("user")).user;

  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [currentMember, setCurrentMember] = useState(null);
  const [showAddMemberGroup, setShowAddMemberGroup] = useState(false);
  const menuRef = useRef(null);

  const toggleAddMemberGroup = () => {
    setShowAddMemberGroup(!showAddMemberGroup);
  };

  // Hàm xử lý chuột phải
  const handleContextMenu = (event, member) => {
    event.preventDefault();
    setCurrentMember(member);
    setMenuPosition({ x: event.clientX, y: event.clientY });
    setMenuVisible(true);
  };

  // Hàm xử lý khi chọn một tùy chọn trong menu
  const handleMenuOptionClick = (option) => {
    setMenuVisible(false); // Ẩn menu sau khi chọn
    if (option === "addViceGroup") {
      console.log(`Thêm nhóm phó cho ${currentMember.name}`);
      // Thực hiện hành động thêm nhóm phó
    } else if (option === "removeFromGroup") {
      console.log(`Xóa ${currentMember.name} khỏi nhóm`);
      // Thực hiện hành động xóa khỏi nhóm
    } else if (option === "leaveGroup") {
      console.log(`${currentMember.name} đã rời nhóm`);
      // Thực hiện hành động rời nhóm
    }
  };

  const handelLeaveGroup = async (memberId) => {
    try {
      await removeMemberFromGroup(conversation._id, memberId);
      onClose();
    } catch (error) {
      alert(error.message);
    }
  };

  // Đóng menu nếu click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="w-[360px] h-[460px] bg-white rounded-lg shadow-lg p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <button
            className="text-gray-600 hover:text-black p-1"
            onClick={onClose}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <p className="font-medium">Danh sách thành viên</p>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Thêm thành viên */}
        <Button
          className="w-full bg-gray-100 text-sm text-black flex items-center justify-center gap-2 hover:bg-gray-200"
          onClick={toggleAddMemberGroup}
        >
          <Plus size={16} />
          Thêm thành viên
        </Button>

        {/* Danh sách */}
        <p className="text-sm mt-4 mb-2 text-gray-700">
          Danh sách thành viên ({conversation.participants.length})
        </p>

        {/* Thành viên */}
        <div className="flex flex-col gap-3">
          {conversation.participants.map((m) => (
            <div key={m._id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {m.profilePic ? (
                  <img
                    src={m.profilePic}
                    alt="avatar"
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-semibold">
                    {m.fullName
                      ?.split(" ")
                      .map((word) => word[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">{m.fullName}</p>
                  {m._id === conversation.groupLeader && (
                    <p className="text-xs text-gray-500 ">Trưởng nhóm</p>
                  )}
                </div>
              </div>
              <div
                className="flex justify-end mb-2"
                onClick={(e) => handleContextMenu(e, m)}
              >
                <MoreHorizontal className="text-gray-500" />
              </div>
              {!m.isFriend && (
                <Button className="text-sm bg-blue-100 text-blue-600 hover:bg-blue-200">
                  Kết bạn
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Menu tùy chỉnh */}
        {menuVisible && (
          <div
            ref={menuRef}
            className="absolute bg-white border rounded shadow-lg"
            style={{ top: menuPosition.y, left: menuPosition.x }}
          >
            <ul>
              {currentMember._id !== conversation.groupLeader &&
                user._id === conversation.groupLeader && (
                  <>
                    <li
                      className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                      onClick={() => console.log("chào")}
                    >
                      Thêm nhóm phó
                    </li>
                    <li
                      className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                      onClick={() => handelLeaveGroup(currentMember._id)}
                    >
                      Xóa khỏi nhóm
                    </li>
                  </>
                )}
              {currentMember._id === conversation.groupLeader &&
                user._id === conversation.groupLeader && (
                  <li
                    className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                    onClick={() => handleMenuOptionClick("leaveGroup")}
                  >
                    Rời nhóm
                  </li>
                )}
            </ul>
          </div>
        )}
      </div>
      {/* Hiển thị */}
      {showAddMemberGroup && (
        <AddMemberGroup
          onClose={toggleAddMemberGroup}
          conversation={conversation}
        />
      )}
    </div>
  );
};

export default ListMember;
