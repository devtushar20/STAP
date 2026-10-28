import React from "react";
import Image from "next/image";
import { PROBLEMS_DATA } from "@/lib/constants";

export const Problem: React.FC = () => {
  return (
    <section className="rs">
      <div className="wrap">
        <div className="tag">The problem</div>
        <div className="head2">
          <h2>
            Traditional hiring
            <br />
            is slow, manual
            <br />
            and <span className="p">inefficient.</span>
          </h2>
          <div className="pw">
            <p>
              Great talent is out there, but traditional recruitment processes make it
              hard to find, evaluate and hire the right people quickly.
            </p>
            <Image
              className="burst inv"
              alt=""
              width={51}
              height={60}
              src="/assets/burst-problem.png"
            />
          </div>
        </div>
        <div className="pgrid">
          {PROBLEMS_DATA.map((problem) => (
            <div key={problem.id} className="pc rc">
              <i className="up">↗</i>
              <div className="wr">
                <Image
                  className="ico inv"
                  alt=""
                  width={problem.width}
                  height={problem.height}
                  src={problem.icon}
                />
              </div>
              <span className="plus">+</span>
              <h4>{problem.title}</h4>
              <p>{problem.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

