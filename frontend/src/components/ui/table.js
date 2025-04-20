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
exports.Table = Table;
exports.TableHeader = TableHeader;
exports.TableBody = TableBody;
exports.TableFooter = TableFooter;
exports.TableHead = TableHead;
exports.TableRow = TableRow;
exports.TableCell = TableCell;
exports.TableCaption = TableCaption;
const React = __importStar(require("react"));
const utils_1 = require("../../lib/utils");
function Table({ className, ...props }) {
    return (React.createElement("div", { "data-slot": "table-container", className: "relative w-full overflow-x-auto" },
        React.createElement("table", { "data-slot": "table", className: (0, utils_1.cn)("w-full caption-bottom text-sm", className), ...props })));
}
function TableHeader({ className, ...props }) {
    return (React.createElement("thead", { "data-slot": "table-header", className: (0, utils_1.cn)("[&_tr]:border-b", className), ...props }));
}
function TableBody({ className, ...props }) {
    return (React.createElement("tbody", { "data-slot": "table-body", className: (0, utils_1.cn)("[&_tr:last-child]:border-0", className), ...props }));
}
function TableFooter({ className, ...props }) {
    return (React.createElement("tfoot", { "data-slot": "table-footer", className: (0, utils_1.cn)("bg-muted/50 border-t font-medium [&>tr]:last:border-b-0", className), ...props }));
}
function TableRow({ className, ...props }) {
    return (React.createElement("tr", { "data-slot": "table-row", className: (0, utils_1.cn)("hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors", className), ...props }));
}
function TableHead({ className, ...props }) {
    return (React.createElement("th", { "data-slot": "table-head", className: (0, utils_1.cn)("text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]", className), ...props }));
}
function TableCell({ className, ...props }) {
    return (React.createElement("td", { "data-slot": "table-cell", className: (0, utils_1.cn)("p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]", className), ...props }));
}
function TableCaption({ className, ...props }) {
    return (React.createElement("caption", { "data-slot": "table-caption", className: (0, utils_1.cn)("text-muted-foreground mt-4 text-sm", className), ...props }));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0YWJsZS50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF5R0Usc0JBQUs7QUFDTCxrQ0FBVztBQUNYLDhCQUFTO0FBQ1Qsa0NBQVc7QUFDWCw4QkFBUztBQUNULDRCQUFRO0FBQ1IsOEJBQVM7QUFDVCxvQ0FBWTtBQWhIZCw2Q0FBOEI7QUFFOUIsdUNBQWdDO0FBRWhDLFNBQVMsS0FBSyxDQUFDLEVBQUUsU0FBUyxFQUFFLEdBQUcsS0FBSyxFQUFpQztJQUNuRSxPQUFPLENBQ0wsMENBQ1ksaUJBQWlCLEVBQzNCLFNBQVMsRUFBQyxpQ0FBaUM7UUFFM0MsNENBQ1ksT0FBTyxFQUNqQixTQUFTLEVBQUUsSUFBQSxVQUFFLEVBQUMsK0JBQStCLEVBQUUsU0FBUyxDQUFDLEtBQ3JELEtBQUssR0FDVCxDQUNFLENBQ1AsQ0FBQTtBQUNILENBQUM7QUFFRCxTQUFTLFdBQVcsQ0FBQyxFQUFFLFNBQVMsRUFBRSxHQUFHLEtBQUssRUFBaUM7SUFDekUsT0FBTyxDQUNMLDRDQUNZLGNBQWMsRUFDeEIsU0FBUyxFQUFFLElBQUEsVUFBRSxFQUFDLGlCQUFpQixFQUFFLFNBQVMsQ0FBQyxLQUN2QyxLQUFLLEdBQ1QsQ0FDSCxDQUFBO0FBQ0gsQ0FBQztBQUVELFNBQVMsU0FBUyxDQUFDLEVBQUUsU0FBUyxFQUFFLEdBQUcsS0FBSyxFQUFpQztJQUN2RSxPQUFPLENBQ0wsNENBQ1ksWUFBWSxFQUN0QixTQUFTLEVBQUUsSUFBQSxVQUFFLEVBQUMsNEJBQTRCLEVBQUUsU0FBUyxDQUFDLEtBQ2xELEtBQUssR0FDVCxDQUNILENBQUE7QUFDSCxDQUFDO0FBRUQsU0FBUyxXQUFXLENBQUMsRUFBRSxTQUFTLEVBQUUsR0FBRyxLQUFLLEVBQWlDO0lBQ3pFLE9BQU8sQ0FDTCw0Q0FDWSxjQUFjLEVBQ3hCLFNBQVMsRUFBRSxJQUFBLFVBQUUsRUFDWCx5REFBeUQsRUFDekQsU0FBUyxDQUNWLEtBQ0csS0FBSyxHQUNULENBQ0gsQ0FBQTtBQUNILENBQUM7QUFFRCxTQUFTLFFBQVEsQ0FBQyxFQUFFLFNBQVMsRUFBRSxHQUFHLEtBQUssRUFBOEI7SUFDbkUsT0FBTyxDQUNMLHlDQUNZLFdBQVcsRUFDckIsU0FBUyxFQUFFLElBQUEsVUFBRSxFQUNYLDZFQUE2RSxFQUM3RSxTQUFTLENBQ1YsS0FDRyxLQUFLLEdBQ1QsQ0FDSCxDQUFBO0FBQ0gsQ0FBQztBQUVELFNBQVMsU0FBUyxDQUFDLEVBQUUsU0FBUyxFQUFFLEdBQUcsS0FBSyxFQUE4QjtJQUNwRSxPQUFPLENBQ0wseUNBQ1ksWUFBWSxFQUN0QixTQUFTLEVBQUUsSUFBQSxVQUFFLEVBQ1gsb0pBQW9KLEVBQ3BKLFNBQVMsQ0FDVixLQUNHLEtBQUssR0FDVCxDQUNILENBQUE7QUFDSCxDQUFDO0FBRUQsU0FBUyxTQUFTLENBQUMsRUFBRSxTQUFTLEVBQUUsR0FBRyxLQUFLLEVBQThCO0lBQ3BFLE9BQU8sQ0FDTCx5Q0FDWSxZQUFZLEVBQ3RCLFNBQVMsRUFBRSxJQUFBLFVBQUUsRUFDWCx3R0FBd0csRUFDeEcsU0FBUyxDQUNWLEtBQ0csS0FBSyxHQUNULENBQ0gsQ0FBQTtBQUNILENBQUM7QUFFRCxTQUFTLFlBQVksQ0FBQyxFQUNwQixTQUFTLEVBQ1QsR0FBRyxLQUFLLEVBQ3dCO0lBQ2hDLE9BQU8sQ0FDTCw4Q0FDWSxlQUFlLEVBQ3pCLFNBQVMsRUFBRSxJQUFBLFVBQUUsRUFBQyxvQ0FBb0MsRUFBRSxTQUFTLENBQUMsS0FDMUQsS0FBSyxHQUNULENBQ0gsQ0FBQTtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tIFwicmVhY3RcIlxuXG5pbXBvcnQgeyBjbiB9IGZyb20gXCJAL2xpYi91dGlsc1wiXG5cbmZ1bmN0aW9uIFRhYmxlKHsgY2xhc3NOYW1lLCAuLi5wcm9wcyB9OiBSZWFjdC5Db21wb25lbnRQcm9wczxcInRhYmxlXCI+KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgZGF0YS1zbG90PVwidGFibGUtY29udGFpbmVyXCJcbiAgICAgIGNsYXNzTmFtZT1cInJlbGF0aXZlIHctZnVsbCBvdmVyZmxvdy14LWF1dG9cIlxuICAgID5cbiAgICAgIDx0YWJsZVxuICAgICAgICBkYXRhLXNsb3Q9XCJ0YWJsZVwiXG4gICAgICAgIGNsYXNzTmFtZT17Y24oXCJ3LWZ1bGwgY2FwdGlvbi1ib3R0b20gdGV4dC1zbVwiLCBjbGFzc05hbWUpfVxuICAgICAgICB7Li4ucHJvcHN9XG4gICAgICAvPlxuICAgIDwvZGl2PlxuICApXG59XG5cbmZ1bmN0aW9uIFRhYmxlSGVhZGVyKHsgY2xhc3NOYW1lLCAuLi5wcm9wcyB9OiBSZWFjdC5Db21wb25lbnRQcm9wczxcInRoZWFkXCI+KSB7XG4gIHJldHVybiAoXG4gICAgPHRoZWFkXG4gICAgICBkYXRhLXNsb3Q9XCJ0YWJsZS1oZWFkZXJcIlxuICAgICAgY2xhc3NOYW1lPXtjbihcIlsmX3RyXTpib3JkZXItYlwiLCBjbGFzc05hbWUpfVxuICAgICAgey4uLnByb3BzfVxuICAgIC8+XG4gIClcbn1cblxuZnVuY3Rpb24gVGFibGVCb2R5KHsgY2xhc3NOYW1lLCAuLi5wcm9wcyB9OiBSZWFjdC5Db21wb25lbnRQcm9wczxcInRib2R5XCI+KSB7XG4gIHJldHVybiAoXG4gICAgPHRib2R5XG4gICAgICBkYXRhLXNsb3Q9XCJ0YWJsZS1ib2R5XCJcbiAgICAgIGNsYXNzTmFtZT17Y24oXCJbJl90cjpsYXN0LWNoaWxkXTpib3JkZXItMFwiLCBjbGFzc05hbWUpfVxuICAgICAgey4uLnByb3BzfVxuICAgIC8+XG4gIClcbn1cblxuZnVuY3Rpb24gVGFibGVGb290ZXIoeyBjbGFzc05hbWUsIC4uLnByb3BzIH06IFJlYWN0LkNvbXBvbmVudFByb3BzPFwidGZvb3RcIj4pIHtcbiAgcmV0dXJuIChcbiAgICA8dGZvb3RcbiAgICAgIGRhdGEtc2xvdD1cInRhYmxlLWZvb3RlclwiXG4gICAgICBjbGFzc05hbWU9e2NuKFxuICAgICAgICBcImJnLW11dGVkLzUwIGJvcmRlci10IGZvbnQtbWVkaXVtIFsmPnRyXTpsYXN0OmJvcmRlci1iLTBcIixcbiAgICAgICAgY2xhc3NOYW1lXG4gICAgICApfVxuICAgICAgey4uLnByb3BzfVxuICAgIC8+XG4gIClcbn1cblxuZnVuY3Rpb24gVGFibGVSb3coeyBjbGFzc05hbWUsIC4uLnByb3BzIH06IFJlYWN0LkNvbXBvbmVudFByb3BzPFwidHJcIj4pIHtcbiAgcmV0dXJuIChcbiAgICA8dHJcbiAgICAgIGRhdGEtc2xvdD1cInRhYmxlLXJvd1wiXG4gICAgICBjbGFzc05hbWU9e2NuKFxuICAgICAgICBcImhvdmVyOmJnLW11dGVkLzUwIGRhdGEtW3N0YXRlPXNlbGVjdGVkXTpiZy1tdXRlZCBib3JkZXItYiB0cmFuc2l0aW9uLWNvbG9yc1wiLFxuICAgICAgICBjbGFzc05hbWVcbiAgICAgICl9XG4gICAgICB7Li4ucHJvcHN9XG4gICAgLz5cbiAgKVxufVxuXG5mdW5jdGlvbiBUYWJsZUhlYWQoeyBjbGFzc05hbWUsIC4uLnByb3BzIH06IFJlYWN0LkNvbXBvbmVudFByb3BzPFwidGhcIj4pIHtcbiAgcmV0dXJuIChcbiAgICA8dGhcbiAgICAgIGRhdGEtc2xvdD1cInRhYmxlLWhlYWRcIlxuICAgICAgY2xhc3NOYW1lPXtjbihcbiAgICAgICAgXCJ0ZXh0LWZvcmVncm91bmQgaC0xMCBweC0yIHRleHQtbGVmdCBhbGlnbi1taWRkbGUgZm9udC1tZWRpdW0gd2hpdGVzcGFjZS1ub3dyYXAgWyY6aGFzKFtyb2xlPWNoZWNrYm94XSldOnByLTAgWyY+W3JvbGU9Y2hlY2tib3hdXTp0cmFuc2xhdGUteS1bMnB4XVwiLFxuICAgICAgICBjbGFzc05hbWVcbiAgICAgICl9XG4gICAgICB7Li4ucHJvcHN9XG4gICAgLz5cbiAgKVxufVxuXG5mdW5jdGlvbiBUYWJsZUNlbGwoeyBjbGFzc05hbWUsIC4uLnByb3BzIH06IFJlYWN0LkNvbXBvbmVudFByb3BzPFwidGRcIj4pIHtcbiAgcmV0dXJuIChcbiAgICA8dGRcbiAgICAgIGRhdGEtc2xvdD1cInRhYmxlLWNlbGxcIlxuICAgICAgY2xhc3NOYW1lPXtjbihcbiAgICAgICAgXCJwLTIgYWxpZ24tbWlkZGxlIHdoaXRlc3BhY2Utbm93cmFwIFsmOmhhcyhbcm9sZT1jaGVja2JveF0pXTpwci0wIFsmPltyb2xlPWNoZWNrYm94XV06dHJhbnNsYXRlLXktWzJweF1cIixcbiAgICAgICAgY2xhc3NOYW1lXG4gICAgICApfVxuICAgICAgey4uLnByb3BzfVxuICAgIC8+XG4gIClcbn1cblxuZnVuY3Rpb24gVGFibGVDYXB0aW9uKHtcbiAgY2xhc3NOYW1lLFxuICAuLi5wcm9wc1xufTogUmVhY3QuQ29tcG9uZW50UHJvcHM8XCJjYXB0aW9uXCI+KSB7XG4gIHJldHVybiAoXG4gICAgPGNhcHRpb25cbiAgICAgIGRhdGEtc2xvdD1cInRhYmxlLWNhcHRpb25cIlxuICAgICAgY2xhc3NOYW1lPXtjbihcInRleHQtbXV0ZWQtZm9yZWdyb3VuZCBtdC00IHRleHQtc21cIiwgY2xhc3NOYW1lKX1cbiAgICAgIHsuLi5wcm9wc31cbiAgICAvPlxuICApXG59XG5cbmV4cG9ydCB7XG4gIFRhYmxlLFxuICBUYWJsZUhlYWRlcixcbiAgVGFibGVCb2R5LFxuICBUYWJsZUZvb3RlcixcbiAgVGFibGVIZWFkLFxuICBUYWJsZVJvdyxcbiAgVGFibGVDZWxsLFxuICBUYWJsZUNhcHRpb24sXG59XG4iXX0=