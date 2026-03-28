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
            <HeaderName prefix="Open">Greenhouse</HeaderName>
          </Link>

          <HeaderNavigation aria-label="IBM [Platform]">
            <HeaderMenu aria-label="Set" menuLinkName="Zones">
              <HeaderMenuItem
                label="Zone1"
                onClick={() => {
                  router.push('/zone?id=Zone1');
                }}
              >
                Zone1
              </HeaderMenuItem>

              <HeaderMenuItem
                label="Zone2"
                onClick={() => {
                  router.push('/zone?id=Zone2');
                }}
              >
                Zone2
              </HeaderMenuItem>

              <HeaderMenuItem
                label="Zone3"
                onClick={() => {
                  router.push('/zone?id=Zone3');
                }}
              >
                Zone3
              </HeaderMenuItem>

              <HeaderMenuItem
                label="Zone4"
                onClick={() => {
                  router.push('/zone?id=Zone4');
                }}
              >
                Zone4
              </HeaderMenuItem>
            </HeaderMenu>

            <HeaderMenu aria-label="Set" menuLinkName="Set">
              <HeaderMenuItem
                label="Light"
                onClick={() => {
                  router.push('/light');
                }}
              >
                Light
              </HeaderMenuItem>

              <HeaderMenuItem
                label="Fan"
                onClick={() => {
                  router.push('/fan');
                }}
              >
                Fan
              </HeaderMenuItem>

              <HeaderMenuItem
                label="Vent"
                onClick={() => {
                  router.push('/vent');
                }}
              >
                Vent
              </HeaderMenuItem>

              <HeaderMenuItem
                label="Heater"
                onClick={() => {
                  router.push('/heater');
                }}
              >
                Heater
              </HeaderMenuItem>

              <HeaderMenuItem
                label="Humidifier"
                onClick={() => {
                  router.push('/humidifier');
                }}
              >
                Humidifier
              </HeaderMenuItem>

              <HeaderMenuItem
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
                label="Chart"
                onClick={() => {
                  router.push('/chart');
                }}
              >
                Chart
              </HeaderMenuItem>

              <HeaderMenuItem
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
                label="Air chart"
                onClick={() => {
                  router.push('/datalogger');
                }}
              >
                Air Chart
              </HeaderMenuItem>

              <HeaderMenuItem
                label="Soil chart"
                onClick={() => {
                  router.push('/soil');
                }}
              >
                Soil Chart
              </HeaderMenuItem>
            </HeaderMenu>

            <HeaderMenuItem
              label="Cam"
              onClick={() => {
                router.push('/timelapse');
              }}
            >
              Cam
            </HeaderMenuItem>

            <HeaderMenuItem
              label="Env"
              onClick={() => {
                router.push('/settings');
              }}
            >
              Env
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
                  <HeaderMenuItem>Chart</HeaderMenuItem>
                </Link>
                <Link href="/datalogger" passHref legacyBehavior>
                  <HeaderMenuItem>Poly Air</HeaderMenuItem>
                </Link>
                <Link href="/soil" passHref legacyBehavior>
                  <HeaderMenuItem>Poly Soil</HeaderMenuItem>
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
