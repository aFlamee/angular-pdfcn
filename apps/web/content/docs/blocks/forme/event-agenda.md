---
title: "Event Agenda"
description: "Print-ready conference, summit, or meeting agenda template with multi-day support, track legend, and concurrent sessions."
---

::preview{base="forme" name="event-agenda"}

## Installation

::installation{base="forme" name="event-agenda"}

## Usage

::example{base="forme" name="event-agenda"}

## API Reference

### EventAgendaProps

The `data` input of `pdf-event-agenda` takes these fields. It defaults to sample data.

| Field              | Type            | Description                                                     |
| ------------------ | --------------- | --------------------------------------------------------------- |
| `eventName`        | `string`        | The title or name of the event or conference.                   |
| `date`             | `string`        | Start date of the event (e.g. "October 20, 2026").              |
| `endDate`          | `string?`       | Optional end date for multi-day events.                         |
| `venue`            | `string`        | Venue name or physical address.                                 |
| `days`             | `DaySchedule[]` | Array of day schedules, each containing sessions.               |
| `tracks`           | `Track[]?`      | Color-coded conference tracks for the legend and session pills. |
| `wifiInfo`         | `string?`       | Network credentials displayed in the footer.                    |
| `emergencyContact` | `string?`       | Important contact info displayed in the footer.                 |
| `accentColor`      | `string?`       | Accent color for headers, badges, and highlights.               |
