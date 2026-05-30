import React, { useState, useEffect, useRef } from "react";
import { User, Match, DepositRequest, WithdrawRequest, AppSettings } from "./types.ts";
import { DragonLogo } from "./components/DragonLogo.tsx";
import {
  NotificationToast,
  ToastMessage,
} from "./components/NotificationToast.tsx";
import { SplashView } from "./components/SplashView.tsx";
import { RulesView } from "./components/RulesView.tsx";
import { AdminPanel } from "./components/AdminPanel.tsx";
import {
  Gamepad2,
  Calendar,
  History,
  User as UserIcon,
  Wallet as WalletIcon,
  Key,
  ShieldAlert,
  Check,
  Copy,
  Eye,
  EyeOff,
  LogOut,
  FileText,
  Lock,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Smartphone,
  MapPin,
  Landmark,
  Award,
  Trophy,
  Clock,
} from "lucide-react";

export default function App() {
  // Navigation & Screen sequence States
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem("drx_saved_user");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object" && (parsed.username || parsed.id)) {
          return parsed;
        }
      }
    } catch (_) {}
    return null;
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "play" | "my_matches" | "transactions" | "profile"
  >("play");

  // Authentication Fields
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regMobile, setRegMobile] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Toggle Password Visibilities
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showRegPass, setShowRegPass] = useState(false);

  // Match / Esports listing
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<
    Match["category"] | null
  >(null);
  const [settings, setSettings] = useState<AppSettings>({
    marqueeNotice: "আমাদের টুর্নামেন্ট অ্যাপে আপনাদের স্বাগতম! যেকোনো প্রয়োজনে নিচে থাকা হেল্পলাইন লিংকে যোগাযোগ করুন। প্রতিদিন ২৪ ঘন্টা ম্যাচ অনুষ্ঠিত হচ্ছে!",
    bkashNumber: "01685482525",
    bkashType: "Send Money (Personal)",
    nagadNumber: "01685482525",
    nagadType: "Send Money (Personal)",
    youtubeLink: "https://www.youtube.com",
    telegramLink: "https://t.me/your_channel",
    whatsappLink: "https://wa.me/8801685482525"
  });
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);
  const [openedPrizeMatchId, setOpenedPrizeMatchId] = useState<string | null>(null);

  // Match Custom Registration Modal properties
  const [joiningMatch, setJoiningMatch] = useState<Match | null>(null);
  const [tempGameUid, setTempGameUid] = useState("");
  const [tempGameIgn, setTempGameIgn] = useState("");

  // Wallet Forms
  const [walletSubTab, setWalletSubTab] = useState<"deposit" | "withdraw">(
    "deposit",
  );
  const [depositMethod, setDepositMethod] = useState<"bKash" | "Nagad">(
    "bKash",
  );
  const [depositAmount, setDepositAmount] = useState("");
  const [depositTxId, setDepositTxId] = useState("");

  const [withdrawMethod, setWithdrawMethod] = useState<"bKash" | "Nagad">(
    "bKash",
  );
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMobile, setWithdrawMobile] = useState("");

  // My Profile sub-view
  const [profileSubView, setProfileSubView] = useState<
    "menu" | "wallet" | "details" | "rules"
  >("menu");
  const [currentPasswordInput, setCurrentPasswordInput] = useState("");
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Admin Overlay Access Gate
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showAdminAuthModal, setShowAdminAuthModal] = useState(false);
  const [adminGatePassword, setAdminGatePassword] = useState("");

  // Transactions logs
  const [clientDeposits, setClientDeposits] = useState<DepositRequest[]>([]);
  const [clientWithdrawals, setClientWithdrawals] = useState<WithdrawRequest[]>(
    [],
  );

  // Copies
  const [copiedText, setCopiedText] = useState(false);

  // Toasts / Floating Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Clock dynamic ticks (seconds countdown matching real-time decreasing timer requested)
  const [currentTime, setCurrentTime] = useState(Date.now());

  const addToast = (
    text: string,
    type: "success" | "error" | "info" = "info",
  ) => {
    const freshId = "toast_" + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [
      ...prev,
      { id: freshId, text, type, duration: 10000 },
    ]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Pre-load / Re-hydrate Auth from localStorage
  useEffect(() => {
    const savedUserStr = localStorage.getItem("drx_saved_user");
    if (savedUserStr) {
      try {
        const parsed = JSON.parse(savedUserStr);
        if (parsed && parsed.username) {
          fetchAndSyncUserData(parsed.id || parsed.username);
        }
      } catch (e) {
        localStorage.removeItem("drx_saved_user");
      }
    }
    fetchMatches();
    fetchSettings();
  }, []);

  // Set real-time updater ticks (clock ticks down counts every second)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Poll Dynamic state live on-load & on-refresh (no manual reload needed)
  useEffect(() => {
    if (user) {
      fetchAndSyncUserData(user.id || user.username);
    }
    fetchMatches();
    fetchSettings();

    const interval = setInterval(() => {
      if (user) {
        fetchAndSyncUserData(user.id || user.username);
      }
      fetchMatches();
      fetchSettings();
    }, 5500); // 5.5s smart live updates ping

    return () => clearInterval(interval);
  }, [user?.id, user?.username]);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      const data = await response.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (e) {
      console.warn("Settings refresh error (background):", e);
    }
  };

  const fetchMatches = async () => {
    try {
      const response = await fetch("/api/matches");
      const data = await response.json();
      if (data.success) {
        setMatches(data.matches || []);
      }
    } catch (e) {
      console.warn("Match refresh error (background):", e);
    }
  };

  const fetchAndSyncUserData = async (username: string) => {
    try {
      const response = await fetch(`/api/user/${encodeURIComponent(username)}`);
      const data = await response.json();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem("drx_saved_user", JSON.stringify(data.user));

        // Also fetch their active transaction histories
        fetchClientTransactions(username);
      }
    } catch (e) {
      console.warn("User stats fetch error (background):", e);
    }
  };

  const fetchClientTransactions = async (username: string) => {
    try {
      const response = await fetch(
        `/api/transactions/${encodeURIComponent(username)}`,
      );
      const data = await response.json();
      if (data.success) {
        setClientDeposits(data.deposits || []);
        setClientWithdrawals(data.withdrawals || []);
      }
    } catch (e) {
      console.warn("Transaction load error (background):", e);
    }
  };

  // Auth Operations
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername.trim() || !loginPassword.trim()) {
      addToast("সঠিকভাবে ইউজারনেম এবং পাসওয়ার্ড দিন!", "error");
      return;
    }
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginUsername.trim(),
          password: loginPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem("drx_saved_user", JSON.stringify(data.user));
        addToast("লগইন সফল হয়েছে!", "success");
        setLoginUsername("");
        setLoginPassword("");
      } else {
        addToast("লগইন ব্যর্থ: " + data.message, "error");
      }
    } catch (err: any) {
      addToast("নেটওয়ার্ক সমস্যা: " + err.message, "error");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !regUsername.trim() ||
      !regEmail.trim() ||
      !regMobile.trim() ||
      !regPassword.trim()
    ) {
      addToast("ফর্মের সব ঘর সঠিকভাবে পূরণ করুন!", "error");
      return;
    }
    if (!agreeTerms) {
      addToast("অনুগ্রহ করে খেলার শর্তাবলীতে সম্মতি দিন!", "error");
      return;
    }
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: regUsername.trim(),
          email: regEmail.trim(),
          mobile: regMobile.trim(),
          password: regPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem("drx_saved_user", JSON.stringify(data.user));
        addToast("অ্যাকাউন্ট তৈরি সফল হয়েছে!", "success");

        // Reset registration fields
        setRegUsername("");
        setRegEmail("");
        setRegMobile("");
        setRegPassword("");
        setAgreeTerms(true);
      } else {
        addToast("অ্যাকাউন্ট তৈরিতে সমস্যা: " + data.message, "error");
      }
    } catch (err: any) {
      addToast("নেটওয়ার্ক সমস্যা: " + err.message, "error");
    }
  };

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!currentPasswordInput || !newPasswordInput || !confirmPasswordInput) {
      addToast("পাসওয়ার্ডের সব ঘর পূরণ করুন!", "error");
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      addToast("নতুন পাসওয়ার্ড এবং নিশ্চিত পাসওয়ার্ড মিলছে না!", "error");
      return;
    }
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.id || user.username,
          oldPassword: currentPasswordInput,
          newPassword: newPasswordInput,
        }),
      });
      const data = await res.json();
      if (data.success) {
        addToast("পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!", "success");
        setCurrentPasswordInput("");
        setNewPasswordInput("");
        setConfirmPasswordInput("");
        setProfileSubView("menu");
      } else {
        addToast("পাসওয়ার্ড পরিবর্তনে ব্যর্থ: " + data.message, "error");
      }
    } catch (err: any) {
      addToast("এরর হয়েছে: " + err.message, "error");
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("drx_saved_user");
    setSelectedCategory(null);
    setExpandedMatchId(null);
    setProfileSubView("menu");
    addToast("সফলভাবে লগআউট হয়েছে!", "success");
  };

  // Wallet Deposits
  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!depositAmount || !depositTxId.trim()) {
      addToast("টাকা এবং ট্রানজেকশন আইডি প্রদান করুন!", "error");
      return;
    }
    const valAmt = parseFloat(depositAmount);
    if (isNaN(valAmt) || valAmt <= 0) {
      addToast("সঠিক টাকার সংখ্যা লিখুন!", "error");
      return;
    }

    try {
      const response = await fetch("/api/wallet/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username,
          amount: valAmt,
          method: depositMethod,
          transactionId: depositTxId.trim(),
        }),
      });
      const data = await response.json();
      if (data.success) {
        // Bengali alert specified by the user
        addToast(
          "এডমিন আপনার ট্রানজেকশন পর্যবেক্ষণ করে আপনার টাকা আপনার অ্যাকাউন্টে অ্যাড করে দিবে! Please, ৩০-৪০ মিনিট অপেক্ষা করুন আপনার টাকা পেয়ে যাবে।",
          "success",
        );
        setDepositAmount("");
        setDepositTxId("");
        fetchAndSyncUserData(user.username);
      } else {
        addToast("এডমানি অনুরোধ ব্যর্থ: " + data.message, "error");
      }
    } catch (err: any) {
      addToast(err.message, "error");
    }
  };

  // Wallet Cashouts
  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!withdrawAmount || !withdrawMobile.trim()) {
      addToast("উইথড্র করার পরিমাণ এবং মোবাইল নম্বর দিন!", "error");
      return;
    }
    const parsedAmt = parseFloat(withdrawAmount);
    if (isNaN(parsedAmt) || parsedAmt < 100) {
      addToast("সর্বনিম্ন ১০০ টাকা উইথড্র দেওয়া যাবে!", "error");
      return;
    }
    if (user.balance < parsedAmt) {
      addToast("আপনার অ্যাকাউন্টে পর্যাপ্ত টাকা নেই!", "error");
      return;
    }

    try {
      const response = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username,
          amount: parsedAmt,
          method: withdrawMethod,
          mobileNumber: withdrawMobile.trim(),
        }),
      });
      const data = await response.json();
      if (data.success) {
        // Bengali cashout alert specified by the user
        addToast(
          "প্রতিদিন রাত ১০-১১ টার মধ্যে আপনার পেমেন্ট ক্লিয়ার করা হবে",
          "success",
        );
        setWithdrawAmount("");
        setWithdrawMobile("");
        fetchAndSyncUserData(user.username);
      } else {
        addToast("উইথড্রয়াল এরর: " + data.message, "error");
      }
    } catch (err: any) {
      addToast(err.message, "error");
    }
  };

  // Game joining logic
  const handleOpenJoinModal = (matchItem: Match) => {
    if (!user) return;
    if (user.balance < matchItem.entryFee) {
      addToast(
        "পর্যাপ্ত ব্যালেন্স নেই! দয়া করে আপনার ওয়ালেটে এড মানি করুন।",
        "error",
      );
      return;
    }
    setJoiningMatch(matchItem);
    setTempGameUid("");
    setTempGameIgn("");
  };

  const handleConfirmJoinMatch = async () => {
    if (!user || !joiningMatch) return;
    if (!tempGameUid.trim() || !tempGameIgn.trim()) {
      addToast("গেম ইউআইডি (UID) এবং ইনগেম নাম (INGAME NAME) দেওয়া আবশ্যক!", "error");
      return;
    }

    try {
      const response = await fetch("/api/matches/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username,
          matchId: joiningMatch.id,
          gameUid: tempGameUid,
          gameIgn: tempGameIgn,
        }),
      });
      const data = await response.json();
      if (data.success) {
        addToast(data.message, "success");
        setJoiningMatch(null);
        fetchAndSyncUserData(user.username);
        fetchMatches();
      } else {
        addToast(data.message, "error");
      }
    } catch (err: any) {
      addToast("JOIN ERROR: " + err.message, "error");
    }
  };

  // Admin access validation
  const handleAdminGateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminGatePassword) return;
    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: adminGatePassword,
          username: user?.username,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setShowAdminAuthModal(false);
        setAdminGatePassword("");
        setShowAdminPanel(true);
        addToast("এডমিন কন্ট্রোল প্যানেল সমর্থিত!", "success");
        if (user) {
          fetchAndSyncUserData(user.username);
        }
      } else {
        addToast("ভুল এডমিন পাসওয়ার্ড!", "error");
      }
    } catch (err: any) {
      addToast("নেটওয়ার্ক সমস্যা: " + err.message, "error");
    }
  };

  // Click Copy helper
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    addToast("মোবাইল নম্বরটি কপি করা হয়েছে!", "success");
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Render Time decrement countdown
  const getCountdownString = (startTime: number) => {
    const diff = startTime - currentTime;
    if (diff <= 0) {
      return "Match is starting / running!";
    }
    const hrs = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hrs.toString().padStart(2, "0")} Hours : ${mins.toString().padStart(2, "0")} Mins : ${secs.toString().padStart(2, "0")} Secs remaining`;
  };

  const getBannerCountdownString = (startTime: number) => {
    const diff = startTime - currentTime;
    if (diff <= 0) {
      return "STARTED";
    }
    const hrs = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    if (hrs > 0) {
      return `${hrs}h:${mins.toString().padStart(2, "0")}m:${secs.toString().padStart(2, "0")}s`;
    }
    return `${mins}m:${secs.toString().padStart(2, "0")}s`;
  };

  const formatDateTimeString = (startTime: number) => {
    const d = new Date(startTime);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    
    let hours = d.getHours();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutes = String(d.getMinutes()).padStart(2, "0");
    
    return `${year}-${month}-${day} at ${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
  };

  // Category statistics helper
  const getCategoryMatchCount = (catName: string) => {
    return matches.filter((m) => m.category === catName).length;
  };

  // Render Splash Screen loading
  if (showSplash) {
    return <SplashView onFinish={() => setShowSplash(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-800 pb-24 font-sans select-text relative">
      {/* Dynamic Notifications Alerts (Auto removes in 10s) */}
      <NotificationToast toasts={toasts} onRemove={removeToast} />

      {/* Admin Panel Overlayer */}
      {showAdminPanel && (
        <AdminPanel
          onAddToast={addToast}
          onClose={() => {
            setShowAdminPanel(false);
            if (user?.username) {
              fetchAndSyncUserData(user.username);
            }
          }}
        />
      )}

      {/* Main Container / Content Frame */}
      <div className="w-full max-w-md mx-auto bg-[#f8fafc] min-h-screen shadow-2xl relative flex flex-col border-x border-gray-200">
        {/* TOP COMPACT TITLE HEADER & ADMIN ACCESS PANEL GATEWAY */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <DragonLogo size={32} />
            <div>
              <h1 className="text-gray-900 text-xs font-black font-display tracking-widest uppercase">
                DRX ORGANIZATION INT
              </h1>
              <span className="text-[9px] text-[#DC2626] font-mono tracking-widest uppercase font-bold">
                PRO ESPORTS ARENA
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick Live Refresh Status indicator */}
            <span className="flex h-1.5 w-1.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase mr-1">
              LIVE FEED
            </span>

            {/* Admin Console Gate key (Only visible to admin users) */}
            {user && user.isAdmin && (
              <button
                onClick={() => setShowAdminPanel(true)}
                className="p-1 px-2.5 rounded bg-red-600/10 border border-red-500/20 text-red-500 hover:text-white hover:bg-red-600/80 font-mono text-[10px] font-bold tracking-wider uppercase transition-all"
                title="Open admin panel"
              >
                ADMIN ENTRY
              </button>
            )}
          </div>
        </header>

        {/* ADMIN AUTH SECRET PASS MODAL CARD */}
        {showAdminAuthModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 w-full max-w-xs space-y-4">
              <div className="flex flex-col items-center gap-2 text-center">
                <ShieldAlert className="w-10 h-10 text-red-500 animate-pulse" />
                <h3 className="font-display font-bold text-lg text-white">
                  Console Authorization
                </h3>
                <p className="text-[10px] font-sans text-gray-400">
                  Enter master password to access
                  administrator dashboards
                </p>
              </div>

              <form onSubmit={handleAdminGateSubmit} className="space-y-3">
                <input
                  type="password"
                  value={adminGatePassword}
                  onChange={(e) => setAdminGatePassword(e.target.value)}
                  placeholder="Master Secret Code"
                  className="bg-slate-900 w-full p-2.5 px-3 rounded border border-gray-700 text-xs font-mono text-white text-center focus:border-red-500 transition-colors"
                  autoFocus
                />

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-red-600 hover:bg-red-700 p-2 text-xs font-bold text-white uppercase rounded transition"
                  >
                    AUTHORIZE
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAdminAuthModal(false);
                      setAdminGatePassword("");
                    }}
                    className="px-3 bg-gray-800 hover:bg-gray-700 p-2 text-xs font-bold text-gray-400 rounded transition"
                  >
                    CLOSE
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CUSTOM GAME REGISTRATION MODAL WITH IDENTIFIERS (UID & INGAME NAME) */}
        {joiningMatch && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white border border-gray-150 rounded-2xl shadow-xl p-5 w-full max-w-sm space-y-4 overflow-hidden relative">
              
              {/* Header section with gaming vibe */}
              <div className="text-center pb-2 border-b border-gray-100">
                <div className="mx-auto w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-600 mb-2">
                  <Gamepad2 className="w-5 h-5 animate-bounce" />
                </div>
                <h3 className="font-display font-black text-md text-gray-900 tracking-tight">
                  Match Registration
                </h3>
                <p className="text-[10.5px] font-sans text-red-500 font-bold">
                  ইনগেম আইডি ও নাম অবশ্যই সঠিক হতে হবে!
                </p>
              </div>

              {/* Tournament detail banner */}
              <div className="bg-sky-50/70 border border-sky-100 p-3 rounded-xl space-y-1">
                <p className="text-[10px] text-sky-650 font-mono font-bold uppercase tracking-wider">
                  TOURNAMENT MATCH:
                </p>
                <p className="text-xs font-extrabold text-gray-800 uppercase leading-snug">
                  {joiningMatch.title}
                </p>
                <div className="flex justify-between items-center pt-2 mt-2 border-t border-sky-100/60 text-[11px] font-bold text-gray-700">
                  <span>Entry Fee:</span>
                  <span className="text-sky-600">{joiningMatch.entryFee === 0 ? "FREE" : `${joiningMatch.entryFee} TK`}</span>
                </div>
              </div>

              {/* Input Forms */}
              <div className="space-y-3.5">
                <div>
                  <label className="text-[9.5px] text-gray-500 font-bold font-mono tracking-wider block mb-1 uppercase">
                    ACCOUNT INSTANT IN GAME NAME (আইডি নাম) *
                  </label>
                  <input
                    type="text"
                    required
                    value={tempGameIgn}
                    onChange={(e) => setTempGameIgn(e.target.value)}
                    placeholder="e.g. ARAFI_YT"
                    className="bg-gray-50 w-full p-2.5 px-3 rounded-lg border border-gray-200 text-xs text-gray-950 font-medium focus:border-sky-500 focus:bg-white transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="text-[9.5px] text-gray-500 font-bold font-mono tracking-wider block mb-1 uppercase">
                    CHARACTER UID / PLAYER ID (ইউআইডি নম্বর) *
                  </label>
                  <input
                    type="text"
                    required
                    value={tempGameUid}
                    onChange={(e) => setTempGameUid(e.target.value)}
                    placeholder="e.g. 1824950284"
                    className="bg-gray-50 w-full p-2.5 px-3 rounded-lg border border-gray-200 text-xs text-gray-950 font-mono font-medium focus:border-sky-500 focus:bg-white transition-all outline-none"
                  />
                </div>
              </div>

              {/* Banglay helper guideline */}
              <p className="text-[10px] text-gray-500 leading-relaxed font-sans bg-gray-50 p-2.5 rounded-lg border border-gray-150">
                ⚠️ <span className="font-semibold text-gray-700">গুরুত্বপূর্ণ নির্দেশনা:</span> ভুল বা অসম্পূর্ণ তথ্য দিলে রুমে প্রবেশ ও পুরস্কার দেয়া সম্ভব হবে না। রুম ডিটেইলস পেতে জয়েন করার পর হোমপেজে সংশ্লিষ্ট ম্যাচের "Room Details" বাটনে ক্লিক করুন।
              </p>

              {/* Action commands */}
              <div className="flex gap-2.5 pt-1.5">
                <button
                  type="button"
                  onClick={handleConfirmJoinMatch}
                  className="flex-1 bg-sky-600 hover:bg-sky-700 px-4 py-2.5 rounded-xl text-xs font-black tracking-wide text-white transition transform active:scale-97 cursor-pointer uppercase shadow-md flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  JOIN NOW
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setJoiningMatch(null);
                    setTempGameUid("");
                    setTempGameIgn("");
                  }}
                  className="px-4 py-2.5 bg-gray-155 bg-gray-200 hover:bg-gray-300 rounded-xl text-xs font-bold text-gray-700 transition cursor-pointer"
                >
                  CANCEL
                </button>
              </div>

            </div>
          </div>
        )}

        {/* CORE SCREEN SWITCH INLINE */}
        {!user ? (
          /* NOT LOGGED IN PAGES: LOGIN AND REGISTER */
          <div className="flex-1 p-6 flex flex-col justify-center min-h-[85vh]">
            <div className="text-center mb-8 flex flex-col items-center">
              <DragonLogo size={110} />
              <h2 className="text-white text-2xl font-bold font-display tracking-widest mt-4">
                DRX ORGANIZATION
              </h2>
              <p className="text-[10px] text-gray-400 font-mono tracking-widest uppercase mt-1">
                Bengali custom pro sports app
              </p>
            </div>

            {isRegistering ? (
              /* SIGNUP WRAPPER CARD (Screenshot 7 styling layout) */
              <div className="space-y-5 animate-fadeIn">
                <div className="mb-2">
                  <h3 className="text-white text-3xl font-extrabold tracking-tight font-display">
                    Let's Start
                  </h3>
                  <p className="text-[#a1a1a9] text-xs mt-1">
                    Create an account
                  </p>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  {/* Container card styling like the reference */}
                  <div className="bg-[#1f1f23]/40 border border-gray-800 rounded-3xl p-6 space-y-4">
                    <h4 className="text-center font-bold text-gray-400 text-lg uppercase mb-3 font-display">
                      Sign Up
                    </h4>

                    <div className="space-y-3">
                      <input
                        type="text"
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                        placeholder="UserName"
                        className="bg-[#121214] w-full p-3.5 px-4 rounded-xl border border-gray-800 text-sm text-gray-200 placeholder-gray-500 focus:border-red-500 outline-none transition-all"
                      />

                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="Email Address"
                        className="bg-[#121214] w-full p-3.5 px-4 rounded-xl border border-gray-800 text-sm text-gray-200 placeholder-gray-500 focus:border-red-500 outline-none transition-all"
                      />

                      <input
                        type="text"
                        value={regMobile}
                        onChange={(e) => setRegMobile(e.target.value)}
                        placeholder="Mobile Number"
                        className="bg-[#121214] w-full p-3.5 px-4 rounded-xl border border-gray-800 text-sm text-gray-200 placeholder-gray-500 focus:border-red-500 outline-none transition-all"
                      />

                      <div className="relative">
                        <input
                          type={showRegPass ? "text" : "password"}
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Password"
                          className="bg-[#121214] w-full p-3.5 px-4 rounded-xl border border-gray-800 text-sm text-gray-200 placeholder-gray-500 focus:border-red-500 outline-none transition-all pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPass(!showRegPass)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                        >
                          {showRegPass ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <label className="flex items-start gap-3 pt-2 text-xs text-gray-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="mt-0.5 w-4.5 h-4.5 accent-red-600 rounded"
                      />
                      <span className="leading-relaxed">
                        I agree to the Terms and Conditions and Privacy Policy
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#D12053] hover:bg-[#b01642] text-white p-3.5 rounded-full text-sm font-bold tracking-wider transition-all transform active:scale-[0.98] duration-100 shadow-md font-display cursor-pointer flex items-center justify-center gap-2"
                  >
                    Create Account
                  </button>
                </form>

                <p className="text-center text-xs text-gray-450 pt-1 font-sans">
                  Already have an account?{" "}
                  <button
                    onClick={() => setIsRegistering(false)}
                    className="text-[#a1a1a9] font-bold underline ml-1 hover:text-white"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            ) : (
              /* LOGIN SUITE (Screenshot 8 styling layout) */
              <div className="space-y-5 animate-fadeIn">
                <div className="mb-2">
                  <h3 className="text-white text-3xl font-extrabold tracking-tight font-display">
                    Welcome Back
                  </h3>
                  <p className="text-[#a1a1a9] text-xs mt-1">
                    Sign in to your account
                  </p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="bg-[#1f1f23]/40 border border-gray-800 rounded-3xl p-6 space-y-4">
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                        placeholder="UserName"
                        className="bg-[#121214] w-full p-3.5 px-4 rounded-xl border border-gray-800 text-sm text-gray-200 placeholder-gray-500 focus:border-red-500 outline-none transition-all"
                      />

                      <div className="relative">
                        <input
                          type={showLoginPass ? "text" : "password"}
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="Password"
                          className="bg-[#121214] w-full p-3.5 px-4 rounded-xl border border-gray-800 text-sm text-gray-200 placeholder-gray-500 focus:border-red-500 outline-none transition-all pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPass(!showLoginPass)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                        >
                          {showLoginPass ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#18181c] hover:bg-[#232328] text-white p-3.5 rounded-full text-sm font-bold tracking-wider transition-transform transform active:scale-95 duration-100 shadow-md font-display"
                  >
                    Sign In
                  </button>
                </form>

                <p className="text-center text-xs text-gray-455 pt-4 font-sans">
                  I'm a new user.{" "}
                  <button
                    onClick={() => setIsRegistering(true)}
                    className="text-[#a1a1a9] font-bold underline ml-1 hover:text-white"
                  >
                    Register
                  </button>
                </p>
              </div>
            )}
          </div>
        ) : (
          /* LOGGED IN CORE PLATFORM */
          <div className="flex-1">
            {/* TAB VIEW 1: PLAY VIEW (Tournament selection) */}
            {activeTab === "play" && (
              <div className="p-4 space-y-4 animate-fadeIn">
                {/* DYNAMIC SCROLLING NOTICE AND QUICK HELPLINE ACCENTS (Configured live from Admin Panel) */}
                <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3.5 space-y-3.5 shadow-3xs overflow-hidden">
                  <div className="flex items-center gap-2.5 text-amber-800">
                    <span className="flex-shrink-0 bg-amber-600 text-white rounded-full p-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider animate-pulse font-sans">
                      NOTICE
                    </span>
                    <div className="overflow-hidden relative w-full h-4 text-xs font-bold font-sans">
                      <div className="absolute whitespace-nowrap animate-marquee left-0">
                        {settings.marqueeNotice}
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Action Buttons for helpline and tutorials from admin dashboard */}
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-amber-200/50">
                    <a
                      href={settings.whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl p-2 px-2.5 text-center flex items-center justify-center gap-1 text-[10px] font-black transition-all transform active:scale-95 shadow-3xs"
                    >
                      WHATSAPP
                    </a>
                    
                    <a
                      href={settings.telegramLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-sky-600 hover:bg-sky-700 text-white rounded-xl p-2 px-2.5 text-center flex items-center justify-center gap-1 text-[10px] font-black transition-all transform active:scale-95 shadow-3xs"
                    >
                      TELEGRAM
                    </a>

                    <a
                      href={settings.youtubeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl p-2 px-2.5 text-center flex items-center justify-center gap-1 text-[10px] font-black transition-all transform active:scale-95 shadow-3xs"
                    >
                      YOUTUBE
                    </a>
                  </div>
                </div>

                {!selectedCategory ? (
                  /* CATEGORY FOLDER GRID (Matches image 5 folder style layout) */
                  <div className="space-y-4">
                    <div className="p-4 bg-sky-50 border border-sky-100/70 rounded-2xl flex items-center gap-3 shadow-3xs">
                      <Gamepad2 className="w-8 h-8 text-sky-650 flex-shrink-0 animate-pulse" />
                      <div>
                        <h4 className="text-sm font-bold font-display text-gray-900">
                          Championship Feed Arena
                        </h4>
                        <p className="text-[10px] text-gray-500">
                          প্রতিদিন ২৪ ঘন্টা ম্যাচ খেলা অনুষ্ঠিত হচ্ছে।
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                      {(
                        [
                          "BR Match",
                          "BR Survival",
                          "Clash Squad",
                          "CS 2 VS 2",
                          "LONE WOLF",
                          "Free Match",
                        ] as const
                      ).map((catName) => {
                        return (
                          <button
                            key={catName}
                            onClick={() => setSelectedCategory(catName)}
                            className="bg-white border border-gray-200 hover:border-sky-500 hover:bg-sky-50/10 rounded-2xl p-4 text-left transition-all group shadow-sm cursor-pointer"
                          >
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-sky-600 mb-3 group-hover:bg-sky-600 group-hover:text-white transition-colors border border-gray-100 shadow-3xs">
                              <Gamepad2 className="w-5 h-5" />
                            </div>
                            <span className="font-mono text-gray-500 text-[10px] block font-bold uppercase tracking-wider">
                              Tournament Format
                            </span>
                            <span className="font-display font-bold text-gray-900 text-sm block mt-1 leading-tight group-hover:text-sky-600 transition-colors">
                              {catName}
                            </span>
                            <span className="text-[10px] font-mono text-sky-600 font-extrabold mt-2 block bg-sky-50/70 py-0.5 px-2 rounded-full w-max border border-sky-100/50">
                              {getCategoryMatchCount(catName)} matches active
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* TOURNAMENT LIST WITHIN SELECTED CATEGORY */
                  <div className="space-y-4">
                    {/* Return category header bar */}
                    <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedCategory(null)}
                          className="flex items-center justify-center py-2 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-xs text-white font-extrabold transition-all transform active:scale-95 cursor-pointer relative z-50 shadow-sm gap-1"
                        >
                          ← BACK
                        </button>
                        <h3 className="text-md font-black font-display text-gray-900 tracking-wide uppercase">
                          {selectedCategory} matches
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono bg-sky-50 text-sky-600 border border-sky-100 px-2.5 py-0.5 rounded-full font-bold">
                        {
                          matches.filter((m) => m.category === selectedCategory)
                            .length
                        }{" "}
                        Found
                      </span>
                    </div>

                    {/* Filtered list of matches in category */}
                    {matches.filter((m) => m.category === selectedCategory)
                      .length === 0 ? (
                      <p className="text-center font-mono py-12 text-gray-500 text-xs">
                        No matches hosted inside this category yet.
                      </p>
                    ) : (
                      <div className="space-y-5">
                        {matches
                          .filter((m) => m.category === selectedCategory)
                          .map((item) => {
                            const userJoinedThis = !!(
                              user &&
                              user.joinedMatches &&
                              user.joinedMatches.includes(item.id)
                            );

                            // Let's check matching joined slots remaining
                            const spotsLeft =
                              item.totalSpots - item.joinedSpots;
                            const isCurrentlyFull = spotsLeft <= 0;

                            return (
                              <div
                                key={item.id}
                                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md"
                              >
                                {/* Poster / Card Header (Matches Picture 2 layout) */}
                                <div className="flex items-center gap-3.5 p-3.5 border-b border-gray-100 bg-white">
                                  <img
                                    src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=200&auto=format&fit=crop"
                                    alt="Game logo Artwork"
                                    className="w-20 h-12 rounded-lg object-cover flex-shrink-0 border border-gray-100 shadow-3xs"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-gray-900 text-sm font-bold tracking-tight leading-tight uppercase truncate">
                                      {item.title}
                                    </h4>
                                    <span className="text-[11px] font-bold text-red-500 mt-1 block tracking-wide">
                                      {formatDateTimeString(item.startTime)}
                                    </span>
                                  </div>
                                </div>

                                {/* Match Core Information Grid (Matches Picture 2) */}
                                <div className="p-3.5 grid grid-cols-3 gap-y-3.5 gap-x-2 text-center bg-white border-b border-gray-100 font-display">
                                  <div>
                                    <p className="text-[10px] text-gray-455 font-semibold uppercase tracking-wider">
                                      WIN PRIZE
                                    </p>
                                    <p className="text-xs font-extrabold text-gray-850 mt-0.5">
                                      {item.winPrize} TK
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-gray-455 font-semibold uppercase tracking-wider">
                                      ENTRY TYPE
                                    </p>
                                    <p className="text-xs font-extrabold text-gray-850 uppercase mt-0.5">
                                      {item.entryType}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-gray-455 font-semibold uppercase tracking-wider">
                                      ENTRY FEE
                                    </p>
                                    <p className="text-xs font-extrabold text-gray-850 mt-0.5">
                                      {item.entryFee === 0
                                        ? "FREE"
                                        : `${item.entryFee} TK`}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-gray-455 font-semibold uppercase tracking-wider">
                                      PER KILL
                                    </p>
                                    <p className="text-xs font-extrabold text-gray-850 mt-0.5 font-mono">
                                      {item.perKill} TK
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-gray-455 font-semibold uppercase tracking-wider">
                                      MAP
                                    </p>
                                    <p className="text-xs font-extrabold text-gray-850 uppercase mt-0.5">
                                      {item.map}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-gray-455 font-semibold uppercase tracking-wider">
                                      VERSION
                                    </p>
                                    <p className="text-xs font-extrabold text-gray-850 uppercase mt-0.5">
                                      {item.version}
                                    </p>
                                  </div>
                                </div>

                                {/* Custom side-by-side Progress Bar & Button section (Matches Picture 2) */}
                                <div className="p-3.5 flex items-center justify-between gap-4 border-b border-gray-100 bg-white">
                                  {/* Left progress bar block */}
                                  <div className="flex-1 min-w-0">
                                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-200">
                                      <div
                                        className="h-full bg-emerald-500 rounded-full transition-all"
                                        style={{
                                          width: `${Math.min(100, (item.joinedSpots / item.totalSpots) * 100)}%`,
                                        }}
                                      />
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-bold text-gray-455 mt-1.5">
                                      <span>
                                        Only {spotsLeft} spots are left
                                      </span>
                                      <span>
                                        {item.joinedSpots}/{item.totalSpots}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Right side Join / Status action button */}
                                  {userJoinedThis ? (
                                    <button
                                      disabled
                                      className="bg-emerald-600 border border-emerald-700 text-white text-xs font-bold rounded-lg px-4.5 py-1.5 transition-all select-none shadow-3xs flex-shrink-0 flex items-center justify-center gap-1 cursor-default"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      JOINED MATCH
                                    </button>
                                  ) : isCurrentlyFull ? (
                                    <button
                                      disabled
                                      className="border border-sky-600 text-sky-600 bg-white text-xs font-bold rounded-lg px-4.5 py-1.5 hover:bg-sky-50/50 transition-all cursor-not-allowed select-none shadow-3xs flex-shrink-0"
                                    >
                                      Match Full
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleOpenJoinModal(item)}
                                      className="bg-sky-600 hover:bg-sky-700 hover:border-sky-700 text-white text-xs font-bold border border-sky-600 rounded-lg px-4.5 py-1.5 transition-all transform active:scale-97 select-none shadow-3xs flex-shrink-0"
                                    >
                                      JOIN MATCH
                                    </button>
                                  )}
                                </div>

                                {/* Room details & Prize details selector buttons (Side-by-side in Columns from Picture 2) */}
                                <div className="p-3.5 bg-white space-y-3">
                                  <div className="grid grid-cols-2 gap-3.5">
                                    {/* Dropdown 1: Room Details */}
                                    <button
                                      onClick={() => {
                                        setExpandedMatchId(
                                          expandedMatchId === item.id
                                            ? null
                                            : item.id,
                                        );
                                      }}
                                      className="flex items-center justify-between p-2 px-3 border border-sky-600 text-xxs font-extrabold text-sky-700 bg-white hover:bg-sky-50/45 rounded-lg shadow-3xs transition-all tracking-tight font-display text-center cursor-pointer"
                                    >
                                      <span className="flex items-center gap-1">
                                        <Key className="w-3.5 h-3.5" />
                                        Room Details
                                      </span>
                                      {expandedMatchId === item.id ? (
                                        <ChevronUp className="w-3 h-3 text-sky-600" />
                                      ) : (
                                        <ChevronDown className="w-3 h-3 text-sky-600" />
                                      )}
                                    </button>

                                    {/* Dropdown 2: Total Prize Details */}
                                    <button
                                      onClick={() => {
                                        setOpenedPrizeMatchId(
                                          openedPrizeMatchId === item.id
                                            ? null
                                            : item.id,
                                        );
                                      }}
                                      className="flex items-center justify-between p-2 px-3 border border-sky-600 text-xxs font-extrabold text-sky-700 bg-white hover:bg-sky-50/45 rounded-lg shadow-3xs transition-all tracking-tight font-display text-center cursor-pointer"
                                    >
                                      <span className="flex items-center gap-1">
                                        <Trophy className="w-3.5 h-3.5" />
                                        Total Prize Details
                                      </span>
                                      {openedPrizeMatchId === item.id ? (
                                        <ChevronUp className="w-3 h-3 text-sky-600" />
                                      ) : (
                                        <ChevronDown className="w-3 h-3 text-sky-600" />
                                      )}
                                    </button>
                                  </div>

                                  {/* Dropdown Content Area (Room Details) */}
                                  {expandedMatchId === item.id && (() => {
                                    const hasRegisteredForMatch =
                                      user &&
                                      (user.isAdmin ||
                                        (user.joinedMatches &&
                                          user.joinedMatches.includes(
                                            item.id,
                                          )));

                                    if (!hasRegisteredForMatch) {
                                      return (
                                        <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-center text-[11px] leading-relaxed font-sans text-amber-700 font-bold">
                                          🔐 আপনি এখনো এই ম্যাচে জয়েন করেননি!
                                          রুম কোড এবং পাসওয়ার্ড দেখতে দয়া করে
                                          প্রথমে জয়েন করুন।
                                        </div>
                                      );
                                    }

                                    return (
                                      <div className="bg-gray-50/75 p-3.5 rounded-xl border border-gray-200 space-y-2 text-xs font-mono text-gray-800">
                                        <div className="flex justify-between items-center bg-white px-3.5 py-2 rounded-lg border border-gray-150 shadow-3xs">
                                          <span className="text-gray-500 text-[10px] font-black tracking-wider block">
                                            ROOM PASS:
                                          </span>
                                          <span
                                            className={`font-extrabold ${
                                              item.roomPass === "PENDING"
                                                ? "text-amber-600"
                                                : "text-emerald-600"
                                            }`}
                                          >
                                            {item.roomPass}
                                          </span>
                                        </div>
                                        <div className="flex justify-between items-center bg-white px-3.5 py-2 rounded-lg border border-gray-150 shadow-3xs">
                                          <span className="text-gray-500 text-[10px] font-black tracking-wider block">
                                            ROOM CODE:
                                          </span>
                                          <span
                                            className={`font-extrabold ${
                                              item.roomCode === "PENDING"
                                                ? "text-amber-600"
                                                : "text-emerald-600"
                                            }`}
                                          >
                                            {item.roomCode}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })()}

                                  {/* Dropdown Content Area (Total Prize Details) */}
                                  {openedPrizeMatchId === item.id && (
                                    <div className="bg-gray-50/75 p-3.5 rounded-xl border border-gray-200 space-y-2 text-xs font-mono text-gray-800">
                                      <div className="flex justify-between items-center bg-white px-3.5 py-2 rounded-lg border border-gray-150 shadow-3xs">
                                        <span className="text-gray-500 text-[10px] font-black tracking-wider block">
                                          🏆 1ST WINNER PRIZE:
                                        </span>
                                        <span className="font-extrabold text-amber-600">
                                          {item.winPrize} TK
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center bg-white px-3.5 py-2 rounded-lg border border-gray-150 shadow-3xs">
                                        <span className="text-gray-500 text-[10px] font-black tracking-wider block">
                                          ⚔️ PER KILL PRIZE:
                                        </span>
                                        <span className="font-extrabold text-sky-600">
                                          {item.perKill} TK
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center bg-white px-3.5 py-2 rounded-lg border border-gray-150 shadow-3xs">
                                        <span className="text-gray-500 text-[10px] font-black tracking-wider block">
                                          🧩 ENTRY FEE REQUIREMENT:
                                        </span>
                                        <span className="font-extrabold text-emerald-600">
                                          {item.entryFee === 0
                                            ? "FREE"
                                            : `${item.entryFee} TK`}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Custom Solid Green Banner Countdown timer bottom matching Picture 2 */}
                                <div className="bg-green-700 text-center text-white py-2.5 px-3 rounded-b-xl text-xs font-extrabold tracking-widest font-display flex items-center justify-center gap-1.5 select-none shadow-inner">
                                  <Clock className="w-3.5 h-3.5 text-white animate-pulse" />
                                  <span>
                                    STARTS IN -{" "}
                                    {getBannerCountdownString(item.startTime)}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB VIEW 2: MY MATCHES MODULE */}
            {activeTab === "my_matches" && (
              <div className="p-4 space-y-4 animate-fadeIn">
                <div className="text-center font-display uppercase tracking-wider py-1 border-b border-gray-200">
                  <h3 className="text-md font-bold text-gray-900">
                    আমার ম্যাচ (My Matches)
                  </h3>
                </div>

                {/* Users joined matches */}
                {user.joinedCount === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-gray-400 font-sans">
                    <p className="text-gray-550 text-sm">No Matches Found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-emerald-50 border border-emerald-150 rounded-xl text-xs space-y-2">
                      <span className="text-emerald-600 font-extrabold block text-[10px] tracking-wider uppercase font-mono">
                        ⚡ PLAY CARD ACTIVE
                      </span>
                      <p className="text-gray-700">
                        আপনি সফলভাবে টুর্নামেন্টে জয়েন নিয়েছেন। রুম কোড এবং
                        পাসওয়ার্ড আপডেট হওয়া মাত্রই রুম ডিটেইলস এর ভেতরে দেখতে
                        পাবেন।
                      </p>
                    </div>

                    {/* Show a joined match helper */}
                    {matches.slice(0, 2).map((item) => (
                      <div
                        key={item.id + "_joined"}
                        className="bg-white border border-gray-200 rounded-xl p-4 space-y-3.5 shadow-sm"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] font-mono bg-sky-50 text-sky-600 border border-sky-100 px-2.5 py-0.5 rounded-full font-bold uppercase">
                              {item.category}
                            </span>
                            <h4 className="text-sm font-bold text-gray-900 font-display mt-1.5">
                              {item.title}
                            </h4>
                          </div>
                          <span className="text-[10px] font-mono text-emerald-600 font-black">
                            ✓ JOINED
                          </span>
                        </div>

                        <div className="bg-gray-50/75 p-3.5 rounded-xl border border-gray-150 text-xs font-mono space-y-2 text-gray-800">
                          <div className="flex justify-between items-center bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-3xs">
                            <span className="text-gray-500 text-[10px] font-black">ROOM PASS:</span>
                            <span
                              className={`font-extrabold ${item.roomPass === "PENDING" ? "text-amber-600" : "text-emerald-600"}`}
                            >
                              {item.roomPass}
                            </span>
                          </div>
                          <div className="flex justify-between items-center bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-3xs">
                            <span className="text-gray-500 text-[10px] font-black">ROOM CODE:</span>
                            <span
                              className={`font-extrabold ${item.roomCode === "PENDING" ? "text-amber-600" : "text-emerald-600"}`}
                            >
                              {item.roomCode}
                            </span>
                          </div>
                        </div>

                        <div className="bg-green-700 text-center text-white py-2 px-3 rounded-lg text-xxs font-bold uppercase shadow-3xs">
                          কাস্টম Ready Room Details থেকে নিন
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB VIEW 3: TRANSACTIONS (New Tab requested instead of results) */}
            {activeTab === "transactions" && (
              <div className="p-4 space-y-4 animate-fadeIn">
                <div className="text-center font-display uppercase tracking-wider py-1 border-b border-gray-850">
                  <h3 className="text-md font-bold text-white">
                    আমার লেনদেনের ইতিহাস (Transactions)
                  </h3>
                </div>

                <div className="space-y-4">
                  {/* Deposits / Add Money Logs */}
                  <div>
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono mb-2 flex items-center gap-1">
                      <Landmark className="w-3.5 h-3.5" />
                      এড মানি প্রুফ ইতিহাস (Add Money History)
                    </h4>

                    {clientDeposits.length === 0 ? (
                      <p className="bg-[#1e293b]/20 p-4 text-center text-xs font-sans text-gray-500 rounded-xl border border-gray-800">
                        এডমানি করার কোনো ট্রানজেকশন তালিকা নেই।
                      </p>
                    ) : (
                      <div className="space-y-2.5">
                        {clientDeposits.map((dep) => (
                          <div
                            key={dep.id}
                            className="bg-[#111827] border border-gray-850 rounded-xl p-3 flex justify-between items-center"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-display font-medium text-xs text-white uppercase">
                                  {dep.method} DEPOSIT
                                </span>
                                <span
                                  className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${
                                    dep.status === "APPROVED"
                                      ? "bg-emerald-500/20 text-emerald-400"
                                      : dep.status === "REJECTED"
                                        ? "bg-red-500/20 text-red-500"
                                        : "bg-amber-500/20 text-amber-500"
                                  }`}
                                >
                                  {dep.status}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono text-gray-400 block mt-1 select-all font-bold">
                                TXID: {dep.transactionId}
                              </span>
                              <span className="text-[9px] font-mono text-gray-500 block mt-0.5">
                                {new Date(dep.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <span className="font-mono text-xs font-bold text-emerald-400">
                              +{dep.amount} TK
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Withdrawals Logs */}
                  <div>
                    <h4 className="text-xs font-bold text-[#D12053] uppercase tracking-widest font-mono mb-2 flex items-center gap-1">
                      <History className="w-3.5 h-3.5" />
                      উইথড্র করার রেকর্ড (Withdrawals History)
                    </h4>

                    {clientWithdrawals.length === 0 ? (
                      <p className="bg-[#1e293b]/20 p-4 text-center text-xs font-sans text-gray-500 rounded-xl border border-gray-800">
                        উইথড্র করার কোনো রেকর্ড তালিকা নেই।
                      </p>
                    ) : (
                      <div className="space-y-2.5">
                        {clientWithdrawals.map((wit) => (
                          <div
                            key={wit.id}
                            className="bg-[#111827] border border-gray-850 rounded-xl p-3 flex justify-between items-center"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-display font-medium text-xs text-white uppercase">
                                  {wit.method} WITHDRAW
                                </span>
                                <span
                                  className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${
                                    wit.status === "APPROVED"
                                      ? "bg-emerald-500/20 text-emerald-400"
                                      : wit.status === "REJECTED"
                                        ? "bg-red-500/20 text-red-400"
                                        : "bg-amber-500/20 text-amber-500"
                                  }`}
                                >
                                  {wit.status}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono text-gray-400 block mt-1 select-all font-bold">
                                To: {wit.mobileNumber}
                              </span>
                              <span className="text-[9px] font-mono text-gray-500 block mt-0.5">
                                {new Date(wit.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <span className="font-mono text-xs font-bold text-red-400">
                              -{wit.amount} TK
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB VIEW 4: USER PROFILE TAB PANEL */}
            {activeTab === "profile" && (
              <div className="space-y-5 animate-fadeIn">
                {/* BLUE GRADIENT SCORECARD BLOCK (Matches image 6 gradient and avatar layout) */}
                <div className="bg-gradient-to-br from-sky-400 to-indigo-650 p-6 text-center text-white relative shadow-md">
                  <div className="absolute top-3 right-3">
                    <span className="text-[9px] font-mono bg-white/20 px-2 py-0.5 rounded uppercase font-bold text-white tracking-widest">
                      DRX MEMBER
                    </span>
                  </div>

                  <div className="flex flex-col items-center">
                    {/* Circle Avatar (Image 3 look) */}
                    <div className="w-16 h-16 rounded-full bg-white border-2 border-sky-400/30 flex items-center justify-center text-[#111827] mb-3 overflow-hidden shadow-inner">
                      <div className="text-sky-500 border border-sky-200 rounded-full p-2.5 bg-sky-50">
                        <UserIcon className="w-7 h-7" />
                      </div>
                    </div>

                    <h2 className="text-lg font-black tracking-wide uppercase">
                      {user.username}
                    </h2>
                    <span className="text-xs text-white/70 font-mono lower">
                      {user.email || "sa**@gmail.com"}
                    </span>

                    {/* Stats strip in Bengali (as in image 6) */}
                    <div className="grid grid-cols-3 gap-0.5 bg-black/15 p-2 rounded-2xl w-full max-w-sm mt-5 text-center font-display/80">
                      <div className="border-r border-white/10 px-1 py-1">
                        <p className="text-[11px] font-black text-white">
                          {user.joinedCount}
                        </p>
                        <p className="text-[8px] text-white/80 font-bold uppercase mt-0.5">
                          ম্যাচ জয়েন করেছেন
                        </p>
                      </div>
                      <div className="border-r border-white/10 px-1 py-1">
                        <p className="text-[11px] font-black text-rose-300">
                          BDT {user.balance}
                        </p>
                        <p className="text-[8px] text-white/80 font-bold uppercase mt-0.5">
                          Available Balance
                        </p>
                      </div>
                      <div className="px-1 py-1">
                        <p className="text-[11px] font-black text-white">
                          {user.totalWon} TK
                        </p>
                        <p className="text-[8px] text-white/80 font-bold uppercase mt-0.5 font-sans">
                          এখন পর্যন্ত জিতেছেন
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub View renders: Menu lists, Wallet, Basic Details list, etc. */}
                {profileSubView === "menu" ? (
                  <div className="p-4 space-y-3">
                    {/* Wallet Button */}
                    <button
                      onClick={() => setProfileSubView("wallet")}
                      className="w-full flex items-center justify-between p-4 bg-[#1f2937]/35 hover:bg-slate-800/40 border border-gray-850 rounded-xl text-left transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-600/15 rounded-lg text-emerald-400 border border-emerald-500/15">
                          <WalletIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-white text-xs font-bold uppercase tracking-wider font-display">
                            My Wallet Dashboard
                          </h4>
                          <span className="text-[10px] text-emerald-400 font-mono mt-0.5 block">
                            Add Money and Withdraw Cashouts
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-emerald-400 font-mono font-bold tracking-tight">
                        BDT {user.balance} →
                      </span>
                    </button>

                    {/* My Profile Basic Details Button */}
                    <button
                      onClick={() => setProfileSubView("details")}
                      className="w-full flex items-center justify-between p-4 bg-[#1f2937]/35 hover:bg-slate-800/40 border border-gray-850 rounded-xl text-left transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600/15 rounded-lg text-blue-400 border border-blue-500/15">
                          <UserIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-white text-xs font-bold uppercase tracking-wider font-display">
                            Basic Details (My Profile)
                          </h4>
                          <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">
                            Update Password, display Mobile & Email details
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">→</span>
                    </button>

                    {/* Rules Button */}
                    <button
                      onClick={() => setProfileSubView("rules")}
                      className="w-full flex items-center justify-between p-4 bg-[#1f2937]/35 hover:bg-slate-800/40 border border-gray-850 rounded-xl text-left transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-600/15 rounded-lg text-purple-400 border border-purple-500/15">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-white text-xs font-bold uppercase tracking-wider font-display">
                            All Rules (খেলার নিয়মাবলী)
                          </h4>
                          <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">
                            DRX platform rule sets and agreements
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">→</span>
                    </button>

                    <div className="pt-6">
                      <button
                        onClick={handleLogout}
                        className="w-full bg-[#D12053] hover:bg-[#b01844] text-white p-3.5 rounded-full text-xs font-bold tracking-wider transition-all flex items-center justify-center gap-2 shadow-md uppercase font-display"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>

                    <div className="pt-4 text-center">
                      <button
                        onClick={() => setShowAdminAuthModal(true)}
                        className="text-[10.5px] text-gray-500 hover:text-gray-300 font-mono tracking-wider transition-colors cursor-pointer"
                      >
                        admin panel (Only admin and Modaretor Access)
                      </button>
                    </div>
                  </div>
                ) : null}

                {/* Sub View: ALL RULES VIEW */}
                {profileSubView === "rules" && (
                  <div className="p-4 space-y-4">
                    <button
                      onClick={() => setProfileSubView("menu")}
                      className="flex items-center justify-center py-2 px-4 rounded-xl bg-[#D12053] hover:bg-[#b01642] text-xs text-white font-extrabold transition-all transform active:scale-95 cursor-pointer relative z-50 shadow-md gap-1"
                    >
                      ← BACK TO OPTIONS
                    </button>
                    <RulesView />
                  </div>
                )}

                {/* Sub View: BASIC DETAILS VIEW (Matches image 3 details) */}
                {profileSubView === "details" && (
                  <div className="p-4 space-y-4 font-sans animate-fadeIn">
                    <button
                      onClick={() => setProfileSubView("menu")}
                      className="flex items-center justify-center py-2 px-4 rounded-xl bg-[#D12053] hover:bg-[#b01642] text-xs text-white font-extrabold transition-all transform active:scale-95 cursor-pointer relative z-50 shadow-md gap-1"
                    >
                      ← BACK TO OPTIONS
                    </button>

                    {/* Main Avatar and text block (Image 3 look) */}
                    <div className="bg-[#1f1f23]/45 border border-gray-800 rounded-3xl p-6 text-center text-white relative">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-[#121214] border border-gray-800 flex items-center justify-center text-[#111827] mb-3 overflow-hidden shadow-inner">
                          <div className="text-sky-500 border border-sky-400 p-2 rounded-full">
                            <UserIcon className="w-8 h-8" />
                          </div>
                        </div>
                        <h2 className="text-lg font-black tracking-wide uppercase">
                          {user.username}
                        </h2>
                        <span className="text-xs text-gray-400 font-mono lower">
                          {user.email}
                        </span>
                      </div>
                    </div>

                    {/* Basic Details card (Screenshot 3 card 2) */}
                    <div className="bg-[#1f1f23]/45 border border-gray-800 rounded-3xl p-6 space-y-4">
                      <div className="flex items-center gap-2 text-gray-300 font-bold border-b border-gray-800 pb-2 mb-2 text-xs">
                        <UserIcon className="w-4 h-4 text-gray-400" />
                        Basic Details
                      </div>

                      <div className="space-y-4 text-xs font-sans">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-[#121214] border border-gray-800 text-gray-400 rounded-full">
                            <UserIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-500 block uppercase font-mono">
                              Username
                            </span>
                            <span className="text-gray-200 font-bold select-all uppercase">
                              {user.username}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-[#121214] border border-gray-800 text-gray-400 text-sky-400 rounded-full">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-500 block uppercase font-mono">
                              Email
                            </span>
                            <span className="text-gray-200">
                              {user.email || "sa**80@gmail.com"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-[#121214] border border-gray-800 text-gray-400 rounded-full">
                            <Smartphone className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-500 block uppercase font-mono">
                              Mobile Number
                            </span>
                            <span className="text-gray-200 font-mono select-all text-sky-400 font-bold">
                              {user.mobile || "01685482525"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Password change form (Matches spec) */}
                    <form
                      onSubmit={handlePasswordChangeSubmit}
                      className="bg-[#1f1f23]/45 border border-gray-800 rounded-3xl p-6 space-y-4"
                    >
                      <div className="flex items-center gap-2 text-gray-300 font-bold border-b border-gray-800 pb-2 mb-2 text-xs">
                        <Lock className="w-4 h-4 text-gray-400" />
                        Password Change
                      </div>

                      <div className="space-y-3 font-mono">
                        <div className="relative">
                          <input
                            type={showOldPass ? "text" : "password"}
                            value={currentPasswordInput}
                            onChange={(e) =>
                              setCurrentPasswordInput(e.target.value)
                            }
                            placeholder="Current Password"
                            className="bg-[#121214] w-full p-3 px-4 rounded-xl border border-gray-850 text-xs text-gray-200 focus:border-red-500 outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setShowOldPass(!showOldPass)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                          >
                            {showOldPass ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>

                        <div className="relative">
                          <input
                            type={showNewPass ? "text" : "password"}
                            value={newPasswordInput}
                            onChange={(e) =>
                              setNewPasswordInput(e.target.value)
                            }
                            placeholder="New Password"
                            className="bg-[#121214] w-full p-3 px-4 rounded-xl border border-gray-850 text-xs text-gray-200 focus:border-red-500 outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPass(!showNewPass)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                          >
                            {showNewPass ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>

                        <div className="relative">
                          <input
                            type={showConfirmPass ? "text" : "password"}
                            value={confirmPasswordInput}
                            onChange={(e) =>
                              setConfirmPasswordInput(e.target.value)
                            }
                            placeholder="Confirm Password"
                            className="bg-[#121214] w-full p-3 px-4 rounded-xl border border-gray-850 text-xs text-gray-200 focus:border-red-500 outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPass(!showConfirmPass)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                          >
                            {showConfirmPass ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-[#18181c] hover:bg-[#232328] text-white p-3 rounded-xl text-xs font-bold transition uppercase tracking-wider font-display border border-gray-800"
                      >
                        Change Password
                      </button>
                    </form>
                  </div>
                )}

                {/* Sub View: WALLET MODULE DEPOSITS & CASH OUTS */}
                {profileSubView === "wallet" && (
                  <div className="p-4 space-y-4 animate-fadeIn">
                    <button
                      onClick={() => setProfileSubView("menu")}
                      className="flex items-center justify-center py-2 px-4 rounded-xl bg-[#D12053] hover:bg-[#b01642] text-xs text-white font-extrabold transition-all transform active:scale-95 cursor-pointer relative z-50 shadow-md gap-1"
                    >
                      ← BACK TO OPTIONS
                    </button>

                    {/* Available Balance block card (layout from image 2) */}
                    <div className="bg-[#1f1f23]/45 border border-gray-800/80 rounded-3xl p-6 text-center text-white relative">
                      <div className="flex flex-col items-center justify-center p-2">
                        <div className="text-amber-500 text-3xl mb-1 flex justify-center">
                          <WalletIcon className="w-9 h-9" />
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono tracking-widest block uppercase">
                          Available Balance
                        </span>
                        <h3 className="text-xl md:text-2xl font-black font-mono tracking-wider text-white uppercase mt-1">
                          BDT {user.balance}
                        </h3>
                      </div>
                    </div>

                    {/* WALLET SUB-TABS (DEPOSIT CASH / WITHDRAW CASH) */}
                    <div className="flex bg-[#121214] rounded-xl p-1 border border-gray-850">
                      <button
                        onClick={() => setWalletSubTab("deposit")}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition uppercase tracking-wider font-display ${
                          walletSubTab === "deposit"
                            ? "bg-red-600 text-white shadow"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        Add Money (ডিপোজিট)
                      </button>
                      <button
                        onClick={() => setWalletSubTab("withdraw")}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition uppercase tracking-wider font-display ${
                          walletSubTab === "withdraw"
                            ? "bg-red-600 text-white shadow"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        Withdraw BDT (উইথড্র)
                      </button>
                    </div>

                    {/* DEPOSIT FORM VIEW */}
                    {walletSubTab === "deposit" && (
                      <div className="space-y-4 animate-fadeIn">
                        {/* Selected Payment channel method choice */}
                        <div className="space-y-2">
                          <span className="text-[10px] text-gray-400 uppercase font-mono block">
                            Select Payment Method
                          </span>
                          <div className="grid grid-cols-2 gap-3 font-display">
                            <button
                              type="button"
                              onClick={() => setDepositMethod("bKash")}
                              className={`p-3 p-y-4 rounded-xl border flex items-center justify-center gap-2 transition relative bg-slate-900/60 ${
                                depositMethod === "bKash"
                                  ? "border-[#D12053] ring-1 ring-[#D12053]"
                                  : "border-gray-800 hover:border-gray-700"
                              }`}
                            >
                              <span className="w-2.5 h-2.5 rounded-full bg-[#D12053]" />
                              <span className="text-xs font-black text-white">
                                bKash
                              </span>
                              {depositMethod === "bKash" && (
                                <span className="absolute top-1.5 right-1.5 bg-[#D12053] text-[#0f172a] rounded-full p-0.5 text-[7px] font-black">
                                  ✓
                                </span>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => setDepositMethod("Nagad")}
                              className={`p-3 p-y-4 rounded-xl border flex items-center justify-center gap-2 transition relative bg-slate-900/60 ${
                                depositMethod === "Nagad"
                                  ? "border-orange-500 ring-1 ring-orange-500"
                                  : "border-gray-800 hover:border-gray-700"
                              }`}
                            >
                              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                              <span className="text-xs font-black text-white">
                                Nagad
                              </span>
                              {depositMethod === "Nagad" && (
                                <span className="absolute top-1.5 right-1.5 bg-orange-500 text-center text-[#0f172a] rounded-full p-0.5 text-[7px] font-black">
                                  ✓
                                </span>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* INSTRUCTIONS IN BENGALI WITH THE DYNAMIC CLICK TO COPY TARGET NUMBER (as specified) */}
                        <div className="bg-[#eb1d53] text-white p-5 rounded-2xl space-y-3 shadow text-xs leading-relaxed font-sans select-text">
                          <p className="text-center font-bold uppercase tracking-wider text-[11px] border-b border-white/20 pb-1.5 font-display">
                            ট্রানজেকশন কাস্টম নির্দেশিকা
                          </p>

                          <div className="space-y-2">
                            <p>
                              ১. *২৪৭# ডায়াল করে আপনার {depositMethod} মোবাইল
                              মেনুতে যান অথবা {depositMethod} অ্যাপে যান।
                            </p>
                            <p>
                              ২.{" "}
                              <strong className="underline">
                                Send Money/Make Payment
                              </strong>{" "}
                              - এ ক্লিক করুন।
                            </p>
                            <p>
                              ৩. গ্রাহক নম্বর হিসেবে নিচের এই নম্বরটি লিখুন।
                              নম্বরটিতে ক্লিক করলেই কপি হয়ে যাবে:
                            </p>

                            {/* Copyable Target Number */}
                            <button
                              type="button"
                              onClick={() =>
                                handleCopyToClipboard(
                                  depositMethod === "bKash"
                                    ? settings.bkashNumber
                                    : settings.nagadNumber
                                )
                              }
                              className="w-full bg-black/35 hover:bg-black/50 p-2.5 rounded-xl flex items-center justify-between text-white border border-white/10 font-mono font-bold text-center group cursor-pointer"
                              title="Click to copy number"
                            >
                              <div className="text-left">
                                <span className="block text-[8px] text-white/70 uppercase tracking-widest font-sans font-extrabold">
                                  {depositMethod === "bKash" ? settings.bkashType : settings.nagadType} NUMBER:
                                </span>
                                <span className="text-xs font-mono font-black text-white selection:bg-rose-500">
                                  {depositMethod === "bKash" ? settings.bkashNumber : settings.nagadNumber}
                                </span>
                              </div>
                              <span className="text-[9px] font-mono uppercase bg-white/20 px-1.5 py-1 rounded flex items-center gap-0.5">
                                <Copy className="w-3 h-3" />
                                {copiedText ? "COPIED" : "COPY"}
                              </span>
                            </button>

                            <p>
                              ৪. নিশ্চিত করতে এখন আপনার {depositMethod} মোবাইল
                              সিকিউরিটি পিন লিখুন।
                            </p>
                            <p>
                              ৫. এখন নিচের বক্সে আপনার Transaction ID এবং Amount
                              দিয়ে VERIFY বাটনে ক্লিক করুন।
                            </p>
                          </div>
                        </div>

                        {/* INPUT FIELDS */}
                        <form
                          onSubmit={handleDepositSubmit}
                          className="space-y-4"
                        >
                          <div className="bg-[#121214] p-5 rounded-2xl border border-gray-850 space-y-3.5">
                            <div>
                              <label className="text-[10px] text-gray-400 font-mono block mb-1 uppercase">
                                Amount to Deposit (TK)
                              </label>
                              <input
                                type="number"
                                value={depositAmount}
                                onChange={(e) =>
                                  setDepositAmount(e.target.value)
                                }
                                placeholder="টাকার পরিমাণ লিখুন (eg. 500)"
                                className="bg-slate-900 w-full p-3 px-4 rounded-xl border border-gray-850 text-xs text-white"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] text-gray-400 font-mono block mb-1 uppercase">
                                Transaction ID
                              </label>
                              <input
                                type="text"
                                value={depositTxId}
                                onChange={(e) => setDepositTxId(e.target.value)}
                                placeholder="যেমন: 8XJ457A9"
                                className="bg-slate-900 w-full p-3 px-4 rounded-xl border border-gray-850 text-xs text-white font-mono uppercase"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="w-full bg-[#18181c] border border-gray-850 hover:bg-[#232328] text-white p-3 rounded-full text-xs font-bold uppercase tracking-wider font-display text-center leading-none"
                          >
                            VERIFY
                          </button>
                        </form>
                      </div>
                    )}

                    {/* WITHDRAWAL FORM VIEW */}
                    {walletSubTab === "withdraw" && (
                      <div className="space-y-4 animate-fadeIn">
                        {/* Select withdrawal payment channel (Rocket is removed) */}
                        <div className="space-y-2">
                          <span className="text-[10px] text-gray-400 uppercase font-mono block">
                            Select Payment Method
                          </span>
                          <div className="grid grid-cols-2 gap-3 font-display">
                            <button
                              type="button"
                              onClick={() => setWithdrawMethod("bKash")}
                              className={`p-3 py-4 rounded-xl border flex items-center justify-center gap-2 transition relative bg-slate-900/60 ${
                                withdrawMethod === "bKash"
                                  ? "border-[#D12053] ring-1 ring-[#D12053]"
                                  : "border-gray-800 hover:border-gray-700"
                              }`}
                            >
                              <span className="w-2.5 h-2.5 rounded-full bg-[#D12053]" />
                              <span className="text-xs font-black text-white">
                                bKash
                              </span>
                              {withdrawMethod === "bKash" && (
                                <span className="absolute top-1.5 right-1.5 bg-[#D12053] text-[#0f172a] rounded-full p-0.5 text-[7px] font-black">
                                  ✓
                                </span>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => setWithdrawMethod("Nagad")}
                              className={`p-3 py-4 rounded-xl border flex items-center justify-center gap-2 transition relative bg-slate-900/60 ${
                                withdrawMethod === "Nagad"
                                  ? "border-orange-500 ring-1 ring-orange-500"
                                  : "border-gray-800 hover:border-gray-700"
                              }`}
                            >
                              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                              <span className="text-xs font-black text-white">
                                Nagad
                              </span>
                              {withdrawMethod === "Nagad" && (
                                <span className="absolute top-1.5 right-1.5 bg-orange-500 text-[#0f172a] rounded-full p-0.5 text-[7px] font-black">
                                  ✓
                                </span>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Minimum limits warning card (Screenshot 2 look) */}
                        <div className="bg-amber-600/10 border border-amber-500/20 p-4 rounded-2xl flex items-center gap-3 text-xs text-amber-500 font-bold font-sans">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/10 text-center leading-5 text-[10px]">
                            !
                          </span>
                          <span>MINIMUM WITHDRAW 100 TK</span>
                        </div>

                        {/* Withdraw Input Box Form */}
                        <form
                          onSubmit={handleWithdrawSubmit}
                          className="space-y-4"
                        >
                          <div className="bg-[#121214] p-5 rounded-2xl border border-gray-850 space-y-3.5 text-xs">
                            <div>
                              <label className="text-[10px] text-gray-400 font-mono block mb-1 uppercase">
                                Mobile Number
                              </label>
                              <input
                                type="text"
                                value={withdrawMobile}
                                onChange={(e) =>
                                  setWithdrawMobile(e.target.value)
                                }
                                placeholder="যেমন: 017XXXXXXXX"
                                className="bg-slate-900 w-full p-3 px-4 rounded-xl border border-gray-850 text-xs text-white"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] text-gray-400 font-mono block mb-1 uppercase">
                                Amount to Withdraw
                              </label>
                              <input
                                type="number"
                                value={withdrawAmount}
                                onChange={(e) =>
                                  setWithdrawAmount(e.target.value)
                                }
                                placeholder="টাকার পরিমাণ লিখুন ( eg. 150 )"
                                className="bg-slate-900 w-full p-3 px-4 rounded-xl border border-gray-850 text-xs text-white"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="w-full bg-[#10b981] hover:bg-[#059669] text-[#0f172a] p-3 rounded-full text-xs font-extrabold uppercase tracking-wide font-display text-center leading-none"
                          >
                            Withdraw Money
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* BOTTOM GLOBAL STYLISH NAVIGATION BAR (Shop and Results are deleted!) */}
        {user && (
          <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur border-t border-gray-200 p-2 flex justify-around items-center z-30 select-none shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
            <button
              onClick={() => {
                setActiveTab("play");
                setSelectedCategory(null);
                setExpandedMatchId(null);
              }}
              className={`flex flex-col items-center gap-1 py-1 px-3.5 rounded-xl transition ${
                activeTab === "play"
                  ? "text-sky-600 font-bold"
                  : "text-gray-450 hover:text-gray-650"
              }`}
            >
              <Gamepad2 className="w-5 h-5 stroke-[2.2]" />
              <span className="text-[9px] font-display uppercase tracking-widest leading-none font-bold">
                Play
              </span>
            </button>

            <button
              onClick={() => setActiveTab("my_matches")}
              className={`flex flex-col items-center gap-1 py-1 px-3.5 rounded-xl transition ${
                activeTab === "my_matches"
                  ? "text-sky-600 font-bold"
                  : "text-gray-450 hover:text-gray-650"
              }`}
            >
              <Calendar className="w-5 h-5 stroke-[2.2]" />
              <span className="text-[9px] font-display uppercase tracking-widest leading-none font-bold">
                My Match
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab("transactions");
                if (user?.username) {
                  fetchClientTransactions(user.username);
                }
              }}
              className={`flex flex-col items-center gap-1 py-1 px-3.5 rounded-xl transition ${
                activeTab === "transactions"
                  ? "text-sky-600 font-bold"
                  : "text-gray-455 hover:text-gray-650"
              }`}
            >
              <History className="w-5 h-5 stroke-[2.2]" />
              <span className="text-[9px] font-display uppercase tracking-widest leading-none font-bold">
                Transactions
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab("profile");
                setProfileSubView("menu");
              }}
              className={`flex flex-col items-center gap-1 py-1 px-3.5 rounded-xl transition ${
                activeTab === "profile"
                  ? "text-sky-600 font-bold"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <UserIcon className="w-5 h-5 stroke-[2.2]" />
              <span className="text-[9px] font-display uppercase tracking-widest leading-none font-bold">
                Profile
              </span>
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
