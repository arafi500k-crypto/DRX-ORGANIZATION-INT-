import express from "express";
import path from "path";
import { BackendDB } from "./src/backend_db.js";

// Make sure that the backend database is loaded and active
BackendDB.load();

const app = express();
const PORT = 3000;

// JSON parsing support
app.use(express.json());

// Log API requests for debugging
app.use((req, res, next) => {
  console.log(`[API ${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// --- API ROUTES ---

  // Auth
  app.post("/api/auth/register", (req, res) => {
    const { username, email, mobile, password } = req.body;
    if (!username || !email || !mobile || !password) {
      return res.status(400).json({ success: false, message: "All fields are required!" });
    }
    const result = BackendDB.registerUser(username, email, mobile, password);
    if (result.success) {
      return res.json({ success: true, user: result.user, message: result.message });
    }
    return res.status(400).json({ success: false, message: result.message });
  });

  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Username and Password are required!" });
    }
    const result = BackendDB.loginUser(username, password);
    if (result.success) {
      return res.json({ success: true, user: result.user, message: result.message });
    }
    return res.status(400).json({ success: false, message: result.message });
  });

  app.post("/api/auth/change-password", (req, res) => {
    const { username, oldPassword, newPassword } = req.body;
    if (!username || !oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "All password fields are required!" });
    }
    const result = BackendDB.changePassword(username, oldPassword, newPassword);
    if (result.success) {
      return res.json({ success: true, message: result.message });
    }
    return res.status(412).json({ success: false, message: result.message });
  });

  app.get("/api/user/:username", (req, res) => {
    const username = req.params.username;
    const user = BackendDB.getUser(username);
    if (user) {
      return res.json({ success: true, user });
    }
    return res.status(404).json({ success: false, message: "User not found!" });
  });

  // Matches
  app.get("/api/matches", (req, res) => {
    const db = BackendDB.load();
    return res.json({ success: true, matches: db.matches });
  });

  app.post("/api/matches/join", (req, res) => {
    const { username, matchId, gameUid, gameIgn } = req.body;
    if (!username || !matchId) {
      return res.status(400).json({ success: false, message: "User & Match selection required!" });
    }
    if (!gameUid || !gameIgn) {
      return res.status(400).json({ success: false, message: "গেম ইউআইডি (UID) এবং ইন-গেম নাম (INGAME NAME) দেওয়া আবশ্যক!" });
    }
    const result = BackendDB.joinMatch(username, matchId, gameUid, gameIgn);
    if (result.success) {
      return res.json({ success: true, message: result.message, balance: result.balance });
    }
    return res.status(400).json({ success: false, message: result.message });
  });

  // Wallet
  app.post("/api/wallet/deposit", (req, res) => {
    const { username, amount, method, transactionId } = req.body;
    if (!username || !amount || !method || !transactionId) {
      return res.status(400).json({ success: false, message: "All fields are required!" });
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount entered!" });
    }
    const result = BackendDB.depositMoney(username, parsedAmount, method, transactionId);
    if (result.success) {
      return res.json({ success: true, message: result.message });
    }
    return res.status(400).json({ success: false, message: result.message });
  });

  app.post("/api/wallet/withdraw", (req, res) => {
    const { username, amount, method, mobileNumber } = req.body;
    if (!username || !amount || !method || !mobileNumber) {
      return res.status(400).json({ success: false, message: "All fields are required!" });
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount entered!" });
    }
    const result = BackendDB.withdrawMoney(username, parsedAmount, method, mobileNumber);
    if (result.success) {
      return res.json({ success: true, message: result.message });
    }
    return res.status(400).json({ success: false, message: result.message });
  });

  app.get("/api/transactions/:usernameOrId", (req, res) => {
    const usernameOrId = req.params.usernameOrId;
    const user = BackendDB.getUser(usernameOrId);
    if (!user) {
      return res.json({ success: true, deposits: [], withdrawals: [] });
    }
    const db = BackendDB.load();
    const userDeposits = db.deposits.filter(d => 
      (d.userId && d.userId === user.id) || 
      (!d.userId && d.username.toLowerCase() === user.username.toLowerCase())
    );
    const userWithdrawals = db.withdrawals.filter(w => 
      (w.userId && w.userId === user.id) || 
      (!w.userId && w.username.toLowerCase() === user.username.toLowerCase())
    );
    return res.json({ success: true, deposits: userDeposits, withdrawals: userWithdrawals });
  });

  // --- ADMIN ROUTES ---

  // Admin secret check & promote state
  app.post("/api/admin/auth", (req, res) => {
    const { password, username, email } = req.body;
    const db = BackendDB.load();
    if (password === db.adminPasswordHash) {
      if (email) {
        const promoted = BackendDB.makeAdminByEmail(email);
        if (!promoted) {
          return res.status(404).json({ success: false, message: "এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি!" });
        }
      } else if (username) {
        BackendDB.makeAdmin(username);
      }
      return res.json({ success: true, message: "এডমিন অথরাইজেশন সফল হয়েছে!" });
    }
    return res.status(401).json({ success: false, message: "Incorrect Admin Password!" });
  });

  // Admin Dashboard details view
  app.get("/api/admin/data", (req, res) => {
    const db = BackendDB.load();
    return res.json({
      success: true,
      users: db.users.map(u => ({ ...u, passwordHash: "HIDDEN" })),
      matches: db.matches,
      deposits: db.deposits,
      withdrawals: db.withdrawals,
      settings: BackendDB.getSettings()
    });
  });

  // Client-facing setting parameters endpoint
  app.get("/api/settings", (req, res) => {
    return res.json({
      success: true,
      settings: BackendDB.getSettings()
    });
  });

  // Admin save configuration parameters endpoint
  app.post("/api/admin/settings", (req, res) => {
    const { marqueeNotice, bkashNumber, bkashType, nagadNumber, nagadType, youtubeLink, telegramLink, whatsappLink } = req.body;
    const updated = BackendDB.updateSettings({
      marqueeNotice,
      bkashNumber,
      bkashType,
      nagadNumber,
      nagadType,
      youtubeLink,
      telegramLink,
      whatsappLink
    });
    return res.json({
      success: true,
      settings: updated,
      message: "কনফিগারেশন সফলভাবে আপডেট করা হয়েছে!"
    });
  });

  app.post("/api/admin/update-room", (req, res) => {
    const { matchId, roomCode, roomPass } = req.body;
    if (!matchId || roomCode === undefined || roomPass === undefined) {
      return res.status(400).json({ success: false, message: "Match identifier and details needed!" });
    }
    const success = BackendDB.updateMatchRoom(matchId, roomCode, roomPass);
    if (success) {
      return res.json({ success: true, message: "Room details saved successfully!" });
    }
    return res.status(400).json({ success: false, message: "Match not found!" });
  });

  app.post("/api/admin/approve-deposit", (req, res) => {
    const { depositId } = req.body;
    const success = BackendDB.approveDeposit(depositId);
    if (success) {
      return res.json({ success: true, message: "Deposit approved! Balance updated of user." });
    }
    return res.status(400).json({ success: false, message: "Deposit already processed or not found." });
  });

  app.post("/api/admin/reject-deposit", (req, res) => {
    const { depositId } = req.body;
    const success = BackendDB.rejectDeposit(depositId);
    if (success) {
      return res.json({ success: true, message: "Deposit rejected." });
    }
    return res.status(400).json({ success: false, message: "Deposit already processed or not found." });
  });

  app.post("/api/admin/approve-withdrawal", (req, res) => {
    const { withdrawId } = req.body;
    const success = BackendDB.approveWithdrawal(withdrawId);
    if (success) {
      return res.json({ success: true, message: "Withdrawal marked as approved & processed!" });
    }
    return res.status(400).json({ success: false, message: "Withdrawal request already processed or not found." });
  });

  app.post("/api/admin/reject-withdrawal", (req, res) => {
    const { withdrawId } = req.body;
    const success = BackendDB.rejectWithdrawal(withdrawId);
    if (success) {
      return res.json({ success: true, message: "Withdrawal rejected & monies refunded to customer balance." });
    }
    return res.status(400).json({ success: false, message: "Withdrawal request already processed or not found." });
  });

  app.post("/api/admin/update-user-stats", (req, res) => {
    const { targetUsername, balance, joinedCount, totalWon } = req.body;
    const success = BackendDB.updateUserStats(targetUsername, parseFloat(balance), parseInt(joinedCount), parseFloat(totalWon));
    if (success) {
      return res.json({ success: true, message: "Player statistics saved successfully!" });
    }
    return res.status(404).json({ success: false, message: "Target player not found!" });
  });

  // Admin add match
  app.post("/api/admin/add-match", (req, res) => {
    const { category, title, winPrize, entryType, entryFee, perKill, map, version, totalSpots, startTime } = req.body;
    if (!category || !title || startTime === undefined) {
      return res.status(400).json({ success: false, message: "Required fields are missing!" });
    }
    const newMatch = BackendDB.addMatch({
      category,
      title,
      winPrize: parseFloat(winPrize) || 0,
      entryType: entryType || "SOLO",
      entryFee: parseFloat(entryFee) || 0,
      perKill: parseFloat(perKill) || 0,
      map: map || "BERMUDA",
      version: version || "MOBILE",
      totalSpots: parseInt(totalSpots) || 48,
      startTime: Number(startTime)
    });
    return res.json({ success: true, match: newMatch, message: "Match created successfully!" });
  });

  // Admin delete match
  app.post("/api/admin/delete-match", (req, res) => {
    const { matchId } = req.body;
    if (!matchId) {
      return res.status(400).json({ success: false, message: "Match ID identifier needed!" });
    }
    const success = BackendDB.deleteMatch(matchId);
    if (success) {
      return res.json({ success: true, message: "Match deleted successfully!" });
    }
    return res.status(404).json({ success: false, message: "Match not found!" });
  });

  // --- VITE MIDDLEWARE SETUP ---

  if (process.env.NODE_ENV !== "production") {
    import("vite").then(({ createServer: createViteServer }) => {
      createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      }).then((vite) => {
        app.use(vite.middlewares);
      });
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server loaded on port ${PORT}`);
    });
  }

  export default app;

