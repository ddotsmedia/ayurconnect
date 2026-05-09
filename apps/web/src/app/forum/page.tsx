'use client';

import { useState, useEffect } from 'react';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Textarea, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ayurconnect/ui';
import { MessageSquare, User, Calendar } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  language: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
  comments: Comment[];
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
  description: string;
}

export default function ForumPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: '' });

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, [selectedCategory, selectedLanguage]);

  const fetchPosts = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedLanguage !== 'all') params.append('language', selectedLanguage);

      const response = await fetch(`/api/forum/posts?${params}`);
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/forum/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/forum/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost)
      });

      if (response.ok) {
        setNewPost({ title: '', content: '', category: '' });
        setShowCreateForm(false);
        fetchPosts();
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || categoryId;
  };

  const getCategoryColor = (categoryId: string) => {
    const colors: Record<string, string> = {
      'doctor-discussion': 'bg-blue-100 text-blue-800',
      'patient-forum': 'bg-green-100 text-green-800',
      'webinar': 'bg-purple-100 text-purple-800',
      'research': 'bg-orange-100 text-orange-800'
    };
    return colors[categoryId] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading forum...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-green-800 mb-2">Ayurveda Community Forum</h1>
          <p className="text-gray-600">Connect with fellow Ayurveda enthusiasts, doctors, and practitioners</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)} className="bg-green-600 hover:bg-green-700">
          {showCreateForm ? 'Cancel' : 'New Post'}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="ml">മലയാളം</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Create Post Form */}
      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New Post</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <Input
                placeholder="Post title..."
                value={newPost.title}
                onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                required
              />
              <Select value={newPost.category} onValueChange={(value) => setNewPost({...newPost, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Share your thoughts..."
                value={newPost.content}
                onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                rows={4}
                required
              />
              <Button type="submit" className="bg-green-600 hover:bg-green-700">Post</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No posts found. Be the first to start a discussion!</p>
            </CardContent>
          </Card>
        ) : (
          posts.map(post => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{post.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {post.user.name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(post.createdAt).toLocaleDateString()}
                      </div>
                      <Badge className={getCategoryColor(post.category)}>
                        {getCategoryName(post.category)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <MessageSquare className="h-4 w-4" />
                    {post.comments.length}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4 line-clamp-3">{post.content}</p>
                <Button variant="outline" size="sm">
                  Read More & Reply
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}