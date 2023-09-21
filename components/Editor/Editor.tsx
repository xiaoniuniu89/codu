import React, { useCallback, useEffect, useState } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { FormatBold } from "@styled-icons/material/FormatBold";
import { FormatItalic } from "@styled-icons/material/FormatItalic";
import { FormatUnderlined } from "@styled-icons/material/FormatUnderlined";
import { FormatQuote } from "@styled-icons/material";
import { Link as LinkIcon } from "@styled-icons/material/Link";
import { TextIncrease } from "@styled-icons/material";
import { Code } from "@styled-icons/material";

import FloatingTextFormatToolbarPlugin from "./plugins/FloatingTextFormatToolbarPlugin";

// plugins
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListItemNode,
  ListNode,
} from "@lexical/list";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";

import {LinkNode, toggleLink} from '@lexical/link';


// nodes
import { HeadingNode, $createHeadingNode, $createQuoteNode, QuoteNode } from "@lexical/rich-text";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  EditorState,
  LexicalNode,
  $isTextNode,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  LexicalEditor,
  SELECTION_CHANGE_COMMAND,
} from "lexical";

// serializers
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
} from "@lexical/markdown";
import { PLAYGROUND_TRANSFORMERS } from "./plugins/MarkdownTransformers";

// utils
import { $setBlocksType } from "@lexical/selection";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";

const theme = {};

function onError(error: Error): void {
  console.error(error);
}

// <ListToolbarPlugin />
//       <ListPlugin />

const Editor: React.FC<{
  onChange: React.ChangeEvent<HTMLInputElement>;
  initialValue: string;
}> = ({ onChange, initialValue }) => {
  const [initialValueSet, setInitialValueSet] = useState(false);

  const initialConfig = {
    theme,
    onError,
    nodes: [HeadingNode, ListNode, ListItemNode, LinkNode, QuoteNode],
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
    const onClick = (tag: string) => {
      editor.update(() => {
        const selection = $getSelection();
        $setBlocksType(selection, () => $createHeadingNode(tag));
      });
    };
    return (
      <>
        {["h3", "h4"].map(tag => (
          <button
            className="text-white hover:bg-gray-500 rounded"
            key={tag}
            onClick={() => onClick(tag)}
          >
            <span className="">
              <TextIncrease size={tag === "h3" ? 20 : 15} />
            </span>
          </button>
        ))}
      </>
    );
  }

  // function ListToolbarPlugin(): JSX.Element {
  //   const [editor] = useLexicalComposerContext();
  //   const onClick = (tag: "ol" | "li") => {
  //     if (tag === "ol") {
  //       editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
  //       return;
  //     }
  //     editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
  //   };
  //   return (
  //     <>
  //       {["ol", "ul"].map((tag) => (
  //         <button
  //           className="text-white hover:bg-gray-500 py-2 px-4 rounded"
  //           key={tag}
  //           onClick={() => onClick(tag)}
  //         >
  //           {tag}
  //         </button>
  //       ))}
  //     </>
  //   );
  // };

  function ToolBarPlugin(): JSX.Element {
    const [editor] = useLexicalComposerContext();

    const createLink = () => {
      const url = window.prompt('Enter the URL:');

      editor.update(() => {
        const selection = $getSelection();
        toggleLink(url, {title: selection})
      })

    }

    const createQuote = () => {
      editor.update(() => {
        console.log('firing')
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createQuoteNode());
            }
          })
    }
  
    return (
      <div className="rounded-lg bg-gray-700 inline-flex">
        {/* bold  */}
        <button
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
          }}
          className="flex items-center text-white hover:bg-gray-500 "
        >
          <span className="">
            <FormatBold size={20} />
          </span>
        </button>
        {/* italic  */}
        <button
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
          }}
          className="flex items-center text-white hover:bg-gray-500 "
        >
          <span className="">
            <FormatItalic size={20} /> {/* Adjust the size as needed */}
          </span>
        </button>
        {/* link  */}
        <button
          onClick={createLink}
          className="flex items-center text-white hover:bg-gray-500"
        >
          <span className="-rotate-45">
            <LinkIcon size={20} />
          </span>
        </button>
        <HeadingToolbarPlugin />
        <button
          onClick={createQuote}
          className="flex items-center text-white hover:bg-gray-500"
        >
          <span className="">
            <FormatQuote size={20} />
          </span>
        </button>
        <button
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
          }}
          className="flex items-center text-white hover:bg-gray-500 "
        >
          <span className="">
            <Code size={20} />
          </span>
        </button>
      </div>
    );
  }

  const urlRegExp = new RegExp(
   /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[\w]*))?)/,
);
function validateUrl(url: string): boolean {
   return url === 'https://' || urlRegExp.test(url);
}

  return (
    <LexicalComposer initialConfig={initialConfig} className="relative">
      <ToolBarPlugin />
      <LinkPlugin validateUrl={validateUrl} />
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
