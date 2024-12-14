/* Ref: Login.jsx
*/
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useUpdateProfileMutation } from '../../redux/api/userApi'; 
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import UserLayout from '../layout/UserLayout';
// import { set } from 'mongoose';
import PhoneInput from 'react-phone-number-input'

const UpdateProfile = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  
  const navigate = useNavigate();

  const [updateProfile, { isLoading, error, isSuccess }] = useUpdateProfileMutation();

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if(user) {
      setName(user?.name);
      setEmail(user?.email);
      setPhone(user?.phone);
      setAddress(user?.address);
    }

    if(error){
      toast.error(error?.data?.message);
    }

    if(isSuccess){
      toast.success("Tài khoản đã cập nhật thành công");
      navigate("/me/profile");
    }
  }, [user, error, isSuccess])

  const submitHandler = (e) => {
    e.preventDefault();
    console.log(phone)

    // Dispatch login'
    const userData = {
      name,
      email,
      phone,
      address,
    };

    console.log(userData.phone)

    const errors = [];

    // Kiểm tra từng trường
    if (!userData.name) {
      errors.push("Họ tên không được để trống");
    }
    if (!userData.email) {
      errors.push("Email không được để trống");
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(userData.email)) {
      errors.push("Email không đúng định dạng");
    }
    if (!userData.phone) {
      errors.push("Số điện thoại không được để trống");
    } else if (!/^\+84\d{9}$/.test(userData.phone)) {
      errors.push("Số điện thoại phải có định dạng +84 và 9 số đằng sau");
    }
    if (!userData.address) {
      errors.push("Địa chỉ không được để trống");
    }

    // Nếu có lỗi, hiển thị tất cả qua toast
    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error));
      return;
    }

    updateProfile(userData);
  };

  return (
    <UserLayout>
      <div className="row wrapper">
        <div className="col-10 col-lg-8">
          <form
            className="shadow rounded bg-body"
            onSubmit={submitHandler}
          >
            <h2 className="mb-4">Cập nhật hồ sơ</h2>

            <div className="mb-3">
              <label htmlFor="name_field" className="form-label"> Name </label>
              <input
                type="text"
                id="name_field"
                className="form-control"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="email_field" className="form-label"> Email </label>
              <input
                type="text"
                id="email_field"
                className="form-control"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="phone_field" className="form-label"> Điện thoại </label>
              {/* <input
                type="tel"
                id="phone_field"
                className="form-control"
                name="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              /> */}
              <PhoneInput
                international
                defaultCountry="VN"
                id="phone_field"
                className="form-control"
                name="phone"
                value={phone}
                onChange={(value) => {
                  console.log(value)
                  if (value && value.startsWith && !value.startsWith("+84")) {
                    // setPhone("+84");
                    setPhone(value);
                  } else {
                    setPhone(value);
                  }
                }}
                // onChange={(value) => setPhone(value)}
                countrySelectProps={{
                  disabled: true, // Ngăn không cho thay đổi quốc gia
                  style: { opacity: 0, cursor: "not-allowed" }, // Làm mờ và thay đổi con trỏ
                }}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="address_field" className="form-label"> Địa chỉ </label>
              <input
                type="text"
                id="address_field"
                className="form-control"
                name="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <button type="submit" className="btn update-btn w-100" disabled={isLoading}>
              {isLoading? "Đang cập nhật..." : "Cập nhật"}
            </button>
          </form>
        </div>
      </div>
    </UserLayout>
  );
};

export default UpdateProfile;