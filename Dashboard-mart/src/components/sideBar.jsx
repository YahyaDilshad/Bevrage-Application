import React from "react";
import { useState } from "react";
import { Link, Routes,Route, useLocation, Navigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  BarChart3,
  MessageSquare,
  Settings,
  LogOut,
  User,
  TrendingUp,
  Receipt

} from "lucide-react";
import Orders from "../pages/Orders";

const Sidebar = () => {
 
  const handleAllusers = ()=>{

  }
  return (
    <aside className="w-[20%] bg-[#0f172a] text-gray-200 h-screen flex flex-col fixed left-0 top-0">
      {/* Logo Section */}
      <Link to='/admin' className="flex items-center justify-center gap-2 py-6 border-b border-gray-700">
        <div className="bg-indigo-500 p-2 rounded-lg">
          <LayoutDashboard size={24} />
        </div>
  <h1 className="text-xl font-semibold text-white">Bevarges</h1>
      </Link>

      {/* Menu Links */}
      <nav className="flex-1 px-3 py-6 space-y-2">
        
          <Link
           className={`flex items-center  text-gray-300 hover:bg-indigo-500 hover:text-white   gap-3 px-4 py-2 rounded-lg transition-all`}
           to="/admin/Dashboard"
          >
            <span><BarChart3/></span>
            <span>Dashboard</span>
          </Link>
        
          <Link
           className={`flex items-center  text-gray-300 hover:bg-indigo-500 hover:text-white   gap-3 px-4 py-2 rounded-lg transition-all`}
           to='/admin/orders'
          >
            <span><Package/></span>
            <span>Orders</span>
          </Link>
        
          <Link
           className={`flex items-center  text-gray-300 hover:bg-indigo-500 hover:text-white  gap-3 px-4 py-2 rounded-lg transition-all`}
           to="/admin/products"
          >
            <span><ShoppingBag/></span>
            <span>Products</span>
          </Link>
        
          <Link
           className={`flex items-center  text-gray-300 hover:bg-indigo-500 hover:text-white  gap-3 px-4 py-2 rounded-lg transition-all`}
           to='/admin/sales'
          > 
            <span><TrendingUp/></span>
            <span>Sales Reports</span>
          </Link>
        
          <Link
          onClick={handleAllusers}
           className={`flex items-center  text-gray-300 hover:bg-indigo-500 hover:text-white gap-3 px-4 py-2 rounded-lg transition-all`}
           to='/admin/all_users'
          >
            <span><User/></span>
            <span>All Users</span>
          </Link>
          <Link
           className={`flex items-center  text-gray-300 hover:bg-indigo-500 hover:text-white gap-3 px-4 py-2 rounded-lg transition-all`}
           to="/admin/settings"
          >
            <span><Settings/></span>
            <span>Settings</span>
          </Link>
      </nav>

      {/* Logout Button */}
      <div className=" h-13 border-t border-gray-700">
        <button className="flex items-center gap-3 w-full  px-4 py-2 text-gray-300 hover:bg-red-600 hover:text-white  transition-all">
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
