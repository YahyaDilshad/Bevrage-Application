import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useauthstore from "../store/authstore";
import logoSvg from "../assets/react.svg";
import { FaUserCircle } from "react-icons/fa";

const Header = () => {
  const navigate = useNavigate();

  const { logout, authuser } = useauthstore();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    logout();
    localStorage.removeItem("authuser");
    navigate("/admin/signup");
  };

  return (
    <header className="bg-[#F9FAFB] w-[80%] absolute left-64 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-end">
        <div className="relative  right-0 ">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 focus:outline-none"
          >
            <FaUserCircle className="text-2xl text-black" />
            <span className="text-sm font-medium text-black">
              {authuser?.fullname?.firstname || "Profile"}
            </span>
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-2">
              <button
                onClick={() => {
                  setShowMenu(false);
                  navigate("/admin/profile");
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
