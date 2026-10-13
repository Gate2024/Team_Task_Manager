import React, { useState, useEffect } from 'react';

/**
 * InteractiveAuthPlayground
 *
 * Surrounds the central authentication form with a living, miniature
 * representation of the Team Task Manager product universe (Tasks,
 * Projects, Team, Progress, Notifications, and Workflow).
 *
 * Strictly frontend-only with decorative local state, micro-animations,
 * full keyboard and touch accessibility, and responsive art direction.
 */
export function InteractiveAuthPlayground({ children, mode = 'login' }) {
  // Local Interactive States (Decorative only - zero backend integration)
  const isLogin = mode === 'login';

  const [taskStatus, setTaskStatus] = useState(isLogin ? 'in_progress' : 'pending');
  const [progressPercent, setProgressPercent] = useState(isLogin ? 78 : 45);
  const [workflowStage, setWorkflowStage] = useState(isLogin ? 'review' : 'task');
  const [activeMember, setActiveMember] = useState(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Alex assigned you 'Design System Review'", time: '2m ago', read: false },
    { id: 2, text: 'Sprint milestone reached (85% on track)', time: '45m ago', read: false },
    { id: 3, text: 'Sarah commented on Project Alpha', time: '2h ago', read: false },
  ]);
  const [storyToast, setStoryToast] = useState(null);
  const [toastTimer, setToastTimer] = useState(null);
  const [activeConnectionPulse, setActiveConnectionPulse] = useState(false);

  // Micro-toast helper for interactive feedback
  const triggerToast = (message) => {
    if (toastTimer) clearTimeout(toastTimer);
    setStoryToast(message);
    setActiveConnectionPulse(true);
    const timer = setTimeout(() => {
      setStoryToast(null);
      setActiveConnectionPulse(false);
    }, 3200);
    setToastTimer(timer);
  };

  useEffect(() => {
    return () => {
      if (toastTimer) clearTimeout(toastTimer);
    };
  }, [toastTimer]);

  // 1. Task Card Click Handler
  const handleTaskClick = () => {
    let nextStatus = 'pending';
    let nextProgress = isLogin ? 72 : 40;
    let toastMsg = 'Task reset to Pending';

    if (taskStatus === 'pending') {
      nextStatus = 'in_progress';
      nextProgress = isLogin ? 84 : 65;
      setWorkflowStage('review');
      toastMsg = '⚡ Task marked In Progress • Team notified';
    } else if (taskStatus === 'in_progress') {
      nextStatus = 'completed';
      nextProgress = isLogin ? 95 : 88;
      setWorkflowStage('done');
      toastMsg = '✓ Task completed! Project progress updated';
    }

    setTaskStatus(nextStatus);
    setProgressPercent(nextProgress);
    triggerToast(toastMsg);
  };

  // 2. Progress Ring Click Handler
  const handleProgressClick = () => {
    setProgressPercent((prev) => {
      const next = prev >= 92 ? (isLogin ? 72 : 45) : prev + 8;
      triggerToast(`📈 Sprint velocity updated: ${next}% complete`);
      return next;
    });
  };

  // 3. Workflow Step Click Handler
  const handleWorkflowClick = (stage) => {
    setWorkflowStage(stage);
    if (stage === 'done') {
      setTaskStatus('completed');
      setProgressPercent(95);
      triggerToast('✓ Final stage reached: Deliverables ready for release');
    } else if (stage === 'review') {
      setTaskStatus('in_progress');
      setProgressPercent(isLogin ? 84 : 65);
      triggerToast('🔍 Review phase active: Team validating work');
    } else if (stage === 'task') {
      setTaskStatus('pending');
      triggerToast('📋 Active phase: Task scoping and assignment');
    } else {
      triggerToast('💡 Initiative ideation phase');
    }
  };

  // 4. Notification handlers
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkNotificationRead = (id, e) => {
    e.stopPropagation();
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    triggerToast('Notification marked as read');
  };

  const handleMarkAllRead = (e) => {
    e.stopPropagation();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    triggerToast('All notifications cleared');
  };

  // Team members list
  const teamMembers = [
    { id: 'sm', initials: 'SM', name: 'Sarah M.', role: 'Engineering Lead', focus: 'Reviewing API contracts' },
    { id: 'ak', initials: 'AK', name: 'Alex K.', role: 'Frontend Engineer', focus: 'Polishing interactive UI' },
    { id: 'dl', initials: 'DL', name: 'David L.', role: 'Product Architect', focus: 'Evaluating sprint velocity' },
  ];

  return (
    <div className="relative w-full overflow-hidden py-10 lg:py-16 px-4 sm:px-6 lg:px-8">
      {/* ======================================================== */}
      {/* LEVEL 1: SUBTLE AMBIENT BACKGROUND SYSTEM                */}
      {/* ======================================================== */}
      {/* Background Dot Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.25] dark:opacity-[0.18]"
        style={{
          backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Gentle Radial Ambient Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-gradient-to-tr from-indigo-500/10 via-violet-500/10 to-transparent blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-1/4 right-1/4 w-[350px] h-[260px] bg-sky-500/10 blur-[100px] pointer-events-none rounded-full" />

      {/* ======================================================== */}
      {/* SUBTLE SVG CONNECTOR ORBIT LINES (Large screens only)    */}
      {/* ======================================================== */}
      <svg
        className={`absolute inset-0 w-full h-full pointer-events-none hidden lg:block transition-opacity duration-500 ${
          activeConnectionPulse ? 'opacity-70 dark:opacity-45' : 'opacity-35 dark:opacity-20'
        }`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="orbitLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        {/* Curved connection from Top-Left (Project) towards Center Form */}
        <path
          d="M 230 140 Q 360 210, 480 270"
          fill="none"
          stroke="url(#orbitLineGrad)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        {/* Curved connection from Mid-Left (Task) to Center Form */}
        <path
          d="M 210 390 Q 330 380, 450 370"
          fill="none"
          stroke="url(#orbitLineGrad)"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />
        {/* Curved connection from Mid-Right (Progress) to Center Form */}
        <path
          d="M 990 390 Q 880 380, 770 370"
          fill="none"
          stroke="url(#orbitLineGrad)"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />
        {/* Curved connection from Top-Right (Team) towards Center Form */}
        <path
          d="M 980 140 Q 860 210, 740 270"
          fill="none"
          stroke="url(#orbitLineGrad)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        {/* Curved connection between Task and Progress across bottom */}
        <path
          d="M 260 560 Q 610 680, 960 560"
          fill="none"
          stroke="url(#orbitLineGrad)"
          strokeWidth="1"
          strokeDasharray="5 5"
        />
      </svg>

      {/* Main Container */}
      <div className="relative max-w-7xl mx-auto min-h-[680px] lg:min-h-[760px] flex flex-col items-center justify-center">
        {/* Interactive Story Toast / Feedback Pill */}
        <div
          role="status"
          aria-live="polite"
          className={`transition-all duration-300 z-30 mb-4 sm:mb-6 ${
            storyToast
              ? 'opacity-100 transform translate-y-0 scale-100'
              : 'opacity-0 transform -translate-y-2 scale-95 pointer-events-none h-0 mb-0 overflow-hidden'
          }`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 dark:bg-white/95 text-white dark:text-slate-900 text-xs font-semibold shadow-xl backdrop-blur-md border border-slate-700/50 dark:border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 dark:bg-emerald-600 animate-ping" />
            <span>{storyToast}</span>
          </div>
        </div>

        {/* Small Instruction Microcopy above workspace */}
        <div className="text-center mb-6 hidden sm:block">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50/80 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 shadow-sm">
            <svg className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
            <span>Interactive Workspace Preview • Click or hover cards to explore platform workflows</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* STAGE & CENTRAL COMPOSITION                              */}
        {/* ======================================================== */}
        <div className="relative w-full max-w-6xl mx-auto flex items-center justify-center">

          {/* ====================================================== */}
          {/* ORBIT ELEMENT 1: PROJECT WIDGET (Top-Left on Desktop)  */}
          {/* ====================================================== */}
          <div className="hidden lg:block absolute -top-2 left-0 xl:left-4 z-10 w-64 group">
            <div className="bg-white/90 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-4 shadow-lg backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:border-indigo-500/50 hover:-translate-y-1">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60">
                  {isLogin ? 'Active Workspace' : 'Workspace Target'}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  On Track
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {isLogin ? 'Core Infrastructure Alpha' : 'Q4 Engineering Milestone'}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Sprint 14 • 8 deliverables in motion
              </p>
              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                <span>Velocity: High</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">RBAC Enforced</span>
              </div>
            </div>
          </div>

          {/* ====================================================== */}
          {/* ORBIT ELEMENT 2: TEAM COLLABORATION (Top-Right)        */}
          {/* ====================================================== */}
          <div className="hidden lg:block absolute -top-2 right-0 xl:right-4 z-10 w-64 group">
            <div className="bg-white/90 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-4 shadow-lg backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:border-indigo-500/50 hover:-translate-y-1">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-900/60">
                  Team Collaboration
                </span>
                <span className="text-[10px] font-semibold text-slate-400">3 online</span>
              </div>

              {/* Avatar Stack with Clickable Focus */}
              <div className="flex items-center gap-1.5">
                {teamMembers.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => {
                      setActiveMember(activeMember?.id === member.id ? null : member);
                      triggerToast(`${member.name}: ${member.focus}`);
                    }}
                    title={`${member.name} (${member.role})`}
                    aria-label={`Inspect ${member.name}`}
                    className={`w-8 h-8 rounded-full text-[10px] font-bold flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      activeMember?.id === member.id
                        ? 'bg-indigo-600 text-white ring-2 ring-indigo-500 scale-110 shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600'
                    }`}
                  >
                    {member.initials}
                  </button>
                ))}
              </div>

              {/* Focus Tooltip */}
              <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[10px]">
                {activeMember ? (
                  <div className="text-indigo-600 dark:text-indigo-400 font-medium truncate">
                    <span className="font-bold">{activeMember.name}:</span> {activeMember.focus}
                  </div>
                ) : (
                  <span className="text-slate-500 dark:text-slate-400 italic">
                    Tap member avatar to view active focus
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ====================================================== */}
          {/* ORBIT ELEMENT 3: INTERACTIVE TASK CARD (Mid-Left)      */}
          {/* ====================================================== */}
          <div className="hidden lg:block absolute top-[36%] -left-4 xl:left-2 z-10 w-72 group">
            <div className="bg-white/95 dark:bg-slate-900/85 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-4 shadow-xl backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:border-indigo-500/50 hover:-translate-y-1">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  Priority • Urgent
                </span>
                <span className="text-[10px] text-slate-400">Due Today</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                {isLogin ? 'Audit Session Token Middleware' : 'Establish Workspace Sprint Board'}
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                Assigned to: <span className="font-semibold text-slate-700 dark:text-slate-300">Sarah M.</span>
              </p>

              {/* Interactive Status Transition Pill */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-medium">Click to cycle state:</span>
                <button
                  type="button"
                  onClick={handleTaskClick}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all shadow-sm flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    taskStatus === 'completed'
                      ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                      : taskStatus === 'in_progress'
                      ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                      : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 hover:bg-amber-200'
                  }`}
                >
                  {taskStatus === 'completed' && <span>✓ Completed</span>}
                  {taskStatus === 'in_progress' && <span>◐ In Progress</span>}
                  {taskStatus === 'pending' && <span>○ Pending</span>}
                </button>
              </div>
            </div>
          </div>

          {/* ====================================================== */}
          {/* ORBIT ELEMENT 4: PROGRESS RING / WIDGET (Mid-Right)    */}
          {/* ====================================================== */}
          <div className="hidden lg:block absolute top-[36%] -right-4 xl:right-2 z-10 w-64 group">
            <button
              type="button"
              onClick={handleProgressClick}
              className="w-full text-left bg-white/95 dark:bg-slate-900/85 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-4 shadow-xl backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:border-indigo-500/50 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/60">
                  Sprint Velocity
                </span>
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                  Tap to boost
                </span>
              </div>

              <div className="flex items-center justify-between my-1">
                <div>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {progressPercent}%
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    Target Completion: Oct 20
                  </div>
                </div>
                {/* SVG Progress Circle */}
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-200 dark:text-slate-800"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-indigo-600 dark:text-indigo-400 transition-all duration-500"
                      strokeDasharray={`${progressPercent}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-[10px] font-bold text-slate-700 dark:text-slate-300">
                    {progressPercent}%
                  </span>
                </div>
              </div>

              {/* Progress Bar Line */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden mt-2">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </button>
          </div>

          {/* ====================================================== */}
          {/* ORBIT ELEMENT 5: NOTIFICATIONS WIDGET (Bottom-Left)    */}
          {/* ====================================================== */}
          <div className="hidden lg:block absolute -bottom-4 left-2 xl:left-8 z-30 w-72">
            <div className="bg-white/95 dark:bg-slate-900/85 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-3.5 shadow-xl backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:border-indigo-500/50">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="flex items-center gap-2 text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-0.5"
                >
                  <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Workspace Alerts
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {unreadCount} unread update{unreadCount === 1 ? '' : 's'}
                    </span>
                  </div>
                </button>

                <div className="flex items-center gap-1.5">
                  {unreadCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  )}
                  <button
                    type="button"
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline px-1.5 py-0.5"
                  >
                    {notificationsOpen ? 'Close' : 'View'}
                  </button>
                </div>
              </div>

              {/* Collapsible Popover Panel */}
              {notificationsOpen && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Recent events</span>
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                    {notifications.map((item) => (
                      <div
                        key={item.id}
                        onClick={(e) => handleMarkNotificationRead(item.id, e)}
                        className={`p-2 rounded-xl text-[10px] cursor-pointer transition-colors flex items-start justify-between gap-1.5 ${
                          item.read
                            ? 'bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400'
                            : 'bg-indigo-50/60 dark:bg-indigo-950/40 text-slate-900 dark:text-slate-200 font-medium'
                        }`}
                      >
                        <div className="leading-tight">
                          <p>{item.text}</p>
                          <span className="text-[9px] text-slate-400 mt-0.5 block">
                            {item.time}
                          </span>
                        </div>
                        {!item.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 flex-shrink-0 mt-1" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ====================================================== */}
          {/* ORBIT ELEMENT 6: WORKFLOW STEPPER (Bottom-Right)       */}
          {/* ====================================================== */}
          <div className="hidden lg:block absolute -bottom-4 right-2 xl:right-8 z-10 w-72">
            <div className="bg-white/95 dark:bg-slate-900/85 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-3.5 shadow-xl backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:border-indigo-500/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Lifecycle Workflow
                </span>
                <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                  Stage: {workflowStage.toUpperCase()}
                </span>
              </div>

              {/* 4-Step Interactive Pipeline */}
              <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
                {[
                  { id: 'idea', label: 'Idea' },
                  { id: 'task', label: 'Task' },
                  { id: 'review', label: 'Review' },
                  { id: 'done', label: 'Done' },
                ].map((step) => (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => handleWorkflowClick(step.id)}
                    className={`py-1.5 text-[10px] font-bold rounded-lg transition-all focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                      workflowStage === step.id
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {step.label}
                  </button>
                ))}
              </div>
              <p className="text-[9px] text-slate-400 text-center mt-1.5">
                Click any stage to simulate workflow transitions
              </p>
            </div>
          </div>

          {/* ====================================================== */}
          {/* LEVEL 3: THE CENTRAL HERO AUTHENTICATION FORM          */}
          {/* ====================================================== */}
          <div className="relative z-20 w-full max-w-md mx-auto">
            {children}
          </div>

        </div>

        {/* ======================================================== */}
        {/* MOBILE & TABLET RESPONSIVE INTERACTIVE DOCK (< 1024px)   */}
        {/* ======================================================== */}
        <div className="w-full max-w-md mx-auto mt-8 lg:hidden space-y-4">
          <div className="bg-white/90 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-4 shadow-lg backdrop-blur-xl">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                Mini Workspace Playground
              </span>
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                Interactive Preview
              </span>
            </div>

            {/* Mobile Task Simulator */}
            <div className="flex items-center justify-between gap-3 mb-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60">
              <div className="min-w-0">
                <span className="text-[9px] font-bold uppercase tracking-wider text-rose-500 block">
                  Priority • Urgent
                </span>
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {isLogin ? 'Audit Session Token Middleware' : 'Establish Sprint Board'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleTaskClick}
                className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  taskStatus === 'completed'
                    ? 'bg-emerald-600 text-white'
                    : taskStatus === 'in_progress'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                }`}
              >
                {taskStatus === 'completed' && '✓ Completed'}
                {taskStatus === 'in_progress' && '◐ In Progress'}
                {taskStatus === 'pending' && '○ Pending'}
              </button>
            </div>

            {/* Mobile Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Sprint Velocity</span>
                <button
                  type="button"
                  onClick={handleProgressClick}
                  className="font-bold text-indigo-600 dark:text-indigo-400 text-xs hover:underline"
                >
                  {progressPercent}% (Tap to advance)
                </button>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Mobile Workflow Stepper */}
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Workflow:</span>
              <div className="flex items-center gap-1">
                {['idea', 'task', 'review', 'done'].map((step) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => handleWorkflowClick(step)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize transition-all ${
                      workflowStage === step
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {step}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default InteractiveAuthPlayground;
