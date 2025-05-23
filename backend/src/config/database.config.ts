import { registerAs } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';
import { User } from '../entities/user.entity';
import { Video } from '../entities/video.entity';
import { Category } from '../entities/category.entity';
import { Tag } from '../entities/tag.entity';
import { Comment } from '../entities/comment.entity';
import { Reaction } from '../entities/reaction.entity';
import { Channel } from '../entities/channel.entity';
import { AddIsEmailVerifiedToUsers1712500000000 } from '../migrations/1712500000000-AddIsEmailVerifiedToUsers';
import { AddAvatarUrlToUsers1712500000001 } from '../migrations/1712500000001-AddAvatarUrlToUsers';
import { AddTimestampsToUsers1712500000002 } from '../migrations/1712500000002-AddTimestampsToUsers';
import { CreateVideosTable1716042000000 } from '../migrations/1716042000000-CreateVideosTable';
import { CreateCategoriesTable1716042100000 } from '../migrations/1716042100000-CreateCategoriesTable';
import { CreateTagsAndVideoTagsTables1716042200000 } from '../migrations/1716042200000-CreateTagsAndVideoTagsTables';
import { SeedCategoriesAndTags1716042300000 } from '../migrations/1716042300000-SeedCategoriesAndTags';
import { CreateCommentsTable1716650000000 } from '../migrations/1716650000000-CreateCommentsTable';
import { CreateReactionsTable1716650100000 } from '../migrations/1716650100000-CreateReactionsTable';
import { CreateChannelsTable1716650200000 } from '../migrations/1716650200000-CreateChannelsTable';
import { RenameUserColumnsToCamelCase1716650400000 } from '../migrations/1716650400000-RenameUserColumnsToCamelCase';
import { RenameVideoColumnsToCamelCase1716650500000 } from '../migrations/1716650500000-RenameVideoColumnsToCamelCase';
import { FixAvatarColumnName1716650600000 } from '../migrations/1716650600000-FixAvatarColumnName';
import fs from 'fs';
import { homedir } from 'os';
import path from 'path';

const SSL_CERT = fs.readFileSync(path.join(homedir(), 'video-cloud/.postgresql/root.crt')).toString();

const databaseConfig = (): DataSourceOptions => ({
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
  entities: [User, Video, Category, Tag, Comment, Reaction, Channel],
  migrations: [
    AddIsEmailVerifiedToUsers1712500000000,
    AddAvatarUrlToUsers1712500000001,
    AddTimestampsToUsers1712500000002,
    CreateVideosTable1716042000000,
    CreateCategoriesTable1716042100000,
    CreateTagsAndVideoTagsTables1716042200000,
    SeedCategoriesAndTags1716042300000,
    CreateCommentsTable1716650000000,
    CreateReactionsTable1716650100000,
    CreateChannelsTable1716650200000,
    RenameUserColumnsToCamelCase1716650400000,
    RenameVideoColumnsToCamelCase1716650500000,
    FixAvatarColumnName1716650600000,
  ],
  migrationsRun: true, // Set to true to run migrations automatically
  synchronize: false, // Set to false to prevent automatic schema synchronization
  logging: process.env.NODE_ENV === 'development',
});

export default registerAs('database', databaseConfig);
