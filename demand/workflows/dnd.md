# Workflow: Implement Drag and Drop (dnd-kit)

## When to use
When building or modifying the Kanban board drag-and-drop — moving task cards between columns.

## Setup
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

## Architecture

### Board.tsx — DndContext wrapper
```tsx
import { DndContext, DragEndEvent, closestCorners } from '@dnd-kit/core'

// Wrap all columns in <DndContext>
// onDragEnd → extract active (taskId) + over (columnId) → dispatch moveTask()
// collisionDetection={closestCorners} works best for multi-column boards
```

### Column.tsx — SortableContext
```tsx
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

// items={taskIds} — array of task IDs in this column
// Each TaskCard is a sortable item
```

### TaskCard.tsx — useSortable
```tsx
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })

const style = {
  transform: CSS.Transform.toString(transform),
  transition,
  opacity: isDragging ? 0.5 : 1,
}
// Apply ref, style, listeners, attributes to the card div
```

### Redux — moveTask thunk
```ts
// taskSlice.ts
moveTask: (state, action: PayloadAction<{ taskId, fromColumn, toColumn, newIndex }>) => {
  // Remove from source column tasks array
  // Insert into target column tasks array at newIndex
}
// Also fire API call: PATCH /tasks/:id { columnId }
```

## Visual States
- Dragging card: `opacity-50 rotate-1 scale-[1.02]` (per design system)
- Drop target column: subtle border highlight `border-[#FF9E00]/30`
- No drag handle icon — entire card is draggable

## Done when
- Cards drag smoothly between all 3 columns
- Order persists after page refresh (saved to DB)
- Drag state doesn't break card hover styles