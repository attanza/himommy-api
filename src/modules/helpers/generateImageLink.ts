export const generateImageLink = image => {
  const imageSplit = image.split(':');
  if (imageSplit.length <= 1) {
    return `${process.env.APP_URL}${image}`;
  }
};
