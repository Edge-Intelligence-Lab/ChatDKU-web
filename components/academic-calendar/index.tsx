// components/academic-calendar/index.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { CalendarEvent, EventType } from "./types";
import { EVENTS } from "./calendar-data";
import {
  MONTHS,
  WEEKDAYS,
  getEventStyles,
  formatDateKey,
  isDateInRange,
  downloadCalendarFile,
} from "./calendar-utils";

const CATEGORIES: { label: string; type: EventType }[] = [
  { label: "Holiday", type: "holiday" },
  { label: "Academic", type: "academic" },
  { label: "Move-in / Out", type: "move" },
  { label: "Registration", type: "registration" },
  { label: "Exam", type: "exam" },
];

export default function AcademicCalendar() {
  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const todayKey = formatDateKey(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const [selectedDate, setSelectedDate] = useState(todayKey);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(year);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close picker on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    if (pickerOpen) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [pickerOpen]);

  // Sync picker year when navigating
  useEffect(() => {
    setPickerYear(year);
  }, [year]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const leadingEmpty = firstDay === 0 ? 6 : firstDay - 1;
  const totalCells = 42;

  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < leadingEmpty; i++) {
    calendarCells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push(day);
  }
  while (calendarCells.length < totalCells) {
    calendarCells.push(null);
  }

  const getEventsForDate = (dateKey: string) => {
    return EVENTS.filter((event) =>
      isDateInRange(dateKey, event.startDate, event.endDate)
    );
  };

  const selectedEvents = getEventsForDate(selectedDate);

  return (
    <div className="w-full lg:h-[calc(100vh-110px)] max-w-6xl mx-auto px-1 lg:px-4 py-2 lg:py-3">
      <div className="lg:h-full overflow-hidden lg:rounded-[30px] lg:border lg:border-border lg:bg-card lg:shadow-2xl">
        {/* HEADER */}
        <div className="flex items-center justify-between px-3 lg:px-6 py-1.5 lg:py-4 border-b border-border">
          <h2 className="hidden lg:block text-2xl font-bold tracking-tight">
            Academic Calendar
          </h2>
          <div className="flex items-center justify-center gap-1 lg:gap-2 w-full lg:w-auto">
            <button
              onClick={() => {
                if (month === 0) { setMonth(11); setYear((y) => y - 1); }
                else { setMonth((m) => m - 1); }
              }}
              className="w-7 h-7 lg:w-10 lg:h-10 rounded-xl lg:rounded-2xl bg-muted hover:scale-105 transition-all flex items-center justify-center text-sm lg:text-base"
            >
              ←
            </button>

            {/* Month/Year picker trigger + dropdown */}
            <div className="relative" ref={pickerRef}>
              <button
                onClick={() => {
                  setPickerYear(year);
                  setPickerOpen(!pickerOpen);
                }}
                className="min-w-[120px] lg:min-w-[150px] px-2 lg:px-3 py-1.5 lg:py-2 rounded-xl font-semibold text-base lg:text-lg hover:bg-muted transition-colors"
              >
                {MONTHS[month]} {year}
              </button>

              {pickerOpen && (
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 bg-popover rounded-2xl shadow-2xl border border-border p-4 w-64">
                  {/* Year nav */}
                  <div className="flex items-center justify-between mb-3">
                    <button
                      onClick={() => setPickerYear((y) => y - 1)}
                      className="w-8 h-8 rounded-xl bg-muted hover:scale-105 transition-all flex items-center justify-center text-sm"
                    >
                      ←
                    </button>
                    <span className="font-semibold text-base">{pickerYear}</span>
                    <button
                      onClick={() => setPickerYear((y) => y + 1)}
                      className="w-8 h-8 rounded-xl bg-muted hover:scale-105 transition-all flex items-center justify-center text-sm"
                    >
                      →
                    </button>
                  </div>

                  {/* Month grid */}
                  <div className="grid grid-cols-4 gap-2">
                    {MONTHS.map((m, i) => {
                      const isCurrent =
                        i === today.getMonth() && pickerYear === today.getFullYear();
                      const isActive = i === month && pickerYear === year;
                      return (
                        <button
                          key={m}
                          onClick={() => {
                            setMonth(i);
                            setYear(pickerYear);
                            setPickerOpen(false);
                          }}
                          className={`
                            py-2 rounded-xl text-sm font-medium transition-all
                            ${isActive
                              ? "bg-primary text-primary-foreground shadow-md"
                              : isCurrent
                              ? "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300"
                              : "hover:bg-muted text-muted-foreground"
                            }
                          `}
                        >
                          {m.slice(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                if (month === 11) { setMonth(0); setYear((y) => y + 1); }
                else { setMonth((m) => m + 1); }
              }}
              className="w-7 h-7 lg:w-10 lg:h-10 rounded-xl lg:rounded-2xl bg-muted hover:scale-105 transition-all flex items-center justify-center text-sm lg:text-base"
            >
              →
            </button>
          </div>
        </div>

        {/* MAIN */}
        <div className="flex flex-col lg:grid lg:grid-cols-[1.5fr_0.5fr] lg:h-[calc(100%-73px)]">
          {/* LEFT — Calendar grid */}
          <div className="p-1.5 lg:p-4 flex flex-col lg:h-full lg:overflow-hidden">
            {/* WEEK HEADER */}
            <div className="grid grid-cols-7 gap-[2px] lg:gap-2 mb-1 lg:mb-2 flex-shrink-0">
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-semibold text-muted-foreground truncate"
                >{day}
                </div>
              ))}
            </div>

            {/* CALENDAR */}
            <div className="grid grid-cols-7 grid-rows-6 gap-[2px] lg:gap-2 flex-1 min-h-0">
              {calendarCells.map((day, index) => {
                if (!day) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="rounded-2xl bg-transparent"
                    />
                  );
                }

                const dateKey = formatDateKey(year, month, day);
                const events = getEventsForDate(dateKey);
                const isToday = dateKey === todayKey;
                const isSelected = selectedDate === dateKey;

                return (
                  <button
                    key={dateKey}
                    onClick={() => setSelectedDate(dateKey)}
                    className={`
                      relative rounded-lg lg:rounded-2xl overflow-hidden border p-1.5 lg:p-2
                      text-left transition-all duration-200
                      hover:scale-[1.02] min-h-0 h-full
                      ${
                        isSelected
                          ? "border-primary bg-primary/10 shadow-md"
                          : isToday
                          ? "border-amber-300 dark:border-amber-500/40 bg-amber-50/90 dark:bg-amber-500/15 shadow-sm"
                          : "border-border bg-muted/50 hover:border-muted-foreground/40"
                      }
                    `}
                  >
                    {/* EVENT BG */}
                    {events.length > 0 && (
                      <div
                        className={`absolute inset-0 ${getEventStyles(events[0].type).bg}`}
                      />
                    )}
                    {/* CONTENT */}
                    <div className="relative z-10 h-full flex flex-col overflow-hidden">
                      <div
                        className={`text-sm font-bold flex-shrink-0 leading-tight ${
                          events.length > 0
                            ? getEventStyles(events[0].type).text
                            : "text-foreground"
                        }`}
                      >
                        {day}
                      </div>
                      <div className="flex gap-0.5 mt-0.5 flex-wrap lg:hidden min-h-[10px]">
                        {events.slice(0, 3).map((event) => {
                          const s = getEventStyles(event.type);
                          const dotBg = s.bg.replace(/\/15$/, "");
                          return (
                            <span
                              key={event.id}
                              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotBg}`}
                            />
                          );
                        })}
                      </div>
                      {/* Desktop: event titles */}
                      <div className="mt-1 overflow-hidden flex-1 hidden lg:block">
                        {events.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            className={`text-[10px] leading-tight font-medium mb-1 break-words line-clamp-2 ${getEventStyles(event.type).text}`}
                          >
                            {event.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="border-t lg:border-t-0 lg:border-l border-border bg-muted/30 p-3 lg:p-5 lg:overflow-y-auto">
            {/* Events */}
            <div className="space-y-2 lg:space-y-3">
              {selectedEvents.length === 0 ? (
                <div className="rounded-xl lg:rounded-2xl border border-dashed border-border p-4 lg:p-8 text-center text-sm text-muted-foreground">
                  No events
                </div>
              ) : (
                selectedEvents.map((event) => {
                  const style = getEventStyles(event.type);
                  return (
                    <div
                      key={event.id}
                      className={`rounded-xl lg:rounded-2xl border p-3 lg:p-4 ${style.bg} ${style.border}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className={`font-semibold text-sm ${style.text}`}>
                          {event.title}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadCalendarFile(event);
                          }}
                          className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-xs text-muted-foreground hover:text-foreground border border-border"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                            <line x1="12" y1="14" x2="12" y2="18" />
                            <line x1="9" y1="16" x2="15" y2="16" />
                          </svg>
                          <span>Download</span>
                        </button>
                      </div>
                      {event.description && (
                        <div className="mt-1.5 lg:mt-2 text-xs lg:text-sm text-muted-foreground leading-relaxed">
                          {event.description}
                        </div>
                      )}
                      <div className="mt-1.5 lg:mt-2 text-xs text-muted-foreground">
                        {event.startDate}
                        {event.endDate && ` → ${event.endDate}`}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* LEGEND */}
            <div className="mt-5 lg:mt-7">
              <div className="text-sm font-semibold text-muted-foreground mb-2 lg:mb-3">
                Categories
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 lg:gap-y-2 text-xs lg:text-sm">
                {CATEGORIES.map((item) => {
                  const style = getEventStyles(item.type);
                  return (
                    <div
                      key={item.label}
                      className="flex items-center gap-1.5 lg:gap-2"
                    >
                      <div
                        className={`w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full ${style.bg} border ${style.border}`}
                      />
                      {item.label}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
