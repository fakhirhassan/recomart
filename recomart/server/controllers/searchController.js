const Product = require('../models/Product');
const Category = require('../models/Category');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const geminiService = require('../services/geminiService');

const search = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 12 } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(50, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const filter = { isApproved: true, isActive: true };

    if (q) {
      const searchData = await geminiService.understandSearchQuery(q);

      filter.$text = { $search: searchData.correctedQuery || q };

      if (searchData.category) {
        const category = await Category.findOne({
          name: { $regex: searchData.category, $options: 'i' }
        });
        if (category) {
          filter.category = category._id;
        }
      }

      if (searchData.priceRange) {
        if (searchData.priceRange.min !== null || searchData.priceRange.max !== null) {
          filter.price = {};
          if (searchData.priceRange.min !== null) {
            filter.price.$gte = searchData.priceRange.min;
          }
          if (searchData.priceRange.max !== null) {
            filter.price.$lte = searchData.priceRange.max;
          }
        }
      }

      if (searchData.brand) {
        filter.brand = { $regex: searchData.brand, $options: 'i' };
      }

      if (searchData.keywords && searchData.keywords.length > 0) {
        filter.tags = { $in: searchData.keywords };
      }
    } else {
      throw ApiError.badRequest('Search query is required');
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('category', 'name slug'),
      Product.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return ApiResponse.success(res, {
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    }, 'Search results retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const imageSearch = async (req, res, next) => {
  try {
    if (!req.file) {
      throw ApiError.badRequest('Image file is required');
    }

    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;

    const analysis = await geminiService.analyzeProductImage(base64Image, mimeType);

    const filter = { isApproved: true, isActive: true };

    if (analysis.keywords && analysis.keywords.length > 0) {
      const searchTerms = analysis.keywords.join(' ');
      filter.$text = { $search: searchTerms };
    }

    if (analysis.category) {
      const category = await Category.findOne({
        name: { $regex: analysis.category, $options: 'i' }
      });
      if (category) {
        filter.category = category._id;
      }
    }

    const products = await Product.find(filter)
      .sort(filter.$text ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
      .limit(20)
      .populate('category', 'name slug');

    return ApiResponse.success(res, {
      products,
      analysis: {
        description: analysis.description,
        category: analysis.category,
        keywords: analysis.keywords
      }
    }, 'Image search results retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getSuggestions = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return ApiResponse.success(res, { suggestions: [] }, 'Suggestions retrieved successfully');
    }

    const products = await Product.find({
      title: { $regex: q, $options: 'i' },
      isApproved: true,
      isActive: true
    })
      .select('title slug')
      .limit(10);

    const suggestions = products.map((product) => ({
      title: product.title,
      slug: product.slug
    }));

    return ApiResponse.success(res, { suggestions }, 'Suggestions retrieved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  search,
  imageSearch,
  getSuggestions
};
