import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { ProfileDropdown } from "./profile-dropdown";
import type { BusinessRole, DashboardTab } from "./types";
import type { DashboardData } from "@/lib/dashboard-data";

const adminNavigation = [
  { tab: "overview", label: "Overview", icon: "◫" },
  { tab: "staff", label: "Business accounts", icon: "♧" },
  { tab: "customers", label: "User accounts", icon: "◎" },
  { tab: "concerns", label: "User concerns", icon: "✉" },
  { tab: "notifications", label: "Notifications", icon: "◉" },
  { tab: "maintenance", label: "Health & maintenance", icon: "⌁" },
] as const;

const staffNavigation = [
  { tab: "overview", label: "Overview", icon: "◫" },
  { tab: "devices", label: "My devices", icon: "⌘" },
  { tab: "maintenance", label: "Maintenance activity", icon: "⌁" },
  { tab: "concerns", label: "User concerns", icon: "✉" },
  { tab: "sales-customers", label: "Customer orders", icon: "◉" },
  { tab: "notifications", label: "Notifications", icon: "◉" },
] as const;

export function DashboardShell({
  children,
  activeTab,
  email,
  fullName,
  profile,
  role,
  notifications,
}: {
  children: ReactNode;
  activeTab: DashboardTab;
  email: string;
  fullName: string;
  profile: {
    firstname: string;
    middlename: string | null;
    lastname: string | null;
    contactNo: string | null;
    avatar_url: string | null;
  };
  role: BusinessRole;
  notifications: DashboardData["notifications"];
}) {
  const navigation = role === "admin" ? adminNavigation : staffNavigation;
  const activeTabTitle =
    activeTab === "devices"
      ? "Devices"
      : activeTab === "firmware"
        ? "Firmware"
        : activeTab === "inventory"
          ? "Inventory"
          : activeTab === "sales-customers"
            ? "Customers"
            : activeTab === "notifications"
              ? "Notifications"
            : navigation.find((item) => item.tab === activeTab)?.label ?? "Overview";
  const renderNavigationLink = (item: (typeof navigation)[number]) => (
    <Link
      aria-current={activeTab === item.tab ? "page" : undefined}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition ${
        activeTab === item.tab
          ? "bg-[#2a1609] text-[#ff9a4d]"
          : "text-[#888] hover:bg-[#191919] hover:text-[#ff9a4d]"
      }`}
      href={`/business?tab=${item.tab}`}
      key={item.tab}
    >
      <span aria-hidden="true" className="w-4 text-center text-base">
        {item.icon}
      </span>
      {item.label}
    </Link>
  );

  return (
    <main className="min-h-screen bg-[#090909] text-[#f7f7f2]">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="dashboard-sidebar sticky top-0 hidden h-screen w-[245px] shrink-0 self-start flex-col overflow-y-auto border-r border-[#252525] bg-[#0d0d0d] px-5 py-7 lg:flex">
          <div className="flex items-center gap-3 px-2">
            <Image
              alt="BawatPieza logo"
              className="h-10 w-10 object-contain"
              height={40}
              src="/bawat-pieza-logo.png"
              width={40}
            />
            <div>
              <p className="text-xs font-bold tracking-[0.16em]">BAWAT PIEZA</p>
              <p className="mt-1 text-[10px] text-[#777]">Energy command center</p>
            </div>
          </div>

          <p           className="mb-3 mt-10 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#777]">
            Workspace
          </p>
          <nav aria-label="Dashboard tabs" className="space-y-1">
            {navigation.slice(0, 1).map(renderNavigationLink)}
            {role === "admin" ? (
              <>
                <details
                  className="group"
                  open={activeTab === "devices" || activeTab === "firmware" || activeTab === "mobile-updates"}
                >
                  <summary className="flex cursor-pointer list-none items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium text-[#888] transition hover:bg-[#191919] hover:text-[#ff9a4d] [&::-webkit-details-marker]:hidden">
                    <span aria-hidden="true" className="w-4 text-center text-base">
                      ⌘
                    </span>
                    <span className="flex-1">Device management</span>
                    <span aria-hidden="true" className="text-[10px] transition group-open:rotate-180">
                      ▾
                    </span>
                  </summary>
                  <div className="ml-4 mt-1 space-y-1 border-l border-[#292929] pl-3">
                    {[
                      { tab: "devices", label: "Devices", icon: "⌘" },
                      { tab: "firmware", label: "Firmware", icon: "↻" },
                      { tab: "mobile-updates", label: "Mobile app updates", icon: "⇧" },
                    ].map((item) => (
                      <Link
                        aria-current={activeTab === item.tab ? "page" : undefined}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition ${
                          activeTab === item.tab
                            ? "bg-[#2a1609] text-[#ff9a4d]"
                            : "text-[#888] hover:bg-[#191919] hover:text-[#ff9a4d]"
                        }`}
                        href={`/business?tab=${item.tab}`}
                        key={item.tab}
                      >
                        <span aria-hidden="true" className="w-4 text-center text-sm">
                          {item.icon}
                        </span>
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </details>
                <details
                  className="group"
                  open={activeTab === "inventory" || activeTab === "sales-customers" || activeTab === "delivery-map"}
                >
                  <summary className="flex cursor-pointer list-none items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium text-[#888] transition hover:bg-[#191919] hover:text-[#ff9a4d] [&::-webkit-details-marker]:hidden">
                    <span aria-hidden="true" className="w-4 text-center text-base">
                      ▦
                    </span>
                    <span className="flex-1">Ecommerce</span>
                    <span aria-hidden="true" className="text-[10px] transition group-open:rotate-180">
                      ▾
                    </span>
                  </summary>
                  <div className="ml-4 mt-1 space-y-1 border-l border-[#292929] pl-3">
                    {[
                      { tab: "inventory", label: "Inventory", icon: "▦" },
                      { tab: "sales-customers", label: "Customers", icon: "◉" },
                      { tab: "delivery-map", label: "Delivery map", icon: "⌖" },
                    ].map((item) => (
                      <Link
                        aria-current={activeTab === item.tab ? "page" : undefined}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition ${
                          activeTab === item.tab
                            ? "bg-[#2a1609] text-[#ff9a4d]"
                            : "text-[#888] hover:bg-[#191919] hover:text-[#ff9a4d]"
                        }`}
                        href={`/business?tab=${item.tab}`}
                        key={item.tab}
                      >
                        <span aria-hidden="true" className="w-4 text-center text-sm">
                          {item.icon}
                        </span>
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </details>
              </>
            ) : null}
            {navigation.slice(1).map(renderNavigationLink)}
          </nav>

          <div className="mt-auto rounded-2xl border border-[#2b1a0e] bg-[#17100b] p-4">
            <p className="text-xs font-semibold text-[#ff9a4d]">
              {role === "admin" ? "Administrator access" : "Staff workspace"}
            </p>
            <p className="mt-1.5 text-[10px] leading-4 text-[#849087]">
              {role === "admin"
                ? "Manage the business system and review operations."
                : "View devices and activity available to your account."}
            </p>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="flex items-center justify-between border-b border-[#252525] bg-[#0d0d0d] px-5 py-4 sm:px-8">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#777]">
                {role === "admin" ? "Administration" : "Staff workspace"}
              </p>
              <p className="mt-1 text-sm font-semibold text-[#f7f7f2]">
                Welcome{fullName ? `, ${fullName}` : ""}
                <span className="ml-2 font-normal text-[#777]">· {activeTabTitle}</span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <details className="relative">
                <summary className="flex cursor-pointer list-none items-center gap-2 text-xs text-[#b8b8b0] [&::-webkit-details-marker]:hidden">
                  <svg aria-hidden="true" className="h-4 w-4 text-[#b8b8b0]" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
                  </svg>
                  {notifications.filter((notification) => !notification.read_at).length > 0 && (
                    <span className="rounded-full bg-[#f97316] px-1.5 py-0.5 text-[9px] font-semibold text-white">
                      {notifications.filter((notification) => !notification.read_at).length}
                    </span>
                  )}
                </summary>
                <div className="absolute right-0 top-9 z-30 w-80 overflow-hidden rounded-xl border border-[#363636] bg-[#151515] shadow-2xl">
                  <div className="flex justify-between border-b border-[#292929] px-4 py-3 text-xs">
                    <strong>Notifications</strong>
                    <span className="text-[#777]">{notifications.length} recent</span>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="px-4 py-5 text-xs text-[#888]">No notifications yet.</p>
                  ) : notifications.slice(0, 8).map((notification) => (
                    <div className={`border-b border-[#242424] px-4 py-3 ${notification.read_at ? "" : "bg-[#21160e]"}`} key={notification.id}>
                      <p className="text-xs font-medium text-[#f7f7f2]">{notification.title}</p>
                      <p className="mt-1 text-[10px] leading-4 text-[#999]">{notification.message}</p>
                    </div>
                  ))}
                  <Link className="block border-t border-[#292929] px-4 py-3 text-center text-xs font-medium text-[#ff9a4d] hover:bg-[#21160e]" href="/business?tab=notifications">
                    View all notifications
                  </Link>
                </div>
              </details>
              <ProfileDropdown
                email={email}
                fullName={fullName}
                profile={profile}
              />
            </div>
          </header>
          <div className="px-5 py-7 sm:px-8 sm:py-9">{children}</div>
        </div>
      </div>
    </main>
  );
}
