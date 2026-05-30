export interface MatchRegistration {
  matchId: string;
  gameUid: string;
  gameIgn: string;
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
  startTime: number;
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
