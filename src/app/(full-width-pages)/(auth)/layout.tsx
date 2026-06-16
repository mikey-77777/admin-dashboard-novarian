import GridShape from "@/components/common/GridShape";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";

import { ThemeProvider } from "@/context/ThemeContext";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <ThemeProvider>
        <div className="relative flex lg:flex-row w-full h-screen justify-center flex-col  dark:bg-gray-900 sm:p-0">
          {children}
          <div className="lg:w-1/2 w-full h-full bg-brand-950 dark:bg-white/5 lg:grid items-center hidden">
            <div className="relative items-center justify-center  flex z-1">
              {/* <!-- ===== Common Grid Shape Start ===== --> */}
              <GridShape />
              <div className="flex flex-col items-center max-w-xs">
                <Link href="/" className="block mb-4">
                  <div className="relative mx-auto flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white/15 bg-black">
                    <Image
                      src="/images/logo/inverdra-logo.png"
                      alt="Inverdra Logo"
                      width={80}
                      height={80}
                      className="h-16 w-16 object-contain"
                    />
                  </div>
                </Link>
                <div className="mt-4 mb-2">
                  <Image
                    src="/images/logo/inverdra-text.png"
                    alt="Inverdra"
                    width={260}
                    height={30}
                    className="h-[30px] w-[260px] object-contain"
                    priority
                  />
                </div>
                <p className="text-center text-gray-400 text-xs">
                  Invert The Luck, Master The Meta
                </p>
              </div>
            </div>
          </div>
          <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
            <ThemeTogglerTwo />
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
}
