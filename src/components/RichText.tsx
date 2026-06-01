'use client'

import { Fragment } from 'react'

interface RichTextProps {
  text: string
  className?: string
  linkClassName?: string
}

type BlockType = 'text' | 'ol' | 'ul'
interface Block { type: BlockType; items: string[] }

function parseBlocks(text: string): Block[] {
  const lines = text.split('\n')
  const blocks: Block[] = []

  for (const line of lines) {
    const olMatch = line.match(/^\d+\.\s(.*)/)
    const ulMatch = line.match(/^[-*]\s(.*)/)

    if (olMatch) {
      const last = blocks[blocks.length - 1]
      if (last?.type === 'ol') last.items.push(olMatch[1])
      else blocks.push({ type: 'ol', items: [olMatch[1]] })
    } else if (ulMatch) {
      const last = blocks[blocks.length - 1]
      if (last?.type === 'ul') last.items.push(ulMatch[1])
      else blocks.push({ type: 'ul', items: [ulMatch[1]] })
    } else {
      const last = blocks[blocks.length - 1]
      if (last?.type === 'text') last.items.push(line)
      else blocks.push({ type: 'text', items: [line] })
    }
  }

  return blocks
}

function renderInline(text: string, linkCls: string) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g)
  return parts.map((part, i) =>
    /^https?:\/\/[^\s]+$/.test(part) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className={linkCls}
        onClick={e => e.stopPropagation()}
      >
        {part}
      </a>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    )
  )
}

export default function RichText({ text, className, linkClassName }: RichTextProps) {
  if (!text) return null

  const linkCls = linkClassName ?? 'text-blue-500 hover:underline break-all'
  const blocks = parseBlocks(text)

  return (
    <div className={className}>
      {blocks.map((block, bi) => {
        if (block.type === 'ol') {
          return (
            <ol key={bi} className="list-decimal list-outside ml-4 space-y-0.5 my-1">
              {block.items.map((item, ii) => (
                <li key={ii}>{renderInline(item, linkCls)}</li>
              ))}
            </ol>
          )
        }
        if (block.type === 'ul') {
          return (
            <ul key={bi} className="list-disc list-outside ml-4 space-y-0.5 my-1">
              {block.items.map((item, ii) => (
                <li key={ii}>{renderInline(item, linkCls)}</li>
              ))}
            </ul>
          )
        }
        // plain text block — preserve line breaks
        return (
          <span key={bi} className="block">
            {block.items.map((line, li) => (
              <Fragment key={li}>
                {renderInline(line, linkCls)}
                {li < block.items.length - 1 && <br />}
              </Fragment>
            ))}
          </span>
        )
      })}
    </div>
  )
}
