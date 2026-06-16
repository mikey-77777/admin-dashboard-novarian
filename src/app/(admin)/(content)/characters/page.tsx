"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import Bold from "@tiptap/extension-bold";
import { Color } from "@tiptap/extension-color";
import Heading from "@tiptap/extension-heading";
import Paragraph from "@tiptap/extension-paragraph";
import { TextStyle } from "@tiptap/extension-text-style";
import { Extension, Node as TiptapNode } from "@tiptap/core";
import { Plugin } from "@tiptap/pm/state";
import StarterKit from "@tiptap/starter-kit";
import React, { useEffect, useMemo, useState, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type Game = {
  id: string;
  slug: string;
  name: string;
};

type CharacterListItem = {
  id: string;
  slug: string;
  name: string;
  rarity: number;
  afflatus: string;
  role: string;
  tier: string;
  updated_at?: string;
};

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

type CharacterPayload = {
  slug: string;
  name: string;
  rarity: number;
  afflatus: string;
  role: string;
  tier: string;
  image: string | null;
  source_url: string | null;
  overview_en: string | null;
  overview_vi: string | null;
  beginner_notes_en: string | null;
  beginner_notes_vi: string | null;
  skills: JsonValue[];
  pros_en: string[];
  pros_vi: string[];
  cons_en: string[];
  cons_vi: string[];
  recommended_teams: JsonValue[];
  recommended_items: JsonValue[];
  profile: Record<string, JsonValue>;
  inheritance: JsonValue[];
  special_effects: JsonValue[];
  euphoria: Record<string, JsonValue>;
  portray: JsonValue[];
  gallery: JsonValue[];
  roles: string[];
};

type FormState = Omit<
  CharacterPayload,
  | "skills"
  | "pros_en"
  | "pros_vi"
  | "cons_en"
  | "cons_vi"
  | "recommended_teams"
  | "recommended_items"
  | "profile"
  | "inheritance"
  | "special_effects"
  | "euphoria"
  | "portray"
  | "gallery"
  | "roles"
> & {
  skills: string;
  pros_en: string;
  pros_vi: string;
  cons_en: string;
  cons_vi: string;
  recommended_teams: string;
  recommended_items: string;
  profile: string;
  inheritance: string;
  special_effects: string;
  euphoria: string;
  portray: string;
  gallery: string;
  roles: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_NOVARIA_API_BASE_URL ?? "http://localhost:4000";

type GameContentConfig = {
  slug: string;
  name: string;
  rarityOptions: number[];
  afflatusOptions: string[];
  damageTypeOptions: string[];
  tierOptions: string[];
  tierCriteria: Record<string, string>;
  roleOptions: {
    value: string;
    label: string;
    criteria: string;
  }[];
  textStyles: {
    label: string;
    className: string;
    color: string;
  }[];
};

const DEFAULT_GAME_CONFIG: GameContentConfig = {
  slug: "re1999",
  name: "Reverse: 1999",
  rarityOptions: [1, 2, 3, 4, 5, 6],
  afflatusOptions: ["Star", "Plant", "Mineral", "Beast", "Spirit", "Intellect"],
  damageTypeOptions: ["Mental", "Reality"],
  tierOptions: ["Unrated", "S+", "S", "A", "B", "C", "D"],
  tierCriteria: {
    "Unrated": "Chưa đánh giá: nhân vật mới hoặc chưa được xếp hạng cụ thể.",
    "S+": "God-tier/Top-tier: nhân vật bá đạo, toàn diện, đa dụng, gánh team tốt trong mọi đội hình.",
    S: "God-tier/Top-tier: nhân vật bá đạo, toàn diện, đa dụng, gánh team tốt trong mọi đội hình.",
    A: "Rất mạnh và hiệu quả, có thể thiếu một vài điểm tối ưu so với tier S.",
    B: "Mức độ trung bình, dùng tốt ở giai đoạn đầu game hoặc có tác dụng trong những tình huống cụ thể.",
    C: "Mức độ trung bình, dùng tốt ở giai đoạn đầu game hoặc có tác dụng trong những tình huống cụ thể.",
    D: "Yếu, cần đầu tư nhiều tài nguyên nhưng hiệu quả mang lại thấp.",
  },
  roleOptions: [
    {
      value: "Unknown",
      label: "Unknown",
      criteria: "Unknown: No specific role has been assigned to this character yet.",
    },
    {
      value: "Damage Dealer",
      label: "Damage Dealer",
      criteria:
        "Damage Dealer: The main source of damage in the team, focusing on inflicting high output.",
    },
    {
      value: "Sub Carry",
      label: "Sub Carry",
      criteria:
        "Sub Carry: Focuses more on personal damage than support, and can sometimes act as a primary Damage Dealer.",
    },
    {
      value: "Support",
      label: "Support",
      criteria:
        "Support: Focuses on buffs, debuffs, crowd control, or other utility effects; usually not the main source of damage.",
    },
    {
      value: "Survival",
      label: "Survival",
      criteria:
        "Survival: The defensive pillar of the team, including healers, shielders, or characters that sustain team survivability.",
    },
  ],
  textStyles: [
    { label: "Damage Dealer", className: "dps", color: "#d14251" },
    { label: "Sub Carry", className: "sub-dps", color: "#d18742" },
    { label: "Support", className: "support", color: "#8799c7" },
    { label: "Survival", className: "sustain", color: "#409756" },
    { label: "Rarity 1", className: "rarity-1", color: "#a7a7a7" },
    { label: "Rarity 2", className: "rarity-2", color: "#93f55b" },
    { label: "Rarity 3", className: "rarity-3", color: "#7b84ac" },
    { label: "Rarity 4", className: "rarity-4", color: "#513d58" },
    { label: "Rarity 5", className: "rarity-5", color: "#d4ba73" },
    { label: "Rarity 6", className: "rarity-6", color: "#e5a42b" },
    { label: "Star", className: "Star", color: "#5c87b4" },
    { label: "Beast", className: "Beast", color: "#c26060" },
    { label: "Mineral", className: "Mineral", color: "#aa824a" },
    { label: "Plant", className: "Plant", color: "#4bac63" },
    { label: "Spirit", className: "Spirit", color: "#ae66b4" },
    { label: "Intellect", className: "Intellect", color: "#bdaa5d" },
  ],
};

const EPIC_SEVEN_GAME_CONFIG: GameContentConfig = {
  slug: "epic7",
  name: "Epic Seven",
  rarityOptions: [3, 4, 5],
  afflatusOptions: ["Fire", "Ice", "Earth", "Light", "Dark"],
  damageTypeOptions: ["Single Target", "AoE", "Support", "Sustain"],
  tierOptions: ["Unrated", "S+", "S", "A", "B", "C", "D"],
  tierCriteria: DEFAULT_GAME_CONFIG.tierCriteria,
  roleOptions: [
    {
      value: "Unknown",
      label: "Unknown",
      criteria: "Unknown: No specific role has been assigned to this character yet.",
    },
    {
      value: "Damage Dealer",
      label: "Damage Dealer",
      criteria: "Damage Dealer: The main source of damage in the team.",
    },
    {
      value: "Bruiser",
      label: "Bruiser",
      criteria: "Bruiser: Balanced offense and defense, capable of surviving and dealing damage.",
    },
    {
      value: "Support",
      label: "Support",
      criteria: "Support: Focuses on buffs, debuffs, cleanse, control, or combat utility.",
    },
    {
      value: "Soul Weaver",
      label: "Soul Weaver",
      criteria: "Soul Weaver: Focuses on healing, shielding, or team sustainability.",
    },
  ],
  textStyles: [
    { label: "Fire", className: "Fire", color: "#d65a52" },
    { label: "Ice", className: "Ice", color: "#5aa7d6" },
    { label: "Earth", className: "Earth", color: "#65a85f" },
    { label: "Light", className: "Light", color: "#d8c46a" },
    { label: "Dark", className: "Dark", color: "#9b6bd3" },
    { label: "Rarity 3", className: "rarity-3", color: "#7b84ac" },
    { label: "Rarity 4", className: "rarity-4", color: "#b083d1" },
    { label: "Rarity 5", className: "rarity-5", color: "#d4ba73" },
  ],
};

const GAME_CONTENT_CONFIGS: Record<string, GameContentConfig> = {
  [DEFAULT_GAME_CONFIG.slug]: DEFAULT_GAME_CONFIG,
  [EPIC_SEVEN_GAME_CONFIG.slug]: EPIC_SEVEN_GAME_CONFIG,
};

const ALL_TEXT_STYLES = Array.from(
  new Map(
    Object.values(GAME_CONTENT_CONFIGS)
      .flatMap((config) => config.textStyles)
      .map((style) => [style.className, style])
  ).values()
);

const preservedClassAttributes = {
  class: {
    default: null,
    parseHTML: (element: HTMLElement) => element.getAttribute("class"),
    renderHTML: (attributes: Record<string, string | null>) => {
      if (!attributes.class) return {};
      return { class: attributes.class };
    },
  },
  style: {
    default: null,
    parseHTML: (element: HTMLElement) => element.getAttribute("style"),
    renderHTML: (attributes: Record<string, string | null>) => {
      if (!attributes.style) return {};
      return { style: attributes.style };
    },
  },
};

const PreservedClassBold = Bold.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      ...preservedClassAttributes,
    };
  },
});

const PreservedClassParagraph = Paragraph.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      ...preservedClassAttributes,
    };
  },
});

const PreservedClassHeading = Heading.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      ...preservedClassAttributes,
    };
  },
});

const PreservedClassDiv = TiptapNode.create({
  name: "div",
  group: "block",
  content: "block+",

  addAttributes() {
    return preservedClassAttributes;
  },

  parseHTML() {
    return [{ tag: "div" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", HTMLAttributes, 0];
  },
});

function normalizeClassColorHtml(html: string) {
  const htmlWithoutBackground = html.replace(/\sbgcolor=["'][^"']*["']/gi, "");
  const parser = new DOMParser();
  const document = parser.parseFromString(`<body>${htmlWithoutBackground}</body>`, "text/html");
  const allowedStyleProperties = new Set([
    "color",
    "display",
    "font-size",
    "font-weight",
    "line-height",
    "margin",
    "margin-bottom",
    "margin-left",
    "margin-right",
    "margin-top",
    "padding-right",
  ]);

  document.body.querySelectorAll<HTMLElement>("*").forEach((element) => {
    const style = element.getAttribute("style");
    if (!style) return;

    const cleanedStyle = style
      .split(";")
      .map((rule) => rule.trim())
      .filter(Boolean)
      .map((rule) => {
        const separatorIndex = rule.indexOf(":");
        if (separatorIndex === -1) return null;

        const property = rule.slice(0, separatorIndex).trim().toLowerCase();
        const value = rule
          .slice(separatorIndex + 1)
          .trim()
          .replace(/\s*!important$/i, "");

        if (property.startsWith("background")) return null;
        if (!allowedStyleProperties.has(property)) return null;

        return `${property}:${value}`;
      })
      .filter(Boolean)
      .join(";");

    if (cleanedStyle) {
      element.setAttribute("style", cleanedStyle);
    } else {
      element.removeAttribute("style");
    }
  });

  return ALL_TEXT_STYLES.reduce((currentHtml, style) => {
    const classPattern = new RegExp(
      `<(strong|span)([^>]*)class=["']([^"']*\\b${style.className}\\b[^"']*)["']([^>]*)>`,
      "gi"
    );

    return currentHtml.replace(classPattern, (match) => {
      if (/style=["'][^"']*color\s*:/i.test(match)) return match;
      return match.replace(/^<([a-z]+)/i, `<$1 style="color: ${style.color};"`);
    });
  }, document.body.innerHTML);
}

const HtmlTextPaste = Extension.create({
  name: "htmlTextPaste",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handlePaste: (_view, event) => {
            const clipboardHtml = event.clipboardData?.getData("text/html")?.trim();
            const clipboardText = event.clipboardData?.getData("text/plain")?.trim();
            const html = clipboardHtml || clipboardText;

            if (!html || !/<[a-z][\s\S]*>/i.test(html)) {
              return false;
            }

            event.preventDefault();
            this.editor.commands.insertContent(normalizeClassColorHtml(html));
            return true;
          },
        },
      }),
    ];
  },
});

