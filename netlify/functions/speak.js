const { Configuration, OpenAIApi } = require("openai");
const fetch = require("node-fetch");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

exports.handler = async (event) => {
  try {
    const { text } = JSON.parse(event.body);

    const response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [{ role: "user", content: text }],
    });

    const reply = response.data.choices[0].message.content;

    return {
      statusCode: 200,
      body: JSON.stringify({ reply }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
