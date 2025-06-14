import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { marked } from "marked";
import DOMPurify from "dompurify";

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
    ? allPosts.filter((post) => post.tags.includes(selectedTag))
    : allPosts;

  const featuredPost = allPosts[0]; // Most recent post as featured

  const sanitizedContent = React.useMemo(() => {
    if (!currentPost) return "";
    return DOMPurify.sanitize(marked.parse(currentPost.content));
  }, [currentPost?.content]);

  if (currentPost) {
    // Individual post view
    return (
      <div className="min-h-svh bg-linear-bg font-inter">
        {/* Header */}
        <header className="border-b border-linear-border" role="banner">
          <div className="container mx-auto px-4 py-4 sm:px-6">
            <nav className="flex items-center justify-between">
              <button
                onClick={() => navigate("/")}
                onMouseEnter={() => prefetchRoute("/")}
                onFocus={() => prefetchRoute("/")}
                className="text-lg font-semibold text-linear-text transition-colors hover:text-linear-text-secondary sm:text-xl"
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
                  className="rounded-lg bg-linear-text px-4 py-2 text-sm font-medium text-linear-bg transition-colors hover:bg-linear-text-secondary"
                >
                  Sign up
                </Button>
              </div>
            </nav>
          </div>
        </header>

        {/* Article */}
        <main className="container mx-auto px-4 py-12 sm:px-6">
          <article className="mx-auto max-w-4xl">
            {/* Article header */}
            <header className="mb-12">
              <div className="mb-4 flex flex-wrap gap-2">
                {currentPost.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <h1 className="mb-6 text-4xl font-bold tracking-tight text-linear-text sm:text-5xl md:text-6xl">
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
                className="leading-relaxed text-linear-text-secondary"
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              />
            </div>

            {/* CTA */}
            <div className="mt-12 rounded-xl border border-linear-border bg-linear-card/30 p-8">
              <h3 className="mb-4 text-xl font-semibold text-linear-text">
                Ready to Start Tracking?
              </h3>
              <p className="mb-6 text-linear-text-secondary">
                Join thousands of people using LogYourBody to track what really
                matters for their fitness journey.
              </p>
              <Button
                onClick={() => navigate("/login")}
                onMouseEnter={() => prefetchRoute("/login")}
                className="bg-linear-text text-linear-bg hover:bg-linear-text-secondary"
                aria-label="Start Free Trial"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
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
        <div className="container mx-auto px-4 py-4 sm:px-6">
          <nav className="flex items-center justify-between">
            <button
              onClick={() => navigate("/")}
              onMouseEnter={() => prefetchRoute("/")}
              onFocus={() => prefetchRoute("/")}
              className="text-lg font-semibold text-linear-text transition-colors hover:text-linear-text-secondary sm:text-xl"
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
                className="rounded-lg bg-linear-text px-4 py-2 text-sm font-medium text-linear-bg transition-colors hover:bg-linear-text-secondary"
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
              <div className="mb-6 flex items-center justify-center gap-2">
                <BookOpen className="h-8 w-8 text-linear-purple" />
                <Badge className="border-linear-purple/20 bg-linear-purple/10 text-white">
                  Evidence-Based Content
                </Badge>
              </div>

              <h1 className="mb-6 text-4xl font-bold tracking-tight text-linear-text sm:text-5xl md:text-6xl">
                The LogYourBody
                <br />
                <span className="bg-gradient-to-r from-linear-purple via-linear-text to-linear-purple bg-clip-text text-transparent">
                  Blog
                </span>
              </h1>

              <p className="mx-auto mb-8 max-w-2xl text-lg text-linear-text-secondary">
                Science-based articles about body composition, fitness tracking,
                and building sustainable habits. No fluff, just actionable
                insights backed by research.
              </p>
            </div>
          </div>
        </section>

        {/* Tags Filter */}
        <section className="border-y border-linear-border bg-linear-card/20 py-8">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                variant={selectedTag === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTag(null)}
                className={
                  selectedTag === null ? "bg-linear-text text-linear-bg" : ""
                }
                aria-label="Show all posts"
              >
                All Posts
              </Button>
              {allTags.map((tag) => (
                <Button
                  key={tag}
                  variant={selectedTag === tag ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTag(tag)}
                  className={
                    selectedTag === tag ? "bg-linear-text text-linear-bg" : ""
                  }
                  aria-label={`Filter by tag ${tag}`}
                >
                  <Tag className="mr-1 h-3 w-3" />
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
                <h2 className="mb-4 text-2xl font-bold text-linear-text">
                  Featured Article
                </h2>
              </div>

              <Card className="overflow-hidden border-linear-border bg-linear-card/50">
                <div className="md:flex">
                  <div className="flex items-center justify-center bg-gradient-to-br from-linear-purple/20 to-linear-purple/5 p-8 md:w-1/3">
                    <TrendingUp className="h-16 w-16 text-white" />
                  </div>
                  <div className="p-8 md:w-2/3">
                    <div className="mb-4 flex flex-wrap gap-2">
                      {featuredPost.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <h3 className="mb-4 text-2xl font-bold text-linear-text">
                      {featuredPost.title}
                    </h3>

                    <p className="mb-6 text-linear-text-secondary">
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
                        onMouseEnter={() =>
                          prefetchRoute(`/blog/${featuredPost.slug}`)
                        }
                        className="bg-linear-text text-linear-bg hover:bg-linear-text-secondary"
                      >
                        Read Article
                        <ArrowRight className="ml-2 h-4 w-4" />
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
              <h2 className="mb-4 text-2xl font-bold text-linear-text">
                {selectedTag
                  ? `Posts tagged \"${selectedTag}\"`
                  : "Latest Articles"}
              </h2>
              <p className="text-linear-text-secondary">
                {filteredPosts.length} article
                {filteredPosts.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post) => (
                <Card
                  key={post.slug}
                  className="group border-linear-border bg-linear-card transition-all hover:shadow-lg"
                >
                  <CardHeader>
                    <div className="mb-3 flex flex-wrap gap-2">
                      {post.tags.slice(0, 2).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <CardTitle className="text-lg text-linear-text transition-colors group-hover:text-linear-purple">
                      {post.title}
                    </CardTitle>

                    <CardDescription className="text-linear-text-secondary">
                      {post.excerpt}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="mb-4 flex items-center justify-between">
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
                      className="w-full justify-between text-linear-text-secondary transition-colors hover:bg-linear-purple/10 hover:text-linear-text"
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
              <div className="py-12 text-center">
                <Search className="mx-auto mb-4 h-12 w-12 text-linear-text-secondary" />
                <h3 className="mb-2 text-xl font-semibold text-linear-text">
                  No articles found
                </h3>
                <p className="text-linear-text-secondary">
                  Try selecting a different tag or view all posts.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="bg-linear-card/30 py-16">
          <div className="container mx-auto px-4 text-center sm:px-6">
            <h2 className="mb-4 text-3xl font-bold text-linear-text">
              Stay Updated
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-linear-text-secondary">
              Get notified when we publish new evidence-based articles about
              body composition, fitness tracking, and sustainable health habits.
            </p>
            <Button
              onClick={() => navigate("/login")}
              onMouseEnter={() => prefetchRoute("/login")}
              className="bg-linear-text text-linear-bg hover:bg-linear-text-secondary"
            >
              Join LogYourBody
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
