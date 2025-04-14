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
exports.Input = Input;
const React = __importStar(require("react"));
const utils_1 = require("../../lib/utils");
function Input({ className, type, ...props }) {
    return (React.createElement("input", { type: type, "data-slot": "input", className: (0, utils_1.cn)("file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]", "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive", className), ...props }));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbnB1dC50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFvQlMsc0JBQUs7QUFwQmQsNkNBQThCO0FBRTlCLHVDQUFnQztBQUVoQyxTQUFTLEtBQUssQ0FBQyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsR0FBRyxLQUFLLEVBQWlDO0lBQ3pFLE9BQU8sQ0FDTCwrQkFDRSxJQUFJLEVBQUUsSUFBSSxlQUNBLE9BQU8sRUFDakIsU0FBUyxFQUFFLElBQUEsVUFBRSxFQUNYLGljQUFpYyxFQUNqYywrRUFBK0UsRUFDL0Usd0dBQXdHLEVBQ3hHLFNBQVMsQ0FDVixLQUNHLEtBQUssR0FDVCxDQUNILENBQUE7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSBcInJlYWN0XCJcblxuaW1wb3J0IHsgY24gfSBmcm9tIFwiQC9saWIvdXRpbHNcIlxuXG5mdW5jdGlvbiBJbnB1dCh7IGNsYXNzTmFtZSwgdHlwZSwgLi4ucHJvcHMgfTogUmVhY3QuQ29tcG9uZW50UHJvcHM8XCJpbnB1dFwiPikge1xuICByZXR1cm4gKFxuICAgIDxpbnB1dFxuICAgICAgdHlwZT17dHlwZX1cbiAgICAgIGRhdGEtc2xvdD1cImlucHV0XCJcbiAgICAgIGNsYXNzTmFtZT17Y24oXG4gICAgICAgIFwiZmlsZTp0ZXh0LWZvcmVncm91bmQgcGxhY2Vob2xkZXI6dGV4dC1tdXRlZC1mb3JlZ3JvdW5kIHNlbGVjdGlvbjpiZy1wcmltYXJ5IHNlbGVjdGlvbjp0ZXh0LXByaW1hcnktZm9yZWdyb3VuZCBkYXJrOmJnLWlucHV0LzMwIGJvcmRlci1pbnB1dCBmbGV4IGgtOSB3LWZ1bGwgbWluLXctMCByb3VuZGVkLW1kIGJvcmRlciBiZy10cmFuc3BhcmVudCBweC0zIHB5LTEgdGV4dC1iYXNlIHNoYWRvdy14cyB0cmFuc2l0aW9uLVtjb2xvcixib3gtc2hhZG93XSBvdXRsaW5lLW5vbmUgZmlsZTppbmxpbmUtZmxleCBmaWxlOmgtNyBmaWxlOmJvcmRlci0wIGZpbGU6YmctdHJhbnNwYXJlbnQgZmlsZTp0ZXh0LXNtIGZpbGU6Zm9udC1tZWRpdW0gZGlzYWJsZWQ6cG9pbnRlci1ldmVudHMtbm9uZSBkaXNhYmxlZDpjdXJzb3Itbm90LWFsbG93ZWQgZGlzYWJsZWQ6b3BhY2l0eS01MCBtZDp0ZXh0LXNtXCIsXG4gICAgICAgIFwiZm9jdXMtdmlzaWJsZTpib3JkZXItcmluZyBmb2N1cy12aXNpYmxlOnJpbmctcmluZy81MCBmb2N1cy12aXNpYmxlOnJpbmctWzNweF1cIixcbiAgICAgICAgXCJhcmlhLWludmFsaWQ6cmluZy1kZXN0cnVjdGl2ZS8yMCBkYXJrOmFyaWEtaW52YWxpZDpyaW5nLWRlc3RydWN0aXZlLzQwIGFyaWEtaW52YWxpZDpib3JkZXItZGVzdHJ1Y3RpdmVcIixcbiAgICAgICAgY2xhc3NOYW1lXG4gICAgICApfVxuICAgICAgey4uLnByb3BzfVxuICAgIC8+XG4gIClcbn1cblxuZXhwb3J0IHsgSW5wdXQgfVxuIl19