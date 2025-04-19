"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.badgeVariants = void 0;
exports.Badge = Badge;
const React = __importStar(require("react"));
const react_slot_1 = require("@radix-ui/react-slot");
const class_variance_authority_1 = require("class-variance-authority");
const utils_1 = require("../../lib/utils");
const badgeVariants = (0, class_variance_authority_1.cva)("inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden", {
    variants: {
        variant: {
            default: "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
            secondary: "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
            destructive: "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
            outline: "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        },
    },
    defaultVariants: {
        variant: "default",
    },
});
exports.badgeVariants = badgeVariants;
function Badge({ className, variant, asChild = false, ...props }) {
    const Comp = asChild ? react_slot_1.Slot : "span";
    return (React.createElement(Comp, { "data-slot": "badge", className: (0, utils_1.cn)(badgeVariants({ variant }), className), ...props }));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFkZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJiYWRnZS50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBNkNTLHNCQUFLO0FBN0NkLDZDQUE4QjtBQUM5QixxREFBMkM7QUFDM0MsdUVBQWlFO0FBRWpFLHVDQUFnQztBQUVoQyxNQUFNLGFBQWEsR0FBRyxJQUFBLDhCQUFHLEVBQ3ZCLGdaQUFnWixFQUNoWjtJQUNFLFFBQVEsRUFBRTtRQUNSLE9BQU8sRUFBRTtZQUNQLE9BQU8sRUFDTCxnRkFBZ0Y7WUFDbEYsU0FBUyxFQUNQLHNGQUFzRjtZQUN4RixXQUFXLEVBQ1QsMktBQTJLO1lBQzdLLE9BQU8sRUFDTCx3RUFBd0U7U0FDM0U7S0FDRjtJQUNELGVBQWUsRUFBRTtRQUNmLE9BQU8sRUFBRSxTQUFTO0tBQ25CO0NBQ0YsQ0FDRixDQUFBO0FBb0JlLHNDQUFhO0FBbEI3QixTQUFTLEtBQUssQ0FBQyxFQUNiLFNBQVMsRUFDVCxPQUFPLEVBQ1AsT0FBTyxHQUFHLEtBQUssRUFDZixHQUFHLEtBQUssRUFFa0Q7SUFDMUQsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxpQkFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUE7SUFFcEMsT0FBTyxDQUNMLG9CQUFDLElBQUksaUJBQ08sT0FBTyxFQUNqQixTQUFTLEVBQUUsSUFBQSxVQUFFLEVBQUMsYUFBYSxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxTQUFTLENBQUMsS0FDaEQsS0FBSyxHQUNULENBQ0gsQ0FBQTtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tIFwicmVhY3RcIlxuaW1wb3J0IHsgU2xvdCB9IGZyb20gXCJAcmFkaXgtdWkvcmVhY3Qtc2xvdFwiXG5pbXBvcnQgeyBjdmEsIHR5cGUgVmFyaWFudFByb3BzIH0gZnJvbSBcImNsYXNzLXZhcmlhbmNlLWF1dGhvcml0eVwiXG5cbmltcG9ydCB7IGNuIH0gZnJvbSBcIkAvbGliL3V0aWxzXCJcblxuY29uc3QgYmFkZ2VWYXJpYW50cyA9IGN2YShcbiAgXCJpbmxpbmUtZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgcm91bmRlZC1tZCBib3JkZXIgcHgtMiBweS0wLjUgdGV4dC14cyBmb250LW1lZGl1bSB3LWZpdCB3aGl0ZXNwYWNlLW5vd3JhcCBzaHJpbmstMCBbJj5zdmddOnNpemUtMyBnYXAtMSBbJj5zdmddOnBvaW50ZXItZXZlbnRzLW5vbmUgZm9jdXMtdmlzaWJsZTpib3JkZXItcmluZyBmb2N1cy12aXNpYmxlOnJpbmctcmluZy81MCBmb2N1cy12aXNpYmxlOnJpbmctWzNweF0gYXJpYS1pbnZhbGlkOnJpbmctZGVzdHJ1Y3RpdmUvMjAgZGFyazphcmlhLWludmFsaWQ6cmluZy1kZXN0cnVjdGl2ZS80MCBhcmlhLWludmFsaWQ6Ym9yZGVyLWRlc3RydWN0aXZlIHRyYW5zaXRpb24tW2NvbG9yLGJveC1zaGFkb3ddIG92ZXJmbG93LWhpZGRlblwiLFxuICB7XG4gICAgdmFyaWFudHM6IHtcbiAgICAgIHZhcmlhbnQ6IHtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBcImJvcmRlci10cmFuc3BhcmVudCBiZy1wcmltYXJ5IHRleHQtcHJpbWFyeS1mb3JlZ3JvdW5kIFthJl06aG92ZXI6YmctcHJpbWFyeS85MFwiLFxuICAgICAgICBzZWNvbmRhcnk6XG4gICAgICAgICAgXCJib3JkZXItdHJhbnNwYXJlbnQgYmctc2Vjb25kYXJ5IHRleHQtc2Vjb25kYXJ5LWZvcmVncm91bmQgW2EmXTpob3ZlcjpiZy1zZWNvbmRhcnkvOTBcIixcbiAgICAgICAgZGVzdHJ1Y3RpdmU6XG4gICAgICAgICAgXCJib3JkZXItdHJhbnNwYXJlbnQgYmctZGVzdHJ1Y3RpdmUgdGV4dC13aGl0ZSBbYSZdOmhvdmVyOmJnLWRlc3RydWN0aXZlLzkwIGZvY3VzLXZpc2libGU6cmluZy1kZXN0cnVjdGl2ZS8yMCBkYXJrOmZvY3VzLXZpc2libGU6cmluZy1kZXN0cnVjdGl2ZS80MCBkYXJrOmJnLWRlc3RydWN0aXZlLzYwXCIsXG4gICAgICAgIG91dGxpbmU6XG4gICAgICAgICAgXCJ0ZXh0LWZvcmVncm91bmQgW2EmXTpob3ZlcjpiZy1hY2NlbnQgW2EmXTpob3Zlcjp0ZXh0LWFjY2VudC1mb3JlZ3JvdW5kXCIsXG4gICAgICB9LFxuICAgIH0sXG4gICAgZGVmYXVsdFZhcmlhbnRzOiB7XG4gICAgICB2YXJpYW50OiBcImRlZmF1bHRcIixcbiAgICB9LFxuICB9XG4pXG5cbmZ1bmN0aW9uIEJhZGdlKHtcbiAgY2xhc3NOYW1lLFxuICB2YXJpYW50LFxuICBhc0NoaWxkID0gZmFsc2UsXG4gIC4uLnByb3BzXG59OiBSZWFjdC5Db21wb25lbnRQcm9wczxcInNwYW5cIj4gJlxuICBWYXJpYW50UHJvcHM8dHlwZW9mIGJhZGdlVmFyaWFudHM+ICYgeyBhc0NoaWxkPzogYm9vbGVhbiB9KSB7XG4gIGNvbnN0IENvbXAgPSBhc0NoaWxkID8gU2xvdCA6IFwic3BhblwiXG5cbiAgcmV0dXJuIChcbiAgICA8Q29tcFxuICAgICAgZGF0YS1zbG90PVwiYmFkZ2VcIlxuICAgICAgY2xhc3NOYW1lPXtjbihiYWRnZVZhcmlhbnRzKHsgdmFyaWFudCB9KSwgY2xhc3NOYW1lKX1cbiAgICAgIHsuLi5wcm9wc31cbiAgICAvPlxuICApXG59XG5cbmV4cG9ydCB7IEJhZGdlLCBiYWRnZVZhcmlhbnRzIH1cbiJdfQ==