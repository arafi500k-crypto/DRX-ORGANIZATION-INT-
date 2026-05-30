import fs from "fs";
import path from "path";

// Paths and Types
const DB_FILE = path.join(process.cwd(), "db_storage.json");

export interface MatchRegistration {
  matchId: string;
  gameUid: string;
  gameIgn: string;
  timestamp: string;
}

export interface User {
  id?: string;
  username: string;
  email: string;
  mobile: string;
  passwordHash: string;
  balance: number;
  joinedCount: number;
  totalWon: number;
  isAdmin: boolean;
  registeredAt: string;
  joinedMatches?: string[];
  gameRegistrations?: MatchRegistration[];
}

export interface Match {
  id: string;
  category: "BR Match" | "BR Survival" | "Clash Squad" | "CS 2 VS 2" | "LONE WOLF" | "Free Match";
  title: string;
  winPrize: number;
  entryType: string;
  entryFee: number;
  perKill: number;
  map: string;
  version: string;
  totalSpots: number;
  joinedSpots: number;
  roomPass: string;
  roomCode: string;
  startTime: number; // UTC timestamp of start
}

export interface DepositRequest {
  id: string;
  username: string;
  userId?: string;
  amount: number;
  method: "bKash" | "Nagad";
  transactionId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  timestamp: string;
}

export interface WithdrawRequest {
  id: string;
  username: string;
  userId?: string;
  amount: number;
  method: "bKash" | "Nagad";
  mobileNumber: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  timestamp: string;
}

export interface AppSettings {
  marqueeNotice: string;
  bkashNumber: string;
  bkashType: string;
  nagadNumber: string;
  nagadType: string;
  youtubeLink: string;
  telegramLink: string;
  whatsappLink: string;
}

export interface DatabaseSchema {
  users: User[];
  matches: Match[];
  deposits: DepositRequest[];
  withdrawals: WithdrawRequest[];
  adminPasswordHash: string;
  settings?: AppSettings;
}

// Initial/default database state
const DEFAULT_MATCHES = (): Match[] => {
  const categories: Match["category"][] = [
    "BR Match",
    "BR Survival",
    "Clash Squad",
    "CS 2 VS 2",
    "LONE WOLF",
    "Free Match"
  ];
  const list: Match[] = [];
  categories.forEach((cat, index) => {
    // Math 1 for category
    list.push({
      id: `${cat.replace(/\s+/g, "_").toLowerCase()}_1`,
      category: cat,
      title: `${cat} | Pro Tournament`,
      winPrize: cat === "Free Match" ? 100 : 480,
      entryType: cat.includes("2 VS 2") ? "2 VS 2" : (cat.includes("LONE WOLF") ? "Solo" : "Squad"),
      entryFee: cat === "Free Match" ? 0 : 50,
      perKill: cat === "Free Match" ? 0 : 5,
      map: "Bermuda",
      version: "MOBILE",
      totalSpots: cat.includes("BR") ? 48 : 12,
      joinedSpots: Math.floor(Math.random() * 5) + 3,
      roomPass: "PENDING",
      roomCode: "PENDING",
      startTime: Date.now() + (index + 1) * 45 * 60 * 1000 // starts in index*45 mins
    });

    // Math 2 for category
    list.push({
      id: `${cat.replace(/\s+/g, "_").toLowerCase()}_2`,
      category: cat,
      title: `${cat} | Daily Cup Elite`,
      winPrize: cat === "Free Match" ? 150 : 600,
      entryType: "Solo",
      entryFee: cat === "Free Match" ? 0 : 60,
      perKill: cat === "Free Match" ? 0 : 10,
      map: "Purgatory",
      version: "MOBILE",
      totalSpots: cat.includes("BR") ? 48 : 12,
      joinedSpots: Math.floor(Math.random() * 4) + 1,
      roomPass: "PENDING",
      roomCode: "PENDING",
      startTime: Date.now() + (index + 2) * 55 * 60 * 1000
    });
  });
  return list;
};

