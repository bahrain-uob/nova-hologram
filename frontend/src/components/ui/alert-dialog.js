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
exports.AlertDialog = AlertDialog;
exports.AlertDialogPortal = AlertDialogPortal;
exports.AlertDialogOverlay = AlertDialogOverlay;
exports.AlertDialogTrigger = AlertDialogTrigger;
exports.AlertDialogContent = AlertDialogContent;
exports.AlertDialogHeader = AlertDialogHeader;
exports.AlertDialogFooter = AlertDialogFooter;
exports.AlertDialogTitle = AlertDialogTitle;
exports.AlertDialogDescription = AlertDialogDescription;
exports.AlertDialogAction = AlertDialogAction;
exports.AlertDialogCancel = AlertDialogCancel;
const React = __importStar(require("react"));
const AlertDialogPrimitive = __importStar(require("@radix-ui/react-alert-dialog"));
const utils_1 = require("../../lib/utils");
const button_1 = require("./button");
function AlertDialog({ ...props }) {
    return React.createElement(AlertDialogPrimitive.Root, { "data-slot": "alert-dialog", ...props });
}
function AlertDialogTrigger({ ...props }) {
    return (React.createElement(AlertDialogPrimitive.Trigger, { "data-slot": "alert-dialog-trigger", ...props }));
}
function AlertDialogPortal({ ...props }) {
    return (React.createElement(AlertDialogPrimitive.Portal, { "data-slot": "alert-dialog-portal", ...props }));
}
function AlertDialogOverlay({ className, ...props }) {
    return (React.createElement(AlertDialogPrimitive.Overlay, { "data-slot": "alert-dialog-overlay", className: (0, utils_1.cn)("data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50", className), ...props }));
}
function AlertDialogContent({ className, ...props }) {
    return (React.createElement(AlertDialogPortal, null,
        React.createElement(AlertDialogOverlay, null),
        React.createElement(AlertDialogPrimitive.Content, { "data-slot": "alert-dialog-content", className: (0, utils_1.cn)("bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg", className), ...props })));
}
function AlertDialogHeader({ className, ...props }) {
    return (React.createElement("div", { "data-slot": "alert-dialog-header", className: (0, utils_1.cn)("flex flex-col gap-2 text-center sm:text-left", className), ...props }));
}
function AlertDialogFooter({ className, ...props }) {
    return (React.createElement("div", { "data-slot": "alert-dialog-footer", className: (0, utils_1.cn)("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className), ...props }));
}
function AlertDialogTitle({ className, ...props }) {
    return (React.createElement(AlertDialogPrimitive.Title, { "data-slot": "alert-dialog-title", className: (0, utils_1.cn)("text-lg font-semibold", className), ...props }));
}
function AlertDialogDescription({ className, ...props }) {
    return (React.createElement(AlertDialogPrimitive.Description, { "data-slot": "alert-dialog-description", className: (0, utils_1.cn)("text-muted-foreground text-sm", className), ...props }));
}
function AlertDialogAction({ className, ...props }) {
    return (React.createElement(AlertDialogPrimitive.Action, { className: (0, utils_1.cn)((0, button_1.buttonVariants)(), className), ...props }));
}
function AlertDialogCancel({ className, ...props }) {
    return (React.createElement(AlertDialogPrimitive.Cancel, { className: (0, utils_1.cn)((0, button_1.buttonVariants)({ variant: "outline" }), className), ...props }));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWxlcnQtZGlhbG9nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYWxlcnQtZGlhbG9nLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQStJRSxrQ0FBVztBQUNYLDhDQUFpQjtBQUNqQixnREFBa0I7QUFDbEIsZ0RBQWtCO0FBQ2xCLGdEQUFrQjtBQUNsQiw4Q0FBaUI7QUFDakIsOENBQWlCO0FBQ2pCLDRDQUFnQjtBQUNoQix3REFBc0I7QUFDdEIsOENBQWlCO0FBQ2pCLDhDQUFpQjtBQXpKbkIsNkNBQThCO0FBQzlCLG1GQUFvRTtBQUVwRSwyQ0FBb0M7QUFDcEMscUNBQXlDO0FBRXpDLFNBQVMsV0FBVyxDQUFDLEVBQ25CLEdBQUcsS0FBSyxFQUMrQztJQUN2RCxPQUFPLG9CQUFDLG9CQUFvQixDQUFDLElBQUksaUJBQVcsY0FBYyxLQUFLLEtBQUssR0FBSSxDQUFBO0FBQzFFLENBQUM7QUFFRCxTQUFTLGtCQUFrQixDQUFDLEVBQzFCLEdBQUcsS0FBSyxFQUNrRDtJQUMxRCxPQUFPLENBQ0wsb0JBQUMsb0JBQW9CLENBQUMsT0FBTyxpQkFBVyxzQkFBc0IsS0FBSyxLQUFLLEdBQUksQ0FDN0UsQ0FBQTtBQUNILENBQUM7QUFFRCxTQUFTLGlCQUFpQixDQUFDLEVBQ3pCLEdBQUcsS0FBSyxFQUNpRDtJQUN6RCxPQUFPLENBQ0wsb0JBQUMsb0JBQW9CLENBQUMsTUFBTSxpQkFBVyxxQkFBcUIsS0FBSyxLQUFLLEdBQUksQ0FDM0UsQ0FBQTtBQUNILENBQUM7QUFFRCxTQUFTLGtCQUFrQixDQUFDLEVBQzFCLFNBQVMsRUFDVCxHQUFHLEtBQUssRUFDa0Q7SUFDMUQsT0FBTyxDQUNMLG9CQUFDLG9CQUFvQixDQUFDLE9BQU8saUJBQ2pCLHNCQUFzQixFQUNoQyxTQUFTLEVBQUUsSUFBQSxVQUFFLEVBQ1gsd0pBQXdKLEVBQ3hKLFNBQVMsQ0FDVixLQUNHLEtBQUssR0FDVCxDQUNILENBQUE7QUFDSCxDQUFDO0FBRUQsU0FBUyxrQkFBa0IsQ0FBQyxFQUMxQixTQUFTLEVBQ1QsR0FBRyxLQUFLLEVBQ2tEO0lBQzFELE9BQU8sQ0FDTCxvQkFBQyxpQkFBaUI7UUFDaEIsb0JBQUMsa0JBQWtCLE9BQUc7UUFDdEIsb0JBQUMsb0JBQW9CLENBQUMsT0FBTyxpQkFDakIsc0JBQXNCLEVBQ2hDLFNBQVMsRUFBRSxJQUFBLFVBQUUsRUFDWCw2V0FBNlcsRUFDN1csU0FBUyxDQUNWLEtBQ0csS0FBSyxHQUNULENBQ2dCLENBQ3JCLENBQUE7QUFDSCxDQUFDO0FBRUQsU0FBUyxpQkFBaUIsQ0FBQyxFQUN6QixTQUFTLEVBQ1QsR0FBRyxLQUFLLEVBQ29CO0lBQzVCLE9BQU8sQ0FDTCwwQ0FDWSxxQkFBcUIsRUFDL0IsU0FBUyxFQUFFLElBQUEsVUFBRSxFQUFDLDhDQUE4QyxFQUFFLFNBQVMsQ0FBQyxLQUNwRSxLQUFLLEdBQ1QsQ0FDSCxDQUFBO0FBQ0gsQ0FBQztBQUVELFNBQVMsaUJBQWlCLENBQUMsRUFDekIsU0FBUyxFQUNULEdBQUcsS0FBSyxFQUNvQjtJQUM1QixPQUFPLENBQ0wsMENBQ1kscUJBQXFCLEVBQy9CLFNBQVMsRUFBRSxJQUFBLFVBQUUsRUFDWCx3REFBd0QsRUFDeEQsU0FBUyxDQUNWLEtBQ0csS0FBSyxHQUNULENBQ0gsQ0FBQTtBQUNILENBQUM7QUFFRCxTQUFTLGdCQUFnQixDQUFDLEVBQ3hCLFNBQVMsRUFDVCxHQUFHLEtBQUssRUFDZ0Q7SUFDeEQsT0FBTyxDQUNMLG9CQUFDLG9CQUFvQixDQUFDLEtBQUssaUJBQ2Ysb0JBQW9CLEVBQzlCLFNBQVMsRUFBRSxJQUFBLFVBQUUsRUFBQyx1QkFBdUIsRUFBRSxTQUFTLENBQUMsS0FDN0MsS0FBSyxHQUNULENBQ0gsQ0FBQTtBQUNILENBQUM7QUFFRCxTQUFTLHNCQUFzQixDQUFDLEVBQzlCLFNBQVMsRUFDVCxHQUFHLEtBQUssRUFDc0Q7SUFDOUQsT0FBTyxDQUNMLG9CQUFDLG9CQUFvQixDQUFDLFdBQVcsaUJBQ3JCLDBCQUEwQixFQUNwQyxTQUFTLEVBQUUsSUFBQSxVQUFFLEVBQUMsK0JBQStCLEVBQUUsU0FBUyxDQUFDLEtBQ3JELEtBQUssR0FDVCxDQUNILENBQUE7QUFDSCxDQUFDO0FBRUQsU0FBUyxpQkFBaUIsQ0FBQyxFQUN6QixTQUFTLEVBQ1QsR0FBRyxLQUFLLEVBQ2lEO0lBQ3pELE9BQU8sQ0FDTCxvQkFBQyxvQkFBb0IsQ0FBQyxNQUFNLElBQzFCLFNBQVMsRUFBRSxJQUFBLFVBQUUsRUFBQyxJQUFBLHVCQUFjLEdBQUUsRUFBRSxTQUFTLENBQUMsS0FDdEMsS0FBSyxHQUNULENBQ0gsQ0FBQTtBQUNILENBQUM7QUFFRCxTQUFTLGlCQUFpQixDQUFDLEVBQ3pCLFNBQVMsRUFDVCxHQUFHLEtBQUssRUFDaUQ7SUFDekQsT0FBTyxDQUNMLG9CQUFDLG9CQUFvQixDQUFDLE1BQU0sSUFDMUIsU0FBUyxFQUFFLElBQUEsVUFBRSxFQUFDLElBQUEsdUJBQWMsRUFBQyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxLQUM1RCxLQUFLLEdBQ1QsQ0FDSCxDQUFBO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFJlYWN0IGZyb20gXCJyZWFjdFwiXG5pbXBvcnQgKiBhcyBBbGVydERpYWxvZ1ByaW1pdGl2ZSBmcm9tIFwiQHJhZGl4LXVpL3JlYWN0LWFsZXJ0LWRpYWxvZ1wiXG5cbmltcG9ydCB7IGNuIH0gZnJvbSBcIi4uLy4uL2xpYi91dGlsc1wiXG5pbXBvcnQgeyBidXR0b25WYXJpYW50cyB9IGZyb20gXCIuL2J1dHRvblwiXG5cbmZ1bmN0aW9uIEFsZXJ0RGlhbG9nKHtcbiAgLi4ucHJvcHNcbn06IFJlYWN0LkNvbXBvbmVudFByb3BzPHR5cGVvZiBBbGVydERpYWxvZ1ByaW1pdGl2ZS5Sb290Pikge1xuICByZXR1cm4gPEFsZXJ0RGlhbG9nUHJpbWl0aXZlLlJvb3QgZGF0YS1zbG90PVwiYWxlcnQtZGlhbG9nXCIgey4uLnByb3BzfSAvPlxufVxuXG5mdW5jdGlvbiBBbGVydERpYWxvZ1RyaWdnZXIoe1xuICAuLi5wcm9wc1xufTogUmVhY3QuQ29tcG9uZW50UHJvcHM8dHlwZW9mIEFsZXJ0RGlhbG9nUHJpbWl0aXZlLlRyaWdnZXI+KSB7XG4gIHJldHVybiAoXG4gICAgPEFsZXJ0RGlhbG9nUHJpbWl0aXZlLlRyaWdnZXIgZGF0YS1zbG90PVwiYWxlcnQtZGlhbG9nLXRyaWdnZXJcIiB7Li4ucHJvcHN9IC8+XG4gIClcbn1cblxuZnVuY3Rpb24gQWxlcnREaWFsb2dQb3J0YWwoe1xuICAuLi5wcm9wc1xufTogUmVhY3QuQ29tcG9uZW50UHJvcHM8dHlwZW9mIEFsZXJ0RGlhbG9nUHJpbWl0aXZlLlBvcnRhbD4pIHtcbiAgcmV0dXJuIChcbiAgICA8QWxlcnREaWFsb2dQcmltaXRpdmUuUG9ydGFsIGRhdGEtc2xvdD1cImFsZXJ0LWRpYWxvZy1wb3J0YWxcIiB7Li4ucHJvcHN9IC8+XG4gIClcbn1cblxuZnVuY3Rpb24gQWxlcnREaWFsb2dPdmVybGF5KHtcbiAgY2xhc3NOYW1lLFxuICAuLi5wcm9wc1xufTogUmVhY3QuQ29tcG9uZW50UHJvcHM8dHlwZW9mIEFsZXJ0RGlhbG9nUHJpbWl0aXZlLk92ZXJsYXk+KSB7XG4gIHJldHVybiAoXG4gICAgPEFsZXJ0RGlhbG9nUHJpbWl0aXZlLk92ZXJsYXlcbiAgICAgIGRhdGEtc2xvdD1cImFsZXJ0LWRpYWxvZy1vdmVybGF5XCJcbiAgICAgIGNsYXNzTmFtZT17Y24oXG4gICAgICAgIFwiZGF0YS1bc3RhdGU9b3Blbl06YW5pbWF0ZS1pbiBkYXRhLVtzdGF0ZT1jbG9zZWRdOmFuaW1hdGUtb3V0IGRhdGEtW3N0YXRlPWNsb3NlZF06ZmFkZS1vdXQtMCBkYXRhLVtzdGF0ZT1vcGVuXTpmYWRlLWluLTAgZml4ZWQgaW5zZXQtMCB6LTUwIGJnLWJsYWNrLzUwXCIsXG4gICAgICAgIGNsYXNzTmFtZVxuICAgICAgKX1cbiAgICAgIHsuLi5wcm9wc31cbiAgICAvPlxuICApXG59XG5cbmZ1bmN0aW9uIEFsZXJ0RGlhbG9nQ29udGVudCh7XG4gIGNsYXNzTmFtZSxcbiAgLi4ucHJvcHNcbn06IFJlYWN0LkNvbXBvbmVudFByb3BzPHR5cGVvZiBBbGVydERpYWxvZ1ByaW1pdGl2ZS5Db250ZW50Pikge1xuICByZXR1cm4gKFxuICAgIDxBbGVydERpYWxvZ1BvcnRhbD5cbiAgICAgIDxBbGVydERpYWxvZ092ZXJsYXkgLz5cbiAgICAgIDxBbGVydERpYWxvZ1ByaW1pdGl2ZS5Db250ZW50XG4gICAgICAgIGRhdGEtc2xvdD1cImFsZXJ0LWRpYWxvZy1jb250ZW50XCJcbiAgICAgICAgY2xhc3NOYW1lPXtjbihcbiAgICAgICAgICBcImJnLWJhY2tncm91bmQgZGF0YS1bc3RhdGU9b3Blbl06YW5pbWF0ZS1pbiBkYXRhLVtzdGF0ZT1jbG9zZWRdOmFuaW1hdGUtb3V0IGRhdGEtW3N0YXRlPWNsb3NlZF06ZmFkZS1vdXQtMCBkYXRhLVtzdGF0ZT1vcGVuXTpmYWRlLWluLTAgZGF0YS1bc3RhdGU9Y2xvc2VkXTp6b29tLW91dC05NSBkYXRhLVtzdGF0ZT1vcGVuXTp6b29tLWluLTk1IGZpeGVkIHRvcC1bNTAlXSBsZWZ0LVs1MCVdIHotNTAgZ3JpZCB3LWZ1bGwgbWF4LXctW2NhbGMoMTAwJS0ycmVtKV0gdHJhbnNsYXRlLXgtWy01MCVdIHRyYW5zbGF0ZS15LVstNTAlXSBnYXAtNCByb3VuZGVkLWxnIGJvcmRlciBwLTYgc2hhZG93LWxnIGR1cmF0aW9uLTIwMCBzbTptYXgtdy1sZ1wiLFxuICAgICAgICAgIGNsYXNzTmFtZVxuICAgICAgICApfVxuICAgICAgICB7Li4ucHJvcHN9XG4gICAgICAvPlxuICAgIDwvQWxlcnREaWFsb2dQb3J0YWw+XG4gIClcbn1cblxuZnVuY3Rpb24gQWxlcnREaWFsb2dIZWFkZXIoe1xuICBjbGFzc05hbWUsXG4gIC4uLnByb3BzXG59OiBSZWFjdC5Db21wb25lbnRQcm9wczxcImRpdlwiPikge1xuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGRhdGEtc2xvdD1cImFsZXJ0LWRpYWxvZy1oZWFkZXJcIlxuICAgICAgY2xhc3NOYW1lPXtjbihcImZsZXggZmxleC1jb2wgZ2FwLTIgdGV4dC1jZW50ZXIgc206dGV4dC1sZWZ0XCIsIGNsYXNzTmFtZSl9XG4gICAgICB7Li4ucHJvcHN9XG4gICAgLz5cbiAgKVxufVxuXG5mdW5jdGlvbiBBbGVydERpYWxvZ0Zvb3Rlcih7XG4gIGNsYXNzTmFtZSxcbiAgLi4ucHJvcHNcbn06IFJlYWN0LkNvbXBvbmVudFByb3BzPFwiZGl2XCI+KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgZGF0YS1zbG90PVwiYWxlcnQtZGlhbG9nLWZvb3RlclwiXG4gICAgICBjbGFzc05hbWU9e2NuKFxuICAgICAgICBcImZsZXggZmxleC1jb2wtcmV2ZXJzZSBnYXAtMiBzbTpmbGV4LXJvdyBzbTpqdXN0aWZ5LWVuZFwiLFxuICAgICAgICBjbGFzc05hbWVcbiAgICAgICl9XG4gICAgICB7Li4ucHJvcHN9XG4gICAgLz5cbiAgKVxufVxuXG5mdW5jdGlvbiBBbGVydERpYWxvZ1RpdGxlKHtcbiAgY2xhc3NOYW1lLFxuICAuLi5wcm9wc1xufTogUmVhY3QuQ29tcG9uZW50UHJvcHM8dHlwZW9mIEFsZXJ0RGlhbG9nUHJpbWl0aXZlLlRpdGxlPikge1xuICByZXR1cm4gKFxuICAgIDxBbGVydERpYWxvZ1ByaW1pdGl2ZS5UaXRsZVxuICAgICAgZGF0YS1zbG90PVwiYWxlcnQtZGlhbG9nLXRpdGxlXCJcbiAgICAgIGNsYXNzTmFtZT17Y24oXCJ0ZXh0LWxnIGZvbnQtc2VtaWJvbGRcIiwgY2xhc3NOYW1lKX1cbiAgICAgIHsuLi5wcm9wc31cbiAgICAvPlxuICApXG59XG5cbmZ1bmN0aW9uIEFsZXJ0RGlhbG9nRGVzY3JpcHRpb24oe1xuICBjbGFzc05hbWUsXG4gIC4uLnByb3BzXG59OiBSZWFjdC5Db21wb25lbnRQcm9wczx0eXBlb2YgQWxlcnREaWFsb2dQcmltaXRpdmUuRGVzY3JpcHRpb24+KSB7XG4gIHJldHVybiAoXG4gICAgPEFsZXJ0RGlhbG9nUHJpbWl0aXZlLkRlc2NyaXB0aW9uXG4gICAgICBkYXRhLXNsb3Q9XCJhbGVydC1kaWFsb2ctZGVzY3JpcHRpb25cIlxuICAgICAgY2xhc3NOYW1lPXtjbihcInRleHQtbXV0ZWQtZm9yZWdyb3VuZCB0ZXh0LXNtXCIsIGNsYXNzTmFtZSl9XG4gICAgICB7Li4ucHJvcHN9XG4gICAgLz5cbiAgKVxufVxuXG5mdW5jdGlvbiBBbGVydERpYWxvZ0FjdGlvbih7XG4gIGNsYXNzTmFtZSxcbiAgLi4ucHJvcHNcbn06IFJlYWN0LkNvbXBvbmVudFByb3BzPHR5cGVvZiBBbGVydERpYWxvZ1ByaW1pdGl2ZS5BY3Rpb24+KSB7XG4gIHJldHVybiAoXG4gICAgPEFsZXJ0RGlhbG9nUHJpbWl0aXZlLkFjdGlvblxuICAgICAgY2xhc3NOYW1lPXtjbihidXR0b25WYXJpYW50cygpLCBjbGFzc05hbWUpfVxuICAgICAgey4uLnByb3BzfVxuICAgIC8+XG4gIClcbn1cblxuZnVuY3Rpb24gQWxlcnREaWFsb2dDYW5jZWwoe1xuICBjbGFzc05hbWUsXG4gIC4uLnByb3BzXG59OiBSZWFjdC5Db21wb25lbnRQcm9wczx0eXBlb2YgQWxlcnREaWFsb2dQcmltaXRpdmUuQ2FuY2VsPikge1xuICByZXR1cm4gKFxuICAgIDxBbGVydERpYWxvZ1ByaW1pdGl2ZS5DYW5jZWxcbiAgICAgIGNsYXNzTmFtZT17Y24oYnV0dG9uVmFyaWFudHMoeyB2YXJpYW50OiBcIm91dGxpbmVcIiB9KSwgY2xhc3NOYW1lKX1cbiAgICAgIHsuLi5wcm9wc31cbiAgICAvPlxuICApXG59XG5cbmV4cG9ydCB7XG4gIEFsZXJ0RGlhbG9nLFxuICBBbGVydERpYWxvZ1BvcnRhbCxcbiAgQWxlcnREaWFsb2dPdmVybGF5LFxuICBBbGVydERpYWxvZ1RyaWdnZXIsXG4gIEFsZXJ0RGlhbG9nQ29udGVudCxcbiAgQWxlcnREaWFsb2dIZWFkZXIsXG4gIEFsZXJ0RGlhbG9nRm9vdGVyLFxuICBBbGVydERpYWxvZ1RpdGxlLFxuICBBbGVydERpYWxvZ0Rlc2NyaXB0aW9uLFxuICBBbGVydERpYWxvZ0FjdGlvbixcbiAgQWxlcnREaWFsb2dDYW5jZWwsXG59XG4iXX0=