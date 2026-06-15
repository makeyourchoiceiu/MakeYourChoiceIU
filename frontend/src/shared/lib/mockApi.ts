import { Course } from '@/shared/types/course'

// Mock courses data
export const mockCourses: Course[] = [
  {
    id: '1',
    title: 'AARF – All About Radio Frequencies',
    language: 'English',
    format: 'online',
    instructor: 'Pierre-Philipp Braun',
    description: 'Wireless technologies play an important role in modern computing systems. Devices communicate using radio frequencies in applications ranging from wireless networking to embedded and IoT systems. Understanding how these technologies operate helps students better understand how modern devices communicate and interact.\n' +
      '\n' +
      'This course introduces the basic concepts of radio frequency communication and explores common wireless technologies used in everyday systems. The course will focus on practical understanding and demonstrations of how wireless communication works.\n' +
      '\n' +
      'The course will be centered around four main areas:\n' +
      'Radio Frequencies\n' +
      'Bluetooth\n' +
      'Wi-Fi\n' +
      'Embedded Systems\n',
    type: 'tech',
    yearOfStudy: [2],
    program: ['RO', 'SD', "AAI"],
    isArchived: false,
  },
  {
    id: '2',
    title: 'Haskell',
    language: 'English',
    format: 'offline',
    instructor: 'Nikolay Kudasov',
    description: 'The main purpose of this course is to present purely functional programming with a strong static type system and discuss its benefits for structuring...',
    type: 'tech',
    yearOfStudy: [1],
    program: ['CSE', 'DSAI'],
    isArchived: false,
  },
  {
    id: '3',
    title: 'Introduction to Music Generation',
    language: 'English',
    format: 'offline',
    instructor: 'Munir Makhmutov',
    description: 'The target audience of this course are students interested in music generation...',
    type: 'tech',
    yearOfStudy: [1],
    program: ['MFAI'],
    isArchived: false,
  },
  {
    id: '4',
    title: 'Deep Learning for Search',
    language: 'English',
    format: 'online',
    instructor: 'Albert Nasybulin',
    description: 'The course covers essential concepts, approaches and architectures of modern deep learning-based search applications. The students will learn to implement modern deep learning models from scratch, design and evaluate machine learning pipelines, optimize and boost deep learning models and implement “state-of-the-art” solutions based on Large Language Models, such as Retrieval Augmented Generation. By the end of the course, students will have a comprehensive understanding of design principles and architectures of nowadays search applications and skills to implement the one “from scratch”. The course is delivered  by  employees of “MTS” and based on  their practical experience and real-life products.\n' +
      '\n' +
      '\n' +
      '**Prerequisites**\n' +
      '1. comprehensive knowledge of Machine Learning models and principals\n' +
      '2. solid Python background\n' +
      '3. practical knowledge of linear algebra\n' +
      '4. basic knowledge of Computer Vision and Digital Signal Processing\n' +
      '\n' +
      '\n' +
      'Intended learning outcomes\n' +
      'The course provides knowledge and skills needed to design and develop Deep Learning based search applications for different types of data (text, images, audio), optimize performance and inference of Deep Learning models and maintain those models as microservices. \n' +
      '\n' +
      '\n' +
      '**List of Topics**\n' +
      'The course is focused on Project-Based Learning (PBS) and Competition-Based Learning (CBL), including final project presentation . Main course sections are:\n' +
      '+ Introduction into Deep Learning-based search\n' +
      '+ Modern Deep Learning models for search\n' +
      '+ Model comparison and selection: Deep Learning experimental pipeline\n' +
      '+ Search indexes and their applications\n' +
      '+ Deep Learning models optimization\n' +
      '+ Metrics of search quality\n' +
      '+ Search over audio and visual data\n' +
      '+ Retrieval Augmented Generation\n' +
      '\n' +
      '\n' +
      'Course duration: 8 lectures and 8 practices.\n',
    type: 'tech',
    yearOfStudy: [1],
    program: ['CSE', 'DSAI'],
    isArchived: false,
  },
  {
    id: '5',
    title: 'Advanced Markdown',
    language: 'English',
    format: 'online',
    instructor: 'John Markdown',
    description: '---\n' +
      '__Advertisement :)__\n' +
      '\n' +
      '- __[pica](https://nodeca.github.io/pica/demo/)__ - high quality and fast image\n' +
      '  resize in browser.\n' +
      '- __[babelfish](https://github.com/nodeca/babelfish/)__ - developer friendly\n' +
      '  i18n with plurals support and easy syntax.\n' +
      '\n' +
      'You will like those projects!\n' +
      '\n' +
      '---\n' +
      '\n' +
      '# h1 Heading 8-)\n' +
      '## h2 Heading\n' +
      '### h3 Heading\n' +
      '#### h4 Heading\n' +
      '##### h5 Heading\n' +
      '###### h6 Heading\n' +
      '\n' +
      '\n' +
      '## Horizontal Rules\n' +
      '\n' +
      '___\n' +
      '\n' +
      '---\n' +
      '\n' +
      '***\n' +
      '\n' +
      '\n' +
      '## Typographic replacements\n' +
      '\n' +
      'Enable typographer option to see result.\n' +
      '\n' +
      '(c) (C) (r) (R) (tm) (TM) (p) (P) +-\n' +
      '\n' +
      'test.. test... test..... test?..... test!....\n' +
      '\n' +
      '!!!!!! ???? ,,  -- ---\n' +
      '\n' +
      '"Smartypants, double quotes" and \'single quotes\'\n' +
      '\n' +
      '\n' +
      '## Emphasis\n' +
      '\n' +
      '**This is bold text**\n' +
      '\n' +
      '__This is bold text__\n' +
      '\n' +
      '*This is italic text*\n' +
      '\n' +
      '_This is italic text_\n' +
      '\n' +
      '~~Strikethrough~~\n' +
      '\n' +
      '\n' +
      '## Blockquotes\n' +
      '\n' +
      '\n' +
      '> Blockquotes can also be nested...\n' +
      '>> ...by using additional greater-than signs right next to each other...\n' +
      '> > > ...or with spaces between arrows.\n' +
      '\n' +
      '\n' +
      '## Lists\n' +
      '\n' +
      'Unordered\n' +
      '\n' +
      '+ Create a list by starting a line with `+`, `-`, or `*`\n' +
      '+ Sub-lists are made by indenting 2 spaces:\n' +
      '  - Marker character change forces new list start:\n' +
      '    * Ac tristique libero volutpat at\n' +
      '    + Facilisis in pretium nisl aliquet\n' +
      '    - Nulla volutpat aliquam velit\n' +
      '+ Very easy!\n' +
      '\n' +
      'Ordered\n' +
      '\n' +
      '1. Lorem ipsum dolor sit amet\n' +
      '2. Consectetur adipiscing elit\n' +
      '3. Integer molestie lorem at massa\n' +
      '\n' +
      '\n' +
      '1. You can use sequential numbers...\n' +
      '1. ...or keep all the numbers as `1.`\n' +
      '\n' +
      'Start numbering with offset:\n' +
      '\n' +
      '57. foo\n' +
      '1. bar\n' +
      '\n' +
      '\n' +
      '## Code\n' +
      '\n' +
      'Inline `code`\n' +
      '\n' +
      'Indented code\n' +
      '\n' +
      '    // Some comments\n' +
      '    line 1 of code\n' +
      '    line 2 of code\n' +
      '    line 3 of code\n' +
      '\n' +
      '\n' +
      'Block code "fences"\n' +
      '\n' +
      '```\n' +
      'Sample text here...\n' +
      '```\n' +
      '\n' +
      'Syntax highlighting\n' +
      '\n' +
      '``` js\n' +
      'var foo = function (bar) {\n' +
      '  return bar++;\n' +
      '};\n' +
      '\n' +
      'console.log(foo(5));\n' +
      '```\n' +
      '\n' +
      '## Tables\n' +
      '\n' +
      '| Option | Description |\n' +
      '| ------ | ----------- |\n' +
      '| data   | path to data files to supply the data that will be passed into templates. |\n' +
      '| engine | engine to be used for processing templates. Handlebars is the default. |\n' +
      '| ext    | extension to be used for dest files. |\n' +
      '\n' +
      'Right aligned columns\n' +
      '\n' +
      '| Option | Description |\n' +
      '| ------:| -----------:|\n' +
      '| data   | path to data files to supply the data that will be passed into templates. |\n' +
      '| engine | engine to be used for processing templates. Handlebars is the default. |\n' +
      '| ext    | extension to be used for dest files. |\n' +
      '\n' +
      '\n' +
      '## Links\n' +
      '\n' +
      '[link text](http://dev.nodeca.com)\n' +
      '\n' +
      '[link with title](http://nodeca.github.io/pica/demo/ "title text!")\n' +
      '\n' +
      'Autoconverted link https://github.com/nodeca/pica (enable linkify to see)\n' +
      '\n' +
      '\n' +
      '## Images\n' +
      '\n' +
      '![Minion](https://octodex.github.com/images/minion.png)\n' +
      '![Stormtroopocat](https://octodex.github.com/images/stormtroopocat.jpg "The Stormtroopocat")\n' +
      '\n' +
      'Like links, Images also have a footnote style syntax\n' +
      '\n' +
      '![Alt text][id]\n' +
      '\n' +
      'With a reference later in the document defining the URL location:\n' +
      '\n' +
      '[id]: https://octodex.github.com/images/dojocat.jpg  "The Dojocat"\n' +
      '\n' +
      '\n' +
      '## Plugins\n' +
      '\n' +
      'The killer feature of `markdown-it` is very effective support of\n' +
      '[syntax plugins](https://www.npmjs.org/browse/keyword/markdown-it-plugin).\n' +
      '\n' +
      '\n' +
      '### [Emojies](https://github.com/markdown-it/markdown-it-emoji)\n' +
      '\n' +
      '> Classic markup: :wink: :cry: :laughing: :yum:\n' +
      '>\n' +
      '> Shortcuts (emoticons): :-) :-( 8-) ;)\n' +
      '\n' +
      'see [how to change output](https://github.com/markdown-it/markdown-it-emoji#change-output) with twemoji.\n' +
      '\n' +
      '\n' +
      '### [Subscript](https://github.com/markdown-it/markdown-it-sub) / [Superscript](https://github.com/markdown-it/markdown-it-sup)\n' +
      '\n' +
      '- 19^th^\n' +
      '- H~2~O\n' +
      '\n' +
      '\n' +
      '### [\\<ins>](https://github.com/markdown-it/markdown-it-ins)\n' +
      '\n' +
      '++Inserted text++\n' +
      '\n' +
      '\n' +
      '### [\\<mark>](https://github.com/markdown-it/markdown-it-mark)\n' +
      '\n' +
      '==Marked text==\n' +
      '\n' +
      '\n' +
      '### [Footnotes](https://github.com/markdown-it/markdown-it-footnote)\n' +
      '\n' +
      'Footnote 1 link[^first].\n' +
      '\n' +
      'Footnote 2 link[^second].\n' +
      '\n' +
      'Inline footnote^[Text of inline footnote] definition.\n' +
      '\n' +
      'Duplicated footnote reference[^second].\n' +
      '\n' +
      '[^first]: Footnote **can have markup**\n' +
      '\n' +
      '    and multiple paragraphs.\n' +
      '\n' +
      '[^second]: Footnote text.\n' +
      '\n' +
      '\n' +
      '### [Definition lists](https://github.com/markdown-it/markdown-it-deflist)\n' +
      '\n' +
      'Term 1\n' +
      '\n' +
      ':   Definition 1\n' +
      'with lazy continuation.\n' +
      '\n' +
      'Term 2 with *inline markup*\n' +
      '\n' +
      ':   Definition 2\n' +
      '\n' +
      '        { some code, part of Definition 2 }\n' +
      '\n' +
      '    Third paragraph of definition 2.\n' +
      '\n' +
      '_Compact style:_\n' +
      '\n' +
      'Term 1\n' +
      '  ~ Definition 1\n' +
      '\n' +
      'Term 2\n' +
      '  ~ Definition 2a\n' +
      '  ~ Definition 2b\n' +
      '\n' +
      '\n' +
      '### [Abbreviations](https://github.com/markdown-it/markdown-it-abbr)\n' +
      '\n' +
      'This is HTML abbreviation example.\n' +
      '\n' +
      'It converts "HTML", but keep intact partial entries like "xxxHTMLyyy" and so on.\n' +
      '\n' +
      '*[HTML]: Hyper Text Markup Language\n' +
      '\n' +
      '### [Custom containers](https://github.com/markdown-it/markdown-it-container)\n' +
      '\n' +
      '::: warning\n' +
      '*here be dragons*\n' +
      ':::\n',
    type: 'math',
    yearOfStudy: [1],
    program: ['CSE', 'DSAI'],
    isArchived: false,
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch all courses
export const fetchCourses = async (): Promise<Course[]> => {
  await delay(500);
  return [...mockCourses];
};

// Fetch a single course by id
export const fetchCourseById = async (id: string): Promise<Course | undefined> => {
  await delay(300);
  return mockCourses.find(c => c.id === id);
};

// For the sidebar: get currently enrolled courses for a specific student.
// In a real app this would be user‑specific. For mock, we just return a subset.
export const fetchMyEnrolledCourses = async (studentId: string = 'me'): Promise<Course[]> => {
  await delay(400);
  // For demo, assume student enrolled in course id '1' and '2'
  const enrolledIds = ['1', '2'];
  return mockCourses.filter(c => enrolledIds.includes(c.id));
};

export const generateMockCourses = (count: number): Course[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `course-${i + 1}`,
    title: `Elective Course ${i + 1}`,
    language: i % 2 === 0 ? 'English' : 'Russian',
    format: i % 2 === 0 ? 'offline' : 'online',
    instructor: `Instructor ${i + 1}`,
    description: `This is a description for course ${i + 1}`,
    type: i % 3 === 0 ? 'tech' : i % 3 === 1 ? 'hum' : 'math',
    yearOfStudy: [1, 2, 3, 4],
    program: ['CSE', 'DSAI', 'SD', 'CBS', 'DS', 'AAI', 'RO', 'MFAI', 'AI360'],
    isArchived: i > 10,
  }));
};