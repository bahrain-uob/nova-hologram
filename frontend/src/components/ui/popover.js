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
exports.Popover = Popover;
exports.PopoverTrigger = PopoverTrigger;
exports.PopoverContent = PopoverContent;
exports.PopoverAnchor = PopoverAnchor;
const React = __importStar(require("react"));
const PopoverPrimitive = __importStar(require("@radix-ui/react-popover"));
const utils_1 = require("../../lib/utils");
function Popover({ ...props }) {
    return React.createElement(PopoverPrimitive.Root, { "data-slot": "popover", ...props });
}
function PopoverTrigger({ ...props }) {
    return React.createElement(PopoverPrimitive.Trigger, { "data-slot": "popover-trigger", ...props });
}
function PopoverContent({ className, align = "center", sideOffset = 4, ...props }) {
    return (React.createElement(PopoverPrimitive.Portal, null,
        React.createElement(PopoverPrimitive.Content, { "data-slot": "popover-content", align: align, sideOffset: sideOffset, className: (0, utils_1.cn)("bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden", className), ...props })));
}
function PopoverAnchor({ ...props }) {
    return React.createElement(PopoverPrimitive.Anchor, { "data-slot": "popover-anchor", ...props });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wb3Zlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInBvcG92ZXIudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBNkNTLDBCQUFPO0FBQUUsd0NBQWM7QUFBRSx3Q0FBYztBQUFFLHNDQUFhO0FBN0MvRCw2Q0FBOEI7QUFDOUIsMEVBQTJEO0FBRTNELHVDQUFnQztBQUVoQyxTQUFTLE9BQU8sQ0FBQyxFQUNmLEdBQUcsS0FBSyxFQUMyQztJQUNuRCxPQUFPLG9CQUFDLGdCQUFnQixDQUFDLElBQUksaUJBQVcsU0FBUyxLQUFLLEtBQUssR0FBSSxDQUFBO0FBQ2pFLENBQUM7QUFFRCxTQUFTLGNBQWMsQ0FBQyxFQUN0QixHQUFHLEtBQUssRUFDOEM7SUFDdEQsT0FBTyxvQkFBQyxnQkFBZ0IsQ0FBQyxPQUFPLGlCQUFXLGlCQUFpQixLQUFLLEtBQUssR0FBSSxDQUFBO0FBQzVFLENBQUM7QUFFRCxTQUFTLGNBQWMsQ0FBQyxFQUN0QixTQUFTLEVBQ1QsS0FBSyxHQUFHLFFBQVEsRUFDaEIsVUFBVSxHQUFHLENBQUMsRUFDZCxHQUFHLEtBQUssRUFDOEM7SUFDdEQsT0FBTyxDQUNMLG9CQUFDLGdCQUFnQixDQUFDLE1BQU07UUFDdEIsb0JBQUMsZ0JBQWdCLENBQUMsT0FBTyxpQkFDYixpQkFBaUIsRUFDM0IsS0FBSyxFQUFFLEtBQUssRUFDWixVQUFVLEVBQUUsVUFBVSxFQUN0QixTQUFTLEVBQUUsSUFBQSxVQUFFLEVBQ1gsZ2VBQWdlLEVBQ2hlLFNBQVMsQ0FDVixLQUNHLEtBQUssR0FDVCxDQUNzQixDQUMzQixDQUFBO0FBQ0gsQ0FBQztBQUVELFNBQVMsYUFBYSxDQUFDLEVBQ3JCLEdBQUcsS0FBSyxFQUM2QztJQUNyRCxPQUFPLG9CQUFDLGdCQUFnQixDQUFDLE1BQU0saUJBQVcsZ0JBQWdCLEtBQUssS0FBSyxHQUFJLENBQUE7QUFDMUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFJlYWN0IGZyb20gXCJyZWFjdFwiXG5pbXBvcnQgKiBhcyBQb3BvdmVyUHJpbWl0aXZlIGZyb20gXCJAcmFkaXgtdWkvcmVhY3QtcG9wb3ZlclwiXG5cbmltcG9ydCB7IGNuIH0gZnJvbSBcIkAvbGliL3V0aWxzXCJcblxuZnVuY3Rpb24gUG9wb3Zlcih7XG4gIC4uLnByb3BzXG59OiBSZWFjdC5Db21wb25lbnRQcm9wczx0eXBlb2YgUG9wb3ZlclByaW1pdGl2ZS5Sb290Pikge1xuICByZXR1cm4gPFBvcG92ZXJQcmltaXRpdmUuUm9vdCBkYXRhLXNsb3Q9XCJwb3BvdmVyXCIgey4uLnByb3BzfSAvPlxufVxuXG5mdW5jdGlvbiBQb3BvdmVyVHJpZ2dlcih7XG4gIC4uLnByb3BzXG59OiBSZWFjdC5Db21wb25lbnRQcm9wczx0eXBlb2YgUG9wb3ZlclByaW1pdGl2ZS5UcmlnZ2VyPikge1xuICByZXR1cm4gPFBvcG92ZXJQcmltaXRpdmUuVHJpZ2dlciBkYXRhLXNsb3Q9XCJwb3BvdmVyLXRyaWdnZXJcIiB7Li4ucHJvcHN9IC8+XG59XG5cbmZ1bmN0aW9uIFBvcG92ZXJDb250ZW50KHtcbiAgY2xhc3NOYW1lLFxuICBhbGlnbiA9IFwiY2VudGVyXCIsXG4gIHNpZGVPZmZzZXQgPSA0LFxuICAuLi5wcm9wc1xufTogUmVhY3QuQ29tcG9uZW50UHJvcHM8dHlwZW9mIFBvcG92ZXJQcmltaXRpdmUuQ29udGVudD4pIHtcbiAgcmV0dXJuIChcbiAgICA8UG9wb3ZlclByaW1pdGl2ZS5Qb3J0YWw+XG4gICAgICA8UG9wb3ZlclByaW1pdGl2ZS5Db250ZW50XG4gICAgICAgIGRhdGEtc2xvdD1cInBvcG92ZXItY29udGVudFwiXG4gICAgICAgIGFsaWduPXthbGlnbn1cbiAgICAgICAgc2lkZU9mZnNldD17c2lkZU9mZnNldH1cbiAgICAgICAgY2xhc3NOYW1lPXtjbihcbiAgICAgICAgICBcImJnLXBvcG92ZXIgdGV4dC1wb3BvdmVyLWZvcmVncm91bmQgZGF0YS1bc3RhdGU9b3Blbl06YW5pbWF0ZS1pbiBkYXRhLVtzdGF0ZT1jbG9zZWRdOmFuaW1hdGUtb3V0IGRhdGEtW3N0YXRlPWNsb3NlZF06ZmFkZS1vdXQtMCBkYXRhLVtzdGF0ZT1vcGVuXTpmYWRlLWluLTAgZGF0YS1bc3RhdGU9Y2xvc2VkXTp6b29tLW91dC05NSBkYXRhLVtzdGF0ZT1vcGVuXTp6b29tLWluLTk1IGRhdGEtW3NpZGU9Ym90dG9tXTpzbGlkZS1pbi1mcm9tLXRvcC0yIGRhdGEtW3NpZGU9bGVmdF06c2xpZGUtaW4tZnJvbS1yaWdodC0yIGRhdGEtW3NpZGU9cmlnaHRdOnNsaWRlLWluLWZyb20tbGVmdC0yIGRhdGEtW3NpZGU9dG9wXTpzbGlkZS1pbi1mcm9tLWJvdHRvbS0yIHotNTAgdy03MiBvcmlnaW4tKC0tcmFkaXgtcG9wb3Zlci1jb250ZW50LXRyYW5zZm9ybS1vcmlnaW4pIHJvdW5kZWQtbWQgYm9yZGVyIHAtNCBzaGFkb3ctbWQgb3V0bGluZS1oaWRkZW5cIixcbiAgICAgICAgICBjbGFzc05hbWVcbiAgICAgICAgKX1cbiAgICAgICAgey4uLnByb3BzfVxuICAgICAgLz5cbiAgICA8L1BvcG92ZXJQcmltaXRpdmUuUG9ydGFsPlxuICApXG59XG5cbmZ1bmN0aW9uIFBvcG92ZXJBbmNob3Ioe1xuICAuLi5wcm9wc1xufTogUmVhY3QuQ29tcG9uZW50UHJvcHM8dHlwZW9mIFBvcG92ZXJQcmltaXRpdmUuQW5jaG9yPikge1xuICByZXR1cm4gPFBvcG92ZXJQcmltaXRpdmUuQW5jaG9yIGRhdGEtc2xvdD1cInBvcG92ZXItYW5jaG9yXCIgey4uLnByb3BzfSAvPlxufVxuXG5leHBvcnQgeyBQb3BvdmVyLCBQb3BvdmVyVHJpZ2dlciwgUG9wb3ZlckNvbnRlbnQsIFBvcG92ZXJBbmNob3IgfVxuIl19