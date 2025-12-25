import React, { useEffect, useState } from "react";
import logoSvg from "../assets/react.svg";
import useauthstore from "../store/authstore";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const SignUp = () => {
  const { authuser, signup, isSignup, setAuthUser } = useauthstore(); // ✅ Make sure your store exports setAuthUser
  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    if (authuser) navigate("/admin");
  }, [authuser, navigate]);

  const [Showpassword, setShowpassword] = useState(false);
  const [Formdata, setFormdata] = useState({
    fullname: { firstname: "", lastname: "" },
    phoneNumber: "",
    password: "",
    role: "admin",
  });

  // ✅ Form Validation
  const Formvalidate = () => {
    const { firstname, lastname } = Formdata.fullname;
    const { phoneNumber, password } = Formdata;

    if (!firstname || !lastname || !phoneNumber || !password) {
      toast.error("All fields are required");
      return false;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return false;
    }
    return true;
  };

  // ✅ Handle Signup
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!Formvalidate()) return;

    const payload = {
      fullname: {
        firstname: Formdata.fullname.firstname,
        lastname: Formdata.fullname.lastname,
      },
      phoneNumber: Formdata.phoneNumber,
      password: Formdata.password,
      role: "admin",
      profilepic: "",
    };

    try {
      const res = await signup(payload);

      if (res?.user) {
        // ✅ Store user in localStorage for persistence
        localStorage.setItem("chat-user", JSON.stringify(res.user));

        // ✅ Update Zustand store manually (optional, but good practice)
        if (setAuthUser) setAuthUser(res.user);

        toast.success("Signup successful!");
        navigate("/");
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Signup failed. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Section - Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-20 bg-white">
        <div className="flex items-center gap-3 mb-6">
          <img src={logoSvg} alt="Bevarges logo" className="w-10 h-10" />
          <div>
            <div className="text-lg font-semibold">Bevarges</div>
            <div className="text-xs text-gray-400">Inventory & Sales</div>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mb-2">Sign Up</h2>
        <p className="text-gray-500 mb-6">
          Create your account to get started with us
        </p>

        <div className="flex items-center justify-center mb-4">
          <span className="border-t border-gray-300 w-1/4"></span>
          <span className="text-gray-400 px-2 text-sm">
            or sign up with phoneNumber
          </span>
          <span className="border-t border-gray-300 w-1/4"></span>
        </div>

        {/* ✅ Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-3 w-full">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700">
                Firstname
              </label>
              <input
                onChange={(e) =>
                  setFormdata((prev) => ({
                    ...prev,
                    fullname: { ...prev.fullname, firstname: e.target.value },
                  }))
                }
                value={Formdata.fullname.firstname}
                type="text"
                placeholder="Firstname"
                className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700">
                Lastname
              </label>
              <input
                onChange={(e) =>
                  setFormdata((prev) => ({
                    ...prev,
                    fullname: { ...prev.fullname, lastname: e.target.value },
                  }))
                }
                value={Formdata.fullname.lastname}
                type="text"
                placeholder="Lastname"
                className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Phone Number</label>
            <input
              onChange={(e) =>
                setFormdata((prev) => ({ ...prev, phoneNumber: e.target.value }))
              }
              value={Formdata.phoneNumber}
              type="Number"
              placeholder="Enter your email"
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Password*
            </label>
            <input
              onChange={(e) =>
                setFormdata((prev) => ({ ...prev, password: e.target.value }))
              }
              value={Formdata.password}
              type={Showpassword ? "text" : "password"}
              placeholder="Enter your password"
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-gray-600"
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
            disabled={isSignup}
            className="cursor-pointer w-full p-3 mt-4 text-white bg-purple-500 rounded-md"
          >
            {isSignup ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <Link
            to="/admin/signin"
            className="text-indigo-600 font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>

      {/* Right Section */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 text-white flex-col justify-center items-center relative overflow-hidden">
        <div className="w-full max-w-xl px-8 py-8">
          {/* Optional image or content here */}
        </div>
      </div>
    </div>
  );
};

export default SignUp;
