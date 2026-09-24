export const truncateWords = (text: string, maxWords: number) => {
  if (!text) return "";
  const words = text.trim().split(/\s+/);
  if (words.length > maxWords) {
    return words.slice(0, maxWords).join(" ") + "...";
  }
  return text;
};
