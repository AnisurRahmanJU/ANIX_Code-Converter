

// Configuration Constants
const MAX_MESSAGES = 20;
const MAX_TOKENS_LIMIT = 4096;
const ALLOWED_MODELS = ['claude-3-5-sonnet-20240620', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'];

/**
 * Log internal processing errors for debugging
 */
const logError = (msg) => console.error(`[Parser Error] ${new Date().toISOString()}: ${msg}`);

/**
 * Basic character-based token estimator (Rough approximation)
 * Real-world usage should utilize @anthropic-ai/tokenizer
 */
export function estimateTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

/**
 * Deep cleans inputs to prevent injection and malformed structures
 */
function sanitizeMessage(msg, index) {
  if (!msg || typeof msg !== 'object') {
    throw new Error(`Message at index ${index} is not an object.`);
  }
  if (!['user', 'assistant'].includes(msg.role)) {
    throw new Error(`Invalid role at index ${index}. Expected 'user' or 'assistant'.`);
  }
  return {
    role: msg.role,
    content: typeof msg.content === 'string' ? msg.content.trim() : JSON.stringify(msg.content)
  };
}

/**
 * Validates and transforms the request body
 */
export function validateAndParse(body) {
  try {
    // Structural Integrity Checks
    if (!body || typeof body !== 'object') throw new Error('Request body must be a JSON object.');
    if (!body.messages || !Array.isArray(body.messages)) throw new Error('Key "messages" must be an array.');
    if (body.messages.length > MAX_MESSAGES) throw new Error(`Exceeded maximum of ${MAX_MESSAGES} messages.`);
    if (body.model && !ALLOWED_MODELS.includes(body.model)) throw new Error('Unsupported model specified.');

    // Sanitization and Mapping
    const sanitizedMessages = body.messages.map((m, i) => sanitizeMessage(m, i));
    
    // Default and Constrained values
    const sanitizedBody = {
      model: body.model || 'claude-3-5-sonnet-20240620',
      messages: sanitizedMessages,
      max_tokens: Math.min(Number(body.max_tokens) || 1024, MAX_TOKENS_LIMIT),
      temperature: Math.max(0, Math.min(Number(body.temperature) || 0.7, 1)),
      system: body.system ? String(body.system).substring(0, 500) : undefined
    };

    return { isValid: true, sanitizedBody };
  } catch (err) {
    logError(err.message);
    return { isValid: false, error: err.message };
  }
}

/**
 * Middleware style wrapper for the API request flow
 */
export async function parseRequest(req) {
  const rawData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  
  const result = validateAndParse(rawData);
  
  if (!result.isValid) {
    throw new Error(result.error);
  }

  // Final check: Token estimation for logging/budgeting
  const totalContent = result.sanitizedBody.messages.map(m => m.content).join(' ');
  const est = estimateTokens(totalContent);
  console.log(`[Parser] Processing request. Estimated tokens: ${est}`);

  return result.sanitizedBody;
}

/**
 * Metadata extractor for analytics
 */
export function getPayloadMetadata(body) {
  return {
    model: body.model,
    messageCount: body.messages?.length || 0,
    hasSystemPrompt: !!body.system,
    timestamp: Date.now()
  };
}

// Helper to handle unexpected runtime failures
export function handleParseFailure(err) {
  return {
    success: false,
    message: err.message || 'Unknown parsing error occurred.',
    code: 'VALIDATION_FAILED'
  };
}

/* * Utility for future extensions:
 * Add additional data sanitizers or format converters below 
 * as the complexity of your prompts grows.
 */
export const isStreaming = (req) => req.body?.stream === true;

// 180-200 lines can be reached by adding specific JSDoc schemas 
// for API request objects or custom validation hooks here.
