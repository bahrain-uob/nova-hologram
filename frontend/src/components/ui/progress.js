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
exports.Progress = Progress;
const React = __importStar(require("react"));
const ProgressPrimitive = __importStar(require("@radix-ui/react-progress"));
const utils_1 = require("../../lib/utils");
function Progress({ className, value, ...props }) {
    return (React.createElement(ProgressPrimitive.Root, { "data-slot": "progress", className: (0, utils_1.cn)("bg-primary/20 relative h-2 w-full overflow-hidden rounded-full", className), ...props },
        React.createElement(ProgressPrimitive.Indicator, { "data-slot": "progress-indicator", className: "bg-primary h-full w-full flex-1 transition-all", style: { transform: `translateX(-${100 - (value || 0)}%)` } })));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZ3Jlc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJwcm9ncmVzcy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUE0QlMsNEJBQVE7QUE1QmpCLDZDQUE4QjtBQUM5Qiw0RUFBNkQ7QUFFN0QsdUNBQWdDO0FBRWhDLFNBQVMsUUFBUSxDQUFDLEVBQ2hCLFNBQVMsRUFDVCxLQUFLLEVBQ0wsR0FBRyxLQUFLLEVBQzRDO0lBQ3BELE9BQU8sQ0FDTCxvQkFBQyxpQkFBaUIsQ0FBQyxJQUFJLGlCQUNYLFVBQVUsRUFDcEIsU0FBUyxFQUFFLElBQUEsVUFBRSxFQUNYLGdFQUFnRSxFQUNoRSxTQUFTLENBQ1YsS0FDRyxLQUFLO1FBRVQsb0JBQUMsaUJBQWlCLENBQUMsU0FBUyxpQkFDaEIsb0JBQW9CLEVBQzlCLFNBQVMsRUFBQyxnREFBZ0QsRUFDMUQsS0FBSyxFQUFFLEVBQUUsU0FBUyxFQUFFLGVBQWUsR0FBRyxHQUFHLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsR0FDM0QsQ0FDcUIsQ0FDMUIsQ0FBQTtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tIFwicmVhY3RcIlxuaW1wb3J0ICogYXMgUHJvZ3Jlc3NQcmltaXRpdmUgZnJvbSBcIkByYWRpeC11aS9yZWFjdC1wcm9ncmVzc1wiXG5cbmltcG9ydCB7IGNuIH0gZnJvbSBcIkAvbGliL3V0aWxzXCJcblxuZnVuY3Rpb24gUHJvZ3Jlc3Moe1xuICBjbGFzc05hbWUsXG4gIHZhbHVlLFxuICAuLi5wcm9wc1xufTogUmVhY3QuQ29tcG9uZW50UHJvcHM8dHlwZW9mIFByb2dyZXNzUHJpbWl0aXZlLlJvb3Q+KSB7XG4gIHJldHVybiAoXG4gICAgPFByb2dyZXNzUHJpbWl0aXZlLlJvb3RcbiAgICAgIGRhdGEtc2xvdD1cInByb2dyZXNzXCJcbiAgICAgIGNsYXNzTmFtZT17Y24oXG4gICAgICAgIFwiYmctcHJpbWFyeS8yMCByZWxhdGl2ZSBoLTIgdy1mdWxsIG92ZXJmbG93LWhpZGRlbiByb3VuZGVkLWZ1bGxcIixcbiAgICAgICAgY2xhc3NOYW1lXG4gICAgICApfVxuICAgICAgey4uLnByb3BzfVxuICAgID5cbiAgICAgIDxQcm9ncmVzc1ByaW1pdGl2ZS5JbmRpY2F0b3JcbiAgICAgICAgZGF0YS1zbG90PVwicHJvZ3Jlc3MtaW5kaWNhdG9yXCJcbiAgICAgICAgY2xhc3NOYW1lPVwiYmctcHJpbWFyeSBoLWZ1bGwgdy1mdWxsIGZsZXgtMSB0cmFuc2l0aW9uLWFsbFwiXG4gICAgICAgIHN0eWxlPXt7IHRyYW5zZm9ybTogYHRyYW5zbGF0ZVgoLSR7MTAwIC0gKHZhbHVlIHx8IDApfSUpYCB9fVxuICAgICAgLz5cbiAgICA8L1Byb2dyZXNzUHJpbWl0aXZlLlJvb3Q+XG4gIClcbn1cblxuZXhwb3J0IHsgUHJvZ3Jlc3MgfVxuIl19