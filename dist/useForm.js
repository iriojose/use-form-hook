"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useForm = void 0;
const react_1 = require("react");
var ACTION_RULES;
(function (ACTION_RULES) {
    ACTION_RULES["REQUIRED"] = "required";
    ACTION_RULES["EMAIL_FORMAT"] = "emailFormat";
    ACTION_RULES["MIN_LENGTH"] = "minLength";
    ACTION_RULES["MAX_LENGTH"] = "maxLength";
    ACTION_RULES["VALIDATE"] = "validate";
})(ACTION_RULES || (ACTION_RULES = {}));
const useForm = () => {
    const [formFields, setFormFields] = (0, react_1.useState)({});
    const formFieldsRef = (0, react_1.useRef)({});
    const [formErrors, setFormErrors] = (0, react_1.useState)({});
    const [validations, setValidations] = (0, react_1.useState)({});
    const [isFormValid, setIsFormValid] = (0, react_1.useState)(false);
    const [isSubmitting, setIsSubmitting] = (0, react_1.useState)(false);
    const setFormFieldValues = (name, value) => {
        setFormFields(prevValues => ({
            ...prevValues,
            [name]: value,
        }));
        formFieldsRef.current[name] = value;
    };
    const register = (name, rules) => {
        if (!(name in formFields)) {
            setFormFieldValues(name, '');
            if (rules) {
                setValidations(prev => ({
                    ...prev,
                    [name]: rules
                }));
            }
        }
        return {
            name: name,
            value: formFields[name] || "",
            onChange: handleChange,
        };
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormFieldValues(name, value);
        let error = null;
        for (const key of Object.keys(validations[name])) {
            const validateFn = validations[name][ACTION_RULES.VALIDATE];
            if (typeof validateFn === 'function') {
                error = validateFn(value);
                if (error)
                    break;
            }
            if (validationStrategies[key] && !validationStrategies[key](value, validations[name])) {
                if (typeof validations[name][key] === "string")
                    error = validations[name][key];
                else
                    error = validations[name][key].message;
                break;
            }
        }
        setFormErrors(prevErrors => ({
            ...prevErrors,
            [name]: error || '',
        }));
    };
    const checkFormValidity = (0, react_1.useCallback)(() => {
        const hasNoErrors = Object.values(formErrors).every(error => !error);
        const allFieldsFilled = Object.values(formFields).every(value => value.trim() !== '');
        return hasNoErrors && allFieldsFilled;
    }, [formErrors, formFields]);
    (0, react_1.useEffect)(() => {
        setIsFormValid(checkFormValidity());
    }, [formFields, formErrors, checkFormValidity]);
    const reset = () => {
        setFormFields(prevFields => {
            const updatedFields = { ...prevFields };
            Object.keys(updatedFields).forEach((key) => {
                updatedFields[key] = '';
            });
            return updatedFields;
        });
        setFormErrors(prevErrors => {
            Object.keys(prevErrors).forEach(key => {
                prevErrors[key] = '';
            });
            return prevErrors;
        });
        formFieldsRef.current = {};
    };
    const handleSubmit = async (onSubmit) => {
        setIsSubmitting(true);
        try {
            await onSubmit(formFields);
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const getValues = (fieldName) => {
        if (fieldName)
            return formFieldsRef.current[fieldName] || "";
        return formFieldsRef.current;
    };
    return {
        register,
        handleSubmit,
        reset,
        getValues,
        formErrors,
        isFormValid,
        isSubmitting
    };
};
exports.useForm = useForm;
const validationStrategies = {
    [ACTION_RULES.REQUIRED]: (inputValue) => validationRules[ACTION_RULES.REQUIRED](inputValue),
    [ACTION_RULES.EMAIL_FORMAT]: (inputValue) => validationRules[ACTION_RULES.EMAIL_FORMAT](inputValue),
    [ACTION_RULES.MIN_LENGTH]: (inputValue, rules) => {
        const minLength = rules?.[ACTION_RULES.MIN_LENGTH]?.value;
        return validationRules[ACTION_RULES.MIN_LENGTH](inputValue, minLength);
    },
    [ACTION_RULES.MAX_LENGTH]: (inputValue, rules) => {
        const maxLength = rules?.[ACTION_RULES.MAX_LENGTH]?.value;
        return validationRules[ACTION_RULES.MIN_LENGTH](inputValue, maxLength);
    },
};
// reusable validations
const validationRules = {
    [ACTION_RULES.REQUIRED]: (value) => value ? true : false,
    [ACTION_RULES.MIN_LENGTH]: (value, min) => value.length >= min,
    [ACTION_RULES.MAX_LENGTH]: (value, max) => value.length <= max,
    [ACTION_RULES.EMAIL_FORMAT]: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    },
};
