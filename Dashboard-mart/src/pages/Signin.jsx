import React, { useEffect, useState } from "react";
import { FaGoogle } from "react-icons/fa";
import dashboardImg from "../assets/signUpdahboard2.png";
import dashboardImg2 from "../assets/signupdashboardImages.png";
import logoSvg from "../assets/react.svg";
import useauthstore from "../store/authstore";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const SignUp = () => {
  const { login , isloggedin } = useauthstore(); // ✅ Make sure your store exports setAuthUser

  const [Showpassword, setShowpassword] = useState(false);
  
  const [Formdata, setFormdata] = useState({
    email: "",
    password: "",
  });

  // ✅ Validation
  const formvalidate = () => {
    if (!Formdata.email.trim()) {
      toast.error("Email is required");
      return false;
    }
    if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(Formdata.email)
    ) {
      toast.error("Email is invalid");
      return false;
    }
    if (!Formdata.password.trim()) {
      toast.error("Password is required");
      return false;
    }
    if (Formdata.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }
    
    return true;
  };

  // ✅ Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!formvalidate()) return;

    const formdata = {
      email: Formdata.email,
      password: Formdata.password,
    };

    try {
      const userData = await login(formdata);

      if (userData) {
        localStorage.setItem("chat-user", JSON.stringify(userData));
        console.log("User added in localStorage:", userData);
        toast.success("Login successful!");
      }
    } catch (error) {
      toast.error("Login failed");
      console.error("Login error:", error);
    }
  };


  return (
    <div className="min-h-screen flex">
     

      {/* Lrft Section */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 text-white flex-col justify-center items-center relative overflow-hidden">
        <div className="w-full max-w-xl px-8 py-8">
          <h1 >Welcomeback</h1>          
        </div>
      </div>
       {/* Left Section - Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-20 bg-white">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Please Login your account</h2>
        <p className="text-gray-500 mb-6">
          Create your account to get started with us
        </p>

        <div className="flex items-center justify-center mb-4">
          
          <span className="border-t border-gray-300 w-1/4"></span>
        </div>

        {/* ✅ Signup Form */}
        <form onSubmit={handleLogin} className="space-y-4">

          <div>
            <label className="text-sm font-medium text-gray-700">Email*</label>
           <input
            value={Formdata.email}
            type="email"
            placeholder="Email"
            className="my-6 w-full outline-none p-2 border border-gray-500 rounded"
            onChange={(e) =>
              setFormdata({ ...Formdata, email: e.target.value })
            }
          /> </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Password*
            </label>
           <input
            value={Formdata.password}
            type={Showpassword ? "text" : "password"}
            placeholder="Password"
            className="mb-4 w-full outline-none p-2 border border-gray-500 rounded"
            onChange={(e) =>
              setFormdata({ ...Formdata, password: e.target.value })
            }
          />
          </div>

          <div className="flex items-center justify-between">
            <label
              htmlFor="Showpassword"
              className="flex items-center text-sm text-gray-600"
            >
              <input
                checked={Showpassword}
                onChange={() => setShowpassword(!Showpassword)}
                type="checkbox"
                className="mr-2"
              />
              Show password
            </label>
            <a href="#" className="text-sm text-indigo-600 hover:underline">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="cursor-pointer w-full p-3 mt-4 text-white bg-purple-500 rounded-md"
          >
            Login Account
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-6">
          You don't have an account?{" "}
          <Link
            to="/admin/signUp"
            className="text-indigo-600 font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
