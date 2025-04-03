import * as React from "react";
import { cn } from "@/lib/utils";

export interface Button1Props
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

    export const Button1 = React.forwardRef<HTMLButtonElement, Button1Props>(
    ({ className, children, ...props }, ref) => {
        return (
        <button
            ref={ref}
            className={cn(
            "group relative overflow-hidden bg-neutral-800 text-gray-50 font-bold border text-left px-4 py-3 text-base rounded-lg transition-all duration-500",
            "hover:border-green-400 hover:text-green-400",
            "before:absolute before:w-12 before:h-12 before:right-1 before:top-1 before:z-10 before:bg-blue-900 before:rounded-full before:blur-lg before:content-['']",
            "after:absolute after:z-10 after:w-20 after:h-20 after:bg-green-400 after:right-8 after:top-3 after:rounded-full after:blur-lg after:content-['']",
            "hover:before:right-12 hover:before:-bottom-8 hover:after:-right-8 hover:before:[box-shadow:_20px_20px_20px_30px_#1e3a8a]",
            className
            )}
            {...props}
        >
            {children}
        </button>
        );
    }
);

Button1.displayName = "Button1";
