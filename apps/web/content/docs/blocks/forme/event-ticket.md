---
title: "Event Ticket"
description: "Print-ready event admission ticket with event details, seat info, QR code scan-in area, and branding strip."
---

::preview{base="forme" name="event-ticket"}

## Installation

::installation{base="forme" name="event-ticket"}

## Usage

::example{base="forme" name="event-ticket"}

### With a pre-rendered QR image

Provide `qrCodeUrl` to render an image instead of the generated QR code:

```angular-ts
import { Component } from "@angular/core";

import { EventTicketDocument } from "@/components/pdf/blocks/event-ticket/event-ticket";
import type { EventTicketData } from "@/components/pdf/blocks/event-ticket/event-ticket.types";

@Component({
  imports: [EventTicketDocument],
  template: `<pdf-event-ticket [data]="data" />`,
})
export class Ticket {
  protected readonly data: EventTicketData = {
    // ...
    ticketNumber: "TKT-00142",
    qrCodeUrl: "https://example.com/qr/TKT-00142.png",
  };
}
```

## Inputs

| Input   | Type              | Description                                                                      |
| ------- | ----------------- | -------------------------------------------------------------------------------- |
| `data`  | `EventTicketData` | Ticket content: event, venue, times, seat, ticket type/number, and footer fields |
| `theme` | `PdfcnTheme`      | Optional theme override                                                          |
