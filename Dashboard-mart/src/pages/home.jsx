import React from 'react'
import { BarChart3, Users, Package, FileText, Bell, Settings } from "lucide-react";

const home = () => {
  const sections = [
    {
      icon: <BarChart3 className="w-8 h-8 text-indigo-500" />,
      title: "Sales Overview",
      desc: "Monitor your store’s overall performance. View total revenue, daily and monthly sales, and get insights into best-selling categories. Compare data from previous weeks to understand your growth patterns.",
      color: "from-indigo-500/10 to-indigo-100",
    },
    {
      icon: <Users className="w-8 h-8 text-emerald-500" />,
      title: "Customer Insights",
      desc: "Track how many users signed up, who’s active, and how your customer base is growing. Analyze user behavior to improve engagement and customer satisfaction.",
      color: "from-emerald-500/10 to-emerald-100",
    },
    {
      icon: <Package className="w-8 h-8 text-orange-500" />,
      title: "Product Performance",
      desc: "Identify top-selling items, low-stock alerts, and slow-moving products. Keep your inventory organized and plan restocks based on real-time demand data.",
      color: "from-orange-500/10 to-orange-100",
    },
    {
      icon: <FileText className="w-8 h-8 text-blue-500" />,
      title: "Orders & Reports",
      desc: "Access recent orders, view their status, and generate detailed sales reports. Understand your business performance through comprehensive analytics and exportable reports.",
      color: "from-blue-500/10 to-blue-100",
    },
    {
      icon: <Bell className="w-8 h-8 text-pink-500" />,
      title: "Notifications & Updates",
      desc: "Stay informed with alerts for new orders, customer feedback, or product restocks. Never miss important events happening in your store.",
      color: "from-pink-500/10 to-pink-100",
    },
    {
      icon: <Settings className="w-8 h-8 text-gray-500" />,
      title: "Account & Settings",
      desc: "Manage your account preferences, roles, and app configurations. Update store details, manage access permissions, and fine-tune your dashboard appearance.",
      color: "from-gray-500/10 to-gray-100",
    },
  ];
  return (
    <div className='w-[80%] absolute top-5 left-64'>
        <div className="p-8  min-h-screen">
      {/* Page Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2 max-w-2xl">
          Welcome back, Admin 👋 — this dashboard gives you a complete view of your store’s performance,
          user activity, and inventory status in one place.
        </p>
      </div>

      {/* Section Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${section.color} p-6 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer`}
          >
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-xl shadow-inner">{section.icon}</div>
              <h2 className="text-xl font-semibold text-gray-800">{section.title}</h2>
            </div>
            <p className="text-gray-600 mt-3 text-sm leading-relaxed">{section.desc}</p>
          </div>
        ))}
      </div>
    </div>

    </div>
        
  )
}

export default home