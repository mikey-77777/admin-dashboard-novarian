"use client";

import { useState } from "react";
import type { Psychube, PsychubeAmplification, PsychubeStat } from "./types";

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
          <thead className="bg-gray-50 text-gray-600 dark:bg-white/[0.05] dark:text-gray-300">
            <tr>
              <th className="px-5 py-3 font-semibold">Stat</th>
              <th className="px-5 py-3 font-semibold">Lv. 1</th>
              <th className="px-5 py-3 font-semibold">Lv. 60</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {psychube.stats.map((stat, index) => (
              <tr
                key={`${stat.name}-${index}`}
                className="text-gray-700 odd:bg-white even:bg-gray-50/70 dark:text-gray-200 dark:odd:bg-transparent dark:even:bg-white/[0.025]"
              >
                <td className="px-5 py-3 font-medium">{stat.name}</td>
                <td className="px-5 py-3">{stat.level_1}</td>
                <td className="px-5 py-3">{stat.level_60}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (activeTab === "impression") {
    return (
      <div className="whitespace-pre-wrap rounded-lg border border-gray-200 p-5 text-sm leading-7 text-gray-700 dark:border-gray-800 dark:text-gray-200">
        {psychube.impression}
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
            {psychube.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-brand-500/20 bg-brand-500/10 px-2.5 py-1 text-xs font-semibold text-brand-500"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Release patch
          </p>
          <span className="inline-flex rounded-md border border-gray-300 px-3 py-1 text-sm font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-200">
            {psychube.release_patch}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 px-5 dark:border-gray-800">
      {psychube.amplifications.map((amplification, index) => (
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
      ))}
    </div>
  );
}

export function PsychubeDetailModal({
  psychube,
  open,
  onClose,
  onEdit,
}: {
  psychube: Psychube | null;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
}) {
  const [activeTab, setActiveTab] = useState<PsychubeTab>("amplification");

  if (!open || !psychube) return null;

  return (
    <div
      className="fixed inset-0 z-999999 flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="psychube-detail-title"
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-lg border border-gray-200 bg-gray-100 shadow-theme-xl dark:border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-gray-205 bg-gray-100 dark:border-gray-700 dark:bg-gray-900">
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
            <div>
              <h2 id="psychube-detail-title" className="text-lg font-semibold text-gray-900 dark:text-white">
                {psychube.name}
              </h2>
              <p className="text-xs text-yellow-500 font-medium mt-0.5">
                {"★".repeat(psychube.rarity)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              className="h-9 rounded-lg border border-gray-300 px-3 text-xs font-semibold text-gray-750 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.04]"
              onClick={onEdit}
            >
              Edit
            </button>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-white/[0.05]"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* Tab List */}
        <div className="px-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex overflow-x-auto" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                className={`border-b-2 px-4 py-3 text-sm font-semibold transition cursor-pointer ${
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

        {/* Tab Body */}
        <div className="p-6 max-h-[calc(100vh-250px)] overflow-y-auto">
          <TabContent psychube={psychube} activeTab={activeTab} />
        </div>
      </div>
    </div>
  );
}

export default function PsychubeCard({
  psychube,
  onEdit,
  onClick,
}: {
  psychube: Psychube;
  onEdit: (psychube: Psychube) => void;
  onClick: (psychube: Psychube) => void;
}) {
  return (
    <div
      onClick={() => onClick(psychube)}
      className="group relative flex flex-col items-center justify-between rounded-xl border border-gray-200 bg-white p-4 text-center hover:border-brand-500 hover:shadow-lg dark:border-gray-800 dark:bg-white/[0.03] transition-all cursor-pointer h-full"
    >
      {/* Edit pencil icon */}
      <button
        type="button"
        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-brand-500 dark:hover:bg-white/[0.05] transition-all cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onEdit(psychube);
        }}
        title="Edit Psychube"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>

      <div className="w-full flex flex-col items-center">
        {/* Psychube Image */}
        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border border-gray-150 bg-gray-50 dark:border-gray-700 dark:bg-gray-900 mb-3 shadow-xs">
          {psychube.image ? (
            <img
              src={psychube.image}
              alt={psychube.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-2xl font-bold text-brand-500">
              {psychube.name.charAt(0)}
            </span>
          )}
        </div>
        
        {/* Name */}
        <h3 className="text-xs font-semibold text-gray-800 dark:text-white line-clamp-2 h-8 flex items-center justify-center px-1">
          {psychube.name}
        </h3>
        
        {/* Rarity */}
        <div className="mt-2 text-[10px] font-bold text-yellow-500">
          {"★".repeat(psychube.rarity)}
        </div>
      </div>
    </div>
  );
}
