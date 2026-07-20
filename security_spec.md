# Security Specification (TDD SPEC)

## Data Invariants
1. **User Ownership**: No user can read or modify another user's profile, balances, price alerts, copy trading instances, kycRequests, or kyc status unless they are authenticated as a verified administrator (`isAdmin()`).
2. **Read-Only Public Data**: Public collateral such as Pages, Promotions, Education, News, Tournaments, Master Traders, and Deposit Methods are globally readable but strictly immutable (no write, update, or delete access) for all non-admin users.
3. **Transaction Rigor**: Users can only create Deposits and Withdrawals for their own profiles. Only Admins can modify their processing status.
4. **Ticket Confidentiality**: Support tickets and ticket messages are strictly private to the creating customer and support administrators.

## The "Dirty Dozen" Threat Payloads
These payloads describe attempts to bypass security controls and must result in `PERMISSION_DENIED`:

1. **Self-Appointed Admin Role**: Malicious user attempts to write to `/admins/{anyUserId}`.
2. **Balance Grafting**: Malicious user attempts to increase their balance inside `/users/{otherUserId}`.
3. **Impersonate Deposit Maker**: Malicious user submits a deposit inside `/deposits/{id}` containing a foreign `userId`.
4. **Steal Other User's Credit**: Malicious user attempts to retrieve deposits of another user.
5. **Manipulate Market Price**: Client attempts to write directly into `/markets/{id}` to manipulate assets dynamically.
6. **Publish Fraudulent Promo**: Client attempts to directly create an entry in `/promotions/{id}`.
7. **Read Other User's Ticket**: A user tries to query list `/tickets` or access a specific ticket `/tickets/{targetTicket}` belonging to another client.
8. **Alter Terminal Settle State**: A client attempts to settle another user's closed trade.
9. **Tamper System Audit Logs**: A regular user tries to submit or edit records directly inside `/systemLogs/`.
10. **Bypass KYC Review**: A user tries to overwrite their status in `kycRequests` to approved without admin credentials.
11. **Inject Invalid Characters into document IDs**: Exploiting path parsing anomalies by supplying corrupted string tokens.
12. **Global Query Scraping**: Issuing a blanket listing on private tables like `/deposits` or `/tickets` without relational owner clause.

---

## The Secure Rule Definition
The rules verify authentication and authorization checks using deep relational verification (`resource.data`) and administrative identity lookup.
