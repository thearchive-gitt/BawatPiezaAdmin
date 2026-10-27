"use client";

import { useState } from "react";
import type { DashboardData } from "@/lib/dashboard-data";
import { CreateBusinessAccountModal } from "./create-business-account-modal";
import { BusinessAccountStatusButton } from "./business-account-status-button";
import { initials, Panel, PanelHeading, StatusBadge } from "./dashboard-primitives";

const PAGE_SIZE = 10;

function PaginationControls({
  currentPage,
  pageCount,
  resultCount,
  onPageChange,
}: {
  currentPage: number;
  pageCount: number;
  resultCount: number;
  onPageChange: (page: number) => void;
}) {
  if (resultCount === 0) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs text-[#849087]">
        Page {currentPage} of {pageCount} · {resultCount.toLocaleString()}{" "}
        matching accounts
      </p>
      <nav aria-label="Account table pagination" className="flex items-center gap-2">
        <button
          aria-label="Previous page"
          className="rounded-lg border border-[#dce3dd] px-3 py-2 text-xs font-medium text-[#526258] transition hover:bg-[#f5f7f3] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          type="button"
        >
          Previous
        </button>
        <button
          aria-label="Next page"
          className="rounded-lg border border-[#dce3dd] px-3 py-2 text-xs font-medium text-[#526258] transition hover:bg-[#f5f7f3] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={currentPage >= pageCount}
          onClick={() => onPageChange(currentPage + 1)}
          type="button"
        >
          Next
        </button>
      </nav>
    </div>
  );
}

