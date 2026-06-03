"use client";

export const speechAnnouncer = {
  announce: (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    try {
      // Cancel any ongoing announcements
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "vi-VN";

      // Dynamically select Vietnamese voice if registered
      const voices = window.speechSynthesis.getVoices();
      const viVoice = voices.find((v) => v.lang.toLowerCase().includes("vi"));
      if (viVoice) {
        utterance.voice = viVoice;
      }

      utterance.rate = 0.95; // Slightly slower for clear pronunciation
      utterance.pitch = 1.0;

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech Synthesis failed: ", e);
    }
  },

  speakGreeting: (memberName: string, status: "active" | "expired" | "locked") => {
    if (status === "active") {
      speechAnnouncer.announce(`Xin chào ${memberName}, chúc bạn tập luyện vui vẻ!`);
    } else if (status === "expired") {
      speechAnnouncer.announce(`Cảnh báo, thẻ của hội viên ${memberName} đã hết hạn!`);
    } else {
      speechAnnouncer.announce(`Cảnh báo, tài khoản của hội viên ${memberName} đã bị khóa!`);
    }
  },
};
