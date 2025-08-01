const os = require("os");
const fs = require("fs");
const path = require("path");

let canvasAvailable = true;
let createCanvas, loadImage, registerFont;

try {
  const canvasModule = require("canvas");
  createCanvas = canvasModule.createCanvas;
  loadImage = canvasModule.loadImage;
  registerFont = canvasModule.registerFont;
} catch (e) {
  canvasAvailable = false;
}

module.exports.config = {
  name: "uptime",
  version: "1.3.0",
  permission: 0,
  credits: "MR𒆜 MAHABUB𒆜 メ✓",
  description: "Shows bot uptime with image (if supported), otherwise text",
  prefix: true,
  category: "system",
  usages: "",
  cooldowns: 5,
};

module.exports.run = async function ({ api, event }) {
  const time = process.uptime();
  const days = Math.floor(time / (60 * 60 * 24));
  const hours = Math.floor((time / (60 * 60)) % 24);
  const minutes = Math.floor((time / 60) % 60);
  const seconds = Math.floor(time % 60);
  const uptime = `${days}d ${hours}h ${minutes}m ${seconds}s`;

  const totalMem = os.totalmem() / 1024 / 1024;
  const freeMem = os.freemem() / 1024 / 1024;
  const usedMem = totalMem - freeMem;
  const memory = `${usedMem.toFixed(2)}MB / ${totalMem.toFixed(2)}MB`;

  const cpu = os.cpus()[0].model;
  const arch = os.arch();
  const platform = `${os.platform()} (${arch})`;
  const now = new Date().toLocaleString("en-BD", { timeZone: "Asia/Dhaka" });

  // If canvas is not available, fallback to text only
  if (!canvasAvailable) {
    return api.sendMessage(
      `🌐 [ 𝗠𝗮𝗵𝗮𝗯𝘂𝗯 𝗦𝘆𝘀𝘁𝗲𝗺 𝗨𝗽𝘁𝗶𝗺𝗲 ]

🤖 𝗨𝗽𝘁𝗶𝗺𝗲: ${uptime}
💾 𝗥𝗔𝗠 𝗨𝘀𝗲𝗱: ${memory}
🧠 𝗖𝗣𝗨: ${cpu}
🔧 𝗣𝗹𝗮𝘁𝗳𝗼𝗿𝗺: ${platform}
📅 𝗧𝗶𝗺𝗲: ${now}

🔗 𝗕𝗼𝘁 𝗕𝘆: MR𒆜 MAHABUB𒆜 メ✓`,
      event.threadID,
      event.messageID
    );
  }

  // Continue with image generation if canvas is available
  try {
    registerFont(path.join(__dirname, "cache", "Poppins-Bold.ttf"), {
      family: "Poppins",
    });

    const bgPath = path.join(__dirname, "cache", "uptime.jpg");
    const outPath = path.join(__dirname, "cache", "uptime_result.png");

    if (!fs.existsSync(bgPath)) {
      return api.sendMessage("⚠️ Background image (uptime.jpg) not found in /cache folder.", event.threadID);
    }

    const bg = await loadImage(bgPath);
    const canvas = createCanvas(bg.width, bg.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(bg, 0, 0);
    ctx.font = "28px Poppins";
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "#000000";
    ctx.shadowBlur = 4;

    const lines = [
      `NAME: ${global.config.BOTNAME || "Unknown Bot"}`,
      `OWNER: MAHABUB RAHAMAN`,
      `CONTACT: +8801613356376`,
      `UPTIME: ${uptime}`,
      `RAM USED: ${memory}`,
      `CPU: ${cpu}`,
      `PLATFORM: ${platform}`,
      `TIME: ${now}`,
    ];

    let y = 100;
    for (const line of lines) {
      ctx.fillText(line, 50, y);
      y += 40;
    }

    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(outPath, buffer);

    return api.sendMessage({
      body: `🌐 𝗠𝗮𝗵𝗮𝗯𝘂𝗯 𝗦𝘆𝘀𝘁𝗲𝗺 𝗨𝗽𝘁𝗶𝗺𝗲`,
      attachment: fs.createReadStream(outPath),
    }, event.threadID, event.messageID);

  } catch (err) {
    console.error("Image generation error:", err);

    return api.sendMessage(
      `⚠️ Image generation failed. Showing text instead:\n\n` +
      `🤖 𝗨𝗽𝘁𝗶𝗺𝗲: ${uptime}\n` +
      `💾 𝗥𝗔𝗠: ${memory}\n` +
      `🧠 𝗖𝗣𝗨: ${cpu}\n` +
      `🔧 𝗣𝗹𝗮𝘁𝗳𝗼𝗿𝗺: ${platform}\n` +
      `📅 𝗧𝗶𝗺𝗲: ${now}\n\n` +
      `🔗 𝗕𝗼𝘁 𝗕𝘆: MR𒆜 MAHABUB𒆜 メ✓`,
      event.threadID,
      event.messageID
    );
  }
};
