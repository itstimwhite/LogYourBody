import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  Target,
  CreditCard,
  Zap,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Filter,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Mock data for demonstration
const mockRevenueData = {
  currentMRR: 8247.50,
  targetMRR: 10000,
  currentARR: 98970,
  previousMonthMRR: 7850.32,
  growth: {
    percentage: 5.1,
    absolute: 397.18
  },
  projectedARR: 125000,
  runway: 18, // months
  burnRate: 3200 // monthly
};

const mockSubscriptionMetrics = {
  totalSubscribers: 342,
  activeSubscribers: 318,
  trialUsers: 67,
  churnRate: 4.2,
  ltv: 285.40,
  cac: 32.50,
  conversionRate: 12.4,
  arpu: 25.95
};

const mockCohortData = [
  { month: "Jan 2025", newUsers: 45, retained1m: 89, retained3m: 67, retained6m: 45, revenue: 1167.5 },
  { month: "Feb 2025", newUsers: 52, retained1m: 92, retained3m: 71, retained6m: null, revenue: 1349 },
  { month: "Mar 2025", newUsers: 61, retained1m: 88, retained3m: 69, retained6m: null, revenue: 1583.5 },
  { month: "Apr 2025", newUsers: 58, retained1m: 91, retained3m: null, retained6m: null, revenue: 1504.5 },
  { month: "May 2025", newUsers: 67, retained1m: 85, retained3m: null, retained6m: null, revenue: 1738.5 },
  { month: "Jun 2025", newUsers: 74, retained1m: null, retained3m: null, retained6m: null, revenue: 1921 },
];

