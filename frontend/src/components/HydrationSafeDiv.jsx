"use client";
import { useEffect, useState } from "react";

const HydrationSafeDiv = ({ children, className, ...props }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering on server
  if (!isMounted) {
    return null;
  }

  // Client-side only render
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};

export default HydrationSafeDiv;
