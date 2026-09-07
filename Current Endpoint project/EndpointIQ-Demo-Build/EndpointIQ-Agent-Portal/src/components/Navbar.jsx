import { useEffect, useRef, useState } from "react";

import {
  Bell,
  Search,
  UserCircle,
  CheckCheck,
  AlertCircle,
  ShieldAlert,
  RefreshCw,
  X,
  Settings,
  LogOut,
} from "lucide-react";

import { useNavigate } from "react-router-dom";


export default function Navbar() {

  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "critical",
      title: "Non-compliant devices detected",
      message: "8 devices are currently non-compliant.",
      time: "5 minutes ago",
      link: "/devices?filter=noncompliant",
      read: false,
    },

    {
      id: 2,
      type: "warning",
      title: "Devices require attention",
      message: "3 devices have a critical EndpointIQ health score.",
      time: "15 minutes ago",
      link: "/devices?filter=critical",
      read: false,
    },

    {
      id: 3,
      type: "sync",
      title: "Device sync issue",
      message: "Some devices have not synced recently.",
      time: "1 hour ago",
      link: "/devices",
      read: false,
    },

    {
      id: 4,
      type: "info",
      title: "Compliance status updated",
      message: "EndpointIQ compliance data has been refreshed.",
      time: "2 hours ago",
      link: "/devices",
      read: true,
    },
  ]);


  const [notificationOpen, setNotificationOpen] =
    useState(false);

  const [profileOpen, setProfileOpen] =
    useState(false);


  const notificationRef = useRef(null);
  const profileRef = useRef(null);


  /*
   * ============================================
   * CURRENT USER
   * ============================================
   */

  const username =
    localStorage.getItem(
      "endpointiq_user"
    ) || "EndpointIQ User";


  /*
   * ============================================
   * UNREAD NOTIFICATION COUNT
   * ============================================
   */

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.read
    ).length;


  /*
   * ============================================
   * CLOSE DROPDOWNS WHEN CLICKING OUTSIDE
   * ============================================
   */

  useEffect(() => {

    function handleClickOutside(event) {

      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target
        )
      ) {

        setNotificationOpen(false);

      }


      if (
        profileRef.current &&
        !profileRef.current.contains(
          event.target
        )
      ) {

        setProfileOpen(false);

      }

    }


    document.addEventListener(
      "mousedown",
      handleClickOutside
    );


    return () => {

      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

    };

  }, []);


  /*
   * ============================================
   * LOGOUT
   * ============================================
   */

  function handleLogout() {

    /*
     * Remove our temporary authentication
     * information.
     */

    localStorage.removeItem(
      "endpointiq_authenticated"
    );

    localStorage.removeItem(
      "endpointiq_user"
    );


    /*
     * Close profile menu.
     */

    setProfileOpen(false);


    /*
     * Go back to Login.
     */

    navigate(
      "/login",
      {
        replace: true,
      }
    );

  }


  /*
   * ============================================
   * MARK NOTIFICATION READ
   * ============================================
   */

  function markAsRead(id) {

    setNotifications(
      (current) =>
        current.map(
          (notification) =>
            notification.id === id
              ? {
                  ...notification,
                  read: true,
                }
              : notification
        )
    );

  }


  /*
   * ============================================
   * MARK ALL READ
   * ============================================
   */

  function markAllAsRead() {

    setNotifications(
      (current) =>
        current.map(
          (notification) => ({
            ...notification,
            read: true,
          })
        )
    );

  }


  /*
   * ============================================
   * OPEN NOTIFICATION
   * ============================================
   */

  function openNotification(
    notification
  ) {

    markAsRead(
      notification.id
    );

    setNotificationOpen(false);

    navigate(
      notification.link
    );

  }


  /*
   * ============================================
   * NOTIFICATION ICON
   * ============================================
   */

  function getNotificationIcon(
    type
  ) {

    if (type === "critical") {

      return (
        <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">

          <AlertCircle
            size={19}
            className="text-red-600"
          />

        </div>
      );

    }


    if (type === "warning") {

      return (
        <div className="w-9 h-9 rounded-full bg-yellow-100 flex items-center justify-center">

          <ShieldAlert
            size={19}
            className="text-yellow-600"
          />

        </div>
      );

    }


    if (type === "sync") {

      return (
        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">

          <RefreshCw
            size={18}
            className="text-blue-600"
          />

        </div>
      );

    }


    return (
      <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">

        <CheckCheck
          size={18}
          className="text-green-600"
        />

      </div>
    );

  }


  return (

    <div className="bg-white shadow-sm h-20 px-8 flex items-center justify-between">


      {/* ======================================
          PLATFORM TITLE
      ======================================= */}

      <div>

        <p className="text-slate-500">
          EndpointIQ AI Platform
        </p>

      </div>


      {/* ======================================
          RIGHT SIDE
      ======================================= */}

      <div className="flex items-center gap-6">


        {/* ====================================
            SEARCH
        ===================================== */}

        <div className="relative">

          <Search
            size={18}
            className="absolute left-3 top-3 text-gray-400"
          />

          <input
            placeholder="Search Device, User..."
            className="pl-10 pr-4 py-2 w-80 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
          />

        </div>


        {/* ====================================
            NOTIFICATIONS
        ===================================== */}

        <div
          ref={notificationRef}
          className="relative"
        >

          <button
            onClick={() => {

              setNotificationOpen(
                !notificationOpen
              );

              setProfileOpen(false);

            }}
            className="relative p-2 rounded-xl hover:bg-slate-100 transition"
            title="Notifications"
          >

            <Bell
              size={24}
              className={
                notificationOpen
                  ? "text-blue-600"
                  : "text-slate-700"
              }
            />


            {unreadCount > 0 && (

              <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">

                {unreadCount}

              </span>

            )}

          </button>


          {/* NOTIFICATION DROPDOWN */}

          {notificationOpen && (

            <div className="absolute right-0 top-14 w-[420px] bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden">


              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">

                <div>

                  <h3 className="font-semibold text-slate-900">
                    Notifications
                  </h3>

                  <p className="text-xs text-slate-500 mt-1">
                    EndpointIQ alerts and updates
                  </p>

                </div>


                <div className="flex items-center gap-2">

                  {unreadCount > 0 && (

                    <button
                      onClick={
                        markAllAsRead
                      }
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >

                      <CheckCheck
                        size={15}
                      />

                      Mark all read

                    </button>

                  )}


                  <button
                    onClick={() =>
                      setNotificationOpen(
                        false
                      )
                    }
                    className="p-1 rounded hover:bg-slate-100"
                  >

                    <X
                      size={17}
                      className="text-slate-500"
                    />

                  </button>

                </div>

              </div>


              <div className="max-h-[420px] overflow-y-auto">

                {notifications.map(
                  (notification) => (

                    <button
                      key={
                        notification.id
                      }
                      onClick={() =>
                        openNotification(
                          notification
                        )
                      }
                      className={`w-full text-left px-5 py-4 border-b border-slate-100 hover:bg-slate-50 transition ${
                        !notification.read
                          ? "bg-blue-50/40"
                          : "bg-white"
                      }`}
                    >

                      <div className="flex gap-3">

                        <div className="flex-shrink-0">

                          {getNotificationIcon(
                            notification.type
                          )}

                        </div>


                        <div className="flex-1 min-w-0">

                          <div className="flex items-start justify-between gap-3">

                            <p
                              className={`text-sm ${
                                notification.read
                                  ? "font-medium text-slate-700"
                                  : "font-semibold text-slate-900"
                              }`}
                            >

                              {
                                notification.title
                              }

                            </p>


                            {!notification.read && (

                              <span className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0" />

                            )}

                          </div>


                          <p className="text-xs text-slate-500 mt-1">

                            {
                              notification.message
                            }

                          </p>


                          <p className="text-[11px] text-slate-400 mt-2">

                            {
                              notification.time
                            }

                          </p>

                        </div>

                      </div>

                    </button>

                  )
                )}

              </div>


              <div className="px-5 py-3 bg-slate-50 border-t border-slate-200">

                <button
                  onClick={() => {

                    setNotificationOpen(
                      false
                    );

                    navigate(
                      "/devices"
                    );

                  }}
                  className="w-full text-sm font-medium text-blue-600 hover:text-blue-800"
                >

                  View device alerts

                </button>

              </div>

            </div>

          )}

        </div>


        {/* ====================================
            PROFILE
        ===================================== */}

        <div
          ref={profileRef}
          className="relative"
        >

          <button
            onClick={() => {

              setProfileOpen(
                !profileOpen
              );

              setNotificationOpen(
                false
              );

            }}
            className="p-1 rounded-full hover:bg-slate-100 transition"
            title="Profile"
          >

            <UserCircle
              size={36}
              className="text-slate-800"
            />

          </button>


          {/* ==================================
              PROFILE MENU
          =================================== */}

          {profileOpen && (

            <div className="absolute right-0 top-14 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden">


              {/* USER */}

              <div className="px-5 py-4 border-b border-slate-200">

                <p className="font-semibold text-slate-900 truncate">

                  {username}

                </p>

                <p className="text-xs text-slate-500 mt-1">

                  EndpointIQ User

                </p>

              </div>


              {/* SETTINGS */}

              <button
                onClick={() => {

                  setProfileOpen(
                    false
                  );

                  navigate(
                    "/settings"
                  );

                }}
                className="w-full flex items-center gap-3 px-5 py-3 text-sm text-slate-700 hover:bg-slate-50"
              >

                <Settings
                  size={18}
                />

                Settings

              </button>


              {/* LOGOUT */}

              <button
                onClick={
                  handleLogout
                }
                className="w-full flex items-center gap-3 px-5 py-3 text-sm text-red-600 hover:bg-red-50 border-t border-slate-100"
              >

                <LogOut
                  size={18}
                />

                Logout

              </button>

            </div>

          )}

        </div>

      </div>

    </div>

  );
}