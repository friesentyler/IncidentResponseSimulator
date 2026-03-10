Need to be in the root directory /frontend
to run any Angular related commands.

to run Angular application
```npm start```

to run Angular tests
```ng test```
```npm test -- --watch=false --browsers=ChromeHeadless```

---
</br>

### Quiz Sequence Diagram:
- This is to clarify how to quiz feature works. The key observation to note is that the User GETs the entirety of the quiz, and also POSTs the entirety of the quiz. However, Angular will only render one question of the quiz at a time. The remainder of the quiz (as well as the user's answers) are stored in the angular component.
```mermaid
sequenceDiagram
    participant D as User
    participant C as Angular Client
    participant A as Django API (DRF)
    participant B as SQLlite

    D->>C: Click "Start Quiz"
    C->>A: GET /quiz/{id}
    A->>B: Retrieve questions for quiz {id}
    A->>C: 200 OK: Return quiz questions in JSON
    Note over C,D: Only one question displayed at a time
    Note over C,D: all data for quiz is stored on frontend at this point
    C->>D: Angular serves quiz component
    D->>C: Click "Finish Quiz"
    C->>A: POST /quiz/{id} - Body: quiz answers in JSON
    A->>B: Compare quiz answers to DB answers
    A->>C: 200 OK: score in JSON
    C->>D: Angular serves score component
```
