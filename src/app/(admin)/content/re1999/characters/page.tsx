"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type CharacterListItem = {
  id: string;
  slug: string;
  name: string;
  rarity: number;
  afflatus: string;
  role: string;
  roles?: string[] | string;
  tier: string;
  profile?: Record<string, any> | string;
  updated_at?: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_NOVARIA_API_BASE_URL ?? "http://localhost:4000";

const ROLE_COLORS: Record<string, string> = {
  "Damage Dealer": "bg-red-500/10 text-red-500 border border-red-500/20",
  "Sub Carry": "bg-orange-500/10 text-orange-500 border border-orange-500/20",
  "Support": "bg-blue-500/10 text-blue-500 border border-blue-500/20",
  "Survival": "bg-green-500/10 text-green-500 border border-green-500/20",
  "Unknown": "bg-gray-500/10 text-gray-400 border border-gray-500/20",
};

const TIER_COLORS: Record<string, string> = {
  "S+": "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 font-extrabold",
  "S": "bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 font-bold",
  "A": "bg-purple-500/20 text-purple-400 border border-purple-500/30 font-bold",
  "B": "bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold",
  "C": "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30",
  "D": "bg-gray-400/20 text-gray-400 border border-gray-400/30",
  "Unrated": "bg-gray-500/10 text-gray-400 border border-gray-500/20",
};

const AFFLATUS_COLORS: Record<string, string> = {
  "Star": "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  "Beast": "bg-red-500/10 text-red-400 border border-red-500/20",
  "Mineral": "bg-amber-600/10 text-amber-500 border border-amber-600/20",
  "Plant": "bg-green-500/10 text-green-400 border border-green-500/20",
  "Spirit": "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  "Intellect": "bg-yellow-600/10 text-yellow-500 border border-yellow-600/20",
};

const AFFLATUS_ICONS: Record<string, string> = {
  "Star": "https://cdn.prydwen.gg/images/re1999/icons/afl_star.webp",
  "Plant": "https://cdn.prydwen.gg/images/re1999/icons/afl_plant.webp",
  "Mineral": "https://cdn.prydwen.gg/images/re1999/icons/afl_mineral.webp",
  "Beast": "https://cdn.prydwen.gg/images/re1999/icons/afl_beast.webp",
  "Spirit": "https://cdn.prydwen.gg/images/re1999/icons/afl_spirit.webp",
  "Intellect": "https://cdn.prydwen.gg/images/re1999/icons/afl_intellect.webp",
};

const getRoleClass = (role: string) => ROLE_COLORS[role] ?? "bg-gray-500/10 text-gray-400 border border-gray-500/20";
const getTierClass = (tier: string) => TIER_COLORS[tier] ?? "bg-gray-500/10 text-gray-400 border border-gray-500/20";
const getAfflatusClass = (afflatus: string) => AFFLATUS_COLORS[afflatus] ?? "bg-gray-500/10 text-gray-400 border border-gray-500/20";

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(body?.message ?? body?.error ?? response.statusText);
  }

  return body as T;
}

