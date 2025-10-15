import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shadui/dialog";
import { Button } from "@/components/shadui/button";
import { X, Loader2 } from 'lucide-react';
import Image from 'next/image'

interface ProjectCard {
  id: string;
  title: string;
  creator: string;
  imageUrl: string;
  alt: string;
  url: string;
}

const projects: ProjectCard[] = [
  {
    id: '26e8c964-9bf0-469c-bec7-42b0ef9b5570',
    title: 'Luxury Resort Platform',
    creator: 'needware',
    imageUrl: '/images/26e8c964-9bf0-469c-bec7-42b0ef9b5570.png',
    url: 'https://26e8c964-9bf0-469c-bec7-42b0ef9b5570.netlify.app/',
    alt: 'Luxury Resort Platform'
  },
  {
    id: 'cbf4d722-cb08-46da-af57-6b6f0caf6318',
    title: 'Marketing QA Platform',
    creator: 'needware',
    imageUrl: '/images/cbf4d722-cb08-46da-af57-6b6f0caf6318.png',
    url: 'https://cbf4d722-cb08-46da-af57-6b6f0caf6318.netlify.app/',
    alt: 'Marketing QA Platform'
  },
  {
    id: '57d6cff4-0142-4629-b5df-def162278b28',
    title: 'Zen Timer Portal',
    creator: 'needware',
    imageUrl: '/images/57d6cff4-0142-4629-b5df-def162278b28.png',
    url: 'https://57d6cff4-0142-4629-b5df-def162278b28.netlify.app/',
    alt: 'Zen Timer Portal'
  },
  {
    id: '03e05266-6b4a-4018-839c-1ab77152ba35',
    title: 'Retro Pop Art Store',
    creator: 'needware',
    imageUrl: '/images/03e05266-6b4a-4018-839c-1ab77152ba35.png',
    url: 'https://03e05266-6b4a-4018-839c-1ab77152ba35.netlify.app/',
    alt: 'Retro Pop Art Store'
  },
  {
    id: 'a1b010f2-124d-4f26-8923-bbe158d427ca',
    title: 'DIY Project Hub',
    creator: 'needware',
    imageUrl: '/images/a1b010f2-124d-4f26-8923-bbe158d427ca.png',
    url: 'https://a1b010f2-124d-4f26-8923-bbe158d427ca.netlify.app/',
    alt: 'DIY Project Hub'
  },
  {
    id: 'c47855b5-38d4-439f-a7b6-d92ac99524ef',
    title: 'AI Agent Orchestration Platform',
    creator: 'needware',
    imageUrl: '/images/c47855b5-38d4-439f-a7b6-d92ac99524ef.png',
    url: 'https://c47855b5-38d4-439f-a7b6-d92ac99524ef.netlify.app/',
    alt: 'AI Agent Orchestration Platform'
  },
  {
    id: 'afe25ec2-7c89-4e29-bba9-7040824c9682',
    title: 'MBTI Dating Platform',
    creator: 'needware',
    imageUrl: '/images/afe25ec2-7c89-4e29-bba9-7040824c9682.png',
    url: 'https://afe25ec2-7c89-4e29-bba9-7040824c9682.netlify.app/',
    alt: 'MBTI Dating Platform'
  },
  {
    id: 'dde603bb-85b6-4e58-84ba-cbd23cfb0825',
    title: 'Restaurant Calorie Calculator',
    creator: 'needware',
    imageUrl: '/images/dde603bb-85b6-4e58-84ba-cbd23cfb0825.png',
    url: 'https://dde603bb-85b6-4e58-84ba-cbd23cfb0825.netlify.app/',
    alt: 'Restaurant Calorie Calculator'
  },
  {
    id: 'fcb77940-d4c6-4e3f-90e5-d16d98112f74',
    title: 'KikiAdewura Fashion Portal',
    creator: 'needware',
    imageUrl: '/images/fcb77940-d4c6-4e3f-90e5-d16d98112f74.png',
    url: 'https://fcb77940-d4c6-4e3f-90e5-d16d98112f74.netlify.app/',
    alt: 'KikiAdewura Fashion Portal'
  },
  {
    id: '8ff79816-5bf7-4698-aa79-4cdca2dd6dac',
    title: 'AI Knowledge Hub',
    creator: 'needware',
    imageUrl: '/images/8ff79816-5bf7-4698-aa79-4cdca2dd6dac.png',
    url: 'https://8ff79816-5bf7-4698-aa79-4cdca2dd6dac.netlify.app/',
    alt: 'AI Knowledge Hub'
  },
  {
    id: 'a497a1cc-d81e-4a3c-bf2c-34b3efbd84e8',
    title: 'Interactive Timeline Builder',
    creator: 'needware',
    imageUrl: '/images/a497a1cc-d81e-4a3c-bf2c-34b3efbd84e8.png',
    url: 'https://a497a1cc-d81e-4a3c-bf2c-34b3efbd84e8.netlify.app/',
    alt: 'Interactive Timeline Builder'
  },
  {
    id: 'a7206042-a206-49ba-b515-9f59adfc994a',
    title: 'Cloudflare Developers Website Clone',
    creator: 'needware',
    imageUrl: '/images/a7206042-a206-49ba-b515-9f59adfc994a.png',
    url: 'https://a7206042-a206-49ba-b515-9f59adfc994a.netlify.app/',
    alt: 'Interactive Timeline Builder'
  },
  {
    id: '071122c8-38b9-4086-ae14-f1c5b202863a',
    title: 'clone https://macaron.im/zh',
    creator: 'needware',
    imageUrl: '/images/071122c8-38b9-4086-ae14-f1c5b202863a.png',
    url: 'https://071122c8-38b9-4086-ae14-f1c5b202863a.netlify.app/',
    alt: 'clone https://macaron.im/zh'
  }
];

