"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  fetchDashboardSummary,
  fetchDashboardPipeline,
  fetchDashboardAgents,
  fetchDashboardCandidates,
} from "@/lib/api";
import {
  MOCK_DASHBOARD_SUMMARY,
  MOCK_DASHBOARD_PIPELINE,
  MOCK_DASHBOARD_AGENTS,
  MOCK_DASHBOARD_CANDIDATES,
} from "@/lib/constants";
import {
  DashboardSummaryResponse,
  DashboardPipelineResponse,
  DashboardAgentsResponse,
  DashboardCandidatesResponse,
} from "@/lib/types";

const TABS = [
  "Overview",
  "Jobs",
  "Candidates",
  "AI Agents",
  "Interviews",
  "Analytics",
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [summary, setSummary] = useState<DashboardSummaryResponse>(
    MOCK_DASHBOARD_SUMMARY
  );
  const [pipeline, setPipeline] = useState<DashboardPipelineResponse>(
    MOCK_DASHBOARD_PIPELINE
  );
  const [agents, setAgents] = useState<DashboardAgentsResponse>(
    MOCK_DASHBOARD_AGENTS
  );
  const [candidates, setCandidates] = useState<DashboardCandidatesResponse>(
    MOCK_DASHBOARD_CANDIDATES
  );

  const [highlightedRow, setHighlightedRow] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [sumRes, pipeRes, agentRes, candRes] = await Promise.allSettled([
        fetchDashboardSummary(),
        fetchDashboardPipeline(),
        fetchDashboardAgents(),
        fetchDashboardCandidates(4),
      ]);

      if (sumRes.status === "fulfilled") setSummary(sumRes.value);
      if (pipeRes.status === "fulfilled") setPipeline(pipeRes.value);
      if (agentRes.status === "fulfilled") setAgents(agentRes.value);
      if (candRes.status === "fulfilled") setCandidates(candRes.value);

      const anyRejected = [sumRes, pipeRes, agentRes, candRes].some(
        (r) => r.status === "rejected"
      );
      if (anyRejected) {
        // Soft notice that live backend is offline; fell back to mock data
        setError("Note: Python FastAPI backend is offline. Using local mock data.");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to connect to backend service. Using mock data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRowClick = (index: number) => {
    setHighlightedRow(index);
    setTimeout(() => {
      setHighlightedRow(null);
    }, 600);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header className="site-header">
        <div
          style={{
            maxWidth: "1120px",
            margin: "0 auto",
            padding: "16px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <Link href="/" className="logo" style={{ textDecoration: "none", color: "inherit" }}>
              <i></i>STAP
            </Link>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                padding: "3px 8px",
                background: "var(--icg)",
                color: "var(--onink)",
                borderRadius: "4px",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              Command Center
            </span>
          </div>

          <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
            <ThemeToggle />
            <Link href="/" className="btn">
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, padding: "32px 0 64px" }}>
        <div className="wrap">
          {error && (
            <div
              style={{
                marginBottom: "20px",
                padding: "12px 16px",
                background: "var(--icp)",
                border: "1px solid var(--p)",
                borderRadius: "8px",
                fontSize: "12.5px",
                color: "var(--ink)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>{error}</span>
              <button
                type="button"
                className="btn"
                style={{ padding: "4px 10px", fontSize: "11.5px" }}
                onClick={loadData}
              >
                Retry
              </button>
            </div>
          )}

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
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div>
                  <b style={{ fontSize: "16px" }}>Good morning, Recruiter.</b>
                  <div style={{ fontSize: "12px", color: "var(--mute)" }}>
                    Here’s your hiring overview.
                  </div>
                </div>

                {loading && (
                  <span
                    style={{
                      fontSize: "11.5px",
                      color: "var(--mute)",
                      fontStyle: "italic",
                    }}
                  >
                    Syncing live metrics...
                  </span>
                )}
              </div>

              <div className="kpis">
                <div>
                  <small>Active Jobs</small>
                  <b>{summary.jobs}</b>
                </div>
                <div>
                  <small>Candidates</small>
                  <b>{summary.candidates}</b>
                </div>
                <div>
                  <small>Shortlisted</small>
                  <b>{summary.shortlisted}</b>
                </div>
                <div>
                  <small>Interviews</small>
                  <b>{summary.interviews}</b>
                </div>
              </div>

              <div className="box">
                <b>Candidate Pipeline</b>
                <div className="bar">
                  <i
                    style={{
                      width: `${pipeline.percentages?.applied ?? 30}%`,
                    }}
                  ></i>
                  <i
                    style={{
                      width: `${pipeline.percentages?.screening ?? 16}%`,
                    }}
                  ></i>
                  <i
                    style={{
                      width: `${pipeline.percentages?.interview ?? 12}%`,
                    }}
                  ></i>
                </div>
                <div className="stages">
                  <div>
                    Applied<b>{pipeline.applied}</b>
                  </div>
                  <div>
                    Screening<b>{pipeline.screening}</b>
                  </div>
                  <div>
                    Interview<b>{pipeline.interview}</b>
                  </div>
                  <div>
                    Evaluation<b>{pipeline.evaluation}</b>
                  </div>
                  <div>
                    Offer<b>{pipeline.offer}</b>
                  </div>
                </div>
              </div>

              <div className="two">
                <div className="box">
                  <b>AI Agent Activity</b>
                  {agents.agents.map((agent, i) => (
                    <div
                      key={agent.name}
                      className="row"
                      style={{
                        outline:
                          highlightedRow === i
                            ? "2px solid var(--g)"
                            : undefined,
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
                      onClick={() => setActiveTab("Candidates")}
                    >
                      View all →
                    </button>
                  </div>
                  {candidates.candidates.map((cand, i) => (
                    <div
                      key={cand.id}
                      className="row"
                      style={{
                        outline:
                          highlightedRow === i + 10
                            ? "2px solid var(--g)"
                            : undefined,
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
      </main>

      <footer
        style={{
          borderTop: "1px solid var(--line)",
          padding: "20px 0",
          textAlign: "center",
          fontSize: "12px",
          color: "var(--mute)",
        }}
      >
        © 2026 STAP. Human judgement + AI intelligence.
      </footer>
    </div>
  );
}

