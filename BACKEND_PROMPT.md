# Campaign Manager Backend — API Requirements

## Context

This is for the Campaign Manager section of SocialJet CRM. The frontend is built and
waiting for these APIs. The backend is FastAPI + DynamoDB. Read the existing codebase
thoroughly before writing anything — many things already exist and must NOT be rebuilt.

---

## SECTION 1 — EXISTING ENDPOINTS (NO CHANGES NEEDED)

These are already built and the frontend will call them directly. Do not touch.

| Frontend calls                      | Backend endpoint                | Notes                                     |
| ----------------------------------- | ------------------------------- | ----------------------------------------- |
| `GET /campaign-leads`               | `GET /leads/?status=closed`     | ✅ works                                  |
| `GET /campaign-leads/{id}`          | `GET /leads/{lead_id}`          | ✅ works                                  |
| `GET /campaign-leads/{id}/timeline` | `GET /leads/{lead_id}/timeline` | ✅ works                                  |
| `GET /influencers`                  | `GET /creators/`                | ✅ works (frontend will use `/creators/`) |
| `GET /influencers/{id}`             | `GET /creators/{creator_id}`    | ✅ works                                  |
| `GET /inbox/{lead_id}`              | `GET /inbox/{lead_id}`          | ✅ works                                  |
| `POST /inbox/{lead_id}/send`        | `POST /inbox/{lead_id}/send`    | ✅ works                                  |
| `GET /leads/{lead_id}/timeline`     | `GET /leads/{lead_id}/timeline` | ✅ works                                  |
| `GET /meetings/lead/{lead_id}`      | `GET /meetings/lead/{lead_id}`  | ✅ works                                  |
| `POST /meetings/instant`            | `POST /meetings/instant`        | ✅ works                                  |

---

## SECTION 2 — EXISTING ENDPOINTS THAT NEED SMALL CHANGES

### 2.1 — `POST /leads/{lead_id}/assign-cm`

Already exists. Just add the campaign manager's full details in the response.

**Current response:**

```json
{ "lead_id": "...", "assigned_cm_id": "..." }
```

**Required response (add this):**

```json
{
  "lead_id": "abc123",
  "assigned_cm_id": "cm456",
  "assigned_cm": {
    "id": "cm456",
    "name": "Sarah Johnson",
    "email": "sarah@socialjet.com",
    "activeLeads": 7
  }
}
```

`activeLeads` = count of leads where `assigned_cm_id == cm456`.

---

### 2.2 — `GET /inbox/` — Add filter for campaign inbox

Add an optional query param `?context=campaign` that filters conversations to only those
where the lead has `status=closed`. Everything else stays the same.

**New query param:**

```
GET /inbox/?context=campaign
```

Returns only conversations where the associated lead has `status=closed`.

Also add `conversation_type` to each conversation object in the response:

```json
{
  "lead_id": "abc123",
  "name": "Rahul Sharma",
  "last_message": "Sounds good!",
  "last_message_at": "2026-04-22T10:30:00Z",
  "unread_count": 2,
  "conversation_type": "client",
  "channel": "whatsapp"
}
```

---

### 2.3 — `GET /onboarding/{lead_id}` — Return array instead of single doc

Currently returns one document. Campaign section needs both onboarding + KOL briefing.
Change response to return an array:

```json
[
  {
    "onboarding_id": "doc1",
    "lead_id": "abc123",
    "doc_type": "onboarding",
    "document": "## Onboarding Document\n...",
    "status": "draft",
    "generated_by": "ai",
    "created_at": "2026-04-20T10:00:00Z",
    "updated_at": "2026-04-20T10:00:00Z"
  },
  {
    "onboarding_id": "doc2",
    "lead_id": "abc123",
    "doc_type": "kol_briefing",
    "document": "## KOL Briefing\n...",
    "status": "draft",
    "generated_by": "ai",
    "created_at": "2026-04-20T10:00:00Z",
    "updated_at": "2026-04-20T10:00:00Z"
  }
]
```

