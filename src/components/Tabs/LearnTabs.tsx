import React, { useState, ReactNode } from 'react';
import styled from 'styled-components';

// Types for our learn tabs
export interface LearnTab {
  id: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
}

interface LearnTabsProps {
  tabs: LearnTab[];
  defaultTab?: string;
}

// Styled components
const Container = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const TabsHeader = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.background};
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
`;

const TabButton = styled.button<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  background-color: transparent;
  color: ${({ theme, active }) => active ? theme.colors.primary : theme.colors.text.secondary};
  border: none;
  border-bottom: 2px solid ${({ theme, active }) => active ? theme.colors.primary : 'transparent'};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme, active }) => active ? theme.typography.fontWeight.semiBold : theme.typography.fontWeight.regular};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover, &:focus {
    color: ${({ theme }) => theme.colors.primary};
    outline: none;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const TabContent = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
`;

const LearnTabs: React.FC<LearnTabsProps> = ({ tabs, defaultTab }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0].id);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <Container>
      <TabsHeader>
        {tabs.map(tab => (
          <TabButton
            key={tab.id}
            active={activeTab === tab.id}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.icon}
            {tab.label}
          </TabButton>
        ))}
      </TabsHeader>
      <TabContent>
        {activeTabContent}
      </TabContent>
    </Container>
  );
};

export default LearnTabs; 