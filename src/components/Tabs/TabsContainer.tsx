import React, { useState } from 'react';
import styled from 'styled-components';

// Types for our tabs
export interface MainTab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

interface TabsContainerProps {
  tabs: MainTab[];
  defaultTab?: string;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

// Styled components
const Container = styled.div`
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const DesktopTabs = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
`;

const TabButton = styled.button<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  background: none;
  border: none;
  border-bottom: 2px solid ${({ theme, isActive }) => 
    isActive ? theme.colors.primary : 'transparent'};
  color: ${({ theme, isActive }) => 
    isActive ? theme.colors.primary : theme.colors.text.secondary};
  font-weight: ${({ theme, isActive }) => 
    isActive ? theme.typography.fontWeight.semiBold : theme.typography.fontWeight.regular};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const MobileDropdown = styled.div`
  display: none;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: block;
  }
`;

const DropdownButton = styled.button<{ isOpen: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;

  &:after {
    content: '';
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid ${({ theme }) => theme.colors.text.primary};
    transform: ${({ isOpen }) => isOpen ? 'rotate(180deg)' : 'rotate(0)'};
    transition: transform 0.2s ease;
  }
`;

const DropdownMenu = styled.div<{ isOpen: boolean }>`
  display: ${({ isOpen }) => isOpen ? 'block' : 'none'};
  position: absolute;
  width: calc(100% - 2rem);
  margin-top: 4px;
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 10;
`;

const DropdownItem = styled.button<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme, isActive }) => 
    isActive ? theme.colors.primary + '10' : theme.colors.surface};
  border: none;
  color: ${({ theme, isActive }) => 
    isActive ? theme.colors.primary : theme.colors.text.primary};
  font-weight: ${({ theme, isActive }) => 
    isActive ? theme.typography.fontWeight.semiBold : theme.typography.fontWeight.regular};
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const TabContent = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const TabsContainer: React.FC<TabsContainerProps> = ({
  tabs,
  activeTab,
  onTabChange,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  return (
    <Container>
      {/* Desktop Tabs */}
      <DesktopTabs>
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            isActive={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.icon}
            {tab.label}
          </TabButton>
        ))}
      </DesktopTabs>

      {/* Mobile Dropdown */}
      <MobileDropdown>
        <DropdownButton
          isOpen={isDropdownOpen}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          {activeTabData?.icon}
          {activeTabData?.label}
        </DropdownButton>
        <DropdownMenu isOpen={isDropdownOpen}>
          {tabs.map((tab) => (
            <DropdownItem
              key={tab.id}
              isActive={activeTab === tab.id}
              onClick={() => {
                onTabChange(tab.id);
                setIsDropdownOpen(false);
              }}
            >
              {tab.icon}
              {tab.label}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </MobileDropdown>

      <TabContent>
        {activeTabData?.content}
      </TabContent>
    </Container>
  );
};

export default TabsContainer; 