import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PropTypes from "prop-types";
import { useEffect } from "react";
import { initializeSocket, disconnectSocket } from "./services/socket";
import ZaloPasswordRecovery from "./components/PasswordRecovery";
import ContactSidebar from "./components/ContactSidebar";
import AccountInformation from "./components/AccountInformation";

// Pages
import LoginForm from "./pages/Login/LoginForm";
import SignupForm from "./pages/Login/SignupForm";
import Home from "./pages/Home/Home";

// Component Layout bảo vệ cho các trang yêu cầu đăng nhập
const ProtectedRoute = ({ children }) => {
  const storedUser = localStorage.getItem("user");
  const isAuthenticated = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    // Initialize socket connection when a protected route is accessed
    if (isAuthenticated && isAuthenticated.user && isAuthenticated.user._id) {
      initializeSocket(isAuthenticated.user._id);
    }

    // Clean up socket connection when component unmounts
    return () => {
      // Only disconnect if user is no longer authenticated
      if (!localStorage.getItem("user")) {
        console.log("🧹 Cleaning up socket connection on logout");
        disconnectSocket();
      }
    };
  }, [isAuthenticated?.user?._id]);

  if (!isAuthenticated) {
    console.log("🚫 Chưa đăng nhập, chuyển hướng về trang login");
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Component Layout để chuyển hướng người dùng đã đăng nhập khỏi các trang công khai
const PublicRoute = ({ children }) => {
  const storedUser = localStorage.getItem("user");
  const isAuthenticated = storedUser ? JSON.parse(storedUser) : null;

  if (isAuthenticated) {
    console.log("✅ Đã đăng nhập, chuyển hướng về trang home");
    return <Navigate to="/home" replace />;
  }
  return children;
};

// Component để chuyển hướng trang gốc dựa vào trạng thái đăng nhập
const RootRedirect = () => {
  const storedUser = localStorage.getItem("user");
  const isAuthenticated = storedUser ? JSON.parse(storedUser) : null;

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  } else {
    return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <Router>
      <div className="App">        <Routes>          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginForm />
              </PublicRoute>
            } 
          />
          <Route 
            path="/signup" 
            element={
              <PublicRoute>
                <SignupForm />
              </PublicRoute>
            } 
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/forgot-password" 
            element={
              <PublicRoute>
                <ZaloPasswordRecovery />
              </PublicRoute>
            } 
          />          <Route 
            path="/" 
            element={<RootRedirect />} 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route 
            path="/account-information" 
            element={
              <ProtectedRoute>
                <AccountInformation />
              </ProtectedRoute>
            } 
          />
        </Routes>

        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar
          closeOnClick
          pauseOnHover={false}
          draggable={false}
          theme="dark"
        />
      </div>
    </Router>
  );
}
ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

PublicRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default App;
