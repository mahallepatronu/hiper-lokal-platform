import * as yup from 'yup';

export const registerSchema = yup.object().shape({
    firstName: yup
        .string()
        .required('Ad alanı zorunludur')
        .min(2, 'Ad en az 2 karakter olmalıdır')
        .max(50, 'Ad en fazla 50 karakter olabilir')
        .matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, 'Ad sadece harf içerebilir'),
    lastName: yup
        .string()
        .required('Soyad alanı zorunludur')
        .min(2, 'Soyad en az 2 karakter olmalıdır')
        .max(50, 'Soyad en fazla 50 karakter olabilir')
        .matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, 'Soyad sadece harf içerebilir'),
    email: yup
        .string()
        .required('E-posta alanı zorunludur')
        .email('Geçerli bir e-posta adresi giriniz'),
    password: yup
        .string()
        .required('Şifre alanı zorunludur')
        .min(8, 'Şifre en az 8 karakter olmalıdır')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
            'Şifre en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir'
        ),
    confirmPassword: yup
        .string()
        .required('Şifre tekrarı zorunludur')
        .oneOf([yup.ref('password')], 'Şifreler eşleşmiyor'),
    phoneNumber: yup
        .string()
        .required('Telefon numarası zorunludur')
        .matches(/^[0-9]{10}$/, 'Geçerli bir telefon numarası giriniz')
});

export const loginSchema = yup.object().shape({
    email: yup
        .string()
        .required('E-posta alanı zorunludur')
        .email('Geçerli bir e-posta adresi giriniz'),
    password: yup
        .string()
        .required('Şifre alanı zorunludur')
});

export const forgotPasswordSchema = yup.object().shape({
    email: yup
        .string()
        .required('E-posta alanı zorunludur')
        .email('Geçerli bir e-posta adresi giriniz')
});

export const resetPasswordSchema = yup.object().shape({
    password: yup
        .string()
        .required('Şifre alanı zorunludur')
        .min(8, 'Şifre en az 8 karakter olmalıdır')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
            'Şifre en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir'
        ),
    confirmPassword: yup
        .string()
        .required('Şifre tekrarı zorunludur')
        .oneOf([yup.ref('password')], 'Şifreler eşleşmiyor')
}); 