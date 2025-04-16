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
exports.Checkbox = Checkbox;
const React = __importStar(require("react"));
const CheckboxPrimitive = __importStar(require("@radix-ui/react-checkbox"));
const lucide_react_1 = require("lucide-react");
const utils_1 = require("../../lib/utils");
function Checkbox({ className, ...props }) {
    return (React.createElement(CheckboxPrimitive.Root, { "data-slot": "checkbox", className: (0, utils_1.cn)("peer border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50", className), ...props },
        React.createElement(CheckboxPrimitive.Indicator, { "data-slot": "checkbox-indicator", className: "flex items-center justify-center text-current transition-none" },
            React.createElement(lucide_react_1.CheckIcon, { className: "size-3.5" }))));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2tib3guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjaGVja2JveC50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUE2QlMsNEJBQVE7QUE3QmpCLDZDQUE4QjtBQUM5Qiw0RUFBNkQ7QUFDN0QsK0NBQXdDO0FBRXhDLHVDQUFnQztBQUVoQyxTQUFTLFFBQVEsQ0FBQyxFQUNoQixTQUFTLEVBQ1QsR0FBRyxLQUFLLEVBQzRDO0lBQ3BELE9BQU8sQ0FDTCxvQkFBQyxpQkFBaUIsQ0FBQyxJQUFJLGlCQUNYLFVBQVUsRUFDcEIsU0FBUyxFQUFFLElBQUEsVUFBRSxFQUNYLDZlQUE2ZSxFQUM3ZSxTQUFTLENBQ1YsS0FDRyxLQUFLO1FBRVQsb0JBQUMsaUJBQWlCLENBQUMsU0FBUyxpQkFDaEIsb0JBQW9CLEVBQzlCLFNBQVMsRUFBQywrREFBK0Q7WUFFekUsb0JBQUMsd0JBQVMsSUFBQyxTQUFTLEVBQUMsVUFBVSxHQUFHLENBQ04sQ0FDUCxDQUMxQixDQUFBO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFJlYWN0IGZyb20gXCJyZWFjdFwiXG5pbXBvcnQgKiBhcyBDaGVja2JveFByaW1pdGl2ZSBmcm9tIFwiQHJhZGl4LXVpL3JlYWN0LWNoZWNrYm94XCJcbmltcG9ydCB7IENoZWNrSWNvbiB9IGZyb20gXCJsdWNpZGUtcmVhY3RcIlxuXG5pbXBvcnQgeyBjbiB9IGZyb20gXCJAL2xpYi91dGlsc1wiXG5cbmZ1bmN0aW9uIENoZWNrYm94KHtcbiAgY2xhc3NOYW1lLFxuICAuLi5wcm9wc1xufTogUmVhY3QuQ29tcG9uZW50UHJvcHM8dHlwZW9mIENoZWNrYm94UHJpbWl0aXZlLlJvb3Q+KSB7XG4gIHJldHVybiAoXG4gICAgPENoZWNrYm94UHJpbWl0aXZlLlJvb3RcbiAgICAgIGRhdGEtc2xvdD1cImNoZWNrYm94XCJcbiAgICAgIGNsYXNzTmFtZT17Y24oXG4gICAgICAgIFwicGVlciBib3JkZXItaW5wdXQgZGFyazpiZy1pbnB1dC8zMCBkYXRhLVtzdGF0ZT1jaGVja2VkXTpiZy1wcmltYXJ5IGRhdGEtW3N0YXRlPWNoZWNrZWRdOnRleHQtcHJpbWFyeS1mb3JlZ3JvdW5kIGRhcms6ZGF0YS1bc3RhdGU9Y2hlY2tlZF06YmctcHJpbWFyeSBkYXRhLVtzdGF0ZT1jaGVja2VkXTpib3JkZXItcHJpbWFyeSBmb2N1cy12aXNpYmxlOmJvcmRlci1yaW5nIGZvY3VzLXZpc2libGU6cmluZy1yaW5nLzUwIGFyaWEtaW52YWxpZDpyaW5nLWRlc3RydWN0aXZlLzIwIGRhcms6YXJpYS1pbnZhbGlkOnJpbmctZGVzdHJ1Y3RpdmUvNDAgYXJpYS1pbnZhbGlkOmJvcmRlci1kZXN0cnVjdGl2ZSBzaXplLTQgc2hyaW5rLTAgcm91bmRlZC1bNHB4XSBib3JkZXIgc2hhZG93LXhzIHRyYW5zaXRpb24tc2hhZG93IG91dGxpbmUtbm9uZSBmb2N1cy12aXNpYmxlOnJpbmctWzNweF0gZGlzYWJsZWQ6Y3Vyc29yLW5vdC1hbGxvd2VkIGRpc2FibGVkOm9wYWNpdHktNTBcIixcbiAgICAgICAgY2xhc3NOYW1lXG4gICAgICApfVxuICAgICAgey4uLnByb3BzfVxuICAgID5cbiAgICAgIDxDaGVja2JveFByaW1pdGl2ZS5JbmRpY2F0b3JcbiAgICAgICAgZGF0YS1zbG90PVwiY2hlY2tib3gtaW5kaWNhdG9yXCJcbiAgICAgICAgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgdGV4dC1jdXJyZW50IHRyYW5zaXRpb24tbm9uZVwiXG4gICAgICA+XG4gICAgICAgIDxDaGVja0ljb24gY2xhc3NOYW1lPVwic2l6ZS0zLjVcIiAvPlxuICAgICAgPC9DaGVja2JveFByaW1pdGl2ZS5JbmRpY2F0b3I+XG4gICAgPC9DaGVja2JveFByaW1pdGl2ZS5Sb290PlxuICApXG59XG5cbmV4cG9ydCB7IENoZWNrYm94IH1cbiJdfQ==