import { isAuthenticatedServer } from "../middlewares/auth.js"; // Import middleware
import ErrorHandler from "../utils/errorHandler.js"; // Import ErrorHandler
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js"; // Import catchAsyncErrors
import { jest } from "@jest/globals";

// Khởi tạo mock cho request, response, và next
let req;
let res;
let next;

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
  req = { headers: {} }; // Mock headers
  res = {};
  next = jest.fn();
});

test("should allow the request if the origin is allowed", async () => {
  const allowedOrigin = 'https://allowed-origin.com'; // Giả sử đây là origin hợp lệ
  req.headers.origin = allowedOrigin; // Gán origin hợp lệ vào request

  // Gọi middleware
  await isAuthenticatedServer(req, res, next);

  // Kiểm tra xem next có được gọi không, vì origin hợp lệ
  expect(next).toHaveBeenCalledTimes(1);
});

test("should return an error if the origin is not allowed", async () => {
  const allowedOrigin = 'https://allowed-origin.com'; // Giả sử đây là origin hợp lệ
  const requestOrigin = 'https://disallowed-origin.com'; // Origin không hợp lệ
  req.headers.origin = requestOrigin; // Gán origin không hợp lệ vào request

  // Gọi middleware
  await isAuthenticatedServer(req, res, next);

  // Kiểm tra xem next có được gọi với lỗi không
  expect(next).toHaveBeenCalledWith(
    new ErrorHandler(`Server (${req.headers.origin}) không được truy cập tính năng này`, 403)
  );
  expect(next).toHaveBeenCalledTimes(1); // Đảm bảo next chỉ được gọi một lần
});

test("should return an error if the origin is missing", async () => {
  const allowedOrigin = 'https://allowed-origin.com'; // Giả sử đây là origin hợp lệ
  req.headers.origin = undefined; // Không có origin trong headers

  // Gọi middleware
  await isAuthenticatedServer(req, res, next);

  // Kiểm tra xem next có được gọi với lỗi không khi thiếu origin
  expect(next).toHaveBeenCalledWith(
    new ErrorHandler(`Server (${req.headers.origin}) không được truy cập tính năng này`, 403)
  );
  expect(next).toHaveBeenCalledTimes(1); // Đảm bảo next chỉ được gọi một lần
});

test("should handle empty allowedOrigin", async () => {
  const allowedOrigin = ''; // Giả sử origin hợp lệ là chuỗi rỗng
  req.headers.origin = ''; // Gán origin là chuỗi rỗng

  // Gọi middleware
  await isAuthenticatedServer(req, res, next);

  // Kiểm tra xem next có được gọi không khi origin là chuỗi rỗng
  expect(next).toHaveBeenCalledTimes(1);
});

test("should handle invalid origin type", async () => {
  const allowedOrigin = 'https://allowed-origin.com';
  req.headers.origin = 123; // Gán origin không hợp lệ (kiểu số)

  // Gọi middleware
  await isAuthenticatedServer(req, res, next);

  // Kiểm tra xem next có được gọi với lỗi khi origin là giá trị không hợp lệ
  expect(next).toHaveBeenCalledWith(
    new ErrorHandler(`Server (${req.headers.origin}) không được truy cập tính năng này`, 403)
  );
  expect(next).toHaveBeenCalledTimes(1); // Đảm bảo next chỉ được gọi một lần
});
