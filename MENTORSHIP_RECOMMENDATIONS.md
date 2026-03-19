# Mentorship Recommendations

## Product Direction

Implement a request-gated mentorship experience so users can safely discover mentors, request support, and only unlock direct communication after acceptance.

## Recommended User Flow

1. Mentor directory shows only users with `role = mentor` and `isAcceptingMentees = true`.
2. User taps a mentor to view profile details (bio, expertise, languages, response time, availability, ratings).
3. User sends a mentorship request with goals and a short intro note.
4. Chat and call actions stay locked while request status is `pending`.
5. When mentor accepts, in-app chat unlocks.
6. Calls are scheduled in-app first (`Schedule Call`) before adding instant call.

## Role-Based Access

- Mentee-side:
  - Discover mentors
  - Send and track requests
  - Chat only with accepted mentors
  - Schedule calls with accepted mentors
- Mentor-side:
  - Review incoming requests
  - Accept/decline requests
  - Manage active mentees
  - Manage availability

## Safety and Trust Controls (Must-Have)

- Block/report mentor or mentee
- Request cooldown and anti-spam limits
- No direct personal phone number exposure
- Clear request status (`none`, `pending`, `accepted`, `declined`)
- Basic moderation hooks for chat/call abuse reports

## Implementation Started

Phase 1 in-app implementation should prioritize:

1. Mentor list filtering and mentor profile screen
2. Request mentorship flow with status state
3. Request-gated chat screen
4. Accepted-only call scheduling screen
