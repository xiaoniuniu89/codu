/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { FormatBold } from "@styled-icons/material/FormatBold";
import { FormatItalic } from "@styled-icons/material/FormatItalic";
import { FormatUnderlined } from "@styled-icons/material/FormatUnderlined";
import { FormatStrikethrough } from "@styled-icons/material";
import { Link as LinkIcon } from "@styled-icons/material/Link";
import { TextIncrease } from "@styled-icons/material";

import styles from './index.module.css';

// use-client

import {$isCodeHighlightNode} from '@lexical/code';
import {$isLinkNode, TOGGLE_LINK_COMMAND} from '@lexical/link';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {mergeRegister} from '@lexical/utils';
import {
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  LexicalEditor,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import {useCallback, useEffect, useRef, useState} from 'react';
import * as React from 'react';
import {createPortal} from 'react-dom';

import {getDOMRangeRect} from '../../utils/getDOMRangeRect';
import {getSelectedNode} from '../../utils/getSelectedNode';
import {setFloatingElemPosition} from '../../utils/setFloatingElemPosition';
// import {INSERT_INLINE_COMMAND} from '../CommentPlugin';

function TextFormatFloatingToolbar({
  editor,
  anchorElem,
  isLink,
  isBold,
  isItalic,
  isUnderline,
  isCode,
  isStrikethrough,
  isSubscript,
  isSuperscript,
}: {
  editor: LexicalEditor;
  anchorElem: HTMLElement;
  isBold: boolean;
  isCode: boolean;
  isItalic: boolean;
  isLink: boolean;
  isStrikethrough: boolean;
  isSubscript: boolean;
  isSuperscript: boolean;
  isUnderline: boolean;
}): JSX.Element {
  const popupCharStylesEditorRef = useRef<HTMLDivElement | null>(null);

  const insertLink = useCallback(() => {
    if (!isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, 'https://');
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink]);


  function mouseMoveListener(e: MouseEvent) {
    if (
      popupCharStylesEditorRef?.current &&
      (e.buttons === 1 || e.buttons === 3)
    ) {
      if (popupCharStylesEditorRef.current.style.pointerEvents !== 'none') {
        const x = e.clientX;
        const y = e.clientY;
        const elementUnderMouse = document.elementFromPoint(x, y);

        if (!popupCharStylesEditorRef.current.contains(elementUnderMouse)) {
          // Mouse is not over the target element => not a normal click, but probably a drag
          popupCharStylesEditorRef.current.style.pointerEvents = 'none';
        }
      }
    }
  }
  function mouseUpListener(e: MouseEvent) {
    if (popupCharStylesEditorRef?.current) {
      if (popupCharStylesEditorRef.current.style.pointerEvents !== 'auto') {
        popupCharStylesEditorRef.current.style.pointerEvents = 'auto';
      }
    }
  }

  useEffect(() => {
    if (popupCharStylesEditorRef?.current) {
      document.addEventListener('mousemove', mouseMoveListener);
      document.addEventListener('mouseup', mouseUpListener);

      return () => {
        document.removeEventListener('mousemove', mouseMoveListener);
        document.removeEventListener('mouseup', mouseUpListener);
      };
    }
  }, [popupCharStylesEditorRef]);

  const updateTextFormatFloatingToolbar = useCallback(() => {
    const selection = $getSelection();

    const popupCharStylesEditorElem = popupCharStylesEditorRef.current;
    const nativeSelection = window.getSelection();

    if (popupCharStylesEditorElem === null) {
      return;
    }

    const rootElement = editor.getRootElement();
    if (
      selection !== null &&
      nativeSelection !== null &&
      !nativeSelection.isCollapsed &&
      rootElement !== null &&
      rootElement.contains(nativeSelection.anchorNode)
    ) {
      const rangeRect = getDOMRangeRect(nativeSelection, rootElement);

      setFloatingElemPosition(rangeRect, popupCharStylesEditorElem, anchorElem);
    }
  }, [editor, anchorElem]);

  useEffect(() => {
    const scrollerElem = anchorElem.parentElement;

    const update = () => {
      editor.getEditorState().read(() => {
        updateTextFormatFloatingToolbar();
      });
    };

    window.addEventListener('resize', update);
    if (scrollerElem) {
      scrollerElem.addEventListener('scroll', update);
    }

    return () => {
      window.removeEventListener('resize', update);
      if (scrollerElem) {
        scrollerElem.removeEventListener('scroll', update);
      }
    };
  }, [editor, updateTextFormatFloatingToolbar, anchorElem]);

  useEffect(() => {
    editor.getEditorState().read(() => {
      updateTextFormatFloatingToolbar();
    });
    return mergeRegister(
      editor.registerUpdateListener(({editorState}) => {
        editorState.read(() => {
          updateTextFormatFloatingToolbar();
        });
      }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateTextFormatFloatingToolbar();
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor, updateTextFormatFloatingToolbar]);

  return (
    <div ref={popupCharStylesEditorRef} className="rounded-lg bg-gray-700 inline-flex" >
      {editor.isEditable() && (
        <>
          <button
            type="button"
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
            }}
            className={`${styles.popupItem} ${styles.spaced} ${isBold ? styles.active : ''}`}
            aria-label="Format text as bold">
            <span className="">
          <FormatBold size={20} />
        </span>
          </button>
          <button
            type="button"
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
            }}
            className={`${styles.popupItem} ${styles.spaced} ${isItalic ? styles.active : ''}`}
            aria-label="Format text as italics">
           <span className="">
          <FormatItalic size={20} />
        </span>
          </button>
          <button
            type="button"
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
            }}
            className={`${styles.popupItem} ${styles.spaced} ${isUnderline ? styles.active : ''}`}
            aria-label="Format text to underlined">
            <span className="">
          <FormatUnderlined size={20} />
        </span>
          </button>
          <button
            type="button"
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
            }}
            className={`${styles.popupItem} ${styles.spaced} ${isStrikethrough ? styles.active : ''}`}
            aria-label="Format text with a strikethrough">
            <span className="">
          <FormatStrikethrough size={20} />
        </span>
          </button>
          <button
            type="button"
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'subscript');
            }}
            className={`${styles.popupItem} ${styles.spaced} ${isSubscript ? styles.active : ''}`}
            title="Subscript"
            aria-label="Format Subscript">
            <i className={styles.formatSubscript} />
          </button>
          <button
            type="button"
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript');
            }}
            className={`${styles.popupItem} ${styles.spaced} ${isSuperscript ? styles.active : ''}`}
            title="Superscript"
            aria-label="Format Superscript">
            <i className={styles.formatSuperscript} />
          </button>
          <button
            type="button"
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code');
            }}
            className={`${styles.popupItem} ${styles.spaced} ${isCode ? styles.active : ''}`}
            aria-label="Insert code block">
            <i className={styles.formatCode} />
          </button>
          <button
            type="button"
            onClick={insertLink}
            className={`${styles.popupItem} ${styles.spaced} ${isLink ? styles.active : ''}`}
            aria-label="Insert link">
             <span className="">
          <FormatStrikethrough size={20} />
        </span>
          </button>
        </>
      )}
      {/* Additional buttons */}
    </div>
  );
}

