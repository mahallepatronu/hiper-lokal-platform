import React from 'react';
import { useField } from 'formik';

const FormInput = ({ label, name, type = 'text', icon, ...props }) => {
    const [field, meta, helpers] = useField(name);

    return (
        <div className="form-group">
            <label htmlFor={name}>{label}</label>
            <div className="input-group">
                {icon && <span className="input-icon">{icon}</span>}
                <input
                    type={type}
                    id={name}
                    className={`form-control ${meta.touched && meta.error ? 'is-invalid' : ''}`}
                    {...field}
                    {...props}
                />
                {meta.touched && meta.error && (
                    <div className="invalid-feedback">{meta.error}</div>
                )}
            </div>
        </div>
    );
};

export default FormInput; 