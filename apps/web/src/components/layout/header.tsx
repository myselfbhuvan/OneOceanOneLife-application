"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Search,
  Bell,
  ChevronDown,
  Users,
  AlertTriangle,
  LogOut,
  Settings,
  User,
  Package,
  Waves,
  Recycle,
  ShoppingCart,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavData, useNavFilter } from "@/components/layout/nav-data";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-context";
import { useHydrated } from "@/hooks/use-hydrated";
import { useCart } from "@/components/cart-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SearchDialog } from "@/components/layout/search-dialog";
import { NotificationPanel } from "@/components/layout/notification-panel";
import { CartSidebar } from "@/components/layout/cart-sidebar";
import { resolveActiveMenu, type MenuOption } from "@/admin/config";
import { useHeaderMenuConfig } from "@/hooks/use-header-menu";
import { Option1Nav } from "@/components/layout/option1-nav";
import { Option2Nav } from "@/components/layout/option2-nav";
import { Option3Nav } from "@/components/layout/option3-nav";
import { Option4Sidebar } from "@/components/layout/option4-nav";
import { Option5BrandZone, Option5NavRow } from "@/components/layout/option5-nav";

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function Header() {
  const pathname = usePathname();
  const headerMenu = useHeaderMenuConfig();
  const activeMenu: MenuOption = resolveActiveMenu(headerMenu);
  const { navGroups } = useNavData();
  const menuFilter = useNavFilter();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [notificationOpen, setNotificationOpen] = React.useState(false);
  const [cartOpen, setCartOpen] = React.useState(false);
  const mounted = useHydrated();
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const mobileMenuRef = React.useRef<HTMLDivElement>(null);
  const headerRef = React.useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = React.useState(80);
  const [prevPathname, setPrevPathname] = React.useState(pathname);
  const [headerHidden, setHeaderHidden] = React.useState(false);
  const lastScrollY = React.useRef(0);

  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setNotificationOpen(false);
    setHeaderHidden(false);
  }

  /* ESC key closes mobile menu */
  React.useEffect(() => {
    if (!mobileMenuOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [mobileMenuOpen]);

  /* Lock body scroll when mobile menu is open */
  React.useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  /* Option 4 adds a fixed sidebar on desktop: shift the page content */
  React.useEffect(() => {
    if (activeMenu !== "option4") return;
    document.body.classList.add("nav-sidebar-4");
    return () => {
      document.body.classList.remove("nav-sidebar-4");
    };
  }, [activeMenu]);

  /* Track the rendered header height so the mobile menu docks below it
     (each menu style — especially option5 — has a different height). */
  React.useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const update = () => setHeaderHeight(el.offsetHeight);
    update();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [activeMenu]);

  /* Hide the menu while scrolling down, reveal it while scrolling up */
  React.useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      const previousY = lastScrollY.current;
      lastScrollY.current = currentY;

      if (mobileMenuOpen || currentY <= 120) {
        setHeaderHidden(false);
        return;
      }
      if (currentY > previousY + 8) {
        setHeaderHidden(true);
      } else if (currentY < previousY - 8) {
        setHeaderHidden(false);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [mobileMenuOpen]);

  /* Focus trap for mobile menu */
  React.useEffect(() => {
    if (!mobileMenuOpen || !mobileMenuRef.current) return;
    const container = mobileMenuRef.current;
    const focusable = container.querySelectorAll<HTMLElement>(
      'a[href], button, input, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;
    focusable[0].focus();

    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    container.addEventListener("keydown", handler);
    return () => container.removeEventListener("keydown", handler);
  }, [mobileMenuOpen]);

  /* Right-side action buttons — shared by every header style */
  const renderActions = () => (
    <>
      {/* Search toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setSearchOpen(true)}
        className="hidden sm:flex"
        aria-label="Open search"
      >
        <Search className="h-5 w-5" />
      </Button>

      {/* Cart — only when the admin "Marketplace" menu item is visible */}
      {menuFilter.isVisible("/marketplace") && (
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => setCartOpen(true)}
          aria-label="Open cart"
        >
          <ShoppingCart className="h-5 w-5" />
          {mounted && totalItems > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-ocean-blue text-white text-xs font-bold flex items-center justify-center">
              {totalItems > 99 ? "99+" : totalItems}
            </span>
          )}
        </Button>
      )}

      {/* Notifications */}
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
          onClick={() => setNotificationOpen(!notificationOpen)}
          aria-expanded={notificationOpen}
          aria-haspopup="true"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-ocean-coral animate-pulse-slow" />
        </Button>
        <NotificationPanel
          open={notificationOpen}
          onOpenChange={setNotificationOpen}
        />
      </div>

      {/* Profile / Account */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="hidden sm:flex gap-2 px-2"
            aria-label="Account menu"
          >
            <div
              className="h-8 w-8 rounded-full bg-ocean-blue flex items-center justify-center text-white text-sm font-medium"
              suppressHydrationWarning
            >
              {mounted && user ? user.firstName.charAt(0).toUpperCase() : "A"}
            </div>
            <ChevronDown className="h-4 w-4 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 rounded-xl p-3 pt-2 shadow-lg animate-in fade-in-up">
          {mounted && user ? (
            <>
              <div className="px-3 py-2.5">
                <div className="text-sm font-semibold text-ocean-navy">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-xs text-ocean-muted mt-0.5">{user.email}</div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="flex items-center gap-2.5 px-2 py-2 cursor-pointer">
                  <Settings className="h-4 w-4 text-ocean-muted" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/contributions" className="flex items-center gap-2.5 px-2 py-2 cursor-pointer">
                  <Award className="h-4 w-4 text-ocean-muted" />
                  My Contributions
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center gap-2.5 px-2 py-2 cursor-pointer">
                  <User className="h-4 w-4 text-ocean-muted" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="flex items-center gap-2.5 px-2 py-2 cursor-pointer">
                <LogOut className="h-4 w-4 text-ocean-muted" />
                Logout
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem asChild>
                <Link href="/login" className="flex items-center gap-2.5 px-2 py-2 cursor-pointer">
                  <User className="h-4 w-4 text-ocean-muted" />
                  Sign In
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/register" className="flex items-center gap-2.5 px-2 py-2 cursor-pointer">
                  <Users className="h-4 w-4 text-ocean-muted" />
                  Join O3L
                </Link>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Mobile hamburger */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden h-12 w-12 touch-manipulation"
        type="button"
        onClick={() => setMobileMenuOpen((open) => !open)}
        aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        aria-expanded={mobileMenuOpen}
        aria-controls="mobile-menu"
      >
        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>
    </>
  );

  return (
    <>
    <header
      ref={headerRef}
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border/50 bg-white/95 backdrop-blur-xl shadow-sm",
        "transition-transform duration-300 ease-in-out will-change-transform",
        headerHidden && "-translate-y-full"
      )}
    >
      {activeMenu === "option5" ? (
        /* ---------------------------------------------- */
        /*  Option 5: document-style two-tier header       */
        /* ---------------------------------------------- */
        <div className="relative flex items-stretch">
          <Option5BrandZone />
          <div className="flex min-w-0 flex-1 flex-row items-center justify-end gap-2.5 px-4 lg:flex-col lg:justify-center lg:gap-3 lg:px-6">
            <div className="flex w-full items-center justify-end gap-1 sm:gap-2.5">
              {renderActions()}
            </div>
            <Option5NavRow />
          </div>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-ocean-blue via-[#22D3EE] to-ocean-green"
          />
        </div>
      ) : (
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">

        <div className="flex min-h-[80px] items-center justify-between">

          {/* ============================================================ */}
          {/*  Left: Logo + Nav Brand                                             */}
          {/* ============================================================ */}
          <div className="flex min-w-0 items-center gap-1 sm:gap-2">

            {/* Logo — large, prominent, never shrinks */}
            <Link
              href="/"
              className="relative flex-shrink-0 h-16 sm:h-24 md:h-32 lg:h-40 xl:h-48 w-[150px] min-[400px]:w-[180px] sm:w-[260px] md:w-[320px] lg:w-[380px] xl:w-[440px]"
              aria-label="O3L – One Ocean One Life – Home"
            >
              <Image
                src="/o3l-logo.png"
                alt="O3L – One Ocean One Life"
                fill
                sizes="200px"
                className="object-contain transition-opacity duration-200 hover:opacity-105"
                priority
              />
            </Link>

            {/* Desktop navigation — rendered per the admin "Header Menu" config.
                option3 = full-width tab bar below the row, option4 = fixed sidebar. */}
            {activeMenu === "option1" && (
              <Option1Nav onOpenSearch={() => setSearchOpen(true)} />
            )}
            {activeMenu === "option2" && <Option2Nav />}
          </div>

          {/* ============================================================ */}
          {/*  Right: Action buttons                                         */}
          {/* ============================================================ */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {renderActions()}
          </div>
        </div>
      </div>
      )}

      {/* Option 3: full-width tabbed navigation bar */}
      {activeMenu === "option3" && <Option3Nav />}
    </header>

    {/* ============================================================ */}
    {/*  Cart Sidebar (rendered outside sticky header)                 */}
    {/* ============================================================ */}
    <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />

    {/* ============================================================ */}
    {/*  Search dialog (opened from the header / mobile menu)          */}
    {/* ============================================================ */}
    <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />

    {/* ============================================================ */}
    {/*  Option 4: fixed desktop sidebar (body.nav-sidebar-4 shifts   */}
    {/*  the page on lg+; mobile uses the hamburger menu)              */}
    {/* ============================================================ */}
    {activeMenu === "option4" && <Option4Sidebar />}

    {/* ============================================================ */}
    {/*  Mobile menu overlay                                            */}
    {/* ============================================================ */}
    {mobileMenuOpen && (
      <div
        className="lg:hidden fixed inset-0 z-[60] animate-fade-in"
        style={{ top: headerHeight }}
        id="mobile-menu"
        role="dialog"
        aria-label="Mobile navigation"
        aria-modal="true"
        ref={mobileMenuRef}
      >
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
        <nav className="relative h-full bg-white overflow-y-auto animate-slide-in-right">
          <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
            {navGroups.find((g) => g.label === "Explore") && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ocean-muted px-1 mb-3">Explore</h3>
              <div className="space-y-0.5">
                {navGroups.find((g) => g.label === "Explore")?.items.map((item) => {
                  const ItemIcon = item.icon;
                  const active = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}
                      className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150",
                        active ? "bg-ocean-light text-ocean-blue" : "text-ocean-text-secondary hover:bg-ocean-light hover:text-ocean-blue")}>
                      <ItemIcon className="h-4 w-4 shrink-0" />{item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
            )}
            {navGroups.find((g) => g.label === "Community") && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ocean-muted px-1 mb-3">Community</h3>
              <div className="space-y-0.5">
                {navGroups.find((g) => g.label === "Community")?.items.map((item) => {
                  const ItemIcon = item.icon;
                  const active = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}
                      className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150",
                        active ? "bg-ocean-light text-ocean-blue" : "text-ocean-text-secondary hover:bg-ocean-light hover:text-ocean-blue")}>
                      <ItemIcon className="h-4 w-4 shrink-0" />{item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
            )}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ocean-muted px-1 mb-3">Other</h3>
              <div className="space-y-0.5">
                {menuFilter.isVisible("/marketplace") && (
                  <Link href="/marketplace" onClick={() => setMobileMenuOpen(false)}
                    className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150",
                      (pathname === "/marketplace" || pathname.startsWith("/marketplace/")) ? "bg-ocean-light text-ocean-blue" : "text-ocean-text-secondary hover:bg-ocean-light hover:text-ocean-blue")}>
                    <Package className="h-4 w-4 shrink-0" />Marketplace
                  </Link>
                )}
                {menuFilter.isVisible("/ecotourism") && (
                  <Link href="/ecotourism" onClick={() => setMobileMenuOpen(false)}
                    className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150",
                      (pathname === "/ecotourism" || pathname.startsWith("/ecotourism/")) ? "bg-ocean-light text-ocean-blue" : "text-ocean-text-secondary hover:bg-ocean-light hover:text-ocean-blue")}>
                    <Waves className="h-4 w-4 shrink-0" />Ecotourism
                  </Link>
                )}
                <Link href="/economy/shg" onClick={() => setMobileMenuOpen(false)}
                  className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150",
                    pathname.startsWith("/economy/shg") ? "bg-ocean-light text-ocean-blue" : "text-ocean-text-secondary hover:bg-ocean-light hover:text-ocean-blue")}>
                  <Recycle className="h-4 w-4 shrink-0" />Fisherwomen SHGs
                </Link>
                {menuFilter.isVisible("/emergency") && (
                  <Link href="/emergency" onClick={() => setMobileMenuOpen(false)}
                    className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150",
                      (pathname === "/emergency" || pathname.startsWith("/emergency/")) ? "bg-ocean-danger/10 text-ocean-danger" : "text-ocean-danger hover:bg-ocean-danger/10")}>
                    <AlertTriangle className="h-4 w-4 shrink-0" />Emergency
                  </Link>
                )}
              </div>
            </div>
            <div className="border-t border-border/50" />
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ocean-muted px-1 mb-3">Account</h3>
              <div className="space-y-0.5">
                <button onClick={() => { setMobileMenuOpen(false); setSearchOpen(true); }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-ocean-text-secondary hover:bg-ocean-light hover:text-ocean-blue transition-colors duration-150 w-full text-left">
                  <Search className="h-4 w-4 shrink-0" />Search
                </button>
                <button onClick={() => { setMobileMenuOpen(false); setNotificationOpen(true); }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-ocean-text-secondary hover:bg-ocean-light hover:text-ocean-blue transition-colors duration-150 w-full text-left">
                  <Bell className="h-4 w-4 shrink-0" />Notifications
                </button>
                {mounted && user ? (
                  <>
                    <Link href="/profile" onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-ocean-text-secondary hover:bg-ocean-light hover:text-ocean-blue transition-colors duration-150">
                      <User className="h-4 w-4 shrink-0" />Profile
                    </Link>
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-ocean-text-secondary hover:bg-ocean-light hover:text-ocean-blue transition-colors duration-150">
                      <Settings className="h-4 w-4 shrink-0" />Dashboard
                    </Link>
                    <Link href="/dashboard/contributions" onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-ocean-text-secondary hover:bg-ocean-light hover:text-ocean-blue transition-colors duration-150">
                      <Award className="h-4 w-4 shrink-0" />My Contributions
                    </Link>
                    <button onClick={() => { logout(); setMobileMenuOpen(false); }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-ocean-text-secondary hover:bg-ocean-light hover:text-ocean-blue transition-colors duration-150 w-full text-left">
                      <LogOut className="h-4 w-4 shrink-0" />Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-ocean-text-secondary hover:bg-ocean-light hover:text-ocean-blue transition-colors duration-150">
                      <User className="h-4 w-4 shrink-0" />Sign In
                    </Link>
                    <Link href="/register" onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-ocean-text-secondary hover:bg-ocean-light hover:text-ocean-blue transition-colors duration-150">
                      <Users className="h-4 w-4 shrink-0" />Join O3L
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>
      </div>
    )}
    </>
  );
}
