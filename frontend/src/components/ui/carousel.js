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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Carousel = Carousel;
exports.CarouselContent = CarouselContent;
exports.CarouselItem = CarouselItem;
exports.CarouselPrevious = CarouselPrevious;
exports.CarouselNext = CarouselNext;
const React = __importStar(require("react"));
const embla_carousel_react_1 = __importDefault(require("embla-carousel-react"));
const lucide_react_1 = require("lucide-react");
const utils_1 = require("../../lib/utils");
const button_1 = require("@/components/ui/button");
const CarouselContext = React.createContext(null);
function useCarousel() {
    const context = React.useContext(CarouselContext);
    if (!context) {
        throw new Error("useCarousel must be used within a <Carousel />");
    }
    return context;
}
function Carousel({ orientation = "horizontal", opts, setApi, plugins, className, children, ...props }) {
    const [carouselRef, api] = (0, embla_carousel_react_1.default)({
        ...opts,
        axis: orientation === "horizontal" ? "x" : "y",
    }, plugins);
    const [canScrollPrev, setCanScrollPrev] = React.useState(false);
    const [canScrollNext, setCanScrollNext] = React.useState(false);
    const onSelect = React.useCallback((api) => {
        if (!api)
            return;
        setCanScrollPrev(api.canScrollPrev());
        setCanScrollNext(api.canScrollNext());
    }, []);
    const scrollPrev = React.useCallback(() => {
        api?.scrollPrev();
    }, [api]);
    const scrollNext = React.useCallback(() => {
        api?.scrollNext();
    }, [api]);
    const handleKeyDown = React.useCallback((event) => {
        if (event.key === "ArrowLeft") {
            event.preventDefault();
            scrollPrev();
        }
        else if (event.key === "ArrowRight") {
            event.preventDefault();
            scrollNext();
        }
    }, [scrollPrev, scrollNext]);
    React.useEffect(() => {
        if (!api || !setApi)
            return;
        setApi(api);
    }, [api, setApi]);
    React.useEffect(() => {
        if (!api)
            return;
        onSelect(api);
        api.on("reInit", onSelect);
        api.on("select", onSelect);
        return () => {
            api?.off("select", onSelect);
        };
    }, [api, onSelect]);
    return (React.createElement(CarouselContext.Provider, { value: {
            carouselRef,
            api: api,
            opts,
            orientation: orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
            scrollPrev,
            scrollNext,
            canScrollPrev,
            canScrollNext,
        } },
        React.createElement("div", { onKeyDownCapture: handleKeyDown, className: (0, utils_1.cn)("relative", className), role: "region", "aria-roledescription": "carousel", "data-slot": "carousel", ...props }, children)));
}
function CarouselContent({ className, ...props }) {
    const { carouselRef, orientation } = useCarousel();
    return (React.createElement("div", { ref: carouselRef, className: "overflow-hidden", "data-slot": "carousel-content" },
        React.createElement("div", { className: (0, utils_1.cn)("flex", orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col", className), ...props })));
}
function CarouselItem({ className, ...props }) {
    const { orientation } = useCarousel();
    return (React.createElement("div", { role: "group", "aria-roledescription": "slide", "data-slot": "carousel-item", className: (0, utils_1.cn)("min-w-0 shrink-0 grow-0 basis-full", orientation === "horizontal" ? "pl-4" : "pt-4", className), ...props }));
}
function CarouselPrevious({ className, variant = "outline", size = "icon", ...props }) {
    const { orientation, scrollPrev, canScrollPrev } = useCarousel();
    return (React.createElement(button_1.Button, { "data-slot": "carousel-previous", variant: variant, size: size, className: (0, utils_1.cn)("absolute size-8 rounded-full", orientation === "horizontal"
            ? "top-1/2 -left-12 -translate-y-1/2"
            : "-top-12 left-1/2 -translate-x-1/2 rotate-90", className), disabled: !canScrollPrev, onClick: scrollPrev, ...props },
        React.createElement(lucide_react_1.ArrowLeft, null),
        React.createElement("span", { className: "sr-only" }, "Previous slide")));
}
function CarouselNext({ className, variant = "outline", size = "icon", ...props }) {
    const { orientation, scrollNext, canScrollNext } = useCarousel();
    return (React.createElement(button_1.Button, { "data-slot": "carousel-next", variant: variant, size: size, className: (0, utils_1.cn)("absolute size-8 rounded-full", orientation === "horizontal"
            ? "top-1/2 -right-12 -translate-y-1/2"
            : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90", className), disabled: !canScrollNext, onClick: scrollNext, ...props },
        React.createElement(lucide_react_1.ArrowRight, null),
        React.createElement("span", { className: "sr-only" }, "Next slide")));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2Fyb3VzZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjYXJvdXNlbC50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF5T0UsNEJBQVE7QUFDUiwwQ0FBZTtBQUNmLG9DQUFZO0FBQ1osNENBQWdCO0FBQ2hCLG9DQUFZO0FBN09kLDZDQUE4QjtBQUM5QixnRkFFNkI7QUFDN0IsK0NBQW9EO0FBRXBELHVDQUFnQztBQUNoQyxtREFBK0M7QUF1Qi9DLE1BQU0sZUFBZSxHQUFHLEtBQUssQ0FBQyxhQUFhLENBQThCLElBQUksQ0FBQyxDQUFBO0FBRTlFLFNBQVMsV0FBVztJQUNsQixNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxDQUFBO0lBRWpELElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNiLE1BQU0sSUFBSSxLQUFLLENBQUMsZ0RBQWdELENBQUMsQ0FBQTtJQUNuRSxDQUFDO0lBRUQsT0FBTyxPQUFPLENBQUE7QUFDaEIsQ0FBQztBQUVELFNBQVMsUUFBUSxDQUFDLEVBQ2hCLFdBQVcsR0FBRyxZQUFZLEVBQzFCLElBQUksRUFDSixNQUFNLEVBQ04sT0FBTyxFQUNQLFNBQVMsRUFDVCxRQUFRLEVBQ1IsR0FBRyxLQUFLLEVBQ29DO0lBQzVDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLEdBQUcsSUFBQSw4QkFBZ0IsRUFDekM7UUFDRSxHQUFHLElBQUk7UUFDUCxJQUFJLEVBQUUsV0FBVyxLQUFLLFlBQVksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHO0tBQy9DLEVBQ0QsT0FBTyxDQUNSLENBQUE7SUFDRCxNQUFNLENBQUMsYUFBYSxFQUFFLGdCQUFnQixDQUFDLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUMvRCxNQUFNLENBQUMsYUFBYSxFQUFFLGdCQUFnQixDQUFDLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUUvRCxNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsR0FBZ0IsRUFBRSxFQUFFO1FBQ3RELElBQUksQ0FBQyxHQUFHO1lBQUUsT0FBTTtRQUNoQixnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQTtRQUNyQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQTtJQUN2QyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUE7SUFFTixNQUFNLFVBQVUsR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRTtRQUN4QyxHQUFHLEVBQUUsVUFBVSxFQUFFLENBQUE7SUFDbkIsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUVULE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFO1FBQ3hDLEdBQUcsRUFBRSxVQUFVLEVBQUUsQ0FBQTtJQUNuQixDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO0lBRVQsTUFBTSxhQUFhLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FDckMsQ0FBQyxLQUEwQyxFQUFFLEVBQUU7UUFDN0MsSUFBSSxLQUFLLENBQUMsR0FBRyxLQUFLLFdBQVcsRUFBRSxDQUFDO1lBQzlCLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQTtZQUN0QixVQUFVLEVBQUUsQ0FBQTtRQUNkLENBQUM7YUFBTSxJQUFJLEtBQUssQ0FBQyxHQUFHLEtBQUssWUFBWSxFQUFFLENBQUM7WUFDdEMsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFBO1lBQ3RCLFVBQVUsRUFBRSxDQUFBO1FBQ2QsQ0FBQztJQUNILENBQUMsRUFDRCxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FDekIsQ0FBQTtJQUVELEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFO1FBQ25CLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNO1lBQUUsT0FBTTtRQUMzQixNQUFNLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDYixDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQTtJQUVqQixLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRTtRQUNuQixJQUFJLENBQUMsR0FBRztZQUFFLE9BQU07UUFDaEIsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUE7UUFDMUIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUE7UUFFMUIsT0FBTyxHQUFHLEVBQUU7WUFDVixHQUFHLEVBQUUsR0FBRyxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQTtRQUM5QixDQUFDLENBQUE7SUFDSCxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQTtJQUVuQixPQUFPLENBQ0wsb0JBQUMsZUFBZSxDQUFDLFFBQVEsSUFDdkIsS0FBSyxFQUFFO1lBQ0wsV0FBVztZQUNYLEdBQUcsRUFBRSxHQUFHO1lBQ1IsSUFBSTtZQUNKLFdBQVcsRUFDVCxXQUFXLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUM7WUFDakUsVUFBVTtZQUNWLFVBQVU7WUFDVixhQUFhO1lBQ2IsYUFBYTtTQUNkO1FBRUQsNkJBQ0UsZ0JBQWdCLEVBQUUsYUFBYSxFQUMvQixTQUFTLEVBQUUsSUFBQSxVQUFFLEVBQUMsVUFBVSxFQUFFLFNBQVMsQ0FBQyxFQUNwQyxJQUFJLEVBQUMsUUFBUSwwQkFDUSxVQUFVLGVBQ3JCLFVBQVUsS0FDaEIsS0FBSyxJQUVSLFFBQVEsQ0FDTCxDQUNtQixDQUM1QixDQUFBO0FBQ0gsQ0FBQztBQUVELFNBQVMsZUFBZSxDQUFDLEVBQUUsU0FBUyxFQUFFLEdBQUcsS0FBSyxFQUErQjtJQUMzRSxNQUFNLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxHQUFHLFdBQVcsRUFBRSxDQUFBO0lBRWxELE9BQU8sQ0FDTCw2QkFDRSxHQUFHLEVBQUUsV0FBVyxFQUNoQixTQUFTLEVBQUMsaUJBQWlCLGVBQ2pCLGtCQUFrQjtRQUU1Qiw2QkFDRSxTQUFTLEVBQUUsSUFBQSxVQUFFLEVBQ1gsTUFBTSxFQUNOLFdBQVcsS0FBSyxZQUFZLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLEVBQ3pELFNBQVMsQ0FDVixLQUNHLEtBQUssR0FDVCxDQUNFLENBQ1AsQ0FBQTtBQUNILENBQUM7QUFFRCxTQUFTLFlBQVksQ0FBQyxFQUFFLFNBQVMsRUFBRSxHQUFHLEtBQUssRUFBK0I7SUFDeEUsTUFBTSxFQUFFLFdBQVcsRUFBRSxHQUFHLFdBQVcsRUFBRSxDQUFBO0lBRXJDLE9BQU8sQ0FDTCw2QkFDRSxJQUFJLEVBQUMsT0FBTywwQkFDUyxPQUFPLGVBQ2xCLGVBQWUsRUFDekIsU0FBUyxFQUFFLElBQUEsVUFBRSxFQUNYLG9DQUFvQyxFQUNwQyxXQUFXLEtBQUssWUFBWSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFDOUMsU0FBUyxDQUNWLEtBQ0csS0FBSyxHQUNULENBQ0gsQ0FBQTtBQUNILENBQUM7QUFFRCxTQUFTLGdCQUFnQixDQUFDLEVBQ3hCLFNBQVMsRUFDVCxPQUFPLEdBQUcsU0FBUyxFQUNuQixJQUFJLEdBQUcsTUFBTSxFQUNiLEdBQUcsS0FBSyxFQUM0QjtJQUNwQyxNQUFNLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsR0FBRyxXQUFXLEVBQUUsQ0FBQTtJQUVoRSxPQUFPLENBQ0wsb0JBQUMsZUFBTSxpQkFDSyxtQkFBbUIsRUFDN0IsT0FBTyxFQUFFLE9BQU8sRUFDaEIsSUFBSSxFQUFFLElBQUksRUFDVixTQUFTLEVBQUUsSUFBQSxVQUFFLEVBQ1gsOEJBQThCLEVBQzlCLFdBQVcsS0FBSyxZQUFZO1lBQzFCLENBQUMsQ0FBQyxtQ0FBbUM7WUFDckMsQ0FBQyxDQUFDLDZDQUE2QyxFQUNqRCxTQUFTLENBQ1YsRUFDRCxRQUFRLEVBQUUsQ0FBQyxhQUFhLEVBQ3hCLE9BQU8sRUFBRSxVQUFVLEtBQ2YsS0FBSztRQUVULG9CQUFDLHdCQUFTLE9BQUc7UUFDYiw4QkFBTSxTQUFTLEVBQUMsU0FBUyxxQkFBc0IsQ0FDeEMsQ0FDVixDQUFBO0FBQ0gsQ0FBQztBQUVELFNBQVMsWUFBWSxDQUFDLEVBQ3BCLFNBQVMsRUFDVCxPQUFPLEdBQUcsU0FBUyxFQUNuQixJQUFJLEdBQUcsTUFBTSxFQUNiLEdBQUcsS0FBSyxFQUM0QjtJQUNwQyxNQUFNLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsR0FBRyxXQUFXLEVBQUUsQ0FBQTtJQUVoRSxPQUFPLENBQ0wsb0JBQUMsZUFBTSxpQkFDSyxlQUFlLEVBQ3pCLE9BQU8sRUFBRSxPQUFPLEVBQ2hCLElBQUksRUFBRSxJQUFJLEVBQ1YsU0FBUyxFQUFFLElBQUEsVUFBRSxFQUNYLDhCQUE4QixFQUM5QixXQUFXLEtBQUssWUFBWTtZQUMxQixDQUFDLENBQUMsb0NBQW9DO1lBQ3RDLENBQUMsQ0FBQyxnREFBZ0QsRUFDcEQsU0FBUyxDQUNWLEVBQ0QsUUFBUSxFQUFFLENBQUMsYUFBYSxFQUN4QixPQUFPLEVBQUUsVUFBVSxLQUNmLEtBQUs7UUFFVCxvQkFBQyx5QkFBVSxPQUFHO1FBQ2QsOEJBQU0sU0FBUyxFQUFDLFNBQVMsaUJBQWtCLENBQ3BDLENBQ1YsQ0FBQTtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tIFwicmVhY3RcIlxuaW1wb3J0IHVzZUVtYmxhQ2Fyb3VzZWwsIHtcbiAgdHlwZSBVc2VFbWJsYUNhcm91c2VsVHlwZSxcbn0gZnJvbSBcImVtYmxhLWNhcm91c2VsLXJlYWN0XCJcbmltcG9ydCB7IEFycm93TGVmdCwgQXJyb3dSaWdodCB9IGZyb20gXCJsdWNpZGUtcmVhY3RcIlxuXG5pbXBvcnQgeyBjbiB9IGZyb20gXCJAL2xpYi91dGlsc1wiXG5pbXBvcnQgeyBCdXR0b24gfSBmcm9tIFwiQC9jb21wb25lbnRzL3VpL2J1dHRvblwiXG5cbnR5cGUgQ2Fyb3VzZWxBcGkgPSBVc2VFbWJsYUNhcm91c2VsVHlwZVsxXVxudHlwZSBVc2VDYXJvdXNlbFBhcmFtZXRlcnMgPSBQYXJhbWV0ZXJzPHR5cGVvZiB1c2VFbWJsYUNhcm91c2VsPlxudHlwZSBDYXJvdXNlbE9wdGlvbnMgPSBVc2VDYXJvdXNlbFBhcmFtZXRlcnNbMF1cbnR5cGUgQ2Fyb3VzZWxQbHVnaW4gPSBVc2VDYXJvdXNlbFBhcmFtZXRlcnNbMV1cblxudHlwZSBDYXJvdXNlbFByb3BzID0ge1xuICBvcHRzPzogQ2Fyb3VzZWxPcHRpb25zXG4gIHBsdWdpbnM/OiBDYXJvdXNlbFBsdWdpblxuICBvcmllbnRhdGlvbj86IFwiaG9yaXpvbnRhbFwiIHwgXCJ2ZXJ0aWNhbFwiXG4gIHNldEFwaT86IChhcGk6IENhcm91c2VsQXBpKSA9PiB2b2lkXG59XG5cbnR5cGUgQ2Fyb3VzZWxDb250ZXh0UHJvcHMgPSB7XG4gIGNhcm91c2VsUmVmOiBSZXR1cm5UeXBlPHR5cGVvZiB1c2VFbWJsYUNhcm91c2VsPlswXVxuICBhcGk6IFJldHVyblR5cGU8dHlwZW9mIHVzZUVtYmxhQ2Fyb3VzZWw+WzFdXG4gIHNjcm9sbFByZXY6ICgpID0+IHZvaWRcbiAgc2Nyb2xsTmV4dDogKCkgPT4gdm9pZFxuICBjYW5TY3JvbGxQcmV2OiBib29sZWFuXG4gIGNhblNjcm9sbE5leHQ6IGJvb2xlYW5cbn0gJiBDYXJvdXNlbFByb3BzXG5cbmNvbnN0IENhcm91c2VsQ29udGV4dCA9IFJlYWN0LmNyZWF0ZUNvbnRleHQ8Q2Fyb3VzZWxDb250ZXh0UHJvcHMgfCBudWxsPihudWxsKVxuXG5mdW5jdGlvbiB1c2VDYXJvdXNlbCgpIHtcbiAgY29uc3QgY29udGV4dCA9IFJlYWN0LnVzZUNvbnRleHQoQ2Fyb3VzZWxDb250ZXh0KVxuXG4gIGlmICghY29udGV4dCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcInVzZUNhcm91c2VsIG11c3QgYmUgdXNlZCB3aXRoaW4gYSA8Q2Fyb3VzZWwgLz5cIilcbiAgfVxuXG4gIHJldHVybiBjb250ZXh0XG59XG5cbmZ1bmN0aW9uIENhcm91c2VsKHtcbiAgb3JpZW50YXRpb24gPSBcImhvcml6b250YWxcIixcbiAgb3B0cyxcbiAgc2V0QXBpLFxuICBwbHVnaW5zLFxuICBjbGFzc05hbWUsXG4gIGNoaWxkcmVuLFxuICAuLi5wcm9wc1xufTogUmVhY3QuQ29tcG9uZW50UHJvcHM8XCJkaXZcIj4gJiBDYXJvdXNlbFByb3BzKSB7XG4gIGNvbnN0IFtjYXJvdXNlbFJlZiwgYXBpXSA9IHVzZUVtYmxhQ2Fyb3VzZWwoXG4gICAge1xuICAgICAgLi4ub3B0cyxcbiAgICAgIGF4aXM6IG9yaWVudGF0aW9uID09PSBcImhvcml6b250YWxcIiA/IFwieFwiIDogXCJ5XCIsXG4gICAgfSxcbiAgICBwbHVnaW5zXG4gIClcbiAgY29uc3QgW2NhblNjcm9sbFByZXYsIHNldENhblNjcm9sbFByZXZdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtjYW5TY3JvbGxOZXh0LCBzZXRDYW5TY3JvbGxOZXh0XSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuXG4gIGNvbnN0IG9uU2VsZWN0ID0gUmVhY3QudXNlQ2FsbGJhY2soKGFwaTogQ2Fyb3VzZWxBcGkpID0+IHtcbiAgICBpZiAoIWFwaSkgcmV0dXJuXG4gICAgc2V0Q2FuU2Nyb2xsUHJldihhcGkuY2FuU2Nyb2xsUHJldigpKVxuICAgIHNldENhblNjcm9sbE5leHQoYXBpLmNhblNjcm9sbE5leHQoKSlcbiAgfSwgW10pXG5cbiAgY29uc3Qgc2Nyb2xsUHJldiA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBhcGk/LnNjcm9sbFByZXYoKVxuICB9LCBbYXBpXSlcblxuICBjb25zdCBzY3JvbGxOZXh0ID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIGFwaT8uc2Nyb2xsTmV4dCgpXG4gIH0sIFthcGldKVxuXG4gIGNvbnN0IGhhbmRsZUtleURvd24gPSBSZWFjdC51c2VDYWxsYmFjayhcbiAgICAoZXZlbnQ6IFJlYWN0LktleWJvYXJkRXZlbnQ8SFRNTERpdkVsZW1lbnQ+KSA9PiB7XG4gICAgICBpZiAoZXZlbnQua2V5ID09PSBcIkFycm93TGVmdFwiKSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgc2Nyb2xsUHJldigpXG4gICAgICB9IGVsc2UgaWYgKGV2ZW50LmtleSA9PT0gXCJBcnJvd1JpZ2h0XCIpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgICBzY3JvbGxOZXh0KClcbiAgICAgIH1cbiAgICB9LFxuICAgIFtzY3JvbGxQcmV2LCBzY3JvbGxOZXh0XVxuICApXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIWFwaSB8fCAhc2V0QXBpKSByZXR1cm5cbiAgICBzZXRBcGkoYXBpKVxuICB9LCBbYXBpLCBzZXRBcGldKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFhcGkpIHJldHVyblxuICAgIG9uU2VsZWN0KGFwaSlcbiAgICBhcGkub24oXCJyZUluaXRcIiwgb25TZWxlY3QpXG4gICAgYXBpLm9uKFwic2VsZWN0XCIsIG9uU2VsZWN0KVxuXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGFwaT8ub2ZmKFwic2VsZWN0XCIsIG9uU2VsZWN0KVxuICAgIH1cbiAgfSwgW2FwaSwgb25TZWxlY3RdKVxuXG4gIHJldHVybiAoXG4gICAgPENhcm91c2VsQ29udGV4dC5Qcm92aWRlclxuICAgICAgdmFsdWU9e3tcbiAgICAgICAgY2Fyb3VzZWxSZWYsXG4gICAgICAgIGFwaTogYXBpLFxuICAgICAgICBvcHRzLFxuICAgICAgICBvcmllbnRhdGlvbjpcbiAgICAgICAgICBvcmllbnRhdGlvbiB8fCAob3B0cz8uYXhpcyA9PT0gXCJ5XCIgPyBcInZlcnRpY2FsXCIgOiBcImhvcml6b250YWxcIiksXG4gICAgICAgIHNjcm9sbFByZXYsXG4gICAgICAgIHNjcm9sbE5leHQsXG4gICAgICAgIGNhblNjcm9sbFByZXYsXG4gICAgICAgIGNhblNjcm9sbE5leHQsXG4gICAgICB9fVxuICAgID5cbiAgICAgIDxkaXZcbiAgICAgICAgb25LZXlEb3duQ2FwdHVyZT17aGFuZGxlS2V5RG93bn1cbiAgICAgICAgY2xhc3NOYW1lPXtjbihcInJlbGF0aXZlXCIsIGNsYXNzTmFtZSl9XG4gICAgICAgIHJvbGU9XCJyZWdpb25cIlxuICAgICAgICBhcmlhLXJvbGVkZXNjcmlwdGlvbj1cImNhcm91c2VsXCJcbiAgICAgICAgZGF0YS1zbG90PVwiY2Fyb3VzZWxcIlxuICAgICAgICB7Li4ucHJvcHN9XG4gICAgICA+XG4gICAgICAgIHtjaGlsZHJlbn1cbiAgICAgIDwvZGl2PlxuICAgIDwvQ2Fyb3VzZWxDb250ZXh0LlByb3ZpZGVyPlxuICApXG59XG5cbmZ1bmN0aW9uIENhcm91c2VsQ29udGVudCh7IGNsYXNzTmFtZSwgLi4ucHJvcHMgfTogUmVhY3QuQ29tcG9uZW50UHJvcHM8XCJkaXZcIj4pIHtcbiAgY29uc3QgeyBjYXJvdXNlbFJlZiwgb3JpZW50YXRpb24gfSA9IHVzZUNhcm91c2VsKClcblxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIHJlZj17Y2Fyb3VzZWxSZWZ9XG4gICAgICBjbGFzc05hbWU9XCJvdmVyZmxvdy1oaWRkZW5cIlxuICAgICAgZGF0YS1zbG90PVwiY2Fyb3VzZWwtY29udGVudFwiXG4gICAgPlxuICAgICAgPGRpdlxuICAgICAgICBjbGFzc05hbWU9e2NuKFxuICAgICAgICAgIFwiZmxleFwiLFxuICAgICAgICAgIG9yaWVudGF0aW9uID09PSBcImhvcml6b250YWxcIiA/IFwiLW1sLTRcIiA6IFwiLW10LTQgZmxleC1jb2xcIixcbiAgICAgICAgICBjbGFzc05hbWVcbiAgICAgICAgKX1cbiAgICAgICAgey4uLnByb3BzfVxuICAgICAgLz5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5mdW5jdGlvbiBDYXJvdXNlbEl0ZW0oeyBjbGFzc05hbWUsIC4uLnByb3BzIH06IFJlYWN0LkNvbXBvbmVudFByb3BzPFwiZGl2XCI+KSB7XG4gIGNvbnN0IHsgb3JpZW50YXRpb24gfSA9IHVzZUNhcm91c2VsKClcblxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIHJvbGU9XCJncm91cFwiXG4gICAgICBhcmlhLXJvbGVkZXNjcmlwdGlvbj1cInNsaWRlXCJcbiAgICAgIGRhdGEtc2xvdD1cImNhcm91c2VsLWl0ZW1cIlxuICAgICAgY2xhc3NOYW1lPXtjbihcbiAgICAgICAgXCJtaW4tdy0wIHNocmluay0wIGdyb3ctMCBiYXNpcy1mdWxsXCIsXG4gICAgICAgIG9yaWVudGF0aW9uID09PSBcImhvcml6b250YWxcIiA/IFwicGwtNFwiIDogXCJwdC00XCIsXG4gICAgICAgIGNsYXNzTmFtZVxuICAgICAgKX1cbiAgICAgIHsuLi5wcm9wc31cbiAgICAvPlxuICApXG59XG5cbmZ1bmN0aW9uIENhcm91c2VsUHJldmlvdXMoe1xuICBjbGFzc05hbWUsXG4gIHZhcmlhbnQgPSBcIm91dGxpbmVcIixcbiAgc2l6ZSA9IFwiaWNvblwiLFxuICAuLi5wcm9wc1xufTogUmVhY3QuQ29tcG9uZW50UHJvcHM8dHlwZW9mIEJ1dHRvbj4pIHtcbiAgY29uc3QgeyBvcmllbnRhdGlvbiwgc2Nyb2xsUHJldiwgY2FuU2Nyb2xsUHJldiB9ID0gdXNlQ2Fyb3VzZWwoKVxuXG4gIHJldHVybiAoXG4gICAgPEJ1dHRvblxuICAgICAgZGF0YS1zbG90PVwiY2Fyb3VzZWwtcHJldmlvdXNcIlxuICAgICAgdmFyaWFudD17dmFyaWFudH1cbiAgICAgIHNpemU9e3NpemV9XG4gICAgICBjbGFzc05hbWU9e2NuKFxuICAgICAgICBcImFic29sdXRlIHNpemUtOCByb3VuZGVkLWZ1bGxcIixcbiAgICAgICAgb3JpZW50YXRpb24gPT09IFwiaG9yaXpvbnRhbFwiXG4gICAgICAgICAgPyBcInRvcC0xLzIgLWxlZnQtMTIgLXRyYW5zbGF0ZS15LTEvMlwiXG4gICAgICAgICAgOiBcIi10b3AtMTIgbGVmdC0xLzIgLXRyYW5zbGF0ZS14LTEvMiByb3RhdGUtOTBcIixcbiAgICAgICAgY2xhc3NOYW1lXG4gICAgICApfVxuICAgICAgZGlzYWJsZWQ9eyFjYW5TY3JvbGxQcmV2fVxuICAgICAgb25DbGljaz17c2Nyb2xsUHJldn1cbiAgICAgIHsuLi5wcm9wc31cbiAgICA+XG4gICAgICA8QXJyb3dMZWZ0IC8+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJzci1vbmx5XCI+UHJldmlvdXMgc2xpZGU8L3NwYW4+XG4gICAgPC9CdXR0b24+XG4gIClcbn1cblxuZnVuY3Rpb24gQ2Fyb3VzZWxOZXh0KHtcbiAgY2xhc3NOYW1lLFxuICB2YXJpYW50ID0gXCJvdXRsaW5lXCIsXG4gIHNpemUgPSBcImljb25cIixcbiAgLi4ucHJvcHNcbn06IFJlYWN0LkNvbXBvbmVudFByb3BzPHR5cGVvZiBCdXR0b24+KSB7XG4gIGNvbnN0IHsgb3JpZW50YXRpb24sIHNjcm9sbE5leHQsIGNhblNjcm9sbE5leHQgfSA9IHVzZUNhcm91c2VsKClcblxuICByZXR1cm4gKFxuICAgIDxCdXR0b25cbiAgICAgIGRhdGEtc2xvdD1cImNhcm91c2VsLW5leHRcIlxuICAgICAgdmFyaWFudD17dmFyaWFudH1cbiAgICAgIHNpemU9e3NpemV9XG4gICAgICBjbGFzc05hbWU9e2NuKFxuICAgICAgICBcImFic29sdXRlIHNpemUtOCByb3VuZGVkLWZ1bGxcIixcbiAgICAgICAgb3JpZW50YXRpb24gPT09IFwiaG9yaXpvbnRhbFwiXG4gICAgICAgICAgPyBcInRvcC0xLzIgLXJpZ2h0LTEyIC10cmFuc2xhdGUteS0xLzJcIlxuICAgICAgICAgIDogXCItYm90dG9tLTEyIGxlZnQtMS8yIC10cmFuc2xhdGUteC0xLzIgcm90YXRlLTkwXCIsXG4gICAgICAgIGNsYXNzTmFtZVxuICAgICAgKX1cbiAgICAgIGRpc2FibGVkPXshY2FuU2Nyb2xsTmV4dH1cbiAgICAgIG9uQ2xpY2s9e3Njcm9sbE5leHR9XG4gICAgICB7Li4ucHJvcHN9XG4gICAgPlxuICAgICAgPEFycm93UmlnaHQgLz5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInNyLW9ubHlcIj5OZXh0IHNsaWRlPC9zcGFuPlxuICAgIDwvQnV0dG9uPlxuICApXG59XG5cbmV4cG9ydCB7XG4gIHR5cGUgQ2Fyb3VzZWxBcGksXG4gIENhcm91c2VsLFxuICBDYXJvdXNlbENvbnRlbnQsXG4gIENhcm91c2VsSXRlbSxcbiAgQ2Fyb3VzZWxQcmV2aW91cyxcbiAgQ2Fyb3VzZWxOZXh0LFxufVxuIl19