import { type FC, type ReactNode, useEffect, useMemo, useState, useRef } from 'react'

import ReactMarkdown from '~/lib/react-markdown.min.js'

import rehypeHighlight from 'rehype-highlight'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { useDebouncedCallback } from 'use-debounce';
import Mermaid from './Mermaid'

export function PreCode(props: { children: any }) {
  const ref = useRef<HTMLPreElement>(null);
  const refText = ref.current?.innerText;
  const [mermaidCode, setMermaidCode] = useState(``);

  const renderMermaid = useDebouncedCallback(() => {
    if (!ref.current) return;
    const mermaidDom = ref.current.querySelector("code.language-mermaid");
    if (mermaidDom) {
      console.log("设置mermaidCode", (mermaidDom as HTMLElement).innerText)
      setMermaidCode((mermaidDom as HTMLElement).innerText);
    }
  }, 600);

  useEffect(() => {
    setTimeout(renderMermaid, 1);
  }, [refText]);

  return (
    <>
      {mermaidCode.length > 0 && (
        <Mermaid chart={mermaidCode} />
      )}
      <pre ref={ref}>
        {props.children}
      </pre>
    </>
  );
}



const Markdown = ({ children }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath, remarkBreaks, remarkGfm]}
      rehypePlugins={[
        [rehypeHighlight, { detect: false, ignoreMissing: true }]

      ]}
      className={`markdown-body markdown-custom-styles`}
      linkTarget="_blank"
      components={{
        pre: PreCode,
        p: (pProps) => <p {...pProps} dir="auto" />,
        a: (aProps) => {
          const href = aProps.href || "";
          const isInternal = /^\/#/i.test(href);
          const target = isInternal ? "_self" : aProps.target ?? "_blank";
          return <a {...aProps} target={target} />;
        },
        // code({ node, inline, className, children, ...props }) {
        //   const match = /language-(\w+)/.exec(className || '')
        //   return (<SyntaxHighlighter language="javascript" style={docco}>
        //     {children}
        //   </SyntaxHighlighter>)
        // },
      }}
    >

      {children}
    </ReactMarkdown>
  )
}

export default Markdown
