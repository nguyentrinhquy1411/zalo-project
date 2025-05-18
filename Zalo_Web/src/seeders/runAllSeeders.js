import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

// Lấy đường dẫn thực tế
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seeders = [
  "userSeeder.js",
  "conversationSeeder.js",
  "friendSeeder.js",
  "messageSeeder.js"
];

const runSeeders = async () => {
  console.log("===== BẮT ĐẦU KHỞI TẠO DỮ LIỆU MẪU =====");
  
  for (const seeder of seeders) {
    const seederPath = path.join(__dirname, seeder);
    
    try {
      console.log(`\n🔄 Đang chạy ${seeder}...`);
      
      // Sử dụng Promise để đợi seeder hoàn thành
      await new Promise((resolve, reject) => {
        const process = spawn("node", [seederPath], { stdio: "inherit" });
        
        process.on('close', (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`${seeder} thất bại với mã lỗi ${code}`));
          }
        });
        
        process.on('error', (err) => {
          reject(new Error(`Lỗi khi chạy ${seeder}: ${err.message}`));
        });
      });
      
    } catch (error) {
      console.error(`❌ Lỗi khi chạy ${seeder}:`, error.message);
      process.exit(1);
    }
  }
  
  console.log("\n✅ TẤT CẢ SEEDERS ĐÃ CHẠY THÀNH CÔNG!");
  console.log("===== HOÀN TẤT KHỞI TẠO DỮ LIỆU MẪU =====");
};

runSeeders().then(() => {
  console.log("Hoàn thành quá trình seed data");
  process.exit(0);
}).catch(error => {
  console.error("Lỗi:", error);
  process.exit(1);
});