import { useState } from "react";
import { Button } from "@/components/shadui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/shadui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Calendar, Clock, FileText } from "lucide-react";
import Link from "next/link";

interface Project {
  id: string;
  userId: string;
  urlId: string;
  description: string;
  timestamp: string;
  previewImageUrl?: string;
  status: string;
  metadata: {
    streamStatus: string;
  };
}

interface ProjectCardProps {
  project: Project;
  onDelete: (event: React.UIEvent) => void;
  onRename?: (event: React.UIEvent) => void;
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    Website: "bg-[#979191] text-white",
    Prototype: "bg-[#979589] text-white",
    "Consumer App": "bg-[#919797] text-white",
    "Internal Tools": "bg-[#8A8A8A] text-white",
    "B2B App": "bg-[#A5A5A5] text-white"
  };
  return colors[category] || "bg-[#979191] text-white";
};



const ProjectCard = ({ project, onDelete, onRename }: ProjectCardProps) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  return (
    <Link href={`/chat/${project.id}`}>
      <div className="relative group">
        {/* 主卡片容器 */}
        <div className="relative flex flex-col rounded-2xl overflow-hidden mx-1 my-2 transition-all duration-500 ease-out bg-gradient-to-br from-[#323232] via-[#2a2a2a] to-[#1f1f1f] border border-[#404040] hover:border-[#505050] hover:shadow-2xl hover:shadow-black/20 cursor-pointer hover:-translate-y-1 group-hover:bg-[#383838]">
          
          {/* 图片预览区域 - 主要视觉元素 */}
          {project.previewImageUrl ? (
            <div className="relative w-full pb-[56.25%] overflow-hidden bg-[#2a2a2a]">
              {/* {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-[#979191] border-t-transparent rounded-full animate-spin"></div>
                </div>
              )} */}
              <img
                src={project.previewImageUrl}
                alt={project.description}
                className="absolute inset-0 w-full h-full object-cover object-top scale-103 group-hover:scale-110 transition-transform duration-300"
                onLoad={() => setImageLoading(false)}
                onError={() => setImageLoading(false)}
              />
              


              {/* 图片上的操作菜单 */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white/90 hover:text-white transition-all duration-300 rounded-lg backdrop-blur-sm"
                      onClick={(e) => e.preventDefault()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48 bg-[#4F4F4F]/95 border-[#8A8A8A]/50 shadow-2xl shadow-black/20 backdrop-blur-lg rounded-xl" align="end">

                    <DropdownMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        onRename?.(event);
                        setDropdownOpen(false);
                      }}
                      className="text-[#D1D1D1] hover:bg-[#6B6B6B]/50 focus:bg-[#6B6B6B]/50 transition-colors rounded-lg mx-1 my-1"
                    >
                      <Edit className="mr-3 h-4 w-4" />
                      <span>Rename</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-[#8A8A8A]/50 mx-2" />
                    <DropdownMenuItem 
                      className="text-[#FF6B6B] hover:bg-[#FF6B6B]/10 focus:bg-[#FF6B6B]/10 transition-colors rounded-lg mx-1 my-1"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        onDelete?.(event);
                        setDropdownOpen(false);
                      }}
                    >
                      <Trash2 className="mr-3 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ) : (
            /* 无图片时的占位符 */
            <div className="relative w-full pb-[56.25%] bg-gradient-to-br from-[#4F4F4F] to-[#3a3a3a] flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-xs text-[#A5A5A5]">No Preview</p>
                </div>
              </div>
              


              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white/90 hover:text-white transition-all duration-300 rounded-lg backdrop-blur-sm"
                      onClick={(e) => e.preventDefault()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48 bg-[#4F4F4F]/95 border-[#8A8A8A]/50 shadow-2xl shadow-black/20 backdrop-blur-lg rounded-xl" align="end">

                    <DropdownMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        onRename?.(event);
                        setDropdownOpen(false);
                      }}
                      className="text-[#D1D1D1] hover:bg-[#6B6B6B]/50 focus:bg-[#6B6B6B]/50 transition-colors rounded-lg mx-1 my-1"
                    >
                      <Edit className="mr-3 h-4 w-4" />
                      <span>Rename</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-[#8A8A8A]/50 mx-2" />
                    <DropdownMenuItem 
                      className="text-[#FF6B6B] hover:bg-[#FF6B6B]/10 focus:bg-[#FF6B6B]/10 transition-colors rounded-lg mx-1 my-1"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        onDelete?.(event);
                        setDropdownOpen(false);
                      }}
                    >
                      <Trash2 className="mr-3 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )}
          
          {/* 内容区域 */}
          <div className="flex flex-col gap-2 p-4 pt-3">
            {/* 项目标题 */}
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-white group-hover:text-[#e6d96a] transition-colors duration-300 line-clamp-1 leading-relaxed">
                {project.description}
              </h3>
            </div>
            
            {/* 底部元信息 */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-[#9ca3af] group-hover:text-[#d1d5db] transition-colors duration-300">
                <span className="text-xs font-medium">
                  {new Date(project.timestamp).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;
