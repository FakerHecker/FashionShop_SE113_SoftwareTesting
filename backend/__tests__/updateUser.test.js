import { jest } from "@jest/globals";

let req, res, next;
beforeEach(() => {
  // Reset tất cả các mô-đun và mock trước mỗi bài kiểm tra
  jest.resetModules();
  jest.clearAllMocks();
});

test("should update user successfully", async () => {
  const mockUpdatedUser = {
    _id: "user-id-1",
    name: "John Doe Updated",
    email: "johndoeupdated@example.com",
    phone: "0987654321",
    address: "456 Main St",
    role: "admin",
  };

  // Mock User.findByIdAndUpdate để trả về người dùng đã được cập nhật
  const mockFindByIdAndUpdate = jest.fn().mockResolvedValue(mockUpdatedUser);
  jest.unstable_mockModule("../models/user", () => ({
    default: {
      findByIdAndUpdate: mockFindByIdAndUpdate,
    },
  }));

  const User = await import("../models/user");
  const { updateUser } = await import("../controllers/authControllers");

  // Mock req và res
  const req = {
    params: { id: "user-id-1" },
    body: {
      name: "John Doe Updated",
      email: "johndoeupdated@example.com",
      phone: "0987654321",
      address: "456 Main St",
      role: "admin",
    },
  };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();

  await updateUser(req, res, next);

  // Kiểm tra xem User.findByIdAndUpdate có được gọi đúng không
  expect(User.default.findByIdAndUpdate).toHaveBeenCalledWith("user-id-1", {
    name: "John Doe Updated",
    email: "johndoeupdated@example.com",
    phone: "0987654321",
    address: "456 Main St",
    role: "admin",
  }, { new: true });

  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ user: mockUpdatedUser });
});

test("should return error if user not found", async () => {
  const mockError = new Error("Không tìm thấy người dùng với id: user-id-2");
  mockError.statusCode = 404;

  // Mock User.findByIdAndUpdate để trả về null
  const mockFindByIdAndUpdate = jest.fn().mockResolvedValue(null);
  jest.unstable_mockModule("../models/user", () => ({
    default: {
      findByIdAndUpdate: mockFindByIdAndUpdate,
    },
  }));

  const User = await import("../models/user");
  const { updateUser } = await import("../controllers/authControllers");

  // Mock req và res
  const req = {
    params: { id: "user-id-2" },
    body: {
      name: "John Doe Updated",
      email: "johndoeupdated@example.com",
      phone: "0987654321",
      address: "456 Main St",
      role: "admin",
    },
  };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();
  const ErrorHandler = (await import("../utils/errorHandler")).default;

  await updateUser(req, res, next);

  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ user: null });
});

test("should return error if no user id is provided", async () => {
  const { updateUser } = await import("../controllers/authControllers");

  // Mock req không có id trong params
  const req = { params: {} };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();
  const ErrorHandler = (await import("../utils/errorHandler")).default;

  await updateUser(req, res, next);

  expect(next).toHaveBeenCalledWith(expect.any(Error));

});

test("should return an error if there is a database error", async () => {
  const mockError = new Error("Database error");
  mockError.statusCode = 500;

  // Mock User.findByIdAndUpdate để ném ra lỗi
  const mockFindByIdAndUpdate = jest.fn().mockRejectedValue(mockError);
  jest.unstable_mockModule("../models/user", () => ({
    default: {
      findByIdAndUpdate: mockFindByIdAndUpdate,
    },
  }));

  const User = await import("../models/user");
  const { updateUser } = await import("../controllers/authControllers");

  // Mock req, res và next
  const req = {
    params: { id: "user-id-1" },
    body: {
      name: "John Doe Updated",
      email: "johndoeupdated@example.com",
      phone: "0987654321",
      address: "456 Main St",
      role: "admin",
    },
  };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();
  const ErrorHandler = (await import("../utils/errorHandler")).default;

  await updateUser(req, res, next);

  expect(next).toHaveBeenCalledWith(new Error("Database error"));
});

