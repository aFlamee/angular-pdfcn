---
title: "Medical Intake Form"
description: "Printable patient intake and registration form with personal, insurance, medical history, and consent sections."
---

::preview{base="forme" name="medical-intake-form"}

## Installation

::installation{base="forme" name="medical-intake-form"}

## Usage

::example{base="forme" name="medical-intake-form"}

## Sections

Every section is rendered by default and can be hidden by setting its input to `false`.

```angular-html
<pdf-medical-intake-form
  clinicName="Sunrise Family Medicine"
  personalInfo
  emergencyContact
  [insurance]="false"
  medicalHistory
  medications
  allergies
  reasonForVisit
  consent
/>
```

| Input              | Section                                                       |
| ------------------ | ------------------------------------------------------------- |
| `personalInfo`     | Name, date of birth, gender, phone, email, and address fields |
| `emergencyContact` | Contact name, relationship, and phone fields                  |
| `insurance`        | Provider, policy, group, and subscriber fields                |
| `medicalHistory`   | Condition checklist with allergy and medication prompts       |
| `medications`      | Medication, dosage, frequency, and prescribing doctor table   |
| `allergies`        | Allergen, reaction, and severity table                        |
| `reasonForVisit`   | Free-text area for symptoms and reason for the visit          |
| `consent`          | HIPAA authorization, treatment consent, and signature lines   |

## Inputs

| Input           | Type         | Description                                                 |
| --------------- | ------------ | ----------------------------------------------------------- |
| `clinicName`    | `string`     | Clinic name shown in the header and consent text            |
| `clinicLogo`    | `string`     | Optional logo image source                                  |
| `clinicAddress` | `string`     | Address shown in the header and footer                      |
| `clinicPhone`   | `string`     | Phone number shown in the header and footer                 |
| `accentColor`   | `string`     | Theme token or CSS color used for section rules and accents |
| `theme`         | `PdfcnTheme` | Theme override for the whole document                       |
