import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { Video } from '../entities/video.entity';
import { Category } from '../entities/category.entity';
import { Tag } from '../entities/tag.entity';
import { AddIsEmailVerifiedToUsers1712500000000 } from '../migrations/1712500000000-AddIsEmailVerifiedToUsers';
import { AddAvatarUrlToUsers1712500000001 } from '../migrations/1712500000001-AddAvatarUrlToUsers';
import { AddTimestampsToUsers1712500000002 } from '../migrations/1712500000002-AddTimestampsToUsers';
import { CreateVideosTable1716042000000 } from '../migrations/1716042000000-CreateVideosTable';
import { CreateCategoriesTable1716042100000 } from '../migrations/1716042100000-CreateCategoriesTable';
import { CreateTagsAndVideoTagsTables1716042200000 } from '../migrations/1716042200000-CreateTagsAndVideoTagsTables';
import { SeedCategoriesAndTags1716042300000 } from '../migrations/1716042300000-SeedCategoriesAndTags';
import { RenameColumnsToSnakeCase1716042400000 } from '../migrations/1716042400000-RenameColumnsToSnakeCase';
import { AddFilePathToVideos1716043000000 } from '../migrations/1716043000000-AddFilePathToVideos';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'videocloud',
  entities: [User, Video, Category, Tag],
  migrations: [
    AddIsEmailVerifiedToUsers1712500000000,
    AddAvatarUrlToUsers1712500000001,
    AddTimestampsToUsers1712500000002,
    CreateVideosTable1716042000000,
    CreateCategoriesTable1716042100000,
    CreateTagsAndVideoTagsTables1716042200000,
    SeedCategoriesAndTags1716042300000,
    RenameColumnsToSnakeCase1716042400000,
    AddFilePathToVideos1716043000000,
  ],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});
