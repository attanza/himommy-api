import { diskStorage } from 'multer';
import { extname } from 'path';
export default {
  storage: diskStorage({
    destination: './public/mythFacts',
    filename: (req, file, cb) => {
      const randomName = Math.floor(Date.now() / 1000).toString();
      return cb(null, `${randomName}${extname(file.originalname)}`);
    },
  }),
  limits: {
    fileSize: 10000000,
  },
  fileFilter: (req: Request, file, cb) => {
    if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
};
