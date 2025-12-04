const axios = require("axios");
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Kalshi Bot Running");
});

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

// Kalshi API
async function checkKalshi() {
  try {
    const res = await axios.get("https://trading-api.kalshi.com/v1/markets");
    const data = res.data.markets;

    let message = "📊 Kalshi 自动推送：\n\n";

    data.slice(0, 5).forEach(m => {
      message += `• ${m.ticker}: ${m.yes_bid} / ${m.no_bid}\n`;
    });

    sendTelegram(message);

  } catch (err) {
    console.error("Kalshi API 错误：", err);
  }
}

async function sendTelegram(text) {
  try {
    await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
      {
        chat_id: CHAT_ID,
        text,
      }
    );
  } catch (err) {
    console.error("Telegram 发送失败：", err);
  }
}

setInterval(checkKalshi, 10000);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