Add `doc_type` field to the `onboarding` DynamoDB table (values: `"onboarding"` | `"kol_briefing"`).
Add `status` field (values: `"draft"` | `"cm_approved"` | `"admin_approved"` | `"sent_to_client"`).
Add `updated_at` field.

---

### 2.4 — `POST /onboarding/generate` — Generate both docs at once

When called, generate BOTH onboarding document AND KOL briefing for the lead and store them.
Update request body:

```json
{
  "lead_id": "abc123",
  "meeting_id": "meet789",
  "notes": "Optional extra context"
}
```

Response: same array format as `GET /onboarding/{lead_id}` above.

---

### 2.5 — New `PATCH /onboarding/{onboarding_id}` — Edit document content

CM needs to edit documents before submission. Add this endpoint:

```json
PATCH /onboarding/{onboarding_id}

Request:
{
  "document": "Updated document content here..."
}

Response:
{
  "onboarding_id": "doc1",
  "lead_id": "abc123",
  "doc_type": "onboarding",
  "document": "Updated document content here...",
  "status": "draft",
  "updated_at": "2026-04-23T09:00:00Z"
}
```

---

### 2.6 — New `POST /onboarding/{onboarding_id}/submit` — Submit to admin

CM submits the document to admin for approval.

```json
POST /onboarding/{onboarding_id}/submit

Request: (no body)

Response:
{
  "onboarding_id": "doc1",
  "status": "cm_approved",
  "submitted_at": "2026-04-23T09:30:00Z"
}
```

Also creates a notification for admin with type `"document_review"`.

---

### 2.7 — New `POST /onboarding/{onboarding_id}/send-to-client` — Send approved doc to client

Admin calls this after approval. Sends doc via email to lead's email.

```json
POST /onboarding/{onboarding_id}/send-to-client

Request: (no body)

Response:
{
  "onboarding_id": "doc1",
  "status": "sent_to_client",
  "sent_at": "2026-04-23T10:00:00Z"
}
```

Changes status to `"sent_to_client"`. Sends email to `lead.email`.

---

### 2.8 — `GET /campaigns/dashboard` — Match frontend stats format

Current response needs these fields. Add/rename as needed:

```json
{
  "totalLeads": 45,
  "activeLeads": 23,
  "pendingApprovals": 6,
  "meetingsThisWeek": 4,
  "influencersInNegotiation": 12,
  "leadsPerStage": [
    { "stage": "assigned", "label": "Assigned", "count": 8 },
    { "stage": "questionnaire_sent", "label": "Questionnaire Sent", "count": 5 },
    { "stage": "meeting_booked", "label": "Meeting Booked", "count": 3 },
    { "stage": "documents_generated", "label": "Documents", "count": 4 },
    { "stage": "influencer_selection", "label": "Influencer Selection", "count": 2 },
    { "stage": "deal_negotiation", "label": "Deal Negotiation", "count": 1 }
  ],
  "upcomingMeetings": [
    {
      "leadName": "Rahul Sharma",
      "scheduledAt": "2026-04-24T11:00:00Z",
      "zoomLink": "https://zoom.us/j/123456"
    }
  ],
  "actionItems": [
    {
      "id": "action1",
      "type": "questionnaire_received",
      "leadId": "abc123",
      "leadName": "Rahul Sharma",
      "description": "Questionnaire received — book a meeting",
      "urgency": "high",
      "createdAt": "2026-04-22T08:00:00Z"
    }
  ]
}
```

`pendingApprovals` = count of campaign_approvals where `status=pending` for this CM.
`influencersInNegotiation` = count of campaign_creators where `deal_status=negotiating`.
`actionItems` = items from questionnaires received, content submitted, approvals pending.

---

### 2.9 — New endpoint `GET /campaign-managers` — List CMs with workload

Needed for the CM assignment modal (shows each CM with how many leads they have).

```json
GET /campaign-managers

Response:
{
  "managers": [
    {
      "id": "user123",
      "name": "Sarah Johnson",
      "email": "sarah@socialjet.com",
      "role": "campaign_manager",
      "activeLeads": 7
    },
    {
      "id": "user456",
      "name": "Arjun Mehta",
      "email": "arjun@socialjet.com",
      "role": "campaign_manager_lead",
      "activeLeads": 3
    }
  ]
}
```

