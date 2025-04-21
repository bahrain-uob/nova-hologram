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
exports.Slider = Slider;
const React = __importStar(require("react"));
const SliderPrimitive = __importStar(require("@radix-ui/react-slider"));
const utils_1 = require("../../lib/utils");
function Slider({ className, defaultValue, value, min = 0, max = 100, ...props }) {
    const _values = React.useMemo(() => Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
            ? defaultValue
            : [min, max], [value, defaultValue, min, max]);
    return (React.createElement(SliderPrimitive.Root, { "data-slot": "slider", defaultValue: defaultValue, value: value, min: min, max: max, className: (0, utils_1.cn)("relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col", className), ...props },
        React.createElement(SliderPrimitive.Track, { "data-slot": "slider-track", className: (0, utils_1.cn)("bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5") },
            React.createElement(SliderPrimitive.Range, { "data-slot": "slider-range", className: (0, utils_1.cn)("bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full") })),
        Array.from({ length: _values.length }, (_, index) => (React.createElement(SliderPrimitive.Thumb, { "data-slot": "slider-thumb", key: index, className: "border-primary bg-background ring-ring/50 block size-4 shrink-0 rounded-full border shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50" })))));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2xpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic2xpZGVyLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTREUyx3QkFBTTtBQTVEZiw2Q0FBOEI7QUFDOUIsd0VBQXlEO0FBRXpELHVDQUFnQztBQUVoQyxTQUFTLE1BQU0sQ0FBQyxFQUNkLFNBQVMsRUFDVCxZQUFZLEVBQ1osS0FBSyxFQUNMLEdBQUcsR0FBRyxDQUFDLEVBQ1AsR0FBRyxHQUFHLEdBQUcsRUFDVCxHQUFHLEtBQUssRUFDMEM7SUFDbEQsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FDM0IsR0FBRyxFQUFFLENBQ0gsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7UUFDbEIsQ0FBQyxDQUFDLEtBQUs7UUFDUCxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUM7WUFDM0IsQ0FBQyxDQUFDLFlBQVk7WUFDZCxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQ2xCLENBQUMsS0FBSyxFQUFFLFlBQVksRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQ2hDLENBQUE7SUFFRCxPQUFPLENBQ0wsb0JBQUMsZUFBZSxDQUFDLElBQUksaUJBQ1QsUUFBUSxFQUNsQixZQUFZLEVBQUUsWUFBWSxFQUMxQixLQUFLLEVBQUUsS0FBSyxFQUNaLEdBQUcsRUFBRSxHQUFHLEVBQ1IsR0FBRyxFQUFFLEdBQUcsRUFDUixTQUFTLEVBQUUsSUFBQSxVQUFFLEVBQ1gscU9BQXFPLEVBQ3JPLFNBQVMsQ0FDVixLQUNHLEtBQUs7UUFFVCxvQkFBQyxlQUFlLENBQUMsS0FBSyxpQkFDVixjQUFjLEVBQ3hCLFNBQVMsRUFBRSxJQUFBLFVBQUUsRUFDWCxtTUFBbU0sQ0FDcE07WUFFRCxvQkFBQyxlQUFlLENBQUMsS0FBSyxpQkFDVixjQUFjLEVBQ3hCLFNBQVMsRUFBRSxJQUFBLFVBQUUsRUFDWCw2RkFBNkYsQ0FDOUYsR0FDRCxDQUNvQjtRQUN2QixLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQ3BELG9CQUFDLGVBQWUsQ0FBQyxLQUFLLGlCQUNWLGNBQWMsRUFDeEIsR0FBRyxFQUFFLEtBQUssRUFDVixTQUFTLEVBQUMsNk9BQTZPLEdBQ3ZQLENBQ0gsQ0FBQyxDQUNtQixDQUN4QixDQUFBO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFJlYWN0IGZyb20gXCJyZWFjdFwiXG5pbXBvcnQgKiBhcyBTbGlkZXJQcmltaXRpdmUgZnJvbSBcIkByYWRpeC11aS9yZWFjdC1zbGlkZXJcIlxuXG5pbXBvcnQgeyBjbiB9IGZyb20gXCJAL2xpYi91dGlsc1wiXG5cbmZ1bmN0aW9uIFNsaWRlcih7XG4gIGNsYXNzTmFtZSxcbiAgZGVmYXVsdFZhbHVlLFxuICB2YWx1ZSxcbiAgbWluID0gMCxcbiAgbWF4ID0gMTAwLFxuICAuLi5wcm9wc1xufTogUmVhY3QuQ29tcG9uZW50UHJvcHM8dHlwZW9mIFNsaWRlclByaW1pdGl2ZS5Sb290Pikge1xuICBjb25zdCBfdmFsdWVzID0gUmVhY3QudXNlTWVtbyhcbiAgICAoKSA9PlxuICAgICAgQXJyYXkuaXNBcnJheSh2YWx1ZSlcbiAgICAgICAgPyB2YWx1ZVxuICAgICAgICA6IEFycmF5LmlzQXJyYXkoZGVmYXVsdFZhbHVlKVxuICAgICAgICAgID8gZGVmYXVsdFZhbHVlXG4gICAgICAgICAgOiBbbWluLCBtYXhdLFxuICAgIFt2YWx1ZSwgZGVmYXVsdFZhbHVlLCBtaW4sIG1heF1cbiAgKVxuXG4gIHJldHVybiAoXG4gICAgPFNsaWRlclByaW1pdGl2ZS5Sb290XG4gICAgICBkYXRhLXNsb3Q9XCJzbGlkZXJcIlxuICAgICAgZGVmYXVsdFZhbHVlPXtkZWZhdWx0VmFsdWV9XG4gICAgICB2YWx1ZT17dmFsdWV9XG4gICAgICBtaW49e21pbn1cbiAgICAgIG1heD17bWF4fVxuICAgICAgY2xhc3NOYW1lPXtjbihcbiAgICAgICAgXCJyZWxhdGl2ZSBmbGV4IHctZnVsbCB0b3VjaC1ub25lIGl0ZW1zLWNlbnRlciBzZWxlY3Qtbm9uZSBkYXRhLVtkaXNhYmxlZF06b3BhY2l0eS01MCBkYXRhLVtvcmllbnRhdGlvbj12ZXJ0aWNhbF06aC1mdWxsIGRhdGEtW29yaWVudGF0aW9uPXZlcnRpY2FsXTptaW4taC00NCBkYXRhLVtvcmllbnRhdGlvbj12ZXJ0aWNhbF06dy1hdXRvIGRhdGEtW29yaWVudGF0aW9uPXZlcnRpY2FsXTpmbGV4LWNvbFwiLFxuICAgICAgICBjbGFzc05hbWVcbiAgICAgICl9XG4gICAgICB7Li4ucHJvcHN9XG4gICAgPlxuICAgICAgPFNsaWRlclByaW1pdGl2ZS5UcmFja1xuICAgICAgICBkYXRhLXNsb3Q9XCJzbGlkZXItdHJhY2tcIlxuICAgICAgICBjbGFzc05hbWU9e2NuKFxuICAgICAgICAgIFwiYmctbXV0ZWQgcmVsYXRpdmUgZ3JvdyBvdmVyZmxvdy1oaWRkZW4gcm91bmRlZC1mdWxsIGRhdGEtW29yaWVudGF0aW9uPWhvcml6b250YWxdOmgtMS41IGRhdGEtW29yaWVudGF0aW9uPWhvcml6b250YWxdOnctZnVsbCBkYXRhLVtvcmllbnRhdGlvbj12ZXJ0aWNhbF06aC1mdWxsIGRhdGEtW29yaWVudGF0aW9uPXZlcnRpY2FsXTp3LTEuNVwiXG4gICAgICAgICl9XG4gICAgICA+XG4gICAgICAgIDxTbGlkZXJQcmltaXRpdmUuUmFuZ2VcbiAgICAgICAgICBkYXRhLXNsb3Q9XCJzbGlkZXItcmFuZ2VcIlxuICAgICAgICAgIGNsYXNzTmFtZT17Y24oXG4gICAgICAgICAgICBcImJnLXByaW1hcnkgYWJzb2x1dGUgZGF0YS1bb3JpZW50YXRpb249aG9yaXpvbnRhbF06aC1mdWxsIGRhdGEtW29yaWVudGF0aW9uPXZlcnRpY2FsXTp3LWZ1bGxcIlxuICAgICAgICAgICl9XG4gICAgICAgIC8+XG4gICAgICA8L1NsaWRlclByaW1pdGl2ZS5UcmFjaz5cbiAgICAgIHtBcnJheS5mcm9tKHsgbGVuZ3RoOiBfdmFsdWVzLmxlbmd0aCB9LCAoXywgaW5kZXgpID0+IChcbiAgICAgICAgPFNsaWRlclByaW1pdGl2ZS5UaHVtYlxuICAgICAgICAgIGRhdGEtc2xvdD1cInNsaWRlci10aHVtYlwiXG4gICAgICAgICAga2V5PXtpbmRleH1cbiAgICAgICAgICBjbGFzc05hbWU9XCJib3JkZXItcHJpbWFyeSBiZy1iYWNrZ3JvdW5kIHJpbmctcmluZy81MCBibG9jayBzaXplLTQgc2hyaW5rLTAgcm91bmRlZC1mdWxsIGJvcmRlciBzaGFkb3ctc20gdHJhbnNpdGlvbi1bY29sb3IsYm94LXNoYWRvd10gaG92ZXI6cmluZy00IGZvY3VzLXZpc2libGU6cmluZy00IGZvY3VzLXZpc2libGU6b3V0bGluZS1oaWRkZW4gZGlzYWJsZWQ6cG9pbnRlci1ldmVudHMtbm9uZSBkaXNhYmxlZDpvcGFjaXR5LTUwXCJcbiAgICAgICAgLz5cbiAgICAgICkpfVxuICAgIDwvU2xpZGVyUHJpbWl0aXZlLlJvb3Q+XG4gIClcbn1cblxuZXhwb3J0IHsgU2xpZGVyIH1cbiJdfQ==