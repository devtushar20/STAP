import React from "react";
import Image from "next/image";
import { PIPELINE_STEPS } from "@/lib/constants";

export const Pipeline: React.FC = () => {
  return (
    <section className="rs" id="pipeline">
      <div className="wrap">
        <div className="tag">The STAP pipeline</div>
        <div className="head2">
          <h2>
            From candidate
            <br />
            to hire — <span className="g">automatically.</span>
          </h2>
          <div className="pw">
            <p>
              STAP coordinates the entire recruitment journey, turning candidate
              signals into structured decisions while keeping recruiters in
              control.
            </p>
            <Image
              className="burst inv"
              alt=""
              width={42}
              height={64}
              src="/assets/burst-pipeline.png"
            />
          </div>
        </div>
        <div className="fl">
          {PIPELINE_STEPS.map((step, idx) => (
            <React.Fragment key={step.step}>
              <div className="fc rc">
                <span className="n">{step.step}</span>
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
              {idx < PIPELINE_STEPS.length - 1 && (
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

