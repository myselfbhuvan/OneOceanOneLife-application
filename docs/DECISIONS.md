# O3L Project — All Decisions Made
## Date: August 31, 2026

All `[DECISION REQUIRED]` items from the Technical Requirements Document have been resolved below.

---

## SECTION 1: PROJECT OVERVIEW

### Q1.2 — Target Audience (CRITICAL)
**Decision:** Top 3 primary audiences for Phase 1:
1. **Fishermen & Coastal Communities** (primary) — Daily users, data contributors
2. **Researchers & Scientific Validators** — Data consumers, verification
3. **NGOs & Community Organizations** — Programs, events, partnerships

### Q1.3 — Launch User Roles (CRITICAL)
**Decision:** Active at launch (Phase 1):
- FISHERMAN, COMMUNITY_MEMBER, RESEARCHER, SCIENTIFIC_VALIDATOR
- NGO, COMMUNITY_ORGANIZATION, VENDOR, TOURISM_PROVIDER
- EDUCATOR, VOLUNTEER, GUEST, ADMIN, MODERATOR, SUPER_ADMIN

**Deferred to Phase 2+:** None — all 14 roles active at launch. Role-specific features gated by phase.

### Q1.6 — Launch Scope (CRITICAL)
**Decision:** Tamil Nadu only for Phase 1. Architecture supports multi-state expansion. Zones 1-5 as defined. Zone 6 (Dynamic Hotspots) is cross-zone ocean area.

---

## SECTION 2: USER TYPES & ROLES

### Q2.1 — Role Mapping
**Decision:** Map proposed roles to existing roles:
| Proposed | Maps To | Action |
|----------|---------|--------|
| Fisherman's Family Member | COMMUNITY_MEMBER | Add "family_link" profile field |
| Marine Biologist | RESEARCHER | No change needed |
| Educational Institution | EDUCATOR | No change needed |
| Government Organization | NGO | Add "organization_type=government" field |
| Coast Guard | GUEST | Emergency contacts only, no app account |
| Environmental Organization | NGO | Add "organization_type=environmental" field |
| Student | VOLUNTEER | No change needed |
| Regional Coordinator | ADMIN | Add "zone_assigned" field to Profile |
| Data Verifier | SCIENTIFIC_VALIDATOR | No change needed |

### Q2.2 — RBAC Permission Matrix
**Decision:** Full permission matrix:

| Module | GUEST | FISHERMAN | COMMUNITY | RESEARCHER | NGO | VENDOR | EDUCATOR | MODERATOR | ADMIN | SUPER_ADMIN |
|--------|-------|-----------|-----------|------------|-----|--------|----------|-----------|-------|-------------|
| Guides | R | CRUD | CRUD | CRUD | CRUD | R | CRUD | CRUD | CRUD | CRUD |
| Education | R | R | CRU | CRU | CRU | R | CRUD | CRUD | CRUD | CRUD |
| Ocean Sounds | — | CR | CR | R | R | — | R | RV | CRUD | CRUD |
| Sightings | — | CR | CR | R | R | — | R | RV | CRUD | CRUD |
| Community Posts | — | CRUD | CRUD | R | R | R | R | MOD | CRUD | CRUD |
| Events | — | CRU | CRU | R | CRUD | R | CRUD | MOD | CRUD | CRUD |
| Marketplace | R | R | R | R | R | CRUD | R | MOD | CRUD | CRUD |
| Emergency | R | CRU | CRU | R | R | R | R | R | CRUD | CRUD |
| Recognition | R | R | R | R | R | R | R | R | CRUD | CRUD |
| Users | — | P | P | P | P | P | P | RV | CRUD | CRUD |
| Maps | R | R | R | R | R | R | R | R | CRUD | CRUD |
| Settings | — | — | — | — | — | — | — | — | RU | CRUD |

Legend: R=Read, C=Create, U=Update, D=Delete, V=Verify, MOD=Moderate, RV=Review, P=Profile only

---

## SECTION 3: AUTHENTICATION

