import mongoose from "mongoose";
import dotenv from "dotenv";
import Message from "../models/messages.model.js";
import Conversation from "../models/conversations.model.js";
import User from "../models/users.model.js";
import { connectDB } from "../configs/db.js";

dotenv.config();

const seedMessages = async () => {
  try {
    // Kết nối đến database
    await connectDB();
    console.log("Đã kết nối với MongoDB");
    
    // Lấy user IDs từ database
    const users = await User.find({}, "_id fullName");
    
    if (users.length < 3) {
      throw new Error("Cần ít nhất 3 user để tạo tin nhắn mẫu. Hãy chạy userSeeder trước.");
    }
    
    // Lấy conversation IDs từ database
    const conversations = await Conversation.find({
      // Loại bỏ các Cloud conversation (chat một người)
      $expr: { $gt: [{ $size: "$participants" }, 1] }
    });
    
    if (conversations.length < 2) {
      throw new Error("Cần ít nhất 2 conversations để tạo tin nhắn mẫu. Hãy chạy conversationSeeder trước.");
    }

    // Xóa tất cả tin nhắn hiện có
    await Message.deleteMany({});
    console.log("Đã xóa tất cả tin nhắn cũ");
    
    // Private conversation giữa user 1 và user 2
    const privateConversation = conversations.find(conv => 
      !conv.isGroup && conv.participants.length === 2 && 
      conv.participants.some(p => p.equals(users[0]._id)) && 
      conv.participants.some(p => p.equals(users[1]._id)));
    
    // Group conversation
    const groupConversation = conversations.find(conv => conv.isGroup === true);
    
    if (!privateConversation || !groupConversation) {
      throw new Error("Không tìm thấy đủ loại conversation cần thiết.");
    }
    
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const twoDaysAgo = new Date(now);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    // Tạo các tin nhắn mẫu
    const privateMessages = [
      // Cuộc trò chuyện riêng tư
      {
        conversationId: privateConversation._id,
        senderId: users[0]._id,
        messageType: "text",
        content: "Chào bạn, dạo này bạn thế nào?",
        status: "seen",
        seenBy: [
          {
            user: users[0]._id,
            seenAt: new Date(twoDaysAgo.getTime() + 1.1 * 60 * 1000)
          },
          {
            user: users[1]._id,
            seenAt: new Date(twoDaysAgo.getTime() + 1.2 * 60 * 1000)
          }
        ],
        createdAt: new Date(twoDaysAgo.getTime() + 1 * 60 * 1000), // 2 ngày trước + 1 phút
      },
      {
        conversationId: privateConversation._id,
        senderId: users[1]._id,
        messageType: "text",
        content: "Chào, mình khỏe. Còn bạn thì sao?",
        status: "seen",
        seenBy: [
          {
            user: users[0]._id,
            seenAt: new Date(twoDaysAgo.getTime() + 2.1 * 60 * 1000)
          },
          {
            user: users[1]._id,
            seenAt: new Date(twoDaysAgo.getTime() + 2 * 60 * 1000)
          }
        ],
        createdAt: new Date(twoDaysAgo.getTime() + 2 * 60 * 1000), // 2 ngày trước + 2 phút
      },
      {
        conversationId: privateConversation._id,
        senderId: users[0]._id,
        messageType: "text",
        content: "Mình cũng ổn, dạo này bận việc quá",
        status: "seen",
        seenBy: [
          {
            user: users[0]._id,
            seenAt: new Date(twoDaysAgo.getTime() + 3 * 60 * 1000)
          },
          {
            user: users[1]._id,
            seenAt: new Date(twoDaysAgo.getTime() + 3.5 * 60 * 1000)
          }
        ],
        createdAt: new Date(twoDaysAgo.getTime() + 3 * 60 * 1000), // 2 ngày trước + 3 phút
      },
    ];
    
    const groupMessages = [
      // Cuộc trò chuyện nhóm
      {
        conversationId: groupConversation._id,
        senderId: users[0]._id,
        messageType: "text",
        content: "Chào các bạn, cuối tuần này mọi người có kế hoạch gì không?",
        status: "seen",
        seenBy: [
          {
            user: users[0]._id,
            seenAt: new Date(yesterday.getTime() + 1 * 60 * 1000)
          },
          {
            user: users[1]._id,
            seenAt: new Date(yesterday.getTime() + 5 * 60 * 1000)
          },
          {
            user: users[2]._id,
            seenAt: new Date(yesterday.getTime() + 8 * 60 * 1000)
          }
        ],
        createdAt: new Date(yesterday.getTime() + 1 * 60 * 1000), // Hôm qua + 1 phút
      },
      {
        conversationId: groupConversation._id,
        senderId: users[1]._id,
        messageType: "text",
        content: "Mình chưa có kế hoạch gì cả",
        status: "seen",
        seenBy: [
          {
            user: users[0]._id,
            seenAt: new Date(yesterday.getTime() + 12 * 60 * 1000)
          },
          {
            user: users[1]._id,
            seenAt: new Date(yesterday.getTime() + 10 * 60 * 1000)
          },
          {
            user: users[2]._id,
            seenAt: new Date(yesterday.getTime() + 15 * 60 * 1000)
          }
        ],
        createdAt: new Date(yesterday.getTime() + 10 * 60 * 1000), // Hôm qua + 10 phút
      },
      {
        conversationId: groupConversation._id,
        senderId: users[2]._id,
        messageType: "text",
        content: "Mình đang nghĩ đến việc đi cafe, mọi người có muốn tham gia không?",
        status: "seen",
        seenBy: [
          {
            user: users[0]._id,
            seenAt: new Date(yesterday.getTime() + 25 * 60 * 1000)
          },
          {
            user: users[1]._id,
            seenAt: new Date(yesterday.getTime() + 22 * 60 * 1000)
          },
          {
            user: users[2]._id,
            seenAt: new Date(yesterday.getTime() + 20 * 60 * 1000)
          }
        ],
        createdAt: new Date(yesterday.getTime() + 20 * 60 * 1000), // Hôm qua + 20 phút
      },
    ];
    
    // Kết hợp tất cả tin nhắn
    const allMessages = [...privateMessages, ...groupMessages];
    
    // Thêm tin nhắn vào database
    const createdMessages = await Message.insertMany(allMessages);
    
    console.log(`Đã tạo ${createdMessages.length} tin nhắn:`);
    console.log(`- ${privateMessages.length} tin nhắn trong cuộc trò chuyện riêng tư`);
    console.log(`- ${groupMessages.length} tin nhắn trong nhóm`);
    
    // Cập nhật lastMessage cho các conversation
    // Lưu ý: Model đã có middleware để tự cập nhật lastMessage, nhưng vẫn cập nhật để đảm bảo
    await Conversation.findByIdAndUpdate(privateConversation._id, {
      lastMessage: createdMessages.find(msg => 
        msg.conversationId.equals(privateConversation._id) &&
        msg.createdAt.getTime() === privateMessages[privateMessages.length - 1].createdAt.getTime()
      )._id
    });
    
    await Conversation.findByIdAndUpdate(groupConversation._id, {
      lastMessage: createdMessages.find(msg => 
        msg.conversationId.equals(groupConversation._id) &&
        msg.createdAt.getTime() === groupMessages[groupMessages.length - 1].createdAt.getTime()
      )._id
    });
    
    console.log("Đã cập nhật lastMessage cho các conversation");
    
    // Đóng kết nối
    await mongoose.connection.close();
    console.log("Kết nối database đã đóng");
    
    return { success: true, message: `Đã tạo ${createdMessages.length} tin nhắn thành công` };
  } catch (error) {
    console.error("Lỗi khi tạo seed messages:", error);
    
    // Đóng kết nối nếu có lỗi
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    
    return { success: false, message: `Lỗi: ${error.message}` };
  }
};

// Chạy hàm seed
seedMessages()
  .then(result => {
    if (result.success) {
      console.log("✓ Hoàn tất:", result.message);
      process.exit(0);
    } else {
      console.error("✗ Thất bại:", result.message);
      process.exit(1);
    }
  });