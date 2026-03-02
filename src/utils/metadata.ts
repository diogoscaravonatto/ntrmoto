export interface ComponentMetadata {
    name: string;
    description: string;
    props: Record<string, string>;
}

export function parseComponentMetadata(fileContent: string): ComponentMetadata | null {
    const metadataBlockRegex = /\/\/\s*COMPONENT_METADATA:\s*\n([\s\S]*?)(?=\n\s*(?:---|\/\/))/;
    const match = fileContent.match(metadataBlockRegex);

    if (!match) return null;

    const block = match[1];
    const lines = block.split('\n');
    const metadata: ComponentMetadata = { name: '', description: '', props: {} };

    lines.forEach(line => {
        const trimmed = line.replace(/^\/\/\s*/, '').trim();
        if (trimmed.startsWith('Name:')) {
            metadata.name = trimmed.replace('Name:', '').trim();
        } else if (trimmed.startsWith('Description:')) {
            metadata.description = trimmed.replace('Description:', '').trim();
        } else if (trimmed.startsWith('Props:')) {
            const propsStr = trimmed.replace('Props:', '').trim();
            // Simple parsing "prop (type), prop2 (type)"
            const propsList = propsStr.split(',').map(p => p.trim());
            propsList.forEach(p => {
                // match "name (type)" or just "name"
                const propMatch = p.match(/^(\w+)\s*(?:\(([^)]+)\))?/);
                if (propMatch) {
                    metadata.props[propMatch[1]] = propMatch[2] || 'any';
                }
            });
        }
    });

    return metadata as ComponentMetadata;
}
