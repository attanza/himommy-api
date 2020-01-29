import * as Jimp from 'jimp';
export default async (
  images: string[],
  width: number = 400,
  height: number = Jimp.AUTO,
  quality: number = 90,
) => {
  await Promise.all(
    images.map(async imgPath => {
      const image = await Jimp.read(imgPath);
      await image.resize(width, height);
      await image.quality(quality);
      await image.writeAsync(imgPath);
    }),
  );
};
