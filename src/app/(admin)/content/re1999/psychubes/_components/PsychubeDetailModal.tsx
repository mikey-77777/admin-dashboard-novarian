"use client";

import { useState } from "react";
import type { Psychube } from "./types";

type PsychubeTab = "amplification" | "stats" | "impression" | "info";

const tabs: { id: PsychubeTab; label: string }[] = [
  { id: "amplification", label: "Amplification" },
  { id: "stats", label: "Stats" },
  { id: "impression", label: "Impression" },
  { id: "info", label: "Info" },
];

function TabContent({
  psychube,
  activeTab,
}: {
  psychube: Psychube;
  activeTab: PsychubeTab;
}) {
  if (activeTab === "stats") {
    return (
      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-650 dark:bg-white/[0.05] dark:text-gray-300">
            <tr>
              <th className="px-5 py-3 font-semibold">Stat</th>
              <th className="px-5 py-3 font-semibold">Lv. 1</th>
              <th className="px-5 py-3 font-semibold">Lv. 60</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {psychube.stats.length > 0 ? (
              psychube.stats.map((stat, index) => (
                <tr
                  key={`${stat.name}-${index}`}
                  className="text-gray-700 odd:bg-white even:bg-gray-50/70 dark:text-gray-200 dark:odd:bg-transparent dark:even:bg-white/[0.025]"
                >
                  <td className="px-5 py-3 font-medium">{stat.name}</td>
                  <td className="px-5 py-3">{stat.level_1}</td>
                  <td className="px-5 py-3">{stat.level_60}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-5 py-4 text-center text-gray-500">
                  No stats recorded.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

  if (activeTab === "impression") {
    return (
      <div className="whitespace-pre-wrap rounded-lg border border-gray-200 p-5 text-sm leading-7 text-gray-700 dark:border-gray-800 dark:text-gray-200">
        {psychube.impression || "No impression text available."}
      </div>
    );
  }

  if (activeTab === "info") {
    return (
      <div className="grid gap-5 rounded-lg border border-gray-200 p-5 dark:border-gray-800 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Tags
          </p>
          <div className="flex flex-wrap gap-2">
            {psychube.tags.length > 0 ? (
              psychube.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-brand-500/20 bg-brand-500/10 px-2.5 py-1 text-xs font-semibold text-brand-500"
                >
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-sm text-gray-500">No tags.</span>
            )}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Release patch
          </p>
          <span className="inline-flex rounded-md border border-gray-300 px-3 py-1 text-sm font-semibold text-gray-700 dark:border-gray-750 dark:text-gray-200">
            {psychube.release_patch || "N/A"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 px-5 dark:border-gray-800">
      {psychube.amplifications.length > 0 ? (
        psychube.amplifications.map((amplification, index) => (
          <div
            key={`${amplification.level}-${index}`}
            className="border-b border-gray-200 py-5 last:border-0 dark:border-gray-800"
          >
            <p className="mb-2 text-sm font-semibold text-gray-500 dark:text-gray-400">
              Lv. {amplification.level}:
            </p>
            <p className="whitespace-pre-wrap text-sm leading-7 text-gray-800 dark:text-gray-100">
              {amplification.description}
            </p>
          </div>
        ))
      ) : (
        <div className="py-5 text-center text-gray-500">
          No amplification levels recorded.
        </div>
      )}
    </div>
  );
}

export default function PsychubeDetailModal({
  open,
  psychube,
  onClose,
  onEdit,
}: {
  open: boolean;
  psychube: Psychube | null;
  onClose: () => void;
  onEdit: (psychube: Psychube) => void;
}) {
  const [activeTab, setActiveTab] = useState<PsychubeTab>("amplification");

  if (!open || !psychube) return null;

  return (
    <div
      className="fixed inset-0 z-99999 flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-psychube-title"
    >
      <div className="w-full max-w-3xl overflow-hidden rounded-lg border border-gray-200 bg-gray-100 shadow-theme-xl dark:border-gray-800">
        
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-900">
            {psychube.image ? (
              <img
                src={psychube.image}
                alt={psychube.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-lg font-bold text-brand-500">
                {psychube.name.charAt(0)}
              </span>
            )}
          </span>
          <div className="min-w-0 flex-1">
            <h2
              id="detail-psychube-title"
              className="truncate text-xl font-semibold text-gray-900 dark:text-white"
            >
              {psychube.name}
            </h2>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <span className="font-medium text-yellow-500">{"★".repeat(psychube.rarity)}</span>
              <span>•</span>
              <span className="font-mono">{psychube.slug}</span>
            </div>
          </div>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-white/[0.05]"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Tab Selector */}
        <div className="px-6 border-b border-gray-100 dark:border-gray-850">
          <div className="flex overflow-x-auto" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? "border-brand-500 text-brand-500"
                    : "border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="max-h-[calc(100vh-280px)] overflow-y-auto p-6">
          <TabContent psychube={psychube} activeTab={activeTab} />
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center border-t border-gray-200 px-6 py-4 dark:border-gray-800">
          <button
            type="button"
            onClick={() => onEdit(psychube)}
            className="flex h-10 items-center justify-center gap-1.5 rounded-lg border border-brand-500 bg-transparent px-4 text-sm font-semibold text-brand-500 hover:bg-brand-500/10 dark:border-brand-400 dark:text-brand-400 transition cursor-pointer"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit Psychube
          </button>
          <button
            type="button"
            className="h-10 rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.04] cursor-pointer"
            onClick={onClose}
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
