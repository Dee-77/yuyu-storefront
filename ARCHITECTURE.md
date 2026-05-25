# Yuyu Storefront — Architecture & System Design

## Overview

Yuyu Storefront is a modern, responsive single-page e-commerce application (SPA) designed for a premium online shopping experience. It simulates a full production-level storefront similar to modern platforms such as Apple Store and Shopify.

The system includes:
- A fully client-side React-based frontend
- A lightweight FastAPI backend for persistence and admin operations
- A modular state management system
- A hash-based routing system for deployment flexibility
- Optional multilingual and theme support

The goal of this project is to deliver a scalable, clean, and production-style e-commerce architecture that can run without heavy build tools or complex deployment pipelines.

---

## Core Philosophy

This project is designed around the following principles:

### 1. Simplicity of Deployment
The application runs entirely in the browser using ES modules and CDN dependencies. No bundler, no build step, and no server-side rendering is required for the frontend.

### 2. Separation of Concerns
Frontend, backend, state management, and UI components are strictly separated to improve maintainability.

### 3. Progressive Enhancement
The system works fully offline with fallback data and gracefully integrates backend features when available.

### 4. Scalable Architecture
The structure allows easy extension for:
- additional pages
- new product categories
- enhanced backend features
- third-party integrations

---

## System Architecture

The system consists of two major layers:

### 1. Frontend Layer (SPA)

Built using:
- React 19.2.0 (CDN-based)
- htm (JSX alternative using template literals)
- Tailwind CSS (CDN)

#### Key Characteristics:
- No build tools required
- Fully client-rendered
- Component-based architecture
- Hash-based routing system

---

### 2. Backend Layer (API Server)

Built using:
- FastAPI (Python)
- JSON file-based persistence (lightweight database alternative)

#### Responsibilities:
- Admin authentication
- Product management (CRUD)
- Order processing
- Contact form submissions
- Product rating updates
- Profile and branding settings

---

## Frontend Architecture

### Entry Point

The application starts from:
- `index.html` → loads CDN dependencies and root container
- `src/main.js` → initializes React application

---

### Rendering System

The UI uses:
- `React.createElement` + `htm`
- No JSX compilation step

Example pattern:
```js
html`<div className="text-lg">Hello</div>`