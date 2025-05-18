import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/users.model.js";
import { connectDB } from "../configs/db.js";

dotenv.config();

const users = [
  {
    fullName: "Nguyễn An",
    password: "Test123!@#",
    phoneNumber: "+84123456789",
    gender: "Male",
    dateOfBirth: new Date("1995-01-15"),
    email: "nguyenvanan@example.com",
    password_set: true,
    isActive: false
  },
  {
    fullName: "Trần Bình",
    password: "Pass456$%^",
    phoneNumber: "+84987654321",
    gender: "Female",
    dateOfBirth: new Date("1998-05-20"),
    email: "tranthibinh@example.com",
    password_set: true,
    isActive: false
  },
  {
    fullName: "Lê Cường",
    password: "Secure789&*(", 
    phoneNumber: "+84909123456",
    gender: "Male",
    dateOfBirth: new Date("1990-11-10"),
    email: "lehoangcuong@example.com",
    password_set: true,
    isActive: false
  }
];

const seedUsers = async () => {
  try {
    // Kết nối đến database
    await connectDB();
    console.log("Đã kết nối với MongoDB");
    
    // Xóa tất cả user hiện có (tùy chọn)
    await User.deleteMany({});
    console.log("Đã xóa tất cả user cũ");
    
    // Hash mật khẩu trước khi lưu vào database
    const usersWithHashedPasswords = await Promise.all(
      users.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return { ...user, password: hashedPassword };
      })
    );
    
    // Thêm users vào database
    const createdUsers = await User.insertMany(usersWithHashedPasswords);
    
    console.log(`Đã tạo ${createdUsers.length} users:`);
    createdUsers.forEach(user => {
      console.log(`- ${user.fullName} (${user.phoneNumber})`);
    });
    
    // Đóng kết nối
    await mongoose.connection.close();
    console.log("Kết nối database đã đóng");
    
    return { success: true, message: `Đã tạo ${createdUsers.length} users thành công` };
  } catch (error) {
    console.error("Lỗi khi tạo seed users:", error);
    
    // Đóng kết nối nếu có lỗi
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    
    return { success: false, message: `Lỗi: ${error.message}` };
  }
};

// Chạy hàm seed
seedUsers()
  .then(result => {
    if (result.success) {
      console.log("✓ Hoàn tất:", result.message);
      process.exit(0);
    } else {
      console.error("✗ Thất bại:", result.message);
      process.exit(1);
    }
  });
