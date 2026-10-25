import React from 'react';
import './TagsField.css';
export declare function TagsField({ value, onChange, labels, suggestions, maxTags, maxCharacters }: {
    value: readonly string[];
    onChange: (tags: string[]) => void;
    suggestions?: readonly string[];
    maxTags?: number;
    maxCharacters?: number;
    labels: {
        label: string;
        input: string;
        options: string;
        add: string;
        remove: string;
        limit: string;
        length: string;
        countUnit?: string;
    };
}): React.JSX.Element;
