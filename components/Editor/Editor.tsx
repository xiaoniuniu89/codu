import React, { useEffect, useState } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";

// plugins
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListItemNode,
  ListNode,
} from "@lexical/list";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";

// nodes
import { HeadingNode, $createHeadingNode } from "@lexical/rich-text";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  EditorState,
  LexicalNode,
} from "lexical";

// serializers
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
} from "@lexical/markdown";
import { PLAYGROUND_TRANSFORMERS } from "./plugins/MarkdownTransformers";

// utils
import { $setBlocksType } from "@lexical/selection";

const theme = {};

function onError(error: Error): void {
  console.error(error);
}

const Editor: React.FC<{
  onChange: React.ChangeEvent<HTMLInputElement>;
  initialValue: string;
}> = ({ onChange, initialValue }) => {
  const [initialValueSet, setInitialValueSet] = useState(false);

  const initialConfig = {
    theme,
    onError,
    nodes: [HeadingNode, ListNode, ListItemNode],
  };

  function HandleChangePlugin(props: {
    onChange: React.ChangeEvent<HTMLInputElement>;
  }): null {
    const [editor] = useLexicalComposerContext();
    const { onChange } = props;

    if (initialValueSet) {
      useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
          editorState.read(() => {
            const convertedMarkdown = $convertToMarkdownString(
              PLAYGROUND_TRANSFORMERS
            );
            onChange(convertedMarkdown);
          });
        });
      }, [onChange, editor]);
    } else {
      editor.update(() => {
        $convertFromMarkdownString(initialValue, PLAYGROUND_TRANSFORMERS);
      });

      setInitialValueSet(true);
    }

    return null;
  }

  function HeadingToolbarPlugin(): JSX.Element {
    const [editor] = useLexicalComposerContext();
    const onClick = (tag: "h1" | "h2" | "h3") => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection) {
          $setBlocksType(selection, () => $createHeadingNode(tag));
        }
      });
    };
    return (
      <>
        {["h1", "h2", "h3"].map((tag) => (
          <button
            className="border border-white text-white hover:bg-white hover:text-gray-800 py-2 px-4 rounded"
            key={tag}
            onClick={() => onClick(tag)}
          >
            {tag}
          </button>
        ))}
      </>
    );
  }

  function ListToolbarPlugin(): JSX.Element {
    const [editor] = useLexicalComposerContext();
    const onClick = (tag: "ol" | "li") => {
      if (tag === "ol") {
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
        return;
      }
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    };
    return (
      <>
        {["ol", "ul"].map((tag) => (
          <button
            className="border border-white text-white hover:bg-white hover:text-gray-800 py-2 px-4 rounded"
            key={tag}
            onClick={() => onClick(tag)}
          >
            {tag}
          </button>
        ))}
      </>
    );
  }

  function ToolBarPlugin(): JSX.Element {
    const [editor] = useLexicalComposerContext();
    return (
      <div>
        <HeadingToolbarPlugin />
        <ListToolbarPlugin />
        <ListPlugin />
      </div>
    );
  }

  return (
    <LexicalComposer initialConfig={initialConfig} className="relative">
      <ToolBarPlugin />
      <div id="editor">
        <RichTextPlugin
          contentEditable={<ContentEditable />}
          placeholder={
            <div className="absolute top-50 left-0">
              Enter your content here 💖
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
          className="border-none text-lg outline-none shadow-none mb-8 bg-neutral-900 focus:bg-black editor-style-overrrides"
        />
      </div>
      <HandleChangePlugin onChange={onChange} />
    </LexicalComposer>
  );
};

export default Editor;
