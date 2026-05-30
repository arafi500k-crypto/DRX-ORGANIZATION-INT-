import React from "react";
import { BookOpen, HelpCircle } from "lucide-react";

export const RulesView: React.FC = () => {
  return (
    <div className="bg-[#1f2937]/50 border border-gray-800 rounded-2xl p-6 text-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-red-500" />
        <h3 className="text-lg font-bold font-display text-white">খেলার নিয়মাবলী ও শর্তাবলী (Rules)</h3>
      </div>

      <ul className="space-y-4 text-xs md:text-sm font-sans leading-relaxed text-gray-300">
        <li className="flex gap-3">
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-600/35 text-red-400 flex items-center justify-center font-mono">১</span>
          <span>অবশ্যই গেম খেলার সময় কোনো থার্ড পার্ট হ্যাক বা আনফেয়ার স্ক্রিপ্ট ফাইল ব্যবহার করবেন না। করলে অ্যাকাউন্ট স্থায়ী ব্যান হবে।</span>
        </li>
        <li className="flex gap-3">
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-600/35 text-red-400 flex items-center justify-center font-mono">২</span>
          <span>ম্যাচ শুরু হবার ১০-১৫ মিনিট আগে রুম ডিটেইলস (রুম আইডি ও পাসওয়ার্ড) আপডেট করা হবে। আপনি রুম কোড দিয়ে সরাসরি কাস্টম ম্যাচে ট্রাভেল ক্লিক করতে পারবেন।</span>
        </li>
        <li className="flex gap-3">
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-600/35 text-red-400 flex items-center justify-center font-mono">৩</span>
          <span>উইথড্র করার পর টাকা প্রতিদিন রাত ১০-১১ টার মধ্যে পেমেন্ট ক্লিয়ার করা হবে। ধন্যবাদ সাথে থাকার জন্য।</span>
        </li>
        <li className="flex gap-3">
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-600/35 text-red-400 flex items-center justify-center font-mono">৪</span>
          <span>এডমানি করার সময় অবশ্যই সঠিক ট্রানজেকশন আইডি প্রদান করতে হবে। ভুল তথ্য দিলে পেমেন্ট রিজেক্ট করে দেয়া হবে। পেমেন্ট সাধারণত ৩০-৪০ মিনিট রিভিউয়ের পর অ্যাকাউন্টে যোগ হবে।</span>
        </li>
        <li className="flex gap-3">
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-600/35 text-red-400 flex items-center justify-center font-mono">৫</span>
          <span>যেকোনো প্রয়োজনে সাপোর্ট এডমিন পেজ বা DRX ORGANIZATION INT এডমিনের সাথে কথা বলুন।</span>
        </li>
      </ul>

      <div className="mt-6 border-t border-gray-800 pt-4 flex items-center gap-2 text-gray-400 text-xs">
        <HelpCircle className="w-4 h-4 text-gray-500 flex-shrink-0" />
        <span>আমাদের সাপোর্ট ২৪ ঘন্টা খোলা থাকে। কোনো ভুল ট্রানজেকশন হলে পেমেন্ট প্রুফ স্ক্রিনশট সহ এডমিন প্যানেলে যোগাযোগ করুন।</span>
      </div>
    </div>
  );
};
