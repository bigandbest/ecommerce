import { useState, useEffect } from "react";
import PropTypes from "prop-types";

const ProfileAvatar = ({
  imageUrl,
  name,
  size = "md",
  showOnlineIndicator = false,
  onClick,
  className = "",
}) => {
  const [imgError, setImgError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setImgError(false);
    setIsLoaded(false);
  }, [imageUrl]);

  const sizes = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleImageError = () => {
    setImgError(true);
    setIsLoaded(true);
  };

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  const baseClasses = `
    ${sizes[size]} 
    rounded-full 
    flex 
    items-center 
    justify-center 
    relative 
    overflow-hidden
    ${
      onClick
        ? "cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all"
        : ""
    }
    ${className}
  `;

  return (
    <div className={baseClasses} onClick={onClick}>
      {imageUrl && !imgError ? (
        <>
          <img
            src={imageUrl}
            alt={name || "Profile"}
            className={`w-full h-full object-cover transition-opacity duration-200 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
          {!isLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
              {getInitials(name)}
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
          {getInitials(name)}
        </div>
      )}

      {/* Online Indicator */}
      {showOnlineIndicator && (
        <div className="absolute -bottom-0 -right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
      )}
    </div>
  );
};

ProfileAvatar.propTypes = {
  imageUrl: PropTypes.string,
  name: PropTypes.string,
  size: PropTypes.oneOf(["xs", "sm", "md", "lg", "xl"]),
  showOnlineIndicator: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default ProfileAvatar;
