export interface AnswerChoice {
    id: number;
    text: string;
}

export interface Question {
    id: number;
    text: string;
    question_type: 'multiple_choice' | 'select_all';
    order: number;
    choices: AnswerChoice[];
}

export interface Quiz {
    id: number;
    title: string;
    description: string;
    questions: Question[];
}

export interface QuestionResult {
    correct: boolean;
    correct_choices?: {
        id: number;
        text: string;
        rationale: string;
    }[];
}

export interface QuizSubmissionResult {
    score: number;
    total: number;
    results: { [questionId: string]: QuestionResult };
}
