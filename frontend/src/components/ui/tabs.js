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
exports.Tabs = Tabs;
exports.TabsList = TabsList;
exports.TabsTrigger = TabsTrigger;
exports.TabsContent = TabsContent;
const React = __importStar(require("react"));
const TabsPrimitive = __importStar(require("@radix-ui/react-tabs"));
const utils_1 = require("../../lib/utils");
function Tabs({ className, ...props }) {
    return (React.createElement(TabsPrimitive.Root, { "data-slot": "tabs", className: (0, utils_1.cn)("flex flex-col gap-2", className), ...props }));
}
function TabsList({ className, ...props }) {
    return (React.createElement(TabsPrimitive.List, { "data-slot": "tabs-list", className: (0, utils_1.cn)("bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]", className), ...props }));
}
function TabsTrigger({ className, ...props }) {
    return (React.createElement(TabsPrimitive.Trigger, { "data-slot": "tabs-trigger", className: (0, utils_1.cn)("data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className), ...props }));
}
function TabsContent({ className, ...props }) {
    return (React.createElement(TabsPrimitive.Content, { "data-slot": "tabs-content", className: (0, utils_1.cn)("flex-1 outline-none", className), ...props }));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFicy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInRhYnMudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBK0RTLG9CQUFJO0FBQUUsNEJBQVE7QUFBRSxrQ0FBVztBQUFFLGtDQUFXO0FBL0RqRCw2Q0FBOEI7QUFDOUIsb0VBQXFEO0FBRXJELHVDQUFnQztBQUVoQyxTQUFTLElBQUksQ0FBQyxFQUNaLFNBQVMsRUFDVCxHQUFHLEtBQUssRUFDd0M7SUFDaEQsT0FBTyxDQUNMLG9CQUFDLGFBQWEsQ0FBQyxJQUFJLGlCQUNQLE1BQU0sRUFDaEIsU0FBUyxFQUFFLElBQUEsVUFBRSxFQUFDLHFCQUFxQixFQUFFLFNBQVMsQ0FBQyxLQUMzQyxLQUFLLEdBQ1QsQ0FDSCxDQUFBO0FBQ0gsQ0FBQztBQUVELFNBQVMsUUFBUSxDQUFDLEVBQ2hCLFNBQVMsRUFDVCxHQUFHLEtBQUssRUFDd0M7SUFDaEQsT0FBTyxDQUNMLG9CQUFDLGFBQWEsQ0FBQyxJQUFJLGlCQUNQLFdBQVcsRUFDckIsU0FBUyxFQUFFLElBQUEsVUFBRSxFQUNYLHFHQUFxRyxFQUNyRyxTQUFTLENBQ1YsS0FDRyxLQUFLLEdBQ1QsQ0FDSCxDQUFBO0FBQ0gsQ0FBQztBQUVELFNBQVMsV0FBVyxDQUFDLEVBQ25CLFNBQVMsRUFDVCxHQUFHLEtBQUssRUFDMkM7SUFDbkQsT0FBTyxDQUNMLG9CQUFDLGFBQWEsQ0FBQyxPQUFPLGlCQUNWLGNBQWMsRUFDeEIsU0FBUyxFQUFFLElBQUEsVUFBRSxFQUNYLGlxQkFBaXFCLEVBQ2pxQixTQUFTLENBQ1YsS0FDRyxLQUFLLEdBQ1QsQ0FDSCxDQUFBO0FBQ0gsQ0FBQztBQUVELFNBQVMsV0FBVyxDQUFDLEVBQ25CLFNBQVMsRUFDVCxHQUFHLEtBQUssRUFDMkM7SUFDbkQsT0FBTyxDQUNMLG9CQUFDLGFBQWEsQ0FBQyxPQUFPLGlCQUNWLGNBQWMsRUFDeEIsU0FBUyxFQUFFLElBQUEsVUFBRSxFQUFDLHFCQUFxQixFQUFFLFNBQVMsQ0FBQyxLQUMzQyxLQUFLLEdBQ1QsQ0FDSCxDQUFBO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFJlYWN0IGZyb20gXCJyZWFjdFwiXG5pbXBvcnQgKiBhcyBUYWJzUHJpbWl0aXZlIGZyb20gXCJAcmFkaXgtdWkvcmVhY3QtdGFic1wiXG5cbmltcG9ydCB7IGNuIH0gZnJvbSBcIkAvbGliL3V0aWxzXCJcblxuZnVuY3Rpb24gVGFicyh7XG4gIGNsYXNzTmFtZSxcbiAgLi4ucHJvcHNcbn06IFJlYWN0LkNvbXBvbmVudFByb3BzPHR5cGVvZiBUYWJzUHJpbWl0aXZlLlJvb3Q+KSB7XG4gIHJldHVybiAoXG4gICAgPFRhYnNQcmltaXRpdmUuUm9vdFxuICAgICAgZGF0YS1zbG90PVwidGFic1wiXG4gICAgICBjbGFzc05hbWU9e2NuKFwiZmxleCBmbGV4LWNvbCBnYXAtMlwiLCBjbGFzc05hbWUpfVxuICAgICAgey4uLnByb3BzfVxuICAgIC8+XG4gIClcbn1cblxuZnVuY3Rpb24gVGFic0xpc3Qoe1xuICBjbGFzc05hbWUsXG4gIC4uLnByb3BzXG59OiBSZWFjdC5Db21wb25lbnRQcm9wczx0eXBlb2YgVGFic1ByaW1pdGl2ZS5MaXN0Pikge1xuICByZXR1cm4gKFxuICAgIDxUYWJzUHJpbWl0aXZlLkxpc3RcbiAgICAgIGRhdGEtc2xvdD1cInRhYnMtbGlzdFwiXG4gICAgICBjbGFzc05hbWU9e2NuKFxuICAgICAgICBcImJnLW11dGVkIHRleHQtbXV0ZWQtZm9yZWdyb3VuZCBpbmxpbmUtZmxleCBoLTkgdy1maXQgaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHJvdW5kZWQtbGcgcC1bM3B4XVwiLFxuICAgICAgICBjbGFzc05hbWVcbiAgICAgICl9XG4gICAgICB7Li4ucHJvcHN9XG4gICAgLz5cbiAgKVxufVxuXG5mdW5jdGlvbiBUYWJzVHJpZ2dlcih7XG4gIGNsYXNzTmFtZSxcbiAgLi4ucHJvcHNcbn06IFJlYWN0LkNvbXBvbmVudFByb3BzPHR5cGVvZiBUYWJzUHJpbWl0aXZlLlRyaWdnZXI+KSB7XG4gIHJldHVybiAoXG4gICAgPFRhYnNQcmltaXRpdmUuVHJpZ2dlclxuICAgICAgZGF0YS1zbG90PVwidGFicy10cmlnZ2VyXCJcbiAgICAgIGNsYXNzTmFtZT17Y24oXG4gICAgICAgIFwiZGF0YS1bc3RhdGU9YWN0aXZlXTpiZy1iYWNrZ3JvdW5kIGRhcms6ZGF0YS1bc3RhdGU9YWN0aXZlXTp0ZXh0LWZvcmVncm91bmQgZm9jdXMtdmlzaWJsZTpib3JkZXItcmluZyBmb2N1cy12aXNpYmxlOnJpbmctcmluZy81MCBmb2N1cy12aXNpYmxlOm91dGxpbmUtcmluZyBkYXJrOmRhdGEtW3N0YXRlPWFjdGl2ZV06Ym9yZGVyLWlucHV0IGRhcms6ZGF0YS1bc3RhdGU9YWN0aXZlXTpiZy1pbnB1dC8zMCB0ZXh0LWZvcmVncm91bmQgZGFyazp0ZXh0LW11dGVkLWZvcmVncm91bmQgaW5saW5lLWZsZXggaC1bY2FsYygxMDAlLTFweCldIGZsZXgtMSBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgZ2FwLTEuNSByb3VuZGVkLW1kIGJvcmRlciBib3JkZXItdHJhbnNwYXJlbnQgcHgtMiBweS0xIHRleHQtc20gZm9udC1tZWRpdW0gd2hpdGVzcGFjZS1ub3dyYXAgdHJhbnNpdGlvbi1bY29sb3IsYm94LXNoYWRvd10gZm9jdXMtdmlzaWJsZTpyaW5nLVszcHhdIGZvY3VzLXZpc2libGU6b3V0bGluZS0xIGRpc2FibGVkOnBvaW50ZXItZXZlbnRzLW5vbmUgZGlzYWJsZWQ6b3BhY2l0eS01MCBkYXRhLVtzdGF0ZT1hY3RpdmVdOnNoYWRvdy1zbSBbJl9zdmddOnBvaW50ZXItZXZlbnRzLW5vbmUgWyZfc3ZnXTpzaHJpbmstMCBbJl9zdmc6bm90KFtjbGFzcyo9J3NpemUtJ10pXTpzaXplLTRcIixcbiAgICAgICAgY2xhc3NOYW1lXG4gICAgICApfVxuICAgICAgey4uLnByb3BzfVxuICAgIC8+XG4gIClcbn1cblxuZnVuY3Rpb24gVGFic0NvbnRlbnQoe1xuICBjbGFzc05hbWUsXG4gIC4uLnByb3BzXG59OiBSZWFjdC5Db21wb25lbnRQcm9wczx0eXBlb2YgVGFic1ByaW1pdGl2ZS5Db250ZW50Pikge1xuICByZXR1cm4gKFxuICAgIDxUYWJzUHJpbWl0aXZlLkNvbnRlbnRcbiAgICAgIGRhdGEtc2xvdD1cInRhYnMtY29udGVudFwiXG4gICAgICBjbGFzc05hbWU9e2NuKFwiZmxleC0xIG91dGxpbmUtbm9uZVwiLCBjbGFzc05hbWUpfVxuICAgICAgey4uLnByb3BzfVxuICAgIC8+XG4gIClcbn1cblxuZXhwb3J0IHsgVGFicywgVGFic0xpc3QsIFRhYnNUcmlnZ2VyLCBUYWJzQ29udGVudCB9XG4iXX0=