'use client';

import { useState, useEffect } from 'react';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea } from '@ayurconnect/ui';
import { MapPin, DollarSign, User, Calendar, Search } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  description: string;
  type: string;
  district: string;
  salary: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

interface JobType {
  id: string;
  name: string;
  description: string;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', description: '', type: '', district: '', salary: '' });

  useEffect(() => {
    fetchJobs();
    fetchJobTypes();
    fetchDistricts();
  }, [selectedType, selectedDistrict, searchQuery]);

  const fetchJobs = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedType !== 'all') params.append('type', selectedType);
      if (selectedDistrict !== 'all') params.append('district', selectedDistrict);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/jobs?${params}`);
      const data = await response.json();
      setJobs(data.jobs || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobTypes = async () => {
    try {
      const response = await fetch('/api/job-types');
      const data = await response.json();
      setJobTypes(data);
    } catch (error) {
      console.error('Error fetching job types:', error);
    }
  };

  const fetchDistricts = async () => {
    try {
      const response = await fetch('/api/districts');
      const data = await response.json();
      setDistricts(data);
    } catch (error) {
      console.error('Error fetching districts:', error);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJob)
      });

      if (response.ok) {
        setNewJob({ title: '', description: '', type: '', district: '', salary: '' });
        setShowCreateForm(false);
        fetchJobs();
      }
    } catch (error) {
      console.error('Error creating job:', error);
    }
  };

  const getJobTypeName = (typeId: string) => {
    const type = jobTypes.find(t => t.id === typeId);
    return type?.name || typeId;
  };

  const getJobTypeColor = (typeId: string) => {
    const colors: Record<string, string> = {
      'doctor': 'bg-blue-100 text-blue-800',
      'therapist': 'bg-green-100 text-green-800',
      'pharmacist': 'bg-purple-100 text-purple-800',
      'government': 'bg-red-100 text-red-800',
      'clinic': 'bg-orange-100 text-orange-800',
      'teaching': 'bg-teal-100 text-teal-800'
    };
    return colors[typeId] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading jobs...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-green-800 mb-2">Ayurveda Jobs Board</h1>
          <p className="text-gray-600">Find your dream career in Ayurvedic healthcare</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)} className="bg-green-600 hover:bg-green-700">
          {showCreateForm ? 'Cancel' : 'Post a Job'}
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Job Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {jobTypes.map(type => (
              <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="District" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Districts</SelectItem>
            {districts.map(district => (
              <SelectItem key={district} value={district}>{district}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Create Job Form */}
      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Post a New Job</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateJob} className="space-y-4">
              <Input
                placeholder="Job title..."
                value={newJob.title}
                onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                required
              />
              <Select value={newJob.type} onValueChange={(value) => setNewJob({...newJob, type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  {jobTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={newJob.district} onValueChange={(value) => setNewJob({...newJob, district: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent>
                  {districts.map(district => (
                    <SelectItem key={district} value={district}>{district}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Salary range (optional)..."
                value={newJob.salary}
                onChange={(e) => setNewJob({...newJob, salary: e.target.value})}
              />
              <Textarea
                placeholder="Job description..."
                value={newJob.description}
                onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                rows={4}
                required
              />
              <Button type="submit" className="bg-green-600 hover:bg-green-700">Post Job</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Jobs List */}
      <div className="space-y-4">
        {jobs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No jobs found matching your criteria.</p>
            </CardContent>
          </Card>
        ) : (
          jobs.map(job => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <Badge className={getJobTypeColor(job.type)}>
                        {getJobTypeName(job.type)}
                      </Badge>
                      {job.district && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.district}
                        </div>
                      )}
                      {job.salary && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {job.salary}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        Posted by {job.user.name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(job.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4 line-clamp-3">{job.description}</p>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}