import React from 'react'
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Orders from "./pages/Orders";
import ClientReviews from "./pages/ClientReviews";
import useAuthStore from './store/authstore.js'
import SalesReports from './pages/Salesreport'
import Setting from "./pages/Settings";
import Users from './pages/Users.jsx';
import Home from './pages/home.jsx'
import Dashboard from './pages/Dashboard.jsx';
import ProductPage from './pages/ProductPage.jsx';
import SignUp from './pages/signUp.jsx'
import Sidebar from './components/sideBar.jsx';
import Signinpage from './pages/Signin.jsx';
import Header from './components/Header.jsx';
import NotificationPermission from './components/notificationpermission.jsx';

const App = () => {
  const location = useLocation();
  const { authuser } = useAuthStore();

  const hideSidebar = ["/admin/signin", "/admin/signUp"].includes(location.pathname);

  return (
    <div className='relative flex'>
      {/* Sidebar - shown except on signin/signup */}
      {!hideSidebar && <aside className="hidden md:block"><Sidebar /></aside>}

      <main className="flex-1">
        {/* Header - hide on signin/signup as well */}
        {!hideSidebar && <Header />}
        {/* Notification Permission Component */}
        {authuser && <NotificationPermission />}
        <Routes>
        <Route path='/'element={authuser ? <Home /> : <Navigate to='/admin/signUp' />}/>
        <Route path='/admin/Settings'element={authuser ? <Setting /> : <Navigate to='/admin/signUp' />}/>
        <Route path='/admin/dashboard'element={authuser ? <Dashboard /> : <Navigate to='/admin/signUp' />}/>
        <Route path='/admin/signin'element={ <Signinpage />}/>
        <Route path='/admin/all_users'element={authuser ? <Users /> : <Navigate to='/admin/signUp' />}/>
        <Route path='/admin/products'element={authuser ? <ProductPage /> : <Navigate to='/admin/signUp' />}/>
        <Route path='/admin/ClientReviews'element={authuser ? <ClientReviews /> : <Navigate to='/admin/signUp' />}/>
        <Route path='/admin/Orders'element={authuser ? <Orders /> : <Navigate to='/admin/signUp' />}/>
        <Route path='/admin/SalesReport'element={authuser ? <SalesReports /> : <Navigate to='/admin/signUp' />}/>
        <Route path='/admin/signUp' element={<SignUp />} />

        </Routes>
      </main>
    </div>
  );
};


export default App