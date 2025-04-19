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
exports.HoverCard = HoverCard;
exports.HoverCardTrigger = HoverCardTrigger;
exports.HoverCardContent = HoverCardContent;
const React = __importStar(require("react"));
const HoverCardPrimitive = __importStar(require("@radix-ui/react-hover-card"));
const utils_1 = require("../../lib/utils");
function HoverCard({ ...props }) {
    return React.createElement(HoverCardPrimitive.Root, { "data-slot": "hover-card", ...props });
}
function HoverCardTrigger({ ...props }) {
    return (React.createElement(HoverCardPrimitive.Trigger, { "data-slot": "hover-card-trigger", ...props }));
}
function HoverCardContent({ className, align = "center", sideOffset = 4, ...props }) {
    return (React.createElement(HoverCardPrimitive.Portal, { "data-slot": "hover-card-portal" },
        React.createElement(HoverCardPrimitive.Content, { "data-slot": "hover-card-content", align: align, sideOffset: sideOffset, className: (0, utils_1.cn)("bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-64 origin-(--radix-hover-card-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden", className), ...props })));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG92ZXItY2FyZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImhvdmVyLWNhcmQudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBeUNTLDhCQUFTO0FBQUUsNENBQWdCO0FBQUUsNENBQWdCO0FBekN0RCw2Q0FBOEI7QUFDOUIsK0VBQWdFO0FBRWhFLHVDQUFnQztBQUVoQyxTQUFTLFNBQVMsQ0FBQyxFQUNqQixHQUFHLEtBQUssRUFDNkM7SUFDckQsT0FBTyxvQkFBQyxrQkFBa0IsQ0FBQyxJQUFJLGlCQUFXLFlBQVksS0FBSyxLQUFLLEdBQUksQ0FBQTtBQUN0RSxDQUFDO0FBRUQsU0FBUyxnQkFBZ0IsQ0FBQyxFQUN4QixHQUFHLEtBQUssRUFDZ0Q7SUFDeEQsT0FBTyxDQUNMLG9CQUFDLGtCQUFrQixDQUFDLE9BQU8saUJBQVcsb0JBQW9CLEtBQUssS0FBSyxHQUFJLENBQ3pFLENBQUE7QUFDSCxDQUFDO0FBRUQsU0FBUyxnQkFBZ0IsQ0FBQyxFQUN4QixTQUFTLEVBQ1QsS0FBSyxHQUFHLFFBQVEsRUFDaEIsVUFBVSxHQUFHLENBQUMsRUFDZCxHQUFHLEtBQUssRUFDZ0Q7SUFDeEQsT0FBTyxDQUNMLG9CQUFDLGtCQUFrQixDQUFDLE1BQU0saUJBQVcsbUJBQW1CO1FBQ3RELG9CQUFDLGtCQUFrQixDQUFDLE9BQU8saUJBQ2Ysb0JBQW9CLEVBQzlCLEtBQUssRUFBRSxLQUFLLEVBQ1osVUFBVSxFQUFFLFVBQVUsRUFDdEIsU0FBUyxFQUFFLElBQUEsVUFBRSxFQUNYLG1lQUFtZSxFQUNuZSxTQUFTLENBQ1YsS0FDRyxLQUFLLEdBQ1QsQ0FDd0IsQ0FDN0IsQ0FBQTtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tIFwicmVhY3RcIlxuaW1wb3J0ICogYXMgSG92ZXJDYXJkUHJpbWl0aXZlIGZyb20gXCJAcmFkaXgtdWkvcmVhY3QtaG92ZXItY2FyZFwiXG5cbmltcG9ydCB7IGNuIH0gZnJvbSBcIkAvbGliL3V0aWxzXCJcblxuZnVuY3Rpb24gSG92ZXJDYXJkKHtcbiAgLi4ucHJvcHNcbn06IFJlYWN0LkNvbXBvbmVudFByb3BzPHR5cGVvZiBIb3ZlckNhcmRQcmltaXRpdmUuUm9vdD4pIHtcbiAgcmV0dXJuIDxIb3ZlckNhcmRQcmltaXRpdmUuUm9vdCBkYXRhLXNsb3Q9XCJob3Zlci1jYXJkXCIgey4uLnByb3BzfSAvPlxufVxuXG5mdW5jdGlvbiBIb3ZlckNhcmRUcmlnZ2VyKHtcbiAgLi4ucHJvcHNcbn06IFJlYWN0LkNvbXBvbmVudFByb3BzPHR5cGVvZiBIb3ZlckNhcmRQcmltaXRpdmUuVHJpZ2dlcj4pIHtcbiAgcmV0dXJuIChcbiAgICA8SG92ZXJDYXJkUHJpbWl0aXZlLlRyaWdnZXIgZGF0YS1zbG90PVwiaG92ZXItY2FyZC10cmlnZ2VyXCIgey4uLnByb3BzfSAvPlxuICApXG59XG5cbmZ1bmN0aW9uIEhvdmVyQ2FyZENvbnRlbnQoe1xuICBjbGFzc05hbWUsXG4gIGFsaWduID0gXCJjZW50ZXJcIixcbiAgc2lkZU9mZnNldCA9IDQsXG4gIC4uLnByb3BzXG59OiBSZWFjdC5Db21wb25lbnRQcm9wczx0eXBlb2YgSG92ZXJDYXJkUHJpbWl0aXZlLkNvbnRlbnQ+KSB7XG4gIHJldHVybiAoXG4gICAgPEhvdmVyQ2FyZFByaW1pdGl2ZS5Qb3J0YWwgZGF0YS1zbG90PVwiaG92ZXItY2FyZC1wb3J0YWxcIj5cbiAgICAgIDxIb3ZlckNhcmRQcmltaXRpdmUuQ29udGVudFxuICAgICAgICBkYXRhLXNsb3Q9XCJob3Zlci1jYXJkLWNvbnRlbnRcIlxuICAgICAgICBhbGlnbj17YWxpZ259XG4gICAgICAgIHNpZGVPZmZzZXQ9e3NpZGVPZmZzZXR9XG4gICAgICAgIGNsYXNzTmFtZT17Y24oXG4gICAgICAgICAgXCJiZy1wb3BvdmVyIHRleHQtcG9wb3Zlci1mb3JlZ3JvdW5kIGRhdGEtW3N0YXRlPW9wZW5dOmFuaW1hdGUtaW4gZGF0YS1bc3RhdGU9Y2xvc2VkXTphbmltYXRlLW91dCBkYXRhLVtzdGF0ZT1jbG9zZWRdOmZhZGUtb3V0LTAgZGF0YS1bc3RhdGU9b3Blbl06ZmFkZS1pbi0wIGRhdGEtW3N0YXRlPWNsb3NlZF06em9vbS1vdXQtOTUgZGF0YS1bc3RhdGU9b3Blbl06em9vbS1pbi05NSBkYXRhLVtzaWRlPWJvdHRvbV06c2xpZGUtaW4tZnJvbS10b3AtMiBkYXRhLVtzaWRlPWxlZnRdOnNsaWRlLWluLWZyb20tcmlnaHQtMiBkYXRhLVtzaWRlPXJpZ2h0XTpzbGlkZS1pbi1mcm9tLWxlZnQtMiBkYXRhLVtzaWRlPXRvcF06c2xpZGUtaW4tZnJvbS1ib3R0b20tMiB6LTUwIHctNjQgb3JpZ2luLSgtLXJhZGl4LWhvdmVyLWNhcmQtY29udGVudC10cmFuc2Zvcm0tb3JpZ2luKSByb3VuZGVkLW1kIGJvcmRlciBwLTQgc2hhZG93LW1kIG91dGxpbmUtaGlkZGVuXCIsXG4gICAgICAgICAgY2xhc3NOYW1lXG4gICAgICAgICl9XG4gICAgICAgIHsuLi5wcm9wc31cbiAgICAgIC8+XG4gICAgPC9Ib3ZlckNhcmRQcmltaXRpdmUuUG9ydGFsPlxuICApXG59XG5cbmV4cG9ydCB7IEhvdmVyQ2FyZCwgSG92ZXJDYXJkVHJpZ2dlciwgSG92ZXJDYXJkQ29udGVudCB9XG4iXX0=