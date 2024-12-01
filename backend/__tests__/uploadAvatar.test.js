import { jest } from "@jest/globals";

test("should upload avatar successfully", async () => {
  // mock module cloudinary
  const mockCloudinary = await import('../utils/cloudinary');
  jest.unstable_mockModule('../utils/cloudinary', () => ({
    ...mockCloudinary,
    upload_file: jest.fn().mockResolvedValue({
      public_id: "mock-public-id",
      url: "mock-url",
    }),
    delete_file: jest.fn().mockResolvedValue(true),
  }));

  // mock module User (trong folder models)
  const mockUser = await import('../models/user');
  jest.unstable_mockModule('../models/user', () => ({
    ...mockUser,
    default: {
      findByIdAndUpdate: jest.fn().mockResolvedValue({
        _id: "mock-user-id",
        avatar: {
          public_id: "mock-public-id",
          url: "mock-url",
        },
      }),
    },
  }));

  // import lại sau khi mock
  const cloudinary = await import('../utils/cloudinary');
  const User = await import('../models/user');
  const { uploadAvatar } = await import('../controllers/authControllers');

  // giả lập req và res
  const req = {
    body: {
      avatar: 'fakeBase64Image',
    },
    user: {
      _id: "mock-user-id",
      avatar: {
        public_id: "old-public-id",
        url: "old-url",
      },
    },
  };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  await uploadAvatar(req, res);

  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({
    user: {
      _id: "mock-user-id",
      avatar: {
        public_id: "mock-public-id",
        url: "mock-url",
      },
    },
  });

  // kiểm tra các hàm mock được gọi đúng
  expect(cloudinary.upload_file).toHaveBeenCalledWith('fakeBase64Image', "fashionshop/avatars");
  expect(User.default.findByIdAndUpdate).toHaveBeenCalledWith(
    "mock-user-id",
    { avatar: { public_id: "mock-public-id", url: "mock-url" } }
  );
});
