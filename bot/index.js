const { Telegraf, Markup } = require("telegraf");
const { ethers } = require("ethers");
const cron = require("node-cron");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// ── Setup ──────────────────────────────────────────────
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
const provider = new ethers.JsonRpcProvider("https://testnet.hsk.xyz");

const LOAN_MANAGER_ADDRESS = "0x1f093A6C32e908e41A8f884581FE7443A403736d";
const LOAN_SBT_ADDRESS = "0x27D6797BE55D0b5976aBF624A9EDC35D0604Ce74";
const FAUCET_ADDRESS = "0xCaB6c9B74b202cc7E2c8A56078Bd87a09dd5038A";
const DAPP_URL = "https://trust-zk.vercel.app";

const LOAN_MANAGER_ABI = [
  "function getActiveLoan(address) view returns (tuple(uint256 amount, uint256 collateral, uint256 startTime, uint256 dueDate, uint8 tier, uint8 status))",
  "function getUserTier(address) view returns (uint8)",
  "function getLoanLimit(address) view returns (uint256)",
  "function getDaysUntilDue(address) view returns (uint256)",
  "function totalBorrowed(address) view returns (uint256)",
  "function totalRepaid(address) view returns (uint256)",
  "function blacklisted(address) view returns (bool)",
];

const LOAN_SBT_ABI = [
  "function getUserSBTCount(address) view returns (uint256)",
  "function getUserTokens(address) view returns (uint256[])",
];

const loanManager = new ethers.Contract(
  LOAN_MANAGER_ADDRESS,
  LOAN_MANAGER_ABI,
  provider
);
const loanSBT = new ethers.Contract(LOAN_SBT_ADDRESS, LOAN_SBT_ABI, provider);

// ── Helpers ────────────────────────────────────────────
const TIER_NAMES = ["None", "Bronze", "Silver", "Gold"];
const TIER_EMOJI = ["⬜", "🥉", "🥈", "🥇"];
const STATUS_NAMES = ["None", "Active", "Repaid", "Defaulted"];

async function getWallet(telegramId) {
  const { data } = await supabase
    .from("users")
    .select("wallet_address, display_name")
    .eq("telegram_id", telegramId.toString())
    .single();
  return data;
}

async function saveWallet(telegramId, walletAddress, username) {
  await supabase.from("users").upsert(
    {
      telegram_id: telegramId.toString(),
      wallet_address: walletAddress,
      display_name: username || null,
    },
    { onConflict: "telegram_id" }
  );
}

function formatHSK(wei) {
  return parseFloat(ethers.formatEther(wei)).toFixed(4) + " HSK";
}

function formatDate(timestamp) {
  return new Date(Number(timestamp) * 1000).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ── /start ─────────────────────────────────────────────
bot.start(async (ctx) => {
  const user = ctx.from;
  const existing = await getWallet(user.id);

  const name = existing?.display_name || user.first_name || "there";

  await ctx.reply(
    `🛡 *Welcome to Trust Protocol, ${name}!*\n\n` +
      `Trust is a ZK-powered lending protocol on HashKey Chain.\n` +
      `Borrow HSK tokens by proving you qualify — without revealing your data.\n\n` +
      `*Available Commands:*\n` +
      `🔗 /link — Link your wallet address\n` +
      `💰 /balance — Check your wallet balance\n` +
      `📋 /loan — View your active loan\n` +
      `📊 /tier — Check your borrowing tier\n` +
      `🏅 /sbts — View your Soulbound Tokens\n` +
      `📜 /history — View loan history\n` +
      `⏰ /remind — Enable loan reminders\n` +
      `🌐 /app — Open the Trust dApp\n` +
      `❓ /help — Show this message`,
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [Markup.button.url("🌐 Open Trust App", DAPP_URL)],
        [Markup.button.callback("🔗 Link My Wallet", "link_wallet")],
      ]),
    }
  );
});

// ── /help ──────────────────────────────────────────────
bot.help((ctx) => ctx.reply(
  `🛡 *Trust Protocol Bot Commands*\n\n` +
  `/link — Link your wallet address\n` +
  `/balance — Check wallet balance\n` +
  `/loan — View active loan details\n` +
  `/tier — Check your current tier\n` +
  `/sbts — View your Soulbound Tokens\n` +
  `/history — Loan repayment history\n` +
  `/remind — Enable loan reminders\n` +
  `/app — Open Trust dApp\n\n` +
  `_First time? Use /link to connect your wallet._`,
  { parse_mode: "Markdown" }
));

