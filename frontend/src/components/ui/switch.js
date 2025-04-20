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
exports.Switch = Switch;
const React = __importStar(require("react"));
const SwitchPrimitive = __importStar(require("@radix-ui/react-switch"));
const utils_1 = require("../../lib/utils");
function Switch({ className, ...props }) {
    return (React.createElement(SwitchPrimitive.Root, { "data-slot": "switch", className: (0, utils_1.cn)("peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50", className), ...props },
        React.createElement(SwitchPrimitive.Thumb, { "data-slot": "switch-thumb", className: (0, utils_1.cn)("bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0") })));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3dpdGNoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic3dpdGNoLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTRCUyx3QkFBTTtBQTVCZiw2Q0FBOEI7QUFDOUIsd0VBQXlEO0FBRXpELHVDQUFnQztBQUVoQyxTQUFTLE1BQU0sQ0FBQyxFQUNkLFNBQVMsRUFDVCxHQUFHLEtBQUssRUFDMEM7SUFDbEQsT0FBTyxDQUNMLG9CQUFDLGVBQWUsQ0FBQyxJQUFJLGlCQUNULFFBQVEsRUFDbEIsU0FBUyxFQUFFLElBQUEsVUFBRSxFQUNYLDJXQUEyVyxFQUMzVyxTQUFTLENBQ1YsS0FDRyxLQUFLO1FBRVQsb0JBQUMsZUFBZSxDQUFDLEtBQUssaUJBQ1YsY0FBYyxFQUN4QixTQUFTLEVBQUUsSUFBQSxVQUFFLEVBQ1gsMFFBQTBRLENBQzNRLEdBQ0QsQ0FDbUIsQ0FDeEIsQ0FBQTtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tIFwicmVhY3RcIlxuaW1wb3J0ICogYXMgU3dpdGNoUHJpbWl0aXZlIGZyb20gXCJAcmFkaXgtdWkvcmVhY3Qtc3dpdGNoXCJcblxuaW1wb3J0IHsgY24gfSBmcm9tIFwiQC9saWIvdXRpbHNcIlxuXG5mdW5jdGlvbiBTd2l0Y2goe1xuICBjbGFzc05hbWUsXG4gIC4uLnByb3BzXG59OiBSZWFjdC5Db21wb25lbnRQcm9wczx0eXBlb2YgU3dpdGNoUHJpbWl0aXZlLlJvb3Q+KSB7XG4gIHJldHVybiAoXG4gICAgPFN3aXRjaFByaW1pdGl2ZS5Sb290XG4gICAgICBkYXRhLXNsb3Q9XCJzd2l0Y2hcIlxuICAgICAgY2xhc3NOYW1lPXtjbihcbiAgICAgICAgXCJwZWVyIGRhdGEtW3N0YXRlPWNoZWNrZWRdOmJnLXByaW1hcnkgZGF0YS1bc3RhdGU9dW5jaGVja2VkXTpiZy1pbnB1dCBmb2N1cy12aXNpYmxlOmJvcmRlci1yaW5nIGZvY3VzLXZpc2libGU6cmluZy1yaW5nLzUwIGRhcms6ZGF0YS1bc3RhdGU9dW5jaGVja2VkXTpiZy1pbnB1dC84MCBpbmxpbmUtZmxleCBoLVsxLjE1cmVtXSB3LTggc2hyaW5rLTAgaXRlbXMtY2VudGVyIHJvdW5kZWQtZnVsbCBib3JkZXIgYm9yZGVyLXRyYW5zcGFyZW50IHNoYWRvdy14cyB0cmFuc2l0aW9uLWFsbCBvdXRsaW5lLW5vbmUgZm9jdXMtdmlzaWJsZTpyaW5nLVszcHhdIGRpc2FibGVkOmN1cnNvci1ub3QtYWxsb3dlZCBkaXNhYmxlZDpvcGFjaXR5LTUwXCIsXG4gICAgICAgIGNsYXNzTmFtZVxuICAgICAgKX1cbiAgICAgIHsuLi5wcm9wc31cbiAgICA+XG4gICAgICA8U3dpdGNoUHJpbWl0aXZlLlRodW1iXG4gICAgICAgIGRhdGEtc2xvdD1cInN3aXRjaC10aHVtYlwiXG4gICAgICAgIGNsYXNzTmFtZT17Y24oXG4gICAgICAgICAgXCJiZy1iYWNrZ3JvdW5kIGRhcms6ZGF0YS1bc3RhdGU9dW5jaGVja2VkXTpiZy1mb3JlZ3JvdW5kIGRhcms6ZGF0YS1bc3RhdGU9Y2hlY2tlZF06YmctcHJpbWFyeS1mb3JlZ3JvdW5kIHBvaW50ZXItZXZlbnRzLW5vbmUgYmxvY2sgc2l6ZS00IHJvdW5kZWQtZnVsbCByaW5nLTAgdHJhbnNpdGlvbi10cmFuc2Zvcm0gZGF0YS1bc3RhdGU9Y2hlY2tlZF06dHJhbnNsYXRlLXgtW2NhbGMoMTAwJS0ycHgpXSBkYXRhLVtzdGF0ZT11bmNoZWNrZWRdOnRyYW5zbGF0ZS14LTBcIlxuICAgICAgICApfVxuICAgICAgLz5cbiAgICA8L1N3aXRjaFByaW1pdGl2ZS5Sb290PlxuICApXG59XG5cbmV4cG9ydCB7IFN3aXRjaCB9XG4iXX0=