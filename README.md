# PBMP Generic Component Prototype (Add Two Numbers)

This project is a working prototype for the PBMP generic component architecture using:

- React
- TypeScript
- Vite
- Tailwind CSS
- TanStack Query
- Blockly

## Run locally

```bash
npm install
npm run dev
```

The Vite dev server is configured on `http://127.0.0.1:43123`.

Build/type-check:

```bash
npm run build
```

## What this prototype demonstrates

### 1) One generic component definition

The Add Two Numbers implementation is modeled as a PBMP component definition with:

- **WHAT**: component identity, owner, classification, inputs, outputs
- **WHY**: intention + enabled process
- **HOW**: structure + behavior

### 2) Process is separate from component

The `Addition Process` is modeled independently and related via explicit relationship objects.

### 3) Canonical logic model independent from Blockly

Logic authoring supports two synchronized views:

- Formula view (`Result = Number1 + Number2`)
- Blockly view (visual blocks)

Both map through a canonical **PBMP Logic Model** and execution uses that canonical model.

### 4) Capability configuration

The prototype includes configurable:

- Roles
- Role/channel access rules
- Channels (with hierarchy/state/access/availability)
- Output sets by role/channel
- Messaging
- Content structure
- Format
- Form structure and style
- Media classification hierarchy

### 5) Channel-specific UI/UX with shared business logic

Desktop and mobile forms are separate form definitions, but both execute the same logic model.
The architecture is front-end modular and compatible with future Capacitor packaging.

### 6) JSON persistence split by concern

Saved separately in localStorage:

- Component definition
- Logic definition
- Blockly workspace state
- Role access configuration
- Channel configuration
- Form configuration

## Important architecture separation in code

- Business logic is separate from UI rendering.
- Component semantics are separate from Blockly editor state.
- Channel is separate from Form/UI.
- Messaging is separate from transport package.
- Content, structure, and format are separate objects.
- Relationship objects are explicit and typed.

## Key folders

- `src/domain/pbmp/types.ts` – generic PBMP interfaces
- `src/domain/pbmp/sampleData.ts` – AddTwoNumbers definition + relationships/capabilities
- `src/domain/logic/formula.ts` – formula parser/serializer
- `src/domain/logic/blocklyAdapter.ts` – Blockly <-> PBMP logic mapping
- `src/domain/logic/evaluator.ts` – logic execution engine
- `src/services/storage.ts` – local persistence
- `src/components/*` – tab panels, logic editors, runtime execution, JSON inspector
