const nodemailer = require("nodemailer");

// Create transporter for sending emails
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER || "your-email@gmail.com",
      pass: process.env.EMAIL_PASS || "your-app-password",
    },
  });
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email for password reset
const sendPasswordResetOTP = async (email, otp) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_USER || "lebroidhealthcare@gmail.com",
    to: email,
    subject: "Lebrostone - Password Reset OTP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #00a758 0%, #00afef 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Lebrostone</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Wellness & Beauty Store</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Password Reset Request</h2>
          
          <p>Hello,</p>
          
          <p>We received a request to reset your password. Use the following OTP to complete the process:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; background: #00a758; color: white; padding: 15px 30px; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 8px;">
              ${otp}
            </div>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            This OTP will expire in 10 minutes. If you didn't request this password reset, please ignore this email.
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            ©️ 2026 Lebroid Healthcare Private Limited. All Rights Reserved.<br>
            From the House of Life Infotech Institute
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset OTP sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error("Email sending failed:", error);
    return { success: false, error: error.message };
  }
};

// Send OTP email for mobile number change
const sendMobileChangeOTP = async (email, otp) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_USER || "your-email@gmail.com",
    to: email,
    subject: "Lebrostone - Mobile Number Change OTP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #00a758 0%, #00afef 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Lebrostone</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Wellness & Beauty Store</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Mobile Number Change Request</h2>
          
          <p>Hello,</p>
          
          <p>You have requested to change your mobile number. Use the following OTP to verify this change:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; background: #00a758; color: white; padding: 15px 30px; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 8px;">
              ${otp}
            </div>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            This OTP will expire in 10 minutes. If you didn't request this change, please ignore this email.
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            ©️ 2026 Lebroid Healthcare Private Limited. All Rights Reserved.<br>
            From the House of Life Infotech Institute
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Mobile change OTP sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error("Email sending failed:", error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  generateOTP,
  sendPasswordResetOTP,
  sendMobileChangeOTP,
};
