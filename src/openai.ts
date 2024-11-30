import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY!, // Your API key
  dangerouslyAllowBrowser: true, // Enables client-side access
});

export default openai;