const DEFAULT_SETTINGS = (): AppSettings => ({
  marqueeNotice: "আমাদের টুর্নামেন্ট অ্যাপে আপনাদের স্বাগতম! যেকোনো প্রয়োজনে নিচে থাকা হেল্পলাইন লিংকে যোগাযোগ করুন। প্রতিদিন ২৪ ঘন্টা ম্যাচ অনুষ্ঠিত হচ্ছে!",
  bkashNumber: "01685482525",
  bkashType: "Send Money (Personal)",
  nagadNumber: "01685482525",
  nagadType: "Send Money (Personal)",
  youtubeLink: "https://www.youtube.com",
  telegramLink: "https://t.me/your_channel",
  whatsappLink: "https://wa.me/8801685482525"
});

const DEFAULT_DB: DatabaseSchema = {
  users: [
    {
      id: "admin_id",
      username: "admin",
      email: "admin@drx.com",
      mobile: "01685482525",
      passwordHash: "admin123",
      balance: 1000,
      joinedCount: 5,
      totalWon: 2500,
      isAdmin: true,
      registeredAt: "2026-05-29T12:00:00Z"
    },
    {
      id: "arafi_id",
      username: "ARAFI",
      email: "sazzadulislamarafi80@gmail.com",
      mobile: "01685482525",
      passwordHash: "123456",
      balance: 100,
      joinedCount: 0,
      totalWon: 0,
      isAdmin: false,
      registeredAt: "2026-05-29T12:04:00Z"
    }
  ],
  matches: DEFAULT_MATCHES(),
  deposits: [],
  withdrawals: [],
  adminPasswordHash: "1@2#3$4_5&6-7+8(9)0/", // Secret Admin Panel override password requested
  settings: DEFAULT_SETTINGS()
};

export class BackendDB {
  private static cachedData: DatabaseSchema | null = null;

  public static load(): DatabaseSchema {
    if (this.cachedData) {
      return this.cachedData;
    }
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, "utf-8");
        const parsed = JSON.parse(fileContent);
        // Ensure defaults are present in case files get written partly
        if (!parsed.users) parsed.users = DEFAULT_DB.users;
        if (parsed.matches === undefined || parsed.matches === null) parsed.matches = DEFAULT_DB.matches;
        if (!parsed.deposits) parsed.deposits = DEFAULT_DB.deposits;
        if (!parsed.withdrawals) parsed.withdrawals = DEFAULT_DB.withdrawals;
        if (!parsed.adminPasswordHash) parsed.adminPasswordHash = DEFAULT_DB.adminPasswordHash;
        
        // Ensure AppSettings loaded or initialized
        if (!parsed.settings) {
          parsed.settings = DEFAULT_SETTINGS();
        } else {
          const ds = DEFAULT_SETTINGS();
          parsed.settings = {
            marqueeNotice: parsed.settings.marqueeNotice !== undefined ? parsed.settings.marqueeNotice : ds.marqueeNotice,
            bkashNumber: parsed.settings.bkashNumber !== undefined ? parsed.settings.bkashNumber : ds.bkashNumber,
            bkashType: parsed.settings.bkashType !== undefined ? parsed.settings.bkashType : ds.bkashType,
            nagadNumber: parsed.settings.nagadNumber !== undefined ? parsed.settings.nagadNumber : ds.nagadNumber,
            nagadType: parsed.settings.nagadType !== undefined ? parsed.settings.nagadType : ds.nagadType,
            youtubeLink: parsed.settings.youtubeLink !== undefined ? parsed.settings.youtubeLink : ds.youtubeLink,
            telegramLink: parsed.settings.telegramLink !== undefined ? parsed.settings.telegramLink : ds.telegramLink,
            whatsappLink: parsed.settings.whatsappLink !== undefined ? parsed.settings.whatsappLink : ds.whatsappLink,
          };
        }

        // Migrate existing users to have a unique ID if they don't have one
        let usersMigrated = false;
        parsed.users = parsed.users.map((u: any) => {
          if (!u.id) {
            u.id = "USR_" + Math.random().toString(36).substring(2, 11).toUpperCase();
            usersMigrated = true;
          }
          return u;
        });

