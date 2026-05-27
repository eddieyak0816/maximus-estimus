interface Section {
  id: string;
  label: string;
}

interface Props {
  sections: Section[];
  data: any;
}

export default function QuestionsSectionAnchors({ sections, data }: Props) {
  const activeSections = sections.filter(section => {
    // Check if any field in data matches this section
    const fieldPatterns = [
      new RegExp(`^${section.id}`, 'i'),
      new RegExp(section.id, 'i'),
    ];

    for (const key in data) {
      const value = data[key];
      if (fieldPatterns.some(pattern => pattern.test(key))) {
        if (value !== null && value !== undefined && value !== '' && value !== false && !(Array.isArray(value) && value.length === 0)) {
          return true;
        }
      }
    }
    return false;
  });

  if (activeSections.length === 0) return null;

  return (
    <div className="section-anchors">
      <div className="section-anchors-label">Quick Links:</div>
      <div className="section-anchors-list">
        {activeSections.map(section => (
          <a
            key={section.id}
            href={`#section-${section.id}`}
            className="section-anchor-link"
            onClick={(e) => {
              e.preventDefault();
              const element = document.getElementById(`section-${section.id}`);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
          >
            {section.label}
          </a>
        ))}
      </div>
    </div>
  );
}
