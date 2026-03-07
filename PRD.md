## 1. Project Overview

The **Anonymous Campus Network** is a real-time web application allowing students to communicate in interest-based rooms without revealing their real identities. The goal is to maximize campus engagement by removing social barriers.

## 2. Target Audience

* University students seeking academic help.
* Students looking for social connection without the "identity fatigue" of standard social media.
* Niche campus interest groups (coding, gaming, venting).

---

## 3. Functional Requirements

### 3.1 Anonymous User Management

* **Requirement:** Users must be able to enter the app using only a unique username and password.
* **Acceptance Criteria:**
* System does NOT ask for email or phone number.
* Usernames must be unique across the database.
* Passwords must be hashed (Bcrypt) before storage.
* JWT (JSON Web Token) is used to maintain the session.



### 3.2 Room & Server System

* **Requirement:** A categorized list of chat rooms that users can join or create.
* **Acceptance Criteria:**
* Users can view a global list of active rooms.
* Users can create a room with a Title, Description, and Topic.
* Room data must persist in MongoDB.



### 3.3 Real-Time Messaging

* **Requirement:** Instant message delivery within rooms.
* **Acceptance Criteria:**
* Messages must appear for all users in a room without a page refresh.
* Messages must show the sender's anonymous alias and a timestamp.
* Chat history (last 50 messages) must load when a user joins a room.



---

## 4. Technical Requirements & Constraints

### 4.1 Scalability & Database

* **Database:** MongoDB Atlas (NoSQL).
* **Isolation:** Use separate database names in the connection string for different prototypes (e.g., `campus_v1`, `campus_v2`).
* **Concurrency:** Socket.IO must handle multiple users sending messages simultaneously without lag.

### 4.2 Security

* **Data Privacy:** No PII (Personally Identifiable Information) stored.
* **Auth:** Protected routes in React that redirect unauthenticated users to the Login page.
* **Sanitization:** Basic protection against XSS in the chat input.

---

## 5. User Flow

1. **Entry:** User arrives at Landing Page  clicks "Get Started."
2. **Identity:** User creates an anonymous handle or logs in.
3. **Discovery:** User lands on Dashboard  browses rooms  clicks "Join."
4. **Interaction:** User enters Chat Room  reads history  sends real-time messages.
5. **Exit:** User leaves room or logs out (clearing session).

---

## 6. Success Criteria (MVP)

* [ ] Successful login/signup without email.
* [ ] Users can create a room and see it appear on the dashboard.
* [ ] Two different browsers can chat with each other in the same room in real-time.
* [ ] Refreshing the page does not lose the chat history.

---

## 7. Future Scope (V2)

* **File Sharing:** Sharing PDFs or images for study groups.
* **Moderation:** "Report" button for toxic behavior.
* **Notifications:** Browser alerts when someone mentions your username.
