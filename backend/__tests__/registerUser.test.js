import { registerUser } from "../controllers/authControllers.js"; // Import hàm registerUser
import User from "../models/user.js"; // Import model User
// import sendToken from "../utils/sendToken.js"; // Import hàm sendToken
import { jest } from "@jest/globals"; // Import jest để mock
import ErrorHandler from "../utils/errorHandler.js"

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

test("should register a user successfully", async () => {
  // Mock module sendToken
  await jest.unstable_mockModule("../utils/sendToken", () => ({
    default: jest.fn().mockImplementation((user, statusCode, response) => {
      response.status(statusCode).json({ token: "fake-jwt-token" });
    }),
  }));

  // Mock User.create để trả về người dùng đã tạo
  const userData = {
    name: "John Doe",
    email: "johndoe@example.com",
    password: "password123",
    phone: "123456789",
    address: "123 Main St",
  };

  req.body = userData;

  const createdUser = { ...userData, id: 1 };
  jest.spyOn(User, "create").mockResolvedValue(createdUser);

  // Import lại sendToken sau khi mock
  const sendToken = (await import("../utils/sendToken")).default;

  await registerUser(req, res, next);

  expect(User.create).toHaveBeenCalledWith(userData);
  // expect(sendToken).toHaveBeenCalledWith(createdUser, 201, res);
  // expect(res.status).toHaveBeenCalledWith(201);
  // expect(res.json).toHaveBeenCalledWith({ token: "fake-jwt-token" });
});

test("should return an error if required fields are missing", async () => {
  req.body = { name: "John Doe" }; // Thiếu thông tin

  // Giả sử User.create không thực hiện được và ném lỗi bất kỳ
  const error = new Error("Vui lòng cung cấp đầy đủ thông tin");
  error.statusCode = 400;
  
  // Mock lỗi ValidationError
  jest.spyOn(User, "create").mockRejectedValue(error);

  await registerUser(req, res, next);

  // Kiểm tra next có được gọi với lỗi như mong muốn
  expect(next).toHaveBeenCalledWith(error);
});

test("should return an error if required fields are missing", async () => {
  req.body = { email: "johndoe@example.com" }; // Thiếu thông tin

  // Giả sử User.create không thực hiện được và ném lỗi bất kỳ
  const error = new Error("Vui lòng cung cấp đầy đủ thông tin");
  error.statusCode = 400;
  
  // Mock lỗi ValidationError
  jest.spyOn(User, "create").mockRejectedValue(error);

  await registerUser(req, res, next);

  // Kiểm tra next có được gọi với lỗi như mong muốn
  expect(next).toHaveBeenCalledWith(error);
});

test("should return an error if required fields are missing", async () => {
  req.body = { password: "password123" }; // Thiếu thông tin

  // Giả sử User.create không thực hiện được và ném lỗi bất kỳ
  const error = new Error("Vui lòng cung cấp đầy đủ thông tin");
  error.statusCode = 400;
  
  // Mock lỗi ValidationError
  jest.spyOn(User, "create").mockRejectedValue(error);

  await registerUser(req, res, next);

  // Kiểm tra next có được gọi với lỗi như mong muốn
  expect(next).toHaveBeenCalledWith(error);
});

test("should return an error if required fields are missing", async () => {
  req.body = { phone: "123456789" }; // Thiếu thông tin

  // Giả sử User.create không thực hiện được và ném lỗi bất kỳ
  const error = new Error("Vui lòng cung cấp đầy đủ thông tin");
  error.statusCode = 400;
  
  // Mock lỗi ValidationError
  jest.spyOn(User, "create").mockRejectedValue(error);

  await registerUser(req, res, next);

  // Kiểm tra next có được gọi với lỗi như mong muốn
  expect(next).toHaveBeenCalledWith(error);
});

test("should return an error if required fields are missing", async () => {
  req.body = { address: "123 Main St" }; // Thiếu thông tin

  // Giả sử User.create không thực hiện được và ném lỗi bất kỳ
  const error = new Error("Vui lòng cung cấp đầy đủ thông tin");
  error.statusCode = 400;
  
  // Mock lỗi ValidationError
  jest.spyOn(User, "create").mockRejectedValue(error);

  await registerUser(req, res, next);

  // Kiểm tra next có được gọi với lỗi như mong muốn
  expect(next).toHaveBeenCalledWith(error);
});

test("should return an error if required fields are missing", async () => {
  req.body = {  }; // Thiếu thông tin

  // Giả sử User.create không thực hiện được và ném lỗi bất kỳ
  const error = new Error("Vui lòng cung cấp đầy đủ thông tin");
  error.statusCode = 400;
  
  // Mock lỗi ValidationError
  jest.spyOn(User, "create").mockRejectedValue(error);

  await registerUser(req, res, next);

  // Kiểm tra next có được gọi với lỗi như mong muốn
  expect(next).toHaveBeenCalledWith(error);
});

test("should return an error if user inputs existing email", async () => {
  const userData = {
    name: "John Doe",
    email: "tranbaophu179@gmail.com",
    password: "password123",
    phone: "1234567890",
    address: "123 Main St",
  };

  req.body = userData;

  const error = new Error("Database error");
  jest.spyOn(User, "create").mockRejectedValue(error);

  await registerUser(req, res, next);

  // Kiểm tra next có được gọi với lỗi đã được mock
  expect(next).toHaveBeenCalledWith(error);
});

test("should return an error if user inputs password small than 6 digits", async () => {
  const userData = {
    name: "John Doe",
    email: "johndoe@example.com",
    password: "passw",
    phone: "1234567890",
    address: "123 Main St",
  };

  req.body = userData;

  const error = new Error("Mật khẩu phải có ít nhất 6 ký tự");
  jest.spyOn(User, "create").mockRejectedValue(error);

  await registerUser(req, res, next);

  // Kiểm tra next có được gọi với lỗi đã được mock
  expect(next).toHaveBeenCalledWith(error);
});

test("should return an error if user input name more then 50 digits", async () => {
  const userData = {
    name: "JohnDoe123456789123456789123456789123456789123456789",
    email: "johndoe@example.com",
    password: "password123",
    phone: "1234567890",
    address: "123 Main St",
  };

  req.body = userData;

  // Mock User.create ném lỗi
  const error = new Error("Database error");
  jest.spyOn(User, "create").mockRejectedValue(error);

  // Gọi hàm registerUser và kiểm tra xem next có được gọi với lỗi không
  await registerUser(req, res, next);

  // Kiểm tra xem next có được gọi với lỗi không
  expect(next).toHaveBeenCalledWith(error);
});

test("should return an error if phone user is not have 9 digit", async () => {
  const userData = {
    name: "JohnDoe",
    email: "johndoe@example.com",
    password: "password123",
    phone: "12345678",
    address: "123 Main St",
  };

  req.body = userData;

  // Mock User.create ném lỗi
  const error = new Error("Số điện thoại phải có định dạng +84 và 9 số đằng sau");
  jest.spyOn(User, "create").mockRejectedValue(error);

  // Gọi hàm registerUser và kiểm tra xem next có được gọi với lỗi không
  await registerUser(req, res, next);

  // Kiểm tra xem next có được gọi với lỗi không
  expect(next).toHaveBeenCalledWith(error);
});

