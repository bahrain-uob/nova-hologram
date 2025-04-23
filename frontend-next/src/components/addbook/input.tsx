import * as React from "react";

import { cn } from "../../lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
            "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
            "!border !border-[#E4E4E7]",
            className
          )}
          
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
