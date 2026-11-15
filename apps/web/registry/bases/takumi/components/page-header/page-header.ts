import { NgTemplateOutlet } from "@angular/common";
import {
  booleanAttribute,
  Component,
  computed,
  input,
  inject,
  Injector,
} from "@angular/core";
import type { TemplateRef } from "@angular/core";

import { injectPdfcnTheme } from "@/registry/bases/takumi/components/theme-provider";
import {
  StyleSheet,
  TakumiText,
  TakumiView,
} from "@/registry/bases/takumi/lib/pdf-primitives";
import type { Style } from "@/registry/bases/takumi/lib/pdf-primitives";
import { resolveColor } from "@/registry/bases/takumi/lib/resolve-color";
import type { PDFComponentProps } from "@/registry/types/pdf-components";
import type { PdfcnTheme } from "@/registry/types/pdf-themes";

export type PageHeaderVariant =
  | "simple"
  | "centered"
  | "minimal"
  | "branded"
  | "logo-left"
  | "logo-right"
  | "two-column";

/**
 * Header row with layout variants, logo support, and optional fixed positioning.
 * Props - `title` | `subtitle` | `rightText` | `rightSubText` | `variant` | `background` | `titleColor` | `marginBottom` | `address` | `phone` | `email` | `logo` | `fixed` | `noWrap` | `style`
 * @see {@link PageHeaderProps}
 */
export interface PageHeaderProps extends PDFComponentProps {
  title: string;
  subtitle?: string;
  rightText?: string;
  rightSubText?: string;
  /**
   * @default 'simple'
   */
  variant?: PageHeaderVariant;
  background?: string;
  titleColor?: string;
  marginBottom?: number;
  address?: string;
  phone?: string;
  email?: string;
  logo?: TemplateRef<unknown>;
  /**
   * @default false
   */
  fixed?: boolean;
  /**
   * @default true
   */
  noWrap?: boolean;
}

const createPageHeaderStyles = (t: PdfcnTheme) => {
  const { spacing, borderRadius, fontWeights } = t.primitives;
  const c = t.colors;
  const { heading, body } = t.typography;

  return StyleSheet.create({
    brandedContainer: {
      alignItems: "center",
      backgroundColor: c.primary,
      borderRadius: borderRadius.sm,
      display: "flex",
      flexDirection: "column",
      padding: spacing[6],
    },
    centeredContainer: {
      alignItems: "center",
      borderBottomColor: c.border,
      borderBottomStyle: "solid",
      borderBottomWidth: spacing[0.5],
      display: "flex",
      flexDirection: "column",
      paddingBottom: spacing[4],
    },
    contactInfo: {
      color: c.mutedForeground,
      fontFamily: body.fontFamily,
      fontSize: t.primitives.typography.xs,
      marginTop: spacing[0.5],
      textAlign: "right",
    },

    logoContainer: {
      height: 48,
      marginRight: spacing[4],
      width: 48,
    },

    logoContent: {
      display: "flex",
      flex: 1,
      flexDirection: "column",
    },
    logoLeftContainer: {
      alignItems: "center",
      borderBottomColor: c.border,
      borderBottomStyle: "solid",
      borderBottomWidth: spacing[0.5],
      display: "flex",
      flexDirection: "row",
      paddingBottom: spacing[4],
    },
    logoRightContainer: {
      alignItems: "center",
      borderBottomColor: c.border,
      borderBottomStyle: "solid",
      borderBottomWidth: spacing[0.5],
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      paddingBottom: spacing[4],
    },

    logoRightContent: {
      display: "flex",
      flex: 1,
      flexDirection: "column",
    },

    logoRightLogoContainer: {
      height: 48,
      marginLeft: spacing[4],
      width: 48,
    },
    minimalContainer: {
      alignItems: "center",
      borderBottomColor: c.primary,
      borderBottomStyle: "solid",
      borderBottomWidth: spacing[1],
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      paddingBottom: spacing[3],
    },
    minimalLeft: {
      flex: 1,
    },
    minimalRight: {
      alignItems: "flex-end",
    },

    rightSubText: {
      color: c.mutedForeground,
      fontFamily: body.fontFamily,
      fontSize: t.primitives.typography.xs,
      marginTop: spacing[1],
      textAlign: "right",
    },
    rightText: {
      color: c.foreground,
      fontFamily: body.fontFamily,
      fontSize: body.fontSize,
      fontWeight: fontWeights.medium,
      textAlign: "right",
    },
    simpleContainer: {
      alignItems: "flex-start",
      borderBottomColor: c.border,
      borderBottomStyle: "solid",
      borderBottomWidth: spacing[0.5],
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      paddingBottom: spacing[4],
    },

    simpleLeft: {
      display: "flex",
      flex: 1,
      flexDirection: "column",
    },
    simpleRight: {
      alignItems: "flex-end",
      display: "flex",
      flexDirection: "column",
    },

    subtitle: {
      color: c.mutedForeground,
      fontFamily: body.fontFamily,
      fontSize: body.fontSize,
      lineHeight: body.lineHeight,
      marginTop: spacing[1],
    },
    subtitleBranded: {
      color: c.primaryForeground,
      marginTop: spacing[1],
    },
    subtitleCentered: {
      textAlign: "center",
    },

    title: {
      color: c.foreground,
      fontFamily: heading.fontFamily,
      fontSize: heading.fontSize.h3,
      fontWeight: fontWeights.bold,
      lineHeight: heading.lineHeight,
      marginBottom: 0,
    },
    titleBranded: {
      color: c.primaryForeground,
    },
    titleCentered: {
      textAlign: "center",
    },

    titleMinimal: {
      fontSize: heading.fontSize.h3,
      fontWeight: fontWeights.bold,
    },
    twoColumnContainer: {
      alignItems: "flex-start",
      borderBottomColor: c.border,
      borderBottomStyle: "solid",
      borderBottomWidth: spacing[0.5],
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      paddingBottom: spacing[4],
    },
    twoColumnLeft: {
      display: "flex",
      flex: 1,
      flexDirection: "column",
    },
    twoColumnRight: {
      alignItems: "flex-end",
      display: "flex",
      flexDirection: "column",
    },
  });
};

