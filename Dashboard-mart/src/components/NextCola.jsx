import React, { useEffect, useState } from "react";
import axiosInstance from "../lib/axios";
import useAuthStore from '../store/authstore'
import { Pencil, Trash2, PlusCircle } from "lucide-react";

const Products = () => {
  const [categories, setCategories] = useState([
    "Beverages",
    "Snacks",
    "Dairy",
    "Bakery",
    "Frozen Food",
  ]); // static list for now, can come from backend later
  const productsFromStore = useAuthStore((s) => s.products);
  const productsLoading = useAuthStore((s) => s.productsLoading);
  const fetchProductsStore = useAuthStore((s) => s.fetchProducts);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    discount: "",
    image: "",
    category: "",
  });

  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // initial load
    fetchProductsStore();
  }, []);

  // (local fetch removed - we use the store's fetchProducts)

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await axiosInstance.put(`/products/${editingProduct._id}`, formData);
      } else {
        await axiosInstance.post(`/products`, formData);
      }
      await fetchProductsStore();
      resetForm();
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
  await axiosInstance.delete(`/products/${id}`);
  await fetchProductsStore();
    } catch (err) {
      console.log(err);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      stock: product.stock,
      discount: product.discount,
      image: product.image,
      category: product.category,
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      stock: "",
      discount: "",
      image: "",
      category: "",
    });
    setEditingProduct(null);
  };

  return (
    <div className="p-8 w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">
          Product Management
        </h1>
      </div>

      {/* Product Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow-md mb-8 grid grid-cols-2 md:grid-cols-3 gap-4"
      >
        <input
          type="text"
          placeholder="Product Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-indigo-500"
          required
        />

        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-indigo-500"
          required
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Price"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-indigo-500"
          required
        />

        <input
          type="number"
          placeholder="Stock"
          value={formData.stock}
          onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
          className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-indigo-500"
          required
        />

        <input
          type="number"
          placeholder="Discount (%)"
          value={formData.discount}
          onChange={(e) =>
            setFormData({ ...formData, discount: e.target.value })
          }
          className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-indigo-500"
        />

        <input
          type="text"
          placeholder="Image URL"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-indigo-500"
        />

        <button
          type="submit"
          className="col-span-full md:col-span-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 transition-all"
        >
          <PlusCircle size={18} />
          {editingProduct ? "Update Product" : "Add Product"}
        </button>
      </form>

      {/* Product Table */}
      {productsLoading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : productsFromStore.length === 0 ? (
        <p className="text-center text-gray-500">No products available</p>
      ) : (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="py-3 px-4 text-left">Image</th>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Category</th>
                <th className="py-3 px-4 text-left">Price</th>
                <th className="py-3 px-4 text-left">Stock</th>
                <th className="py-3 px-4 text-left">Discount</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {productsFromStore.map((p) => (
                <tr key={p._id} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-14 h-14 object-cover rounded-lg border"
                    />
                  </td>
                  <td className="py-3 px-4">{p.name}</td>
                  <td className="py-3 px-4">{p.category}</td>
                  <td className="py-3 px-4">${p.price}</td>
                  <td className="py-3 px-4">{p.stock}</td>
                  <td className="py-3 px-4">{p.discount || "0"}%</td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleEdit(p)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded mr-2 flex items-center justify-center gap-1"
                    >
                      <Pencil size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded flex items-center justify-center gap-1"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Products;
