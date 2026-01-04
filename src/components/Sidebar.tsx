import { motion } from "framer-motion";
import {
  Gamepad2,
  Users,
  User,
  Settings,
  LogOut,
  Crown,
  Edit2,
  Check,
  X,
} from "lucide-react";
import { LoginButton } from "./LoginButton";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

interface SidebarProps {
  onNavigate?: (section: string) => void;
  currentSection?: string;
}

export function Sidebar({ onNavigate, currentSection = "home" }: SidebarProps) {
  const { userId, displayName, logout, updateDisplayName } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [nameError, setNameError] = useState("");

  const navItems = [
    { id: "games", icon: Gamepad2, label: "Games" },
    { id: "friends", icon: Users, label: "Friends" },
    { id: "profile", icon: User, label: "Profile" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  const handleNavClick = (id: string) => {
    setActiveSection(id);

    // Call parent navigation handler
    onNavigate?.(id);

    if (id === "profile") {
      setShowProfile(true);
    }
    // All other navigation is handled by parent (home, games, friends, settings)
  };

  const handleStartEdit = () => {
    setEditedName(displayName || "");
    setNameError("");
    setIsEditingName(true);
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setEditedName("");
    setNameError("");
  };

  const handleSaveEdit = async () => {
    const trimmedName = editedName.trim();

    if (trimmedName.length < 2) {
      setNameError("ชื่อต้องมีอย่างน้อย 2 ตัวอักษร");
      return;
    }

    if (trimmedName.length > 20) {
      setNameError("ชื่อต้องไม่เกิน 20 ตัวอักษร");
      return;
    }

    const success = await updateDisplayName(trimmedName);

    if (success) {
      setIsEditingName(false);
      setEditedName("");
      setNameError("");
    } else {
      setNameError("ไม่สามารถอัปเดตชื่อได้");
    }
  };

  return (
    <>
      {/* Desktop Sidebar - hidden on mobile */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="hidden md:flex fixed left-0 top-0 h-screen w-20 bg-black/40 backdrop-blur-xl border-r border-white/10 flex-col items-center py-6 z-40"
      >
        {/* Logo/Brand */}
        <motion.div
          className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-8 shadow-lg shadow-cyan-500/50 cursor-pointer"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setActiveSection("home");
            onNavigate?.("home");
          }}
          title="Home"
        >
          <Crown className="w-6 h-6 text-white" />
        </motion.div>

        {/* Navigation Items */}
        <div className="flex-1 flex flex-col gap-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <motion.button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                  isActive
                    ? "bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/50"
                    : "bg-white/5 hover:bg-white/10"
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title={item.label}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? "text-white" : "text-white/60"
                  }`}
                />
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -right-1 w-1 h-8 bg-cyan-400 rounded-full"
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col gap-4 mt-auto">
          {userId ? (
            <>
              {/* User Avatar */}
              <motion.button
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white shadow-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title={displayName || "User"}
              >
                {displayName?.charAt(0).toUpperCase() || "?"}
              </motion.button>

              {/* Logout */}
              <motion.button
                onClick={logout}
                className="w-12 h-12 rounded-xl bg-white/5 hover:bg-red-500/20 flex items-center justify-center transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title="Logout"
              >
                <LogOut className="w-5 h-5 text-red-400" />
              </motion.button>
            </>
          ) : (
            <div className="w-12">
              <LoginButton />
            </div>
          )}
        </div>
      </motion.div>

      {/* Profile Modal */}
      {showProfile && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50"
          onClick={() => setShowProfile(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-3xl max-w-md w-full border border-white/20 shadow-2xl overflow-hidden"
          >
            {/* Header with gradient */}
            <div className="relative h-32 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 overflow-hidden">
              <div className="absolute inset-0 bg-black/20" />
              <motion.div
                className="absolute inset-0"
                animate={{
                  backgroundPosition: ["0% 0%", "100% 100%"],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
                  backgroundSize: "200% 200%",
                }}
              />
            </div>

            {/* Content */}
            <div className="px-6 pb-6 -mt-16">
              {/* Avatar */}
              <div className="flex justify-center mb-4">
                <motion.div whileHover={{ scale: 1.05 }} className="relative">
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center font-bold text-white text-4xl shadow-xl ring-4 ring-slate-900/50">
                    {displayName?.charAt(0).toUpperCase() || "?"}
                  </div>
                  {userId && (
                    <div className="absolute bottom-1 right-1 w-7 h-7 bg-green-500 rounded-full border-4 border-slate-900" />
                  )}
                </motion.div>
              </div>

              {/* User Info */}
              <div className="text-center mb-6">
                {isEditingName ? (
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit();
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-center text-lg font-semibold focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50"
                        placeholder="ใส่ชื่อใหม่"
                        autoFocus
                        maxLength={20}
                      />
                      <div className="text-xs text-zinc-400 mt-1">
                        {editedName.length}/20 ตัวอักษร
                      </div>
                    </div>
                    {nameError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-400"
                      >
                        {nameError}
                      </motion.div>
                    )}
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSaveEdit}
                        className="flex-1 py-2 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-xl text-white font-medium flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        บันทึก
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCancelEdit}
                        className="flex-1 py-2 px-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-medium flex items-center justify-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        ยกเลิก
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <h2 className="text-2xl font-bold text-white">
                        {displayName || "Guest"}
                      </h2>
                      {userId && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleStartEdit}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          title="แก้ไขชื่อ"
                        >
                          <Edit2 className="w-4 h-4 text-cyan-400" />
                        </motion.button>
                      )}
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          userId ? "bg-green-400" : "bg-zinc-400"
                        }`}
                      />
                      <p className="text-sm text-zinc-300">
                        {userId ? "เข้าสู่ระบบแล้ว" : "ผู้เยี่ยมชม"}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Stats Grid */}
              {userId && (
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl p-3 border border-cyan-500/20">
                    <div className="text-2xl font-bold text-cyan-400">0</div>
                    <div className="text-xs text-zinc-400">เกมส์</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-3 border border-purple-500/20">
                    <div className="text-2xl font-bold text-purple-400">0</div>
                    <div className="text-xs text-zinc-400">เพื่อน</div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl p-3 border border-orange-500/20">
                    <div className="text-2xl font-bold text-orange-400">0</div>
                    <div className="text-xs text-zinc-400">คะแนน</div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2">
                {userId && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={logout}
                    className="w-full py-3 px-4 bg-gradient-to-r from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30 border border-red-500/30 rounded-xl text-white font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    ออกจากระบบ
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowProfile(false)}
                  className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-all"
                >
                  ปิด
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Mobile Bottom Navigation - shown only on mobile */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="md:hidden fixed bottom-0 left-0 right-0 bg-black/60 backdrop-blur-xl border-t border-white/10 z-40 pb-safe"
      >
        <div className="flex justify-around items-center px-4 py-3">
          {/* Home Button */}
          <motion.button
            onClick={() => {
              setActiveSection("home");
              onNavigate?.("home");
            }}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
              activeSection === "home"
                ? "bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg"
                : "bg-transparent"
            }`}
            whileTap={{ scale: 0.95 }}
          >
            <Crown
              className={`w-5 h-5 ${
                activeSection === "home" ? "text-white" : "text-zinc-400"
              }`}
            />
            <span
              className={`text-xs ${
                activeSection === "home" ? "text-white" : "text-zinc-400"
              }`}
            >
              Home
            </span>
          </motion.button>

          {navItems
            .filter((item) => item.id !== "profile") // Remove profile from navItems
            .map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                    isActive
                      ? "bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg"
                      : "bg-transparent"
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? "text-white" : "text-zinc-400"
                    }`}
                  />
                  <span
                    className={`text-xs ${
                      isActive ? "text-white" : "text-zinc-400"
                    }`}
                  >
                    {item.label}
                  </span>
                </motion.button>
              );
            })}

          {/* Profile Button - Shows Login when not authenticated */}
          <motion.button
            onClick={() => {
              if (userId) {
                setShowProfile(true);
                setActiveSection("profile");
              } else {
                // Trigger LoginButton click
                const loginBtn = document.querySelector(
                  "[data-login-button]"
                ) as HTMLElement;
                if (loginBtn) loginBtn.click();
              }
            }}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
              activeSection === "profile" && userId
                ? "bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg"
                : "bg-transparent"
            }`}
            whileTap={{ scale: 0.95 }}
          >
            {userId ? (
              <>
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-[10px] font-bold">
                  {displayName?.charAt(0).toUpperCase() || "?"}
                </div>
                <span className="text-xs text-zinc-400">
                  {displayName?.substring(0, 6) || "Profile"}
                </span>
              </>
            ) : (
              <>
                <User className="w-5 h-5 text-zinc-400" />
                <span className="text-xs text-zinc-400">เข้าระบบ</span>
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}
