async function test() {
  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=AIzaSyAmTAZ_XR7dN-F_Xhmv_abaI8EFZSSjNbs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: "hola" }] }]
      })
    });
    console.log("Status:", response.status);
    const data = await response.json();
    console.log("Data:", JSON.stringify(data));
  } catch (err) {
    console.error(err);
  }
}
test();
