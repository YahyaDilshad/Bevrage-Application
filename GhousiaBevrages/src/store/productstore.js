import { create } from "zustand";
import axiosInstance from "../utils/axiosInstace";

const useProductStore = create((set, get) => ({
  products: [],
  categories: [],
  brands: [],
  loading: false,
  error: null,
  banner : [],

  fetchBanner : async ()=>{
    try {
      set({loading : true , error : null})
      const res = await axiosInstance.get('/banner') 
      const bannerArray = Array.isArray(res.data?.data) ? res.data.data : [];
      set({banner : bannerArray})

    } catch (error) {
      // don't throw due to missing toast in this environment; log instead
      console.log('❌ banner fetch error:', error?.response?.data || error.message);
      set({ error: error?.response?.data?.message || error.message, loading: false });
    }
  },
  fetchBrands :async()=>{
    try {
      set({loading : true ,error : null})
      const res = await axiosInstance.get('/brands')
      // backend may return brands under different keys (brands or data)
      const brandsFromResponse = res.data?.brands ?? res.data?.data ?? res.data;
      set({ brands: Array.isArray(brandsFromResponse) ? brandsFromResponse : [], loading: false });
      

    }catch (error) {
      console.log('❌ brands fetch error:', error?.response?.data || error.message);
      set({ error: error.response?.data?.message || error.message, loading: false });
    }
  },
fetchCategories: async () => {
  try {
    set({ loading: true, error: null });
    const res = await axiosInstance.get("/categories");
    // ✅ Correct extraction
    const { categories } = res.data;
    // ✅ Safe update
    set({ categories: Array.isArray(categories) ? categories : [], loading: false });

  } catch (err) {
    set({ error: err.response?.data?.message || err.message, loading: false });
  }
},


  fetchBrandsByCategory: async (categoryId) => {
    try {
      set({ loading: true, error: null, brands: [] });
      const res = await axiosInstance.get(`/brands/by-category/${categoryId}`);
      set({ brands: res.data.data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || err.message, loading: false });
    }
  },

  fetchProducts: async ({ category, brand, search }) => {
    try {
      set({ loading: true, error: null });
      const params = {};
      if (category) params.category = category;
      if (brand) params.brand = brand;
      if (search) params.search = search;

      const res = await axiosInstance.get("/products/getproducts", { params });
      
      set({ products: res.data.data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || err.message, loading: false });
    }
  },
}));

export default useProductStore;
