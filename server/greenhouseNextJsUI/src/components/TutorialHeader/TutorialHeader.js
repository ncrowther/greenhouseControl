'use client';

import {
  Header,
  HeaderContainer,
  HeaderName,
  HeaderNavigation,
  HeaderMenuButton,
  HeaderMenuItem,
  HeaderGlobalBar,
  HeaderGlobalAction,
  SkipToContent,
  SideNav,
  SideNavItems,
  HeaderSideNavItems,
} from '@carbon/react';
import { Switcher, Notification, UserAvatar } from '@carbon/icons-react';

import Link from 'next/link';

const TutorialHeader = () => (
  <HeaderContainer
    render={({ isSideNavExpanded, onClickSideNavExpand }) => (
      <Header aria-label="Carbon Tutorial">
        <SkipToContent />
        <HeaderMenuButton
          aria-label="Open menu"
          onClick={onClickSideNavExpand}
          isActive={isSideNavExpanded}
        />
        <Link href="/" passHref legacyBehavior>
          <HeaderName prefix="IBM">Greenhouse</HeaderName>
        </Link>
        <HeaderNavigation aria-label="Carbon Tutorial">
          <Link href="/config" passHref legacyBehavior>
            <HeaderMenuItem>Configuration</HeaderMenuItem>
          </Link>
          <Link href="/status" passHref legacyBehavior>
            <HeaderMenuItem>Status</HeaderMenuItem>
          </Link>
          <Link href="/temphum" passHref legacyBehavior>
            <HeaderMenuItem>Temperature/Humidity</HeaderMenuItem>
          </Link>
          <Link href="/vpd" passHref legacyBehavior>
            <HeaderMenuItem>Vpd</HeaderMenuItem>
          </Link>
          <Link href="/co2" passHref legacyBehavior>
            <HeaderMenuItem>Co2</HeaderMenuItem>
          </Link>
          <Link
            href={{ pathname: '/timelapse', query: { camId: 1 } }}
            passHref
            legacyBehavior
          >
            <HeaderMenuItem>Timelapse Cam 1</HeaderMenuItem>
          </Link>
          <Link
            href={{ pathname: '/timelapse', query: { camId: 2 } }}
            passHref
            legacyBehavior
          >
            <HeaderMenuItem>Timelapse Cam 2</HeaderMenuItem>
          </Link>
          <Link href="/repos" passHref legacyBehavior>
            <HeaderMenuItem>Data</HeaderMenuItem>
          </Link>
        </HeaderNavigation>
        <SideNav
          aria-label="Side navigation"
          expanded={isSideNavExpanded}
          isPersistent={false}
        >
          <SideNavItems>
            <HeaderSideNavItems>
              <Link href="/config" passHref legacyBehavior>
                <HeaderMenuItem>Configuration</HeaderMenuItem>
              </Link>
              <Link href="/status" passHref legacyBehavior>
                <HeaderMenuItem>Status</HeaderMenuItem>
              </Link>
              <Link href="/temphum" passHref legacyBehavior>
                <HeaderMenuItem>Temperature/Humidity</HeaderMenuItem>
              </Link>
              <Link href="/vpd" passHref legacyBehavior>
                <HeaderMenuItem>Vpd</HeaderMenuItem>
              </Link>
              <Link href="/co2" passHref legacyBehavior>
                <HeaderMenuItem>Co2</HeaderMenuItem>
              </Link>
              <Link href="/timelapse?camId=1" passHref legacyBehavior>
                <HeaderMenuItem>Timelapse Cam 1</HeaderMenuItem>
              </Link>
              <Link href="/timelapse?camId=2" passHref legacyBehavior>
                <HeaderMenuItem>Timelapse Cam 2</HeaderMenuItem>
              </Link>
              <Link href="/repos" passHref legacyBehavior>
                <HeaderMenuItem>Data</HeaderMenuItem>
              </Link>
            </HeaderSideNavItems>
          </SideNavItems>
        </SideNav>
        <HeaderGlobalBar>
          <HeaderGlobalAction
            aria-label="Notifications"
            tooltipAlignment="center"
            className="action-icons"
          >
            <Notification size={20} />
          </HeaderGlobalAction>
          <HeaderGlobalAction
            aria-label="User Avatar"
            tooltipAlignment="center"
            className="action-icons"
          >
            <UserAvatar size={20} />
          </HeaderGlobalAction>
          <HeaderGlobalAction aria-label="App Switcher" tooltipAlignment="end">
            <Switcher size={20} />
          </HeaderGlobalAction>
        </HeaderGlobalBar>
      </Header>
    )}
  />
);

export default TutorialHeader;
