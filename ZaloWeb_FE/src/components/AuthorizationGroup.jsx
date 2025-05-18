import { Button } from "@/components/ui/button";
import { X, ChevronLeft } from "lucide-react";
import { useState } from "react";

import AddDeputyGroup from "./AddDeputyGroup";
import ChangeLeaderGroup from "./ChangeLeaderGroup";

const AuthorizationGroup = ({ onClose }) => {
  const [showAddDeputyGroup, setShowAddDeputyGroup] = useState(false);
  const [showChangeLeaderGroup, setShowChangeLeaderGroup] = useState(false);

  const toggleAddDeputyGroup = () => {
    setShowAddDeputyGroup(!showAddDeputyGroup);
  };

  const toggleChangeLeaderGroup = () => {
    setShowChangeLeaderGroup(!showChangeLeaderGroup);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="w-[450px] h-[250px] bg-white rounded shadow-lg p-4 gap-4 relative">
        {/* Header */}
        <div className="flex items-center justify-between ">
          <button
            className="text-gray-600 hover:text-black p-1"
            onClick={onClose}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold">Quản lý nhóm</h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <hr className="border-t border-gray-300 w-full" />
        {/* Hành động */}
        <div className="flex flex-col gap-2 mt-8">
          <Button
            variant="outline"
            className="w-full"
            onClick={toggleAddDeputyGroup}
          >
            Thêm phó nhóm
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={toggleChangeLeaderGroup}
          >
            Chuyển quyền nhóm trưởng
          </Button>
        </div>
      </div>
      {/* Hiển thị */}
      {showAddDeputyGroup && <AddDeputyGroup onClose={toggleAddDeputyGroup} />}
      {showChangeLeaderGroup && (
        <ChangeLeaderGroup onClose={toggleChangeLeaderGroup} />
      )}
    </div>
  );
};

export default AuthorizationGroup;
