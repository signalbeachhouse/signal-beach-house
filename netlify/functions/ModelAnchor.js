// netlify/functions/ModelAnchor.js

export const getModelConfig = () => ({
  model: "gpt-4-1106-preview",
  temperature: 0.7,
  top_p: 1.0,
  frequency_penalty: 0,
  presence_penalty: 0,
});
