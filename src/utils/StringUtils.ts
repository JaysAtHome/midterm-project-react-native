export const cleanDescription = (htmlString: string): string => {
    // First decode HTML entities
    let decodedString = htmlString
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/u003c/g, '<')
      .replace(/u003e/g, '>')
      .replace(/\\"/g, '"');
  
    // Then remove unwanted HTML tags (keeping basic formatting)
    decodedString = decodedString.replace(/<\/?[^>]+(>|$)/g, '');
  
    // Remove any remaining special characters
    decodedString = decodedString.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
  
    return decodedString.trim();
  };