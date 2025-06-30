const FarmerProduct = require("../models/farmerProducts");
const User = require("../models/users");
// const mongoose = require("mongoose");
const deleteFile = require("../config/deleteFile");

const createFarmerProduct = async (req, res) => {
  try {
    const { id } = req.params; // Farmer ki ID
    const { name, category, description, price, unit, quantity, minOrderQty, maxOrderQty, varieties } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Farmer ID is required" });
    }

    if (!name || !category || !price || !quantity) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 🧠 Check if farmer already has 7 or more products
    const existingProductCount = await FarmerProduct.countDocuments({ farmer: id });
    if (existingProductCount >= 7) {
      return res.status(403).json({
        message: "❌ Product limit reached. You can only add up to 7 products.",
      });
    }

    const images = Object.keys(req.files || {})
      .map((key) => ({
        key,
        filename: req.files[key][0]?.filename,
      }))
      .filter((img) => img.filename);

    const productData = { name, category, description, price, unit, quantity, minOrderQty, maxOrderQty, varieties: varieties || [], images, farmer: id };

    const newProduct = await FarmerProduct.create(productData);

    res.status(201).json({
      message: "✅ Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// const getAllFarmerProducts = async (req, res) => {
//   try {
//     const {
//       page = 1,
//       limit = 10,
//       category,
//       city,
//       searchTerm,
//       sortBy,
//     } = req.query;

//     const pageNumber = parseInt(page);
//     const limitNumber = parseInt(limit);

//     // Build the filter object
//     const filter = {
//       approved: true, // ✅ Only show available products
//     };

//     if (category && category !== "all") {
//       filter.category = category;
//     }
//     if (city && city !== "all") {
//       filter.city = city;
//     }
//     if (searchTerm) {
//       filter.name = { $regex: searchTerm, $options: "i" }; // Case-insensitive search
//     }

//     let sort = {}; // Define sort object

//     // Conditionally apply sorting
//     if (sortBy === "price_asc") {
//       sort = { price: 1 }; // Sort by price ascending
//     } else if (sortBy === "price_desc") {
//       sort = { price: -1 }; // Sort by price descending
//     }

//     // Count the total number of products matching the filter
//     const totalProducts = await FarmerProduct.countDocuments(filter);

//     const skip = (pageNumber - 1) * limitNumber;
//     const products = await FarmerProduct.find(filter)
//       .populate(
//         "farmer",
//         "_id profileImage firstName lastName role isVerified profileComplete farmerDetails.farmLocation"
//       )
//       .limit(limitNumber)
//       .skip(skip)
//       .sort(sort); // Apply the sort object

//     res.status(200).json({
//       message: "All farmer products fetched successfully",
//       total: totalProducts,
//       page: Number(page),
//       totalPages: Math.ceil(totalProducts / limitNumber),
//       products,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };
//  specifically for unapproved products
const getAllFarmerProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      city,
      searchTerm,
      sortBy,
    } = req.query;

    console.log('city', city)

    // Validate and parse pagination parameters
    const pageNumber = Math.max(1, parseInt(page) || 1);
    const limitNumber = Math.max(1, Math.min(100, parseInt(limit) || 10)); // Cap limit at 100

    // Build the aggregation pipeline
    const pipeline = [];

    // Match approved products
    pipeline.push({
      $match: { approved: true },
    });

    // Lookup to join with users collection
    pipeline.push({
      $lookup: {
        from: 'users', // Matches Mongoose's collection name for User model
        localField: 'farmer',
        foreignField: '_id',
        as: 'farmer',
      },
    });

    // Unwind the farmer array
    pipeline.push({
      $unwind: '$farmer',
    });

    // Build filter conditions
    const matchConditions = {};

    if (category && category !== 'all') {
      matchConditions.category = category;
    }
    if (city && city !== 'all' && city.trim()) {
      matchConditions['farmer.city'] = { $regex: `^${city}$`, $options: 'i' }; // Case-insensitive exact match
    }
    if (searchTerm && searchTerm.trim()) {
      matchConditions.name = { $regex: searchTerm, $options: 'i' }; // Case-insensitive search
    }

    // Add match stage for additional filters
    if (Object.keys(matchConditions).length > 0) {
      pipeline.push({
        $match: matchConditions,
      });
    }

    // Sorting
    let sort = {};
    if (sortBy === 'price_asc') {
      sort = { price: 1 };
    } else if (sortBy === 'price_desc') {
      sort = { price: -1 };
    }
    if (Object.keys(sort).length > 0) {
      pipeline.push({
        $sort: sort,
      });
    }

    // Facet for pagination and total count
    pipeline.push({
      $facet: {
        metadata: [
          { $count: 'total' },
          {
            $addFields: {
              page: pageNumber,
              totalPages: { $ceil: { $divide: ['$total', limitNumber] } },
            },
          },
        ],
        data: [
          { $skip: (pageNumber - 1) * limitNumber },
          { $limit: limitNumber },
          {
            $project: {
              name: 1,
              description: 1,
              category: 1,
              price: 1,
              unit: 1,
              quantity: 1,
              minOrderQty: 1,
              maxOrderQty: 1,
              varieties: 1,
              images: 1,
              approved: 1,
              availability: 1,
              bestProduct: 1,
              createdAt: 1,
              updatedAt: 1,
              farmer: {
                _id: 1,
                profileImage: 1,
                firstName: 1,
                lastName: 1,
                role: 1,
                isVerified: 1,
                profileComplete: 1,
                city: 1, // Include city in response
                'farmerDetails.farmLocation': 1,
              },
            },
          },
        ],
      },
    });

    // Execute the aggregation
    const result = await FarmerProduct.aggregate(pipeline);

    // Extract metadata and data
    const totalProducts = result[0].metadata[0]?.total || 0;
    const products = result[0].data || [];

    res.status(200).json({
      message: 'All farmer products fetched successfully',
      total: totalProducts,
      page: pageNumber,
      totalPages: result[0].metadata[0]?.totalPages || 0,
      products,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getPendingProducts = async (req, res) => {
  try {
    const filter = { approved: false }; // <-- Key change: only get unapproved
    const unapprovedProducts = await FarmerProduct.find(filter)
      .populate(
        "farmer",
        "_id profileImage firstName lastName role isVerified profileComplete farmerDetails.farmLocation"
      );

    res.status(200).json({
      message: "Unapproved farmer products fetched successfully",
      products: unapprovedProducts,
    });

  } catch (error) {
    // Standard error handling
    console.error("Error fetching unapproved farmer products:", error); // Log the error for debugging
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
const getFarmerProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await FarmerProduct.findById(id).populate(
      "farmer",
      "_id profileImage firstName lastName email role farmerDetails address city country province"
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product fetched successfully",
      product,
    });
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
const updateFarmerProduct = async (req, res) => {
  try {
    const userData = req.user;
    console.log("userData", userData);
    const { id } = req.params;
    const existingProduct = await FarmerProduct.findById(id);

    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const updateData = { ...req.body }; // Start with all other product updates

    // console.log("Uploaded Files:", req.files); // Log uploaded files for debugging
    // console.log("Existing Images:", existingProduct.images); // Log existing images for debugging

    if (req.files) {
      // 1. Make a copy of the existing images array to modify
      let updatedImages = [...existingProduct.images];

      // 2. Loop through each uploaded file (from frontend form fields)
      for (const key in req.files) {
        // 'key' is the field name (e.g., 'image1', 'profileImage')
        const fileArray = req.files[key]; // Multer gives an array of files for each field (even if maxCount: 1)
        const filename = fileArray[0]?.filename; // Get the filename of the uploaded file

        if (!filename) {
          continue; // Skip to the next file if no filename (shouldn't happen usually, but good to check)
        }

        // 3. Check if an image with this 'key' already exists in our updatedImages array
        const existingImageIndex = updatedImages.findIndex(
          (img) => img.key === key
        );

        if (existingImageIndex !== -1) {
          // 4a. If an image with this 'key' exists, replace its filename
          updatedImages[existingImageIndex].filename = filename;
          // console.log(`Replaced image: ${key}`);
        } else {
          // 4b. If no image with this 'key' exists, add a new image object
          updatedImages.push({ key: key, filename: filename });
          // console.log(`Added new image: ${key}`);
        }
      }

      // 5. Update the 'images' field in our update data with the modified 'updatedImages' array
      updateData.images = updatedImages;
    }

    console.log("updateData", updateData);

    // 6. Finally, update the product in the database using findByIdAndUpdate
    const updatedProduct = await FarmerProduct.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error); // Log full error to server console for debugging
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// DELETE a product and its associated images
const deleteFarmerProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const productToDelete = await FarmerProduct.findById(id);

    if (!productToDelete) {
      return res.status(404).json({ message: "Product not found" });
    }

    const filenamesToDelete =
      productToDelete.images?.map((img) => img.filename).filter(Boolean) || [];

    const deletionResult = await FarmerProduct.findByIdAndDelete(id);

    if (!deletionResult) {
      return res
        .status(500)
        .json({ message: "Database deletion failed unexpectedly." });
    }

    filenamesToDelete.forEach((filename) => {
      console.log("Attempting to delete associated image files...", filename);
      deleteFile(filename);
    });

    res
      .status(200)
      .json({ message: "Product and associated images deleted successfully" });
  } catch (error) {
    console.error(`Server error during product deletion for ID: ${id}:`, error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// GET all products by a specific farmer
const getFarmerProductsByUserId = async (req, res) => {
  try {
    const { farmerId } = req.params;
    console.log("Received ID:", farmerId);

    const farmer = await User.findById(farmerId).select(
      "_id profileImage firstName lastName email role farmerDetails address city country province"
    );

    if (!farmer) {
      return res.status(404).json({ message: "Invalid Farmer Id" });
    }

    const products = await FarmerProduct.find({ farmer: farmerId }).populate(
      "farmer",
      "_id profileImage firstName lastName email role farmerDetails address city country province"
    );

    res.status(200).json({
      message: "Farmer's products fetched successfully",
      farmer,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// GET summarized product details for a specific farmer
const getFarmerProductsDetails = async (req, res) => {
  try {
    const { farmerId } = req.params;
    console.log("Received ID:", farmerId);

    const farmer = await User.findById(farmerId);
    if (!farmer) {
      return res.status(404).json({ message: "Invalid Farmer Id" });
    }

    const products = await FarmerProduct.find({ farmer: farmerId });
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentProducts = products.filter((p) => {
      const date = p.updatedAt || p.createdAt;
      return date && new Date(date) >= sevenDaysAgo;
    });

    const productsDetails = {
      TotalCount: products.filter((p) => p.availability).length,
      approvedCount: products.filter((p) => p.approved).length,
      bestProductCount: products.filter((p) => p.bestProduct).length,
      latestCount: products.length,
      recentProducts, // Optional: can be removed if you don’t need to return actual products
    };

    console.log(productsDetails);
    res.status(200).json({
      message: "Farmer's products details fetched successfully",
      productsDetails,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
const deleteProductImage = async (req, res) => {
  try {
    const { productId } = req.params;
    const { imageKey } = req.body; // Key to delete (e.g., 'image2')

    console.log(
      `--- Starting deleteProductImage for product: ${productId}, imageKey: ${imageKey} ---`
    ); // Log start

    if (!imageKey) {
      console.log("Error: Image key is missing in the request body."); // Log error condition
      return res.status(400).json({ message: "Image key is required." });
    }

    // 1. Find the product
    console.log(`Step 1: Finding product with ID: ${productId}`);
    const product = await FarmerProduct.findById(productId);
    if (!product) {
      console.log(`Error: Product not found for ID: ${productId}`); // Log error condition
      return res.status(404).json({ message: "Product not found" });
    }
    console.log("Step 1: Product found.");
    // console.log("Initial product images:", JSON.stringify(product.images)); // Optional: Log initial state if needed

    const imageToDelete = product.images.find((img) => img.key === imageKey);
    if (!imageToDelete) {
      // Already deleted or key wrong, return current state
      console.warn(
        `Warning: Image with key ${imageKey} not found for deletion in product ${productId}. Might be already deleted.`
      );
      return res.status(200).json({
        message: "Image not found or already deleted.",
        product: product,
      });
    }
    console.log(
      `Found image to delete with key ${imageKey} and filename ${imageToDelete.filename}`
    );

    const filenameToDelete = imageToDelete.filename;

    // 2. Filter out the image to be deleted
    console.log("Step 2: Filtering out the image to be deleted.");
    let remainingImages = product.images.filter((img) => img.key !== imageKey);
    // console.log("Remaining images after filter:", JSON.stringify(remainingImages)); // Optional: Log intermediate step

    // 3. Re-key the remaining images sequentially
    console.log("Step 3: Re-keying the remaining images sequentially.");
    const rekeyedImages = remainingImages.map((img, index) => {
      const newKey = `image${index + 1}`; // Calculate new key based on new position
      console.log(`Mapping index ${index} to new key ${newKey} for filename ${img.filename}`); // Log mapping detail
      // Return a new object to avoid modifying original potentially
      return {
        // IMPORTANT: Ensure all necessary fields from your schema are spread here
        _id: img._id, // Keep original subdocument ID if it exists and is needed
        filename: img.filename, // Keep filename
        // ... any other fields in your image subdocument schema ...
        key: newKey, // Assign the new sequential key LAST to overwrite old one
      };
    });

    // CRITICAL LOG 1: Log the array we intend to save
    console.log(
      "Step 3 Result: Intended re-keyed images array for DB update:",
      JSON.stringify(rekeyedImages, null, 2)
    );

    // 4. Update the product in the database with the re-keyed array
    const updateOperation = { $set: { images: rekeyedImages } }; // Define the update operation
    console.log(`Step 4: Attempting DB update for productId: ${productId}`);
    console.log(
      "Step 4: Update operation object:",
      JSON.stringify(updateOperation, null, 2)
    ); // Log the exact update object

    const updatedProduct = await FarmerProduct.findByIdAndUpdate(
      productId,
      updateOperation, // Use the defined operation
      { new: true } // Return the modified document
    );

    // Check if the update operation returned a document
    if (!updatedProduct) {
      // This indicates the findByIdAndUpdate failed to find the document OR failed the update
      console.error(
        `Error: findByIdAndUpdate did not return an updated product for ID: ${productId}. The product might have been deleted concurrently, or the update failed.`
      );
      return res.status(404).json({
        message:
          "Product not found during final update attempt, or update failed.",
      });
    }
    console.log(
      "Step 4: DB update successful (findByIdAndUpdate returned a document)."
    );

    // CRITICAL LOG 2: Log the actual updated product returned by Mongoose
    console.log(
      "Step 4 Result: Updated product object returned from DB:",
      JSON.stringify(updatedProduct, null, 2)
    );

    // 5. Physically delete the file (after successful DB update)
    console.log(
      `Step 5: Attempting to delete physical file: ${filenameToDelete}`
    );
    deleteFile(filenameToDelete); // Assuming deleteFile handles its own logging/errors

    console.log(
      `--- Finishing deleteProductImage for product: ${productId} successfully ---`
    ); // Log success end

    res.status(200).json({
      message: `Image (${filenameToDelete || imageKey
        }) deleted and remaining images re-keyed.`,
      product: updatedProduct, // Send back the updated product
    });
  } catch (error) {
    console.error(
      `--- ERROR in deleteProductImage for product: ${req.params.productId}, imageKey: ${req.body?.imageKey} ---`
    ); // Log error start
    console.error("Full error object:", error); // Log the full error
    res.status(500).json({
      message: "Server error during image deletion/re-keying.",
      error: error.message,
    });
  }
};
const getLatestFarmerProducts = async (req, res) => {
  try {
    const filter = {
      approved: true,
    };

    const products = await FarmerProduct.find(filter)
      .sort({ timestamp: -1 }) // Sort by newest first
      .limit(7) // Only 7 latest
      .populate(
        "farmer",
        "_id profileImage firstName lastName role isVerified profileComplete farmerDetails.farmLocation"
      );

    res.status(200).json({
      message: "Latest farmer products fetched successfully",
      products,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
const getFarmersBestProducts = async (req, res) => {
  try {
    const filter = {
      bestProduct: true,
    }
    const products = await FarmerProduct.find(filter).limit(7).populate("farmer", "_id profileImage firstName lastName role isVerified profileComplete farmerDetails.farmLocation")
    res.status(200).json({ message: 'Best farmer products fetched successfully', products })
  }
  catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}


module.exports = {
  createFarmerProduct,
  getAllFarmerProducts,
  getPendingProducts,
  getFarmerProductById,
  updateFarmerProduct,
  deleteFarmerProduct,
  getFarmerProductsByUserId,
  getFarmerProductsDetails,
  deleteProductImage,
  getLatestFarmerProducts,
  getFarmersBestProducts,
};