const buildContainerStyles = (
  base: Style,
  mb: number,
  background: string | undefined,
  theme: PdfcnTheme,
  style: Style | undefined,
  ...extras: Style[]
): Style[] => {
  const result: Style[] = [base, { marginBottom: mb }, ...extras];
  if (background) {
    result.push({ backgroundColor: resolveColor(background, theme.colors) });
  }
  if (style) {
    result.push(style);
  }
  return result;
};

const buildTitleStyles = (
  base: Style[],
  titleColor: string | undefined,
  theme: PdfcnTheme
): Style[] => {
  if (!titleColor) {
    return base;
  }
  return [...base, { color: resolveColor(titleColor, theme.colors) }];
};

/** Container and title styles of each variant. */
const pageHeaderStyles = (
  theme: PdfcnTheme,
  {
    variant = "simple",
    background,
    titleColor,
    marginBottom,
    style,
  }: Omit<PageHeaderProps, "title">
) => {
  const styles = createPageHeaderStyles(theme);
  const mb = marginBottom ?? theme.spacing.sectionGap;

  const variantRenderers: Record<
    PageHeaderVariant,
    () => { container: Style[]; title: Style[] }
  > = {
    branded: () => ({
      container: buildContainerStyles(
        styles.brandedContainer,
        mb,
        background,
        theme,
        style
      ),
      title: buildTitleStyles(
        [styles.title, styles.titleBranded, styles.titleCentered],
        titleColor,
        theme
      ),
    }),
    centered: () => ({
      container: buildContainerStyles(
        styles.centeredContainer,
        mb,
        background,
        theme,
        style
      ),
      title: buildTitleStyles(
        [styles.title, styles.titleCentered],
        titleColor,
        theme
      ),
    }),
    "logo-left": () => ({
      container: buildContainerStyles(
        styles.logoLeftContainer,
        mb,
        background,
        theme,
        style
      ),
      title: buildTitleStyles([styles.title], titleColor, theme),
    }),
    "logo-right": () => ({
      container: buildContainerStyles(
        styles.logoRightContainer,
        mb,
        background,
        theme,
        style
      ),
      title: buildTitleStyles([styles.title], titleColor, theme),
    }),
    minimal: () => ({
      container: buildContainerStyles(
        styles.minimalContainer,
        mb,
        background,
        theme,
        style
      ),
      title: buildTitleStyles(
        [styles.title, styles.titleMinimal],
        titleColor,
        theme
      ),
    }),
    simple: () => ({
      container: buildContainerStyles(
        styles.simpleContainer,
        mb,
        background,
        theme,
        style
      ),
      title: buildTitleStyles([styles.title], titleColor, theme),
    }),
    "two-column": () => ({
      container: buildContainerStyles(
        styles.twoColumnContainer,
        mb,
        background,
        theme,
        style
      ),
      title: buildTitleStyles([styles.title], titleColor, theme),
    }),
  };

  return { ...variantRenderers[variant](), styles };
};