const tabs = [
  { id: "basic", label: "Basic" },
  { id: "introduction", label: "Introduction" },
  { id: "profile", label: "Profile" },
  { id: "skills", label: "Skills" },
  { id: "review", label: "Review" },
  { id: "stats", label: "Stats & Build" },
  { id: "teams", label: "Synergy & Teams" },
  { id: "extras", label: "Extras" },
  { id: "raw", label: "JSON" },
] as const;

const emptyPayload: CharacterPayload = {
  slug: "",
  name: "",
  rarity: 6,
  afflatus: "Star",
  role: "Sub Carry",
  tier: "S",
  image: null,
  source_url: null,
  overview_en: "",
  overview_vi: "",
  beginner_notes_en: "",
  beginner_notes_vi: "",
  skills: [],
  pros_en: [],
  pros_vi: [],
  cons_en: [],
  cons_vi: [],
  recommended_teams: [],
  recommended_items: [],
  profile: {
    damage_type: "Mental",
    specialties: ["DPS"],
    last_updated: "24/May/2026",
    review_html: "",
    review_html_en: "",
    review_html_vi: "",
    ratings: {},
    resonance_builds: [],
    comments_html: "",
    comments_html_en: "",
    comments_html_vi: "",
    stats_html: "",
    stats_html_en: "",
    stats_html_vi: "",
    synergy_html: "",
    synergy_html_en: "",
    synergy_html_vi: "",
    lore_html: "",
    lore_html_en: "",
    lore_html_vi: "",
  },
  inheritance: [],
  special_effects: [],
  euphoria: {},
  portray: [],
  gallery: [],
  roles: [],
};

function toFormState(payload: CharacterPayload): FormState {
  const profileObj = payload.profile ?? {};
  const profileSpecialties = Array.isArray(profileObj.specialties) ? profileObj.specialties : [];
  const rolesArray = (payload.roles && payload.roles.length > 0)
    ? payload.roles
    : profileSpecialties;

  // Normalize resonance builds on load
  const rawResonanceBuilds = Array.isArray(profileObj.resonance_builds) ? profileObj.resonance_builds : [];
  const normalizedResonanceBuilds = rawResonanceBuilds.map((build: any) => ({
    name_en: build.name_en ?? build.name ?? "",
    name_vi: build.name_vi ?? build.name ?? "",
    stats: Array.isArray(build.stats) ? build.stats : [],
  }));

  const syncedProfile = {
    ...profileObj,
    specialties: rolesArray,
    resonance_builds: normalizedResonanceBuilds,
  };

  // Normalize recommended items on load
  const rawItems = parseJsonField<any[]>(payload.recommended_items, []);
  const normalizedItems = rawItems.map((item: any) => ({
    name_en: item.name_en ?? item.name ?? "",
    name_vi: item.name_vi ?? item.name ?? "",
    image: item.image ?? "",
    notes_en: item.notes_en ?? item.notes ?? "",
    notes_vi: item.notes_vi ?? item.notes ?? "",
  }));

  return {
    ...payload,
    image: payload.image ?? "",
    source_url: payload.source_url ?? "",
    overview_en: payload.overview_en ?? "",
    overview_vi: payload.overview_vi ?? "",
    beginner_notes_en: payload.beginner_notes_en ?? "",
    beginner_notes_vi: payload.beginner_notes_vi ?? "",
    profile: JSON.stringify(syncedProfile, null, 2),
    euphoria: JSON.stringify(payload.euphoria ?? {}, null, 2),
    skills: JSON.stringify(payload.skills ?? [], null, 2),
    pros_en: JSON.stringify(payload.pros_en ?? [], null, 2),
    pros_vi: JSON.stringify(payload.pros_vi ?? [], null, 2),
    cons_en: JSON.stringify(payload.cons_en ?? [], null, 2),
    cons_vi: JSON.stringify(payload.cons_vi ?? [], null, 2),
    recommended_teams: JSON.stringify(payload.recommended_teams ?? [], null, 2),
    recommended_items: JSON.stringify(normalizedItems, null, 2),
    inheritance: JSON.stringify(payload.inheritance ?? [], null, 2),
    special_effects: JSON.stringify(payload.special_effects ?? [], null, 2),
    portray: JSON.stringify(payload.portray ?? [], null, 2),
    gallery: JSON.stringify(payload.gallery ?? [], null, 2),
    roles: JSON.stringify(rolesArray, null, 2),
  };
}

function parseJsonField<T>(value: any, fallback: T): T {
  if (value === undefined || value === null) return fallback;
  if (typeof value !== "string") {
    if (Array.isArray(value) || typeof value === "object") {
      return value as T;
    }
    return fallback;
  }
  try {
    const trimmed = value.trim();
    if (!trimmed || trimmed === "null" || trimmed === "undefined") {
      return fallback;
    }
    const parsed = JSON.parse(trimmed);
    return parsed === null || parsed === undefined ? fallback : (parsed as T);
  } catch {
    return fallback;
  }
}

function slugifyName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizePayload(form: FormState): CharacterPayload {
  const profile = parseJsonField<Record<string, JsonValue>>(form.profile, {});
  if (profile && Array.isArray(profile.resonance_builds)) {
    profile.resonance_builds = profile.resonance_builds.map((build: any) => ({
      name: build.name_en || build.name_vi || "",
      name_en: build.name_en || "",
      name_vi: build.name_vi || "",
      stats: Array.isArray(build.stats) ? build.stats : [],
    }));
  }

  const rawItems = parseJsonField<any[]>(form.recommended_items, []);
  const normalizedItems = rawItems.map((item: any) => ({
    name: item.name_en || item.name_vi || "",
    name_en: item.name_en || "",
    name_vi: item.name_vi || "",
    image: item.image || "",
    notes: item.notes_en || item.notes_vi || "",
    notes_en: item.notes_en || "",
    notes_vi: item.notes_vi || "",
  }));

  return {
    slug: (form.slug || "").trim(),
    name: (form.name || "").trim(),
    rarity: Number(form.rarity || 0),
    afflatus: (form.afflatus || "").trim(),
    role: (form.role || "").trim(),
    tier: (form.tier || "").trim(),
    image: form.image?.trim() || null,
    source_url: form.source_url?.trim() || null,
    overview_en: form.overview_en?.trim() || null,
    overview_vi: form.overview_vi?.trim() || null,
    beginner_notes_en: form.beginner_notes_en?.trim() || null,
    beginner_notes_vi: form.beginner_notes_vi?.trim() || null,
    profile,
    euphoria: parseJsonField<Record<string, JsonValue>>(form.euphoria, {}),
    skills: parseJsonField<JsonValue[]>(form.skills, []),
    pros_en: parseJsonField<string[]>(form.pros_en, []),
    pros_vi: parseJsonField<string[]>(form.pros_vi, []),
    cons_en: parseJsonField<string[]>(form.cons_en, []),
    cons_vi: parseJsonField<string[]>(form.cons_vi, []),
    recommended_teams: parseJsonField<JsonValue[]>(form.recommended_teams, []),
    recommended_items: normalizedItems,
    inheritance: parseJsonField<JsonValue[]>(form.inheritance, []),
    special_effects: parseJsonField<JsonValue[]>(form.special_effects, []),
    portray: parseJsonField<JsonValue[]>(form.portray, []),
    gallery: parseJsonField<JsonValue[]>(form.gallery, []),
    roles: parseJsonField<string[]>(form.roles, []),
  };
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(body?.message ?? body?.error ?? response.statusText);
  }

  return body as T;
}

function Field({
  label,
  children,
  wide = false,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "block md:col-span-2" : "block"}>
      <span className="mb-1.5 block text-sm font-semibold text-gray-750 dark:text-[#a0aec0]">
        {label}
      </span>
      {children}
    </div>
  );
}

function inputClass() {
  return "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-500 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-[#2e3e5a] dark:bg-[#0c101a] dark:text-white dark:placeholder:text-gray-500";
}

function textareaClass(mono = false) {
  return `min-h-32 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-500 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-[#2e3e5a] dark:bg-[#0c101a] dark:text-white dark:placeholder:text-gray-500 ${
    mono ? "font-mono text-xs leading-5" : ""
  }`;
}

