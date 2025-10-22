'use client';

import { useState } from 'react';
import { ServiceProvider } from '@/types';
import ProfileBasicInfoForm from './ProfileBasicInfoForm';
import ServicesManagementForm from './ServicesManagementForm';
import WorkingHoursForm from './WorkingHoursForm';
import GalleryManagement from './GalleryManagement';
import { User, Wrench, Clock, Image } from 'lucide-react';

interface ProfileEditTabsProps {
  provider: ServiceProvider;
}

const tabs = [
  { id: 'basic', name: 'Osnovni podaci', icon: User },
  { id: 'services', name: 'Usluge i cijene', icon: Wrench },
  { id: 'hours', name: 'Radno vrijeme', icon: Clock },
  { id: 'gallery', name: 'Galerija', icon: Image },
];

export default function ProfileEditTabs({ provider }: ProfileEditTabsProps) {
  const [activeTab, setActiveTab] = useState('basic');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return <ProfileBasicInfoForm provider={provider} />;
      case 'services':
        return <ServicesManagementForm provider={provider} />;
      case 'hours':
        return <WorkingHoursForm provider={provider} />;
      case 'gallery':
        return <GalleryManagement provider={provider} />;
      default:
        return <ProfileBasicInfoForm provider={provider} />;
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Tab navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="mr-2 h-5 w-5" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab content */}
      <div className="p-6">
        {renderTabContent()}
      </div>
    </div>
  );
}
