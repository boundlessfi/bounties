"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { NavRankBadge } from "@/components/leaderboard/nav-rank-badge";
import { SearchCommand } from "@/components/search-command";
import { ModeToggle } from "@/components/mode-toggle";

export default function GlobalResizableNavbar() {

  const navItems = [
    { name: "Explore", link: "/bounty" },
    { name: "Projects", link: "/projects" },
    { name: "Leaderboard", link: "/leaderboard" },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <Navbar className="">
      <NavBody>
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 font-bold pointer-events-auto px-2">
            <span className="text-xl tracking-tight">Bounties</span>
          </Link>
        </div>

        <NavItems items={navItems} />

        <div className="flex items-center gap-2">
          <NavRankBadge userId="user-1" className="hidden sm:flex" />
          <SearchCommand />
          <ModeToggle />
        </div>
      </NavBody>

      <MobileNav>
        <MobileNavHeader>
          <Link href="/" className="flex items-center gap-2 font-bold pointer-events-auto px-2">
            <span className="text-lg tracking-tight">Bounties</span>
          </Link>

          <MobileNavToggle
            isOpen={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </MobileNavHeader>

        <MobileNavMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)}>
          {navItems.map((item, idx) => (
            <a
              key={`mobile-link-${idx}`}
              href={item.link}
              onClick={() => setIsMobileMenuOpen(false)}
              className="relative text-neutral-600 dark:text-neutral-300"
            >
              <span className="block">{item.name}</span>
            </a>
          ))}

          <div className="flex w-full flex-col gap-4 pt-2">
            <div className="flex items-center gap-2">
              <SearchCommand />
              <ModeToggle />
            </div>
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
