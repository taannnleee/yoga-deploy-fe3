import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {FaRegHeart, FaHeart, FaSpinner} from "react-icons/fa";
import { API_URL } from "@/config/url";
interface LeftSideProps {
  product: any;
  currentVariant: any;
  setCurrentVariant: (variant: any) => void;
  selectedImage: string;
  setSelectedImage: (image: string) => void;
}

export const LeftSideProductDetail: React.FC<LeftSideProps> = ({ product, currentVariant, setCurrentVariant, selectedImage, setSelectedImage }) => {
  const [selectedImageLeft, setSelectedImageLeft] = useState(selectedImage || "");
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false); // State to track loading
  const accessToken = localStorage.getItem("accessToken");

  const handleVariantSelect = (variantType: string, value: string, image: string) => {
    const updatedVariant = {
      ...currentVariant,
      [variantType]: { value, image },
    };
    setCurrentVariant(updatedVariant);

    if (variantType === 'color') {
      setSelectedImageLeft(image);
      setSelectedImage(image);
    }
  };

  const handleFavoriteToggle = async () => {
    setLoading(true); // Start loading
    try {
      if (isFavorited) {
        // Call API to remove from wishlist
        const response = await fetch(`${API_URL}/api/wishlist/delete-wishlist-by-product-id/${product.id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          setIsFavorited(false);
        } else {
          console.error("Failed to remove from wishlist");
        }
      } else {
        // Call API to add to wishlist
        const response = await fetch(`${API_URL}/api/wishlist/add-wishlist`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ productId: product.id }),
        });

        if (response.ok) {
          setIsFavorited(true);
        } else {
          console.error("Failed to add to wishlist");
        }
      }
    } catch (error) {
      console.error("Error toggling wishlist status:", error);
    } finally {
      setLoading(false); // Stop loading after API call
    }
  };

  useEffect(() => {
    const checkWishlistStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/api/wishlist/get-wishlist-exists`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ productId: product.id }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.status === 200) {
            setIsFavorited(true); // Set favorite status if the status is 200
          }
        } else {
          console.error("Failed to check wishlist status");
        }
      } catch (error) {
        console.error("Error checking wishlist status:", error);
      }
    };

    if (product.id) {
      checkWishlistStatus();
    }

    if (product?.variants?.color) {
      const firstColor = Object.entries(product.variants.color)[0];
      if (firstColor) {
        const [value, image] = firstColor;
        setSelectedImageLeft(image);
        setSelectedImage(image);
        setCurrentVariant((prev) => ({
          ...prev,
          color: { value, image },
        }));
      }
    }
  }, [product.id, product.variants.color, setCurrentVariant, setSelectedImage, accessToken]);

  return (
    <div>
      <button
          className="flex top-0 right-0 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transform transition-transform duration-200 hover:scale-110"
          onClick={handleFavoriteToggle}
          disabled={loading} // Disable the button while loading
      >
        {loading ? (
            <FaSpinner className="animate-spin text-black w-6 h-6"/> // Show spinner while loading
        ) : (
            !isFavorited ? (
                <FaRegHeart className="text-black w-6 h-6"/>
            ) : (
                <FaHeart className="text-red-500 w-6 h-6"/>
            )
        )}
      </button>

      <Image
          src={selectedImage}
          alt={product?.title || ""}
          width={390}
          height={390}
          className="rounded-md"
      />

      <div className="mt-4 flex space-x-4 overflow-x-auto">
        {product?.variants?.color &&
            Object.entries(product.variants.color).map(([color, image], index) => (
                <div key={index} className="flex flex-col items-center"
                     onClick={() => handleVariantSelect('color', color, image)}>
                  <Image
                      src={image || '/path/to/fallback/image.jpg'}
                      alt={`${color} image`}
                width={84}
                height={84}
                className={`rounded-md cursor-pointer ${image === selectedImageLeft ? "border-2 border-red-500" : ""}`}
              />
            </div>
          ))}
      </div>
    </div>
  );
};
