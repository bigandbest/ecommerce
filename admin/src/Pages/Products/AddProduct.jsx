import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Card,
  Title,
  TextInput,
  NumberInput,
  Textarea,
  Select,
  Button,
  FileInput,
  Group,
  Switch,
  LoadingOverlay,
} from "@mantine/core";
import { addProduct, getAllCategories } from "../../utils/supabaseApi";
import { Link } from "react-router-dom";

const UNIT_OPTIONS = [
  { value: "kg", label: "Kilogram (kg)" },
  { value: "g", label: "Gram (g)" },
  { value: "l", label: "Litre (l)" },
  { value: "ml", label: "Millilitre (ml)" },
  { value: "packet", label: "Packet" },
  { value: "pcs", label: "Pieces (pcs)" },
  { value: "pack", label: "Pack" },
  { value: "box", label: "Box" },
  { value: "bottle", label: "Bottle" },
  { value: "can", label: "Can" },
  { value: "pouch", label: "Pouch" },
];

const AddProduct = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    price: 0,
    old_price: 0,
    discount: 0,
    stock: 0,
    category_id: "",
    description: "",
    specifications: "",
    image: null,
    rating: 0,
    review_count: 0,
    featured: false,
    popular: false,
    in_stock: true,
    active: true,
    shipping_amount: 0,
    weight_value: "",
    weight_unit: "kg",
    weight_display: "",
    brand_name: "",
    store_id: "",
  });

  const updateWeightDisplay = (value, unit) => {
    const weightString = value && unit ? `${value} ${unit}` : "";
    setForm((prev) => ({ ...prev, weight_display: weightString }));
  };

  const handleWeightValueChange = (value) => {
    setForm((prev) => ({ ...prev, weight_value: value }));
    updateWeightDisplay(value, form.weight_unit);
  };

  const handleWeightUnitChange = (unit) => {
    setForm((prev) => ({ ...prev, weight_unit: unit }));
    updateWeightDisplay(form.weight_value, unit);
  };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [categoryOptions, setCategoryOptions] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [brandOptions, setBrandOptions] = useState([]);
  const [brandsLoading, setBrandsLoading] = useState(true);

  const [storeOptions, setStoreOptions] = useState([]);
  const [storesLoading, setStoresLoading] = useState(true);

  React.useEffect(() => {
    console.log("API Base URL:", import.meta.env.VITE_API_BASE_URL);

    async function fetchCategories() {
      setCategoriesLoading(true);
      const result = await getAllCategories();
      setCategoriesLoading(false);
      if (result.success) {
        setCategoryOptions(
          result.categories.map((cat) => ({ value: cat.id, label: cat.name }))
        );
      }
    }

    async function fetchBrands() {
      setBrandsLoading(true);
      try {
        const apiUrl =
          import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
        const response = await axios.get(`${apiUrl}/brand/list`);
        console.log("Brands API Response:", response.data);
        if (response.data.success && response.data.brands) {
          setBrandOptions(
            response.data.brands.map((brand) => ({
              value: brand.name,
              label: brand.name,
            }))
          );
        } else {
          console.warn("No brands found or invalid response structure");
          setBrandOptions([]);
        }
      } catch (error) {
        console.error("Failed to fetch brands:", error);
        setBrandOptions([]);
      } finally {
        setBrandsLoading(false);
      }
    }

    async function fetchStores() {
      setStoresLoading(true);
      try {
        const apiUrl =
          import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
        const response = await axios.get(`${apiUrl}/recommended-stores/list`);
        console.log("Stores API Response:", response.data);
        if (response.data.success && response.data.recommendedStores) {
          setStoreOptions(
            response.data.recommendedStores.map((store) => ({
              value: store.id.toString(),
              label: store.name,
            }))
          );
        } else {
          console.warn("No stores found or invalid response structure");
          setStoreOptions([]);
        }
      } catch (error) {
        console.error("Failed to fetch stores:", error);
        setStoreOptions([]);
      } finally {
        setStoresLoading(false);
      }
    }

    fetchCategories();
    fetchBrands();
    fetchStores();
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.price || !form.category_id) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    // Convert 'active' boolean to a boolean value for Supabase
    const payload = { ...form };
    const result = await addProduct(payload, form.image);
    setLoading(false);
    if (result.success) {
      navigate("/products");
    } else {
      setError(result.error || "Failed to add product");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Card shadow="sm" p="lg" radius="md" className="max-w-xl mx-auto">
        <Title order={2} className="mb-6">
          Add New Product
        </Title>

        {/* Debug info - remove in production */}
        <div className="mb-4 p-2 bg-gray-100 rounded text-sm">
          <strong>Debug Info:</strong>
          <br />
          Brands Loading: {brandsLoading ? "Yes" : "No"}
          <br />
          Brand Options: {brandOptions.length}
          <br />
          Stores Loading: {storesLoading ? "Yes" : "No"}
          <br />
          Store Options: {storeOptions.length}
        </div>
        <form onSubmit={handleSubmit}>
          {/* Removed unsupported overlayBlur prop */}
          <LoadingOverlay visible={loading} />
          <TextInput
            label="Product Name"
            placeholder="Enter product name"
            required
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="mb-4"
          />
          <NumberInput
            label="Price"
            placeholder="Enter price"
            required
            value={form.price}
            onChange={(value) => handleChange("price", value)}
            min={0}
            className="mb-4"
          />
          <NumberInput
            label="Old Price"
            placeholder="Enter old price (optional)"
            value={form.old_price}
            onChange={(value) => handleChange("old_price", value)}
            min={0}
            className="mb-4"
          />
          <NumberInput
            label="Discount (%)"
            placeholder="Enter discount percent (optional)"
            value={form.discount}
            onChange={(value) => handleChange("discount", value)}
            min={0}
            max={100}
            className="mb-4"
          />

          {categoriesLoading ? (
            <div className="mb-4">Loading categories...</div>
          ) : categoryOptions.length === 0 ? (
            <div className="mb-4 text-red-600">
              No categories found.{" "}
              <Link to="/categories/add" className="text-blue-600 underline">
                Add a category first
              </Link>
              .
            </div>
          ) : (
            <Select
              label="Category"
              placeholder="Select category"
              required
              data={categoryOptions}
              value={form.category_id}
              onChange={(value) => handleChange("category_id", value)}
              className="mb-4"
            />
          )}

          <Select
            label="Brand (Recommended)"
            placeholder={
              brandsLoading
                ? "Loading brands..."
                : brandOptions.length === 0
                ? "No brands available"
                : "Select brand (recommended for better visibility)"
            }
            data={brandOptions}
            value={form.brand_name}
            onChange={(value) => handleChange("brand_name", value)}
            className="mb-4"
            description="Adding a brand helps customers find your product easily"
            disabled={brandsLoading}
            clearable
            searchable
          />

          <Select
            label="Store"
            placeholder={
              storesLoading
                ? "Loading stores..."
                : storeOptions.length === 0
                ? "No stores available"
                : "Select store for this product"
            }
            data={storeOptions}
            value={form.store_id}
            onChange={(value) => handleChange("store_id", value)}
            className="mb-4"
            description="Assign this product to a specific store category"
            disabled={storesLoading}
            clearable
            searchable
          />

          <NumberInput
            label="Stock"
            placeholder="Enter stock quantity"
            value={form.stock}
            onChange={(value) => handleChange("stock", value)}
            min={0}
            className="mb-4"
          />
          <NumberInput
            label="Shipping Amount (₹)"
            placeholder="Enter shipping amount"
            value={form.shipping_amount}
            onChange={(value) => handleChange("shipping_amount", value)}
            min={0}
            className="mb-4"
          />
          <Textarea
            label="Description"
            placeholder="Enter product description"
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            autosize
            minRows={2}
            className="mb-4"
          />
          <Textarea
            label="Product Specifications"
            placeholder="Enter specifications (one per line)\nExample:\nElectric Wheelchairs/Scooters\nSolar Power Banks/Storage\nRV or Marine Power Systems"
            value={form.specifications}
            onChange={(e) => handleChange("specifications", e.target.value)}
            autosize
            minRows={3}
            className="mb-4"
          />
          <FileInput
            label="Product Image"
            placeholder="Upload product image"
            accept="image/*"
            onChange={(file) => handleChange("image", file)}
            className="mb-4"
          />

          <Switch
            label="Active"
            checked={form.active}
            onChange={(e) => handleChange("active", e.currentTarget.checked)}
            color="green"
            className="mb-4"
          />
          <Switch
            label="In Stock"
            checked={form.in_stock}
            onChange={(e) => handleChange("in_stock", e.currentTarget.checked)}
            color="blue"
            className="mb-4"
          />
          <Switch
            label="Featured"
            checked={form.featured}
            onChange={(e) => handleChange("featured", e.currentTarget.checked)}
            color="yellow"
            className="mb-4"
          />
          <Switch
            label="Popular"
            checked={form.popular}
            onChange={(e) => handleChange("popular", e.currentTarget.checked)}
            color="orange"
            className="mb-4"
          />
          <NumberInput
            label="Rating"
            placeholder="Enter rating (0-5)"
            value={form.rating}
            onChange={(value) => handleChange("rating", value)}
            min={0}
            max={5}
            step={0.1}
            precision={1}
            className="mb-4"
          />
          <NumberInput
            label="Review Count"
            placeholder="Enter review count"
            value={form.review_count}
            onChange={(value) => handleChange("review_count", value)}
            min={0}
            className="mb-4"
          />
          {error && <div className="text-red-600 mb-4">{error}</div>}
          <Group position="right">
            <Button variant="default" onClick={() => navigate("/products")}>
              Cancel
            </Button>
            <Button type="submit" color="blue">
              Add Product
            </Button>
          </Group>
        </form>
      </Card>
    </div>
  );
};

export default AddProduct;