export default function Reverse1999CharactersPage() {
  const [characters, setCharacters] = useState<CharacterListItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedRarity, setSelectedRarity] = useState<number | "all">("all");
  const [selectedAfflatus, setSelectedAfflatus] = useState<string | "all">("all");
  const [selectedDamageType, setSelectedDamageType] = useState<string | "all">("all");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    void loadCharacters();
  }, []);

  const getDamageType = (character: CharacterListItem) => {
    if (!character.profile) return "Reality"; // fallback default
    if (typeof character.profile === "string") {
      try {
        const parsed = JSON.parse(character.profile);
        return parsed.damage_type || "Reality";
      } catch {
        return "Reality";
      }
    }
    return character.profile.damage_type || "Reality";
  };

  const getRolesList = (character: CharacterListItem): string[] => {
    if (!character.roles) {
      return character.role ? [character.role] : [];
    }
    if (typeof character.roles === "string") {
      try {
        const parsed = JSON.parse(character.roles);
        return Array.isArray(parsed) ? parsed : [character.roles];
      } catch {
        return [character.roles];
      }
    }
    return Array.isArray(character.roles) ? character.roles : [];
  };

  const filteredCharacters = useMemo(() => {
    const query = search.trim().toLowerCase();
    return characters.filter((character) => {
      // Search text match
      const textMatch = !query || `${character.name} ${character.slug} ${character.afflatus} ${character.role} ${character.tier}`
        .toLowerCase()
        .includes(query);
      
      // Rarity match
      const rarityMatch = selectedRarity === "all" || character.rarity === selectedRarity;
      
      // Afflatus match
      const afflatusMatch = selectedAfflatus === "all" || character.afflatus === selectedAfflatus;
      
      // Damage type match
      const damageType = getDamageType(character);
      const damageTypeMatch = selectedDamageType === "all" || damageType === selectedDamageType;

      return textMatch && rarityMatch && afflatusMatch && damageTypeMatch;
    });
  }, [characters, search, selectedRarity, selectedAfflatus, selectedDamageType]);

  async function loadCharacters() {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/games/re1999/characters`,
        {
          headers: {
            "content-type": "application/json",
            "x-admin-token": "super-secret-admin-token-123456",
          },
        }
      );
      const data = await parseResponse<CharacterListItem[]>(response);
      setCharacters(data);
      setStatus(`Đã tải ${data.length} nhân vật.`);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Không tải được danh sách nhân vật."
      );
    } finally {
      setIsLoading(false);
    }
  }

  const resetFilters = () => {
    setSearch("");
    setSelectedRarity("all");
    setSelectedAfflatus("all");
    setSelectedDamageType("all");
  };

  const isResetDisabled = !search && selectedRarity === "all" && selectedAfflatus === "all" && selectedDamageType === "all";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-brand-400">Reverse: 1999</p>
          <h1 className="mt-1 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Characters
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Danh sách nhân vật. Bấm Add character để tạo nội dung mới.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Link
            className="flex h-10 items-center justify-center rounded-lg bg-brand-500 px-4 py-2 text-center text-sm font-medium text-white hover:bg-brand-600"
            href="/content/re1999/characters/new"
          >
            Add character
          </Link>
        </div>
      </div>

      {(status || error) && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            error
              ? "border-error-500/30 bg-error-500/10 text-error-300"
              : "border-success-500/30 bg-success-500/10 text-success-300"
          }`}
        >
          {error || status}
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] space-y-4">
        
        {/* Prydwen-like Filter Bar */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Search Field */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <input
              className="h-10 w-full rounded-lg border border-gray-300 bg-transparent pl-3 pr-8 py-2 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-500 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              placeholder="Search characters..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-650 dark:hover:text-white text-lg font-bold"
              >
                ×
              </button>
            )}
          </div>

          {/* Rarity Group */}
          <div className="flex items-center rounded-lg border border-gray-200 p-0.5 dark:border-gray-750 bg-gray-50/50 dark:bg-gray-900/50">
            <button
              onClick={() => setSelectedRarity("all")}
              className={`flex h-9 items-center justify-center rounded-md px-3 text-xs font-bold transition cursor-pointer ${
                selectedRarity === "all"
                  ? "bg-brand-500 text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/[0.04]"
              }`}
              type="button"
            >
              *
            </button>
            {[2, 3, 4, 5, 6].map((rarity) => (
              <button
                key={rarity}
                onClick={() => setSelectedRarity(rarity)}
                className={`flex h-9 items-center justify-center rounded-md px-2.5 text-xs font-bold transition cursor-pointer ${
                  selectedRarity === rarity
                    ? "bg-brand-500 text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/[0.04]"
                }`}
                type="button"
              >
                {rarity}✦
              </button>
            ))}
          </div>

          {/* Afflatus Group */}
          <div className="flex items-center rounded-lg border border-gray-200 p-0.5 dark:border-gray-750 bg-gray-50/50 dark:bg-gray-900/50">
            <button
              onClick={() => setSelectedAfflatus("all")}
              className={`flex h-9 items-center justify-center rounded-md px-3 text-xs font-bold transition cursor-pointer ${
                selectedAfflatus === "all"
                  ? "bg-brand-500 text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/[0.04]"
              }`}
              type="button"
            >
              *
            </button>
            {Object.entries(AFFLATUS_ICONS).map(([name, iconUrl]) => (
              <button
                key={name}
                onClick={() => setSelectedAfflatus(name)}
                className={`flex h-9 w-9 items-center justify-center rounded-md transition cursor-pointer ${
                  selectedAfflatus === name
                    ? "bg-brand-500 shadow-sm"
                    : "hover:bg-gray-100 dark:hover:bg-white/[0.04]"
                }`}
                title={name}
                type="button"
              >
                <img
                  src={iconUrl}
                  alt={name}
                  className="h-5 w-5 object-contain"
                />
              </button>
            ))}
          </div>

          {/* Damage Type Group */}
          <div className="flex items-center rounded-lg border border-gray-200 p-0.5 dark:border-gray-750 bg-gray-50/50 dark:bg-gray-900/50">
            <button
              onClick={() => setSelectedDamageType("all")}
              className={`flex h-9 items-center justify-center rounded-md px-3 text-xs font-bold transition cursor-pointer ${
                selectedDamageType === "all"
                  ? "bg-brand-500 text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/[0.04]"
              }`}
              type="button"
            >
              *
            </button>
            {["Mental", "Reality"].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedDamageType(type)}
                className={`flex h-9 items-center justify-center rounded-md px-3 text-xs font-bold transition cursor-pointer ${
                  selectedDamageType === type
                    ? "bg-brand-500 text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/[0.04]"
                }`}
                type="button"
              >
                {type}
              </button>
            ))}
          </div>

          {/* Reset Button */}
          <button
            onClick={resetFilters}
            disabled={isResetDisabled}
            className="flex h-10 items-center justify-center gap-1.5 rounded-lg border border-gray-350 px-3.5 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.04] dark:disabled:hover:bg-transparent transition cursor-pointer"
            type="button"
          >
            × Reset
          </button>

          {/* Refresh Button */}
          <button
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.04] ml-auto cursor-pointer"
            disabled={isLoading}
            type="button"
            onClick={() => void loadCharacters()}
          >
            {isLoading ? "Đang tải..." : "Refresh"}
          </button>

        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-white/[0.04] dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Rarity</th>
                <th className="px-4 py-3">Afflatus</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredCharacters.map((character) => (
                <tr
                  key={character.id}
                  className="text-gray-700 dark:text-gray-300"
                >
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                    <Link
                      className="text-brand-500 hover:text-brand-600 hover:underline"
                      href={`/content/re1999/characters/new?slug=${character.slug}`}
                    >
                      {character.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-400 dark:text-gray-500">{character.slug}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex gap-0.5 text-yellow-500 dark:text-yellow-400">
                      {"★".repeat(character.rarity)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${getAfflatusClass(character.afflatus)}`}>
                      {AFFLATUS_ICONS[character.afflatus] && (
                        <img
                          src={AFFLATUS_ICONS[character.afflatus]}
                          alt={character.afflatus}
                          className="h-3.5 w-3.5 object-contain"
                        />
                      )}
                      {character.afflatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {getRolesList(character).map((role) => (
                        <span
                          key={role}
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${getRoleClass(role)}`}
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-bold ${getTierClass(character.tier)}`}>
                      {character.tier}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredCharacters.length === 0 && (
                <tr>
                  <td
                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                    colSpan={6}
                  >
                    Chưa có dữ liệu. Bấm Refresh hoặc tạo nhân vật mới.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
