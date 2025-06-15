import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Activity,
  Calendar,
  TrendingUp,
  Database,
  Zap,
  Target,
  Heart,
  BarChart3,
  Clock,
  UserCheck,
  DollarSign,
  RefreshCw,
  Shield,
  Globe,
  Smartphone,
  Eye,
  EyeOff,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { prefetchRoute } from "@/lib/prefetch";
import { useSupabaseBodyMetrics } from "@/hooks/use-supabase-body-metrics";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

const Epic = () => {
  const navigate = useNavigate();
  const [showSensitive, setShowSensitive] = React.useState(false);

  // Fetch admin metrics from the database
  const { data: adminMetrics, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-metrics"],
    queryFn: async () => {
      try {
        // Get total users
        const { count: totalUsers } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        // Get total measurements
        const { count: totalMeasurements } = await supabase
          .from("body_metrics")
          .select("*", { count: "exact", head: true });

        // Get active subscriptions
        const { count: activeSubscriptions } = await supabase
          .from("subscriptions")
          .select("*", { count: "exact", head: true })
          .eq("status", "active");

        // Get trial users
        const { count: trialUsers } = await supabase
          .from("subscriptions")
          .select("*", { count: "exact", head: true })
          .eq("status", "trial");

        // Get users who joined in the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const { count: newUsersWeek } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .gte("created_at", sevenDaysAgo.toISOString());

        // Get measurements in the last 7 days
        const { count: measurementsWeek } = await supabase
          .from("body_metrics")
          .select("*", { count: "exact", head: true })
          .gte("created_at", sevenDaysAgo.toISOString());

        // Get average measurements per user
        const avgMeasurements = totalUsers && totalUsers > 0 
          ? Math.round((totalMeasurements || 0) / totalUsers * 10) / 10 
          : 0;

        // Get users by gender
        const { data: genderStats } = await supabase
          .from("profiles")
          .select("gender")
          .not("gender", "is", null);

        const genderBreakdown = genderStats?.reduce((acc, user) => {
          acc[user.gender] = (acc[user.gender] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {};

        // Get recent activity (last 24 hours)
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        const { count: dailyActive } = await supabase
          .from("body_metrics")
          .select("user_id", { count: "exact", head: true })
          .gte("created_at", oneDayAgo.toISOString());

        // Get platform breakdown from user_settings if available
        const { data: platformStats } = await supabase
          .from("user_settings")
          .select("units");

        const platformBreakdown = platformStats?.reduce((acc, setting) => {
          const platform = setting.units === "imperial" ? "US/UK" : "International";
          acc[platform] = (acc[platform] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {};

        return {
          totalUsers: totalUsers || 0,
          totalMeasurements: totalMeasurements || 0,
          activeSubscriptions: activeSubscriptions || 0,
          trialUsers: trialUsers || 0,
          newUsersWeek: newUsersWeek || 0,
          measurementsWeek: measurementsWeek || 0,
          avgMeasurements,
          genderBreakdown,
          dailyActive: dailyActive || 0,
          platformBreakdown,
          lastUpdated: new Date(),
        };
      } catch (error) {
        console.error("Error fetching admin metrics:", error);
        throw error;
      }
    },
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  const metrics = [
    {
      title: "Total Users",
      value: adminMetrics?.totalUsers || 0,
      description: "Registered users",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: `+${adminMetrics?.newUsersWeek || 0} this week`,
      changeColor: "text-green-600",
    },
    {
      title: "Total Measurements",
      value: adminMetrics?.totalMeasurements || 0,
      description: "Body metrics logged",
      icon: Activity,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      change: `+${adminMetrics?.measurementsWeek || 0} this week`,
      changeColor: "text-green-600",
    },
    {
      title: "Active Subscriptions",
      value: adminMetrics?.activeSubscriptions || 0,
      description: "Paying customers",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      change: "Revenue generating",
      changeColor: "text-green-600",
      sensitive: true,
    },
    {
      title: "Trial Users",
      value: adminMetrics?.trialUsers || 0,
      description: "Users in trial period",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      change: "Conversion opportunity",
      changeColor: "text-orange-600",
    },
    {
      title: "Daily Active",
      value: adminMetrics?.dailyActive || 0,
      description: "Users active in 24h",
      icon: Zap,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      change: "Logged measurements",
      changeColor: "text-blue-600",
    },
    {
      title: "Avg Measurements",
      value: adminMetrics?.avgMeasurements || 0,
      description: "Per user",
      icon: BarChart3,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      change: "User engagement",
      changeColor: "text-indigo-600",
    },
  ];

  const demographicCards = [
    {
      title: "Gender Distribution",
      data: adminMetrics?.genderBreakdown || {},
      icon: Users,
      color: "text-pink-600",
    },
    {
      title: "Regional Split",
      data: adminMetrics?.platformBreakdown || {},
      icon: Globe,
      color: "text-blue-600",
    },
  ];

  if (error) {
    return (
      <div className="min-h-svh bg-linear-bg font-inter flex items-center justify-center">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="text-center py-16">
            <Shield className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">Access Error</h2>
            <p className="text-red-600 mb-4">Unable to load admin metrics</p>
            <Button onClick={() => refetch()} variant="outline" className="border-red-300">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-linear-bg font-inter">
      {/* Header */}
      <header className="border-b border-linear-border sticky top-0 bg-linear-bg/95 backdrop-blur-sm z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/dashboard")}
                onMouseEnter={() => prefetchRoute("/dashboard")}
                onFocus={() => prefetchRoute("/dashboard")}
                className="text-lg sm:text-xl font-semibold text-linear-text hover:text-linear-text-secondary transition-colors"
              >
                LogYourBody
              </button>
              <Badge className="bg-red-500/10 text-red-600 border-red-200">
                ADMIN PANEL
              </Badge>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSensitive(!showSensitive)}
                className="text-linear-text-secondary hover:text-linear-text"
              >
                {showSensitive ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Hide Sensitive
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Show Sensitive
                  </>
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
                className="text-linear-text-secondary hover:text-linear-text"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Button
                size="sm"
                onClick={() => navigate("/dashboard")}
                onMouseEnter={() => prefetchRoute("/dashboard")}
                className="bg-linear-text text-linear-bg hover:bg-linear-text-secondary"
              >
                Back to App
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 bg-linear-purple/10 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-linear-purple" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-linear-text">Admin Dashboard</h1>
              <p className="text-linear-text-secondary">
                Real-time metrics and insights • Last updated: {adminMetrics?.lastUpdated ? format(adminMetrics.lastUpdated, 'HH:mm:ss') : 'Loading...'}
              </p>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {metrics.map((metric, index) => {
            const IconComponent = metric.icon;
            const shouldHide = metric.sensitive && !showSensitive;
            
            return (
              <Card key={index} className="border-linear-border bg-linear-card hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`h-10 w-10 ${metric.bgColor} rounded-lg flex items-center justify-center`}>
                          <IconComponent className={`h-5 w-5 ${metric.color}`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-linear-text-secondary">
                            {metric.title}
                          </p>
                          <p className="text-2xl font-bold text-linear-text">
                            {shouldHide ? "••••" : metric.value.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-xs text-linear-text-secondary">
                          {metric.description}
                        </p>
                        <p className={`text-xs font-medium ${metric.changeColor}`}>
                          {shouldHide ? "••••" : metric.change}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Demographics Section */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {demographicCards.map((demo, index) => {
            const IconComponent = demo.icon;
            const hasData = Object.keys(demo.data).length > 0;
            
            return (
              <Card key={index} className="border-linear-border bg-linear-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-linear-purple/10 rounded-lg flex items-center justify-center">
                      <IconComponent className={`h-4 w-4 ${demo.color}`} />
                    </div>
                    {demo.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {hasData ? (
                    <div className="space-y-3">
                      {Object.entries(demo.data).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-sm text-linear-text-secondary capitalize">
                            {key}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-linear-text">
                              {value}
                            </span>
                            <div className="w-12 h-2 bg-linear-border rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${demo.color.replace('text-', 'bg-')} transition-all`}
                                style={{ 
                                  width: `${(value / Math.max(...Object.values(demo.data))) * 100}%` 
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-linear-text-secondary">No data available</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* System Status */}
        <Card className="border-linear-border bg-linear-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Shield className="h-4 w-4 text-green-600" />
              </div>
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                <div>
                  <p className="text-sm font-medium text-linear-text">Database</p>
                  <p className="text-xs text-linear-text-secondary">Connected</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                <div>
                  <p className="text-sm font-medium text-linear-text">API</p>
                  <p className="text-xs text-linear-text-secondary">Operational</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                <div>
                  <p className="text-sm font-medium text-linear-text">Authentication</p>
                  <p className="text-xs text-linear-text-secondary">Active</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Notice */}
        <div className="mt-8 text-center">
          <p className="text-xs text-linear-text-secondary">
            This admin panel is for internal use only. Data updates every 30 seconds.
            <br />
            Sensitive data is hidden by default - use the toggle to reveal.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Epic;