### Q3.1 — Login Methods
**Decision:** 
- **Email + Password:** ✅ Implemented (SimpleJWT)
- **Mobile + OTP:** ✅ Add — Primary for fishermen (Twilio SMS)
- **WhatsApp OTP:** ✅ Add — Phase 2 (Twilio WhatsApp API)
- **Google OAuth:** ✅ Add — Phase 1 (social-auth)
- **Apple Sign-In:** ✅ Add — Phase 1 (required for iOS App Store)
- **Aadhaar/Gov ID:** ❌ Skip — Phase 3 (regulatory complexity)

### Q3.2 — Verification per User Type
**Decision:**
| User Type | Verification Method |
|-----------|-------------------|
| Fisherman | Phone OTP + Village Head endorsement OR Fishing License upload |
| Researcher | Institution email (.edu/.ac.in) OR published paper DOI |
| NGO | Registration certificate upload + admin review |
| Vendor | Business license / GST certificate + admin review |
| Community Member | Phone OTP sufficient |

### Q3.3 — Session Management
**Decision:** Allow multiple devices (max 5). Device tracking via user-agent + IP. Logout-all endpoint available. JWT refresh token rotation enabled.

### Q3.4 — Anonymous Browsing
**Decision:** Public access (no login required):
- Guide species (read only)
- Education articles (read only)
- Emergency contacts (read only)
- Map view (read only)
- Event listings (read only)
- Marketplace browse (read only)
Everything else requires authentication.

---

## SECTION 4: PROFILE SYSTEM

### Q4.1 — Field Visibility per Role
**Decision:**
| Field | Public | Members | Private | Admin |
|-------|--------|---------|---------|-------|
| Name | ✅ | ✅ | ✅ | ✅ |
| Profile Photo | ✅ | ✅ | ✅ | ✅ |
| Village | ✅ | ✅ | ✅ | ✅ |
| Occupation | ✅ | ✅ | ✅ | ✅ |
| Organization | — | ✅ | ✅ | ✅ |
| Bio | — | ✅ | ✅ | ✅ |
| GPS (lat/lng) | ❌ Never | ❌ Never | ✅ | ✅ |
| Location Precision | ✅ Level only | ✅ | ✅ | ✅ |
| Contribution Score | ✅ Total only | ✅ | ✅ | ✅ |
| Last Active | — | ✅ | ✅ | ✅ |
| Phone | ❌ Never | ❌ Never | ✅ | ✅ |
| Email | ❌ Never | ❌ Never | ✅ | ✅ |

### Q4.2 — Additional Profile Fields
**Decision:** Add all: Gender, Age Range (dropdown: 18-25, 26-35, 36-50, 50+), Languages (multiselect Tamil/English/Hindi), Skills, Years of Experience, Areas of Expertise, Verification Status display.

---

## SECTION 5: LOCATION & GIS

### Q5.1 — GPS Privacy Rules
**Decision:**
- GPS auto-captured on submissions: ✅ Yes
- Manual location selection allowed: ✅ Yes (fallback)
- GPS accuracy requirement: 10 meters minimum
- Exact coordinates hidden from public: ✅ Yes (village-level display)
- Sensitive species locations protected: ✅ Yes (location_precision=research_only)
- Coordinates rounded for public: ✅ Yes (to village centroid)
- Offshore observations use grids: ✅ Yes (1km hex grids)

### Q5.2 — Map Provider
**Decision:** MapLibre GL for both web and mobile. Open-source, no licensing costs, consistent experience.

### Q5.3 — Map Layers for Phase 1
**Decision:** Village boundaries, district boundaries, coastal zones, contribution hotspots, marine observations, fishing activity. Hex grids and heat maps in Phase 2.

---

## SECTION 6: COASTAL ZONES

### Q6.1 — Zone Management
**Decision:**
- Zone boundaries admin-configurable: ✅ Yes (admin panel)
- Who can modify: SUPER_ADMIN only
- Historical zone definitions preserved: ✅ Yes (versioned)
- Offshore contribution assignment: Nearest zone by distance
- Zone 6 (Dynamic Hotspots): 10km hex grids, intensity = contribution density, rolling 30-day window

---

