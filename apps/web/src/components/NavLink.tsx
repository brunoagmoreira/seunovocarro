"use client";

import { forwardRef } from "react";
import Link, { LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavLinkProps extends Omit<LinkProps, "className"> {
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
  // Match React Router's 'to' prop for backward compatibility if needed, 
  // but next/link uses 'href'. We'll handle both.
  to?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ className, activeClassName, href, to, ...props }, ref) => {
    const pathname = usePathname();
    const finalHref = href || to || "#";
    const isActive = pathname === finalHref || (typeof finalHref === "string" && finalHref !== "/" && pathname.startsWith(finalHref));

    return (
      <Link
        ref={ref}
        href={finalHref}
        className={cn(className, isActive && activeClassName)}
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
