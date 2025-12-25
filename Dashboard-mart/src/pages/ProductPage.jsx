import React, { useEffect, useState } from "react";
import useProductStore from "../store/productauthstore";
import { toast } from "react-toastify";
import { Plus, BadgeCheck, FolderTree, Delete, Trash2, Edit } from "lucide-react";

const ProductPage = () => {
  const {
    addProduct,
    addbrand,
    addCategory,
    fetchProducts,
    fetchCategories,
    fetchBrands,
    brands,
    categories,
    loading,
    error,
    products,
  } = useProductStore();

  // ---------- UI States ----------
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showBrandForm, setShowBrandForm] = useState(false);
  const [searchItem, setSearchItem] = useState("");

  // ---------- Initial Data Fetch ----------
  useEffect(() => {
    fetchBrands();
    fetchCategories();
    fetchProducts();
  }, []);

  // ---------- CATEGORY ----------
  const [categoryData, setCategoryData] = useState({ name: "" });

  const validateCategoryForm = () => {
    if (!categoryData.name.trim()) {
      toast.error("Category name is required");
      return false;
    }
    return true;
  };

  const handleCategory = async (e) => {
    e.preventDefault();
    if (!validateCategoryForm()) return;

    const payload = { name: categoryData.name.trim() };
    await addCategory(payload);
    setCategoryData({ name: "" });
    toast.success("✅ Category added successfully!");

  };

  // ---------- BRAND ----------
  const [brandData, setBrandData] = useState({
    name: "",
    image: null,
    category: "",
  });

  const validateBrandForm = () => {
    if (!brandData.name.trim()) {
      toast.error("Brand name is required");
      return false;
    }
    if (!brandData.category.trim()) {
      toast.error("Category must be selected");
      return false;
    }
    return true;
  };

  const handleBrand = async (e) => {
    e.preventDefault();
    if (!validateBrandForm()) return;

    const payload = {
      name: brandData.name,
      image: brandData.image,
      category: brandData.category,
    };

    await addbrand(payload);
    setBrandData({ name: "", image: null, category: "" });
    toast.success("✅ Brand added successfully!");
  };

  // ---------- PRODUCT ----------
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    brand: "",
    description: "",
    image: null,
  });

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleProductFile = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }
    await addProduct(data);
    setFormData({
      name: "",
      price: "",
      stock: "",
      category: "",
      brand: "",
      description: "",
      image: null,
    });
  };

  // ---------- JSX ----------
  return (
    <div className="w-[80%] absolute left-64 h-screen">
      <header className="border-b bg-white w-full relative">
        <div className="px-6 mt-10 py-5 relative z-999 flex items-center justify-between bg-white">
          <h1 className="font-bold text-4xl">All Products</h1>

          <div className="flex items-center gap-5">
            {/* Add Brand Icon */}
            <FolderTree
              onClick={() => setShowBrandForm((prev) => !prev)}
              className="text-[20px] p-[3%] cursor-pointer hover:bg-black transition-all duration-200 hover:text-white w-10 bg-gray-100 rounded-full h-10 text-gray-500"
            />

            {/* Add Category Icon */}
            <BadgeCheck
              onClick={() => setShowCategoryForm((prev) => !prev)}
              className="text-[20px] p-[3%] cursor-pointer hover:bg-black transition-all duration-200 hover:text-white w-10 bg-gray-100 rounded-full h-10 text-gray-500"
            />

            {/* Add Product Button */}
            <div
              onClick={() => setShowProductForm((prev) => !prev)}
              className="btn bg-indigo-500 py-2 px-5 flex items-center text-white rounded cursor-pointer gap-2"
            >
              <Plus />
              <button>Add Product</button>
            </div>
          </div>
        </div>

        {/* ---------- Add Product Form ---------- */}
        <div
          className={`absolute transition-all duration-300 ${
            showProductForm ? "top-17" : "top-[-300%]"
          } w-full p-5 rounded-xl bg-[#f8f6f6]`}
        >
          <h1 className="text-xl mb-3">Add New Product</h1>

          <form
            onSubmit={handleSubmitProduct}
            className="py-5 w-full rounded flex items-center flex-wrap gap-2"
          >
            <input
              name="name"
              placeholder="Product Name"
              value={formData.name}
              onChange={handleProductChange}
              className="border rounded outline-none border-[#cfcfcfda] p-2 w-50 mb-2"
            />
            <input
              name="price"
              placeholder="Price"
              value={formData.price}
              onChange={handleProductChange}
              className="border rounded outline-none border-[#cfcfcfda] p-2 w-50 mb-2"
            />
            <input
              name="stock"
              placeholder="Stock"
              value={formData.stock}
              onChange={handleProductChange}
              className="border rounded outline-none border-[#cfcfcfda] p-2 w-50 mb-2"
            />

            {/* Category dropdown */}
            <select
              name="category"
              value={formData.category}
              onChange={handleProductChange}
              className="border rounded outline-none border-[#cfcfcfda] p-2 w-50 mb-2"
            >
              <option value="">Select Category</option>
              {categories?.map((c, idx) => (
                <option key={c._id ?? c.name ?? idx} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Brand dropdown */}
            <select
              name="brand"
              value={formData.brand}
              onChange={handleProductChange}
              className="border p-2 w-50 outline-none rounded border-[#cfcfcfda]"
            >
              <option value="">Select Brand</option>
              {brands?.map((b, idx) => (
                <option key={b._id ?? b.name ?? idx} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>

            <textarea
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleProductChange}
              className="border outline-none border-[#cfcfcfda] p-2 w-50 mb-2"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleProductFile}
              className="mb-2"
            />
            <button
              type="submit"
              className="cursor-pointer bg-gray-800 text-white px-4 py-2 rounded"
            >
              Add Product
            </button>
          </form>
        </div>

        {/* ---------- Add Brand Form ---------- */}
        <div
          className={`absolute transition-all duration-300 ${
            showBrandForm ? "top-17" : "top-[-200%]"
          } w-full p-5 rounded-xl bg-[#f8f6f6]`}
        >
          <h1 className="text-xl mb-3">Add New Brand</h1>
          <form
            onSubmit={handleBrand}
            className="py-5 w-full rounded flex items-center flex-wrap gap-2"
          >
            <input
              name="name"
              placeholder="Brand Name"
              value={brandData.name}
              onChange={(e) =>
                setBrandData({ ...brandData, name: e.target.value })
              }
              className="border rounded outline-none border-[#cfcfcfda] p-2 w-50 mb-2"
            />

            {/* Category dropdown */}
            <select
              name="category"
              value={brandData.category}
              onChange={(e) =>
                setBrandData({ ...brandData, category: e.target.value })
              }
              className="border rounded outline-none border-[#cfcfcfda] p-2 w-50 mb-2"
            >
              <option value="">Select Category</option>
              {categories?.map((c, idx) => (
                <option key={c._id ?? c.name ?? idx} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setBrandData({ ...brandData, image: e.target.files[0] })
              }
              className="mb-2"
            />
            <button
              type="submit"
              className="cursor-pointer bg-gray-800 text-white px-4 py-2 rounded"
            >
              Add Brand
            </button>
          </form>
        </div>

        {/* ---------- Add Category Form ---------- */}
        <div
          className={`absolute transition-all duration-300 ${
            showCategoryForm ? "top-17" : "top-[-200%]"
          } w-full p-5 rounded-xl bg-[#f8f6f6]`}
        >
          <h1 className="text-xl mb-3">Add New Category</h1>
          <form
            onSubmit={handleCategory}
            className="py-5 w-full rounded flex items-center flex-wrap gap-2"
          >
            <input
              name="name"
              placeholder="Category Name"
              value={categoryData.name}
              onChange={(e) =>
                setCategoryData({ ...categoryData, name: e.target.value })
              }
              className="border rounded outline-none border-[#cfcfcfda] p-2 w-50 mb-2"
            />
            <button
              type="submit"
              className="cursor-pointer bg-gray-800 text-white px-4 py-2 rounded"
            >
              Add Category
            </button>
          </form>
        </div>
      </header>

      {/* ---------- Search Bar ---------- */}
      <header className="border-b border-[#cfcfcfda] px-6 py-5 w-full flex items-center justify-between">
        <input
          type="text"
          value={searchItem}
          placeholder="Search product..."
          onChange={(e) => setSearchItem(e.target.value)}
          className="border outline-none border-[#cfcfcf] p-2 rounded w-[50%]"
        />
      </header>
            <div className="w-full  flex flex-col">
        <div className="w-[100%] text-center py-4  bg-gray-100 flex gap-6  ">
          <h5 className="w-22">Name</h5><span className='text-gray-400'>|</span>
          <h5 className="w-20">Price</h5><span className='text-gray-400'>|</span>
          <h5 className="w-20">Discount</h5><span className='text-gray-400'>|</span>
          <h5 className="w-20">Stock</h5><span className='text-gray-400'>|</span>
          <h5 className="w-20">Brand</h5><span className='text-gray-400'>|</span>
          <h5 className="w-20">Category</h5><span className='text-gray-400'>|</span>
          <h5 className="w-20">Description</h5>
        </div>
        {products?.map((p, idx) => (
          <div key={idx} className="w-full py-4 text-center flex items-center  border-b border-gray-300">
            <p className="w-32 text-[15px]">{p.name}</p>
            <p className="w-35 text-[15px]">{p.price}</p>
            <p className="w-36 pl-10 text-[15px]">{p.discount}</p>
            <p className="w-40 pl-10 text-[15px]">{p.stock}</p>
            <p className="w-40 pl-10 text-[15px]">{p.brand?.name}</p>
            <p className="w-40 pl-10 text-[15px]">{p.category?.name}</p>
            <p className="w-36 text-[15px]">{p.description.length >= 20 ? <span>......</span> : p.description}</p>
           <div className=" w-40 flex gap-5 justify-end pr-10 ">
            <Edit className="w-8 h-8 bg-gray-200 transition-all duration-300 cursor-pointer hover:bg-gray-300 py-2 rounded text-gray-800" />
            <Trash2 className="w-8 h-8 bg-gray-200 transition-all duration-300 cursor-pointer hover:bg-gray-300 py-2 rounded text-red-500" />
          </div>
          </div>
          
        ))}
        
      </div>

    </div>
  );
};

export default ProductPage;