## SECTION 7: GUIDE — "Learn the Ocean"

### Q7.1 — Guide Content Structure
**Decision:** All 13 categories confirmed: Fish, Marine Mammals, Birds, Coral, Mangroves, Seagrass, Plankton, Habitats, Conservation, Fishing Knowledge, Weather, Ocean Conditions, Marine Safety.

### Q7.2 — Guide Entry Fields
**Decision:** All fields: Common name, Tamil name, Scientific name, Images (max 5), Videos (max 2), Habitat, ID characteristics, Size range, Diet, Behavior, Key facts, Conservation status (IUCN), Seasonal info, Distribution map.

### Q7.3 — Guide Content Approval
**Decision:** Anyone can suggest new species (status: pending). SCIENTIFIC_VALIDATOR approves/rejects. ADMIN can also approve. GuideSpecies.verified field controls visibility.

---

## SECTION 8: EDUCATIONAL CONTENT

### Q8.1 — Content Types
**Decision:** All 11 types confirmed: Articles, Blogs, Stories, Local Knowledge, Fishing Experience, Interviews, Research Articles, Videos, Podcasts, Tutorials, Community Lessons.

### Q8.2 — Publishing Workflow
**Decision:** Any authenticated member can publish. MODERATOR review required before public visibility. Comments allowed (with moderation). Report/translate features in Phase 2. Tamil + English bilingual from Day 1.

---

## SECTION 9: OCEAN SOUND

### Q9.1 — Submission Workflow
**Decision:**
- Who can submit: FISHERMAN, RESEARCHER, COMMUNITY_MEMBER
- GPS mandatory: ✅ Yes
- Date/time auto-captured: ✅ Yes
- Manual correction: ✅ Yes (within 24 hours)
- Supported instruments: Dropdown (Hydrophone, Smartphone, Boat Sonar, Other) + free text
- Instrument model mandatory: ❌ No (optional)
- Calibration info stored: ✅ Yes (JSON field)
- Audio formats: WAV, MP3, M4A, OGG
- Max duration: 30 minutes
- Max file size: 50MB
- Multiple recordings per submission: ✅ Yes (max 10)

### Q9.2 — Verification & Marketplace
**Decision:**
- Who verifies: SCIENTIFIC_VALIDATOR (primary), RESEARCHER (secondary)
- Verification levels: auto_validated → moderator_review → scientific_review → verified
- Min contributions before selling: 25 verified contributions
- Contributor percentage: 70%
- Who sets price: Contributor (with admin floor price of ₹10)
- Buyer license types: Research-only, Commercial, Exclusive
- Same recording sold multiple times: ✅ Yes (non-exclusive by default)
- Research institution dataset purchase: ✅ Yes (bulk discount)
- Sensitive location hidden: ✅ Yes (village-level only for buyers)

---

## SECTION 10: MARINE MAMMAL SIGHTINGS

### Q10.1 — Species Support
**Decision:** Support: Whales (15 species), Dolphins (12 species), Dugong, Sea Turtles (5 species), Sharks (8 species), Rays (5 species). Add depth_meters and distance_from_shore fields.

### Q10.2 — AI & Marketplace
**Decision:** Same rules as Ocean Sound (Q9.2). AI species ID assists but doesn't replace human verification.

---

## SECTION 11: CIRCULAR ECONOMY

### Q11.1 — Business Ideas & Government Schemes
**Decision:** Managed via admin panel (CMS model). Categories: Fishing Equipment, Aquaculture, Marine Products, Eco-Tourism, Training, Insurance, Subsidies. Government schemes: API integration in Phase 2, manual entry for Phase 1.

---

## SECTION 12: ECOTOURISM

### Q12.1 — Ecotourism Features
**Decision:** 
- Booking system: ✅ Phase 2 (Phase 1: inquiry only)
- Payment integration: ✅ Phase 2
- Reviews/ratings: ✅ Yes (1-5 stars + text)
- Blue Flag info: ✅ Yes (admin-managed)
- Safety enforcement: ✅ Yes (emergency contacts on every listing)

---

## SECTION 13: COMMUNITY & DIARY

