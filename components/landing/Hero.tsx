import React from "react";
import Image from "next/image";
import Link from "next/link";
import { TRUST_BRANDS } from "@/lib/constants";

interface HeroProps {
  onOpenDemo: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenDemo }) => {
  return (
    <div className="wrap">
      <div className="hero" id="product">
        <div>
          <div className="tag">AI-powered recruitment platform</div>
          <h1>
            Hire smarter.
            <br />
            Build
            <br />
            <span className="g">better teams.</span>
          </h1>
          <p>
            Six specialized AI agents. One intelligent platform for modern hiring.
          </p>
          <div className="hero-cta">
            <Link className="btn" href="/assistant">
              Try the Demo
            </Link>
            <button className="btn dark" type="button" onClick={onOpenDemo}>
              Book a Demo
            </button>
            <a
              className="btn"
              href="#pipeline"
              onClick={(e) => {
                e.preventDefault();
                const target = document.getElementById("pipeline");
                if (target) {
                  const prefersReducedMotion = window.matchMedia(
                    "(prefers-reduced-motion: reduce)"
                  ).matches;
                  target.scrollIntoView({
                    behavior: prefersReducedMotion ? "auto" : "smooth",
                    block: "start",
                  });
                }
              }}
            >
              See How It Works
            </a>
          </div>
          <div className="trust">
            <span>Trusted by modern teams</span>
            {TRUST_BRANDS.map((brand) => (
              <b key={brand}>{brand}</b>
            ))}
          </div>
        </div>
        <div className="stage">
          <div className="note">
            Good people
            <br />
            great teams
          </div>
          <Image
            className="heroimg"
            src="/assets/hero.webp"
            alt="A recruiter pointing at an AI hub connected to four candidate profile cards"
            width={900}
            height={900}
            sizes="(max-width: 860px) 100vw, 50vw"
            priority
          />
        </div>
      </div>
    </div>
  );
};
