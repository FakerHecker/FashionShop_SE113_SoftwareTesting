import { jest } from "@jest/globals";
import { authorizeRoles } from "../middlewares/auth.js"; // Import middleware
import ErrorHandler from "../utils/errorHandler.js";

// Khởi tạo mock cho request, response, và next
let req;
let res;
let next;

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();

  req = { user: { role: "" } }; // Khởi tạo với role rỗng
  res = {};
  next = jest.fn();
});

test("should call next if the user role is authorized", async () => {
  // Cài đặt vai trò của người dùng hợp lệ
  req.user.role = "admin";

  // Gọi middleware với vai trò hợp lệ
  authorizeRoles("admin", "manager")(req, res, next);

  // Kiểm tra xem next có được gọi không
  expect(next).toHaveBeenCalledTimes(1); // Đảm bảo next được gọi 1 lần
});

test("should return an error if the user role is not authorized", async () => {
  // Cài đặt vai trò của người dùng không hợp lệ
  req.user.role = "guest";

  // Gọi middleware với vai trò không hợp lệ
  authorizeRoles("admin", "manager")(req, res, next);

  // Kiểm tra xem next có được gọi với lỗi không
  expect(next).toHaveBeenCalledWith(
    new ErrorHandler("Quyền (guest) Không được truy cập tính năng này", 403)
  );
  expect(next).toHaveBeenCalledTimes(1); // Đảm bảo next được gọi 1 lần với lỗi
});

// test("should return an error if the user role is missing (req.user is undefined)", async () => {
//   // Không gán req.user, để mặc định là undefined
//   req.user = undefined;

//   // Gọi middleware khi không có thông tin người dùng
//   authorizeRoles("admin", "manager")(req, res, next);

//   // Kiểm tra xem next có được gọi với lỗi khi không có user
//   expect(next).toHaveBeenCalledWith(
//     new ErrorHandler("Quyền (undefined) Không được truy cập tính năng này", 403)
//   );
//   expect(next).toHaveBeenCalledTimes(1); // Đảm bảo next được gọi 1 lần với lỗi
// });

test("should return an error if no roles are passed and user role is invalid", async () => {
  // Cài đặt vai trò của người dùng không hợp lệ
  req.user.role = "user";

  // Gọi middleware mà không truyền vào bất kỳ vai trò nào
  authorizeRoles()(req, res, next);

  // Kiểm tra xem next có được gọi với lỗi không
  expect(next).toHaveBeenCalledWith(
    new ErrorHandler("Quyền (user) Không được truy cập tính năng này", 403)
  );
  expect(next).toHaveBeenCalledTimes(1); // Đảm bảo next được gọi 1 lần với lỗi
});
