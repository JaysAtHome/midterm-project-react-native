export const cleanDescription = (htmlString: string): string => {
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
  
    decodedString = decodedString.replace(/<\/?[^>]+(>|$)/g, '');
  
    decodedString = decodedString.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
  
    return decodedString.trim();
  };