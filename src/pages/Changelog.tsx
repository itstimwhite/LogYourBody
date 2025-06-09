import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { VersionDisplay } from "@/components/VersionDisplay";
import { ArrowLeft, GitCommit, Calendar, ExternalLink, Github, Mail, Check, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

interface GitCommit {
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
    date: string;
  };
  committer: {
    name: string;
    email: string;
    date: string;
  };
  url: string;
  html_url: string;
}

interface GitHubResponse {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
    committer: {
      name: string;
      email: string;
      date: string;
    };
  };
  html_url: string;
  author?: {
    login: string;
    avatar_url: string;
  };
}

const Changelog = () => {
  const navigate = useNavigate();
  const [commits, setCommits] = useState<GitCommit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Email subscription state
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [subscriptionMessage, setSubscriptionMessage] = useState("");

  useEffect(() => {
    fetchCommits();
  }, []);

  const fetchCommits = async () => {
    try {
      // Try to fetch from GitHub API
      const response = await fetch(
        'https://api.github.com/repos/itstimwhite/LogYourBody/commits?per_page=50'
      );
      
      if (response.ok) {
        const data: GitHubResponse[] = await response.json();
        const formattedCommits: GitCommit[] = data.map(commit => ({
          sha: commit.sha,
          message: commit.commit.message,
          author: commit.commit.author,
          committer: commit.commit.committer,
          url: commit.html_url,
          html_url: commit.html_url,
        }));
        setCommits(formattedCommits);
      } else {
        // Fallback to mock data if GitHub API fails
        setCommits(getMockCommits());
      }
    } catch (err) {
      console.error('Failed to fetch commits:', err);
      setCommits(getMockCommits());
    } finally {
      setLoading(false);
    }
  };

  const getMockCommits = (): GitCommit[] => [
    {
      sha: "3a20798",
      message: "Fix Settings page mobile blank screen issue\n\n- Add proper null checks for user and settings data\n- Add useEffect to update form states when user data loads\n- Add fallback values for all user properties to prevent crashes\n- Fix potential race conditions with data loading\n- Ensure Settings page renders properly on mobile devices",
      author: {
        name: "Claude",
        email: "noreply@anthropic.com",
        date: new Date().toISOString(),
      },
      committer: {
        name: "Claude",
        email: "noreply@anthropic.com",
        date: new Date().toISOString(),
      },
      url: "https://github.com/itstimwhite/LogYourBody/commit/3a20798",
      html_url: "https://github.com/itstimwhite/LogYourBody/commit/3a20798",
    },
    {
      sha: "8a343e5",
      message: "Implement comprehensive PWA version management and cache handling\n\n- Add PWAUpdatePrompt component with user-friendly update notifications\n- Create VersionDisplay component showing app version and build info\n- Implement usePWAUpdate hook for proper SW update lifecycle management\n- Add version information to PWA manifest and build process\n- Ensure proper cache clearing when updates are available\n- Display version info in Dashboard header and Settings page\n- Configure PWA for prompt-based updates instead of auto-updates",
      author: {
        name: "Claude",
        email: "noreply@anthropic.com",
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      committer: {
        name: "Claude",
        email: "noreply@anthropic.com",
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      url: "https://github.com/itstimwhite/LogYourBody/commit/8a343e5",
      html_url: "https://github.com/itstimwhite/LogYourBody/commit/8a343e5",
    },
    {
      sha: "800a15d",
      message: "Fix biometric authentication implementation\n\n- Fix critical counter initialization bug in WebAuthn hook\n- Improve credential verification during authentication\n- Remove biometric login from login page (should be for existing users only)\n- Add proper error handling for WebAuthn operations\n- Enhance biometric setup component integration",
      author: {
        name: "Claude",
        email: "noreply@anthropic.com",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      committer: {
        name: "Claude",
        email: "noreply@anthropic.com",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      url: "https://github.com/itstimwhite/LogYourBody/commit/800a15d",
      html_url: "https://github.com/itstimwhite/LogYourBody/commit/800a15d",
    },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCommitType = (message: string) => {
    const firstLine = message.split('\n')[0].toLowerCase();
    if (firstLine.includes('fix') || firstLine.includes('bug')) {
      return { type: 'fix', color: 'bg-red-100 text-red-800 border-red-200' };
    }
    if (firstLine.includes('feat') || firstLine.includes('add') || firstLine.includes('implement')) {
      return { type: 'feature', color: 'bg-green-100 text-green-800 border-green-200' };
    }
    if (firstLine.includes('update') || firstLine.includes('improve') || firstLine.includes('enhance')) {
      return { type: 'improvement', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    }
    if (firstLine.includes('refactor') || firstLine.includes('clean')) {
      return { type: 'refactor', color: 'bg-purple-100 text-purple-800 border-purple-200' };
    }
    return { type: 'change', color: 'bg-gray-100 text-gray-800 border-gray-200' };
  };

  const parseCommitMessage = (message: string) => {
    const lines = message.split('\n');
    const title = lines[0];
    const body = lines.slice(2).join('\n').trim(); // Skip empty line after title
    return { title, body };
  };

  const getShortSha = (sha: string) => sha.substring(0, 7);

  const handleEmailSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setSubscriptionStatus('error');
      setSubscriptionMessage('Please enter a valid email address');
      return;
    }

    setIsSubscribing(true);
    setSubscriptionStatus('idle');

    try {
      // Insert email subscription
      const { error: insertError } = await supabase
        .from('email_subscriptions')
        .insert({
          email: email.toLowerCase(),
          subscription_type: 'changelog',
          metadata: {
            source: 'changelog_page',
            subscribed_via: 'web_form'
          }
        });

      if (insertError) {
        // Check if it's a unique constraint error (already subscribed)
        if (insertError.code === '23505') {
          setSubscriptionStatus('success');
          setSubscriptionMessage('You are already subscribed to changelog updates!');
        } else {
          throw insertError;
        }
      } else {
        setSubscriptionStatus('success');
        setSubscriptionMessage('Successfully subscribed to changelog updates!');
        setEmail('');
      }
    } catch (err: any) {
      console.error('Subscription error:', err);
      setSubscriptionStatus('error');
      setSubscriptionMessage('Failed to subscribe. Please try again later.');
    } finally {
      setIsSubscribing(false);
      
      // Clear status after 5 seconds
      setTimeout(() => {
        setSubscriptionStatus('idle');
        setSubscriptionMessage('');
      }, 5000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading changelog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              size="icon"
              variant="outline"
              onClick={() => navigate(-1)}
              className="bg-secondary border-border text-foreground hover:bg-muted h-10 w-10"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <VersionDisplay />
          </div>
        </div>
      </div>

      {/* Hero Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="relative container max-w-6xl mx-auto px-6 py-16">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <GitCommit className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">Changelog</h1>
                <p className="text-xl text-muted-foreground mt-2">
                  Stay up to date with the latest features, improvements, and fixes
                </p>
              </div>
            </div>
            
            {/* Email Subscription */}
            <div className="bg-card border border-border rounded-lg p-6 mt-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">Subscribe to updates</h3>
                  <p className="text-muted-foreground mb-4">
                    Get notified when we ship new features and improvements
                  </p>
                  
                  <form onSubmit={handleEmailSubscription} className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubscribing}
                      className="flex-1"
                    />
                    <Button 
                      type="submit" 
                      disabled={isSubscribing || !email}
                      className="flex-shrink-0"
                    >
                      {isSubscribing ? (
                        <div className="h-4 w-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
                      ) : (
                        "Subscribe"
                      )}
                    </Button>
                  </form>
                  
                  {subscriptionMessage && (
                    <div className={`mt-3 flex items-center gap-2 text-sm ${
                      subscriptionStatus === 'success' 
                        ? 'text-green-600' 
                        : 'text-destructive'
                    }`}>
                      {subscriptionStatus === 'success' ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      {subscriptionMessage}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-4xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {/* Commit Timeline */}
        <div className="space-y-8">
          {commits.map((commit, index) => {
            const { title, body } = parseCommitMessage(commit.message);
            const commitType = getCommitType(title);
            const isLastItem = index === commits.length - 1;

            return (
              <div key={commit.sha} className="relative">
                {/* Timeline line */}
                {!isLastItem && (
                  <div className="absolute left-5 top-12 bottom-0 w-px bg-border" />
                )}

                <div className="flex gap-4">
                  {/* Timeline dot */}
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 bg-background border-2 border-border rounded-full flex items-center justify-center">
                      <GitCommit className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  {/* Commit content */}
                  <div className="flex-1 min-w-0">
                    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
                      {/* Commit header */}
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge 
                              variant="outline" 
                              className={`text-xs border ${commitType.color}`}
                            >
                              {commitType.type}
                            </Badge>
                            <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                              {getShortSha(commit.sha)}
                            </code>
                          </div>
                          <h3 className="text-lg font-semibold text-foreground mb-2 break-words">
                            {title}
                          </h3>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(commit.html_url, '_blank')}
                          className="flex-shrink-0"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </div>

                      {/* Commit body */}
                      {body && (
                        <div className="mb-4 text-sm text-muted-foreground whitespace-pre-line border-l-2 border-border pl-4">
                          {body}
                        </div>
                      )}

                      {/* Commit metadata */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {formatDate(commit.author.date)} at {formatTime(commit.author.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <Github className="h-4 w-4" />
            <span>View full commit history on</span>
            <Button
              variant="link"
              size="sm"
              onClick={() => window.open('https://github.com/itstimwhite/LogYourBody/commits/main', '_blank')}
              className="p-0 h-auto text-primary hover:text-primary/80"
            >
              GitHub
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Changelog;