Query users table filtering `role IN ["campaign_manager", "campaign_manager_lead"]`.
`activeLeads` = count of leads where `assigned_cm_id == user.user_id`.

---

## SECTION 3 — NEW ENDPOINTS (Build from scratch using existing patterns)

---

### 3.1 — Questionnaire System

**New DynamoDB table: `questionnaires`**

```
questionnaire_id  (string, PK)
lead_id           (string, GSI)
questions         (list of objects)
  - question_id   (string)
  - question      (string)
  - answer        (string or null)
  - type          (string: "text" | "select" | "multiselect")
  - options       (list of strings, optional)
sent_at           (string ISO datetime, nullable)
received_at       (string ISO datetime, nullable)
created_at        (string ISO datetime)
updated_at        (string ISO datetime)
```

Default questions to insert when a questionnaire is created:

```python
DEFAULT_QUESTIONS = [
    {"question": "What is the main goal of this campaign?", "type": "text"},
    {"question": "Who is your target audience?", "type": "text"},
    {"question": "What platforms are you targeting?", "type": "multiselect", "options": ["Instagram", "TikTok", "YouTube"]},
    {"question": "What is your estimated budget?", "type": "text"},
    {"question": "What is your campaign timeline?", "type": "text"},
    {"question": "Any specific influencer preferences?", "type": "text"},
    {"question": "What deliverables do you expect?", "type": "text"},
]
```

**Endpoints:**

```
GET /questionnaire/{lead_id}
```

Returns the questionnaire for this lead. If none exists, creates one with default questions.

Response:

```json
{
  "questionnaire_id": "q123",
  "lead_id": "abc123",
  "sent_at": null,
  "received_at": null,
  "questions": [
    {
      "question_id": "q1",
      "question": "What is the main goal of this campaign?",
      "answer": null,
      "type": "text"
    }
  ],
  "created_at": "2026-04-20T10:00:00Z"
}
```

---

```
POST /questionnaire/{lead_id}/send
```

Marks questionnaire as sent (sets `sent_at`). Optionally sends via email.
Updates lead timeline with event `questionnaire_sent`.

Request: (no body)

Response:

```json
{
  "questionnaire_id": "q123",
  "lead_id": "abc123",
  "sent_at": "2026-04-23T10:00:00Z"
}
```

---

```
PATCH /questionnaire/{lead_id}
```

CM edits the questionnaire questions (before sending) OR updates answers (when client responds).
Setting any answer also sets `received_at` if not already set.

Request:

```json
{
  "questions": [
    {
      "question_id": "q1",
      "question": "What is the main goal of this campaign?",
      "answer": "Brand awareness for Gen Z audience",
      "type": "text"
    }
  ]
}
```

Response: full questionnaire object (same as GET above).

---

### 3.2 — Campaign Creators (Lead-Influencer Assignment)

**New DynamoDB table: `campaign_creators`**

```
id               (string, PK)  - uuid
lead_id          (string, GSI)
creator_id       (string, GSI)
status           (string) - "recommended" | "cm_approved" | "cm_rejected" | "client_approved" | "client_rejected" | "assigned"
is_recommended   (boolean) - true if AI recommended
deal_status      (string, nullable) - "negotiating" | "countered" | "closed" | "rejected"
deal_amount      (number, nullable)
deal_notes       (string, nullable)
added_at         (string ISO datetime)
updated_at       (string ISO datetime)
```

**Endpoints:**

```
GET /campaign-creators/{lead_id}
```

Returns all creators assigned to this lead with their full creator profile merged in.

Response:

```json
{
  "creators": [
    {
      "id": "cc1",
      "lead_id": "abc123",
      "creator_id": "cr456",
      "name": "Priya Sharma",
      "handle": "priya.sharma",
      "platform": "instagram",
      "followers": 285000,
      "engagement_rate": 4.2,
      "avg_views": null,
      "niche": ["fashion", "lifestyle"],
      "status": "recommended",
      "is_recommended": true,
      "deal_status": null,
      "deal_amount": null,
      "deal_notes": null,
      "added_at": "2026-04-20T10:00:00Z"
    }
  ]
}
```

