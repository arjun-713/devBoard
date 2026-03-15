import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Board } from '../models/Board';
import { Task } from '../models/Task';
import { User } from '../models/User';

dotenv.config();

type SeedTask = {
  title: string;
  description: string;
  columnId: 'todo' | 'inprogress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDateOffsetDays: number | null;
  assigneeName: string;
  labels: string[];
  order: number;
};

const daysFromNow = (offsetDays: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date;
};

const boardSeedData: Array<{ name: string; tasks: SeedTask[] }> = [
  {
    name: 'Product Roadmap',
    tasks: [
      {
        title: 'Finalize OAuth callback handling for social login',
        description: 'Complete state param validation and edge-case redirects for Google/GitHub auth providers.',
        columnId: 'todo',
        priority: 'high',
        dueDateOffsetDays: 3,
        assigneeName: 'Ava',
        labels: ['auth', 'frontend'],
        order: 0,
      },
      {
        title: 'Draft API contract for board templates',
        description: 'Define request/response payloads and versioning rules for reusable board blueprints.',
        columnId: 'todo',
        priority: 'medium',
        dueDateOffsetDays: 5,
        assigneeName: 'Noah',
        labels: ['api', 'planning'],
        order: 1,
      },
      {
        title: 'Set up Redis caching for board summary endpoint',
        description: 'Cache aggregate board metrics to reduce repeated Mongo aggregation load.',
        columnId: 'inprogress',
        priority: 'high',
        dueDateOffsetDays: 1,
        assigneeName: 'Maya',
        labels: ['backend', 'infra'],
        order: 0,
      },
      {
        title: 'Implement optimistic updates for drag-and-drop',
        description: 'Keep UI responsive while move-task requests are in-flight and rollback on failure.',
        columnId: 'inprogress',
        priority: 'medium',
        dueDateOffsetDays: 2,
        assigneeName: 'Liam',
        labels: ['frontend', 'ux'],
        order: 1,
      },
      {
        title: 'Fix race condition in refresh token rotation',
        description: 'Prevent duplicate refresh token writes when two tabs refresh at the same time.',
        columnId: 'done',
        priority: 'high',
        dueDateOffsetDays: -2,
        assigneeName: 'Ava',
        labels: ['auth', 'bugfix'],
        order: 0,
      },
      {
        title: 'Add Sentry release tagging in CI workflow',
        description: 'Attach commit SHA and environment to error events for faster rollback decisions.',
        columnId: 'done',
        priority: 'low',
        dueDateOffsetDays: -1,
        assigneeName: 'Noah',
        labels: ['devops', 'observability'],
        order: 1,
      },
    ],
  },
  {
    name: 'Sprint 42',
    tasks: [
      {
        title: 'QA regression pass for task modal keyboard nav',
        description: 'Validate focus trap, Escape behavior, and submit shortcuts across Chrome/Safari/Firefox.',
        columnId: 'todo',
        priority: 'medium',
        dueDateOffsetDays: 4,
        assigneeName: 'Emma',
        labels: ['qa', 'accessibility'],
        order: 0,
      },
      {
        title: 'Backfill unit tests for move-task ordering logic',
        description: 'Cover cross-column moves and same-column reorder edge cases.',
        columnId: 'todo',
        priority: 'high',
        dueDateOffsetDays: 2,
        assigneeName: 'Lucas',
        labels: ['backend', 'tests'],
        order: 1,
      },
      {
        title: 'Migrate board list query to indexed projection',
        description: 'Reduce payload size by selecting only id, name, and column metadata in list view.',
        columnId: 'inprogress',
        priority: 'medium',
        dueDateOffsetDays: 1,
        assigneeName: 'Zoe',
        labels: ['database', 'performance'],
        order: 0,
      },
      {
        title: 'Refactor task card labels into reusable Badge group',
        description: 'Unify label rendering and overflow behavior for board and list views.',
        columnId: 'inprogress',
        priority: 'low',
        dueDateOffsetDays: 6,
        assigneeName: 'Mason',
        labels: ['frontend', 'components'],
        order: 1,
      },
      {
        title: 'Patch 403 handling in axios refresh interceptor',
        description: 'Ensure stale refresh tokens force logout without infinite retries.',
        columnId: 'done',
        priority: 'high',
        dueDateOffsetDays: -3,
        assigneeName: 'Lucas',
        labels: ['auth', 'bugfix'],
        order: 0,
      },
      {
        title: 'Create Railway deployment runbook',
        description: 'Document env vars, health checks, and rollback commands for release day.',
        columnId: 'done',
        priority: 'medium',
        dueDateOffsetDays: -1,
        assigneeName: 'Emma',
        labels: ['devops', 'docs'],
        order: 1,
      },
    ],
  },
];

const columnToStatus = (columnId: SeedTask['columnId']) => {
  switch (columnId) {
    case 'inprogress':
      return 'inprogress';
    case 'done':
      return 'done';
    default:
      return 'todo';
  }
};

const seedDemo = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI is required');
  }
  await mongoose.connect(mongoUri);

  const passwordHash = await bcrypt.hash('demo1234', 12);
  const demoUser = await User.findOneAndUpdate(
    { email: 'demo@devboard.app' },
    {
      $set: {
        email: 'demo@devboard.app',
        name: 'Demo User',
        passwordHash,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  if (!demoUser) {
    throw new Error('Failed to create or load demo user.');
  }

  for (const boardSeed of boardSeedData) {
    const board = await Board.findOneAndUpdate(
      { userId: demoUser._id, name: boardSeed.name },
      {
        $set: {
          name: boardSeed.name,
          columns: ['To Do', 'In Progress', 'Done'],
          userId: demoUser._id,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    if (!board) {
      throw new Error(`Failed to create or load board: ${boardSeed.name}`);
    }

    for (const taskSeed of boardSeed.tasks) {
      await Task.findOneAndUpdate(
        { userId: demoUser._id, boardId: board._id, title: taskSeed.title },
        {
          $set: {
            title: taskSeed.title,
            description: taskSeed.description,
            status: columnToStatus(taskSeed.columnId),
            priority: taskSeed.priority,
            dueDate: taskSeed.dueDateOffsetDays === null ? null : daysFromNow(taskSeed.dueDateOffsetDays),
            assigneeName: taskSeed.assigneeName,
            labels: taskSeed.labels,
            boardId: board._id,
            columnId: taskSeed.columnId,
            order: taskSeed.order,
            userId: demoUser._id,
          },
          $setOnInsert: {
            activity: [
              {
                action: 'Task created',
                actor: 'seed-script',
                timestamp: new Date(),
              },
            ],
          },
        },
        { upsert: true, setDefaultsOnInsert: true }
      );
    }
  }

  console.log('Demo seed completed successfully.');
};

void seedDemo()
  .catch((error) => {
    console.error('Demo seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
