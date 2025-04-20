import React from 'react';
import PropTypes from 'prop-types';

const FormInput = ({
                       label,
                       name,
                       type = 'text',
                       value,
                       onChange,
                       required = false,
                       placeholder = '',
                       error = '',
                       disabled = false,
                       autoComplete,
                       className = ''
                   }) => {
    return (
        <div className={`input-group ${error ? 'has-error' : ''} ${className}`}>
            <label htmlFor={name}>
                {label}
                {required && <span className="required">*</span>}
            </label>
            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                required={required}
                placeholder={placeholder}
                disabled={disabled}
                autoComplete={autoComplete}
                aria-invalid={!!error}
                aria-describedby={error ? `${name}-error` : undefined}
                className={error ? 'error-input' : ''}
            />
            {error && <p id={`${name}-error`} className="error-text">{error}</p>}
        </div>
    );
};

FormInput.propTypes = {
    label: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onChange: PropTypes.func.isRequired,
    required: PropTypes.bool,
    placeholder: PropTypes.string,
    error: PropTypes.string,
    disabled: PropTypes.bool,
    autoComplete: PropTypes.string,
    className: PropTypes.string
};

export default FormInput;