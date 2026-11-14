import { NgTemplateOutlet } from "@angular/common";
import { Component, computed, input } from "@angular/core";

import { injectPdfcnTheme } from "@/registry/bases/takumi/components/theme-provider";
import {
  StyleSheet,
  TakumiText,
  TakumiView,
} from "@/registry/bases/takumi/lib/pdf-primitives";
import type { Style } from "@/registry/bases/takumi/lib/pdf-primitives";
import type { PdfcnTheme } from "@/registry/types/pdf-themes";

export type SignatureVariant = "single" | "double" | "inline";

/**
 * Signature signer properties.
 * Props - `label` | `name` | `title` | `date`
 * @see {@link SignatureSigner}
 */
export interface SignatureSigner {
  label?: string;
  name?: string;
  title?: string;
  date?: string;
}

/**
 * Signature block properties.
 * Props - `variant` | `label` | `name` | `title` | `date` | `signers` | `style`
 * @see {@link PdfSignatureBlockProps}
 */
export interface PdfSignatureBlockProps {
  /**
   * Layout variant: [single, double, inline]
   * @default 'single'
   */
  variant?: SignatureVariant;
  label?: string;
  name?: string;
  title?: string;
  date?: string;
  signers?: [SignatureSigner, SignatureSigner];
  style?: Style;
}

const createSignatureStyles = (t: PdfcnTheme) => {
  const { spacing, fontWeights, typography } = t.primitives;
  return StyleSheet.create({
    block: { flex: 1, minWidth: 140 },
    container: {
      marginBottom: t.spacing.componentGap,
      marginTop: t.spacing.sectionGap,
    },
    dateText: {
      color: t.colors.mutedForeground,
      fontFamily: t.typography.body.fontFamily,
      fontSize: typography.xs,
      marginTop: 1,
    },
    doubleRow: {
      flexDirection: "row",
      gap: spacing[8],
      justifyContent: "space-between",
    },
    inlineLabel: {
      color: t.colors.mutedForeground,
      fontFamily: t.typography.body.fontFamily,
      fontSize: typography.sm,
    },
    inlineLine: {
      borderBottomColor: t.colors.foreground,
      borderBottomStyle: "solid",
      borderBottomWidth: 1,
      height: spacing[5],
      minWidth: 120,
      paddingHorizontal: spacing[2],
    },
    inlineName: {
      color: t.colors.foreground,
      fontFamily: t.typography.body.fontFamily,
      fontSize: t.typography.body.fontSize,
    },
    inlineRow: {
      alignItems: "center",
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing[3],
    },
    label: {
      color: t.colors.mutedForeground,
      fontFamily: t.typography.body.fontFamily,
      fontSize: typography.sm,
      marginBottom: spacing[1],
    },
    line: {
      borderBottomColor: t.colors.foreground,
      borderBottomStyle: "solid",
      borderBottomWidth: 1,
      marginBottom: spacing[1],
      minHeight: spacing[6],
    },
    name: {
      color: t.colors.foreground,
      fontFamily: t.typography.body.fontFamily,
      fontSize: t.typography.body.fontSize,
      fontWeight: fontWeights.semibold,
    },
    titleText: {
      color: t.colors.mutedForeground,
      fontFamily: t.typography.body.fontFamily,
      fontSize: typography.sm,
    },
  });
};

const signatureLayout = (
  theme: PdfcnTheme,
  {
    variant = "single",
    label = "Signature",
    name,
    title,
    date,
    signers,
    style,
  }: PdfSignatureBlockProps
) => {
  const styles = createSignatureStyles(theme);
  const containerStyles: Style[] = [styles.container];
  if (style) {
    containerStyles.push(style);
  }
  const container = [{ breakInside: "avoid" as const }, containerStyles]
    .flat()
    .filter(Boolean);

  if (variant === "inline") {
    return { container, inlineLabel: `${label}:`, signers: [], styles };
  }

  if (variant === "double") {
    const [first, second] = signers ?? [
      { date: "", label: "Authorized by", name: "", title: "" },
      { date: "", label: "Approved by", name: "", title: "" },
    ];
    return { container, signers: [first, second], styles };
  }

  return { container, signers: [{ date, label, name, title }], styles };
};

@Component({
  imports: [TakumiText, TakumiView, NgTemplateOutlet],
  selector: "pdf-signature-block",
  template: `
    @let l = layout();
    @let s = l.styles;
    <takumi-view [style]="l.container">
      @switch (variant()) {
        @case ("inline") {
          <takumi-view [style]="s.inlineRow">
            <takumi-text [style]="s.inlineLabel">{{
              l.inlineLabel
            }}</takumi-text>
            <takumi-view [style]="s.inlineLine" />
            @if (name()) {
              <takumi-text [style]="s.inlineName">{{ name() }}</takumi-text>
            }
          </takumi-view>
        }
        @case ("double") {
          <takumi-view [style]="s.doubleRow">
            @for (signer of l.signers; track $index) {
              <ng-container
                *ngTemplateOutlet="signerBlock; context: { $implicit: signer }"
              />
            }
          </takumi-view>
        }
        @default {
          <ng-container
            *ngTemplateOutlet="
              signerBlock;
              context: { $implicit: l.signers[0] }
            "
          />
        }
      }
    </takumi-view>
    <ng-template #signerBlock let-signer>
      <takumi-view [style]="s.block">
        @if (signer.label) {
          <takumi-text [style]="s.label">{{ signer.label }}</takumi-text>
        }
        <takumi-view [style]="s.line" />
        @if (signer.name) {
          <takumi-text [style]="s.name">{{ signer.name }}</takumi-text>
        }
        @if (signer.title) {
          <takumi-text [style]="s.titleText">{{ signer.title }}</takumi-text>
        }
        @if (signer.date) {
          <takumi-text [style]="s.dateText">{{ signer.date }}</takumi-text>
        }
      </takumi-view>
    </ng-template>
  `,
})
export class PdfSignatureBlock {
  readonly variant = input<SignatureVariant>("single");
  readonly label = input("Signature");
  readonly name = input<string>();
  readonly title = input<string>();
  readonly date = input<string>();
  readonly signers = input<[SignatureSigner, SignatureSigner]>();
  readonly style = input<PdfSignatureBlockProps["style"]>();

  private readonly theme = injectPdfcnTheme();
  protected readonly layout = computed(() =>
    signatureLayout(this.theme(), {
      date: this.date(),
      label: this.label(),
      name: this.name(),
      signers: this.signers(),
      style: this.style(),
      title: this.title(),
      variant: this.variant(),
    })
  );
}