### Q13.1 — Post Features
**Decision:**
- Post visibility: Public / Village-only / Zone-level (3 levels, not Research)
- Moderation: Community reports → MODERATOR review → remove/warn/ban
- Direct messaging: ✅ Phase 2 (Phase 1: comments only)
- Blocking: ✅ Yes (block user = can't see each other's posts)
- Photo/video diary: ✅ Yes (max 5 photos, 1 video per post)

---

## SECTION 14: EVENTS

### Q14.1 — Event Features
**Decision:** Calendar integration: ✅ Yes (iCal export). Recurring events: ✅ Yes (weekly/monthly). Capacity limits: ✅ Yes. Waitlists: ✅ Yes. Event photos/diary: ✅ Yes.

---

## SECTION 15: MARKETPLACE

### Q15.1 — Marketplace Features
**Decision:** Product approval: Admin review required. Delivery: Self-pickup + local delivery (Phase 1). Returns: 7-day policy. Invoice: Auto-generated PDF.

---

## SECTION 16: EMERGENCY SYSTEM

### Q16.1 — Emergency Features
**Decision:**
- Offline contacts: ✅ Yes (SQLite cached)
- Emergency calling without internet: ✅ Yes (native phone intent)
- GPS coordinates offline: ✅ Yes (last-known + village coordinates)
- Last-known location stored: ✅ Yes
- SOS SMS: ✅ Yes (predefined message + GPS to emergency contacts)
- Auto-call: ✅ Yes (after 5-second countdown)
- Location shared on SOS: ✅ Yes (GPS coordinates in SMS)
- Maritime boundary warnings: ✅ Yes (PostGIS boundary check)
- No mobile network: SOS queued, sent when network available
- No GPS: Use village center coordinates

---

## SECTION 17: OFFLINE-FIRST

### Q17.1 — Offline Features
**Decision:** All critical features offline: Emergency contacts, Guides (cached), Draft submissions (contributions, sightings, sounds), Diary posts, GPS capture, Educational content (saved).

### Q17.2 — Sync Strategy
**Decision:**
- Upload on reconnect: ✅ Yes (automatic)
- Background sync: ✅ Yes (every 15 minutes when connected)
- Conflict resolution: Last-write-wins (timestamp-based)
- Offline data encryption: ✅ Yes (SQLCipher)
- Max offline storage: 500MB before forced sync
- Queue: FIFO with retry (3 attempts, exponential backoff)

---

## SECTION 18: RECOGNITION & SCOREBOARD

### Q18.1 — Scoring Weights
**Decision:** Admin-configurable weights (default):
- Data Quantity: 20%
- Data Quality: 25%
- Verification Status: 20%
- Community Engagement: 10%
- Environmental Impact: 10%
- Knowledge Contribution: 10%
- Event Participation: 5%
- Total: 100%

Score changes are auditable (AuditLog).

### Q18.2 — Scoreboard Levels
**Decision:** Levels: Individual, Fisherman, Family, Village, District, Zone, NGO, Vendor, Research Institution. Annual evaluation: January 1st. Leaderboard: Top 50 visible to all members.

---

## SECTION 19: NON-CONTRIBUTING RECOGNITION

### Q19.1 — Recognition Categories
**Decision:** 7 categories: Community Supporter, Ocean Friend, Volunteer, Event Participant, Local Knowledge Keeper, Mentor, Eco Champion. Criteria: Activity-based (event attendance, mentoring, community support).

---

## SECTION 20: CONTRIBUTION SCORE ENGINE

### Q20.1 — Scoring Algorithm
**Decision:**
```
Final Score = (Quantity × 0.20) + (Quality × 0.25) + (Verification × 0.20) + 
              (Community × 0.10) + (Environmental × 0.10) + (Knowledge × 0.10) + 
              (Events × 0.05)

Where:
- Quantity = min(total_contributions / 100, 1.0) × 100
- Quality = avg_completeness_score × 100
- Verification = verified_count / total_count × 100
- Community = community_posts + comments + event_participation (normalized)
- Environmental = conservation_contributions × weight
- Knowledge = education_posts + guide_suggestions (normalized)
- Events = events_attended / total_events × 100
```
Admin-modifiable weights. All score changes logged.

