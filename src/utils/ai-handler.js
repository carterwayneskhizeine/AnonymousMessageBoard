const axios = require('axios');

/**
 * Generates an AI response based on a message and a user's comment.
 * @param {string} messageContent - The content of the original message.
 * @param {string} userComment - The user's comment that triggered the AI.
 * @returns {Promise<string|null>} The AI-generated response text, or null on error.
 */
async function getAIResponse(messageContent, userComment) {
  const { LITE_LLM_URL, LITE_LLM_API_KEY, LITE_LLM_MODEL } = process.env;

  if (!LITE_LLM_URL || !LITE_LLM_API_KEY || !LITE_LLM_MODEL) {
    console.error('LiteLLM environment variables are not fully configured.');
    return null;
  }

  const systemPrompt = `You are a helpful and insightful assistant on an anonymous message board. 
Your name is GoldieRill.
A user has posted a message, and another user has mentioned you in a comment. 
Your task is to provide a helpful and relevant response to the comment, based on the context of the original message.
Be concise and stay on topic.`;

  const userPrompt = `Original Message:
---
${messageContent}
---

User's Comment (that mentioned you):
---
${userComment}
---

Your response:`;

  try {
    const response = await axios.post(
      LITE_LLM_URL,
      {
        model: LITE_LLM_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LITE_LLM_API_KEY}`,
        },
      }
    );

    if (response.data && response.data.choices && response.data.choices.length > 0) {
      return response.data.choices[0].message.content.trim();
    } else {
      console.error('Received an unexpected response structure from LiteLLM:', response.data);
      return null;
    }
  } catch (error) {
    console.error('Error calling LiteLLM API:', error.response ? error.response.data : error.message);
    return null;
  }
}

module.exports = { getAIResponse };
