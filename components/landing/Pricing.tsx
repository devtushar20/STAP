import React from "react";
import { PRICING_TIERS } from "@/lib/constants";

interface PricingProps {
  onOpenDemo: (mode?: "demo" | "sales", plan?: string) => void;
}

export const Pricing: React.FC<PricingProps> = ({ onOpenDemo }) => {
  return (
    <section className="rs" id="pricing">
      <div className="wrap">
        <div className="tag gr">Pricing</div>
        <div className="head2">
          <h2>
            Predictable pricing
            <br />
            for <span className="g">modern hiring teams.</span>
          </h2>
          <div className="pw">
            <p>
              Deploy autonomous AI agents that scale with your hiring volume. No
              setup fees or complex contracts.
            </p>
          </div>
        </div>
        <div className="c3-pricing">
          {PRICING_TIERS.map((tier) => {
            const isHighlighted = tier.isPopular;
            return (
              <div
                key={tier.id}
                className="card rc"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  borderColor: isHighlighted ? "var(--p)" : undefined,
                  borderWidth: isHighlighted ? "1.5px" : undefined,
                }}
              >
                <div>
                  {isHighlighted ? (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        className="num"
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          color: "var(--p)",
                        }}
                      >
                        {tier.tierNumber}
                      </span>
                      <span
                        style={{
                          fontSize: "9.5px",
                          fontWeight: 700,
                          padding: "2px 7px",
                          background: "var(--icp)",
                          color: "var(--p)",
                          borderRadius: "4px",
                          textTransform: "uppercase",
                        }}
                      >
                        Popular
                      </span>
                    </div>
                  ) : (
                    <span
                      className="num"
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        color: "var(--mute)",
                      }}
                    >
                      {tier.tierNumber}
                    </span>
                  )}
                  <h4>{tier.name}</h4>
                  <div className="price-num">
                    {tier.price}
                    {tier.period && (
                      <small
                        style={{
                          fontSize: "12px",
                          fontFamily: "var(--font-inter), sans-serif",
                          color: "var(--mute)",
                          fontWeight: 400,
                        }}
                      >
                        {tier.period}
                      </small>
                    )}
                  </div>
                  <p>{tier.description}</p>
                  <div className="feature-list">
                    {tier.features.map((feature) => (
                      <div key={feature}>{feature}</div>
                    ))}
                  </div>
                </div>
                <button
                  className={`btn ${tier.buttonVariant === "dark" ? "dark" : ""} ${
                    tier.actionType === "sales" ? "js-talk-sales" : "js-book-demo"
                  }`}
                  type="button"
                  data-plan={tier.name}
                  style={{ width: "100%", textAlign: "center" }}
                  onClick={() => onOpenDemo(tier.actionType, tier.name)}
                >
                  {tier.buttonText}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

