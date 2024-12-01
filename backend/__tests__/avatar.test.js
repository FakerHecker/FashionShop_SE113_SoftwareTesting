import { jest } from "@jest/globals";

// Mock module 'cloudinary' với jest.unstable_mockModule
test("should upload avatar successfully", async () => {
  const mockModule = await import('../utils/cloudinary');
  jest.unstable_mockModule('../utils/cloudinary', () => ({
    ...mockModule,
    upload_file: jest.fn().mockResolvedValue({
      public_id: "mock-public-id",
      url: "mock-url",
    }),
    delete_file: jest.fn().mockResolvedValue(true),
  }));

  // import hàm sau khi mock
  const newMockModule = await import('../utils/cloudinary');
  const { uploadAvatar, avatar } = await import('../controllers/authControllers');

  const req = {
    body: {
      avatar: 'fakeBase64Image',
    },
  };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  await avatar(req, res);

  // check status và json được trả đúng giá trị
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({
    message: 'uploaded',
    public_id: 'mock-public-id',
    url: 'mock-url',
  });
  expect(newMockModule.upload_file).toHaveBeenCalledWith('fakeBase64Image', "fashionshop/avatars");  //check hàm upload_image được gọi với đúng tham số giả
});
