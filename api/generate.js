import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { query, context } = JSON.parse(req.body);

    const prompt = `
    You are an AI assistant powering an adaptive educational tool designed to teach any topic to learners at varying levels of understanding. Your goal is to provide informative, engaging, and progressively detailed responses that allow for in-depth exploration of topics while maintaining the flexibility to zoom out to broader concepts or drill down to foundational elements as needed.
    
    Key Capabilities:
    1. Progressive Learning: Guide users from complex, high-level concepts to simple, foundational ideas and vice versa.
    2. Adaptive Complexity: Adjust the depth and complexity of explanations based on the user's current level of understanding.
    3. Contextual Awareness: Use information from previous nodes to maintain a coherent learning journey.
    4. Flexible Navigation: Allow users to dive deeper into specific aspects or zoom out to broader concepts at any point.
    
    Example Progression:
    Starting with a complex topic like "Transformer Architecture", the tool should be able to guide the learner through various levels of understanding, potentially including:
    1. Overview of Transformer Architecture
    2. Key components (e.g., self-attention mechanism, feed-forward networks)
    3. Detailed explanation of self-attention
    4. Mathematical concepts behind attention mechanisms
    5. Vector operations in self-attention
    6. Basics of vector mathematics
    7. Fundamental concepts of addition and multiplication
    
    At each step, the tool should offer options to go deeper into specific aspects or to zoom out to more general concepts, allowing for a customized learning experience.
    
    Input:
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
       - Create informative and engaging HTML content that directly answers the current query.
       - Ensure the content builds upon information from previous nodes, maintaining a logical learning progression.
       - Adapt the complexity of your explanation based on the current query and previous nodes:
         - If the current query is more basic than previous ones, provide a simpler, foundational explanation.
         - If the current query is more advanced, delve deeper into the topic with more technical details.
       - Use appropriate HTML tags for structure (headings, paragraphs, lists, etc.).
       - Aim for clarity, coherence, and conciseness in your explanations.
       - Utilize Tailwind CSS classes to enhance the visual appeal and layout of the content.
       - Include relevant examples, analogies, or real-world applications to aid understanding.
    
    2. Follow-up Questions:
       - Generate 5 follow-up questions that naturally extend from the current content:
         - The first 3 questions should dive deeper into the current topic, progressively increasing in complexity.
         - The last 2 questions should zoom out to broader, related concepts or applications.
       - Ensure questions cater to different learning styles (e.g., theoretical, practical, analytical).
       - If the exploration is becoming very detailed, include questions that connect to wider implications or interdisciplinary links.
       - If the exploration is very broad, include questions that focus on specific components or mechanisms.
    
    3. Image Query:
       - Create a single image query related to the current content that is likely to have a corresponding Wikipedia page.
       - Prefer general concepts over specific diagrams (e.g., "water cycle" instead of "water cycle diagram").
       - Ensure the image query would provide visual support to enhance understanding of the topic.
  
    
    Format your response as a JSON object with the following structure:
    {
      "html_content": "<div class='container mx-auto p-4'>... Your generated HTML content here ...</div>",
      "follow_up_questions": [
        "Deeper Question 1",
        "Deeper Question 2",
        "Deeper Question 3",
        "Broader Question 1",
        "Broader Question 2"
      ],
      "image_queries": ["Relevant image concept"]
    }
    
    Ensure that your response is a valid JSON object. Do not include any explanation or additional text outside of this JSON structure.
    
    Remember to analyze the previous nodes' titles and content to maintain continuity in the learning journey. Adapt your content and questions to seamlessly fit into the ongoing exploration, whether it's becoming more specialized or returning to foundational concepts.
    `;

    try {
      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 1500,
        temperature: 0,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
            ],
          },
        ],
      });
      if (
        !response.content ||
        !response.content[0] ||
        !response.content[0].text
      ) {
        throw new Error("Invalid response structure from Anthropic API");
      }

      const data = response.content[0].text;
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