export function StaffAccountsTab({
  accounts,
  count,
}: {
  accounts: DashboardData["businessAccounts"];
  count: number | null;
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const normalizedSearch = search.trim().toLocaleLowerCase();
  const filteredAccounts = accounts.filter((account) => {
    const searchableText = [
      account.firstname,
      account.middlename,
      account.lastname,
      account.email,
      account.role,
      account.status,
      account.is_active ? "active" : "inactive",
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase();

    return searchableText.includes(normalizedSearch);
  });
  const pageCount = Math.max(1, Math.ceil(filteredAccounts.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleAccounts = filteredAccounts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <Panel id="staff">
      <PanelHeading
        title="Business account management"
        description="Admin and staff accounts stored in business_accounts"
        action={`${count === null ? "—" : count.toLocaleString()} accounts`}
      />
      <div className="mb-5">
        <CreateBusinessAccountModal />
      </div>
      {accounts.length === 0 ? (
        <p className="rounded-xl bg-[#f6f8f5] px-4 py-7 text-center text-sm text-[#718078]">
          {count === null
            ? "Could not load business accounts. Check the dashboard warning above."
            : "No business accounts were found."}
        </p>
      ) : (
        <>
          <label className="mb-4 block max-w-md text-xs font-medium text-[#526258]">
            Search business accounts
            <input
              className="mt-1.5 h-10 w-full rounded-lg border border-[#dce3dd] bg-white px-3 text-sm outline-none placeholder:text-[#a0a9a2] focus:border-[#3b7557] focus:ring-4 focus:ring-[#3b7557]/10"
              onChange={(event) => {
                setSearch(event.currentTarget.value);
                setPage(1);
              }}
              placeholder="Search name, email, role, or status"
              type="search"
              value={search}
            />
          </label>
          {filteredAccounts.length === 0 ? (
            <p className="rounded-xl bg-[#f6f8f5] px-4 py-7 text-center text-sm text-[#718078]">
              No business accounts match “{search}”.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#edf0ec] text-[11px] uppercase tracking-[0.12em] text-[#929c95]">
                      <th className="px-3 pb-3 font-medium">Name</th>
                      <th className="px-3 pb-3 font-medium">Email</th>
                      <th className="px-3 pb-3 font-medium">Role</th>
                      <th className="px-3 pb-3 font-medium">Status</th>
                      <th className="px-3 pb-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleAccounts.map((account) => {
                      const name = [
                        account.firstname,
                        account.middlename,
                        account.lastname,
                      ]
                        .filter(Boolean)
                        .join(" ");
                      const isActive =
                        account.is_active && account.status === "active";

                      return (
                        <tr
                          className="border-b border-[#f0f2ef] last:border-0"
                          key={account.id}
                        >
                          <td className="px-3 py-3.5 font-medium text-[#34463a]">
                            {name || "Unnamed account"}
                          </td>
                          <td className="px-3 py-3.5 text-[#718078]">
                            {account.email}
                          </td>
                          <td className="px-3 py-3.5">
                            <StatusBadge status={account.role} />
                          </td>
                          <td className="px-3 py-3.5">
                            <StatusBadge status={isActive ? "active" : "inactive"} />
                          </td>
                          <td className="px-3 py-3.5">
                            <BusinessAccountStatusButton
                              accountId={account.id}
                              isActive={isActive}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <PaginationControls
                currentPage={currentPage}
                onPageChange={setPage}
                pageCount={pageCount}
                resultCount={filteredAccounts.length}
              />
            </>
          )}
        </>
      )}
    </Panel>
  );
}

export function UserAccountsTab({
  userAccounts,
  count,
}: {
  userAccounts: DashboardData["userAccounts"];
  count: number | null;
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const normalizedSearch = search.trim().toLocaleLowerCase();
  const filteredAccounts = userAccounts.filter((account) => {
    const searchableText = [
      account.firstname,
      account.middlename,
      account.lastname,
      account.email,
      account.contactNo,
      account.status,
      account.is_active ? "active" : "inactive",
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase();

    return searchableText.includes(normalizedSearch);
  });
  const pageCount = Math.max(1, Math.ceil(filteredAccounts.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleAccounts = filteredAccounts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <Panel id="customers">
      <PanelHeading
        title="User account management"
        description="Client accounts stored in user_accounts"
        action={`${count === null ? "—" : count.toLocaleString()} users`}
      />
      {userAccounts.length === 0 ? (
        <p className="rounded-xl bg-[#f6f8f5] px-4 py-8 text-center text-sm text-[#718078]">
          {count === null
            ? "Could not load user accounts. Check the dashboard warning above."
            : "No user accounts were found."}
        </p>
      ) : (
        <>
          <label className="mb-4 block max-w-md text-xs font-medium text-[#526258]">
            Search user accounts
            <input
              className="mt-1.5 h-10 w-full rounded-lg border border-[#dce3dd] bg-white px-3 text-sm outline-none placeholder:text-[#a0a9a2] focus:border-[#3b7557] focus:ring-4 focus:ring-[#3b7557]/10"
              onChange={(event) => {
                setSearch(event.currentTarget.value);
                setPage(1);
              }}
              placeholder="Search name, email, contact, or status"
              type="search"
              value={search}
            />
          </label>
          {filteredAccounts.length === 0 ? (
            <p className="rounded-xl bg-[#f6f8f5] px-4 py-8 text-center text-sm text-[#718078]">
              No user accounts match “{search}”.
            </p>
          ) : (
            <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#edf0ec] text-[11px] uppercase tracking-[0.12em] text-[#929c95]">
                  <th className="px-3 pb-3 font-medium">Client</th>
                  <th className="px-3 pb-3 font-medium">Email</th>
                  <th className="px-3 pb-3 font-medium">Contact</th>
                  <th className="px-3 pb-3 font-medium">Status</th>
                  <th className="px-3 pb-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {visibleAccounts.map((account) => {
                  const name = [
                    account.firstname,
                    account.middlename,
                    account.lastname,
                  ]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <tr
                      className="border-b border-[#f0f2ef] last:border-0"
                      key={account.id}
                    >
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#edf3e6] text-xs font-semibold text-[#406148]">
                            {initials(name)}
                          </span>
                          <div>
                            <p className="font-medium text-[#34463a]">
                              {name || "Unnamed client"}
                            </p>
                            <p className="mt-0.5 font-mono text-[10px] text-[#929c95]">
                              {account.id.slice(0, 8)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-[#718078]">
                        {account.email}
                      </td>
                      <td className="px-3 py-3.5 text-[#718078]">
                        {account.contactNo || "—"}
                      </td>
                      <td className="px-3 py-3.5">
                        <StatusBadge
                          status={
                            !account.is_active && account.status === "active"
                              ? "inactive"
                              : account.status
                          }
                        />
                      </td>
                      <td className="px-3 py-3.5 text-xs text-[#718078]">
                        {new Date(account.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
              <PaginationControls
                currentPage={currentPage}
                onPageChange={setPage}
                pageCount={pageCount}
                resultCount={filteredAccounts.length}
              />
            </>
          )}
        </>
      )}
    </Panel>
  );
}
