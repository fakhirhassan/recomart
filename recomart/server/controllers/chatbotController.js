const ApiResponse = require('../utils/apiResponse');
const geminiService = require('../services/geminiService');

const sendMessage = async (req, res, next) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message || !message.trim()) {
      const ApiError = require('../utils/apiError');
      throw ApiError.badRequest('Message is required');
    }

    const response = await geminiService.chatbotResponse(message, conversationHistory || []);

    return ApiResponse.success(res, { reply: response }, 'Response generated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage
};
