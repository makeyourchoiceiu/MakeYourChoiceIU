import type { StudentElectiveTypeTab } from "../types/electivesList.ts";

interface StudentElectiveTypeTabsProps {
    tabs: StudentElectiveTypeTab[];
    activeType: StudentElectiveTypeTab['value'];
    onChange: (type: string) => void;
}

export function StudentElectiveTypeTabs({tabs, activeType, onChange}: StudentElectiveTypeTabsProps) {
    return (
        <div>
            {tabs.map((tab) => (
                <button
                    key={tab.value}
                    type="button"
                    onClick={() => onChange(tab.value)}
                    aria-pressed={activeType === tab.value}
                >{tab.label}</button>
            ))}
        </div>
    )
}