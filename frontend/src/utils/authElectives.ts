import type { Elective } from '../types/elective';
import type { StudentDataResponse } from '../types/auth';

export function mapStudentDataToElectives(studentData: StudentDataResponse): Elective[] {
    return studentData.available_electives.flatMap((group) =>
        group.electives.map((elective) => ({
            id: elective.id,
            name: elective.name,
            instructor: elective.instructor,
            description: elective.description,
            electiveLanguage: elective.elective_language,
            status: 0,
            prerequisite: elective.prerequisite,
            electiveType: group.elective_type,
            programLanguage: '',
            degreeYear: [],
        }))
    );
}