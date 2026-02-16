import { useParams } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext';
import { useLocale } from '../../app/locale/LocaleContext';
import { useElectives } from '../../hooks/useElectives';
import { ElectivesList } from '../../ui/components/ElectivesList/ElectivesList';
import type { ElectiveType } from '../../types/electives';
import VotingForm, { type ElectiveOption } from '../../ui/forms/VotingForm/VotingForm.tsx';
import { useVotingForm } from '../../hooks/useVotingForm.ts';
import styles from './StudentElectivesByTypePage.module.css';

export function StudentElectivesByTypePage() {
    const { user } = useAuth();
    const { locale } = useLocale();
    const params = useParams();


    const type = params.type as ElectiveType; // tech/hum/math/custom

    const groupId = 'mock-group';

    const { items, loading, error, query, setQuery } = useElectives({
        groupId,
        type,
    });


    const { handleSubmit, handleClear } = useVotingForm();

// преобразуем карточки в options для селектов
    const options: ElectiveOption[] = items.map((e, idx) => ({
        id: idx + 1,          // временно number, пока бэк не готов
        name: e.title,        // можно `${e.title} — ${e.teacher}` если хочешь
    }));

    return (
        <div className={styles.page}>
            <div className={styles.list}>
                <ElectivesList
                    role="student"
                    locale={locale}
                    electives={items}
                    loading={loading}
                    error={error}
                    query={query}
                    onQueryChange={setQuery}
                />
            </div>

            <VotingForm
                electives={options}
                requiredCount={5}
                onSubmit={handleSubmit}
                onClear={handleClear}
                locale={locale}
            />
        </div>
    );

}
