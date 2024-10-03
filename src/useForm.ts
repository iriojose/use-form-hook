import { useState, useEffect, useCallback, useRef, ChangeEvent } from "react";

type FormState = Record<string, string>
type FormErrors = Record<string, string>
type Validations = Record<string, Rules>

type Rules = Partial<Record<ACTION_RULES, RuleInformation | string | ((value: string) => string | null)>>
type StrategyRules = Partial<Record<ACTION_RULES, (inputValue: string, rules?: Rules) => boolean | null>>

type RuleInformation = {
    message: string
    value?: string | number
}

enum ACTION_RULES {
    REQUIRED = "required",
    EMAIL_FORMAT = "emailFormat",
    MIN_LENGTH = "minLength",
    MAX_LENGTH = "maxLength",
    VALIDATE = "validate"
}

const useForm = <T extends FormState>() => {
    const [formFields, setFormFields] = useState<T>({} as T) 
    const formFieldsRef = useRef<T>({} as T); 
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [validations, setValidations] = useState<Validations>({})
    const [isFormValid, setIsFormValid] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const setFormFieldValues = (name: keyof T, value: string) => {
        setFormFields(prevValues => ({
            ...prevValues,
            [name]: value,
        }));
        formFieldsRef.current[name] = value as T[keyof T]
    };

    const register = (name: keyof T, rules?: Rules) => {
        if(!(name in formFields)) {
            setFormFieldValues(name, '');
            
            if(rules) {
                setValidations(prev => ({
                    ...prev,
                    [name]: rules
                }))
            }
        }

        return {
            name: name as string,
            value: formFields[name] || "",
            onChange: handleChange,
        }
    }
    
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormFieldValues(name as keyof T, value);

        let error: string | null = null;
        for (const key of Object.keys(validations[name as keyof Validations]) as ACTION_RULES[]) {

            const validateFn = validations[name as keyof Validations][ACTION_RULES.VALIDATE];
            if (typeof validateFn === 'function') {
                error = validateFn(value);
                if (error) break;
            }
            
            if(validationStrategies[key] && !validationStrategies[key](value, validations[name as keyof Validations])){
                if(typeof validations[name as keyof Validations][key] === "string") error = validations[name as keyof Validations][key] as string
                else error = (validations[name as keyof Validations][key] as RuleInformation).message
                break;
            }
        }

        setFormErrors(prevErrors => ({
            ...prevErrors,
            [name]: error || '',
        }));
    }

    const checkFormValidity = useCallback(() => {
        const hasNoErrors = Object.values(formErrors).every(error => !error);
        const allFieldsFilled = Object.values(formFields).every(value => value.trim() !== '');
        return hasNoErrors && allFieldsFilled;
    },[formErrors, formFields]);
    
    useEffect(() => {
        setIsFormValid(checkFormValidity());
    }, [formFields, formErrors, checkFormValidity]);
    
    const reset = () => {
        setFormFields(prevFields => {
            const updatedFields = { ...prevFields };

            Object.keys(updatedFields).forEach((key) => {
                updatedFields[key as keyof T] = '' as T[keyof T]
            });
            
            return updatedFields;
        });
        
        setFormErrors(prevErrors => {
            Object.keys(prevErrors).forEach(key => {
                prevErrors[key] = '';
            });
            return prevErrors;
        });

        formFieldsRef.current = {} as T;
    }

    const handleSubmit = async(onSubmit: (data: T) => Promise<void>) => {
        setIsSubmitting(true);
        try {
            await onSubmit(formFields)
        } finally {
            setIsSubmitting(false); 
        }
    }

    const getValues = (fieldName?: keyof T): string | FormState => {
        if (fieldName) return formFieldsRef.current[fieldName] || "";
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
    } 
}

const validationStrategies: StrategyRules = {
    [ACTION_RULES.REQUIRED]: (inputValue) => validationRules[ACTION_RULES.REQUIRED](inputValue),
    [ACTION_RULES.EMAIL_FORMAT]: (inputValue) => validationRules[ACTION_RULES.EMAIL_FORMAT](inputValue),

    [ACTION_RULES.MIN_LENGTH]: (inputValue, rules) => {
        const minLength = (rules?.[ACTION_RULES.MIN_LENGTH] as { value: number })?.value;
        return validationRules[ACTION_RULES.MIN_LENGTH](inputValue, minLength)
    },
    [ACTION_RULES.MAX_LENGTH]: (inputValue, rules) => {
        const maxLength = (rules?.[ACTION_RULES.MAX_LENGTH] as { value: number })?.value;
        return validationRules[ACTION_RULES.MIN_LENGTH](inputValue, maxLength)
    },

};

// reusable validations
const validationRules = {
    [ACTION_RULES.REQUIRED]: (value: string) => value ? true:false,
    [ACTION_RULES.MIN_LENGTH]: (value: string, min: number) => value.length >= min,
    [ACTION_RULES.MAX_LENGTH]: (value: string, max: number) => value.length <= max,
    
    [ACTION_RULES.EMAIL_FORMAT]: (value: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(value)
    },
}; 

export { useForm, type FormState}