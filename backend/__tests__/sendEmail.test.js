import { jest } from "@jest/globals";

let req;
let res;
let next;

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

test("should send email successfully", async () => {
  jest.unstable_mockModule("nodemailer", () => ({
    default: {
      createTransport: jest.fn().mockReturnValue({
        sendMail: jest.fn().mockResolvedValue({
          response: "250 Message accepted",
        }),
      }),
    }
  }));

  const sendEmail = (await import("../utils/sendEmail")).default;

  // Thiết lập các thông tin email cần gửi
  const options = {
    email: "recipient@example.com",
    subject: "Test Subject",
    message: "<p>This is a test email</p>",
  };

  // Gửi email
  const result = await sendEmail(options);

  // Kiểm tra kết quả trả về
  expect(result).toEqual({
    response: "250 Message accepted",
  });
});

test("should throw error if email fails to send", async () => {
  jest.unstable_mockModule("nodemailer", () => ({
    default: {
      createTransport: jest.fn().mockReturnValue({
        sendMail: jest.fn().mockRejectedValue(new Error("Failed to send email")),
      }),
    }
  }));

  const sendEmail = (await import("../utils/sendEmail")).default;

  // Thiết lập các thông tin email cần gửi
  const options = {
    email: "recipient@example.com",
    subject: "Test Subject",
    message: "<p>This is a test email</p>",
  };

  // Kỳ vọng lỗi khi gửi email
  await expect(sendEmail(options)).rejects.toThrow("Email could not be sent");
});
