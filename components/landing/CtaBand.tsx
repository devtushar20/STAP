import React from "react";
import Image from "next/image";

interface CtaBandProps {
  onOpenDemo: (mode?: "demo" | "sales") => void;
}

export const CtaBand: React.FC<CtaBandProps> = ({ onOpenDemo }) => {
  return (
    <div className="cta" id="cta">
      <div className="wrap ctagrid">
        <div className="ctatext">
          <div className="tag" style={{ color: "#111" }}>
            Ready to transform your hiring?
          </div>
          <h2>
            Let’s build
            <br />
            great teams together.
          </h2>
          <div>
            <button
              className="btn dark js-book-demo"
              type="button"
              onClick={() => onOpenDemo("demo")}
            >
              Book a Demo
            </button>
            <button
              className="btn js-talk-sales"
              type="button"
              style={{ marginLeft: "8px" }}
              onClick={() => onOpenDemo("sales")}
            >
              Talk to Sales
            </button>
          </div>
        </div>
        <Image
          className="ctaimg"
          alt="A recruiter and a friendly robot high-five. Human judgment plus AI intelligence."
          src="/assets/cta.webp"
          width={1100}
          height={550}
        />
      </div>
    </div>
  );
};