---

## SECTION 21: YEARLY REPORT

### Q21.1 — Annual Report
**Decision:** All sections confirmed. PDF export: ✅ Yes. Generated annually by Celery task.

---

## SECTION 22: RESEARCH DATA PLATFORM

### Q22.1 — Research Data Access
**Decision:**
- Search/download: ✅ Yes
- Export formats: CSV, JSON, GeoJSON, Excel
- Licensing: Open (CC-BY), Restricted (non-commercial), Commercial (paid)
- Research API: ✅ Yes (API key-based, rate-limited)

---

## SECTION 23: DATA VERIFICATION

### Q23.1 — Verification Workflow
**Decision:**
- 8 statuses confirmed
- Reviewer roles: Auto (system), MODERATOR, SCIENTIFIC_VALIDATOR
- Multiple reviewers: ✅ Yes (2 SCIENTIFIC_VALIDATOR for critical data)
- Confidence scores: 0-100 (AI-generated, human-reviewed)
- Evidence requirements: Photo required for all contributions
- Version history: ✅ Yes (every status change logged)

---

## SECTION 24: SEARCH

### Q24.1 — Global Search
**Decision:** Full-text across all modules. Faceted (type, location, date, role). Tamil search via PostgreSQL full-text with Tamil dictionary. Voice search: Phase 2. Location-based: ✅ Yes (nearby results).

---

## SECTION 25: NOTIFICATIONS

### Q25.1 — Notification Channels
**Decision:**
- Channels: In-app, Push (FCM/APNs), Email, SMS, WhatsApp (Phase 2)
- Events mapped to channels:
  - Emergency: Push + SMS + In-app
  - Verification: Push + In-app
  - New event: Push + In-app
  - Recognition: Push + In-app
  - Milestone: Push + In-app
  - Marketplace: In-app + Email
  - Comment/Mention: In-app
  - System: In-app + Email
- User preferences: ✅ Yes (opt-in/out per channel per event type)

---

## SECTION 26: MULTILINGUAL

### Q26.1 — Language Support
**Decision:** Tamil + English from Day 1. Other Indian languages: Phase 3. User-generated translation: Phase 3. Cross-language search: ✅ Yes (via translation). Voice input Tamil: Phase 2. TTS: Phase 3.

---

## SECTION 27: MOBILE APPLICATION

### Q27.1 — Mobile Requirements
**Decision:** Android + iOS at launch. Tablet: responsive layout (not separate). Camera: ✅ Yes. Microphone: ✅ Yes (for sounds). Background sync: ✅ Yes. Bluetooth: Phase 2 (instruments).

---

## SECTION 28: WEB APPLICATION

### Q28.1 — Web Scope
**Decision:** Mobile browser optimization: ✅ Yes. PWA support: ✅ Yes (service worker). Priority pages: Home, Guides, Education, Map, Marketplace, Emergency, Admin.

---

## SECTION 29: ADMIN PANEL

### Q29.1 — Admin Modules
**Decision:** All 22 modules confirmed. Access:
- SUPER_ADMIN: All modules
- ADMIN: All except Settings
- MODERATOR: Users (read), Guides, Education, Sounds, Sightings, Community, Events (moderation only)
- SCIENTIFIC_VALIDATOR: Verification, Research (read only)

---

## SECTION 30: DATABASE

### Q30.1 — Database Confirmation
**Decision:** PostgreSQL 17 + PostGIS 3.6 confirmed. Schema freeze: After Phase 1 completion. Migration strategy: Django migrations with zero-downtime.

---

## SECTION 31: MEDIA STORAGE

### Q31.1 — Storage Provider
**Decision:**
- Provider: Cloudflare R2 (S3-compatible, no egress fees)
- Max file sizes: Images 10MB, Videos 100MB, Audio 50MB
- Thumbnails: ✅ Yes (auto-generate 3 sizes: 150px, 300px, 600px)
- Video transcoding: Phase 2
- Audio compression: ✅ Yes (ffmpeg, 128kbps)
- CDN: Cloudflare CDN (included with R2)

