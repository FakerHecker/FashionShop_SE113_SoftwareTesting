import { jest } from "@jest/globals";
// import { updatePassword } from "../controllers/authControllers";
// import User from "../models/user";

let req;
let res;
let next;

beforeEach(() => {
  // Reset tất cả các mô-đun và mock trước mỗi bài kiểm tra
  jest.resetModules();
  jest.clearAllMocks();
});

test("should update password successfully", async () => {
  const comparePasswordMock = jest.fn().mockResolvedValueOnce(true);
  jest.unstable_mockModule("../models/user", () => ({
    default: {
      findById: jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValueOnce({
          _id: "mock-user-id",
          password: "hashedPassword",
          comparePassword: comparePasswordMock,
          save: jest.fn().mockResolvedValue(),
        }),
      }),
    },
  }));

  // jest.spyOn(User, 'findById')
  // .mockReturnThis()
  // .mockReturnValue({
  //     select: jest.fn().mockResolvedValueOnce({
  //       _id: "mock-user-id",
  //       password: "hashedPassword",
  //       comparePassword: jest.fn().mockResolvedValue(true),  // Mock so sánh mật khẩu trả về true
  //       save: jest.fn().mockResolvedValue(),  // Mock lưu user sau khi cập nhật mật khẩu
  //       // select: jest.fn().mockReturnThis(),  // Mock select để trả về chính đối tượng này
  //     }),
  // });


  // Import lại User và controller sau khi mock
  const User = await import("../models/user");
  const { updatePassword } = await import('../controllers/authControllers');

  // Giả lập req, res
  req = {
    user: { _id: "mock-user-id" },
    body: {
      oldPassword: "oldPassword",
      password: "newPassword",
    },
  };

  res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  next = jest.fn();

  // Gọi hàm updatePassword
  await updatePassword(req, res, next);

  // Kiểm tra các mock được gọi đúng cách
  expect(User.default.findById).toHaveBeenCalledWith("mock-user-id");

  // Kiểm tra select được gọi với tham số "+password"
  const mockUserInstance = await User.default.findById.mock.results[0].value;  // await Promise để có được đối tượng mock trả về
  expect(mockUserInstance.select).toHaveBeenCalledWith("+password");

  console.log(await mockUserInstance.select.mock.results[0].value)

  // Kiểm tra các phương thức khác
  const selectInstance = await mockUserInstance.select.mock.results[0].value
  expect(selectInstance.comparePassword).toHaveBeenCalledWith(req.body.oldPassword);
  expect(selectInstance.comparePassword.mock.results[0].value).resolves.toBe(true);
  expect(selectInstance.save).toHaveBeenCalled();

  // Kiểm tra response status và json
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ success: true });
});



test("should fail when old password is incorrect", async () => {
  const comparePasswordMock = jest.fn().mockResolvedValueOnce(false);
  jest.unstable_mockModule("../models/user", () => ({
    default: {
      findById: jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValueOnce({
          _id: "mock-user-id",
          password: "hashedPassword",
          comparePassword: comparePasswordMock,
          save: jest.fn(),
        }),
      }),
    },
  }));
  

  // Import lại User và controller sau khi mock
  const User = await import("../models/user");
  const { updatePassword } = await import("../controllers/authControllers");

  // Giả lập req, res, next
  req = {
    user: { _id: "mock-user-id" },
    body: {
      oldPassword: "wrongPassword",
      password: "newPassword",
    },
  };

  res = {
    status: jest.fn(),
    json: jest.fn(),
  };

  next = jest.fn();

  // Gọi hàm
  await updatePassword(req, res, next);

  // Kiểm tra các mock được gọi đúng cách
  expect(User.default.findById).toHaveBeenCalledWith("mock-user-id");

  // Kiểm tra select được gọi với tham số "+password"
  const wrongMockUserInstance = await User.default.findById.mock.results[0].value;
  expect(wrongMockUserInstance.select).toHaveBeenCalledWith("+password");

  console.log(wrongMockUserInstance)

  // Kiểm tra các phương thức khác
  const wrongSelectInstance = await wrongMockUserInstance.select.mock.results[0].value
  expect(wrongSelectInstance.comparePassword).toHaveBeenCalledWith("wrongPassword");
  expect(wrongSelectInstance.comparePassword.mock.results[0].value).resolves.toBe(false);
  expect(wrongSelectInstance.save).not.toHaveBeenCalled();
});


