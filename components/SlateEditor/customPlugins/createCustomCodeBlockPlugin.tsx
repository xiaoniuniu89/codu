import {
  createPluginFactory,
  getPlugin,
  KEY_DESERIALIZE_HTML,
  PlateEditor,
  someNode,
  Value,
} from '@udecode/plate-common';
import {
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  ELEMENT_CODE_SYNTAX,
  decorateCodeLine,
  deserializeHtmlCodeBlock,
  onKeyDownCodeBlock,
  CodeBlockPlugin,
  getLastChildPath
} from '@udecode/plate';
import { RenderElementProps } from 'slate-react';
import { useEditorRef } from '@udecode/plate';
import { Editor, Transforms, Path, Node } from 'slate';

const isLastNodeInEditor = (editor) => {
  const [lastNode, lastPath] = Editor.last(editor, []);
  const [_, parentPath] = Editor.parent(editor, lastPath);
  return Path.equals(parentPath, Editor.path(editor, []));
};

const withCustomCodeBlock = (editor) => {
  const { apply } = editor;

 editor.apply = (operation) => {
  apply(operation);

  if (operation.type === 'insert_node' && operation.node.type === ELEMENT_CODE_BLOCK) {
    if (isLastNodeInEditor(editor)) {
      const emptyNode = { type: 'p', children: [{ text: '' }] };
      const lastChildPath = getLastChildPath([editor, []]);

      if (lastChildPath) {
        Transforms.insertNodes(editor, emptyNode, { at: Path.next(lastChildPath) });
      } else {
        // Fallback if no child node is found
        Transforms.insertNodes(editor, emptyNode);
      }
    }
  }
};



  return editor;
};

export const CustomCodeBlockComponent = (props: RenderElementProps) => {
  const { attributes, children, element } = props;

  // ... Add the logic you want for your custom component

  return (
    <pre {...attributes}>
      {children}
    </pre>
  );
};

export const createCustomCodeBlockPlugin = createPluginFactory<
  CodeBlockPlugin,
  Value,
  PlateEditor
>({
  key: ELEMENT_CODE_BLOCK,
  isElement: true,
  component: CustomCodeBlockComponent,  // Include your component here
  deserializeHtml: deserializeHtmlCodeBlock,
  handlers: {
    onKeyDown: onKeyDownCodeBlock,
  },
  withOverrides: withCustomCodeBlock,
  options: {
    hotkey: ['mod+opt+8', 'mod+shift+8'],
    syntax: true,
    syntaxPopularFirst: false,
  },
  plugins: [
    {
      key: ELEMENT_CODE_LINE,
      isElement: true,
    },
    {
      key: ELEMENT_CODE_SYNTAX,
      isLeaf: true,
      decorate: decorateCodeLine,
    },
  ],
  // ... other configurations
});
