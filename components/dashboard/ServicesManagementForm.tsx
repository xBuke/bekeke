'use client';

import { useState } from 'react';
import { ServiceProvider, Service, PriceType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface ServicesManagementFormProps {
  provider: ServiceProvider;
}

interface ServiceFormData {
  title: string;
  description: string;
  price_type: PriceType;
  price: number;
  duration_minutes?: number;
}

export default function ServicesManagementForm({ provider }: ServicesManagementFormProps) {
  const [services, setServices] = useState<Service[]>(provider.services || []);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<ServiceFormData>({
    title: '',
    description: '',
    price_type: 'hourly',
    price: 0,
    duration_minutes: undefined
  });

  const handleInputChange = (field: keyof ServiceFormData, value: string | number | PriceType | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price_type: 'hourly',
      price: 0,
      duration_minutes: undefined
    });
    setEditingService(null);
  };

  const handleOpenModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        title: service.title,
        description: service.description || '',
        price_type: service.price_type,
        price: service.price,
        duration_minutes: service.duration_minutes || undefined
      });
    } else {
      resetForm();
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const serviceData = {
        provider_id: provider.id,
        title: formData.title,
        description: formData.description,
        price_type: formData.price_type,
        price: formData.price,
        duration_minutes: formData.price_type === 'fixed' ? formData.duration_minutes : null
      };

      if (editingService) {
        // Update existing service
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', editingService.id);

        if (error) throw error;

        setServices(prev => prev.map(s => 
          s.id === editingService.id 
            ? { ...s, ...serviceData, duration_minutes: serviceData.duration_minutes || undefined }
            : s
        ));

        toast.success('Usluga uspješno ažurirana!');
      } else {
        // Create new service
        const { data, error } = await supabase
          .from('services')
          .insert(serviceData)
          .select()
          .single();

        if (error) throw error;

        setServices(prev => [...prev, data]);
        toast.success('Usluga uspješno dodana!');
      }

      handleCloseModal();
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error('Greška pri spremanju usluge');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm('Jeste li sigurni da želite obrisati ovu uslugu?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;

      setServices(prev => prev.filter(s => s.id !== serviceId));
      toast.success('Usluga uspješno obrisana!');
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Greška pri brisanju usluge');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Moje usluge</h3>
          <p className="text-sm text-gray-600">
            Upravljaj svojim uslugama i cijenama
          </p>
        </div>
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenModal()}>
              <Plus className="h-4 w-4 mr-2" />
              Dodaj novu uslugu
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingService ? 'Uredi uslugu' : 'Dodaj novu uslugu'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Service Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Naziv usluge *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Npr. Popravak slavine"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Opis</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Detaljni opis usluge..."
                  rows={3}
                />
              </div>

              {/* Price Type */}
              <div className="space-y-2">
                <Label>Tip cijene *</Label>
                <RadioGroup
                  value={formData.price_type}
                  onValueChange={(value) => handleInputChange('price_type', value as PriceType)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hourly" id="hourly" />
                    <Label htmlFor="hourly">Po satu</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fixed" id="fixed" />
                    <Label htmlFor="fixed">Fiksna cijena</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="price">Cijena (€) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  required
                />
              </div>

              {/* Duration (only for fixed price) */}
              {formData.price_type === 'fixed' && (
                <div className="space-y-2">
                  <Label htmlFor="duration">Trajanje u minutama</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={formData.duration_minutes || ''}
                    onChange={(e) => handleInputChange('duration_minutes', parseInt(e.target.value) || undefined)}
                    placeholder="60"
                  />
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={handleCloseModal}>
                  Odustani
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Spremanje...' : editingService ? 'Ažuriraj' : 'Dodaj'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Services List */}
      {services.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Nemate dodane usluge.</p>
          <p className="text-sm">Kliknite &quot;Dodaj novu uslugu&quot; da počnete.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {services.map((service) => (
            <div key={service.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium">{service.title}</h4>
                  {service.description && (
                    <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                  )}
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span>
                      {service.price_type === 'hourly' ? 'Po satu:' : 'Fiksna cijena:'} {service.price}€
                    </span>
                    {service.duration_minutes && (
                      <span>Trajanje: {service.duration_minutes} min</span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenModal(service)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(service.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
