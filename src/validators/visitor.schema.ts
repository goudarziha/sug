import * as yup from 'yup';

// Response body schema for /api/v1/visitors/signals

export const visitorSchema = yup.object().shape({
    fingerprint_hash: yup.string().optional(),
    user_agent: yup.string().optional(),
    utm_source: yup.string().optional(),
    utm_medium: yup.string().optional(),
    utm_campaign: yup.string().optional(),
    landing_path: yup.string().optional(),
    language: yup.string().optional(),
});