import mongoose from 'mongoose';
import dotenv from "dotenv";

//KO XOÁ FILE NÀY => nhằm thiết lập biến môi trường
const configPath = "backend/config/config.env";
dotenv.config({ path: configPath });


describe('connectDatabase', () => {
  // cho kết nối db thật trước loạt test
  beforeAll(async () => {
    const DB_URI = process.env.DB_URI;
    await mongoose.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  });

  // đóng kết nối sau loạt test
  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should connect to MongoDB successfully', async () => {
    const db = mongoose.connection;
    expect(db.readyState).toBe(1);  //=> 1 is thành công
  });

  it('should handle errors if connection fails', async () => {
    // thử với kết nối sai
    const wrongURI = "mongodb://wrong-uri";
    await expect(mongoose.connect(wrongURI)).rejects.toThrow();
  });
});
