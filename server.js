const axios = require("axios");
const express = require("express");
const app = express();

// 从环境变量读取配置
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

if (!TELEGRAM_TOKEN || !CHAT_ID) {
  console.error("❌ TELEGRAM_TOKEN 或 CHAT_ID 没有设置！");
}

// 健康检查：打开 Render 链接会看到这句话
app.get("/", (req, res) => {
  res.send("Kalshi Bot Running");
});

// 格式化单个市场数据
function formatMarket(m) {
  const yes = m.yes_bid ?? "-";
  const no = m.no_bid ?? "-";
  return `• ${m.ticker}: YES ${yes} / NO ${no}`;
}

// 调用 Kalshi API
async function checkKalshi() {
  try {
   const res = await axios.get(
  "https://api.elections.kalshi.com/trading-api/v1/markets",
  { timeout: 5000 }
); 
    const markets = res.data.markets || [];

    if (!markets.length) {
      console.log("⚠️ Kalshi 返回的 markets 为空");
      return;
    }

    // 取前 5 个市场
    const top = markets.slice(0, 5);
    const lines = top.map(formatMarket);

    const now = new Date().toISOString().replace("T", " ").slice(0, 19);

    let message = "📊 Kalshi 自动推送\n\n";
    message += `UTC 时间: ${now}\n\n`;
    message += lines.join("\n");

    await sendTelegram(message);
    console.log("✅ 已发送一条 Telegram 更新");
  } catch (err) {
    // 这里我们把详细错误打印出来
    const status = err.response?.status;
    const data = err.response?.data;
    console.error("❌ Kalshi API 错误：", status, data || err.message);
  }
}

// 发送消息到 Telegram
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
    console.error("❌ Telegram 发送失败：", err.message || err);
  }
}

// 每 60 秒调用一次 Kalshi
setInterval(checkKalshi, 60 * 1000);

// 启动 HTTP 服务（Render 需要端口）
app.listen(3000, () => {
  console.log("🚀 Server running on port 3000");
});
