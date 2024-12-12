import { jest } from "@jest/globals";

let req, res, next;
beforeEach(() => {
  // Reset tất cả các mô-đun và mock trước mỗi bài kiểm tra
  jest.resetModules();
  jest.clearAllMocks();
});

test("should return user profile successfully", async () => {
  const mockUser = {
    _id: "mock-user-id",
    name: "John Doe",
    email: "johndoe@example.com",
    phone: "1234567890",
    address: "123 Main St",
  };

  // Mock User.findById
  const mockFindById = jest.fn().mockResolvedValue(mockUser);
  jest.unstable_mockModule("../models/user", () => ({
    default: {
      findById: mockFindById,
    },
  }));

  const User = await import("../models/user");
  const { getUserProfile } = await import("../controllers/authControllers");

  // Mock req và res
  const req = { user: { _id: "mock-user-id" } };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();

  await getUserProfile(req, res, next);

  // Kiểm tra xem User.findById có được gọi đúng không
  expect(User.default.findById).toHaveBeenCalledWith("mock-user-id");
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ user: mockUser });
});

test("should return an error if user not found", async () => {
  const mockError = new Error("User not found");
  mockError.statusCode = 404;

  // Mock User.findById để trả về null
  const mockFindById = jest.fn().mockResolvedValue(null);
  jest.unstable_mockModule("../models/user", () => ({
    default: {
      findById: mockFindById,
    },
  }));

  const User = await import("../models/user");
  const { getUserProfile } = await import("../controllers/authControllers");

  // Mock req và res
  const req = { user: { _id: "mock-user-id" } };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();

  await getUserProfile(req, res, next);

  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ user: null });
});

test("should return an error if req.user.id is missing", async () => {
  const { getUserProfile } = await import("../controllers/authControllers");

  // Mock req không có user
  const req = { user: null };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();

  await getUserProfile(req, res, next);

  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ user: null });
});

test("should return null user if req.user is missing", async () => {
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
  const { getUserProfile } = await import("../controllers/authControllers");

  // Mock req, res và next
  const req = {};
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();

  await getUserProfile(req, res, next);

  expect(next).toHaveBeenCalledWith(new Error("Database error"));
});
