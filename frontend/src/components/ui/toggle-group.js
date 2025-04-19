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
exports.ToggleGroup = ToggleGroup;
exports.ToggleGroupItem = ToggleGroupItem;
const React = __importStar(require("react"));
const ToggleGroupPrimitive = __importStar(require("@radix-ui/react-toggle-group"));
const utils_1 = require("../../lib/utils");
const toggle_1 = require("@/components/ui/toggle");
const ToggleGroupContext = React.createContext({
    size: "default",
    variant: "default",
});
function ToggleGroup({ className, variant, size, children, ...props }) {
    return (React.createElement(ToggleGroupPrimitive.Root, { "data-slot": "toggle-group", "data-variant": variant, "data-size": size, className: (0, utils_1.cn)("group/toggle-group flex w-fit items-center rounded-md data-[variant=outline]:shadow-xs", className), ...props },
        React.createElement(ToggleGroupContext.Provider, { value: { variant, size } }, children)));
}
function ToggleGroupItem({ className, children, variant, size, ...props }) {
    const context = React.useContext(ToggleGroupContext);
    return (React.createElement(ToggleGroupPrimitive.Item, { "data-slot": "toggle-group-item", "data-variant": context.variant || variant, "data-size": context.size || size, className: (0, utils_1.cn)((0, toggle_1.toggleVariants)({
            variant: context.variant || variant,
            size: context.size || size,
        }), "min-w-0 flex-1 shrink-0 rounded-none shadow-none first:rounded-l-md last:rounded-r-md focus:z-10 focus-visible:z-10 data-[variant=outline]:border-l-0 data-[variant=outline]:first:border-l", className), ...props }, children));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9nZ2xlLWdyb3VwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidG9nZ2xlLWdyb3VwLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXNFUyxrQ0FBVztBQUFFLDBDQUFlO0FBdEVyQyw2Q0FBOEI7QUFDOUIsbUZBQW9FO0FBR3BFLHVDQUFnQztBQUNoQyxtREFBdUQ7QUFFdkQsTUFBTSxrQkFBa0IsR0FBRyxLQUFLLENBQUMsYUFBYSxDQUU1QztJQUNBLElBQUksRUFBRSxTQUFTO0lBQ2YsT0FBTyxFQUFFLFNBQVM7Q0FDbkIsQ0FBQyxDQUFBO0FBRUYsU0FBUyxXQUFXLENBQUMsRUFDbkIsU0FBUyxFQUNULE9BQU8sRUFDUCxJQUFJLEVBQ0osUUFBUSxFQUNSLEdBQUcsS0FBSyxFQUUyQjtJQUNuQyxPQUFPLENBQ0wsb0JBQUMsb0JBQW9CLENBQUMsSUFBSSxpQkFDZCxjQUFjLGtCQUNWLE9BQU8sZUFDVixJQUFJLEVBQ2YsU0FBUyxFQUFFLElBQUEsVUFBRSxFQUNYLHdGQUF3RixFQUN4RixTQUFTLENBQ1YsS0FDRyxLQUFLO1FBRVQsb0JBQUMsa0JBQWtCLENBQUMsUUFBUSxJQUFDLEtBQUssRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsSUFDbEQsUUFBUSxDQUNtQixDQUNKLENBQzdCLENBQUE7QUFDSCxDQUFDO0FBRUQsU0FBUyxlQUFlLENBQUMsRUFDdkIsU0FBUyxFQUNULFFBQVEsRUFDUixPQUFPLEVBQ1AsSUFBSSxFQUNKLEdBQUcsS0FBSyxFQUUyQjtJQUNuQyxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFDLGtCQUFrQixDQUFDLENBQUE7SUFFcEQsT0FBTyxDQUNMLG9CQUFDLG9CQUFvQixDQUFDLElBQUksaUJBQ2QsbUJBQW1CLGtCQUNmLE9BQU8sQ0FBQyxPQUFPLElBQUksT0FBTyxlQUM3QixPQUFPLENBQUMsSUFBSSxJQUFJLElBQUksRUFDL0IsU0FBUyxFQUFFLElBQUEsVUFBRSxFQUNYLElBQUEsdUJBQWMsRUFBQztZQUNiLE9BQU8sRUFBRSxPQUFPLENBQUMsT0FBTyxJQUFJLE9BQU87WUFDbkMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJLElBQUksSUFBSTtTQUMzQixDQUFDLEVBQ0YsNkxBQTZMLEVBQzdMLFNBQVMsQ0FDVixLQUNHLEtBQUssSUFFUixRQUFRLENBQ2lCLENBQzdCLENBQUE7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSBcInJlYWN0XCJcbmltcG9ydCAqIGFzIFRvZ2dsZUdyb3VwUHJpbWl0aXZlIGZyb20gXCJAcmFkaXgtdWkvcmVhY3QtdG9nZ2xlLWdyb3VwXCJcbmltcG9ydCB7IHR5cGUgVmFyaWFudFByb3BzIH0gZnJvbSBcImNsYXNzLXZhcmlhbmNlLWF1dGhvcml0eVwiXG5cbmltcG9ydCB7IGNuIH0gZnJvbSBcIkAvbGliL3V0aWxzXCJcbmltcG9ydCB7IHRvZ2dsZVZhcmlhbnRzIH0gZnJvbSBcIkAvY29tcG9uZW50cy91aS90b2dnbGVcIlxuXG5jb25zdCBUb2dnbGVHcm91cENvbnRleHQgPSBSZWFjdC5jcmVhdGVDb250ZXh0PFxuICBWYXJpYW50UHJvcHM8dHlwZW9mIHRvZ2dsZVZhcmlhbnRzPlxuPih7XG4gIHNpemU6IFwiZGVmYXVsdFwiLFxuICB2YXJpYW50OiBcImRlZmF1bHRcIixcbn0pXG5cbmZ1bmN0aW9uIFRvZ2dsZUdyb3VwKHtcbiAgY2xhc3NOYW1lLFxuICB2YXJpYW50LFxuICBzaXplLFxuICBjaGlsZHJlbixcbiAgLi4ucHJvcHNcbn06IFJlYWN0LkNvbXBvbmVudFByb3BzPHR5cGVvZiBUb2dnbGVHcm91cFByaW1pdGl2ZS5Sb290PiAmXG4gIFZhcmlhbnRQcm9wczx0eXBlb2YgdG9nZ2xlVmFyaWFudHM+KSB7XG4gIHJldHVybiAoXG4gICAgPFRvZ2dsZUdyb3VwUHJpbWl0aXZlLlJvb3RcbiAgICAgIGRhdGEtc2xvdD1cInRvZ2dsZS1ncm91cFwiXG4gICAgICBkYXRhLXZhcmlhbnQ9e3ZhcmlhbnR9XG4gICAgICBkYXRhLXNpemU9e3NpemV9XG4gICAgICBjbGFzc05hbWU9e2NuKFxuICAgICAgICBcImdyb3VwL3RvZ2dsZS1ncm91cCBmbGV4IHctZml0IGl0ZW1zLWNlbnRlciByb3VuZGVkLW1kIGRhdGEtW3ZhcmlhbnQ9b3V0bGluZV06c2hhZG93LXhzXCIsXG4gICAgICAgIGNsYXNzTmFtZVxuICAgICAgKX1cbiAgICAgIHsuLi5wcm9wc31cbiAgICA+XG4gICAgICA8VG9nZ2xlR3JvdXBDb250ZXh0LlByb3ZpZGVyIHZhbHVlPXt7IHZhcmlhbnQsIHNpemUgfX0+XG4gICAgICAgIHtjaGlsZHJlbn1cbiAgICAgIDwvVG9nZ2xlR3JvdXBDb250ZXh0LlByb3ZpZGVyPlxuICAgIDwvVG9nZ2xlR3JvdXBQcmltaXRpdmUuUm9vdD5cbiAgKVxufVxuXG5mdW5jdGlvbiBUb2dnbGVHcm91cEl0ZW0oe1xuICBjbGFzc05hbWUsXG4gIGNoaWxkcmVuLFxuICB2YXJpYW50LFxuICBzaXplLFxuICAuLi5wcm9wc1xufTogUmVhY3QuQ29tcG9uZW50UHJvcHM8dHlwZW9mIFRvZ2dsZUdyb3VwUHJpbWl0aXZlLkl0ZW0+ICZcbiAgVmFyaWFudFByb3BzPHR5cGVvZiB0b2dnbGVWYXJpYW50cz4pIHtcbiAgY29uc3QgY29udGV4dCA9IFJlYWN0LnVzZUNvbnRleHQoVG9nZ2xlR3JvdXBDb250ZXh0KVxuXG4gIHJldHVybiAoXG4gICAgPFRvZ2dsZUdyb3VwUHJpbWl0aXZlLkl0ZW1cbiAgICAgIGRhdGEtc2xvdD1cInRvZ2dsZS1ncm91cC1pdGVtXCJcbiAgICAgIGRhdGEtdmFyaWFudD17Y29udGV4dC52YXJpYW50IHx8IHZhcmlhbnR9XG4gICAgICBkYXRhLXNpemU9e2NvbnRleHQuc2l6ZSB8fCBzaXplfVxuICAgICAgY2xhc3NOYW1lPXtjbihcbiAgICAgICAgdG9nZ2xlVmFyaWFudHMoe1xuICAgICAgICAgIHZhcmlhbnQ6IGNvbnRleHQudmFyaWFudCB8fCB2YXJpYW50LFxuICAgICAgICAgIHNpemU6IGNvbnRleHQuc2l6ZSB8fCBzaXplLFxuICAgICAgICB9KSxcbiAgICAgICAgXCJtaW4tdy0wIGZsZXgtMSBzaHJpbmstMCByb3VuZGVkLW5vbmUgc2hhZG93LW5vbmUgZmlyc3Q6cm91bmRlZC1sLW1kIGxhc3Q6cm91bmRlZC1yLW1kIGZvY3VzOnotMTAgZm9jdXMtdmlzaWJsZTp6LTEwIGRhdGEtW3ZhcmlhbnQ9b3V0bGluZV06Ym9yZGVyLWwtMCBkYXRhLVt2YXJpYW50PW91dGxpbmVdOmZpcnN0OmJvcmRlci1sXCIsXG4gICAgICAgIGNsYXNzTmFtZVxuICAgICAgKX1cbiAgICAgIHsuLi5wcm9wc31cbiAgICA+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9Ub2dnbGVHcm91cFByaW1pdGl2ZS5JdGVtPlxuICApXG59XG5cbmV4cG9ydCB7IFRvZ2dsZUdyb3VwLCBUb2dnbGVHcm91cEl0ZW0gfVxuIl19