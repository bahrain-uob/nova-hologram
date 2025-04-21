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
exports.Avatar = Avatar;
exports.AvatarImage = AvatarImage;
exports.AvatarFallback = AvatarFallback;
const React = __importStar(require("react"));
const AvatarPrimitive = __importStar(require("@radix-ui/react-avatar"));
const utils_1 = require("../../lib/utils");
function Avatar({ className, ...props }) {
    return (React.createElement(AvatarPrimitive.Root, { "data-slot": "avatar", className: (0, utils_1.cn)("relative flex size-8 shrink-0 overflow-hidden rounded-full", className), ...props }));
}
function AvatarImage({ className, ...props }) {
    return (React.createElement(AvatarPrimitive.Image, { "data-slot": "avatar-image", className: (0, utils_1.cn)("aspect-square size-full", className), ...props }));
}
function AvatarFallback({ className, ...props }) {
    return (React.createElement(AvatarPrimitive.Fallback, { "data-slot": "avatar-fallback", className: (0, utils_1.cn)("bg-muted flex size-full items-center justify-center rounded-full", className), ...props }));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXZhdGFyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXZhdGFyLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWtEUyx3QkFBTTtBQUFFLGtDQUFXO0FBQUUsd0NBQWM7QUFsRDVDLDZDQUE4QjtBQUM5Qix3RUFBeUQ7QUFFekQsdUNBQWdDO0FBRWhDLFNBQVMsTUFBTSxDQUFDLEVBQ2QsU0FBUyxFQUNULEdBQUcsS0FBSyxFQUMwQztJQUNsRCxPQUFPLENBQ0wsb0JBQUMsZUFBZSxDQUFDLElBQUksaUJBQ1QsUUFBUSxFQUNsQixTQUFTLEVBQUUsSUFBQSxVQUFFLEVBQ1gsNERBQTRELEVBQzVELFNBQVMsQ0FDVixLQUNHLEtBQUssR0FDVCxDQUNILENBQUE7QUFDSCxDQUFDO0FBRUQsU0FBUyxXQUFXLENBQUMsRUFDbkIsU0FBUyxFQUNULEdBQUcsS0FBSyxFQUMyQztJQUNuRCxPQUFPLENBQ0wsb0JBQUMsZUFBZSxDQUFDLEtBQUssaUJBQ1YsY0FBYyxFQUN4QixTQUFTLEVBQUUsSUFBQSxVQUFFLEVBQUMseUJBQXlCLEVBQUUsU0FBUyxDQUFDLEtBQy9DLEtBQUssR0FDVCxDQUNILENBQUE7QUFDSCxDQUFDO0FBRUQsU0FBUyxjQUFjLENBQUMsRUFDdEIsU0FBUyxFQUNULEdBQUcsS0FBSyxFQUM4QztJQUN0RCxPQUFPLENBQ0wsb0JBQUMsZUFBZSxDQUFDLFFBQVEsaUJBQ2IsaUJBQWlCLEVBQzNCLFNBQVMsRUFBRSxJQUFBLFVBQUUsRUFDWCxrRUFBa0UsRUFDbEUsU0FBUyxDQUNWLEtBQ0csS0FBSyxHQUNULENBQ0gsQ0FBQTtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tIFwicmVhY3RcIlxuaW1wb3J0ICogYXMgQXZhdGFyUHJpbWl0aXZlIGZyb20gXCJAcmFkaXgtdWkvcmVhY3QtYXZhdGFyXCJcblxuaW1wb3J0IHsgY24gfSBmcm9tIFwiQC9saWIvdXRpbHNcIlxuXG5mdW5jdGlvbiBBdmF0YXIoe1xuICBjbGFzc05hbWUsXG4gIC4uLnByb3BzXG59OiBSZWFjdC5Db21wb25lbnRQcm9wczx0eXBlb2YgQXZhdGFyUHJpbWl0aXZlLlJvb3Q+KSB7XG4gIHJldHVybiAoXG4gICAgPEF2YXRhclByaW1pdGl2ZS5Sb290XG4gICAgICBkYXRhLXNsb3Q9XCJhdmF0YXJcIlxuICAgICAgY2xhc3NOYW1lPXtjbihcbiAgICAgICAgXCJyZWxhdGl2ZSBmbGV4IHNpemUtOCBzaHJpbmstMCBvdmVyZmxvdy1oaWRkZW4gcm91bmRlZC1mdWxsXCIsXG4gICAgICAgIGNsYXNzTmFtZVxuICAgICAgKX1cbiAgICAgIHsuLi5wcm9wc31cbiAgICAvPlxuICApXG59XG5cbmZ1bmN0aW9uIEF2YXRhckltYWdlKHtcbiAgY2xhc3NOYW1lLFxuICAuLi5wcm9wc1xufTogUmVhY3QuQ29tcG9uZW50UHJvcHM8dHlwZW9mIEF2YXRhclByaW1pdGl2ZS5JbWFnZT4pIHtcbiAgcmV0dXJuIChcbiAgICA8QXZhdGFyUHJpbWl0aXZlLkltYWdlXG4gICAgICBkYXRhLXNsb3Q9XCJhdmF0YXItaW1hZ2VcIlxuICAgICAgY2xhc3NOYW1lPXtjbihcImFzcGVjdC1zcXVhcmUgc2l6ZS1mdWxsXCIsIGNsYXNzTmFtZSl9XG4gICAgICB7Li4ucHJvcHN9XG4gICAgLz5cbiAgKVxufVxuXG5mdW5jdGlvbiBBdmF0YXJGYWxsYmFjayh7XG4gIGNsYXNzTmFtZSxcbiAgLi4ucHJvcHNcbn06IFJlYWN0LkNvbXBvbmVudFByb3BzPHR5cGVvZiBBdmF0YXJQcmltaXRpdmUuRmFsbGJhY2s+KSB7XG4gIHJldHVybiAoXG4gICAgPEF2YXRhclByaW1pdGl2ZS5GYWxsYmFja1xuICAgICAgZGF0YS1zbG90PVwiYXZhdGFyLWZhbGxiYWNrXCJcbiAgICAgIGNsYXNzTmFtZT17Y24oXG4gICAgICAgIFwiYmctbXV0ZWQgZmxleCBzaXplLWZ1bGwgaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHJvdW5kZWQtZnVsbFwiLFxuICAgICAgICBjbGFzc05hbWVcbiAgICAgICl9XG4gICAgICB7Li4ucHJvcHN9XG4gICAgLz5cbiAgKVxufVxuXG5leHBvcnQgeyBBdmF0YXIsIEF2YXRhckltYWdlLCBBdmF0YXJGYWxsYmFjayB9XG4iXX0=