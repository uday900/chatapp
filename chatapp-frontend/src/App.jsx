import { Route, Routes } from 'react-router-dom';
import { API_ENDPOINTS, REACT_ENDPOINTS } from './utils/endpoints';
import LoginPage from './pages/LoginPage';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './router/ProtectedRoute';
import SignupPage from './pages/SignupPage';
import ResetPassword from './components/ResetPassword';
import ChatPage from './pages/ChatPage';
import GroupDetailsPage from './pages/GroupDetailsPage';
import SettingsPage from './pages/SettingsPage';
import { useEffect, useState } from 'react';
import ForgotPassword from './components/ForgotPassword';
import VerifyOtp from './components/VerifyOtp';

function App() {
const [resetToken, setResetToken] = useState(null);
     const clearResetToken = () => { setResetToken(null); };
  useEffect(() => {
    

    const handleServerDown = () => {
      alert(
        "Server unavailable. Please try again later."
      );
    };

    window.addEventListener(
      "server-down",
      handleServerDown
    );

    return () => {
      window.removeEventListener(
        "server-down",
        handleServerDown
      );
    };
  }, []);
  return (
    <>
      {/* Routes */}
      <Routes>

        <Route path={REACT_ENDPOINTS.HOME} element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        } />

        <Route path="/group-details/:chatId" element={
          <ProtectedRoute>
            <GroupDetailsPage />
          </ProtectedRoute>
        } />

        <Route path={REACT_ENDPOINTS.SETTINGS} element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } />

        <Route path={REACT_ENDPOINTS.LOGIN} element={<LoginPage />} />
        <Route path={REACT_ENDPOINTS.SIGNUP} element={<SignupPage />} />
        <Route path={REACT_ENDPOINTS.FORGOT_PASSWORD} element={<ForgotPassword />} />
        <Route path={REACT_ENDPOINTS.VERIFY_OTP} element={<VerifyOtp setResetToken={setResetToken} />} />
        <Route path={REACT_ENDPOINTS.RESET_PASSWORD} element={<ResetPassword resetToken={resetToken} clearResetToken={clearResetToken} />} />

      </Routes>

      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: "#333",
            color: "#fff",
            borderRadius: "8px",
            padding: "12px",
          },
        }}
      />
    </>
  )
}

export default App
