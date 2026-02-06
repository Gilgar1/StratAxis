// Email validation
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Password validation
export const isValidPassword = (password: string): {
    valid: boolean;
    errors: string[];
} => {
    const errors: string[] = [];

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
};

// Phone number validation (Cameroon format)
export const isValidPhoneNumber = (phone: string): boolean => {
    // Cameroon phone: +237 6XX XXX XXX or 6XX XXX XXX
    const phoneRegex = /^(\+237)?[26]\d{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Price validation
export const isValidPrice = (price: number): boolean => {
    return price > 0 && price < 10000000000; // Max 10 billion XAF
};

// Area validation
export const isValidArea = (area: number): boolean => {
    return area > 0 && area < 1000000; // Max 1 million m²
};

// Required field validation
export const isRequired = (value: any): boolean => {
    if (typeof value === 'string') {
        return value.trim().length > 0;
    }
    return value !== null && value !== undefined;
};

// Form validation helper
export const validateForm = <T extends Record<string, any>>(
    data: T,
    rules: Partial<Record<keyof T, (value: any) => string | null>>
): { valid: boolean; errors: Partial<Record<keyof T, string>> } => {
    const errors: Partial<Record<keyof T, string>> = {};

    for (const [field, validator] of Object.entries(rules)) {
        if (typeof validator === 'function') {
            const error = validator(data[field as keyof T]);
            if (error) {
                errors[field as keyof T] = error;
            }
        }
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors,
    };
};