        this.cachedData = parsed;
        if (usersMigrated) {
          this.save();
        }
        return parsed;
      } else {
        this.cachedData = DEFAULT_DB;
        this.save();
        return DEFAULT_DB;
      }
    } catch (err) {
      console.error("Failed to load schema", err);
      return DEFAULT_DB;
    }
  }

  public static save() {
    if (!this.cachedData) {
      return;
    }
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.cachedData, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed to save schema", err);
    }
  }

  // User Actions
  public static getUser(usernameOrId: string): User | undefined {
    const db = this.load();
    const clean = usernameOrId.trim();
    // 1. Try finding by unique ID
    const foundById = db.users.find(u => u.id === clean);
    if (foundById) {
      if (!foundById.joinedMatches) foundById.joinedMatches = [];
      return foundById;
    }
    // 2. Try finding by case-insensitive username (fallback)
    const foundByUsername = db.users.find(u => u.username.toLowerCase() === clean.toLowerCase());
    if (foundByUsername) {
      if (!foundByUsername.joinedMatches) foundByUsername.joinedMatches = [];
      return foundByUsername;
    }
    return undefined;
  }

  public static registerUser(username: string, email: string, mobile: string, passwordHash: string): { success: boolean; user?: User; message: string } {
    const db = this.load();
    const cleanUsername = username.trim();
    if (!cleanUsername) {
      return { success: false, message: "Username cannot be empty!" };
    }
    const cleanUsernameLower = cleanUsername.toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    // Prevent duplicate usernames (case-insensitive)
    const usernameTaken = db.users.some(u => u.username.toLowerCase() === cleanUsernameLower);
    if (usernameTaken) {
      return { success: false, message: "এই ইউজারনেমটি ইতিমধ্যে ব্যবহার করা হয়েছে! অনুগ্রহ করে অন্য ইউজারনেম ব্যবহার করুন।" };
    }

    // Prevent duplicate emails
    const emailTaken = db.users.some(u => u.email.trim().toLowerCase() === cleanEmail);
    if (emailTaken) {
      return { success: false, message: "এই ইমেইলটি ইতিমধ্যে ব্যবহার করা হয়েছে! অনুগ্রহ করে অন্য ইমেইল ব্যবহার করুন।" };
    }

    const newUser: User = {
      id: "USR_" + Math.random().toString(36).substring(2, 11).toUpperCase(),
      username: cleanUsername,
      email: email.trim(),
      mobile: mobile.trim(),
      passwordHash: passwordHash.trim(),
      balance: 0, // start with 0 as requested
      joinedCount: 0,
      totalWon: 0,
      isAdmin: false,
      registeredAt: new Date().toISOString(),
      joinedMatches: []
    };
    db.users.push(newUser);
    this.save();
    return { success: true, user: newUser, message: "Registration successful!" };
  }

  public static loginUser(username: string, passwordHash: string): { success: boolean; user?: User; message: string } {
    const db = this.load();
    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = passwordHash.trim();
    
    // Find a user matching BOTH username and password (with case-insensitive username and trimmed password check)
    const matchedUser = db.users.find(u => 
      u.username.toLowerCase() === cleanUsername && 
      u.passwordHash.trim() === cleanPassword
    );

    if (matchedUser) {
      return { success: true, user: matchedUser, message: "Successfully logged in!" };
    }

    // Handlers for specific errors
    const usernameExists = db.users.some(u => u.username.toLowerCase() === cleanUsername);
    if (!usernameExists) {
      return { success: false, message: "Username not found!" };
    }
    return { success: false, message: "Incorrect password!" };
  }

  public static makeAdmin(usernameOrId: string): boolean {
    const db = this.load();
    const user = this.getUser(usernameOrId);
    if (user) {
      user.isAdmin = true;
      this.save();
      return true;
    }
    return false;
  }

  public static makeAdminByEmail(email: string): boolean {
    const db = this.load();
    const cleanEmail = email.trim().toLowerCase();
    const user = db.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (user) {
      user.isAdmin = true;
      this.save();
      return true;
    }
    return false;
  }

  public static changePassword(usernameOrId: string, oldPass: string, newPass: string): { success: boolean; message: string } {
    const db = this.load();
    const user = this.getUser(usernameOrId);
    if (!user) {
      return { success: false, message: "User not found!" };
    }
    const cleanDbPass = String(user.passwordHash || "").trim();
    const cleanOldPass = String(oldPass || "").trim();
    if (cleanDbPass !== cleanOldPass) {
      console.warn(`Password change warning for ${user.username}: entered='${cleanOldPass}', db='${cleanDbPass}'`);
      return { success: false, message: "Current password does not match!" };
    }
    user.passwordHash = String(newPass || "").trim();
    this.save();
    return { success: true, message: "Password updated successfully!" };
  }

  // Wallet Deposit Add Money
  public static depositMoney(usernameOrId: string, amount: number, method: "bKash" | "Nagad", transactionId: string): { success: boolean; message: string } {
    const db = this.load();
    const user = this.getUser(usernameOrId);
    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Min 6 character containing numbers
    if (transactionId.length < 6) {
      return { success: false, message: "Transaction ID must be at least 6 characters long!" };
    }
    const hasNum = /\d/.test(transactionId);
    if (!hasNum) {
      return { success: false, message: "Transaction ID must contain at least one number!" };
    }

    const tRequest: DepositRequest = {
      id: "DEP_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      username: user.username,
      userId: user.id,
      amount,
      method,
      transactionId,
      status: "PENDING",
      timestamp: new Date().toISOString()
    };

    db.deposits.push(tRequest);
    this.save();
    return { success: true, message: "Deposit request submitted. Awaiting approval." };
  }

  // Wallet Withdrawal
  public static withdrawMoney(usernameOrId: string, amount: number, method: "bKash" | "Nagad", mobileNumber: string): { success: boolean; message: string } {
    const db = this.load();
    const user = this.getUser(usernameOrId);
    if (!user) {
      return { success: false, message: "User not found" };
    }

    if (amount < 100) {
      return { success: false, message: "Minimum withdraw amount is BDT 100!" };
    }

    if (user.balance < amount) {
      return { success: false, message: "Insufficient balance for withdrawal!" };
    }

    // Deduct instantly as requested: "withdraw deyar Sathe Sathe account theke jeto taka withdraw dichi oi tk remove Hoye jabe"
    user.balance -= amount;

    const wRequest: WithdrawRequest = {
      id: "WIT_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      username: user.username,
      userId: user.id,
      amount,
      method,
      mobileNumber,
      status: "PENDING",
      timestamp: new Date().toISOString()
    };

    db.withdrawals.push(wRequest);
    this.save();
    return { success: true, message: "Withdraw request submitted instantly!" };
  }

  // Join match
  public static joinMatch(usernameOrId: string, matchId: string, gameUid: string, gameIgn: string): { success: boolean; message: string; balance?: number } {
    const db = this.load();
    const user = this.getUser(usernameOrId);
    const m = db.matches.find(item => item.id === matchId);

    if (!user) {
      return { success: false, message: "User not found!" };
    }
    if (!m) {
      return { success: false, message: "Match not found!" };
    }

    if (!user.joinedMatches) {
      user.joinedMatches = [];
    }
    if (user.joinedMatches.includes(matchId)) {
      return { success: false, message: "আপনি ইতিমধ্যে এই ম্যাচে জয়েন করেছেন!" };
    }

    if (m.joinedSpots >= m.totalSpots) {
      return { success: false, message: "Match is already full!" };
    }

    if (user.balance < m.entryFee) {
      return { success: false, message: "Insufficient balance! Please add money first." };
    }

    // Deduct entry fee
    user.balance -= m.entryFee;
    user.joinedCount += 1;
    m.joinedSpots += 1;
    user.joinedMatches.push(matchId);

    if (!user.gameRegistrations) {
      user.gameRegistrations = [];
    }
    user.gameRegistrations.push({
      matchId,
      gameUid: String(gameUid || "").trim(),
      gameIgn: String(gameIgn || "").trim(),
      timestamp: new Date().toISOString()
    });

    this.save();
    return { success: true, message: `Successfully joined ${m.title}!`, balance: user.balance };
  }

  // Administration update match room info
  public static updateMatchRoom(matchId: string, roomCode: string, roomPass: string): boolean {
    const db = this.load();
    const m = db.matches.find(item => item.id === matchId);
    if (m) {
      m.roomCode = roomCode;
      m.roomPass = roomPass;
      this.save();
      return true;
    }
    return false;
  }

  // Create match
  public static addMatch(matchIn: Omit<Match, "id" | "joinedSpots" | "roomCode" | "roomPass">): Match {
    const db = this.load();
    const newId = `match_${Math.random().toString(36).substring(2, 9)}`;
    const fullMatch: Match = {
      ...matchIn,
      id: newId,
      joinedSpots: 0,
      roomCode: "PENDING",
      roomPass: "PENDING"
    };
    db.matches.push(fullMatch);
    this.save();
    return fullMatch;
  }

  // Admin delete match
  public static deleteMatch(matchId: string): boolean {
    const db = this.load();
    const initialCount = db.matches.length;
    db.matches = db.matches.filter(item => item.id !== matchId);
    if (db.matches.length < initialCount) {
      this.save();
      return true;
    }
    return false;
  }

  // Administration action: approve deposit
  public static approveDeposit(depositId: string): boolean {
    const db = this.load();
    const dep = db.deposits.find(d => d.id === depositId);
    if (dep && dep.status === "PENDING") {
      dep.status = "APPROVED";
      // Find the user and add balance using ID lookup
      const u = dep.userId ? this.getUser(dep.userId) : this.getUser(dep.username);
      if (u) {
        u.balance += dep.amount;
      }
      this.save();
      return true;
    }
    return false;
  }

  // Administration action: reject deposit
  public static rejectDeposit(depositId: string): boolean {
    const db = this.load();
    const dep = db.deposits.find(d => d.id === depositId);
    if (dep && dep.status === "PENDING") {
      dep.status = "REJECTED";
      this.save();
      return true;
    }
    return false;
  }

  // Administration action: approve withdrawal
  public static approveWithdrawal(withdrawId: string): boolean {
    const db = this.load();
    const w = db.withdrawals.find(item => item.id === withdrawId);
    if (w && w.status === "PENDING") {
      w.status = "APPROVED";
      this.save();
      return true;
    }
    return false;
  }

  // Administration action: reject withdrawal (refund player)
  public static rejectWithdrawal(withdrawId: string): boolean {
    const db = this.load();
    const w = db.withdrawals.find(item => item.id === withdrawId);
    if (w && w.status === "PENDING") {
      w.status = "REJECTED";
      // Refund balance using ID lookup
      const u = w.userId ? this.getUser(w.userId) : this.getUser(w.username);
      if (u) {
        u.balance += w.amount;
      }
      this.save();
      return true;
    }
    return false;
  }

  // Set user's stats
  public static updateUserStats(targetUsernameOrId: string, balance: number, joinedCount: number, totalWon: number): boolean {
    const db = this.load();
    const u = this.getUser(targetUsernameOrId);
    if (u) {
      u.balance = balance;
      u.joinedCount = joinedCount;
      u.totalWon = totalWon;
      this.save();
      return true;
    }
    return false;
  }

  // Reset database (for sanity/clean dev state)
  public static resetToDefault() {
    this.cachedData = DEFAULT_DB;
    this.save();
  }

  // Get current app configuration settings dynamically
  public static getSettings(): AppSettings {
    const db = this.load();
    if (!db.settings) {
      db.settings = DEFAULT_SETTINGS();
    }
    return db.settings;
  }

  // Update current app configuration settings dynamically
  public static updateSettings(newSettings: Partial<AppSettings>): AppSettings {
    const db = this.load();
    if (!db.settings) {
      db.settings = DEFAULT_SETTINGS();
    }
    db.settings = {
      ...db.settings,
      ...newSettings
    };
    this.save();
    return db.settings;
  }
}
