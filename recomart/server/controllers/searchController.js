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

    if (!q) {
      throw ApiError.badRequest('Search query is required');
    }

    let searchData = {};
    try {
      searchData = await geminiService.understandSearchQuery(q);
    } catch {
      searchData = {};
    }

    const term = (searchData.correctedQuery || q).trim();
    const tokens = term.split(/\s+/).filter((t) => t.length >= 2);
    const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const tokenRegexes = tokens.map((t) => new RegExp(escape(t), 'i'));
    if (tokenRegexes.length > 0) {
      filter.$and = tokenRegexes.map((rx) => ({
        $or: [
          { title: rx },
          { description: rx },
          { brand: rx },
          { tags: rx }
        ]
      }));
    }

    if (searchData.priceRange) {
      if (searchData.priceRange.min !== null || searchData.priceRange.max !== null) {
        filter.price = {};
        if (searchData.priceRange.min !== null && searchData.priceRange.min !== undefined) {
          filter.price.$gte = searchData.priceRange.min;
        }
        if (searchData.priceRange.max !== null && searchData.priceRange.max !== undefined) {
          filter.price.$lte = searchData.priceRange.max;
        }
      }
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('category', 'name slug'),
      Product.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return ApiResponse.success(res, {
      products,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1
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

    const queryParts = [];
    if (analysis.category && analysis.category !== 'N/A') queryParts.push(analysis.category);
    if (Array.isArray(analysis.keywords)) queryParts.push(...analysis.keywords.slice(0, 3));
    const query = queryParts.join(' ').trim();

    return ApiResponse.success(res, {
      query,
      analysis: {
        description: analysis.description,
        category: analysis.category,
        keywords: analysis.keywords
      }
    }, 'Image analyzed successfully');
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
