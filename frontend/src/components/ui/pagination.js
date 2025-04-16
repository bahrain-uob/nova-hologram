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
exports.Pagination = Pagination;
exports.PaginationContent = PaginationContent;
exports.PaginationLink = PaginationLink;
exports.PaginationItem = PaginationItem;
exports.PaginationPrevious = PaginationPrevious;
exports.PaginationNext = PaginationNext;
exports.PaginationEllipsis = PaginationEllipsis;
const React = __importStar(require("react"));
const lucide_react_1 = require("lucide-react");
const utils_1 = require("../../lib/utils");
const button_1 = require("@/components/ui/button");
function Pagination({ className, ...props }) {
    return (React.createElement("nav", { role: "navigation", "aria-label": "pagination", "data-slot": "pagination", className: (0, utils_1.cn)("mx-auto flex w-full justify-center", className), ...props }));
}
function PaginationContent({ className, ...props }) {
    return (React.createElement("ul", { "data-slot": "pagination-content", className: (0, utils_1.cn)("flex flex-row items-center gap-1", className), ...props }));
}
function PaginationItem({ ...props }) {
    return React.createElement("li", { "data-slot": "pagination-item", ...props });
}
function PaginationLink({ className, isActive, size = "icon", ...props }) {
    return (React.createElement("a", { "aria-current": isActive ? "page" : undefined, "data-slot": "pagination-link", "data-active": isActive, className: (0, utils_1.cn)((0, button_1.buttonVariants)({
            variant: isActive ? "outline" : "ghost",
            size,
        }), className), ...props }));
}
function PaginationPrevious({ className, ...props }) {
    return (React.createElement(PaginationLink, { "aria-label": "Go to previous page", size: "default", className: (0, utils_1.cn)("gap-1 px-2.5 sm:pl-2.5", className), ...props },
        React.createElement(lucide_react_1.ChevronLeftIcon, null),
        React.createElement("span", { className: "hidden sm:block" }, "Previous")));
}
function PaginationNext({ className, ...props }) {
    return (React.createElement(PaginationLink, { "aria-label": "Go to next page", size: "default", className: (0, utils_1.cn)("gap-1 px-2.5 sm:pr-2.5", className), ...props },
        React.createElement("span", { className: "hidden sm:block" }, "Next"),
        React.createElement(lucide_react_1.ChevronRightIcon, null)));
}
function PaginationEllipsis({ className, ...props }) {
    return (React.createElement("span", { "aria-hidden": true, "data-slot": "pagination-ellipsis", className: (0, utils_1.cn)("flex size-9 items-center justify-center", className), ...props },
        React.createElement(lucide_react_1.MoreHorizontalIcon, { className: "size-4" }),
        React.createElement("span", { className: "sr-only" }, "More pages")));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFnaW5hdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInBhZ2luYXRpb24udHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBdUhFLGdDQUFVO0FBQ1YsOENBQWlCO0FBQ2pCLHdDQUFjO0FBQ2Qsd0NBQWM7QUFDZCxnREFBa0I7QUFDbEIsd0NBQWM7QUFDZCxnREFBa0I7QUE3SHBCLDZDQUE4QjtBQUM5QiwrQ0FJcUI7QUFFckIsdUNBQWdDO0FBQ2hDLG1EQUErRDtBQUUvRCxTQUFTLFVBQVUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxHQUFHLEtBQUssRUFBK0I7SUFDdEUsT0FBTyxDQUNMLDZCQUNFLElBQUksRUFBQyxZQUFZLGdCQUNOLFlBQVksZUFDYixZQUFZLEVBQ3RCLFNBQVMsRUFBRSxJQUFBLFVBQUUsRUFBQyxvQ0FBb0MsRUFBRSxTQUFTLENBQUMsS0FDMUQsS0FBSyxHQUNULENBQ0gsQ0FBQTtBQUNILENBQUM7QUFFRCxTQUFTLGlCQUFpQixDQUFDLEVBQ3pCLFNBQVMsRUFDVCxHQUFHLEtBQUssRUFDbUI7SUFDM0IsT0FBTyxDQUNMLHlDQUNZLG9CQUFvQixFQUM5QixTQUFTLEVBQUUsSUFBQSxVQUFFLEVBQUMsa0NBQWtDLEVBQUUsU0FBUyxDQUFDLEtBQ3hELEtBQUssR0FDVCxDQUNILENBQUE7QUFDSCxDQUFDO0FBRUQsU0FBUyxjQUFjLENBQUMsRUFBRSxHQUFHLEtBQUssRUFBOEI7SUFDOUQsT0FBTyx5Q0FBYyxpQkFBaUIsS0FBSyxLQUFLLEdBQUksQ0FBQTtBQUN0RCxDQUFDO0FBT0QsU0FBUyxjQUFjLENBQUMsRUFDdEIsU0FBUyxFQUNULFFBQVEsRUFDUixJQUFJLEdBQUcsTUFBTSxFQUNiLEdBQUcsS0FBSyxFQUNZO0lBQ3BCLE9BQU8sQ0FDTCwyQ0FDZ0IsUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFNBQVMsZUFDakMsaUJBQWlCLGlCQUNkLFFBQVEsRUFDckIsU0FBUyxFQUFFLElBQUEsVUFBRSxFQUNYLElBQUEsdUJBQWMsRUFBQztZQUNiLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsT0FBTztZQUN2QyxJQUFJO1NBQ0wsQ0FBQyxFQUNGLFNBQVMsQ0FDVixLQUNHLEtBQUssR0FDVCxDQUNILENBQUE7QUFDSCxDQUFDO0FBRUQsU0FBUyxrQkFBa0IsQ0FBQyxFQUMxQixTQUFTLEVBQ1QsR0FBRyxLQUFLLEVBQ29DO0lBQzVDLE9BQU8sQ0FDTCxvQkFBQyxjQUFjLGtCQUNGLHFCQUFxQixFQUNoQyxJQUFJLEVBQUMsU0FBUyxFQUNkLFNBQVMsRUFBRSxJQUFBLFVBQUUsRUFBQyx3QkFBd0IsRUFBRSxTQUFTLENBQUMsS0FDOUMsS0FBSztRQUVULG9CQUFDLDhCQUFlLE9BQUc7UUFDbkIsOEJBQU0sU0FBUyxFQUFDLGlCQUFpQixlQUFnQixDQUNsQyxDQUNsQixDQUFBO0FBQ0gsQ0FBQztBQUVELFNBQVMsY0FBYyxDQUFDLEVBQ3RCLFNBQVMsRUFDVCxHQUFHLEtBQUssRUFDb0M7SUFDNUMsT0FBTyxDQUNMLG9CQUFDLGNBQWMsa0JBQ0YsaUJBQWlCLEVBQzVCLElBQUksRUFBQyxTQUFTLEVBQ2QsU0FBUyxFQUFFLElBQUEsVUFBRSxFQUFDLHdCQUF3QixFQUFFLFNBQVMsQ0FBQyxLQUM5QyxLQUFLO1FBRVQsOEJBQU0sU0FBUyxFQUFDLGlCQUFpQixXQUFZO1FBQzdDLG9CQUFDLCtCQUFnQixPQUFHLENBQ0wsQ0FDbEIsQ0FBQTtBQUNILENBQUM7QUFFRCxTQUFTLGtCQUFrQixDQUFDLEVBQzFCLFNBQVMsRUFDVCxHQUFHLEtBQUssRUFDcUI7SUFDN0IsT0FBTyxDQUNMLGdFQUVZLHFCQUFxQixFQUMvQixTQUFTLEVBQUUsSUFBQSxVQUFFLEVBQUMseUNBQXlDLEVBQUUsU0FBUyxDQUFDLEtBQy9ELEtBQUs7UUFFVCxvQkFBQyxpQ0FBa0IsSUFBQyxTQUFTLEVBQUMsUUFBUSxHQUFHO1FBQ3pDLDhCQUFNLFNBQVMsRUFBQyxTQUFTLGlCQUFrQixDQUN0QyxDQUNSLENBQUE7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSBcInJlYWN0XCJcbmltcG9ydCB7XG4gIENoZXZyb25MZWZ0SWNvbixcbiAgQ2hldnJvblJpZ2h0SWNvbixcbiAgTW9yZUhvcml6b250YWxJY29uLFxufSBmcm9tIFwibHVjaWRlLXJlYWN0XCJcblxuaW1wb3J0IHsgY24gfSBmcm9tIFwiQC9saWIvdXRpbHNcIlxuaW1wb3J0IHsgQnV0dG9uLCBidXR0b25WYXJpYW50cyB9IGZyb20gXCJAL2NvbXBvbmVudHMvdWkvYnV0dG9uXCJcblxuZnVuY3Rpb24gUGFnaW5hdGlvbih7IGNsYXNzTmFtZSwgLi4ucHJvcHMgfTogUmVhY3QuQ29tcG9uZW50UHJvcHM8XCJuYXZcIj4pIHtcbiAgcmV0dXJuIChcbiAgICA8bmF2XG4gICAgICByb2xlPVwibmF2aWdhdGlvblwiXG4gICAgICBhcmlhLWxhYmVsPVwicGFnaW5hdGlvblwiXG4gICAgICBkYXRhLXNsb3Q9XCJwYWdpbmF0aW9uXCJcbiAgICAgIGNsYXNzTmFtZT17Y24oXCJteC1hdXRvIGZsZXggdy1mdWxsIGp1c3RpZnktY2VudGVyXCIsIGNsYXNzTmFtZSl9XG4gICAgICB7Li4ucHJvcHN9XG4gICAgLz5cbiAgKVxufVxuXG5mdW5jdGlvbiBQYWdpbmF0aW9uQ29udGVudCh7XG4gIGNsYXNzTmFtZSxcbiAgLi4ucHJvcHNcbn06IFJlYWN0LkNvbXBvbmVudFByb3BzPFwidWxcIj4pIHtcbiAgcmV0dXJuIChcbiAgICA8dWxcbiAgICAgIGRhdGEtc2xvdD1cInBhZ2luYXRpb24tY29udGVudFwiXG4gICAgICBjbGFzc05hbWU9e2NuKFwiZmxleCBmbGV4LXJvdyBpdGVtcy1jZW50ZXIgZ2FwLTFcIiwgY2xhc3NOYW1lKX1cbiAgICAgIHsuLi5wcm9wc31cbiAgICAvPlxuICApXG59XG5cbmZ1bmN0aW9uIFBhZ2luYXRpb25JdGVtKHsgLi4ucHJvcHMgfTogUmVhY3QuQ29tcG9uZW50UHJvcHM8XCJsaVwiPikge1xuICByZXR1cm4gPGxpIGRhdGEtc2xvdD1cInBhZ2luYXRpb24taXRlbVwiIHsuLi5wcm9wc30gLz5cbn1cblxudHlwZSBQYWdpbmF0aW9uTGlua1Byb3BzID0ge1xuICBpc0FjdGl2ZT86IGJvb2xlYW5cbn0gJiBQaWNrPFJlYWN0LkNvbXBvbmVudFByb3BzPHR5cGVvZiBCdXR0b24+LCBcInNpemVcIj4gJlxuICBSZWFjdC5Db21wb25lbnRQcm9wczxcImFcIj5cblxuZnVuY3Rpb24gUGFnaW5hdGlvbkxpbmsoe1xuICBjbGFzc05hbWUsXG4gIGlzQWN0aXZlLFxuICBzaXplID0gXCJpY29uXCIsXG4gIC4uLnByb3BzXG59OiBQYWdpbmF0aW9uTGlua1Byb3BzKSB7XG4gIHJldHVybiAoXG4gICAgPGFcbiAgICAgIGFyaWEtY3VycmVudD17aXNBY3RpdmUgPyBcInBhZ2VcIiA6IHVuZGVmaW5lZH1cbiAgICAgIGRhdGEtc2xvdD1cInBhZ2luYXRpb24tbGlua1wiXG4gICAgICBkYXRhLWFjdGl2ZT17aXNBY3RpdmV9XG4gICAgICBjbGFzc05hbWU9e2NuKFxuICAgICAgICBidXR0b25WYXJpYW50cyh7XG4gICAgICAgICAgdmFyaWFudDogaXNBY3RpdmUgPyBcIm91dGxpbmVcIiA6IFwiZ2hvc3RcIixcbiAgICAgICAgICBzaXplLFxuICAgICAgICB9KSxcbiAgICAgICAgY2xhc3NOYW1lXG4gICAgICApfVxuICAgICAgey4uLnByb3BzfVxuICAgIC8+XG4gIClcbn1cblxuZnVuY3Rpb24gUGFnaW5hdGlvblByZXZpb3VzKHtcbiAgY2xhc3NOYW1lLFxuICAuLi5wcm9wc1xufTogUmVhY3QuQ29tcG9uZW50UHJvcHM8dHlwZW9mIFBhZ2luYXRpb25MaW5rPikge1xuICByZXR1cm4gKFxuICAgIDxQYWdpbmF0aW9uTGlua1xuICAgICAgYXJpYS1sYWJlbD1cIkdvIHRvIHByZXZpb3VzIHBhZ2VcIlxuICAgICAgc2l6ZT1cImRlZmF1bHRcIlxuICAgICAgY2xhc3NOYW1lPXtjbihcImdhcC0xIHB4LTIuNSBzbTpwbC0yLjVcIiwgY2xhc3NOYW1lKX1cbiAgICAgIHsuLi5wcm9wc31cbiAgICA+XG4gICAgICA8Q2hldnJvbkxlZnRJY29uIC8+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJoaWRkZW4gc206YmxvY2tcIj5QcmV2aW91czwvc3Bhbj5cbiAgICA8L1BhZ2luYXRpb25MaW5rPlxuICApXG59XG5cbmZ1bmN0aW9uIFBhZ2luYXRpb25OZXh0KHtcbiAgY2xhc3NOYW1lLFxuICAuLi5wcm9wc1xufTogUmVhY3QuQ29tcG9uZW50UHJvcHM8dHlwZW9mIFBhZ2luYXRpb25MaW5rPikge1xuICByZXR1cm4gKFxuICAgIDxQYWdpbmF0aW9uTGlua1xuICAgICAgYXJpYS1sYWJlbD1cIkdvIHRvIG5leHQgcGFnZVwiXG4gICAgICBzaXplPVwiZGVmYXVsdFwiXG4gICAgICBjbGFzc05hbWU9e2NuKFwiZ2FwLTEgcHgtMi41IHNtOnByLTIuNVwiLCBjbGFzc05hbWUpfVxuICAgICAgey4uLnByb3BzfVxuICAgID5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImhpZGRlbiBzbTpibG9ja1wiPk5leHQ8L3NwYW4+XG4gICAgICA8Q2hldnJvblJpZ2h0SWNvbiAvPlxuICAgIDwvUGFnaW5hdGlvbkxpbms+XG4gIClcbn1cblxuZnVuY3Rpb24gUGFnaW5hdGlvbkVsbGlwc2lzKHtcbiAgY2xhc3NOYW1lLFxuICAuLi5wcm9wc1xufTogUmVhY3QuQ29tcG9uZW50UHJvcHM8XCJzcGFuXCI+KSB7XG4gIHJldHVybiAoXG4gICAgPHNwYW5cbiAgICAgIGFyaWEtaGlkZGVuXG4gICAgICBkYXRhLXNsb3Q9XCJwYWdpbmF0aW9uLWVsbGlwc2lzXCJcbiAgICAgIGNsYXNzTmFtZT17Y24oXCJmbGV4IHNpemUtOSBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXJcIiwgY2xhc3NOYW1lKX1cbiAgICAgIHsuLi5wcm9wc31cbiAgICA+XG4gICAgICA8TW9yZUhvcml6b250YWxJY29uIGNsYXNzTmFtZT1cInNpemUtNFwiIC8+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJzci1vbmx5XCI+TW9yZSBwYWdlczwvc3Bhbj5cbiAgICA8L3NwYW4+XG4gIClcbn1cblxuZXhwb3J0IHtcbiAgUGFnaW5hdGlvbixcbiAgUGFnaW5hdGlvbkNvbnRlbnQsXG4gIFBhZ2luYXRpb25MaW5rLFxuICBQYWdpbmF0aW9uSXRlbSxcbiAgUGFnaW5hdGlvblByZXZpb3VzLFxuICBQYWdpbmF0aW9uTmV4dCxcbiAgUGFnaW5hdGlvbkVsbGlwc2lzLFxufVxuIl19