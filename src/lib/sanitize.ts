import DOMPurify from "dompurify";

export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p", "br", "strong", "em", "b", "i", "u", "a", "ul", "ol", "li",
      "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "pre", "code",
      "table", "thead", "tbody", "tr", "th", "td", "img", "span", "div",
      "hr", "sub", "sup", "mark",
    ],
    ALLOWED_ATTR: [
      "href", "target", "rel", "src", "alt", "title", "class", "style",
      "width", "height", "colspan", "rowspan",
    ],
    ALLOW_DATA_ATTR: false,
  });
};