function useFloatingTextFormatToolbar(
  editor: LexicalEditor,
  anchorElem: HTMLElement,
): JSX.Element | null {
  const [isText, setIsText] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isSubscript, setIsSubscript] = useState(false);
  const [isSuperscript, setIsSuperscript] = useState(false);
  const [isCode, setIsCode] = useState(false);

  const updatePopup = useCallback(() => {
    editor.getEditorState().read(() => {
      // Should not to pop up the floating toolbar when using IME input
      if (editor.isComposing()) {
        return;
      }
      const selection = $getSelection();
      const nativeSelection = window.getSelection();
      const rootElement = editor.getRootElement();

      if (
        nativeSelection !== null &&
        (!$isRangeSelection(selection) ||
          rootElement === null ||
          !rootElement.contains(nativeSelection.anchorNode))
      ) {
        setIsText(false);
        return;
      }

      if (!$isRangeSelection(selection)) {
        return;
      }

      const node = getSelectedNode(selection);

      // Update text format
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));
      setIsSubscript(selection.hasFormat('subscript'));
      setIsSuperscript(selection.hasFormat('superscript'));
      setIsCode(selection.hasFormat('code'));

      // Update links
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }

      if (
        !$isCodeHighlightNode(selection.anchor.getNode()) &&
        selection.getTextContent() !== ''
      ) {
        setIsText($isTextNode(node));
      } else {
        setIsText(false);
      }

      const rawTextContent = selection.getTextContent().replace(/\n/g, '');
      if (!selection.isCollapsed() && rawTextContent === '') {
        setIsText(false);
        return;
      }
    });
  }, [editor]);

  useEffect(() => {
    document.addEventListener('selectionchange', updatePopup);
    return () => {
      document.removeEventListener('selectionchange', updatePopup);
    };
  }, [updatePopup]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(() => {
        updatePopup();
      }),
      editor.registerRootListener(() => {
        if (editor.getRootElement() === null) {
          setIsText(false);
        }
      }),
    );
  }, [editor, updatePopup]);

  if (!isText || isLink) {
    return null;
  }

  // return createPortal(
  //   <TextFormatFloatingToolbar
  //     editor={editor}
  //     anchorElem={anchorElem}
  //     isLink={isLink}
  //     isBold={isBold}
  //     isItalic={isItalic}
  //     isStrikethrough={isStrikethrough}
  //     isSubscript={isSubscript}
  //     isSuperscript={isSuperscript}
  //     isUnderline={isUnderline}
  //     isCode={isCode}
  //   />,
  //   anchorElem,
  // );
  return (
    <TextFormatFloatingToolbar
      editor={editor}
      anchorElem={anchorElem}
      isLink={isLink}
      isBold={isBold}
      isItalic={isItalic}
      isStrikethrough={isStrikethrough}
      isSubscript={isSubscript}
      isSuperscript={isSuperscript}
      isUnderline={isUnderline}
      isCode={isCode}
    />
  )
}

export default function FloatingTextFormatToolbarPlugin({
  anchorElem = document.body,
}: {
  anchorElem?: HTMLElement;
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  return useFloatingTextFormatToolbar(editor, anchorElem);
}

// export default function FloatingTextFormatToolbarPlugin({
//   anchorElem: initialAnchorElem,
// }: {
//   anchorElem?: HTMLElement;
// }): JSX.Element | null {
//   const [anchorElem, setAnchorElem] = useState<HTMLElement | null>(null);
// const [editor] = useLexicalComposerContext();
//   return useFloatingTextFormatToolbar(editor, anchorElem);
// }