import { create } from "zustand";
import axiosInstance from "../lib/axios";
import { toast } from "react-toastify";

const useProductStore = create((set) => ({
  products: [],
  loading: false,
  error: null,
  categories : [],
  brands : [],
  isBrandLoading : false,
  iscategoryLoading : false,
  authproduct : null,

  // 🔹 Get all products
fetchProducts: async () => {
  set({ loading: true, error: null });
  try {
    const res = await axiosInstance.get("/products");

    // ✅ Correct path
    const productsArray = Array.isArray(res.data?.data)
      ? res.data.data
      : [];

      set({ products: productsArray, loading: false });
    } catch (err) {
    set({
      error: err.response?.data?.message || "Failed to fetch products",
      loading: false,
    });
  }
},
 // 🔹 Add new product
  addProduct: async (formData) => {
    try {
      const res = await axiosInstance.post("/products/create", formData);

      const newProduct = res.data?.data || res.data?.product || res.data;
      set((state) => ({ products: [...state.products, newProduct] }));
      alert("✅ Product added successfully!");
      return newProduct;
    } catch (err) {
      console.error(err);
      alert("❌ Error adding product");
      throw err;
    }
  },
// 🔹 Fetch all brands
  fetchBrands: async () => {
    set({ isBrandLoading: true, error: null });
    try {
      const res = await axiosInstance.get("/brands");
      const brands = Array.isArray(res.data?.brands) ? res.data.brands : res.data?.brands ?? [];
      set({ brands, isBrandLoading: false });
      return brands;
    } catch (err) {
      console.error("Error fetching brands:", err);
      set({
        error: err.response?.data?.message || "Failed to fetch brands",
        isBrandLoading: false,
      });
      return [];
    }
  },

// 🔹 Add new brand
addbrand: async (branddata) => {
  if (!branddata.name?.trim() || !branddata.category) {
    alert("❌ Brand name and category are required!");
    return;
  }

  set({ isBrandLoading: true });
  try {
    // If an image file is present, send multipart/form-data
    let payload = branddata;
    if (branddata.image) {
      const fd = new FormData();
      fd.append("name", branddata.name);
      fd.append("category", branddata.category);
      fd.append("image", branddata.image);
      payload = fd;
    }

    const res = await axiosInstance.post("/brands", payload);
    const newBrand = res.data?.brand || res.data;

    set((state) => ({
      brands: Array.isArray(state.brands) ? [...state.brands, newBrand] : [newBrand],
    }));

    toast.success("✅ Brand added successfully!");
  } catch (err) {
    console.error("❌ Error adding brand:", err);
    alert("❌ Error adding brand");
  } finally {
    set({ isBrandLoading: false });
  }
},
// fatch category 
fetchCategories: async () => {
    try {
      set({ iscategoryLoading: true, error: null });
      const res = await axiosInstance.get("/categories");

    if (res.data.success) {
      const categories = Array.isArray(res.data.categories)
        ? res.data.categories
        : [];
      set({ categories, iscategoryLoading: false, error: null });
      return categories;
    } else {
      set({
        error: res.data.message || "Unexpected response",
        iscategoryLoading: false,
      });
      return [];
    }
  } catch (err) {
    console.error("Fetch error:", err);
    set({
      error: err.response?.data?.message || "Failed to fetch categories",
      iscategoryLoading: false,
    });
    return [];
  }
},

// 🔹 Add category data (fixed)
addCategory: async (categorydata) => {
  set({ iscategoryLoading: true });
  try {
    const res = await axiosInstance.post("/categories", categorydata);

    // Defensive check: handle different API structures safely
    const newCategory =
      res.data?.categorydata ||
      res.data?.data ||
      res.data?.category ||
      res.data; // fallback

    set((state) => ({
         categories: Array.isArray(state.categories)
        ? [...state.categories, newCategory]
        : [newCategory], // fallback if somehow categories is not array
    }));

    alert("✅ Category added successfully!");
  } catch (err) {
    console.error("❌ Error adding category:", err);
    alert("❌ Error adding category");
  } finally {
    set({ iscategoryLoading: false });
  }
},

  // 🔹 Update product
  updateProduct: async (id, updatedData) => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.put(`/products/${id}`, updatedData);
      set((state) => ({
        products: state.products.map((p) => (p._id === id ? res.data : p)),
        loading: false,
      }));
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to update product", loading: false });
    }
  },

  // 🔹 Delete product
  deleteProduct: async (id) => {
    set({ loading: true, error: null });
    try {
      await axiosInstance.delete(`/products/${id}`);
      set((state) => ({
        products: state.products.filter((p) => p._id !== id),
        loading: false,
      }));
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to delete product", loading: false });
    }
  },
}));

export default useProductStore;
