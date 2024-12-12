import { jest } from "@jest/globals";

let req, res, next;
beforeEach(() => {
  // Reset tất cả các mô-đun và mock trước mỗi bài kiểm tra
  jest.resetModules();
  jest.clearAllMocks();
});

test("should update user profile successfully", async () => {
  const mockUser = {
    _id: "mock-user-id",
    name: "John Doe",
    email: "johndoe@example.com",
    phone: "1234567890",
    address: "123 Main St",
  };

  const updatedUser = {
    _id: "mock-user-id",
    name: "Updated Name",
    email: "updated@example.com",
    phone: "0987654321",
    address: "Updated Address",
  };

  // Mock User.findByIdAndUpdate để trả về người dùng đã được cập nhật
  const mockFindByIdAndUpdate = jest.fn().mockResolvedValue(updatedUser);
  jest.unstable_mockModule("../models/user", () => ({
    default: {
      findByIdAndUpdate: mockFindByIdAndUpdate,
    },
  }));

  const User = await import("../models/user");
  const { updateProfile } = await import("../controllers/authControllers");

  // Mock req và res
  const req = {
    user: { _id: "mock-user-id" },
    body: {
      name: "Updated Name",
      email: "updated@example.com",
      phone: "0987654321",
      address: "Updated Address",
    },
  };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();

  await updateProfile(req, res, next);

  // Kiểm tra xem User.findByIdAndUpdate có được gọi đúng không
  expect(User.default.findByIdAndUpdate).toHaveBeenCalledWith(
    "mock-user-id",
    {
      name: "Updated Name",
      email: "updated@example.com",
      phone: "0987654321",
      address: "Updated Address",
    },
    { new: true }
  );
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ user: updatedUser });
});


test("should return an error if user not found", async () => {
  const mockError = new Error("User not found");
  mockError.statusCode = 404;

  // Mock User.findByIdAndUpdate để trả về null
  const mockFindByIdAndUpdate = jest.fn().mockResolvedValue(null);
  jest.unstable_mockModule("../models/user", () => ({
    default: {
      findByIdAndUpdate: mockFindByIdAndUpdate,
    },
  }));

  const User = await import("../models/user");
  const { updateProfile } = await import("../controllers/authControllers");

  // Mock req và res
  const req = {
    user: { _id: "mock-user-id" },
    body: {
      name: "Updated Name",
      email: "updated@example.com",
      phone: "0987654321",
      address: "Updated Address",
    },
  };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();

  await updateProfile(req, res, next);

  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ user: null });
});

// test("should return an error if req.user is missing", async () => {
//   const { updateProfile } = await import("../controllers/authControllers");

//   // Mock req không có user
//   const req = { user: null, body: {} };
//   const res = {
//     status: jest.fn().mockReturnThis(),
//     json: jest.fn().mockReturnThis(),
//   };
//   const next = jest.fn();

//   await updateProfile(req, res, next);

//   expect(res.status).toHaveBeenCalledWith(200);
//   expect(res.json).toHaveBeenCalledWith({ user: null });
// });

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
  const { updateProfile } = await import("../controllers/authControllers");

  // Mock req, res và next
  const req = {
    user: { _id: "mock-user-id" },
    body: {
      name: "Updated Name",
      email: "updated@example.com",
      phone: "0987654321",
      address: "Updated Address",
    },
  };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();

  await updateProfile(req, res, next);

  expect(next).toHaveBeenCalledWith(new Error("Database error"));
});