---

## SECTION 32: AI FEATURES

### Q32.1 — AI Feature Scope
**Decision:** All 9 features confirmed: Fish ID, Mammal ID, Image validation, Duplicate detection, Sound classification, Content moderation, Translation, Semantic search, Recommendation. AI is optional — uncertain results flagged for human review.

---

## SECTION 33: SECURITY

### Q33.1 — Security Requirements
**Decision:**
- Encryption at rest: ✅ Yes (AES-256 for database, SQLCipher for offline)
- API key management: Environment variables + Django secrets
- Abuse detection: Rate limiting + IP blocking after 100 requests/min
- Data retention: Contributions = permanent, User data = until deletion request
- Backup encryption: ✅ Yes (AES-256)
- DR plan: Daily backups, 30-day retention, cross-region replication
- Pen testing: Quarterly (post-launch)

---

## SECTION 34: PRIVACY

### Q34.1 — Privacy Compliance
**Decision:**
- DPDP Act compliance: ✅ Yes (consent, data minimization, purpose limitation)
- Privacy policy: ✅ Yes (English + Tamil)
- Consent flow for GPS: ✅ Yes (explicit consent before capture)
- Research data privacy: Anonymized for open data, pseudonymized for restricted
- Account deletion: ✅ Yes (30-day grace period, then permanent)
- Data retention: User data deleted after 30 days of deletion request

---

## SECTION 35: CHILDREN / MINORS

### Q35.1 — Age Restrictions
**Decision:** No users under 18. Age verification: Self-declaration at registration. If reported/flagged as minor: account suspended pending review.

---

## SECTION 36: PAYMENTS

### Q36.1 — Payment Scope
**Decision:**
- Use cases: Data purchases, Marketplace, Ecotourism (Phase 2), Donations
- Providers: Razorpay (India, UPI support) + Stripe (international)
- Commission: 15% platform + 5% payment processing = 20% total
- Payout schedule: Monthly (15th of following month)
- Minimum payout: ₹500

---

## SECTION 37: CONTRIBUTOR PAYOUT

### Q37.1 — Payout Methods
**Decision:**
- Min payout: ₹500
- Methods: Bank transfer (NEFT/RTGS), UPI
- Payment verification: Automated via payment provider
- KYC: PAN card required for payouts >₹10,000/year
- Transaction history: ✅ Yes (full ledger)
- Refund/dispute: 7-day dispute window, admin resolution

---

## SECTION 38: API

### Q38.1 — API Architecture
**Decision:**
- Public API: ❌ No (Phase 3)
- Research API: ✅ Yes (API key, rate-limited 1000 req/day)
- Partner API: ✅ Yes (custom agreements)
- OAuth: ✅ Yes (for research partners)
- API keys: Generated per user/org
- Versioning: URL-based (/api/v1/, /api/v2/)
- Webhooks: ✅ Yes (for payment events)

---

## SECTION 39: THIRD-PARTY INTEGRATIONS

### Q39.1 — Integrations for MVP
**Decision:**
- Maps: MapLibre GL (free)
- Weather: OpenWeatherMap (free tier) + INCOIS (government)
- Gov APIs: Phase 3 (Aadhaar complexity)
- Payment: Razorpay + Stripe
- Cloud: Cloudflare R2
- Email: SendGrid (free tier)
- SMS: Twilio (OTP)
- WhatsApp: Twilio (Phase 2)
- Push: Firebase Cloud Messaging
- Analytics: Plausible (privacy-preserving)

---

## SECTION 40: WEATHER & OCEAN DATA

