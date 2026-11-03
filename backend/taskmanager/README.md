# Task Management API

## Project Overview
A Task Management application built using Spring Boot, Java 21, Spring Data JPA, Spring Security and H2 Database. The application allows users to register, log in, and manage their personal tasks.

## Technologies Used
- Java 21
- Spring Boot
- Spring Data JPA
- Spring Security
- Maven
- H2 Database
- PostgreSQL Schema
- React.js
- Axios

## Backend Setup
1. Open the backend project in your IDE.
2. Make sure Java 21 is installed.
3. Run the Spring Boot application.
4. Backend runs at:

`http://localhost:8080`

## Database Configuration
The project currently uses an H2 in-memory database.

- JDBC URL: `jdbc:h2:mem:taskdb`
- Username: `sa`
- Password: (blank)
- H2 Console: `http://localhost:8080/h2-console`

The PostgreSQL schema is available at:

`database/schema.sql`

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Register user |
| POST | `/login` | User login |
| POST | `/tasks` | Create task |
| GET | `/tasks?username={username}` | Get user's tasks |
| PUT | `/tasks/{id}?username={username}` | Update task |
| DELETE | `/tasks/{id}?username={username}` | Delete task |

## Frontend Setup
1. Open the frontend project folder.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open the Vite URL shown in the terminal.

## Running the Application
Start the Spring Boot backend first, then start the React frontend.

## Notes
The current application uses H2 for runtime database operations. The PostgreSQL schema is provided separately in the database folder.
