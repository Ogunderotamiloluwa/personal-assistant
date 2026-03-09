// AI Service - Handles external AI API calls
require('dotenv').config();

const HUGGING_FACE_API = 'https://api-inference.huggingface.co/models/gpt2';
const HUGGING_FACE_TOKEN = process.env.HUGGING_FACE_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

console.log('🔑 AI Service Initialization:');
console.log('   ✅ HUGGING_FACE_TOKEN:', HUGGING_FACE_TOKEN ? 'Loaded' : '❌ NOT LOADED');
console.log('   ✅ OPENAI_API_KEY:', OPENAI_API_KEY ? 'Loaded' : '❌ NOT LOADED');
if (OPENAI_API_KEY) {
  console.log('      Starts with:', OPENAI_API_KEY.substring(0, 20) + '...');
}

/**
 * Call Hugging Face API for text generation
 */
const callHuggingFaceAPI = async (prompt) => {
  try {
    if (!HUGGING_FACE_TOKEN) {
      console.warn('⚠️ HUGGING_FACE_TOKEN not configured');
      return null;
    }

    // Use AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(HUGGING_FACE_API, {
      headers: { Authorization: `Bearer ${HUGGING_FACE_TOKEN}` },
      method: 'POST',
      body: JSON.stringify({ inputs: prompt }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('💥 Hugging Face API error:', response.statusText);
      return null;
    }

    const result = await response.json();
    
    if (Array.isArray(result) && result.length > 0 && result[0].generated_text) {
      // Extract and clean the response
      let text = result[0].generated_text;
      // Remove the prompt from the response
      if (text.includes(prompt)) {
        text = text.replace(prompt, '').trim();
      }
      return text.substring(0, 500); // Limit to 500 chars
    }
    
    return null;
  } catch (error) {
    console.error('❌ Hugging Face API call failed:', error.message);
    return null;
  }
};

/**
 * Call OpenAI API for chat completion
 */
const callOpenAIAPI = async (messages, contextData) => {
  try {
    if (!OPENAI_API_KEY) {
      console.warn('⚠️ OPENAI_API_KEY not configured');
      return null;
    }

    console.log('🤖 Calling OpenAI API with key:', OPENAI_API_KEY.substring(0, 10) + '...');

    // Build system prompt with user context
    const systemPrompt = buildSystemPrompt(contextData);

    // Use AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: messages }
        ],
        temperature: 0.7,
        max_tokens: 500
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json();
      console.error('💥 OpenAI API error:', error);
      return null;
    }

    const result = await response.json();
    console.log('✅ OpenAI response received:', result.choices?.[0]?.message?.content?.substring(0, 50));
    
    if (result.choices && result.choices.length > 0) {
      return result.choices[0].message.content;
    }

    return null;
  } catch (error) {
    console.error('❌ OpenAI API call failed:', error.message);
    return null;
  }
};

/**
 * Build system prompt with user context
 */
const buildSystemPrompt = (contextData) => {
  const { userHabits, userRoutines, userTodos, userName } = contextData;
  
  return `You are a personal assistant AI named "Boss" speaking to ${userName || 'Boss'}. You are:
- Motivational and energetic
- Knowledgeable about the user's personal data (habits, routines, todos)
- Focused on productivity, health, and personal growth
- Encouraging but realistic

User Context:
- Active Habits: ${userHabits.length} (${userHabits.map(h => h.name).join(', ') || 'None'})
- Routines: ${userRoutines.length} (${userRoutines.map(r => r.name).join(', ') || 'None'})
- Pending Todos: ${userTodos.length} (${userTodos.map(t => t.title).join(', ') || 'None'})

When answering questions:
1. Reference their specific habits/routines/todos when relevant
2. Provide practical, actionable advice
3. Be motivational but authentic
4. Keep responses concise and conversational
5. Use casual language like "boss" or "chief"`;
};

/**
 * Get AI response - try APIs in order
 */
const getAIResponse = async (userMessage, contextData) => {
  try {
    // Try OpenAI first if configured
    if (OPENAI_API_KEY) {
      console.log('🤖 Trying OpenAI API...');
      const response = await callOpenAIAPI(userMessage, contextData);
      if (response) {
        console.log('✅ OpenAI response received');
        return response;
      }
    }

    // Try Hugging Face as fallback
    if (HUGGING_FACE_TOKEN) {
      console.log('🤖 Trying Hugging Face API...');
      const prompt = `${contextData.userName || 'Boss'} says: "${userMessage}"\n\nRespond as a motivational personal assistant:`;
      const response = await callHuggingFaceAPI(prompt);
      if (response) {
        console.log('✅ Hugging Face response received');
        return response;
      }
    }

    // If all APIs fail, return null (will trigger fallback)
    console.warn('⚠️ All AI APIs failed or not configured');
    return null;
  } catch (error) {
    console.error('❌ getAIResponse error:', error);
    return null;
  }
};

module.exports = {
  getAIResponse,
  buildSystemPrompt,
  callOpenAIAPI,
  callHuggingFaceAPI
};
