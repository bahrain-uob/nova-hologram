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
exports.Alert = Alert;
exports.AlertTitle = AlertTitle;
exports.AlertDescription = AlertDescription;
const React = __importStar(require("react"));
const class_variance_authority_1 = require("class-variance-authority");
const utils_1 = require("../../lib/utils");
const alertVariants = (0, class_variance_authority_1.cva)("relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current", {
    variants: {
        variant: {
            default: "bg-card text-card-foreground",
            destructive: "text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90",
        },
    },
    defaultVariants: {
        variant: "default",
    },
});
function Alert({ className, variant, ...props }) {
    return (React.createElement("div", { "data-slot": "alert", role: "alert", className: (0, utils_1.cn)(alertVariants({ variant }), className), ...props }));
}
function AlertTitle({ className, ...props }) {
    return (React.createElement("div", { "data-slot": "alert-title", className: (0, utils_1.cn)("col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight", className), ...props }));
}
function AlertDescription({ className, ...props }) {
    return (React.createElement("div", { "data-slot": "alert-description", className: (0, utils_1.cn)("text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed", className), ...props }));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWxlcnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbGVydC50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFpRVMsc0JBQUs7QUFBRSxnQ0FBVTtBQUFFLDRDQUFnQjtBQWpFNUMsNkNBQThCO0FBQzlCLHVFQUFpRTtBQUVqRSx1Q0FBZ0M7QUFFaEMsTUFBTSxhQUFhLEdBQUcsSUFBQSw4QkFBRyxFQUN2QixtT0FBbU8sRUFDbk87SUFDRSxRQUFRLEVBQUU7UUFDUixPQUFPLEVBQUU7WUFDUCxPQUFPLEVBQUUsOEJBQThCO1lBQ3ZDLFdBQVcsRUFDVCxtR0FBbUc7U0FDdEc7S0FDRjtJQUNELGVBQWUsRUFBRTtRQUNmLE9BQU8sRUFBRSxTQUFTO0tBQ25CO0NBQ0YsQ0FDRixDQUFBO0FBRUQsU0FBUyxLQUFLLENBQUMsRUFDYixTQUFTLEVBQ1QsT0FBTyxFQUNQLEdBQUcsS0FBSyxFQUN5RDtJQUNqRSxPQUFPLENBQ0wsMENBQ1ksT0FBTyxFQUNqQixJQUFJLEVBQUMsT0FBTyxFQUNaLFNBQVMsRUFBRSxJQUFBLFVBQUUsRUFBQyxhQUFhLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxLQUNoRCxLQUFLLEdBQ1QsQ0FDSCxDQUFBO0FBQ0gsQ0FBQztBQUVELFNBQVMsVUFBVSxDQUFDLEVBQUUsU0FBUyxFQUFFLEdBQUcsS0FBSyxFQUErQjtJQUN0RSxPQUFPLENBQ0wsMENBQ1ksYUFBYSxFQUN2QixTQUFTLEVBQUUsSUFBQSxVQUFFLEVBQ1gsNkRBQTZELEVBQzdELFNBQVMsQ0FDVixLQUNHLEtBQUssR0FDVCxDQUNILENBQUE7QUFDSCxDQUFDO0FBRUQsU0FBUyxnQkFBZ0IsQ0FBQyxFQUN4QixTQUFTLEVBQ1QsR0FBRyxLQUFLLEVBQ29CO0lBQzVCLE9BQU8sQ0FDTCwwQ0FDWSxtQkFBbUIsRUFDN0IsU0FBUyxFQUFFLElBQUEsVUFBRSxFQUNYLGdHQUFnRyxFQUNoRyxTQUFTLENBQ1YsS0FDRyxLQUFLLEdBQ1QsQ0FDSCxDQUFBO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFJlYWN0IGZyb20gXCJyZWFjdFwiXG5pbXBvcnQgeyBjdmEsIHR5cGUgVmFyaWFudFByb3BzIH0gZnJvbSBcImNsYXNzLXZhcmlhbmNlLWF1dGhvcml0eVwiXG5cbmltcG9ydCB7IGNuIH0gZnJvbSBcIkAvbGliL3V0aWxzXCJcblxuY29uc3QgYWxlcnRWYXJpYW50cyA9IGN2YShcbiAgXCJyZWxhdGl2ZSB3LWZ1bGwgcm91bmRlZC1sZyBib3JkZXIgcHgtNCBweS0zIHRleHQtc20gZ3JpZCBoYXMtWz5zdmddOmdyaWQtY29scy1bY2FsYyh2YXIoLS1zcGFjaW5nKSo0KV8xZnJdIGdyaWQtY29scy1bMF8xZnJdIGhhcy1bPnN2Z106Z2FwLXgtMyBnYXAteS0wLjUgaXRlbXMtc3RhcnQgWyY+c3ZnXTpzaXplLTQgWyY+c3ZnXTp0cmFuc2xhdGUteS0wLjUgWyY+c3ZnXTp0ZXh0LWN1cnJlbnRcIixcbiAge1xuICAgIHZhcmlhbnRzOiB7XG4gICAgICB2YXJpYW50OiB7XG4gICAgICAgIGRlZmF1bHQ6IFwiYmctY2FyZCB0ZXh0LWNhcmQtZm9yZWdyb3VuZFwiLFxuICAgICAgICBkZXN0cnVjdGl2ZTpcbiAgICAgICAgICBcInRleHQtZGVzdHJ1Y3RpdmUgYmctY2FyZCBbJj5zdmddOnRleHQtY3VycmVudCAqOmRhdGEtW3Nsb3Q9YWxlcnQtZGVzY3JpcHRpb25dOnRleHQtZGVzdHJ1Y3RpdmUvOTBcIixcbiAgICAgIH0sXG4gICAgfSxcbiAgICBkZWZhdWx0VmFyaWFudHM6IHtcbiAgICAgIHZhcmlhbnQ6IFwiZGVmYXVsdFwiLFxuICAgIH0sXG4gIH1cbilcblxuZnVuY3Rpb24gQWxlcnQoe1xuICBjbGFzc05hbWUsXG4gIHZhcmlhbnQsXG4gIC4uLnByb3BzXG59OiBSZWFjdC5Db21wb25lbnRQcm9wczxcImRpdlwiPiAmIFZhcmlhbnRQcm9wczx0eXBlb2YgYWxlcnRWYXJpYW50cz4pIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICBkYXRhLXNsb3Q9XCJhbGVydFwiXG4gICAgICByb2xlPVwiYWxlcnRcIlxuICAgICAgY2xhc3NOYW1lPXtjbihhbGVydFZhcmlhbnRzKHsgdmFyaWFudCB9KSwgY2xhc3NOYW1lKX1cbiAgICAgIHsuLi5wcm9wc31cbiAgICAvPlxuICApXG59XG5cbmZ1bmN0aW9uIEFsZXJ0VGl0bGUoeyBjbGFzc05hbWUsIC4uLnByb3BzIH06IFJlYWN0LkNvbXBvbmVudFByb3BzPFwiZGl2XCI+KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgZGF0YS1zbG90PVwiYWxlcnQtdGl0bGVcIlxuICAgICAgY2xhc3NOYW1lPXtjbihcbiAgICAgICAgXCJjb2wtc3RhcnQtMiBsaW5lLWNsYW1wLTEgbWluLWgtNCBmb250LW1lZGl1bSB0cmFja2luZy10aWdodFwiLFxuICAgICAgICBjbGFzc05hbWVcbiAgICAgICl9XG4gICAgICB7Li4ucHJvcHN9XG4gICAgLz5cbiAgKVxufVxuXG5mdW5jdGlvbiBBbGVydERlc2NyaXB0aW9uKHtcbiAgY2xhc3NOYW1lLFxuICAuLi5wcm9wc1xufTogUmVhY3QuQ29tcG9uZW50UHJvcHM8XCJkaXZcIj4pIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICBkYXRhLXNsb3Q9XCJhbGVydC1kZXNjcmlwdGlvblwiXG4gICAgICBjbGFzc05hbWU9e2NuKFxuICAgICAgICBcInRleHQtbXV0ZWQtZm9yZWdyb3VuZCBjb2wtc3RhcnQtMiBncmlkIGp1c3RpZnktaXRlbXMtc3RhcnQgZ2FwLTEgdGV4dC1zbSBbJl9wXTpsZWFkaW5nLXJlbGF4ZWRcIixcbiAgICAgICAgY2xhc3NOYW1lXG4gICAgICApfVxuICAgICAgey4uLnByb3BzfVxuICAgIC8+XG4gIClcbn1cblxuZXhwb3J0IHsgQWxlcnQsIEFsZXJ0VGl0bGUsIEFsZXJ0RGVzY3JpcHRpb24gfVxuIl19