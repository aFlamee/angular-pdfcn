import { NgTemplateOutlet } from "@angular/common";
import { booleanAttribute, Component, computed, input } from "@angular/core";

import { PdfForm } from "@/registry/bases/takumi/components/form/form";
import type { PdfFormGroup } from "@/registry/bases/takumi/components/form/form.types";
import { PdfList } from "@/registry/bases/takumi/components/list/list";
import { PdfPageFooter } from "@/registry/bases/takumi/components/page-footer/page-footer";
import { PdfPageHeader } from "@/registry/bases/takumi/components/page-header/page-header";
import { PdfImage } from "@/registry/bases/takumi/components/pdf-image/pdf-image";
import { PdfSection } from "@/registry/bases/takumi/components/section/section";
import { PdfSignatureBlock } from "@/registry/bases/takumi/components/signature/signature";
import type { SignatureSigner } from "@/registry/bases/takumi/components/signature/signature";
import { TABLE } from "@/registry/bases/takumi/components/table/table";
import { PdfText } from "@/registry/bases/takumi/components/text/text";
import {
  PdfcnThemeProvider,
  injectPdfcnTheme,
} from "@/registry/bases/takumi/components/theme-provider";
import {
  TakumiDocument,
  TakumiPage,
  TakumiView,
  StyleSheet,
} from "@/registry/bases/takumi/lib/pdf-primitives";
import { resolveColor } from "@/registry/bases/takumi/lib/resolve-color";
import type { PdfcnTheme } from "@/registry/types/pdf-themes";

import type { MedicalIntakeFormProps } from "./medical-intake-form.types";

const FORM_VERSION = "Form v1.0 · Revised 09/2026";
const FORM_STYLE = { marginBottom: 0 };

const MEDICAL_CONDITIONS = [
  "Diabetes",
  "High Blood Pressure",
  "Heart Disease",
  "Asthma",
  "COPD",
  "Cancer",
  "Stroke",
  "Thyroid Disorder",
  "Kidney Disease",
  "Liver Disease",
  "Seizures / Epilepsy",
  "Other",
];

const CONSENT_ACKNOWLEDGMENTS = [
  { checked: false, text: "I have read and understand the consent above." },
  { checked: false, text: "I have received the Notice of Privacy Practices." },
];

const MEDICATION_ROWS = [
  "medication-1",
  "medication-2",
  "medication-3",
  "medication-4",
];

const ALLERGY_ROWS = ["allergy-1", "allergy-2", "allergy-3"];

const blankChecklist = (labels: string[]) =>
  labels.map((text) => ({ checked: false, text }));

const PERSONAL_INFO_GROUPS: PdfFormGroup[] = [
  {
    fields: [
      { height: 14, label: "Full Name" },
      { height: 14, hint: "DD / MM / YYYY", label: "Date of Birth" },
      { height: 14, label: "Gender" },
      { height: 14, hint: "+1 (555) 000-0000", label: "Phone Number" },
      { height: 14, label: "Email Address" },
    ],
    layout: "two-column",
    title: "Patient Information",
  },
  {
    fields: [
      { height: 14, label: "Street Address", width: "100%" },
      { height: 14, label: "City" },
      { height: 14, label: "State / Province" },
      { height: 14, label: "Postal Code" },
    ],
    layout: "two-column",
    title: "Address",
  },
];

const EMERGENCY_CONTACT_GROUPS: PdfFormGroup[] = [
  {
    fields: [
      { height: 14, label: "Emergency Contact Name" },
      { height: 14, label: "Relationship" },
      { height: 14, label: "Phone Number" },
    ],
    layout: "two-column",
    title: "Emergency Contact",
  },
];

const INSURANCE_GROUPS: PdfFormGroup[] = [
  {
    fields: [
      { height: 14, label: "Insurance Provider" },
      { height: 14, label: "Policy Number" },
      { height: 14, label: "Group Number" },
      { height: 14, label: "Subscriber Name" },
    ],
    layout: "two-column",
    title: "Insurance",
  },
];

const MEDICAL_HISTORY_COLUMNS = [
  blankChecklist(MEDICAL_CONDITIONS.slice(0, 4)),
  blankChecklist(MEDICAL_CONDITIONS.slice(4, 8)),
  blankChecklist(MEDICAL_CONDITIONS.slice(8)),
];

const CONSENT_SIGNERS: [SignatureSigner, SignatureSigner] = [
  { label: "Patient / Guardian Signature" },
  { label: "Date" },
];

