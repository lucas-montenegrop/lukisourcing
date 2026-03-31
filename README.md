# LukiSourcing

## 30-Second Elevator Pitch

LukiSourcing is a sourcing workflow platform for fashion teams that need a clearer way to track raw materials from first request to final delivery. Inspired by the structured flow of restaurant reservation and floor-management tools, this app reimagines that same live-status experience for fabrics, trims, dyes, hardware, and supplier communication.

Instead of tracking sourcing across scattered emails, spreadsheets, chat threads, and PDFs, LukiSourcing gives brands and sourcing teams one place to follow each material through its lifecycle: requested, quoted, sampled, approved, ordered, in transit, received, and ready for production.

## Project Vision

Fashion sourcing is often slowed down by fragmented communication and poor visibility. A designer may request a fabric, a supplier may send swatches days later, production may ask for cost confirmation, and logistics may need delivery updates, all in separate tools.

LukiSourcing centralizes that workflow into a dashboard-driven application where each material has a clear status, timeline, owner, supplier history, and action trail.

## Core Problem

Teams need a way to answer questions like:

- Which raw materials are still waiting on supplier quotes?
- Which trims have already been approved for sampling?
- What materials are delayed in transit?
- Which purchase orders are incomplete?
- What is the ETA for fabric needed for the next production run?

LukiSourcing is designed to make those answers visible in real time.

## Core MVP Features

### Material Tracking

- Create and manage raw material records
- Organize materials by category such as fabric, trim, hardware, lining, packaging, or dye lot
- Store reference data including SKU, color, composition, width, minimum order quantity, and target cost

### Workflow Status System

- Track each material through sourcing stages
- Example stages:
  - Requested
  - Supplier Contacted
  - Quote Received
  - Sampling
  - Sample Approved
  - Purchase Order Sent
  - In Production
  - In Transit
  - Received
  - Ready for Use
- Surface status visually with tags, color indicators, and timeline views

### Supplier Management

- Save supplier profiles with contact information
- Associate multiple suppliers to a single material
- Track quotes, lead times, MOQs, and communication history per supplier

### Timeline and ETA Visibility

- Show deadlines and estimated delivery dates
- Highlight overdue sourcing steps
- Help teams understand what materials are blocking development or production

### Notes and Communication Log

- Add sourcing notes to each material
- Keep a record of conversations, approvals, and changes
- Track who updated what and when

### Dashboard Views

- Board view for stage-based workflow
- List view for fast filtering and searching
- Calendar or timeline view for expected arrivals and milestones

## How the Restaurant App Reference Translates

The restaurant images show a system that tracks people through stages like booked, arrived, seated, and done. LukiSourcing applies that same product logic to fashion operations:

- Reservation flow becomes material lifecycle flow
- Guest records become raw material records
- Table assignment becomes supplier and production assignment
- Arrival and seating states become shipment and warehouse states
- Requests and notes become sourcing comments, approvals, and exceptions
- Time-based floor visibility becomes ETA and milestone tracking

That makes the interface especially useful for fast-moving sourcing teams who need operational clarity at a glance.

## Target Users

- Fashion founders
- Apparel designers
- Product developers
- Sourcing managers
- Production coordinators
- Small brands managing supplier relationships manually

## User Stories

- As a designer, I want to see whether a fabric has been approved so I can move to the next sample round.
- As a sourcing manager, I want to compare supplier quotes so I can choose the best option.
- As a production coordinator, I want to know which materials are delayed so I can adjust launch timelines.
- As a team member, I want one shared source of truth so I do not rely on email chains for updates.

## Stretch Features

- File uploads for swatches, spec sheets, purchase orders, and invoices
- AI-assisted categorization of supplier emails or material documents
- Notifications for delays, missing approvals, or approaching ETAs
- Cost comparison dashboard across suppliers
- Inventory handoff once materials are received
- Integration with ERP, PLM, or production planning tools

## Proposed Tech Stack

- Frontend: React
- Backend: Node.js and Express
- Database: PostgreSQL or MongoDB
- Styling: CSS Modules, Tailwind, or styled components
- Authentication: JWT-based auth
- Deployment: Vercel, Render, or Railway

## Possible Data Model

### Materials

- id
- name
- category
- sku
- color
- composition
- unit
- minimum_order_quantity
- target_cost
- current_status
- eta

### Suppliers

- id
- name
- contact_name
- email
- phone
- country
- lead_time

### Material Supplier Quotes

- id
- material_id
- supplier_id
- quoted_cost
- minimum_order_quantity
- lead_time
- notes

### Workflow Events

- id
- material_id
- status
- note
- updated_by
- timestamp

## Example Routes

- `GET /api/materials`
- `POST /api/materials`
- `GET /api/materials/:id`
- `PATCH /api/materials/:id`
- `GET /api/suppliers`
- `POST /api/suppliers`
- `GET /api/workflows/:materialId`
- `POST /api/workflows/:materialId`

## Installation and Setup

```bash
git clone https://github.com/lucas-montenegrop/lukisourcing.git
cd lukisourcing
npm install
npm run dev
```

## Future Direction

LukiSourcing can grow from a sourcing tracker into a larger operational platform for fashion brands, connecting design development, supplier management, production readiness, and logistics in one system.

## Author

Lucas Montenegro
