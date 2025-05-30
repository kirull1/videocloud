import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { Video } from '../entities/video.entity';
import { Category } from '../entities/category.entity';
import { Tag } from '../entities/tag.entity';
import { Channel } from '../entities/channel.entity';
import { AddIsEmailVerifiedToUsers1712500000000 } from '../migrations/1712500000000-AddIsEmailVerifiedToUsers';
import { AddAvatarUrlToUsers1712500000001 } from '../migrations/1712500000001-AddAvatarUrlToUsers';
import { AddTimestampsToUsers1712500000002 } from '../migrations/1712500000002-AddTimestampsToUsers';
import { CreateVideosTable1716042000000 } from '../migrations/1716042000000-CreateVideosTable';
import { CreateCategoriesTable1716042100000 } from '../migrations/1716042100000-CreateCategoriesTable';
import { CreateTagsAndVideoTagsTables1716042200000 } from '../migrations/1716042200000-CreateTagsAndVideoTagsTables';
import { SeedCategoriesAndTags1716042300000 } from '../migrations/1716042300000-SeedCategoriesAndTags';
import { RenameColumnsToSnakeCase1716042400000 } from '../migrations/1716042400000-RenameColumnsToSnakeCase';
import { AddFilePathToVideos1716043000000 } from '../migrations/1716043000000-AddFilePathToVideos';
import { RenameUserColumnsToCamelCase1716650400000 } from '../migrations/1716650400000-RenameUserColumnsToCamelCase';
import { RenameVideoColumnsToCamelCase1716650500000 } from '../migrations/1716650500000-RenameVideoColumnsToCamelCase';
import { FixAvatarColumnName1716650600000 } from '../migrations/1716650600000-FixAvatarColumnName';
import { UpdateUserChannelRelationship1748612571230 } from '../migrations/1748612571230-UpdateUserChannelRelationship';
import fs from 'fs';
import { homedir } from 'os';
import path from 'path';

const SSL_CERT = fs.readFileSync(path.join(homedir(), 'video-cloud/.postgresql/root.crt')).toString();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'videocloud',
  ssl: process.env.DATABASE_SSL === 'true' ? {
    rejectUnauthorized: true,
    ca: SSL_CERT,
  } : false,
  entities: [User, Video, Category, Tag, Channel],
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
    RenameUserColumnsToCamelCase1716650400000,
    RenameVideoColumnsToCamelCase1716650500000,
    FixAvatarColumnName1716650600000,
    UpdateUserChannelRelationship1748612571230,
  ],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});
