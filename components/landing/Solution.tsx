import React from "react";
import Image from "next/image";
import { SOLUTION_STEPS } from "@/lib/constants";

export const Solution: React.FC = () => {
  return (
    <section className="rs">
      <div className="wrap">
        <div className="tag gr">The solution</div>
        <div className="head3">
          <div>
            <h2>
              A full recruitment
              <br />
              workflow, <span className="g">powered by AI.</span>
            </h2>
            <p className="sub">
              From sourcing to hiring, STAP coordinates specialized AI agents to handle
              the heavy lifting, while you stay in control.
            </p>
          </div>
          <div className="notew">
            <Image
              className="ico inv"
              alt=""
              width={322}
              height={173}
              src="/assets/solution-note.png"
            />
          </div>
        </div>
        <div className="fl big">
          {SOLUTION_STEPS.map((step, idx) => (
            <React.Fragment key={step.step}>
              <div className="fc rc">
                <span className="n">{step.step}</span>
                <i className="up">↗</i>
                <Image
                  className="ico inv"
                  alt=""
                  width={step.width}
                  height={step.height}
                  src={step.icon}
                />
                <h4>{step.title}</h4>
                <p>{step.description}</p>
              </div>
              {idx < SOLUTION_STEPS.length - 1 && (
                <span className="ar" aria-hidden="true">
                  →
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

