"use client";

import { useCallback, useEffect, useState } from "react";
import PsychubeCard from "./_components/PsychubeCard";
import PsychubeFormModal from "./_components/PsychubeFormModal";
import PsychubeDetailModal from "./_components/PsychubeDetailModal";
import { PSYCHUBE_TAGS } from "./_components/types";
import type { Psychube } from "./_components/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_NOVARIA_API_BASE_URL ?? "http://localhost:4000";

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(body?.message ?? body?.error ?? response.statusText);
  }
  return body as T;
}

export default function PsychubesPage() {
  const [psychubes, setPsychubes] = useState<Psychube[]>([]);
  const [search, setSearch] = useState("");
  const [rarity, setRarity] = useState<number | "all">("all");
  const [tag, setTag] = useState("");
  const [releasePatch, setReleasePatch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingPsychube, setEditingPsychube] = useState<Psychube | null>(null);
  const [viewingPsychube, setViewingPsychube] = useState<Psychube | null>(null);
  const [error, setError] = useState("");

  const loadPsychubes = useCallback(async () => {
    setIsLoading(true);
    setError("");

    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (rarity !== "all") params.set("rarity", String(rarity));
    if (tag.trim()) params.set("tag", tag.trim());
    if (releasePatch.trim()) params.set("releasePatch", releasePatch.trim());

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/games/re1999/psychubes?${params}`,
        {
          headers: {
            "content-type": "application/json",
            "x-admin-token": "super-secret-admin-token-123456",
          },
        }
      );
      setPsychubes(await parseResponse<Psychube[]>(response));
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load Psychubes"
      );
    } finally {
      setIsLoading(false);
    }
  }, [rarity, releasePatch, search, tag]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadPsychubes(), 300);
    return () => window.clearTimeout(timer);
  }, [loadPsychubes]);

  const resetFilters = () => {
    setSearch("");
    setRarity("all");
    setTag("");
    setReleasePatch("");
  };

  const inputClass =
    "h-10 rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white";

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-brand-400">
            Reverse: 1999 Content
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Psychubes
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage Psychube amplification, stats, impression and release data.
          </p>
        </div>
        <button
          type="button"
          className="h-10 rounded-lg bg-brand-500 px-4 text-sm font-semibold text-white hover:bg-brand-600 cursor-pointer"
          onClick={() => {
            setEditingPsychube(null);
            setIsAddOpen(true);
          }}
        >
          + Add Psychube
        </button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-wrap items-center gap-3">
          <input
            className={`${inputClass} min-w-[220px] flex-1`}
            value={search}
            placeholder="Search Psychubes..."
            onChange={(event) => setSearch(event.target.value)}
          />

          <div className="flex items-center rounded-lg border border-gray-200 p-0.5 dark:border-gray-700">
            <button
              type="button"
              className={`h-9 rounded-md px-3 text-xs font-bold ${
                rarity === "all"
                  ? "bg-brand-500 text-white"
                  : "text-gray-600 dark:text-gray-300"
              }`}
              onClick={() => setRarity("all")}
            >
              *
            </button>
            {[3, 4, 5, 6].map((value) => (
              <button
                key={value}
                type="button"
                className={`h-9 rounded-md px-3 text-xs font-bold ${
                  rarity === value
                    ? "bg-brand-500 text-white"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/[0.04]"
                }`}
                onClick={() => setRarity(value)}
              >
                {value}★
              </button>
            ))}
          </div>

          <select
            className={`${inputClass} w-40 cursor-pointer`}
            value={tag}
            onChange={(event) => setTag(event.target.value)}
          >
            <option value="">Any tag</option>
            {PSYCHUBE_TAGS.map((tagOption) => (
              <option key={tagOption} value={tagOption}>
                {tagOption}
              </option>
            ))}
          </select>
          <input
            className={`${inputClass} w-40`}
            value={releasePatch}
            placeholder="Release patch"
            onChange={(event) => setReleasePatch(event.target.value)}
          />
          <button
            type="button"
            className="h-10 rounded-lg border border-gray-300 px-3 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.04]"
            disabled={
              !search &&
              rarity === "all" &&
              !tag &&
              !releasePatch
            }
            onClick={resetFilters}
          >
            × Reset
          </button>
          <button
            type="button"
            className="h-10 rounded-lg border border-gray-300 px-4 text-xs font-bold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.04]"
            onClick={() => void loadPsychubes()}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-error-500/30 bg-error-500/10 px-4 py-3 text-sm text-error-500">
          {error}
        </div>
      )}

      <div>
        {isLoading && psychubes.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white px-5 py-16 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03]">
            Loading Psychubes...
          </div>
        ) : psychubes.length ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {psychubes.map((psychube) => (
              <PsychubeCard
                key={psychube.id}
                psychube={psychube}
                onClick={() => setViewingPsychube(psychube)}
                onEdit={() => {
                  setEditingPsychube(psychube);
                  setIsAddOpen(true);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white px-5 py-16 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03]">
            No Psychubes found.
          </div>
        )}
      </div>

      <PsychubeFormModal
        open={isAddOpen}
        psychube={editingPsychube}
        onClose={() => {
          setIsAddOpen(false);
          setEditingPsychube(null);
        }}
        onCreated={() => void loadPsychubes()}
      />

      <PsychubeDetailModal
        open={!!viewingPsychube}
        psychube={viewingPsychube}
        onClose={() => setViewingPsychube(null)}
        onEdit={(psychube) => {
          setViewingPsychube(null);
          setEditingPsychube(psychube);
          setIsAddOpen(true);
        }}
      />
    </div>
  );
}
