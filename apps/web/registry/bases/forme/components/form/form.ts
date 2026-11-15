import { NgTemplateOutlet } from "@angular/common";
import { booleanAttribute, Component, computed, input } from "@angular/core";

import { injectPdfcnTheme } from "@/registry/bases/forme/components/theme-provider";
import {
  FormeText,
  FormeView,
} from "@/registry/bases/forme/lib/pdf-primitives";
import type { Style } from "@/registry/bases/forme/lib/pdf-primitives";
import type { PdfcnTheme } from "@/registry/types/pdf-themes";

import { createFormStyles } from "./form.styles";
import type {
  FormLabelPosition,
  FormLayout,
  PdfFormField,
  PdfFormGroup,
  PdfFormProps,
  PdfFormVariant,
} from "./form.types";

const renderFieldAbove = (
  field: PdfFormField,
  idx: number,
  styles: ReturnType<typeof createFormStyles>
) => {
  const areaHeight = field.height ?? 18;
  const areaStyle: Style[] = [styles.fieldArea, { minHeight: areaHeight }];

  return {
    areaStyle,
    field,
    fieldStyle: styles.fieldAbove,
    key: `${field.label}-${idx}`,
    labelStyle: styles.labelAbove,
  };
};

const renderFieldLeft = (
  field: PdfFormField,
  idx: number,
  styles: ReturnType<typeof createFormStyles>
) => {
  const areaHeight = field.height ?? 18;
  const areaStyle: Style[] = [
    styles.fieldArea,
    styles.fieldLeftArea,
    { minHeight: areaHeight },
  ];

  return {
    areaStyle,
    field,
    fieldStyle: styles.fieldLeft,
    key: `${field.label}-${idx}`,
    labelStyle: styles.labelLeft,
  };
};

const renderGroup = (
  group: PdfFormGroup,
  gi: number,
  styles: ReturnType<typeof createFormStyles>,
  labelPosition: "above" | "left"
) => {
  const layout: FormLayout = group.layout ?? "single";
  let cols: number;
  if (layout === "three-column") {
    cols = 3;
  } else if (layout === "two-column") {
    cols = 2;
  } else {
    cols = 1;
  }

  const renderField = (field: PdfFormField, idx: number) =>
    labelPosition === "left"
      ? renderFieldLeft(field, idx, styles)
      : renderFieldAbove(field, idx, styles);

  if (cols === 1) {
    return {
      chunks: null,
      fields: group.fields.map(renderField),
      key: `group-${gi}`,
      title: group.title,
    };
  }

  const chunkSize = Math.ceil(group.fields.length / cols);
  const chunks: PdfFormField[][] = [];
  for (let i = 0; i < group.fields.length; i += chunkSize) {
    chunks.push(group.fields.slice(i, i + chunkSize));
  }
  while (chunks.length < cols) {
    chunks.push([]);
  }

  return {
    chunks: chunks.map((chunk, ci) => ({
      fields: chunk.map(renderField),
      key: `col-${gi}-${chunk[0]?.label ?? ci}`,
    })),
    fields: [],
    key: `group-${gi}`,
    title: group.title,
  };
};

const formLayout = (
  theme: PdfcnTheme,
  {
    groups,
    variant = "underline",
    labelPosition = "above",
    style,
  }: Omit<PdfFormProps, "title" | "subtitle" | "noWrap">
) => {
  const styles = createFormStyles(theme, variant);

  const rootStyles: Style[] = [styles.root];
  if (style) {
    rootStyles.push(style);
  }

  return {
    groups: groups.map((group, gi) =>
      renderGroup(group, gi, styles, labelPosition)
    ),
    root: rootStyles,
    styles,
  };
};

/** Fillable PDF form with grouped fields, layout variants, and label positioning options. */
@Component({
  imports: [FormeText, FormeView, NgTemplateOutlet],
  selector: "pdf-form",
  template: `
    @if (noWrap()) {
      <forme-view [wrap]="false">
        <ng-container *ngTemplateOutlet="inner" />
      </forme-view>
    } @else {
      <ng-container *ngTemplateOutlet="inner" />
    }
    <ng-template #inner>
      @let l = layout();
      @let s = l.styles;
      <forme-view [style]="l.root">
        @if (title()) {
          <forme-text [style]="s.formTitle">{{ title() }}</forme-text>
        }
        @if (subtitle()) {
          <forme-text [style]="s.formSubtitle">{{ subtitle() }}</forme-text>
        }
        @if (title() || subtitle()) {
          <forme-view [style]="s.formDivider" />
        }
        @for (group of l.groups; track group.key) {
          <forme-view [style]="s.group">
            @if (group.title) {
              <forme-text [style]="s.groupTitle">{{ group.title }}</forme-text>
            }
            @if (group.chunks) {
              <forme-view [style]="s.columnsRow">
                @for (chunk of group.chunks; track chunk.key) {
                  <forme-view [style]="s.column">
                    @for (f of chunk.fields; track f.key) {
                      <ng-container
                        *ngTemplateOutlet="field; context: { $implicit: f }"
                      />
                    }
                  </forme-view>
                }
              </forme-view>
            } @else {
              @for (f of group.fields; track f.key) {
                <ng-container
                  *ngTemplateOutlet="field; context: { $implicit: f }"
                />
              }
            }
          </forme-view>
        }
      </forme-view>
    </ng-template>
    <ng-template #field let-f>
      <forme-view [style]="f.fieldStyle">
        <forme-text [style]="f.labelStyle">{{ f.field.label }}</forme-text>
        <forme-view [style]="f.areaStyle">
          @if (f.field.hint) {
            <forme-text [style]="layout().styles.hint">{{
              f.field.hint
            }}</forme-text>
          }
        </forme-view>
      </forme-view>
    </ng-template>
  `,
})
export class PdfForm {
  readonly title = input<string>();
  readonly subtitle = input<string>();
  readonly groups = input.required<PdfFormGroup[]>();
  readonly variant = input<PdfFormVariant>("underline");
  readonly labelPosition = input<FormLabelPosition>("above");
  readonly noWrap = input(false, { transform: booleanAttribute });
  readonly style = input<PdfFormProps["style"]>();

  private readonly theme = injectPdfcnTheme();
  protected readonly layout = computed(() =>
    formLayout(this.theme(), {
      groups: this.groups(),
      labelPosition: this.labelPosition(),
      style: this.style(),
      variant: this.variant(),
    })
  );
}
