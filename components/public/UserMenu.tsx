"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Bookmark, LayoutDashboard, LogOut, UserCircle } from "lucide-react";
import type { UserRole } from "@prisma/client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { signOut } from "@/app/_actions/auth";

type Props = {
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: UserRole;
  bookmarkCount: number;
};

export function UserMenu({
  email,
  name,
  avatarUrl,
  role,
  bookmarkCount,
}: Props) {
  const [open, setOpen] = useState(false);
  const initials = (name ?? email).slice(0, 2).toUpperCase();
  const isStaff = role === "ADMIN" || role === "PANELIST";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label="Open user menu"
            className="relative inline-flex items-center justify-center size-9 rounded-full border border-border bg-secondary text-xs font-medium text-foreground overflow-hidden hover:border-primary/40 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
          />
        }
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt=""
            width={36}
            height={36}
            className="size-full object-cover"
          />
        ) : (
          initials
        )}
        {bookmarkCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-medium flex items-center justify-center border-2 border-background">
            {bookmarkCount > 99 ? "99+" : bookmarkCount}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-56 p-1.5"
      >
        <div className="px-2.5 py-2 border-b border-border">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Signed in as
          </p>
          <p className="text-sm font-medium text-foreground truncate mt-0.5">
            {name ?? email}
          </p>
          {name && (
            <p className="text-xs text-muted-foreground truncate">{email}</p>
          )}
        </div>

        <div className="mt-1 space-y-0.5">
          <MenuItem
            href="/dashboard"
            icon={<Bookmark className="size-3.5" />}
            label="Dashboard"
            badge={bookmarkCount > 0 ? String(bookmarkCount) : undefined}
            onClick={() => setOpen(false)}
          />
          <MenuItem
            href="/profile"
            icon={<UserCircle className="size-3.5" />}
            label="Profile"
            onClick={() => setOpen(false)}
          />
          {isStaff && (
            <MenuItem
              href="/admin"
              icon={<LayoutDashboard className="size-3.5" />}
              label="Admin console"
              onClick={() => setOpen(false)}
            />
          )}

          <div className="my-1 border-t border-border" />

          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 px-2.5 py-1.5 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors text-left cursor-pointer"
            >
              <LogOut className="size-3.5" />
              Sign out
            </button>
          </form>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function MenuItem({
  href,
  icon,
  label,
  badge,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2 px-2.5 py-1.5 text-sm text-foreground hover:bg-secondary rounded-md transition-colors"
    >
      {icon}
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="text-[10px] font-medium px-1.5 rounded bg-secondary text-muted-foreground border border-border">
          {badge}
        </span>
      )}
    </Link>
  );
}
