import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { query, context } = JSON.parse(req.body);

    const prompt = `
      You are an AI assistant tasked with generating content for a node-based exploration tool...
      ... (rest of your prompt here)
    `;

    const messages = [
      {
        role: "user",
        content: prompt,
      },
    ];

    try {
      const response = await anthropic.messages.create({
        max_tokens: 1500,
        messages: messages,
        model: "claude-3-5-sonnet-20240620",
      });

      const data = response.messages[0].content;
      const parsedResponse = JSON.parse(data);
      res.status(200).json(parsedResponse);
    } catch (error) {
      console.error(`Error calling language model: ${error.message}`);
      res.status(500).json({
        html_content:
          "<div class='container mx-auto p-4'>An error occurred while processing your request. Please try again.</div>",
        follow_up_questions: [],
        image_queries: [],
      });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
