"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import activityData from "@/data/activity-heatmap.json";

export default function ActivityHeatmapPage() {
  // Generate 52-week grid starting from today and going back
  const generateHeatmapData = () => {
    const weeks: { date: string; count: number; level: number }[][] = [];
    const today = new Date("2025-02-10"); // Using the latest date from our data
    
    // Start from Sunday of the week containing the oldest date
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 364); // Go back 52 weeks
    
    // Find the previous Sunday
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);
    
    // Create a map of dates to activity
    const activityMap = new Map(
      activityData.dailyActivity.map((d) => [d.date, d])
    );
    
    // Generate 52 weeks of data
    for (let week = 0; week < 52; week++) {
      const weekData: { date: string; count: number; level: number }[] = [];
      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + week * 7 + day);
        
        const dateStr = currentDate.toISOString().split("T")[0];
        const activity = activityMap.get(dateStr) || {
          date: dateStr,
          count: 0,
          level: 0,
        };
        
        weekData.push(activity);
      }
      weeks.push(weekData);
    }
    
    return weeks;
  };

  const heatmapWeeks = generateHeatmapData();
  const maxHourlyCount = Math.max(...activityData.hourlyActivity.map((h) => h.count));
  const maxSkillCount = Math.max(...activityData.topSkills.map((s) => s.count));

  // Get color class based on activity level
  const getLevelColor = (level: number) => {
    switch (level) {
      case 0:
        return "bg-white/5";
      case 1:
        return "bg-cyan/20";
      case 2:
        return "bg-cyan/40";
      case 3:
        return "bg-cyan/60";
      case 4:
        return "bg-cyan";
      default:
        return "bg-white/5";
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-cyan/5 rounded-full blur-[160px]" />
          <div className="absolute top-1/3 left-1/3 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-purple/3 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            📅 Agent Activity Heatmap
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Visual insights into when agents are most active and productive
          </p>
        </div>
      </section>

      {/* Summary Stats Cards */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card/50 border-white/5">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-cyan">
                {activityData.summary.totalOperations.toLocaleString()}
              </CardTitle>
              <CardDescription>Total Operations</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Past 365 days</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-white/5">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-purple">
                {activityData.summary.avgPerDay}
              </CardTitle>
              <CardDescription>Average Per Day</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Daily operations</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-white/5">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-green">
                {activityData.streaks.current} days
              </CardTitle>
              <CardDescription>Current Streak</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Longest: {activityData.streaks.longest} days
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-white/5">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-yellow">
                {activityData.streaks.totalActiveDays}
              </CardTitle>
              <CardDescription>Active Days</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Out of 365 days</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Contribution Heatmap */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">📊 52-Week Activity Grid</h2>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-white/5" title="No activity" />
              <div className="w-3 h-3 rounded-sm bg-cyan/20" title="Low activity" />
              <div className="w-3 h-3 rounded-sm bg-cyan/40" title="Medium activity" />
              <div className="w-3 h-3 rounded-sm bg-cyan/60" title="High activity" />
              <div className="w-3 h-3 rounded-sm bg-cyan" title="Very high activity" />
            </div>
            <span>More</span>
          </div>
        </div>

        <Card className="bg-card/50 border-white/5">
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <div className="inline-flex gap-1">
                {/* Day labels */}
                <div className="flex flex-col justify-around text-xs text-muted-foreground pr-2">
                  <span className="h-3">Sun</span>
                  <span className="h-3"></span>
                  <span className="h-3">Tue</span>
                  <span className="h-3"></span>
                  <span className="h-3">Thu</span>
                  <span className="h-3"></span>
                  <span className="h-3">Sat</span>
                </div>

                {/* Heatmap grid */}
                <div className="flex gap-1">
                  {heatmapWeeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1">
                      {week.map((day, dayIndex) => (
                        <div
                          key={dayIndex}
                          className={`w-3 h-3 rounded-sm ${getLevelColor(
                            day.level
                          )} hover:ring-2 hover:ring-cyan/50 transition-all cursor-pointer`}
                          title={`${day.date}: ${day.count} operations`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 text-sm text-muted-foreground">
              <p>
                Peak day:{" "}
                <span className="text-cyan font-semibold">
                  {activityData.summary.peakDay}
                </span>{" "}
                with{" "}
                <span className="text-cyan font-semibold">
                  {activityData.summary.peakDayCount}
                </span>{" "}
                operations
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator className="opacity-10" />

      {/* Hourly Activity Chart */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">⏰ Hourly Activity Pattern</h2>
        <Card className="bg-card/50 border-white/5">
          <CardContent className="p-6">
            <div className="space-y-2">
              {activityData.hourlyActivity.map((hourData) => {
                const percentage = (hourData.count / maxHourlyCount) * 100;
                const isPeak = hourData.count > maxHourlyCount * 0.8;
                
                return (
                  <div key={hourData.hour} className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground w-12 text-right font-mono">
                      {hourData.hour.toString().padStart(2, "0")}:00
                    </span>
                    <div className="flex-1 relative">
                      <div className="h-6 bg-white/5 rounded-lg overflow-hidden">
                        <div
                          className={`h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-3 ${
                            isPeak
                              ? "bg-gradient-to-r from-cyan to-purple"
                              : "bg-gradient-to-r from-cyan/60 to-cyan/80"
                          }`}
                          style={{ width: `${percentage}%` }}
                        >
                          {percentage > 20 && (
                            <span className="text-xs font-semibold text-white">
                              {hourData.count}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 p-4 bg-white/5 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <span className="text-cyan font-semibold">Peak hours:</span>{" "}
                10:00-15:00 (agents most active during working hours)
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator className="opacity-10" />

      {/* Day of Week & Top Skills */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Day of Week Breakdown */}
          <div>
            <h2 className="text-2xl font-bold mb-6">📆 Day of Week Activity</h2>
            <Card className="bg-card/50 border-white/5">
              <CardContent className="p-6">
                {/* Horizontal bar visualization */}
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground text-center mb-3">
                    Weekly distribution
                  </p>
                  <div className="flex h-8 rounded-lg overflow-hidden">
                    {activityData.dayOfWeekActivity.map((day, dayIndex) => {
                      const colors = [
                        "from-cyan to-cyan/80",
                        "from-purple to-purple/80",
                        "from-green to-green/80",
                        "from-yellow to-yellow/80",
                        "from-pink to-pink/80",
                        "from-orange to-orange/80",
                        "from-blue to-blue/80",
                      ];
                      
                      return (
                        <div
                          key={day.day}
                          className={`bg-gradient-to-r ${colors[dayIndex]} flex items-center justify-center text-xs font-semibold text-white transition-all hover:opacity-80`}
                          style={{ width: `${day.percentage}%` }}
                          title={`${day.day}: ${day.percentage}%`}
                        >
                          {day.percentage > 8 && `${day.percentage}%`}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Day list */}
                <div className="space-y-3">
                  {activityData.dayOfWeekActivity.map((day, index) => {
                    const isWeekend = day.day === "Saturday" || day.day === "Sunday";
                    
                    return (
                      <div
                        key={day.day}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {isWeekend ? "🏖️" : "💼"}
                          </span>
                          <div>
                            <p className="font-semibold text-foreground">
                              {day.day}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {day.count.toLocaleString()} operations
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={`${
                            day.percentage > 15
                              ? "bg-cyan/20 text-cyan border-cyan/30"
                              : "bg-white/5 text-white/80 border-white/10"
                          }`}
                        >
                          {day.percentage}%
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Active Skills */}
          <div>
            <h2 className="text-2xl font-bold mb-6">🛠️ Most Used Skills</h2>
            <Card className="bg-card/50 border-white/5">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {activityData.topSkills.map((skill, index) => {
                    const percentage = (skill.count / maxSkillCount) * 100;
                    
                    return (
                      <div key={skill.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge
                              variant="outline"
                              className={`${
                                index === 0
                                  ? "bg-yellow/20 text-yellow border-yellow/30"
                                  : index === 1
                                  ? "bg-white/20 text-white border-white/30"
                                  : index === 2
                                  ? "bg-orange/20 text-orange border-orange/30"
                                  : "bg-white/5 text-white/80 border-white/10"
                              } w-7 h-7 flex items-center justify-center p-0 text-xs`}
                            >
                              {index + 1}
                            </Badge>
                            <div>
                              <p className="font-semibold text-foreground font-mono text-sm">
                                {skill.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {skill.percentage}% of total
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-foreground">
                              {skill.count.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">uses</p>
                          </div>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan to-purple rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Activity Streaks */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">🔥 Activity Streaks</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-card/50 border-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🔥</span>
                <span className="text-3xl font-bold text-cyan">
                  {activityData.streaks.current}
                </span>
              </CardTitle>
              <CardDescription>Current Streak</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Consecutive days with activity
              </p>
              <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan to-purple rounded-full"
                  style={{
                    width: `${
                      (activityData.streaks.current /
                        activityData.streaks.longest) *
                      100
                    }%`,
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                <span className="text-3xl font-bold text-yellow">
                  {activityData.streaks.longest}
                </span>
              </CardTitle>
              <CardDescription>Longest Streak</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Personal best record
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Badge variant="outline" className="bg-yellow/20 text-yellow border-yellow/30">
                  All-time high
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📅</span>
                <span className="text-3xl font-bold text-green">
                  {activityData.streaks.totalActiveDays}
                </span>
              </CardTitle>
              <CardDescription>Total Active Days</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {((activityData.streaks.totalActiveDays / 365) * 100).toFixed(1)}% of the year
              </p>
              <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green to-cyan rounded-full"
                  style={{
                    width: `${(activityData.streaks.totalActiveDays / 365) * 100}%`,
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Footer Note */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <Card className="bg-card/50 border-white/5">
          <CardContent className="p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Activity data reflects all agent operations including skill
              executions, file operations, and API calls over the past 365 days.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Last updated: {new Date().toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