// ── /link ──────────────────────────────────────────────
bot.command("link", (ctx) => {
  ctx.reply(
    `🔗 *Link Your Wallet*\n\n` +
      `Send your wallet address (starting with 0x) to connect it to your Telegram account.\n\n` +
      `_Example: 0x6e6f9005aDAA32650AEF2319bFe5c62258E5a413_`,
    { parse_mode: "Markdown" }
  );
});

bot.action("link_wallet", (ctx) => {
  ctx.answerCbQuery();
  ctx.reply(
    `🔗 Send your wallet address (0x...) to link it to your account.`
  );
});

// ── /balance ───────────────────────────────────────────
bot.command("balance", async (ctx) => {
  const user = await getWallet(ctx.from.id);
  if (!user?.wallet_address) {
    return ctx.reply(
      `⚠️ No wallet linked yet.\nUse /link to connect your wallet first.`
    );
  }

  try {
    const balance = await provider.getBalance(user.wallet_address);
    const tier = await loanManager.getUserTier(user.wallet_address);
    const limit = await loanManager.getLoanLimit(user.wallet_address);
    const sbtCount = await loanSBT.getUserSBTCount(user.wallet_address);
    const isBlacklisted = await loanManager.blacklisted(user.wallet_address);

    await ctx.reply(
      `💰 *Wallet Balance*\n\n` +
        `Address: \`${user.wallet_address.slice(0, 8)}...${user.wallet_address.slice(-6)}\`\n` +
        `Balance: *${formatHSK(balance)}*\n\n` +
        `${TIER_EMOJI[tier]} Tier: *${TIER_NAMES[tier]}*\n` +
        `📈 Loan Limit: *${formatHSK(limit)}*\n` +
        `🏅 SBTs Earned: *${sbtCount.toString()}*\n` +
        `${isBlacklisted ? "🚫 Status: *BLACKLISTED*" : "✅ Status: *Good Standing*"}`,
      { parse_mode: "Markdown" }
    );
  } catch (err) {
    ctx.reply(`❌ Error fetching balance. Please try again.`);
    console.error(err);
  }
});

// ── /loan ──────────────────────────────────────────────
bot.command("loan", async (ctx) => {
  const user = await getWallet(ctx.from.id);
  if (!user?.wallet_address) {
    return ctx.reply(`⚠️ No wallet linked. Use /link first.`);
  }

  try {
    const loan = await loanManager.getActiveLoan(user.wallet_address);
    const status = Number(loan.status);

    if (status !== 1) {
      return ctx.reply(
        `📋 *No Active Loan*\n\n` +
          `You don't have an active loan right now.\n\n` +
          `Ready to borrow? Open the Trust app:`,
        {
          parse_mode: "Markdown",
          ...Markup.inlineKeyboard([
            [Markup.button.url("💸 Apply for Loan", `${DAPP_URL}/dashboard/borrow`)],
          ]),
        }
      );
    }

    const daysLeft = await loanManager.getDaysUntilDue(user.wallet_address);
    const urgency =
      Number(daysLeft) <= 3 ? "🚨" : Number(daysLeft) <= 7 ? "⚠️" : "✅";

    await ctx.reply(
      `📋 *Active Loan Details*\n\n` +
        `Amount: *${formatHSK(loan.amount)}*\n` +
        `Collateral: *${formatHSK(loan.collateral)}*\n` +
        `Tier: *${TIER_NAMES[Number(loan.tier)]}*\n` +
        `Due Date: *${formatDate(loan.dueDate)}*\n` +
        `${urgency} Days Remaining: *${daysLeft.toString()} days*\n\n` +
        `_Repay on time to earn your Soulbound Token!_`,
      {
        parse_mode: "Markdown",
        ...Markup.inlineKeyboard([
          [Markup.button.url("💳 Repay Now", `${DAPP_URL}/dashboard/loans`)],
          [Markup.button.url("📊 View Dashboard", DAPP_URL)],
        ]),
      }
    );
  } catch (err) {
    ctx.reply(`❌ Error fetching loan. Please try again.`);
    console.error(err);
  }
});

