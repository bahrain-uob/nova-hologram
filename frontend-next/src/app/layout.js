"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = RootLayout;
require("./globals.css");
const google_1 = require("next/font/google");
const auth_context_1 = require("../context/auth-context");
const sonner_1 = require("sonner");
// ✅ حمل الخطوط من Google وربطهم بالـ variables اللي نستخدمها
const jakarta = (0, google_1.Plus_Jakarta_Sans)({
    subsets: ["latin"],
    variable: "--semi-bold-13px-font-family",
    weight: ["400", "500", "700"],
});
const inter = (0, google_1.Inter)({
    subsets: ["latin"],
    variable: "--semi-bold-16px-font-family",
    weight: ["400", "500", "700"],
});
exports.metadata = {
    title: "Nova Hologram",
    description: "AI-powered reading materials platform",
};
function RootLayout({ children, }) {
    return (React.createElement("html", { lang: "en", className: `${jakarta.variable} ${inter.variable}` },
        React.createElement("body", { className: "antialiased" },
            React.createElement(auth_context_1.AuthProvider, null,
                children,
                React.createElement(sonner_1.Toaster, { position: "top-right" })))));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF5b3V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibGF5b3V0LnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUF3QkEsNkJBZUM7QUF0Q0QseUJBQXVCO0FBQ3ZCLDZDQUE0RDtBQUM1RCwwREFBdUQ7QUFDdkQsbUNBQWlDO0FBRWpDLDZEQUE2RDtBQUM3RCxNQUFNLE9BQU8sR0FBRyxJQUFBLDBCQUFpQixFQUFDO0lBQ2hDLE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQztJQUNsQixRQUFRLEVBQUUsOEJBQThCO0lBQ3hDLE1BQU0sRUFBRSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDO0NBQzlCLENBQUMsQ0FBQztBQUVILE1BQU0sS0FBSyxHQUFHLElBQUEsY0FBSyxFQUFDO0lBQ2xCLE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQztJQUNsQixRQUFRLEVBQUUsOEJBQThCO0lBQ3hDLE1BQU0sRUFBRSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDO0NBQzlCLENBQUMsQ0FBQztBQUVVLFFBQUEsUUFBUSxHQUFhO0lBQ2hDLEtBQUssRUFBRSxlQUFlO0lBQ3RCLFdBQVcsRUFBRSx1Q0FBdUM7Q0FDckQsQ0FBQztBQUVGLFNBQXdCLFVBQVUsQ0FBQyxFQUNqQyxRQUFRLEdBR1I7SUFDQSxPQUFPLENBQ0wsOEJBQU0sSUFBSSxFQUFDLElBQUksRUFBQyxTQUFTLEVBQUUsR0FBRyxPQUFPLENBQUMsUUFBUSxJQUFJLEtBQUssQ0FBQyxRQUFRLEVBQUU7UUFDaEUsOEJBQU0sU0FBUyxFQUFDLGFBQWE7WUFDM0Isb0JBQUMsMkJBQVk7Z0JBQ1YsUUFBUTtnQkFDVCxvQkFBQyxnQkFBTyxJQUFDLFFBQVEsRUFBQyxXQUFXLEdBQUcsQ0FDbkIsQ0FDVixDQUNGLENBQ1IsQ0FBQztBQUNKLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IE1ldGFkYXRhIH0gZnJvbSBcIm5leHRcIjtcbmltcG9ydCBcIi4vZ2xvYmFscy5jc3NcIjtcbmltcG9ydCB7IFBsdXNfSmFrYXJ0YV9TYW5zLCBJbnRlciB9IGZyb20gXCJuZXh0L2ZvbnQvZ29vZ2xlXCI7XG5pbXBvcnQgeyBBdXRoUHJvdmlkZXIgfSBmcm9tIFwiLi4vY29udGV4dC9hdXRoLWNvbnRleHRcIjtcbmltcG9ydCB7IFRvYXN0ZXIgfSBmcm9tIFwic29ubmVyXCI7XG5cbi8vIOKchSDYrdmF2YQg2KfZhNiu2LfZiNi3INmF2YYgR29vZ2xlINmI2LHYqNi32YfZhSDYqNin2YTZgCB2YXJpYWJsZXMg2KfZhNmE2Yog2YbYs9iq2K7Yr9mF2YfYp1xuY29uc3QgamFrYXJ0YSA9IFBsdXNfSmFrYXJ0YV9TYW5zKHtcbiAgc3Vic2V0czogW1wibGF0aW5cIl0sXG4gIHZhcmlhYmxlOiBcIi0tc2VtaS1ib2xkLTEzcHgtZm9udC1mYW1pbHlcIixcbiAgd2VpZ2h0OiBbXCI0MDBcIiwgXCI1MDBcIiwgXCI3MDBcIl0sXG59KTtcblxuY29uc3QgaW50ZXIgPSBJbnRlcih7XG4gIHN1YnNldHM6IFtcImxhdGluXCJdLFxuICB2YXJpYWJsZTogXCItLXNlbWktYm9sZC0xNnB4LWZvbnQtZmFtaWx5XCIsXG4gIHdlaWdodDogW1wiNDAwXCIsIFwiNTAwXCIsIFwiNzAwXCJdLFxufSk7XG5cbmV4cG9ydCBjb25zdCBtZXRhZGF0YTogTWV0YWRhdGEgPSB7XG4gIHRpdGxlOiBcIk5vdmEgSG9sb2dyYW1cIixcbiAgZGVzY3JpcHRpb246IFwiQUktcG93ZXJlZCByZWFkaW5nIG1hdGVyaWFscyBwbGF0Zm9ybVwiLFxufTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gUm9vdExheW91dCh7XG4gIGNoaWxkcmVuLFxufTogUmVhZG9ubHk8e1xuICBjaGlsZHJlbjogUmVhY3QuUmVhY3ROb2RlO1xufT4pIHtcbiAgcmV0dXJuIChcbiAgICA8aHRtbCBsYW5nPVwiZW5cIiBjbGFzc05hbWU9e2Ake2pha2FydGEudmFyaWFibGV9ICR7aW50ZXIudmFyaWFibGV9YH0+XG4gICAgICA8Ym9keSBjbGFzc05hbWU9XCJhbnRpYWxpYXNlZFwiPlxuICAgICAgICA8QXV0aFByb3ZpZGVyPlxuICAgICAgICAgIHtjaGlsZHJlbn1cbiAgICAgICAgICA8VG9hc3RlciBwb3NpdGlvbj1cInRvcC1yaWdodFwiIC8+XG4gICAgICAgIDwvQXV0aFByb3ZpZGVyPlxuICAgICAgPC9ib2R5PlxuICAgIDwvaHRtbD5cbiAgKTtcbn1cbiJdfQ==