function RichTextEditor({
  value,
  onChange,
  textStyles = DEFAULT_GAME_CONFIG.textStyles,
}: {
  value: string;
  onChange: (value: string) => void;
  textStyles?: GameContentConfig["textStyles"];
}) {
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [htmlDraft, setHtmlDraft] = useState(value || "");
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false,
        heading: false,
        paragraph: false,
      }),
      PreservedClassBold,
      PreservedClassHeading,
      PreservedClassParagraph,
      PreservedClassDiv,
      TextStyle,
      Color,
      HtmlTextPaste,
    ],
    content: value || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-36 w-full rounded-b-lg border-x border-b border-gray-300 bg-transparent px-4 py-3 text-sm leading-6 text-gray-800 outline-none dark:border-[#2e3e5a] dark:bg-[#0c101a] dark:text-white",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor || editor.getHTML() === value) return;
    editor.commands.setContent(value || "", { emitUpdate: false });
  }, [editor, value]);

  const buttonClass = (isActive: boolean) =>
    `rounded-md px-2.5 py-1.5 text-xs font-semibold ${
      isActive
        ? "bg-brand-500 text-white"
        : "bg-white text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50 dark:bg-[#1a2336] dark:text-[#a0aec0] dark:ring-[#2e3e5a] dark:hover:bg-[#222e47]"
    }`;

  const applyRoleTextStyle = (className: string, color: string) => {
    editor
      ?.chain()
      .focus()
      .setMark("bold", { class: className })
      .setColor(color)
      .run();
  };

  const applyHtmlDraft = () => {
    const normalizedHtml = normalizeClassColorHtml(htmlDraft);
    editor?.commands.setContent(normalizedHtml, { emitUpdate: false });
    onChange(editor?.getHTML() || normalizedHtml);
    setHtmlDraft(normalizedHtml);
    setIsHtmlMode(false);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 rounded-t-lg border border-gray-300 bg-gray-50 px-3 py-2 dark:border-[#2e3e5a] dark:bg-[#161f30]">
        <button
          className={buttonClass(editor?.isActive("bold") ?? false)}
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          Bold
        </button>
        <button
          className={buttonClass(editor?.isActive("italic") ?? false)}
          type="button"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          Italic
        </button>
        <button
          className={buttonClass(editor?.isActive("heading", { level: 3 }) ?? false)}
          type="button"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </button>
        <button
          className={buttonClass(editor?.isActive("bulletList") ?? false)}
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()} // fallback safe trigger
        >
          List
        </button>
        <button
          className={buttonClass(editor?.isActive("orderedList") ?? false)}
          type="button"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          1. List
        </button>
        <button
          className={buttonClass(editor?.isActive("blockquote") ?? false)}
          type="button"
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        >
          Quote
        </button>
        {textStyles
          .filter((style) => ["dps", "sub-dps", "support", "sustain"].includes(style.className))
          .map((style) => (
          <button
            key={style.className}
            className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-white"
            style={{ backgroundColor: style.color }}
            type="button"
            onClick={() => applyRoleTextStyle(style.className, style.color)}
          >
            {style.label}
          </button>
        ))}
        <input
          aria-label="Text color"
          className="h-8 w-10 rounded-md border border-gray-300 bg-white p-1 dark:border-[#2e3e5a] dark:bg-[#1a2336]"
          type="color"
          onInput={(event) =>
            editor
              ?.chain()
              .focus()
              .setColor((event.target as HTMLInputElement).value)
              .run()
          }
        />
        <button
          className={buttonClass(false)}
          type="button"
          onClick={() => editor?.chain().focus().unsetColor().run()}
        >
          Clear color
        </button>
        <button
          className={buttonClass(false)}
          type="button"
          onClick={() => editor?.chain().focus().undo().run()}
        >
          Undo
        </button>
        <button
          className={buttonClass(false)}
          type="button"
          onClick={() => editor?.chain().focus().redo().run()}
        >
          Redo
        </button>
        <button
          className={buttonClass(isHtmlMode)}
          type="button"
          onClick={() => {
            if (!isHtmlMode) {
              setHtmlDraft(editor?.getHTML() || value || "");
            }
            setIsHtmlMode((current) => !current);
          }}
        >
          HTML
        </button>
      </div>
      {isHtmlMode ? (
        <div className="rounded-b-lg border-x border-b border-gray-300 dark:border-[#2e3e5a]">
          <textarea
            className="min-h-56 w-full bg-slate-955 px-4 py-3 font-mono text-xs leading-5 text-slate-100 outline-none dark:bg-[#0c101a]"
            spellCheck={false}
            value={htmlDraft}
            onChange={(event) => setHtmlDraft(event.target.value)}
          />
          <div className="flex gap-2 border-t border-gray-300 bg-slate-900 px-3 py-2 dark:border-[#2e3e5a] dark:bg-[#161f30]">
            <button
              className="rounded-md bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600"
              type="button"
              onClick={applyHtmlDraft}
            >
              Apply HTML
            </button>
            <button
              className="rounded-md bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-100 hover:bg-slate-600 dark:bg-gray-800 dark:text-gray-300"
              type="button"
              onClick={() => {
                setHtmlDraft(editor?.getHTML() || value || "");
                setIsHtmlMode(false);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <EditorContent editor={editor} />
      )}
    </div>
  );
}

function StringListEditor({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [isRaw, setIsRaw] = useState(false);
  const [rawText, setRawText] = useState(value);
  const [error, setError] = useState<string | null>(null);

  const items = useMemo<string[]>(() => {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }, [value]);

  useEffect(() => {
    if (!isRaw) {
      setRawText(value);
      setError(null);
    }
  }, [value, isRaw]);

  const handleItemChange = (index: number, val: string) => {
    const next = [...items];
    next[index] = val;
    onChange(JSON.stringify(next, null, 2));
  };

  const addItem = () => {
    const next = [...items, ""];
    onChange(JSON.stringify(next, null, 2));
  };

  const removeItem = (index: number) => {
    const next = items.filter((_, i) => i !== index);
    onChange(JSON.stringify(next, null, 2));
  };

  const handleRawChange = (val: string) => {
    setRawText(val);
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) {
        onChange(JSON.stringify(parsed, null, 2));
        setError(null);
      } else {
        setError("Dữ liệu phải là một mảng (JSON array).");
      }
    } catch (e: any) {
      setError(`JSON không hợp lệ: ${e.message}`);
    }
  };

  return (
    <div className="space-y-2 rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-[#1e293b] dark:bg-[#0b0e17]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#a0aec0]">
          {label}
        </span>
        <button
          type="button"
          onClick={() => setIsRaw(!isRaw)}
          className="rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-600 shadow-theme-xs hover:bg-gray-50 dark:border-[#2e3e5a] dark:bg-[#1a2336] dark:text-[#a0aec0] dark:hover:bg-[#222e47]"
        >
          {isRaw ? "Form Editor" : "Raw JSON"}
        </button>
      </div>

      {isRaw ? (
        <div className="space-y-1">
          <textarea
            className="w-full min-h-24 rounded-lg border border-gray-300 bg-transparent px-3 py-2 font-mono text-xs text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-[#2e3e5a] dark:bg-[#0c101a] dark:text-white"
            value={rawText}
            onChange={(e) => handleRawChange(e.target.value)}
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex gap-2 items-center">
              <input
                className="h-10 flex-1 rounded-lg border border-gray-300 bg-transparent px-3 py-1.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-500 focus:outline-hidden dark:border-[#2e3e5a] dark:bg-[#0c101a] dark:text-white"
                value={item}
                placeholder="Nhập nội dung..."
                onChange={(e) => handleItemChange(index, e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-red-500 dark:hover:bg-[#1a2336] transition"
                aria-label="Xóa"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-500 hover:text-brand-600 hover:underline transition"
          >
            + Thêm mục mới
          </button>
        </div>
      )}
    </div>
  );
}

function DynamicArrayEditor({
  label,
  value,
  onChange,
  template = {},
  characterOptions = [],
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  template?: any;
  characterOptions?: { value: string; label: string }[];
}) {
  const [isRaw, setIsRaw] = useState(false);
  const [rawText, setRawText] = useState(value);
  const [error, setError] = useState<string | null>(null);

  const items = useMemo<any[]>(() => {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [value]);

  useEffect(() => {
    if (!isRaw) {
      setRawText(value);
      setError(null);
    }
  }, [value, isRaw]);

  const schemaKeys = useMemo<string[]>(() => {
    if (items.length > 0 && typeof items[0] === "object" && items[0] !== null) {
      return Object.keys(items[0]);
    }
    return Object.keys(template);
  }, [items, template]);

  const handleFieldChange = (itemIndex: number, key: string, val: any) => {
    const next = items.map((item, idx) => {
      if (idx === itemIndex) {
        return { ...item, [key]: val };
      }
      return item;
    });
    onChange(JSON.stringify(next, null, 2));
  };

  const addItem = () => {
    const newItem = { ...template };
    if (items.length > 0) {
      schemaKeys.forEach((key) => {
        if (typeof items[0][key] === "number") {
          newItem[key] = 0;
        } else if (typeof items[0][key] === "boolean") {
          newItem[key] = false;
        } else if (Array.isArray(items[0][key])) {
          newItem[key] = [];
        } else {
          newItem[key] = "";
        }
      });
    }
    const next = [...items, newItem];
    onChange(JSON.stringify(next, null, 2));
  };

  const removeItem = (index: number) => {
    const next = items.filter((_, i) => i !== index);
    onChange(JSON.stringify(next, null, 2));
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const next = [...items];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < next.length) {
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      onChange(JSON.stringify(next, null, 2));
    }
  };

  const handleRawChange = (val: string) => {
    setRawText(val);
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) {
        onChange(JSON.stringify(parsed, null, 2));
        setError(null);
      } else {
        setError("Dữ liệu phải là một mảng (JSON array).");
      }
    } catch (e: any) {
      setError(`JSON không hợp lệ: ${e.message}`);
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-[#1e293b] dark:bg-[#0b0e17]">
      <div className="flex items-center justify-between border-b border-gray-200 pb-2 dark:border-[#1e293b]">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#a0aec0]">
          {label}
        </span>
        <button
          type="button"
          onClick={() => setIsRaw(!isRaw)}
          className="rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-600 shadow-theme-xs hover:bg-gray-50 dark:border-[#2e3e5a] dark:bg-[#1a2336] dark:text-[#a0aec0] dark:hover:bg-[#222e47]"
        >
          {isRaw ? "Form Editor" : "Raw JSON"}
        </button>
      </div>

      {isRaw ? (
        <div className="space-y-1">
          <textarea
            className="w-full min-h-48 rounded-lg border border-gray-300 bg-transparent px-3 py-2 font-mono text-xs text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-[#2e3e5a] dark:bg-[#0c101a] dark:text-white"
            value={rawText}
            onChange={(e) => handleRawChange(e.target.value)}
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => {
            const displayName = item.name || item.title || item.level || `Mục #${index + 1}`;
            return (
              <div
                key={index}
                className="relative rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-[#2e3e5a] dark:bg-[#1a2336]"
              >
                <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-2 dark:border-[#2e3e5a]">
                  <span className="text-sm font-bold text-gray-850 dark:text-white">
                    {displayName}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveItem(index, "up")}
                      className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-[#222e47] disabled:opacity-30"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      disabled={index === items.length - 1}
                      onClick={() => moveItem(index, "down")}
                      className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-[#222e47] disabled:opacity-30"
                    >
                      ▼
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-500 dark:hover:bg-[#222e47]"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {schemaKeys.map((key) => {
                    const val = item[key] ?? "";
                    const isLongText = key === "description" || key === "notes" || key === "effect" || key.endsWith("html");
                    const isImage = key === "image" || key === "icon" || key === "avatar";

                    if (key === "members" && characterOptions.length > 0) {
                      return (
                        <div key={key} className="sm:col-span-2 space-y-1">
                          <label className="text-xs font-semibold text-gray-500 dark:text-[#a0aec0] capitalize">
                            {key.replace(/_/g, " ")}
                          </label>
                          <MultiSelectCombobox
                            options={characterOptions}
                            selected={Array.isArray(val) ? val : []}
                            onChange={(selected) => handleFieldChange(index, key, selected)}
                            placeholder="Select team members..."
                          />
                        </div>
                      );
                    }

                    return (
                      <div key={key} className={isLongText ? "sm:col-span-2 space-y-1" : "space-y-1"}>
                        <label className="text-xs font-semibold text-gray-500 dark:text-[#a0aec0] capitalize">
                          {key.replace(/_/g, " ")}
                        </label>
                        {isLongText ? (
                          <textarea
                            className="w-full min-h-16 rounded-lg border border-gray-300 bg-transparent px-3 py-1.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-[#2e3e5a] dark:bg-[#0c101a] dark:text-white"
                            value={String(val)}
                            onChange={(e) => handleFieldChange(index, key, e.target.value)}
                          />
                        ) : isImage ? (
                          <div className="flex gap-3 items-center">
                            <input
                              className="h-10 flex-1 rounded-lg border border-gray-300 bg-transparent px-3 py-1.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-[#2e3e5a] dark:bg-[#0c101a] dark:text-white"
                              value={String(val)}
                              onChange={(e) => handleFieldChange(index, key, e.target.value)}
                            />
                            {val && (
                              <img
                                src={String(val)}
                                alt="preview"
                                className="h-10 w-10 rounded-lg border border-gray-200 object-cover dark:border-[#2e3e5a]"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                            )}
                          </div>
                        ) : typeof val === "boolean" ? (
                          <div className="flex items-center h-10">
                            <input
                              type="checkbox"
                              checked={Boolean(val)}
                              onChange={(e) => handleFieldChange(index, key, e.target.checked)}
                              className="h-4 w-4 rounded-sm border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-[#2e3e5a] dark:bg-[#0c101a]"
                            />
                          </div>
                        ) : Array.isArray(val) ? (
                          <input
                            className="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 py-1.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-[#2e3e5a] dark:bg-[#0c101a] dark:text-white"
                            value={val.join(", ")}
                            placeholder="Mục 1, Mục 2..."
                            onChange={(e) =>
                              handleFieldChange(
                                index,
                                key,
                                e.target.value
                                  .split(",")
                                  .map((s) => s.trim())
                                  .filter(Boolean)
                              )
                            }
                          />
                        ) : (
                          <input
                            type={typeof val === "number" ? "number" : "text"}
                            className="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 py-1.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-[#2e3e5a] dark:bg-[#0c101a] dark:text-white"
                            value={String(val)}
                            onChange={(e) =>
                              handleFieldChange(
                                index,
                                key,
                                typeof val === "number" ? Number(e.target.value) : e.target.value
                              )
                            }
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={addItem}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 py-3 text-sm font-semibold text-gray-650 hover:bg-gray-50 dark:border-[#2e3e5a] dark:text-brand-400 dark:hover:bg-white/[0.02]"
          >
            + Thêm mục mới
          </button>
        </div>
      )}
    </div>
  );
}

function DynamicObjectEditor({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [isRaw, setIsRaw] = useState(false);
  const [rawText, setRawText] = useState(value);
  const [error, setError] = useState<string | null>(null);

  const obj = useMemo<Record<string, any>>(() => {
    try {
      const parsed = JSON.parse(value);
      return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }, [value]);

  useEffect(() => {
    if (!isRaw) {
      setRawText(value);
      setError(null);
    }
  }, [value, isRaw]);

  const handleKeyChange = (oldKey: string, newKey: string) => {
    if (oldKey === newKey || !newKey.trim()) return;
    const next = { ...obj };
    next[newKey] = next[oldKey];
    delete next[oldKey];
    onChange(JSON.stringify(next, null, 2));
  };

  const handleValChange = (key: string, val: any) => {
    const next = { ...obj, [key]: val };
    onChange(JSON.stringify(next, null, 2));
  };

  const addField = () => {
    let baseKey = "Tiêu chí mới";
    let key = baseKey;
    let counter = 1;
    while (key in obj) {
      key = `${baseKey} ${counter}`;
      counter++;
    }
    const next = { ...obj, [key]: 5 };
    onChange(JSON.stringify(next, null, 2));
  };

  const removeField = (key: string) => {
    const next = { ...obj };
    delete next[key];
    onChange(JSON.stringify(next, null, 2));
  };

  const handleRawChange = (val: string) => {
    setRawText(val);
    try {
      const parsed = JSON.parse(val);
      if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
        onChange(JSON.stringify(parsed, null, 2));
        setError(null);
      } else {
        setError("Dữ liệu phải là một đối tượng JSON (JSON object).");
      }
    } catch (e: any) {
      setError(`JSON không hợp lệ: ${e.message}`);
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-[#1e293b] dark:bg-[#0b0e17]">
      <div className="flex items-center justify-between border-b border-gray-200 pb-2 dark:border-[#1e293b]">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#a0aec0]">
          {label}
        </span>
        <button
          type="button"
          onClick={() => setIsRaw(!isRaw)}
          className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-650 hover:bg-gray-50 dark:border-[#2e3e5a] dark:bg-[#1a2336] dark:text-[#a0aec0] dark:hover:bg-[#222e47]"
        >
          {isRaw ? "Form Editor" : "Raw JSON"}
        </button>
      </div>

      {isRaw ? (
        <div className="space-y-1">
          <textarea
            className="w-full min-h-36 rounded-lg border border-gray-300 bg-transparent px-3 py-2 font-mono text-xs text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-[#2e3e5a] dark:bg-[#0c101a] dark:text-white"
            value={rawText}
            onChange={(e) => handleRawChange(e.target.value)}
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(obj).map(([key, val]) => (
            <div key={key} className="flex flex-col gap-2 rounded-lg border border-gray-150 bg-white p-3 dark:border-[#2e3e5a] dark:bg-[#1a2336] sm:flex-row sm:items-center">
              <input
                className="h-10 rounded-lg border border-gray-300 bg-transparent px-3 py-1.5 text-sm font-semibold text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-[#2e3e5a] dark:bg-[#0c101a] dark:text-white sm:w-1/3"
                defaultValue={key}
                placeholder="Tên tiêu chí"
                onBlur={(e) => handleKeyChange(key, e.target.value)}
              />
              <div className="flex flex-1 items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={typeof val === "number" ? val : 5}
                  onChange={(e) => handleValChange(key, Number(e.target.value))}
                  className="h-2 w-full cursor-pointer rounded-lg bg-gray-200 accent-brand-500 dark:bg-gray-800"
                />
                <span className="w-10 text-right text-sm font-bold text-gray-800 dark:text-white">
                  {val}
                </span>
                <button
                  type="button"
                  onClick={() => removeField(key)}
                  className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-500 dark:hover:bg-[#222e47]"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
          {Object.keys(obj).length === 0 && (
            <p className="text-center text-xs text-gray-500 dark:text-gray-400 py-2">
              Chưa có tiêu chí nào.
            </p>
          )}
          <button
            type="button"
            onClick={addField}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 py-2.5 text-sm font-semibold text-gray-655 hover:bg-gray-50 dark:border-[#2e3e5a] dark:text-brand-400 dark:hover:bg-white/[0.02]"
          >
            + Thêm tiêu chí đánh giá
          </button>
        </div>
      )}
    </div>
  );
}

function MultiSelectCombobox({
  options,
  selected,
  onChange,
  placeholder = "Select roles..."
}: {
  options: { value: string; label: string; criteria?: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const safeSelected = useMemo(() => {
    return Array.isArray(selected) ? selected : [];
  }, [selected]);

  const filteredOptions = useMemo(() => {
    const opts = Array.isArray(options) ? options : [];
    return opts.filter(
      (opt) =>
        opt &&
        typeof opt.label === "string" &&
        opt.label.toLowerCase().includes((search || "").toLowerCase()) &&
        !safeSelected.includes(opt.value)
    );
  }, [options, search, safeSelected]);

  const handleToggle = (val: string) => {
    if (!val) return;
    if (safeSelected.includes(val)) {
      const updated = safeSelected.filter((s) => s !== val);
      onChange(updated);
    } else {
      onChange([...safeSelected, val]);
    }
  };

  const handleRemove = (val: string) => {
    if (!val) return;
    const next = safeSelected.filter((s) => s !== val);
    onChange(next);
  };

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".multiselect-combobox")) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  return (
    <div className="relative multiselect-combobox w-full">
      <div
        className="flex min-h-[44px] w-full flex-wrap gap-1.5 rounded-lg border border-gray-300 bg-transparent px-3 py-1.5 text-sm shadow-theme-xs focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-500/10 dark:border-[#2e3e5a] dark:bg-gray-900 cursor-text"
        onClick={() => setIsOpen(true)}
      >
        {safeSelected.map((val) => {
          const opt = (options || []).find((o) => o && o.value === val);
          return (
            <span
              key={val}
              className="inline-flex items-center gap-1 rounded bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300 border border-brand-500/20"
            >
              {opt?.label ?? val}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(val);
                }}
                className="hover:text-brand-900 dark:hover:text-white shrink-0 cursor-pointer text-sm font-bold"
              >
                ×
              </button>
            </span>
          );
        })}
        {safeSelected.length === 0 && !search && (
          <span className="text-gray-400 dark:text-white/30 self-center">
            {placeholder}
          </span>
        )}
        <input
          type="text"
          className="min-w-[60px] flex-1 bg-transparent py-0.5 text-sm text-gray-800 outline-hidden placeholder:text-gray-400 dark:text-white/90 focus:outline-hidden"
          placeholder=""
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-[#2e3e5a] dark:bg-[#131926]">
          {filteredOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className="flex w-full items-center px-3 py-2 text-left text-sm text-gray-750 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-[#1a2336] transition cursor-pointer"
              onClick={() => {
                handleToggle(opt.value);
                setSearch("");
              }}
            >
              {opt.label}
            </button>
          ))}
          {filteredOptions.length === 0 && (
            <div className="px-3 py-2 text-center text-xs text-gray-400 dark:text-gray-500">
              No matching options
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CharacterContentEditor() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const slugParam = searchParams.get("slug");

  const [activeCharacterSlug, setActiveCharacterSlug] = useState("");
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["id"]>("basic");
  const [form, setForm] = useState<FormState>(() => toFormState(emptyPayload));
  const [rawJson, setRawJson] = useState(() => JSON.stringify(emptyPayload, null, 2));
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<{ id: string; name: string }[]>([]);
  const [allCharacters, setAllCharacters] = useState<{ slug: string; name: string }[]>([]);

  // Translation View toggle
  const [languageView, setLanguageView] = useState<"en" | "vi" | "parallel">("parallel");

  // Skills editing modal state
  const [editingSkill, setEditingSkill] = useState<{
    index: number;
    name: string;
    type: string;
    image: string;
    description_en: string;
    description_vi: string;
    levels: { level: number; description_en: string; description_vi: string }[];
    modifier_effects: { term: string; description_en: string; description_vi: string }[];
  } | null>(null);
  const [skillLangTab, setSkillLangTab] = useState<"en" | "vi">("en");

  const skillsArray = useMemo(() => {
    try {
      return JSON.parse(form.skills || "[]");
    } catch {
      return [];
    }
  }, [form.skills]);

  const updateSkillsArray = (newSkills: any[]) => {
    updateField("skills", JSON.stringify(newSkills, null, 2));
  };

  // Dynamic game slug resolution from route URL path
  const gameSlug = useMemo(() => {
    const segments = pathname.split("/");
    const index = segments.indexOf("content");
    if (index !== -1 && segments[index + 1]) {
      return segments[index + 1];
    }
    return DEFAULT_GAME_CONFIG.slug;
  }, [pathname]);

  const headers = useMemo(
    () => ({
      "content-type": "application/json",
      "x-admin-token": "super-secret-admin-token-123456",
    }),
    []
  );

  const previewJson = useMemo(() => {
    try {
      return JSON.stringify(normalizePayload(form), null, 2);
    } catch {
      return "Một field JSON đang sai format.";
    }
  }, [form]);

  const profileObject = useMemo(() => {
    try {
      return parseJsonField<Record<string, JsonValue>>(form.profile, {});
    } catch {
      return {};
    }
  }, [form.profile]);

  const gameConfig = GAME_CONTENT_CONFIGS[gameSlug] ?? DEFAULT_GAME_CONFIG;

  const selectedRolesList = useMemo(() => {
    try {
      return parseJsonField<string[]>(form.roles, []);
    } catch {
      return [];
    }
  }, [form.roles]);

  const rolesOptions = useMemo(() => {
    return availableRoles.map((r) => ({
      value: r.id,
      label: r.name,
    }));
  }, [availableRoles]);

  const characterOptions = useMemo(() => {
    return allCharacters.map((c) => ({
      value: c.name,
      label: c.name,
    }));
  }, [allCharacters]);

  const handleRolesChange = (newRoles: string[]) => {
    updateField("roles", JSON.stringify(newRoles, null, 2));
    updateField("role", newRoles[0] || "");

    // Sync to profile.specialties as well
    let currentProfile: Record<string, JsonValue>;
    try {
      currentProfile = parseJsonField<Record<string, JsonValue>>(form.profile, {});
    } catch {
      currentProfile = {};
    }
    updateField("profile", JSON.stringify({ ...currentProfile, specialties: newRoles }, null, 2));
  };

  // Validation errors for JSON fields
  const validationErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    const jsonFields = [
      "profile", "euphoria", "skills", "pros_en", "pros_vi", "cons_en", "cons_vi",
      "recommended_teams", "recommended_items", "inheritance", "special_effects",
      "portray", "gallery", "roles"
    ];
    jsonFields.forEach((field) => {
      const val = form[field as keyof FormState];
      if (typeof val === "string") {
        try {
          JSON.parse(val);
        } catch (e: any) {
          errors[field] = e.message;
        }
      }
    });
    return errors;
  }, [form]);

  const hasTabError = (tabId: string) => {
    if (tabId === "basic") return !!validationErrors.profile;
    if (tabId === "profile") return !!(validationErrors.skills || validationErrors.inheritance || validationErrors.special_effects || validationErrors.profile);
    if (tabId === "review") return !!(validationErrors.pros_en || validationErrors.pros_vi || validationErrors.cons_en || validationErrors.cons_vi);
    if (tabId === "stats") return !!(validationErrors.recommended_items || validationErrors.profile);
    if (tabId === "teams") return !!validationErrors.recommended_teams;
    if (tabId === "extras") return !!(validationErrors.euphoria || validationErrors.portray || validationErrors.gallery);
    return false;
  };

  // Draft key for auto-saving
  const draftKey = useMemo(() => {
    return `novaria_draft_${gameSlug}_${activeCharacterSlug || "new"}`;
  }, [gameSlug, activeCharacterSlug]);

  const [hasDraft, setHasDraft] = useState(false);

  // Check draft existence
  useEffect(() => {
    if (typeof window === "undefined") return;
    const draft = window.localStorage.getItem(draftKey);
    if (draft) {
      try {
        const parsedDraft = JSON.parse(draft);
        const formNorm = normalizePayload(form);
        const draftNorm = normalizePayload(parsedDraft);
        const isDiff = JSON.stringify(formNorm) !== JSON.stringify(draftNorm);
        if (isDiff) {
          setHasDraft(true);
          return;
        }
      } catch {
        // ignore
      }
    }
    setHasDraft(false);
  }, [draftKey, form]);

  // Debounced auto-save draft
  useEffect(() => {
    if (typeof window === "undefined" || isSaving) return;
    const timer = setTimeout(() => {
      try {
        window.localStorage.setItem(draftKey, JSON.stringify(form));
      } catch (e) {
        console.error("Lỗi lưu nháp:", e);
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [form, draftKey, isSaving]);

  const restoreDraft = () => {
    if (typeof window === "undefined") return;
    const draft = window.localStorage.getItem(draftKey);
    if (draft) {
      try {
        setForm(JSON.parse(draft));
        setStatus("Đã khôi phục bản nháp chưa lưu thành công.");
        setError("");
      } catch {
        setError("Không thể đọc được file nháp.");
      }
    }
    setHasDraft(false);
  };

  const discardDraft = () => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(draftKey);
    setHasDraft(false);
    setStatus("Đã xóa bản nháp.");
  };

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateProfileField(key: string, value: JsonValue) {
    let profile: Record<string, JsonValue> = {};
    try {
      profile = parseJsonField<Record<string, JsonValue>>(form.profile, {});
    } catch {
      profile = {};
    }
    updateField("profile", JSON.stringify({ ...profile, [key]: value }, null, 2));
  }

  function updateProfileFields(updates: Record<string, JsonValue>) {
    let profile: Record<string, JsonValue> = {};
    try {
      profile = parseJsonField<Record<string, JsonValue>>(form.profile, {});
    } catch {
      profile = {};
    }
    updateField("profile", JSON.stringify({ ...profile, ...updates }, null, 2));
  }

  async function requestJson<T>(path: string, init?: RequestInit) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        ...headers,
        ...(init?.headers ?? {}),
      },
    });

    return parseResponse<T>(response);
  }

  useEffect(() => {
    async function loadRoles() {
      try {
        const data = await requestJson<{ id: string; name: string }[]>(
          `/api/admin/games/${encodeURIComponent(gameSlug)}/roles`
        );
        setAvailableRoles(data ?? []);
      } catch (e) {
        console.error("Lỗi khi tải danh sách roles:", e);
      }
    }
    async function loadCharacters() {
      try {
        const data = await requestJson<{ slug: string; name: string }[]>(
          `/api/admin/games/${encodeURIComponent(gameSlug)}/characters`
        );
        setAllCharacters(data ?? []);
      } catch (e) {
        console.error("Lỗi khi tải danh sách nhân vật:", e);
      }
    }
    void loadRoles();
    void loadCharacters();
  }, [gameSlug]);

  async function loadCharacter(characterSlug: string) {
    setIsLoading(true);
    setError("");
    try {
      const data = await requestJson<CharacterPayload>(
        `/api/admin/games/${encodeURIComponent(gameSlug)}/characters/${encodeURIComponent(
          characterSlug
        )}`
      );
      setForm(toFormState(data));
      setActiveCharacterSlug(data.slug);
      setStatus(`Đã tải thành công thông tin nhân vật: ${data.name}.`);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Không tải được character.");
    } finally {
      setIsLoading(false);
    }
  }

  // Load character via url query parameter on mount
  useEffect(() => {
    if (slugParam && slugParam !== activeCharacterSlug) {
      void loadCharacter(slugParam);
    }
  }, [slugParam]);

  async function saveCharacter() {
    setIsSaving(true);
    setError("");
    try {
      const payload = normalizePayload(form);
      if (!payload.slug || !payload.name) {
        throw new Error("Slug và name là bắt buộc.");
      }

      const saved = await requestJson<CharacterPayload>(
        `/api/admin/games/${encodeURIComponent(gameSlug)}/characters/${encodeURIComponent(
          payload.slug
        )}`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        }
      );

      setForm(toFormState(saved));
      setActiveCharacterSlug(saved.slug);
      setStatus(`Đã lưu thành công nhân vật ${saved.name} vào Server.`);
      
      // Clear localStorage drafts on save success
      window.localStorage.removeItem(`novaria_draft_${gameSlug}_${saved.slug}`);
      window.localStorage.removeItem(`novaria_draft_${gameSlug}_new`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Không lưu được character.");
    } finally {
      setIsSaving(false);
    }
  }

  function createNewCharacter() {
    setForm(toFormState(emptyPayload));
    setActiveCharacterSlug("");
    setActiveTab("basic");
    setStatus("Đang tạo character mới.");
    setError("");
    router.push(`/content/${gameSlug}/characters/new`);
  }

  function applyRawJson() {
    try {
      const payload = JSON.parse(rawJson) as CharacterPayload;
      setForm(toFormState({ ...emptyPayload, ...payload }));
      setStatus("Đã áp dụng JSON vào form.");
      setError("");
    } catch {
      setError("JSON không hợp lệ.");
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(rawJson);
    setStatus("Đã copy toàn bộ JSON vào Clipboard.");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Container */}
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-[#1e293b] dark:bg-[#131926] dark:backdrop-blur-md lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-brand-50 px-2 py-1 text-xs font-bold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300 capitalize">
              {gameConfig.name}
            </span>
            {activeCharacterSlug && (
              <span className="inline-flex items-center rounded-md bg-success-50 px-2 py-1 text-xs font-bold text-success-700 dark:bg-success-500/10 dark:text-success-300">
                Editing: {form.name}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-950 dark:text-white">
            Character Editor
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Cấu hình dữ liệu, chỉnh sửa trực quan, xem trước hình ảnh và đồng bộ hóa trực tiếp.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/content/${gameSlug}/characters`}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-[#2e3e5a] dark:text-[#a0aec0] dark:hover:bg-[#1a2336] transition"
          >
            ← Danh sách
          </Link>
          <button
            type="button"
            onClick={createNewCharacter}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-[#2e3e5a] dark:text-[#a0aec0] dark:hover:bg-[#1a2336] transition"
          >
            Tạo mới
          </button>
        </div>
      </div>

      {/* Draft Notification Banner */}
      {hasDraft && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-warning-200 bg-warning-50 px-5 py-4 text-sm text-warning-800 dark:border-warning-500/30 dark:bg-warning-500/10 dark:text-warning-300 shadow-xs">
          <div className="flex items-center gap-2.5">
            <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Phát hiện bản nháp tự động lưu có nội dung mới hơn dữ liệu hiện tại của bạn.</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={restoreDraft}
              type="button"
              className="rounded-lg bg-warning-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-warning-700 transition"
            >
              Khôi phục nháp
            </button>
            <button
              onClick={discardDraft}
              type="button"
              className="rounded-lg border border-warning-300 bg-transparent px-3 py-1.5 text-xs font-bold text-warning-700 hover:bg-warning-500/10 dark:border-warning-500/40 dark:text-warning-300 transition"
            >
              Xóa bản nháp
            </button>
          </div>
        </div>
      )}

      {/* Status Box */}
      {(status || error || isLoading) && (
        <div
          className={`rounded-xl border px-5 py-4 text-sm shadow-xs transition ${
            isLoading
              ? "border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300"
              : error
              ? "border-error-200 bg-error-50 text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-300"
              : "border-success-200 bg-success-50 text-success-700 dark:border-success-500/30 dark:bg-success-500/10 dark:text-success-300"
          }`}
        >
          {isLoading ? "Đang tải dữ liệu..." : error || status}
        </div>
      )}

      {/* Main Workspace */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-[#1e293b] dark:bg-[#131926] dark:backdrop-blur-md">
        {/* Navigation Tabs and Utility Actions */}
        <div className="mb-6 flex flex-col gap-4 border-b border-gray-150 pb-5 dark:border-gray-800 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`relative rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? "bg-brand-500 text-white shadow-sm"
                    : "bg-gray-100/70 text-gray-700 hover:bg-gray-150 dark:bg-[#1a2336] dark:text-[#a0aec0] dark:hover:bg-[#222e47]"
                }`}
                type="button"
                onClick={() => {
                  if (tab.id === "raw") setRawJson(previewJson);
                  setActiveTab(tab.id);
                }}
              >
                <span>{tab.label}</span>
                {hasTabError(tab.id) && (
                  <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white dark:border-gray-900 animate-pulse" />
                )}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Language Switcher */}
            {["introduction", "review", "extras"].includes(activeTab) && (
              <div className="flex rounded-lg bg-gray-100 p-0.5 dark:bg-[#0b0e17]">
                {(["parallel", "en", "vi"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setLanguageView(mode)}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                      languageView === mode
                        ? "bg-white text-gray-800 shadow-theme-xs dark:bg-[#1a2336] dark:text-white"
                        : "text-gray-500 hover:text-gray-700 dark:text-[#a0aec0] dark:hover:text-white"
                    }`}
                  >
                    {mode === "parallel" ? "Song song" : mode === "en" ? "English (EN)" : "Tiếng Việt (VI)"}
                  </button>
                ))}
              </div>
            )}

            <button
              className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-500 px-5 text-xs font-semibold text-white hover:bg-brand-600 disabled:opacity-50 transition shadow-sm"
              type="button"
              disabled={isSaving}
              onClick={() => void saveCharacter()}
            >
              {isSaving ? "Đang lưu..." : "Save vào BE"}
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        {activeTab === "basic" && (
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Slug">
              <div className="flex gap-2">
                <input
                  className={inputClass()}
                  value={form.slug}
                  onChange={(event) => updateField("slug", event.target.value)}
                />
                <button
                  className="shrink-0 rounded-lg border border-gray-300 px-4 text-xs font-semibold text-gray-750 hover:bg-gray-50 dark:border-[#2e3e5a] dark:text-gray-300 dark:hover:bg-white/[0.04] transition"
                  type="button"
                  onClick={() => updateField("slug", slugifyName(form.name))}
                >
                  From name
                </button>
              </div>
            </Field>
            <Field label="Name">
              <input
                className={inputClass()}
                value={form.name}
                onChange={(event) => {
                  const nextName = event.target.value;
                  const currentNameSlug = slugifyName(form.name);
                  const shouldSyncSlug =
                    !activeCharacterSlug &&
                    (!form.slug || form.slug === currentNameSlug);

                  setForm((current) => ({
                    ...current,
                    name: nextName,
                    slug: shouldSyncSlug ? slugifyName(nextName) : current.slug,
                  }));
                }}
              />
            </Field>
            <Field label="Rarity">
              <select
                className={inputClass()}
                value={form.rarity}
                onChange={(event) => updateField("rarity", Number(event.target.value))}
              >
                {gameConfig.rarityOptions.map((rarity) => (
                  <option key={rarity} value={rarity}>
                    {rarity} Star
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Tier">
              <select
                className={inputClass()}
                value={form.tier}
                onChange={(event) => updateField("tier", event.target.value)}
              >
                {gameConfig.tierOptions.map((tier) => (
                  <option key={tier} value={tier}>
                    {tier}
                  </option>
                ))}
              </select>
              <p className="mt-2 rounded-lg bg-gray-50 px-3 py-2 text-xs leading-relaxed text-gray-500 dark:bg-[#0b0e17] dark:text-gray-400 border dark:border-[#1e293b]">
                {gameConfig.tierCriteria[form.tier] ?? gameConfig.tierCriteria.S}
              </p>
            </Field>
            <Field label="Afflatus">
              <select
                className={inputClass()}
                value={form.afflatus}
                onChange={(event) => updateField("afflatus", event.target.value)}
              >
                {gameConfig.afflatusOptions.map((afflatus) => (
                  <option key={afflatus} value={afflatus}>
                    {afflatus}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Role" wide>
              <MultiSelectCombobox
                options={rolesOptions}
                selected={selectedRolesList}
                onChange={handleRolesChange}
                placeholder="Select character roles..."
              />
            </Field>
            <Field label="Damage Type">
              <select
                className={inputClass()}
                value={(() => {
                  try {
                    return String(
                      parseJsonField<Record<string, JsonValue>>(form.profile, {})
                        .damage_type ?? "Mental"
                    );
                  } catch {
                    return "Mental";
                  }
                })()}
                onChange={(event) => updateProfileField("damage_type", event.target.value)}
              >
                {gameConfig.damageTypeOptions.map((damageType) => (
                  <option key={damageType} value={damageType}>
                    {damageType}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Image URL" wide>
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <input
                  className={inputClass()}
                  value={form.image ?? ""}
                  onChange={(event) => updateField("image", event.target.value)}
                  placeholder="https://example.com/character-image.png"
                />
                {form.image ? (
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2e3e5a] dark:bg-[#0c101a] shadow-sm">
                    <img
                      src={form.image}
                      alt="Avatar Preview"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-dashed border-gray-300 text-xs font-bold text-gray-400 dark:border-[#2e3e5a]">
                    No Art
                  </div>
                )}
              </div>
            </Field>
            <Field label="Source URL" wide>
              <input
                className={inputClass()}
                value={form.source_url ?? ""}
                onChange={(event) => updateField("source_url", event.target.value)}
                placeholder="https://example.com/source-reference"
              />
            </Field>
            <Field label="Profile JSON (Collapsible Advanced Backup)" wide>
              <details className="group rounded-xl border border-gray-200 bg-gray-50/50 p-2 dark:border-[#1e293b] dark:bg-[#0b0e17]">
                <summary className="cursor-pointer text-xs font-bold text-gray-500 hover:text-gray-700 dark:text-[#a0aec0] dark:hover:text-white py-1.5 px-2">
                  Xem/Sửa Profile JSON trực tiếp
                </summary>
                <div className="mt-2 p-2">
                  <textarea
                    className={textareaClass(true)}
                    value={form.profile}
                    onChange={(event) => updateField("profile", event.target.value)}
                  />
                  {validationErrors.profile && (
                    <p className="mt-1 text-xs text-red-500">{validationErrors.profile}</p>
                  )}
                </div>
              </details>
            </Field>
          </div>
        )}

        {activeTab === "introduction" && (
          <div className="grid gap-5 md:grid-cols-2">
            {(languageView === "en" || languageView === "parallel") && (
              <div className={languageView === "en" ? "md:col-span-2" : ""}>
                <Field label="Introduction EN">
                  <RichTextEditor
                    textStyles={gameConfig.textStyles}
                    value={form.overview_en ?? ""}
                    onChange={(value) => updateField("overview_en", value)}
                  />
                </Field>
              </div>
            )}
            {(languageView === "vi" || languageView === "parallel") && (
              <div className={languageView === "vi" ? "md:col-span-2" : ""}>
                <Field label="Introduction VI">
                  <RichTextEditor
                    textStyles={gameConfig.textStyles}
                    value={form.overview_vi ?? ""}
                    onChange={(value) => updateField("overview_vi", value)}
                  />
                </Field>
              </div>
            )}
          </div>
        )}

        {activeTab === "profile" && (
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Specialties" wide>
              <MultiSelectCombobox
                options={rolesOptions}
                selected={selectedRolesList}
                onChange={handleRolesChange}
                placeholder="Select character specialties..."
              />
            </Field>
            <Field label="Last updated">
              <input
                className={inputClass()}
                value={String(profileObject.last_updated ?? "")}
                onChange={(event) => updateProfileField("last_updated", event.target.value)}
              />
            </Field>

            {/* Skills editor has been moved to the dedicated Skills tab */}

            <div className="md:col-span-2">
              <DynamicArrayEditor
                label="Inheritance (Mảng thuộc tính bị động / Passives)"
                value={form.inheritance}
                onChange={(value) => updateField("inheritance", value)}
                template={{ name: "", description: "" }}
              />
            </div>

            <div className="md:col-span-2">
              <DynamicArrayEditor
                label="Special effects (Hiệu ứng đặc biệt)"
                value={form.special_effects}
                onChange={(value) => updateField("special_effects", value)}
                template={{ name: "", description: "" }}
              />
            </div>
          </div>
        )}

        {activeTab === "skills" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-150 pb-3 dark:border-[#1e293b]">
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                  Skills Management
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                  Manage Incantations, Ultimates and Passives for this character. Bilingual EN/VI support.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSkillLangTab("en");
                  setEditingSkill({
                    index: -1,
                    name: "",
                    type: "Incantation",
                    image: "",
                    description_en: "",
                    description_vi: "",
                    levels: [
                      { level: 1, description_en: "", description_vi: "" },
                      { level: 2, description_en: "", description_vi: "" },
                      { level: 3, description_en: "", description_vi: "" }
                    ],
                    modifier_effects: []
                  });
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-600 transition shadow-sm"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Skill
              </button>
            </div>

            {skillsArray.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-12 dark:border-[#1e293b] bg-gray-50/50 dark:bg-[#0b0e17]/50">
                <svg className="h-10 w-10 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <p className="text-sm font-semibold text-gray-650 dark:text-gray-400 mt-3">
                  No skills configured yet
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Click the &quot;Add Skill&quot; button above to create a new skill.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {skillsArray.map((skill: any, index: number) => {
                  const badgeColor =
                    skill.type === "Ultimate"
                      ? "bg-purple-500/10 text-purple-400 dark:bg-purple-500/15 dark:text-purple-300 border-purple-500/20"
                      : skill.type === "Passive"
                      ? "bg-emerald-500/10 text-emerald-400 dark:bg-emerald-500/15 dark:text-emerald-300 border-emerald-500/20"
                      : "bg-blue-500/10 text-blue-400 dark:bg-blue-500/15 dark:text-blue-300 border-blue-500/20";

                  const descEN = skill.description_en || skill.description || "";
                  const descVI = skill.description_vi || "";

                  return (
                    <div
                      key={index}
                      className="group flex flex-col md:flex-row gap-4 p-5 rounded-xl border border-gray-200 bg-white hover:border-brand-500/50 dark:border-[#1e293b] dark:bg-[#0f1420] dark:hover:border-brand-500/40 transition"
                    >
                      {/* Skill icon/image */}
                      <div className="flex-shrink-0 h-16 w-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 dark:bg-[#1a2236] dark:border-[#1e293b] flex items-center justify-center self-start">
                        {skill.image ? (
                          <img src={skill.image} alt={skill.name} className="h-full w-full object-cover" />
                        ) : (
                          <svg className="h-8 w-8 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-bold text-gray-800 dark:text-white truncate">
                            {skill.name}
                          </h4>
                          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold border ${badgeColor}`}>
                            {skill.type}
                          </span>
                        </div>

                        {/* Bilingual descriptions */}
                        {(descEN || descVI) && (
                          <div className="mt-2 space-y-1.5">
                            {descEN && (
                              <div className="flex items-start gap-2">
                                <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">EN</span>
                                <p className="text-sm text-gray-650 dark:text-gray-400 whitespace-pre-line leading-relaxed">{descEN}</p>
                              </div>
                            )}
                            {descVI && (
                              <div className="flex items-start gap-2">
                                <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">VI</span>
                                <p className="text-sm text-gray-650 dark:text-gray-400 whitespace-pre-line leading-relaxed">{descVI}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Levels description */}
                        {skill.levels && skill.levels.length > 0 && (
                          <div className="mt-3 border-t border-gray-100 pt-2.5 dark:border-[#1e293b]">
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider block mb-1.5">
                              Incantation Levels
                            </span>
                            <div className="space-y-1">
                              {skill.levels.map((lvl: any, lvlIdx: number) => (
                                <div key={lvlIdx} className="text-xs text-gray-650 dark:text-gray-400 flex items-start gap-1.5">
                                  <span className="text-brand-400 font-medium shrink-0">
                                    {lvl.level === 1 ? "✦✧✧" : lvl.level === 2 ? "✦✦✧" : "✦✦✦"}
                                  </span>
                                  <span className="whitespace-pre-line">{lvl.description_en || lvl.description || ""}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Modifier effects */}
                        {skill.modifier_effects && skill.modifier_effects.length > 0 && (
                          <div className="mt-3 border-t border-gray-100 pt-2.5 dark:border-[#1e293b]">
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider block mb-1.5">
                              Modifier Effects
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {skill.modifier_effects.map((effect: any, effIdx: number) => (
                                <span
                                  key={effIdx}
                                  className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2.5 py-1.5 text-xs text-gray-700 dark:bg-[#1a2236] dark:text-gray-300 border border-gray-200 dark:border-[#1e293b]"
                                  title={effect.description_en || effect.description || ""}
                                >
                                  <strong className="text-brand-500">{effect.term}</strong>
                                  <span className="text-gray-400 dark:text-gray-500">—</span>
                                  {effect.description_en || effect.description || ""}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex md:flex-col items-center gap-2 justify-end shrink-0">
                        {/* Order controls */}
                        <div className="flex md:flex-row gap-1">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => {
                              const list = [...skillsArray];
                              const temp = list[index];
                              list[index] = list[index - 1];
                              list[index - 1] = temp;
                              updateSkillsArray(list);
                            }}
                            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-[#1a2236] disabled:opacity-30 transition"
                            title="Move up"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            disabled={index === skillsArray.length - 1}
                            onClick={() => {
                              const list = [...skillsArray];
                              const temp = list[index];
                              list[index] = list[index + 1];
                              list[index + 1] = temp;
                              updateSkillsArray(list);
                            }}
                            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-[#1a2236] disabled:opacity-30 transition"
                            title="Move down"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>

                        {/* Edit / Delete */}
                        <div className="flex md:flex-row gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setSkillLangTab("en");
                              // Migrate old single-lang format to bilingual
                              const migrateLevels = (levels: any[]) => levels.map((l: any) => ({
                                level: l.level,
                                description_en: l.description_en || l.description || "",
                                description_vi: l.description_vi || ""
                              }));
                              const migrateEffects = (effects: any[]) => effects.map((e: any) => ({
                                term: e.term || "",
                                description_en: e.description_en || e.description || "",
                                description_vi: e.description_vi || ""
                              }));
                              setEditingSkill({
                                index,
                                name: skill.name || "",
                                type: skill.type || "Incantation",
                                image: skill.image || "",
                                description_en: skill.description_en || skill.description || "",
                                description_vi: skill.description_vi || "",
                                levels: skill.levels && skill.levels.length > 0 ? migrateLevels(skill.levels) : [
                                  { level: 1, description_en: "", description_vi: "" },
                                  { level: 2, description_en: "", description_vi: "" },
                                  { level: 3, description_en: "", description_vi: "" }
                                ],
                                modifier_effects: skill.modifier_effects ? migrateEffects(skill.modifier_effects) : []
                              });
                            }}
                            className="inline-flex items-center justify-center p-2 rounded-lg text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition"
                            title="Edit"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Delete skill "${skill.name}"?`)) {
                                const list = [...skillsArray];
                                list.splice(index, 1);
                                updateSkillsArray(list);
                              }
                            }}
                            className="inline-flex items-center justify-center p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                            title="Delete"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "review" && (
          <div className="grid gap-5 md:grid-cols-2">
            {/* Review EN / VI */}
            {(languageView === "en" || languageView === "parallel") && (
              <div className={languageView === "en" ? "md:col-span-2" : ""}>
                <Field label="Review EN (Đánh giá chung EN)" wide>
                  <RichTextEditor
                    textStyles={gameConfig.textStyles}
                    value={String(profileObject.review_html_en ?? profileObject.review_html ?? "")}
                    onChange={(value) => updateProfileFields({ review_html_en: value, review_html: value })}
                  />
                </Field>
              </div>
            )}
            {(languageView === "vi" || languageView === "parallel") && (
              <div className={languageView === "vi" ? "md:col-span-2" : ""}>
                <Field label="Review VI (Đánh giá chung VI)" wide>
                  <RichTextEditor
                    textStyles={gameConfig.textStyles}
                    value={String(profileObject.review_html_vi ?? "")}
                    onChange={(value) => updateProfileField("review_html_vi", value)}
                  />
                </Field>
              </div>
            )}

            {/* Pros EN / VI */}
            {(languageView === "en" || languageView === "parallel") && (
              <div className={languageView === "en" ? "md:col-span-2" : ""}>
                <StringListEditor
                  label="Pros EN (Ưu điểm EN)"
                  value={form.pros_en}
                  onChange={(value) => updateField("pros_en", value)}
                />
              </div>
            )}
            {(languageView === "vi" || languageView === "parallel") && (
              <div className={languageView === "vi" ? "md:col-span-2" : ""}>
                <StringListEditor
                  label="Pros VI (Ưu điểm VI)"
                  value={form.pros_vi}
                  onChange={(value) => updateField("pros_vi", value)}
                />
              </div>
            )}

            {/* Cons EN / VI */}
            {(languageView === "en" || languageView === "parallel") && (
              <div className={languageView === "en" ? "md:col-span-2" : ""}>
                <StringListEditor
                  label="Cons EN (Nhược điểm EN)"
                  value={form.cons_en}
                  onChange={(value) => updateField("cons_en", value)}
                />
              </div>
            )}
            {(languageView === "vi" || languageView === "parallel") && (
              <div className={languageView === "vi" ? "md:col-span-2" : ""}>
                <StringListEditor
                  label="Cons VI (Nhược điểm VI)"
                  value={form.cons_vi}
                  onChange={(value) => updateField("cons_vi", value)}
                />
              </div>
            )}

            <div className="md:col-span-2">
              <DynamicObjectEditor
                label="Ratings (profile.ratings - Đánh giá thang điểm)"
                value={JSON.stringify(profileObject.ratings ?? {}, null, 2)}
                onChange={(value) => updateProfileField("ratings", JSON.parse(value))}
              />
            </div>
          </div>
        )}

        {activeTab === "stats" && (
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <DynamicArrayEditor
                label="Resonance Builds (Cấu hình Resonance)"
                value={JSON.stringify(profileObject.resonance_builds ?? [], null, 2)}
                onChange={(value) => updateProfileField("resonance_builds", JSON.parse(value))}
                template={{ name: "", stats: [] }}
              />
            </div>

            <div className="md:col-span-2">
              <DynamicArrayEditor
                label="Recommended Psychubes / Items (Mảng vật phẩm khuyên dùng)"
                value={form.recommended_items}
                onChange={(value) => updateField("recommended_items", value)}
                template={{ name_en: "", name_vi: "", image: "", notes_en: "", notes_vi: "" }}
              />
            </div>

            {/* Comments EN / VI */}
            {(languageView === "en" || languageView === "parallel") && (
              <div className={languageView === "en" ? "md:col-span-2" : ""}>
                <Field label="Comments EN (Bình luận EN)" wide>
                  <RichTextEditor
                    textStyles={gameConfig.textStyles}
                    value={String(profileObject.comments_html_en ?? profileObject.comments_html ?? "")}
                    onChange={(value) => updateProfileFields({ comments_html_en: value, comments_html: value })}
                  />
                </Field>
              </div>
            )}
            {(languageView === "vi" || languageView === "parallel") && (
              <div className={languageView === "vi" ? "md:col-span-2" : ""}>
                <Field label="Comments VI (Bình luận VI)" wide>
                  <RichTextEditor
                    textStyles={gameConfig.textStyles}
                    value={String(profileObject.comments_html_vi ?? "")}
                    onChange={(value) => updateProfileField("comments_html_vi", value)}
                  />
                </Field>
              </div>
            )}

            {/* Stats EN / VI */}
            {(languageView === "en" || languageView === "parallel") && (
              <div className={languageView === "en" ? "md:col-span-2" : ""}>
                <Field label="Stats EN (Chỉ số cơ bản EN)" wide>
                  <RichTextEditor
                    textStyles={gameConfig.textStyles}
                    value={String(profileObject.stats_html_en ?? profileObject.stats_html ?? "")}
                    onChange={(value) => updateProfileFields({ stats_html_en: value, stats_html: value })}
                  />
                </Field>
              </div>
            )}
            {(languageView === "vi" || languageView === "parallel") && (
              <div className={languageView === "vi" ? "md:col-span-2" : ""}>
                <Field label="Stats VI (Chỉ số cơ bản VI)" wide>
                  <RichTextEditor
                    textStyles={gameConfig.textStyles}
                    value={String(profileObject.stats_html_vi ?? "")}
                    onChange={(value) => updateProfileField("stats_html_vi", value)}
                  />
                </Field>
              </div>
            )}
          </div>
        )}

        {activeTab === "teams" && (
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <DynamicArrayEditor
                label="Recommended Teams (Đội hình khuyên dùng)"
                value={form.recommended_teams}
                onChange={(value) => updateField("recommended_teams", value)}
                template={{ name: "", members: [], notes: "" }}
                characterOptions={characterOptions}
              />
            </div>
            {/* Synergy EN / VI */}
            {(languageView === "en" || languageView === "parallel") && (
              <div className={languageView === "en" ? "md:col-span-2" : ""}>
                <Field label="Synergy EN (Tương thích đội hình EN)" wide>
                  <RichTextEditor
                    textStyles={gameConfig.textStyles}
                    value={String(profileObject.synergy_html_en ?? profileObject.synergy_html ?? "")}
                    onChange={(value) => updateProfileFields({ synergy_html_en: value, synergy_html: value })}
                  />
                </Field>
              </div>
            )}
            {(languageView === "vi" || languageView === "parallel") && (
              <div className={languageView === "vi" ? "md:col-span-2" : ""}>
                <Field label="Synergy VI (Tương thích đội hình VI)" wide>
                  <RichTextEditor
                    textStyles={gameConfig.textStyles}
                    value={String(profileObject.synergy_html_vi ?? "")}
                    onChange={(value) => updateProfileField("synergy_html_vi", value)}
                  />
                </Field>
              </div>
            )}
          </div>
        )}

        {activeTab === "extras" && (
          <div className="grid gap-5 md:grid-cols-2">
            {/* Lore EN / VI */}
            {(languageView === "en" || languageView === "parallel") && (
              <div className={languageView === "en" ? "md:col-span-2" : ""}>
                <Field label="Lore EN (Truyền thuyết EN)" wide>
                  <RichTextEditor
                    textStyles={gameConfig.textStyles}
                    value={String(profileObject.lore_html_en ?? profileObject.lore_html ?? "")}
                    onChange={(value) => updateProfileFields({ lore_html_en: value, lore_html: value })}
                  />
                </Field>
              </div>
            )}
            {(languageView === "vi" || languageView === "parallel") && (
              <div className={languageView === "vi" ? "md:col-span-2" : ""}>
                <Field label="Lore VI (Truyền thuyết VI)" wide>
                  <RichTextEditor
                    textStyles={gameConfig.textStyles}
                    value={String(profileObject.lore_html_vi ?? "")}
                    onChange={(value) => updateProfileField("lore_html_vi", value)}
                  />
                </Field>
              </div>
            )}

            <div className="md:col-span-2">
              <DynamicObjectEditor
                label="Euphoria (Hiệu ứng đặc biệt Euphoria)"
                value={form.euphoria}
                onChange={(value) => updateField("euphoria", value)}
              />
            </div>

            <div className="md:col-span-2">
              <DynamicArrayEditor
                label="Portray (Bản đồ sao / Constellation)"
                value={form.portray}
                onChange={(value) => updateField("portray", value)}
                template={{ level: 1, description: "" }}
              />
            </div>

            <div className="md:col-span-2">
              <DynamicArrayEditor
                label="Gallery (Bộ sưu tập hình ảnh)"
                value={form.gallery}
                onChange={(value) => updateField("gallery", value)}
                template={{ name: "", image: "" }}
              />
            </div>

            {/* Beginner Notes EN / VI */}
            {(languageView === "en" || languageView === "parallel") && (
              <div className={languageView === "en" ? "md:col-span-2" : ""}>
                <Field label="Beginner Notes EN" wide>
                  <RichTextEditor
                    textStyles={gameConfig.textStyles}
                    value={form.beginner_notes_en ?? ""}
                    onChange={(value) => updateField("beginner_notes_en", value)}
                  />
                </Field>
              </div>
            )}
            {(languageView === "vi" || languageView === "parallel") && (
              <div className={languageView === "vi" ? "md:col-span-2" : ""}>
                <Field label="Beginner Notes VI" wide>
                  <RichTextEditor
                    textStyles={gameConfig.textStyles}
                    value={form.beginner_notes_vi ?? ""}
                    onChange={(value) => updateField("beginner_notes_vi", value)}
                  />
                </Field>
              </div>
            )}
          </div>
        )}

        {activeTab === "raw" && (
          <div className="space-y-4">
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={copyToClipboard}
                className="rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-750 hover:bg-gray-50 dark:border-[#2e3e5a] dark:bg-[#1a2336] dark:text-[#a0aec0] dark:hover:bg-[#222e47] transition animate-fadeIn"
              >
                Copy JSON
              </button>
            </div>
            <textarea
              className="min-h-[500px] w-full rounded-xl border border-gray-300 bg-gray-955 px-4 py-3.5 font-mono text-xs leading-relaxed text-gray-100 shadow-theme-xs focus:border-brand-500 focus:outline-hidden dark:border-[#1e293b] dark:bg-[#0c101a] dark:text-white"
              value={rawJson}
              onChange={(event) => setRawJson(event.target.value)}
            />
            <button
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-[#2e3e5a] dark:bg-[#1a2336] dark:text-gray-300 dark:hover:bg-white/[0.04] transition shadow-xs"
              type="button"
              onClick={applyRawJson}
            >
              Áp dụng JSON vào form
            </button>
          </div>
        )}
      </section>

      {editingSkill && (
        <div
          className="fixed inset-0 z-999999 flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4 py-6"
          role="dialog"
          aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) setEditingSkill(null); }}
        >
          <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-2xl dark:border-gray-200 my-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gray-100">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingSkill.index === -1 ? "Add New Skill" : "Edit Skill"}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                  Fill in both English and Vietnamese descriptions for bilingual support.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingSkill(null)}
                className="rounded-lg p-2 text-gray-400 hover:text-white hover:bg-gray-200 transition"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Name, Type & Image — always visible */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Skill Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingSkill.name}
                    onChange={(e) => setEditingSkill({ ...editingSkill, name: e.target.value })}
                    placeholder="e.g. WindsongErta"
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-3 focus:ring-brand-500/10 dark:border-[#2e3e5a] dark:bg-[#0c101a] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Skill Type *
                  </label>
                  <select
                    value={editingSkill.type}
                    onChange={(e) => setEditingSkill({ ...editingSkill, type: e.target.value })}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-3 focus:ring-brand-500/10 dark:border-[#2e3e5a] dark:bg-[#0c101a] dark:text-white"
                  >
                    <option value="Incantation">Incantation</option>
                    <option value="Ultimate">Ultimate</option>
                    <option value="Passive">Passive</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Image URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://... or /re1999/skills/..."
                    value={editingSkill.image}
                    onChange={(e) => setEditingSkill({ ...editingSkill, image: e.target.value })}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-3 focus:ring-brand-500/10 dark:border-[#2e3e5a] dark:bg-[#0c101a] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
                  />
                </div>
              </div>

              {/* Language Tab Switcher */}
              <div className="border-t border-gray-150 pt-5 dark:border-[#1e293b]">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 mr-2">Language:</span>
                  {(["en", "vi"] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setSkillLangTab(lang)}
                      className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wide transition ${
                        skillLangTab === lang
                          ? "bg-brand-500 text-white shadow-sm"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-[#1a2236] dark:text-gray-400 dark:hover:bg-[#222e47]"
                      }`}
                    >
                      {lang === "en" ? "🇺🇸 English" : "🇻🇳 Tiếng Việt"}
                    </button>
                  ))}
                </div>

                {/* Description — bilingual */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Description ({skillLangTab === "en" ? "English" : "Tiếng Việt"})
                  </label>
                  <RichTextEditor
                    textStyles={gameConfig.textStyles}
                    value={skillLangTab === "en" ? editingSkill.description_en : editingSkill.description_vi}
                    onChange={(val) => {
                      if (skillLangTab === "en") {
                        setEditingSkill({ ...editingSkill, description_en: val });
                      } else {
                        setEditingSkill({ ...editingSkill, description_vi: val });
                      }
                    }}
                  />
                </div>
              </div>

              {/* Incantation Levels — bilingual */}
              <div className="border-t border-gray-150 pt-5 dark:border-[#1e293b]">
                <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                  <span>Incantation Levels</span>
                  <span className="text-xs font-normal text-gray-500 dark:text-gray-500">(1★, 2★, 3★)</span>
                </h4>
                <div className="space-y-3">
                  {[1, 2, 3].map((lvlNum) => {
                    const existingLvl = editingSkill.levels.find((l) => l.level === lvlNum);
                    const lvlValEN = existingLvl?.description_en ?? "";
                    const lvlValVI = existingLvl?.description_vi ?? "";
                    const currentVal = skillLangTab === "en" ? lvlValEN : lvlValVI;
                    return (
                      <div key={lvlNum} className="flex gap-3 items-start">
                        <div className="flex flex-col items-center shrink-0 pt-2.5">
                          <span className="text-sm font-bold text-brand-400">
                            {lvlNum === 1 ? "✦✧✧" : lvlNum === 2 ? "✦✦✧" : "✦✦✦"}
                          </span>
                          <span className="text-[10px] text-gray-500 dark:text-gray-600 mt-0.5">Lv.{lvlNum}</span>
                        </div>
                        <textarea
                          placeholder={`${skillLangTab === "en" ? "Description for" : "Mô tả cho"} ${lvlNum}★...`}
                          value={currentVal}
                          rows={2}
                          onChange={(e) => {
                            const newLevels = [...editingSkill.levels];
                            const idx = newLevels.findIndex((l) => l.level === lvlNum);
                            const field = skillLangTab === "en" ? "description_en" : "description_vi";
                            if (idx !== -1) {
                              newLevels[idx] = { ...newLevels[idx], [field]: e.target.value };
                            } else {
                              newLevels.push({ level: lvlNum, description_en: "", description_vi: "", [field]: e.target.value });
                            }
                            setEditingSkill({ ...editingSkill, levels: newLevels });
                          }}
                          className="w-full rounded-lg border border-gray-300 bg-transparent p-3 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-3 focus:ring-brand-500/10 dark:border-[#2e3e5a] dark:bg-[#0c101a] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 resize-y"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modifier Effects — bilingual */}
              <div className="border-t border-gray-150 pt-5 dark:border-[#1e293b]">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-gray-800 dark:text-white">
                    Modifier Effects
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingSkill({
                        ...editingSkill,
                        modifier_effects: [
                          ...editingSkill.modifier_effects,
                          { term: "", description_en: "", description_vi: "" }
                        ]
                      });
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200 dark:bg-[#1a2236] dark:text-gray-300 dark:hover:bg-[#222e47] transition border border-gray-200 dark:border-[#1e293b]"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Effect
                  </button>
                </div>
                {editingSkill.modifier_effects.length === 0 ? (
                  <p className="text-xs text-gray-500 dark:text-gray-500 italic py-3 text-center rounded-lg border border-dashed border-gray-300 dark:border-[#1e293b]">
                    No modifier effects configured. Click &quot;Add Effect&quot; to create one.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {editingSkill.modifier_effects.map((eff, effIdx) => (
                      <div key={effIdx} className="flex gap-2 items-start rounded-lg border border-gray-200 bg-gray-50/50 p-3 dark:border-[#1e293b] dark:bg-[#131926]">
                        <div className="grid gap-2 flex-1 sm:grid-cols-[120px_1fr]">
                          <input
                            type="text"
                            placeholder="Keyword"
                            value={eff.term}
                            onChange={(e) => {
                              const list = [...editingSkill.modifier_effects];
                              list[effIdx] = { ...list[effIdx], term: e.target.value };
                              setEditingSkill({ ...editingSkill, modifier_effects: list });
                            }}
                            className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-xs font-semibold text-gray-800 outline-none focus:border-brand-500 focus:ring-3 focus:ring-brand-500/10 dark:border-[#2e3e5a] dark:bg-[#0c101a] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
                          />
                          <input
                            type="text"
                            placeholder={skillLangTab === "en" ? "Effect description (EN)" : "Mô tả hiệu ứng (VI)"}
                            value={skillLangTab === "en" ? (eff.description_en || "") : (eff.description_vi || "")}
                            onChange={(e) => {
                              const list = [...editingSkill.modifier_effects];
                              const field = skillLangTab === "en" ? "description_en" : "description_vi";
                              list[effIdx] = { ...list[effIdx], [field]: e.target.value };
                              setEditingSkill({ ...editingSkill, modifier_effects: list });
                            }}
                            className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-xs text-gray-800 outline-none focus:border-brand-500 focus:ring-3 focus:ring-brand-500/10 dark:border-[#2e3e5a] dark:bg-[#0c101a] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const list = [...editingSkill.modifier_effects];
                            list.splice(effIdx, 1);
                            setEditingSkill({ ...editingSkill, modifier_effects: list });
                          }}
                          className="shrink-0 p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition mt-0.5"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4 bg-gray-100">
              <button
                type="button"
                onClick={() => setEditingSkill(null)}
                className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-400 hover:text-white hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!editingSkill.name.trim()) {
                    alert("Skill name is required.");
                    return;
                  }
                  
                  // Clean up levels
                  const cleanedLevels = editingSkill.levels
                    .map((l) => ({
                      level: l.level,
                      description_en: l.description_en?.trim() || "",
                      description_vi: l.description_vi?.trim() || ""
                    }))
                    .filter((l) => l.description_en !== "" || l.description_vi !== "");
                  
                  // Clean up modifier effects
                  const cleanedModifiers = editingSkill.modifier_effects
                    .map((e) => ({
                      term: e.term.trim(),
                      description_en: e.description_en?.trim() || "",
                      description_vi: e.description_vi?.trim() || ""
                    }))
                    .filter((e) => e.term !== "");

                  const updatedSkill = {
                    name: editingSkill.name.trim(),
                    type: editingSkill.type,
                    image: editingSkill.image.trim() || null,
                    description_en: editingSkill.description_en?.trim() || "",
                    description_vi: editingSkill.description_vi?.trim() || "",
                    levels: cleanedLevels,
                    modifier_effects: cleanedModifiers
                  };

                  const list = [...skillsArray];
                  if (editingSkill.index === -1) {
                    list.push(updatedSkill);
                  } else {
                    list[editingSkill.index] = updatedSkill;
                  }
                  
                  updateSkillsArray(list);
                  setEditingSkill(null);
                }}
                className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 transition shadow-sm"
              >
                {editingSkill.index === -1 ? "Add Skill" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CharacterContentEditorPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    }>
      <CharacterContentEditor />
    </Suspense>
  );
}
