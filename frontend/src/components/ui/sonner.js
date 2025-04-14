"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Toaster = void 0;
const next_themes_1 = require("next-themes");
const sonner_1 = require("sonner");
const Toaster = ({ ...props }) => {
    const { theme = "system" } = (0, next_themes_1.useTheme)();
    return (React.createElement(sonner_1.Toaster, { theme: theme, className: "toaster group", style: {
            "--normal-bg": "var(--popover)",
            "--normal-text": "var(--popover-foreground)",
            "--normal-border": "var(--border)",
        }, ...props }));
};
exports.Toaster = Toaster;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ubmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic29ubmVyLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw2Q0FBc0M7QUFDdEMsbUNBQXdEO0FBRXhELE1BQU0sT0FBTyxHQUFHLENBQUMsRUFBRSxHQUFHLEtBQUssRUFBZ0IsRUFBRSxFQUFFO0lBQzdDLE1BQU0sRUFBRSxLQUFLLEdBQUcsUUFBUSxFQUFFLEdBQUcsSUFBQSxzQkFBUSxHQUFFLENBQUE7SUFFdkMsT0FBTyxDQUNMLG9CQUFDLGdCQUFNLElBQ0wsS0FBSyxFQUFFLEtBQThCLEVBQ3JDLFNBQVMsRUFBQyxlQUFlLEVBQ3pCLEtBQUssRUFDSDtZQUNFLGFBQWEsRUFBRSxnQkFBZ0I7WUFDL0IsZUFBZSxFQUFFLDJCQUEyQjtZQUM1QyxpQkFBaUIsRUFBRSxlQUFlO1NBQ1osS0FFdEIsS0FBSyxHQUNULENBQ0gsQ0FBQTtBQUNILENBQUMsQ0FBQTtBQUVRLDBCQUFPIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdXNlVGhlbWUgfSBmcm9tIFwibmV4dC10aGVtZXNcIlxuaW1wb3J0IHsgVG9hc3RlciBhcyBTb25uZXIsIFRvYXN0ZXJQcm9wcyB9IGZyb20gXCJzb25uZXJcIlxuXG5jb25zdCBUb2FzdGVyID0gKHsgLi4ucHJvcHMgfTogVG9hc3RlclByb3BzKSA9PiB7XG4gIGNvbnN0IHsgdGhlbWUgPSBcInN5c3RlbVwiIH0gPSB1c2VUaGVtZSgpXG5cbiAgcmV0dXJuIChcbiAgICA8U29ubmVyXG4gICAgICB0aGVtZT17dGhlbWUgYXMgVG9hc3RlclByb3BzW1widGhlbWVcIl19XG4gICAgICBjbGFzc05hbWU9XCJ0b2FzdGVyIGdyb3VwXCJcbiAgICAgIHN0eWxlPXtcbiAgICAgICAge1xuICAgICAgICAgIFwiLS1ub3JtYWwtYmdcIjogXCJ2YXIoLS1wb3BvdmVyKVwiLFxuICAgICAgICAgIFwiLS1ub3JtYWwtdGV4dFwiOiBcInZhcigtLXBvcG92ZXItZm9yZWdyb3VuZClcIixcbiAgICAgICAgICBcIi0tbm9ybWFsLWJvcmRlclwiOiBcInZhcigtLWJvcmRlcilcIixcbiAgICAgICAgfSBhcyBSZWFjdC5DU1NQcm9wZXJ0aWVzXG4gICAgICB9XG4gICAgICB7Li4ucHJvcHN9XG4gICAgLz5cbiAgKVxufVxuXG5leHBvcnQgeyBUb2FzdGVyIH1cbiJdfQ==