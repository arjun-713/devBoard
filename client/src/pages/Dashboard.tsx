import React, { useMemo, useState } from 'react';
import {
  LogOut,
  Layout,
  Plus,
  Search,
  SearchX,
  Bell,
  Inbox,
  Settings,
  ChevronRight,
  Layers,
  Calendar,
  FolderKanban,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBoards } from '@/hooks/useBoards';
import { useTasks } from '@/hooks/useTasks';
import { useDebounce } from '@/hooks/useDebounce';
import { Button } from '@/components/UI/Button';
import { Board } from '@/components/Board/Board';
import { Badge } from '@/components/UI/Badge';
import { Modal } from '@/components/UI/Modal';
import { Select } from '@/components/UI/Select';
import { useUIStore } from '@/store/zustand/uiStore';
import type { Task } from '@/store/slices/taskSlice';

type ViewMode = 'board' | 'list';
type WorkspaceView = 'boards' | 'search' | 'inbox';
type SearchScope = 'all' | 'boards' | 'tasks';
type InboxFilter = 'all' | 'overdue' | 'today' | 'upcoming';
type Priority = Task['priority'];

interface TaskFormState {
  title: string;
  description: string;
  priority: Priority;
  columnId: string;
  dueDate: string;
  assigneeName: string;
  labelsText: string;
}

const defaultTaskForm = (columnId = 'todo'): TaskFormState => ({
  title: '',
  description: '',
  priority: 'medium',
  columnId,
  dueDate: '',
  assigneeName: '',
  labelsText: '',
});

const modalIds = {
  createBoard: 'create-board',
  editBoard: 'edit-board',
  createTask: 'create-task',
  editTask: 'edit-task',
} as const;

const columnColorClass: Record<string, string> = {
  todo: 'bg-text-muted',
  inprogress: 'bg-brand-orange',
  done: 'bg-brand-cyan',
};

const priorityColorClass: Record<Priority, string> = {
  low: 'bg-brand-cyan',
  medium: 'bg-brand-orange',
  high: 'bg-brand-pumpkin',
};

const columnIdToLabel = (columnId: string) => {
  switch (columnId) {
    case 'inprogress':
      return 'In Progress';
    case 'done':
      return 'Done';
    default:
      return 'To Do';
  }
};

const columnLabelToId = (columnName: string) => columnName.toLowerCase().replace(/\s+/g, '');

const priorityOptions: Priority[] = ['low', 'medium', 'high'];

const formatPriority = (priority: Priority) =>
  priority.charAt(0).toUpperCase() + priority.slice(1);

const isSameUtcDate = (left: Date, right: Date) =>
  left.getUTCFullYear() === right.getUTCFullYear() &&
  left.getUTCMonth() === right.getUTCMonth() &&
  left.getUTCDate() === right.getUTCDate();

