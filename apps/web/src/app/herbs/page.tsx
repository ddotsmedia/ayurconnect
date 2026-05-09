'use client';

import { useState, useEffect } from 'react';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ayurconnect/ui';
import { Search, Leaf, BookOpen } from 'lucide-react';

interface Herb {
  id: string;
  name: string;
  sanskrit?: string;
  english?: string;
  malayalam?: string;
  rasa?: string;
  guna?: string;
  virya?: string;
  vipaka?: string;
  description?: string;
  uses?: string;
}

interface HerbProperty {
  id: string;
  name: string;
  description: string;
}

interface HerbProperties {
  rasa: HerbProperty[];
  guna: HerbProperty[];
  virya: HerbProperty[];
  vipaka: HerbProperty[];
}

export default function HerbsPage() {
  const [herbs, setHerbs] = useState<Herb[]>([]);
  const [properties, setProperties] = useState<HerbProperties | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRasa, setSelectedRasa] = useState<string>('all');
  const [selectedGuna, setSelectedGuna] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedHerb, setSelectedHerb] = useState<Herb | null>(null);

  useEffect(() => {
    fetchHerbs();
    fetchProperties();
  }, [searchQuery, selectedRasa, selectedGuna]);

  const fetchHerbs = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedRasa !== 'all') params.append('rasa', selectedRasa);
      if (selectedGuna !== 'all') params.append('guna', selectedGuna);

      const response = await fetch(`/api/herbs?${params}`);
      const data = await response.json();
      setHerbs(data.herbs || []);
    } catch (error) {
      console.error('Error fetching herbs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/herb-properties');
      const data = await response.json();
      setProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const getPropertyName = (type: keyof HerbProperties, id: string) => {
    if (!properties) return id;
    const prop = properties[type].find(p => p.id === id);
    return prop?.name || id;
  };

  const getPropertyColor = (type: string, id: string) => {
    const colors: Record<string, Record<string, string>> = {
      rasa: {
        'madhura': 'bg-yellow-100 text-yellow-800',
        'amla': 'bg-orange-100 text-orange-800',
        'lavana': 'bg-blue-100 text-blue-800',
        'katu': 'bg-red-100 text-red-800',
        'tikta': 'bg-green-100 text-green-800',
        'kashaya': 'bg-purple-100 text-purple-800'
      },
      guna: {
        'guru': 'bg-gray-100 text-gray-800',
        'laghu': 'bg-blue-100 text-blue-800',
        'snigdha': 'bg-yellow-100 text-yellow-800',
        'ruksha': 'bg-orange-100 text-orange-800'
      }
    };
    return colors[type]?.[id] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading herbs...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-green-800 mb-2">Ayurvedic Herb Database</h1>
          <p className="text-gray-600">Explore traditional Ayurvedic herbs and their medicinal properties</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search herbs by name, properties, or uses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        {properties && (
          <>
            <Select value={selectedRasa} onValueChange={setSelectedRasa}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Rasa (Taste)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rasa</SelectItem>
                {properties.rasa.map(prop => (
                  <SelectItem key={prop.id} value={prop.id}>{prop.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedGuna} onValueChange={setSelectedGuna}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Guna (Quality)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Guna</SelectItem>
                {properties.guna.map(prop => (
                  <SelectItem key={prop.id} value={prop.id}>{prop.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}
      </div>

      {/* Herbs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {herbs.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="text-center py-8">
                <Leaf className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No herbs found matching your criteria.</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          herbs.map(herb => (
            <Card key={herb.id} className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedHerb(herb)}>
              <CardHeader>
                <CardTitle className="text-xl text-green-800">{herb.name}</CardTitle>
                {herb.sanskrit && (
                  <CardDescription className="font-medium text-orange-700">
                    {herb.sanskrit}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {herb.english && (
                    <p className="text-sm text-gray-600">English: {herb.english}</p>
                  )}
                  {herb.malayalam && (
                    <p className="text-sm text-gray-600">മലയാളം: {herb.malayalam}</p>
                  )}

                  <div className="flex flex-wrap gap-1 mt-2">
                    {herb.rasa && (
                      <Badge className={getPropertyColor('rasa', herb.rasa)}>
                        {getPropertyName('rasa', herb.rasa)}
                      </Badge>
                    )}
                    {herb.guna && (
                      <Badge className={getPropertyColor('guna', herb.guna)}>
                        {getPropertyName('guna', herb.guna)}
                      </Badge>
                    )}
                  </div>

                  {herb.description && (
                    <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                      {herb.description}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Herb Detail Modal */}
      {selectedHerb && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl text-green-800">{selectedHerb.name}</CardTitle>
                  {selectedHerb.sanskrit && (
                    <CardDescription className="text-lg font-medium text-orange-700">
                      {selectedHerb.sanskrit}
                    </CardDescription>
                  )}
                </div>
                <Button variant="ghost" onClick={() => setSelectedHerb(null)}>×</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {selectedHerb.english && (
                  <div>
                    <strong>English:</strong> {selectedHerb.english}
                  </div>
                )}
                {selectedHerb.malayalam && (
                  <div>
                    <strong>മലയാളം:</strong> {selectedHerb.malayalam}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {selectedHerb.rasa && (
                  <Badge className={getPropertyColor('rasa', selectedHerb.rasa)}>
                    Rasa: {getPropertyName('rasa', selectedHerb.rasa)}
                  </Badge>
                )}
                {selectedHerb.guna && (
                  <Badge className={getPropertyColor('guna', selectedHerb.guna)}>
                    Guna: {getPropertyName('guna', selectedHerb.guna)}
                  </Badge>
                )}
                {selectedHerb.virya && (
                  <Badge className="bg-red-100 text-red-800">
                    Virya: {getPropertyName('virya', selectedHerb.virya)}
                  </Badge>
                )}
                {selectedHerb.vipaka && (
                  <Badge className="bg-purple-100 text-purple-800">
                    Vipaka: {getPropertyName('vipaka', selectedHerb.vipaka)}
                  </Badge>
                )}
              </div>

              {selectedHerb.description && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Description
                  </h4>
                  <p className="text-gray-700">{selectedHerb.description}</p>
                </div>
              )}

              {selectedHerb.uses && (
                <div>
                  <h4 className="font-semibold mb-2">Medicinal Uses</h4>
                  <p className="text-gray-700">{selectedHerb.uses}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}