const mockFunnelData = {
  visitors: 12450,
  signups: 892,
  trialStarts: 267,
  conversions: 33,
  conversionRate: 12.4
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState("30d");
  const [refreshing, setRefreshing] = useState(false);

  // Calculate key metrics
  const progressToGoal = (mockRevenueData.currentMRR / mockRevenueData.targetMRR) * 100;
  const remainingToGoal = mockRevenueData.targetMRR - mockRevenueData.currentMRR;
  const monthsToGoal = Math.ceil(remainingToGoal / mockRevenueData.growth.absolute);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Track ARR progress toward 10k MRR goal
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Goal Progress Section */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">10k MRR Goal Progress</CardTitle>
                <CardDescription>
                  Track progress toward monthly recurring revenue target
                </CardDescription>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-foreground">
                  {formatCurrency(mockRevenueData.currentMRR)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Current MRR
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-semibold text-primary">
                  {formatCurrency(remainingToGoal)} to go
                </div>
                <div className="text-sm text-muted-foreground">
                  ~{monthsToGoal} months at current growth
                </div>
              </div>
            </div>
            <Progress value={progressToGoal} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>0</span>
              <span className="font-medium">{formatPercentage(progressToGoal)} complete</span>
              <span>{formatCurrency(mockRevenueData.targetMRR)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Current ARR */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Annual Recurring Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(mockRevenueData.currentARR)}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                +{formatPercentage(mockRevenueData.growth.percentage)} from last month
              </div>
            </CardContent>
          </Card>

          {/* MRR Growth */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">MRR Growth</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                +{formatCurrency(mockRevenueData.growth.absolute)}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <ChevronUp className="h-3 w-3 mr-1 text-green-500" />
                {formatPercentage(mockRevenueData.growth.percentage)} month over month
              </div>
            </CardContent>
          </Card>

          {/* Active Subscribers */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockSubscriptionMetrics.activeSubscribers}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                {formatPercentage((mockSubscriptionMetrics.activeSubscribers / mockSubscriptionMetrics.totalSubscribers) * 100)} active rate
              </div>
            </CardContent>
          </Card>

          {/* Churn Rate */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPercentage(mockSubscriptionMetrics.churnRate)}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <ChevronDown className="h-3 w-3 mr-1 text-green-500" />
                -0.3% from last month
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics Tabs */}
        <Tabs defaultValue="revenue" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="cohorts">Cohorts</TabsTrigger>
            <TabsTrigger value="funnel">Funnel</TabsTrigger>
          </TabsList>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Breakdown</CardTitle>
                  <CardDescription>Monthly recurring revenue components</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">New MRR</span>
                      <span className="text-sm font-bold text-green-600">+{formatCurrency(892.50)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Expansion MRR</span>
                      <span className="text-sm font-bold text-blue-600">+{formatCurrency(156.30)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Churned MRR</span>
                      <span className="text-sm font-bold text-red-600">-{formatCurrency(347.80)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Contraction MRR</span>
                      <span className="text-sm font-bold text-orange-600">-{formatCurrency(95.20)}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Net New MRR</span>
                      <span className="font-bold text-green-600">+{formatCurrency(605.80)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Financial Health</CardTitle>
                  <CardDescription>Key financial indicators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">LTV:CAC Ratio</span>
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        {(mockSubscriptionMetrics.ltv / mockSubscriptionMetrics.cac).toFixed(1)}:1
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Customer LTV</span>
                      <span className="text-sm font-bold">{formatCurrency(mockSubscriptionMetrics.ltv)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Customer CAC</span>
                      <span className="text-sm font-bold">{formatCurrency(mockSubscriptionMetrics.cac)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">ARPU</span>
                      <span className="text-sm font-bold">{formatCurrency(mockSubscriptionMetrics.arpu)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Runway</span>
                      <span className="text-sm font-bold">{mockRevenueData.runway} months</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Active</span>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800">{mockSubscriptionMetrics.activeSubscribers}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatPercentage((mockSubscriptionMetrics.activeSubscribers / mockSubscriptionMetrics.totalSubscribers) * 100)}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Trial</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{mockSubscriptionMetrics.trialUsers}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatPercentage((mockSubscriptionMetrics.trialUsers / mockSubscriptionMetrics.totalSubscribers) * 100)}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Churned</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive">{mockSubscriptionMetrics.totalSubscribers - mockSubscriptionMetrics.activeSubscribers - mockSubscriptionMetrics.trialUsers}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatPercentage(((mockSubscriptionMetrics.totalSubscribers - mockSubscriptionMetrics.activeSubscribers - mockSubscriptionMetrics.trialUsers) / mockSubscriptionMetrics.totalSubscribers) * 100)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Conversion Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Trial → Paid</span>
                      <Badge className="bg-blue-100 text-blue-800">
                        {formatPercentage(mockSubscriptionMetrics.conversionRate)}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Signup → Trial</span>
                      <Badge variant="outline">
                        {formatPercentage((mockFunnelData.trialStarts / mockFunnelData.signups) * 100)}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Visitor → Signup</span>
                      <Badge variant="outline">
                        {formatPercentage((mockFunnelData.signups / mockFunnelData.visitors) * 100)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Growth Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-2">
                    <div className="text-3xl font-bold text-green-600">
                      +{formatPercentage(mockRevenueData.growth.percentage)}
                    </div>
                    <div className="text-sm text-muted-foreground">Month over month</div>
                    <div className="text-xs text-muted-foreground">
                      At this rate: {formatCurrency(mockRevenueData.targetMRR)} in {monthsToGoal} months
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Cohorts Tab */}
          <TabsContent value="cohorts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cohort Retention Analysis</CardTitle>
                <CardDescription>Track user retention and revenue by signup month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Cohort</th>
                        <th className="text-right p-2">New Users</th>
                        <th className="text-right p-2">1 Month</th>
                        <th className="text-right p-2">3 Months</th>
                        <th className="text-right p-2">6 Months</th>
                        <th className="text-right p-2">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockCohortData.map((cohort, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2 font-medium">{cohort.month}</td>
                          <td className="p-2 text-right">{cohort.newUsers}</td>
                          <td className="p-2 text-right">
                            {cohort.retained1m ? (
                              <Badge variant={cohort.retained1m >= 85 ? "default" : "secondary"}>
                                {cohort.retained1m}%
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="p-2 text-right">
                            {cohort.retained3m ? (
                              <Badge variant={cohort.retained3m >= 65 ? "default" : "secondary"}>
                                {cohort.retained3m}%
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="p-2 text-right">
                            {cohort.retained6m ? (
                              <Badge variant={cohort.retained6m >= 45 ? "default" : "secondary"}>
                                {cohort.retained6m}%
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="p-2 text-right font-medium">
                            {formatCurrency(cohort.revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Funnel Tab */}
          <TabsContent value="funnel" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
                <CardDescription>Track user journey from visitor to paid subscriber</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    { label: "Website Visitors", value: mockFunnelData.visitors, percentage: 100 },
                    { label: "Signups", value: mockFunnelData.signups, percentage: (mockFunnelData.signups / mockFunnelData.visitors) * 100 },
                    { label: "Trial Starts", value: mockFunnelData.trialStarts, percentage: (mockFunnelData.trialStarts / mockFunnelData.visitors) * 100 },
                    { label: "Paid Conversions", value: mockFunnelData.conversions, percentage: (mockFunnelData.conversions / mockFunnelData.visitors) * 100 },
                  ].map((step, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{step.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{step.value.toLocaleString()}</span>
                          <Badge variant="outline">{formatPercentage(step.percentage)}</Badge>
                        </div>
                      </div>
                      <Progress value={step.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Action Items to Reach 10k MRR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-green-600">High Impact</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Reduce churn rate to below 3%</li>
                  <li>• Increase trial-to-paid conversion to 15%</li>
                  <li>• Launch annual plan with discount</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-yellow-600">Medium Impact</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Improve onboarding experience</li>
                  <li>• Add usage-based pricing tier</li>
                  <li>• Implement referral program</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-blue-600">Low Impact</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• A/B test pricing page</li>
                  <li>• Add more payment methods</li>
                  <li>• Optimize email campaigns</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;