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
exports.Separator = Separator;
const React = __importStar(require("react"));
const SeparatorPrimitive = __importStar(require("@radix-ui/react-separator"));
const utils_1 = require("../../lib/utils");
function Separator({ className, orientation = "horizontal", decorative = true, ...props }) {
    return (React.createElement(SeparatorPrimitive.Root, { "data-slot": "separator-root", decorative: decorative, orientation: orientation, className: (0, utils_1.cn)("bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px", className), ...props }));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VwYXJhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic2VwYXJhdG9yLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXlCUyw4QkFBUztBQXpCbEIsNkNBQThCO0FBQzlCLDhFQUErRDtBQUUvRCx1Q0FBZ0M7QUFFaEMsU0FBUyxTQUFTLENBQUMsRUFDakIsU0FBUyxFQUNULFdBQVcsR0FBRyxZQUFZLEVBQzFCLFVBQVUsR0FBRyxJQUFJLEVBQ2pCLEdBQUcsS0FBSyxFQUM2QztJQUNyRCxPQUFPLENBQ0wsb0JBQUMsa0JBQWtCLENBQUMsSUFBSSxpQkFDWixnQkFBZ0IsRUFDMUIsVUFBVSxFQUFFLFVBQVUsRUFDdEIsV0FBVyxFQUFFLFdBQVcsRUFDeEIsU0FBUyxFQUFFLElBQUEsVUFBRSxFQUNYLGdLQUFnSyxFQUNoSyxTQUFTLENBQ1YsS0FDRyxLQUFLLEdBQ1QsQ0FDSCxDQUFBO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFJlYWN0IGZyb20gXCJyZWFjdFwiXG5pbXBvcnQgKiBhcyBTZXBhcmF0b3JQcmltaXRpdmUgZnJvbSBcIkByYWRpeC11aS9yZWFjdC1zZXBhcmF0b3JcIlxuXG5pbXBvcnQgeyBjbiB9IGZyb20gXCJAL2xpYi91dGlsc1wiXG5cbmZ1bmN0aW9uIFNlcGFyYXRvcih7XG4gIGNsYXNzTmFtZSxcbiAgb3JpZW50YXRpb24gPSBcImhvcml6b250YWxcIixcbiAgZGVjb3JhdGl2ZSA9IHRydWUsXG4gIC4uLnByb3BzXG59OiBSZWFjdC5Db21wb25lbnRQcm9wczx0eXBlb2YgU2VwYXJhdG9yUHJpbWl0aXZlLlJvb3Q+KSB7XG4gIHJldHVybiAoXG4gICAgPFNlcGFyYXRvclByaW1pdGl2ZS5Sb290XG4gICAgICBkYXRhLXNsb3Q9XCJzZXBhcmF0b3Itcm9vdFwiXG4gICAgICBkZWNvcmF0aXZlPXtkZWNvcmF0aXZlfVxuICAgICAgb3JpZW50YXRpb249e29yaWVudGF0aW9ufVxuICAgICAgY2xhc3NOYW1lPXtjbihcbiAgICAgICAgXCJiZy1ib3JkZXIgc2hyaW5rLTAgZGF0YS1bb3JpZW50YXRpb249aG9yaXpvbnRhbF06aC1weCBkYXRhLVtvcmllbnRhdGlvbj1ob3Jpem9udGFsXTp3LWZ1bGwgZGF0YS1bb3JpZW50YXRpb249dmVydGljYWxdOmgtZnVsbCBkYXRhLVtvcmllbnRhdGlvbj12ZXJ0aWNhbF06dy1weFwiLFxuICAgICAgICBjbGFzc05hbWVcbiAgICAgICl9XG4gICAgICB7Li4ucHJvcHN9XG4gICAgLz5cbiAgKVxufVxuXG5leHBvcnQgeyBTZXBhcmF0b3IgfVxuIl19