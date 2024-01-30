import { type FC, type ReactNode, useEffect, useMemo, useState, useRef } from 'react'

import ReactMarkdown from '~/lib/react-markdown.min.js'

import rehypeHighlight from 'rehype-highlight'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { useDebouncedCallback } from 'use-debounce';
import Mermaid from 'mermaid';
import copyToClipboard from 'copy-to-clipboard'

export function PreCode(props: { children: any }) {
  const ref = useRef<HTMLPreElement>(null);
  const refText = ref.current?.innerText;
  const [mermaidCode, setMermaidCode] = useState("");

  const renderMermaid = useDebouncedCallback(() => {
    if (!ref.current) return;
    const mermaidDom = ref.current.querySelector("code.language-mermaid");
    if (mermaidDom) {
      setMermaidCode((mermaidDom as HTMLElement).innerText);
    }
  }, 600);

  useEffect(() => {
    setTimeout(renderMermaid, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refText]);

  return (
    <>
      {mermaidCode.length > 0 && (
        //@ts-ignore
        <Mermaid code={mermaidCode} key={mermaidCode} />
      )}
      <pre ref={ref}>
        <span
          className="copy-code-button"
          onClick={() => {
            if (ref.current) {
              const code = ref.current.innerText;
              copyToClipboard(code);
            }
          }}
        ></span>
        {props.children}
      </pre>
    </>
  );
}



const Markdown: FC<{ children: string }> = ({ children }) => {
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
