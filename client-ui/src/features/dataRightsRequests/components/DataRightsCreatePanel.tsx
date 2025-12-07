// src/features/dataRightsRequests/components/DataRightsCreatePanel.tsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type {
    CreatingDataRightsRequest,
    RequestType,
} from "../domain/dataRights";

type Props = {
    creating: CreatingDataRightsRequest;
    setType: (t: RequestType) => void;
    updateRectification: (
        p: Partial<CreatingDataRightsRequest["rectification"]>,
    ) => void;
    setCreating: (c: CreatingDataRightsRequest) => void;
    onSubmit: () => void;
};

/* ===== PHONE HELPERS ===== */

const PHONE_CODES: string[] = [
    "+351", // PT
    "+34",  // ES
    "+33",  // FR
    "+44",  // UK
    "+49",  // DE
    "+39",  // IT
    "+30",  // GR
    "+1",   // US / CA
    "+55",  // BR
    "+52",  // MX
    "+54",  // AR
    "+81",  // JP
    "+82",  // KR
    "+86",  // CN
    "+91",  // IN
    "+61",  // AU
    "+64",  // NZ
    "+27",  // ZA
];

function buildPhoneE164(code: string, rawNumber: string): string {
    const digits = rawNumber.replace(/\D/g, "");
    if (!code || !digits) return "";
    return `${code}${digits}`;
}

/* ===== NATIONALITIES (mesmos nomes do enum do backend) ===== */

const NATIONALITY_VALUES: string[] = [
    "Usa",
    "Afghanistan",
    "Albania",
    "Algeria",
    "Andorra",
    "Angola",
    "AntiguaDeps",
    "Argentina",
    "Armenia",
    "Australia",
    "Austria",
    "Azerbaijan",
    "Bahamas",
    "Bahrain",
    "Bangladesh",
    "Barbados",
    "Belarus",
    "Belgium",
    "Belize",
    "Benin",
    "Bhutan",
    "Bolivia",
    "BosniaHerzegovina",
    "Botswana",
    "Brazil",
    "Brunei",
    "Bulgaria",
    "Burkina",
    "Burma",
    "Burundi",
    "Cambodia",
    "Cameroon",
    "Canada",
    "CapeVerde",
    "CentralAfricanRep",
    "Chad",
    "Chile",
    "China",
    "RepublicOfChina",
    "Colombia",
    "Comoros",
    "DemocraticRepublicOfTheCongo",
    "RepublicOfTheCongo",
    "CostaRica",
    "Croatia",
    "Cuba",
    "Cyprus",
    "CzechRepublic",
    "Danzig",
    "Denmark",
    "Djibouti",
    "Dominica",
    "DominicanRepublic",
    "EastTimor",
    "Ecuador",
    "Egypt",
    "ElSalvador",
    "EquatorialGuinea",
    "Eritrea",
    "Estonia",
    "Ethiopia",
    "Fiji",
    "Finland",
    "France",
    "Gabon",
    "GazaStrip",
    "TheGambia",
    "Georgia",
    "Germany",
    "Ghana",
    "Greece",
    "Grenada",
    "Guatemala",
    "Guinea",
    "GuineaBissau",
    "Guyana",
    "Haiti",
    "HolyRomanEmpire",
    "Honduras",
    "Hungary",
    "Iceland",
    "India",
    "Indonesia",
    "Iran",
    "Iraq",
    "RepublicOfIreland",
    "Israel",
    "Italy",
    "IvoryCoast",
    "Jamaica",
    "Japan",
    "Jordan",
    "Kazakhstan",
    "Kenya",
    "Kiribati",
    "NorthKorea",
    "SouthKorea",
    "Kosovo",
    "Kuwait",
    "Kyrgyzstan",
    "Laos",
    "Latvia",
    "Lebanon",
    "Lesotho",
    "Liberia",
    "Libya",
    "Liechtenstein",
    "Lithuania",
    "Luxembourg",
    "Macedonia",
    "Madagascar",
    "Malawi",
    "Malaysia",
    "Maldives",
    "Mali",
    "Malta",
    "MarshallIslands",
    "Mauritania",
    "Mauritius",
    "Mexico",
    "Micronesia",
    "Moldova",
    "Monaco",
    "Mongolia",
    "Montenegro",
    "Morocco",
    "Mozambique",
    "Namibia",
    "Nauru",
    "Nepal",
    "Newfoundland",
    "Netherlands",
    "NewZealand",
    "Nicaragua",
    "Niger",
    "Nigeria",
    "Norway",
    "Oman",
    "Pakistan",
    "Palau",
    "Panama",
    "PapuaNewGuinea",
    "Paraguay",
    "Peru",
    "Philippines",
    "Poland",
    "Portugal",
    "Qatar",
    "Romania",
    "RussianFederation",
    "Rwanda",
    "Samoa",
    "SanMarino",
    "SaoTomePrincipe",
    "SaudiArabia",
    "Senegal",
    "Serbia",
    "Seychelles",
    "SierraLeone",
    "Singapore",
    "Slovakia",
    "Slovenia",
    "SolomonIslands",
    "Somalia",
    "SouthAfrica",
    "Spain",
    "SriLanka",
    "Sudan",
    "Suriname",
    "Swaziland",
    "Sweden",
    "Switzerland",
    "Syria",
    "Tajikistan",
    "Tanzania",
    "Thailand",
    "Togo",
    "Tonga",
    "TrinidadTobago",
    "Tunisia",
    "Turkey",
    "Turkmenistan",
    "Tuvalu",
    "Uganda",
    "Ukraine",
    "UnitedArabEmirates",
    "UnitedKingdom",
    "Uruguay",
    "Uzbekistan",
    "Vanuatu",
    "VaticanCity",
    "Venezuela",
    "Vietnam",
    "Yemen",
    "Zambia",
    "Zimbabwe",
];

