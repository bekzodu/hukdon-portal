import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthenticationPage from './pages/AuthenticationPage';
import HomePage from './pages/HomePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import CreateAccountPage from './pages/CreateAccountPage';
import StoresPage from './pages/StoresPage';
import StoreExpanded from './pages/StoreExpanded';
import EditAccount from './pages/EditAccount';
import ManageSMS from './pages/ManageSMS';
import ManageRewards from './pages/ManageRewards';
import { ToastContainer } from 'react-toastify';
import './App.css';
import { StoresProvider } from './context/StoresContext';

function App() {
  return (
    <>
      <ToastContainer />
      <StoresProvider>
        <Router>
          <Routes>
            <Route path="/" element={<AuthenticationPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/create-account" element={<CreateAccountPage />} />
            <Route path="/stores" element={<StoresPage />} />
            <Route path="/store/:id" element={<StoreExpanded />} />
            <Route path="/stores/:id/edit" element={<EditAccount />} />
            <Route path="/stores/:id/sms" element={<ManageSMS />} />
            <Route path="/stores/:id/rewards" element={<ManageRewards />} />
          </Routes>
        </Router>
      </StoresProvider>
    </>
  );
}

export default App;
