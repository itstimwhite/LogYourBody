import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  User,
  Tag,
  ArrowRight,
  BookOpen,
  TrendingUp,
  Search,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { prefetchRoute } from "@/lib/prefetch";
import Footer from "@/components/Footer";
import { getAllPosts, getPostBySlug, getAllTags } from "@/lib/blog";

const Blog = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [selectedTag, setSelectedTag] = React.useState<string | null>(null);

  const allPosts = getAllPosts();
  const allTags = getAllTags();

  // If we have a slug, show the individual post
  const currentPost = slug ? getPostBySlug(slug) : null;

  // Filter posts by selected tag
  const filteredPosts = selectedTag
    ? allPosts.filter(post => post.tags.includes(selectedTag))
    : allPosts;

  const featuredPost = allPosts[0]; // Most recent post as featured

  if (currentPost) {
    // Individual post view
    return (
      <div className="min-h-svh bg-linear-bg font-inter">
        {/* Header */}
        <header className="border-b border-linear-border" role="banner">
          <div className="container mx-auto px-4 sm:px-6 py-4">
            <nav className="flex items-center justify-between">
              <button
                onClick={() => navigate("/")}
                onMouseEnter={() => prefetchRoute("/")}
                onFocus={() => prefetchRoute("/")}
                className="text-lg sm:text-xl font-semibold text-linear-text hover:text-linear-text-secondary transition-colors"
              >
                LogYourBody
              </button>
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => navigate("/blog")}
                  onMouseEnter={() => prefetchRoute("/blog")}
                  className="text-sm text-linear-text-secondary hover:text-linear-text"
                >
                  ← Back to Blog
                </Button>
                <Button
                  variant="ghost"
                  onMouseEnter={() => prefetchRoute("/login")}
                  onFocus={() => prefetchRoute("/login")}
                  onClick={() => navigate("/login")}
                  className="text-sm text-linear-text-secondary hover:text-linear-text"
                >
                  Log in
                </Button>
                <Button
                  onMouseEnter={() => prefetchRoute("/login")}
                  onFocus={() => prefetchRoute("/login")}
                  onClick={() => navigate("/login")}
                  className="bg-linear-text text-linear-bg text-sm font-medium px-4 py-2 rounded-lg hover:bg-linear-text-secondary transition-colors"
                >
                  Sign up
                </Button>
              </div>
            </nav>
          </div>
        </header>

        {/* Article */}
        <main className="container mx-auto px-4 sm:px-6 py-12">
          <article className="max-w-4xl mx-auto">
            {/* Article header */}
            <header className="mb-12">
              <div className="flex flex-wrap gap-2 mb-4">
                {currentPost.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-linear-text mb-6">
                {currentPost.title}
              </h1>
              
              <div className="flex items-center gap-6 text-sm text-linear-text-secondary">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {currentPost.author}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {currentPost.formattedDate}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {currentPost.readTime}
                </div>
              </div>
            </header>

            {/* Article content */}
            <div className="prose prose-lg max-w-none">
              <div 
                className="text-linear-text-secondary leading-relaxed"
                dangerouslySetInnerHTML={{ 
                  __html: currentPost.content
                    .replace(/^# /gm, '<h1 class="text-3xl font-bold text-linear-text mt-8 mb-4">')
                    .replace(/^## /gm, '<h2 class="text-2xl font-semibold text-linear-text mt-8 mb-4">')
                    .replace(/^### /gm, '<h3 class="text-xl font-semibold text-linear-text mt-6 mb-3">')
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-linear-text">$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/`([^`]+)`/g, '<code class="bg-linear-card px-2 py-1 rounded text-sm font-mono">$1</code>')
                    .replace(/```([^```]+)```/gs, '<pre class="bg-linear-card p-4 rounded-lg overflow-x-auto"><code class="font-mono text-sm">$1</code></pre>')
                    .replace(/^\| (.*) \|$/gm, '<div class="table-row">$1</div>')
                    .replace(/\n\n/g, '</p><p class="mb-4">')
                    .replace(/^(?!<[h|p|d])/gm, '<p class="mb-4">')
                    + '</p>'
                }}
              />
            </div>

            {/* CTA */}
            <div className="mt-12 p-8 bg-linear-card/30 rounded-xl border border-linear-border">
              <h3 className="text-xl font-semibold text-linear-text mb-4">
                Ready to Start Tracking?
              </h3>
              <p className="text-linear-text-secondary mb-6">
                Join thousands of people using LogYourBody to track what really matters for their fitness journey.
              </p>
              <Button
                onClick={() => navigate("/login")}
                onMouseEnter={() => prefetchRoute("/login")}
                className="bg-linear-text text-linear-bg hover:bg-linear-text-secondary"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </article>
        </main>

        <Footer />
      </div>
    );
  }

  // Blog index view
  return (
    <div className="min-h-svh bg-linear-bg font-inter">
      {/* Header */}
      <header className="border-b border-linear-border" role="banner">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <nav className="flex items-center justify-between">
            <button
              onClick={() => navigate("/")}
              onMouseEnter={() => prefetchRoute("/")}
              onFocus={() => prefetchRoute("/")}
              className="text-lg sm:text-xl font-semibold text-linear-text hover:text-linear-text-secondary transition-colors"
            >
              LogYourBody
            </button>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onMouseEnter={() => prefetchRoute("/login")}
                onFocus={() => prefetchRoute("/login")}
                onClick={() => navigate("/login")}
                className="text-sm text-linear-text-secondary hover:text-linear-text"
              >
                Log in
              </Button>
              <Button
                onMouseEnter={() => prefetchRoute("/login")}
                onFocus={() => prefetchRoute("/login")}
                onClick={() => navigate("/login")}
                className="bg-linear-text text-linear-bg text-sm font-medium px-4 py-2 rounded-lg hover:bg-linear-text-secondary transition-colors"
              >
                Sign up
              </Button>
            </div>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl text-center">
              <div className="flex items-center justify-center gap-2 mb-6">
                <BookOpen className="h-8 w-8 text-linear-purple" />
                <Badge className="bg-linear-purple/10 text-white border-linear-purple/20">
                  Evidence-Based Content
                </Badge>
              </div>
              
              <h1 className="mb-6 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-linear-text">
                The LogYourBody
                <br />
                <span className="bg-gradient-to-r from-linear-purple via-linear-text to-linear-purple bg-clip-text text-transparent">
                  Blog
                </span>
              </h1>
              
              <p className="mx-auto mb-8 max-w-2xl text-lg text-linear-text-secondary">
                Science-based articles about body composition, fitness tracking, and building sustainable habits. 
                No fluff, just actionable insights backed by research.
              </p>
            </div>
          </div>
        </section>

        {/* Tags Filter */}
        <section className="py-8 border-y border-linear-border bg-linear-card/20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant={selectedTag === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTag(null)}
                className={selectedTag === null ? "bg-linear-text text-linear-bg" : ""}
              >
                All Posts
              </Button>
              {allTags.map((tag) => (
                <Button
                  key={tag}
                  variant={selectedTag === tag ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTag(tag)}
                  className={selectedTag === tag ? "bg-linear-text text-linear-bg" : ""}
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Post */}
        {!selectedTag && (
          <section className="py-16">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-linear-text mb-4">Featured Article</h2>
              </div>
              
              <Card className="border-linear-border bg-linear-card/50 overflow-hidden">
                <div className="md:flex">
                  <div className="md:w-1/3 bg-gradient-to-br from-linear-purple/20 to-linear-purple/5 p-8 flex items-center justify-center">
                    <TrendingUp className="h-16 w-16 text-white" />
                  </div>
                  <div className="md:w-2/3 p-8">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {featuredPost.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-linear-text mb-4">
                      {featuredPost.title}
                    </h3>
                    
                    <p className="text-linear-text-secondary mb-6">
                      {featuredPost.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-linear-text-secondary">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {featuredPost.author}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {featuredPost.readTime}
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => navigate(`/blog/${featuredPost.slug}`)}
                        onMouseEnter={() => prefetchRoute(`/blog/${featuredPost.slug}`)}
                        className="bg-linear-text text-linear-bg hover:bg-linear-text-secondary"
                      >
                        Read Article
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </section>
        )}

        {/* Blog Posts Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-linear-text mb-4">
                {selectedTag ? `Posts tagged "${selectedTag}"` : "Latest Articles"}
              </h2>
              <p className="text-linear-text-secondary">
                {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post) => (
                <Card key={post.slug} className="border-linear-border bg-linear-card group hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <CardTitle className="text-lg text-linear-text group-hover:text-linear-purple transition-colors">
                      {post.title}
                    </CardTitle>
                    
                    <CardDescription className="text-linear-text-secondary">
                      {post.excerpt}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3 text-sm text-linear-text-secondary">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {post.formattedDate}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.readTime}
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      className="w-full justify-between text-linear-text-secondary hover:text-linear-text hover:bg-linear-purple/10 transition-colors"
                      onClick={() => navigate(`/blog/${post.slug}`)}
                      onMouseEnter={() => prefetchRoute(`/blog/${post.slug}`)}
                    >
                      Read Article
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredPosts.length === 0 && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-linear-text-secondary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-linear-text mb-2">No articles found</h3>
                <p className="text-linear-text-secondary">
                  Try selecting a different tag or view all posts.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-16 bg-linear-card/30">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-3xl font-bold text-linear-text mb-4">
              Stay Updated
            </h2>
            <p className="text-linear-text-secondary mb-8 max-w-2xl mx-auto">
              Get notified when we publish new evidence-based articles about body composition, 
              fitness tracking, and sustainable health habits.
            </p>
            <Button
              onClick={() => navigate("/login")}
              onMouseEnter={() => prefetchRoute("/login")}
              className="bg-linear-text text-linear-bg hover:bg-linear-text-secondary"
            >
              Join LogYourBody
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;