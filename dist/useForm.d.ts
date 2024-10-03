import { ChangeEvent } from "react";
type FormState = Record<string, string>;
type FormErrors = Record<string, string>;
type Rules = Partial<Record<ACTION_RULES, RuleInformation | string | ((value: string) => string | null)>>;
type RuleInformation = {
    message: string;
    value?: string | number;
};
declare enum ACTION_RULES {
    REQUIRED = "required",
    EMAIL_FORMAT = "emailFormat",
    MIN_LENGTH = "minLength",
    MAX_LENGTH = "maxLength",
    VALIDATE = "validate"
}
declare const useForm: <T extends FormState>() => {
    register: (name: keyof T, rules?: Rules) => {
        name: string;
        value: string | T[keyof T];
        onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    };
    handleSubmit: (onSubmit: (data: T) => Promise<void>) => Promise<void>;
    reset: () => void;
    getValues: (fieldName?: keyof T) => string | FormState;
    formErrors: FormErrors;
    isFormValid: boolean;
    isSubmitting: boolean;
};
export { useForm, type FormState };
