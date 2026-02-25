// src/api/electives.ts
// Мок для getElectives({ groupId, type })

export type ElectiveType = 'tech' | 'hum' | 'math' | 'custom';

export type Elective = {
    id: string;
    type: ElectiveType;
    title: string;
    teacher: string;
    language: 'EN' | 'RU';
    program: string;
    year: number;
    description: string;
};

type GetElectivesParams = {
    groupId: string;
    type?: ElectiveType;
};

// --- helpers ---
const pick = <T,>(arr: T[], i: number) => arr[i % arr.length];

function makeId(type: ElectiveType, n: number) {
    return `${type}-${String(n).padStart(2, '0')}`;
}

function longDescription(topic: string, angle: string, outcomes: string[]) {
    const p1 = `This elective explores ${topic} through the lens of ${angle}. We’ll start from first principles and quickly move to practical decision-making: how to frame the problem, choose the right tools, and evaluate trade-offs in real projects. Expect short lectures, lots of examples, and guided discussions that connect theory to “what you’d actually do” on a team.`;

    const p2 = `By the end, you should be comfortable with: ${outcomes.join(
        ', '
    )}. The course is designed to be portfolio-friendly: each module ends with a small deliverable you can polish into a case study. If you like learning by building and reflecting on why things work, you’ll feel at home.`;

    return `${p1}\n\n${p2}`;
}

// --- catalog seeds ---
const PROGRAMS = ['MFAI', 'RO', 'AI360', 'DSAI', 'CSE'];
const TEACHERS = [
    'Dr. K. Orlov',
    'A. Petrova',
    'M. Chen',
    'S. Nakamura',
    'I. Karimov',
    'E. Smirnova',
    'J. Alvarez',
    'N. Volkova',
    'P. Singh',
    'L. Johnson',
];

const TECH_TITLES = [
    'Mobile Systems Design: From APIs to Offline',
    'SwiftUI Animations & Interaction Patterns',
    'Flutter Architecture: State, Layers, Testing',
    'Backend for Mobile: Auth, Sync, Push',
    'Product Analytics for Apps',
    'Secure Coding & Threat Modeling',
    'Performance Profiling: CPU, Memory, Network',
    'Design Systems in Practice',
    'CI/CD for Mobile Apps',
    'Practical Accessibility (a11y) Engineering',
    'Realtime Apps: WebSockets & Streaming UX',
    'Data Storage: SQLite, Caches, Consistency',
];

const HUM_TITLES = [
    'Critical Thinking for Engineers',
    'Digital Ethics & Responsible Tech',
    'Psychology of Attention and Habit',
    'Writing for Tech: Clarity & Persuasion',
    'Negotiation and Conflict for Teams',
    'Storytelling with Data',
    'Sociology of Platforms and Communities',
    'Leadership Without Authority',
    'Philosophy of Technology',
    'Cross-cultural Communication',
    'Law Basics for IT Projects',
    'Design Critique: How to Give Feedback',
];

const MATH_TITLES = [
    'Linear Algebra for ML Engineers',
    'Optimization: From Gradients to Constraints',
    'Probability for Real-World Modeling',
    'Discrete Math for CS: Graphs & Logic',
    'Statistics: Inference and Uncertainty',
    'Numerical Methods for Computing',
    'Time Series Fundamentals',
    'Information Theory: Signals and Compression',
    'Geometry for Computer Vision',
    'Game Theory and Decision Models',
    'Matrix Factorization & Recommenders',
    'Stochastic Processes',
];

const CUSTOM_TITLES = [
    'Cozy App Design: Dreamy Interfaces & Motion',
    'Fairy Garden Focus: Behavioral Design Studio',
    'Creative Coding for UI (Generative Patterns)',
    'Sound & Haptics: Emotional Feedback',
    'Product Craft: Small Details, Big Impact',
    'Human-Centered AI in Consumer Apps',
    'Building Communities Around Products',
    'Designing for Calm: Anti-Doomscroll UX',
    'Experimental Prototyping Sprint',
    'Micro-interactions Masterclass',
    'Visual Identity for Digital Products',
    'Narrative UX: Interfaces as Stories',
];

function buildElectives(type: ElectiveType, titles: string[]) {
    return titles.map((title, idx) => {
        const i = idx + 1;

        const teacher = pick(TEACHERS, idx);
        const program = pick(PROGRAMS, idx);
        const language: 'EN' | 'RU' = idx % 3 === 0 ? 'RU' : 'EN';
        const year = (idx % 4) + 1;

        // type-specific description ingredients
        const desc =
            type === 'tech'
                ? longDescription(
                    title.toLowerCase(),
                    'hands-on engineering constraints (latency, reliability, maintainability)',
                    [
                        'designing clean interfaces',
                        'debugging and profiling bottlenecks',
                        'making pragmatic architecture choices',
                        'writing tests that catch regressions',
                        'documenting decisions for future you',
                    ]
                )
                : type === 'hum'
                    ? longDescription(
                        title.toLowerCase(),
                        'how people think, communicate, and coordinate',
                        [
                            'structuring arguments',
                            'spotting common reasoning errors',
                            'giving and receiving feedback',
                            'navigating ethical dilemmas in product work',
                            'writing with clarity under time pressure',
                        ]
                    )
                    : type === 'math'
                        ? longDescription(
                            title.toLowerCase(),
                            'mathematical intuition that supports engineering decisions',
                            [
                                'reading formulas without fear',
                                'translating assumptions into models',
                                'sanity-checking results',
                                'understanding limits of methods',
                                'connecting theory to implementation details',
                            ]
                        )
                        : longDescription(
                            title.toLowerCase(),
                            'creative product craft and experimentation',
                            [
                                'building a small but polished prototype',
                                'iterating via critique',
                                'using motion/visuals intentionally',
                                'balancing “cute” with usability',
                                'telling a strong story in your portfolio',
                            ]
                        );

        return {
            id: makeId(type, i),
            type,
            title,
            teacher,
            language,
            program,
            year,
            description: desc,
        } satisfies Elective;
    });
}

const MOCK_ELECTIVES: Elective[] = [
    ...buildElectives('tech', TECH_TITLES),
    ...buildElectives('hum', HUM_TITLES),
    ...buildElectives('math', MATH_TITLES),
    ...buildElectives('custom', CUSTOM_TITLES),
];

// --- api mock ---
export async function getElectives(params: GetElectivesParams): Promise<Elective[]> {
    const { type } = params;

    // имитация сети
    await new Promise((r) => setTimeout(r, 250));

    const data = type ? MOCK_ELECTIVES.filter((e) => e.type === type) : MOCK_ELECTIVES;

    // можно, если надо, ещё сортировать/фильтровать по groupId (пока игнорируем)
    return data;
}