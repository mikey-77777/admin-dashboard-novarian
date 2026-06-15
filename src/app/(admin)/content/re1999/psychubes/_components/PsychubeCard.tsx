"use client";

import type { Psychube } from "./types";

export default function PsychubeCard({
  psychube,
  onClick,
  onEdit,
}: {
  psychube: Psychube;
  onClick: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-theme-xs transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-lg dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-brand-500/30">
      
      {/* Quick Edit Button (Floating in top-right, visible on hover) */}
      <button
        type="button"
        title={`Edit ${psychube.name}`}
        onClick={(event) => {
          event.stopPropagation();
          onEdit();
        }}
        className="absolute top-2.5 right-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 text-gray-500 shadow-sm transition-all duration-200 hover:bg-brand-500 hover:text-white md:opacity-0 md:group-hover:opacity-100 dark:bg-gray-900/90 dark:text-gray-400 dark:hover:bg-brand-500 dark:hover:text-white cursor-pointer"
      >
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
          />
        </svg>
      </button>

      {/* Card Click Area for Details */}
      <button
        type="button"
        onClick={onClick}
        className="flex w-full flex-col text-left focus:outline-none cursor-pointer"
      >
        {/* Psychube Image Container */}
        <div className="relative aspect-square w-full overflow-hidden bg-gray-50 dark:bg-gray-900/50">
          {psychube.image ? (
            <img
              src={psychube.image}
              alt={psychube.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800">
              <span className="text-3xl font-extrabold text-brand-500/30 dark:text-brand-500/20">
                {psychube.name.charAt(0)}
              </span>
            </div>
          )}

          {/* Rarity Star Rating Overlay in bottom corner */}
          <div className="absolute bottom-2 left-2 flex items-center rounded-md bg-gray-950/70 px-2 py-0.5 text-[10px] font-bold text-yellow-400 shadow-sm backdrop-blur-xs">
            {psychube.rarity}★
          </div>
        </div>

        {/* Info Area */}
        <div className="flex flex-1 flex-col p-3.5">
          <h3 className="line-clamp-2 text-sm font-semibold text-gray-800 transition-colors group-hover:text-brand-500 dark:text-white/90 dark:group-hover:text-brand-400">
            {psychube.name}
          </h3>
          
          {/* Subtags / Info */}
          <div className="mt-2 flex flex-wrap gap-1">
            {psychube.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-sm bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-white/[0.04] dark:text-gray-400"
              >
                {tag}
              </span>
            ))}
            {psychube.release_patch && (
              <span className="ml-auto text-[10px] font-medium text-gray-400 dark:text-gray-500">
                v{psychube.release_patch}
              </span>
            )}
          </div>
        </div>
      </button>

    </div>
  );
}
