import { X, ChevronLeft } from "lucide-react";

const UpdateGroup = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="w-[450px] h-[380px] bg-white rounded shadow-lg p-4 gap-4 relative">
        {/* Header */}
        <div className="flex items-center justify-between ">
          <button
            className="text-gray-600 hover:text-black p-1"
            onClick={onClose}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold">Đổi tên nhóm</h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <hr className="border-t border-gray-300 w-full" />
        {/* Hành động */}
        <div className="flex justify-center items-center ">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-300 shadow-md mt-4">
            <img
              src="/user.jpg"
              alt="Profile"
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>

        <div className="flex flex-col justify-center items-center gap-2 mt-6">
          <p>Bạn có chắc chắn muốn đổi tên nhóm, khi xác nhận tên</p>
          <p>nhóm mới sẽ hiển thị với tất cả thành viên</p>
          <input
            type="text"
            defaultValue="Phan Nguyễn Khôi Nguyên"
            className="border border-gray-300 rounded p-2 w-full mt-4 mb-4"
          />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            onClick={() => console.log("Tạo nhóm")}
            className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded transition-all duration-200"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateGroup;
