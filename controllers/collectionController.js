import { Collection } from "mongoose";
import Collection from "../modals/collectionSchema";
import asyncHandler from "../services/asyncHandler.js";
import customError from "../utils/customError.js";

export const createCollection = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw new customError("Collection name is required", 400);
  }
  //  add this name to database

  const collection = await Collection.create({
    name,
  });
  res.status(200).json({
    success: true,
    message: "Collection  created success",
    collection,
  });
});

export const updateCollection = asyncHandler(async (req, res) => {
  const { id: collectionId } = req.params;

  const { name } = req.body;

  if (!name) {
    throw new customError("Collection name is required", 400);
  }

  let updateCollection = await Collection.findByIdAndUpdate(
    collectionId,
    {
      name,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updateCollection) {
    throw new customError("Collection not Found", 400);
  }
  res.status(200).json({
    success: true,
    message: "Collection updated successfully",
    updateCollection,
  });
});

//  delete collection

export const deleteCollection = asyncHandler(async (req, res) => {
  const { id: collectionId } = req.params;

  const CollectionToDelete = await Collection.findByIdAndDelete(collectionId);

  if (!CollectionToDelete) {
    throw new customError("Collection not found", 400);
  }

  CollectionToDelete.remove()

  //   send response to frontend
  res.status(200).json({
    success:true,
    message:"Collection deleted successfully"
  })
});

export const getAllCollection = asyncHandler(async(req,res)=>{
    const collections = await Collection.find()

    if(!collections){
        throw new customError("No Collection found",400)
    }

    res.status(200).json({
        success:true,
        collections
    })
})