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
exports.Textarea = Textarea;
const React = __importStar(require("react"));
const utils_1 = require("../../lib/utils");
function Textarea({ className, ...props }) {
    return (React.createElement("textarea", { "data-slot": "textarea", className: (0, utils_1.cn)("border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className), ...props }));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dGFyZWEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0ZXh0YXJlYS50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFpQlMsNEJBQVE7QUFqQmpCLDZDQUE4QjtBQUU5Qix1Q0FBZ0M7QUFFaEMsU0FBUyxRQUFRLENBQUMsRUFBRSxTQUFTLEVBQUUsR0FBRyxLQUFLLEVBQW9DO0lBQ3pFLE9BQU8sQ0FDTCwrQ0FDWSxVQUFVLEVBQ3BCLFNBQVMsRUFBRSxJQUFBLFVBQUUsRUFDWCxxY0FBcWMsRUFDcmMsU0FBUyxDQUNWLEtBQ0csS0FBSyxHQUNULENBQ0gsQ0FBQTtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tIFwicmVhY3RcIlxuXG5pbXBvcnQgeyBjbiB9IGZyb20gXCJAL2xpYi91dGlsc1wiXG5cbmZ1bmN0aW9uIFRleHRhcmVhKHsgY2xhc3NOYW1lLCAuLi5wcm9wcyB9OiBSZWFjdC5Db21wb25lbnRQcm9wczxcInRleHRhcmVhXCI+KSB7XG4gIHJldHVybiAoXG4gICAgPHRleHRhcmVhXG4gICAgICBkYXRhLXNsb3Q9XCJ0ZXh0YXJlYVwiXG4gICAgICBjbGFzc05hbWU9e2NuKFxuICAgICAgICBcImJvcmRlci1pbnB1dCBwbGFjZWhvbGRlcjp0ZXh0LW11dGVkLWZvcmVncm91bmQgZm9jdXMtdmlzaWJsZTpib3JkZXItcmluZyBmb2N1cy12aXNpYmxlOnJpbmctcmluZy81MCBhcmlhLWludmFsaWQ6cmluZy1kZXN0cnVjdGl2ZS8yMCBkYXJrOmFyaWEtaW52YWxpZDpyaW5nLWRlc3RydWN0aXZlLzQwIGFyaWEtaW52YWxpZDpib3JkZXItZGVzdHJ1Y3RpdmUgZGFyazpiZy1pbnB1dC8zMCBmbGV4IGZpZWxkLXNpemluZy1jb250ZW50IG1pbi1oLTE2IHctZnVsbCByb3VuZGVkLW1kIGJvcmRlciBiZy10cmFuc3BhcmVudCBweC0zIHB5LTIgdGV4dC1iYXNlIHNoYWRvdy14cyB0cmFuc2l0aW9uLVtjb2xvcixib3gtc2hhZG93XSBvdXRsaW5lLW5vbmUgZm9jdXMtdmlzaWJsZTpyaW5nLVszcHhdIGRpc2FibGVkOmN1cnNvci1ub3QtYWxsb3dlZCBkaXNhYmxlZDpvcGFjaXR5LTUwIG1kOnRleHQtc21cIixcbiAgICAgICAgY2xhc3NOYW1lXG4gICAgICApfVxuICAgICAgey4uLnByb3BzfVxuICAgIC8+XG4gIClcbn1cblxuZXhwb3J0IHsgVGV4dGFyZWEgfVxuIl19