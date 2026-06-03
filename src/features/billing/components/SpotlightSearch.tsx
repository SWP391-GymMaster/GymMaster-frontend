"use client";

import { useEffect, useState, useRef } from "react";
import {
  Search,
  Compass,
  User,
  CreditCard,
  Dumbbell,
  ShieldAlert,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

interface SpotlightSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: string;
}

interface SpotlightItem {
  title: string;
  description: string;
  category: "Trang chính" | "Hội viên" | "Cấu hình & Quản trị" | "Thao tác";
  href: string;
  icon: typeof Compass;
}

export function SpotlightSearch({
  open,
  onOpenChange,
  role,
}: SpotlightSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Available shortcuts and links based on role
  const allItems: SpotlightItem[] = [
    {
      title: "Tổng quan / Dashboard",
      description: "Xem chỉ số vận hành và biểu đồ phân tích hôm nay.",
      category: "Trang chính",
      href: `/${role}/dashboard`,
      icon: Compass,
    },
    {
      title: "Danh sách hội viên",
      description: "Tìm kiếm thông tin, xem hồ sơ chi tiết hội viên.",
      category: "Hội viên",
      href:
        role === "admin"
          ? "/admin/members"
          : role === "staff"
            ? "/staff/members"
            : "/pt/members",
      icon: User,
    },
    {
      title: "Quản lý gói tập (Packages)",
      description:
        "Cấu hình giá tiền, hạn sử dụng và quyền lợi của các gói gym.",
      category: "Cấu hình & Quản trị",
      href: "/admin/packages",
      icon: Dumbbell,
    },
    {
      title: "Nhật ký hóa đơn (Payments)",
      description:
        "Tra cứu giao dịch, tổng doanh thu và hóa đơn đã thanh toán.",
      category: "Cấu hình & Quản trị",
      href: role === "admin" ? "/admin/payments" : "/staff/payments",
      icon: CreditCard,
    },
    {
      title: "Theo dõi calo & dinh dưỡng",
      description: "Nhật ký ăn uống, tổng lượng calo nạp vào hàng ngày.",
      category: "Trang chính",
      href: "/member/nutrition/summary",
      icon: Compass,
    },
    {
      title: "Giáo án tập luyện",
      description: "Chi tiết giáo án huấn luyện từ PT cá nhân.",
      category: "Trang chính",
      href: "/member/workout",
      icon: Dumbbell,
    },
    {
      title: "Nhật ký hệ thống (Audit Logs)",
      description:
        "Xem nhật ký kiểm toán hành vi của các nhân viên và quản trị viên.",
      category: "Cấu hình & Quản trị",
      href: "/admin/audit-logs",
      icon: ShieldAlert,
    },
  ];

  // Filter based on query and role-access check
  const filtered = allItems.filter((item) => {
    // Basic query matching
    const matchesQuery =
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase());

    // Role access boundaries
    if (role === "member") {
      return (
        matchesQuery &&
        !item.href.startsWith("/admin") &&
        !item.href.startsWith("/staff") &&
        !item.href.startsWith("/pt")
      );
    }
    if (role === "pt") {
      return (
        matchesQuery &&
        !item.href.startsWith("/admin") &&
        !item.href.startsWith("/staff") &&
        !item.href.startsWith("/member")
      );
    }
    if (role === "staff") {
      return (
        matchesQuery &&
        !item.href.startsWith("/admin") &&
        !item.href.startsWith("/pt")
      );
    }
    return matchesQuery;
  });

  const handleSelect = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  // Handle keyboard events (up/down/enter/escape)
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(
          (prev) =>
            (prev - 1 + filtered.length) % Math.max(1, filtered.length),
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = filtered[selectedIndex];
        if (item) {
          handleSelect(item.href);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, filtered, selectedIndex]);

  // Focus input on open; reset state after close (deferred so exit animation plays)
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setQuery("");
        setSelectedIndex(0);
      }, 200);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle className="sr-only">Spotlight Search</DialogTitle>
      <DialogDescription className="sr-only">
        Tìm kiếm trang, chức năng hoặc hóa đơn.
      </DialogDescription>
      <DialogContent className="p-0 sm:max-w-[550px] overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
        <div className="flex items-center border-b px-4 py-3 bg-muted/20">
          <Search className="size-5 text-muted-foreground mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="h-10 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none border-none focus:ring-0"
            placeholder="Tìm kiếm trang, chức năng hoặc hóa đơn..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground shadow-sm">
            ESC
          </kbd>
        </div>

        <div className="max-h-[300px] overflow-y-auto p-2">
          {filtered.length > 0 ? (
            <div className="flex flex-col gap-1">
              {filtered.map((item, idx) => {
                const isSelected = selectedIndex === idx;
                const Icon = item.icon;
                return (
                  <button
                    key={item.href}
                    onClick={() => handleSelect(item.href)}
                    type="button"
                    className={`flex items-start gap-3 rounded-2xl p-3 text-left w-full transition ${
                      isSelected
                        ? "bg-primary/10 text-foreground ring-1 ring-primary/30"
                        : "hover:bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl shrink-0 ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-sm text-foreground">
                          {item.title}
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wide opacity-50 bg-muted px-2 py-0.5 rounded-full shrink-0">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {item.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Compass className="size-8 mx-auto text-muted-foreground/50 animate-pulse" />
              <p className="text-sm font-semibold text-foreground mt-4">
                Không tìm thấy kết quả
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Thử dùng các từ khóa như &quot;calo&quot;, &quot;hội viên&quot; hoặc &quot;gói tập&quot;
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
