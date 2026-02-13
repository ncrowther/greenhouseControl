'use client';

import {
  Header,
  HeaderContainer,
  HeaderName,
  HeaderMenu,
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
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const GreenhouseHeader = () => {
  const router = useRouter();
  return (
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

          <HeaderNavigation aria-label="IBM [Platform]">
            <HeaderMenu aria-label="Set" menuLinkName="Set">
              <HeaderMenuItem
                Light
                label="Light"
                onClick={() => {
                  router.push('/light');
                }}
              >
                Light
              </HeaderMenuItem>

              <HeaderMenuItem
                Light
                label="Fan"
                onClick={() => {
                  router.push('/fan');
                }}
              >
                Fan
              </HeaderMenuItem>

              <HeaderMenuItem
                Light
                label="Vent"
                onClick={() => {
                  router.push('/vent');
                }}
              >
                Vent
              </HeaderMenuItem>

              <HeaderMenuItem
                Light
                label="Heater"
                onClick={() => {
                  router.push('/heater');
                }}
              >
                Heater
              </HeaderMenuItem>

              <HeaderMenuItem
                Light
                label="Humidifier"
                onClick={() => {
                  router.push('/humidifier');
                }}
              >
                Humidifier
              </HeaderMenuItem>

              <HeaderMenuItem
                Light
                label="Water"
                onClick={() => {
                  router.push('/water');
                }}
              >
                Water
              </HeaderMenuItem>
            </HeaderMenu>

            <HeaderMenu aria-label="View" menuLinkName="View">
              <HeaderMenuItem
                Light
                label="Chart"
                onClick={() => {
                  router.push('/chart');
                }}
              >
                Chart
              </HeaderMenuItem>

              <HeaderMenuItem
                Light
                label="Telemetry"
                onClick={() => {
                  router.push('/telemetry');
                }}
              >
                Telemetry
              </HeaderMenuItem>
            </HeaderMenu>

            <HeaderMenu aria-label="Lora" menuLinkName="Lora">
              <HeaderMenuItem
                Light
                label="Air chart"
                onClick={() => {
                  router.push('/datalogger');
                }}
              >
                Air Chart
              </HeaderMenuItem>

              <HeaderMenuItem
                Light
                label="Soil chart"
                onClick={() => {
                  router.push('/soil');
                }}
              >
                Soil Chart
              </HeaderMenuItem>
            </HeaderMenu>

            <HeaderMenuItem
              Light
              label="Cam"
              onClick={() => {
                router.push('/timelapse');
              }}
            >
              Cam
            </HeaderMenuItem>
          </HeaderNavigation>

          <SideNav
            aria-label="Side navigation"
            expanded={isSideNavExpanded}
            isPersistent={false}
          >
            <SideNavItems>
              <HeaderSideNavItems>
                <Link href="/light" passHref legacyBehavior>
                  <HeaderMenuItem>Light</HeaderMenuItem>
                </Link>
                <Link href="/fan" passHref legacyBehavior>
                  <HeaderMenuItem>Fan</HeaderMenuItem>
                </Link>
                <Link href="/vent" passHref legacyBehavior>
                  <HeaderMenuItem>Vent</HeaderMenuItem>
                </Link>
                <Link href="/heater" passHref legacyBehavior>
                  <HeaderMenuItem>Heater</HeaderMenuItem>
                </Link>
                <Link href="/humidifier" passHref legacyBehavior>
                  <HeaderMenuItem>Humidifier</HeaderMenuItem>
                </Link>
                <Link href="/water" passHref legacyBehavior>
                  <HeaderMenuItem>Water</HeaderMenuItem>
                </Link>
                <Link href="/chart" passHref legacyBehavior>
                  <HeaderMenuItem>Greenhouse</HeaderMenuItem>
                </Link>
                <Link href="/datalogger" passHref legacyBehavior>
                  <HeaderMenuItem>Polytunnel</HeaderMenuItem>
                </Link>
                <Link href="/timelapse" passHref legacyBehavior>
                  <HeaderMenuItem>Cam</HeaderMenuItem>
                </Link>
                <Link href="/telemetry" passHref legacyBehavior>
                  <HeaderMenuItem>Telemetry</HeaderMenuItem>
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
            <HeaderGlobalAction
              aria-label="App Switcher"
              tooltipAlignment="end"
            >
              <Switcher size={20} />
            </HeaderGlobalAction>
          </HeaderGlobalBar>
        </Header>
      )}
    />
  );
};

export default GreenhouseHeader;
