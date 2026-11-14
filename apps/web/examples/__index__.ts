import type { Type } from "@angular/core";

import forme_invoice_classic from "@/examples/forme/invoice-classic";
import forme_table from "@/examples/forme/table";
import forme_text from "@/examples/forme/text";
import takumi_invoice_classic from "@/examples/takumi/invoice-classic";
import takumi_table from "@/examples/takumi/table";
import takumi_text from "@/examples/takumi/text";

export type BaseName = "forme" | "takumi";

export const demos: Record<BaseName, Record<string, Type<unknown>>> = {
  forme: {
    "invoice-classic": forme_invoice_classic,
    table: forme_table,
    text: forme_text,
  },
  takumi: {
    "invoice-classic": takumi_invoice_classic,
    table: takumi_table,
    text: takumi_text,
  },
};
