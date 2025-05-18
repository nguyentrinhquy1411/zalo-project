import mongoose from "mongoose";
import dotenv from "dotenv";
import Conversation from "../models/conversations.model.js";
import User from "../models/users.model.js";
import { connectDB } from "../configs/db.js";

dotenv.config();

const seedConversations = async () => {
  try {
    // Kết nối đến database
    await connectDB();
    console.log("Đã kết nối với MongoDB");
    
    // Lấy user IDs từ database
    const users = await User.find({}, "_id fullName");
    
    if (users.length < 3) {
      throw new Error("Cần ít nhất 3 user để tạo conversation mẫu. Hãy chạy userSeeder trước.");
    }

    // Xóa tất cả conversations hiện có (trừ Cloud của tôi)
    const cloudConvs = await Conversation.find({
      isGroup: false,
      participants: { $size: 1 }
    });
    
    // Xóa conversations không phải cloud
    await Conversation.deleteMany({
      _id: { $nin: cloudConvs.map(conv => conv._id) }
    });
    console.log("Đã xóa tất cả conversations cũ (trừ Cloud của tôi)");
    
    // Tạo các conversation mẫu
    const conversations = [
      // Private chat giữa user 1 và user 2
      {
        participants: [users[0]._id, users[1]._id],
        isGroup: false,
        unseenCount: [
          {
            user: users[0]._id,
            count: 0
          },
          {
            user: users[1]._id,
            count: 0
          }
        ],
      },
      
      // Private chat giữa user 1 và user 3
      {
        participants: [users[0]._id, users[2]._id],
        isGroup: false,
        unseenCount: [
          {
            user: users[0]._id,
            count: 0
          },
          {
            user: users[2]._id,
            count: 0
          }
        ],
      },
      
      // Group chat với cả 3 user
      {
        participants: [users[0]._id, users[1]._id, users[2]._id],
        isGroup: true,
        groupName: "Nhóm bạn thân",
        groupAvatar: "",
        groupLeader: users[0]._id,
        groupDeputy: users[1]._id,
        unseenCount: [
          {
            user: users[0]._id,
            count: 0
          },
          {
            user: users[1]._id,
            count: 0
          },
          {
            user: users[2]._id,
            count: 0
          }
        ],
      },
    ];
    
    // Thêm conversations vào database
    const createdConversations = await Conversation.insertMany(conversations);
    
    console.log(`Đã tạo ${createdConversations.length} conversations:`);
    createdConversations.forEach((conversation) => {
      if (conversation.isGroup) {
        console.log(`- Nhóm: ${conversation.groupName} với ${conversation.participants.length} thành viên`);
      } else {
        console.log(`- Cuộc trò chuyện giữa 2 người dùng`);
      }
    });
    
    // Đóng kết nối
    await mongoose.connection.close();
    console.log("Kết nối database đã đóng");
    
    return { success: true, message: `Đã tạo ${createdConversations.length} conversations thành công` };
  } catch (error) {
    console.error("Lỗi khi tạo seed conversations:", error);
    
    // Đóng kết nối nếu có lỗi
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    
    return { success: false, message: `Lỗi: ${error.message}` };
  }
};

// Chạy hàm seed
seedConversations()
  .then(result => {
    if (result.success) {
      console.log("✓ Hoàn tất:", result.message);
      process.exit(0);
    } else {
      console.error("✗ Thất bại:", result.message);
      process.exit(1);
    }
  });