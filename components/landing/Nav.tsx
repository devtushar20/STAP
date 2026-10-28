"use client";

import React, { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { NAV_LINKS } from "@/lib/constants";

interface NavProps {
  onOpenDemo: (mode?: "demo" | "sales", plan?: string) => void;
  onOpenLogin: () => void;
}

export const Nav: React.FC<NavProps> = ({ onOpenDemo, onOpenLogin }) => {
  const [activeSection, setActiveSection] = useState<string>("product");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const sectionIds = ["product", "agents", "pipeline", "pricing", "resources", "cta"];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0.1 }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleAnchorClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (!href.startsWith("#")) return;
    const targetId = href.slice(1);
    const targetEl = document.getElementById(targetId);
    if (targetEl) {
      e.preventDefault();
      setMobileMenuOpen(false);

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      targetEl.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });

      window.history.pushState(null, "", `#${targetId}`);
      targetEl.setAttribute("tabindex", "-1");
      targetEl.focus({ preventScroll: true });
    }
  };

  return (
    <header className="site-header">
      <nav>
        <div className="logo">
          <i></i>STAP
        </div>

        <ul>
          {NAV_LINKS.map((link) => {
            const isActive = activeSection === link.href.slice(1);
            return (
              <li key={link.href}>
                <a
                  className={`nav-link ${isActive ? "active" : ""}`}
                  href={link.href}
                  aria-current={isActive ? "true" : undefined}
                  onClick={(e) => handleAnchorClick(e, link.href)}
                >
                  {link.label}
                </a>
              </li>
            );
          })}
        </ul>

        <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
          <ThemeToggle />
          <button
            className="btn-text js-login-btn nav-desktop-cta"
            type="button"
            onClick={onOpenLogin}
          >
            Log in
          </button>
          <button
            className="btn dark js-book-demo nav-desktop-cta"
            type="button"
            onClick={() => onOpenDemo("demo")}
          >
            Book a Demo
          </button>
          <button
            className="menu-toggle"
            id="menu-toggle"
            type="button"
            aria-expanded={mobileMenuOpen ? "true" : "false"}
            aria-controls="mobile-menu"
            aria-label="Toggle navigation menu"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </button>
        </div>
      </nav>

      <div
        className="mobile-menu"
        id="mobile-menu"
        hidden={!mobileMenuOpen}
      >
        <ul>
          {NAV_LINKS.map((link) => {
            const isActive = activeSection === link.href.slice(1);
            return (
              <li key={link.href}>
                <a
                  className={`mobile-nav-link ${isActive ? "active" : ""}`}
                  href={link.href}
                  onClick={(e) => handleAnchorClick(e, link.href)}
                >
                  {link.label}
                </a>
              </li>
            );
          })}
        </ul>
        <div className="mobile-menu-actions">
          <button
            className="btn-text js-login-btn"
            type="button"
            style={{ textAlign: "left", padding: "8px 0" }}
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenLogin();
            }}
          >
            Log in
          </button>
          <button
            className="btn dark js-book-demo"
            type="button"
            style={{ width: "100%", textAlign: "center" }}
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenDemo("demo");
            }}
          >
            Book a Demo
          </button>
        </div>
      </div>
    </header>
  );
};

