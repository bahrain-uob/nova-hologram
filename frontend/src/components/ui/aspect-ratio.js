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
exports.AspectRatio = AspectRatio;
const AspectRatioPrimitive = __importStar(require("@radix-ui/react-aspect-ratio"));
function AspectRatio({ ...props }) {
    return React.createElement(AspectRatioPrimitive.Root, { "data-slot": "aspect-ratio", ...props });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNwZWN0LXJhdGlvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXNwZWN0LXJhdGlvLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQVFTLGtDQUFXO0FBUnBCLG1GQUFvRTtBQUVwRSxTQUFTLFdBQVcsQ0FBQyxFQUNuQixHQUFHLEtBQUssRUFDK0M7SUFDdkQsT0FBTyxvQkFBQyxvQkFBb0IsQ0FBQyxJQUFJLGlCQUFXLGNBQWMsS0FBSyxLQUFLLEdBQUksQ0FBQTtBQUMxRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgQXNwZWN0UmF0aW9QcmltaXRpdmUgZnJvbSBcIkByYWRpeC11aS9yZWFjdC1hc3BlY3QtcmF0aW9cIlxuXG5mdW5jdGlvbiBBc3BlY3RSYXRpbyh7XG4gIC4uLnByb3BzXG59OiBSZWFjdC5Db21wb25lbnRQcm9wczx0eXBlb2YgQXNwZWN0UmF0aW9QcmltaXRpdmUuUm9vdD4pIHtcbiAgcmV0dXJuIDxBc3BlY3RSYXRpb1ByaW1pdGl2ZS5Sb290IGRhdGEtc2xvdD1cImFzcGVjdC1yYXRpb1wiIHsuLi5wcm9wc30gLz5cbn1cblxuZXhwb3J0IHsgQXNwZWN0UmF0aW8gfVxuIl19