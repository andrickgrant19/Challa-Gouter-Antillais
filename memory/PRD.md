# Chala Le Gouter Antillais - Product Requirements Document

## Overview
Premium bilingual (FR/EN) restaurant website for Chala Le Gouter Antillais, a Caribbean/Antillean restaurant in Montreal, Canada.

**URL**: https://antilles-kitchen.preview.emergentagent.com  
**Last Updated**: 2025

---

## Business Info
- **Name**: Chala Le Gouter Antillais
- **Address**: 11866 Bd Rivière-des-Prairies, Montréal, QC H1C 1P9
- **Phone**: (514) 588-3708
- **Uber Eats**: https://www.ubereats.com/ca-fr/store/chala-le-gouter-antillais/5PogqSjLWTKTUIYfVPvYPw

---

## Architecture

### Frontend (React)
- **Framework**: React 19 + React Router v7
- **Styling**: Tailwind CSS v3 + Custom brand design system
- **Fonts**: Cormorant Garamond (headings) + Outfit (body)
- **Language**: Bilingual FR/EN via LanguageContext + localStorage

### Backend (FastAPI)
- **Framework**: FastAPI + Motor (async MongoDB)
- **Database**: MongoDB (contact_messages collection)
- **Key Endpoints**:
  - GET /api/health
  - POST /api/contact
  - GET /api/contact

### Design System
- brand-orange: #D84315
- brand-green: #1B5E20
- brand-gold: #D4AF37
- brand-cream: #FAF8F5
- brand-black: #111111

---

## Pages Implemented (2025)

### 1. Home (/)
- Hero section with full-screen food background, bilingual headline, 3 CTAs
- Popular Dishes bento grid (Griot, Jerk Chicken, Rice & Beans, Plantains, Patties, Combos)
- Why Choose Us (5 feature cards, dark background)
- About snippet with stats (10+ years, 500+ customers weekly, 100% authentic)
- Reviews snippet (3 testimonials)
- Catering CTA banner
- Google Maps + Contact info section

### 2. Menu (/menu)
- Category filter tabs (All, Griot, Jerk Chicken, Rice & Beans, Plantains, Patties, Combos, Drinks, Desserts)
- Dish cards with images, names, descriptions, spicy indicators
- Uber Eats order banner

### 3. About (/about)
- Brand story in FR/EN
- Values section (4 cards: Authentic Tradition, Fresh Quality, Community Love, Warm Hospitality)
- Mission statement
- Stats display

### 4. Catering (/catering)
- Event types: Birthday, Corporate, Private, Family
- Why choose our catering (6 features)
- Catering inquiry form (submits to /api/contact)

### 5. Reviews (/reviews)
- 4.9/5 overall rating hero
- 6 testimonials grid
- Google reviews CTA

### 6. Contact (/contact)
- Address, phone, hours cards
- Google Maps iframe embed
- Full business hours table
- Contact form (submits to /api/contact)

---

## Key Features
- [x] Fully bilingual FR/EN with language switcher
- [x] Sticky glassmorphism navbar
- [x] Scroll reveal animations (CSS IntersectionObserver)
- [x] Mobile click-to-call floating button
- [x] Uber Eats ordering link
- [x] Google Maps embedded
- [x] Contact/Catering form → MongoDB
- [x] SEO meta tags (FR+EN keywords)
- [x] Mobile-first responsive
- [x] Premium design with brand colors

---

## Backlog / P1 Features
- [ ] Admin panel for menu price editing
- [ ] Online reservation system integration
- [ ] Social media links (Instagram, Facebook)
- [ ] Real restaurant photos when available
- [ ] Google Reviews API integration for live reviews
- [ ] Email notification on contact form submission (SendGrid/Resend)
- [ ] WhatsApp contact button
- [ ] SEO sitemap generation
