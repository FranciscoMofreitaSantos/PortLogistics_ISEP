import {
    REQUIRED_SECTIONS_EN,
    REQUIRED_SECTIONS_PT,
} from "../config/privacyPolicyTemplates";

export type PrivacyContentValidationResult = {
    missingPt: string[];
    missingEn: string[];
};

export function validatePrivacyContent(contentPT: string, contentEN: string,): PrivacyContentValidationResult {
    const contentPtLower = contentPT.toLowerCase();
    const contentEnLower = contentEN.toLowerCase();

    const missingPt = REQUIRED_SECTIONS_PT.filter(
        (s) => !contentPtLower.includes(s.toLowerCase()),
    );

    const missingEn = REQUIRED_SECTIONS_EN.filter(
        (s) => !contentEnLower.includes(s.toLowerCase()),
    );

    return { missingPt, missingEn };
}
