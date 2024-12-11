import { jest } from "@jest/globals";

let req;
let res;
let next;

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

test("should return product from Redis cache", async () => {
  const mockRedisGet = jest.fn().mockResolvedValue(JSON.stringify({ id: "123", name: "Mock Product" }));
  jest.unstable_mockModule("../utils/redisClient", () => ({
    default: { get: mockRedisGet, set: jest.fn() },
  }));

  const redisClient = (await import("../utils/redisClient")).default;
  const { getProductDetails } = await import("../controllers/productControllers");

  req = { params: { id: "123" } };
  res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  next = jest.fn();

  await getProductDetails(req, res, next);

  expect(redisClient.get).toHaveBeenCalledWith("123");
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ product: { id: "123", name: "Mock Product" } });
  expect(next).not.toHaveBeenCalled();
});

test("should fetch product from database and store in Redis when not cached", async () => {
  // Mock Redis client
  const mockGet = jest.fn().mockResolvedValue(null); // Redis không có dữ liệu
  const mockSet = jest.fn();

  jest.unstable_mockModule("../utils/redisClient", () => ({
    default: {
      get: mockGet,
      set: mockSet,
    },
  }));

  // Mock Product model với chain methods
  const mockFindById = jest.fn().mockReturnValue({
    populate: jest.fn().mockReturnThis(), // mock chain cho populate
  });

  jest.unstable_mockModule("../models/product", () => ({
    default: {
      findById: mockFindById,
    },
  }));

  // Import lại các module sau khi mock
  const redisClient = (await import("../utils/redisClient")).default;
  const Product = (await import("../models/product")).default;
  const { getProductDetails } = await import("../controllers/productControllers");

  // Mock request, response, and next
  const req = { params: { id: "123" } };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  const next = jest.fn();

  // Mock dữ liệu trả về từ Product.findById
  const mockProduct = {
    _id: "123",
    name: "Mock Product",
    reviews: [],
  };

  // Sửa mock trả về đúng kết quả khi gọi populate
  Product.findById.mockReturnValue({
    ...mockProduct,
    populate: jest.fn().mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockProduct), // mock trả về dữ liệu sau khi populate
    })
  });

  // Gọi hàm
  await getProductDetails(req, res, next);

  // Kiểm tra redisClient.get được gọi đúng cách
  expect(redisClient.get).toHaveBeenCalledWith("123");

  // Kiểm tra Product.findById được gọi đúng cách
  expect(Product.findById).toHaveBeenCalledWith("123");

  const mockProductInstance = await Product.findById.mock.results[0].value;
  console.log(mockProductInstance)
  // Kiểm tra phương thức populate được gọi với tham số đúng
  expect(mockProductInstance.populate).toHaveBeenCalledWith("reviews.user");
  const sencondMockProductInstance = await mockProductInstance.populate.mock.results[0].value;
  expect(sencondMockProductInstance.populate).toHaveBeenCalledWith("reviews.order");

  // Kiểm tra redisClient.set được gọi với dữ liệu từ cơ sở dữ liệu
  expect(redisClient.set).toHaveBeenCalledWith(
    "123",
    JSON.stringify(mockProduct),
    "EX",
    3600
  );

  // Kiểm tra res được gọi đúng cách
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({
    product: mockProduct,
  });

  // Đảm bảo next không được gọi vì không có lỗi xảy ra
  expect(next).not.toHaveBeenCalled();
});

test("should return 404 when product is not found", async () => {
  // Mock Redis client
  const mockGet = jest.fn().mockResolvedValue(null); // Redis không có dữ liệu
  const mockSet = jest.fn();

  jest.unstable_mockModule("../utils/redisClient", () => ({
    default: {
      get: mockGet,
      set: mockSet,
    },
  }));

  // Mock Product model với chain methods
  const mockFindById = jest.fn().mockReturnValue({
    populate: jest.fn().mockReturnValue({
      populate: jest.fn().mockResolvedValue(null),
    })
  })

  jest.unstable_mockModule("../models/product", () => ({
    default: {
      findById: mockFindById,
    },
  }));

  // Import lại các module sau khi mock
  const redisClient = (await import("../utils/redisClient")).default;
  const Product = (await import("../models/product")).default;
  const { getProductDetails } = await import("../controllers/productControllers");
  const ErrorHandler = (await import("../utils/errorHandler")).default;

  // Mock request, response, and next
  const req = { params: { id: "123" } };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  const next = jest.fn();

  // Gọi hàm
  await getProductDetails(req, res, next);

  // Kiểm tra redisClient.get được gọi đúng cách
  expect(redisClient.get).toHaveBeenCalledWith("123");

  // Kiểm tra Product.findById được gọi đúng cách
  expect(Product.findById).toHaveBeenCalledWith("123");

  // Kiểm tra next có được gọi với ErrorHandler có message "Không tìm thấy sản phẩm" và status 404
  expect(next).toHaveBeenCalledWith(new ErrorHandler("Không tìm thấy sản phẩm", 404));

  // Kiểm tra res không được gọi, vì đã có lỗi xảy ra
  expect(res.status).not.toHaveBeenCalled();
  expect(res.json).not.toHaveBeenCalled();
});

test("should handle Redis connection error", async () => {
  // Mock Redis client để simulate lỗi kết nối
  const mockGet = jest.fn().mockRejectedValue(new Error("Redis error"));
  const mockSet = jest.fn();

  jest.unstable_mockModule("../utils/redisClient", () => ({
    default: {
      get: mockGet,
      set: mockSet,
    },
  }));

  // Mock Product model với chain methods
  const mockFindById = jest.fn().mockReturnValue({
    populate: jest.fn().mockReturnValue({
      populate: jest.fn().mockResolvedValue(null),
    })
  })

  jest.unstable_mockModule("../models/product", () => ({
    default: {
      findById: mockFindById,
    },
  }));

  // Mock ErrorHandler để kiểm tra lỗi
  // const mockErrorHandler = jest.fn();
  // jest.mock("../utils/errorHandler", () => ({
  //   ErrorHandler: mockErrorHandler,
  // }));

  // Import lại các module sau khi mock
  const redisClient = (await import("../utils/redisClient")).default;
  const Product = (await import("../models/product")).default;
  const { getProductDetails } = await import("../controllers/productControllers");
  // const { ErrorHandler } = await import("../utils/errorHandler");
  const ErrorHandler = (await import("../utils/errorHandler")).default;

  // Mock request, response, and next
  const req = { params: { id: "123" } };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  const next = jest.fn();

  // Gọi hàm và kiểm tra lỗi Redis
  await getProductDetails(req, res, next);

  // Kiểm tra redisClient.get được gọi đúng cách
  expect(redisClient.get).toHaveBeenCalledWith("123");

  // Kiểm tra Product.findById không được gọi vì lỗi Redis
  expect(Product.findById).not.toHaveBeenCalled();

  // Kiểm tra next được gọi với ErrorHandler có thông điệp lỗi "Lỗi kết nối Redis" và mã 500
  expect(next).toHaveBeenCalledWith(new ErrorHandler("Lỗi kết nối Redis", 500));

  // Kiểm tra res không được gọi, vì đã có lỗi xảy ra
  expect(res.status).not.toHaveBeenCalled();
  expect(res.json).not.toHaveBeenCalled();

  // Kiểm tra redisClient.set không được gọi khi xảy ra lỗi Redis
  expect(redisClient.set).not.toHaveBeenCalled();
});

