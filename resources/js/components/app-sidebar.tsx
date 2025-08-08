import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    BookOpen,
    Clock1Icon,
    Cog,
    Folder,
    Globe,
    Grid,
    LayoutGrid,
    Receipt,
    ReceiptEuroIcon,
    Users
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Kunden',
        href: '/kunden',
        icon: Users
    },
    {
        title: 'Projekte',
        href: '/projekte',
        icon: Grid
    },
    {
        title: 'Angebote',
        href: '/angebote',
        icon: Receipt,
    },
    {
        title: 'Rechnungen',
        href: '/rechnungen',
        icon: ReceiptEuroIcon
    },
    {
        title: 'Zeiterfassung',
        href: '/zeiterfassung',
        icon: Clock1Icon
    },
    {
        title: 'Konfiguration',
        href: '/konfiguration',
        icon: Cog
    }
];

const footerNavItems: NavItem[] = [
    {
        title: 'Webseite',
        href: 'https://marco-middeldorff.de',
        icon: Globe,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
