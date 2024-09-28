 import nodemailer from 'nodemailer';
// // Hàm gửi email
// const sendEmail = async (options) => {
//   const transport = nodemailer.createTransport({
//     //host: process.env.SMTP_HOST,// Địa chỉ host SMTP
//     host: process.env.SMTP_GMAIL,// Địa chỉ host SMTP
//     port: process.env.SMTP_PORT_GMAIL,// Cổng SMTP
//     //port: process.env.SMTP_PORT,// Cổng SMTP
//     auth: {
//       // user: process.env.SMTP_EMAIL,// Tài khoản email
//       // pass: process.env.SMTP_PASSWORD,// Mật khẩu email
//       user: process.env.EMAIL_NAME,// Tài khoản email
//       pass: process.env.EMAIL_APP_PASSWORD,// Mật khẩu email
//     },
//   });
// // Định dạng nội dung email
//   const message = {
//     // Tên người gửi và địa chỉ email người gửi
//     //from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
//     from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
//     to: options.email, // Địa chỉ email người nhận
//     subject: options.subject, // Chủ đề của email
//     html: options.message, // Nội dung HTML của email
//   };
// // Gửi email
//   await transport.sendMail(message);
// };

// export default sendEmail;



const sendEmail = async (options) => {
  try {
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_GMAIL,
      port: process.env.SMTP_PORT_GMAIL,
      secure: process.env.SMTP_PORT == 465, // Use true for port 465, false for other ports
      auth: {
        user: process.env.EMAIL_NAME,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
      // Additional settings for better logging and debugging
      logger: true,
      debug: true,
    });

    const message = {
      from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
      to: options.email,
      subject: options.subject,
      html: options.message,
    };

    const info = await transport.sendMail(message);

    console.log(`Email sent: ${info.response}`);
    return info;
  } catch (error) {
    console.error(`Error sending email: ${error.message}`);
    throw new Error('Email could not be sent');
  }
};

export default sendEmail;