import axios from "axios";

const API = "http://127.0.0.1:8000";

export async function askAI(question) {
  const response = await axios.post(`${API}/ai`, {
    question,
  });

  return response.data;
}