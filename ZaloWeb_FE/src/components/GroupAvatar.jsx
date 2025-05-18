import React from "react";

const GroupAvatar = ({ chat }) => {
  const generateInitials = (name) => {
    return name
      ?.split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const participants = chat.participants || [];
  const total = participants.length;

  // Avatar riêng nếu có
  if (chat.avatar) {
    return (
      <img
        src={chat.avatar}
        alt="group avatar"
        className="h-12 w-12 rounded-full object-cover"
      />
    );
  }

  // 🔺 3 người: tam giác đều
  if (total === 3) {
    const pos = [
      "top-0 left-1/2 transform -translate-x-1/2 z-10", // trên giữa
      "bottom-0 left-0", // dưới trái
      "bottom-0 right-0", // dưới phải
    ];
    return (
      <div className="h-14 w-14 relative shrink-0 grow-0 basis-auto">
        {participants.slice(0, 3).map((p, i) => (
          <div
            key={i}
            className={`absolute h-8 w-8 rounded-full border-2 border-white ${pos[i]}`}
          >
            {p.profilePic ? (
              <img
                src={p.profilePic}
                className="h-full w-full object-cover rounded-full"
              />
            ) : (
              <div className="h-full w-full bg-blue-500 text-white flex items-center justify-center text-xs font-semibold rounded-full">
                {generateInitials(p.fullName)}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }
  // 👬 2 người: hiển thị cạnh nhau
  // 👬 2 người: hiển thị cạnh nhau
  if (total === 2) {
    return (
      <div className="h-10 w-14 flex items-center justify-center shrink-0 grow-0 basis-auto">
        {participants.slice(0, 2).map((p, i) => (
          <div
            key={i}
            className="h-8 w-10 rounded-full border-2 border-white overflow-hidden"
          >
            {p.profilePic ? (
              <img
                src={p.profilePic}
                alt="avatar"
                className="h-full w-full object-cover rounded-full"
              />
            ) : (
              <div className="h-full w-full bg-blue-500 text-white flex items-center justify-center text-xs font-semibold rounded-full">
                {generateInitials(p.fullName)}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // 👨‍👩‍👧‍👦 4 người: grid 2x2
  // 👨‍👩‍👧‍👦 Trên 4 người: grid 2x2 + slot cuối là "+x"
  const maxShow = 4;
  const remaining = total - maxShow;
  const displayList = participants.slice(0, maxShow);

  return (
    <div className="h-14 w-14 grid grid-cols-2 grid-rows-2 gap-0 shrink-0 grow-0 basis-auto">
      {displayList.map((p, i) =>
        i === 3 && remaining > 0 ? (
          <div
            key={i}
            className="bg-gray-500 text-white flex items-center justify-center text-xs font-semibold rounded-full"
          >
            +{remaining}
          </div>
        ) : (
          <div key={i} className="h-full w-full">
            {p.profilePic ? (
              <img
                src={p.profilePic}
                alt="avatar"
                className="h-full w-full object-cover rounded-full"
              />
            ) : (
              <div className="h-full w-full bg-blue-500 text-white flex items-center justify-center text-xs font-semibold rounded-full">
                {generateInitials(p.fullName)}
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};

export default GroupAvatar;
