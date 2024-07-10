import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey:
    "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",
});

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { query, context } = JSON.parse(req.body);

    const prompt = `
    You are an AI assistant tasked with generating content for a node-based exploration tool. Your goal is to provide informative, engaging, and progressively detailed responses to user queries, allowing for in-depth exploration of topics. You will receive the following inputs:

    <previous_nodes_titles>${
      context.previous_nodes_titles || ""
    }</previous_nodes_titles>
    <previous_node_content>${
      context.previous_node_content || ""
    }</previous_node_content>
    <initial_query>${context.initial_query || query}</initial_query>
    <current_query>${query}</current_query>

    Using these inputs, generate a response in JSON format with the following components:

    1. HTML Content:
    - Create informative and engaging HTML content that answers the current query.
    - Ensure the content is progressive, building upon the information from previous nodes.
    - If the current query is more basic than previous ones, provide a simpler explanation.
    - If the current query is more advanced, delve deeper into the topic.
    - Use appropriate HTML tags for structure (headings, paragraphs, lists, etc.).
    - Aim for clarity and coherence in your explanations.
    - Utilize Tailwind CSS classes to enhance the visual appeal and layout of the content.

    2. Follow-up Questions:
    - Generate 3-5 follow-up questions that naturally extend from the current content.
    - Ensure questions vary in complexity, from simpler to more advanced.
    - If the exploration is becoming very detailed, include some questions that zoom out to broader concepts.
    - If the exploration is very broad, include some questions that dive into specific details.

    3. Image Query:
    - Create a single image query related to the current content that is likely to exist in the dictionary.
    - Ensure the query is general enough to have a corresponding Wikipedia page. For example instead of "water cycle diagram" use "water cycle".

    Format your response as a JSON object with the following structure:

    {
      "html_content": "<div class='container mx-auto p-4'>... Your generated HTML content here ...</div>",
      "follow_up_questions": ["Question 1", "Question 2", "Question 3", ...],
      "image_queries": ["Image query"]
    }

    Ensure that your response is a valid JSON object. Do not include any explanation or additional text outside of this JSON structure.
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