const createIntakeStyles = (t: PdfcnTheme) =>
  StyleSheet.create({
    column: { flex: 1 },
    consentText: {
      fontSize: t.primitives.typography.xs,
      lineHeight: 1.4,
      marginBottom: 6,
    },
    labelText: { fontSize: 9, fontWeight: "bold", letterSpacing: 0.6 },
    page: {
      backgroundColor: t.colors.background,
      boxSizing: "border-box",
      minHeight: 841,
      paddingBottom: t.spacing.page.marginBottom,
      paddingLeft: t.spacing.page.marginLeft,
      paddingRight: t.spacing.page.marginRight,
      paddingTop: t.spacing.page.marginTop,
      position: "relative",
    },
    pageBreak: { breakAfter: "page" },
    pageTwo: { paddingBottom: 44, paddingTop: 24 },
    pageTwoHeader: {
      alignItems: "flex-end",
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    reasonBox: {
      borderColor: t.colors.border,
      borderRadius: t.primitives.borderRadius.sm,
      borderStyle: "solid",
      borderWidth: 1,
      minHeight: 40,
    },
    row: { flexDirection: "row", gap: 20 },
    section: { marginBottom: 4 },
    signature: { marginBottom: 0, marginTop: 8 },
    title: { fontSize: 13, fontWeight: "bold" },
  });

type IntakeSections = Required<
  Pick<
    MedicalIntakeFormProps,
    | "allergies"
    | "consent"
    | "emergencyContact"
    | "insurance"
    | "medicalHistory"
    | "medications"
    | "personalInfo"
    | "reasonForVisit"
  >
>;

const resolveSections = (props: MedicalIntakeFormProps): IntakeSections => ({
  allergies: props.allergies ?? true,
  consent: props.consent ?? true,
  emergencyContact: props.emergencyContact ?? true,
  insurance: props.insurance ?? true,
  medicalHistory: props.medicalHistory ?? true,
  medications: props.medications ?? true,
  personalInfo: props.personalInfo ?? true,
  reasonForVisit: props.reasonForVisit ?? true,
});

const hasSecondPage = (sections: IntakeSections) =>
  sections.allergies ||
  sections.consent ||
  sections.medications ||
  sections.reasonForVisit;

const intakeLayout = (theme: PdfcnTheme, props: MedicalIntakeFormProps) => {
  const styles = createIntakeStyles(theme);
  const sections = resolveSections(props);
  const accent = props.accentColor
    ? resolveColor(props.accentColor, theme.colors)
    : theme.colors.primary;
  const totalPages = hasSecondPage(sections) ? 2 : 1;

  return {
    firstPage: totalPages > 1 ? [styles.page, styles.pageBreak] : styles.page,
    footerPadding: theme.spacing.page.marginLeft,
    secondPage: [styles.page, styles.pageTwo],
    sectionRule: {
      borderBottomColor: accent,
      borderBottomStyle: "solid" as const,
      borderBottomWidth: 1,
      marginBottom: 4,
      paddingBottom: 2,
    },
    sections,
    styles,
    totalPages,
  };
};

@Component({
  imports: [
    TakumiDocument,
    TakumiPage,
    TakumiView,
    NgTemplateOutlet,
    PdfForm,
    PdfImage,
    PdfList,
    PdfPageFooter,
    PdfPageHeader,
    PdfSection,
    PdfSignatureBlock,
    PdfText,
    TABLE,
  ],
  selector: "pdf-medical-intake-form-content",
  template: `
    @let props = this.props();
    @let l = layout();
    @let styles = l.styles;
    <ng-template #sectionLabel let-label>
      <takumi-view [style]="l.sectionRule">
        <pdf-text noMargin [style]="styles.labelText" transform="uppercase">{{
          label
        }}</pdf-text>
      </takumi-view>
    </ng-template>
    <ng-template #intakeFooter let-page>
      <pdf-page-footer
        [address]="props.clinicAddress"
        [leftText]="FORM_VERSION"
        [pagePadding]="l.footerPadding"
        [phone]="props.clinicPhone"
        [rightText]="'Page ' + page + ' of ' + l.totalPages"
        sticky
        variant="three-column"
      />
    </ng-template>
    <ng-template #blankCell>
      <takumi-view [style]="{ minHeight: 14 }" />
    </ng-template>
    <takumi-document [title]="props.clinicName + ' — Patient Intake Form'">
      <takumi-page size="A4" [style]="l.firstPage">
        <ng-template #logo>
          <pdf-image
            [height]="48"
            [src]="props.clinicLogo!"
            [style]="{ margin: 0 }"
            [width]="48"
          />
        </ng-template>
        <pdf-page-header
          [logo]="props.clinicLogo ? logo : undefined"
          [marginBottom]="16"
          [rightSubText]="props.clinicAddress"
          [rightText]="props.clinicPhone"
          subtitle="Patient Intake Form"
          [title]="props.clinicName"
          variant="logo-left"
        />
        @if (l.sections.personalInfo) {
          <pdf-form
            [groups]="PERSONAL_INFO_GROUPS"
            [style]="FORM_STYLE"
            variant="underline"
          />
        }
        @if (l.sections.emergencyContact) {
          <pdf-form
            [groups]="EMERGENCY_CONTACT_GROUPS"
            [style]="FORM_STYLE"
            variant="underline"
          />
        }
        @if (l.sections.insurance) {
          <pdf-form
            [groups]="INSURANCE_GROUPS"
            [style]="FORM_STYLE"
            variant="underline"
          />
        }
        <ng-container
          *ngTemplateOutlet="intakeFooter; context: { $implicit: 1 }"
        />
      </takumi-page>
      @if (l.totalPages > 1) {
        <takumi-page size="A4" [style]="l.secondPage">
          <takumi-view [style]="styles.pageTwoHeader">
            <pdf-text noMargin [style]="styles.title">{{
              props.clinicName + " — Patient Intake Form (continued)"
            }}</pdf-text>
            <pdf-text color="mutedForeground" noMargin variant="xs">{{
              props.clinicPhone
            }}</pdf-text>
          </takumi-view>
          @if (l.sections.medicalHistory) {
            <takumi-view [style]="styles.section">
              <ng-container
                *ngTemplateOutlet="
                  sectionLabel;
                  context: { $implicit: 'Medical History' }
                "
              />
              <takumi-view [style]="styles.row">
                @for (items of MEDICAL_HISTORY_COLUMNS; track $index) {
                  <takumi-view [style]="styles.column">
                    <pdf-list gap="xs" [items]="items" variant="checklist" />
                  </takumi-view>
                }
              </takumi-view>
            </takumi-view>
          }
          @if (l.sections.medications) {
            <takumi-view [style]="styles.section">
              <ng-container
                *ngTemplateOutlet="
                  sectionLabel;
                  context: { $implicit: 'Current Medications' }
                "
              />
              <pdf-table variant="grid">
                <pdf-table-header>
                  <pdf-table-row header>
                    <pdf-table-cell>Medication</pdf-table-cell>
                    <pdf-table-cell>Dosage</pdf-table-cell>
                    <pdf-table-cell>Frequency</pdf-table-cell>
                    <pdf-table-cell>Prescribing Doctor</pdf-table-cell>
                  </pdf-table-row>
                </pdf-table-header>
                <pdf-table-body>
                  @for (row of MEDICATION_ROWS; track row) {
                    <pdf-table-row>
                      <pdf-table-cell
                        ><ng-container *ngTemplateOutlet="blankCell"
                      /></pdf-table-cell>
                      <pdf-table-cell
                        ><ng-container *ngTemplateOutlet="blankCell"
                      /></pdf-table-cell>
                      <pdf-table-cell
                        ><ng-container *ngTemplateOutlet="blankCell"
                      /></pdf-table-cell>
                      <pdf-table-cell
                        ><ng-container *ngTemplateOutlet="blankCell"
                      /></pdf-table-cell>
                    </pdf-table-row>
                  }
                </pdf-table-body>
              </pdf-table>
            </takumi-view>
          }
          @if (l.sections.allergies) {
            <takumi-view [style]="styles.section">
              <ng-container
                *ngTemplateOutlet="
                  sectionLabel;
                  context: { $implicit: 'Allergies' }
                "
              />
              <pdf-table variant="grid">
                <pdf-table-header>
                  <pdf-table-row header>
                    <pdf-table-cell>Allergen</pdf-table-cell>
                    <pdf-table-cell>Reaction</pdf-table-cell>
                    <pdf-table-cell>Severity</pdf-table-cell>
                  </pdf-table-row>
                </pdf-table-header>
                <pdf-table-body>
                  @for (row of ALLERGY_ROWS; track row) {
                    <pdf-table-row>
                      <pdf-table-cell
                        ><ng-container *ngTemplateOutlet="blankCell"
                      /></pdf-table-cell>
                      <pdf-table-cell
                        ><ng-container *ngTemplateOutlet="blankCell"
                      /></pdf-table-cell>
                      <pdf-table-cell
                        ><ng-container *ngTemplateOutlet="blankCell"
                      /></pdf-table-cell>
                    </pdf-table-row>
                  }
                </pdf-table-body>
              </pdf-table>
            </takumi-view>
          }
          @if (l.sections.reasonForVisit) {
            <takumi-view [style]="styles.section">
              <ng-container
                *ngTemplateOutlet="
                  sectionLabel;
                  context: { $implicit: 'Reason for Visit' }
                "
              />
              <takumi-view [style]="styles.reasonBox" />
            </takumi-view>
          }
          @if (l.sections.consent) {
            <takumi-view [style]="styles.section">
              <ng-container
                *ngTemplateOutlet="
                  sectionLabel;
                  context: { $implicit: 'Consent & Authorization' }
                "
              />
              <pdf-section
                [accentColor]="props.accentColor"
                padding="sm"
                spacing="none"
                variant="highlight"
              >
                <pdf-text
                  color="mutedForeground"
                  noMargin
                  [style]="styles.consentText"
                  >{{ consentText() }}</pdf-text
                >
                <pdf-list
                  gap="xs"
                  [items]="CONSENT_ACKNOWLEDGMENTS"
                  variant="checklist"
                />
              </pdf-section>
              <pdf-signature-block
                [signers]="CONSENT_SIGNERS"
                [style]="styles.signature"
                variant="double"
              />
            </takumi-view>
          }
          <ng-container
            *ngTemplateOutlet="intakeFooter; context: { $implicit: 2 }"
          />
        </takumi-page>
      }
    </takumi-document>
  `,
})
export class MedicalIntakeFormContent {
  readonly props = input.required<MedicalIntakeFormProps>();

  private readonly theme = injectPdfcnTheme();

  protected readonly ALLERGY_ROWS = ALLERGY_ROWS;
  protected readonly CONSENT_ACKNOWLEDGMENTS = CONSENT_ACKNOWLEDGMENTS;
  protected readonly CONSENT_SIGNERS = CONSENT_SIGNERS;
  protected readonly EMERGENCY_CONTACT_GROUPS = EMERGENCY_CONTACT_GROUPS;
  protected readonly FORM_STYLE = FORM_STYLE;
  protected readonly FORM_VERSION = FORM_VERSION;
  protected readonly INSURANCE_GROUPS = INSURANCE_GROUPS;
  protected readonly MEDICAL_HISTORY_COLUMNS = MEDICAL_HISTORY_COLUMNS;
  protected readonly MEDICATION_ROWS = MEDICATION_ROWS;
  protected readonly PERSONAL_INFO_GROUPS = PERSONAL_INFO_GROUPS;

  protected readonly layout = computed(() =>
    intakeLayout(this.theme(), this.props())
  );

  protected readonly consentText = computed(
    () =>
      `I authorize ${this.props().clinicName} to provide treatment and to release the information required to process insurance claims for this visit, and I acknowledge that I have received the Notice of Privacy Practices (HIPAA) explaining how my health information may be used.`
  );
}

/**
 * Print-ready medical intake form with patient, emergency contact, insurance,
 * medical history, medication, allergy, reason for visit, and consent
 * sections. Every section can be hidden through its boolean prop, and all
 * fields are left blank for the patient to complete by hand.
 */
@Component({
  imports: [MedicalIntakeFormContent, PdfcnThemeProvider],
  selector: "pdf-medical-intake-form",
  template: `
    <pdf-theme-provider [theme]="theme()">
      <pdf-medical-intake-form-content [props]="props()" />
    </pdf-theme-provider>
  `,
})
export class MedicalIntakeFormDocument {
  readonly clinicName = input.required<string>();
  readonly clinicLogo = input<string>();
  readonly clinicAddress = input<string>();
  readonly clinicPhone = input<string>();
  readonly personalInfo = input(true, { transform: booleanAttribute });
  readonly emergencyContact = input(true, { transform: booleanAttribute });
  readonly insurance = input(true, { transform: booleanAttribute });
  readonly medicalHistory = input(true, { transform: booleanAttribute });
  readonly medications = input(true, { transform: booleanAttribute });
  readonly allergies = input(true, { transform: booleanAttribute });
  readonly reasonForVisit = input(true, { transform: booleanAttribute });
  readonly consent = input(true, { transform: booleanAttribute });
  readonly accentColor = input<string>();
  readonly theme = input<PdfcnTheme>();

  protected readonly props = computed(
    (): MedicalIntakeFormProps => ({
      accentColor: this.accentColor(),
      allergies: this.allergies(),
      clinicAddress: this.clinicAddress(),
      clinicLogo: this.clinicLogo(),
      clinicName: this.clinicName(),
      clinicPhone: this.clinicPhone(),
      consent: this.consent(),
      emergencyContact: this.emergencyContact(),
      insurance: this.insurance(),
      medicalHistory: this.medicalHistory(),
      medications: this.medications(),
      personalInfo: this.personalInfo(),
      reasonForVisit: this.reasonForVisit(),
    })
  );
}
