# Akib Ledger

A simple, modern ledger for tracking who owes what. Matrix (neon green) and Bonita (pink) themes. Firebase login, real-time updates, and payment confirmations.

## What it does
- Anyone can view the ledger
- Sign up (Google or email) to request payment confirmation
- Only admin can add/edit/delete or mark as paid
- All data is in Firestore, not your device

## How to use
1. Open the site
2. Log in or sign up (Google/email)
3. Admin? You can add, edit, delete, mark paid, see all requests
4. Not admin? You can request payment confirmation on your entries
5. Click the palette button (bottom right) to switch between Matrix and Bonita themes

## Payment requests
- Users: Click to request payment confirmation, add a note if you want
- Admin: Click the green badge in the header to see all requests, accept (mark paid) or reject

## Tech
- Firebase Auth & Firestore
- Vanilla JS, HTML, CSS
- Font Awesome icons

## Currency
- All amounts are in Bangladeshi Taka (৳)

---
That’s it. No nonsense. Just a clean ledger with a cool theme switcher.
