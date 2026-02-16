// src/api/electives.ts
import type { Elective, ElectiveType } from '../types/electives';

// Когда появится бэк — можно будет использовать ваш общий API_URL и axios.
// import axios from 'axios';
// const API_URL = 'http://localhost:8000/api';

export type GetElectivesParams = {
    groupId: string;         // учебная группа / поток студента
    type?: ElectiveType;     // 'tech' | 'hum' | 'math' | 'custom'
};

// временный мок (пока бэка нет)
const MOCK: Elective[] = [
    {
        id: 'rbt-101',
        title: 'Intro into Robotics',
        teacher: 'Ivan Petrov',
        language: 'RU',
        program: 'BS1 DSAI, BS1 CSE',
        year: 1,
        description: 'Robots, sensors, control… ' + 'Long text '.repeat(20),
        type: 'tech',
    },
    {
        id: 'psy-201',
        title: 'Psychology of Decision Making',
        teacher: 'Anna Smirnova',
        language: 'EN',
        program: 'BS1 DSAI',
        year: 1,
        description: 'Biases, heuristics, experiments, Kahneman & Tversky. ' + 'Long text '.repeat(10),
        type: 'hum',
    },
    {
        id: 'lin-110',
        title: 'Linear Algebra',
        teacher: 'Sergey Ivanov',
        language: 'EN',
        program: 'BS1',
        year: 1,
        description: 'Vectors, matrices, eigenvalues, SVD. ' + 'Long text '.repeat(10),
        type: 'math',
    },

    // --- добавила ещё ---
    {
        id: 'ds-210',
        title: 'Data Visualization',
        teacher: 'Maria Volkova',
        language: 'EN',
        program: 'BS1 DSAI',
        year: 1,
        description: 'Charts, dashboards, storytelling with data.',
        type: 'tech',
    },
    {
        id: 'web-120',
        title: 'Web Development Fundamentals',
        teacher: 'Denis Karimov',
        language: 'RU',
        program: 'BS1 CSE',
        year: 1,
        description: 'HTML/CSS, React basics, client-server communication.',
        type: 'tech',
    },
    {
        id: 'ml-330',
        title: 'Machine Learning Basics',
        teacher: 'Elena Sokolova',
        language: 'EN',
        program: 'BS1 DSAI',
        year: 1,
        description: 'Supervised learning, regression, classification, evaluation.',
        type: 'tech',
    },
    {
        id: 'eth-140',
        title: 'Ethics in AI',
        teacher: 'Olga Kuznetsova',
        language: 'EN',
        program: 'BS1',
        year: 1,
        description: 'Fairness, accountability, transparency. Real-world cases.',
        type: 'hum',
    },
    {
        id: 'com-160',
        title: 'Academic Communication',
        teacher: 'John Smith',
        language: 'EN',
        program: 'BS1',
        year: 1,
        description: 'Presentations, writing, argumentation, peer review.',
        type: 'hum',
    },
    {
        id: 'his-170',
        title: 'History of Technology',
        teacher: 'Irina Pavlova',
        language: 'RU',
        program: 'BS1',
        year: 1,
        description: 'From steam engines to computers. Social impact of tech.',
        type: 'hum',
    },
    {
        id: 'prob-220',
        title: 'Probability and Statistics',
        teacher: 'Alexey Morozov',
        language: 'EN',
        program: 'BS1',
        year: 1,
        description: 'Random variables, distributions, hypothesis testing.',
        type: 'math',
    },
    {
        id: 'opt-240',
        title: 'Optimization Methods',
        teacher: 'Nikolay Fedorov',
        language: 'EN',
        program: 'BS1',
        year: 1,
        description: 'Gradient descent, convex optimization, constrained problems.',
        type: 'math',
    },
];

/**
 * Получить список элективов по учебной группе (groupId) и типу (type).
 * Пока что возвращаем мок-данные. Когда появится бэк — заменишь реализацю на axios/fetch.
 */
export async function getElectives(params: GetElectivesParams): Promise<Elective[]> {
    // TODO: заменить на реальный запрос:
    // return axios
    //   .get<Elective[]>(`${API_URL}/electives`, { params })
    //   .then((r) => r.data);

    // имитация сети
    await new Promise((r) => setTimeout(r, 250));

    const { type } = params;

    return type ? MOCK.filter((e) => e.type === type) : MOCK;
}