### Q40.1 — Weather Integration
**Decision:** 
- Weather forecast: OpenWeatherMap API
- Wind, waves, tides: OpenWeatherMap Marine
- Ocean-map sea-surface temperature: Copernicus Marine Data Store (global model)
- Ocean-map sea-surface salinity: Copernicus Marine Data Store (global model)
- Ocean-map chlorophyll-a: Copernicus Marine Data Store (global daily near-real-time satellite product)
- Ocean-map primary swell height: Copernicus Marine Data Store (3-hourly global wave model)
- Ocean-map surface currents: Copernicus Marine Data Store (hourly global model)
- Indicative fishing-zone screening: relative chlorophyll highs from Copernicus, with local sea-surface temperature gradients as supporting evidence where detected; not an official INCOIS PFZ advisory or catch forecast
- Weather-app sea temperature: OpenWeatherMap
- Storm/cyclone warnings: INCOIS (Indian National Centre for Ocean Information Services)

---

## SECTION 41: BORDER & MARITIME SAFETY

### Q41.1 — Geographic Boundaries
**Decision:**
- Indian maritime boundary: ✅ Yes (PostGIS polygon)
- State/district boundaries: ✅ Yes (already in seed data)
- Fishing zones: ✅ Yes (admin-configurable)
- Protected areas: ✅ Yes (marine sanctuaries)
- Data source: Survey of India + Ministry of Environment
- Legal: Informational only, not legal advice

---

## SECTION 42: PERFORMANCE

### Q42.1 — Performance Targets
**Decision:**
- API response time: <200ms (p95)
- Mobile launch time: <3 seconds (cold start)
- Web page load: <2 seconds (LCP)
- Image loading: <1 second (with CDN)
- Map rendering: <2 seconds
- Search response: <500ms
- Concurrent users: 10,000 (Year 1 target)

---

## SECTION 43: SCALABILITY

### Q43.1 — Scalability Plan
**Decision:**
- Year 1: 10K users, 100GB media, 50GB DB
- Year 3: 100K users, 1TB media, 500GB DB
- Year 5: 500K users, 5TB media, 2TB DB
- Peak traffic: 10x average (events, emergencies)
- Horizontal scaling: ✅ Yes (stateless API servers)
- Load balancing: ✅ Yes (nginx/HAProxy)
- CDN: ✅ Yes (Cloudflare)
- Caching: ✅ Yes (Redis for sessions, queries)
- Read replicas: Phase 3 (when needed)

---

## SECTION 44-49: INFRASTRUCTURE

### Q44 — Notification Infrastructure
**Decision:** Queue-based: API → Redis Queue → Celery Worker → Email/SMS/Push/WhatsApp. ✅ Confirmed.

### Q45 — Background Jobs
**Decision:** All confirmed: Scoring, Hotspot calc, Verification reminders, Media processing, Thumbnails, AI processing, Annual reports, Monthly stats, Data cleanup. ✅ All via Celery.

### Q46 — Observability
**Decision:** Sentry (error tracking) + OpenTelemetry (tracing) + Prometheus metrics. ✅ All three.

### Q47 — Backup & DR
**Decision:** Daily automated backups, 30-day retention, cross-region replication (Phase 2). RPO: 24 hours. RTO: 4 hours. DR testing: Quarterly.

### Q48 — Deployment
**Decision:** Cloud provider: AWS (primary) / DigitalOcean (staging). CI/CD: GitHub Actions. IaC: Docker Compose (dev) + ECS/Fargate (prod). Staging environment: ✅ Yes.

### Q49 — Domain Architecture
**Decision:** Modular Monolith + Async Workers (Celery). ✅ Confirmed as recommended.

---

## SECTION 50-54: FRONTEND UI/UX

### Q50 — UI/UX Design System
**Decision:** Brand colors finalized (ocean theme). Logo guidelines: ✅ Yes. Typography: Inter (headings) + system (body). Dark mode: ✅ Yes. WCAG 2.2 AA: ✅ Yes.

### Q51 — Mobile Home Screen
**Decision:** Priority order: Greeting → Recognition → Insight → Quick Actions → Map → Progress → Community → Events → Education.

### Q52 — Navigation
**Decision:** 5-tab confirmed: Home | Explore (search/command) | Contribute (action grid) | Community | Profile.

