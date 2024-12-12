import { jest } from "@jest/globals";
import { isAuthenticatedUser } from "../middlewares/auth.js"; // Import middleware sau khi mock
import ErrorHandler from "../utils/errorHandler.js";
// import User from "../models/user.js";
import * as jwt from 'jsonwebtoken';
jest.mock('jsonwebtoken', () => {
  return {
      __esModule: true,
      ...jest.requireActual('jsonwebtoken'),
      decode: require('jsonwebtoken/decode')
  };
});

// Khởi tạo mock cho request, response, và next
let req;
let res;
let next;

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();

  req = { cookies: {} };
  res = {};
  next = jest.fn();
});


test("should return an error if token is not provided", async () => {
  // Import lại các module sau khi mock
  jest.mock("jsonwebtoken", () => ({
    verify: jest.fn(),
  }));

  jest.unstable_mockModule("../models/user.js", () => ({
    default: {
      findById: jest.fn(),
    },
  }));

  const User = (await import("../models/user.js")).default;

  // Gọi middleware
  await isAuthenticatedUser(req, res, next);

  // Kiểm tra xem next có được gọi với lỗi không có token không
  expect(next).toHaveBeenCalledWith(
    new ErrorHandler("Vui lòng đăng nhập để tiếp tục", 401)
  );
});

test("should return an error if token is invalid", async () => {
  req.cookies.token = "invalid_token";

  // Mock jwt.verify ném lỗi
  jest.mock("jsonwebtoken", () => ({
    verify: jest.fn().mockImplementation(() => {
      throw new Error("Invalid token");
    }),
  }));

  // Import lại jwt sau khi mock
  const jwt = (await import("jsonwebtoken")).default;

  await isAuthenticatedUser(req, res, next);

  // Kiểm tra next được gọi với lỗi khi token không hợp lệ
  expect(next).toHaveBeenCalledWith(expect.any(Error));
});

test("should return an error if user is not found in the database", async () => {
  const decoded = { id: "user_id" };
  req.cookies.token = "valid_token";

  // Mock jwt.verify trả về decoded
  jest.mock("jsonwebtoken", () => ({
    verify: jest.fn().mockReturnValue(decoded),
  }));

  // Import lại jwt sau khi mock
  const jwt = (await import("jsonwebtoken")).default;

  // Mock User.findById trả về null (người dùng không tìm thấy)
  jest.mock("../models/user.js", () => ({
    default: {
      findById: jest.fn().mockResolvedValue(null),
    },
  }));

  const User = (await import("../models/user.js")).default;

  await isAuthenticatedUser(req, res, next);

  // Kiểm tra next có được gọi với lỗi nếu không tìm thấy người dùng
  expect(next).toHaveBeenCalledWith(expect.any(Error)); // Kiểm tra next nhận bất kỳ lỗi nào
});


test("should call next if user is authenticated successfully", async () => {
  const decoded = { id: "user_id" };
  const user = { id: "user_id", name: "Test User" };
  req.cookies = {token : "valid_token"};

  // Mock jwt.verify trả về decoded
  jest.mock('jsonwebtoken', () => ({
    verify: jest.fn().mockReturnValue(decoded),
  }));

  // jest.spyOn(jwt, 'decode').mockImplementation(() => 'some token');


  // Mock User.findById trả về người dùng hợp lệ
  jest.mock("../models/user.js", () => ({
    default: {
      findById: jest.fn().mockResolvedValue(user),
    },
  }));

  // Import lại jwt sau khi mock
  const jwt = (await import("jsonwebtoken")).default;
  const User = (await import("../models/user.js")).default;

  await isAuthenticatedUser(req, res, next);

  // console.log(req)


  // console.log('aaaaaaaa',jwt)

  // expect(jwt.verify).toHaveBeenCalledWith("valid_token");

  // expect(await User.findById).toHaveBeenCalledWith(decoded.id);
  // Kiểm tra xem next có được gọi khi người dùng hợp lệ
  expect(next).toHaveBeenCalledTimes(1);
});
