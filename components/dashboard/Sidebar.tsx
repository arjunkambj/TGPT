"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Drawer, DrawerContent, DrawerBody } from "@heroui/drawer";

import SidebarContent from "./sub/sidebar-content";

import { useSidebarToggle } from "@/atoms/sidebarState";

const Sidebar = React.memo(() => {
  const { isOpen, setIsOpen } = useSidebarToggle();
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const handleClose = useCallback(() => {}, []);

  const drawerClasses = useMemo(
    () => `${isMobile ? "" : "hidden"} max-w-[260px] w-[260px] p-0`,
    [isMobile],
  );

  useEffect(() => {
    setIsClient(true);

    const handleResize = () => {
      const mobile = window.innerWidth < 768;

      setIsMobile(mobile);

      if (mobile) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [setIsOpen]);

  const sidebarContent = useMemo(
    () => <SidebarContent onClose={handleClose} />,
    [handleClose],
  );

  if (!isClient) {
    return <section className="h-full bg-default-50">{sidebarContent}</section>;
  }

  return (
    <>
      <section className="h-full border-default-100 bg-gradient-to-b from-[#0f0f0f] via-[#131313] to-[#171717]">
        {!isMobile && (
          <div className="border-r border-neutral-800">{sidebarContent}</div>
        )}

        {isMobile && (
          <Drawer
            hideCloseButton
            backdrop="transparent"
            className={drawerClasses}
            classNames={{
              base: "bg-gradient-to-b from-[#0f0f0f] via-[#131313] to-[#171717]",
            }}
            isOpen={isOpen}
            placement="left"
            radius="none"
            onOpenChange={setIsOpen}
          >
            <DrawerContent className="p-0">
              {(onClose) => (
                <>
                  <DrawerBody className="rounded-none p-0">
                    <SidebarContent onClose={onClose} />
                  </DrawerBody>
                </>
              )}
            </DrawerContent>
          </Drawer>
        )}
      </section>
    </>
  );
});

Sidebar.displayName = "Sidebar";

export default Sidebar;
