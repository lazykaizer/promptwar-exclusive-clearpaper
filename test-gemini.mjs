

async function test() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log("API Key:", apiKey);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
  const body = {
    contents: [{ role: "user", parts: [{ text: "Hello" }] }],
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response:", text);
  } catch (err) {
    console.log("Error:", err);
  }
}

test();
