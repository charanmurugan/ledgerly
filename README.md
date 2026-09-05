# Ledgerly — Single Spring Boot + React + PostgreSQL bundle

## What changed
Ledgerly is now packaged so the **Spring Boot application serves the React UI**.

You only need to start the Java application. You do NOT need to separately run `npm run dev` for the hosted application.

Flow:

Browser
  ↓
Spring Boot :8080
  ├── React UI (/)
  └── REST API (/api/*)
        ↓
     PostgreSQL

## Requirements
- Java 21+
- Maven 3.9+
- PostgreSQL 14+

Node.js/npm are NOT required on your machine when using Maven: the build automatically downloads a pinned Node/npm runtime and builds the frontend.

## PostgreSQL configuration

Set these environment variables:

DB_URL=jdbc:postgresql://HOST:5432/DATABASE
DB_USERNAME=YOUR_USERNAME
DB_PASSWORD=YOUR_PASSWORD

If omitted, the development defaults are:
jdbc:postgresql://localhost:5432/ledgerly
postgres
postgres

## Run everything with Java/Maven

From the `backend` folder:

    mvn spring-boot:run

Maven will:
1. Install the configured Node/npm runtime for the frontend build.
2. Run `npm install`.
3. Build the React frontend.
4. Copy the frontend into Spring Boot's static resources.
5. Start Spring Boot.
6. Liquibase creates/updates the database schema.
7. Spring Boot serves the UI and APIs from the same application.

Open:

    http://localhost:8080

No separate frontend server is needed.

## Build a single deployable JAR

    cd backend
    mvn clean package

Then:

    java -jar target/ledgerly-1.0.0.jar

Open:

    http://localhost:8080

This is the recommended hosting model for a simple deployment.

## Docker

A backend Dockerfile is included. Configure PostgreSQL environment variables and run:

    docker compose up --build

The application listens on port 8080.

## Current database scope

Transactions are fully connected to PostgreSQL through Spring Data JPA and Liquibase.

The remaining Ledgerly pages are currently UI-ready but their complete server persistence still needs to be implemented.

Google Drive and ChatGPT Sites are intentionally excluded, per request.
