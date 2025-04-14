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
exports.ScrollArea = ScrollArea;
exports.ScrollBar = ScrollBar;
const React = __importStar(require("react"));
const ScrollAreaPrimitive = __importStar(require("@radix-ui/react-scroll-area"));
const utils_1 = require("../../lib/utils");
function ScrollArea({ className, children, ...props }) {
    return (React.createElement(ScrollAreaPrimitive.Root, { "data-slot": "scroll-area", className: (0, utils_1.cn)("relative", className), ...props },
        React.createElement(ScrollAreaPrimitive.Viewport, { "data-slot": "scroll-area-viewport", className: "focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1" }, children),
        React.createElement(ScrollBar, null),
        React.createElement(ScrollAreaPrimitive.Corner, null)));
}
function ScrollBar({ className, orientation = "vertical", ...props }) {
    return (React.createElement(ScrollAreaPrimitive.ScrollAreaScrollbar, { "data-slot": "scroll-area-scrollbar", orientation: orientation, className: (0, utils_1.cn)("flex touch-none p-px transition-colors select-none", orientation === "vertical" &&
            "h-full w-2.5 border-l border-l-transparent", orientation === "horizontal" &&
            "h-2.5 flex-col border-t border-t-transparent", className), ...props },
        React.createElement(ScrollAreaPrimitive.ScrollAreaThumb, { "data-slot": "scroll-area-thumb", className: "bg-border relative flex-1 rounded-full" })));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Nyb2xsLWFyZWEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzY3JvbGwtYXJlYS50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF1RFMsZ0NBQVU7QUFBRSw4QkFBUztBQXZEOUIsNkNBQThCO0FBQzlCLGlGQUFrRTtBQUVsRSx1Q0FBZ0M7QUFFaEMsU0FBUyxVQUFVLENBQUMsRUFDbEIsU0FBUyxFQUNULFFBQVEsRUFDUixHQUFHLEtBQUssRUFDOEM7SUFDdEQsT0FBTyxDQUNMLG9CQUFDLG1CQUFtQixDQUFDLElBQUksaUJBQ2IsYUFBYSxFQUN2QixTQUFTLEVBQUUsSUFBQSxVQUFFLEVBQUMsVUFBVSxFQUFFLFNBQVMsQ0FBQyxLQUNoQyxLQUFLO1FBRVQsb0JBQUMsbUJBQW1CLENBQUMsUUFBUSxpQkFDakIsc0JBQXNCLEVBQ2hDLFNBQVMsRUFBQyxvSkFBb0osSUFFN0osUUFBUSxDQUNvQjtRQUMvQixvQkFBQyxTQUFTLE9BQUc7UUFDYixvQkFBQyxtQkFBbUIsQ0FBQyxNQUFNLE9BQUcsQ0FDTCxDQUM1QixDQUFBO0FBQ0gsQ0FBQztBQUVELFNBQVMsU0FBUyxDQUFDLEVBQ2pCLFNBQVMsRUFDVCxXQUFXLEdBQUcsVUFBVSxFQUN4QixHQUFHLEtBQUssRUFDNkQ7SUFDckUsT0FBTyxDQUNMLG9CQUFDLG1CQUFtQixDQUFDLG1CQUFtQixpQkFDNUIsdUJBQXVCLEVBQ2pDLFdBQVcsRUFBRSxXQUFXLEVBQ3hCLFNBQVMsRUFBRSxJQUFBLFVBQUUsRUFDWCxvREFBb0QsRUFDcEQsV0FBVyxLQUFLLFVBQVU7WUFDeEIsNENBQTRDLEVBQzlDLFdBQVcsS0FBSyxZQUFZO1lBQzFCLDhDQUE4QyxFQUNoRCxTQUFTLENBQ1YsS0FDRyxLQUFLO1FBRVQsb0JBQUMsbUJBQW1CLENBQUMsZUFBZSxpQkFDeEIsbUJBQW1CLEVBQzdCLFNBQVMsRUFBQyx3Q0FBd0MsR0FDbEQsQ0FDc0MsQ0FDM0MsQ0FBQTtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tIFwicmVhY3RcIlxuaW1wb3J0ICogYXMgU2Nyb2xsQXJlYVByaW1pdGl2ZSBmcm9tIFwiQHJhZGl4LXVpL3JlYWN0LXNjcm9sbC1hcmVhXCJcblxuaW1wb3J0IHsgY24gfSBmcm9tIFwiQC9saWIvdXRpbHNcIlxuXG5mdW5jdGlvbiBTY3JvbGxBcmVhKHtcbiAgY2xhc3NOYW1lLFxuICBjaGlsZHJlbixcbiAgLi4ucHJvcHNcbn06IFJlYWN0LkNvbXBvbmVudFByb3BzPHR5cGVvZiBTY3JvbGxBcmVhUHJpbWl0aXZlLlJvb3Q+KSB7XG4gIHJldHVybiAoXG4gICAgPFNjcm9sbEFyZWFQcmltaXRpdmUuUm9vdFxuICAgICAgZGF0YS1zbG90PVwic2Nyb2xsLWFyZWFcIlxuICAgICAgY2xhc3NOYW1lPXtjbihcInJlbGF0aXZlXCIsIGNsYXNzTmFtZSl9XG4gICAgICB7Li4ucHJvcHN9XG4gICAgPlxuICAgICAgPFNjcm9sbEFyZWFQcmltaXRpdmUuVmlld3BvcnRcbiAgICAgICAgZGF0YS1zbG90PVwic2Nyb2xsLWFyZWEtdmlld3BvcnRcIlxuICAgICAgICBjbGFzc05hbWU9XCJmb2N1cy12aXNpYmxlOnJpbmctcmluZy81MCBzaXplLWZ1bGwgcm91bmRlZC1baW5oZXJpdF0gdHJhbnNpdGlvbi1bY29sb3IsYm94LXNoYWRvd10gb3V0bGluZS1ub25lIGZvY3VzLXZpc2libGU6cmluZy1bM3B4XSBmb2N1cy12aXNpYmxlOm91dGxpbmUtMVwiXG4gICAgICA+XG4gICAgICAgIHtjaGlsZHJlbn1cbiAgICAgIDwvU2Nyb2xsQXJlYVByaW1pdGl2ZS5WaWV3cG9ydD5cbiAgICAgIDxTY3JvbGxCYXIgLz5cbiAgICAgIDxTY3JvbGxBcmVhUHJpbWl0aXZlLkNvcm5lciAvPlxuICAgIDwvU2Nyb2xsQXJlYVByaW1pdGl2ZS5Sb290PlxuICApXG59XG5cbmZ1bmN0aW9uIFNjcm9sbEJhcih7XG4gIGNsYXNzTmFtZSxcbiAgb3JpZW50YXRpb24gPSBcInZlcnRpY2FsXCIsXG4gIC4uLnByb3BzXG59OiBSZWFjdC5Db21wb25lbnRQcm9wczx0eXBlb2YgU2Nyb2xsQXJlYVByaW1pdGl2ZS5TY3JvbGxBcmVhU2Nyb2xsYmFyPikge1xuICByZXR1cm4gKFxuICAgIDxTY3JvbGxBcmVhUHJpbWl0aXZlLlNjcm9sbEFyZWFTY3JvbGxiYXJcbiAgICAgIGRhdGEtc2xvdD1cInNjcm9sbC1hcmVhLXNjcm9sbGJhclwiXG4gICAgICBvcmllbnRhdGlvbj17b3JpZW50YXRpb259XG4gICAgICBjbGFzc05hbWU9e2NuKFxuICAgICAgICBcImZsZXggdG91Y2gtbm9uZSBwLXB4IHRyYW5zaXRpb24tY29sb3JzIHNlbGVjdC1ub25lXCIsXG4gICAgICAgIG9yaWVudGF0aW9uID09PSBcInZlcnRpY2FsXCIgJiZcbiAgICAgICAgICBcImgtZnVsbCB3LTIuNSBib3JkZXItbCBib3JkZXItbC10cmFuc3BhcmVudFwiLFxuICAgICAgICBvcmllbnRhdGlvbiA9PT0gXCJob3Jpem9udGFsXCIgJiZcbiAgICAgICAgICBcImgtMi41IGZsZXgtY29sIGJvcmRlci10IGJvcmRlci10LXRyYW5zcGFyZW50XCIsXG4gICAgICAgIGNsYXNzTmFtZVxuICAgICAgKX1cbiAgICAgIHsuLi5wcm9wc31cbiAgICA+XG4gICAgICA8U2Nyb2xsQXJlYVByaW1pdGl2ZS5TY3JvbGxBcmVhVGh1bWJcbiAgICAgICAgZGF0YS1zbG90PVwic2Nyb2xsLWFyZWEtdGh1bWJcIlxuICAgICAgICBjbGFzc05hbWU9XCJiZy1ib3JkZXIgcmVsYXRpdmUgZmxleC0xIHJvdW5kZWQtZnVsbFwiXG4gICAgICAvPlxuICAgIDwvU2Nyb2xsQXJlYVByaW1pdGl2ZS5TY3JvbGxBcmVhU2Nyb2xsYmFyPlxuICApXG59XG5cbmV4cG9ydCB7IFNjcm9sbEFyZWEsIFNjcm9sbEJhciB9XG4iXX0=