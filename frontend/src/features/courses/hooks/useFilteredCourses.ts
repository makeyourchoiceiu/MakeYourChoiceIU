import {useMemo} from 'react';
import {useDebounce} from '@/hooks/useDebounce';
import {Course} from '@/shared/types/course';
import {useCourseFilterStore} from '@/stores/courseFilterStore';
import {useProfileStore} from '@/stores/profileStore';

export const useFilteredCourses = (allCourses: Course[]) => {
  const { student } = useProfileStore();
  const { searchTerm, languageFilter, formatFilter, typeFilter } = useCourseFilterStore();

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Filter by student's completed, year, program
  const relevantCourses = useMemo(() => {
    if (!student) return allCourses;
    return allCourses.filter(
      (course) =>
        !student.completedCourses.includes(course.id) &&
        course.yearOfStudy?.includes(student.yearOfStudy) &&
        course.program?.includes(student.program)
    );
  }, [allCourses, student]);

  // Apply search & filters
  return useMemo(() => {
    return relevantCourses.filter((course) => {
      const matchesSearch =
        debouncedSearchTerm === '' || course.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      const matchesLanguage = languageFilter === 'all' || course.language === languageFilter;
      const matchesFormat = formatFilter === 'all' || course.format === formatFilter;
      const matchesType = typeFilter === 'all' || course.type === typeFilter;
      return matchesSearch && matchesLanguage && matchesFormat && matchesType;
    });
  }, [relevantCourses, debouncedSearchTerm, languageFilter, formatFilter, typeFilter]);
};