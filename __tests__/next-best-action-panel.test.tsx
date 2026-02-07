/** @jest-environment jsdom */

import React from "react";
import { render, screen } from "@testing-library/react";

import { NextBestActionPanel } from "@/components/next-best-action-panel";

describe("NextBestActionPanel", () => {
  test("shows copy install + report issue when install command + github repo exist", () => {
    render(
      <NextBestActionPanel
        installCmd="openclaw install foo"
        repoUrl="https://github.com/acme/foo"
        issueTitle="Issue title"
        issueBody="Issue body"
      />
    );

    expect(screen.getByRole("button", { name: /copy install command/i })).toBeInTheDocument();

    const report = screen.getByRole("link", { name: /report issue/i });
    expect(report).toBeInTheDocument();
    expect(report.getAttribute("href")).toMatch(/github\.com\/acme\/foo\/issues\/new/);
  });

  test("falls back to view repository when no install command", () => {
    render(
      <NextBestActionPanel
        installCmd=""
        repoUrl="https://github.com/acme/foo"
        issueTitle="Issue title"
        issueBody="Issue body"
      />
    );

    expect(screen.queryByRole("button", { name: /copy install command/i })).toBeNull();

    const view = screen.getByRole("link", { name: /view on github|view repository/i });
    expect(view.getAttribute("href")).toBe("https://github.com/acme/foo");
  });
});
