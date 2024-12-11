import { jest } from "@jest/globals";

let req;
let res;
let next;

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
  process.env.NODE_ENV = "development";
  process.env.FRONTEND_URL = "http://localhost:3000";
  process.env.FRONTEND_PROD_URL = "https://fashionshop.com";
});

test("should handle email not found", async () => {
  // Mock User.findOne để trả về null
  const mockFindOne = jest.fn().mockResolvedValue(null);

  jest.unstable_mockModule("../models/user", () => ({
    default: {
      findOne: mockFindOne,
    },
  }));

  const { forgotPassword } = await import("../controllers/authControllers");
  const ErrorHandler = (await import("../utils/errorHandler")).default;

  req = {
    body: { email: "not-found@example.com" },
  };

  res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  next = jest.fn();

  await forgotPassword(req, res, next);

  expect(mockFindOne).toHaveBeenCalledWith({ email: "not-found@example.com" });
  expect(next).toHaveBeenCalledWith(new ErrorHandler("Không tìm thấy email", 404));
});

test("should handle email sending failure", async () => {
  const mockGetResetPasswordToken = jest.fn().mockReturnValue("mock-reset-token");
  const mockSave = jest.fn().mockResolvedValue();
  const mockFindOne = jest.fn().mockResolvedValue({
    email: "mock-email@example.com",
    name: "Mock User",
    getResetPasswordToken: mockGetResetPasswordToken,
    save: mockSave,
  });

  jest.unstable_mockModule("../models/user", () => ({
    default: {
      findOne: mockFindOne,
    },
  }));

  const mockSendEmail = jest.fn().mockRejectedValue(new Error("SMTP Error"));

  jest.unstable_mockModule("../utils/sendEmail", () => ({
    default: mockSendEmail,
  }));

  const { forgotPassword } = await import("../controllers/authControllers");

  req = {
    body: { email: "mock-email@example.com" },
  };

  res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  next = jest.fn();

  await forgotPassword(req, res, next);

  expect(mockFindOne).toHaveBeenCalledWith({ email: "mock-email@example.com" });
  expect(mockGetResetPasswordToken).toHaveBeenCalled();
  expect(mockSave).toHaveBeenCalledTimes(2); // Trước và sau khi reset token
  expect(mockSendEmail).toHaveBeenCalled();
  expect(next).toHaveBeenCalledWith(expect.any(Error));
});

test("should handle email sent successfully (non-production)", async () => {
  const mockGetResetPasswordToken = jest.fn().mockReturnValue("mock-reset-token");
  const mockSave = jest.fn().mockResolvedValue();
  const mockFindOne = jest.fn().mockResolvedValue({
    email: "mock-email@example.com",
    name: "Mock User",
    getResetPasswordToken: mockGetResetPasswordToken,
    save: mockSave,
  });

  jest.unstable_mockModule("../models/user", () => ({
    default: {
      findOne: mockFindOne,
    },
  }));

  const mockSendEmail = jest.fn().mockResolvedValue({
    response: "250 Message accepted for delivery",
  });

  jest.unstable_mockModule("../utils/sendEmail", () => ({
    default: mockSendEmail,
  }));

  const { forgotPassword } = await import("../controllers/authControllers");

  req = {
    body: { email: "mock-email@example.com" },
  };

  res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  next = jest.fn();

  await forgotPassword(req, res, next);

  const expectedResetUrl = `${process.env.FRONTEND_URL}/password/reset/mock-reset-token`;
  expect(mockFindOne).toHaveBeenCalledWith({ email: "mock-email@example.com" });
  expect(mockSendEmail).toHaveBeenCalledWith({
    email: "mock-email@example.com",
    subject: " FashionShop - Email lấy lại mật khẩu",
    message: expect.stringContaining(expectedResetUrl),
  });
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({
    message: `Gửi email tới: mock-email@example.com`,
    token: "mock-reset-token",
  });
});

test("should handle email sent successfully (production)", async () => {
  const mockGetResetPasswordToken = jest.fn().mockReturnValue("mock-reset-token");
  const mockSave = jest.fn().mockResolvedValue();
  const mockFindOne = jest.fn().mockResolvedValue({
    email: "mock-email@example.com",
    name: "Mock User",
    getResetPasswordToken: mockGetResetPasswordToken,
    save: mockSave,
  });

  jest.unstable_mockModule("../models/user", () => ({
    default: {
      findOne: mockFindOne,
    },
  }));

  const mockSendEmail = jest.fn().mockResolvedValue({
    response: "250 Message accepted for delivery",
  });

  jest.unstable_mockModule("../utils/sendEmail", () => ({
    default: mockSendEmail,
  }));

  process.env.NODE_ENV = "PRODUCTION";

  const { forgotPassword } = await import("../controllers/authControllers");

  req = {
    body: { email: "mock-email@example.com" },
  };

  res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  next = jest.fn();

  await forgotPassword(req, res, next);

  const expectedResetUrl = `${process.env.FRONTEND_PROD_URL}/password/reset/mock-reset-token`;
  expect(mockFindOne).toHaveBeenCalledWith({ email: "mock-email@example.com" });
  expect(mockSendEmail).toHaveBeenCalledWith({
    email: "mock-email@example.com",
    subject: " FashionShop - Email lấy lại mật khẩu",
    message: expect.stringContaining(expectedResetUrl),
  });
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({
    message: `Gửi email tới: mock-email@example.com`,
    token: "mock-reset-token",
  });
});