// Simple rate limiting implementation
const rateLimiter = (function () {
  let lastCallTime = 0;
  const minInterval = 100; // Minimum time between calls in milliseconds

  return function (fn) {
    return function (...args) {
      const now = Date.now();
      if (now - lastCallTime >= minInterval) {
        lastCallTime = now;
        return fn(...args);
      } else {
        return new Promise((resolve) => {
          setTimeout(() => {
            lastCallTime = Date.now();
            resolve(fn(...args));
          }, minInterval - (now - lastCallTime));
        });
      }
    };
  };
})();

export const callLanguageModel = async (query, context = {}) => {
  console.log("previous_nodes_titles:", context.previous_nodes_titles);
  console.log("previous_node_content:", context.previous_node_content);
  console.log("initial_query:", context.initial_query);
  console.log("current_query:", query);

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      body: JSON.stringify({ query, context }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error calling language model: ${error.message}`);
    return {
      html_content:
        "<div class='container mx-auto p-4'>An error occurred while processing your request. Please try again.</div>",
      follow_up_questions: [],
      image_query: [],
      mermaid_code: "",
    };
  }
};

export const fetchImageUrl = rateLimiter(async function (
  query,
  maxAttempts = 5
) {
  const searchWikipedia = async (query) => {
    const url = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(
      query
    )}&limit=1&namespace=0&format=json&origin=*`;
    console.log(`Searching Wikipedia for query: ${query}`);
    const response = await fetch(url);
    const data = await response.json();
    console.log(`Wikipedia search response: ${JSON.stringify(data, null, 2)}`);
    if (data[1].length > 0) {
      return data[1][0];
    }
    return null;
  };

  const getWikipediaImage = async (title) => {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
      title
    )}&prop=pageimages&piprop=original&format=json&origin=*`;
    console.log(`Fetching image for Wikipedia page: ${title}`);
    const response = await fetch(url);
    const data = await response.json();
    console.log(`Images response: ${JSON.stringify(data, null, 2)}`);

    const page = Object.values(data.query.pages)[0];
    if (page.original && page.original.source) {
      return page.original.source;
    }
    return null;
  };

  try {
    const title = await searchWikipedia(query);
    if (!title) {
      console.log(`No page found for the query: ${query}`);
      return null;
    }
    console.log(`Page title found: ${title}`);

    const imageUrl = await getWikipediaImage(title);
    if (imageUrl) {
      console.log(`Image URL found: ${imageUrl}`);
      return imageUrl;
    } else {
      console.log(`No image found for the page: ${title}`);
    }
  } catch (error) {
    console.error(
      `Error fetching image for query '${query}': ${error.message}`
    );
  }

  return null;
});
