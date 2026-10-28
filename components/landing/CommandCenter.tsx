"use client";

import React, { useState } from "react";
import {
  MOCK_DASHBOARD_SUMMARY,
  MOCK_DASHBOARD_PIPELINE,
  MOCK_DASHBOARD_AGENTS,
  MOCK_DASHBOARD_CANDIDATES,
} from "@/lib/constants";

const TABS = [
  "Overview",
  "Jobs",
  "Candidates",
  "AI Agents",
  "Interviews",
  "Analytics",
];

export const CommandCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("Overview");
  const [highlightedRow, setHighlightedRow] = useState<number | null>(null);

  const handleRowClick = (index: number) => {
    setHighlightedRow(index);
    setTimeout(() => {
      setHighlightedRow(null);
    }, 600);
  };

  const handleViewAllCandidates = () => {
    setActiveTab("Candidates");
  };

  return (
    <section id="resources">
      <div className="wrap">
        <div className="tag">The STAP command center</div>
        <div className="head">
          <h2>
            Your entire hiring operation.
            <br />
            One intelligent <span className="g">command center.</span>
          </h2>
          <p>
            STAP brings candidates, AI agents, interviews, evaluations and hiring
            decisions into one workspace.
          </p>
        </div>
        <div className="dash">
          <div className="side">
            <div className="logo" style={{ marginBottom: "12px" }}>
              <i></i>STAP
            </div>
            {TABS.map((tab) => (
              <button
                key={tab}
                className={`side-tab ${activeTab === tab ? "on" : ""}`}
                type="button"
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="main">
            <b style={{ fontSize: "16px" }}>Good morning, Recruiter.</b>
            <div style={{ fontSize: "12px", color: "var(--mute)" }}>
              Here’s your hiring overview.
            </div>

            <div className="kpis">
              <div>
                <small>Active Jobs</small>
                <b>{MOCK_DASHBOARD_SUMMARY.jobs}</b>
              </div>
              <div>
                <small>Candidates</small>
                <b>{MOCK_DASHBOARD_SUMMARY.candidates}</b>
              </div>
              <div>
                <small>Shortlisted</small>
                <b>{MOCK_DASHBOARD_SUMMARY.shortlisted}</b>
              </div>
              <div>
                <small>Interviews</small>
                <b>{MOCK_DASHBOARD_SUMMARY.interviews}</b>
              </div>
            </div>

            <div className="box">
              <b>Candidate Pipeline</b>
              <div className="bar">
                <i style={{ width: `${MOCK_DASHBOARD_PIPELINE.percentages.applied}%` }}></i>
                <i style={{ width: `${MOCK_DASHBOARD_PIPELINE.percentages.screening}%` }}></i>
                <i style={{ width: `${MOCK_DASHBOARD_PIPELINE.percentages.interview}%` }}></i>
              </div>
              <div className="stages">
                <div>
                  Applied<b>{MOCK_DASHBOARD_PIPELINE.applied}</b>
                </div>
                <div>
                  Screening<b>{MOCK_DASHBOARD_PIPELINE.screening}</b>
                </div>
                <div>
                  Interview<b>{MOCK_DASHBOARD_PIPELINE.interview}</b>
                </div>
                <div>
                  Evaluation<b>{MOCK_DASHBOARD_PIPELINE.evaluation}</b>
                </div>
                <div>
                  Offer<b>{MOCK_DASHBOARD_PIPELINE.offer}</b>
                </div>
              </div>
            </div>

            <div className="two">
              <div className="box">
                <b>AI Agent Activity</b>
                {MOCK_DASHBOARD_AGENTS.agents.map((agent, i) => (
                  <div
                    key={agent.name}
                    className="row"
                    style={{
                      outline:
                        highlightedRow === i ? "2px solid var(--g)" : undefined,
                    }}
                    onClick={() => handleRowClick(i)}
                  >
                    <span>{agent.name}</span>
                    <span
                      className={
                        agent.statusType === "active" ||
                        agent.statusType === "processing"
                          ? "p"
                          : "g"
                      }
                    >
                      {agent.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="box">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "4px",
                  }}
                >
                  <b>Top Candidates</b>
                  <button
                    className="view-all-btn"
                    type="button"
                    onClick={handleViewAllCandidates}
                  >
                    View all →
                  </button>
                </div>
                {MOCK_DASHBOARD_CANDIDATES.candidates.map((cand, i) => (
                  <div
                    key={cand.id}
                    className="row"
                    style={{
                      outline:
                        highlightedRow === i + 10 ? "2px solid var(--g)" : undefined,
                    }}
                    onClick={() => handleRowClick(i + 10)}
                  >
                    <span>{cand.name}</span>
                    <b>{cand.matchPercentage}%</b>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

