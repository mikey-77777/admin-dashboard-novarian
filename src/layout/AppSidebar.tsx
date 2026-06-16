"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  DocsIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
} from "../icons/index";
import SidebarWidget from "./SidebarWidget";
import { CornerBottomLeft } from "../components/CornerDecoration";

type NavSubItem = {
  name: string;
  path?: string;
  pro?: boolean;
  new?: boolean;
  subItems?: NavSubItem[];
};

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: NavSubItem[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/",
  },
  {
    icon: <DocsIcon />,
    name: "Content",
    subItems: [
      {
        name: "Reverse: 1999",
        subItems: [
          { name: "Characters", path: "/content/re1999/characters", pro: false },
          { name: "Psychubes", path: "/content/re1999/psychubes", pro: false },
          { name: "Teams database", path: "/content/re1999/teams-database", pro: false },
          { name: "Tier List", path: "/content/re1999/tier-list", pro: false },
          { name: "Team Tier List", path: "/content/re1999/team-tier-list", pro: false },
          { name: "Guides", path: "/content/re1999/guides", pro: false },
          { name: "News", path: "/content/re1999/news", pro: false },
        ],
      },
      {
        name: "Epic Seven",
        subItems: [
          { name: "Characters", path: "/content/epic7/characters", pro: false },
          { name: "Artifacts", path: "/content/epic7/artifacts", pro: false },
          { name: "Teams database", path: "/content/epic7/teams-database", pro: false },
          { name: "Tier List", path: "/content/epic7/tier-list", pro: false },
          { name: "Team Tier List", path: "/content/epic7/team-tier-list", pro: false },
          { name: "Guides", path: "/content/epic7/guides", pro: false },
          { name: "News", path: "/content/epic7/news", pro: false },
        ],
      },
    ],
  },
];

function hasActiveSubItem(
  subItems: NavSubItem[],
  isActivePath: (path: string) => boolean
): boolean {
  return subItems.some((subItem) => {
    if (subItem.path && isActivePath(subItem.path)) return true;
    return subItem.subItems ? hasActiveSubItem(subItem.subItems, isActivePath) : false;
  });
}

function findActiveSubmenu(pathname: string) {
  const isActivePath = (path: string) => path === pathname;
  const index = navItems.findIndex((nav) =>
    nav.subItems ? hasActiveSubItem(nav.subItems, isActivePath) : false
  );
  if (index !== -1) return { type: "main" as const, index };
  return null;
}

