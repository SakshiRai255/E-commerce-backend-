import Product from "../modals/productSchema.js";
import fs from "fs";
import { deleteFile, s3FileUpload } from "../services/imageUpload.js";
import mongoose from "mongoose";
import asyncHandler from "../services/asyncHandler.js";
import customError from "../utils/customError.js";
import formidable from "formidable";
import config from "../config/index.js";

// Add Product

export const addProduct = asyncHandler(async (req, res) => {
  const form = formidable({
    multiples: true,
    keepExtensions: true,
  });
  form.parse(req, async function (err, fields, files) {
    try {
      if (err) {
        throw new customError(err.message || "Something went wrong", 500);
      }

      let productId = new mongoose.Types.ObjectId().toHexString();

      //   console.log(fields,file);

      //  check for fields

      if (
        !fields.name ||
        !fields.price ||
        !fields.description ||
        !fields.collectionId
      ) {
        throw new customError("Please fill all details", 500);
      }

      //  Handle images

      let imgArrayResp = Promise.all(
        Object.keys(files).map(async (fileKey, index) => {
          const element = files[fileKey];

          const data = fs.readFileSync(element.filepath);

          const upload = await s3FileUpload({
            bucketName: config.S3_BUCKET_NAME,
            key: `products/${productId}/photo_${index + 1}.png`,
            body: data,
            contentType: element.mimetype,
          });

          return {
            secure_url: upload.Location,
          };
        })
      );

      let imgArray = await imgArrayResp;

      const product = await Product.create({
        _id: productId,
        photos: imgArray,
        ...fields,
      });

      if (!product) {
        throw new customError("Product was not created", 400);
      }
      res.status(200).json({
        success: true,
        product,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Something went wrong",
      });
    }
  });
});

// get All Product

export const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({});

  if (!products) {
    throw new customError("No Product was found", 404);
  }
  res.status(200).json({
    success: true,
    products,
  });
});


// get Product by Id

export const getProductById = asyncHandler(async (req, res) => {

    const {id:productId} = req.params

  const product = await Product.findById({productId});

  if (!product) {
    throw new customError("No Product was found", 404);
  }
  res.status(200).json({
    success: true,
    product,
  });
});
