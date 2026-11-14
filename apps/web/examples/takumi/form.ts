import { Component } from "@angular/core";

import { PdfForm } from "@/registry/bases/takumi/components/form/form";
import type { PdfFormGroup } from "@/registry/bases/takumi/components/form/form.types";
import { PdfcnThemeProvider } from "@/registry/bases/takumi/components/theme-provider";
import {
  TakumiDocument,
  TakumiPage,
} from "@/registry/bases/takumi/lib/pdf-primitives";

@Component({
  imports: [TakumiDocument, TakumiPage, PdfcnThemeProvider, PdfForm],
  template: `
    <takumi-document>
      <takumi-page size="A4">
        <pdf-theme-provider>
          <pdf-form
            title="Job Application"
            subtitle="Please complete all fields clearly in block capitals."
            variant="underline"
            [groups]="groups"
          />
        </pdf-theme-provider>
      </takumi-page>
    </takumi-document>
  `,
})
export default class FormDemo {
  protected readonly groups: PdfFormGroup[] = [
    {
      fields: [
        { hint: "First and last name", label: "Full Name" },
        { hint: "DD / MM / YYYY", label: "Date of Birth" },
        { label: "Email Address" },
        { hint: "+1 (555) 000-0000", label: "Phone Number" },
      ],
      title: "Personal Information",
    },
    {
      fields: [
        { label: "Street Address", width: "100%" },
        { label: "City" },
        { label: "State / Province" },
        { label: "Postal Code" },
      ],
      layout: "two-column",
      title: "Address",
    },
    {
      fields: [{ height: 60, label: "Cover Letter" }],
      title: "Additional Information",
    },
  ];
}
