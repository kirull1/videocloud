import { registerAs } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
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

const databaseConfig = (): DataSourceOptions => ({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'videocloud',
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
  ],
  migrationsRun: true, // Set to true to run migrations automatically
  synchronize: false, // Set to false to prevent automatic schema synchronization
  logging: process.env.NODE_ENV === 'development',
  namingStrategy: new SnakeNamingStrategy(),
});

export default registerAs('database', databaseConfig);
