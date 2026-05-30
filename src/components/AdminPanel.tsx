import React, { useState, useEffect } from "react";
import { Match, User, DepositRequest, WithdrawRequest } from "../types.ts";
import {
  Key,
  Users,
  Trophy,
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
  Layers,
  Check,
  X,
  ShieldAlert,
  PlusCircle,
  Trash2,
} from "lucide-react";

interface AdminPanelProps {
  onAddToast: (text: string, type: "success" | "error" | "info") => void;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  onAddToast,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<
    "rooms" | "deposits" | "withdrawals" | "players" | "settings"
  >("rooms");
  const [users, setUsers] = useState<User[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawRequest[]>([]);
  const [loading, setLoading] = useState(false);

  // States for system settings (marquee notice, bkash, nagad, etc.)
  const [marqueeNotice, setMarqueeNotice] = useState("");
  const [bkashNumber, setBkashNumber] = useState("");
  const [bkashType, setBkashType] = useState("Send Money (Personal)");
  const [nagadNumber, setNagadNumber] = useState("");
  const [nagadType, setNagadType] = useState("Send Money (Personal)");
  const [youtubeLink, setYoutubeLink] = useState("");
  const [telegramLink, setTelegramLink] = useState("");
  const [whatsappLink, setWhatsappLink] = useState("");

  // States for match room controls edit
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [roomPassInput, setRoomPassInput] = useState("");

  // States for player stats edit
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [balanceInput, setBalanceInput] = useState("");
  const [joinedInput, setJoinedInput] = useState("");
  const [wonInput, setWonInput] = useState("");

  // States for add admin (updated to email)
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassKey, setAdminPassKey] = useState("");

