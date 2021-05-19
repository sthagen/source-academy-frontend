import { Menu, MenuItem } from '@blueprintjs/core';

export type ContextMenuItems = 'toggleBreakpoint' | 'createCommentPrompt';

// This is the interface that needs to be defined
// It will be converted to a void function
export type ContextMenuHandler = (linenum: number) => void;

export interface ContextMenuProps {
  row: number;
  handlers: { [name in ContextMenuItems]?: ContextMenuHandler };
}

// TODO: disable creating comment prompt when assignment is not yet submitted.

export default function ContextMenu(props: ContextMenuProps) {
  const { handlers, row } = props;

  function apply(item: ContextMenuItems) {
    const fn = handlers[item] || ((row: number) => {});
    return () => fn(row);
  }

  return (
    <Menu onContextMenu={() => false}>
      { handlers["toggleBreakpoint"] && <MenuItem icon="full-circle" text="Toggle Breakpoint" onClick={apply('toggleBreakpoint')} /> }
      { handlers["createCommentPrompt"] && <MenuItem icon="comment" text="Add comment" onClick={apply('createCommentPrompt')} /> }
    </Menu>
  );
}