function findActiveNestedSubmenus(pathname: string) {
  const isActivePath = (path: string) => path === pathname;
  const openItems: Record<string, boolean> = {};

  navItems.forEach((nav, index) => {
    nav.subItems?.forEach((subItem) => {
      if (subItem.subItems && hasActiveSubItem(subItem.subItems, isActivePath)) {
        openItems[`main-${index}-${subItem.name}`] = true;
      }
    });
  });

  return openItems;
}

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const renderMenuItems = (
    navItems: NavItem[],
    menuType: "main"
  ) => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group  ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={` ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className={`menu-item-text`}>{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200  ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className={`menu-item-text`}>{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-200 ease-out ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <ul className="min-h-0 overflow-hidden mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    {subItem.subItems ? (
                        <div>
                        <button
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/[0.04]"
                          type="button"
                          onClick={() => handleNestedSubmenuToggle(`${menuType}-${index}-${subItem.name}`)}
                        >
                          <span>{subItem.name}</span>
                          <ChevronDownIcon
                            className={`ml-auto h-4 w-4 transition-transform ${
                              openNestedSubmenus[`${menuType}-${index}-${subItem.name}`]
                                ? "rotate-180 text-brand-500"
                                : ""
                            }`}
                          />
                        </button>
                        <div
                          className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-200 ease-out ${
                            openNestedSubmenus[`${menuType}-${index}-${subItem.name}`]
                              ? "grid-rows-[1fr] opacity-100"
                              : "grid-rows-[0fr] opacity-0"
                          }`}
                        >
                          <ul className="min-h-0 overflow-hidden ml-3 space-y-1 border-l border-gray-200 pl-3 dark:border-gray-800">
                            {subItem.subItems.map((childItem) => (
                              <li key={childItem.name}>
                                {childItem.path && (
                                  <Link
                                    href={childItem.path}
                                    className={`menu-dropdown-item ${
                                      isActive(childItem.path)
                                        ? "menu-dropdown-item-active"
                                        : "menu-dropdown-item-inactive"
                                    }`}
                                  >
                                    {childItem.name}
                                    <span className="flex items-center gap-1 ml-auto">
                                      {childItem.new && (
                                        <span
                                          className={`ml-auto ${
                                            isActive(childItem.path)
                                              ? "menu-dropdown-badge-active"
                                              : "menu-dropdown-badge-inactive"
                                          } menu-dropdown-badge `}
                                        >
                                          new
                                        </span>
                                      )}
                                      {childItem.pro && (
                                        <span
                                          className={`ml-auto ${
                                            isActive(childItem.path)
                                              ? "menu-dropdown-badge-active"
                                              : "menu-dropdown-badge-inactive"
                                          } menu-dropdown-badge `}
                                        >
                                          pro
                                        </span>
                                      )}
                                    </span>
                                  </Link>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      subItem.path && (
                        <Link
                          href={subItem.path}
                          className={`menu-dropdown-item ${
                            isActive(subItem.path)
                              ? "menu-dropdown-item-active"
                              : "menu-dropdown-item-inactive"
                          }`}
                        >
                          {subItem.name}
                          <span className="flex items-center gap-1 ml-auto">
                            {subItem.new && (
                              <span
                                className={`ml-auto ${
                                  isActive(subItem.path)
                                    ? "menu-dropdown-badge-active"
                                    : "menu-dropdown-badge-inactive"
                                } menu-dropdown-badge `}
                              >
                                new
                              </span>
                            )}
                            {subItem.pro && (
                              <span
                                className={`ml-auto ${
                                  isActive(subItem.path)
                                    ? "menu-dropdown-badge-active"
                                    : "menu-dropdown-badge-inactive"
                                } menu-dropdown-badge `}
                              >
                                pro
                              </span>
                            )}
                          </span>
                        </Link>
                      )
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main";
    index: number;
  } | null>(() => findActiveSubmenu(pathname));
  const [openNestedSubmenus, setOpenNestedSubmenus] = useState<Record<string, boolean>>(
    () => findActiveNestedSubmenus(pathname)
  );

  // const isActive = (path: string) => path === pathname;
   const isActive = (path: string) => path === pathname;

  const handleSubmenuToggle = (index: number, menuType: "main") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const handleNestedSubmenuToggle = (key: string) => {
    setOpenNestedSubmenus((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-6 flex items-center border-b border-gray-200 dark:border-gray-800 ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/" className="flex items-center gap-1.5">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
            <Image
              src="/images/logo/inverdra-logo.png"
              alt="Inverdra Logo"
              width={48}
              height={48}
              className="h-10 w-10 object-contain"
            />
          </div>
          {(isExpanded || isHovered || isMobileOpen) && (
            <div className="flex min-w-0 flex-col justify-center gap-1 pt-0.5">
              <Image
                src="/images/logo/inverdra-text.png"
                alt="Inverdra Logo"
                width={158}
                height={18}
                className="h-[18px] w-[158px] object-contain object-left"
                priority
              />
              <span className="pl-0.5 text-[10.5px] font-medium leading-none tracking-[0.08em] text-gray-500 dark:text-gray-400">
                Invert The Luck
              </span>
            </div>
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>

            {/* Removed unused Others section */}
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
      <CornerBottomLeft />
    </aside>
  );
};

export default AppSidebar;
