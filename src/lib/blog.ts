// Blog utilities for loading and parsing markdown posts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  author: string;
  tags: string[];
  excerpt: string;
  readTime: string;
  content: string;
  formattedDate: string;
}

// Get the posts directory
const postsDirectory = path.join(process.cwd(), 'public/blog');

export async function getAllPosts(): Promise<BlogPost[]> {
  try {
    const fileNames = fs.readdirSync(postsDirectory).filter(name => name.endsWith('.md'));
    
    const allPostsData = await Promise.all(
      fileNames.map(async fileName => {
        const slug = fileName.replace(/\.md$/, '');
        return await getPostBySlug(slug);
      })
    );

    // Filter out null posts and sort by date
    return allPostsData
      .filter((post): post is BlogPost => post !== null)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Error reading blog posts:', error);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    
    if (!fs.existsSync(fullPath)) {
      return null;
    }
    
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);
    
    // Calculate read time (assuming 200 words per minute)
    const wordCount = content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);
    
    // Generate excerpt from content if not provided
    const excerpt = data.excerpt || content.substring(0, 200).replace(/[#*`]/g, '') + '...';
    
    return {
      slug,
      title: data.title || slug.replace(/-/g, ' '),
      date: data.date || new Date().toISOString().split('T')[0],
      author: data.author || 'LogYourBody Team',
      tags: data.tags || [],
      excerpt,
      readTime: `${readTime} min read`,
      content,
      formattedDate: new Date(data.date || new Date()).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error);
    return null;
  }
}

export async function getPostsByTag(tag: string): Promise<BlogPost[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter(post => 
    post.tags.some(t => t.toLowerCase() === tag.toLowerCase())
  );
}

export async function getAllTags(): Promise<string[]> {
  const allPosts = await getAllPosts();
  const tags = new Set<string>();
  
  allPosts.forEach(post => {
    post.tags.forEach(tag => tags.add(tag));
  });
  
  return Array.from(tags).sort();
}

export async function getAllSlugs(): Promise<string[]> {
  try {
    const fileNames = fs.readdirSync(postsDirectory).filter(name => name.endsWith('.md'));
    return fileNames.map(fileName => fileName.replace(/\.md$/, ''));
  } catch (error) {
    console.error('Error reading blog directory:', error);
    return [];
  }
}