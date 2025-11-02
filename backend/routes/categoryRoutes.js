import express from "express";
import {
  getAllSubcategories,
  getSubcategoriesByCategory,
  getAllGroups,
  getGroupsBySubcategory,
  getCategoriesHierarchy,
  getSubcategoryDetails,
} from "../controller/categoryController.js";

const router = express.Router();

// Subcategories routes
router.get("/subcategories", getAllSubcategories);
router.get("/subcategories/category/:categoryId", getSubcategoriesByCategory);

// Groups routes
router.get("/groups", getAllGroups);
router.get("/groups/subcategory/:subcategoryId", getGroupsBySubcategory);

// Subcategory details route
router.get("/subcategory/:subcategoryId", getSubcategoryDetails);

// Full hierarchy route
router.get("/hierarchy", getCategoriesHierarchy);

export default router;
