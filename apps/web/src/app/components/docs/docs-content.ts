import { NgTemplateOutlet } from "@angular/common";
import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { RouterLink } from "@angular/router";

import type { DocNode } from "@/lib/content/types";
import { themePresets } from "@/registry/themes";
import type { ThemePresetName } from "@/registry/themes";
import { BrandIcon } from "@/src/app/components/brand-icon";
import { DocsCodeBlock } from "@/src/app/components/docs/code-block";
import { DocsCodeBlockCommand } from "@/src/app/components/docs/code-block-command";
import { DocsTabs } from "@/src/app/components/docs/docs-tabs";
import { PdfPreview } from "@/src/app/components/pdf-preview";
import {
  ThemePreview,
  ThemePreviewGrid,
} from "@/src/app/components/theme-preview";
import { UiIcon } from "@/src/app/components/ui/icon";

/**
 * Renders compiled docs nodes. Elements render without wrappers, so the reference's
 * sibling selectors (`[&+p]`, `first:`) still match.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "contents" },
  imports: [
    BrandIcon,
    DocsCodeBlock,
    DocsCodeBlockCommand,
    DocsTabs,
    NgTemplateOutlet,
    PdfPreview,
    RouterLink,
    ThemePreview,
    ThemePreviewGrid,
    UiIcon,
  ],
  selector: "docs-content",
  template: `
    <ng-template #list let-nodes>
      @for (node of nodes; track $index) {
        <ng-container
          [ngTemplateOutlet]="item"
          [ngTemplateOutletContext]="{ $implicit: node }"
        />
      }
    </ng-template>

    <ng-template #item let-n>
      @if (isText(n)) {
        <ng-container>{{ n }}</ng-container>
      } @else {
        @switch (n.type) {
          @case ("el") {
            <ng-container
              [ngTemplateOutlet]="element"
              [ngTemplateOutletContext]="{ $implicit: n }"
            />
          }
          @case ("code") {
            <docs-code-block [block]="n" />
          }
          @case ("command") {
            <docs-code-block-command [block]="n" />
          }
          @case ("tabs") {
            <docs-tabs [block]="n" [content]="list" />
          }
          @case ("icon") {
            @if (n.brand) {
              <svg [brandIcon]="n.brand" [class]="n.class ?? ''"></svg>
            } @else {
              <svg [uiIcon]="n.lucide" [class]="n.class"></svg>
            }
          }
          @case ("preview") {
            <app-pdf-preview
              class="mt-4"
              [base]="n.base"
              [name]="n.name"
              [theme]="themeOf(n.theme)"
            />
          }
          @case ("theme-preview") {
            <app-theme-preview [base]="n.base" />
          }
          @case ("theme-preview-grid") {
            <app-theme-preview-grid />
          }
        }
      }
    </ng-template>

    <ng-template #element let-n>
      @let a = n.attrs ?? {};
      @switch (n.tag) {
        @case ("p") {
          <p [class]="n.class">
            <ng-container
              *ngTemplateOutlet="list; context: { $implicit: n.children }"
            />
          </p>
        }
        @case ("h2") {
          <h2 [class]="n.class" [attr.id]="a.id">
            <ng-container
              *ngTemplateOutlet="list; context: { $implicit: n.children }"
            />
          </h2>
        }
        @case ("h3") {
          <h3 [class]="n.class" [attr.id]="a.id">
            <ng-container
              *ngTemplateOutlet="list; context: { $implicit: n.children }"
            />
          </h3>
        }
        @case ("h4") {
          <h4 [class]="n.class" [attr.id]="a.id">
            <ng-container
              *ngTemplateOutlet="list; context: { $implicit: n.children }"
            />
          </h4>
        }
        @case ("h5") {
          <h5 [class]="n.class" [attr.id]="a.id">
            <ng-container
              *ngTemplateOutlet="list; context: { $implicit: n.children }"
            />
          </h5>
        }
        @case ("h6") {
          <h6 [class]="n.class" [attr.id]="a.id">
            <ng-container
              *ngTemplateOutlet="list; context: { $implicit: n.children }"
            />
          </h6>
        }
        @case ("a") {
          @if (isInternal(a.href)) {
            <a [class]="n.class" [routerLink]="a.href"
              ><ng-container
                *ngTemplateOutlet="list; context: { $implicit: n.children }"
            /></a>
          } @else {
            <a
              [class]="n.class"
              [attr.href]="a.href"
              [attr.target]="isExternal(a.href) ? '_blank' : null"
              [attr.rel]="isExternal(a.href) ? 'noreferrer' : null"
              ><ng-container
                *ngTemplateOutlet="list; context: { $implicit: n.children }"
            /></a>
          }
        }
        @case ("ul") {
          <ul [class]="n.class">
            <ng-container
              *ngTemplateOutlet="list; context: { $implicit: n.children }"
            />
          </ul>
        }
        @case ("ol") {
          <ol [class]="n.class" [attr.start]="a.start">
            <ng-container
              *ngTemplateOutlet="list; context: { $implicit: n.children }"
            />
          </ol>
        }
        @case ("li") {
          <li [class]="n.class">
            <ng-container
              *ngTemplateOutlet="list; context: { $implicit: n.children }"
            />
          </li>
        }
        @case ("code") {
          <code [class]="n.class"
            ><ng-container
              *ngTemplateOutlet="list; context: { $implicit: n.children }"
          /></code>
        }
        @case ("pre") {
          <pre
            [class]="n.class"
          ><ng-container *ngTemplateOutlet="list; context: { $implicit: n.children }" /></pre>
        }
        @case ("strong") {
          <strong [class]="n.class"
            ><ng-container
              *ngTemplateOutlet="list; context: { $implicit: n.children }"
          /></strong>
        }
        @case ("em") {
          <em
            ><ng-container
              *ngTemplateOutlet="list; context: { $implicit: n.children }"
          /></em>
        }
        @case ("del") {
          <del
            ><ng-container
              *ngTemplateOutlet="list; context: { $implicit: n.children }"
          /></del>
        }
        @case ("blockquote") {
          <blockquote [class]="n.class">
            <ng-container
              *ngTemplateOutlet="list; context: { $implicit: n.children }"
            />
          </blockquote>
        }
        @case ("hr") {
          <hr [class]="n.class" />
        }
        @case ("br") {
          <br />
        }
        @case ("img") {
          <img [class]="n.class" [attr.src]="a.src" [attr.alt]="a.alt ?? ''" />
        }
        @case ("table") {
          <table [class]="n.class">
            <ng-container
              *ngTemplateOutlet="list; context: { $implicit: n.children }"
            />
          </table>
        }
        @case ("thead") {
          <thead>
            <ng-container
              *ngTemplateOutlet="list; context: { $implicit: n.children }"
            />
          </thead>
        }
        @case ("tbody") {
          <tbody>
            <ng-container
              *ngTemplateOutlet="list; context: { $implicit: n.children }"
            />
          </tbody>
        }
        @case ("tr") {
          <tr [class]="n.class">
            <ng-container
              *ngTemplateOutlet="list; context: { $implicit: n.children }"
            />
          </tr>
        }
        @case ("th") {
          <th [class]="n.class" [attr.align]="a.align">
            <ng-container
              *ngTemplateOutlet="list; context: { $implicit: n.children }"
            />
          </th>
        }
        @case ("td") {
          <td [class]="n.class" [attr.align]="a.align">
            <ng-container
              *ngTemplateOutlet="list; context: { $implicit: n.children }"
            />
          </td>
        }
        @case ("span") {
          <span [class]="n.class"
            ><ng-container
              *ngTemplateOutlet="list; context: { $implicit: n.children }"
          /></span>
        }
        @default {
          <div [class]="n.class" [attr.data-slot]="a['data-slot']">
            <ng-container
              *ngTemplateOutlet="list; context: { $implicit: n.children }"
            />
          </div>
        }
      }
    </ng-template>

    <ng-container *ngTemplateOutlet="list; context: { $implicit: nodes() }" />
  `,
})
export class DocsContent {
  readonly nodes = input.required<DocNode[]>();

  protected themeOf(name: string | undefined) {
    return name ? themePresets[name as ThemePresetName] : undefined;
  }

  protected isText(node: DocNode): node is string {
    return typeof node === "string";
  }

  protected isExternal(href: string | undefined) {
    return Boolean(href?.match(/^https?:/));
  }

  protected isInternal(href: string | undefined) {
    return (
      Boolean(href?.startsWith("/")) && !href?.match(/\.(txt|md|xml|json)$/)
    );
  }
}
