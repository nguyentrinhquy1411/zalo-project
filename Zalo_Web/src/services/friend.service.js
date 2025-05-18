import Friend from "../models/friends.model.js";
import User from "../models/users.model.js";

// Gửi yêu cầu kết bạn
export const sendFriendRequest = async (senderId, phoneNumber) => {
  const receiver = await User.findOne({ phoneNumber });

  if (!receiver) {
    throw new Error(
      "Số điện thoại chưa đăng ký tài khoản hoặc không cho phép tìm kiếm"
    );
  }

  if (senderId.toString() === receiver._id.toString()) {
    throw new Error("Không thể gửi yêu cầu kết bạn cho chính mình");
  }

  const existingRequest = await Friend.findOne({
    $or: [
      { actionUser: senderId, targetUser: receiver._id },
      { targetUser: receiver._id, actionUser: senderId },
    ],
  });

  if (existingRequest) {
    switch (existingRequest.status) {
      case "pending":
        throw new Error(
          "Bạn đã gửi yêu cầu kết bạn hoặc đã nhận yêu cầu từ người này"
        );
      case "accepted":
        throw new Error("Bạn đã là bạn bè với người này");
      case "blocked":
        throw new Error("Bạn đã bị chặn bởi người này");
    }
  }

  const newRequest = await Friend.create({
    actionUser: senderId,
    targetUser: receiver._id,
    status: "pending",
  });

  return newRequest;
};

// Chấp nhận lời mời kết bạn
export const acceptFriendRequest = async (requestId, userId) => {
  const friendRequest = await Friend.findById(requestId);

  if (!friendRequest) {
    throw new Error("Không tìm thấy yêu cầu kết bạn.");
  }

  if (friendRequest.status === "accepted") {
    throw new Error("Các bạn đã là bạn bè.");
  }

  if (friendRequest.status !== "pending") {
    throw new Error("Yêu cầu kết bạn không hợp lệ hoặc đã được xử lý");
  }

  if (friendRequest.targetUser === userId) {
    throw new Error("Bạn không có quyền chấp nhận yêu cầu này");
  }

  // Đổi chỗ actionUser và targetUser
  const oldActionUser = friendRequest.actionUser;
  friendRequest.actionUser = friendRequest.targetUser;
  friendRequest.targetUser = oldActionUser;
  friendRequest.status = "accepted";
  await friendRequest.save();

  return friendRequest;
};

// Từ chối lời mời kết bạn
export const rejectFriendRequest = async (requestId, userId) => {
  const friendRequest = await Friend.findById(requestId);

  if (!friendRequest) {
    throw new Error("Không tìm thấy yêu cầu kết bạn.");
  }

  if (friendRequest.status !== "pending") {
    throw new Error("Yêu cầu kết bạn không hợp lệ hoặc đã được xử lý");
  }

  if (friendRequest.targetUser.toString() !== userId.toString()) {
    throw new Error("Bạn không có quyền từ chối yêu cầu này");
  }

  friendRequest.status = "rejected";
  await friendRequest.save();

  return friendRequest;
};

// Hủy lời mời kết bạn hoặc xóa bạn
export const removeFriend = async (userId, friendId) => {
  return await Friend.deleteMany({
    $or: [
      { userId, friendId },
      { userId: friendId, friendId: userId },
    ],
  });
};

//Lấy danh sách bạn bè
export const getFriendsList = async (userId) => {
  const friends = await Friend.find({
    status: "accepted",
    $or: [{ actionUser: userId }, { targetUser: userId }],
  })
    .populate("actionUser", "-password -password_set -appToken -webToken")
    .populate("targetUser", "-password -password_set -appToken -webToken");

  const filtered = friends.map((f) => {
    if (f.actionUser._id.toString() === userId.toString()) {
      return f.targetUser;
    } else {
      return f.actionUser;
    }
  });

  return filtered;
};

// Tìm tất cả yêu cầu kết bạn của targetUserId với trạng thái "pending"
export const getPendingFriendRequests = async (targetUserId) => {
  try {
    const requests = await Friend.find({
      targetUser: targetUserId,
      status: "pending",
    })
      .populate("actionUser", "fullName profilePic")
      .exec();

    return {
      totalRequests: requests.length,
      requests: requests,
    };
  } catch (error) {
    throw new Error(
      "Không thể lấy danh sách yêu cầu kết bạn: " + error.message
    );
  }
};

export const checkIfFriends = async (userId1, userId2) => {
  try {
    const friendship = await Friend.findOne({
      $or: [
        { actionUser: userId1, targetUser: userId2 },
        { actionUser: userId2, targetUser: userId1 },
      ],
    }).exec();

    if (!friendship) {
      return { isFriend: false, status: null };
    } else if (friendship.status === "pending") {
      return { isFriend: false, status: "pending", ...friendship.toObject() };
    } else if (friendship.status === "blocked") {
      return { isFriend: false, status: "blocked", ...friendship.toObject() };
    } else if (friendship.status === "cancelled") {
      return { isFriend: false, status: "cancelled", ...friendship.toObject() };
    } else if (friendship.status === "rejected") {
      return { isFriend: false, status: "rejected", ...friendship.toObject() };
    }
    // enum: ["pending", "accepted", "blocked", "cancelled", "rejected"],
    return { isFriend: true, ...friendship.toObject() }; // 👈 lấy toàn bộ field
  } catch (error) {
    throw new Error("Error while checking friendship status");
  }
};

//Lấy mối quan hệ giữa 2 người dùng
export const getFriendRelationship = async (userId, friendId) => {
  try {
    const relationship = await Friend.findOne({
      $or: [
        { actionUser: userId, targetUser: friendId },
        { actionUser: friendId, targetUser: userId },
      ],
    });

    if (!relationship) {
      return null;
    }

    return relationship;
  } catch (error) {
    throw new Error("Không thể lấy mối quan hệ: " + error.message);
  }
};
