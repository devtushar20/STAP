import React from "react";
import Image from "next/image";
import { AGENTS_DATA } from "@/lib/constants";

export const Agents: React.FC = () => {
  return (
    <section className="rs" id="agents">
      <div className="wrap">
        <div className="tag gr">Six AI agents</div>
        <div className="head2">
          <h2>
            Specialized agents.
            <br />
            One <span className="g">coordinated intelligence.</span>
          </h2>
          <div className="pw">
            <p>
              Each agent has a specific role, working together to deliver a smooth
              and intelligent hiring experience.
            </p>
          </div>
        </div>
        <div className="dg">
          {AGENTS_DATA.map((agent) => (
            <div key={agent.id} className={`ag rc ${agent.id}`}>
              <span className="tile">
                <Image
                  className="ico inv"
                  alt=""
                  width={agent.width}
                  height={agent.height}
                  src={agent.icon}
                />
              </span>
              <div>
                <h4>{agent.name}</h4>
                <p>{agent.description}</p>
              </div>
              <i className="up">↗</i>
            </div>
          ))}

          <div className="sp s1">
            <Image
              className="ico"
              alt=""
              width={37}
              height={39}
              src="/assets/agent-sp-1.png"
            />
          </div>
          <div className="hubw">
            <Image
              className="ico"
              alt=""
              width={126}
              height={112}
              src="/assets/agent-hub.png"
            />
          </div>
          <div className="sp s2">
            <Image
              className="ico"
              alt=""
              width={37}
              height={39}
              src="/assets/agent-sp-2.png"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

