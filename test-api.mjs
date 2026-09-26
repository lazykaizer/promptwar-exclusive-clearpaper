const docText = `This Agreement shall be for a period of 36 months commencing from 1st February 2024.`;
const body = {
  text: docText,
  section: "summary",
  role: "tenant",
  language: "english",
  jurisdiction: "india",
};

async function test() {
  try {
    const res = await fetch("http://localhost:3000/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response:", text);
  } catch (err) {
    console.log("Fetch Error:", err);
  }
}

test();
