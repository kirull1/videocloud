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

async function main() {
  console.log("START RELEASE")

  await s3.CleanUp();

  let upload = await s3.Upload(
    {
      path: resolve('./build'),
      save_name: true
    },
    '/'
  );
  
  console.log(upload);

  console.log("END RELEASE")
}

main();
