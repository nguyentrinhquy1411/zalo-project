import { useState } from "react";
import PropTypes from "prop-types";
import {
  MessageSquare,
  Users,
  CheckSquare,
  Cloud,
  Briefcase,
  Settings,
} from "lucide-react";
import NavItem from "./ui/NavItem";

const MenuHome = ({ onOpenProfileModal, onToggleContactSidebar, onShowMessageSidebar }) => {
  // State để kiểm soát việc hiển thị
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"))?.user;

  // Hàm toggle menu
  const openMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Hàm đóng menu khi nhấn ra ngoài
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-16 flex flex-col items-center bg-blue-600 text-white py-4">
      {/* Avatar - Khi nhấn sẽ toggle menu */}
      <div className="relative">
        <div
          className="w-10 h-10 mb-8 rounded-full overflow-hidden cursor-pointer"
          onClick={openMenu}
        >
          {user.profilePic ? (
            <img
              src={user.profilePic}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full object-cover bg-blue-500 text-white flex items-center justify-center text-lg font-semibold">
              {user.fullName
                ?.split(" ")
                .map((word) => word[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
          )}
        </div>

        {isMenuOpen && (
          <div
            className="absolute ml-14 top-0 w-64 bg-white text-black rounded-lg shadow-lg p-4 z-60"
            onClick={(e) => e.stopPropagation()} // Ngăn sự kiện click lan ra ngoài
          >
            <div className="flex items-center gap-3 border-b-2 pb-3">
              <div>
                <h3 className="font-semibold text-sm">{user.fullName}</h3>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <button
                onClick={() => {
                  closeMenu();
                  onOpenProfileModal();
                }}
                className="flex items-center gap-2 text-sm hover:bg-gray-100 p-2 rounded w-full text-left"
              >
                Hồ sơ của bạn
              </button>              <button
                onClick={() => {}} // Future functionality
                className="flex items-center gap-2 text-sm hover:bg-gray-100 p-2 rounded w-full text-left"
              >
                Cài đặt
              </button>
            </div>

            {/* Thông báo */}
            <div className="mt-3 text-xs border-t-2 pt-3">
              <button
                onClick={() => {
                  localStorage.removeItem("user");
                  localStorage.removeItem("userToken");
                  window.location.href = "/login";
                }}
                className="flex items-center gap-2 text-sm hover:bg-gray-100 p-2 rounded w-full text-left"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        )}
      </div>      {/* Thanh điều hướng */}      <nav className="flex-1 flex flex-col items-center gap-4">
        <NavItem
          onClick={onShowMessageSidebar} // Return to message sidebar
          icon={<MessageSquare />}
          label="Tin nhắn"
        />
        <NavItem
          onClick={onToggleContactSidebar}
          icon={<Users />}
          label="Danh bạ"
        />
        <NavItem
          onClick={() => {}} // Future functionality
          icon={<CheckSquare />}
          label="Nhiệm vụ"
        />
      </nav>

      <div className="flex flex-col items-center gap-4 mb-4">
        <NavItem onClick={() => {}} icon={<Cloud />} label="Lưu trữ đám mây" />
        <div className="w-8 h-px bg-blue-400 my-2" aria-hidden="true" />
        <NavItem onClick={() => {}} icon={<Briefcase />} label="Công việc" />
        <NavItem onClick={() => {}} icon={<Settings />} label="Cài đặt" />
      </div>
    </aside>
  );
};

MenuHome.propTypes = {
  onOpenProfileModal: PropTypes.func.isRequired,
  onToggleContactSidebar: PropTypes.func.isRequired,
  onShowMessageSidebar: PropTypes.func.isRequired,
};

export default MenuHome;