---

```
POST /campaign-creators/{lead_id}
```

Add a creator to this lead's campaign.

Request:

```json
{
  "creator_id": "cr456",
  "is_recommended": false
}
```

Response: the created campaign_creator object (same shape as above).

---

```
PATCH /campaign-creators/{lead_id}/{creator_id}/status
```

CM approves or rejects a creator.

Request:

```json
{
  "status": "cm_approved"
}
```

Valid values: `"cm_approved"` | `"cm_rejected"` | `"client_approved"` | `"client_rejected"`.

Response:

```json
{
  "id": "cc1",
  "lead_id": "abc123",
  "creator_id": "cr456",
  "status": "cm_approved",
  "updated_at": "2026-04-23T11:00:00Z"
}
```

---

```
PATCH /campaign-creators/{lead_id}/{creator_id}/deal
```

Update deal negotiation info for a creator.

Request:

```json
{
  "deal_status": "negotiating",
  "deal_amount": 50000,
  "deal_notes": "Waiting for counter from influencer"
}
```

Response: updated campaign_creator object.

---

```
POST /campaign-creators/{lead_id}/send-to-client
```

Marks all `cm_approved` creators as sent to client for approval.
Creates notification for the client (if client user exists) or logs timeline event.

Request: (no body)

Response:

```json
{
  "lead_id": "abc123",
  "sent_count": 5,
  "sent_at": "2026-04-23T12:00:00Z"
}
```

---

### 3.3 — Content Review

**New DynamoDB table: `content_submissions`**

```
content_id         (string, PK)
lead_id            (string, GSI)
creator_id         (string)
creator_name       (string)
platform           (string) - "instagram" | "tiktok" | "youtube"
content_url        (string)
caption            (string, nullable)
status             (string) - "pending" | "submitted" | "cm_approved" | "cm_rejected" | "client_approved" | "client_rejected" | "scheduled"
submitted_at       (string ISO datetime, nullable)
cm_approved_at     (string ISO datetime, nullable)
client_approved_at (string ISO datetime, nullable)
scheduled_at       (string ISO datetime, nullable)
cm_note            (string, nullable)
client_note        (string, nullable)
created_at         (string ISO datetime)
updated_at         (string ISO datetime)
```

**Endpoints:**

```
GET /content/{lead_id}
```

Returns all content submissions for this lead.

Response:

```json
{
  "content": [
    {
      "content_id": "ct1",
      "lead_id": "abc123",
      "creator_id": "cr456",
      "creator_name": "Priya Sharma",
      "platform": "instagram",
      "content_url": "https://instagram.com/p/xyz",
      "caption": "Check out this amazing product!",
      "status": "submitted",
      "submitted_at": "2026-04-22T14:00:00Z",
      "cm_approved_at": null,
      "client_approved_at": null,
      "scheduled_at": null,
      "cm_note": null
    }
  ]
}
```

---

```
POST /content/{lead_id}
```

Creator or CM submits content link.

Request:

```json
{
  "creator_id": "cr456",
  "platform": "instagram",
  "content_url": "https://instagram.com/p/xyz",
  "caption": "Optional caption"
}
```

Response: created content object.

---

```
PATCH /content/{lead_id}/{content_id}/status
```

CM approves or rejects content.

Request:

```json
{
  "status": "cm_approved",
  "note": "Looks great, sending to client"
}
```

Valid status values: `"cm_approved"` | `"cm_rejected"` | `"client_approved"` | `"client_rejected"`.

Sets `cm_approved_at` or `client_approved_at` timestamp automatically based on status.

Response: updated content object.

---

```
PATCH /content/{lead_id}/{content_id}/schedule
```

CM assigns a publish date to approved content.

Request:

```json
{
  "scheduled_at": "2026-05-01T10:00:00Z"
}
```

Response: updated content object with `status: "scheduled"`.

---

### 3.4 — Campaign Approvals Queue

This is a unified list of things waiting for action (documents, influencer lists, content).

**No new table needed.** Derive from existing tables:

