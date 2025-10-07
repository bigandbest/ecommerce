import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar/index.jsx";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import HomeIcon from "@mui/icons-material/Home";
/* import WhatshotIcon from "@mui/icons-material/Whatshot"; */
import ProductItem from "../../components/Productitem/index.jsx";
import ProductitemListView from "../../components/ProductitemListView/index.jsx";
import Search from "../../components/Search/index.jsx";
import { IoGrid } from "react-icons/io5";
import { ImMenu } from "react-icons/im";
import { Button, IconButton, Drawer, Divider } from "@mui/material";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Pagination from "@mui/material/Pagination";
import { FaFilter } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { MdSort } from "react-icons/md";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useLocationContext } from "../../contexts/LocationContext.jsx";
import { ChevronDown } from "lucide-react";

import {
  getAllProducts,
  getProductsByCategoryName,
  getProductsBySubcategoryName,
  getProductsByGroupName,
  getNearbyProducts,
  getDefaultUserAddress,
  gettingProductsByGroupName,
  gettingProductsByCategoryName,
  gettingProductsBySubcategoryName,
  getAllGroups,
  getAllSubcategories
} from "../../utils/supabaseApi";

const ProductListing = () => {
  const [itemView, setItemView] = useState("grid");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [sortOption, setSortOption] = useState("default");
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [minRating, setMinRating] = useState(0);
  const { currentUser } = useAuth();

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const category = queryParams.get("category");
  const subcategory = queryParams.get("subcategory");
  const group = queryParams.get("group");
  const search = queryParams.get("search")?.toLowerCase() || "";


  const { selectedAddress } = useLocationContext();

  const sortMenuOpen = Boolean(sortAnchorEl);
  const filterMenuOpen = Boolean(filterAnchorEl);

  const params = new URLSearchParams(location.search);
  const groupName = params.get("group");
  const subcategoryName = params.get("subcategory");
  const categoryName = params.get("category");
  const initialGroupName = params.get("group");
  const initialSubcategoryName = params.get("subcategory");

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState(initialSubcategoryName);
  const [selectedGroup, setSelectedGroup] = useState(initialGroupName);

  useEffect(() => {
    const fetchSubs = async () => {
      const { success, subcategories } = await getAllSubcategories();
      if (success) {
        // filter subcategories under the selected category
        const filtered = subcategories.filter(
          (sub) => sub.categories?.name === categoryName
        );
        setSubcategories(filtered);
      }
    };
    if (categoryName) fetchSubs();
  }, [categoryName]);

  useEffect(() => {
    const fetchGroups = async () => {
      const { success, groups } = await getAllGroups();
      if (success) {
        const filtered = groups.filter(
          (g) => g.subcategories?.name === selectedSubcategory
        );
        setGroups(filtered);

        // reset group selection if it doesn't belong
        if (!filtered.find((g) => g.name === selectedGroup)) {
          setSelectedGroup(filtered[0]?.name || null);
        }
      }
    };
    if (selectedSubcategory) fetchGroups();
  }, [selectedSubcategory]);

  const [groups, setGroups] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchGroups = async () => {
      const { success, groups } = await getAllGroups();
      if (success) {
        // filter only groups under the current subcategory
        const filtered = groups.filter(
          (g) => g.subcategories?.name === subcategoryName
        );
        setGroups(filtered);
      }
    };
    if (subcategoryName) fetchGroups();
  }, [subcategoryName]);


  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      let productsResult;
      const address = selectedAddress;
      const lat = address?.latitude;
      const lon = address?.longitude;
      const hasCoords = lat && lon;

      if (!hasCoords) {
        if (group) {
          productsResult = await gettingProductsByGroupName(group);
        } else if (subcategory) {
          productsResult = await gettingProductsBySubcategoryName(subcategory);
        } else if (category) {
          productsResult = await gettingProductsByCategoryName(category);
          console.log(productsResult)
        } else {
          productsResult = await getAllProducts();
        }
      } else {
        if (group) {
          productsResult = await getProductsByGroupName(group, lat, lon);
        } else if (subcategory) {
          productsResult = await getProductsBySubcategoryName(subcategory, lat, lon);
        } else if (category) {
          productsResult = await getProductsByCategoryName(category, lat, lon);
        } else {
          productsResult = await getNearbyProducts(lat, lon);
        }
      }

      const { success, products } = productsResult;
      let filteredProducts = [];

      if (success && products) {
        filteredProducts = products.map((p) => ({
          ...p,
          id: p.id || p.product_id,
          rating: p.rating ?? 0,
          reviewCount: p.review_count ?? 0,
          discount: p.discount ?? 0,
          image: p.image ?? "https://placehold.co/300x300?text=Product",
        }));

        // Apply search filter
        if (search) {
          const lowerSearch = search.toLowerCase();
          filteredProducts = filteredProducts.filter(
            (p) =>
              (p.name && p.name.toLowerCase().includes(lowerSearch)) ||
              (p.description &&
                p.description.toLowerCase().includes(lowerSearch))
          );
        }

        // Apply price filter
        filteredProducts = filteredProducts.filter(
          (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
        );

        // Apply rating filter
        filteredProducts = filteredProducts.filter(
          (p) => p.rating >= minRating
        );

        // Sort products
        switch (sortOption) {
          case "price-low":
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
          case "price-high":
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
          case "name-asc":
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
          case "name-desc":
            filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
            break;
          case "rating":
            filteredProducts.sort((a, b) => b.rating - a.rating);
            break;
          default:
            filteredProducts.sort((a, b) => b.reviewCount - a.reviewCount);
        }
      }

      setProductList(filteredProducts);
      setLoading(false);
    }

    fetchProducts();
  }, [
    category,
    subcategory,
    group,
    sortOption,
    priceRange,
    minRating,
    search,
    selectedAddress, // Include this in dependency
  ]);

  const handleSortClick = (event) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleSortClose = () => {
    setSortAnchorEl(null);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSortChange = (option) => {
    setSortOption(option);
    handleSortClose();
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    // Scroll to top of product section
    window.scrollTo({
      top: document.querySelector(".product-section").offsetTop - 100,
      behavior: "smooth",
    });
  };

  // Calculate current items to display
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = productList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(productList.length / itemsPerPage);

  const getCategoryTitle = () => {
    if (group) {
      return group.charAt(0).toUpperCase() + group.slice(1);
    }
    if (subcategory) {
      return subcategory.charAt(0).toUpperCase() + subcategory.slice(1);
    }
    if (!category) return "All Products";
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <div className="product-listing-page-wrapper md:mt-0 mt-[-2.7rem]">
      {/* Search Bar For mobile Screens */}
      {/* <div className="mobile-search-bar-container block md:hidden w-full mt-3 px-5 py-3">
        <Search />
      </div> */}
      {/* this div is only for spacing between search bar and product list */}
      {/*  <div className="mt-5 h-12 md:hidden"></div> */}
      <section className=" bg-gray-50 product-section !pt-2">

        <div className="w-full flex items-center gap-4 overflow-x-auto hide-scrollbar mb-6">
          {groups.map((grp) => (
            <div
              key={grp.id}
              className="flex flex-col items-center cursor-pointer"
              onClick={() => {
                window.location.href = `/productListing?group=${encodeURIComponent(grp.name)}&subcategory=${encodeURIComponent(subcategoryName)}&category=${encodeURIComponent(categoryName)}`;
              }}
            >
              <div className="h-16 w-16 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                <img
                  src={grp.image_url}
                  alt={grp.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-[10px] text-center mt-1 line-clamp-1">{grp.name}</p>
            </div>
          ))}
        </div>


        {/* Mobile filter button - visible only on small screens */}
        <div className="flex justify-between md:hidden w-20 py-2">
          <Button
            variant="outlined"
            startIcon={<FaFilter />}
            onClick={toggleSidebar}
            fullWidth
            className="!border-gray-300 !w-20 !max-h-[44px] !text-gray-700"
          >
            Filters
          </Button>

          {/* Name is Category but it will be connected to sub catgories */}
          {/* Category / Subcategory Dropdown */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outlined"
              onClick={handleClick}
              fullWidth
              className="!border-gray-300 !rounded-full !px-4 !py-2 !text-gray-800 !bg-gradient-to-r !from-gray-50 !to-gray-100 !shadow-sm hover:!from-gray-100 hover:!to-gray-200 !flex justify-between transition-all duration-200"
            >
              <span className="truncate max-w-[160px] font-medium">
                {selectedSubcategory || "✨ Select Subcategory"}
              </span>
              <ChevronDown className="ml-2 flex-shrink-0 text-gray-600" />
            </Button>

            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              PaperProps={{
                className:
                  "!rounded-xl !shadow-lg !bg-white !p-1 transition-all duration-200 !max-h-[250px] !overflow-y-auto hide-scrollbar",
              }}
            >
              {subcategories.map((sub) => (
                <MenuItem
                  key={sub.id}
                  onClick={() => {
                    setSelectedSubcategory(sub.name);
                    handleClose();
                  }}
                  className="!rounded-lg !px-4 !py-2 hover:!bg-indigo-50 hover:!text-indigo-600 truncate max-w-[220px] text-sm font-medium transition-colors"
                >
                  {sub.name}
                </MenuItem>
              ))}
            </Menu>
          </div>

        </div>


        <div className="w-full px-4">
          <Breadcrumbs aria-label="breadcrumb" className="text-sm flex-wrap">
            <Link
              underline="hover"
              sx={{ display: "flex", alignItems: "center" }}
              color="inherit"
              href="/"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
              <span className="text-xs sm:text-sm">Home</span>
            </Link>
            {/* Category link if present and not the last item */}
            {category && !subcategory && !group
              ? null
              : category && (
                <Link
                  underline="hover"
                  color="inherit"
                  href={`/productListing?category=${encodeURIComponent(
                    category
                  )}`}
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <span className="text-xs sm:text-sm">
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </span>
                </Link>
              )}
            {/* Subcategory link if present and not the last item */}
            {subcategory && !group
              ? null
              : subcategory && (
                <Link
                  underline="hover"
                  color="inherit"
                  href={`/productListing?subcategory=${encodeURIComponent(
                    subcategory
                  )}&category=${encodeURIComponent(category)}`}
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <span className="text-xs sm:text-sm">
                    {subcategory.charAt(0).toUpperCase() +
                      subcategory.slice(1)}
                  </span>
                </Link>
              )}
            {/* Final breadcrumb item (not a link) */}
            <span className="text-xs sm:text-sm font-medium">
              {group
                ? group.charAt(0).toUpperCase() + group.slice(1)
                : subcategory
                  ? subcategory.charAt(0).toUpperCase() + subcategory.slice(1)
                  : category
                    ? category.charAt(0).toUpperCase() + category.slice(1)
                    : "All Products"}
            </span>
          </Breadcrumbs>
          <h1 className="text-xl sm:text-2xl font-bold mt-3 mb-5">
            {getCategoryTitle()}
          </h1>
        </div>

        <div className="bg-white mt-4 shadow-sm product-listing-bg-white">
          <div className="w-full product-listing-main-wrapper">
            <div className="product-listing-container">
              {/* Sidebar - hidden on mobile, shown as drawer */}
              <div className="hidden md:block product-listing-sidebar">
                <Sidebar
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  minRating={minRating}
                  setMinRating={setMinRating}
                />
              </div>

              {/* Mobile sidebar drawer */}
              <Drawer
                anchor="left"
                open={sidebarOpen}
                onClose={toggleSidebar}
                className="md:hidden"
              >
                <div className="w-[280px] p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Filters</h3>
                    <IconButton onClick={toggleSidebar} size="small">
                      <IoClose />
                    </IconButton>
                  </div>
                  <Divider className="mb-4" />
                  <Sidebar
                    priceRange={priceRange}
                    setPriceRange={setPriceRange}
                    minRating={minRating}
                    setMinRating={setMinRating}
                  />
                </div>
              </Drawer>

              {/* Product content area */}
              <div className="product-listing-content">
                {/* Toolbar */}
                <div className="bg-gray-100 p-3 mb-4 rounded-md flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <IconButton
                      onClick={() => setItemView("list")}
                      className={`!p-2 ${itemView === "list" ? "!bg-blue-100" : ""
                        }`}
                      aria-label="List view"
                    >
                      <ImMenu
                        className={`${itemView === "list"
                          ? "text-blue-600"
                          : "text-gray-600"
                          }`}
                      />
                    </IconButton>

                    <IconButton
                      onClick={() => setItemView("grid")}
                      className={`!p-2 ${itemView === "grid" ? "!bg-blue-100" : ""
                        }`}
                      aria-label="Grid view"
                    >
                      <IoGrid
                        className={`${itemView === "grid"
                          ? "text-blue-600"
                          : "text-gray-600"
                          }`}
                      />
                    </IconButton>

                    <span className="text-xs sm:text-sm font-medium text-gray-700 hidden sm:inline-block">
                      {productList.length} products
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-medium text-gray-700 hidden sm:inline-block">
                      Sort by:
                    </span>

                    <Button
                      id="sort-button"
                      aria-controls={sortMenuOpen ? "sort-menu" : undefined}
                      aria-haspopup="true"
                      aria-expanded={sortMenuOpen ? "true" : undefined}
                      onClick={handleSortClick}
                      startIcon={<MdSort />}
                      variant="outlined"
                      size="small"
                      className="!text-gray-700 !border-gray-300 !capitalize !text-xs sm:!text-sm"
                    >
                      <span className="hidden xs:inline-block">Sort</span>
                    </Button>
                    <Menu
                      id="sort-menu"
                      anchorEl={sortAnchorEl}
                      open={sortMenuOpen}
                      onClose={handleSortClose}
                      MenuListProps={{
                        "aria-labelledby": "sort-button",
                      }}
                    >
                      <MenuItem onClick={() => handleSortChange("default")}>
                        Popularity
                      </MenuItem>
                      <MenuItem onClick={() => handleSortChange("rating")}>
                        Rating
                      </MenuItem>
                      <MenuItem onClick={() => handleSortChange("name-asc")}>
                        Name: A to Z
                      </MenuItem>
                      <MenuItem onClick={() => handleSortChange("name-desc")}>
                        Name: Z to A
                      </MenuItem>
                      <MenuItem onClick={() => handleSortChange("price-low")}>
                        Price: Low to High
                      </MenuItem>
                      <MenuItem onClick={() => handleSortChange("price-high")}>
                        Price: High to Low
                      </MenuItem>
                    </Menu>
                  </div>
                </div>

                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="spinner"></div>
                  </div>
                ) : (
                  <>
                    {currentItems.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <p className="text-lg font-medium text-gray-600 mb-4">
                          No products found
                        </p>
                        <p className="text-gray-500">
                          Try adjusting your filters or search term
                        </p>
                        <Button
                          variant="contained"
                          className="mt-6 bg-blue-600 hover:bg-blue-700"
                          href="/productListing"
                        >
                          View All Products
                        </Button>
                      </div>
                    ) : (
                      <div
                        className={
                          itemView === "grid"
                            ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4"
                            : "grid grid-cols-1 gap-4"
                        }
                      >
                        {itemView === "grid"
                          ? currentItems.map((item) => (
                            <ProductItem key={item.id} product={item} />
                          ))
                          : currentItems.map((item) => (
                            <ProductitemListView
                              key={item.id}
                              product={item}
                            />
                          ))}
                      </div>
                    )}
                  </>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center my-6">
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      onChange={handlePageChange}
                      variant="outlined"
                      color="primary"
                      size="medium"
                      className="pagination-responsive"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductListing;
