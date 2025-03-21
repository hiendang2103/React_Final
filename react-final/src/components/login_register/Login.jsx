import React, { useState, useEffect } from "react";
import { Input, Button, Progress, message, Form, Alert } from "antd";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { FaUser, FaLock } from "react-icons/fa";
import { MdMail } from "react-icons/md";
import { useNavigate, Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import "../../App.css";

const Login = () => {
  const navigate = useNavigate();
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [formError, setFormError] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const getInputClass = (error) => {
    const baseClass =
      "w-full py-2.5 px-5 my-2.5 bg-transparent text-white text-base transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500/20 rounded-full";
    return error
      ? `${baseClass} border border-red-500`
      : `${baseClass} border border-purple-400/40 focus:border-purple-500/80`;
  };

  const iconStyle = "text-purple-300 text-lg";

  const passwordSuffix = (
    <div
      onClick={() => setPasswordVisible(!passwordVisible)}
      className="cursor-pointer text-purple-300 hover:text-purple-200 transition-colors"
    >
      {passwordVisible ? (
        <EyeInvisibleOutlined className={iconStyle} />
      ) : (
        <EyeOutlined className={iconStyle} />
      )}
    </div>
  );

  const confirmPasswordSuffix = (
    <div
      onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
      className="cursor-pointer text-purple-300 hover:text-purple-200 transition-colors"
    >
      {confirmPasswordVisible ? (
        <EyeInvisibleOutlined className={iconStyle} />
      ) : (
        <EyeOutlined className={iconStyle} />
      )}
    </div>
  );

  const emailSuffix = (
    <MdMail className={iconStyle} style={{ fontSize: "1.25rem" }} />
  );

  const usernameSuffix = (
    <FaUser className={iconStyle} style={{ fontSize: "1.1rem" }} />
  );

  useEffect(() => {
    const isLoggedIn = Cookies.get("user_logged_in");
    if (isLoggedIn) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const setLoginCookie = () => {
    Cookies.set("user_logged_in", "true", { expires: 5 / 1440 });
  };

  const validateEmail = (email) => {
    if (!email) {
      return "Email không được để trống!";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return "Email không hợp lệ!";
    }

    return "";
  };

  const validateUsername = (username) => {
    if (!username) {
      return "Tên người dùng không được bỏ trống!";
    }

    if (username.length < 3) {
      return "Tên người dùng phải có ít nhất 3 kí tự!";
    }

    return "";
  };

  const validatePassword = (password) => {
    if (!password) {
      return "Mật khẩu không được bỏ trống";
    }

    if (password.length < 8) {
      return "Mật khẩu phải có ít nhất 8 kí tự!";
    }

    if (!/[A-Z]/.test(password)) {
      return "Mật khẩu phải chứa ít nhất 1 chữ hoa!";
    }

    if (!/[a-z]/.test(password)) {
      return "Mật khẩu phải chứa ít nhất 1 chữ thường!";
    }

    if (!/[\d]/.test(password)) {
      return "Mật khẩu phải chứa ít nhất 1 chữ số!";
    }

    if (password.length > 23) {
      return "Mật khẩu đã quá độ dài cho phép (tối đa 23 kí tự)!";
    }

    return "";
  };

  const validateConfirmPassword = (confirmPwd) => {
    if (!confirmPwd) {
      return "Xác nhận mật khẩu không được để trống!";
    }

    if (confirmPwd !== formData.password) {
      return "Mật khẩu xác nhận không khớp!";
    }

    return "";
  };

  const validateLoginData = () => {
    const emailError = validateEmail(formData.email);
    const passwordError = !formData.password
      ? "Mật khẩu không được để trống!"
      : "";

    const registeredUser = JSON.parse(localStorage.getItem("registered_user"));

    if (!registeredUser) {
      setFormError({
        ...formError,
        email: "Tài khoản chưa được đăng ký!",
        password: "",
      });
      return false;
    }

    if (formData.email !== registeredUser.email) {
      setFormError({
        ...formError,
        email: "Email không tồn tại!",
        password: "",
      });
      return false;
    }

    if (formData.password !== registeredUser.password) {
      setFormError({
        ...formError,
        email: "",
        password: "Mật khẩu không chính xác!",
      });
      return false;
    }

    setFormError({
      ...formError,
      email: emailError,
      password: passwordError,
    });

    return (
      !emailError &&
      !passwordError &&
      formData.email === registeredUser.email &&
      formData.password === registeredUser.password
    );
  };

  const validateRegisterData = () => {
    const usernameError = validateUsername(formData.username);
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(
      formData.confirmPassword
    );

    setFormError({
      username: usernameError,
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
    });

    return (
      !usernameError && !emailError && !passwordError && !confirmPasswordError
    );
  };

  const handleSubmitRegister = (e) => {
    e.preventDefault();

    if (validateRegisterData()) {
      localStorage.setItem(
        "registered_user",
        JSON.stringify({
          email: formData.email,
          password: formData.password,
        })
      );

      message.success("Đăng ký thành công! Vui lòng đăng nhập.");
      setIsLoginForm(true);
      setFormError({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    }
  };

  const handleSubmitLogin = (e) => {
    e.preventDefault();

    const registeredUser = JSON.parse(localStorage.getItem("registered_user"));

    if (!registeredUser) {
      setAlertMessage("Tài khoản chưa được đăng ký!");
      setAlertType("error");
      setAlertVisible(true);
      setTimeout(() => setAlertVisible(false), 3000);
      return;
    }

    if (formData.email !== registeredUser.email) {
      setAlertMessage("Email không tồn tại!");
      setAlertType("error");
      setAlertVisible(true);
      setTimeout(() => setAlertVisible(false), 3000);
      return;
    }

    if (formData.password !== registeredUser.password) {
      setAlertMessage("Mật khẩu không chính xác!");
      setAlertType("error");
      setAlertVisible(true);
      setTimeout(() => setAlertVisible(false), 3000);
      return;
    }

    if (validateLoginData()) {
      setAlertMessage("Đăng nhập thành công!");
      setAlertType("success");
      setAlertVisible(true);

      setLoginCookie();

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    }
  };

  const toggleForm = () => {
    setIsLoginForm(!isLoginForm);

    setFormData({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

    setFormError({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });

    let errorMessage = "";

    switch (name) {
      case "username":
        errorMessage = validateUsername(value);
        setFormError({
          ...formError,
          username: errorMessage,
        });
        break;
      case "email":
        errorMessage = validateEmail(value);
        setFormError({
          ...formError,
          email: errorMessage,
        });
        break;
      case "password":
        errorMessage = validatePassword(value);

        setFormError({
          ...formError,
          password: errorMessage,
          confirmPassword: formData.confirmPassword
            ? value !== formData.confirmPassword
              ? "Mật khẩu xác nhận không khớp!"
              : ""
            : formError.confirmPassword,
        });
        break;
      case "confirmPassword":
        errorMessage = validateConfirmPassword(value);
        setFormError({
          ...formError,
          confirmPassword: errorMessage,
        });
        break;
      default:
        break;
    }
  };

  const getPasswordStrength = () => {
    const password = formData.password;

    if (!password) return { text: "", percent: 0, status: "" };

    if (password.length < 6) {
      return { text: "Yếu", percent: 25, status: "exception" };
    } else if (password.length < 10) {
      return { text: "Trung bình", percent: 50, status: "normal" };
    } else if (
      password.length >= 10 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password)
    ) {
      return { text: "Mạnh", percent: 100, status: "success" };
    } else {
      return { text: "Khá", percent: 75, status: "active" };
    }
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center text-white login-background no-scrollbar">
      <div className="bg-overlay"></div>
      {alertVisible && (
        <Alert
          message={alertMessage}
          type={alertType}
          showIcon
          closable
          onClose={() => setAlertVisible(false)}
          className="!fixed !top-30 !left-1/2 !transform !-translate-x-1/2 !z-50 !min-w-[300px]"
        />
      )}
      <div className="h-[500px] w-96 px-8 rounded-lg overflow-hidden login-container relative">
        <div
          className={`absolute top-0 left-0 w-full transition-all duration-500 ease-in-out ${
            isLoginForm
              ? "translate-y-[50px] opacity-100"
              : "translate-y-[600px] opacity-0"
          }`}
        >
          <h2 className="text-4xl font-bold pb-6 text-center mt-8">
            Đăng nhập
          </h2>
          <form
            className="flex flex-col items-center px-4"
            onSubmit={handleSubmitLogin}
          >
            <div className="w-full relative">
              <Input
                className={getInputClass(formError.email)}
                placeholder="Nhập email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                suffix={emailSuffix}
              />
              {formError.email && (
                <p className="text-red-600 text-xs ml-4">{formError.email}</p>
              )}
            </div>
            <div className="w-full relative">
              <Input
                className={getInputClass(formError.password)}
                placeholder="Nhập mật khẩu"
                name="password"
                type={passwordVisible ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                suffix={passwordSuffix}
              />
              {formError.password && (
                <p className="text-red-500 text-xs ml-4">
                  {formError.password}
                </p>
              )}
            </div>

            <Button
              type="primary"
              htmlType="submit"
              className="custom-button mt-6 mx-6"
            >
              Đăng nhập
            </Button>
            <span className="mt-4">
              Chưa có tài khoản?{" "}
              <span onClick={toggleForm} className="text-link cursor-pointer">
                Đăng ký
              </span>
            </span>
          </form>
        </div>
        <div
          className={`absolute top-0 left-0 w-full transition-all duration-500 ease-in-out ${
            !isLoginForm
              ? "translate-y-0 opacity-100"
              : "translate-y-[-600px] opacity-0"
          }`}
        >
          <h2 className="text-4xl font-bold pb-4 text-center mt-4">Đăng ký</h2>
          <form
            className="flex flex-col items-center px-4"
            onSubmit={handleSubmitRegister}
          >
            <div className="w-full relative">
              <Input
                className={getInputClass(formError.username)}
                placeholder="Nhập tài khoản"
                name="username"
                type="text"
                value={formData.username}
                onChange={(e) => handleChange("username", e.target.value)}
                suffix={usernameSuffix}
              />
              {formError.username && (
                <p className="text-red-500 text-xs ml-4">
                  {formError.username}
                </p>
              )}
            </div>
            <div className="w-full relative">
              <Input
                className={getInputClass(formError.email)}
                placeholder="Nhập email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                suffix={emailSuffix}
              />
              {formError.email && (
                <p className="text-red-600 text-xs ml-4">{formError.email}</p>
              )}
            </div>
            <div className="w-full relative">
              <Input
                className={getInputClass(formError.password)}
                placeholder="Nhập mật khẩu"
                name="password"
                type={passwordVisible ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                suffix={passwordSuffix}
              />
              <div className="w-full px-2 mb-2">
                {formData.password && (
                  <>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Độ mạnh mật khẩu:</span>
                      <span
                        className={`
                          ${
                            passwordStrength.status === "exception"
                              ? "text-red-500"
                              : ""
                          }
                        ${
                          passwordStrength.status === "normal"
                            ? "text-yellow-500"
                            : ""
                        }
                        ${
                          passwordStrength.status === "active"
                            ? "text-blue-500"
                            : ""
                        }
                        ${
                          passwordStrength.status === "success"
                            ? "text-green-500"
                            : ""
                        }
                        `}
                      >
                        {passwordStrength.text}
                      </span>
                    </div>
                    <Progress
                      percent={passwordStrength.percent}
                      status={passwordStrength.status}
                      showInfo={false}
                      size="small"
                    />
                  </>
                )}
              </div>
              {formError.password && (
                <p className="text-red-500 text-xs ml-4">
                  {formError.password}
                </p>
              )}
            </div>
            <div className="w-full relative">
              <Input
                className={getInputClass(formError.confirmPassword)}
                placeholder="Nhập lại mật khẩu"
                name="confirmPassword"
                type={confirmPasswordVisible ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleChange("confirmPassword", e.target.value)
                }
                suffix={confirmPasswordSuffix}
              />
              {formError.confirmPassword && (
                <p className="text-red-500 text-xs ml-4">
                  {formError.confirmPassword}
                </p>
              )}
            </div>
            <Button
              type="primary"
              htmlType="submit"
              className="custom-button mt-2 mx-6"
            >
              Đăng ký
            </Button>
            <span className="mt-3">
              Đã có tài khoản?{" "}
              <span onClick={toggleForm} className="text-link cursor-pointer">
                Đăng nhập
              </span>
            </span>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
