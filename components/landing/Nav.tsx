"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { NAV_LINKS } from "@/lib/constants";

interface NavProps {
  onOpenDemo: (mode?: "demo" | "sales", plan?: string) => void;
  onOpenLogin: () => void;
}

export const Nav: React.FC<NavProps> = ({ onOpenDemo, onOpenLogin }) => {
  const [activeSection, setActiveSection] = useState<string>("product");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const headerRef = useRef<HTMLElement>(null);
  const scrollSpyPausedRef = useRef(false);
  const scrollEndArmedRef = useRef(false);
  const scrollEndTimeoutRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const anchorScrollFrameRef = useRef<number | null>(null);
  const resumeScrollSpyRef = useRef<() => void>(() => {});

  useEffect(() => {
    const sections = NAV_LINKS.map((link) =>
      document.getElementById(link.href.slice(1))
    )
      .filter((section): section is HTMLElement => section !== null)
      .sort((a, b) => {
        if (a === b) return 0;
        return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING
          ? -1
          : 1;
      });

    const updateActiveSection = () => {
      if (scrollSpyPausedRef.current) return;

      const headerHeight = headerRef.current?.getBoundingClientRect().height ?? 0;
      const threshold = headerHeight + 24;
      const atBottom =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 1;

      const activeId = atBottom
        ? sections[sections.length - 1].id
        : sections.reduce((lastVisibleId, section) => {
            return section.getBoundingClientRect().top <= threshold
              ? section.id
              : lastVisibleId;
          }, sections[0].id);

      setActiveSection((previous) =>
        previous === activeId ? previous : activeId
      );
    };

    const scheduleActiveSectionUpdate = () => {
      if (
        scrollSpyPausedRef.current ||
        animationFrameRef.current !== null
      ) {
        return;
      }

      animationFrameRef.current = window.requestAnimationFrame(() => {
        animationFrameRef.current = null;
        updateActiveSection();
      });
    };

    const resumeScrollSpy = () => {
      if (!scrollSpyPausedRef.current) return;

      scrollSpyPausedRef.current = false;
      if (scrollEndTimeoutRef.current !== null) {
        window.clearTimeout(scrollEndTimeoutRef.current);
        scrollEndTimeoutRef.current = null;
      }
      updateActiveSection();
    };

    resumeScrollSpyRef.current = resumeScrollSpy;

    const onScrollEnd = () => {
      if (scrollEndArmedRef.current) resumeScrollSpy();
    };
    window.addEventListener("scroll", scheduleActiveSectionUpdate, {
      passive: true,
    });
    window.addEventListener("resize", scheduleActiveSectionUpdate);
    window.addEventListener("scrollend", onScrollEnd);
    document.addEventListener("scrollend", onScrollEnd);
    scheduleActiveSectionUpdate();

    return () => {
      window.removeEventListener("scroll", scheduleActiveSectionUpdate);
      window.removeEventListener("resize", scheduleActiveSectionUpdate);
      window.removeEventListener("scrollend", onScrollEnd);
      document.removeEventListener("scrollend", onScrollEnd);
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (anchorScrollFrameRef.current !== null) {
        window.cancelAnimationFrame(anchorScrollFrameRef.current);
        anchorScrollFrameRef.current = null;
      }
      if (scrollEndTimeoutRef.current !== null) {
        window.clearTimeout(scrollEndTimeoutRef.current);
        scrollEndTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      if (headerRef.current && target && !headerRef.current.contains(target)) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [mobileMenuOpen]);

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
      setActiveSection(targetId);
      scrollSpyPausedRef.current = true;
      scrollEndArmedRef.current = false;
      if (anchorScrollFrameRef.current !== null) {
        window.cancelAnimationFrame(anchorScrollFrameRef.current);
      }
      if (scrollEndTimeoutRef.current !== null) {
        window.clearTimeout(scrollEndTimeoutRef.current);
        scrollEndTimeoutRef.current = null;
      }

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const supportsScrollEnd = "onscrollend" in window;

      anchorScrollFrameRef.current = window.requestAnimationFrame(() => {
        anchorScrollFrameRef.current = window.requestAnimationFrame(() => {
          anchorScrollFrameRef.current = null;
          scrollEndArmedRef.current = true;
          targetEl.scrollIntoView({
            behavior: prefersReducedMotion ? "auto" : "smooth",
            block: "start",
          });

          if (prefersReducedMotion) {
            resumeScrollSpyRef.current();
          } else if (!supportsScrollEnd) {
            scrollEndTimeoutRef.current = window.setTimeout(
              () => resumeScrollSpyRef.current(),
              600
            );
          }
        });
      });
    }
  };

  return (
    <header className="site-header" ref={headerRef}>
      <nav aria-label="Primary">
        <a className="logo" href="#product" onClick={(e) => handleAnchorClick(e, "#product")}>
          <i></i>STAP
        </a>

        <ul>
          {NAV_LINKS.map((link) => {
            const isActive = activeSection === link.href.slice(1);
            return (
              <li key={link.href}>
                <a
                  className={`nav-link ${isActive ? "active" : ""}`}
                  href={link.href}
                  aria-current={isActive ? "location" : undefined}
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
          <Link className="btn-text nav-desktop-cta" href="/assistant">
            Try the Demo
          </Link>
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
            aria-expanded={mobileMenuOpen}
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

      <div className="mobile-menu" id="mobile-menu" hidden={!mobileMenuOpen}>
        <ul>
          {NAV_LINKS.map((link) => {
            const isActive = activeSection === link.href.slice(1);
            return (
              <li key={link.href}>
                <a
                  className={`mobile-nav-link ${isActive ? "active" : ""}`}
                  href={link.href}
                  aria-current={isActive ? "location" : undefined}
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
          <Link
            className="btn-text"
            href="/assistant"
            style={{ textAlign: "left", padding: "8px 0" }}
            onClick={() => setMobileMenuOpen(false)}
          >
            Try the Demo
          </Link>
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
