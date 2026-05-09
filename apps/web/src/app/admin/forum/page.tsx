'use client'

import { useEffect, useState } from 'react'
import { adminApi } from '../../../lib/admin-api'

type Comment = { id: string; content: string; createdAt: string; user: { id: string; name: string | null } }
type Post = {
  id: string
  title: string
  content: string
  category: string
  language: string
  createdAt: string
  user: { id: string; name: string | null; email: string }
  comments: Comment[]
}

export default function ForumAdminPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  async function load() {
    setLoading(true); setError(null)
    try {
      const data = await adminApi.get<{ posts: Post[]; pagination: unknown }>('/forum/posts?limit=100')
      setPosts(data.posts)
    } catch (e) { setError(String(e)) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  async function deletePost(id: string, title: string) {
    if (!confirm(`Delete post "${title}" and all its comments?`)) return
    try { await adminApi.del(`/forum/posts/${id}`); await load() } catch (e) { alert(String(e)) }
  }

  async function deleteComment(id: string) {
    if (!confirm('Delete this comment?')) return
    try { await adminApi.del(`/forum/comments/${id}`); await load() } catch (e) { alert(String(e)) }
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-3xl font-bold">Forum moderation</h1>
        <p className="text-gray-600 mt-1">{posts.length} posts loaded</p>
      </header>

      {error && <div className="p-3 rounded bg-red-50 text-red-800 text-sm">{error}</div>}

      <div className="bg-white border rounded-lg divide-y">
        {loading && <div className="px-4 py-8 text-center text-gray-500">Loading…</div>}
        {!loading && posts.length === 0 && <div className="px-4 py-8 text-center text-gray-500">No posts yet.</div>}
        {posts.map((p) => (
          <div key={p.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <span className="px-1.5 py-0.5 bg-gray-100 rounded">{p.category}</span>
                  <span className="uppercase">{p.language}</span>
                  <span>· by {p.user?.name ?? p.user?.email ?? '?'}</span>
                  <span>· {new Date(p.createdAt).toLocaleDateString()}</span>
                  <span>· {p.comments.length} comment{p.comments.length === 1 ? '' : 's'}</span>
                </div>
                <h3 className="font-semibold text-base">{p.title}</h3>
                <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">{p.content}</p>
                {p.comments.length > 0 && (
                  <button
                    onClick={() => setExpanded((x) => (x === p.id ? null : p.id))}
                    className="text-xs text-green-700 hover:underline mt-2"
                  >
                    {expanded === p.id ? 'hide' : 'show'} comments
                  </button>
                )}
                {expanded === p.id && (
                  <div className="mt-3 pl-4 border-l-2 border-gray-200 space-y-2">
                    {p.comments.map((c) => (
                      <div key={c.id} className="text-sm flex justify-between gap-4">
                        <div>
                          <span className="text-xs text-gray-500">{c.user?.name ?? '?'} · {new Date(c.createdAt).toLocaleDateString()}</span>
                          <div className="whitespace-pre-line">{c.content}</div>
                        </div>
                        <button onClick={() => deleteComment(c.id)} className="text-red-600 hover:underline text-xs whitespace-nowrap">delete</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => deletePost(p.id, p.title)} className="text-red-600 hover:underline text-xs whitespace-nowrap">Delete post</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
