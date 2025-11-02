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
  MenuButton,
  MenuItem,
  MenuItemDivider,
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
            <HeaderName prefix="IBM">Greenhouse</HeaderName>
          </Link>

          <HeaderNavigation aria-label="IBM [Platform]">
            <HeaderMenu aria-label="Config" menuLinkName="Config">
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
                label="Cool"
                onClick={() => {
                  router.push('/cool');
                }}
              >
                Cool
              </HeaderMenuItem>

              <HeaderMenuItem
                Light
                label="Heat"
                onClick={() => {
                  router.push('/heat');
                }}
              >
                Heat
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

            <HeaderMenu aria-label="Data" menuLinkName="Data">
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
                label="Cam"
                onClick={() => {
                  router.push('/timelapse');
                }}
              >
                Cam
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

            <HeaderMenu aria-label="Poly" menuLinkName="Poly">
              <HeaderMenuItem
                Light
                label="air"
                onClick={() => {
                  router.push('/datalogger');
                }}
              >
                Air
              </HeaderMenuItem>

              <HeaderMenuItem
                Light
                label="soil"
                onClick={() => {
                  router.push('/soil');
                }}
              >
                Soil
              </HeaderMenuItem>
            </HeaderMenu>
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
                <Link href="/cool" passHref legacyBehavior>
                  <HeaderMenuItem>Cool</HeaderMenuItem>
                </Link>
                <Link href="/heat" passHref legacyBehavior>
                  <HeaderMenuItem>Heat</HeaderMenuItem>
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
