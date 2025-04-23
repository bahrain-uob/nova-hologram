const https = require("https");

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  let input;
  try {
    const body = JSON.parse(event.body || "{}");
    input = body.input?.trim();
    if (!input) throw new Error("Missing input");
    console.log("📥 Raw Input:", input);
  } catch (err) {
    console.error("❌ Invalid JSON body:", err.message);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  const isDOI = input.startsWith("10.");
  const url = isDOI
    ? `https://api.crossref.org/works/${encodeURIComponent(input)}`
    : `https://www.googleapis.com/books/v1/volumes?q=isbn:${input}`;

  console.log(`🔎 Detected ${isDOI ? "DOI" : "ISBN"}`);
  console.log("🌐 Fetching URL:", url);

  return new Promise((resolve) => {
    https
      .get(url, (res) => {
        let data = "";

        res.on("data", (chunk) => (data += chunk));

        res.on("end", () => {
          console.log("📦 Raw response received");

          try {
            const json = JSON.parse(data);
            console.log("✅ Parsed JSON:", json);

            if (!isDOI) {
              const book = json.items?.[0]?.volumeInfo;
              if (!book) throw new Error("No book found for this ISBN");

              return resolve({
                statusCode: 200,
                headers,
                body: JSON.stringify({
                  title: book.title || "Untitled",
                  authors: book.authors || [],
                  publish_date: book.publishedDate || "",
                  description: book.description || "",
                  publisher: book.publisher || "", // ✅ NEW
                  maturity_rating: book.maturityRating || "", // ✅ NEW
                  cover_image: book.imageLinks?.thumbnail || "",
                  page_count: book.pageCount || null,
                }),
              });
            }

            const work = json.message;
            console.log("🧾 DOI Work Object:", work);

            const title = Array.isArray(work.title)
              ? work.title[0] || "Untitled"
              : "Untitled";

            const authors = Array.isArray(work.author)
              ? work.author.map((a) => `${a.given || ""} ${a.family || ""}`.trim())
              : [];

            const publish_date =
              Array.isArray(work.published?.["date-parts"]) &&
              Array.isArray(work.published["date-parts"][0])
                ? work.published["date-parts"][0].join("-")
                : "";

            let number_of_pages = null;
            if (typeof work.page === "string" && work.page.includes("-")) {
              const [start, end] = work.page.split("-").map(Number);
              if (!isNaN(start) && !isNaN(end)) {
                number_of_pages = end - start + 1;
              }
            }

            return resolve({
              statusCode: 200,
              headers,
              body: JSON.stringify({
                title,
                authors,
                publish_date,
                publishers: work.publisher ? [work.publisher] : [],
                number_of_pages,
              }),
            });
          } catch (err) {
            console.error("❌ Processing Error:", err.message);
            console.log("⚠️ Raw data that caused error:", data);
            return resolve({
              statusCode: 500,
              headers,
              body: JSON.stringify({
                error: "Failed to process response",
                detail: err.message,
              }),
            });
          }
        });
      })
      .on("error", (err) => {
        console.error("❌ HTTPS Error:", err.message);
        return resolve({
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: "Request failed", detail: err.message }),
        });
      });
  });
};
