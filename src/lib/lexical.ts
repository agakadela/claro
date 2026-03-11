import type { SerializedEditorState } from 'lexical';

/**
 * The shape Payload generates for richText fields. Matches the generated
 * payload-types.ts structure without importing from it directly — keeping
 * this lib decoupled from any specific collection's generated types.
 */
type PayloadRichTextValue = {
  root: {
    type: string;
    children: { type: unknown; version: number; [k: string]: unknown }[];
    direction: 'ltr' | 'rtl' | null;
    format: '' | 'left' | 'start' | 'center' | 'right' | 'end' | 'justify';
    indent: number;
    version: number;
  };
  [k: string]: unknown;
};

/**
 * Wraps a plain text string in the minimal Lexical editor state structure
 * required by Payload's richText fields. Use this when seeding or
 * programmatically creating products with a plain-text description.
 */
export function toLexicalDescription(text: string): PayloadRichTextValue {
  return {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              text,
              format: 0,
              detail: 0,
              mode: 'normal',
              style: '',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  };
}

/**
 * Type guard for Lexical editor state objects stored in Payload richText fields.
 * Validates the minimum shape before passing to the <RichText /> component —
 * avoids blind double-casts and fails loudly if Payload's schema ever changes.
 */
export function isLexicalContent(value: unknown): value is SerializedEditorState {
  return (
    typeof value === 'object' &&
    value !== null &&
    'root' in value &&
    typeof (value as Record<string, unknown>).root === 'object' &&
    (value as Record<string, unknown>).root !== null
  );
}