const getTaskDateMeta = (task: Task) => {
  if (!task.dueDate) {
    return { hasDate: false, isOverdue: false, isToday: false, isUpcoming: false };
  }

  const due = new Date(task.dueDate);
  const now = new Date();
  const dueMidnight = Date.UTC(due.getUTCFullYear(), due.getUTCMonth(), due.getUTCDate());
  const nowMidnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

  return {
    hasDate: true,
    isOverdue: dueMidnight < nowMidnight,
    isToday: isSameUtcDate(due, now),
    isUpcoming: dueMidnight > nowMidnight,
  };
};

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { boards, activeBoardId, setActiveBoard, createBoard, updateBoard, deleteBoard, isLoading: isBoardsLoading } = useBoards();
  const { tasks, isLoading: isTasksLoading, createTask, updateTask, deleteTask, moveTask } = useTasks(activeBoardId);
  const { activeModal, openModal, closeModal, toasts, addToast, removeToast } = useUIStore();

  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>('boards');
  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchScope, setSearchScope] = useState<SearchScope>('all');
  const [inboxFilter, setInboxFilter] = useState<InboxFilter>('all');
  const [boardName, setBoardName] = useState('');
  const [boardEditName, setBoardEditName] = useState('');
  const [taskForm, setTaskForm] = useState<TaskFormState>(defaultTaskForm());
  const [isSubmittingBoard, setIsSubmittingBoard] = useState(false);
  const [isUpdatingBoard, setIsUpdatingBoard] = useState(false);
  const [isDeletingBoard, setIsDeletingBoard] = useState(false);
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  const [isDeletingTask, setIsDeletingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const activeBoard = boards.find((board) => board.id === activeBoardId) ?? null;

  const sortedTasks = useMemo(
    () => [...tasks].sort((firstTask, secondTask) => firstTask.order - secondTask.order),
    [tasks]
  );

  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const normalizedSearchQuery = debouncedSearchQuery.trim().toLowerCase();

  const filteredBoards = useMemo(
    () =>
      boards.filter((board) =>
        (searchScope === 'all' || searchScope === 'boards') &&
        (normalizedSearchQuery.length === 0
          ? true
          : board.name.toLowerCase().includes(normalizedSearchQuery))
      ),
    [boards, normalizedSearchQuery, searchScope]
  );

  const filteredTasks = useMemo(
    () =>
      sortedTasks.filter((task) =>
        (searchScope === 'all' || searchScope === 'tasks') &&
        (normalizedSearchQuery.length === 0
          ? true
          : `${task.title} ${task.description ?? ''} ${task.assigneeName ?? ''} ${(task.labels ?? []).join(' ')}`
              .toLowerCase()
              .includes(normalizedSearchQuery))
      ),
    [normalizedSearchQuery, searchScope, sortedTasks]
  );

  const inboxTasks = useMemo(
    () => {
      const baseTasks = [...sortedTasks].filter((task) => task.status !== 'done');

      const filteredByTime = baseTasks.filter((task) => {
        const dateMeta = getTaskDateMeta(task);
        if (inboxFilter === 'overdue') return dateMeta.isOverdue;
        if (inboxFilter === 'today') return dateMeta.isToday;
        if (inboxFilter === 'upcoming') return dateMeta.isUpcoming;
        return true;
      });

      return filteredByTime.sort((firstTask, secondTask) => {
        const priorityWeight: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
        const firstPriority = priorityWeight[firstTask.priority];
        const secondPriority = priorityWeight[secondTask.priority];
        if (firstPriority !== secondPriority) {
          return firstPriority - secondPriority;
        }
        return firstTask.order - secondTask.order;
      });
    },
    [inboxFilter, sortedTasks]
  );

  const inboxTotal = useMemo(
    () => sortedTasks.filter((task) => task.status !== 'done').length,
    [sortedTasks]
  );

  const columnOptions = useMemo(
    () =>
      (activeBoard?.columns ?? ['To Do', 'In Progress', 'Done']).map((column) => {
        const value = columnLabelToId(column);
        return {
          value,
          label: column,
          colorClass: columnColorClass[value] ?? 'bg-text-muted',
        };
      }),
    [activeBoard]
  );

  const prioritySelectOptions = priorityOptions.map((priority) => ({
    value: priority,
    label: formatPriority(priority),
    colorClass: priorityColorClass[priority],
  }));

  const openCreateBoardModal = () => {
    setBoardName('');
    openModal(modalIds.createBoard);
  };

  const openCreateTaskModal = (columnId = 'todo') => {
    setEditingTask(null);
    setTaskForm(defaultTaskForm(columnId));
    openModal(modalIds.createTask);
  };

  const openEditBoardModal = () => {
    if (!activeBoard) return;
    setBoardEditName(activeBoard.name);
    openModal(modalIds.editBoard);
  };

  const openEditTaskModal = (task: Task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description ?? '',
      priority: task.priority,
      columnId: task.columnId,
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
      assigneeName: task.assigneeName ?? '',
      labelsText: task.labels?.join(', ') ?? '',
    });
    openModal(modalIds.editTask);
  };

  const resetTaskModal = () => {
    setEditingTask(null);
    setTaskForm(defaultTaskForm());
    closeModal();
  };

  const handleCreateBoard = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = boardName.trim();
    if (!trimmedName) return;

    setIsSubmittingBoard(true);
    try {
      const newBoard = await createBoard(trimmedName);
      setWorkspaceView('boards');
      setActiveBoard(newBoard.id);
      addToast('Board created', 'success');
      setBoardName('');
      closeModal();
    } catch (error) {
      console.error('Failed to create board', error);
      addToast('Failed to create board', 'error');
    } finally {
      setIsSubmittingBoard(false);
    }
  };

  const handleTaskSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeBoard) return;

    const trimmedTitle = taskForm.title.trim();
    if (!trimmedTitle) return;
    const labels = taskForm.labelsText
      .split(',')
      .map((label) => label.trim())
      .filter((label) => label.length > 0);
    const normalizedDueDate = taskForm.dueDate ? new Date(taskForm.dueDate).toISOString() : null;

    setIsSubmittingTask(true);
    try {
      if (editingTask) {
        await updateTask({
          id: editingTask.id,
          title: trimmedTitle,
          description: taskForm.description.trim(),
          priority: taskForm.priority,
          dueDate: normalizedDueDate,
          assigneeName: taskForm.assigneeName.trim(),
          labels,
          columnId: taskForm.columnId,
        });
        addToast('Task updated', 'success');
      } else {
        const nextOrder = tasks.filter((task) => task.columnId === taskForm.columnId).length;
        await createTask({
          title: trimmedTitle,
          description: taskForm.description.trim(),
          priority: taskForm.priority,
          dueDate: normalizedDueDate,
          assigneeName: taskForm.assigneeName.trim(),
          labels,
          boardId: activeBoard.id,
          columnId: taskForm.columnId,
          order: nextOrder,
        });
        addToast('Task created', 'success');
      }
      resetTaskModal();
    } catch (error) {
      console.error('Failed to save task', error);
      addToast('Failed to save task', 'error');
    } finally {
      setIsSubmittingTask(false);
    }
  };

  const handleUpdateBoard = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeBoard) return;
    const trimmedName = boardEditName.trim();
    if (!trimmedName) return;

    setIsUpdatingBoard(true);
    try {
      await updateBoard(activeBoard.id, trimmedName);
      addToast('Board updated', 'success');
      closeModal();
    } catch (error) {
      console.error('Failed to update board', error);
      addToast('Failed to update board', 'error');
    } finally {
      setIsUpdatingBoard(false);
    }
  };

  const handleDeleteBoard = async () => {
    if (!activeBoard) return;

    setIsDeletingBoard(true);
    try {
      await deleteBoard(activeBoard.id);
      addToast('Board deleted', 'success');
      closeModal();
    } catch (error) {
      console.error('Failed to delete board', error);
      addToast('Failed to delete board', 'error');
    } finally {
      setIsDeletingBoard(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!editingTask) return;

    setIsDeletingTask(true);
    try {
      await deleteTask(editingTask.id);
      addToast('Task deleted', 'success');
      resetTaskModal();
    } catch (error) {
      console.error('Failed to delete task', error);
      addToast('Failed to delete task', 'error');
    } finally {
      setIsDeletingTask(false);
    }
  };

  const handleSelectBoard = (boardId: string) => {
    setWorkspaceView('boards');
    setActiveBoard(boardId);
  };

  const handleQuickTaskStatus = async (task: Task, targetColumnId: string) => {
    try {
      await updateTask({
        id: task.id,
        title: task.title,
        description: task.description ?? '',
        priority: task.priority,
        dueDate: task.dueDate ?? null,
        assigneeName: task.assigneeName ?? '',
        labels: task.labels ?? [],
        columnId: targetColumnId,
      });
      addToast(`Moved to ${columnIdToLabel(targetColumnId)}`, 'success');
    } catch (error) {
      console.error('Failed to move task', error);
      addToast('Failed to update task status', 'error');
    }
  };

  const renderWorkspaceContent = () => {
    if (workspaceView === 'search') {
      const hasNoSearchResults =
        normalizedSearchQuery.length > 0 && filteredBoards.length === 0 && filteredTasks.length === 0;

      return (
        <div className="mx-auto flex h-full w-full max-w-5xl flex-col gap-6">
          <div className="rounded-xl border border-border bg-bg-surface p-5">
            <div className="mb-4 flex items-center gap-2">
              <Search size={14} className="text-text-muted" />
              <h3 className="text-[15px] font-semibold text-text-primary">Search</h3>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search boards and tasks"
              className="h-11 w-full rounded-lg border border-border bg-bg-base px-3 text-[13px] text-text-primary outline-none transition-all focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/50"
            />
            <div className="mt-3 inline-flex rounded-lg border border-border bg-bg-base p-0.5">
              {(['all', 'boards', 'tasks'] as SearchScope[]).map((scope) => (
                <button
                  key={scope}
                  type="button"
                  onClick={() => setSearchScope(scope)}
                  className={`rounded-md px-3 py-1 text-[11px] uppercase tracking-[0.08em] transition-all ${
                    searchScope === scope
                      ? 'bg-bg-elevated text-text-primary border border-border-strong'
                      : 'text-text-muted hover:text-text-secondary'
                  }`}
                >
                  {scope}
                </button>
              ))}
            </div>
          </div>

          {hasNoSearchResults ? (
            <div className="rounded-xl border border-border bg-bg-surface px-6 py-14 text-center">
              <SearchX size={22} className="mx-auto text-text-muted" />
              <h3 className="mt-3 text-[14px] font-semibold text-text-secondary">No Results</h3>
              <p className="mt-1 text-[12px] text-[#555550]">Try a different keyword or switch search scope.</p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="rounded-xl border border-border bg-bg-surface">
              <div className="border-b border-border px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-text-secondary">
                Boards
              </div>
              <div className="p-2">
                {filteredBoards.length > 0 ? (
                  filteredBoards.map((board) => (
                    <button
                      key={board.id}
                      type="button"
                      onClick={() => handleSelectBoard(board.id)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] text-text-secondary transition-all hover:bg-bg-elevated hover:text-text-primary"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-blue" />
                      <span className="truncate">{board.name}</span>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-6 text-center text-[12px] text-text-muted">
                    No boards match your search.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-bg-surface">
              <div className="border-b border-border px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-text-secondary">
                Tasks {activeBoard ? `in ${activeBoard.name}` : ''}
              </div>
              <div className="p-2">
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => openEditTaskModal(task)}
                      className="block w-full rounded-lg border border-transparent px-3 py-3 text-left transition-all hover:border-border hover:bg-bg-elevated"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="truncate text-[13px] font-medium text-text-primary">{task.title}</span>
                        <Badge variant={task.priority}>{formatPriority(task.priority)}</Badge>
                      </div>
                      {task.description ? (
                        <p className="mt-1 text-[12px] text-text-secondary">{task.description}</p>
                      ) : null}
                      <div className="mt-2 flex items-center gap-2 text-[11px] text-text-muted">
                        <span>{columnIdToLabel(task.columnId)}</span>
                        <span>•</span>
                        <span>{task.assigneeName?.trim() || 'Unassigned'}</span>
                        {task.labels && task.labels.length > 0 ? (
                          <>
                            <span>•</span>
                            <span className="truncate">#{task.labels.join(' #')}</span>
                          </>
                        ) : null}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-6 text-center text-[12px] text-text-muted">
                    No tasks match this search.
                  </div>
                )}
              </div>
            </div>
            </div>
          )}
        </div>
      );
    }

    if (workspaceView === 'inbox') {
      return (
        <div className="mx-auto flex h-full w-full max-w-5xl flex-col gap-4">
          <div className="rounded-xl border border-border bg-bg-surface p-5">
            <div className="mb-2 flex items-center gap-2">
              <Bell size={14} className="text-brand-orange" />
              <h3 className="text-[15px] font-semibold text-text-primary">Inbox</h3>
            </div>
            <p className="text-[13px] text-text-secondary">
              Action queue for unfinished work. Filter by due-date urgency and update status without opening modals.
            </p>
            <div className="mt-3 inline-flex rounded-lg border border-border bg-bg-base p-0.5">
              {(['all', 'overdue', 'today', 'upcoming'] as InboxFilter[]).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setInboxFilter(filter)}
                  className={`rounded-md px-3 py-1 text-[11px] uppercase tracking-[0.08em] transition-all ${
                    inboxFilter === filter
                      ? 'bg-bg-elevated text-text-primary border border-border-strong'
                      : 'text-text-muted hover:text-text-secondary'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-bg-surface">
            {inboxTasks.length > 0 ? (
              inboxTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start justify-between gap-4 border-b border-border-subtle px-4 py-4 text-left transition-all last:border-b-0 hover:bg-bg-elevated"
                >
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() => openEditTaskModal(task)}
                      className="flex items-center gap-2 text-left"
                    >
                      <span className={`h-2 w-2 rounded-full ${priorityColorClass[task.priority]}`} />
                      <span className="truncate text-[13px] font-medium text-text-primary">{task.title}</span>
                    </button>
                    <p className="mt-1 text-[12px] text-text-secondary">
                      {columnIdToLabel(task.columnId)} · {task.assigneeName?.trim() || 'Unassigned'} ·{' '}
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : 'No due date'}
                    </p>
                    <p className="mt-1 text-[12px] text-text-muted">
                      {task.description || 'No description'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={task.priority}>{formatPriority(task.priority)}</Badge>
                    {task.columnId !== 'inprogress' ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => void handleQuickTaskStatus(task, 'inprogress')}
                      >
                        Start
                      </Button>
                    ) : null}
                    {task.columnId !== 'done' ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => void handleQuickTaskStatus(task, 'done')}
                      >
                        Done
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-14 text-center">
                <Inbox size={20} className="mx-auto text-text-muted" />
                <h3 className="mt-3 text-[14px] font-semibold text-text-secondary">Inbox Is Clear</h3>
                <p className="mt-1 text-[12px] text-[#555550]">No tasks in the selected inbox filter.</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (!activeBoard) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto">
          <div className="w-16 h-16 bg-bg-surface border border-border rounded-2xl flex items-center justify-center mb-4">
            <Layout className="text-text-muted w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary">No board selected</h3>
          <p className="text-text-secondary mt-2 text-[13px] leading-relaxed">
            Create a board to start organizing tasks, then drag cards between columns or switch into list view.
          </p>
          <Button className="mt-6" variant="secondary" onClick={openCreateBoardModal}>
            Create your first board
          </Button>
        </div>
      );
    }

    if (activeBoard.columns.length === 0 && sortedTasks.length === 0) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto">
          <div className="w-16 h-16 bg-bg-surface border border-border rounded-2xl flex items-center justify-center mb-4">
            <FolderKanban className="text-text-muted w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-text-secondary">Empty Board</h3>
          <p className="mt-2 text-[13px] leading-relaxed text-[#555550]">
            This board has no columns or tasks yet. Add structure first, then start adding work.
          </p>
        </div>
      );
    }

    if (viewMode === 'list') {
      return (
        <div className="rounded-xl border border-border bg-bg-surface overflow-hidden">
          <div className="grid grid-cols-[minmax(0,2fr)_120px_140px_120px] gap-3 border-b border-border px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-text-secondary">
            <span>Task</span>
            <span>Status</span>
            <span>Priority</span>
            <span>Action</span>
          </div>
          {sortedTasks.length > 0 ? (
            sortedTasks.map((task) => (
              <div
                key={task.id}
                className="grid grid-cols-[minmax(0,2fr)_120px_140px_120px] gap-3 border-b border-border-subtle px-4 py-3 text-[12px] text-text-primary last:border-b-0"
              >
                <div className="min-w-0">
                  <button
                    type="button"
                    onClick={() => openEditTaskModal(task)}
                    className="truncate text-left text-[13px] font-medium text-text-primary transition-colors hover:text-brand-orange"
                  >
                    {task.title}
                  </button>
                  {task.description ? (
                    <p className="mt-1 truncate text-[12px] text-text-secondary">
                      {task.description}
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center">
                  <Badge variant={task.status}>{columnIdToLabel(task.columnId)}</Badge>
                </div>
                <div className="flex items-center">
                  <Badge variant={task.priority}>{formatPriority(task.priority)}</Badge>
                </div>
                <div className="flex items-center">
                  <Button variant="ghost" size="sm" onClick={() => openEditTaskModal(task)}>
                    Edit
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-bg-elevated">
                <FolderKanban className="h-7 w-7 text-text-muted" />
              </div>
              <h3 className="text-[15px] font-semibold text-text-primary">No tasks yet</h3>
              <p className="mt-2 max-w-sm text-[13px] leading-[1.5] text-text-secondary">
                Start with a first task so this board has something to organize.
              </p>
              <Button className="mt-5" onClick={() => openCreateTaskModal()}>
                <Plus size={14} className="mr-1.5" />
                Add your first task
              </Button>
            </div>
          )}
        </div>
      );
    }

    return (
      <Board
        columns={activeBoard.columns}
        tasks={sortedTasks}
        isLoading={isTasksLoading}
        onAddTask={openCreateTaskModal}
        onTaskClick={openEditTaskModal}
        onMoveTask={moveTask}
      />
    );
  };

  const sidebarButtonClass = (isActive: boolean) =>
    `w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] transition-all ${
      isActive
        ? 'bg-bg-elevated text-text-primary font-medium border border-border'
        : 'text-text-muted hover:text-text-primary hover:bg-bg-elevated'
    }`;

  return (
    <div className="min-h-screen bg-bg-base flex overflow-hidden">
      <aside className="w-[220px] border-r border-border bg-bg-surface flex flex-col shrink-0">
        <div className="h-[52px] flex items-center px-4 border-b border-border">
          <div className="w-7 h-7 bg-brand-orange flex items-center justify-center rounded-lg mr-2 shrink-0">
            <Layers className="text-bg-base w-4 h-4" />
          </div>
          <span className="font-semibold text-text-primary tracking-tight">DevBoard</span>
        </div>

        <div className="p-3 flex-1 space-y-6 overflow-y-auto">
          <div>
            <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-text-muted mb-2 px-2">
              Workspace
            </div>
            <div className="space-y-0.5">
              <button
                type="button"
                className={sidebarButtonClass(workspaceView === 'search')}
                onClick={() => setWorkspaceView('search')}
              >
                <Search size={14} className="text-text-muted" />
                <span>Search</span>
                <span className="ml-auto text-[10px] bg-bg-overlay px-1 rounded border border-border">⌘K</span>
              </button>
              <button
                type="button"
                className={sidebarButtonClass(workspaceView === 'inbox')}
                onClick={() => setWorkspaceView('inbox')}
              >
                <Bell size={14} className="text-text-muted" />
                <span>Inbox</span>
                <span className="ml-auto rounded-full bg-brand-orange/10 px-1.5 py-0.5 text-[10px] text-brand-orange">
                  {inboxTotal}
                </span>
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between px-2 mb-2">
              <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-text-muted">
                Boards
              </div>
              <button
                type="button"
                className="text-text-muted hover:text-text-primary"
                onClick={openCreateBoardModal}
                aria-label="Create board"
              >
                <Plus size={12} />
              </button>
            </div>
            <div className="space-y-0.5">
              {isBoardsLoading
                ? Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={`board-skeleton-${index}`}
                      className="h-[30px] rounded-md border border-border bg-[#1C1C1C] animate-pulse"
                    />
                  ))
                : null}
              {!isBoardsLoading
                ? boards.map((board) => (
                <button
                  key={board.id}
                  onClick={() => handleSelectBoard(board.id)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] transition-all ${
                    workspaceView === 'boards' && activeBoardId === board.id
                      ? 'bg-bg-overlay text-text-primary font-medium border border-border-strong'
                      : 'text-text-muted hover:text-text-primary hover:bg-bg-elevated'
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      workspaceView === 'boards' && activeBoardId === board.id
                        ? 'bg-brand-orange'
                        : 'bg-text-muted'
                    }`}
                  />
                  <span className="truncate">{board.name}</span>
                </button>
                  ))
                : null}
              {!isBoardsLoading && boards.length === 0 ? (
                <button
                  type="button"
                  onClick={openCreateBoardModal}
                  className="w-full rounded-lg border border-dashed border-border px-3 py-4 text-center text-[12px] italic text-text-muted transition-all hover:border-border-strong hover:text-text-primary"
                >
                  Create your first board
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-border bg-bg-surface/50">
          <div className="flex items-center gap-2.5 p-1 mb-2 hover:bg-bg-elevated rounded-lg transition-colors cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-brand-blue-deep border border-brand-blue flex items-center justify-center text-[12px] font-bold text-white shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-[12px] font-semibold text-text-primary truncate">{user?.name ?? 'Authenticated user'}</div>
              <div className="text-[10px] text-text-muted truncate lowercase">{user?.email ?? 'Session active'}</div>
            </div>
            <ChevronRight size={12} className="text-text-muted group-hover:text-text-primary opacity-50 group-hover:opacity-100 transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-1 px-1">
            <Button variant="ghost" size="sm" className="justify-center h-8" onClick={() => setViewMode('list')}>
              <Settings size={13} className="mr-1.5" />
              Focus
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="justify-center h-8 hover:text-brand-pumpkin hover:bg-brand-pumpkin/5"
              onClick={logout}
            >
              <LogOut size={13} className="mr-1.5" />
              Exit
            </Button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col bg-bg-base relative min-w-0">
        <header className="h-[52px] border-b border-border flex items-center justify-between px-6 bg-bg-base/80 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-[14px] font-semibold text-text-primary tracking-tight">
              {workspaceView === 'search'
                ? 'Search'
                : workspaceView === 'inbox'
                  ? 'Inbox'
                  : activeBoard
                    ? activeBoard.name
                    : 'Select a board'}
            </h2>
            {(workspaceView === 'boards' && activeBoard) || workspaceView === 'inbox' ? (
              <div className="flex items-center bg-bg-surface border border-border rounded-md px-1.5 py-0.5 gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan" />
                <span className="text-[10px] font-medium text-text-secondary uppercase tracking-widest">
                  {workspaceView === 'inbox' ? 'Priority Queue' : 'Active'}
                </span>
              </div>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-bg-surface border border-border rounded-lg p-0.5 mr-2">
              <button
                type="button"
                onClick={() => setViewMode('board')}
                className={`px-3 py-1 text-[12px] font-medium rounded-md transition-all ${
                  viewMode === 'board'
                    ? 'text-text-primary bg-bg-elevated border border-border-strong'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                Board
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 text-[12px] font-medium rounded-md transition-all ${
                  viewMode === 'list'
                    ? 'text-text-primary bg-bg-elevated border border-border-strong'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                List
              </button>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={openEditBoardModal}
              disabled={!activeBoard || workspaceView !== 'boards'}
            >
              <Pencil size={13} className="mr-1.5" />
              Board
            </Button>
            <Button size="sm" onClick={() => openCreateTaskModal()} disabled={!activeBoard}>
              <Plus size={14} className="mr-1.5" />
              Add Task
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-x-auto p-6">{renderWorkspaceContent()}</div>
      </main>

      {toasts.length > 0 ? (
        <div className="fixed right-4 top-4 z-[60] flex w-[280px] flex-col gap-2">
          {toasts.map((toast) => (
            <button
              key={toast.id}
              type="button"
              onClick={() => removeToast(toast.id)}
              className={`rounded-lg border px-3 py-2 text-left text-[12px] transition-all ${
                toast.type === 'error'
                  ? 'border-brand-pumpkin/30 bg-brand-pumpkin/10 text-brand-pumpkin'
                  : toast.type === 'success'
                    ? 'border-brand-cyan/30 bg-brand-cyan/10 text-brand-cyan'
                    : 'border-border bg-bg-surface text-text-primary'
              }`}
            >
              {toast.message}
            </button>
          ))}
        </div>
      ) : null}

      {activeModal === modalIds.createBoard ? (
        <Modal
          title="Create board"
          description="Start with a focused workspace. You can add tasks immediately after the board is created."
          onClose={closeModal}
        >
          <form className="space-y-4" onSubmit={handleCreateBoard}>
            <div>
              <label className="mb-1.5 ml-1 block text-[11px] font-medium uppercase tracking-[0.08em] text-text-secondary">
                Board Name
              </label>
              <input
                type="text"
                value={boardName}
                onChange={(event) => setBoardName(event.target.value)}
                className="w-full rounded-lg border border-border bg-bg-base h-10 px-3 text-[13px] text-text-primary outline-none transition-all focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/50"
                placeholder="Sprint Planning"
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmittingBoard}>
                Create Board
              </Button>
            </div>
          </form>
        </Modal>
      ) : null}

      {activeModal === modalIds.editBoard ? (
        <Modal
          title="Board Settings"
          description="Rename this board or remove it from your workspace."
          onClose={closeModal}
        >
          <form className="space-y-4" onSubmit={handleUpdateBoard}>
            <div>
              <label className="mb-1.5 ml-1 block text-[11px] font-medium uppercase tracking-[0.08em] text-text-secondary">
                Board Name
              </label>
              <input
                type="text"
                value={boardEditName}
                onChange={(event) => setBoardEditName(event.target.value)}
                className="w-full rounded-lg border border-border bg-bg-base h-10 px-3 text-[13px] text-text-primary outline-none transition-all focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/50"
                placeholder="Platform Roadmap"
                required
              />
            </div>
            <div className="flex items-center justify-between gap-2 pt-2">
              <Button
                type="button"
                variant="danger"
                onClick={handleDeleteBoard}
                isLoading={isDeletingBoard}
              >
                <Trash2 size={13} className="mr-1.5" />
                Delete Board
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isUpdatingBoard}>
                  Save Changes
                </Button>
              </div>
            </div>
          </form>
        </Modal>
      ) : null}

      {activeModal === modalIds.createTask || activeModal === modalIds.editTask ? (
        <Modal
          title={editingTask ? 'Edit task' : 'Add task'}
          description={
            editingTask
              ? 'Update the task details, shift its priority, or move it into a different column.'
              : 'Capture the work item and place it directly in the right column.'
          }
          onClose={resetTaskModal}
        >
          <form className="space-y-4" onSubmit={handleTaskSubmit}>
            <div>
              <label className="mb-1.5 ml-1 block text-[11px] font-medium uppercase tracking-[0.08em] text-text-secondary">
                Title
              </label>
              <input
                type="text"
                value={taskForm.title}
                onChange={(event) => setTaskForm((current) => ({ ...current, title: event.target.value }))}
                className="w-full rounded-lg border border-border bg-bg-base h-10 px-3 text-[13px] text-text-primary outline-none transition-all focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/50"
                placeholder="Implement drag-and-drop ordering"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 ml-1 block text-[11px] font-medium uppercase tracking-[0.08em] text-text-secondary">
                Description
              </label>
              <textarea
                value={taskForm.description}
                onChange={(event) => setTaskForm((current) => ({ ...current, description: event.target.value }))}
                className="w-full rounded-lg border border-border bg-bg-base min-h-[110px] px-3 py-2 text-[13px] text-text-primary outline-none transition-all focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/50"
                placeholder="Describe the expected behavior or outcome."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 ml-1 block text-[11px] font-medium uppercase tracking-[0.08em] text-text-secondary">
                  Due Date
                </label>
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(event) => setTaskForm((current) => ({ ...current, dueDate: event.target.value }))}
                  className="w-full rounded-lg border border-border bg-bg-base h-10 px-3 text-[13px] text-text-primary outline-none transition-all focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/50 [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="mb-1.5 ml-1 block text-[11px] font-medium uppercase tracking-[0.08em] text-text-secondary">
                  Assignee
                </label>
                <input
                  type="text"
                  value={taskForm.assigneeName}
                  onChange={(event) => setTaskForm((current) => ({ ...current, assigneeName: event.target.value }))}
                  className="w-full rounded-lg border border-border bg-bg-base h-10 px-3 text-[13px] text-text-primary outline-none transition-all focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/50"
                  placeholder="Arjun"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 ml-1 block text-[11px] font-medium uppercase tracking-[0.08em] text-text-secondary">
                Labels
              </label>
              <input
                type="text"
                value={taskForm.labelsText}
                onChange={(event) => setTaskForm((current) => ({ ...current, labelsText: event.target.value }))}
                className="w-full rounded-lg border border-border bg-bg-base h-10 px-3 text-[13px] text-text-primary outline-none transition-all focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/50"
                placeholder="backend, auth, urgent"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Column"
                value={taskForm.columnId}
                options={columnOptions}
                onChange={(value) => setTaskForm((current) => ({ ...current, columnId: value }))}
              />
              <Select
                label="Priority"
                value={taskForm.priority}
                options={prioritySelectOptions}
                onChange={(value) =>
                  setTaskForm((current) => ({
                    ...current,
                    priority: value as Priority,
                  }))
                }
              />
            </div>
            <div className="flex items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 text-[11px] font-mono text-text-muted">
                <Calendar size={12} />
                <span>{activeBoard?.name ?? 'No active board'}</span>
              </div>
              <div className="flex gap-2">
                {editingTask ? (
                  <Button
                    type="button"
                    variant="danger"
                    onClick={handleDeleteTask}
                    isLoading={isDeletingTask}
                  >
                    <Trash2 size={13} className="mr-1.5" />
                    Delete
                  </Button>
                ) : null}
                <Button type="button" variant="ghost" onClick={resetTaskModal}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSubmittingTask}>
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </Button>
              </div>
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
};
