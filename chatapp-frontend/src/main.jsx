import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import store from './redux/store.js'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import ConnectionWrapper from './components/ConnectionWrapper'
// import { ResetTokenProvider } from './context/ResetTokenContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ConnectionWrapper>
          {/* <ResetTokenProvider> */}
            <App />
          {/* </ResetTokenProvider> */}
        </ConnectionWrapper>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