### Q53 — Design Tokens
**Decision:** All tokens confirmed: Primary (#0077B6), Secondary (#00B4D8), Ocean blue (#023E8A), Deep navy (#03045E), Teal (#2EC4B6), Coral (#FF6B6B), Success (#28A745), Warning (#FFC107), Danger (#DC3545).

### Q54 — Accessibility
**Decision:** WCAG 2.2 AA: ✅ Yes. Screen reader: ✅ Yes. Keyboard nav: ✅ Yes. Contrast 4.5:1. Font scaling. Captions for media. Reduced motion support. Touch targets 44x44px.

---

## SECTION 55-59: ANALYTICS, LEGAL, MODERATION

### Q55 — Analytics
**Decision:** Privacy-preserving only (Plausible). No hidden tracking. Events: Page views, feature usage, contribution events. Opt-out: ✅ Yes.

### Q56 — Legal & Compliance
**Decision:** ToS: ✅ Yes. Privacy Policy: ✅ Yes. Data licensing: CC-BY (open), Custom (restricted/commercial). Content ownership: Creator retains ownership. UGC rights: License to platform for display. Image/audio rights: Creator retains, platform license for display. Data resale: ❌ No without contributor consent. Contributor agreements: ✅ Yes (at registration). DPDP Act: ✅ Compliant.

### Q57 — Moderation
**Decision:** Report content/user: ✅ Yes. Spam detection: Basic keyword filter + rate limiting. Image moderation: AI-assisted (Phase 2) + human review. Comment moderation: Queue for moderators. Admin review: ✅ Yes. Auto-restrictions: 3 reports = auto-suspend pending review.

### Q58 — Data Ownership
**Decision:**
| Data Type | Owner | Platform Rights |
|-----------|-------|-----------------|
| Ocean sounds | Contributor | Display, aggregate, anonymize |
| Sightings | Contributor | Display, aggregate, anonymize |
| Photos/Videos | Contributor | Display, thumbnail, CDN |
| Research datasets | Platform | Aggregate, anonymize, license |
| Community knowledge | Creator | Display, translate |
| User profiles | User | Display (per privacy settings) |
| Location data | User | Never sell, anonymize for research |

### Q59 — Commercial Model
**Decision:**
- Free users: ✅ Full access
- Premium: ❌ No (Phase 3)
- Research subscriptions: ✅ Yes (API access)
- Data marketplace: ✅ Yes (70% to contributor)
- Vendor subscription: ✅ Yes (₹500/month)
- Tourism commission: ✅ Yes (10%)
- Sponsorship: ✅ Yes (corporate partners)
- NGO/Gov partnerships: ✅ Yes (grants, programs)

---

## SECTION 60-65: ROADMAP & MVP

### Q60 — Project Phases
**Decision:** 7 phases confirmed as defined.

### Q61 — MVP Definition
**Decision:** MVP = Phase 1 + Phase 2:
- Phase 1 (Foundation): Auth, Profiles, Guides, Education, Community, Map, Contributions, Admin, Emergency, Search
- Phase 2 (Citizen Science): Ocean Sounds, Sightings, GPS, Offline, Verification, Scoring
Phase 3+ deferred.

### Q62 — Testing Strategy
**Decision:** Unit (pytest), Integration (pytest-django), API (DRF test client), UI (Playwright), Mobile (Detox), Offline (custom), GPS (mock location), Security (bandit), Performance (locust), Load (k6), Accessibility (axe), Payment (sandbox), Media (custom), Map (custom), Data sync (custom). Coverage target: 80%.

### Q63 — Acceptance Criteria
**Decision:** Given/When/Then for every major module. Defined during implementation.

### Q64 — Technical Architecture
**Decision:** Generated after requirements confirmed.

### Q65 — Final Document Output
**Decision:** SRS, System Architecture, API Spec, DB Design, Security Spec, Deployment Doc, Testing Plan — all generated post-decisions.

---

## Summary: 70 Decisions Made
- **Critical:** 15 decisions ✅
- **High:** 15 decisions ✅
- **Technical:** 10 decisions ✅
- **Business:** 6 decisions ✅
- **Legal:** 6 decisions ✅
- **Security:** 5 decisions ✅
- **UX:** 6 decisions ✅
- **Open:** 7 decisions ✅
