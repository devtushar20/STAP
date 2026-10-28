"use client";

import React, { useState } from "react";
import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { Problem } from "@/components/landing/Problem";
import { Pipeline } from "@/components/landing/Pipeline";
import { Solution } from "@/components/landing/Solution";
import { Agents } from "@/components/landing/Agents";
import { CommandCenter } from "@/components/landing/CommandCenter";
import { Pricing } from "@/components/landing/Pricing";
import { CtaBand } from "@/components/landing/CtaBand";
import { Footer } from "@/components/landing/Footer";
import { DemoModal } from "@/components/landing/DemoModal";
import { LoginModal } from "@/components/landing/LoginModal";

export default function LandingPage() {
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [demoModalMode, setDemoModalMode] = useState<"demo" | "sales">("demo");
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const handleOpenDemo = (mode: "demo" | "sales" = "demo", plan: string = "") => {
    setDemoModalMode(mode);
    setSelectedPlan(plan);
    setDemoModalOpen(true);
  };

  const handleOpenLogin = () => {
    setLoginModalOpen(true);
  };

  return (
    <>
      <Nav onOpenDemo={handleOpenDemo} onOpenLogin={handleOpenLogin} />
      <main>
        <Hero onOpenDemo={() => handleOpenDemo("demo")} />
        <Problem />
        <Pipeline />
        <Solution />
        <Agents />
        <CommandCenter />
        <Pricing onOpenDemo={handleOpenDemo} />
        <CtaBand onOpenDemo={handleOpenDemo} />
      </main>
      <Footer />

      <DemoModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        initialMode={demoModalMode}
        presetPlan={selectedPlan}
      />

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </>
  );
}

