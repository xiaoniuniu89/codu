import React from 'react'

import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  EditorState,
  LexicalNode,
} from "lexical";

import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListItemNode,
  ListNode,
} from "@lexical/list";

import { $setBlocksType } from "@lexical/selection";

import { FormatBold } from "@styled-icons/material/FormatBold";
import { FormatItalic } from "@styled-icons/material/FormatItalic";
import { FormatUnderlined } from "@styled-icons/material/FormatUnderlined";
import { Link as LinkIcon } from "@styled-icons/material/Link";
import { TextFields, Title } from "@styled-icons/material";


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

  function HooveringToolBarPlugin(): JSX.Element {
    const [editor] = useLexicalComposerContext();
    return (
      <div>
        <HeadingToolbarPlugin />
        <ListToolbarPlugin />
        <ListPlugin />
      </div>
    );
  }

  export default HooveringToolBarPlugin