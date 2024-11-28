import request from 'supertest';
import app from '../app'; // Đảm bảo đường dẫn chính xác tới file app.js
import mongoose from 'mongoose';

// test mẫu trường hợp đăng nhập thành công
describe('POST /api/login', () => {
  beforeAll(async () => {
    const DB_URI = process.env.DB_URI;
    await mongoose.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  });

  // Đảm bảo đóng kết nối sau khi test xong
  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should return 201 and send token if login is successful', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'atlaoognhk@gmail.com', password: '123456789' });

    expect(res.statusCode).toEqual(201);  //=>check status code trả về đúng
    expect(res.body.token).toBeDefined();  //=>check có trả về token
  });
});

