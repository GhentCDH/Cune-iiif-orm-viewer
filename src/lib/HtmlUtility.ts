import DOMPurify from 'dompurify'

/**
 * Detect whether a string is HTML.
 *
 * This follows the rules specified in IIIF Presentation API 3.0.
 * Reference: https://iiif.io/api/presentation/3.0/#45-html-markup-in-property-values
 *
 * @param text - The text to test.
 * @returns Whether the text is HTML.
 */
export function detectHtml(text: string | null | undefined): boolean {
  if (!text) {
    return false
  }
  // Test the text:  the first character in the string must be a '<' character and the last character must be '>'.
  return text.charAt(0) === '<' && text.charAt(text.length - 1) === '>'
}

/**
 * Sanitize HTML.
 *
 * This follows the rules specified in IIIF Presentation API 3.0.
 * Reference: https://iiif.io/api/presentation/3.0/#45-html-markup-in-property-values
 *
 * @param html - The HTML to sanitize.
 * @returns The sanitized HTML.
 */
export function sanitizeHtml(html: string): string {
  const config = {
    ALLOWED_TAGS: ['a', 'b', 'br', 'i', 'img', 'p', 'small', 'span', 'sub', 'sup'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'target', 'title', 'rel'],
    ALLOW_DATA_ATTR: false,
    ALLOWED_URI_REGEXP: /^(?:https?|mailto):\/\/\S*|mailto:\S*$/i,
  }
  // DOMPurify will automatically add rel="noopener noreferrer" to links with target="_blank"
  // for security (prevents tabnabbing attacks)
  return DOMPurify.sanitize(html, config)
}

/**
 * Sanitize rich HTML.
 *
 * This allows a broader range of HTML tags and attributes.
 *
 * @param html - The HTML to sanitize.
 * @returns The sanitized HTML.
 */
export function sanitizeRichHtml(html: string): string {
  const config = {
    ALLOWED_TAGS: [
      'a', 'b', 'br', 'code', 'div', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'hr', 'i', 'img', 'li', 'ol', 'p', 'pre', 'small', 'span', 'sub', 'sup',
      'strong', 'table', 'tbody', 'td', 'th', 'thead', 'tr', 'ul', 'video', 'audio',
      'source', 'track'
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'colspan', 'rowspan', 'controls', 'loop',
      'muted', 'poster', 'preload', 'type', 'target', 'title', 'rel'],
    ALLOW_DATA_ATTR: false,
    ALLOWED_URI_REGEXP: /^(?:https?|mailto):\/\/\S*|mailto:\S*$/i,
  }
  // DOMPurify will automatically add rel="noopener noreferrer" to links with target="_blank"
  // for security (prevents tabnabbing attacks)
  return DOMPurify.sanitize(html, config)
}

/**
 * Convert newlines to <br /> tags.
 *
 * @param text - The text to convert.
 * @returns The text with newlines replaced by <br /> tags.
 */
export function nl2br(text: string | null | undefined): string {
  if (text === null || typeof text === 'undefined') {
    return ''
  }
  return text.replace(/\n/g, '<br />')
}

// Default export for backward compatibility
export default {
  detectHtml,
  sanitizeHtml,
  sanitizeRichHtml,
  nl2br
}
