import { loginUser } from "../controllers/authControllers.js"; // Import hàm registerUser
import User from "../models/user.js"; // Import model User
// import sendToken from "../utils/sendToken.js"; // Import hàm sendToken
import { jest } from "@jest/globals"; // Import jest để mock
import ErrorHandler from "../utils/errorHandler.js"
import request from 'supertest';
import app from '../app'; // Đảm bảo đường dẫn chính xác tới file app.js
import mongoose from 'mongoose';

let req, res, next;

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
  req = { body: {} }; // Mock body request
  res = {
    status: jest.fn().mockReturnThis(), // Mock status
    json: jest.fn(), // Mock json
    cookie: jest.fn(),
  };
  next = jest.fn(); // Mock next
});

// test mẫu trường hợp đăng nhập thành công
describe('POST /api/login', () => {
  beforeAll(async () => {
    const DB_URI = process.env.DB_URI;
    await mongoose.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  });

  // Đảm bảo đóng kết nối sau khi test xong
  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should return 201 and send token if login is successful', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'atlaoognhk@gmail.com', password: '123456789' });

    expect(res.statusCode).toEqual(201);  //=>check status code trả về đúng
    expect(res.body.token).toBeDefined();  //=>check có trả về token
  });


  it('should return 400 if password is null', async () => {
    req.body = { }; // Thiếu thông tin
    
      // Giả sử User.create không thực hiện được và ném lỗi bất kỳ
      const error = new Error("Vui lòng nhập email và mật khẩu");
      error.statusCode = 400;
      
      // Mock lỗi ValidationError
      jest.spyOn(User, "create").mockRejectedValue(error);
    
      await loginUser(req, res, next);
    
      // Kiểm tra next có được gọi với lỗi như mong muốn
      expect(next).toHaveBeenCalledWith(error);
  });

  it('should return 400 if password is null', async () => {
      req.body = { email: "atlaoognhk@gmail.com" }; // Thiếu thông tin
      
        // Giả sử User.create không thực hiện được và ném lỗi bất kỳ
        const error = new Error("Vui lòng nhập email và mật khẩu");
        error.statusCode = 400;
        
        // Mock lỗi ValidationError
        jest.spyOn(User, "create").mockRejectedValue(error);
      
        await loginUser(req, res, next);
      
        // Kiểm tra next có được gọi với lỗi như mong muốn
        expect(next).toHaveBeenCalledWith(error);
  });

  it('should return 400 if email is null', async () => {
    req.body = { password: "123456789" }; // Thiếu thông tin
    
      // Giả sử User.create không thực hiện được và ném lỗi bất kỳ
      const error = new Error("Vui lòng nhập email và mật khẩu");
      error.statusCode = 400;
      
      // Mock lỗi ValidationError
      jest.spyOn(User, "create").mockRejectedValue(error);
    
      await loginUser(req, res, next);
    
      // Kiểm tra next có được gọi với lỗi như mong muốn
      expect(next).toHaveBeenCalledWith(error);
  });

  it('should return 401 if email is not found', async () => {
    req.body = { email: "123abyd@gmail.com", password: "123456789" }; // Thiếu thông tin
    
      // Giả sử User.create không thực hiện được và ném lỗi bất kỳ
      const error = new Error("Email không tồn tại");
      error.statusCode = 401;
      
      // Mock lỗi ValidationError
      jest.spyOn(User, "create").mockRejectedValue(error);
    
      await loginUser(req, res, next);
    
      // Kiểm tra next có được gọi với lỗi như mong muốn
      expect(next).toHaveBeenCalledWith(error);
  });

  it('should return 401 if password is not correct', async () => {
    req.body = { email: "atlaoognhk@gmail.com", password: "12345678" }; // Thiếu thông tin
    
      // Giả sử User.create không thực hiện được và ném lỗi bất kỳ
      const error = new Error("Mật khẩu không đúng");
      error.statusCode = 401;
      
      // Mock lỗi ValidationError
      jest.spyOn(User, "create").mockRejectedValue(error);
    
      await loginUser(req, res, next);
    
      // Kiểm tra next có được gọi với lỗi như mong muốn
      expect(next).toHaveBeenCalledWith(error);
  });
});

