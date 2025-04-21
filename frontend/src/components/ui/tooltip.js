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
exports.Tooltip = Tooltip;
exports.TooltipTrigger = TooltipTrigger;
exports.TooltipContent = TooltipContent;
exports.TooltipProvider = TooltipProvider;
const React = __importStar(require("react"));
const TooltipPrimitive = __importStar(require("@radix-ui/react-tooltip"));
const utils_1 = require("../../lib/utils");
function TooltipProvider({ delayDuration = 0, ...props }) {
    return (React.createElement(TooltipPrimitive.Provider, { "data-slot": "tooltip-provider", delayDuration: delayDuration, ...props }));
}
function Tooltip({ ...props }) {
    return (React.createElement(TooltipProvider, null,
        React.createElement(TooltipPrimitive.Root, { "data-slot": "tooltip", ...props })));
}
function TooltipTrigger({ ...props }) {
    return React.createElement(TooltipPrimitive.Trigger, { "data-slot": "tooltip-trigger", ...props });
}
function TooltipContent({ className, sideOffset = 0, children, ...props }) {
    return (React.createElement(TooltipPrimitive.Portal, null,
        React.createElement(TooltipPrimitive.Content, { "data-slot": "tooltip-content", sideOffset: sideOffset, className: (0, utils_1.cn)("bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance", className), ...props },
            children,
            React.createElement(TooltipPrimitive.Arrow, { className: "bg-primary fill-primary z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" }))));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9vbHRpcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInRvb2x0aXAudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBMERTLDBCQUFPO0FBQUUsd0NBQWM7QUFBRSx3Q0FBYztBQUFFLDBDQUFlO0FBMURqRSw2Q0FBOEI7QUFDOUIsMEVBQTJEO0FBRTNELHVDQUFnQztBQUVoQyxTQUFTLGVBQWUsQ0FBQyxFQUN2QixhQUFhLEdBQUcsQ0FBQyxFQUNqQixHQUFHLEtBQUssRUFDK0M7SUFDdkQsT0FBTyxDQUNMLG9CQUFDLGdCQUFnQixDQUFDLFFBQVEsaUJBQ2Qsa0JBQWtCLEVBQzVCLGFBQWEsRUFBRSxhQUFhLEtBQ3hCLEtBQUssR0FDVCxDQUNILENBQUE7QUFDSCxDQUFDO0FBRUQsU0FBUyxPQUFPLENBQUMsRUFDZixHQUFHLEtBQUssRUFDMkM7SUFDbkQsT0FBTyxDQUNMLG9CQUFDLGVBQWU7UUFDZCxvQkFBQyxnQkFBZ0IsQ0FBQyxJQUFJLGlCQUFXLFNBQVMsS0FBSyxLQUFLLEdBQUksQ0FDeEMsQ0FDbkIsQ0FBQTtBQUNILENBQUM7QUFFRCxTQUFTLGNBQWMsQ0FBQyxFQUN0QixHQUFHLEtBQUssRUFDOEM7SUFDdEQsT0FBTyxvQkFBQyxnQkFBZ0IsQ0FBQyxPQUFPLGlCQUFXLGlCQUFpQixLQUFLLEtBQUssR0FBSSxDQUFBO0FBQzVFLENBQUM7QUFFRCxTQUFTLGNBQWMsQ0FBQyxFQUN0QixTQUFTLEVBQ1QsVUFBVSxHQUFHLENBQUMsRUFDZCxRQUFRLEVBQ1IsR0FBRyxLQUFLLEVBQzhDO0lBQ3RELE9BQU8sQ0FDTCxvQkFBQyxnQkFBZ0IsQ0FBQyxNQUFNO1FBQ3RCLG9CQUFDLGdCQUFnQixDQUFDLE9BQU8saUJBQ2IsaUJBQWlCLEVBQzNCLFVBQVUsRUFBRSxVQUFVLEVBQ3RCLFNBQVMsRUFBRSxJQUFBLFVBQUUsRUFDWCx3YUFBd2EsRUFDeGEsU0FBUyxDQUNWLEtBQ0csS0FBSztZQUVSLFFBQVE7WUFDVCxvQkFBQyxnQkFBZ0IsQ0FBQyxLQUFLLElBQUMsU0FBUyxFQUFDLDhGQUE4RixHQUFHLENBQzFHLENBQ0gsQ0FDM0IsQ0FBQTtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tIFwicmVhY3RcIlxuaW1wb3J0ICogYXMgVG9vbHRpcFByaW1pdGl2ZSBmcm9tIFwiQHJhZGl4LXVpL3JlYWN0LXRvb2x0aXBcIlxuXG5pbXBvcnQgeyBjbiB9IGZyb20gXCJAL2xpYi91dGlsc1wiXG5cbmZ1bmN0aW9uIFRvb2x0aXBQcm92aWRlcih7XG4gIGRlbGF5RHVyYXRpb24gPSAwLFxuICAuLi5wcm9wc1xufTogUmVhY3QuQ29tcG9uZW50UHJvcHM8dHlwZW9mIFRvb2x0aXBQcmltaXRpdmUuUHJvdmlkZXI+KSB7XG4gIHJldHVybiAoXG4gICAgPFRvb2x0aXBQcmltaXRpdmUuUHJvdmlkZXJcbiAgICAgIGRhdGEtc2xvdD1cInRvb2x0aXAtcHJvdmlkZXJcIlxuICAgICAgZGVsYXlEdXJhdGlvbj17ZGVsYXlEdXJhdGlvbn1cbiAgICAgIHsuLi5wcm9wc31cbiAgICAvPlxuICApXG59XG5cbmZ1bmN0aW9uIFRvb2x0aXAoe1xuICAuLi5wcm9wc1xufTogUmVhY3QuQ29tcG9uZW50UHJvcHM8dHlwZW9mIFRvb2x0aXBQcmltaXRpdmUuUm9vdD4pIHtcbiAgcmV0dXJuIChcbiAgICA8VG9vbHRpcFByb3ZpZGVyPlxuICAgICAgPFRvb2x0aXBQcmltaXRpdmUuUm9vdCBkYXRhLXNsb3Q9XCJ0b29sdGlwXCIgey4uLnByb3BzfSAvPlxuICAgIDwvVG9vbHRpcFByb3ZpZGVyPlxuICApXG59XG5cbmZ1bmN0aW9uIFRvb2x0aXBUcmlnZ2VyKHtcbiAgLi4ucHJvcHNcbn06IFJlYWN0LkNvbXBvbmVudFByb3BzPHR5cGVvZiBUb29sdGlwUHJpbWl0aXZlLlRyaWdnZXI+KSB7XG4gIHJldHVybiA8VG9vbHRpcFByaW1pdGl2ZS5UcmlnZ2VyIGRhdGEtc2xvdD1cInRvb2x0aXAtdHJpZ2dlclwiIHsuLi5wcm9wc30gLz5cbn1cblxuZnVuY3Rpb24gVG9vbHRpcENvbnRlbnQoe1xuICBjbGFzc05hbWUsXG4gIHNpZGVPZmZzZXQgPSAwLFxuICBjaGlsZHJlbixcbiAgLi4ucHJvcHNcbn06IFJlYWN0LkNvbXBvbmVudFByb3BzPHR5cGVvZiBUb29sdGlwUHJpbWl0aXZlLkNvbnRlbnQ+KSB7XG4gIHJldHVybiAoXG4gICAgPFRvb2x0aXBQcmltaXRpdmUuUG9ydGFsPlxuICAgICAgPFRvb2x0aXBQcmltaXRpdmUuQ29udGVudFxuICAgICAgICBkYXRhLXNsb3Q9XCJ0b29sdGlwLWNvbnRlbnRcIlxuICAgICAgICBzaWRlT2Zmc2V0PXtzaWRlT2Zmc2V0fVxuICAgICAgICBjbGFzc05hbWU9e2NuKFxuICAgICAgICAgIFwiYmctcHJpbWFyeSB0ZXh0LXByaW1hcnktZm9yZWdyb3VuZCBhbmltYXRlLWluIGZhZGUtaW4tMCB6b29tLWluLTk1IGRhdGEtW3N0YXRlPWNsb3NlZF06YW5pbWF0ZS1vdXQgZGF0YS1bc3RhdGU9Y2xvc2VkXTpmYWRlLW91dC0wIGRhdGEtW3N0YXRlPWNsb3NlZF06em9vbS1vdXQtOTUgZGF0YS1bc2lkZT1ib3R0b21dOnNsaWRlLWluLWZyb20tdG9wLTIgZGF0YS1bc2lkZT1sZWZ0XTpzbGlkZS1pbi1mcm9tLXJpZ2h0LTIgZGF0YS1bc2lkZT1yaWdodF06c2xpZGUtaW4tZnJvbS1sZWZ0LTIgZGF0YS1bc2lkZT10b3BdOnNsaWRlLWluLWZyb20tYm90dG9tLTIgei01MCB3LWZpdCBvcmlnaW4tKC0tcmFkaXgtdG9vbHRpcC1jb250ZW50LXRyYW5zZm9ybS1vcmlnaW4pIHJvdW5kZWQtbWQgcHgtMyBweS0xLjUgdGV4dC14cyB0ZXh0LWJhbGFuY2VcIixcbiAgICAgICAgICBjbGFzc05hbWVcbiAgICAgICAgKX1cbiAgICAgICAgey4uLnByb3BzfVxuICAgICAgPlxuICAgICAgICB7Y2hpbGRyZW59XG4gICAgICAgIDxUb29sdGlwUHJpbWl0aXZlLkFycm93IGNsYXNzTmFtZT1cImJnLXByaW1hcnkgZmlsbC1wcmltYXJ5IHotNTAgc2l6ZS0yLjUgdHJhbnNsYXRlLXktW2NhbGMoLTUwJV8tXzJweCldIHJvdGF0ZS00NSByb3VuZGVkLVsycHhdXCIgLz5cbiAgICAgIDwvVG9vbHRpcFByaW1pdGl2ZS5Db250ZW50PlxuICAgIDwvVG9vbHRpcFByaW1pdGl2ZS5Qb3J0YWw+XG4gIClcbn1cblxuZXhwb3J0IHsgVG9vbHRpcCwgVG9vbHRpcFRyaWdnZXIsIFRvb2x0aXBDb250ZW50LCBUb29sdGlwUHJvdmlkZXIgfVxuIl19