const ProjectCard: React.FC<{ project: ProjectCard }> = ({ project }) => {
  const [isLoading, setIsLoading] = useState(true);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="group bg-[#323232] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer rounded-lg overflow-hidden border border-[#404040] hover:border-[#505050]">
          {/* Image Section */}
          <div className="relative w-full pb-[56.25%] overflow-hidden bg-[#2a2a2a]">
            <Image
              src={project.imageUrl}
              alt={project.alt}
              fill
              className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          
          {/* Content Section */}
          <div className="p-4 pt-3 group-hover:bg-[#383838] transition-colors duration-300">
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium text-white group-hover:text-[#e6d96a] transition-colors duration-300">
                {project.title}
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#b0b0b0] group-hover:text-[#d0d0d0] transition-colors duration-300">
                  {project.creator}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogTrigger>
      
      <DialogContent className="bg-white text-gray-900 max-w-[70%] max-h-[90vh]" style={{ scrollBehavior: 'auto' }}>
        {/* Hidden title for accessibility */}
        <DialogTitle className="sr-only">
          {project.title} Project Preview
        </DialogTitle>
        
        {/* Top Action Bar */}
        <div className="flex justify-end mr-6 -mt-2 sticky top-0 bg-white z-[5]">
            <a href={`${project.url}`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="bg-white text-gray-900">
                View in new tab
            </Button>
            </a>
        </div>

        {/* Iframe Content */}
        <div className="w-full flex-1 rounded-lg overflow-hidden border border-gray-200 relative" style={{ height: 'calc(90vh - 140px)' }}>
          {/* Loading Indicator */}
          {isLoading && (
            <div className="absolute inset-0 bg-gray-50 flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
                <p className="text-sm text-gray-600">Loading preview...</p>
              </div>
            </div>
          )}
          
          <iframe
            src={`${project.url}`}
            className="w-full h-full"
            frameBorder="0"
            title={`${project.title} Preview`}
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
            onLoad={handleIframeLoad}
          />
        </div>
        
      </DialogContent>
    </Dialog>
  );
};

const CommunitySection: React.FC = () => {
  return (
    <div className="flex w-full flex-col gap-4 rounded-[20px] bg-bolt-elements-background-depth-3 px-8">
      <h1 className="text-2xl font-bold text-white">Community Projects</h1>
      {/* Grid Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
      
      {/* Explore More Button */}
      <div className="flex justify-center mt-3">
        <button className="px-4 py-2 bg-[#4a4a4a] text-[#e6d96a] rounded-md hover:bg-[#555555] transition-colors duration-200 font-medium">
          {/* Explore more */}
          no more
        </button>
      </div>
    </div>
  );
};

export default CommunitySection;
