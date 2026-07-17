"use client"

import { Download, Share2, Smartphone, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { usePwaInstall } from "@/components/pwa/PwaInstallProvider"

export function InstallAppAction() {
  const { dismiss, install, mode } = usePwaInstall()

  if (!mode) return null

  return (
    <section
      aria-labelledby="pwa-install-title"
      className="relative overflow-hidden rounded-[1.5rem] border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-6 shadow-sm transition duration-200 [transition-timing-function:cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.5 hover:shadow-lg"
      data-testid="pwa-install-action"
    >
      <div aria-hidden="true" className="absolute -right-10 -top-10 size-32 rounded-full bg-primary/10 blur-2xl" />
      <Button
        aria-label="Ẩn gợi ý cài đặt"
        className="absolute right-3 top-3 size-11 rounded-full text-muted-foreground hover:bg-background/80 hover:text-foreground active:scale-[0.98]"
        onClick={dismiss}
        size="icon"
        type="button"
        variant="ghost"
      >
        <X aria-hidden="true" className="size-4" />
      </Button>

      <div className="relative pr-9">
        <span className="flex size-12 items-center justify-center rounded-full bg-zinc-950 text-primary shadow-lg">
          <Smartphone aria-hidden="true" className="size-5" />
        </span>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
          GymMaster trên thiết bị
        </p>
        <h2 id="pwa-install-title" className="mt-1 text-xl font-semibold tracking-tight text-foreground">
          Cài ứng dụng để mở nhanh hơn
        </h2>

        {mode === "ios" ? (
          <div className="mt-3 text-sm leading-6 text-muted-foreground">
            <p>Trên Safari, bạn có thể thêm GymMaster vào Màn hình chính:</p>
            <ol className="mt-2 grid gap-1 pl-5 [list-style:decimal]">
              <li>Nhấn nút Chia sẻ.</li>
              <li>Chọn “Thêm vào Màn hình chính”.</li>
            </ol>
            <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Share2 aria-hidden="true" className="size-4 text-primary" />
              Cài đặt được xác nhận trong Safari
            </div>
          </div>
        ) : (
          <>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Mở GymMaster từ màn hình chính với giao diện toàn màn hình. Dữ liệu vận hành vẫn cần kết nối mạng.
            </p>
            <Button
              className="mt-5 min-h-11 rounded-full px-5 active:scale-[0.98]"
              onClick={() => void install()}
              type="button"
            >
              <Download aria-hidden="true" className="size-4" />
              Cài ứng dụng
            </Button>
          </>
        )}
      </div>
    </section>
  )
}
