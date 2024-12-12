import { jest } from "@jest/globals";

let req, res, next;
beforeEach(() => {
  // Reset tất cả các mô-đun và mock trước mỗi bài kiểm tra
  jest.resetModules();
  jest.clearAllMocks();
});

test("should return all users successfully", async () => {
  const mockUsers = [
    {
      _id: "user-id-1",
      name: "John Doe",
      email: "johndoe@example.com",
      phone: "1234567890",
      address: "123 Main St",
    },
    {
      _id: "user-id-2",
      name: "Jane Doe",
      email: "janedoe@example.com",
      phone: "0987654321",
      address: "456 Main St",
    },
  ];

  // Mock User.find để trả về danh sách người dùng
  const mockFind = jest.fn().mockResolvedValue(mockUsers);
  jest.unstable_mockModule("../models/user", () => ({
    default: {
      find: mockFind,
    },
  }));

  const User = await import("../models/user");
  const { allUsers } = await import("../controllers/authControllers");

  // Mock req và res
  const req = {};
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();

  await allUsers(req, res, next);

  // Kiểm tra xem User.find có được gọi đúng không
  expect(User.default.find).toHaveBeenCalled();
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ users: mockUsers });
});

test("should return empty array if no users are found", async () => {
  const mockUsers = [];

  // Mock User.find để trả về mảng rỗng
  const mockFind = jest.fn().mockResolvedValue(mockUsers);
  jest.unstable_mockModule("../models/user", () => ({
    default: {
      find: mockFind,
    },
  }));

  const User = await import("../models/user");
  const { allUsers } = await import("../controllers/authControllers");

  // Mock req và res
  const req = {};
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();

  await allUsers(req, res, next);

  expect(User.default.find).toHaveBeenCalled();
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ users: mockUsers });
});

test("should return an error if there is a database error", async () => {
  const mockError = new Error("Database error");
  mockError.statusCode = 500;

  // Mock User.find để ném ra lỗi
  const mockFind = jest.fn().mockRejectedValue(mockError);
  jest.unstable_mockModule("../models/user", () => ({
    default: {
      find: mockFind,
    },
  }));

  const User = await import("../models/user");
  const { allUsers } = await import("../controllers/authControllers");

  // Mock req, res và next
  const req = {};
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();

  await allUsers(req, res, next);

  expect(next).toHaveBeenCalledWith(new Error("Database error"));
});
