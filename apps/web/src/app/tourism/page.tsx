'use client';

import { useState, useEffect } from 'react';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ayurconnect/ui';
import { MapPin, Calendar, DollarSign, Search, Star } from 'lucide-react';

interface Package {
  id: string;
  title: string;
  description: string;
  duration: number;
  price?: number;
  location: string;
  includes?: string;
}

interface PackageType {
  id: string;
  name: string;
  description: string;
  duration: string;
  includes: string[];
}

export default function TourismPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [packageTypes, setPackageTypes] = useState<PackageType[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

  useEffect(() => {
    fetchPackages();
    fetchPackageTypes();
    fetchLocations();
  }, [searchQuery, selectedLocation, minPrice, maxPrice]);

  const fetchPackages = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('location', searchQuery);
      if (selectedLocation !== 'all') params.append('location', selectedLocation);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);

      const response = await fetch(`/api/tourism/packages?${params}`);
      const data = await response.json();
      setPackages(data.packages || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPackageTypes = async () => {
    try {
      const response = await fetch('/api/tourism/package-types');
      const data = await response.json();
      setPackageTypes(data);
    } catch (error) {
      console.error('Error fetching package types:', error);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/tourism/locations');
      const data = await response.json();
      setLocations(data);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading packages...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-green-800 mb-4">Ayurveda Medical Tourism</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Experience authentic Ayurvedic treatments in the heart of Kerala. Discover wellness packages
          that combine traditional healing with modern comfort.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-green-50 p-6 rounded-lg mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger>
              <SelectValue placeholder="Select District" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Districts</SelectItem>
              {locations.map(location => (
                <SelectItem key={location} value={location}>{location}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
      </div>

      {/* Package Types Overview */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-green-800 mb-6">Treatment Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packageTypes.map(type => (
            <Card key={type.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{type.name}</CardTitle>
                <CardDescription>{type.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <span>Duration: {type.duration}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Includes:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {type.includes.map((item, index) => (
                        <li key={index} className="flex items-center gap-1">
                          <span className="text-green-500">✓</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Packages List */}
      <div>
        <h2 className="text-2xl font-bold text-green-800 mb-6">Available Packages</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="text-center py-8">
                  <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">No packages found matching your criteria.</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            packages.map(pkg => (
              <Card key={pkg.id} className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedPackage(pkg)}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl text-green-800">{pkg.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <MapPin className="h-4 w-4" />
                        {pkg.location}
                      </CardDescription>
                    </div>
                    {pkg.price && (
                      <Badge className="bg-green-100 text-green-800">
                        ₹{pkg.price.toLocaleString()}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4 line-clamp-3">{pkg.description}</p>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {pkg.duration} days
                    </div>
                  </div>

                  {pkg.includes && (
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">Package Includes:</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{pkg.includes}</p>
                    </div>
                  )}

                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    View Details & Book
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Package Detail Modal */}
      {selectedPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl text-green-800">{selectedPackage.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <MapPin className="h-4 w-4" />
                    {selectedPackage.location}
                  </CardDescription>
                </div>
                <Button variant="ghost" onClick={() => setSelectedPackage(null)}>×</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Badge className="bg-blue-100 text-blue-800">
                  <Calendar className="h-4 w-4 mr-1" />
                  {selectedPackage.duration} Days
                </Badge>
                {selectedPackage.price && (
                  <Badge className="bg-green-100 text-green-800">
                    <DollarSign className="h-4 w-4 mr-1" />
                    ₹{selectedPackage.price.toLocaleString()}
                  </Badge>
                )}
              </div>

              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-gray-700">{selectedPackage.description}</p>
              </div>

              {selectedPackage.includes && (
                <div>
                  <h4 className="font-semibold mb-2">Package Includes</h4>
                  <p className="text-gray-700">{selectedPackage.includes}</p>
                </div>
              )}

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 text-green-800">Why Choose Kerala for Ayurveda?</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Authentic traditional treatments passed down through generations</li>
                  <li>• Experienced Ayurvedic doctors with modern medical knowledge</li>
                  <li>• Serene environment conducive to healing and relaxation</li>
                  <li>• High-quality herbal medicines from local sources</li>
                  <li>• Combination of traditional wisdom and modern amenities</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <Button className="flex-1 bg-green-600 hover:bg-green-700">
                  Book This Package
                </Button>
                <Button variant="outline" className="flex-1">
                  Contact Us
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}