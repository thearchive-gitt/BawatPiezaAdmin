import Link from "next/link";
import type { ReactNode } from "react";
import { ProfileDropdown } from "./profile-dropdown";
import type { BusinessRole, DashboardTab } from "./types";

const adminNavigation = [
  { tab: "overview", label: "Overview", icon: "◫" },
  { tab: "devices", label: "Device management", icon: "⌘" },
  { tab: "firmware", label: "Firmware", icon: "↻" },
  { tab: "staff", label: "Business accounts", icon: "♧" },
  { tab: "customers", label: "User accounts", icon: "◎" },
  { tab: "maintenance", label: "Health & maintenance", icon: "⌁" },
] as const;

const staffNavigation = [
  { tab: "overview", label: "Overview", icon: "◫" },
  { tab: "devices", label: "My devices", icon: "⌘" },
  { tab: "maintenance", label: "Maintenance activity", icon: "⌁" },
] as const;

export function DashboardShell({
  children,
  activeTab,
  email,
  fullName,
  profile,
  role,
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
  };
  role: BusinessRole;
}) {
  const navigation = role === "admin" ? adminNavigation : staffNavigation;
  const activeTabTitle =
    navigation.find((item) => item.tab === activeTab)?.label ?? "Overview";

  return (
    <main className="min-h-screen bg-[#f5f6f2] text-[#1d3025]">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="sticky top-0 hidden h-screen w-[245px] shrink-0 self-start flex-col overflow-y-auto border-r border-[#e6eae4] bg-white px-5 py-7 lg:flex">
          <div className="flex items-center gap-3 px-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#dce9bd] text-sm font-bold text-[#183d2d]">
              BP
            </span>
            <div>
              <p className="text-xs font-bold tracking-[0.16em]">BAWAT PIEZA</p>
              <p className="mt-1 text-[10px] text-[#8a958d]">Business portal</p>
            </div>
          </div>

          <p className="mb-3 mt-10 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a0a9a2]">
            Workspace
          </p>
          <nav aria-label="Dashboard tabs" className="space-y-1">
            {navigation.map((item) => (
              <Link
                aria-current={activeTab === item.tab ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition ${
                  activeTab === item.tab
                    ? "bg-[#edf3e6] text-[#28583b]"
                    : "text-[#748077] hover:bg-[#f5f7f3] hover:text-[#28583b]"
                }`}
                href={`/business?tab=${item.tab}`}
                key={item.tab}
              >
                <span aria-hidden="true" className="w-4 text-center text-base">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl bg-[#f4f6f1] p-4">
            <p className="text-xs font-semibold text-[#3d5947]">
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
          <header className="flex items-center justify-between border-b border-[#e6eae4] bg-white px-5 py-4 sm:px-8">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#8a958d]">
                {role === "admin" ? "Administration" : "Staff workspace"}
              </p>
              <p className="mt-1 text-sm font-semibold text-[#2c3d32]">
                {activeTabTitle}
              </p>
            </div>
            <ProfileDropdown
              email={email}
              fullName={fullName}
              profile={profile}
            />
          </header>
          <div className="px-5 py-7 sm:px-8 sm:py-9">{children}</div>
        </div>
      </div>
    </main>
  );
}
