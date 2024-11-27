import request from 'supertest';
import app from '../app'; // Adjust the path to your app file
import User from '../models/user'; // Adjust the path to your user model
import { sendToken } from '../utils/sendToken'; // Adjust the path to your sendToken function

jest.mock('../models/user');
jest.mock('../utils/sendToken');

describe('POST /api/login', () => {
    it('should return 400 if email or password is missing', async () => {
        const res = await request(app)
            .post('/api/login')
            .send({ email: '' });

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toEqual('Vui lòng nhập email và mật khẩu');
    });

    it('should return 401 if user does not exist', async () => {
        User.findOne.mockResolvedValue(null);

        const res = await request(app)
            .post('/api/login')
            .send({ email: 'test@example.com', password: 'password123' });

        expect(res.statusCode).toEqual(401);
        expect(res.body.message).toEqual('email hoặc mật khẩu không đúng');
    });

    it('should return 401 if password is incorrect', async () => {
        const mockUser = {
            comparePassword: jest.fn().mockResolvedValue(false),
        };
        User.findOne.mockResolvedValue(mockUser);

        const res = await request(app)
            .post('/api/login')
            .send({ email: 'test@example.com', password: 'wrongpassword' });

        expect(res.statusCode).toEqual(401);
        expect(res.body.message).toEqual('username hoặc mật khẩu không đúng');
    });

    it('should return 201 and send token if login is successful', async () => {
        const mockUser = {
            comparePassword: jest.fn().mockResolvedValue(true),
        };
        User.findOne.mockResolvedValue(mockUser);
        sendToken.mockImplementation((user, statusCode, res) => {
            res.status(statusCode).json({ success: true, token: 'fakeToken' });
        });

        const res = await request(app)
            .post('/api/login')
            .send({ email: 'test@example.com', password: 'password123' });

        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBe(true);
        expect(res.body.token).toEqual('fakeToken');
    });
});