- Pending document approvals → from `onboarding` table where `status=cm_approved`
- Pending influencer approvals → from `campaign_creators` where `status=cm_approved` (grouped by lead)
- Pending content approvals → from `content_submissions` where `status=submitted` or `status=cm_approved`

**Endpoints:**

```
GET /campaign-approvals
```

Returns unified list of pending approvals for the current user.

- If `role=admin` → shows documents with `status=cm_approved`
- If `role=campaign_manager` or `campaign_manager_lead` → shows content with `status=submitted`

Response:

```json
{
  "approvals": [
    {
      "id": "doc1",
      "lead_id": "abc123",
      "lead_name": "Rahul Sharma",
      "client_company": "BrandX",
      "type": "document",
      "description": "Onboarding Document ready for review",
      "status": "pending",
      "created_at": "2026-04-22T09:00:00Z"
    },
    {
      "id": "cc_batch_abc123",
      "lead_id": "abc123",
      "lead_name": "Rahul Sharma",
      "client_company": "BrandX",
      "type": "influencer_list",
      "description": "5 influencers pending client approval",
      "status": "pending",
      "created_at": "2026-04-22T10:00:00Z"
    },
    {
      "id": "ct1",
      "lead_id": "abc123",
      "lead_name": "Rahul Sharma",
      "client_company": "BrandX",
      "type": "content",
      "description": "Content from @priya.sharma ready for review",
      "status": "pending",
      "created_at": "2026-04-22T14:00:00Z"
    }
  ],
  "count": 3
}
```

---

```
POST /campaign-approvals/{id}/approve
```

Approve the item. The `id` is the underlying document/content/batch ID.
The `type` query param tells which table to update.

```
POST /campaign-approvals/{id}/approve?type=document
POST /campaign-approvals/{id}/approve?type=content
POST /campaign-approvals/{id}/approve?type=influencer_list
```

For `document`: sets `onboarding.status = "admin_approved"`.
For `content`: sets `content_submissions.status = "client_approved"`.
For `influencer_list`: sets all `cm_approved` creators for this lead to `client_approved`.

Response:

```json
{ "id": "doc1", "status": "approved", "approved_at": "2026-04-23T10:00:00Z" }
```

---

```
POST /campaign-approvals/{id}/reject?type=document
```

Same pattern as approve. Sets status back to `draft`. Optional reason.

Request:

```json
{ "reason": "Needs more detail on deliverables" }
```

Response:

```json
{ "id": "doc1", "status": "rejected", "rejected_at": "2026-04-23T10:00:00Z" }
```

---

## SECTION 4 — URL CHANGES (Frontend will call these exact paths)

The frontend is built with these exact URLs. Make sure your routes match:

