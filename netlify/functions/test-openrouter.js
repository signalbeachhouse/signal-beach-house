exports.handler = async function (event, context) {
  const { default: fetch } = await import("node-fetch");
  
  try {
    const openRouterKey = process.env.VITE_OPENROUTER_API_KEY;
    
    if (!openRouterKey) {
      return {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
        body: JSON.stringify({ error: "No OpenRouter API key found" })
      };
    }
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistralai/mistral-medium",
        messages: [{ role: "user", content: "Hello" }],
        temperature: 0.7,
      }),
    });

    const result = await response.text();
    
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      body: JSON.stringify({ 
        status: response.status,
        response: result,
        hasKey: !!openRouterKey
      })
    };
    
  } catch (err) {
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message })
    };
  }
};