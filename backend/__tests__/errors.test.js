import { jest } from "@jest/globals";
import errorHandler from "../middlewares/errors";
import ErrorHandler from "../utils/errorHandler.js";

let mockReq, mockRes, mockNext;

beforeEach(() => {
  mockReq = {}; // Đối tượng giả lập req
  mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  mockNext = jest.fn(); // next giả lập
  process.env.NODE_ENV = "DEVELOPMENT"; // Mặc định là môi trường phát triển
});

// it("should return default error when no statusCode or message is provided", () => {
//   const err = {}; // Giả lập lỗi không có statusCode và message
//   errorHandler(err, mockReq, mockRes, mockNext);

//   expect(mockRes.status).toHaveBeenCalledWith(500);
//   expect(mockRes.json).toHaveBeenCalledWith({
//     message: "Lỗi máy chủ nội bộ",
//     error: err,
//     stack: undefined,
//   });
// });

it("should handle CastError and return custom error", () => {
  const err = { name: "CastError", path: "userId" };
  errorHandler(err, mockReq, mockRes, mockNext);

  expect(mockRes.status).toHaveBeenCalledWith(404);
  expect(mockRes.json).toHaveBeenCalledWith({
      message: "Không tìm thấy ID hợp lệ: userId",
      error: {
          name: "CastError",
          path: "userId",
      },
      stack: undefined,
  });
});

it("should handle ValidationError and return custom error", () => {
  const err = {
      name: "ValidationError",
      errors: {
          name: { message: "Name is required" },
          email: { message: "Email is invalid" },
      },
  };
  errorHandler(err, mockReq, mockRes, mockNext);

  expect(mockRes.status).toHaveBeenCalledWith(400);
  expect(mockRes.json).toHaveBeenCalledWith({
      message: "Name is required,Email is invalid",
      error: {
          name: "ValidationError",
          errors: {
              name: { message: "Name is required" },
              email: { message: "Email is invalid" },
          },
      },
      stack: undefined,
  });
});

it("should handle duplicate key error and return custom error", () => {
  const err = { code: 11000, keyValue: { email: "test@example.com" } };
  errorHandler(err, mockReq, mockRes, mockNext);

  expect(mockRes.status).toHaveBeenCalledWith(400);
  expect(mockRes.json).toHaveBeenCalledWith({
      message: "email đã nhập trùng lặp.",
      error: {
          code: 11000,
          keyValue: { email: "test@example.com" },
      },
      stack: undefined,
  });
});

it("should handle invalid JWT error and return custom error", () => {
  const err = { name: "JsonWebTokenError" };
  errorHandler(err, mockReq, mockRes, mockNext);

  expect(mockRes.status).toHaveBeenCalledWith(400);
  expect(mockRes.json).toHaveBeenCalledWith({
      message: "Mã JWT không hợp lệ. Thử lại!!!",
      error: { name: "JsonWebTokenError" },
      stack: undefined,
  });
});

it("should handle expired JWT error and return custom error", () => {
  const err = { name: "TokenExpiredError" };
  errorHandler(err, mockReq, mockRes, mockNext);

  expect(mockRes.status).toHaveBeenCalledWith(400);
  expect(mockRes.json).toHaveBeenCalledWith({
      message: "Mã JWT đã hết hạn. Thử lại!!!",
      error: { name: "TokenExpiredError" },
      stack: undefined,
  });
});

it("should only return message in PRODUCTION environment", () => {
  process.env.NODE_ENV = "PRODUCTION";
  const err = {};
  errorHandler(err, mockReq, mockRes, mockNext);

  expect(mockRes.status).toHaveBeenCalledWith(500);
  expect(mockRes.json).toHaveBeenCalledWith({
      message: "Lỗi máy chủ nội bộ",
  });
});