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
exports.Collapsible = Collapsible;
exports.CollapsibleTrigger = CollapsibleTrigger;
exports.CollapsibleContent = CollapsibleContent;
const CollapsiblePrimitive = __importStar(require("@radix-ui/react-collapsible"));
function Collapsible({ ...props }) {
    return React.createElement(CollapsiblePrimitive.Root, { "data-slot": "collapsible", ...props });
}
function CollapsibleTrigger({ ...props }) {
    return (React.createElement(CollapsiblePrimitive.CollapsibleTrigger, { "data-slot": "collapsible-trigger", ...props }));
}
function CollapsibleContent({ ...props }) {
    return (React.createElement(CollapsiblePrimitive.CollapsibleContent, { "data-slot": "collapsible-content", ...props }));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sbGFwc2libGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjb2xsYXBzaWJsZS50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUE4QlMsa0NBQVc7QUFBRSxnREFBa0I7QUFBRSxnREFBa0I7QUE5QjVELGtGQUFtRTtBQUVuRSxTQUFTLFdBQVcsQ0FBQyxFQUNuQixHQUFHLEtBQUssRUFDK0M7SUFDdkQsT0FBTyxvQkFBQyxvQkFBb0IsQ0FBQyxJQUFJLGlCQUFXLGFBQWEsS0FBSyxLQUFLLEdBQUksQ0FBQTtBQUN6RSxDQUFDO0FBRUQsU0FBUyxrQkFBa0IsQ0FBQyxFQUMxQixHQUFHLEtBQUssRUFDNkQ7SUFDckUsT0FBTyxDQUNMLG9CQUFDLG9CQUFvQixDQUFDLGtCQUFrQixpQkFDNUIscUJBQXFCLEtBQzNCLEtBQUssR0FDVCxDQUNILENBQUE7QUFDSCxDQUFDO0FBRUQsU0FBUyxrQkFBa0IsQ0FBQyxFQUMxQixHQUFHLEtBQUssRUFDNkQ7SUFDckUsT0FBTyxDQUNMLG9CQUFDLG9CQUFvQixDQUFDLGtCQUFrQixpQkFDNUIscUJBQXFCLEtBQzNCLEtBQUssR0FDVCxDQUNILENBQUE7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgQ29sbGFwc2libGVQcmltaXRpdmUgZnJvbSBcIkByYWRpeC11aS9yZWFjdC1jb2xsYXBzaWJsZVwiXG5cbmZ1bmN0aW9uIENvbGxhcHNpYmxlKHtcbiAgLi4ucHJvcHNcbn06IFJlYWN0LkNvbXBvbmVudFByb3BzPHR5cGVvZiBDb2xsYXBzaWJsZVByaW1pdGl2ZS5Sb290Pikge1xuICByZXR1cm4gPENvbGxhcHNpYmxlUHJpbWl0aXZlLlJvb3QgZGF0YS1zbG90PVwiY29sbGFwc2libGVcIiB7Li4ucHJvcHN9IC8+XG59XG5cbmZ1bmN0aW9uIENvbGxhcHNpYmxlVHJpZ2dlcih7XG4gIC4uLnByb3BzXG59OiBSZWFjdC5Db21wb25lbnRQcm9wczx0eXBlb2YgQ29sbGFwc2libGVQcmltaXRpdmUuQ29sbGFwc2libGVUcmlnZ2VyPikge1xuICByZXR1cm4gKFxuICAgIDxDb2xsYXBzaWJsZVByaW1pdGl2ZS5Db2xsYXBzaWJsZVRyaWdnZXJcbiAgICAgIGRhdGEtc2xvdD1cImNvbGxhcHNpYmxlLXRyaWdnZXJcIlxuICAgICAgey4uLnByb3BzfVxuICAgIC8+XG4gIClcbn1cblxuZnVuY3Rpb24gQ29sbGFwc2libGVDb250ZW50KHtcbiAgLi4ucHJvcHNcbn06IFJlYWN0LkNvbXBvbmVudFByb3BzPHR5cGVvZiBDb2xsYXBzaWJsZVByaW1pdGl2ZS5Db2xsYXBzaWJsZUNvbnRlbnQ+KSB7XG4gIHJldHVybiAoXG4gICAgPENvbGxhcHNpYmxlUHJpbWl0aXZlLkNvbGxhcHNpYmxlQ29udGVudFxuICAgICAgZGF0YS1zbG90PVwiY29sbGFwc2libGUtY29udGVudFwiXG4gICAgICB7Li4ucHJvcHN9XG4gICAgLz5cbiAgKVxufVxuXG5leHBvcnQgeyBDb2xsYXBzaWJsZSwgQ29sbGFwc2libGVUcmlnZ2VyLCBDb2xsYXBzaWJsZUNvbnRlbnQgfVxuIl19