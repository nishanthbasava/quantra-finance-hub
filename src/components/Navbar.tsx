import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import quantraLogo from "@/assets/quantra-logo.png";

const navLinks = [
  { label: "Dashboard", path: "/" },
  { label: "Transactions", path: "/transactions" },
  { label: "Workplace", path: "/workplace" },
  { label: "Simulation", path: "/simulation" },
  { label: "XRPL Vault", path: "/xrpl-vault" },
];

const Navbar = () => {
  const location = useLocation();
  const [demoMode, setDemoMode] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

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
            <img src={quantraLogo} alt="Quantra" className="h-14 -my-3 w-auto rounded bg-background" />
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
        <div className="flex items-center gap-4">
          {/* Demo Mode Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDemoMode(!demoMode)}
              className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${
                demoMode ? "quantra-gradient-bg" : "bg-muted"
              }`}
            >
              <span
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-card shadow-sm transition-transform duration-200 ${
                  demoMode ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <span className="text-sm text-muted-foreground font-medium">Demo Mode</span>
          </div>

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
