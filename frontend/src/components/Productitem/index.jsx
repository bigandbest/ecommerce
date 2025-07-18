import React, { useState, useEffect } from 'react';
import Rating from '@mui/material/Rating';
import { Link, useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import VisibilityIcon from '@mui/icons-material/Visibility';
// import CompareArrowsIcon from '@mui/icons-material/CompareArrows'; // Removed compare feature
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useAuth } from '../../contexts/AuthContext';
import { getWishlistItems, addToWishlist, removeFromWishlist, addToCart } from '../../utils/supabaseApi';
import './productGrid.css';

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: 'white',
  color: '#666',
  '&:hover': {
    backgroundColor: '#3f51b5',
    color: 'white',
  },
  '&:disabled': {
    backgroundColor: '#f5f5f5',
    color: '#ccc',
  },
  width: '35px',
  height: '35px',
  boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
  margin: '0 2px',
  '@media (max-width: 640px)': {
    width: '32px',
    height: '32px',
    padding: '4px',
  },
}));

const ProductItem = ({ product }) => {
  const [cartLoading, setCartLoading] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);
  const { currentUser } = useAuth();
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistItemId, setWishlistItemId] = useState(null);
  const navigate = useNavigate();

  // Handle quick view - navigate to product page
  const handleQuickView = () => {
    if (product && product.id) {
      navigate(`/product/${product.id}`);
    }
  };

  useEffect(() => {
    async function checkWishlist() {
      try {
        if (currentUser && currentUser.id && product && product.id) {
          const { success, wishlistItems, error } = await getWishlistItems(currentUser.id);
          if (success && wishlistItems) {
            const found = wishlistItems.find(item => item.id === product.id || item.product_id === product.id);
            setInWishlist(!!found);
            setWishlistItemId(found ? found.wishlist_item_id : null);
          } else {
            setInWishlist(false);
            setWishlistItemId(null);
          }
        } else {
          setInWishlist(false);
          setWishlistItemId(null);
        }
      } catch (err) {
        setInWishlist(false);
        setWishlistItemId(null);
      }
    }
    checkWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, product && product.id]);

  const handleWishlistClick = async () => {
    if (!currentUser || !product || !product.id) {
      return;
    }
    try {
      if (inWishlist && wishlistItemId) {
        const { success, error } = await removeFromWishlist(wishlistItemId);
        if (success) {
          setInWishlist(false);
          setWishlistItemId(null);
          window.dispatchEvent(new Event('wishlistUpdated'));
        }
      } else {
        const { success, wishlistItem, error } = await addToWishlist(currentUser.id, product.id);
        if (success) {
          setInWishlist(true);
          setWishlistItemId(wishlistItem ? wishlistItem.id : null);
          window.dispatchEvent(new Event('wishlistUpdated'));
        }
      }
    } catch (err) {
      // Error handling
    }
  };

  const handleAddToCart = async () => {
    if (!currentUser || !product || !product.id) {
      return;
    }
    setCartLoading(true);
    try {
      const { success, error, cartItem } = await addToCart(currentUser.id, product.id, 1);
      setCartLoading(false);
      if (success) {
        setCartAdded(true);
        window.dispatchEvent(new Event('cartUpdated'));
        setTimeout(() => setCartAdded(false), 1200);
      }
    } catch (err) {
      setCartLoading(false);
    }
  };

  // Default values if product is not provided
  const defaultProduct = {
    id: 1,
    name: "Sample Product",
    category: "category",
    price: 29.99,
    oldPrice: 39.99,
    rating: 4,
    reviewCount: 10,
    discount: 25,
    image: "https://placehold.co/300x300?text=Product",
    description: "High quality product with excellent features and modern design"
  };
  
  // Function to truncate description to a fixed number of words
  const truncateDescription = (text, wordCount = 8) => {
    if (!text) return "Premium quality product with excellent features and modern design.";
    const words = text.split(' ');
    if (words.length <= wordCount) return text;
    return words.slice(0, wordCount).join(' ') + '...';
  };
  
  // Use provided product data or defaults
  const {
    id, 
    name, 
    category,
    subcategories,
    price, 
    oldPrice, 
    rating, 
    reviewCount,
    discount,
    image,
    description
  } = product || defaultProduct;

  // Get subcategory name and category name from the joined data
  const subcategoryName = subcategories?.name;
  const categoryName = subcategories?.categories?.name || category;

  // DEBUG: Show error to user (optional, simple alert)
  // You can replace alert with a nicer UI feedback
  // Example: const [errorMsg, setErrorMsg] = useState("");

  return (
    <div className="product-item group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col min-h-[400px]">
      <div className="img-wrapper relative overflow-hidden h-48 flex-shrink-0">
        {discount && (
          <div className="product-tag absolute top-3 left-3 z-10">
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">-{discount}%</span>
          </div>
        )}

        <Link to={`/product/${id}`} className="block h-full">
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://placehold.co/300x300?text=Product';
            }}
          />
        </Link>

        <div className="actions absolute right-2 top-2 md:right-0 md:top-1/2 md:-translate-y-1/2 md:opacity-0 md:group-hover:opacity-100 md:group-hover:right-2 transition-all duration-300 flex md:flex-col gap-1">
          <Tooltip title={inWishlist ? "Remove from wishlist" : "Add to wishlist"} placement="left">
            <StyledIconButton aria-label="wishlist" onClick={handleWishlistClick} style={inWishlist ? { color: '#ff4081' } : {}}>
              {inWishlist ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
            </StyledIconButton>
          </Tooltip>
          <Tooltip title="Quick view" placement="left">
            <StyledIconButton aria-label="quick-view" onClick={handleQuickView}>
              <VisibilityIcon fontSize="small" />
            </StyledIconButton>
          </Tooltip>
          <Tooltip title={cartAdded ? "Added!" : "Add to cart"} placement="left">
            <span>
              <StyledIconButton 
                aria-label="add-to-cart"
                onClick={handleAddToCart}
                disabled={cartLoading || !currentUser}
                style={cartAdded ? { color: '#4caf50' } : {}}
                className="cart-icon-button"
              >
                <ShoppingCartIcon fontSize="small" className="cart-icon" />
              </StyledIconButton>
            </span>
          </Tooltip>
        </div>
      </div>

      <div className="info p-4 flex flex-col flex-1">
        {/* Category/Subcategory */}
        <div className="category mb-2 flex-shrink-0">
          {subcategoryName ? (
            <Link 
              to={`/productListing?subcategory=${encodeURIComponent(subcategoryName)}&category=${encodeURIComponent(categoryName)}`} 
              className="text-xs text-gray-500 hover:text-blue-600 transition-colors inline-block truncate max-w-full"
              title={subcategoryName}
            >
              {subcategoryName.charAt(0).toUpperCase() + subcategoryName.slice(1)}
            </Link>
          ) : (
            <Link 
              to={`/productListing?category=${encodeURIComponent(categoryName)}`} 
              className="text-xs text-gray-500 hover:text-blue-600 transition-colors inline-block truncate max-w-full"
              title={categoryName}
            >
              {categoryName?.charAt(0).toUpperCase() + categoryName?.slice(1)}
            </Link>
          )}
        </div>

        {/* Product Title */}
        <div className="product-title mb-3 flex-shrink-0">
          <Link to={`/product/${id}`} className="hover:text-blue-600 transition-colors" title={name}>
            <h3 className="text-sm font-medium line-clamp-2 leading-tight">{name}</h3>
          </Link>
        </div>

        {/* Spacer to push content to bottom */}
        <div className="flex-1"></div>

        {/* Rating and Price at bottom */}
        <div className="price-section flex-shrink-0">
          <div className="flex items-center mb-2">
            <Rating name="product-rating" value={rating} precision={0.5} size="small" readOnly className="text-amber-400" />
            {reviewCount > 0 && (
              <span className="text-xs text-gray-500 ml-1">({reviewCount})</span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {oldPrice && (
              <span className="text-gray-500 line-through text-sm">₹{oldPrice.toFixed(2)}</span>
            )}
            <span className="text-red-600 font-bold text-base">₹{price.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;
