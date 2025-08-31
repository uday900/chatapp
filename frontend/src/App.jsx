import { useState } from 'react'
import { Toaster } from "react-hot-toast";
import './App.css'
import { Route, Router } from 'react-router-dom';
import { REACT_ENDPOINTS } from './utils/endpoints';
import LoginPage from './pages/LoginPage';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    {/* Routes */}
    <Router>

      <Route path={REACT_ENDPOINTS.HOME} element={<>Home page</>} />
      <Route path={REACT_ENDPOINTS.LOGIN} element={<LoginPage/>} />
    </Router>

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
