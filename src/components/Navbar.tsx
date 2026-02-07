import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Moon, Sun, RefreshCw, Lock, Unlock } from "lucide-react";
import quantraLogo from "@/assets/quantra-logo.png";
import { useData } from "@/contexts/DataContext";

const navLinks = [
  { label: "Dashboard", path: "/" },
  { label: "Transactions", path: "/transactions" },
  { label: "Workplace", path: "/workplace" },
  { label: "Simulation", path: "/simulation" },
  { label: "XRPL Vault", path: "/xrpl-vault" },
];

const Navbar = () => {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);
  const { seedInfo, isLocked, onToggleLock, onRegenerate } = useData();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo + Nav */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={quantraLogo} alt="Quantra" className="h-20 -my-6 w-auto dark:brightness-0 dark:invert" />
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`${
                  location.pathname === link.path
                    ? "quantra-nav-link-active"
                    : "quantra-nav-link"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Seed indicator */}
          <span className="hidden md:inline-flex items-center gap-1.5 text-[10px] text-muted-foreground/60 font-mono tabular-nums">
            Synthetic • {seedInfo.profileSeed.toString(16).slice(0, 6).toUpperCase()}
          </span>

          {/* Lock seed toggle */}
          <button
            onClick={onToggleLock}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              isLocked
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-muted/50 border-border/60 text-muted-foreground hover:text-foreground"
            }`}
            title={isLocked ? "Seed locked — data is stable across reloads" : "Seed unlocked — data varies each hour"}
          >
            {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
            <span className="hidden sm:inline">{isLocked ? "Locked" : "Unlocked"}</span>
          </button>

          {/* Regenerate button */}
          <button
            onClick={onRegenerate}
            className="p-2 rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Regenerate data with new persona"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
