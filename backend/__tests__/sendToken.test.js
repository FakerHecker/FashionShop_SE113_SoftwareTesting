import { jest } from "@jest/globals";

jest.unstable_mockModule("../models/user", () => ({
  default: {
    getJwtToken: jest.fn(),
  },
}));

let mockUser, mockToken, mockRes;

  beforeEach(() => {
    jest.clearAllMocks();

    mockToken = "mocked-jwt-token";
    mockUser = {
      getJwtToken: jest.fn().mockReturnValue(mockToken),
    };

    mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      redirect: jest.fn(),
    };

    process.env.COOKIE_EXPIRES_TIME = "7"; // 7 days
    process.env.NODE_ENV = "DEVELOPMENT";
    process.env.FRONTEND_URL = "http://localhost:3000";
    process.env.FRONTEND_PROD_URL = "https://example.com";
  });

  const sendToken = (await import("../utils/sendToken")).default;

  test("should send token in cookie and JSON response for local login", () => {
    sendToken(mockUser, 200, mockRes, "local");

    const expectedCookieOptions = {
      expires: expect.any(Date),
      httpOnly: true,
    };

    expect(mockUser.getJwtToken).toHaveBeenCalled();
    expect(mockRes.cookie).toHaveBeenCalledWith("token", mockToken, expectedCookieOptions);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ token: mockToken });
  });

  test("should send token in cookie and redirect for google login", () => {
    sendToken(mockUser, 200, mockRes, "google");

    const expectedCookieOptions = {
      expires: expect.any(Date),
      httpOnly: true,
    };

    expect(mockUser.getJwtToken).toHaveBeenCalled();
    expect(mockRes.cookie).toHaveBeenCalledWith("token", mockToken, expectedCookieOptions);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.redirect).toHaveBeenCalledWith(process.env.FRONTEND_URL);
  });

  test("should send token in cookie and redirect for facebook login", () => {
    sendToken(mockUser, 200, mockRes, "facebook");

    const expectedCookieOptions = {
      expires: expect.any(Date),
      httpOnly: true,
    };

    expect(mockUser.getJwtToken).toHaveBeenCalled();
    expect(mockRes.cookie).toHaveBeenCalledWith("token", mockToken, expectedCookieOptions);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.redirect).toHaveBeenCalledWith(process.env.FRONTEND_URL);
  });

  test("should send token in cookie and redirect to production URL for google login in production mode", () => {
    process.env.NODE_ENV = "PRODUCTION";

    sendToken(mockUser, 200, mockRes, "google");

    const expectedCookieOptions = {
      expires: expect.any(Date),
      httpOnly: true,
    };

    expect(mockUser.getJwtToken).toHaveBeenCalled();
    expect(mockRes.cookie).toHaveBeenCalledWith("token", mockToken, expectedCookieOptions);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.redirect).toHaveBeenCalledWith(process.env.FRONTEND_PROD_URL);
  });

  test("should respond with error message for unknown login type", () => {
    sendToken(mockUser, 400, mockRes, "unknown");

    // expect(mockUser.getJwtToken).not.toHaveBeenCalled();
    expect(mockRes.cookie).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "Unknown login type" });
  });
