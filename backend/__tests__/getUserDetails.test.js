import { jest } from "@jest/globals";

let req, res, next;
beforeEach(() => {
  // Reset tất cả các mô-đun và mock trước mỗi bài kiểm tra
  jest.resetModules();
  jest.clearAllMocks();
});

test("should return user details successfully", async () => {
  const mockUser = {
    _id: "user-id-1",
    name: "John Doe",
    email: "johndoe@example.com",
    phone: "1234567890",
    address: "123 Main St",
  };

  // Mock User.findById để trả về người dùng
  const mockFindById = jest.fn().mockResolvedValue(mockUser);
  jest.unstable_mockModule("../models/user", () => ({
    default: {
      findById: mockFindById,
    },
  }));

  const User = await import("../models/user");
  const { getUserDetails } = await import("../controllers/authControllers");

  // Mock req và res
  const req = { params: { id: "user-id-1" } };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();

  await getUserDetails(req, res, next);

  // Kiểm tra xem User.findById có được gọi đúng không
  expect(User.default.findById).toHaveBeenCalledWith("user-id-1");
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ user: mockUser });
});

test("should return error if user is not found", async () => {
  const mockError = new Error("Không tìm thấy người dùng với id: user-id-2");
  mockError.statusCode = 404;

  // Mock User.findById để trả về null
  const mockFindById = jest.fn().mockResolvedValue(null);
  jest.unstable_mockModule("../models/user", () => ({
    default: {
      findById: mockFindById,
    },
  }));

  const User = await import("../models/user");
  const { getUserDetails } = await import("../controllers/authControllers");
  const ErrorHandler = (await import("../utils/errorHandler")).default;

  // Mock req và res
  const req = { params: { id: "user-id-2" } };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();
  

  await getUserDetails(req, res, next);

  // Kiểm tra xem next có được gọi với lỗi không
  expect(next).toHaveBeenCalledWith(new ErrorHandler("Không tìm thấy người dùng với id: user-id-2", 404));
});

test("should return an error if there is a database error", async () => {
  const mockError = new Error("Database error");
  mockError.statusCode = 500;

  // Mock User.findById để ném ra lỗi
  const mockFindById = jest.fn().mockRejectedValue(mockError);
  jest.unstable_mockModule("../models/user", () => ({
    default: {
      findById: mockFindById,
    },
  }));

  const User = await import("../models/user");
  const { getUserDetails } = await import("../controllers/authControllers");
  const ErrorHandler = (await import("../utils/errorHandler")).default;

  // Mock req, res và next
  const req = { params: { id: "user-id-1" } };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();

  await getUserDetails(req, res, next);

  expect(next).toHaveBeenCalledWith(new Error("Database error"));
});

test("should return error if no user id is provided", async () => {
  const mockError = new Error("Database error");
  mockError.statusCode = 400;

  const { getUserDetails } = await import("../controllers/authControllers");

  // Mock req không có id trong params
  const req = { params: {} };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();

  await getUserDetails(req, res, next);

  expect(next).toHaveBeenCalledWith(mockError);
});
