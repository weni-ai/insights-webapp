export const parseWhatsAppFormattingToHtml = (text) => {
  return text
    .replaceAll('\n', '<br/>')
    .replaceAll(/(?:\*)([^*<\n]+)(?:\*)/g, '<strong>$1</strong>')
    .replaceAll(/(?:_)([^_<\n]+)(?:_)/g, '<i>$1</i>')
    .replaceAll(/(?:~)([^~<\n]+)(?:~)/g, '<s>$1</s>')
    .replaceAll(/(?:```)([^```<\n]+)(?:```)/g, '<tt>$1</tt>');
};
