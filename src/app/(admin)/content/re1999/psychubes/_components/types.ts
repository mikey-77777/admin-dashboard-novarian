export const PSYCHUBE_TAGS = ["ATK", "Survival", "Critical", "Support", "Heal"] as const;
export type PsychubeTag = typeof PSYCHUBE_TAGS[number];

export type PsychubeAmplification = {
  level: number;
  description: string;
};

export type PsychubeStat = {
  name: string;
  level_1: string;
  level_60: string;
};

export type Psychube = {
  id: string;
  slug: string;
  name: string;
  image: string | null;
  rarity: number;
  amplifications: PsychubeAmplification[];
  stats: PsychubeStat[];
  impression: string;
  tags: string[];
  release_patch: string;
  updated_at?: string;
};

export type PsychubePayload = Omit<Psychube, "id" | "updated_at">;
