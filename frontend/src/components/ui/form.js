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
exports.FormField = exports.Form = exports.useFormField = void 0;
exports.FormItem = FormItem;
exports.FormLabel = FormLabel;
exports.FormControl = FormControl;
exports.FormDescription = FormDescription;
exports.FormMessage = FormMessage;
const React = __importStar(require("react"));
const react_slot_1 = require("@radix-ui/react-slot");
const react_hook_form_1 = require("react-hook-form");
const utils_1 = require("../../lib/utils");
const label_1 = require("@/components/ui/label");
const Form = react_hook_form_1.FormProvider;
exports.Form = Form;
const FormFieldContext = React.createContext({});
const FormField = ({ ...props }) => {
    return (React.createElement(FormFieldContext.Provider, { value: { name: props.name } },
        React.createElement(react_hook_form_1.Controller, { ...props })));
};
exports.FormField = FormField;
const useFormField = () => {
    const fieldContext = React.useContext(FormFieldContext);
    const itemContext = React.useContext(FormItemContext);
    const { getFieldState } = (0, react_hook_form_1.useFormContext)();
    const formState = (0, react_hook_form_1.useFormState)({ name: fieldContext.name });
    const fieldState = getFieldState(fieldContext.name, formState);
    if (!fieldContext) {
        throw new Error("useFormField should be used within <FormField>");
    }
    const { id } = itemContext;
    return {
        id,
        name: fieldContext.name,
        formItemId: `${id}-form-item`,
        formDescriptionId: `${id}-form-item-description`,
        formMessageId: `${id}-form-item-message`,
        ...fieldState,
    };
};
exports.useFormField = useFormField;
const FormItemContext = React.createContext({});
function FormItem({ className, ...props }) {
    const id = React.useId();
    return (React.createElement(FormItemContext.Provider, { value: { id } },
        React.createElement("div", { "data-slot": "form-item", className: (0, utils_1.cn)("grid gap-2", className), ...props })));
}
function FormLabel({ className, ...props }) {
    const { error, formItemId } = useFormField();
    return (React.createElement(label_1.Label, { "data-slot": "form-label", "data-error": !!error, className: (0, utils_1.cn)("data-[error=true]:text-destructive", className), htmlFor: formItemId, ...props }));
}
function FormControl({ ...props }) {
    const { error, formItemId, formDescriptionId, formMessageId } = useFormField();
    return (React.createElement(react_slot_1.Slot, { "data-slot": "form-control", id: formItemId, "aria-describedby": !error
            ? `${formDescriptionId}`
            : `${formDescriptionId} ${formMessageId}`, "aria-invalid": !!error, ...props }));
}
function FormDescription({ className, ...props }) {
    const { formDescriptionId } = useFormField();
    return (React.createElement("p", { "data-slot": "form-description", id: formDescriptionId, className: (0, utils_1.cn)("text-muted-foreground text-sm", className), ...props }));
}
function FormMessage({ className, ...props }) {
    const { error, formMessageId } = useFormField();
    const body = error ? String(error?.message ?? "") : props.children;
    if (!body) {
        return null;
    }
    return (React.createElement("p", { "data-slot": "form-message", id: formMessageId, className: (0, utils_1.cn)("text-destructive text-sm", className), ...props }, body));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImZvcm0udHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQThKRSw0QkFBUTtBQUNSLDhCQUFTO0FBQ1Qsa0NBQVc7QUFDWCwwQ0FBZTtBQUNmLGtDQUFXO0FBbEtiLDZDQUE4QjtBQUU5QixxREFBMkM7QUFDM0MscURBUXdCO0FBRXhCLHVDQUFnQztBQUNoQyxpREFBNkM7QUFFN0MsTUFBTSxJQUFJLEdBQUcsOEJBQVksQ0FBQTtBQTZJdkIsb0JBQUk7QUFwSU4sTUFBTSxnQkFBZ0IsR0FBRyxLQUFLLENBQUMsYUFBYSxDQUMxQyxFQUEyQixDQUM1QixDQUFBO0FBRUQsTUFBTSxTQUFTLEdBQUcsQ0FHaEIsRUFDQSxHQUFHLEtBQUssRUFDNkIsRUFBRSxFQUFFO0lBQ3pDLE9BQU8sQ0FDTCxvQkFBQyxnQkFBZ0IsQ0FBQyxRQUFRLElBQUMsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJLEVBQUU7UUFDcEQsb0JBQUMsNEJBQVUsT0FBSyxLQUFLLEdBQUksQ0FDQyxDQUM3QixDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBMkhDLDhCQUFTO0FBekhYLE1BQU0sWUFBWSxHQUFHLEdBQUcsRUFBRTtJQUN4QixNQUFNLFlBQVksR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLENBQUE7SUFDdkQsTUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQTtJQUNyRCxNQUFNLEVBQUUsYUFBYSxFQUFFLEdBQUcsSUFBQSxnQ0FBYyxHQUFFLENBQUE7SUFDMUMsTUFBTSxTQUFTLEdBQUcsSUFBQSw4QkFBWSxFQUFDLEVBQUUsSUFBSSxFQUFFLFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFBO0lBQzNELE1BQU0sVUFBVSxHQUFHLGFBQWEsQ0FBQyxZQUFZLENBQUMsSUFB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QTtJQUNiLENBQUM7SUFFRCxPQUFPLENBQ0wsd0NBQ1ksY0FBYyxFQUN4QixFQUFFLEVBQUUsYUFBYSxFQUNqQixTQUFTLEVBQUUsSUFBQSxVQUFFLEVBQUMsMEJBQTBCLEVBQUUsU0FBUyxDQUFDLEtBQ2hELEtBQUssSUFFUixJQUFJLENBQ0gsQ0FDTCxDQUFBO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFJlYWN0IGZyb20gXCJyZWFjdFwiXG5pbXBvcnQgKiBhcyBMYWJlbFByaW1pdGl2ZSBmcm9tIFwiQHJhZGl4LXVpL3JlYWN0LWxhYmVsXCJcbmltcG9ydCB7IFNsb3QgfSBmcm9tIFwiQHJhZGl4LXVpL3JlYWN0LXNsb3RcIlxuaW1wb3J0IHtcbiAgQ29udHJvbGxlcixcbiAgRm9ybVByb3ZpZGVyLFxuICB1c2VGb3JtQ29udGV4dCxcbiAgdXNlRm9ybVN0YXRlLFxuICB0eXBlIENvbnRyb2xsZXJQcm9wcyxcbiAgdHlwZSBGaWVsZFBhdGgsXG4gIHR5cGUgRmllbGRWYWx1ZXMsXG59IGZyb20gXCJyZWFjdC1ob29rLWZvcm1cIlxuXG5pbXBvcnQgeyBjbiB9IGZyb20gXCJAL2xpYi91dGlsc1wiXG5pbXBvcnQgeyBMYWJlbCB9IGZyb20gXCJAL2NvbXBvbmVudHMvdWkvbGFiZWxcIlxuXG5jb25zdCBGb3JtID0gRm9ybVByb3ZpZGVyXG5cbnR5cGUgRm9ybUZpZWxkQ29udGV4dFZhbHVlPFxuICBURmllbGRWYWx1ZXMgZXh0ZW5kcyBGaWVsZFZhbHVlcyA9IEZpZWxkVmFsdWVzLFxuICBUTmFtZSBleHRlbmRzIEZpZWxkUGF0aDxURmllbGRWYWx1ZXM+ID0gRmllbGRQYXRoPFRGaWVsZFZhbHVlcz4sXG4+ID0ge1xuICBuYW1lOiBUTmFtZVxufVxuXG5jb25zdCBGb3JtRmllbGRDb250ZXh0ID0gUmVhY3QuY3JlYXRlQ29udGV4dDxGb3JtRmllbGRDb250ZXh0VmFsdWU+KFxuICB7fSBhcyBGb3JtRmllbGRDb250ZXh0VmFsdWVcbilcblxuY29uc3QgRm9ybUZpZWxkID0gPFxuICBURmllbGRWYWx1ZXMgZXh0ZW5kcyBGaWVsZFZhbHVlcyA9IEZpZWxkVmFsdWVzLFxuICBUTmFtZSBleHRlbmRzIEZpZWxkUGF0aDxURmllbGRWYWx1ZXM+ID0gRmllbGRQYXRoPFRGaWVsZFZhbHVlcz4sXG4+KHtcbiAgLi4ucHJvcHNcbn06IENvbnRyb2xsZXJQcm9wczxURmllbGRWYWx1ZXMsIFROYW1lPikgPT4ge1xuICByZXR1cm4gKFxuICAgIDxGb3JtRmllbGRDb250ZXh0LlByb3ZpZGVyIHZhbHVlPXt7IG5hbWU6IHByb3BzLm5hbWUgfX0+XG4gICAgICA8Q29udHJvbGxlciB7Li4ucHJvcHN9IC8+XG4gICAgPC9Gb3JtRmllbGRDb250ZXh0LlByb3ZpZGVyPlxuICApXG59XG5cbmNvbnN0IHVzZUZvcm1GaWVsZCA9ICgpID0+IHtcbiAgY29uc3QgZmllbGRDb250ZXh0ID0gUmVhY3QudXNlQ29udGV4dChGb3JtRmllbGRDb250ZXh0KVxuICBjb25zdCBpdGVtQ29udGV4dCA9IFJlYWN0LnVzZUNvbnRleHQoRm9ybUl0ZW1Db250ZXh0KVxuICBjb25zdCB7IGdldEZpZWxkU3RhdGUgfSA9IHVzZUZvcm1Db250ZXh0KClcbiAgY29uc3QgZm9ybVN0YXRlID0gdXNlRm9ybVN0YXRlKHsgbmFtZTogZmllbGRDb250ZXh0Lm5hbWUgfSlcbiAgY29uc3QgZmllbGRTdGF0ZSA9IGdldEZpZWxkU3RhdGUoZmllbGRDb250ZXh0Lm5hbWUsIGZvcm1TdGF0ZSlcblxuICBpZiAoIWZpZWxkQ29udGV4dCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcInVzZUZvcm1GaWVsZCBzaG91bGQgYmUgdXNlZCB3aXRoaW4gPEZvcm1GaWVsZD5cIilcbiAgfVxuXG4gIGNvbnN0IHsgaWQgfSA9IGl0ZW1Db250ZXh0XG5cbiAgcmV0dXJuIHtcbiAgICBpZCxcbiAgICBuYW1lOiBmaWVsZENvbnRleHQubmFtZSxcbiAgICBmb3JtSXRlbUlkOiBgJHtpZH0tZm9ybS1pdGVtYCxcbiAgICBmb3JtRGVzY3JpcHRpb25JZDogYCR7aWR9LWZvcm0taXRlbS1kZXNjcmlwdGlvbmAsXG4gICAgZm9ybU1lc3NhZ2VJZDogYCR7aWR9LWZvcm0taXRlbS1tZXNzYWdlYCxcbiAgICAuLi5maWVsZFN0YXRlLFxuICB9XG59XG5cbnR5cGUgRm9ybUl0ZW1Db250ZXh0VmFsdWUgPSB7XG4gIGlkOiBzdHJpbmdcbn1cblxuY29uc3QgRm9ybUl0ZW1Db250ZXh0ID0gUmVhY3QuY3JlYXRlQ29udGV4dDxGb3JtSXRlbUNvbnRleHRWYWx1ZT4oXG4gIHt9IGFzIEZvcm1JdGVtQ29udGV4dFZhbHVlXG4pXG5cbmZ1bmN0aW9uIEZvcm1JdGVtKHsgY2xhc3NOYW1lLCAuLi5wcm9wcyB9OiBSZWFjdC5Db21wb25lbnRQcm9wczxcImRpdlwiPikge1xuICBjb25zdCBpZCA9IFJlYWN0LnVzZUlkKClcblxuICByZXR1cm4gKFxuICAgIDxGb3JtSXRlbUNvbnRleHQuUHJvdmlkZXIgdmFsdWU9e3sgaWQgfX0+XG4gICAgICA8ZGl2XG4gICAgICAgIGRhdGEtc2xvdD1cImZvcm0taXRlbVwiXG4gICAgICAgIGNsYXNzTmFtZT17Y24oXCJncmlkIGdhcC0yXCIsIGNsYXNzTmFtZSl9XG4gICAgICAgIHsuLi5wcm9wc31cbiAgICAgIC8+XG4gICAgPC9Gb3JtSXRlbUNvbnRleHQuUHJvdmlkZXI+XG4gIClcbn1cblxuZnVuY3Rpb24gRm9ybUxhYmVsKHtcbiAgY2xhc3NOYW1lLFxuICAuLi5wcm9wc1xufTogUmVhY3QuQ29tcG9uZW50UHJvcHM8dHlwZW9mIExhYmVsUHJpbWl0aXZlLlJvb3Q+KSB7XG4gIGNvbnN0IHsgZXJyb3IsIGZvcm1JdGVtSWQgfSA9IHVzZUZvcm1GaWVsZCgpXG5cbiAgcmV0dXJuIChcbiAgICA8TGFiZWxcbiAgICAgIGRhdGEtc2xvdD1cImZvcm0tbGFiZWxcIlxuICAgICAgZGF0YS1lcnJvcj17ISFlcnJvcn1cbiAgICAgIGNsYXNzTmFtZT17Y24oXCJkYXRhLVtlcnJvcj10cnVlXTp0ZXh0LWRlc3RydWN0aXZlXCIsIGNsYXNzTmFtZSl9XG4gICAgICBodG1sRm9yPXtmb3JtSXRlbUlkfVxuICAgICAgey4uLnByb3BzfVxuICAgIC8+XG4gIClcbn1cblxuZnVuY3Rpb24gRm9ybUNvbnRyb2woeyAuLi5wcm9wcyB9OiBSZWFjdC5Db21wb25lbnRQcm9wczx0eXBlb2YgU2xvdD4pIHtcbiAgY29uc3QgeyBlcnJvciwgZm9ybUl0ZW1JZCwgZm9ybURlc2NyaXB0aW9uSWQsIGZvcm1NZXNzYWdlSWQgfSA9IHVzZUZvcm1GaWVsZCgpXG5cbiAgcmV0dXJuIChcbiAgICA8U2xvdFxuICAgICAgZGF0YS1zbG90PVwiZm9ybS1jb250cm9sXCJcbiAgICAgIGlkPXtmb3JtSXRlbUlkfVxuICAgICAgYXJpYS1kZXNjcmliZWRieT17XG4gICAgICAgICFlcnJvclxuICAgICAgICAgID8gYCR7Zm9ybURlc2NyaXB0aW9uSWR9YFxuICAgICAgICAgIDogYCR7Zm9ybURlc2NyaXB0aW9uSWR9ICR7Zm9ybU1lc3NhZ2VJZH1gXG4gICAgICB9XG4gICAgICBhcmlhLWludmFsaWQ9eyEhZXJyb3J9XG4gICAgICB7Li4ucHJvcHN9XG4gICAgLz5cbiAgKVxufVxuXG5mdW5jdGlvbiBGb3JtRGVzY3JpcHRpb24oeyBjbGFzc05hbWUsIC4uLnByb3BzIH06IFJlYWN0LkNvbXBvbmVudFByb3BzPFwicFwiPikge1xuICBjb25zdCB7IGZvcm1EZXNjcmlwdGlvbklkIH0gPSB1c2VGb3JtRmllbGQoKVxuXG4gIHJldHVybiAoXG4gICAgPHBcbiAgICAgIGRhdGEtc2xvdD1cImZvcm0tZGVzY3JpcHRpb25cIlxuICAgICAgaWQ9e2Zvcm1EZXNjcmlwdGlvbklkfVxuICAgICAgY2xhc3NOYW1lPXtjbihcInRleHQtbXV0ZWQtZm9yZWdyb3VuZCB0ZXh0LXNtXCIsIGNsYXNzTmFtZSl9XG4gICAgICB7Li4ucHJvcHN9XG4gICAgLz5cbiAgKVxufVxuXG5mdW5jdGlvbiBGb3JtTWVzc2FnZSh7IGNsYXNzTmFtZSwgLi4ucHJvcHMgfTogUmVhY3QuQ29tcG9uZW50UHJvcHM8XCJwXCI+KSB7XG4gIGNvbnN0IHsgZXJyb3IsIGZvcm1NZXNzYWdlSWQgfSA9IHVzZUZvcm1GaWVsZCgpXG4gIGNvbnN0IGJvZHkgPSBlcnJvciA/IFN0cmluZyhlcnJvcj8ubWVzc2FnZSA/PyBcIlwiKSA6IHByb3BzLmNoaWxkcmVuXG5cbiAgaWYgKCFib2R5KSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPHBcbiAgICAgIGRhdGEtc2xvdD1cImZvcm0tbWVzc2FnZVwiXG4gICAgICBpZD17Zm9ybU1lc3NhZ2VJZH1cbiAgICAgIGNsYXNzTmFtZT17Y24oXCJ0ZXh0LWRlc3RydWN0aXZlIHRleHQtc21cIiwgY2xhc3NOYW1lKX1cbiAgICAgIHsuLi5wcm9wc31cbiAgICA+XG4gICAgICB7Ym9keX1cbiAgICA8L3A+XG4gIClcbn1cblxuZXhwb3J0IHtcbiAgdXNlRm9ybUZpZWxkLFxuICBGb3JtLFxuICBGb3JtSXRlbSxcbiAgRm9ybUxhYmVsLFxuICBGb3JtQ29udHJvbCxcbiAgRm9ybURlc2NyaXB0aW9uLFxuICBGb3JtTWVzc2FnZSxcbiAgRm9ybUZpZWxkLFxufVxuIl19