function nationalityLabel(value: string): string {
    if (value === "Usa") return "USA";
    if (value === "CapeVerde") return "Cape Verde";
    if (value === "CentralAfricanRep") return "Central African Rep.";
    if (value === "CzechRepublic") return "Czech Republic";
    if (value === "DominicanRepublic") return "Dominican Republic";
    if (value === "HolyRomanEmpire") return "Holy Roman Empire";
    if (value === "IvoryCoast") return "Ivory Coast";
    if (value === "PapuaNewGuinea") return "Papua New Guinea";
    if (value === "RussianFederation") return "Russian Federation";
    if (value === "SaoTomePrincipe") return "São Tomé & Príncipe";
    if (value === "SaudiArabia") return "Saudi Arabia";
    if (value === "SolomonIslands") return "Solomon Islands";
    if (value === "SouthAfrica") return "South Africa";
    if (value === "SriLanka") return "Sri Lanka";
    if (value === "TrinidadTobago") return "Trinidad & Tobago";
    if (value === "UnitedArabEmirates") return "United Arab Emirates";
    if (value === "UnitedKingdom") return "United Kingdom";
    if (value === "VaticanCity") return "Vatican City";

    // Default: quebra CamelCase em palavras
    return value.replace(/([a-z])([A-Z])/g, "$1 $2");
}

const NATIONALITIES = NATIONALITY_VALUES.map(v => ({
    value: v,
    label: nationalityLabel(v),
}));

/* ===== COMPONENTE ===== */

