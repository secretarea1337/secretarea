export const chatWithNexa = async (message: string) => {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    const data = await response.json();
    return data.text || "No response received.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I encountered a glitch in the matrix. Please try again later.";
  }
};