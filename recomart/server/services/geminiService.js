const { model } = require('../config/gemini');
const AILog = require('../models/AILog');

class GeminiService {
  async classifyProduct(imageUrl, title, description) {
    const startTime = Date.now();
    const prompt = `You are a product classification AI for an e-commerce platform.

    Analyze this product:
    Title: ${title}
    Description: ${description}

    Return a JSON object with exactly these fields:
    {
      "category": "main category name (e.g., Electronics, Clothing, Home & Kitchen, Sports & Fitness, Beauty & Personal Care, Books & Stationery, Toys & Games, Automotive, Food & Grocery, Health & Wellness)",
      "subcategory": "specific subcategory",
      "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
      "brand_detected": "brand name if identifiable, otherwise empty string",
      "confidence": 0.95
    }

    Return ONLY valid JSON, no markdown, no explanation.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(text.replace(/```json\n?|```\n?/g, '').trim());

    await AILog.create({
      action: 'classification',
      input: `${title} - ${description}`,
      output: parsed,
      confidence: parsed.confidence,
      responseTimeMs: Date.now() - startTime
    });

    return parsed;
  }

  async generateTags(title, description, category) {
    const startTime = Date.now();
    const prompt = `Generate 8-10 relevant search tags for this product:
    Title: ${title}
    Description: ${description}
    Category: ${category}

    Return ONLY a JSON array of strings: ["tag1", "tag2", ...]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const tags = JSON.parse(text.replace(/```json\n?|```\n?/g, '').trim());

    await AILog.create({
      action: 'tagging',
      input: `${title} - ${description}`,
      output: tags,
      responseTimeMs: Date.now() - startTime
    });

    return tags;
  }

  async understandSearchQuery(query) {
    const startTime = Date.now();
    const prompt = `You are a search query analyzer for an e-commerce platform.

    User searched: "${query}"

    Extract the intent and return JSON:
    {
      "correctedQuery": "spell-corrected version of the query",
      "category": "likely product category or null",
      "priceRange": { "min": null, "max": null },
      "brand": "brand name if mentioned or null",
      "attributes": { "color": null, "size": null },
      "keywords": ["keyword1", "keyword2"]
    }

    Return ONLY valid JSON.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(text.replace(/```json\n?|```\n?/g, '').trim());

    await AILog.create({
      action: 'search',
      input: query,
      output: parsed,
      responseTimeMs: Date.now() - startTime
    });

    return parsed;
  }

  async analyzeProductImage(base64Image, mimeType) {
    const startTime = Date.now();
    const prompt = `Analyze this product image and return JSON:
    {
      "description": "brief product description",
      "category": "product category",
      "keywords": ["keyword1", "keyword2", "keyword3"],
      "color": "primary color",
      "type": "product type"
    }

    Return ONLY valid JSON.`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Image, mimeType } }
    ]);
    const text = result.response.text();
    const parsed = JSON.parse(text.replace(/```json\n?|```\n?/g, '').trim());

    await AILog.create({
      action: 'classification',
      input: 'image analysis',
      output: parsed,
      responseTimeMs: Date.now() - startTime
    });

    return parsed;
  }

  async chatbotResponse(message, conversationHistory = []) {
    const startTime = Date.now();
    const systemPrompt = `You are RecoMart's AI shopping assistant. You help customers with:
    - Finding products (suggest search terms or categories)
    - Answering product questions
    - Order status inquiries (ask them to check "My Orders" page)
    - General shopping guidance

    Keep responses concise (2-3 sentences max). Be friendly and helpful.
    If they ask about specific order details, tell them to check their "My Orders" page.
    If they want a product, suggest relevant search terms they can use.
    Never make up product names or prices.`;

    const contents = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: 'Understood! I am RecoMart\'s shopping assistant.' }] },
      ...conversationHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      })),
      { role: 'user', parts: [{ text: message }] }
    ];

    const result = await model.generateContent({ contents });
    const response = result.response.text();

    await AILog.create({
      action: 'chatbot',
      input: message,
      output: response,
      responseTimeMs: Date.now() - startTime
    });

    return response;
  }
}

module.exports = new GeminiService();