export function DataRightsCreatePanel({
                                          creating,
                                          setType,
                                          updateRectification,
                                          setCreating,
                                          onSubmit,
                                      }: Props) {
    const { t } = useTranslation();
    const type = creating.type;

    // estado local para o telefone SAR (prefixo + número)
    const [phoneCode, setPhoneCode] = useState<string>("");
    const [phoneNumber, setPhoneNumber] = useState<string>("");

    // Sempre que o payload já tiver um número (ex: edição futura),
    // desmonta-o nos dois campos.
    useEffect(() => {
        const full = creating.rectification.newPhoneNumber ?? "";
        if (!full) {
            setPhoneCode("");
            setPhoneNumber("");
            return;
        }

        const match = PHONE_CODES.find(c => full.startsWith(c));
        if (match) {
            setPhoneCode(match);
            setPhoneNumber(full.slice(match.length));
        } else {
            setPhoneCode("");
            setPhoneNumber(full.replace(/^\+/, ""));
        }
    }, [creating.rectification.newPhoneNumber]);

    function handlePhoneCodeChange(newCode: string) {
        setPhoneCode(newCode);
        const combined = buildPhoneE164(newCode, phoneNumber);
        updateRectification({
            newPhoneNumber: combined || null,
        });
    }

    function handlePhoneNumberChange(newNumber: string) {
        setPhoneNumber(newNumber);
        const combined = buildPhoneE164(phoneCode, newNumber);
        updateRectification({
            newPhoneNumber: combined || null,
        });
    }

    return (
        <div className="dr-create-panel slide-in-up">
            <h2 className="dr-card-title">
                ✨ {t("dataRights.create.title", "Create a new request")}
            </h2>
            <p className="dr-card-subtitle">
                {t(
                    "dataRights.create.subtitle",
                    "Choose the type of request and fill in the details below.",
                )}
            </p>

            {/* Selector de tipo */}
            <div className="dr-type-switch">
                <TypeButton
                    label="Access"
                    emoji="📄"
                    active={type === "Access"}
                    onClick={() => setType("Access")}
                />
                <TypeButton
                    label="Deletion"
                    emoji="🧹"
                    active={type === "Deletion"}
                    onClick={() => setType("Deletion")}
                />
                <TypeButton
                    label="Rectification"
                    emoji="✏️"
                    active={type === "Rectification"}
                    onClick={() => setType("Rectification")}
                />
            </div>

            {/* Form consoante o tipo */}
            {type === "Access" && (
                <div className="dr-form-section">
                    <p>
                        {t(
                            "dataRights.create.accessInfo",
                            "We will send you a summary of the personal data we store about you.",
                        )}
                    </p>
                    <p className="dr-note">
                        ℹ️{" "}
                        {t(
                            "dataRights.create.accessNote",
                            "No additional information is required for this request.",
                        )}
                    </p>
                </div>
            )}

            {type === "Deletion" && (
                <div className="dr-form-section">
                    <label className="dr-label">
                        {t(
                            "dataRights.create.deletionReason",
                            "Reason for deletion (optional but recommended)",
                        )}
                    </label>
                    <textarea
                        className="dr-textarea"
                        rows={3}
                        placeholder={t(
                            "dataRights.create.deletionReason_PH",
                            "Example: I no longer use the platform and want my data removed.",
                        )}
                        value={creating.deletionReason}
                        onChange={e =>
                            setCreating({
                                ...creating,
                                deletionReason: e.target.value,
                            })
                        }
                    />
                    <p className="dr-note">
                        ⚠️{" "}
                        {t(
                            "dataRights.create.deletionWarning",
                            "Some data may need to be kept for legal or security reasons.",
                        )}
                    </p>
                </div>
            )}

            {type === "Rectification" && (
                <div className="dr-form-section dr-grid-2">
                    <div>
                        <label className="dr-label">
                            {t("dataRights.create.newName", "New name")}
                        </label>
                        <input
                            className="dr-input"
                            value={creating.rectification.newName ?? ""}
                            onChange={e =>
                                updateRectification({ newName: e.target.value })
                            }
                            placeholder={t(
                                "dataRights.create.newName_PH",
                                "Only fill if you want to change",
                            )}
                        />
                    </div>
                    <div>
                        <label className="dr-label">
                            {t("dataRights.create.newEmail", "New email")}
                        </label>
                        <input
                            className="dr-input"
                            value={creating.rectification.newEmail ?? ""}
                            onChange={e =>
                                updateRectification({ newEmail: e.target.value })
                            }
                            placeholder={t(
                                "dataRights.create.newEmail_PH",
                                "Only fill if you want to change",
                            )}
                        />
                    </div>

                    <div>
                        <label className="dr-label">
                            {t(
                                "dataRights.create.newPicture",
                                "New profile picture URL",
                            )}
                        </label>
                        <input
                            className="dr-input"
                            value={creating.rectification.newPicture ?? ""}
                            onChange={e =>
                                updateRectification({
                                    newPicture: e.target.value,
                                })
                            }
                            placeholder="https://..."
                        />
                    </div>

                    <div>
                        <label className="dr-label">
                            {t(
                                "dataRights.create.isActive",
                                "Mark account as active?",
                            )}
                        </label>
                        <select
                            className="dr-input"
                            value={
                                creating.rectification.isActive === null ||
                                creating.rectification.isActive === undefined
                                    ? ""
                                    : creating.rectification.isActive
                                        ? "true"
                                        : "false"
                            }
                            onChange={e => {
                                const v = e.target.value;
                                updateRectification({
                                    isActive:
                                        v === ""
                                            ? null
                                            : v === "true"
                                                ? true
                                                : false,
                                });
                            }}
                        >
                            <option value="">
                                {t(
                                    "dataRights.create.keepAsIs",
                                    "Keep as is",
                                )}
                            </option>
                            <option value="true">
                                {t(
                                    "dataRights.create.setActive",
                                    "Set as active",
                                )}
                            </option>
                            <option value="false">
                                {t(
                                    "dataRights.create.setInactive",
                                    "Set as inactive",
                                )}
                            </option>
                        </select>
                    </div>

                    {/* PHONE (SAR) */}
                    <div>
                        <label className="dr-label">
                            {t(
                                "dataRights.create.newPhoneNumber",
                                "New phone number (SAR)",
                            )}
                        </label>
                        <div className="dr-phone-row">
                            <select
                                className="dr-input dr-phone-code"
                                value={phoneCode}
                                onChange={e =>
                                    handlePhoneCodeChange(e.target.value)
                                }
                            >
                                <option value="">
                                    {t(
                                        "dataRights.create.phoneCode",
                                        "+ code",
                                    )}
                                </option>
                                {PHONE_CODES.map(code => (
                                    <option key={code} value={code}>
                                        {code}
                                    </option>
                                ))}
                            </select>
                            <input
                                className="dr-input dr-phone-number"
                                value={phoneNumber}
                                onChange={e =>
                                    handlePhoneNumberChange(e.target.value)
                                }
                                placeholder={t(
                                    "dataRights.create.phoneNumber_PH",
                                    "912345678",
                                )}
                                inputMode="tel"
                            />
                        </div>
                    </div>

                    {/* NATIONALITY (SAR) */}
                    <div>
                        <label className="dr-label">
                            {t(
                                "dataRights.create.newNationality",
                                "New nationality (SAR)",
                            )}
                        </label>
                        <select
                            className="dr-input"
                            value={creating.rectification.newNationality ?? ""}
                            onChange={e =>
                                updateRectification({
                                    newNationality:
                                        e.target.value || null,
                                })
                            }
                        >
                            <option value="">
                                {t(
                                    "dataRights.create.keepAsIs",
                                    "Keep as is",
                                )}
                            </option>
                            {NATIONALITIES.map(n => (
                                <option key={n.value} value={n.value}>
                                    {n.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="dr-label">
                            {t(
                                "dataRights.create.newCitizenId",
                                "New citizen ID / passport (SAR)",
                            )}
                        </label>
                        <input
                            className="dr-input"
                            value={creating.rectification.newCitizenId ?? ""}
                            onChange={e =>
                                updateRectification({
                                    newCitizenId: e.target.value,
                                })
                            }
                            placeholder="AB1234567"
                            maxLength={9}
                            pattern="[A-Za-z0-9]{6,9}"
                        />
                    </div>

                    <div className="dr-grid-full">
                        <label className="dr-label">
                            {t(
                                "dataRights.create.reason",
                                "Why do you want these changes?",
                            )}
                        </label>
                        <textarea
                            className="dr-textarea"
                            rows={3}
                            value={creating.rectification.reason ?? ""}
                            onChange={e =>
                                updateRectification({
                                    reason: e.target.value,
                                })
                            }
                            placeholder={t(
                                "dataRights.create.reason_PH",
                                "Briefly explain why these corrections are needed.",
                            )}
                        />
                    </div>
                </div>
            )}

            <div className="dr-form-actions">
                <button
                    type="button"
                    className="dr-primary-btn"
                    onClick={onSubmit}
                >
                    🚀 {t("dataRights.create.submit", "Submit request")}
                </button>
                <p className="dr-note">
                    🔒{" "}
                    {t(
                        "dataRights.create.footerNote",
                        "Your request will be handled by our privacy team and you will be notified by email.",
                    )}
                </p>
            </div>
        </div>
    );
}

type TypeButtonProps = {
    label: string;
    emoji: string;
    active: boolean;
    onClick: () => void;
};

function TypeButton({ label, emoji, active, onClick }: TypeButtonProps) {
    return (
        <button
            type="button"
            className={`dr-type-btn ${active ? "active" : ""}`}
            onClick={onClick}
        >
            <span className="dr-type-emoji">{emoji}</span>
            <span>{label}</span>
        </button>
    );
}
