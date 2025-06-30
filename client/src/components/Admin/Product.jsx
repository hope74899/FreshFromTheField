/* eslint-disable react/prop-types */

import { useAuth } from "../../auth/AuthToken";
import baseURL, { imageurl } from "../../baseurl";
import { FaRupeeSign } from "react-icons/fa6";
import UpdateProductModal from "./UpdateProductModal";
import { useState } from "react";
import axios from "axios";
import { FaMapMarkerAlt } from "react-icons/fa";

const Product = ({ product, onProductDelete }) => {
  const { role, token } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // Optional: For loading state
  const [deleteError, setDeleteError] = useState(null); // Optional: For error message
  const handleUpdate = () => {
    setIsModalOpen(true);
  };

  // console.log('product.farmer.profileImage', product.farmer.profileImage)
  const handleDelete = async () => {
    // 1. Confirm with the user (Important!)
    if (
      !window.confirm(
        `Are you sure you want to delete the product "${product.name}"? This action cannot be undone.`
      )
    ) {
      return; // Stop if the user cancels
    }

    // --- Basic Validation ---
    if (!token) {
      setDeleteError("Authentication token is missing. Cannot delete.");
      console.error("Delete Error: Token missing");
      return;
    }
    if (!product?._id) {
      setDeleteError("Product ID is missing. Cannot delete.");
      console.error("Delete Error: Product ID missing");
      return;
    }
    // --- End Validation ---

    setIsDeleting(true); // Set loading state
    setDeleteError(null); // Clear previous errors

    try {
      // 2. Make the API call
      const response = await axios.delete(
        `${baseURL}/api/farmerproduct/delete/${product._id}`, // Construct the correct URL
        {
          headers: {
            Authorization: `Bearer ${token}`, // Send the token
          },
        }
      );

      // 3. Handle successful deletion
      if (response.status === 200) {
        alert(`Product "${product.name}" deleted successfully!`); // Simple feedback
        // Notify the parent component so it can update the UI (e.g., remove from list)
        // Inside handleDelete, before the if(onProductDeleted)
        // console.log("Type of onProductDeleted prop:", typeof onProductDelete);
        if (onProductDelete) {
          onProductDelete();
        }
      } else {
        // Handle unexpected success status codes if necessary
        setDeleteError(
          response.data?.message ||
          `Failed to delete product. Status: ${response.status}`
        );
      }
    } catch (error) {
      // 4. Handle errors
      console.error("Error deleting product:", error);
      // Set a user-friendly error message
      setDeleteError(
        error.response?.data?.message ||
        error.message ||
        "An error occurred while deleting the product."
      );
    } finally {
      // 5. Reset loading state
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg shadow-sm overflow-hidden border border-gray-100 flex flex-col">
      {/* Product Image */}
      <img
        src={`${imageurl}${product.images[0]?.filename}`}
        alt={product.name}
        className="w-full h-40 object-cover object-center"
      />

      {/* Product Details */}
      <div className="p-3 flex flex-col">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 font-serif">
            {product.name}
          </h3>
          <div className="flex items-center space-x-1">
            <FaRupeeSign className="text-gray-500" />
            <span className="text-gray-800 font-semibold">{product.price}</span>
            <span className="text-gray-500 text-xs">/{product.unit}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-700 text-sm mt-2 line-clamp-2">
          {product.description}
        </p>
        {/* Farmer Details */}
        {product.farmer && (
          <div className="px-2 py-1 bg-gray-50 border-t border-gray-100">  {/* Reduced padding, same background as card */}
            <div className="flex items-center space-x-2">
              <img
                // src={`${imageurl}${product.farmer.profileImage}`}  // Use direct profile image
                // src={`${imageurl}${product.farmer.profileImage || '/blankProfile.png'}`} // Use direct profile image
                src={product.farmer.profileImage
                  ? `${imageurl}${product.farmer.profileImage}`
                  : '/blankProfile.png'}

                alt={product.farmer.firstName}
                className="w-6 h-6 rounded-full object-cover"  // Further reduced image size
              />
              <div>
                <p className="text-gray-800 text-xs font-medium">{product.farmer.firstName} {product.farmer.lastName}</p> {/* Reduced font size */}
                <p className="text-stone-600 text-xs flex items-center gap-1"> {/* Reduced font size */}
                  <FaMapMarkerAlt className="inline-block mr-1 text-yellow-400" /> {/* Icon color adjusted */}
                  {product.farmer.farmerDetails.farmLocation}
                </p>
              </div>
            </div>
          </div>
        )}
        {/* Availability & Role-Based Approved Status */}
        <div className="flex flex-wrap items-center justify-between pt-2">
          {/* ✅ Fix: w-auto issue (now expands properly) */}
          <p
            className={`text-xs font-bold px-2 py-1 rounded-full flex items-center ${product.availability
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
              }`}
          >
            {product.availability ? "Available" : "Out of Stock"}
          </p>

          {/* ✅ Show "Approved" status only if user is admin */}
          {role === "admin" && (
            <p
              className={`text-xs font-bold px-2 py-1 rounded-full flex items-center ${product.approved
                ? "bg-blue-600 text-white"
                : "bg-gray-500 text-white"
                }`}
            >
              {product.approved ? "Approved" : "Pending"}
            </p>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="p-3 flex items-center justify-between border-t border-gray-200">
        <button
          onClick={handleUpdate}
          className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-md transition duration-200 text-sm"
        >
          Update
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md transition duration-200 text-sm"
        >
          Delete
        </button>
      </div>
      {isModalOpen && (
        <UpdateProductModal
          product={product}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Product;
