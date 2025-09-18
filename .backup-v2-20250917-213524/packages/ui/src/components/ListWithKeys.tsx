'use client'

import React from 'react'

interface ListItem {
  id: string | number
  [key: string]: any
}

interface ListWithKeysProps {
  items: ListItem[]
  renderItem: (item: ListItem, index: number) => React.ReactNode
}

/**
 * Example component showing proper key usage in lists
 */
export const ListWithKeys: React.FC<ListWithKeysProps> = ({ items, renderItem }) => {
  return (
    <div className="space-y-xs">
      {items.map((item, index) => (
        <div key={item.id || `item-${index}`}>
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  )
}

// Example usage patterns
export const KeyExamples = () => {
  const data = [
    { id: '1', name: 'Item 1' },
    { id: '2', name: 'Item 2' },
    { id: '3', name: 'Item 3' }
  ]

  return (
    <>
      {/* Good: Using unique id as key */}
      {data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}

      {/* Acceptable: Using index when items are stable */}
      {data.map((item, index) => (
        <div key={`stable-${index}`}>{item.name}</div>
      ))}

      {/* Best: Using composite key for complex scenarios */}
      {data.map((item, index) => (
        <div key={`${item.id}-${index}`}>{item.name}</div>
      ))}
    </>
  )
}
