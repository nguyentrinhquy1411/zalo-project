import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../services/api/auth.service";

function SignupForm() {
  const [language, setLanguage] = useState("vi");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState("Male");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [countryCode, setCountryCode] = useState("+84");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [tempToken, setTempToken] = useState("");

  const navigate = useNavigate();

  const texts = {
    vi: {
      title: "Đăng ký tài khoản Zalo",
      subtitle: "để kết nối với ứng dụng Zalo Web",
      fullName: "Họ tên",
      phoneNumber: "Số điện thoại",
      password: "Mật khẩu",
      confirmPassword: "Nhập lại mật khẩu",
      gender: "Giới tính",
      male: "Nam",
      female: "Nữ",
      other: "Khác",
      dateOfBirth: "Ngày sinh",
      signupButton: "Đăng ký",
      requestOtpButton: "Gửi mã OTP",
      verifyOtpButton: "Xác thực OTP",
      otp: "Mã OTP",
      alreadyHaveAccount: "Đã có tài khoản?",
      loginLink: "Đăng nhập",
    },
    en: {
      title: "Sign up for a Zalo account",
      subtitle: "to connect with the Zalo Web application",
      fullName: "Full name",
      phoneNumber: "Phone number",
      password: "Password",
      confirmPassword: "Confirm password",
      gender: "Gender",
      male: "Male",
      female: "Female",
      other: "Other",
      dateOfBirth: "Date of birth",
      signupButton: "Sign up",
      requestOtpButton: "Send OTP",
      verifyOtpButton: "Verify OTP",
      otp: "OTP",
      alreadyHaveAccount: "Already have an account?",
      loginLink: "Login",
    },
  };

  const t = texts[language];
  const requestOtp = async () => {
    try {
      setLoading(true);
      setError("");
      
      if (!phoneNumber) {
        setError("Vui lòng nhập số điện thoại");
        return;
      }
      
      // Format phone number to +84 format
      let formattedPhoneNumber = phoneNumber;
      
      // If starts with "0", replace with +84
      if (phoneNumber.startsWith("0")) {
        formattedPhoneNumber = "+84" + phoneNumber.substring(1);
      } 
      // If no country code, add +84
      else if (!phoneNumber.startsWith("+")) {
        formattedPhoneNumber = "+84" + phoneNumber;
      }
          const response = await authService.requestOTP(formattedPhoneNumber);
        if (response) {
        setOtpSent(true);
        if (response.devOTP) {
          // For development only
          console.log("Development OTP:", response.devOTP);
          setOtp(response.devOTP);
        }
      }} catch (error) {
      console.error("OTP request error:", error);
      setError(
        typeof error === 'string' 
          ? error 
          : (error.message || error.response?.data?.error || "Không thể gửi mã OTP")
      );
    } finally {
      setLoading(false);
    }
  };
  const verifyOtp = async () => {
    try {
      setLoading(true);
      setError("");
      
      if (!otp) {
        setError("Vui lòng nhập mã OTP");
        return;
      }
      
      // Format phone number to +84 format
      let formattedPhoneNumber = phoneNumber;
      
      // If starts with "0", replace with +84
      if (phoneNumber.startsWith("0")) {
        formattedPhoneNumber = "+84" + phoneNumber.substring(1);
      } 
      // If no country code, add +84
      else if (!phoneNumber.startsWith("+")) {
        formattedPhoneNumber = "+84" + phoneNumber;
      }
          const response = await authService.verifyOTP(formattedPhoneNumber, otp);
        if (response && response.tempToken) {
        setTempToken(response.tempToken);
      } else {
        throw new Error("Không nhận được token tạm thời");
      }} catch (error) {
      console.error("OTP verification error:", error);
      setError(
        typeof error === 'string' 
          ? error 
          : (error.message || error.response?.data?.error || "Xác thực OTP thất bại")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!fullName || !phoneNumber || !password || !gender || !dateOfBirth) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Mật khẩu không khớp");
      return;
    }
    
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (!/[a-zA-Z]/.test(password) || !/\d/.test(password) || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setError("Mật khẩu phải chứa chữ cái, số và ký tự đặc biệt");
      return;
    }

    setLoading(true);
      try {
      // Format phone number to +84 format
      let formattedPhoneNumber = phoneNumber;
      
      // If starts with "0", replace with +84
      if (phoneNumber.startsWith("0")) {
        formattedPhoneNumber = "+84" + phoneNumber.substring(1);
      } 
      // If no country code, add +84
      else if (!phoneNumber.startsWith("+")) {
        formattedPhoneNumber = "+84" + phoneNumber;
      }
        
      const userData = {
        fullName,
        password,
        phoneNumber: formattedPhoneNumber,
        gender,
        dateOfBirth,
        tempToken,
        isActive: true
      };
        const response = await authService.signup(userData);
      
      if (response) {
        // Registration successful
        navigate("/login", { state: { message: "Đăng ký thành công! Vui lòng đăng nhập." } });
      }    } catch (error) {
      console.error("Signup error:", error);
      setError(
        typeof error === 'string' 
          ? error 
          : (error.message || error.response?.data?.message || "Đăng ký thất bại")
      );
    } finally {
      setLoading(false);
    }
  };

  // Render OTP verification step
  if (otpSent && !tempToken) {
    return (
      <div className="min-h-screen bg-blue-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-md">
          <div className="text-center mb-6">
            <p className="text-center font-bold text-blue-500 text-4xl mb-4">
              Zalo
            </p>
            <h1 className="text-xl font-bold">{t.title}</h1>
            <p className="text-gray-600 text-sm">{t.subtitle}</p>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              {t.otp}
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter OTP"
            />
          </div>
          
          <button
            onClick={verifyOtp}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Verifying..." : t.verifyOtpButton}
          </button>
          
          {error && <div className="mt-3 text-red-500 text-center">{error}</div>}
        </div>
      </div>
    );
  }

  // Show signup form after OTP verification or before OTP request
  return (
    <div className="min-h-screen bg-blue-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-md">
        <div className="text-center mb-6">
          <p className="text-center font-bold text-blue-500 text-4xl mb-4">
            Zalo
          </p>
          <h1 className="text-xl font-bold">{t.title}</h1>
          <p className="text-gray-600 text-sm">{t.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!otpSent && (
            <>
              <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="bg-gray-100 px-4 py-2 border-r border-gray-300 outline-none"
                >
                  <option value="+84">+84</option>
                  <option value="+1">+1</option>
                </select>
                <input
                  type="tel"
                  placeholder={t.phoneNumber}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="flex-1 p-2 outline-none"
                />
              </div>
              
              <button
                type="button"
                onClick={requestOtp}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? "Sending..." : t.requestOtpButton}
              </button>
            </>
          )}

          {tempToken && (
            <>
              <div>
                <input
                  type="text"
                  placeholder={t.fullName}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <input
                  type="password"
                  placeholder={t.password}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <input
                  type="password"
                  placeholder={t.confirmPassword}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="Male">{t.male}</option>
                  <option value="Female">{t.female}</option>
                  <option value="Other">{t.other}</option>
                </select>
              </div>
              
              <div>
                <input
                  type="date"
                  placeholder={t.dateOfBirth}
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Đang xử lý..." : t.signupButton}
              </button>
            </>
          )}

          {error && <div className="text-red-500 text-center">{error}</div>}

          <div className="flex justify-center mt-4 text-sm">
            <p className="text-gray-600">
              {t.alreadyHaveAccount}{" "}
              <Link to="/login" className="text-blue-600 hover:underline">
                {t.loginLink}
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignupForm;
