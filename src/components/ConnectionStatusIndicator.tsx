import {
  useConnectionStatus,
  ConnectionStatus,
} from "@/hooks/useConnectionStatus";
import { motion, AnimatePresence } from "framer-motion";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConnectionStatusIndicatorProps {
  showWhenConnected?: boolean;
}

export function ConnectionStatusIndicator({
  showWhenConnected = false,
}: ConnectionStatusIndicatorProps) {
  const { status, isOnline, reconnect } = useConnectionStatus();

  // Don't show anything when connected (unless explicitly requested)
  if (status === "connected" && !showWhenConnected) {
    return null;
  }

  const getStatusConfig = (status: ConnectionStatus, isOnline: boolean) => {
    if (!isOnline) {
      return {
        icon: WifiOff,
        text: "ไม่มีอินเทอร์เน็ต",
        bgColor: "bg-red-600",
        textColor: "text-white",
        showRetry: true,
      };
    }

    switch (status) {
      case "reconnecting":
        return {
          icon: RefreshCw,
          text: "กำลังเชื่อมต่อใหม่...",
          bgColor: "bg-yellow-500",
          textColor: "text-black",
          showRetry: false,
          iconClass: "animate-spin",
        };
      case "disconnected":
        return {
          icon: WifiOff,
          text: "การเชื่อมต่อหลุด",
          bgColor: "bg-red-600",
          textColor: "text-white",
          showRetry: true,
        };
      case "connected":
        return {
          icon: Wifi,
          text: "เชื่อมต่อแล้ว",
          bgColor: "bg-green-600",
          textColor: "text-white",
          showRetry: false,
        };
    }
  };

  const config = getStatusConfig(status, isOnline);
  const IconComponent = config.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 ${config.bgColor} ${config.textColor} px-4 py-3`}
      >
        <div className="flex items-center justify-center gap-3 max-w-md mx-auto">
          <IconComponent className={`w-5 h-5 ${config.iconClass || ""}`} />
          <span className="font-medium">{config.text}</span>
          {config.showRetry && (
            <Button
              size="sm"
              variant="secondary"
              onClick={reconnect}
              className="ml-2 px-3 py-1 h-auto text-sm"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              ลองใหม่
            </Button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Overlay version for critical disconnections
export function ConnectionOverlay() {
  const { status, isOnline, reconnect } = useConnectionStatus();

  if (status === "connected" && isOnline) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900 rounded-2xl p-8 max-w-sm w-full text-center border border-white/10"
        >
          {status === "reconnecting" ? (
            <>
              <RefreshCw className="w-16 h-16 mx-auto mb-4 text-yellow-500 animate-spin" />
              <h2 className="text-xl font-bold text-white mb-2">
                กำลังเชื่อมต่อใหม่...
              </h2>
              <p className="text-white/60 text-sm">
                กรุณารอสักครู่ ระบบกำลังพยายามเชื่อมต่อใหม่
              </p>
            </>
          ) : (
            <>
              <WifiOff className="w-16 h-16 mx-auto mb-4 text-red-500" />
              <h2 className="text-xl font-bold text-white mb-2">
                {isOnline ? "การเชื่อมต่อหลุด" : "ไม่มีอินเทอร์เน็ต"}
              </h2>
              <p className="text-white/60 text-sm mb-6">
                {isOnline
                  ? "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้"
                  : "กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตของคุณ"}
              </p>
              <Button
                onClick={reconnect}
                className="w-full bg-blue-600 hover:bg-blue-500"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                ลองเชื่อมต่อใหม่
              </Button>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
