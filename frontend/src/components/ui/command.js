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
exports.Command = Command;
exports.CommandDialog = CommandDialog;
exports.CommandInput = CommandInput;
exports.CommandList = CommandList;
exports.CommandEmpty = CommandEmpty;
exports.CommandGroup = CommandGroup;
exports.CommandItem = CommandItem;
exports.CommandShortcut = CommandShortcut;
exports.CommandSeparator = CommandSeparator;
const React = __importStar(require("react"));
const cmdk_1 = require("cmdk");
const lucide_react_1 = require("lucide-react");
const utils_1 = require("../../lib/utils");
const dialog_1 = require("@/components/ui/dialog");
function Command({ className, ...props }) {
    return (React.createElement(cmdk_1.Command, { "data-slot": "command", className: (0, utils_1.cn)("bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md", className), ...props }));
}
function CommandDialog({ title = "Command Palette", description = "Search for a command to run...", children, ...props }) {
    return (React.createElement(dialog_1.Dialog, { ...props },
        React.createElement(dialog_1.DialogHeader, { className: "sr-only" },
            React.createElement(dialog_1.DialogTitle, null, title),
            React.createElement(dialog_1.DialogDescription, null, description)),
        React.createElement(dialog_1.DialogContent, { className: "overflow-hidden p-0" },
            React.createElement(Command, { className: "[&_[cmdk-group-heading]]:text-muted-foreground **:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5" }, children))));
}
function CommandInput({ className, ...props }) {
    return (React.createElement("div", { "data-slot": "command-input-wrapper", className: "flex h-9 items-center gap-2 border-b px-3" },
        React.createElement(lucide_react_1.SearchIcon, { className: "size-4 shrink-0 opacity-50" }),
        React.createElement(cmdk_1.Command.Input, { "data-slot": "command-input", className: (0, utils_1.cn)("placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50", className), ...props })));
}
function CommandList({ className, ...props }) {
    return (React.createElement(cmdk_1.Command.List, { "data-slot": "command-list", className: (0, utils_1.cn)("max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto", className), ...props }));
}
function CommandEmpty({ ...props }) {
    return (React.createElement(cmdk_1.Command.Empty, { "data-slot": "command-empty", className: "py-6 text-center text-sm", ...props }));
}
function CommandGroup({ className, ...props }) {
    return (React.createElement(cmdk_1.Command.Group, { "data-slot": "command-group", className: (0, utils_1.cn)("text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium", className), ...props }));
}
function CommandSeparator({ className, ...props }) {
    return (React.createElement(cmdk_1.Command.Separator, { "data-slot": "command-separator", className: (0, utils_1.cn)("bg-border -mx-1 h-px", className), ...props }));
}
function CommandItem({ className, ...props }) {
    return (React.createElement(cmdk_1.Command.Item, { "data-slot": "command-item", className: (0, utils_1.cn)("data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className), ...props }));
}
function CommandShortcut({ className, ...props }) {
    return (React.createElement("span", { "data-slot": "command-shortcut", className: (0, utils_1.cn)("text-muted-foreground ml-auto text-xs tracking-widest", className), ...props }));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNvbW1hbmQudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBcUtFLDBCQUFPO0FBQ1Asc0NBQWE7QUFDYixvQ0FBWTtBQUNaLGtDQUFXO0FBQ1gsb0NBQVk7QUFDWixvQ0FBWTtBQUNaLGtDQUFXO0FBQ1gsMENBQWU7QUFDZiw0Q0FBZ0I7QUE3S2xCLDZDQUE4QjtBQUM5QiwrQkFBa0Q7QUFDbEQsK0NBQXlDO0FBRXpDLHVDQUFnQztBQUNoQyxtREFNK0I7QUFFL0IsU0FBUyxPQUFPLENBQUMsRUFDZixTQUFTLEVBQ1QsR0FBRyxLQUFLLEVBQ3NDO0lBQzlDLE9BQU8sQ0FDTCxvQkFBQyxjQUFnQixpQkFDTCxTQUFTLEVBQ25CLFNBQVMsRUFBRSxJQUFBLFVBQUUsRUFDWCwyRkFBMkYsRUFDM0YsU0FBUyxDQUNWLEtBQ0csS0FBSyxHQUNULENBQ0gsQ0FBQTtBQUNILENBQUM7QUFFRCxTQUFTLGFBQWEsQ0FBQyxFQUNyQixLQUFLLEdBQUcsaUJBQWlCLEVBQ3pCLFdBQVcsR0FBRyxnQ0FBZ0MsRUFDOUMsUUFBUSxFQUNSLEdBQUcsS0FBSyxFQUlUO0lBQ0MsT0FBTyxDQUNMLG9CQUFDLGVBQU0sT0FBSyxLQUFLO1FBQ2Ysb0JBQUMscUJBQVksSUFBQyxTQUFTLEVBQUMsU0FBUztZQUMvQixvQkFBQyxvQkFBVyxRQUFFLEtBQUssQ0FBZTtZQUNsQyxvQkFBQywwQkFBaUIsUUFBRSxXQUFXLENBQXFCLENBQ3ZDO1FBQ2Ysb0JBQUMsc0JBQWEsSUFBQyxTQUFTLEVBQUMscUJBQXFCO1lBQzVDLG9CQUFDLE9BQU8sSUFBQyxTQUFTLEVBQUMsdVpBQXVaLElBQ3ZhLFFBQVEsQ0FDRCxDQUNJLENBQ1QsQ0FDVixDQUFBO0FBQ0gsQ0FBQztBQUVELFNBQVMsWUFBWSxDQUFDLEVBQ3BCLFNBQVMsRUFDVCxHQUFHLEtBQUssRUFDNEM7SUFDcEQsT0FBTyxDQUNMLDBDQUNZLHVCQUF1QixFQUNqQyxTQUFTLEVBQUMsMkNBQTJDO1FBRXJELG9CQUFDLHlCQUFVLElBQUMsU0FBUyxFQUFDLDRCQUE0QixHQUFHO1FBQ3JELG9CQUFDLGNBQWdCLENBQUMsS0FBSyxpQkFDWCxlQUFlLEVBQ3pCLFNBQVMsRUFBRSxJQUFBLFVBQUUsRUFDWCwwSkFBMEosRUFDMUosU0FBUyxDQUNWLEtBQ0csS0FBSyxHQUNULENBQ0UsQ0FDUCxDQUFBO0FBQ0gsQ0FBQztBQUVELFNBQVMsV0FBVyxDQUFDLEVBQ25CLFNBQVMsRUFDVCxHQUFHLEtBQUssRUFDMkM7SUFDbkQsT0FBTyxDQUNMLG9CQUFDLGNBQWdCLENBQUMsSUFBSSxpQkFDVixjQUFjLEVBQ3hCLFNBQVMsRUFBRSxJQUFBLFVBQUUsRUFDWCw2REFBNkQsRUFDN0QsU0FBUyxDQUNWLEtBQ0csS0FBSyxHQUNULENBQ0gsQ0FBQTtBQUNILENBQUM7QUFFRCxTQUFTLFlBQVksQ0FBQyxFQUNwQixHQUFHLEtBQUssRUFDNEM7SUFDcEQsT0FBTyxDQUNMLG9CQUFDLGNBQWdCLENBQUMsS0FBSyxpQkFDWCxlQUFlLEVBQ3pCLFNBQVMsRUFBQywwQkFBMEIsS0FDaEMsS0FBSyxHQUNULENBQ0gsQ0FBQTtBQUNILENBQUM7QUFFRCxTQUFTLFlBQVksQ0FBQyxFQUNwQixTQUFTLEVBQ1QsR0FBRyxLQUFLLEVBQzRDO0lBQ3BELE9BQU8sQ0FDTCxvQkFBQyxjQUFnQixDQUFDLEtBQUssaUJBQ1gsZUFBZSxFQUN6QixTQUFTLEVBQUUsSUFBQSxVQUFFLEVBQ1gsd05BQXdOLEVBQ3hOLFNBQVMsQ0FDVixLQUNHLEtBQUssR0FDVCxDQUNILENBQUE7QUFDSCxDQUFDO0FBRUQsU0FBUyxnQkFBZ0IsQ0FBQyxFQUN4QixTQUFTLEVBQ1QsR0FBRyxLQUFLLEVBQ2dEO0lBQ3hELE9BQU8sQ0FDTCxvQkFBQyxjQUFnQixDQUFDLFNBQVMsaUJBQ2YsbUJBQW1CLEVBQzdCLFNBQVMsRUFBRSxJQUFBLFVBQUUsRUFBQyxzQkFBc0IsRUFBRSxTQUFTLENBQUMsS0FDNUMsS0FBSyxHQUNULENBQ0gsQ0FBQTtBQUNILENBQUM7QUFFRCxTQUFTLFdBQVcsQ0FBQyxFQUNuQixTQUFTLEVBQ1QsR0FBRyxLQUFLLEVBQzJDO0lBQ25ELE9BQU8sQ0FDTCxvQkFBQyxjQUFnQixDQUFDLElBQUksaUJBQ1YsY0FBYyxFQUN4QixTQUFTLEVBQUUsSUFBQSxVQUFFLEVBQ1gscVlBQXFZLEVBQ3JZLFNBQVMsQ0FDVixLQUNHLEtBQUssR0FDVCxDQUNILENBQUE7QUFDSCxDQUFDO0FBRUQsU0FBUyxlQUFlLENBQUMsRUFDdkIsU0FBUyxFQUNULEdBQUcsS0FBSyxFQUNxQjtJQUM3QixPQUFPLENBQ0wsMkNBQ1ksa0JBQWtCLEVBQzVCLFNBQVMsRUFBRSxJQUFBLFVBQUUsRUFDWCx1REFBdUQsRUFDdkQsU0FBUyxDQUNWLEtBQ0csS0FBSyxHQUNULENBQ0gsQ0FBQTtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tIFwicmVhY3RcIlxuaW1wb3J0IHsgQ29tbWFuZCBhcyBDb21tYW5kUHJpbWl0aXZlIH0gZnJvbSBcImNtZGtcIlxuaW1wb3J0IHsgU2VhcmNoSWNvbiB9IGZyb20gXCJsdWNpZGUtcmVhY3RcIlxuXG5pbXBvcnQgeyBjbiB9IGZyb20gXCJAL2xpYi91dGlsc1wiXG5pbXBvcnQge1xuICBEaWFsb2csXG4gIERpYWxvZ0NvbnRlbnQsXG4gIERpYWxvZ0Rlc2NyaXB0aW9uLFxuICBEaWFsb2dIZWFkZXIsXG4gIERpYWxvZ1RpdGxlLFxufSBmcm9tIFwiQC9jb21wb25lbnRzL3VpL2RpYWxvZ1wiXG5cbmZ1bmN0aW9uIENvbW1hbmQoe1xuICBjbGFzc05hbWUsXG4gIC4uLnByb3BzXG59OiBSZWFjdC5Db21wb25lbnRQcm9wczx0eXBlb2YgQ29tbWFuZFByaW1pdGl2ZT4pIHtcbiAgcmV0dXJuIChcbiAgICA8Q29tbWFuZFByaW1pdGl2ZVxuICAgICAgZGF0YS1zbG90PVwiY29tbWFuZFwiXG4gICAgICBjbGFzc05hbWU9e2NuKFxuICAgICAgICBcImJnLXBvcG92ZXIgdGV4dC1wb3BvdmVyLWZvcmVncm91bmQgZmxleCBoLWZ1bGwgdy1mdWxsIGZsZXgtY29sIG92ZXJmbG93LWhpZGRlbiByb3VuZGVkLW1kXCIsXG4gICAgICAgIGNsYXNzTmFtZVxuICAgICAgKX1cbiAgICAgIHsuLi5wcm9wc31cbiAgICAvPlxuICApXG59XG5cbmZ1bmN0aW9uIENvbW1hbmREaWFsb2coe1xuICB0aXRsZSA9IFwiQ29tbWFuZCBQYWxldHRlXCIsXG4gIGRlc2NyaXB0aW9uID0gXCJTZWFyY2ggZm9yIGEgY29tbWFuZCB0byBydW4uLi5cIixcbiAgY2hpbGRyZW4sXG4gIC4uLnByb3BzXG59OiBSZWFjdC5Db21wb25lbnRQcm9wczx0eXBlb2YgRGlhbG9nPiAmIHtcbiAgdGl0bGU/OiBzdHJpbmdcbiAgZGVzY3JpcHRpb24/OiBzdHJpbmdcbn0pIHtcbiAgcmV0dXJuIChcbiAgICA8RGlhbG9nIHsuLi5wcm9wc30+XG4gICAgICA8RGlhbG9nSGVhZGVyIGNsYXNzTmFtZT1cInNyLW9ubHlcIj5cbiAgICAgICAgPERpYWxvZ1RpdGxlPnt0aXRsZX08L0RpYWxvZ1RpdGxlPlxuICAgICAgICA8RGlhbG9nRGVzY3JpcHRpb24+e2Rlc2NyaXB0aW9ufTwvRGlhbG9nRGVzY3JpcHRpb24+XG4gICAgICA8L0RpYWxvZ0hlYWRlcj5cbiAgICAgIDxEaWFsb2dDb250ZW50IGNsYXNzTmFtZT1cIm92ZXJmbG93LWhpZGRlbiBwLTBcIj5cbiAgICAgICAgPENvbW1hbmQgY2xhc3NOYW1lPVwiWyZfW2NtZGstZ3JvdXAtaGVhZGluZ11dOnRleHQtbXV0ZWQtZm9yZWdyb3VuZCAqKjpkYXRhLVtzbG90PWNvbW1hbmQtaW5wdXQtd3JhcHBlcl06aC0xMiBbJl9bY21kay1ncm91cC1oZWFkaW5nXV06cHgtMiBbJl9bY21kay1ncm91cC1oZWFkaW5nXV06Zm9udC1tZWRpdW0gWyZfW2NtZGstZ3JvdXBdXTpweC0yIFsmX1tjbWRrLWdyb3VwXTpub3QoW2hpZGRlbl0pX35bY21kay1ncm91cF1dOnB0LTAgWyZfW2NtZGstaW5wdXQtd3JhcHBlcl1fc3ZnXTpoLTUgWyZfW2NtZGstaW5wdXQtd3JhcHBlcl1fc3ZnXTp3LTUgWyZfW2NtZGstaW5wdXRdXTpoLTEyIFsmX1tjbWRrLWl0ZW1dXTpweC0yIFsmX1tjbWRrLWl0ZW1dXTpweS0zIFsmX1tjbWRrLWl0ZW1dX3N2Z106aC01IFsmX1tjbWRrLWl0ZW1dX3N2Z106dy01XCI+XG4gICAgICAgICAge2NoaWxkcmVufVxuICAgICAgICA8L0NvbW1hbmQ+XG4gICAgICA8L0RpYWxvZ0NvbnRlbnQ+XG4gICAgPC9EaWFsb2c+XG4gIClcbn1cblxuZnVuY3Rpb24gQ29tbWFuZElucHV0KHtcbiAgY2xhc3NOYW1lLFxuICAuLi5wcm9wc1xufTogUmVhY3QuQ29tcG9uZW50UHJvcHM8dHlwZW9mIENvbW1hbmRQcmltaXRpdmUuSW5wdXQ+KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgZGF0YS1zbG90PVwiY29tbWFuZC1pbnB1dC13cmFwcGVyXCJcbiAgICAgIGNsYXNzTmFtZT1cImZsZXggaC05IGl0ZW1zLWNlbnRlciBnYXAtMiBib3JkZXItYiBweC0zXCJcbiAgICA+XG4gICAgICA8U2VhcmNoSWNvbiBjbGFzc05hbWU9XCJzaXplLTQgc2hyaW5rLTAgb3BhY2l0eS01MFwiIC8+XG4gICAgICA8Q29tbWFuZFByaW1pdGl2ZS5JbnB1dFxuICAgICAgICBkYXRhLXNsb3Q9XCJjb21tYW5kLWlucHV0XCJcbiAgICAgICAgY2xhc3NOYW1lPXtjbihcbiAgICAgICAgICBcInBsYWNlaG9sZGVyOnRleHQtbXV0ZWQtZm9yZWdyb3VuZCBmbGV4IGgtMTAgdy1mdWxsIHJvdW5kZWQtbWQgYmctdHJhbnNwYXJlbnQgcHktMyB0ZXh0LXNtIG91dGxpbmUtaGlkZGVuIGRpc2FibGVkOmN1cnNvci1ub3QtYWxsb3dlZCBkaXNhYmxlZDpvcGFjaXR5LTUwXCIsXG4gICAgICAgICAgY2xhc3NOYW1lXG4gICAgICAgICl9XG4gICAgICAgIHsuLi5wcm9wc31cbiAgICAgIC8+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZnVuY3Rpb24gQ29tbWFuZExpc3Qoe1xuICBjbGFzc05hbWUsXG4gIC4uLnByb3BzXG59OiBSZWFjdC5Db21wb25lbnRQcm9wczx0eXBlb2YgQ29tbWFuZFByaW1pdGl2ZS5MaXN0Pikge1xuICByZXR1cm4gKFxuICAgIDxDb21tYW5kUHJpbWl0aXZlLkxpc3RcbiAgICAgIGRhdGEtc2xvdD1cImNvbW1hbmQtbGlzdFwiXG4gICAgICBjbGFzc05hbWU9e2NuKFxuICAgICAgICBcIm1heC1oLVszMDBweF0gc2Nyb2xsLXB5LTEgb3ZlcmZsb3cteC1oaWRkZW4gb3ZlcmZsb3cteS1hdXRvXCIsXG4gICAgICAgIGNsYXNzTmFtZVxuICAgICAgKX1cbiAgICAgIHsuLi5wcm9wc31cbiAgICAvPlxuICApXG59XG5cbmZ1bmN0aW9uIENvbW1hbmRFbXB0eSh7XG4gIC4uLnByb3BzXG59OiBSZWFjdC5Db21wb25lbnRQcm9wczx0eXBlb2YgQ29tbWFuZFByaW1pdGl2ZS5FbXB0eT4pIHtcbiAgcmV0dXJuIChcbiAgICA8Q29tbWFuZFByaW1pdGl2ZS5FbXB0eVxuICAgICAgZGF0YS1zbG90PVwiY29tbWFuZC1lbXB0eVwiXG4gICAgICBjbGFzc05hbWU9XCJweS02IHRleHQtY2VudGVyIHRleHQtc21cIlxuICAgICAgey4uLnByb3BzfVxuICAgIC8+XG4gIClcbn1cblxuZnVuY3Rpb24gQ29tbWFuZEdyb3VwKHtcbiAgY2xhc3NOYW1lLFxuICAuLi5wcm9wc1xufTogUmVhY3QuQ29tcG9uZW50UHJvcHM8dHlwZW9mIENvbW1hbmRQcmltaXRpdmUuR3JvdXA+KSB7XG4gIHJldHVybiAoXG4gICAgPENvbW1hbmRQcmltaXRpdmUuR3JvdXBcbiAgICAgIGRhdGEtc2xvdD1cImNvbW1hbmQtZ3JvdXBcIlxuICAgICAgY2xhc3NOYW1lPXtjbihcbiAgICAgICAgXCJ0ZXh0LWZvcmVncm91bmQgWyZfW2NtZGstZ3JvdXAtaGVhZGluZ11dOnRleHQtbXV0ZWQtZm9yZWdyb3VuZCBvdmVyZmxvdy1oaWRkZW4gcC0xIFsmX1tjbWRrLWdyb3VwLWhlYWRpbmddXTpweC0yIFsmX1tjbWRrLWdyb3VwLWhlYWRpbmddXTpweS0xLjUgWyZfW2NtZGstZ3JvdXAtaGVhZGluZ11dOnRleHQteHMgWyZfW2NtZGstZ3JvdXAtaGVhZGluZ11dOmZvbnQtbWVkaXVtXCIsXG4gICAgICAgIGNsYXNzTmFtZVxuICAgICAgKX1cbiAgICAgIHsuLi5wcm9wc31cbiAgICAvPlxuICApXG59XG5cbmZ1bmN0aW9uIENvbW1hbmRTZXBhcmF0b3Ioe1xuICBjbGFzc05hbWUsXG4gIC4uLnByb3BzXG59OiBSZWFjdC5Db21wb25lbnRQcm9wczx0eXBlb2YgQ29tbWFuZFByaW1pdGl2ZS5TZXBhcmF0b3I+KSB7XG4gIHJldHVybiAoXG4gICAgPENvbW1hbmRQcmltaXRpdmUuU2VwYXJhdG9yXG4gICAgICBkYXRhLXNsb3Q9XCJjb21tYW5kLXNlcGFyYXRvclwiXG4gICAgICBjbGFzc05hbWU9e2NuKFwiYmctYm9yZGVyIC1teC0xIGgtcHhcIiwgY2xhc3NOYW1lKX1cbiAgICAgIHsuLi5wcm9wc31cbiAgICAvPlxuICApXG59XG5cbmZ1bmN0aW9uIENvbW1hbmRJdGVtKHtcbiAgY2xhc3NOYW1lLFxuICAuLi5wcm9wc1xufTogUmVhY3QuQ29tcG9uZW50UHJvcHM8dHlwZW9mIENvbW1hbmRQcmltaXRpdmUuSXRlbT4pIHtcbiAgcmV0dXJuIChcbiAgICA8Q29tbWFuZFByaW1pdGl2ZS5JdGVtXG4gICAgICBkYXRhLXNsb3Q9XCJjb21tYW5kLWl0ZW1cIlxuICAgICAgY2xhc3NOYW1lPXtjbihcbiAgICAgICAgXCJkYXRhLVtzZWxlY3RlZD10cnVlXTpiZy1hY2NlbnQgZGF0YS1bc2VsZWN0ZWQ9dHJ1ZV06dGV4dC1hY2NlbnQtZm9yZWdyb3VuZCBbJl9zdmc6bm90KFtjbGFzcyo9J3RleHQtJ10pXTp0ZXh0LW11dGVkLWZvcmVncm91bmQgcmVsYXRpdmUgZmxleCBjdXJzb3ItZGVmYXVsdCBpdGVtcy1jZW50ZXIgZ2FwLTIgcm91bmRlZC1zbSBweC0yIHB5LTEuNSB0ZXh0LXNtIG91dGxpbmUtaGlkZGVuIHNlbGVjdC1ub25lIGRhdGEtW2Rpc2FibGVkPXRydWVdOnBvaW50ZXItZXZlbnRzLW5vbmUgZGF0YS1bZGlzYWJsZWQ9dHJ1ZV06b3BhY2l0eS01MCBbJl9zdmddOnBvaW50ZXItZXZlbnRzLW5vbmUgWyZfc3ZnXTpzaHJpbmstMCBbJl9zdmc6bm90KFtjbGFzcyo9J3NpemUtJ10pXTpzaXplLTRcIixcbiAgICAgICAgY2xhc3NOYW1lXG4gICAgICApfVxuICAgICAgey4uLnByb3BzfVxuICAgIC8+XG4gIClcbn1cblxuZnVuY3Rpb24gQ29tbWFuZFNob3J0Y3V0KHtcbiAgY2xhc3NOYW1lLFxuICAuLi5wcm9wc1xufTogUmVhY3QuQ29tcG9uZW50UHJvcHM8XCJzcGFuXCI+KSB7XG4gIHJldHVybiAoXG4gICAgPHNwYW5cbiAgICAgIGRhdGEtc2xvdD1cImNvbW1hbmQtc2hvcnRjdXRcIlxuICAgICAgY2xhc3NOYW1lPXtjbihcbiAgICAgICAgXCJ0ZXh0LW11dGVkLWZvcmVncm91bmQgbWwtYXV0byB0ZXh0LXhzIHRyYWNraW5nLXdpZGVzdFwiLFxuICAgICAgICBjbGFzc05hbWVcbiAgICAgICl9XG4gICAgICB7Li4ucHJvcHN9XG4gICAgLz5cbiAgKVxufVxuXG5leHBvcnQge1xuICBDb21tYW5kLFxuICBDb21tYW5kRGlhbG9nLFxuICBDb21tYW5kSW5wdXQsXG4gIENvbW1hbmRMaXN0LFxuICBDb21tYW5kRW1wdHksXG4gIENvbW1hbmRHcm91cCxcbiAgQ29tbWFuZEl0ZW0sXG4gIENvbW1hbmRTaG9ydGN1dCxcbiAgQ29tbWFuZFNlcGFyYXRvcixcbn1cbiJdfQ==