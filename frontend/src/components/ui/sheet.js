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
exports.Sheet = Sheet;
exports.SheetTrigger = SheetTrigger;
exports.SheetClose = SheetClose;
exports.SheetContent = SheetContent;
exports.SheetHeader = SheetHeader;
exports.SheetFooter = SheetFooter;
exports.SheetTitle = SheetTitle;
exports.SheetDescription = SheetDescription;
const React = __importStar(require("react"));
const SheetPrimitive = __importStar(require("@radix-ui/react-dialog"));
const lucide_react_1 = require("lucide-react");
const utils_1 = require("../../lib/utils");
function Sheet({ ...props }) {
    return React.createElement(SheetPrimitive.Root, { "data-slot": "sheet", ...props });
}
function SheetTrigger({ ...props }) {
    return React.createElement(SheetPrimitive.Trigger, { "data-slot": "sheet-trigger", ...props });
}
function SheetClose({ ...props }) {
    return React.createElement(SheetPrimitive.Close, { "data-slot": "sheet-close", ...props });
}
function SheetPortal({ ...props }) {
    return React.createElement(SheetPrimitive.Portal, { "data-slot": "sheet-portal", ...props });
}
function SheetOverlay({ className, ...props }) {
    return (React.createElement(SheetPrimitive.Overlay, { "data-slot": "sheet-overlay", className: (0, utils_1.cn)("data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50", className), ...props }));
}
function SheetContent({ className, children, side = "right", ...props }) {
    return (React.createElement(SheetPortal, null,
        React.createElement(SheetOverlay, null),
        React.createElement(SheetPrimitive.Content, { "data-slot": "sheet-content", className: (0, utils_1.cn)("bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500", side === "right" &&
                "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm", side === "left" &&
                "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm", side === "top" &&
                "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b", side === "bottom" &&
                "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t", className), ...props },
            children,
            React.createElement(SheetPrimitive.Close, { className: "ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none" },
                React.createElement(lucide_react_1.XIcon, { className: "size-4" }),
                React.createElement("span", { className: "sr-only" }, "Close")))));
}
function SheetHeader({ className, ...props }) {
    return (React.createElement("div", { "data-slot": "sheet-header", className: (0, utils_1.cn)("flex flex-col gap-1.5 p-4", className), ...props }));
}
function SheetFooter({ className, ...props }) {
    return (React.createElement("div", { "data-slot": "sheet-footer", className: (0, utils_1.cn)("mt-auto flex flex-col gap-2 p-4", className), ...props }));
}
function SheetTitle({ className, ...props }) {
    return (React.createElement(SheetPrimitive.Title, { "data-slot": "sheet-title", className: (0, utils_1.cn)("text-foreground font-semibold", className), ...props }));
}
function SheetDescription({ className, ...props }) {
    return (React.createElement(SheetPrimitive.Description, { "data-slot": "sheet-description", className: (0, utils_1.cn)("text-muted-foreground text-sm", className), ...props }));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hlZXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzaGVldC50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFnSUUsc0JBQUs7QUFDTCxvQ0FBWTtBQUNaLGdDQUFVO0FBQ1Ysb0NBQVk7QUFDWixrQ0FBVztBQUNYLGtDQUFXO0FBQ1gsZ0NBQVU7QUFDViw0Q0FBZ0I7QUF2SWxCLDZDQUE4QjtBQUM5Qix1RUFBd0Q7QUFDeEQsK0NBQW9DO0FBRXBDLHVDQUFnQztBQUVoQyxTQUFTLEtBQUssQ0FBQyxFQUFFLEdBQUcsS0FBSyxFQUFvRDtJQUMzRSxPQUFPLG9CQUFDLGNBQWMsQ0FBQyxJQUFJLGlCQUFXLE9BQU8sS0FBSyxLQUFLLEdBQUksQ0FBQTtBQUM3RCxDQUFDO0FBRUQsU0FBUyxZQUFZLENBQUMsRUFDcEIsR0FBRyxLQUFLLEVBQzRDO0lBQ3BELE9BQU8sb0JBQUMsY0FBYyxDQUFDLE9BQU8saUJBQVcsZUFBZSxLQUFLLEtBQUssR0FBSSxDQUFBO0FBQ3hFLENBQUM7QUFFRCxTQUFTLFVBQVUsQ0FBQyxFQUNsQixHQUFHLEtBQUssRUFDMEM7SUFDbEQsT0FBTyxvQkFBQyxjQUFjLENBQUMsS0FBSyxpQkFBVyxhQUFhLEtBQUssS0FBSyxHQUFJLENBQUE7QUFDcEUsQ0FBQztBQUVELFNBQVMsV0FBVyxDQUFDLEVBQ25CLEdBQUcsS0FBSyxFQUMyQztJQUNuRCxPQUFPLG9CQUFDLGNBQWMsQ0FBQyxNQUFNLGlCQUFXLGNBQWMsS0FBSyxLQUFLLEdBQUksQ0FBQTtBQUN0RSxDQUFDO0FBRUQsU0FBUyxZQUFZLENBQUMsRUFDcEIsU0FBUyxFQUNULEdBQUcsS0FBSyxFQUM0QztJQUNwRCxPQUFPLENBQ0wsb0JBQUMsY0FBYyxDQUFDLE9BQU8saUJBQ1gsZUFBZSxFQUN6QixTQUFTLEVBQUUsSUFBQSxVQUFFLEVBQ1gsd0pBQXdKLEVBQ3hKLFNBQVMsQ0FDVixLQUNHLEtBQUssR0FDVCxDQUNILENBQUE7QUFDSCxDQUFDO0FBRUQsU0FBUyxZQUFZLENBQUMsRUFDcEIsU0FBUyxFQUNULFFBQVEsRUFDUixJQUFJLEdBQUcsT0FBTyxFQUNkLEdBQUcsS0FBSyxFQUdUO0lBQ0MsT0FBTyxDQUNMLG9CQUFDLFdBQVc7UUFDVixvQkFBQyxZQUFZLE9BQUc7UUFDaEIsb0JBQUMsY0FBYyxDQUFDLE9BQU8saUJBQ1gsZUFBZSxFQUN6QixTQUFTLEVBQUUsSUFBQSxVQUFFLEVBQ1gsNE1BQTRNLEVBQzVNLElBQUksS0FBSyxPQUFPO2dCQUNkLGtJQUFrSSxFQUNwSSxJQUFJLEtBQUssTUFBTTtnQkFDYiwrSEFBK0gsRUFDakksSUFBSSxLQUFLLEtBQUs7Z0JBQ1osMEdBQTBHLEVBQzVHLElBQUksS0FBSyxRQUFRO2dCQUNmLG1IQUFtSCxFQUNySCxTQUFTLENBQ1YsS0FDRyxLQUFLO1lBRVIsUUFBUTtZQUNULG9CQUFDLGNBQWMsQ0FBQyxLQUFLLElBQUMsU0FBUyxFQUFDLDRPQUE0TztnQkFDMVEsb0JBQUMsb0JBQUssSUFBQyxTQUFTLEVBQUMsUUFBUSxHQUFHO2dCQUM1Qiw4QkFBTSxTQUFTLEVBQUMsU0FBUyxZQUFhLENBQ2pCLENBQ0EsQ0FDYixDQUNmLENBQUE7QUFDSCxDQUFDO0FBRUQsU0FBUyxXQUFXLENBQUMsRUFBRSxTQUFTLEVBQUUsR0FBRyxLQUFLLEVBQStCO0lBQ3ZFLE9BQU8sQ0FDTCwwQ0FDWSxjQUFjLEVBQ3hCLFNBQVMsRUFBRSxJQUFBLFVBQUUsRUFBQywyQkFBMkIsRUFBRSxTQUFTLENBQUMsS0FDakQsS0FBSyxHQUNULENBQ0gsQ0FBQTtBQUNILENBQUM7QUFFRCxTQUFTLFdBQVcsQ0FBQyxFQUFFLFNBQVMsRUFBRSxHQUFHLEtBQUssRUFBK0I7SUFDdkUsT0FBTyxDQUNMLDBDQUNZLGNBQWMsRUFDeEIsU0FBUyxFQUFFLElBQUEsVUFBRSxFQUFDLGlDQUFpQyxFQUFFLFNBQVMsQ0FBQyxLQUN2RCxLQUFLLEdBQ1QsQ0FDSCxDQUFBO0FBQ0gsQ0FBQztBQUVELFNBQVMsVUFBVSxDQUFDLEVBQ2xCLFNBQVMsRUFDVCxHQUFHLEtBQUssRUFDMEM7SUFDbEQsT0FBTyxDQUNMLG9CQUFDLGNBQWMsQ0FBQyxLQUFLLGlCQUNULGFBQWEsRUFDdkIsU0FBUyxFQUFFLElBQUEsVUFBRSxFQUFDLCtCQUErQixFQUFFLFNBQVMsQ0FBQyxLQUNyRCxLQUFLLEdBQ1QsQ0FDSCxDQUFBO0FBQ0gsQ0FBQztBQUVELFNBQVMsZ0JBQWdCLENBQUMsRUFDeEIsU0FBUyxFQUNULEdBQUcsS0FBSyxFQUNnRDtJQUN4RCxPQUFPLENBQ0wsb0JBQUMsY0FBYyxDQUFDLFdBQVcsaUJBQ2YsbUJBQW1CLEVBQzdCLFNBQVMsRUFBRSxJQUFBLFVBQUUsRUFBQywrQkFBK0IsRUFBRSxTQUFTLENBQUMsS0FDckQsS0FBSyxHQUNULENBQ0gsQ0FBQTtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tIFwicmVhY3RcIlxuaW1wb3J0ICogYXMgU2hlZXRQcmltaXRpdmUgZnJvbSBcIkByYWRpeC11aS9yZWFjdC1kaWFsb2dcIlxuaW1wb3J0IHsgWEljb24gfSBmcm9tIFwibHVjaWRlLXJlYWN0XCJcblxuaW1wb3J0IHsgY24gfSBmcm9tIFwiQC9saWIvdXRpbHNcIlxuXG5mdW5jdGlvbiBTaGVldCh7IC4uLnByb3BzIH06IFJlYWN0LkNvbXBvbmVudFByb3BzPHR5cGVvZiBTaGVldFByaW1pdGl2ZS5Sb290Pikge1xuICByZXR1cm4gPFNoZWV0UHJpbWl0aXZlLlJvb3QgZGF0YS1zbG90PVwic2hlZXRcIiB7Li4ucHJvcHN9IC8+XG59XG5cbmZ1bmN0aW9uIFNoZWV0VHJpZ2dlcih7XG4gIC4uLnByb3BzXG59OiBSZWFjdC5Db21wb25lbnRQcm9wczx0eXBlb2YgU2hlZXRQcmltaXRpdmUuVHJpZ2dlcj4pIHtcbiAgcmV0dXJuIDxTaGVldFByaW1pdGl2ZS5UcmlnZ2VyIGRhdGEtc2xvdD1cInNoZWV0LXRyaWdnZXJcIiB7Li4ucHJvcHN9IC8+XG59XG5cbmZ1bmN0aW9uIFNoZWV0Q2xvc2Uoe1xuICAuLi5wcm9wc1xufTogUmVhY3QuQ29tcG9uZW50UHJvcHM8dHlwZW9mIFNoZWV0UHJpbWl0aXZlLkNsb3NlPikge1xuICByZXR1cm4gPFNoZWV0UHJpbWl0aXZlLkNsb3NlIGRhdGEtc2xvdD1cInNoZWV0LWNsb3NlXCIgey4uLnByb3BzfSAvPlxufVxuXG5mdW5jdGlvbiBTaGVldFBvcnRhbCh7XG4gIC4uLnByb3BzXG59OiBSZWFjdC5Db21wb25lbnRQcm9wczx0eXBlb2YgU2hlZXRQcmltaXRpdmUuUG9ydGFsPikge1xuICByZXR1cm4gPFNoZWV0UHJpbWl0aXZlLlBvcnRhbCBkYXRhLXNsb3Q9XCJzaGVldC1wb3J0YWxcIiB7Li4ucHJvcHN9IC8+XG59XG5cbmZ1bmN0aW9uIFNoZWV0T3ZlcmxheSh7XG4gIGNsYXNzTmFtZSxcbiAgLi4ucHJvcHNcbn06IFJlYWN0LkNvbXBvbmVudFByb3BzPHR5cGVvZiBTaGVldFByaW1pdGl2ZS5PdmVybGF5Pikge1xuICByZXR1cm4gKFxuICAgIDxTaGVldFByaW1pdGl2ZS5PdmVybGF5XG4gICAgICBkYXRhLXNsb3Q9XCJzaGVldC1vdmVybGF5XCJcbiAgICAgIGNsYXNzTmFtZT17Y24oXG4gICAgICAgIFwiZGF0YS1bc3RhdGU9b3Blbl06YW5pbWF0ZS1pbiBkYXRhLVtzdGF0ZT1jbG9zZWRdOmFuaW1hdGUtb3V0IGRhdGEtW3N0YXRlPWNsb3NlZF06ZmFkZS1vdXQtMCBkYXRhLVtzdGF0ZT1vcGVuXTpmYWRlLWluLTAgZml4ZWQgaW5zZXQtMCB6LTUwIGJnLWJsYWNrLzUwXCIsXG4gICAgICAgIGNsYXNzTmFtZVxuICAgICAgKX1cbiAgICAgIHsuLi5wcm9wc31cbiAgICAvPlxuICApXG59XG5cbmZ1bmN0aW9uIFNoZWV0Q29udGVudCh7XG4gIGNsYXNzTmFtZSxcbiAgY2hpbGRyZW4sXG4gIHNpZGUgPSBcInJpZ2h0XCIsXG4gIC4uLnByb3BzXG59OiBSZWFjdC5Db21wb25lbnRQcm9wczx0eXBlb2YgU2hlZXRQcmltaXRpdmUuQ29udGVudD4gJiB7XG4gIHNpZGU/OiBcInRvcFwiIHwgXCJyaWdodFwiIHwgXCJib3R0b21cIiB8IFwibGVmdFwiXG59KSB7XG4gIHJldHVybiAoXG4gICAgPFNoZWV0UG9ydGFsPlxuICAgICAgPFNoZWV0T3ZlcmxheSAvPlxuICAgICAgPFNoZWV0UHJpbWl0aXZlLkNvbnRlbnRcbiAgICAgICAgZGF0YS1zbG90PVwic2hlZXQtY29udGVudFwiXG4gICAgICAgIGNsYXNzTmFtZT17Y24oXG4gICAgICAgICAgXCJiZy1iYWNrZ3JvdW5kIGRhdGEtW3N0YXRlPW9wZW5dOmFuaW1hdGUtaW4gZGF0YS1bc3RhdGU9Y2xvc2VkXTphbmltYXRlLW91dCBmaXhlZCB6LTUwIGZsZXggZmxleC1jb2wgZ2FwLTQgc2hhZG93LWxnIHRyYW5zaXRpb24gZWFzZS1pbi1vdXQgZGF0YS1bc3RhdGU9Y2xvc2VkXTpkdXJhdGlvbi0zMDAgZGF0YS1bc3RhdGU9b3Blbl06ZHVyYXRpb24tNTAwXCIsXG4gICAgICAgICAgc2lkZSA9PT0gXCJyaWdodFwiICYmXG4gICAgICAgICAgICBcImRhdGEtW3N0YXRlPWNsb3NlZF06c2xpZGUtb3V0LXRvLXJpZ2h0IGRhdGEtW3N0YXRlPW9wZW5dOnNsaWRlLWluLWZyb20tcmlnaHQgaW5zZXQteS0wIHJpZ2h0LTAgaC1mdWxsIHctMy80IGJvcmRlci1sIHNtOm1heC13LXNtXCIsXG4gICAgICAgICAgc2lkZSA9PT0gXCJsZWZ0XCIgJiZcbiAgICAgICAgICAgIFwiZGF0YS1bc3RhdGU9Y2xvc2VkXTpzbGlkZS1vdXQtdG8tbGVmdCBkYXRhLVtzdGF0ZT1vcGVuXTpzbGlkZS1pbi1mcm9tLWxlZnQgaW5zZXQteS0wIGxlZnQtMCBoLWZ1bGwgdy0zLzQgYm9yZGVyLXIgc206bWF4LXctc21cIixcbiAgICAgICAgICBzaWRlID09PSBcInRvcFwiICYmXG4gICAgICAgICAgICBcImRhdGEtW3N0YXRlPWNsb3NlZF06c2xpZGUtb3V0LXRvLXRvcCBkYXRhLVtzdGF0ZT1vcGVuXTpzbGlkZS1pbi1mcm9tLXRvcCBpbnNldC14LTAgdG9wLTAgaC1hdXRvIGJvcmRlci1iXCIsXG4gICAgICAgICAgc2lkZSA9PT0gXCJib3R0b21cIiAmJlxuICAgICAgICAgICAgXCJkYXRhLVtzdGF0ZT1jbG9zZWRdOnNsaWRlLW91dC10by1ib3R0b20gZGF0YS1bc3RhdGU9b3Blbl06c2xpZGUtaW4tZnJvbS1ib3R0b20gaW5zZXQteC0wIGJvdHRvbS0wIGgtYXV0byBib3JkZXItdFwiLFxuICAgICAgICAgIGNsYXNzTmFtZVxuICAgICAgICApfVxuICAgICAgICB7Li4ucHJvcHN9XG4gICAgICA+XG4gICAgICAgIHtjaGlsZHJlbn1cbiAgICAgICAgPFNoZWV0UHJpbWl0aXZlLkNsb3NlIGNsYXNzTmFtZT1cInJpbmctb2Zmc2V0LWJhY2tncm91bmQgZm9jdXM6cmluZy1yaW5nIGRhdGEtW3N0YXRlPW9wZW5dOmJnLXNlY29uZGFyeSBhYnNvbHV0ZSB0b3AtNCByaWdodC00IHJvdW5kZWQteHMgb3BhY2l0eS03MCB0cmFuc2l0aW9uLW9wYWNpdHkgaG92ZXI6b3BhY2l0eS0xMDAgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctb2Zmc2V0LTIgZm9jdXM6b3V0bGluZS1oaWRkZW4gZGlzYWJsZWQ6cG9pbnRlci1ldmVudHMtbm9uZVwiPlxuICAgICAgICAgIDxYSWNvbiBjbGFzc05hbWU9XCJzaXplLTRcIiAvPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInNyLW9ubHlcIj5DbG9zZTwvc3Bhbj5cbiAgICAgICAgPC9TaGVldFByaW1pdGl2ZS5DbG9zZT5cbiAgICAgIDwvU2hlZXRQcmltaXRpdmUuQ29udGVudD5cbiAgICA8L1NoZWV0UG9ydGFsPlxuICApXG59XG5cbmZ1bmN0aW9uIFNoZWV0SGVhZGVyKHsgY2xhc3NOYW1lLCAuLi5wcm9wcyB9OiBSZWFjdC5Db21wb25lbnRQcm9wczxcImRpdlwiPikge1xuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGRhdGEtc2xvdD1cInNoZWV0LWhlYWRlclwiXG4gICAgICBjbGFzc05hbWU9e2NuKFwiZmxleCBmbGV4LWNvbCBnYXAtMS41IHAtNFwiLCBjbGFzc05hbWUpfVxuICAgICAgey4uLnByb3BzfVxuICAgIC8+XG4gIClcbn1cblxuZnVuY3Rpb24gU2hlZXRGb290ZXIoeyBjbGFzc05hbWUsIC4uLnByb3BzIH06IFJlYWN0LkNvbXBvbmVudFByb3BzPFwiZGl2XCI+KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgZGF0YS1zbG90PVwic2hlZXQtZm9vdGVyXCJcbiAgICAgIGNsYXNzTmFtZT17Y24oXCJtdC1hdXRvIGZsZXggZmxleC1jb2wgZ2FwLTIgcC00XCIsIGNsYXNzTmFtZSl9XG4gICAgICB7Li4ucHJvcHN9XG4gICAgLz5cbiAgKVxufVxuXG5mdW5jdGlvbiBTaGVldFRpdGxlKHtcbiAgY2xhc3NOYW1lLFxuICAuLi5wcm9wc1xufTogUmVhY3QuQ29tcG9uZW50UHJvcHM8dHlwZW9mIFNoZWV0UHJpbWl0aXZlLlRpdGxlPikge1xuICByZXR1cm4gKFxuICAgIDxTaGVldFByaW1pdGl2ZS5UaXRsZVxuICAgICAgZGF0YS1zbG90PVwic2hlZXQtdGl0bGVcIlxuICAgICAgY2xhc3NOYW1lPXtjbihcInRleHQtZm9yZWdyb3VuZCBmb250LXNlbWlib2xkXCIsIGNsYXNzTmFtZSl9XG4gICAgICB7Li4ucHJvcHN9XG4gICAgLz5cbiAgKVxufVxuXG5mdW5jdGlvbiBTaGVldERlc2NyaXB0aW9uKHtcbiAgY2xhc3NOYW1lLFxuICAuLi5wcm9wc1xufTogUmVhY3QuQ29tcG9uZW50UHJvcHM8dHlwZW9mIFNoZWV0UHJpbWl0aXZlLkRlc2NyaXB0aW9uPikge1xuICByZXR1cm4gKFxuICAgIDxTaGVldFByaW1pdGl2ZS5EZXNjcmlwdGlvblxuICAgICAgZGF0YS1zbG90PVwic2hlZXQtZGVzY3JpcHRpb25cIlxuICAgICAgY2xhc3NOYW1lPXtjbihcInRleHQtbXV0ZWQtZm9yZWdyb3VuZCB0ZXh0LXNtXCIsIGNsYXNzTmFtZSl9XG4gICAgICB7Li4ucHJvcHN9XG4gICAgLz5cbiAgKVxufVxuXG5leHBvcnQge1xuICBTaGVldCxcbiAgU2hlZXRUcmlnZ2VyLFxuICBTaGVldENsb3NlLFxuICBTaGVldENvbnRlbnQsXG4gIFNoZWV0SGVhZGVyLFxuICBTaGVldEZvb3RlcixcbiAgU2hlZXRUaXRsZSxcbiAgU2hlZXREZXNjcmlwdGlvbixcbn1cbiJdfQ==