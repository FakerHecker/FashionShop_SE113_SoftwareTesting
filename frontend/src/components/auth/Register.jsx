import React, { useEffect, useState } from "react";
import { useRegisterMutation } from "../../redux/api/authApi";
// import { toast, Toaster } from 'react-hot-toast';
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import PhoneInput from 'react-phone-number-input'

const Register = () => {

  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });

  // Thêm trạng thái cho xác nhận mật khẩu
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  const { name, email, password, phone, address } = user;

  const { isAuthenticated } = useSelector((state) => state.auth);

  const navigate = useNavigate();
  
  const [register, { isLoading, error, data }] = useRegisterMutation();

  console.log("=====================================");
  console.log(data);
  console.log("=====================================");

  // // kiểm tra nếu có lỗi request thì hiển thị thông báo lỗi bằng toast.error
  // useEffect(() => {
  //   if(error){
  //     toast.error(error?.data?.message);
  //   }
  // }, [error])
  useEffect(() => {
    if(isAuthenticated){
      // Thêm thông báo thành công
      toast.success("Bạn đã đăng ký thành công", { 
        autoClose: false,
      });
      navigate("/"); // Nếu đăng ký thành công thì chuyển hướng về trang chủ
    }
    if(error){
      toast.error(error?.data?.message);
    }
  }, [error, isAuthenticated])


  const validateForm = () => {
    let tempErrors = {};
    tempErrors.name = user.name ? "" : "Họ tên không được để trống";
    tempErrors.email = user.email ? "" : "Email không được để trống";
    tempErrors.password = user.password ? "" : "Mật khẩu không được để trống";
    tempErrors.phone = user.phone ? "" : "Số điện thoại không được để trống";
    tempErrors.address = user.address ? "" : "Địa chỉ không được để trống";
    tempErrors.confirmPassword = confirmPassword ? "" : "Xác nhận mật khẩu không được để trống";
    if(user.password.length < 6){
      tempErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }
    if(user.password && confirmPassword && user.password !== confirmPassword){
      tempErrors.confirmPassword = "Mật khẩu và xác nhận mật khẩu không khớp";
    }
    setErrors(tempErrors);

    return Object.values(tempErrors).every(x => x === "");
  };

  // xử lý sự kiện submit của form. Sau đó hàm login được gọi với dữ liệu đăng nhập
  const submitHandler = (e) => {
    e.preventDefault();
    const signUpData = { ...user };
    const errors = [];

    // Kiểm tra từng trường
    if (!user.name) {
      errors.push("Họ tên không được để trống");
    }
    else if (!user.email) {
      errors.push("Email không được để trống");
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(user.email)) {
      errors.push("Email không đúng định dạng");
    }
    else if (!user.password) {
      errors.push("Mật khẩu không được để trống");
    }
    else if (!confirmPassword) {
      errors.push("Xác nhận mật khẩu không được để trống");
    }
    else if (user.password !== confirmPassword) {
      errors.push("Mật khẩu và xác nhận mật khẩu không khớp");
    }
    else if (!user.phone) {
      errors.push("Số điện thoại không được để trống");
    } else if (!/^\+84\d{9}$/.test(user.phone)) {
      errors.push("Số điện thoại phải có định dạng +84 và 9 số đằng sau");
    }
    else if (!user.address) {
      errors.push("Địa chỉ không được để trống");
    }

    // Nếu có lỗi, hiển thị tất cả qua toast
    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error));
      return;
    }
    console.log(signUpData)
    if(validateForm()){
      const signUpData = { ...user };
      register(signUpData);
    }

    // // Check if password length is less than 6 characters
    // if(password.length < 6){
    //   toast.error("Mật khẩu phải có ít nhất 6 ký tự");
    //   return;
    // }

    // // Kiểm tra xem mật khẩu và xác nhận mật khẩu có khớp nhau không trong hàm submitHandler
    // if(password !== confirmPassword){
    //   toast.error("Mật khẩu và xác nhận mật khẩu không khớp");
    //   return;
    // }
    
    // // Dispatch login'
    // const signUpData = {
    //   name,
    //   email,
    //   password,
    //   phone,
    //   address,
    // };

    // register(signUpData);
  
  };
  // Hàm xử lý riêng cho SĐT khi dùng `react-phone-number-input`
  const handlePhoneChange = (phoneValue) => {
    setUser({ ...user, phone: phoneValue });
  }
  // Cập nhật trạng thái người dùng khi nhập dữ liệu vào form
  const onChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  }

  return (
    <div className="row wrapper">
      <div className="col-10 col-lg-5">
        <form
          className="shadow rounded bg-body"
          onSubmit={submitHandler}
        >
          <h2 className="mb-4">Đăng ký</h2>

          <div className="mb-3">
            <label htmlFor="name_field" className="form-label">Họ tên</label>
            <input
              type="text"
              id="name_field"
              className="form-control"
              name="name"
              value={name}
              onChange={onChange}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="email_field" className="form-label">Email</label>
            <input
              type="text"
              id="email_field"
              className="form-control"
              name="email"
              value={email}
              onChange={onChange}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password_field" className="form-label">Mật khẩu</label>
            <input
              type="password"
              id="password_field"
              className="form-control"
              name="password"
              value={password}
              onChange={onChange}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="confirm_password_field" className="form-label">Nhập lại mật khẩu</label>
            <input
              type="password"
              id="confirm_password_field"
              className="form-control"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="phone_field" className="form-label">Số điện thoại</label>
            {/* <input
              type="tel"
              id="phone_field"
              className="form-control"
              name="phone"
              value={phone}
              onChange={onChange}
            /> */}
            <PhoneInput 
                international
                defaultCountry="VN"
                id="phone_field"
                className="form-control"
                name="phone"
                value={phone}
                onChange={handlePhoneChange}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="address_field" className="form-label">Địa chỉ</label>
            <input
              type="text"
              id="adddress_field"
              className="form-control"
              name="address"
              value={address}
              onChange={onChange}
            />
          </div>

          <button id="register_button" type="submit" className="btn w-100 py-2" disable={isLoading}>
            {isLoading? "Đang tạo..." : "ĐĂNG KÝ"}
          </button>
        </form>
        {Object.keys(errors).map((key) => (
          errors[key] && <div key={key} style={{color: 'red'}}>{errors[key]}</div>
        ))}
      </div>
    </div>
  )
}

export default Register