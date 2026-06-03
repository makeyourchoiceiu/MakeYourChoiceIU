import type { StudentAuthResponse } from '../types/auth';

export const MOCK_STUDENT_EMAIL = 'student.mock@iu.local';

export const mockStudentAuthResponse: StudentAuthResponse = {
    student_id: 999001,
    role: 'student',
    email: MOCK_STUDENT_EMAIL,
    student_data: {
        iteration_id: 202601,
        deadline: '2026-09-15T12:00:00Z',
        available_electives: [
            {
                elective_type: 'TECH',
                priorities: 3,
                electives: [
                    {
                        id: 8101,
                        name: 'Applied Backend Design',
                        instructor: 'A. Ivanov',
                        description: 'Service boundaries, contracts, and reliability basics.',
                        elective_language: 'english',
                        prerequisite: 'None',
                    },
                    {
                        id: 8102,
                        name: 'Distributed Systems for Product Teams',
                        instructor: 'N. Smirnova',
                        description: 'Queues, retries, idempotency, and observability in practice.',
                        elective_language: 'english',
                        prerequisite: 'Basic programming',
                    },
                    {
                        id: 8103,
                        name: 'Cloud Cost Optimization',
                        instructor: 'D. Petrov',
                        description: 'How to design and run infra with predictable cloud spend.',
                        elective_language: 'russian',
                        prerequisite: 'None',
                    },
                    {
                        id: 8104,
                        name: 'Golang for Scalable APIs',
                        instructor: 'V. Sidorov',
                        description: 'Patterns for API services with Go and PostgreSQL.',
                        elective_language: 'english',
                        prerequisite: 'Basic backend',
                    },
                ],
            },
            {
                elective_type: 'HUM',
                priorities: 2,
                electives: [
                    {
                        id: 8201,
                        name: 'Public Speaking for Engineers',
                        instructor: 'M. Volkova',
                        description: 'Concise communication for demos, interviews, and meetings.',
                        elective_language: 'english',
                        prerequisite: 'None',
                    },
                    {
                        id: 8202,
                        name: 'Critical Thinking',
                        instructor: 'E. Morozov',
                        description: 'Tools for analyzing arguments and decision quality.',
                        elective_language: 'russian',
                        prerequisite: 'None',
                    },
                    {
                        id: 8203,
                        name: 'Writing for Product Teams',
                        instructor: 'I. Karpova',
                        description: 'Product docs, specs, and concise async writing.',
                        elective_language: 'english',
                        prerequisite: 'None',
                    },
                ],
            },
        ],
        chosen_electives: [
            {
                elective_type: 'TECH',
                electives: [
                    {
                        priority: 1,
                        elective: {
                            id: 8104,
                            name: 'Golang for Scalable APIs',
                            instructor: 'V. Sidorov',
                            description: 'Patterns for API services with Go and PostgreSQL.',
                            elective_language: 'english',
                            prerequisite: 'Basic backend',
                        },
                    },
                    {
                        priority: 2,
                        elective: {
                            id: 8102,
                            name: 'Distributed Systems for Product Teams',
                            instructor: 'N. Smirnova',
                            description: 'Queues, retries, idempotency, and observability in practice.',
                            elective_language: 'english',
                            prerequisite: 'Basic programming',
                        },
                    },
                    {
                        priority: 3,
                        elective: {
                            id: 8101,
                            name: 'Applied Backend Design',
                            instructor: 'A. Ivanov',
                            description: 'Service boundaries, contracts, and reliability basics.',
                            elective_language: 'english',
                            prerequisite: 'None',
                        },
                    },
                ],
            },
        ],
    },
};
