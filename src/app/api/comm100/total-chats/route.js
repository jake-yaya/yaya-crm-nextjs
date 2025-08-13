import { getTotalChatsRequestBody } from "../../../../data/comm100RequestData";

export async function POST(req) {
  const { startDate, endDate } = await req.json(); // assuming you're passing params in body

  const url = process.env.COMM100_URL;
  const username = process.env.COMM100_USERNAME;
  const password = process.env.COMM100_PASSWORD;

  if (!url || !username || !password) {
    return new Response(JSON.stringify({ error: "Missing env variables" }), { status: 500 });
  }
  const body = getTotalChatsRequestBody(startDate, endDate);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa(`${username}:${password}`),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    data.series.forEach((element) => {
      element.percentageOfBotOnlyChats = Math.round((element.botOnlyChats / element.chatsFromBotToOnlineAgent) * 100);
    });
    return new Response(JSON.stringify(data), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Failed to fetch chart data" }), {
      status: 500,
    });
  }
}
