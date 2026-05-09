'use client';

import { useState, useEffect } from 'react';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Tabs, TabsContent, TabsList, TabsTrigger } from '@ayurconnect/ui';
import { MapPin, Phone, Search, GraduationCap, BookOpen } from 'lucide-react';

interface College {
  id: string;
  name: string;
  district: string;
  type: string;
  profile?: string;
  contact?: string;
  address?: string;
}

interface CollegeType {
  id: string;
  name: string;
  description: string;
}

interface AdmissionInfo {
  course: string;
  duration: string;
  eligibility: string;
  entrance: string;
  seats: string;
  fees: string;
}

export default function CollegesPage() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [collegeTypes, setCollegeTypes] = useState<CollegeType[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [admissions, setAdmissions] = useState<Record<string, AdmissionInfo>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);

  useEffect(() => {
    fetchColleges();
    fetchCollegeTypes();
    fetchDistricts();
    fetchAdmissions();
  }, [searchQuery, selectedDistrict, selectedType]);

  const fetchColleges = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('district', searchQuery); // Search in district for now
      if (selectedDistrict !== 'all') params.append('district', selectedDistrict);
      if (selectedType !== 'all') params.append('type', selectedType);

      const response = await fetch(`/api/colleges/colleges?${params}`);
      const data = await response.json();
      setColleges(data.colleges || []);
    } catch (error) {
      console.error('Error fetching colleges:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCollegeTypes = async () => {
    try {
      const response = await fetch('/api/colleges/college-types');
      const data = await response.json();
      setCollegeTypes(data);
    } catch (error) {
      console.error('Error fetching college types:', error);
    }
  };

  const fetchDistricts = async () => {
    try {
      const response = await fetch('/api/colleges/districts');
      const data = await response.json();
      setDistricts(data);
    } catch (error) {
      console.error('Error fetching districts:', error);
    }
  };

  const fetchAdmissions = async () => {
    try {
      const response = await fetch('/api/colleges/admissions');
      const data = await response.json();
      setAdmissions(data);
    } catch (error) {
      console.error('Error fetching admissions:', error);
    }
  };

  const getCollegeTypeName = (typeId: string) => {
    const type = collegeTypes.find(t => t.id === typeId);
    return type?.name || typeId;
  };

  const getCollegeTypeColor = (typeId: string) => {
    const colors: Record<string, string> = {
      'ayurveda': 'bg-green-100 text-green-800',
      'modern': 'bg-blue-100 text-blue-800',
      'nursing': 'bg-pink-100 text-pink-800',
      'pharmacy': 'bg-purple-100 text-purple-800',
      'research': 'bg-orange-100 text-orange-800'
    };
    return colors[typeId] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading colleges...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-green-800 mb-4">Medical Colleges in Kerala</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Discover premier medical institutions offering Ayurveda, modern medicine,
          nursing, and pharmacy education in God&apos;s Own Country.
        </p>
      </div>

      <Tabs defaultValue="colleges" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="colleges">Colleges Directory</TabsTrigger>
          <TabsTrigger value="admissions">Admission Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="colleges" className="space-y-6">
          {/* Search and Filters */}
          <div className="bg-green-50 p-6 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search colleges..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                <SelectTrigger>
                  <SelectValue placeholder="Select District" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Districts</SelectItem>
                  {districts.map(district => (
                    <SelectItem key={district} value={district}>{district}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="College Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {collegeTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Colleges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {colleges.length === 0 ? (
              <div className="col-span-full">
                <Card>
                  <CardContent className="text-center py-8">
                    <GraduationCap className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">No colleges found matching your criteria.</p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              colleges.map(college => (
                <Card key={college.id} className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedCollege(college)}>
                  <CardHeader>
                    <CardTitle className="text-xl text-green-800">{college.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {college.district}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge className={getCollegeTypeColor(college.type)}>
                      {getCollegeTypeName(college.type)}
                    </Badge>

                    {college.profile && (
                      <p className="text-gray-700 mt-3 line-clamp-3">{college.profile}</p>
                    )}

                    <div className="mt-4 space-y-2">
                      {college.contact && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="h-4 w-4" />
                          {college.contact}
                        </div>
                      )}
                      {college.address && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          {college.address}
                        </div>
                      )}
                    </div>

                    <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="admissions" className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-green-800 mb-4">Admission Information</h2>
            <p className="text-gray-600">Complete guide to medical education admissions in Kerala</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(admissions).map(([key, info]) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="text-lg text-green-800">{info.course}</CardTitle>
                  <Badge className={getCollegeTypeColor(key)}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Duration</p>
                    <p className="text-sm text-gray-600">{info.duration}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Eligibility</p>
                    <p className="text-sm text-gray-600">{info.eligibility}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Entrance Exam</p>
                    <p className="text-sm text-gray-600">{info.entrance}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Seats</p>
                    <p className="text-sm text-gray-600">{info.seats}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Fees</p>
                    <p className="text-sm text-gray-600">{info.fees}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-blue-50">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">Important Notes</h3>
              <ul className="space-y-2 text-sm text-blue-700">
                <li>• All medical courses require NEET qualification for admission</li>
                <li>• Ayurveda colleges have reservation for Kerala students</li>
                <li>• Government colleges offer subsidized fees</li>
                <li>• Private colleges may have management quota seats</li>
                <li>• Regular updates on admission notifications through official websites</li>
                <li>• Contact colleges directly for latest admission procedures</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* College Detail Modal */}
      {selectedCollege && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl text-green-800">{selectedCollege.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <MapPin className="h-4 w-4" />
                    {selectedCollege.district}
                  </CardDescription>
                </div>
                <Button variant="ghost" onClick={() => setSelectedCollege(null)}>×</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Badge className={getCollegeTypeColor(selectedCollege.type)}>
                {getCollegeTypeName(selectedCollege.type)}
              </Badge>

              {selectedCollege.profile && (
                <div>
                  <h4 className="font-semibold mb-2">About</h4>
                  <p className="text-gray-700">{selectedCollege.profile}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedCollege.contact && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Contact</p>
                      <p className="text-sm text-gray-600">{selectedCollege.contact}</p>
                    </div>
                  </div>
                )}
                {selectedCollege.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-green-600 mt-1" />
                    <div>
                      <p className="text-sm font-medium">Address</p>
                      <p className="text-sm text-gray-600">{selectedCollege.address}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 text-green-800">Courses Offered</h4>
                <p className="text-sm text-gray-700">
                  {selectedCollege.type === 'ayurveda' && 'BAMS (Bachelor of Ayurvedic Medicine and Surgery)'}
                  {selectedCollege.type === 'modern' && 'MBBS, MD, MS, and various postgraduate courses'}
                  {selectedCollege.type === 'nursing' && 'B.Sc Nursing, M.Sc Nursing, GNM'}
                  {selectedCollege.type === 'pharmacy' && 'B.Pharm, M.Pharm, D.Pharm'}
                  {selectedCollege.type === 'research' && 'PhD programs and medical research'}
                </p>
              </div>

              <div className="flex gap-4">
                <Button className="flex-1 bg-green-600 hover:bg-green-700">
                  Apply Now
                </Button>
                <Button variant="outline" className="flex-1">
                  Visit Website
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}