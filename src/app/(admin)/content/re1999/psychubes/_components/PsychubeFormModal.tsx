"use client";

import { FormEvent, useEffect, useState } from "react";
import { PSYCHUBE_TAGS } from "./types";
import type {
  Psychube,
  PsychubeAmplification,
  PsychubePayload,
  PsychubeStat,
} from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_NOVARIA_API_BASE_URL ?? "http://localhost:4000";

const emptyAmplification = (): PsychubeAmplification => ({
  level: 1,
  description: "",
});

const emptyStat = (): PsychubeStat => ({
  name: "",
  level_1: "",
  level_60: "",
});

const initialForm = {
  name: "",
  slug: "",
  image: "",
  rarity: 5,
  release_patch: "",
  tags: ["Survival"] as string[],
  impression: "",
  amplifications: [emptyAmplification()],
  stats: [emptyStat()],
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function PsychubeFormModal({
  open,
  onClose,
  onCreated,
  psychube,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  psychube?: Psychube | null;
}) {
  const [form, setForm] = useState(initialForm);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);

  useEffect(() => {
    if (open) {
      if (psychube) {
        setForm({
          name: psychube.name,
          slug: psychube.slug,
          image: psychube.image || "",
          rarity: psychube.rarity,
          release_patch: psychube.release_patch,
          tags: psychube.tags || [],
          impression: psychube.impression || "",
          amplifications: psychube.amplifications.length > 0
            ? psychube.amplifications.map((item) => ({
                level: item.level,
                description: item.description,
              }))
            : [emptyAmplification()],
          stats: psychube.stats.length > 0
            ? psychube.stats.map((item) => ({
                name: item.name,
                level_1: item.level_1,
                level_60: item.level_60,
              }))
            : [emptyStat()],
        });
        setSlugEdited(true);
      } else {
        setForm(initialForm);
        setSlugEdited(false);
      }
      setError("");
    }
  }, [open, psychube]);

  if (!open) return null;

  const updateAmplification = (
    index: number,
    field: keyof PsychubeAmplification,
    value: string | number
  ) => {
    setForm((current) => ({
      ...current,
      amplifications: current.amplifications.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const updateStat = (
    index: number,
    field: keyof PsychubeStat,
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      stats: current.stats.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    const payload: PsychubePayload = {
      slug: form.slug.trim(),
      name: form.name.trim(),
      image: form.image.trim() || null,
      rarity: Number(form.rarity),
      release_patch: form.release_patch.trim(),
      tags: form.tags,
      impression: form.impression.trim(),
      amplifications: form.amplifications.map((item) => ({
        level: Number(item.level),
        description: item.description.trim(),
      })),
      stats: form.stats.map((item) => ({
        name: item.name.trim(),
        level_1: item.level_1.trim(),
        level_60: item.level_60.trim(),
      })),
    };

    if (payload.tags.length === 0) {
      setError("Please select at least one tag.");
      setIsSaving(false);
      return;
    }

    const isEdit = !!psychube;
    const url = isEdit
      ? `${API_BASE_URL}/api/admin/games/re1999/psychubes/${psychube.slug}`
      : `${API_BASE_URL}/api/admin/games/re1999/psychubes`;
    const method = isEdit ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "content-type": "application/json",
          "x-admin-token": "super-secret-admin-token-123456",
        },
        body: JSON.stringify(payload),
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body?.message ?? `Could not ${isEdit ? "update" : "create"} Psychube`);
      }
      onCreated();
      onClose();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : `Could not ${isEdit ? "update" : "create"} Psychube`
      );
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass =
    "h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white";
  const labelClass =
    "mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300";

  return (
    <div
      className="fixed inset-0 z-999999 flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-psychube-title"
    >
      <form
        className="w-full max-w-4xl overflow-hidden rounded-lg border border-gray-200 bg-gray-100 shadow-theme-xl dark:border-gray-800"
        onSubmit={handleSubmit}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <div>
            <h2
              id="add-psychube-title"
              className="text-xl font-semibold text-gray-900 dark:text-white"
            >
              {psychube ? "Edit Psychube" : "Add Psychube"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {psychube
                ? `Edit details for ${psychube.name}`
                : "Add amplification levels, stats, impression and release data."}
            </p>
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

        <div className="max-h-[calc(100vh-190px)] space-y-6 overflow-y-auto p-6">
          {error && (
            <div className="rounded-lg border border-error-500/30 bg-error-500/10 px-4 py-3 text-sm text-error-500">
              {error}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className={labelClass}>Name</span>
              <input
                required
                className={inputClass}
                value={form.name}
                placeholder="A Free Heart"
                onChange={(event) => {
                  const name = event.target.value;
                  setForm((current) => ({
                    ...current,
                    name,
                    slug: slugEdited ? current.slug : slugify(name),
                  }));
                }}
              />
            </label>
            <label>
              <span className={labelClass}>Slug</span>
              <input
                required
                disabled={!!psychube}
                className={`${inputClass} disabled:opacity-50 disabled:bg-gray-150 dark:disabled:bg-gray-900/50`}
                value={form.slug}
                placeholder="a-free-heart"
                onChange={(event) => {
                  setSlugEdited(true);
                  setForm((current) => ({
                    ...current,
                    slug: slugify(event.target.value),
                  }));
                }}
              />
            </label>
            <label>
              <span className={labelClass}>Image URL</span>
              <input
                type="url"
                className={inputClass}
                value={form.image}
                placeholder="https://cdn..."
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    image: event.target.value,
                  }))
                }
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className={labelClass}>Rarity</span>
                <select
                  className={inputClass}
                  value={form.rarity}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      rarity: Number(event.target.value),
                    }))
                  }
                >
                  {[3, 4, 5, 6].map((rarity) => (
                    <option key={rarity} value={rarity}>
                      {rarity}★
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className={labelClass}>Release patch</span>
                <input
                  required
                  className={inputClass}
                  value={form.release_patch}
                  placeholder="1.0"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      release_patch: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
          </div>

          <div>
            <span className={labelClass}>Tags</span>
            <div className="flex flex-wrap gap-4 rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
              {PSYCHUBE_TAGS.map((tagOption) => {
                const isChecked = form.tags.includes(tagOption);
                return (
                  <label
                    key={tagOption}
                    className="inline-flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-350"
                  >
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-950"
                      checked={isChecked}
                      onChange={() => {
                        setForm((current) => {
                          const newTags = isChecked
                            ? current.tags.filter((t) => t !== tagOption)
                            : [...current.tags, tagOption];
                          return { ...current, tags: newTags };
                        });
                      }}
                    />
                    {tagOption}
                  </label>
                );
              })}
            </div>
            {form.tags.length === 0 && (
              <span className="mt-1 block text-xs text-error-500">
                Please select at least one tag.
              </span>
            )}
          </div>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Amplification
              </h3>
              <button
                type="button"
                className="text-sm font-semibold text-brand-500 hover:text-brand-600"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    amplifications: [
                      ...current.amplifications,
                      emptyAmplification(),
                    ],
                  }))
                }
              >
                + Add level
              </button>
            </div>
            <div className="space-y-3">
              {form.amplifications.map((item, index) => (
                <div
                  key={index}
                  className="grid gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-800 md:grid-cols-[110px_1fr_40px]"
                >
                  <label>
                    <span className={labelClass}>Level</span>
                    <input
                      required
                      min={1}
                      max={60}
                      type="number"
                      className={inputClass}
                      value={item.level}
                      onChange={(event) =>
                        updateAmplification(
                          index,
                          "level",
                          Number(event.target.value)
                        )
                      }
                    />
                  </label>
                  <label>
                    <span className={labelClass}>Description</span>
                    <textarea
                      required
                      className={`${inputClass} min-h-20 py-2`}
                      value={item.description}
                      onChange={(event) =>
                        updateAmplification(
                          index,
                          "description",
                          event.target.value
                        )
                      }
                    />
                  </label>
                  <button
                    type="button"
                    className="mt-6 h-10 rounded-lg text-lg text-error-500 hover:bg-error-500/10 disabled:opacity-30"
                    disabled={form.amplifications.length === 1}
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        amplifications: current.amplifications.filter(
                          (_, itemIndex) => itemIndex !== index
                        ),
                      }))
                    }
                    aria-label="Remove amplification"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Stats
              </h3>
              <button
                type="button"
                className="text-sm font-semibold text-brand-500 hover:text-brand-600"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    stats: [...current.stats, emptyStat()],
                  }))
                }
              >
                + Add stat
              </button>
            </div>
            <div className="space-y-3">
              {form.stats.map((stat, index) => (
                <div
                  key={index}
                  className="grid gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-800 md:grid-cols-[1fr_1fr_1fr_40px]"
                >
                  {(
                    [
                      ["name", "Stat"],
                      ["level_1", "Lv. 1"],
                      ["level_60", "Lv. 60"],
                    ] as const
                  ).map(([field, label]) => (
                    <label key={field}>
                      <span className={labelClass}>{label}</span>
                      <input
                        required
                        className={inputClass}
                        value={stat[field]}
                        onChange={(event) =>
                          updateStat(index, field, event.target.value)
                        }
                      />
                    </label>
                  ))}
                  <button
                    type="button"
                    className="mt-6 h-10 rounded-lg text-lg text-error-500 hover:bg-error-500/10 disabled:opacity-30"
                    disabled={form.stats.length === 1}
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        stats: current.stats.filter(
                          (_, itemIndex) => itemIndex !== index
                        ),
                      }))
                    }
                    aria-label="Remove stat"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </section>

          <label>
            <span className={labelClass}>Impression</span>
            <textarea
              required
              className={`${inputClass} min-h-36 py-3 leading-6`}
              value={form.impression}
              placeholder="Enter the Psychube impression..."
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  impression: event.target.value,
                }))
              }
            />
          </label>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-800">
          <button
            type="button"
            className="h-10 rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.04]"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="h-10 rounded-lg bg-brand-500 px-4 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
          >
            {isSaving
              ? psychube
                ? "Saving..."
                : "Creating..."
              : psychube
              ? "Save Changes"
              : "Create Psychube"}
          </button>
        </div>
      </form>
    </div>
  );
}
