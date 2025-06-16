import EasyYandexS3 from 'easy-yandex-s3';
import { resolve } from 'path';
import 'dotenv/config';

let s3 = new (EasyYandexS3.default)({
  auth: {
    accessKeyId: process.env.YANDEX_CLOUD_ACCESS_KEY_ID,
    secretAccessKey: process.env.YANDEX_CLOUD_SECRET_ACCESS_KEY,
  },
  Bucket: process.env.YANDEX_CLOUD_S3_BUCKET, // например, "my-storage",
  debug: process.env.DEBUG || false, // Дебаг в консоли
});

export async function main() {
  console.log("‼️ START RELEASE MISSING")

  let upload = await s3.Upload(
    {
      path: resolve('./dist'),
      save_name: true
    },
    '/error'
  );
  
  console.log(upload);

  console.log("‼️ END RELEASE MISSING")
}

main();