@Component({
  imports: [TakumiText, TakumiView, NgTemplateOutlet],
  selector: "pdf-page-header",
  template: `
    <ng-container *ngTemplateOutlet="header" />
    <ng-template #header>
      @let s = layout().styles;
      <takumi-view [wrap]="!noWrap()" [style]="layout().container">
        @switch (variant()) {
          @case ("branded") {
            <takumi-text [style]="layout().title">{{ title() }}</takumi-text>
            @if (subtitle()) {
              <takumi-text [style]="[s.subtitle, s.subtitleBranded]">{{
                subtitle()
              }}</takumi-text>
            }
          }
          @case ("centered") {
            <takumi-text [style]="layout().title">{{ title() }}</takumi-text>
            @if (subtitle()) {
              <takumi-text [style]="[s.subtitle, s.subtitleCentered]">{{
                subtitle()
              }}</takumi-text>
            }
          }
          @case ("logo-right") {
            <takumi-view [style]="s.logoRightContent">
              <ng-container *ngTemplateOutlet="titleBlock" />
            </takumi-view>
            @if (logo(); as logo) {
              <takumi-view [style]="s.logoRightLogoContainer"
                ><ng-container *ngTemplateOutlet="logo; injector: injector"
              /></takumi-view>
            }
          }
          @case ("logo-left") {
            @if (logo(); as logo) {
              <takumi-view [style]="s.logoContainer"
                ><ng-container *ngTemplateOutlet="logo; injector: injector"
              /></takumi-view>
            }
            <takumi-view [style]="s.logoContent">
              <ng-container *ngTemplateOutlet="titleBlock" />
            </takumi-view>
            <ng-container
              *ngTemplateOutlet="right; context: { $implicit: s.simpleRight }"
            />
          }
          @case ("two-column") {
            <takumi-view [style]="s.twoColumnLeft">
              <ng-container *ngTemplateOutlet="titleBlock" />
            </takumi-view>
            @if (address() || phone() || email()) {
              <takumi-view [style]="s.twoColumnRight">
                @if (address()) {
                  <takumi-text [style]="s.contactInfo">{{
                    address()
                  }}</takumi-text>
                }
                @if (phone()) {
                  <takumi-text [style]="s.contactInfo">{{
                    phone()
                  }}</takumi-text>
                }
                @if (email()) {
                  <takumi-text [style]="s.contactInfo">{{
                    email()
                  }}</takumi-text>
                }
              </takumi-view>
            }
          }
          @case ("minimal") {
            <takumi-view [style]="s.minimalLeft">
              <ng-container *ngTemplateOutlet="titleBlock" />
            </takumi-view>
            <ng-container
              *ngTemplateOutlet="right; context: { $implicit: s.minimalRight }"
            />
          }
          @default {
            <takumi-view [style]="s.simpleLeft">
              <ng-container *ngTemplateOutlet="titleBlock" />
            </takumi-view>
            <ng-container
              *ngTemplateOutlet="right; context: { $implicit: s.simpleRight }"
            />
          }
        }
      </takumi-view>
      <ng-template #titleBlock>
        <takumi-text [style]="layout().title">{{ title() }}</takumi-text>
        @if (subtitle()) {
          <takumi-text [style]="s.subtitle">{{ subtitle() }}</takumi-text>
        }
      </ng-template>
      <ng-template #right let-containerStyle>
        @if (rightText() || rightSubText()) {
          <takumi-view [style]="containerStyle">
            @if (rightText()) {
              <takumi-text [style]="s.rightText">{{ rightText() }}</takumi-text>
            }
            @if (rightSubText()) {
              <takumi-text [style]="s.rightSubText">{{
                rightSubText()
              }}</takumi-text>
            }
          </takumi-view>
        }
      </ng-template>
    </ng-template>
  `,
})
export class PdfPageHeader {
  /** Templates passed in resolve the theme from where they render, as React context did. */
  protected readonly injector = inject(Injector);
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  readonly rightText = input<string>();
  readonly rightSubText = input<string>();
  readonly variant = input<PageHeaderVariant>("simple");
  readonly background = input<string>();
  readonly titleColor = input<string>();
  readonly marginBottom = input<number>();
  readonly address = input<string>();
  readonly phone = input<string>();
  readonly email = input<string>();
  readonly logo = input<TemplateRef<unknown>>();
  /** Part of the props API but unused, as in the original. */
  readonly fixed = input(false, { transform: booleanAttribute });
  readonly noWrap = input(true, { transform: booleanAttribute });
  readonly style = input<PageHeaderProps["style"]>();

  private readonly theme = injectPdfcnTheme();
  protected readonly layout = computed(() =>
    pageHeaderStyles(this.theme(), {
      background: this.background(),
      marginBottom: this.marginBottom(),
      style: this.style(),
      titleColor: this.titleColor(),
      variant: this.variant(),
    })
  );
}
