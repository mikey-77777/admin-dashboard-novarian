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
    subItems: [{ name: "Ecommerce", path: "/", pro: false }],
  },
  {
    icon: <CalenderIcon />,
    name: "Calendar",
    path: "/calendar",
  },
  {
    icon: <UserCircleIcon />,
    name: "User Profile",
    path: "/profile",
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

  {
    name: "Forms",
    icon: <ListIcon />,
    subItems: [{ name: "Form Elements", path: "/form-elements", pro: false }],
  },
  {
    name: "Tables",
    icon: <TableIcon />,
    subItems: [{ name: "Basic Tables", path: "/basic-tables", pro: false }],
  },
  {
    name: "Pages",
    icon: <PageIcon />,
    subItems: [
      { name: "Blank Page", path: "/blank", pro: false },
      { name: "404 Error", path: "/error-404", pro: false },
    ],
  },
];

const othersItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Charts",
    subItems: [
      { name: "Line Chart", path: "/line-chart", pro: false },
      { name: "Bar Chart", path: "/bar-chart", pro: false },
    ],
  },
  {
    icon: <BoxCubeIcon />,
    name: "UI Elements",
    subItems: [
      { name: "Alerts", path: "/alerts", pro: false },
      { name: "Avatar", path: "/avatars", pro: false },
      { name: "Badge", path: "/badge", pro: false },
      { name: "Buttons", path: "/buttons", pro: false },
      { name: "Images", path: "/images", pro: false },
      { name: "Videos", path: "/videos", pro: false },
    ],
  },
  {
    icon: <PlugInIcon />,
    name: "Authentication",
    subItems: [
      { name: "Sign In", path: "/signin", pro: false },
      { name: "Sign Up", path: "/signup", pro: false },
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

  for (const menuType of ["main", "others"] as const) {
    const items = menuType === "main" ? navItems : othersItems;
    const index = items.findIndex((nav) =>
      nav.subItems ? hasActiveSubItem(nav.subItems, isActivePath) : false
    );

    if (index !== -1) return { type: menuType, index };
  }

  return null;
}

function findActiveNestedSubmenus(pathname: string) {
  const isActivePath = (path: string) => path === pathname;
  const openItems: Record<string, boolean> = {};

  (["main", "others"] as const).forEach((menuType) => {
    const items = menuType === "main" ? navItems : othersItems;
    items.forEach((nav, index) => {
      nav.subItems?.forEach((subItem) => {
        if (subItem.subItems && hasActiveSubItem(subItem.subItems, isActivePath)) {
          openItems[`${menuType}-${index}-${subItem.name}`] = true;
        }
      });
    });
  });

  return openItems;
}

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const renderMenuItems = (
    navItems: NavItem[],
    menuType: "main" | "others"
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
    type: "main" | "others";
    index: number;
  } | null>(() => findActiveSubmenu(pathname));
  const [openNestedSubmenus, setOpenNestedSubmenus] = useState<Record<string, boolean>>(
    () => findActiveNestedSubmenus(pathname)
  );

  // const isActive = (path: string) => path === pathname;
   const isActive = (path: string) => path === pathname;

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
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
        className={`py-8 flex  ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={150}
                height={40}
              />
              <Image
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <Image
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
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

            <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Others"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div>
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;
