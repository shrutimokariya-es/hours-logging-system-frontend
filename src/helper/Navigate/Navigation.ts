
export const navigateTo = (path: string) => {
  // For use outside components, you'll need to pass the navigate function
  // or use a global navigation method
  window.location.href = path;
};
