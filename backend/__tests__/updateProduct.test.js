import { jest } from "@jest/globals";

let req;
let res;
let next;

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();

  // Khởi tạo mock cho request, response, và next
  req = { params: { id: "123" }, body: { name: "Updated Product" } };
  res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  next = jest.fn();
});

test("should return 404 when product is not found", async () => {
  // Mock Product model
  const mockFindById = jest.fn().mockResolvedValue(null); // Sản phẩm không tồn tại

  jest.unstable_mockModule("../models/product", () => ({
    default: {
      findById: mockFindById,
      findByIdAndUpdate: jest.fn(),
    },
  }));

  // Mock redisClient
  const mockSendCommand = jest.fn();

  jest.unstable_mockModule("../utils/redisClient", () => ({
    default: {
      sendCommand: mockSendCommand,
    },
  }));

  // Import lại các module sau khi mock
  const Product = (await import("../models/product")).default;
  const redisClient = (await import("../utils/redisClient")).default;
  const { updateProduct } = await import("../controllers/productControllers");
  const ErrorHandler = (await import("../utils/errorHandler")).default;


  // Gọi hàm updateProduct
  await updateProduct(req, res, next);

  // Kiểm tra xem next có được gọi với lỗi "Không tìm thấy sản phẩm" và mã 404 hay không
  expect(next).toHaveBeenCalledWith(new ErrorHandler("Không tìm thấy sản phẩm", 404));

  // Kiểm tra redisClient.sendCommand không được gọi khi sản phẩm không tìm thấy
  expect(mockSendCommand).not.toHaveBeenCalled();

  // Kiểm tra res không được gọi
  expect(res.status).not.toHaveBeenCalled();
  expect(res.json).not.toHaveBeenCalled();
});

test("should update product and flush cache when product is found", async () => {
  // Mock Product model
  const mockFindById = jest.fn().mockResolvedValue({ _id: "123", name: "Old Product" });
  const mockFindByIdAndUpdate = jest.fn().mockResolvedValue({ _id: "123", name: "Updated Product" });

  jest.unstable_mockModule("../models/product", () => ({
    default: {
      findById: mockFindById,
      findByIdAndUpdate: mockFindByIdAndUpdate,
    },
  }));

  // Mock redisClient
  const mockSendCommand = jest.fn().mockResolvedValue("OK");

  jest.unstable_mockModule("../utils/redisClient", () => ({
    default: {
      sendCommand: mockSendCommand,
    },
  }));

  // Import lại các module sau khi mock
  const Product = (await import("../models/product")).default;
  const redisClient = (await import("../utils/redisClient")).default;
  const { updateProduct } = await import("../controllers/productControllers");

  // Gọi hàm updateProduct
  await updateProduct(req, res, next);

  // Kiểm tra Product.findByIdAndUpdate được gọi đúng cách
  expect(Product.findByIdAndUpdate).toHaveBeenCalledWith("123", { name: "Updated Product" }, { new: true });

  // Kiểm tra redisClient.sendCommand được gọi để xóa cache
  expect(redisClient.sendCommand).toHaveBeenCalledWith(["FLUSHDB"]);

  // Kiểm tra res.status và res.json được gọi với dữ liệu đúng
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({
    product: { _id: "123", name: "Updated Product" },
  });

  // Kiểm tra next không được gọi vì không có lỗi
  expect(next).not.toHaveBeenCalled();
});

test("should handle Redis error when flushing cache", async () => {
  // Mock Product model
  const mockFindById = jest.fn().mockResolvedValue({ _id: "123", name: "Old Product" });
  const mockFindByIdAndUpdate = jest.fn().mockResolvedValue({ _id: "123", name: "Updated Product" });

  jest.unstable_mockModule("../models/product", () => ({
    default: {
      findById: mockFindById,
      findByIdAndUpdate: mockFindByIdAndUpdate,
    },
  }));

  // Mock redisClient to simulate error
  const mockSendCommand = jest.fn().mockRejectedValue(new Error("Redis flush error"));

  jest.unstable_mockModule("../utils/redisClient", () => ({
    default: {
      sendCommand: mockSendCommand,
    },
  }));

  // Import lại các module sau khi mock
  const Product = (await import("../models/product")).default;
  const redisClient = (await import("../utils/redisClient")).default;
  const { updateProduct } = await import("../controllers/productControllers");
  const ErrorHandler = (await import("../utils/errorHandler")).default;

  // Mock console.error để kiểm tra log lỗi
  console.error = jest.fn();

  // Gọi hàm updateProduct
  await updateProduct(req, res, next);

  // Kiểm tra Product.findByIdAndUpdate được gọi đúng cách
  expect(Product.findByIdAndUpdate).toHaveBeenCalledWith("123", { name: "Updated Product" }, { new: true });

  // Kiểm tra redisClient.sendCommand được gọi để xóa cache
  expect(redisClient.sendCommand).toHaveBeenCalledWith(["FLUSHDB"]);

  // Kiểm tra res không được gọi, vì đã có lỗi xảy ra
  expect(res.status).not.toHaveBeenCalled();
  expect(res.json).not.toHaveBeenCalled();

  // Kiểm tra next được gọi với ErrorHandler có thông điệp lỗi "Lỗi kết nối Redis" và mã 500
  expect(next).toHaveBeenCalledWith(new ErrorHandler("Lỗi kết nối Redis", 500));

  // Kiểm tra console.error có nhận thông điệp lỗi Redis từ Redis client không
  expect(console.error).toHaveBeenCalledWith("Redis error:", expect.any(Error));
  expect(console.error.mock.calls[0][1].message).toBe("Redis flush error");
});