# Project Overview — CampusWhisper

Why this project exists
- College students need a low‑friction, campus‑scoped place to ask questions, find peers, and share resources without identity or reputation pressure.
- Public social platforms and forums tie conversations to profiles and permanence, which discourages candid academic help and wellbeing discussion.

What this project does
- Provides anonymous, interest‑based chat rooms (course help, clubs, classifieds, support) scoped to a campus community.
- Real‑time messaging with Socket.io, lightweight account model (randomized display name + password), and room creation/discovery.
- Stores minimal metadata for basic history while prioritizing immediacy and low onboarding friction.

Key features (MVP)
- Create / join rooms, send/receive real‑time messages, basic user/room persistence, and simple moderation hooks.
- Frontend UI scaffold (React + Tailwind) and a Node/Express + MongoDB backend with Socket.io for realtime.

Intended scope
- Hackathon MVP: ship realtime chat + lightweight auth + room UX first; iterate later on moderation, search, retention, and analytics.

