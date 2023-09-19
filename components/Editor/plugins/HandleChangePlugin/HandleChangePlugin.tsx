import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import React, { useEffect } from "react"
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
} from "@lexical/markdown";
import { PLAYGROUND_TRANSFORMERS } from "../MarkdownTransformers"


function HandleChangePlugin(props: {
    onChange: React.ChangeEvent<HTMLInputElement>;
    initialValue: string;
  }): null {
    const [editor] = useLexicalComposerContext();
    const { onChange, initialValue } = props;
    const [initialValueSet, setInitialValueSet] = React.useState(false);

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

export default HandleChangePlugin