| Frontend calls                                           | Should map to                                                                        |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `GET /campaign-leads/dashboard/stats`                    | `GET /campaigns/dashboard` (rename or add alias)                                     |
| `GET /campaign-leads`                                    | `GET /leads/?status=closed` ✅ already done                                          |
| `PATCH /campaign-leads/{id}/assign`                      | `POST /leads/{lead_id}/assign-cm` (add PATCH alias, body field: `campaignManagerId`) |
| `GET /campaign-managers`                                 | New endpoint (Section 2.9)                                                           |
| `GET /campaign-leads/{id}/questionnaire`                 | `GET /questionnaire/{lead_id}`                                                       |
| `POST /campaign-leads/{id}/questionnaire/send`           | `POST /questionnaire/{lead_id}/send`                                                 |
| `PATCH /campaign-leads/{id}/questionnaire`               | `PATCH /questionnaire/{lead_id}`                                                     |
| `GET /campaign-leads/{id}/meeting`                       | `GET /meetings/lead/{lead_id}` ✅ exists                                             |
| `POST /campaign-leads/{id}/meeting/schedule`             | `POST /meetings/instant` ✅ exists                                                   |
| `GET /campaign-leads/{id}/documents`                     | `GET /onboarding/{lead_id}` (updated)                                                |
| `PATCH /campaign-leads/{id}/documents/{doc_id}`          | `PATCH /onboarding/{onboarding_id}`                                                  |
| `POST /campaign-leads/{id}/documents/{doc_id}/submit`    | `POST /onboarding/{onboarding_id}/submit`                                            |
| `GET /influencers`                                       | `GET /creators/` ✅ exists                                                           |
| `GET /campaign-leads/{id}/influencers`                   | `GET /campaign-creators/{lead_id}`                                                   |
| `POST /campaign-leads/{id}/influencers`                  | `POST /campaign-creators/{lead_id}`                                                  |
| `PATCH /campaign-leads/{id}/influencers/{inf_id}/status` | `PATCH /campaign-creators/{lead_id}/{creator_id}/status`                             |
| `PATCH /campaign-leads/{id}/influencers/{inf_id}/deal`   | `PATCH /campaign-creators/{lead_id}/{creator_id}/deal`                               |
| `POST /campaign-leads/{id}/influencers/send`             | `POST /campaign-creators/{lead_id}/send-to-client`                                   |
| `GET /campaign-leads/{id}/content`                       | `GET /content/{lead_id}`                                                             |
| `PATCH /campaign-leads/{id}/content/{cid}/status`        | `PATCH /content/{lead_id}/{content_id}/status`                                       |
| `PATCH /campaign-leads/{id}/content/{cid}/schedule`      | `PATCH /content/{lead_id}/{content_id}/schedule`                                     |
| `GET /campaign-inbox/conversations`                      | `GET /inbox/?context=campaign`                                                       |
| `GET /campaign-inbox/conversations/{id}`                 | `GET /inbox/{lead_id}` ✅ exists                                                     |
| `POST /campaign-inbox/conversations/{id}/send`           | `POST /inbox/{lead_id}/send` ✅ exists                                               |
| `GET /campaign-inbox/lead/{lead_id}/client`              | `GET /inbox/{lead_id}` ✅ exists                                                     |
| `GET /campaign-approvals`                                | `GET /campaign-approvals` (new)                                                      |
| `POST /campaign-approvals/{id}/approve`                  | `POST /campaign-approvals/{id}/approve` (new)                                        |
| `POST /campaign-approvals/{id}/reject`                   | `POST /campaign-approvals/{id}/reject` (new)                                         |

---

## SECTION 5 — AUTH

All endpoints require `Authorization: Bearer <token>` header (same JWT as rest of app).

Role access rules:

- `GET /campaign-managers` → `campaign_manager_lead` + `admin`
- `PATCH /leads/{id}/assign-cm` → `campaign_manager_lead` + `admin`
- `POST /onboarding/{id}/submit` → `campaign_manager` + `campaign_manager_lead`
- `POST /onboarding/{id}/send-to-client` → `admin` only
- `POST /campaign-approvals/{id}/approve?type=document` → `admin` only
- All other campaign endpoints → `campaign_manager` + `campaign_manager_lead` + `admin`

---

## SUMMARY — What to build

| Priority                    | Task                                                                          |
| --------------------------- | ----------------------------------------------------------------------------- |
| 🟢 Small change             | Update `POST /leads/{id}/assign-cm` response                                  |
| 🟢 Small change             | Add `?context=campaign` filter to `GET /inbox/`                               |
| 🟢 Small change             | Update `GET /onboarding/{lead_id}` to return array with `doc_type` + `status` |
| 🟢 Small change             | Update `POST /onboarding/generate` to generate both docs                      |
| 🟢 Small change             | Update `GET /campaigns/dashboard` response format                             |
| 🟡 New endpoint             | `PATCH /onboarding/{id}` — edit doc content                                   |
| 🟡 New endpoint             | `POST /onboarding/{id}/submit` — submit to admin                              |
| 🟡 New endpoint             | `POST /onboarding/{id}/send-to-client`                                        |
| 🟡 New endpoint             | `GET /campaign-managers`                                                      |
| 🔴 New table + endpoints    | Questionnaire system (3 endpoints)                                            |
| 🔴 New table + endpoints    | Campaign creators / influencer assignment (5 endpoints)                       |
| 🔴 New table + endpoints    | Content review (4 endpoints)                                                  |
| 🔴 New endpoints (no table) | Campaign approvals queue (3 endpoints, derived from existing tables)          |
