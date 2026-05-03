export async function callAPI(
  task: string,
  text: string,
  length?: string
) {
  const response = await fetch("http://127.0.0.1:8000/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task, text, length }),
  });

  return response.json();
}
