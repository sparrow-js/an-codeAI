import { Skeleton } from "@/components/shadui/skeleton";

const ProjectCardSkeleton = () => {
  return (
    <div className="relative group">
      {/* 主卡片容器 */}
      <div className="relative flex flex-col rounded-2xl overflow-hidden mx-1 my-2 bg-gradient-to-br from-[#323232] via-[#2a2a2a] to-[#1f1f1f] border border-[#404040]">
        
        {/* 图片预览区域骨架 */}
        <div className="relative w-full pb-[56.25%] bg-[#2a2a2a]">
          <Skeleton className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#4F4F4F] to-[#3a3a3a]" />
        </div>
        
        {/* 内容区域骨架 */}
        <div className="flex flex-col gap-3 p-4 pt-3">
          {/* 项目标题骨架 */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full max-w-[85%] bg-[#4F4F4F] rounded" />
            <Skeleton className="h-4 w-full max-w-[60%] bg-[#4F4F4F] rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCardSkeleton; 