// ── /tier ──────────────────────────────────────────────
bot.command("tier", async (ctx) => {
  const user = await getWallet(ctx.from.id);
  if (!user?.wallet_address) {
    return ctx.reply(`⚠️ No wallet linked. Use /link first.`);
  }

  try {
    const tier = await loanManager.getUserTier(user.wallet_address);
    const limit = await loanManager.getLoanLimit(user.wallet_address);
    const sbtCount = await loanSBT.getUserSBTCount(user.wallet_address);

    const nextTierInfo =
      Number(tier) === 0
        ? "Repay 1 loan to reach Silver tier"
        : Number(tier) === 1
        ? `${3 - Number(sbtCount)} more SBTs needed for Gold tier`
        : "You are at the highest tier! 🎉";

    await ctx.reply(
      `${TIER_EMOJI[Number(tier)]} *Your Current Tier: ${TIER_NAMES[Number(tier)]}*\n\n` +
        `💰 Max Loan: *${formatHSK(limit)}*\n` +
        `🏅 SBTs Earned: *${sbtCount.toString()}*\n\n` +
        `📈 Next Tier: _${nextTierInfo}_\n\n` +
        `*Tier Requirements:*\n` +
        `🥉 Bronze → 0 SBTs → max 0.02 HSK\n` +
        `🥈 Silver → 1+ SBTs → max 0.05 HSK\n` +
        `🥇 Gold → 3+ SBTs → max 0.1 HSK`,
      { parse_mode: "Markdown" }
    );
  } catch (err) {
    ctx.reply(`❌ Error fetching tier. Please try again.`);
    console.error(err);
  }
});

// ── /sbts ──────────────────────────────────────────────
bot.command("sbts", async (ctx) => {
  const user = await getWallet(ctx.from.id);
  if (!user?.wallet_address) {
    return ctx.reply(`⚠️ No wallet linked. Use /link first.`);
  }

  try {
    const count = await loanSBT.getUserSBTCount(user.wallet_address);
    const tokens = await loanSBT.getUserTokens(user.wallet_address);

    if (Number(count) === 0) {
      return ctx.reply(
        `🏅 *No Soulbound Tokens Yet*\n\n` +
          `SBTs are minted when you repay a loan.\n` +
          `Each SBT improves your credit tier and borrowing limit.\n\n` +
          `_Repay your first loan to earn your Bronze SBT!_`,
        { parse_mode: "Markdown" }
      );
    }

    const tokenList = tokens
      .slice(0, 5)
      .map((id, i) => `🏅 SBT #${id.toString()} — Loan ${i + 1}`)
      .join("\n");

    await ctx.reply(
      `🏅 *Your Soulbound Tokens (${count.toString()} total)*\n\n` +
        `${tokenList}\n\n` +
        `_These tokens are non-transferable and build your on-chain credit history._`,
      {
        parse_mode: "Markdown",
        ...Markup.inlineKeyboard([
          [Markup.button.url("View All SBTs", `${DAPP_URL}/dashboard/sbt`)],
        ]),
      }
    );
  } catch (err) {
    ctx.reply(`❌ Error fetching SBTs. Please try again.`);
    console.error(err);
  }
});

// ── /history ───────────────────────────────────────────
bot.command("history", async (ctx) => {
  const user = await getWallet(ctx.from.id);
  if (!user?.wallet_address) {
    return ctx.reply(`⚠️ No wallet linked. Use /link first.`);
  }

  try {
    const borrowed = await loanManager.totalBorrowed(user.wallet_address);
    const repaid = await loanManager.totalRepaid(user.wallet_address);
    const sbtCount = await loanSBT.getUserSBTCount(user.wallet_address);

    await ctx.reply(
      `📜 *Loan History*\n\n` +
        `Total Borrowed: *${formatHSK(borrowed)}*\n` +
        `Total Repaid: *${formatHSK(repaid)}*\n` +
        `Loans Completed: *${sbtCount.toString()}*\n\n` +
        `_View full history on the dApp_`,
      {
        parse_mode: "Markdown",
        ...Markup.inlineKeyboard([
          [
            Markup.button.url(
              "📊 Full History",
              `${DAPP_URL}/dashboard/history`
            ),
          ],
        ]),
      }
    );
  } catch (err) {
    ctx.reply(`❌ Error fetching history. Please try again.`);
    console.error(err);
  }
});

// ── /remind ────────────────────────────────────────────
bot.command("remind", async (ctx) => {
  const user = await getWallet(ctx.from.id);
  if (!user?.wallet_address) {
    return ctx.reply(`⚠️ No wallet linked. Use /link first.`);
  }

  await supabase
    .from("users")
    .update({ reminders_enabled: true })
    .eq("telegram_id", ctx.from.id.toString());

  ctx.reply(
    `⏰ *Loan Reminders Enabled!*\n\n` +
      `You will receive alerts:\n` +
      `• 7 days before your loan is due\n` +
      `• 3 days before your loan is due\n` +
      `• On the day your loan is due\n\n` +
      `_Stay on top of repayments to protect your credit tier!_`,
    { parse_mode: "Markdown" }
  );
});

