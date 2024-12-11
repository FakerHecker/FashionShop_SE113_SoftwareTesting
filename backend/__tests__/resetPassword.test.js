import { jest } from "@jest/globals";

let req;
let res;
let next;

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

test("should handle invalid or expired reset password token", async () => {
  // Mock trả về null nếu không tìm thấy người dùng
  jest.unstable_mockModule("../models/user", () => ({
    default: {
      findOne: jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValueOnce(null), // Không tìm thấy user
      }),
    },
  }));

  const { resetPassword } = await import("../controllers/authControllers");
  const ErrorHandler = (await import("../utils/errorHandler")).default;

  req = {
    params: { token: "invalid-token" },
  };

  res = {};
  next = jest.fn();

  await resetPassword(req, res, next);

  expect(next).toHaveBeenCalledWith(
    new ErrorHandler("Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn", 400)
  );
  
});

test("should handle password mismatch", async () => {
  const comparePassword = jest.fn()

  jest.unstable_mockModule("../models/user", () => ({
    default: {
      findOne: jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValueOnce({
          comparePassword: comparePassword,
          save: jest.fn(),
        }),
      }),
    },
  }));


  const { resetPassword } = await import("../controllers/authControllers");
  const ErrorHandler = (await import("../utils/errorHandler")).default;

  req = {
    params: { token: "valid-token" },
    body: {
      password: "password123",
      confirmPassword: "password456", // Mật khẩu không khớp
    },
  };

  res = {};
  next = jest.fn();

  await resetPassword(req, res, next);

  expect(next).toHaveBeenCalledWith(new ErrorHandler("Mật khẩu không khớp", 400));
  const { default: User } = await import("../models/user");
  expect(User.findOne).toHaveBeenCalledWith({
    resetPasswordToken: expect.any(String),
    resetPasswordExpire: { $gt: expect.any(Number) },
  });

  // Kiểm tra select được gọi với tham số "+password"
  const mockUserInstance = await User.findOne.mock.results[0].value;  // await Promise để có được đối tượng mock trả về
  expect(mockUserInstance.select).toHaveBeenCalledWith("+password");
});


test("should handle new password same as old password", async () => {
  const comparePassword = jest.fn().mockResolvedValue(true)
  jest.unstable_mockModule("../models/user", () => ({
    default: {
      findOne: jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValueOnce({
          comparePassword: comparePassword, // Trùng mật khẩu cũ
          save: jest.fn(),
        }),
      }),
    },
  }));

  const { resetPassword } = await import("../controllers/authControllers");
  const ErrorHandler = (await import("../utils/errorHandler")).default;

  req = {
    params: { token: "valid-token" },
    body: {
      password: "password123",
      confirmPassword: "password123", // Mật khẩu khớp
    },
  };

  res = {};
  next = jest.fn();

  await resetPassword(req, res, next);

  expect(next).toHaveBeenCalledWith(
    new ErrorHandler("Mật khẩu mới không được trùng với mật khẩu cũ", 400)
  );

  const { default: User } = await import("../models/user");
  expect(User.findOne).toHaveBeenCalledWith({
    resetPasswordToken: expect.any(String),
    resetPasswordExpire: { $gt: expect.any(Number) },
  });

  // Kiểm tra select được gọi với tham số "+password"
  const mockUserInstance = await User.findOne.mock.results[0].value;  // await Promise để có được đối tượng mock trả về
  expect(mockUserInstance.select).toHaveBeenCalledWith("+password");
});




test("should reset password successfully", async () => {
  const comparePassword = jest.fn().mockResolvedValue(false)
  const mockSave = jest.fn();
  const mockSendToken = jest.fn();

  jest.unstable_mockModule("../models/user", () => ({
    default: {
      findOne: jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValueOnce({
          comparePassword: comparePassword,
          save: mockSave,
          resetPasswordToken: undefined,
          resetPasswordExpire: undefined,
        }),
      }),
    },
  }));

  jest.unstable_mockModule("../utils/sendToken", () => ({
    default: mockSendToken,
  }));

  const { resetPassword } = await import("../controllers/authControllers");

  req = {
    params: { token: "valid-token" },
    body: {
      password: "new-password",
      confirmPassword: "new-password", // Mật khẩu khớp
    },
  };

  res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  next = jest.fn();

  await resetPassword(req, res, next);

  expect(mockSave).toHaveBeenCalled();
  expect(mockSendToken).toHaveBeenCalledWith(
    expect.objectContaining({ resetPasswordToken: undefined }),
    200,
    res
  );

  const { default: User } = await import("../models/user");
  expect(User.findOne).toHaveBeenCalledWith({
    resetPasswordToken: expect.any(String),
    resetPasswordExpire: { $gt: expect.any(Number) },
  });

  // Kiểm tra select được gọi với tham số "+password"
  const mockUserInstance = await User.findOne.mock.results[0].value;  // await Promise để có được đối tượng mock trả về
  expect(mockUserInstance.select).toHaveBeenCalledWith("+password");
});
