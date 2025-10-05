import React from 'react'
import { Tabs } from 'expo-router'
import { Platform } from 'react-native'

type TabBarIconProps = {
  color: string
}

export default function TabLayout() {
  return (
    // @ts-expect-error expo-router typings rely on React 18 definitions which differ from monorepo root; safe to ignore
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: Platform.OS === 'ios' ? '#F2F2F7' : '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E5EA',
        },
        headerStyle: {
          backgroundColor: '#000',
        },
        headerTintColor: '#fff',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <PlaceholderIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projects',
          tabBarIcon: ({ color }) => <PlaceholderIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <PlaceholderIcon color={color} />,
        }}
      />
    </Tabs>
  )
}

function PlaceholderIcon({ color }: TabBarIconProps) {
  void color
  return null
}
