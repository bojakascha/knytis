# Knytis

Simple PWA web app for planning a get-together where people can see what food and drinks others are bringing.

## Goal

Make it easy for a group to coordinate who brings what without requiring a complicated signup flow.

## Suggested Stack

- Frontend: React
- Backend: Firebase
- Database: Firestore
- Hosting: Firebase Hosting
- Optional: Firebase Cloud Functions for validation or cleanup jobs

## Core User Flow

1. A host creates an occasion.
2. The app generates a short occasion code.
3. A guest joins using the code and enters their name.
4. The guest adds one or more items they plan to bring.
5. Everyone in the occasion can see the shared list of people and items.
6. Anyone can add anonymous suggestions for missing items.
7. The list can be sorted by person or by item.

## Main Features

- Occasion identified by a shareable code
- Guest name entry with low-friction join flow
- Add, edit, and remove items a guest will bring
- Shared live view of all attendees and contributions
- Anonymous item suggestions
- Simple table or list UI with sorting
- Mobile-friendly layout and installable PWA behavior

## General App Structure

### Frontend Structure

Use a feature-based React structure so the app stays easy to grow:

```text
src/
  app/
    router/
    providers/
  components/
    common/
    layout/
  features/
    occasion/
      components/
      hooks/
      services/
    participants/
      components/
      services/
    items/
      components/
      services/
    suggestions/
      components/
      services/
  pages/
    HomePage
    JoinPage
    OccasionPage
    NotFoundPage
  lib/
    firebase/
    utils/
  styles/
  types/
```

### Backend Structure

Firebase can stay simple at first:

- Firestore for occasions, participants, items, and suggestions
- Firebase Hosting for the web app
- Security Rules to ensure users can only access valid occasion data
- Optional Cloud Functions for occasion code generation, cleanup, or rate limiting

## Suggested Data Model

### `occasions`

Each occasion stores:

- `code`
- `title`
- `createdAt`
- `createdBy`
- `status`

### `participants`

Each participant stores:

- `name`
- `joinedAt`
- `occasionId`

### `items`

Each item stores:

- `participantId`
- `occasionId`
- `name`
- `category`
- `quantity`
- `notes`

### `suggestions`

Each suggestion stores:

- `occasionId`
- `text`
- `createdAt`

## Screen Plan

### Home Page

- Short explanation of the app
- Create occasion button
- Join occasion form

### Join/Create Flow

- Enter or generate occasion code
- Enter user name
- Continue into the shared occasion page

### Occasion Page

- Occasion title/code
- Participant list
- Items table or grouped list
- Add item form
- Anonymous suggestions section
- Sorting controls

## Implementation Plan

### Phase 1: Foundation

- Set up React app and Firebase project
- Configure Firestore and Hosting
- Add basic routing
- Create the base UI layout

### Phase 2: Occasion Creation and Join Flow

- Create occasion records
- Generate/share occasion codes
- Let users join with name + code
- Persist active occasion state locally

### Phase 3: Shared Contribution List

- Add participants to an occasion
- Create, edit, and delete contributed items
- Show live updates for all connected users
- Add sorting by user and item

### Phase 4: Suggestions

- Add anonymous suggestion input
- Display suggestions on the occasion page
- Decide whether suggestions can be marked as fulfilled

### Phase 5: PWA and Polish

- Add installable PWA support
- Improve mobile responsiveness
- Add loading, empty, and error states
- Improve accessibility and visual clarity

### Phase 6: Hardening

- Add Firebase Security Rules
- Validate occasion access and writes
- Add basic tests for core flows
- Add cleanup strategy for old occasions

## MVP Definition

The first usable version should include:

- Occasion creation
- Join by code
- Enter name
- Add and view items
- Shared real-time list
- Basic anonymous suggestions

## Nice-to-Have Later

- Categories for food, drinks, desserts, and supplies
- Claiming a suggested item
- Copy/share invite link
- Host controls
- Duplicate occasion for recurring events
- Push notifications or reminders

## Open Decisions

- Should occasions expire automatically after the event?
- Should users be able to edit only their own items?
- Should a host role exist, or should everything be collaborative?
- Should item suggestions be plain text or structured items?
- Is anonymous participation enough, or is lightweight auth needed later?
