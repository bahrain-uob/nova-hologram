"use strict";
"use client";
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
exports.Label = Label;
const React = __importStar(require("react"));
const LabelPrimitive = __importStar(require("@radix-ui/react-label"));
const utils_1 = require("../../lib/utils");
function Label({ className, ...props }) {
    return (React.createElement(LabelPrimitive.Root, { "data-slot": "label", className: (0, utils_1.cn)("flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50", className), ...props }));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFiZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJsYWJlbC50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLFlBQVksQ0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF1Qkgsc0JBQUs7QUFyQmQsNkNBQThCO0FBQzlCLHNFQUF1RDtBQUV2RCx1Q0FBZ0M7QUFFaEMsU0FBUyxLQUFLLENBQUMsRUFDYixTQUFTLEVBQ1QsR0FBRyxLQUFLLEVBQ3lDO0lBQ2pELE9BQU8sQ0FDTCxvQkFBQyxjQUFjLENBQUMsSUFBSSxpQkFDUixPQUFPLEVBQ2pCLFNBQVMsRUFBRSxJQUFBLFVBQUUsRUFDWCxxTkFBcU4sRUFDck4sU0FBUyxDQUNWLEtBQ0csS0FBSyxHQUNULENBQ0gsQ0FBQTtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBjbGllbnRcIlxuXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tIFwicmVhY3RcIlxuaW1wb3J0ICogYXMgTGFiZWxQcmltaXRpdmUgZnJvbSBcIkByYWRpeC11aS9yZWFjdC1sYWJlbFwiXG5cbmltcG9ydCB7IGNuIH0gZnJvbSBcIkAvbGliL3V0aWxzXCJcblxuZnVuY3Rpb24gTGFiZWwoe1xuICBjbGFzc05hbWUsXG4gIC4uLnByb3BzXG59OiBSZWFjdC5Db21wb25lbnRQcm9wczx0eXBlb2YgTGFiZWxQcmltaXRpdmUuUm9vdD4pIHtcbiAgcmV0dXJuIChcbiAgICA8TGFiZWxQcmltaXRpdmUuUm9vdFxuICAgICAgZGF0YS1zbG90PVwibGFiZWxcIlxuICAgICAgY2xhc3NOYW1lPXtjbihcbiAgICAgICAgXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiB0ZXh0LXNtIGxlYWRpbmctbm9uZSBmb250LW1lZGl1bSBzZWxlY3Qtbm9uZSBncm91cC1kYXRhLVtkaXNhYmxlZD10cnVlXTpwb2ludGVyLWV2ZW50cy1ub25lIGdyb3VwLWRhdGEtW2Rpc2FibGVkPXRydWVdOm9wYWNpdHktNTAgcGVlci1kaXNhYmxlZDpjdXJzb3Itbm90LWFsbG93ZWQgcGVlci1kaXNhYmxlZDpvcGFjaXR5LTUwXCIsXG4gICAgICAgIGNsYXNzTmFtZVxuICAgICAgKX1cbiAgICAgIHsuLi5wcm9wc31cbiAgICAvPlxuICApXG59XG5cbmV4cG9ydCB7IExhYmVsIH1cbiJdfQ==