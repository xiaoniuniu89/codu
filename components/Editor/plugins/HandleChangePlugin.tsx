import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { useEffect } from "react"
import { PLAYGROUND_TRANSFORMERS } from "./MarkdownTransformers"


function HandleChangePlugin (props): null {
    const [editor] = useLexicalComposerContext()
    const {onChange} = props
    let markdown: string
    useEffect(() => {
      return editor.registerUpdateListener(({editorState}) => {
        editorState.read(() => {
        const convertedMarkdown = $convertToMarkdownString(PLAYGROUND_TRANSFORMERS);
        console.log(markdown)
        markdown = convertedMarkdown
        })
        onChange(markdown)
      })
    },[onChange, editor])
    return null
}

export default HandleChangePlugin

function $convertToMarkdownString(PLAYGROUND_TRANSFORMERS: any) {
    throw new Error("Function not implemented.")
}
