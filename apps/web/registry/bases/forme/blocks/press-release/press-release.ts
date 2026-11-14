import { Component, computed, input } from "@angular/core";

import { PdfPageFooter } from "@/registry/bases/forme/components/page-footer/page-footer";
import { PdfPageHeader } from "@/registry/bases/forme/components/page-header/page-header";
import { PdfImage } from "@/registry/bases/forme/components/pdf-image/pdf-image";
import { PdfSection } from "@/registry/bases/forme/components/section/section";
import { PdfText } from "@/registry/bases/forme/components/text/text";
import {
  PdfcnThemeProvider,
  injectPdfcnTheme,
} from "@/registry/bases/forme/components/theme-provider";
import {
  FormeDocument,
  FormePage,
  FormeView,
  StyleSheet,
} from "@/registry/bases/forme/lib/pdf-primitives";
import type { PdfcnTheme } from "@/registry/types/pdf-themes";

import type { PressReleaseProps } from "./press-release.types";

// Sample data — replace with your own props or data source
const sampleData: PressReleaseProps = {
  accentColor: "#1e40af",
  address: "123 Market St, San Francisco, CA 94103",
  body: [
    "Acme Corp today announced the launch of pdfcn, an open-source React component library for generating professional PDF documents.",
    "pdfcn is designed to work seamlessly with shadcn/ui and follows the same registry-based distribution model, letting developers add print-ready document blocks with a single CLI command.",
  ],
  boilerplate:
    "Acme Corp is a leading provider of developer tools and open-source software.",
  companyName: "Acme Corp",
  date: "September 10, 2026",
  dateline: { city: "San Francisco", state: "CA" },
  headline: "Acme Corp Launches Revolutionary PDF Toolkit for Developers",
  mediaContact: {
    email: "press@acme.com",
    name: "Press Team",
    phone: "(555) 123-4567",
  },
  quotes: [
    {
      author: "Jane Doe",
      text: "We built pdfcn because generating PDFs in React was unnecessarily painful. Now it feels like writing any other component.",
      title: "CTO, Acme Corp",
    },
  ],
  socialLinks: [
    { platform: "GitHub", url: "https://github.com/acme" },
    { platform: "X", url: "https://x.com/acme" },
  ],
  subheadline:
    "New open-source library makes generating professional PDFs in React effortless",
};

const pressReleaseStyles = (theme: PdfcnTheme) =>
  StyleSheet.create({
    columnHeading: {
      fontSize: 9,
      fontWeight: "bold",
      marginBottom: 2,
    },
    page: {
      backgroundColor: theme.colors.background,
    },
  });

@Component({
  imports: [
    FormeDocument,
    FormePage,
    FormeView,
    PdfImage,
    PdfPageFooter,
    PdfPageHeader,
    PdfSection,
    PdfText,
  ],
  selector: "pdf-press-release-content",
  template: `
    @let data = this.data();
    <forme-document [title]="'Press Release — ' + data.companyName">
      <forme-page
        size="A4"
        [margin]="{ bottom: 25, left: 56, right: 56, top: 56 }"
      >
        <pdf-page-footer
          [leftText]="data.address ?? data.companyName"
          [rightText]="footerRightText()"
          sticky
          [pagePadding]="25"
        />
        <forme-view [style]="styles().page">
          <ng-template #logo>
            <pdf-image [src]="data.companyLogo!" [style]="{ margin: 0 }" />
          </ng-template>
          <pdf-page-header
            variant="logo-left"
            [logo]="data.companyLogo ? logo : undefined"
            [title]="data.companyName"
            [rightText]="data.date"
            [style]="{ marginBottom: 0 }"
          />
          <pdf-section spacing="none">
            <pdf-text
              variant="xs"
              weight="bold"
              transform="uppercase"
              [color]="data.accentColor ?? 'mutedForeground'"
              noMargin
              >For Immediate Release</pdf-text
            >
            <pdf-text variant="2xl" weight="bold" noMargin>{{
              data.headline
            }}</pdf-text>
            @if (data.subheadline) {
              <pdf-text variant="lg" color="mutedForeground" noMargin>{{
                data.subheadline
              }}</pdf-text>
            }
          </pdf-section>
          <pdf-section spacing="sm">
            <pdf-text
              variant="sm"
              weight="semibold"
              transform="uppercase"
              noMargin
              >{{
                data.dateline.city +
                  ", " +
                  data.dateline.state +
                  " — " +
                  data.date
              }}</pdf-text
            >
            @for (paragraph of data.body; track $index) {
              <pdf-text variant="sm">{{ paragraph }}</pdf-text>
            }
          </pdf-section>
          @for (quote of data.quotes ?? []; track quote.author) {
            <pdf-section
              spacing="sm"
              variant="callout"
              [accentColor]="data.accentColor"
            >
              <pdf-text variant="base" italic noMargin>{{
                "“" + quote.text + "”"
              }}</pdf-text>
              <pdf-text variant="xs" color="mutedForeground" noMargin>{{
                "— " + quote.author + ", " + quote.title
              }}</pdf-text>
            </pdf-section>
          }
          <pdf-section spacing="sm">
            <pdf-text
              [style]="styles().columnHeading"
              color="mutedForeground"
              transform="uppercase"
              noMargin
              >{{ "About " + data.companyName }}</pdf-text
            >
            <pdf-text variant="sm" noMargin>{{ data.boilerplate }}</pdf-text>
          </pdf-section>
          <pdf-section spacing="none">
            <pdf-text
              [style]="styles().columnHeading"
              color="mutedForeground"
              transform="uppercase"
              noMargin
              >Media Contact</pdf-text
            >
            <pdf-text noMargin variant="xs">{{
              data.mediaContact.name
            }}</pdf-text>
            <pdf-text noMargin variant="xs">{{
              data.mediaContact.email
            }}</pdf-text>
            <pdf-text noMargin variant="xs">{{
              data.mediaContact.phone
            }}</pdf-text>
            @if (data.mediaContact.website) {
              <pdf-text noMargin variant="xs">{{
                data.mediaContact.website
              }}</pdf-text>
            }
          </pdf-section>
          <pdf-text align="center" variant="sm" weight="medium" noMargin
            >###</pdf-text
          >
        </forme-view>
      </forme-page>
    </forme-document>
  `,
})
export class PressReleaseContent {
  readonly data = input.required<PressReleaseProps>();

  private readonly theme = injectPdfcnTheme();

  protected readonly styles = computed(() => pressReleaseStyles(this.theme()));

  protected readonly footerRightText = computed(() => {
    const data = this.data();
    return data.socialLinks?.length
      ? data.socialLinks.map((link) => link.platform).join(" · ")
      : undefined;
  });
}

@Component({
  imports: [PdfcnThemeProvider, PressReleaseContent],
  selector: "pdf-press-release",
  template: `
    <pdf-theme-provider [theme]="theme()">
      <pdf-press-release-content [data]="mergedData()" />
    </pdf-theme-provider>
  `,
})
export class PressReleaseDocument {
  readonly theme = input<PdfcnTheme>();
  readonly data = input<Partial<PressReleaseProps>>();

  protected readonly mergedData = computed(
    (): PressReleaseProps => ({ ...sampleData, ...this.data() })
  );
}
