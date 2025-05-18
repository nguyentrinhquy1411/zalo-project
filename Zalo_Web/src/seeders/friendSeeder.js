import mongoose from "mongoose";
import dotenv from "dotenv";
import Friend from "../models/friends.model.js";
import User from "../models/users.model.js";
import { connectDB } from "../configs/db.js";

dotenv.config();

const seedFriends = async () => {
  try {
    // Kết nối đến database
    await connectDB();
    console.log("Đã kết nối với MongoDB");
    
    // Lấy user IDs từ database
    const users = await User.find({}, "_id fullName");
    
    if (users.length < 3) {
      throw new Error("Cần ít nhất 3 user để tạo friend mẫu. Hãy chạy userSeeder trước.");
    }

    // Xóa tất cả friends hiện có
    await Friend.deleteMany({});
    console.log("Đã xóa tất cả friends cũ");
    
    // Tạo các friend relationship mẫu
    const friends = [
      // User 1 và User 2 là bạn bè (đã chấp nhận)
      {
        actionUser: users[0]._id,
        targetUser: users[1]._id,
        status: "accepted",
      },
      
      // User 1 đã gửi lời mời kết bạn cho User 3 nhưng chưa được chấp nhận
      {
        actionUser: users[0]._id,
        targetUser: users[2]._id,
        status: "pending",
      }
    ];
    
    // Thêm friends vào database
    const createdFriends = await Friend.insertMany(friends);
    
    console.log(`Đã tạo ${createdFriends.length} friend relationships:`);
    createdFriends.forEach(async (friendship) => {
      const actionUser = users.find(u => u._id.equals(friendship.actionUser))?.fullName || "Unknown";
      const targetUser = users.find(u => u._id.equals(friendship.targetUser))?.fullName || "Unknown";
      console.log(`- Mối quan hệ giữa ${actionUser} và ${targetUser}: ${friendship.status}`);
    });
    
    // Đóng kết nối
    await mongoose.connection.close();
    console.log("Kết nối database đã đóng");
    
    return { success: true, message: `Đã tạo ${createdFriends.length} friend relationships thành công` };
  } catch (error) {
    console.error("Lỗi khi tạo seed friends:", error);
    
    // Đóng kết nối nếu có lỗi
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    
    return { success: false, message: `Lỗi: ${error.message}` };
  }
};

// Chạy hàm seed
seedFriends()
  .then(result => {
    if (result.success) {
      console.log("✓ Hoàn tất:", result.message);
      process.exit(0);
    } else {
      console.error("✗ Thất bại:", result.message);
      process.exit(1);
    }
  });