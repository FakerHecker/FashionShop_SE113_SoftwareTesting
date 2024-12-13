import { jest } from "@jest/globals";
import mongoose from 'mongoose';
import dotenv from "dotenv";

// //KO XOÁ FILE NÀY => nhằm thiết lập biến môi trường
// const configPath = "backend/config/config.env";
// dotenv.config({ path: configPath });


// describe('connectDatabase', () => {
//   // cho kết nối db thật trước loạt test
//   beforeAll(async () => {
//     const DB_URI = process.env.DB_URI;
//     await mongoose.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
//   });

//   // đóng kết nối sau loạt test
//   afterAll(async () => {
//     await mongoose.connection.close();
//   });

//   it('should connect to MongoDB successfully', async () => {
//     const db = mongoose.connection;
//     expect(db.readyState).toBe(1);  //=> 1 is thành công
//   });

//   it('should handle errors if connection fails', async () => {
//     // thử với kết nối sai
//     const wrongURI = "mongodb://wrong-uri";
//     await expect(mongoose.connect(wrongURI)).rejects.toThrow();
//   });
// });

beforeEach(() => {
  jest.resetModules(); // Reset lại các module đã import trước đó
  jest.clearAllMocks(); // Xóa sạch tất cả mock
});

test("should connect to the correct database URI in NORMAL environment", async () => {
  // Mock mongoose.connect để không thực sự kết nối tới cơ sở dữ liệu
  const mockConnect = jest.fn().mockResolvedValue({
    connection: { host: "localhost" },
  });

  // Mock module mongoose
  jest.unstable_mockModule("mongoose", () => ({
    default:{
      connect: mockConnect, // Mock mongoose.connect
    }
  }));

  // Mock console.log
  jest.spyOn(console, 'log').mockImplementation();

  // Thiết lập biến môi trường
  process.env.NODE_ENV = "NORMAL";
  process.env.DB_LOCAL_URI = "mongodb://localhost:27017/test_db";

  const { connectDatabase } = await import("../config/dbConnect");

  // Gọi hàm connectDatabase
  await connectDatabase();

  // Kiểm tra xem mongoose.connect có được gọi với đúng URI không
  expect(mockConnect).toHaveBeenCalledWith("mongodb://localhost:27017/test_db");

  // Kiểm tra xem console.log có được gọi với thông báo kết nối không
  expect(console.log).toHaveBeenCalledWith("MongoDB Database kết nối với HOST: localhost");
});

test("should connect to the correct database URI in DEVELOPMENT environment", async () => {
  const mockConnect = jest.fn().mockResolvedValue({
    connection: { host: "dev.mongodb.net" },
  });

  jest.unstable_mockModule("mongoose", () => ({
    default: {
      connect: mockConnect,
    },
  }));

  jest.spyOn(console, 'log').mockImplementation();

  process.env.NODE_ENV = "DEVELOPMENT";
  process.env.DB_URI = "mongodb+srv://user:password@dev.mongodb.net/test_db";

  const { connectDatabase } = await import("../config/dbConnect");

  await connectDatabase();

  expect(mockConnect).toHaveBeenCalledWith("mongodb+srv://user:password@dev.mongodb.net/test_db");
  expect(console.log).toHaveBeenCalledWith("MongoDB Database kết nối với HOST: dev.mongodb.net");
});

test("should connect to the correct database URI in PRODUCTION environment", async () => {
  const mockConnect = jest.fn().mockResolvedValue({
    connection: { host: "prod.mongodb.net" },
  });

  jest.unstable_mockModule("mongoose", () => ({
    default: {
      connect: mockConnect,
    },
  }));

  jest.spyOn(console, 'log').mockImplementation();

  process.env.NODE_ENV = "PRODUCTION";
  process.env.DB_URI = "mongodb+srv://user:password@prod.mongodb.net/test_db";

  const { connectDatabase } = await import("../config/dbConnect");

  await connectDatabase();

  expect(mockConnect).toHaveBeenCalledWith("mongodb+srv://user:password@prod.mongodb.net/test_db");
  expect(console.log).toHaveBeenCalledWith("MongoDB Database kết nối với HOST: prod.mongodb.net");
});

test("should connect to the correct database URI in test environment", async () => {
  const mockConnect = jest.fn().mockResolvedValue({
    connection: { host: "test.mongodb.net" },
  });

  jest.unstable_mockModule("mongoose", () => ({
    default: {
      connect: mockConnect,
    },
  }));

  jest.spyOn(console, 'log').mockImplementation();

  process.env.NODE_ENV = "test";
  process.env.DB_URI = "mongodb+srv://user:password@test.mongodb.net/test_db";

  const { connectDatabase } = await import("../config/dbConnect");

  await connectDatabase();

  expect(mockConnect).toHaveBeenCalledWith("mongodb+srv://user:password@test.mongodb.net/test_db");
  expect(console.log).toHaveBeenCalledWith("MongoDB Database kết nối với HOST: test.mongodb.net");
});
