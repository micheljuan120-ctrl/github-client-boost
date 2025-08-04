import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  UtensilsCrossed,
  Bot,
  Settings,
  User,
  BarChart3,
  Zap,
  CreditCard,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    description: "Visão geral",
  },
  {
    title: "Integrações AI",
    url: "/integrations",
    icon: Bot,
  },
  {
    title: "WhatsApp Business",
    url: "/whatsapp-business",
    icon: MessageSquare,
    description: "API do WhatsApp Business",
  },
  {
    title: "iFood",
    url: "/dashboard/ifood",
    icon: UtensilsCrossed,
    description: "Integração com iFood",
  },
];

const accountItems = [
  {
    title: "Analytics",
    url: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "Automações",
    url: "/dashboard/automations",
    icon: Zap,
  },
  {
    title: "Planos",
    url: "/dashboard/billing",
    icon: CreditCard,
  },
  {
    title: "Perfil",
    url: "/dashboard/profile",
    icon: User,
  },
  {
    title: "Configurações",
    url: "/dashboard/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    `${
      isActive
        ? "bg-sidebar-accent text-sidebar-primary font-medium"
        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-primary"
    } transition-colors duration-200`;

  return (
    <Sidebar className={`bg-card ${collapsed ? "w-[72px]" : "w-64"}`} collapsible="icon">
      <SidebarContent>
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-dark-primary rounded-3xl flex items-center justify-center shadow-lg">
              <Zap className="w-4 h-4 text-white" />
            </div>
            {!collapsed && (
              <span className="font-bold text-foreground text-lg">
                OmniAI Link
              </span>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground">Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={({ isActive }) =>
                      `flex items-center gap-3 p-2 rounded-xl transition-colors duration-200 ${isActive
                        ? "bg-primary text-primary-foreground font-medium shadow-md"
                        : "text-foreground hover:bg-secondary hover:text-secondary-foreground"
                      }`
                    }>
                      <item.icon className="w-5 h-5" />
                      {!collapsed && (
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {item.title}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {item.description}
                          </span>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Account & Settings */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground">Conta</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={({ isActive }) =>
                      `flex items-center gap-3 p-2 rounded-xl transition-colors duration-200 ${isActive
                        ? "bg-primary text-primary-foreground font-medium shadow-md"
                        : "text-foreground hover:bg-secondary hover:text-secondary-foreground"
                      }`
                    }>
                      <item.icon className="w-5 h-5" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}