  // States for adding a new match
  const [showAddMatchForm, setShowAddMatchForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<Match["category"]>("BR Match");
  const [newStartTimeInput, setNewStartTimeInput] = useState("");
  const [newWinPrize, setNewWinPrize] = useState("600");
  const [newEntryType, setNewEntryType] = useState("SOLO");
  const [newEntryFee, setNewEntryFee] = useState("60");
  const [newPerKill, setNewPerKill] = useState("10");
  const [newMap, setNewMap] = useState("BERMUDA");
  const [newVersion, setNewVersion] = useState("MOBILE");
  const [newTotalSpots, setNewTotalSpots] = useState("48");

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/data");
      const data = await response.json();
      if (data.success) {
        setUsers(data.users || []);
        setMatches(data.matches || []);
        setDeposits(data.deposits || []);
        setWithdrawals(data.withdrawals || []);
        if (data.settings) {
          setMarqueeNotice(data.settings.marqueeNotice || "");
          setBkashNumber(data.settings.bkashNumber || "");
          setBkashType(data.settings.bkashType || "Send Money (Personal)");
          setNagadNumber(data.settings.nagadNumber || "");
          setNagadType(data.settings.nagadType || "Send Money (Personal)");
          setYoutubeLink(data.settings.youtubeLink || "");
          setTelegramLink(data.settings.telegramLink || "");
          setWhatsappLink(data.settings.whatsappLink || "");
        }
      } else {
        onAddToast("Failed to load admin data: " + data.message, "error");
      }
    } catch (err: any) {
      onAddToast(
        "Network error getting admin panel logs: " + err.message,
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateRoom = async (matchId: string) => {
    if (!roomCodeInput.trim() || !roomPassInput.trim()) {
      onAddToast("Room code and password cannot be empty!", "error");
      return;
    }
    try {
      const response = await fetch("/api/admin/update-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId,
          roomCode: roomCodeInput,
          roomPass: roomPassInput,
        }),
      });
      const data = await response.json();
      if (data.success) {
        onAddToast("Successfully saved room details!", "success");
        setEditingMatchId(null);
        fetchData();
      } else {
        onAddToast("Failed saving room code: " + data.message, "error");
      }
    } catch (err: any) {
      onAddToast("Error: " + err.message, "error");
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marqueeNotice,
          bkashNumber,
          bkashType,
          nagadNumber,
          nagadType,
          youtubeLink,
          telegramLink,
          whatsappLink,
        }),
      });
      const data = await response.json();
      if (data.success) {
        onAddToast(data.message || "কনফিগারেশন সফলভাবে সংরক্ষণ করা হয়েছে!", "success");
        fetchData();
      } else {
        onAddToast("সংরক্ষণ করা যায়নি: " + data.message, "error");
      }
    } catch (err: any) {
      onAddToast("Error saving config settings: " + err.message, "error");
    }
  };

  const handleApproveDeposit = async (depId: string) => {
    try {
      const response = await fetch("/api/admin/approve-deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ depositId: depId }),
      });
      const data = await response.json();
      if (data.success) {
        onAddToast("Deposit request approved & funds credited!", "success");
        fetchData();
      } else {
        onAddToast(data.message, "error");
      }
    } catch (err: any) {
      onAddToast(err.message, "error");
    }
  };

  const handleRejectDeposit = async (depId: string) => {
    try {
      const response = await fetch("/api/admin/reject-deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ depositId: depId }),
      });
      const data = await response.json();
      if (data.success) {
        onAddToast("Deposit transaction rejected.", "info");
        fetchData();
      } else {
        onAddToast(data.message, "error");
      }
    } catch (err: any) {
      onAddToast(err.message, "error");
    }
  };

  const handleApproveWithdrawal = async (witId: string) => {
    try {
      const response = await fetch("/api/admin/approve-withdrawal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ withdrawId: witId }),
      });
      const data = await response.json();
      if (data.success) {
        onAddToast("Withdraw request marked as cleared!", "success");
        fetchData();
      } else {
        onAddToast(data.message, "error");
      }
    } catch (err: any) {
      onAddToast(err.message, "error");
    }
  };

  const handleRejectWithdrawal = async (witId: string) => {
    try {
      const response = await fetch("/api/admin/reject-withdrawal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ withdrawId: witId }),
      });
      const data = await response.json();
      if (data.success) {
        onAddToast(
          "Withdrawal rejected & refunded to player profile balance!",
          "info",
        );
        fetchData();
      } else {
        onAddToast(data.message, "error");
      }
    } catch (err: any) {
      onAddToast(err.message, "error");
    }
  };

  const handleSaveUserStats = async () => {
    if (!selectedUser) return;
    try {
      const response = await fetch("/api/admin/update-user-stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUsername: selectedUser.id || selectedUser.username,
          balance: parseFloat(balanceInput) || 0,
          joinedCount: parseInt(joinedInput) || 0,
          totalWon: parseFloat(wonInput) || 0,
        }),
      });
      const data = await response.json();
      if (data.success) {
        onAddToast(`Stats saved for ${selectedUser.username}!`, "success");
        setSelectedUser(null);
        setSearchQuery("");
        fetchData();
      } else {
        onAddToast(data.message, "error");
      }
    } catch (err: any) {
      onAddToast(err.message, "error");
    }
  };

  const handleAddAdmin = async () => {
    if (!adminEmail.trim() || !adminPassKey.trim()) {
      onAddToast(
        "অনুগ্রহ করে ইমেইল এবং সিক্রেট মাস্টার পাসওয়ার্ড উভয়ই দিন!",
        "error",
      );
      return;
    }
    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail, password: adminPassKey }),
      });
      const data = await response.json();
      if (data.success) {
        onAddToast(
          `ইমেইল ${adminEmail} এর অ্যাকাউন্টটি সফলভাবে এডমিন হিসেবে উন্নীত করা হয়েছে!`,
          "success",
        );
        setAdminEmail("");
        setAdminPassKey("");
        fetchData();
      } else {
        onAddToast("এডমিন অনুমোদন ব্যর্থ: " + data.message, "error");
      }
    } catch (err: any) {
      onAddToast("সংযোগ ব্যর্থতা: " + err.message, "error");
    }
  };

  const handleAddMatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newStartTimeInput) {
      onAddToast("ম্যাচের নাম এবং শুরু হওয়ার সময় অবশ্যই দিতে হবে!", "error");
      return;
    }
    const startTimeMs = new Date(newStartTimeInput).getTime();
    if (isNaN(startTimeMs)) {
      onAddToast("শুরু হওয়ার সময়টি সঠিক নয়!", "error");
      return;
    }
    try {
      const response = await fetch("/api/admin/add-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          category: newCategory,
          startTime: startTimeMs,
          winPrize: parseFloat(newWinPrize) || 0,
          entryType: newEntryType,
          entryFee: parseFloat(newEntryFee) || 0,
          perKill: parseFloat(newPerKill) || 0,
          map: newMap,
          version: newVersion,
          totalSpots: parseInt(newTotalSpots) || 48,
        }),
      });
      const data = await response.json();
      if (data.success) {
        onAddToast("নতুন ম্যাচ সফলভাবে যুক্ত করা হয়েছে!", "success");
        setNewTitle("");
        setNewStartTimeInput("");
        setShowAddMatchForm(false);
        fetchData();
      } else {
        onAddToast("ম্যাচ যোগ করতে ব্যর্থ: " + data.message, "error");
      }
    } catch (err: any) {
      onAddToast("নেটওয়ার্ক সমস্যা: " + err.message, "error");
    }
  };

  const handleDeleteMatch = async (matchId: string) => {
    try {
      const response = await fetch("/api/admin/delete-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId }),
      });
      const data = await response.json();
      if (data.success) {
        onAddToast("ম্যাচটি সফলভাবে ডিলিট করা হয়েছে!", "success");
        fetchData();
      } else {
        onAddToast("ম্যাচ ডিলিট করতে ব্যর্থ: " + data.message, "error");
      }
    } catch (err: any) {
      onAddToast("নেটওয়ার্ক সমস্যা: " + err.message, "error");
    }
  };

  const pendingDeposits = deposits.filter((d) => d.status === "PENDING");
  const pendingWithdraws = withdrawals.filter((w) => w.status === "PENDING");

  return (
    <div className="fixed inset-0 bg-[#0f172a] text-white overflow-y-auto p-4 md:p-8 z-40 font-sans border-t-4 border-red-500">
      <div className="max-w-6xl mx-auto">
        {/* Header bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-800 pb-6 mb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 text-red-500 mb-1">
              <ShieldAlert className="w-5 h-5" />
              <span className="text-xs font-mono tracking-widest font-bold uppercase">
                System Console
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-white">
              DRX Admin Dashboard Panel
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 p-2 px-3 rounded-lg bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 font-mono text-xs transition-colors"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
              />
              RELOAD DATA
            </button>
            <button
              onClick={onClose}
              className="p-2 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold font-display transition-colors"
            >
              EXIT ADMIN PANEL
            </button>
          </div>
        </div>

        {/* Dashboard quick stats counters */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#1e293b] p-4 rounded-xl border border-gray-800 flex items-center gap-3">
            <div className="p-2 bg-blue-600/10 rounded-lg text-blue-500">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-mono uppercase">
                Total Users
              </p>
              <p className="text-xl font-bold font-mono">{users.length}</p>
            </div>
          </div>

          <div className="bg-[#1e293b] p-4 rounded-xl border border-gray-800 flex items-center gap-3">
            <div className="p-2 bg-purple-600/10 rounded-lg text-purple-500">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-mono uppercase">
                Tournaments
              </p>
              <p className="text-xl font-bold font-mono">{matches.length}</p>
            </div>
          </div>

          <div className="bg-[#1e293b] p-4 rounded-xl border border-gray-800 flex items-center gap-3 relative">
            <div className="p-2 bg-emerald-600/10 rounded-lg text-emerald-500">
              <ArrowUpCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-mono uppercase">
                Deposits Pending
              </p>
              <p className="text-xl font-bold font-mono text-emerald-400">
                {pendingDeposits.length}
              </p>
            </div>
            {pendingDeposits.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            )}
          </div>

          <div className="bg-[#1e293b] p-4 rounded-xl border border-gray-800 flex items-center gap-3 relative">
            <div className="p-2 bg-amber-600/10 rounded-lg text-amber-500">
              <ArrowDownCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-mono uppercase">
                Withdraws Pending
              </p>
              <p className="text-xl font-bold font-mono text-amber-400">
                {pendingWithdraws.length}
              </p>
            </div>
            {pendingWithdraws.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            )}
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-gray-800 mb-6 font-display overflow-x-auto whitespace-nowrap">
          <button
            onClick={() => setActiveTab("rooms")}
            className={`py-3 px-5 border-b-2 font-bold text-sm transition-colors ${
              activeTab === "rooms"
                ? "border-red-500 text-red-500 bg-red-500/5"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            Match Room Details ({matches.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("deposits");
              fetchData();
            }}
            className={`py-3 px-5 border-b-2 font-bold text-sm transition-colors flex items-center gap-2 ${
              activeTab === "deposits"
                ? "border-red-500 text-red-500 bg-red-500/5"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            Deposit Approvals
            {pendingDeposits.length > 0 && (
              <span className="bg-emerald-500 text-[#0f172a] font-mono font-black text-[10px] px-1.5 py-0.5 rounded-full">
                {pendingDeposits.length}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab("withdrawals");
              fetchData();
            }}
            className={`py-3 px-5 border-b-2 font-bold text-sm transition-colors flex items-center gap-2 ${
              activeTab === "withdrawals"
                ? "border-red-500 text-red-500 bg-red-500/5"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            Withdraw Approvals
            {pendingWithdraws.length > 0 && (
              <span className="bg-amber-500 text-[#0f172a] font-mono font-black text-[10px] px-1.5 py-0.5 rounded-full">
                {pendingWithdraws.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("players")}
            className={`py-3 px-5 border-b-2 font-bold text-sm transition-colors ${
              activeTab === "players"
                ? "border-red-500 text-red-500 bg-red-500/5"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            Player Profiles Manage
          </button>
          <button
            onClick={() => {
              setActiveTab("settings");
              fetchData();
            }}
            className={`py-3 px-5 border-b-2 font-bold text-sm transition-colors ${
              activeTab === "settings"
                ? "border-red-500 text-red-500 bg-red-500/5"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            ⚙️ App Configuration Settings
          </button>
        </div>

        {/* Tab Contents */}

        {/* Tab 1: Match Room details setter */}
        {activeTab === "rooms" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-800 pb-3 mb-2">
              <div>
                <h3 className="text-md font-mono text-gray-400 uppercase tracking-widest font-bold">
                  Live esports room code management
                </h3>
                <p className="text-xs text-gray-500">
                  এখানে আপনি বর্তমান ম্যাচগুলোর রুম কোড এবং পাসওয়ার্ড অ্যাড করতে
                  পারেন অথবা নতুন ম্যাচ যুক্ত বা ডিলিট করতে পারেন।
                </p>
              </div>
              <button
                onClick={() => setShowAddMatchForm(!showAddMatchForm)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-[#0f172a] font-extrabold text-xs rounded-xl tracking-wider transition-all shadow-md shrink-0 focus:outline-none"
              >
                <PlusCircle className="w-4 h-4" />
                {showAddMatchForm ? "ফরম বন্ধ করুন" : "নতুন ম্যাচ যোগ করুন"}
              </button>
            </div>

            {/* ADD NEW MATCH FORM */}
            {showAddMatchForm && (
              <form
                onSubmit={handleAddMatchSubmit}
                className="bg-[#111a2e] p-5 rounded-xl border border-emerald-500/30 shadow-xl space-y-4"
              >
                <div className="flex items-center gap-2 text-emerald-400 pb-2 border-b border-gray-800">
                  <PlusCircle className="w-5 h-5" />
                  <h4 className="font-bold font-mono uppercase tracking-wider text-xs">
                    নতুন টুর্নামেন্ট ম্যাচ সংক্রান্ত জটিল তথ্য দিন
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="text-gray-400 font-bold font-mono block mb-1 uppercase text-[10px]">
                      ম্যাচ টাইটেল (Match Name)
                    </label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="যেমন: BR MATCH | DAILY CUP ELITE"
                      className="bg-slate-900 w-full p-2.5 rounded border border-gray-700 text-white font-semibold outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 font-bold font-mono block mb-1 uppercase text-[10px]">
                      ক্যাটাগরি (Choose Category)
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) =>
                        setNewCategory(e.target.value as Match["category"])
                      }
                      className="bg-slate-900 w-full p-2.5 rounded border border-gray-700 text-white font-semibold outline-none focus:border-emerald-500"
                    >
                      <option value="BR Match">BR Match</option>
                      <option value="BR Survival">BR Survival</option>
                      <option value="Clash Squad">Clash Squad</option>
                      <option value="CS 2 VS 2">CS 2 VS 2</option>
                      <option value="LONE WOLF">LONE WOLF</option>
                      <option value="Free Match">Free Match</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 font-bold font-mono block mb-1 uppercase text-[10px]">
                      কখন শুরু হবে (Start Date & Time)
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={newStartTimeInput}
                      onChange={(e) => setNewStartTimeInput(e.target.value)}
                      className="bg-slate-900 w-full p-2.5 rounded border border-gray-700 text-white font-semibold outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 font-bold font-mono block mb-1 uppercase text-[10px]">
                      টোটাল প্রাইজ / উইন প্রাইজ TK
                    </label>
                    <input
                      type="number"
                      required
                      value={newWinPrize}
                      onChange={(e) => setNewWinPrize(e.target.value)}
                      placeholder="যেমন: 600"
                      className="bg-slate-900 w-full p-2.5 rounded border border-gray-700 text-white font-semibold outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 font-bold font-mono block mb-1 uppercase text-[10px]">
                      এন্ট্রি ফি (Entry Fee TK)
                    </label>
                    <input
                      type="number"
                      required
                      value={newEntryFee}
                      onChange={(e) => setNewEntryFee(e.target.value)}
                      placeholder="যেমন: 60"
                      className="bg-slate-900 w-full p-2.5 rounded border border-gray-700 text-white font-semibold outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 font-bold font-mono block mb-1 uppercase text-[10px]">
                      প্রতি কিল (Per Kill Reward TK)
                    </label>
                    <input
                      type="number"
                      required
                      value={newPerKill}
                      onChange={(e) => setNewPerKill(e.target.value)}
                      placeholder="যেমন: 10"
                      className="bg-slate-900 w-full p-2.5 rounded border border-gray-700 text-white font-semibold outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 font-bold font-mono block mb-1 uppercase text-[10px]">
                      ম্যাপ (Map Name)
                    </label>
                    <input
                      type="text"
                      required
                      value={newMap}
                      onChange={(e) => setNewMap(e.target.value)}
                      placeholder="যেমন: BERMUDA"
                      className="bg-slate-900 w-full p-2.5 rounded border border-gray-700 text-white font-semibold outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 font-bold font-mono block mb-1 uppercase text-[10px]">
                      এন্ট্রি টাইপ (Solo/Duo/Squad)
                    </label>
                    <select
                      value={newEntryType}
                      onChange={(e) => setNewEntryType(e.target.value)}
                      className="bg-slate-900 w-full p-2.5 rounded border border-gray-700 text-white font-semibold outline-none"
                    >
                      <option value="SOLO">SOLO</option>
                      <option value="DUO">DUO</option>
                      <option value="SQUAD">SQUAD</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 font-bold font-mono block mb-1 uppercase text-[10px]">
                      টোটাল স্পটস (Total Spots Limit)
                    </label>
                    <input
                      type="number"
                      required
                      value={newTotalSpots}
                      onChange={(e) => setNewTotalSpots(e.target.value)}
                      placeholder="যেমন: 48"
                      className="bg-slate-900 w-full p-2.5 rounded border border-gray-700 text-white font-semibold outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddMatchForm(false)}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-lg text-xs transition"
                  >
                    CANCEL (বাতিল)
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-[#0f172a] font-extrabold rounded-lg text-xs transition shadow-md"
                  >
                    CREATE TOUR MATCH (ম্যাচ তৈরি করুন)
                  </button>
                </div>
              </form>
            )}

            {matches.length === 0 ? (
              <p className="text-center font-mono text-gray-500 py-12 bg-[#1e293b] rounded-xl border border-gray-800">
                No active matches in database. Create one above!
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matches.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#1e293b] p-5 rounded-xl border border-gray-800 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-red-600/20 text-red-400 font-black uppercase">
                          {item.category}
                        </span>
                        <span className="text-xs text-gray-400 font-mono">
                          ID: {item.id}
                        </span>
                      </div>
                      <h4 className="font-bold text-white font-display mb-2">
                        {item.title}
                      </h4>

                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono mb-3 text-gray-400 bg-slate-900/40 p-2 rounded">
                        <div>
                          🕒 START:{" "}
                          <span className="text-white">
                            {new Date(item.startTime).toLocaleString()}
                          </span>
                        </div>
                        <div>
                          👥 TYPE:{" "}
                          <span className="text-white">{item.entryType}</span>
                        </div>
                        <div>
                          🎮 MAP: <span className="text-white">{item.map}</span>
                        </div>
                        <div>
                          🎟️ FEE:{" "}
                          <span className="text-white">{item.entryFee} TK</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs font-mono my-3 bg-slate-900/60 p-3 rounded-lg border border-gray-800/80">
                        <div>
                          <span className="text-gray-500 block">
                            CURRENT CODE:
                          </span>
                          <span
                            className={`font-bold ${item.roomCode === "PENDING" ? "text-amber-500" : "text-emerald-400"}`}
                          >
                            {item.roomCode}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">
                            CURRENT PASS:
                          </span>
                          <span
                            className={`font-bold ${item.roomPass === "PENDING" ? "text-amber-500" : "text-emerald-400"}`}
                          >
                            {item.roomPass}
                          </span>
                        </div>
                      </div>
                    </div>

                    {editingMatchId === item.id ? (
                      <div className="mt-4 pt-4 border-t border-gray-800 flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-gray-400 font-mono block mb-1">
                              ROOM CODE
                            </label>
                            <input
                              type="text"
                              value={roomCodeInput}
                              onChange={(e) => setRoomCodeInput(e.target.value)}
                              placeholder="Enter Code (eg. 12450)"
                              className="bg-slate-900 w-full p-2 rounded border border-gray-700 text-xs text-white uppercase"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-400 font-mono block mb-1">
                              ROOM PASS
                            </label>
                            <input
                              type="text"
                              value={roomPassInput}
                              onChange={(e) => setRoomPassInput(e.target.value)}
                              placeholder="Enter Pass (eg. 5566)"
                              className="bg-slate-900 w-full p-2 rounded border border-gray-700 text-xs text-white"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateRoom(item.id)}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 p-2 text-xs font-bold text-[#0f172a] rounded transition-colors"
                          >
                            SAVE ROOM INFO
                          </button>
                          <button
                            onClick={() => setEditingMatchId(null)}
                            className="px-3 bg-gray-800 hover:bg-gray-700 p-2 text-xs font-bold text-gray-400 hover:text-white rounded transition-colors"
                          >
                            CANCEL
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => {
                            setEditingMatchId(item.id);
                            setRoomCodeInput(item.roomCode);
                            setRoomPassInput(item.roomPass);
                          }}
                          className="flex-1 bg-red-600 hover:bg-red-700 p-2 text-xs font-bold rounded text-white transition-colors uppercase font-mono tracking-wider"
                        >
                          EDIT ROOM DETAILS
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMatch(item.id)}
                          className="bg-slate-800 hover:bg-red-900/30 p-2 text-xs font-bold rounded text-red-500 border border-red-500/20 hover:border-red-500/50 transition-all flex items-center justify-center aspect-square"
                          title="ম্যাচ ডিলিট করুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Deposit approvals (add money verifications) */}
        {activeTab === "deposits" && (
          <div className="space-y-4">
            <h3 className="text-md font-mono text-gray-400 uppercase tracking-widest mb-2 font-bold">
              User Deposit (Add Money) Verification
            </h3>

            {deposits.length === 0 ? (
              <p className="text-center font-mono text-gray-500 py-12">
                No deposit transactions logged in system.
              </p>
            ) : (
              <div className="overflow-x-auto bg-[#1e293b] rounded-xl border border-gray-800">
                <table className="w-full text-left font-sans text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-700">
                      <th className="p-4">Date & Time</th>
                      <th className="p-4">Sender Username</th>
                      <th className="p-4">Payment Channel</th>
                      <th className="p-4 text-right">TK Amount</th>
                      <th className="p-4">Transaction ID</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {deposits.map((dep) => (
                      <tr key={dep.id} className="hover:bg-slate-800/50">
                        <td className="p-4 font-mono text-gray-400">
                          {new Date(dep.timestamp).toLocaleString()}
                        </td>
                        <td className="p-4 font-bold text-white uppercase">
                          {dep.username}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${dep.method === "bKash" ? "bg-[#D12053]/20 text-[#D12053]" : "bg-orange-500/20 text-orange-400"}`}
                          >
                            {dep.method}
                          </span>
                        </td>
                        <td className="p-4 text-right font-mono font-bold text-emerald-400">
                          {dep.amount} TK
                        </td>
                        <td className="p-4 font-mono font-bold text-gray-300 break-all select-all">
                          {dep.transactionId}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider ${
                              dep.status === "APPROVED"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : dep.status === "REJECTED"
                                  ? "bg-red-500/20 text-red-400"
                                  : "bg-amber-500/20 text-amber-500 animate-pulse"
                            }`}
                          >
                            {dep.status}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          {dep.status === "PENDING" ? (
                            <div className="flex gap-1.5 justify-center">
                              <button
                                onClick={() => handleApproveDeposit(dep.id)}
                                className="p-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 rounded text-[10px] font-bold text-[#0f172a] hover:scale-105 transition-transform"
                                title="Approve & Add TK"
                              >
                                APPROVE
                              </button>
                              <button
                                onClick={() => handleRejectDeposit(dep.id)}
                                className="p-1 px-2.5 bg-red-600 hover:bg-red-700 rounded text-[10px] font-bold text-white hover:scale-105 transition-transform"
                                title="Reject Offer"
                              >
                                REJECT
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-gray-500 font-mono">
                              Processed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Withdrawals requests (send lists) */}
        {activeTab === "withdrawals" && (
          <div className="space-y-4">
            <h3 className="text-md font-mono text-gray-400 uppercase tracking-widest mb-2 font-bold">
              User Cashout (Withdraw) Requests
            </h3>

            {withdrawals.length === 0 ? (
              <p className="text-center font-mono text-gray-500 py-12">
                No withdrawals logged in system.
              </p>
            ) : (
              <div className="overflow-x-auto bg-[#1e293b] rounded-xl border border-gray-800">
                <table className="w-full text-left font-sans text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-700">
                      <th className="p-4">Date & Time</th>
                      <th className="p-4">Sender Username</th>
                      <th className="p-4">Payment Channel</th>
                      <th className="p-4">Send To Mobile</th>
                      <th className="p-4 text-right">TK Requested</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {withdrawals.map((wit) => (
                      <tr key={wit.id} className="hover:bg-slate-800/50">
                        <td className="p-4 font-mono text-gray-400">
                          {new Date(wit.timestamp).toLocaleString()}
                        </td>
                        <td className="p-4 font-bold text-white uppercase">
                          {wit.username}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${wit.method === "bKash" ? "bg-[#D12053]/20 text-[#D12053]" : "bg-orange-500/20 text-orange-400"}`}
                          >
                            {wit.method}
                          </span>
                        </td>
                        <td className="p-4 font-mono font-bold text-sky-400 select-all">
                          {wit.mobileNumber}
                        </td>
                        <td className="p-4 text-right font-mono font-bold text-red-400">
                          {wit.amount} TK
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider ${
                              wit.status === "APPROVED"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : wit.status === "REJECTED"
                                  ? "bg-red-500/20 text-red-500"
                                  : "bg-amber-500/20 text-amber-500 animate-pulse"
                            }`}
                          >
                            {wit.status}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          {wit.status === "PENDING" ? (
                            <div className="flex gap-1.5 justify-center">
                              <button
                                onClick={() => handleApproveWithdrawal(wit.id)}
                                className="p-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 rounded text-[10px] font-bold text-[#0f172a] hover:scale-105 transition-transform"
                                title="Mark as fully Sent to Player"
                              >
                                APPROVE
                              </button>
                              <button
                                onClick={() => handleRejectWithdrawal(wit.id)}
                                className="p-1 px-2.5 bg-red-600 hover:bg-red-700 rounded text-[10px] font-bold text-white hover:scale-105 transition-transform"
                                title="Reject and Refund TK to player"
                              >
                                REJECT (REFUND)
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-gray-500 font-mono">
                              Processed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Player profile controller */}
        {activeTab === "players" && (
          <div className="space-y-4 max-w-xl">
            <h3 className="text-md font-mono text-gray-400 uppercase tracking-widest font-bold">
              Search & Edit Player Statistics
            </h3>

            <div className="bg-[#1e293b] p-5 rounded-xl border border-gray-800 space-y-4">
              <div>
                <label className="text-xs text-gray-400 font-mono block mb-1">
                  SEARCH PLAYER USERNAME
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter Username (eg. ARAFI)"
                    className="bg-slate-900 flex-1 p-2 px-3 rounded border border-gray-700 text-sm text-white"
                  />
                  <button
                    onClick={() => {
                      const found = users.find(
                        (u) =>
                          u.username.toLowerCase() ===
                          searchQuery.trim().toLowerCase(),
                      );
                      if (found) {
                        setSelectedUser(found);
                        setBalanceInput(found.balance.toString());
                        setJoinedInput(found.joinedCount.toString());
                        setWonInput(found.totalWon.toString());
                        onAddToast(
                          `Loaded data for player ${found.username}`,
                          "info",
                        );
                      } else {
                        onAddToast(
                          "Username not found! Double check casing.",
                          "error",
                        );
                        setSelectedUser(null);
                      }
                    }}
                    className="bg-red-600 hover:bg-red-700 px-4 text-xs font-bold rounded text-white transition-colors"
                  >
                    SELECT PLAYER
                  </button>
                </div>
              </div>

              {selectedUser && (
                <div className="pt-4 border-t border-gray-800 space-y-4">
                  <div className="p-3 bg-red-600/10 rounded-lg border border-red-500/20 text-xs">
                    <span className="font-mono text-gray-400 block">
                      EDITING STATS FOR
                    </span>
                    <span className="font-bold text-white text-md uppercase">
                      {selectedUser.username}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-gray-400 font-mono block mb-1">
                        TK BALANCE
                      </label>
                      <input
                        type="number"
                        value={balanceInput}
                        onChange={(e) => setBalanceInput(e.target.value)}
                        className="bg-slate-900 w-full p-2 rounded border border-gray-700 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 font-mono block mb-1">
                        JOINED COUNT
                      </label>
                      <input
                        type="number"
                        value={joinedInput}
                        onChange={(e) => setJoinedInput(e.target.value)}
                        className="bg-slate-900 w-full p-2 rounded border border-gray-700 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 font-mono block mb-1">
                        TOTAL WON
                      </label>
                      <input
                        type="number"
                        value={wonInput}
                        onChange={(e) => setWonInput(e.target.value)}
                        className="bg-slate-900 w-full p-2 rounded border border-gray-700 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveUserStats}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 p-2 text-xs font-bold text-[#0f172a] rounded transition-colors"
                    >
                      SAVE PLAYER STATISTICS
                    </button>
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="px-4 bg-gray-800 hover:bg-gray-700 p-2 text-xs font-bold text-gray-400 hover:text-white rounded transition-colors"
                    >
                      CLEAR
                    </button>
                  </div>

                  {selectedUser.gameRegistrations && selectedUser.gameRegistrations.length > 0 && (
                    <div className="pt-4 border-t border-gray-800 space-y-2">
                      <span className="text-xs text-gray-400 font-mono block uppercase">
                        Registered Tournament Game IDs
                      </span>
                      <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                        {selectedUser.gameRegistrations.map((reg, idx) => {
                          const associatedMatch = matches.find(m => m.id === reg.matchId);
                          return (
                            <div key={idx} className="bg-slate-900/85 border border-gray-800 p-2.5 rounded-lg text-xs space-y-1">
                              <div className="flex justify-between font-bold text-[10.5px]">
                                <span className="text-sky-400 truncate max-w-[200px] uppercase">
                                  {associatedMatch ? associatedMatch.title : `Match (${reg.matchId})`}
                                </span>
                                <span className="text-gray-400 text-[10px]">
                                  {new Date(reg.timestamp).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-800 text-[10px] text-gray-300">
                                <div>
                                  <span className="text-gray-500 block text-[9px] uppercase">INGAME NAME:</span>
                                  <span className="font-bold text-white uppercase">{reg.gameIgn}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500 block text-[9px] uppercase">UID NO:</span>
                                  <span className="font-bold text-white font-mono">{reg.gameUid}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 5: App Configuration Settings (Notice, Wallets, Social contacts) */}
        {activeTab === "settings" && (
          <div className="space-y-5 animate-fadeIn">
            <div className="border-b border-gray-800 pb-3">
              <h3 className="text-md font-mono text-gray-400 uppercase tracking-widest font-bold">
                App General Settings & Dynamic Configuration
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                এখান থেকে যেকোনো পরিবর্তন সেভ করলেই তা সাথে সাথে পাবলিশ হওয়া মেইন ওয়েবসাইটে আপডেট হয়ে যাবে। কোন কোড বা লিঙ্ক চ্যাঞ্জ করতে হবে না।
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              {/* Marquee scroll notice bar */}
              <div className="bg-slate-900 border border-gray-800 p-4.5 rounded-xl space-y-3">
                <label className="text-xs font-bold text-gray-300 block uppercase font-mono tracking-wider">
                  📢 Marquee/Scrolling Notice Alert Text (হোম স্ক্রল নোটিশ)
                </label>
                <textarea
                  required
                  rows={2}
                  value={marqueeNotice}
                  onChange={(e) => setMarqueeNotice(e.target.value)}
                  placeholder="e.g. আমাদের টুর্নামেন্ট অ্যাপে আপনাদের স্বাগতম..."
                  className="bg-slate-950 w-full p-2.5 rounded border border-gray-700 text-xs text-white placeholder-gray-600 focus:border-red-500 outline-none font-sans"
                />
                
                {/* Notice preview block */}
                <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-lg text-amber-400 text-xs font-bold relative overflow-hidden select-none flex items-center justify-between">
                  <span className="bg-amber-600 text-white rounded px-1.5 py-0.5 text-[8.5px] font-black uppercase mr-2 font-mono flex-shrink-0">
                    Live Preview:
                  </span>
                  <marquee className="w-auto font-sans font-medium">{marqueeNotice || "..."}</marquee>
                </div>
              </div>

              {/* Wallet Numbers configuration */}
              <div className="bg-slate-900 border border-gray-800 p-4.5 rounded-xl space-y-4">
                <h4 className="text-xs font-black text-rose-500 uppercase tracking-wide border-b border-gray-800 pb-1.5 font-mono">
                  💰 Transaction Gateway Accounts
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* bKash configuration */}
                  <div className="space-y-3 p-3 bg-slate-950 rounded-lg border border-gray-850 justify-between">
                    <span className="text-[11px] font-bold text-pink-500 block uppercase">
                      bKash Account
                    </span>
                    <div>
                      <label className="text-[10px] text-gray-400 font-mono block mb-1">
                        BKASH NUMBER *
                      </label>
                      <input
                        type="text"
                        required
                        value={bkashNumber}
                        onChange={(e) => setBkashNumber(e.target.value)}
                        placeholder="e.g. 017XXXXXXXX"
                        className="bg-slate-900 w-full p-2 rounded border border-gray-700 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 font-mono block mb-1" style={{ textTransform: 'uppercase' }}>
                        ACCOUNT TYPE (e.g. Send Money (Personal))
                      </label>
                      <input
                        type="text"
                        required
                        value={bkashType}
                        onChange={(e) => setBkashType(e.target.value)}
                        placeholder="e.g. Personal Send Money / Merchant / Agent"
                        className="bg-slate-900 w-full p-2 rounded border border-gray-700 text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* Nagad configuration */}
                  <div className="space-y-3 p-3 bg-slate-955 rounded-lg border border-gray-850">
                    <span className="text-[11px] font-bold text-orange-500 block uppercase font-mono">
                      Nagad Account
                    </span>
                    <div>
                      <label className="text-[10px] text-gray-400 font-mono block mb-1">
                        NAGAD NUMBER *
                      </label>
                      <input
                        type="text"
                        required
                        value={nagadNumber}
                        onChange={(e) => setNagadNumber(e.target.value)}
                        placeholder="e.g. 018XXXXXXXX"
                        className="bg-slate-900 w-full p-2 rounded border border-gray-750 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 font-mono block mb-1" style={{ textTransform: 'uppercase' }}>
                        ACCOUNT TYPE
                      </label>
                      <input
                        type="text"
                        required
                        value={nagadType}
                        onChange={(e) => setNagadType(e.target.value)}
                        placeholder="e.g. Send Money (Personal) / Agent"
                        className="bg-slate-900 w-full p-2 rounded border border-gray-750 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Channels, Guidelines & Supports links details */}
              <div className="bg-slate-900 border border-gray-800 p-4.5 rounded-xl space-y-4">
                <h4 className="text-xs font-black text-sky-400 uppercase tracking-wide border-b border-gray-800 pb-1.5 font-mono">
                  🌐 Helplines & Interactive Social Links
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-gray-400 font-mono block mb-1">
                      WHATSAPP SUPPORT TARGET CHAT LINK *
                    </label>
                    <input
                      type="url"
                      required
                      value={whatsappLink}
                      onChange={(e) => setWhatsappLink(e.target.value)}
                      placeholder="e.g. https://wa.me/8801685482525"
                      className="bg-slate-950 w-full p-2 rounded border border-gray-700 text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 font-mono block mb-1">
                      TELEGRAM CHANNEL / GROUP INVITATION LINK *
                    </label>
                    <input
                      type="url"
                      required
                      value={telegramLink}
                      onChange={(e) => setTelegramLink(e.target.value)}
                      placeholder="e.g. https://t.me/your_telegram_group"
                      className="bg-slate-950 w-full p-2 rounded border border-gray-700 text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 font-mono block mb-1">
                      YOUTUBE HOW-TO-PLAY TUTORIAL LINK *
                    </label>
                    <input
                      type="url"
                      required
                      value={youtubeLink}
                      onChange={(e) => setYoutubeLink(e.target.value)}
                      placeholder="e.g. https://youtube.com/watch?v=..."
                      className="bg-slate-950 w-full p-2 rounded border border-gray-700 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex pt-2">
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-slate-950 font-black text-xs p-3.5 px-6 rounded-xl transition-all transform active:scale-98 tracking-wider uppercase flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Check className="w-4 h-4 text-slate-950" />
                  Apply & Save Changes Live (সেভ করুন)
                </button>
              </div>
            </form>
          </div>
        )}


      </div>
    </div>
  );
};
