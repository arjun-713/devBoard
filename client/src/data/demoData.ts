import type { Board } from '@/store/slices/boardSlice';
import type { Task } from '@/store/slices/taskSlice';

const DEMO_BOARDS_KEY = 'demoBoards';
const DEMO_TASKS_KEY = 'demoTasks';

export const DEMO_USER = {
  id: 'demo-user',
  email: 'demo@devboard.app',
  name: 'Demo User',
};

export const DEMO_ACCESS_TOKEN = 'demo-local-access-token';

const DEFAULT_COLUMNS = ['To Do', 'In Progress', 'Done'];

const todayIso = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();
};

const addDaysIso = (days: number) => {
  const now = new Date();
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
};

const seedBoards: Board[] = [
  { id: 'demo-board-product', name: 'Product Roadmap', columns: DEFAULT_COLUMNS },
  { id: 'demo-board-growth', name: 'Growth Sprint', columns: DEFAULT_COLUMNS },
];

const seedTasks: Task[] = [
  {
    id: 'demo-task-1',
    title: 'Ship onboarding checklist',
    description: 'Guide first-time users through workspace setup and board creation.',
    status: 'inprogress',
    priority: 'high',
    dueDate: addDaysIso(1),
    assigneeName: 'Product Team',
    labels: ['onboarding', 'ux'],
    boardId: 'demo-board-product',
    columnId: 'inprogress',
    order: 0,
    activity: [
      {
        action: 'Task moved to In Progress',
        actor: 'Demo User',
        timestamp: todayIso(),
      },
    ],
  },
  {
    id: 'demo-task-2',
    title: 'Document API contracts',
    description: 'Capture request and response schemas for board and task endpoints.',
    status: 'todo',
    priority: 'medium',
    dueDate: addDaysIso(3),
    assigneeName: 'Platform Team',
    labels: ['backend', 'docs'],
    boardId: 'demo-board-product',
    columnId: 'todo',
    order: 0,
  },
  {
    id: 'demo-task-3',
    title: 'Polish keyboard shortcuts',
    description: 'Improve discoverability for command palette and quick task actions.',
    status: 'done',
    priority: 'low',
    dueDate: addDaysIso(-1),
    assigneeName: 'Frontend Team',
    labels: ['frontend', 'quality'],
    boardId: 'demo-board-product',
    columnId: 'done',
    order: 0,
  },
  {
    id: 'demo-task-4',
    title: 'Write launch announcement',
    description: 'Prepare release notes and social copy for sprint launch.',
    status: 'todo',
    priority: 'high',
    dueDate: addDaysIso(2),
    assigneeName: 'Marketing',
    labels: ['launch'],
    boardId: 'demo-board-growth',
    columnId: 'todo',
    order: 0,
  },
  {
    id: 'demo-task-5',
    title: 'Review campaign metrics',
    description: 'Compare CTR and activation trends from the last two releases.',
    status: 'inprogress',
    priority: 'medium',
    dueDate: addDaysIso(4),
    assigneeName: 'Growth Ops',
    labels: ['analytics'],
    boardId: 'demo-board-growth',
    columnId: 'inprogress',
    order: 0,
  },
];

const safeParse = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

export const isDemoUser = (email?: string | null) => email === DEMO_USER.email;

export const createDemoId = (prefix: string) => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const ensureDemoSeeded = () => {
  const existingBoards = safeParse<Board[]>(localStorage.getItem(DEMO_BOARDS_KEY), []);
  const existingTasks = safeParse<Task[]>(localStorage.getItem(DEMO_TASKS_KEY), []);

  if (existingBoards.length === 0) {
    localStorage.setItem(DEMO_BOARDS_KEY, JSON.stringify(seedBoards));
  }

  if (existingTasks.length === 0) {
    localStorage.setItem(DEMO_TASKS_KEY, JSON.stringify(seedTasks));
  }
};

export const getDemoBoards = (): Board[] =>
  safeParse<Board[]>(localStorage.getItem(DEMO_BOARDS_KEY), seedBoards);

export const setDemoBoards = (boards: Board[]) => {
  localStorage.setItem(DEMO_BOARDS_KEY, JSON.stringify(boards));
};

export const getDemoTasks = (): Task[] =>
  safeParse<Task[]>(localStorage.getItem(DEMO_TASKS_KEY), seedTasks);

export const setDemoTasks = (tasks: Task[]) => {
  localStorage.setItem(DEMO_TASKS_KEY, JSON.stringify(tasks));
};