// ── /app ───────────────────────────────────────────────
bot.command("app", (ctx) => {
  ctx.reply(
    `🌐 *Trust Protocol dApp*\n\nOpen the full app to borrow, repay, and manage your loans.`,
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [Markup.button.url("🚀 Open Trust App", DAPP_URL)],
        [Markup.button.url("📊 Dashboard", `${DAPP_URL}/dashboard`)],
        [Markup.button.url("💸 Borrow", `${DAPP_URL}/dashboard/borrow`)],
      ]),
    }
  );
});

// ── Handle wallet address messages ─────────────────────
bot.on("text", async (ctx) => {
  const text = ctx.message.text.trim();

  // Detect wallet address
  if (text.startsWith("0x") && text.length === 42) {
    try {
      await saveWallet(
        ctx.from.id,
        text,
        ctx.from.username || ctx.from.first_name
      );

      const tier = await loanManager.getUserTier(text);
      const sbtCount = await loanSBT.getUserSBTCount(text);

      await ctx.reply(
        `✅ *Wallet Linked Successfully!*\n\n` +
          `Address: \`${text.slice(0, 8)}...${text.slice(-6)}\`\n` +
          `${TIER_EMOJI[Number(tier)]} Tier: *${TIER_NAMES[Number(tier)]}*\n` +
          `🏅 SBTs: *${sbtCount.toString()}*\n\n` +
          `Use /loan to check your active loan or /balance for full details.`,
        { parse_mode: "Markdown" }
      );
    } catch (err) {
      ctx.reply(`❌ Error linking wallet. Make sure the address is valid.`);
      console.error(err);
    }
    return;
  }

  // Unknown message
  ctx.reply(
    `I didn't understand that. Use /help to see available commands.`
  );
});

// ── Daily reminder cron ────────────────────────────────
cron.schedule("0 9 * * *", async () => {
  console.log("Running daily reminder check...");

  try {
    const { data: users } = await supabase
      .from("users")
      .select("telegram_id, wallet_address")
      .not("telegram_id", "is", null)
      .not("wallet_address", "is", null)
      .eq("reminders_enabled", true);

    if (!users) return;

    for (const user of users) {
      try {
        const loan = await loanManager.getActiveLoan(user.wallet_address);
        if (Number(loan.status) !== 1) continue;

        const daysLeft = await loanManager.getDaysUntilDue(user.wallet_address);
        const days = Number(daysLeft);

        if (days === 7) {
          await bot.telegram.sendMessage(
            user.telegram_id,
            `📅 *Loan Reminder*\n\nYour loan of *${formatHSK(loan.amount)}* is due in *7 days*.\n\nRepay on time to earn your SBT and protect your credit tier!`,
            {
              parse_mode: "Markdown",
              ...Markup.inlineKeyboard([
                [Markup.button.url("💳 Repay Now", `${DAPP_URL}/dashboard/loans`)],
              ]),
            }
          );
        } else if (days === 3) {
          await bot.telegram.sendMessage(
            user.telegram_id,
            `⚠️ *Urgent: Loan Due in 3 Days*\n\nYour loan of *${formatHSK(loan.amount)}* is due in *3 days*.\n\nRepay now to avoid being blacklisted!`,
            {
              parse_mode: "Markdown",
              ...Markup.inlineKeyboard([
                [Markup.button.url("🚨 Repay Now", `${DAPP_URL}/dashboard/loans`)],
              ]),
            }
          );
        } else if (days === 0) {
          await bot.telegram.sendMessage(
            user.telegram_id,
            `🚨 *FINAL WARNING: Loan Due TODAY*\n\nYour loan of *${formatHSK(loan.amount)}* is due *TODAY*.\n\nRepay immediately to avoid permanent blacklisting!`,
            {
              parse_mode: "Markdown",
              ...Markup.inlineKeyboard([
                [Markup.button.url("🚨 REPAY NOW", `${DAPP_URL}/dashboard/loans`)],
              ]),
            }
          );
        }
      } catch (err) {
        console.error(`Error processing reminder for ${user.telegram_id}:`, err);
      }
    }
  } catch (err) {
    console.error("Cron error:", err);
  }
});

// ── Launch ─────────────────────────────────────────────
bot.launch()
  .then(() => console.log("🤖 Trust Bot is running..."))
  .catch(console.error);

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));