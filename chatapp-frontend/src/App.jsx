import { Route, Routes } from 'react-router-dom';
import { API_ENDPOINTS, REACT_ENDPOINTS } from './utils/endpoints';
import LoginPage from './pages/LoginPage';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './router/ProtectedRoute';
import SignupPage from './pages/SignupPage';
import ChatPage from './pages/ChatPage';

function App() {

  return (
    <>
      {/* Routes */}
      <Routes>

        <Route path={REACT_ENDPOINTS.HOME} element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        } />

        <Route path={REACT_ENDPOINTS.LOGIN} element={<LoginPage />} />
        <Route path={REACT_ENDPOINTS.SIGNUP} element={<SignupPage />} />

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
