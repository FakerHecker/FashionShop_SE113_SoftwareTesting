import { logout } from "../controllers/authControllers"; // Import middleware
import { jest } from "@jest/globals"; // Import jest để mock

let req;
let res;
let next;

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
  req = {}; // Không cần gì đặc biệt cho request
  res = {
    cookie: jest.fn(), // Mock hàm cookie
    status: jest.fn().mockReturnThis(), // Mock hàm status
    json: jest.fn(), // Mock hàm json
  };
  next = jest.fn();
});

test("should log out the user and clear the token cookie", async () => {
  // Gọi middleware logout
  await logout(req, res, next);

  // Kiểm tra xem cookie đã được xóa chưa (token = null, expires = thời gian hiện tại)
  expect(res.cookie).toHaveBeenCalledWith("token", null, expect.objectContaining({
    expires: expect.any(Date),
    httpOnly: true,
  }));

  // Kiểm tra xem hàm json có được gọi với thông báo "Đăng Xuất" không
  expect(res.json).toHaveBeenCalledWith({
    message: "Đăng Xuất",
  });

  // Kiểm tra xem mã trạng thái trả về có phải là 200 không
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.status).toHaveBeenCalledTimes(1);
});

test("should call next if there is an error", async () => {
  // Giả lập một lỗi trong hàm cookie
  const error = new Error("Test error");

  // Mock lại phương thức cookie để ném lỗi
  res.cookie.mockImplementationOnce(() => {
    throw error;
  });

  // Gọi middleware logout và kiểm tra xem next có được gọi với lỗi không
  await logout(req, res, next);

  // Kiểm tra xem next có được gọi với lỗi như mong muốn không
  expect(next).toHaveBeenCalledWith(error);
});
