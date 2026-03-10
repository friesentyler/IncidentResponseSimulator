import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Quiz, QuizSubmissionResult } from '../models/quiz.model';

@Injectable({
    providedIn: 'root'
})
export class QuizService {
    private apiUrl = `${environment.apiUrl.replace(/\/$/, '')}/quiz`;

    constructor(private http: HttpClient) { }

    getQuiz(scenarioId: number): Observable<Quiz> {
        return this.http.get<Quiz>(`${this.apiUrl}/${scenarioId}/`);
    }

    submitQuiz(scenarioId: number, answers: { [questionId: string]: number[] }): Observable<QuizSubmissionResult> {
        return this.http.post<QuizSubmissionResult>(`${this.apiUrl}/${scenarioId}/`, { answers });
    }
}
